# Đặc Tả Tính Năng: FEAT-STD-03
## Kế Hoạch Hôm Nay (My Day) & Đồng Hồ Pomodoro

- **Mã tính năng:** `FEAT-STD-03`
- **Phân hệ:** Standard Mode
- **Trạng thái:** `01.draft` (Chờ người dùng review)

---

### 1. Mục tiêu (User Story)
Là người dùng muốn tập trung làm việc sâu, tôi muốn chọn ra các việc trọng tâm cho ngày hôm nay và sử dụng bộ đếm Pomodoro 25/5 phút.

### 2. Luồng nghiệp vụ
1. **Kế hoạch hôm nay (My Day):**
   - Danh sách trọng tâm được reset vào 00:00 mỗi ngày.
   - Bấm nút "Add to My Day" để đưa các task tồn đọng vào làm trong ngày.
2. **Đồng hồ Pomodoro:**
   - 25 phút làm việc $\rightarrow$ 5 phút nghỉ ngắn $\rightarrow$ sau 4 chu kỳ nghỉ dài 15 phút.
   - Gắn trực tiếp vào task đang làm. Ghi nhận số chu kỳ (`pomodoro_count + 1`).
   - Có chuông thông báo âm thanh khi hết giờ.

### 3. API Contract
- `GET /api/v1/tasks/my-day` $\rightarrow$ Lấy danh sách việc trong ngày hôm nay.
- `POST /api/v1/tasks/{id}/my-day` $\rightarrow$ Thêm / bớt task khỏi My Day.
- `POST /api/v1/tasks/{id}/pomodoro/complete` $\rightarrow$ Tăng số phiên Pomodoro hoàn thành.

### 4. Tiêu chí nghiệm thu (Acceptance Criteria)
- [ ] Danh sách My Day tự động làm mới vào 00:00 mỗi ngày.
- [ ] Đồng hồ Pomodoro đếm ngược chính xác 25 phút / 5 phút, có âm thanh thông báo và lưu số phiên hoàn thành vào DB.
