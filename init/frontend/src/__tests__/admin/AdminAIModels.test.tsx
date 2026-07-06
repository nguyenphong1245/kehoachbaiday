import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/services/adminService", () => ({
  getAIModelSettings: vi.fn(),
  updateAIModelSettings: vi.fn(),
  getFeatureFlags: vi.fn(),
  setKgLpvEnabled: vi.fn(),
  getAiProviders: vi.fn(),
  updateAiProvider: vi.fn(),
}));

vi.mock("@/services/kgLpvApi", () => ({
  getStatus: vi.fn(),
}));

import {
  getAIModelSettings,
  updateAIModelSettings,
  getFeatureFlags,
  getAiProviders,
  updateAiProvider,
  type AIModelSettings,
  type AiProviderStatus,
} from "@/services/adminService";
import { getStatus } from "@/services/kgLpvApi";
import AdminAIModelsPage from "@/pages/admin/AdminAIModelsPage";

const mockedGetAIModelSettings = vi.mocked(getAIModelSettings);
const mockedUpdateAIModelSettings = vi.mocked(updateAIModelSettings);
const mockedGetFeatureFlags = vi.mocked(getFeatureFlags);
const mockedGetAiProviders = vi.mocked(getAiProviders);
const mockedUpdateAiProvider = vi.mocked(updateAiProvider);
const mockedGetStatus = vi.mocked(getStatus);

const modelsByProvider = {
  gemini: ["gemini-2.5-flash", "gemini-2.5-pro"],
  openai: ["gpt-4o-mini", "gpt-4o"],
  deepseek: ["deepseek-chat"],
};

const makeModelSettings = (): AIModelSettings => ({
  allowed_models: ["gemini-2.5-flash", "gemini-2.5-pro"],
  settings: [
    {
      feature_key: "kg_lpv_n3_judge",
      feature_label: "KG-LPV: Phán xử N3",
      description: "",
      provider: "gemini",
      model_name: "gemini-2.5-flash",
      available_providers: [
        { value: "gemini", label: "Gemini" },
        { value: "openai", label: "OpenAI" },
        { value: "deepseek", label: "DeepSeek" },
      ],
      models_by_provider: modelsByProvider,
    },
    {
      feature_key: "quiz_gen",
      feature_label: "Tạo trắc nghiệm",
      description: "",
      provider: "gemini",
      model_name: "gemini-2.5-flash",
      available_providers: [{ value: "gemini", label: "Gemini" }],
      models_by_provider: { gemini: modelsByProvider.gemini },
    },
  ],
});

const makeProviders = (): AiProviderStatus[] => [
  {
    provider: "gemini",
    label: "Gemini",
    configured: true,
    key_last4: "1234",
    base_url: null,
    models: modelsByProvider.gemini,
  },
  {
    provider: "openai",
    label: "OpenAI",
    configured: true,
    key_last4: "7788",
    base_url: null,
    models: modelsByProvider.openai,
  },
  {
    provider: "deepseek",
    label: "DeepSeek",
    configured: false,
    key_last4: null,
    base_url: null,
    models: modelsByProvider.deepseek,
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  mockedGetAIModelSettings.mockResolvedValue(makeModelSettings());
  mockedGetFeatureFlags.mockResolvedValue([]);
  mockedGetAiProviders.mockResolvedValue(makeProviders());
  mockedGetStatus.mockResolvedValue({
    enabled: false,
    availability: "disabled",
    graph: { connected: false },
    version: "1.0",
  } as any);
});

describe("AdminAIModelsPage", () => {
  it("shows 'Đã cấu hình ····7788' for the configured OpenAI provider card and saves a new key", async () => {
    const user = userEvent.setup();
    mockedUpdateAiProvider.mockResolvedValue({
      provider: "openai",
      label: "OpenAI",
      configured: true,
      key_last4: "9999",
      base_url: null,
      models: modelsByProvider.openai,
    });

    render(<AdminAIModelsPage />);

    await waitFor(() => expect(screen.getByText(/Đã cấu hình ····7788/)).toBeInTheDocument());

    const keyInput = screen.getByLabelText("Khóa API cho OpenAI");
    await user.type(keyInput, "sk-new-key");

    const openaiCard = keyInput.closest("div.space-y-2") as HTMLElement;
    const saveButton = within(openaiCard).getByRole("button", { name: "Lưu" });
    fireEvent.click(saveButton);

    await waitFor(() =>
      expect(mockedUpdateAiProvider).toHaveBeenCalledWith(
        "openai",
        expect.objectContaining({ api_key: "sk-new-key" })
      )
    );
  });

  it("switches the model options to models_by_provider.openai when the feature's provider select changes to openai", async () => {
    mockedUpdateAIModelSettings.mockResolvedValue(makeModelSettings());

    render(<AdminAIModelsPage />);

    await waitFor(() => expect(screen.getByText("KG-LPV: Phán xử N3")).toBeInTheDocument());

    const providerSelect = screen.getByLabelText(
      "Nhà cung cấp cho KG-LPV: Phán xử N3"
    ) as HTMLSelectElement;
    const modelSelect = screen.getByLabelText(
      "Model cho KG-LPV: Phán xử N3"
    ) as HTMLSelectElement;

    // Trước khi đổi: options là của gemini
    expect(Array.from(modelSelect.options).map((o) => o.value)).toEqual(modelsByProvider.gemini);

    fireEvent.change(providerSelect, { target: { value: "openai" } });

    await waitFor(() =>
      expect(Array.from(modelSelect.options).map((o) => o.value)).toEqual(modelsByProvider.openai)
    );
  });
});
