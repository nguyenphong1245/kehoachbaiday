import { useCallback, useEffect, useState } from "react";
import { Settings, X, Plus, Check, Save, Loader2 } from "lucide-react";

import type { UserSettings, UserSettingsUpdatePayload } from "@/types/auth";
import { DEFAULT_TEACHING_TOOLS } from "@/constants/teachingTools";

interface Props {
  settings: UserSettings | null;
  onSave: (payload: UserSettingsUpdatePayload) => Promise<unknown>;
}

const TeachingPreferencesCard = ({ settings, onSave }: Props) => {
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [customTools, setCustomTools] = useState<string[]>([]);
  const [newTool, setNewTool] = useState("");
  const [teachingStyle, setTeachingStyle] = useState("");
  const [originalStyle, setOriginalStyle] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingStyle, setSavingStyle] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setSelectedTools(settings.teaching_tools ?? []);
    setCustomTools(settings.custom_tools ?? []);
    setTeachingStyle(settings.teaching_style ?? "");
    setOriginalStyle(settings.teaching_style ?? "");
  }, [settings]);

  const persist = useCallback(
    async (patch: Partial<UserSettingsUpdatePayload>) => {
      setSaving(true);
      try {
        await onSave(patch);
      } catch {
        // useAccount already sets error
      } finally {
        setSaving(false);
      }
    },
    [onSave],
  );

  const allTools = [...DEFAULT_TEACHING_TOOLS, ...customTools];

  const toggleTool = (tool: string) => {
    const next = selectedTools.includes(tool)
      ? selectedTools.filter((t) => t !== tool)
      : [...selectedTools, tool];
    setSelectedTools(next);
    persist({ teaching_tools: next });
  };

  const addCustomTool = () => {
    const trimmed = newTool.trim();
    if (!trimmed) return;
    if (allTools.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setNewTool("");
      return;
    }
    const nextCustom = [...customTools, trimmed];
    const nextSelected = [...selectedTools, trimmed];
    setCustomTools(nextCustom);
    setSelectedTools(nextSelected);
    setNewTool("");
    persist({ custom_tools: nextCustom, teaching_tools: nextSelected });
  };

  const removeCustomTool = (tool: string) => {
    const nextCustom = customTools.filter((t) => t !== tool);
    const nextSelected = selectedTools.filter((t) => t !== tool);
    setCustomTools(nextCustom);
    setSelectedTools(nextSelected);
    persist({ custom_tools: nextCustom, teaching_tools: nextSelected });
  };

  const handleSaveStyle = async () => {
    setSavingStyle(true);
    try {
      await onSave({ teaching_style: teachingStyle || null });
      setOriginalStyle(teachingStyle);
    } catch {
      // useAccount already sets error
    } finally {
      setSavingStyle(false);
    }
  };

  const hasStyleChanged = teachingStyle !== originalStyle;

  return (
    <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-sky-50 dark:bg-stone-700/50 border-b border-stone-200 dark:border-stone-700">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
            <Settings className="w-4 h-4 text-brand dark:text-sky-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-stone-800 dark:text-white uppercase tracking-wide">
              Cài đặt dạy học
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Áp dụng tự động khi sinh kế hoạch bài dạy
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Teaching tools */}
        <div>
          <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wide mb-3">
            Công cụ dạy học
          </label>

          <div className="flex flex-wrap gap-2">
            {allTools.map((tool) => {
              const isSelected = selectedTools.includes(tool);
              const isCustom = customTools.includes(tool);
              return (
                <button
                  key={tool}
                  type="button"
                  onClick={() => toggleTool(tool)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
                    isSelected
                      ? "bg-sky-50 dark:bg-sky-900/25 text-brand-dark dark:text-sky-300 border-sky-300 dark:border-sky-700 shadow-sm"
                      : "bg-stone-50 dark:bg-stone-700/60 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-600 hover:border-sky-300 dark:hover:border-brand hover:text-brand dark:hover:text-sky-400"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                  {tool}
                  {isCustom && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCustomTool(tool);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.stopPropagation();
                          removeCustomTool(tool);
                        }
                      }}
                      className="ml-0.5 hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Add custom tool */}
          <div className="flex items-center gap-2 mt-3">
            <input
              type="text"
              value={newTool}
              onChange={(e) => setNewTool(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomTool();
                }
              }}
              placeholder="Thêm công cụ mới..."
              className="flex-1 px-3 py-2 text-sm bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-lg text-stone-800 dark:text-white placeholder-stone-400 focus:ring-2 focus:ring-brand focus:border-brand hover:border-brand-light dark:hover:border-brand transition-colors"
              maxLength={100}
            />
            <button
              type="button"
              onClick={addCustomTool}
              disabled={!newTool.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-brand hover:bg-brand-dark text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Thêm
            </button>
          </div>

          {saving && (
            <p className="text-xs text-brand mt-2 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Đang lưu...
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-stone-200 dark:border-stone-700" />

        {/* Teaching style */}
        <div>
          <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wide mb-3">
            Phong cách dạy học
          </label>
          <textarea
            value={teachingStyle}
            onChange={(e) => setTeachingStyle(e.target.value)}
            rows={4}
            maxLength={2000}
            placeholder="Mô tả phong cách dạy học của bạn để AI tạo kế hoạch bài dạy phù hợp hơn..."
            className="w-full px-3 py-2.5 text-sm bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-lg text-stone-800 dark:text-white placeholder-stone-400 focus:ring-2 focus:ring-brand focus:border-brand hover:border-brand-light dark:hover:border-brand resize-none transition-colors"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-stone-400 dark:text-stone-500">
              {teachingStyle.length}/2000
            </span>
            <button
              type="button"
              onClick={handleSaveStyle}
              disabled={!hasStyleChanged || savingStyle}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all shadow-sm ${
                hasStyleChanged
                  ? "bg-brand hover:bg-brand-dark text-white"
                  : "bg-stone-100 dark:bg-stone-700 text-stone-400 dark:text-stone-500 cursor-not-allowed"
              } disabled:opacity-50`}
            >
              {savingStyle ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeachingPreferencesCard;
