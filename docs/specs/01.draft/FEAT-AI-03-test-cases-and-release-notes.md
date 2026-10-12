# Đặc Tả Tính Năng: FEAT-AI-03
## Sinh Test Cases, Tóm Tắt Release Notes & Phân Tích Log Lỗi

- **Mã tính năng:** `FEAT-AI-03`
- **Phân hệ:** AI Module (Dành cho Developer Mode)
- **Trạng thái:** `01.draft` (Chờ người dùng review)

---

### 1. Mục tiêu (User Story)
Là lập trình viên, tôi muốn sử dụng AI để đề xuất Test Cases/Acceptance Criteria từ mô tả task, tổng hợp dự thảo Release Notes theo Sprint và phân tích Stack Trace lỗi thành checklist gỡ lỗi, với toàn bộ kết quả ở dạng đề xuất để xem và duyệt trước khi áp dụng; hỗ trợ 10 lượt dùng thử/tháng cho người dùng chưa quen lấy key và không giới hạn khi nhập API key riêng (BYOK).

---

### 2. Luồng nghiệp vụ
1. **Điều kiện kích hoạt & Trạng thái giao diện:**
   - AI chỉ hoạt động khi thỏa mãn đủ 3 điều kiện: (a) công tắc AI trong Cài đặt đang bật, (b) công tắc AI của dự án đang bật, (c) người dùng đã cấu hình khóa API (BYOK) hợp lệ **HOẶC** còn lượt gọi dùng thử trong tháng (tối đa 10 lượt/tháng).
   - Khi chưa đủ điều kiện (chưa bật AI hoặc đã hết 10 lượt thử mà chưa nhập API key riêng), bảng Trợ lý AI (AI Panel) hiển thị banner thông báo: *"Chưa bật AI hoặc đã hết 10 lượt thử tháng này. Vui lòng cấu hình khóa API riêng tại Cài đặt > AI để tiếp tục."*
2. **Sinh Acceptance Criteria & Test Cases:**
   - Người dùng dán mô tả yêu cầu kỹ thuật $\rightarrow$ AI sinh kịch bản kiểm thử dạng `Given - When - Then` và các trường hợp kiểm thử biên (Edge Cases).
   - Kết quả hiển thị kèm các ô checkbox để lập trình viên lựa chọn và bấm nút xác nhận thêm vào task.
3. **Tổng hợp Release Notes (Changelog):**
   - Trích xuất danh sách các task trạng thái `DONE` và thông điệp commit trong Sprint $\rightarrow$ AI tổng hợp dự thảo Changelog Markdown có phân mục (Features, Bug Fixes, Refactor).
   - Lập trình viên có thể chỉnh sửa trực tiếp, sao chép Markdown hoặc xuất file.
4. **Phân tích Stack Trace lỗi:**
   - Lập trình viên dán log ngoại lệ (Exception) $\rightarrow$ AI đề xuất 3 bước gỡ lỗi (Debug Steps) có hệ thống.
   - **Giới hạn ký tự & Đếm ký tự:** Độ dài ô nhập tối đa 4.000 ký tự, có dòng đếm ký tự trực quan (ví dụ: `398 / 4.000`).
   - **Cảnh báo bảo mật:** Hiển thị cảnh báo bắt buộc: *"Không dán mật khẩu, token hoặc secret vào ô này. Nội dung sẽ được gửi tới nhà cung cấp AI bạn đã chọn."*
5. **Cơ chế trừ lượt thử & BYOK:**
   - Nếu người dùng chưa cấu hình key riêng: Mỗi yêu cầu sinh Test Cases, Release Notes hoặc Phân tích log thành công sẽ trừ 1 lượt vào hạn mức dùng thử (`ai_trial_count += 1`).
   - Nếu người dùng đã cấu hình key riêng hợp lệ: Cuộc gọi sử dụng trực tiếp key cá nhân, không trừ hạn mức thử và không giới hạn số lần gọi.
6. **Nguyên tắc an toàn:**
   - Mọi kết quả từ AI luôn là bản nháp/đề xuất, không tự động ghi đè dữ liệu.
   - Backend validate cấu trúc JSON schema và sanitize mã độc XSS trong Markdown trước khi render.
   - Tuyệt đối không lưu vết hay ghi log Stack Trace, token hoặc prompt vào file log hệ thống.

---

### 3. API Contract
- `POST /api/v1/ai/tasks/{id}/generate-test-cases`
  - **Request:** `{ "prompt": string }`
  - **Response:**
    ```json
    {
      "acceptanceCriteria": [
        "Given người dùng đăng nhập hợp lệ, When gửi request đăng nhập, Then trả về HTTP 200 và JWT token"
      ],
      "edgeCases": [
        "Thử đăng nhập sai quá 5 lần liên tiếp để kiểm tra khóa tài khoản"
      ],
      "trialRemaining": 5
    }
    ```
- `POST /api/v1/ai/sprints/{id}/release-notes`
  - **Response:**
    ```json
    {
      "markdown": "# Bản tin phát hành: Sprint 3\n\n### Tính năng mới\n- ...",
      "trialRemaining": 4
    }
    ```
- `POST /api/v1/ai/debug-assistant`
  - **Request:** `{ "stackTrace": string }` (tối đa 4.000 ký tự)
  - **Response:**
    ```json
    {
      "steps": [
        { "title": "Kiểm tra vòng đời Access Token", "description": "Token đã hết hạn 15 phút..." },
        { "title": "Bắt ngoại lệ ExpiredJwtException", "description": "Bọc try/catch trong Filter..." }
      ],
      "trialRemaining": 3
    }
    ```

---

### 4. Tiêu chí nghiệm thu (Acceptance Criteria)
- [ ] Bảng AI Panel hiển thị đúng trạng thái AI (đang dùng key riêng, đang trong hạn mức 10 lượt thử/tháng, hoặc đã hết lượt thử) kèm liên kết tới Cài đặt > AI.
- [ ] Cho phép người dùng trải nghiệm 10 lượt gọi/tháng nếu chưa nhập key; khi đã nhập key riêng, không bị giới hạn số lần gọi.
- [ ] Kết quả sinh Test Cases, Release Notes và checklist gỡ lỗi hiển thị dạng đề xuất xem trước để người dùng xác nhận.
- [ ] Ô nhập Stack Trace giới hạn tối đa 4.000 ký tự, có đếm ký tự và hiển thị cảnh báo không dán secret.
- [ ] Nội dung Markdown do AI trả về được sanitize đầy đủ trước khi hiển thị.
- [ ] Hệ thống backend không lưu log nội dung Stack Trace hoặc prompt gửi AI.
