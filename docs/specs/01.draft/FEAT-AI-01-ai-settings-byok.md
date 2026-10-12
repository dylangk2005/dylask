# Đặc Tả Tính Năng: FEAT-AI-01
## Cấu Hình AI & Quản Lý Khóa API Riêng (BYOK)

- **Mã tính năng:** `FEAT-AI-01`
- **Phân hệ:** AI Module
- **Trạng thái:** `01.draft` (Chờ người dùng review)

---

### 1. Mục tiêu (User Story)
Là người dùng, tôi muốn tự bật/tắt tính năng AI và có thể nhập API Key riêng của mình (Gemini API hoặc OpenAI theo cơ chế BYOK - Bring Your Own Key) để sử dụng không giới hạn lượt gọi AI mà không bắt buộc phải mua gói Premium.

### 2. Luồng nghiệp vụ
1. **Kiểm soát chi phí:** Mặc định AI ở trạng thái **TẮT (Opt-in)**.
2. **Cơ chế BYOK (Bring Your Own Key) kết hợp Premium:**
   - Nếu người dùng có gói **Premium** (xem `FEAT-PREMIUM-01`): Sử dụng hạ tầng AI tối ưu sẵn của hệ thống, không cần cấu hình key.
   - Nếu người dùng ở gói **Free**:
     - Được cấp 10 lượt gọi AI dùng thử mỗi tháng qua hạ tầng của Dylask.
     - Sau khi hết lượt, người dùng có thể lựa chọn:
       1. Nâng cấp lên gói Premium.
       2. Hoặc nhập API Key riêng (Google Gemini API / OpenAI) để tiếp tục dùng AI miễn phí không phụ thuộc vào quota hệ thống.
3. **Bảo mật khóa cá nhân:**
   - Backend mã hóa đối xứng **AES-256-GCM** trước khi lưu API Key vào cơ sở dữ liệu.
   - Khi gọi tính năng AI, backend giải mã khóa và dùng khóa của người dùng để gọi AI Provider. Khóa tuyệt đối không bao giờ trả về nguyên vẹn ở phía client.

### 3. API Contract
- `GET /api/v1/users/me/ai-settings` $\rightarrow$ Lấy trạng thái kích hoạt, quota đã dùng và provider (khóa cá nhân được che masked `****...`).
- `PUT /api/v1/users/me/ai-settings` $\rightarrow$ Cập nhật `{ isEnabled, provider, apiKey }`.

### 4. Tiêu chí nghiệm thu (Acceptance Criteria)
- [ ] API Key được mã hóa an toàn bằng AES-256-GCM trước khi lưu DB và không lộ ra ngoài ở API GET.
- [ ] Người dùng có thể bật/tắt module AI bất cứ lúc nào.
- [ ] Khi nhập API Key cá nhân hợp lệ, các lượt gọi AI không bị trừ vào hạn mức `ai_usage_count` của hệ thống.
