# Đặc Tả Tính Năng: FEAT-AI-01
## Cấu Hình AI, Hạn Mức Dùng Thử 10 Lượt/Tháng & Quản Lý Khóa Riêng (BYOK)

- **Mã tính năng:** `FEAT-AI-01`
- **Phân hệ:** AI Module
- **Trạng thái:** `01.draft` (Chờ người dùng review)

---

### 1. Mục tiêu (User Story)
Là người dùng mới hoặc người dùng chưa quen lấy API key, tôi muốn có 10 lượt gọi AI dùng thử mỗi tháng để trải nghiệm tính năng tiện ích; và khi muốn dùng tiếp hoặc không giới hạn, tôi có thể tự cung cấp API Key riêng của mình (BYOK - Bring Your Own Key) từ Google Gemini hoặc OpenAI mà không cần mua bất kỳ gói dịch vụ hay trả phí định kỳ nào cho hệ thống.

---

### 2. Luồng nghiệp vụ
1. **Kiểm soát chi phí & Tùy chọn (Opt-in):** 
   - Mặc định tính năng AI ở trạng thái **TẮT** trên toàn hệ thống (`users.ai_enabled = FALSE`) và từng dự án (`projects.is_ai_enabled = FALSE`). Hệ thống không tự động kích hoạt gọi AI nếu người dùng chưa chủ động bật.
2. **Bãi bỏ Freemium & Cung cấp 10 lượt gọi dùng thử/tháng:**
   - Hệ thống bãi bỏ hoàn toàn các gói tài khoản trả phí (không có gói Premium PRO, không có cổng thanh toán).
   - Nhằm tạo điều kiện cho người dùng chưa quen tự tạo API key, hệ thống cấp sẵn **10 lượt gọi AI dùng thử/tháng** (`ai_trial_limit = 10`) cho mỗi tài khoản.
   - Hạn mức dùng thử được tự động làm mới (`ai_trial_count = 0`) vào 00:00 ngày đầu tiên mỗi tháng dương lịch (reset định kỳ bằng Scheduled Job).
3. **Cơ chế BYOK (Bring Your Own Key) không giới hạn:**
   - Người dùng có thể cấu hình API Key riêng từ các nhà cung cấp được hỗ trợ (**Google Gemini**, **OpenAI**) bất kỳ lúc nào.
   - Khi đã nhập và kiểm tra key riêng thành công, hệ thống chuyển sang gọi AI bằng key riêng của người dùng và **không bị giới hạn 10 lượt/tháng**.
4. **Quy tắc 3 điều kiện để AI hoạt động:**
   1. Công tắc AI trong Cài đặt đang bật (`users.ai_enabled = TRUE`).
   2. Công tắc AI của dự án/danh mục đang bật (`projects.is_ai_enabled = TRUE`).
   3. Người dùng đã cấu hình API key riêng hợp lệ **HOẶC** còn lượt gọi dùng thử trong tháng (`users.ai_trial_count < users.ai_trial_limit`).
   - Khi hết 10 lượt thử của tháng mà chưa có key riêng: Hệ thống vô hiệu hóa các nút AI kèm thông báo: *"Đã sử dụng hết 10/10 lượt thử tháng này. Vui lòng nhập API key riêng tại Cài đặt > AI để tiếp tục không giới hạn hoặc chờ làm mới vào tháng sau."*
5. **Lựa chọn nhà cung cấp & Kiểm tra khóa (Test Key):**
   - Hỗ trợ chọn nhà cung cấp: **Google Gemini** hoặc **OpenAI** (lưu trường `ai_provider`).
   - Cung cấp nút *"Kiểm tra key"* để gửi request xác thực tính hợp lệ của khóa ngay tại trang Cài đặt trước khi lưu.
6. **Bảo mật & Quyền riêng tư:**
   - Backend mã hóa đối xứng **AES-GCM** trước khi lưu API Key vào cơ sở dữ liệu (`ai_api_key_encrypted`). Khóa giải mã được lưu tách biệt trong biến môi trường server.
   - Khóa tuyệt đối không bao giờ được trả về nguyên vẹn qua API (chỉ hiển thị 4 ký tự cuối dạng `••••••••1234`).
   - Không ghi log khóa API cũng như nội dung người dùng gửi cho AI.
   - Tự động xóa/thu hồi khóa khi người dùng tắt AI hoặc xóa tài khoản.

---

### 3. API Contract
- `GET /api/v1/users/me/ai-settings` $\rightarrow$ Lấy trạng thái AI, lượt thử và thông tin khóa:
  ```json
  {
    "aiEnabled": true,
    "provider": "gemini",
    "apiKeyMasked": "••••••••1234",
    "hasCustomKey": true,
    "trialCount": 3,
    "trialLimit": 10,
    "trialResetAt": "2026-11-01T00:00:00+07:00"
  }
  ```
- `PUT /api/v1/users/me/ai-settings` $\rightarrow$ Cập nhật cài đặt AI:
  ```json
  {
    "aiEnabled": true,
    "provider": "gemini",
    "apiKey": "••••••••"
  }
  ```
- `POST /api/v1/users/me/ai-settings/test` $\rightarrow$ Kiểm tra tính hợp lệ của API Key:
  ```json
  {
    "provider": "gemini",
    "apiKey": "••••••••"
  }
  ```
  $\rightarrow$ Response: `{ "isValid": true, "message": "Khóa API hợp lệ." }`

---

### 4. Tiêu chí nghiệm thu (Acceptance Criteria)
- [ ] Bãi bỏ hoàn toàn các gói trả phí/thanh toán; người dùng mới hoặc chưa quen lấy key được dùng thử 10 lượt/tháng.
- [ ] Số lượt dùng thử được làm mới về 0 vào ngày 1 hàng tháng; khi hết 10 lượt và chưa có key riêng, nút AI bị vô hiệu hóa kèm chỉ dẫn.
- [ ] Khi người dùng nhập API key riêng hợp lệ (BYOK), hệ thống chuyển sang dùng key riêng và không bị giới hạn 10 lượt/tháng.
- [ ] Khóa API cá nhân được mã hóa AES-GCM an toàn trước khi lưu DB và không lộ ra ngoài ở API GET (chỉ hiển thị 4 ký tự cuối).
- [ ] Nút "Kiểm tra key" xác nhận chính xác khóa có hoạt động được với nhà cung cấp (Gemini, OpenAI) hay không.
- [ ] Tự động xóa khóa an toàn khi người dùng tắt tính năng AI hoặc xóa tài khoản.
