# Đặc Tả Kỹ Thuật Chi Tiết: FEAT-STD-05
## Lập Kế Hoạch Tuần Cá Nhân, Phân Bổ Công Việc Thông Minh & Chế Độ Xem Chuyên Biệt (Planning, Upcoming 7 Days & Overdue Views)

- **Mã tính năng:** `FEAT-STD-05`
- **Phân hệ:** Standard Mode (Cá nhân hóa & Lập kế hoạch đời sống)
- **Trạng thái:** `01.draft` (Chờ người dùng review)
- **Độ ưu tiên:** `P1 (Critical - Trọng tâm trải nghiệm lập kế hoạch Standard Mode)`

---

### 1. Mục Tiêu (User Story)

Là người dùng ở chế độ cá nhân (*Standard Mode*), tôi muốn có một không gian **Lập kế hoạch tuần (Weekly Planning)** để:
1. Nhìn thấy danh sách các công việc tồn đọng chưa xếp lịch (*Inbox / Unscheduled*) và chủ động phân bổ chúng vào các ngày trong tuần (Thứ Hai $\rightarrow$ Chủ Nhật).
2. Thiết lập các mục tiêu trọng tâm trong tuần (*Weekly Focus Goals*) và theo dõi tiến độ hoàn thành.
3. Có các màn hình xem chuyên biệt:
   - **7 ngày tới (Upcoming 7 Days):** Xem dòng thời gian công việc của tuần tới được nhóm rõ ràng theo từng ngày với thao tác thêm việc theo ngày.
   - **Việc quá hạn (Overdue Tasks):** Nhận diện ngay các công việc trễ hạn chót với cảnh báo đỏ và công cụ dời lịch nhanh một chạm (*Dời sang Hôm nay, Dời sang Ngày mai*).

---

### 2. Luồng Nghiệp Vụ & Sơ Đồ Xử Lý (Business Flow Diagram)

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│               SƠ ĐỒ NGHIỆP VỤ LẬP KẾ HOẠCH TUẦN & XẾP LỊCH THÔNG MINH                   │
└─────────────────────────────────────────────────────────────────────────────────────────┘

                     [ NGƯỜI DÙNG TIÊU CHUẨN ]
                                │
       ┌────────────────────────┼────────────────────────┐
       ▼                        ▼                        ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  KẾ HOẠCH TUẦN   │  │    7 NGÀY TỚI    │  │   VIỆC QUÁ HẠN   │
│(standard-planning)│ │(standard-upcoming)│ │(standard-overdue)│
└────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
         │                     │                     │
         │ (1) Kéo/Thả         │ (2) Xem nhóm        │ (3) Dời lịch 1 chạm
         │ từ Hộp việc tồn đọng│ theo từng ngày      │ sang Hôm nay / Ngày mai
         │ sang Thứ Hai..CN    │                     │
         ▼                     ▼                     ▼
