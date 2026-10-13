# Đặc Tả Kỹ Thuật Chi Tiết: FEAT-AI-01
## Cấu Hình AI, Hạn Mức Dùng Thử 10 Lượt/Tháng & Quản Lý Khóa Riêng (BYOK)

- **Mã tính năng:** `FEAT-AI-01`
- **Phân hệ:** AI Module (Cấu hình & Quản trị khóa bảo mật)
- **Trạng thái:** `01.draft` (Chờ người dùng review)
- **Độ ưu tiên:** `P1 (Critical - Cốt lõi của Module AI)`

---

### 1. Mục Tiêu (User Story)

Là người dùng mới hoặc người dùng chưa quen tự tạo API key, tôi muốn có sẵn 10 lượt gọi AI dùng thử mỗi tháng để trải nghiệm các tính năng hỗ trợ công việc thông minh; và khi muốn tiếp tục sử dụng lâu dài hoặc không giới hạn, tôi có thể tự cung cấp API Key riêng của mình (BYOK - Bring Your Own Key) từ Google Gemini hoặc OpenAI mà không cần mua bất kỳ gói tài khoản trả phí hay thanh toán định kỳ nào cho hệ thống.

---

### 2. Luồng Nghiệp Vụ & Sơ Đồ Xử Lý (Business Flow Diagram)

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│               SƠ ĐỒ CẤU HÌNH AI, KIỂM TRA KHÓA & BẢO MẬT AES-GCM (BYOK)                │
└────────────────────────────────────────────────────────────────────────────────────────┘

  [ NGƯỜI DÙNG ]
        │
        │ (1) Mở Cài đặt > Tab AI: Nhập API Key (Gemini/OpenAI)
        ▼
  ┌────────────────────────────────────────────────────────┐
  │         Client UI: SettingsPage / Tab AI               │
  │ • Hiển thị lượt thử còn lại: 4 / 10 lượt tháng này     │
  │ • Bấm nút "Kiểm tra key" trước khi lưu                 │
  └──────────────────────────┬─────────────────────────────┘
                             │ (2) POST /api/v1/users/me/ai-settings/test { provider, apiKey }
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │            Backend: AiSettingsController               │
  └──────────────────────────┬─────────────────────────────┘
                             │ (3) Gọi aiProviderClient.validateKey(key)
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │         Gửi ping nhẹ tới Gemini / OpenAI API           │
  └──────────┬─────────────────────────────────────────────┘
             │
             ├─► [KHÓA SAI HOẶC BỊ KHÓA]:
             │   • Trả về HTTP 400: "Khóa API không hợp lệ hoặc đã bị vô hiệu hóa"
             │   • Client hiển thị lỗi đỏ, không cho phép lưu
             │
             └─► [KẾT NỐI THÀNH CÔNG]:
                 │ (4) Người dùng bấm "Lưu cấu hình AI"
                 │ (5) PUT /api/v1/users/me/ai-settings { provider, apiKey }
                 ▼
         ┌─────────────────────────────────────────────────────────┐
         │              MÃ HÓA ĐỐI XỨNG AES-GCM 256-BIT            │
         │ • Sinh IV ngẫu nhiên (12 bytes)                         │
         │ • Mã hóa apiKey bằng SECRET_KEY trong biến môi trường   │
         │ • Ghép Base64(IV + CipherText + AuthTag)                │
         └──────────────────────────┬──────────────────────────────┘
                                    │ (6) Lưu vào cột ai_api_key_encrypted
                                    ▼
         ┌─────────────────────────────────────────────────────────┐
         │            Database: MySQL 8.4 (users)                  │
         │ • ai_enabled = TRUE                                     │
         │ • ai_provider = 'gemini' | 'openai'                     │
         └─────────────────────────────────────────────────────────┘

  ──────────────────────────────────────────────────────────────────

  [ CRONJOB RESET LƯỢT DÙNG THỬ VÀO ĐẦU THÁNG ]:
  00:00 ngày 01 hàng tháng: UPDATE users SET ai_trial_count = 0, ai_trial_reset_at = NOW();
