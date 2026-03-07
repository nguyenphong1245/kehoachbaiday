/**
 * UserGuidePage - Trang hướng dẫn sử dụng hệ thống
 * Hiển thị hướng dẫn chi tiết cho giáo viên - dạng lưới ô vuông + modal
 * Nội dung được tải từ API (admin có thể chỉnh sửa trực tiếp tại đây)
 */
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Users,
  Sparkles,
  Settings,
  X,
  FileText,
  Share2,
  ClipboardCheck,
  Play,
  Loader2,
  Pencil,
  Eye,
  EyeOff,
  Save,
} from "lucide-react";
import { marked } from "marked";
import { sanitizeHTML } from "@/utils/sanitize";
import { getStoredAuthUser } from "@/utils/authStorage";
import {
  getPublicGuideCards,
  getAdminGuideCards,
  updateGuideCard,
  reorderGuideCards,
  type GuideCardPublic,
  type GuideCardAdmin,
  type GuideCardUpdatePayload,
} from "@/services/adminService";
import { usePageTitle } from "@/hooks/usePageTitle";

/* ---------- Icon lookup ---------- */
const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  FileText,
  Sparkles,
  Users,
  Share2,
  ClipboardCheck,
  Settings,
  Play,
};

/* ---------- Extract YouTube video ID ---------- */
const getYouTubeVideoId = (url: string): string | null => {
  try {
    const u = new URL(url);
    let videoId = "";
    if (u.hostname === "youtu.be") {
      videoId = u.pathname.slice(1);
    } else if (u.hostname.includes("youtube.com")) {
      if (u.pathname.startsWith("/embed/")) {
        videoId = u.pathname.replace("/embed/", "").split("?")[0];
      } else if (u.pathname.startsWith("/shorts/")) {
        videoId = u.pathname.replace("/shorts/", "");
      } else {
        videoId = u.searchParams.get("v") || "";
      }
    }
    if (!videoId || videoId === "VIDEO_ID" || videoId.length < 5) return null;
    return videoId;
  } catch {
    return null;
  }
};

/* ---------- Convert any YouTube URL to embed format ---------- */
const toYouTubeEmbed = (url: string): string | null => {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
};

/* ---------- Check admin role ---------- */
const isAdminUser = (): boolean => {
  const user = getStoredAuthUser();
  return user?.roles?.some((r) => r.name === "admin") ?? false;
};

/* ================================================================
   MAIN COMPONENT
   ================================================================ */
