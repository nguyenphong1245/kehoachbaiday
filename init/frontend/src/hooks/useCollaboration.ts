/**
 * useCollaboration - WebSocket hook cho real-time collaboration
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/services/authService";

export interface OnlineMember {
  user_id: number;
  name: string;
}

export interface ChatMessage {
  id: number;
  user_id: number;
  user_name: string;
  message: string;
  created_at: string;
}

export interface TypingUser {
  user_id: number;
  user_name: string;
  question_id: string;
  timestamp: number;
}

interface CollaborationState {
  answers: Record<string, string>;
  taskAssignments: Record<string, number[]>;
  leaderId: number | null;
  leaderVotes: Record<string, number>;
  membersOnline: OnlineMember[];
  chatMessages: ChatMessage[];
  typingUsers: TypingUser[];
  connected: boolean;
  connecting: boolean;
  sessionSubmitted: boolean;
  submitterName: string | null;
  // Peer review real-time sync
  peerReviewComments: Record<string, string>;
  peerReviewScore: number | null;
}

interface UseCollaborationOptions {
  sessionId: number | null;
  onAnswerUpdated?: (questionId: string, answer: string, userId: number) => void;
  onLeaderElected?: (leaderId: number) => void;
  onSessionSubmitted?: (submitterName: string) => void;
  onPeerReviewComment?: (questionId: string, comment: string, userId: number, userName: string) => void;
  onPeerReviewScore?: (score: number, userId: number, userName: string) => void;
}

const WS_BASE = import.meta.env.VITE_WS_URL || `ws://${window.location.hostname}:8000`;

export function useCollaboration({ sessionId, onAnswerUpdated, onLeaderElected, onSessionSubmitted, onPeerReviewComment, onPeerReviewScore }: UseCollaborationOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);

  // Store callbacks in refs to avoid stale closure issues
  const callbacksRef = useRef({
    onAnswerUpdated,
    onLeaderElected,
    onSessionSubmitted,
    onPeerReviewComment,
    onPeerReviewScore,
  });

  // Update refs when callbacks change
  useEffect(() => {
    callbacksRef.current = {
      onAnswerUpdated,
      onLeaderElected,
      onSessionSubmitted,
      onPeerReviewComment,
      onPeerReviewScore,
    };
  }, [onAnswerUpdated, onLeaderElected, onSessionSubmitted, onPeerReviewComment, onPeerReviewScore]);

  const [state, setState] = useState<CollaborationState>({
    answers: {},
    taskAssignments: {},
    leaderId: null,
    leaderVotes: {},
    membersOnline: [],
    chatMessages: [],
    typingUsers: [],
    connected: false,
    connecting: false,
    sessionSubmitted: false,
    submitterName: null,
    peerReviewComments: {},
    peerReviewScore: null,
  });

  const connect = useCallback(async () => {
    // Don't connect if no sessionId or already connected to the same session
    if (!sessionId) return;

    // Close existing connection if any (force reconnect when sessionId changes)
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }

    setState((prev) => ({ ...prev, connecting: true }));

    // Get WebSocket token from API (validates httpOnly cookie)
    let wsToken = "";
    try {
      const res = await api.get("/auth/ws-token");
      wsToken = res.data.token || "";
    } catch {
      // Fallback: try without token (will use cookies if same-origin)
    }

    const wsUrl = wsToken
      ? `${WS_BASE}/ws/collaboration/${sessionId}?token=${encodeURIComponent(wsToken)}`
      : `${WS_BASE}/ws/collaboration/${sessionId}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectAttemptsRef.current = 0;
      setState((prev) => ({ ...prev, connected: true, connecting: false }));
    };

    ws.onclose = () => {
      setState((prev) => ({ ...prev, connected: false, connecting: false }));
      wsRef.current = null;

      // Exponential backoff reconnect
      const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
      reconnectAttemptsRef.current += 1;
      reconnectTimeoutRef.current = setTimeout(() => {
        if (sessionId) connect();
      }, delay);
    };

    ws.onerror = () => {
      // onclose will handle reconnection
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        handleMessage(msg);
      } catch {
        // ignore
      }
    };
  }, [sessionId]);

  // handleMessage uses refs to avoid stale closure - no dependencies needed
  const handleMessage = useCallback((msg: any) => {
    const type = msg.type;
    const callbacks = callbacksRef.current;

    switch (type) {
      case "session_state":
        setState((prev) => ({
          ...prev,
          answers: msg.answers || {},
          taskAssignments: msg.task_assignments || {},
          leaderId: msg.leader_id,
          leaderVotes: msg.leader_votes || {},
          membersOnline: msg.members_online || [],
        }));
        break;

      case "answer_updated":
        setState((prev) => ({
          ...prev,
          answers: { ...prev.answers, [msg.question_id]: msg.answer },
        }));
        callbacks.onAnswerUpdated?.(msg.question_id, msg.answer, msg.user_id);
        break;

      case "chat_message":
        console.log("[WS] Received chat_message:", msg);
        setState((prev) => ({
          ...prev,
          chatMessages: [
            ...prev.chatMessages,
            {
              id: msg.id,
              user_id: msg.user_id,
              user_name: msg.user_name,
              message: msg.message,
              created_at: msg.created_at,
            },
          ],
        }));
        break;

      case "member_joined":
      case "member_left":
        setState((prev) => ({
          ...prev,
          membersOnline: msg.members_online || [],
        }));
        break;

      case "vote_update":
        setState((prev) => ({
          ...prev,
          leaderVotes: msg.votes || {},
        }));
        break;

      case "leader_elected":
        setState((prev) => ({
          ...prev,
          leaderId: msg.leader_id,
          leaderVotes: msg.votes || {},
        }));
        callbacks.onLeaderElected?.(msg.leader_id);
        break;

      case "task_assigned":
        setState((prev) => ({
          ...prev,
          taskAssignments: msg.task_assignments || {},
        }));
        break;

      case "typing_indicator":
        // Track who is typing
        setState((prev) => {
          const now = Date.now();
          // Remove stale typing (older than 3 seconds)
          const fresh = prev.typingUsers.filter(
            (t) => now - t.timestamp < 3000 && t.user_id !== msg.user_id
          );
          return {
            ...prev,
            typingUsers: [
              ...fresh,
              {
                user_id: msg.user_id,
                user_name: msg.user_name,
                question_id: msg.question_id,
                timestamp: now,
              },
            ],
          };
        });
        // Auto-clear after 3 seconds
        setTimeout(() => {
          setState((prev) => ({
            ...prev,
            typingUsers: prev.typingUsers.filter(
              (t) => Date.now() - t.timestamp < 3000
            ),
          }));
        }, 3000);
        break;

      case "session_submitted":
        // Leader submitted the assignment - notify all members
        setState((prev) => ({
          ...prev,
          sessionSubmitted: true,
          submitterName: msg.submitter_name || "Nhóm trưởng",
        }));
        callbacks.onSessionSubmitted?.(msg.submitter_name || "Nhóm trưởng");
        break;

      case "peer_review_comment":
        // Real-time peer review comment sync
        console.log("[WS] Received peer_review_comment:", msg);
        setState((prev) => ({
          ...prev,
          peerReviewComments: { ...prev.peerReviewComments, [msg.question_id]: msg.comment },
        }));
        callbacks.onPeerReviewComment?.(msg.question_id, msg.comment, msg.user_id, msg.user_name);
        break;

      case "peer_review_score":
        // Real-time peer review score sync
        console.log("[WS] Received peer_review_score:", msg);
        setState((prev) => ({
          ...prev,
          peerReviewScore: msg.score,
        }));
        callbacks.onPeerReviewScore?.(msg.score, msg.user_id, msg.user_name);
        break;
    }
  }, []); // No dependencies - uses refs for callbacks

  // Track current sessionId to detect changes
  const currentSessionIdRef = useRef<number | null>(null);

  // Connect on mount / session change
  useEffect(() => {
    // Clear any pending reconnect timers
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // If sessionId changed, reset reconnect attempts
    if (sessionId !== currentSessionIdRef.current) {
      reconnectAttemptsRef.current = 0;
      currentSessionIdRef.current = sessionId;
    }

    if (sessionId) {
      connect();
    }

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [sessionId, connect]);

  // Actions
  const sendAnswerUpdate = useCallback((questionId: string, answer: string) => {
    // Always update local state so UI reflects the change
    setState((prev) => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: answer },
    }));
    // Send via WebSocket if connected (collaborative mode)
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "answer_update",
        question_id: questionId,
        answer,
      }));
    }
  }, []);

  const sendChatMessage = useCallback((message: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && message.trim()) {
      console.log("[WS] Sending chat_message:", message.trim().substring(0, 30));
      wsRef.current.send(JSON.stringify({
        type: "chat_message",
        message: message.trim(),
      }));
    } else {
      console.log("[WS] Cannot send chat - WebSocket not open or empty message");
    }
  }, []);

  const voteLeader = useCallback((candidateId: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "vote_leader",
        candidate_id: candidateId,
      }));
    }
  }, []);

  const assignTasks = useCallback((taskAssignments: Record<string, number[]>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "assign_task",
        task_assignments: taskAssignments,
      }));
      setState((prev) => ({ ...prev, taskAssignments }));
    }
  }, []);

  const sendTypingIndicator = useCallback((questionId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "typing_indicator",
        question_id: questionId,
      }));
    }
  }, []);

  const loadChatHistory = useCallback((messages: ChatMessage[]) => {
    setState((prev) => ({ ...prev, chatMessages: messages }));
  }, []);

  const sendPeerReviewComment = useCallback((questionId: string, comment: string) => {
    // Update local state
    setState((prev) => ({
      ...prev,
      peerReviewComments: { ...prev.peerReviewComments, [questionId]: comment },
    }));
    // Send via WebSocket
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log("[WS] Sending peer_review_comment:", { question_id: questionId, comment: comment.substring(0, 20) });
      wsRef.current.send(JSON.stringify({
        type: "peer_review_comment",
        question_id: questionId,
        comment,
      }));
    } else {
      console.log("[WS] Cannot send - WebSocket not open, readyState:", wsRef.current?.readyState);
    }
  }, []);

  const sendPeerReviewScore = useCallback((score: number) => {
    // Update local state
    setState((prev) => ({
      ...prev,
      peerReviewScore: score,
    }));
    // Send via WebSocket
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "peer_review_score",
        score,
      }));
    }
  }, []);

  const loadPeerReviewState = useCallback((comments: Record<string, string>, score: number | null) => {
    setState((prev) => ({
      ...prev,
      peerReviewComments: comments,
      peerReviewScore: score,
    }));
  }, []);

  return {
    ...state,
    sendAnswerUpdate,
    sendChatMessage,
    voteLeader,
    assignTasks,
    sendTypingIndicator,
    loadChatHistory,
    sendPeerReviewComment,
    sendPeerReviewScore,
    loadPeerReviewState,
  };
}
