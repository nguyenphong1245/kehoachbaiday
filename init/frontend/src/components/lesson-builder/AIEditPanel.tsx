/**
 * AIEditPanel — Panel chỉnh sửa AI cho KHBD
 * Bước 1: AI phân tích + đề xuất hướng sửa
 * Bước 2: GV chọn → AI sửa → paste lại
 */
import React, { useState, useEffect } from "react";
import { X, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { editSuggest, editApply } from "@/services/lessonBuilderService";
import type { EditSuggestion, EditAnalysis, EditRelatedChange } from "@/types/lessonBuilder";

interface AIEditPanelProps {
  selectedText: string;
  fullLessonPlan: string;
  onApply: (
    editedText: string,
    relatedChanges: EditRelatedChange[],
    selectedSuggestion: {
      suggestionType: string;
      suggestionTitle: string;
      suggestionDescription: string;
    },
  ) => void | Promise<void>;
  onClose: () => void;
}

const TYPE_COLORS: Record<string, string> = {
  doi_tro_choi: "bg-orange-50 text-orange-600 border-orange-200",
  doi_ky_thuat: "bg-sky-50 text-sky-600 border-sky-200",
  doi_phuong_phap: "bg-teal-50 text-teal-600 border-teal-200",
  cai_thien: "bg-stone-100 text-stone-600 border-stone-200",
};

const TYPE_LABELS: Record<string, string> = {
  doi_tro_choi: "Trò chơi",
  doi_ky_thuat: "Kỹ thuật DH",
  doi_phuong_phap: "Phương pháp DH",
  cai_thien: "Cải thiện",
};

const SECTION_LABELS: Record<string, string> = {
  b_noi_dung: "b) Nội dung",
  c_san_pham: "c) Sản phẩm",
  thiet_bi_gv: "Thiết bị GV",
  thiet_bi_hs: "Thiết bị HS",
  nang_luc_tin_hoc: "Năng lực tin học",
  nang_luc_chung: "Năng lực chung",
  pham_chat: "Phẩm chất",
  phieu_hoc_tap: "Phiếu học tập",
  trac_nghiem: "Trắc nghiệm",
};

/** Convert markdown text → simple HTML for preview */
const previewMdToHtml = (text: string): string => {
  const lines = text.split("\n");
  const result: string[] = [];
  let inUl = false;

  for (const line of lines) {
    let l = line;
    l = l.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
    l = l.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    l = l.replace(/\*(.+?)\*/g, "<em>$1</em>");
    l = l.replace(/`([^`]+)`/g, "<code style='background:#f1f5f9;padding:1px 4px;border-radius:3px;font-size:12px'>$1</code>");

    const trimmed = l.trimStart();

    if (/^[-+]\s/.test(trimmed)) {
      if (!inUl) { result.push("<ul style='list-style-type:disc;margin:4px 0 4px 18px'>"); inUl = true; }
      result.push(`<li style="margin:2px 0">${trimmed.replace(/^[-+]\s*/, "")}</li>`);
      continue;
    }

    if (inUl) { result.push("</ul>"); inUl = false; }
    if (l.trim() === "") continue;
    result.push(`<p style="margin:4px 0">${l}</p>`);
  }
  if (inUl) result.push("</ul>");
  return result.join("");
};

export const AIEditPanel: React.FC<AIEditPanelProps> = ({
  selectedText,
  fullLessonPlan,
  onApply,
  onClose,
}) => {
  const [step, setStep] = useState<"loading" | "suggest" | "applying" | "done" | "error">("loading");
  const [analysis, setAnalysis] = useState<EditAnalysis | null>(null);
  const [suggestions, setSuggestions] = useState<EditSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(null);
  const [customInput, setCustomInput] = useState<string>("");
  const [editedText, setEditedText] = useState<string>("");
  const [relatedChanges, setRelatedChanges] = useState<EditRelatedChange[]>([]);
  const [appliedSuggestion, setAppliedSuggestion] = useState<{
    suggestionType: string;
    suggestionTitle: string;
    suggestionDescription: string;
  } | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    const doSuggest = async () => {
      try {
        setStep("loading");
        const result = await editSuggest(selectedText, fullLessonPlan);
        if (cancelled) return;
        setAnalysis(result.analysis);
        setSuggestions(result.suggestions);
        setStep("suggest");
      } catch (err: any) {
        if (cancelled) return;
        setError(err?.response?.data?.detail || err?.message || "Lỗi phân tích đoạn text");
        setStep("error");
      }
    };
    doSuggest();
    return () => { cancelled = true; };
  }, [selectedText, fullLessonPlan]);

  const handleApply = async () => {
    let suggestionType = "cai_thien";
    let suggestionTitle = "Yêu cầu từ giáo viên";
    let suggestionDesc = customInput.trim();

    if (customInput.trim()) {
      suggestionType = "cai_thien";
      suggestionTitle = "Yêu cầu tùy chỉnh từ giáo viên";
      suggestionDesc = customInput.trim();
    } else if (selectedSuggestion !== null) {
      const suggestion = suggestions.find(s => s.id === selectedSuggestion);
      if (!suggestion) return;
      suggestionType = suggestion.type;
      suggestionTitle = suggestion.title;
      suggestionDesc = suggestion.description;
    } else {
      return;
    }

    try {
      setStep("applying");
      const result = await editApply(
        selectedText, suggestionType, suggestionTitle, suggestionDesc, fullLessonPlan,
      );
      setEditedText(result.edited_text);
      setRelatedChanges(result.related_changes || []);
      setAppliedSuggestion({
        suggestionType,
        suggestionTitle,
        suggestionDescription: suggestionDesc,
      });
      setStep("done");
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Lỗi chỉnh sửa");
      setStep("error");
    }
  };

  const handleConfirm = async () => {
    await onApply(
      editedText,
      relatedChanges,
      appliedSuggestion || {
        suggestionType: "cai_thien",
        suggestionTitle: "Yêu cầu từ giáo viên",
        suggestionDescription: "",
      },
    );
    onClose();
  };

  const canApply = selectedSuggestion !== null || customInput.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-stone-900 rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col overflow-hidden border border-stone-200 dark:border-stone-700">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-sky-500" />
            <span className="font-semibold text-stone-800 dark:text-stone-100 text-sm">Đề xuất chỉnh sửa</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors">
            <X className="w-4 h-4 text-stone-400" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Loading */}
          {step === "loading" && (
            <div className="flex flex-col items-center py-12 gap-3">
              <Loader2 className="w-6 h-6 text-sky-500 animate-spin" />
              <span className="text-sm text-stone-400">Đang phân tích nội dung...</span>
            </div>
          )}

          {/* Error */}
          {step === "error" && (
            <div className="flex flex-col items-center py-10 gap-3">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <p className="text-sm text-red-500 text-center max-w-xs">{error}</p>
              <button
                onClick={() => {
                  setError("");
                  setStep("loading");
                  editSuggest(selectedText, fullLessonPlan)
                    .then(r => { setAnalysis(r.analysis); setSuggestions(r.suggestions); setStep("suggest"); })
                    .catch(e => { setError(e?.response?.data?.detail || "Lỗi"); setStep("error"); });
                }}
                className="text-sm font-medium text-sky-600 hover:text-sky-700 hover:underline"
              >
                Thử lại
              </button>
            </div>
          )}

          {/* Suggest step */}
          {step === "suggest" && (
            <>
              <div>
                <div className="text-xs font-medium text-stone-400 dark:text-stone-500 mb-2 uppercase tracking-wide">Chọn hướng chỉnh sửa</div>
                <div className="space-y-2">
                  {suggestions.map(s => (
                    <label
                      key={s.id}
                      className={`block border rounded-xl px-4 py-3 cursor-pointer transition-all ${
                        selectedSuggestion === s.id
                          ? "border-sky-400 bg-sky-50/60 dark:bg-sky-900/20 ring-1 ring-sky-200"
                          : "border-stone-200 dark:border-stone-700 hover:border-sky-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                      }`}
                      onClick={() => setCustomInput("")}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="suggestion"
                          checked={selectedSuggestion === s.id}
                          onChange={() => { setSelectedSuggestion(s.id); setCustomInput(""); }}
                          className="mt-0.5 accent-sky-600"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm text-stone-800 dark:text-stone-100">{s.title}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md border font-medium ${TYPE_COLORS[s.type] || "bg-stone-100 text-stone-500 border-stone-200"}`}>
                              {TYPE_LABELS[s.type] || s.type}
                            </span>
                          </div>
                          <p className="text-[13px] text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">{s.description}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Custom input */}
              <div>
                <div className="text-xs font-medium text-stone-400 dark:text-stone-500 mb-1.5 uppercase tracking-wide">Nhập ý kiến của bạn</div>
                <textarea
                  value={customInput}
                  onChange={(e) => {
                    setCustomInput(e.target.value);
                    if (e.target.value.trim()) setSelectedSuggestion(null);
                  }}
                  placeholder="Mô tả cách bạn muốn thay đổi nội dung này..."
                  className="w-full border border-stone-200 dark:border-stone-700 rounded-xl px-3.5 py-2.5 text-sm text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-800 placeholder-stone-300 dark:placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 resize-none transition-colors"
                  rows={3}
                />
              </div>
            </>
          )}

          {/* Applying */}
          {step === "applying" && (
            <div className="flex flex-col items-center py-12 gap-3">
              <Loader2 className="w-6 h-6 text-sky-500 animate-spin" />
              <span className="text-sm text-stone-400">Đang chỉnh sửa nội dung...</span>
            </div>
          )}

          {/* Done */}
          {step === "done" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Hoàn tất chỉnh sửa</span>
              </div>
              <div
                className="bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3.5 py-3 text-sm text-stone-700 dark:text-stone-200 max-h-52 overflow-y-auto leading-relaxed"
                dangerouslySetInnerHTML={{ __html: previewMdToHtml(editedText) }}
              />
              {relatedChanges.length > 0 && (
                <div className="bg-sky-50/50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-xl px-3.5 py-2.5">
                  <div className="text-xs font-medium text-sky-500 mb-2 uppercase tracking-wide">
                    Thay đổi liên quan ({relatedChanges.length})
                  </div>
                  <div className="space-y-2.5">
                    {relatedChanges.map((c, i) => (
                      <div key={i} className="text-xs">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            c.action === "add" ? "bg-emerald-400" : c.action === "remove" ? "bg-red-400" : "bg-amber-400"
                          }`} />
                          <span className="font-semibold text-stone-700 dark:text-stone-200">
                            {SECTION_LABELS[c.section] || c.section.replace(/_/g, " ")}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            c.action === "add" ? "bg-emerald-100 text-emerald-700" : c.action === "remove" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                          }`}>
                            {c.action === "add" ? "Thêm" : c.action === "remove" ? "Xóa" : "Cập nhật"}
                          </span>
                        </div>
                        {c.old_text && (
                          <div className="ml-3 pl-2 border-l-2 border-red-200 dark:border-red-800 text-stone-500 dark:text-stone-400 line-through mb-0.5">
                            {c.old_text.length > 100 ? c.old_text.slice(0, 100) + "..." : c.old_text}
                          </div>
                        )}
                        {c.new_text && (
                          <div className="ml-3 pl-2 border-l-2 border-emerald-300 dark:border-emerald-800 text-stone-700 dark:text-stone-200">
                            {c.new_text.length > 100 ? c.new_text.slice(0, 100) + "..." : c.new_text}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3 border-t border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl transition-colors"
          >
            Hủy
          </button>
          {step === "suggest" && (
            <button
              onClick={handleApply}
              disabled={!canApply}
              className="px-5 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 disabled:bg-stone-200 disabled:text-stone-400 dark:disabled:bg-stone-700 dark:disabled:text-stone-500 disabled:cursor-not-allowed rounded-xl transition-colors shadow-sm"
            >
              Áp dụng chỉnh sửa
            </button>
          )}
          {step === "done" && (
            <button
              onClick={handleConfirm}
              className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm"
            >
              Chèn vào KHBD
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIEditPanel;
