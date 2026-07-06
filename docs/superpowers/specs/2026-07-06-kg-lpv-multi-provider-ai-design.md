# Thiết kế: Đa nhà cung cấp AI cho KG-LPV (Gemini / OpenAI / DeepSeek)

**Ngày:** 2026-07-06
**Trạng thái:** Đã duyệt hướng thiết kế (chờ review spec)
**Nhánh:** feat/kg-lpv-module

## 1. Mục tiêu

Cho phép 4 feature LLM của KG-LPV (Tách đoạn, Phản biện N2, Phán xử N3, Sửa KHBD) chạy trên **nhiều nhà cung cấp AI** — Gemini, OpenAI, DeepSeek — thay vì khóa cứng Gemini. Admin **chọn provider + model riêng cho từng feature** và **nhập/quản lý API key từng provider** ngay trên trang quản trị AI hiện có.

Không đụng tới các feature AI khác của app (soạn KHBD, sơ đồ tư duy, sửa từng phần, phân tích nhận xét, trích xuất code) — chúng vẫn dùng Gemini như hiện tại.

## 2. Quyết định đã chốt (brainstorming)

| # | Quyết định |
|---|---|
| Phạm vi | Chỉ 4 feature KG-LPV: `kg_lpv_segmentation`, `kg_lpv_n2_critic`, `kg_lpv_n3_judge`, `kg_lpv_repair` |
| Mức tùy chỉnh | **Riêng từng feature**: mỗi feature chọn provider + model độc lập (giữ ý đồ N3 dùng model mạnh) |
| API key | **Lưu DB, ẩn**: 1 key/provider, ô nhập write-only, UI chỉ hiện `····last4` + trạng thái "đã cấu hình" |
| Providers | `gemini` (google-generativeai), `openai` + `deepseek` (đều dùng SDK `openai`, khác `base_url`) |
| Model list | Dropdown curated theo provider (không nhập tự do) |
| base_url | DeepSeek cố định `https://api.deepseek.com`; OpenAI để trống (mặc định SDK) |
| Bảo mật | Key plaintext at-rest trong DB; API không bao giờ trả key đầy đủ (chỉ last4). Mã hóa at-rest = follow-up tùy chọn |

## 3. Kiến trúc

```
Admin page (AdminAIModelsPage)
  ├─ Section "Khóa API": Gemini/OpenAI/DeepSeek → PUT /admin/ai-providers/{provider}
  └─ Dòng feature KG-LPV: [provider ▼][model ▼] → PUT /admin/ai-model-settings
        │
        ▼ (DB)
  admin_ai_model_settings(feature_key, provider, model_name)
  ai_provider_credentials(provider, api_key, base_url)
        │
        ▼ (khi verify/repair)
  kg_lpv/llm.generate_json(db, feature_key, prompt)
     ├─ (provider, model) = get_effective_provider_model(db, feature_key)
     ├─ (api_key, base_url) = get_provider_credentials(db, provider)
     └─ dispatch:
          gemini  → google-generativeai (response_mime_type=json)
          openai  → AsyncOpenAI(api_key)         chat.completions + response_format=json_object
          deepseek→ AsyncOpenAI(api_key, base_url=…deepseek.com) (giống openai)
```

## 4. Backend

### 4.1 Dữ liệu (migration `050`, một file)

**Mở rộng `admin_ai_model_settings`** (`app/models/admin_ai_model_setting.py`):
- Thêm cột `provider VARCHAR(20) NOT NULL DEFAULT 'gemini'`.
- Bản ghi giờ là `(feature_key UNIQUE, provider, model_name)`.

**Bảng mới `ai_provider_credentials`** (`app/models/ai_provider_credential.py`):
| Cột | Kiểu |
|---|---|
| `provider` | `VARCHAR(20)` PK (`gemini`/`openai`/`deepseek`) |
| `api_key` | `TEXT NULL` |
| `base_url` | `VARCHAR(255) NULL` |
| `updated_by_admin_id` | `INT FK users.id ON DELETE SET NULL, NULL` |
| `updated_at` | `TIMESTAMPTZ server_default now() onupdate now()` |

Đăng ký cả hai model trong `app/db/base.py` `load_all_models()`.

### 4.2 Registry (`app/services/admin_ai_model_registry.py`)