const UserGuidePage: React.FC = () => {
  usePageTitle("Hướng dẫn sử dụng");
  const [cards, setCards] = useState<(GuideCardPublic | GuideCardAdmin)[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const isAdmin = isAdminUser();

  /* ── Admin edit state ── */
  const [editingCard, setEditingCard] = useState<GuideCardAdmin | null>(null);
  const [saving, setSaving] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formVideoUrl, setFormVideoUrl] = useState("");

  const activeCard = cards.find((c) => c.id === selectedCardId) ?? null;

  // Fetch guide cards from API
  const loadCards = useCallback(async () => {
    try {
      setLoading(true);
      const data = isAdmin
        ? await getAdminGuideCards()
        : await getPublicGuideCards();
      setCards(data);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  // Close modal on Escape
  useEffect(() => {
    if (!selectedCardId && !editingCard) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (editingCard) setEditingCard(null);
        else setSelectedCardId(null);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedCardId, editingCard]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setSelectedCardId(null);
    }
  };

  /* ── Admin: open edit modal ── */
  const openEdit = (card: GuideCardAdmin, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCard(card);
    setFormTitle(card.title);
    setFormDesc(card.description);
    setFormContent(card.content_html);
    setFormVideoUrl(card.video_url || "");
  };

  /* ── Admin: save ── */
  const handleSave = async () => {
    if (!editingCard) return;
    setSaving(true);
    try {
      const payload: GuideCardUpdatePayload = {
        title: formTitle,
        description: formDesc,
        content_html: formContent,
      };
      if (editingCard.video_url !== undefined) {
        payload.video_url = formVideoUrl || null;
      }
      await updateGuideCard(editingCard.id, payload);
      setEditingCard(null);
      await loadCards();
    } catch {
      alert("Lưu thất bại. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Admin: toggle active ── */
  const toggleActive = async (card: GuideCardAdmin, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateGuideCard(card.id, { is_active: !card.is_active });
      await loadCards();
    } catch {
      alert("Cập nhật thất bại");
    }
  };

  /* ── Admin: reorder ── */
  const moveCard = async (index: number, direction: "up" | "down", e: React.MouseEvent) => {
    e.stopPropagation();
    const newCards = [...cards];
    const swapIdx = direction === "up" ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= newCards.length) return;
    [newCards[index], newCards[swapIdx]] = [newCards[swapIdx], newCards[index]];
    setCards(newCards);
    try {
      await reorderGuideCards(newCards.map((c) => c.id));
    } catch {
      await loadCards();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-stone-50 dark:bg-stone-900">
      {/* Header breadcrumb */}
      <header className="bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700">
        <div className="px-5 py-2.5 flex items-center gap-1.5 text-sm">
          <span className="text-stone-500 dark:text-stone-400">Kế hoạch bài dạy</span>
          <ChevronRight className="w-4 h-4 text-stone-300" />
          <span className="text-stone-700 dark:text-stone-300 font-medium">Hướng dẫn sử dụng</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-4 py-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
            </div>
          ) : cards.length === 0 ? (
            <p className="text-center text-stone-500 dark:text-stone-400 py-12">
              Chưa có nội dung hướng dẫn.
            </p>
          ) : (
            /* Grid of cards */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {cards.map((card, idx) => {
                const Icon = ICON_MAP[card.icon_name] || FileText;
                const isInactive = isAdmin && "is_active" in card && !card.is_active;
                return (
                  <button
                    key={card.id}
                    onClick={() => setSelectedCardId(card.id)}
                    className={`group relative flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 text-center aspect-square ${card.color} ${
                      isInactive ? "opacity-50" : ""
                    } ${
                      selectedCardId === card.id
                        ? "ring-2 ring-sky-400 shadow-lg -translate-y-1"
                        : "hover:ring-1 hover:ring-sky-300"
                    }`}
                  >
                    {/* Admin controls overlay */}
                    {isAdmin && (
                      <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => moveCard(idx, "up", e)}
                          disabled={idx === 0}
                          className="p-1 rounded-md bg-white/80 dark:bg-stone-700/80 hover:bg-white dark:hover:bg-stone-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Lên"
                        >
                          <ChevronUp className="w-3.5 h-3.5 text-stone-600 dark:text-stone-300" />
                        </button>
                        <button
                          onClick={(e) => moveCard(idx, "down", e)}
                          disabled={idx === cards.length - 1}
                          className="p-1 rounded-md bg-white/80 dark:bg-stone-700/80 hover:bg-white dark:hover:bg-stone-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Xuống"
                        >
                          <ChevronDown className="w-3.5 h-3.5 text-stone-600 dark:text-stone-300" />
                        </button>
                        <button
                          onClick={(e) => toggleActive(card as GuideCardAdmin, e)}
                          className="p-1 rounded-md bg-white/80 dark:bg-stone-700/80 hover:bg-white dark:hover:bg-stone-600"
                          title={isInactive ? "Hiện" : "Ẩn"}
                        >
                          {isInactive ? (
                            <EyeOff className="w-3.5 h-3.5 text-stone-400" />
                          ) : (
                            <Eye className="w-3.5 h-3.5 text-emerald-500" />
                          )}
                        </button>
                        <button
                          onClick={(e) => openEdit(card as GuideCardAdmin, e)}
                          className="p-1 rounded-md bg-white/80 dark:bg-stone-700/80 hover:bg-white dark:hover:bg-stone-600"
                          title="Chỉnh sửa"
                        >
                          <Pencil className="w-3.5 h-3.5 text-sky-500" />
                        </button>
                      </div>
                    )}

                    <div className={`${card.icon_color} transition-transform group-hover:scale-110`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="font-semibold text-stone-800 dark:text-stone-200 text-sm leading-tight">
                        {card.title}
                      </p>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-tight">
                        {card.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* View Modal overlay */}
      {activeCard && !editingCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={handleBackdropClick}
        >
          <div
            ref={modalRef}
            className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Modal header */}
            <div
              className={`flex items-center justify-between px-5 py-4 border-b border-stone-100 dark:border-stone-700 rounded-t-2xl ${activeCard.color}`}
            >
              <div className="flex items-center gap-3">
                <div className={activeCard.icon_color}>
                  {(() => {
                    const Icon = ICON_MAP[activeCard.icon_name] || FileText;
                    return <Icon className="w-7 h-7" />;
                  })()}
                </div>
                <div>
                  <h2 className="font-bold text-stone-800 dark:text-white">{activeCard.title}</h2>
                  <p className="text-xs text-stone-500 dark:text-stone-400">{activeCard.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {isAdmin && (
                  <button
                    onClick={() => {
                      setSelectedCardId(null);
                      openEdit(activeCard as GuideCardAdmin, { stopPropagation: () => {} } as React.MouseEvent);
                    }}
                    className="w-8 h-8 rounded-lg hover:bg-white/70 dark:hover:bg-stone-700/70 flex items-center justify-center transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Pencil className="w-4 h-4 text-sky-500" />
                  </button>
                )}
                <button
                  onClick={() => setSelectedCardId(null)}
                  className="w-8 h-8 rounded-lg hover:bg-white/70 dark:hover:bg-stone-700/70 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                </button>
              </div>
            </div>
            {/* Modal content – scrollable */}
            <div className="flex-1 overflow-auto px-5 py-5">
              {/* Markdown content from database */}
              <div
                className="guide-content text-sm"
                dangerouslySetInnerHTML={{ __html: sanitizeHTML(marked.parse(activeCard.content_html) as string) }}
              />

              {/* Video iframe (if video card with valid URL) */}
              {activeCard.video_url && toYouTubeEmbed(activeCard.video_url) && (
                <div className="mt-4">
                  <div className="aspect-video rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-700">
                    <iframe
                      className="w-full h-full"
                      src={toYouTubeEmbed(activeCard.video_url)!}
                      title="Video hướng dẫn sử dụng"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <a
                    href={`https://www.youtube.com/watch?v=${getYouTubeVideoId(activeCard.video_url)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:underline"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/><path fill="#fff" d="M9.545 15.568V8.432L15.818 12z"/></svg>
                    Xem trực tiếp trên YouTube
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin Edit Modal */}
      {editingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 dark:border-stone-700">
              <h2 className="font-bold text-stone-800 dark:text-stone-200">
                Chỉnh sửa: {editingCard.title}
              </h2>
              <button
                onClick={() => setEditingCard(null)}
                className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700"
              >
                <X className="w-4 h-4 text-stone-500" />
              </button>
            </div>

            {/* Modal body – scrollable */}
            <div className="flex-1 overflow-auto px-5 py-4 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Tiêu đề
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200 text-sm focus:ring-2 focus:ring-sky-400 outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Mô tả ngắn
                </label>
                <input
                  type="text"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200 text-sm focus:ring-2 focus:ring-sky-400 outline-none"
                />
              </div>

              {/* Video URL - only for video card */}
              {editingCard.card_key === "video" && (
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Video URL (YouTube embed)
                  </label>
                  <input
                    type="text"
                    value={formVideoUrl}
                    onChange={(e) => setFormVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/embed/..."
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200 text-sm focus:ring-2 focus:ring-sky-400 outline-none"
                  />
                </div>
              )}

              {/* Content - Markdown textarea */}
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Nội dung hướng dẫn (Markdown)
                </label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Nhập nội dung hướng dẫn..."
                  rows={14}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200 text-sm focus:ring-2 focus:ring-sky-400 outline-none font-mono resize-y"
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-stone-200 dark:border-stone-700">
              <button
                onClick={() => setEditingCard(null)}
                className="px-4 py-2 text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserGuidePage;
