/**
 * NLSConfigSection - Cấu hình Năng lực số (NLS)
 * Cho phép chọn chỉ báo năng lực số theo cấu trúc phân cấp:
 * Miền năng lực → Năng lực thành phần → Chỉ báo
 */
import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronDown,
  ChevronRight,
  X,
  Loader2,
  Check,
} from "lucide-react";
import type {
  NLSMienNangLuc,
  NLSNangLucThanhPhan,
  NLSChiBao,
  NLSSelectionItem,
} from "@/types/lessonBuilder";
import {
  getNLSMienNangLuc,
  getNLSNangLucThanhPhan,
  getNLSChiBao,
} from "@/services/lessonBuilderApi";

interface NLSConfigSectionProps {
  selections: NLSSelectionItem[];
  onSelectionsChange: (selections: NLSSelectionItem[]) => void;
}

export const NLSConfigSection: React.FC<NLSConfigSectionProps> = ({
  selections,
  onSelectionsChange,
}) => {
  // Data
  const [mienNangLucList, setMienNangLucList] = useState<NLSMienNangLuc[]>([]);
  const [nangLucThanhPhanMap, setNangLucThanhPhanMap] = useState<Record<string, NLSNangLucThanhPhan[]>>({});
  const [chiBaoMap, setChiBaoMap] = useState<Record<string, NLSChiBao[]>>({});

  // UI state
  const [expandedMien, setExpandedMien] = useState<string | null>(null);
  const [expandedNLTP, setExpandedNLTP] = useState<string | null>(null);
  const [loadingMien, setLoadingMien] = useState(false);
  const [loadingNLTP, setLoadingNLTP] = useState<string | null>(null);
  const [loadingChiBao, setLoadingChiBao] = useState<string | null>(null);

  // Fetch Miền năng lực on mount
  useEffect(() => {
    let cancelled = false;
    setLoadingMien(true);
    getNLSMienNangLuc()
      .then((data) => {
        if (!cancelled) setMienNangLucList(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingMien(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Fetch Năng lực thành phần when expanding a Miền
  const handleExpandMien = useCallback(async (mienName: string) => {
    if (expandedMien === mienName) {
      setExpandedMien(null);
      setExpandedNLTP(null);
      return;
    }
    setExpandedMien(mienName);
    setExpandedNLTP(null);

    if (!nangLucThanhPhanMap[mienName]) {
      setLoadingNLTP(mienName);
      try {
        const data = await getNLSNangLucThanhPhan(mienName);
        setNangLucThanhPhanMap((prev) => ({ ...prev, [mienName]: data }));
      } catch { /* ignore */ }
      setLoadingNLTP(null);
    }
  }, [expandedMien, nangLucThanhPhanMap]);

  // Fetch Chỉ báo when expanding a Năng lực thành phần
  const handleExpandNLTP = useCallback(async (nltpName: string) => {
    if (expandedNLTP === nltpName) {
      setExpandedNLTP(null);
      return;
    }
    setExpandedNLTP(nltpName);

    if (!chiBaoMap[nltpName]) {
      setLoadingChiBao(nltpName);
      try {
        const data = await getNLSChiBao(nltpName);
        setChiBaoMap((prev) => ({ ...prev, [nltpName]: data }));
      } catch { /* ignore */ }
      setLoadingChiBao(null);
    }
  }, [expandedNLTP, chiBaoMap]);

  // Toggle selection of a chỉ báo
  const toggleChiBao = useCallback((mienName: string, chiBao: NLSChiBao) => {
    const exists = selections.some((s) => s.ma === chiBao.ma);
    if (exists) {
      onSelectionsChange(selections.filter((s) => s.ma !== chiBao.ma));
    } else {
      onSelectionsChange([
        ...selections,
        {
          mien_nang_luc: mienName,
          ma: chiBao.ma,
          noi_dung: chiBao.noi_dung,
        },
      ]);
    }
  }, [selections, onSelectionsChange]);

  // Remove a selection
  const removeSelection = useCallback((ma: string) => {
    onSelectionsChange(selections.filter((s) => s.ma !== ma));
  }, [selections, onSelectionsChange]);

  // Check if a chỉ báo is selected
  const isSelected = useCallback((ma: string) => {
    return selections.some((s) => s.ma === ma);
  }, [selections]);

  // Count selections per miền
  const countByMien = useCallback((mienName: string) => {
    return selections.filter((s) => s.mien_nang_luc === mienName).length;
  }, [selections]);

  if (loadingMien) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-5 h-5 animate-spin text-sky-500" />
        <span className="ml-2 text-sm text-stone-500">Đang tải dữ liệu năng lực số...</span>
      </div>
    );
  }

  if (mienNangLucList.length === 0) {
    return (
      <p className="text-sm text-stone-400 py-4 text-center">
        Chưa có dữ liệu năng lực số
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {/* Selected items display */}
      {selections.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-stone-600 dark:text-stone-400">
            Đã chọn ({selections.length} chỉ báo)
          </label>
          <div className="flex flex-wrap gap-1.5 p-2 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-600 rounded-lg min-h-[36px]">
            {selections.map((s) => (
              <span
                key={s.ma}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700 rounded"
                title={s.noi_dung}
              >
                <span>{s.ma}</span>
                <button
                  onClick={() => removeSelection(s.ma)}
                  className="hover:text-red-500 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Hierarchical selector */}
      <div className="border border-stone-200 dark:border-stone-600 rounded-lg overflow-hidden">
        {mienNangLucList.map((mien) => {
          const isExpanded = expandedMien === mien.name;
          const count = countByMien(mien.name);
          const nltpList = nangLucThanhPhanMap[mien.name] || [];

          return (
            <div key={mien.name} className="border-b border-stone-200 dark:border-stone-600 last:border-b-0">
              {/* Miền năng lực header */}
              <button
                onClick={() => handleExpandMien(mien.name)}
                className="w-full px-3 py-2.5 flex items-center gap-2 hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors text-left"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-stone-400 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-stone-400 flex-shrink-0" />
                )}
                <span className="text-sm font-medium text-stone-700 dark:text-stone-200 flex-1">
                  {mien.name}
                </span>
                {count > 0 && (
                  <span className="text-xs bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 px-1.5 py-0.5 rounded-full font-medium">
                    {count}
                  </span>
                )}
              </button>

              {/* Năng lực thành phần list */}
              {isExpanded && (
                <div className="bg-stone-50 dark:bg-stone-800/30">
                  {loadingNLTP === mien.name ? (
                    <div className="flex items-center gap-2 px-6 py-3">
                      <Loader2 className="w-4 h-4 animate-spin text-sky-500" />
                      <span className="text-xs text-stone-500">Đang tải...</span>
                    </div>
                  ) : nltpList.length === 0 ? (
                    <p className="text-xs text-stone-400 px-6 py-3">Không có dữ liệu</p>
                  ) : (
                    nltpList.map((nltp) => {
                      const isNLTPExpanded = expandedNLTP === nltp.name;
                      const chiBaoList = chiBaoMap[nltp.name] || [];

                      return (
                        <div key={nltp.name}>
                          {/* NLTP header */}
                          <button
                            onClick={() => handleExpandNLTP(nltp.name)}
                            className="w-full px-6 py-2 flex items-center gap-2 hover:bg-stone-100 dark:hover:bg-stone-700/30 transition-colors text-left"
                          >
                            {isNLTPExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                            )}
                            <span className="text-xs font-medium text-stone-600 dark:text-stone-300 flex-1">
                              {nltp.name}
                            </span>
                          </button>

                          {/* Chỉ báo list */}
                          {isNLTPExpanded && (
                            <div className="bg-white dark:bg-stone-800/50">
                              {loadingChiBao === nltp.name ? (
                                <div className="flex items-center gap-2 px-10 py-2">
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-500" />
                                  <span className="text-xs text-stone-500">Đang tải...</span>
                                </div>
                              ) : chiBaoList.length === 0 ? (
                                <p className="text-xs text-stone-400 px-10 py-2">Không có chỉ báo</p>
                              ) : (
                                chiBaoList.map((cb) => {
                                  const selected = isSelected(cb.ma);
                                  return (
                                    <button
                                      key={cb.ma}
                                      onClick={() => toggleChiBao(mien.name, cb)}
                                      className={`w-full px-10 py-2 flex items-start gap-2 text-left transition-colors ${
                                        selected
                                          ? "bg-teal-50 dark:bg-teal-900/20"
                                          : "hover:bg-stone-50 dark:hover:bg-stone-700/20"
                                      }`}
                                    >
                                      <div className={`w-4 h-4 mt-0.5 rounded border flex-shrink-0 flex items-center justify-center ${
                                        selected
                                          ? "bg-teal-500 border-teal-500 text-white"
                                          : "border-stone-300 dark:border-stone-500"
                                      }`}>
                                        {selected && <Check className="w-3 h-3" />}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                                          {cb.ma}
                                        </span>
                                        <span className="text-xs text-stone-600 dark:text-stone-300 ml-1.5">
                                          {cb.noi_dung}
                                        </span>
                                      </div>
                                    </button>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NLSConfigSection;