┌──────────────────────────────────────────────────────────────┐
│           Client UI / Service Layer (Frontend)               │
│ • PUT /api/v1/tasks/{id}/schedule { scheduledDate: "YYYY-MM-DD" } │
│ • POST /api/v1/plans/weekly-goals                            │
│ • POST /api/v1/tasks/bulk-reschedule { ids, targetDate }     │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                  Backend: PlanningController                 │
│ • Validate quyền sở hữu User & ngày trong tuần hợp lệ        │
│ • Cập nhật scheduled_date, due_date cho các công việc        │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                 Database: MySQL 8.4 (tasks)                  │
│ • tasks: scheduled_date, due_date, priority, status          │
│ • weekly_goals: id, user_id, week_number, year, title, status│
└──────────────────────────────────────────────────────────────┘
```

---

### 3. Quy Tắc Nghiệp Vụ Chi Tiết (Business Rules)

#### 3.1. Phân Hệ Lập Kế Hoạch Tuần (Weekly Planning Grid)
- **Hộp việc chưa xếp lịch (Unscheduled Tasks / Inbox):**
  - Chứa các công việc ở trạng thái `status = 'todo'` và `scheduled_date IS NULL` hoặc `due_date IS NULL`.
  - Người dùng có thể tạo nhanh công việc mới trực tiếp vào hộp này.
  - Cho phép click nút gán ngày hoặc kéo thả sang cột ngày bất kỳ trong tuần.
- **Lưới 7 Ngày trong tuần (Thứ Hai $\rightarrow$ Chủ Nhật):**
  - Hiển thị danh sách task có `scheduled_date` hoặc `due_date` khớp với từng ngày.
  - Mỗi ngày hiển thị tổng số task và thời gian ước tính (ví dụ: `2 việc · 1.5h`).
  - Nút `+ Thêm việc cho ngày này` cho phép tạo task đã gắn sẵn `scheduled_date` tương ứng.
- **Mục tiêu trọng tâm tuần (Weekly Focus Goals):**
  - Cho phép người dùng đặt tối đa 3–5 mục tiêu lớn cho tuần (ví dụ: *Hoàn thành bài tập lớn*, *Tập thể dục 3 buổi*).
  - Checkbox đánh dấu hoàn thành mục tiêu kèm thanh tiến độ trực quan.

#### 3.2. Màn Hình 7 Ngày Tới (Upcoming 7 Days View)
- Bộ lọc: Các task có `due_date` hoặc `scheduled_date` nằm trong khoảng `[Ngày mai, Ngày mai + 6 ngày]`.
- Hiển thị phân nhóm trực quan theo từng ngày:
  - `Ngày mai · Thứ Ba, DD/MM`
  - `Thứ Tư, DD/MM`
  - ...
  - `Thứ Hai tuần kế tiếp, DD/MM`
- Ngày nào chưa có công việc sẽ hiển thị thông báo nhẹ nhàng *"Chưa có công việc"* kèm nút `+ Lên lịch việc`.

#### 3.3. Màn Hình Việc Quá Hạn (Overdue View)
- Bộ lọc: Các task có `status = 'todo'` và `due_date < Đầu ngày hôm nay (00:00 local time)`.
- Huy hiệu cảnh báo: Màu đỏ nổi bật với số lượng task quá hạn.
- Phân nhóm theo độ trễ:
  - **Trễ nghiêm trọng ($\ge$ 3 ngày):** Cảnh báo mức ưu tiên cao nhất.
  - **Trễ 1–2 ngày:** Cần xử lý sớm.
- Thao tác nhanh 1-chạm (Quick Reschedule):
  - **Dời sang hôm nay (Reschedule to Today):** Cập nhật `due_date = Hôm nay`.
  - **Dời sang ngày mai (+1 Day):** Cập nhật `due_date = Ngày mai`.
  - **Dời tất cả việc quá hạn:** Xử lý hàng loạt (*Bulk Reschedule*).

---

### 4. Thiết Kế API & Dữ Liệu

#### 4.1. Endpoints Backend
- `GET /api/v1/planning/weekly?week={weekNumber}&year={year}`: Lấy danh sách task theo 7 ngày trong tuần và mục tiêu tuần.
- `PUT /api/v1/planning/tasks/{id}/schedule`: Cập nhật ngày lên lịch cho task.
  ```json
  {
    "scheduledDate": "2026-10-14"
  }
  ```
- `POST /api/v1/planning/weekly-goals`: Thêm mục tiêu tuần mới.
- `PATCH /api/v1/planning/weekly-goals/{id}/toggle`: Đánh dấu hoàn thành mục tiêu tuần.
- `POST /api/v1/planning/tasks/bulk-reschedule`: Dời lịch hàng loạt cho các task quá hạn.
  ```json
  {
    "taskIds": ["task-1", "task-2"],
    "targetDate": "2026-10-12"
  }
  ```

---

### 5. Đặc Tả Giao Diện (Layout HTML References)
1. **Lập Kế Hoạch Tuần:** `docs/layout-html/standard-planning/layout.html`
2. **7 Ngày Tới:** `docs/layout-html/standard-upcoming/layout.html`
3. **Việc Quá Hạn:** `docs/layout-html/standard-overdue/layout.html`
