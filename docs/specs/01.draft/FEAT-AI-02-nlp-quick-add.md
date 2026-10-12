# Đặc Tả Tính Năng: FEAT-AI-02
## Nhập Liệu Tự Nhiên (NLP Quick-Add) & Gợi Ý Chia Nhỏ Việc

- **Mã tính năng:** `FEAT-AI-02`
- **Phân hệ:** AI Module (Dành cho Standard Mode)
- **Trạng thái:** `01.draft` (Chờ người dùng review)

---

### 1. Mục tiêu (User Story)
Là người dùng cá nhân, tôi muốn gõ câu văn tự do để hệ thống trích xuất thành task có hạn chót (thời gian), hoặc nhờ AI đề xuất chia nhỏ việc lớn thành 3–5 bước checklist hành động cụ thể, với kết quả hiển thị dạng đề xuất để tôi xem và xác nhận trước khi lưu; hệ thống cho phép dùng thử 10 lượt/tháng cho người chưa có key hoặc dùng không giới hạn nếu tự nhập API key riêng.

---

### 2. Luồng nghiệp vụ
1. **Điều kiện kích hoạt:**
   - AI chỉ chạy khi đồng thời thỏa mãn 3 điều kiện: (a) công tắc AI trong Cài đặt đang bật, (b) công tắc AI của danh mục/dự án đang bật, (c) người dùng đã nhập API key riêng hợp lệ **HOẶC** còn lượt gọi dùng thử trong tháng (tối đa 10 lượt/tháng).
   - Nếu hết 10 lượt dùng thử mà chưa có key riêng, nút *"Chia nhỏ bằng AI"* sẽ chuyển sang trạng thái tắt (mờ, cursor not-allowed) kèm tooltip: *"Đã hết 10 lượt thử tháng này. Nhập API key trong Cài đặt để tiếp tục"*.
2. **NLP Quick-Add (Ưu tiên phân tích bằng luật):**
   - Khi người dùng gõ câu văn tự do (ví dụ: *"Đóng tiền điện trước 18h thứ Năm tới"*):
     - **Bước 1 (Rule-based first):** Hệ thống dùng thư viện phân tích quy tắc thời gian cục bộ (date-time parser) để trích xuất tiêu đề và thời hạn. Không gọi AI nếu phân tích bằng luật thành công.
     - **Bước 2 (Fallback gọi AI):** Chỉ khi parse bằng luật thất bại mới gọi API AI:
       - Nếu người dùng đã nhập key riêng (BYOK) $\rightarrow$ Sử dụng key của người dùng, không giới hạn.
       - Nếu người dùng chưa nhập key riêng $\rightarrow$ Sử dụng lượt dùng thử (tối đa 10 lượt/tháng, tăng `ai_trial_count += 1`).
       - Luôn gửi kèm ngày giờ hiện tại của client và múi giờ người dùng (mặc định UTC+7).
3. **Gợi ý chia nhỏ checklist:**
   - Khi bấm nút *"Chia nhỏ bằng AI"* trên task mục tiêu lớn (ví dụ: *"Dọn dẹp phòng làm việc"*), AI đề xuất 3–5 bước hành động con (trừ vào lượt thử nếu chưa có key riêng).
4. **Nguyên tắc an toàn & Trải nghiệm:**
   - **Kết quả luôn là đề xuất:** Mọi kết quả do AI sinh ra chỉ hiển thị xem trước để người dùng xác nhận hoặc chỉnh sửa; không tự động ghi vào cơ sở dữ liệu.
   - **JSON Schema & Validate:** AI bắt buộc trả về định dạng JSON theo schema cố định và backend validate trước khi trả về client.
   - **Sanitize Markdown:** Làm sạch mã độc XSS trong nội dung văn bản do AI trả về trước khi render trên giao diện.
   - **Giới hạn input & Cảnh báo bí mật:** Giới hạn độ dài input tối đa 4.000 ký tự. Luôn hiển thị cảnh báo: *"Không dán mật khẩu, token hoặc secret vào ô này. Nội dung sẽ được gửi tới nhà cung cấp AI bạn đã chọn."*

---

### 3. API Contract
- `POST /api/v1/ai/parse-task`
  - **Request:**
    ```json
    {
      "text": "Đóng tiền điện trước 18h thứ Năm tới",
      "clientTime": "2026-10-12T19:40:00+07:00",
      "timeZone": "Asia/Ho_Chi_Minh"
    }
    ```
  - **Response:**
    ```json
    {
      "title": "Đóng tiền điện",
      "dueDate": "2026-10-15T18:00:00+07:00",
      "priority": "medium",
      "source": "rule"
    }
    ```
- `POST /api/v1/ai/tasks/{id}/suggest-checklists`
  - **Request:** `{ "maxItems": 5 }`
  - **Response:**
    ```json
    {
      "items": [
        { "title": "Thu dọn tài liệu và sách vở trên bàn" },
        { "title": "Lau bụi màn hình và bàn phím máy tính" },
        { "title": "Phân loại và vứt rác, giấy vụn không dùng" }
      ],
      "trialRemaining": 6
    }
    ```

---

### 4. Tiêu chí nghiệm thu (Acceptance Criteria)
- [ ] Parse bằng luật trước; chỉ gọi AI khi parse thất bại và gửi kèm múi giờ client (UTC+7).
- [ ] Cho phép người dùng chưa có key gọi AI dùng thử tối đa 10 lượt/tháng; reset đầu tháng.
- [ ] Khi có key riêng (BYOK), các lần gọi AI ưu tiên dùng key riêng và không trừ lượt dùng thử.
- [ ] Nút "Chia nhỏ bằng AI" có 2 trạng thái: bật (dùng được) và tắt (mờ, kèm tooltip rõ ràng khi hết lượt thử hoặc chưa bật AI).
- [ ] Kết quả từ AI luôn hiển thị dạng đề xuất xem trước để người dùng xác nhận, không tự ghi vào dữ liệu.
- [ ] Giới hạn độ dài input tối đa 4.000 ký tự và có cảnh báo không dán secret.
- [ ] Backend validate chặt chẽ JSON schema và sanitize dữ liệu Markdown chống XSS trước khi hiển thị.
