import React from "react";
import { Plus, MessageSquare, Trash2, MoreVertical, User, LogOut, Settings, ChevronUp, Share2, Pin, PinOff, Pencil, Check, X, Copy } from "lucide-react";
import type { ChatConversationListItem } from "@/types/chat";
import { getStoredAuthUser } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { SettingsModal } from "./SettingsModal";

interface ChatSidebarProps {
  conversations: ChatConversationListItem[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation?: (id: string) => void;
  onRenameConversation?: (id: string, newTitle: string) => void;
  isLoading?: boolean;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
  isLoading = false,
}) => {
  const [expandedMenu, setExpandedMenu] = React.useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [showSettingsModal, setShowSettingsModal] = React.useState(false);
  const [renamingId, setRenamingId] = React.useState<string | null>(null);
  const [renameValue, setRenameValue] = React.useState("");
  const [pinnedIds, setPinnedIds] = React.useState<Set<string>>(() => {
    const saved = localStorage.getItem("pinnedConversations");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [copiedLink, setCopiedLink] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const currentUser = getStoredAuthUser();

  // Save pinned to localStorage
  React.useEffect(() => {
    localStorage.setItem("pinnedConversations", JSON.stringify([...pinnedIds]));
  }, [pinnedIds]);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setExpandedMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuToggle = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setExpandedMenu(expandedMenu === id ? null : id);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (onDeleteConversation && confirm("Bạn có chắc muốn xóa cuộc trò chuyện này?")) {
      onDeleteConversation(id);
      // Remove from pinned if pinned
      setPinnedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
    setExpandedMenu(null);
  };

  const handleShare = (e: React.MouseEvent, conv: ChatConversationListItem) => {
    e.stopPropagation();
    const url = `${window.location.origin}/chat/${conv.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    setExpandedMenu(null);
  };

  const handlePin = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setPinnedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setExpandedMenu(null);
  };

  const handleRename = (e: React.MouseEvent, conv: ChatConversationListItem) => {
    e.stopPropagation();
    setRenamingId(conv.id);
    setRenameValue(conv.title || "");
    setExpandedMenu(null);
  };

  const handleRenameSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRenameConversation && renameValue.trim()) {
      onRenameConversation(id, renameValue.trim());
    }
    setRenamingId(null);
    setRenameValue("");
  };

  const handleRenameCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(null);
    setRenameValue("");
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Sort conversations: pinned first, then by date
  const sortedConversations = React.useMemo(() => {
    return [...conversations].sort((a, b) => {
      const aPinned = pinnedIds.has(a.id);
      const bPinned = pinnedIds.has(b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }, [conversations, pinnedIds]);

  // Group conversations
  const pinnedConversations = sortedConversations.filter(c => pinnedIds.has(c.id));
  const recentConversations = sortedConversations.filter(c => !pinnedIds.has(c.id));

  const ConversationItem = ({ conv, isPinned = false }: { conv: ChatConversationListItem; isPinned?: boolean }) => (
    <div
      className={`relative group flex items-center gap-3 px-3 py-2.5 mx-2 rounded-full cursor-pointer transition-all duration-200 ${
        currentConversationId === conv.id
          ? "bg-sky-100 dark:bg-sky-900/50"
          : "hover:bg-gray-100 dark:hover:bg-gray-700/50"
      }`}
      onClick={() => onSelectConversation(conv.id)}
    >
      {renamingId === conv.id ? (
        <form 
          onSubmit={(e) => handleRenameSubmit(e, conv.id)} 
          className="flex-1 flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            className="flex-1 text-sm px-3 py-1.5 rounded-full border border-sky-400 dark:border-sky-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
          <button 
            type="submit" 
            className="p-1.5 rounded-full bg-sky-500 text-white hover:bg-sky-600"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button 
            type="button" 
            onClick={handleRenameCancel} 
            className="p-1.5 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </form>
      ) : (
        <>
          {/* Title */}
          <div className="flex-1 min-w-0 flex items-center gap-2">
            {isPinned && (
              <Pin className="w-3 h-3 text-sky-500 dark:text-sky-400 flex-shrink-0" />
            )}
            <span className={`text-sm truncate ${
              currentConversationId === conv.id
                ? "text-sky-700 dark:text-sky-200 font-medium"
                : "text-gray-700 dark:text-gray-300"
            }`}>
              {conv.title || "Cuộc trò chuyện mới"}
            </span>
          </div>

          {/* Menu Button - Always visible on mobile, hover on desktop */}
          <div className="relative" ref={expandedMenu === conv.id ? menuRef : null}>
            <button
              onClick={(e) => handleMenuToggle(e, conv.id)}
              className={`p-1.5 rounded-full transition-all ${
                expandedMenu === conv.id
                  ? "opacity-100 bg-gray-200 dark:bg-gray-600"
                  : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              } hover:bg-gray-200 dark:hover:bg-gray-600`}
              title="Tùy chọn"
            >
              <MoreVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>

            {/* Dropdown Menu */}
            {expandedMenu === conv.id && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  onClick={(e) => handleShare(e, conv)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {copiedLink ? <Copy className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
                  {copiedLink ? "Đã sao chép!" : "Chia sẻ"}
                </button>
                <button
                  onClick={(e) => handlePin(e, conv.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {pinnedIds.has(conv.id) ? (
                    <>
                      <PinOff className="w-4 h-4" />
                      Bỏ ghim
                    </>
                  ) : (
                    <>
                      <Pin className="w-4 h-4" />
                      Ghim
                    </>
                  )}
                </button>
                <button
                  onClick={(e) => handleRename(e, conv)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  Đổi tên
                </button>
                <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
                <button
                  onClick={(e) => handleDelete(e, conv.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="w-72 sm:w-64 md:w-72 bg-gray-50/80 dark:bg-gray-900/95 backdrop-blur-sm border-r border-gray-200 dark:border-gray-800 flex flex-col h-full">
      {/* Header - New Chat Button */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-all duration-200 font-medium text-sm border border-sky-200 dark:border-sky-800"
        >
          <Plus className="w-5 h-5" />
          <span>Trò chuyện mới</span>
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto py-2">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="animate-pulse space-y-3 px-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
              ))}
            </div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12 px-4 text-gray-500 dark:text-gray-400">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Chưa có cuộc trò chuyện</p>
            <p className="text-xs mt-1 opacity-70">Bắt đầu trò chuyện mới!</p>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Pinned Section */}
            {pinnedConversations.length > 0 && (
              <>
                <div className="px-4 py-1.5">
                  <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Đã ghim
                  </span>
                </div>
                {pinnedConversations.map((conv) => (
                  <ConversationItem key={conv.id} conv={conv} isPinned />
                ))}
              </>
            )}

            {/* Recent Section */}
            {recentConversations.length > 0 && (
              <>
                {pinnedConversations.length > 0 && (
                  <div className="px-4 py-1.5 mt-2">
                    <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Gần đây
                    </span>
                  </div>
                )}
                {recentConversations.map((conv) => (
                  <ConversationItem key={conv.id} conv={conv} />
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* User Account Footer */}
      {currentUser && (
        <div className="border-t border-gray-200 dark:border-gray-800 p-2">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white font-medium shadow-sm">
                {currentUser.profile?.avatar_url ? (
                  <img
                    src={currentUser.profile.avatar_url}
                    alt="Avatar"
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm">
                    {currentUser.profile?.first_name?.[0] || currentUser.email[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {currentUser.profile?.first_name && currentUser.profile?.last_name
                    ? `${currentUser.profile.first_name} ${currentUser.profile.last_name}`
                    : currentUser.email.split('@')[0]}
                </div>
              </div>
              <ChevronUp
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                  showUserMenu ? "" : "rotate-180"
                }`}
              />
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    setShowSettingsModal(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-200">Cài đặt</span>
                </button>
                <div className="border-t border-gray-200 dark:border-gray-700" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-600 dark:text-red-400">Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
    </div>
  );
};
