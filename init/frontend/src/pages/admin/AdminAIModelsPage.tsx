import { useEffect, useState } from "react";
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import {
  getAIModelSettings,
  updateAIModelSettings,
  getFeatureFlags,
  setKgLpvEnabled,
  getAiProviders,
  updateAiProvider,
  type AIModelSettings,
  type AiProviderStatus,
  type AiProviderUpdate,
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

  // Khóa API nhà cung cấp AI (OpenAI/Gemini/DeepSeek...)
  const [providers, setProviders] = useState<AiProviderStatus[]>([]);
  const [providerKeyDrafts, setProviderKeyDrafts] = useState<Record<string, string>>({});
  const [providerBaseUrlDrafts, setProviderBaseUrlDrafts] = useState<Record<string, string>>({});
  const [savingProvider, setSavingProvider] = useState<string | null>(null);
  const [providerStatusMsg, setProviderStatusMsg] = useState<string | null>(null);

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

    const loadProviders = async () => {
      try {
        const list = await getAiProviders();
        setProviders(list);
      } catch {
        // Danh sách nhà cung cấp AI không tải được không nên chặn toàn trang
      }
    };
    loadProviders();
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

  const saveFeatureSetting = async (featureKey: string, provider: string, modelName: string) => {
    if (!aiModelSettings) return;

    const previousSettings = aiModelSettings;
    const nextSettings: AIModelSettings = {
      ...aiModelSettings,
      settings: aiModelSettings.settings.map((item) =>
        item.feature_key === featureKey ? { ...item, provider, model_name: modelName } : item
      ),
    };

    setAiModelSettings(nextSettings);
    setSavingFeatureKey(featureKey);
    setAiSettingsStatus(null);

    try {
      const payload = nextSettings.settings.map((item) => ({
        feature_key: item.feature_key,
        provider: item.provider,
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

  const onChangeFeatureModel = (featureKey: string, modelName: string) => {
    if (!aiModelSettings || savingFeatureKey) return;
    const current = aiModelSettings.settings.find((item) => item.feature_key === featureKey);
    if (!current || current.model_name === modelName) return;
    void saveFeatureSetting(featureKey, current.provider, modelName);
  };

  const onChangeFeatureProvider = (featureKey: string, newProvider: string) => {
    if (!aiModelSettings || savingFeatureKey) return;
    const current = aiModelSettings.settings.find((item) => item.feature_key === featureKey);
    if (!current || current.provider === newProvider) return;

    const modelsForProvider = current.models_by_provider[newProvider] || [];
    const nextModel = modelsForProvider.includes(current.model_name)
      ? current.model_name
      : modelsForProvider[0] ?? current.model_name;

    void saveFeatureSetting(featureKey, newProvider, nextModel);
  };

  const handleProviderKeyChange = (provider: string, value: string) => {
    setProviderKeyDrafts((prev) => ({ ...prev, [provider]: value }));
  };

  const handleProviderBaseUrlChange = (provider: string, value: string) => {
    setProviderBaseUrlDrafts((prev) => ({ ...prev, [provider]: value }));
  };

  const handleSaveProvider = async (provider: string) => {
    if (savingProvider) return;
    setSavingProvider(provider);
    setProviderStatusMsg(null);

    const current = providers.find((p) => p.provider === provider);
    const keyDraft = providerKeyDrafts[provider] || "";
    const body: AiProviderUpdate = { api_key: keyDraft || undefined };
    if (provider === "openai" || provider === "deepseek") {
      body.base_url = providerBaseUrlDrafts[provider] ?? current?.base_url ?? "";
    }

    try {
      const updated = await updateAiProvider(provider, body);
      setProviders((prev) => prev.map((p) => (p.provider === provider ? updated : p)));
      setProviderKeyDrafts((prev) => ({ ...prev, [provider]: "" }));
      setProviderStatusMsg("Đã lưu cấu hình nhà cung cấp AI.");
    } catch (err: any) {
      setProviderStatusMsg(err.response?.data?.detail || "Không thể lưu cấu hình nhà cung cấp AI.");
    } finally {
      setSavingProvider(null);
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
            {aiModelSettings.settings.map((item) => {
              const modelOptions = item.models_by_provider[item.provider] ?? aiModelSettings.allowed_models;
              return (
                <div
                  key={item.feature_key}
                  className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-center rounded-lg border border-slate-200 dark:border-slate-700 p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{item.feature_label}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {item.available_providers.length > 1 && (
                      <select
                        aria-label={`Nhà cung cấp cho ${item.feature_label}`}
                        value={item.provider}
                        onChange={(e) => onChangeFeatureProvider(item.feature_key, e.target.value)}
                        disabled={Boolean(savingFeatureKey)}
                        className="w-full sm:w-[160px] rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-200"
                      >
                        {item.available_providers.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    )}
                    <select
                      aria-label={`Model cho ${item.feature_label}`}
                      value={item.model_name}
                      onChange={(e) => onChangeFeatureModel(item.feature_key, e.target.value)}
                      disabled={Boolean(savingFeatureKey)}
                      className="w-full sm:w-[220px] rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-200"
                    >
                      {modelOptions.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  </div>
                  {savingFeatureKey === item.feature_key && (
                    <p className="text-[11px] text-sky-600 mt-1">Đang lưu...</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {aiSettingsStatus && (
          <p className="mt-3 text-xs text-slate-600 dark:text-slate-300">{aiSettingsStatus}</p>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">
          Khóa API nhà cung cấp AI
        </h2>

        {providers.length === 0 ? (
          <p className="text-sm text-slate-500">Không tải được danh sách nhà cung cấp AI.</p>
        ) : (
          <div className="space-y-3">
            {providers.map((p) => {
              const showsBaseUrl = p.provider === "openai" || p.provider === "deepseek";
              return (
                <div
                  key={p.provider}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 space-y-2"
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{p.label}</p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        p.configured
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {p.configured ? `Đã cấu hình ····${p.key_last4 ?? ""}` : "Chưa cấu hình"}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="password"
                      aria-label={`Khóa API cho ${p.label}`}
                      value={providerKeyDrafts[p.provider] ?? ""}
                      onChange={(e) => handleProviderKeyChange(p.provider, e.target.value)}
                      placeholder="Nhập key mới để thay, bỏ trống = giữ nguyên"
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-200"
                    />
                    {showsBaseUrl && (
                      <input
                        type="text"
                        aria-label={`Base URL cho ${p.label}`}
                        value={providerBaseUrlDrafts[p.provider] ?? p.base_url ?? ""}
                        onChange={(e) => handleProviderBaseUrlChange(p.provider, e.target.value)}
                        placeholder="Base URL"
                        className="w-full sm:w-[260px] rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-200"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => void handleSaveProvider(p.provider)}
                      disabled={savingProvider === p.provider}
                      className="rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-60 px-4 py-2 text-sm font-medium text-white flex-shrink-0"
                    >
                      {savingProvider === p.provider ? "Đang lưu..." : "Lưu"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {providerStatusMsg && (
          <p className="mt-3 text-xs text-slate-600 dark:text-slate-300">{providerStatusMsg}</p>
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