```

#### 2.1. Kiểm Soát Chi Phí & Tùy Chọn Kích Hoạt (Opt-in)
- Mặc định tính năng AI ở trạng thái **TẮT** trên toàn hệ thống (`users.ai_enabled = FALSE`) và từng dự án (`projects.is_ai_enabled = FALSE`). Hệ thống không phát sinh chi phí vận hành AI lớn và người dùng toàn quyền kiểm soát dữ liệu của mình.
- **Quy tắc 3 điều kiện để AI hoạt động:**
  1. Công tắc AI trong Cài đặt đang bật (`users.ai_enabled = TRUE`).
  2. Công tắc AI của dự án/danh mục đang bật (`projects.is_ai_enabled = TRUE`).
  3. Người dùng đã cấu hình API key riêng hợp lệ **HOẶC** còn lượt dùng thử trong tháng (`users.ai_trial_count < users.ai_trial_limit`).
  - Nếu thiếu bất kỳ điều kiện nào, các nút AI trong giao diện chuyển sang trạng thái mờ (disabled) kèm tooltip chỉ dẫn vào `Cài đặt > AI`.

#### 2.2. Hạn Mức Dùng Thử 10 Lượt/Tháng Cho Người Chưa Quen Lấy Key
- Hệ thống bãi bỏ hoàn toàn các gói cước Freemium/Premium, không có thanh toán.
- Mỗi tài khoản được cấp sẵn **10 lượt gọi AI dùng thử/tháng** (`ai_trial_limit = 10`).
- Khi người dùng chưa nhập key riêng: Mỗi lần trích xuất NLP task hoặc sinh Test Cases thành công sẽ tăng `ai_trial_count += 1`.
- Khi đã dùng hết 10 lượt: Nút AI bị vô hiệu hóa kèm thông báo: *"Đã hết 10 lượt thử tháng này. Vui lòng nhập API Key riêng tại Cài đặt > AI để tiếp tục sử dụng không giới hạn."*
- **Làm mới định kỳ (Scheduled Job):** Vào lúc 00:00 ngày 1 hàng tháng (Cron `0 0 0 1 * ?`), hệ thống tự động reset `ai_trial_count = 0` cho toàn bộ tài khoản.

#### 2.3. Cơ Chế BYOK Không Giới Hạn & Bảo Mật Khóa (AES-GCM)
- Người dùng có thể nhập API Key riêng (Google Gemini, OpenAI) bất kỳ lúc nào.
- Khi đã có key riêng hợp lệ, hệ thống ưu tiên gọi bằng key của người dùng và **không bị giới hạn 10 lượt/tháng**.
- **Mã hóa AES-GCM:** 
  - Khóa API được mã hóa bằng thuật toán đối xứng AES-256-GCM (Galois/Counter Mode) trước khi lưu DB.
  - Master Key giải mã được lưu tách biệt trong biến môi trường server `AI_ENCRYPTION_MASTER_KEY`.
  - Khóa tuyệt đối không bao giờ được trả về nguyên văn qua API (chỉ hiển thị 4 ký tự cuối dạng `••••••••1234`).
  - Không ghi log khóa API cũng như nội dung prompt người dùng gửi cho AI.

---

### 3. Thiết Kế Cơ Sở Dữ Liệu & Flyway Migration

Tính năng sử dụng các cột đã được thiết kế sẵn trong bảng `users`:
```sql
-- Cấu trúc các cột quản lý AI trong users (V1)
-- ai_enabled BOOLEAN NOT NULL DEFAULT FALSE,
-- ai_trial_count INT NOT NULL DEFAULT 0,
-- ai_trial_limit INT NOT NULL DEFAULT 10,
-- ai_trial_reset_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
-- ai_provider VARCHAR(30) NULL,
-- ai_api_key_encrypted VARCHAR(500) NULL
```

---

### 4. Chi Tiết API Contract

#### 4.1. `GET /api/v1/users/me/ai-settings` - Lấy Cấu Hình AI & Lượt Thử Còn Lại
- **Headers:** `Authorization: Bearer <access_token>`
- **Response Success (HTTP 200 OK):**
```json
{
  "success": true,
  "code": 200,
  "errorCode": null,
  "message": "Lấy cấu hình AI thành công",
  "data": {
    "aiEnabled": true,
    "provider": "gemini",
    "apiKeyMasked": "••••••••1234",
    "hasCustomKey": true,
    "trialCount": 4,
    "trialLimit": 10,
    "trialRemaining": 6,
    "trialResetAt": "2026-11-01T00:00:00.000Z"
  },
  "errors": null,
  "timestamp": "2026-10-12T15:40:00.000Z"
}
```

#### 4.2. `POST /api/v1/users/me/ai-settings/test` - Kiểm Tra Tính Hợp Lệ Của Khóa API
- **Headers:** `Authorization: Bearer <access_token>`
- **Request Body:**
```json
{
  "provider": "gemini",
  "apiKey": "AIzaSyD-your-api-key-here"
}
```
- **Response Success (HTTP 200 OK):**
```json
{
  "success": true,
  "code": 200,
  "errorCode": null,
  "message": "Kết nối thành công! Khóa API hợp lệ.",
  "data": {
    "isValid": true
  },
  "errors": null,
  "timestamp": "2026-10-12T15:41:00.000Z"
}
```
- **Response Error (HTTP 400 Bad Request - Khóa sai/hết quota provider):**
```json
{
  "success": false,
  "code": 400,
  "errorCode": "AI_KEY_INVALID",
  "message": "Không thể xác thực khóa API với nhà cung cấp Google Gemini. Vui lòng kiểm tra lại khóa.",
  "data": {
    "isValid": false
  },
  "errors": null,
  "timestamp": "2026-10-12T15:41:05.000Z"
}
```

#### 4.3. `PUT /api/v1/users/me/ai-settings` - Cập Nhật Cấu Hình AI
- **Headers:** `Authorization: Bearer <access_token>`
- **Request Body:**
```json
{
  "aiEnabled": true,
  "provider": "gemini",
  "apiKey": "AIzaSyD-your-api-key-here"
}
```
- **Response Success (HTTP 200 OK):**
```json
{
  "success": true,
  "code": 200,
  "errorCode": null,
  "message": "Lưu cấu hình AI thành công",
  "data": {
    "aiEnabled": true,
    "provider": "gemini",
    "apiKeyMasked": "••••••••here",
    "hasCustomKey": true
  },
  "errors": null,
  "timestamp": "2026-10-12T15:42:00.000Z"
}
```

---

### 5. Cấu Trúc Mã Nguồn Backend (`dylask-backend`)

Mã nguồn tổ chức tại module `com.dylask.modules.ai`:

```
com.dylask.modules.ai/
├── controller/
│   └── AiSettingsController.java            # API /api/v1/users/me/ai-settings/**
├── service/
│   ├── AiSettingsService.java               # Interface nghiệp vụ cấu hình AI
│   ├── impl/AiSettingsServiceImpl.java      # Lưu trữ, validate 3 điều kiện
│   └── AiTrialResetScheduler.java           # Cronjob reset 10 lượt thử vào ngày 1 hàng tháng
├── security/
│   └── AesGcmEncryptionService.java         # Thuật toán mã hóa đối xứng AES-GCM 256-bit
├── client/
│   ├── AiModelClient.java                   # Interface giao tiếp nhà cung cấp
│   ├── GeminiModelClient.java               # Gọi Google Gemini REST API
│   └── OpenAiModelClient.java               # Gọi OpenAI REST API
└── dto/
    ├── request/
    │   ├── UpdateAiSettingsRequestDTO.java  # Record: aiEnabled, provider, apiKey
    │   └── TestApiKeyRequestDTO.java        # Record: provider, apiKey
    └── response/
        └── AiSettingsResponseDTO.java       # Record: aiEnabled, provider, maskedKey, trialStats
