import React, { useState, useEffect, useCallback } from "react";
import {
  BookOpen,
  Pencil,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Save,
  X,
  Loader2,
  FileText,
  Sparkles,
  Users,
  Share2,
  ClipboardCheck,
  Settings,
  Play,
} from "lucide-react";
import { RichTextEditor } from "@/components/common/RichTextEditor";
import {
  getAdminGuideCards,
  updateGuideCard,
  reorderGuideCards,
  type GuideCardAdmin,
  type GuideCardUpdatePayload,
} from "@/services/adminService";

/* ── Icon lookup ── */
const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  FileText,
  Sparkles,
  Users,
  Share2,
  ClipboardCheck,
  Settings,
  Play,
};

const AdminGuidePage: React.FC = () => {
  const [cards, setCards] = useState<GuideCardAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingCard, setEditingCard] = useState<GuideCardAdmin | null>(null);

  /* ── edit form state ── */
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formVideoUrl, setFormVideoUrl] = useState("");

  const loadCards = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAdminGuideCards();
      setCards(data);
      setError(null);
    } catch {
      setError("Không thể tải danh sách hướng dẫn");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  /* ── open edit modal ── */
  const openEdit = (card: GuideCardAdmin) => {
    setEditingCard(card);
    setFormTitle(card.title);
    setFormDesc(card.description);
    setFormContent(card.content_html);
    setFormVideoUrl(card.video_url || "");
  };

  /* ── save ── */
  const handleSave = async () => {
    if (!editingCard) return;
    setSaving(true);
    try {
      const payload: GuideCardUpdatePayload = {
        title: formTitle,
        description: formDesc,
        content_html: formContent,
      };
      if (editingCard.card_key === "video") {
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

  /* ── toggle active ── */
  const toggleActive = async (card: GuideCardAdmin) => {
    try {
      await updateGuideCard(card.id, { is_active: !card.is_active });
      await loadCards();
    } catch {
      alert("Cập nhật thất bại");
    }
  };

  /* ── reorder ── */
  const moveCard = async (index: number, direction: "up" | "down") => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 mb-3">{error}</p>
        <button onClick={loadCards} className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-6 h-6 text-sky-600 dark:text-sky-400" />
        <div>
          <h1 className="text-xl font-bold text-stone-800 dark:text-stone-200">
            Quản lý Hướng dẫn sử dụng
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Chỉnh sửa nội dung trang hướng dẫn cho người dùng
          </p>
        </div>
      </div>

      {/* Card list */}
      <div className="space-y-2">
        {cards.map((card, idx) => {
          const Icon = ICON_MAP[card.icon_name];
          return (
            <div
              key={card.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                card.is_active
                  ? "bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700"
                  : "bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-700 opacity-60"
              }`}
            >
              {/* Reorder arrows */}
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => moveCard(idx, "up")}
                  disabled={idx === 0}
                  className="p-0.5 rounded hover:bg-stone-100 dark:hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronUp className="w-4 h-4 text-stone-500" />
                </button>
                <button
                  onClick={() => moveCard(idx, "down")}
                  disabled={idx === cards.length - 1}
                  className="p-0.5 rounded hover:bg-stone-100 dark:hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronDown className="w-4 h-4 text-stone-500" />
                </button>
              </div>

              {/* Icon */}
              <div className={`flex-shrink-0 ${card.icon_color}`}>
                {Icon ? <Icon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
              </div>

              {/* Title & desc */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-stone-800 dark:text-stone-200 text-sm truncate">
                  {card.title}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400 truncate">{card.description}</p>
              </div>

              {/* Video badge */}
              {card.video_url && (
                <span className="text-xs bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full hidden sm:inline">
                  Video
                </span>
              )}

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleActive(card)}
                  title={card.is_active ? "Ẩn" : "Hiện"}
                  className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
                >
                  {card.is_active ? (
                    <Eye className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-stone-400" />
                  )}
                </button>
                <button
                  onClick={() => openEdit(card)}
                  title="Chỉnh sửa"
                  className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
                >
                  <Pencil className="w-4 h-4 text-sky-500" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Edit modal ── */}
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

              {/* Video URL (only for video card) */}
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

              {/* Content - Rich Text Editor */}
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Nội dung hướng dẫn
                </label>
                <RichTextEditor
                  value={formContent}
                  onChange={setFormContent}
                  placeholder="Nhập nội dung hướng dẫn..."
                  minHeight="300px"
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

export default AdminGuidePage;
