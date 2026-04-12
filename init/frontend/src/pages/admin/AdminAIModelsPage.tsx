import { useEffect, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  getAIModelSettings,
  updateAIModelSettings,
  type AIModelSettings,
} from "@/services/adminService";
import { usePageTitle } from "@/hooks/usePageTitle";

const AdminAIModelsPage = () => {
  usePageTitle("Cấu hình AI");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiModelSettings, setAiModelSettings] = useState<AIModelSettings | null>(null);
  const [savingFeatureKey, setSavingFeatureKey] = useState<string | null>(null);
  const [aiSettingsStatus, setAiSettingsStatus] = useState<string | null>(null);

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
  }, []);

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
    </section>
  );
};

export default AdminAIModelsPage;
