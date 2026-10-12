# Đặc Tả Tính Năng: FEAT-STD-02
## Lịch Trình & Công Việc Lặp Lại Định Kỳ

- **Mã tính năng:** `FEAT-STD-02`
- **Phân hệ:** Standard Mode
- **Trạng thái:** `01.draft` (Chờ người dùng review)

---

### 1. Mục tiêu (User Story)
Là người dùng cá nhân, tôi muốn xem công việc trên lịch (Calendar) và tự động lặp lại các công việc định kỳ (mỗi ngày, mỗi tuần).

### 2. Luồng nghiệp vụ
1. **Lịch trình (Calendar View):**
   - Xem theo lưới Ngày, Tuần, Tháng.
   - Hiển thị task theo `dueDate`. Bấm vào ngày để tạo task nhanh.
2. **Công việc lặp lại (Recurring Rule):**
   - Hỗ trợ: `daily`, `weekdays`, `weekly`, `monthly`.
   - Khi task được đánh dấu `done` $\rightarrow$ Tự động sinh task cho chu kỳ kế tiếp.

### 3. API Contract
- `GET /api/v1/tasks/calendar?startDate=...&endDate=...` $\rightarrow$ Lấy danh sách task theo khoảng ngày.
- `POST /api/v1/tasks/{id}/recurring` $\rightarrow$ Cấu hình quy tắc lặp lại.

### 4. Tiêu chí nghiệm thu (Acceptance Criteria)
- [ ] Hiển thị chính xác các task có `dueDate` trên giao diện lịch tháng/tuần/ngày.
- [ ] Khi hoàn thành task định kỳ, task mới cho chu kỳ tiếp theo được tạo tự động với `dueDate` chính xác.
