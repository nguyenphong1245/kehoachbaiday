import { useCallback, useEffect, useRef, useState } from "react";
import { Wrench, X, Plus, Check } from "lucide-react";

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
  const [saving, setSaving] = useState(false);

  const styleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!settings) return;
    setSelectedTools(settings.teaching_tools ?? []);
    setCustomTools(settings.custom_tools ?? []);
    setTeachingStyle(settings.teaching_style ?? "");
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

  const handleStyleChange = (value: string) => {
    setTeachingStyle(value);
    if (styleTimerRef.current) clearTimeout(styleTimerRef.current);
    styleTimerRef.current = setTimeout(() => {
      persist({ teaching_style: value || null });
    }, 800);
  };

  useEffect(() => {
    return () => {
      if (styleTimerRef.current) clearTimeout(styleTimerRef.current);
    };
  }, []);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-slate-700/50 dark:to-slate-700/30 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <Wrench className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wide">
              Cài đặt dạy học
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Áp dụng tự động khi sinh kế hoạch bài dạy
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Teaching tools */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-3">
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
                      ? "bg-sky-50 dark:bg-sky-900/25 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-700 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-700/60 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
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
              className="flex-1 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 hover:border-sky-400 dark:hover:border-sky-500 transition-colors"
              maxLength={100}
            />
            <button
              type="button"
              onClick={addCustomTool}
              disabled={!newTool.trim()}
              className="inline-flex items-center gap-1 px-3.5 py-2 text-sm font-medium bg-sky-600 hover:bg-sky-700 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Thêm
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 dark:border-slate-700" />

        {/* Teaching style */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-3">
            Phong cách dạy học
          </label>
          <textarea
            value={teachingStyle}
            onChange={(e) => handleStyleChange(e.target.value)}
            rows={3}
            maxLength={2000}
            className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 hover:border-sky-400 dark:hover:border-sky-500 resize-none transition-colors"
          />
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {teachingStyle.length}/2000
            </span>
            {saving && (
              <span className="text-xs text-sky-500 animate-pulse">Đang lưu...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeachingPreferencesCard;