```python
PROVIDER_GEMINI = "gemini"; PROVIDER_OPENAI = "openai"; PROVIDER_DEEPSEEK = "deepseek"

PROVIDERS: dict[str, dict] = {
  "gemini":   {"label": "Google Gemini", "models": ALLOWED_GEMINI_MODELS, "base_url": None},
  "openai":   {"label": "OpenAI", "models": ("gpt-4o","gpt-4o-mini","gpt-4.1","gpt-4.1-mini"), "base_url": None},
  "deepseek": {"label": "DeepSeek", "models": ("deepseek-chat","deepseek-reasoner"), "base_url": "https://api.deepseek.com"},
}

# Chỉ các feature này được đổi provider; còn lại khóa Gemini.
MULTI_PROVIDER_FEATURES = {FEATURE_KG_LPV_SEGMENTATION, FEATURE_KG_LPV_N2_CRITIC, FEATURE_KG_LPV_N3_JUDGE, FEATURE_KG_LPV_REPAIR}
```

Hàm:
- `provider_allows_model(provider, model) -> bool` (model ∈ PROVIDERS[provider]["models"], có normalize alias cho gemini).
- `get_effective_provider_model(db, feature_key) -> tuple[str, str]`: đọc row `admin_ai_model_settings`; nếu provider+model hợp lệ → dùng; nếu không → `(gemini, _resolve_default_model(feature_key))`. Feature không thuộc `MULTI_PROVIDER_FEATURES` luôn trả `gemini`.
- `get_provider_credentials(db, provider) -> tuple[str|None, str|None]`: đọc `ai_provider_credentials`; nếu `api_key` trống → fallback env (`GEMINI_API_KEY` / `OPENAI_API_KEY` / `DEEPSEEK_API_KEY`); `base_url` = row.base_url hoặc PROVIDERS[provider]["base_url"].
- `set_provider_credential(db, provider, api_key, base_url, admin_id)`: upsert (nếu `api_key` None → giữ key cũ, chỉ cập nhật base_url).
- `get_all_provider_status(db) -> list[dict]`: `[{provider, label, configured: bool, key_last4: str|None, base_url}]` — **không trả key đầy đủ**.
- `get_all_effective_model_settings(db)`: bổ sung `provider` + `available_providers` (chỉ KG-LPV) + `models_by_provider` cho mỗi feature.
- `upsert_model_settings(db, updates, admin_id)`: `updates` giờ là `{feature_key: {provider, model_name}}`; validate feature hỗ trợ provider (feature ngoài KG-LPV chỉ chấp nhận `gemini`) + model hợp lệ theo provider.

### 4.3 Lớp gọi LLM (`app/modules/kg_lpv/llm.py`)

Giữ nguyên chữ ký `async def generate_json(db, feature_key, prompt, *, timeout=300) -> tuple[dict, int]` và toàn bộ sanitize/parse/retry/`LlmJsonError`. Thay phần "gọi model" bằng dispatch:

```python
provider, model = await get_effective_provider_model(db, feature_key)
api_key, base_url = await get_provider_credentials(db, provider)
if not api_key:
    raise RuntimeError(f"Thiếu API key cho nhà cung cấp: {provider}")

if provider == "gemini":
    # đường cũ: genai.GenerativeModel(model, response_mime_type=json) → total_token_count
else:
    # openai/deepseek: AsyncOpenAI(api_key=api_key, base_url=base_url)
    #   chat.completions.create(model, messages=[{"role":"user","content":prompt}],
    #     temperature=0.2, response_format={"type":"json_object"})
    #   raw = resp.choices[0].message.content; tokens = resp.usage.total_tokens
```

Chạy call ngoài event loop qua `asyncio.wait_for(asyncio.to_thread(...))` (gemini) / `await` client async (openai). Giữ retry 1 lần khi JSON hỏng.

Thêm `openai>=1.0` vào `init/backend/requirements.txt`.

### 4.4 API admin (`app/api/routes/admin.py` + `app/schemas/admin.py`)

- **Sửa `GET /admin/ai-model-settings`** (`AIModelSettingsRead`): mỗi phần tử `settings[]` thêm `provider: str`, `available_providers: list[{value,label}]` (rỗng/1 phần tử cho feature non-KG-LPV), `models_by_provider: dict[str, list[str]]`.
- **Sửa `PUT /admin/ai-model-settings`** (`AIModelSettingsUpdate`): mỗi item `{feature_key, provider, model_name}`.
- **Mới `GET /admin/ai-providers`** (admin-only): `[{provider, label, configured, key_last4, base_url}]`.
- **Mới `PUT /admin/ai-providers/{provider}`** (admin-only): body `{api_key?: str, base_url?: str}` — `api_key` bỏ trống = giữ nguyên; ghi `ai_provider_credentials`; audit log; trả về status đã masked. Validate `provider` ∈ PROVIDERS.

Tất cả sau `require_admin`.

### 4.5 Điểm gọi hiện có

