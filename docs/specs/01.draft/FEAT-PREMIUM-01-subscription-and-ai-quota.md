# Đặc Tả Tính Năng: FEAT-PREMIUM-01
## Quản Lý Gói Tài Khoản (Subscription) & Hạn Mức Gọi AI (AI Quota)

- **Mã tính năng:** `FEAT-PREMIUM-01`
- **Phân hệ:** Billing & Access Control Module
- **Trạng thái:** `01.draft` (Chờ người dùng review)

---

### 1. Mục tiêu (User Story)
Là người dùng Dylask, tôi muốn nâng cấp gói tài khoản lên **Premium** để sử dụng toàn bộ tính năng AI không giới hạn (hoặc hạn mức lớn) mà không cần cấu hình API Key cá nhân; đồng thời nếu ở gói **Free**, tôi vẫn được dùng thử một lượng quota nhỏ mỗi tháng hoặc tự cung cấp API Key riêng (BYOK) để trải nghiệm miễn phí.

---

### 2. Mô hình phân tầng (Tier Matrix)

| Quyền lợi / Hạn mức | Gói Miễn phí (FREE) | Gói Nâng cao (PREMIUM) |
|---|---|---|
| **Core Task & Kanban / Sprints** | Không giới hạn | Không giới hạn |
| **Git Webhook Tự động hóa** | Không giới hạn (100% Free) | Không giới hạn |
| **Lưu trữ Audit Log** | 30 ngày gần nhất | Không giới hạn |
| **Hạn mức AI hệ thống** | **10 lượt gọi / tháng** (Dùng thử) | **1.000 lượt gọi / tháng** (Thực tế không giới hạn) |
| **AI Tự cấp khóa (BYOK)** | Hỗ trợ (Dùng key riêng không trừ quota) | Không bắt buộc cấu hình |
| **Hỗ trợ kỹ thuật** | Cộng đồng | Ưu tiên |

---

### 3. Luồng nghiệp vụ (Business Workflow)

1. **Khởi tạo tài khoản:**
   - Mỗi người dùng mới mặc định có `subscription_tier = 'FREE'`.
   - Được cấp `ai_quota_limit = 10` lượt gọi AI / tháng.
   - Trường `quota_reset_at` lưu ngày đầu tiên của tháng kế tiếp để reset chu kỳ.

2. **Kiểm tra quyền truy cập khi gọi tính năng AI:**
   - Người dùng kích hoạt bất kỳ tính năng AI nào (NLP Quick-Add, Subtask Suggestion, Test Cases Generator, Release Notes, Log Debugger):
     - **Trường hợp 1 (BYOK):** Nếu người dùng đã cài đặt `ai_api_key` cá nhân hợp lệ $\rightarrow$ Hệ thống dùng key cá nhân, **không trừ quota**, không yêu cầu Premium.
     - **Trường hợp 2 (Premium Tier):** Nếu `subscription_tier = 'PREMIUM'` và `subscription_expires_at > NOW()` $\rightarrow$ Cho phép gọi AI của hệ sinh thái Dylask, tăng `ai_usage_count`.
     - **Trường hợp 3 (Free Tier):**
       - Nếu `ai_usage_count < ai_quota_limit` $\rightarrow$ Cho phép gọi, tăng `ai_usage_count += 1`.
       - Nếu `ai_usage_count >= ai_quota_limit` $\rightarrow$ Chặn request, trả về mã lỗi `402 Payment Required` (`PREMIUM_REQUIRED`) kèm hướng dẫn nâng cấp hoặc nhập BYOK.

3. **Nâng cấp gói Premium:**
   - Người dùng truy cập trang `Settings > Subscription` hoặc bấm nút Nâng cấp từ Paywall Modal.
   - Chọn chu kỳ thanh toán (Theo tháng / Theo năm) $\rightarrow$ Cập nhật `subscription_tier = 'PREMIUM'`, gia hạn `subscription_expires_at`, tăng `ai_quota_limit = 1000`.

---

### 4. Thiết kế Cơ sở Dữ liệu (Database Migration)

Bổ sung các trường vào bảng `users`:
```sql
ALTER TABLE users 
ADD COLUMN subscription_tier VARCHAR(20) NOT NULL DEFAULT 'FREE',
ADD COLUMN subscription_expires_at TIMESTAMP NULL,
ADD COLUMN ai_usage_count INT NOT NULL DEFAULT 0,
ADD COLUMN ai_quota_limit INT NOT NULL DEFAULT 10,
ADD COLUMN quota_reset_at TIMESTAMP NULL;
```

---

### 5. API Contracts

- `GET /api/v1/subscription/me`
  - **Mô tả:** Lấy thông tin gói hiện tại và hạn mức sử dụng AI.
  - **Response:**
    ```json
    {
      "success": true,
      "code": "OK",
      "data": {
        "tier": "FREE",
        "expiresAt": null,
        "aiUsageCount": 4,
        "aiQuotaLimit": 10,
        "quotaResetAt": "2026-11-01T00:00:00Z",
        "hasByokKey": false
      }
    }
    ```

- `POST /api/v1/subscription/upgrade`
  - **Mô tả:** Nâng cấp hoặc gia hạn gói Premium.
  - **Request:** `{ "plan": "PREMIUM_MONTHLY" }`
  - **Response:** `ApiResponse<SubscriptionInfo>`

---

### 6. Tiêu chí nghiệm thu (Acceptance Criteria)
- [ ] Mặc định user mới có hạn mức 10 lượt gọi AI / tháng.
- [ ] Chặn chính xác các lượt gọi AI vượt quá hạn mức với mã lỗi chuẩn `PREMIUM_REQUIRED`.
- [ ] Cho phép người dùng Free sử dụng bình thường nếu đã cấu hình API Key riêng (BYOK).
- [ ] Nâng cấp thành công tài khoản lên `PREMIUM` và tăng hạn mức tương ứng.
- [ ] Cronjob định kỳ tự động reset `ai_usage_count = 0` vào đầu mỗi tháng dương lịch.
