import { useEffect, useState } from "react";
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import {
  getAIModelSettings,
  updateAIModelSettings,
  getFeatureFlags,
  setKgLpvEnabled,
  type AIModelSettings,
} from "@/services/adminService";
import { getStatus as getKgLpvStatus } from "@/services/kgLpvApi";
import type { KgLpvAvailability } from "@/types/kgLpv";
import { usePageTitle } from "@/hooks/usePageTitle";

const AVAILABILITY_LABELS: Record<KgLpvAvailability, string> = {
  ok: "Sẵn sàng",
  degraded: "Đồ thị tri thức chưa kết nối được",
  disabled: "Đang tắt",
};

const AdminAIModelsPage = () => {
  usePageTitle("Cấu hình AI");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiModelSettings, setAiModelSettings] = useState<AIModelSettings | null>(null);
  const [savingFeatureKey, setSavingFeatureKey] = useState<string | null>(null);
  const [aiSettingsStatus, setAiSettingsStatus] = useState<string | null>(null);

  // KG-LPV: công tắc bật/tắt runtime + trạng thái đồ thị
  const [kgLpvEnabled, setKgLpvEnabledState] = useState(false);
  const [kgLpvAvailability, setKgLpvAvailability] = useState<KgLpvAvailability>("disabled");
  const [kgLpvSaving, setKgLpvSaving] = useState(false);
  const [kgLpvError, setKgLpvError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const modelSettings = await getAIModelSettings();
        setAiModelSettings(modelSettings);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Lỗi khi tải cấu hình model AI");
      } finally {
        setLoading(false);
      }
    };
    load();

    const loadKgLpv = async () => {
      try {
        const [flags, status] = await Promise.all([getFeatureFlags(), getKgLpvStatus()]);
        const flag = flags.find((f) => f.key === "kg_lpv");
        setKgLpvEnabledState(Boolean(flag?.enabled));
        setKgLpvAvailability(status.availability);
      } catch {
        // Module có thể tắt ở tầng env — không coi là lỗi trang
      }
    };
    loadKgLpv();
  }, []);

  const handleToggleKgLpv = async () => {
    if (kgLpvSaving) return;
    const next = !kgLpvEnabled;
    setKgLpvSaving(true);
    setKgLpvError(null);
    try {
      await setKgLpvEnabled(next);
      setKgLpvEnabledState(next);
      const status = await getKgLpvStatus();
      setKgLpvAvailability(status.availability);
    } catch (err: any) {
      setKgLpvError(err.response?.data?.detail || "Không thể cập nhật cờ tính năng KG-LPV");
    } finally {
      setKgLpvSaving(false);
    }
  };

  const onChangeFeatureModel = async (featureKey: string, modelName: string) => {
    if (!aiModelSettings || savingFeatureKey) return;

    const current = aiModelSettings.settings.find((item) => item.feature_key === featureKey);
    if (!current || current.model_name === modelName) return;

    const previousSettings = aiModelSettings;
    const nextSettings: AIModelSettings = {
      ...aiModelSettings,
      settings: aiModelSettings.settings.map((item) =>
        item.feature_key === featureKey ? { ...item, model_name: modelName } : item
      ),
    };

    setAiModelSettings(nextSettings);
    setSavingFeatureKey(featureKey);
    setAiSettingsStatus(null);

    try {
      const payload = nextSettings.settings.map((item) => ({
        feature_key: item.feature_key,
        model_name: item.model_name,
      }));

      const updated = await updateAIModelSettings(payload);
      setAiModelSettings(updated);
      setAiSettingsStatus("Đã tự động lưu cấu hình.");
    } catch (err: any) {
      setAiModelSettings(previousSettings);
      setAiSettingsStatus(err.response?.data?.detail || "Không thể lưu cấu hình model AI.");
    } finally {
      setSavingFeatureKey(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20 text-red-500 gap-2">
        <AlertCircle className="w-5 h-5" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <section className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">Cấu hình AI</h1>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5">
        {!aiModelSettings ? (
          <p className="text-sm text-slate-500">Không tải được cấu hình model AI.</p>
        ) : (
          <div className="space-y-3">
            {aiModelSettings.settings.map((item) => (
              <div
                key={item.feature_key}
                className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-3 items-center rounded-lg border border-slate-200 dark:border-slate-700 p-3"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{item.feature_label}</p>
                </div>
                <select
                  value={item.model_name}
                  onChange={(e) => void onChangeFeatureModel(item.feature_key, e.target.value)}
                  disabled={Boolean(savingFeatureKey)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-200"
                >
                  {aiModelSettings.allowed_models.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
                {savingFeatureKey === item.feature_key && (
                  <p className="text-[11px] text-sky-600 mt-1">Đang lưu...</p>
                )}
              </div>
            ))}
          </div>
        )}

        {aiSettingsStatus && (
          <p className="mt-3 text-xs text-slate-600 dark:text-slate-300">{aiSettingsStatus}</p>
        )}
      </div>

      {/* KG-LPV: Kiểm chứng KHBD — công tắc bật/tắt runtime + trạng thái đồ thị */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                Kiểm chứng KHBD (KG-LPV)
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Đồ thị tri thức: {AVAILABILITY_LABELS[kgLpvAvailability]}
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={kgLpvEnabled}
            onClick={handleToggleKgLpv}
            disabled={kgLpvSaving}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors disabled:opacity-60 ${
              kgLpvEnabled ? "bg-sky-600" : "bg-slate-300 dark:bg-slate-600"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                kgLpvEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {kgLpvError && (
          <p className="mt-3 text-xs text-red-500">{kgLpvError}</p>
        )}
      </div>
    </section>
  );
};

export default AdminAIModelsPage;
