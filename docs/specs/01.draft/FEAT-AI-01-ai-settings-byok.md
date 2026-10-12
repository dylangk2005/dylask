# Đặc Tả Tính Năng: FEAT-AI-01
## Cấu Hình AI & Quản Lý Khóa API Riêng (BYOK)

- **Mã tính năng:** `FEAT-AI-01`
- **Phân hệ:** AI Module
- **Trạng thái:** `01.draft` (Chờ người dùng review)

---

### 1. Mục tiêu (User Story)
Là người dùng, tôi muốn tự bật/tắt tính năng AI và nhập API Key riêng của mình (Gemini API hoặc OpenAI) để hệ thống không phát sinh chi phí vận hành và tôi kiểm soát hoàn toàn dữ liệu.

### 2. Luồng nghiệp vụ
1. **Kiểm soát chi phí:** Mặc định AI ở trạng thái **TẮT (Opt-in)**.
2. **BYOK (Bring Your Own Key):**
   - Người dùng nhập API Key trong phần Cài đặt.
   - Backend mã hóa đối xứng **AES-256-GCM** trước khi lưu vào DB.
   - Khi gọi tính năng AI, backend giải mã khóa và dùng khóa của người dùng để gọi AI Provider.

### 3. API Contract
- `GET /api/v1/users/me/ai-settings` $\rightarrow$ Lấy trạng thái kích hoạt & provider (ẩn key).
- `PUT /api/v1/users/me/ai-settings` $\rightarrow$ Cập nhật `{ isEnabled, provider, apiKey }`.

### 4. Tiêu chí nghiệm thu (Acceptance Criteria)
- [ ] API Key được mã hóa an toàn bằng AES-256-GCM trước khi lưu DB và không lộ ra ngoài ở API GET.
- [ ] Người dùng có thể bật/tắt module AI bất cứ lúc nào.