```

---

### 6. Cấu Trúc Mã Nguồn Frontend (`dylask-frontend`)

1. **Giao diện tham chiếu:** `docs/layout-html/settings/layout.html` (Tab AI: công tắc bật/tắt, thẻ hiển thị 4/10 lượt thử, ô nhập API key có nút Hiện/Ẩn và nút Kiểm tra key).
2. **Cấu trúc Component:**
   - `src/components/settings/AiSettingsTab.tsx`: Form cấu hình AI trong trang Cài đặt.
   - `src/components/common/AiBadgeIndicator.tsx`: Badge nhỏ hiển thị trạng thái `4/10 lượt thử` hoặc `BYOK active`.
3. **Custom Hook `useAiSettings`:**
   - Quản lý trạng thái form, gọi API test key và lưu cấu hình.

---

### 7. Tiêu Chí Nghiệm Thu & Ma Trận Kiểm Thử (Test Matrix)

| ID | Tình huống kiểm thử | Dữ liệu đầu vào | Kết quả mong đợi |
|---|---|---|---|
| **TC-AI-01** | Kiểm tra key hợp lệ | Key Gemini hợp lệ | HTTP 200 OK, `isValid: true`. |
| **TC-AI-02** | Kiểm tra key không hợp lệ | Key chuỗi ngẫu nhiên sai | HTTP 400 Bad Request, mã lỗi `AI_KEY_INVALID`. |
| **TC-AI-03** | Lưu cấu hình key riêng (BYOK) | Bấm lưu key hợp lệ | HTTP 200 OK, DB lưu mã hóa AES-GCM, GET API chỉ trả về `••••••••1234`. |
| **TC-AI-04** | Người dùng chưa có key gọi AI | `ai_trial_count = 3` | Gọi AI thành công, `ai_trial_count` tăng lên 4. |
| **TC-AI-05** | Hết 10 lượt thử gọi AI | `ai_trial_count = 10`, chưa có key riêng | Bị chặn với HTTP 403 Forbidden `AI_TRIAL_LIMIT_EXCEEDED`, nút AI disabled trên UI. |
| **TC-AI-06** | Reset lượt thử tự động | Đến 00:00 ngày 1 hàng tháng | Scheduled job tự động cập nhật `ai_trial_count = 0` cho toàn bộ user. |
| **TC-AI-07** | Tắt công tắc AI | Gửi `aiEnabled = false` | Nút AI trên toàn bộ hệ thống chuyển sang disabled, xóa khóa an toàn nếu người dùng yêu cầu. |