`get_effective_model_for_feature` đang được `llm.py` và `lesson_builder.py`/`lesson_plan_edit_service.py` dùng. Giữ hàm cũ (trả model gemini) cho các nơi non-KG-LPV; KG-LPV chuyển sang `get_effective_provider_model`. Không đổi hành vi các feature ngoài KG-LPV.

## 5. Frontend (`app/pages/admin/AdminAIModelsPage.tsx` + `services/adminService.ts` + types)

### 5.1 Section "Khóa API nhà cung cấp AI" (mới)
3 thẻ (Gemini / OpenAI / DeepSeek), mỗi thẻ:
- Trạng thái: `Đã cấu hình ····ab12` (xanh) hoặc `Chưa cấu hình` (xám) từ `GET /admin/ai-providers`.
- Ô nhập key **write-only** (placeholder "Nhập key mới để thay", bỏ trống = giữ nguyên).
- DeepSeek: ô `base_url` điền sẵn `https://api.deepseek.com` (sửa được). OpenAI: base_url ẩn/tùy chọn.
- Nút "Lưu" → `PUT /admin/ai-providers/{provider}`.

### 5.2 Dòng feature (mở rộng)
Mỗi feature từ `GET /admin/ai-model-settings`:
- Nếu `available_providers.length > 1` (4 feature KG-LPV): thêm **dropdown provider** trước dropdown model; đổi provider → model options = `models_by_provider[provider]` (tự chọn model đầu nếu model cũ không thuộc provider mới).
- Feature khác: giữ nguyên (chỉ dropdown model Gemini).
- Lưu gửi `{feature_key, provider, model_name}`.

### 5.3 Service/type
`adminService.ts`: `getAiProviders()`, `updateAiProvider(provider, {api_key?, base_url?})`; cập nhật `getAIModelSettings`/`updateAIModelSettings` cho trường `provider`. Types tương ứng trong `services`/`types`.

## 6. Xử lý lỗi
- Thiếu key provider được chọn → `generate_json` raise `RuntimeError("Thiếu API key…")` → job KG-LPV `failed` với message rõ (đã có cơ chế try/except ngoài của orchestrator/repairer). Trạng thái này hiển thị "Kiểm chứng thất bại".
- Model/provider không hợp lệ khi lưu → API trả 400 tiếng Việt.
- Provider trả JSON hỏng → giữ retry 1 lần rồi `LlmJsonError` (như hiện tại; N2/N3 đã có cơ chế `unjudged`).

## 7. Kiểm thử

**Backend:**
- `provider_allows_model` đúng/sai theo từng provider; feature non-KG-LPV từ chối provider ≠ gemini.
- `get_effective_provider_model`: có row hợp lệ → dùng; row lỗi/thiếu → fallback gemini default; feature non-KG-LPV luôn gemini.
- `get_provider_credentials`: DB có key → dùng + đúng base_url; DB trống → fallback env.
- `get_all_provider_status`: chỉ trả last4, không lộ key.
- `generate_json` dispatch: mock genai (gemini) và mock `openai.AsyncOpenAI` (openai + deepseek) → trả `(dict, tokens)`; thiếu key → RuntimeError; JSON hỏng → retry rồi LlmJsonError.
- API: `PUT /admin/ai-providers/{provider}` lưu key (write-only, không trả full); `GET` trả masked; `PUT ai-model-settings` với provider hợp lệ/không hợp lệ.

**Frontend (vitest):**
- Đổi provider trên dòng KG-LPV → dropdown model đổi theo `models_by_provider`.
- Thẻ key: hiện trạng thái masked; Lưu gọi `updateAiProvider` với đúng payload; bỏ trống key = không gửi key.

## 8. Ngoài phạm vi (YAGNI)
- Feature ngoài KG-LPV vẫn Gemini-only.
- Không mã hóa at-rest (chỉ ẩn trên UI/API).
- Không key theo từng user (chỉ admin/toàn cục).
- Không thêm provider khác (Anthropic/Ollama…) lần này.
- Không streaming cho KG-LPV.

## 9. Rủi ro
| Rủi ro | Ứng phó |
|---|---|
| SDK `openai` chưa cài trong image | Thêm vào requirements.txt; rebuild backend image |
| Model OpenAI/DeepSeek đổi tên theo thời gian | Danh sách để trong 1 hằng số dễ sửa; provider trả lỗi → job failed rõ ràng |
| response_format json_object không được vài model cũ hỗ trợ | Chỉ đưa model hỗ trợ vào list; nếu lỗi → LlmJsonError/failed rõ |
| Key plaintext trong DB | Không trả qua API; chỉ admin truy cập; ghi rõ đây là giới hạn đã chấp nhận |
