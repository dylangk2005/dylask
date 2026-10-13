# Đặc Tả Kỹ Thuật Chi Tiết: FEAT-STD-02
## Chế Độ Xem Lịch Trình (Calendar View) & Quản Lý Công Việc Lặp Lại Định Kỳ (Recurring Tasks)

- **Mã tính năng:** `FEAT-STD-02`
- **Phân hệ:** Standard Mode (Lập lịch & Nhắc hẹn)
- **Trạng thái:** `01.draft` (Chờ người dùng review)
- **Độ ưu tiên:** `P2 (High - Tính năng lập lịch nâng cao)`

---

### 1. Mục Tiêu (User Story)

Là người dùng cá nhân, tôi muốn theo dõi công việc theo dạng lưới thời gian trực quan (Ngày, Tuần, Tháng) để phân bổ thời gian biểu hợp lý; đồng thời thiết lập công việc tự động lặp lại định kỳ (*Mỗi ngày, Ngày trong tuần, Mỗi tuần, Mỗi tháng*) để không phải tạo lại thủ công các thói quen hoặc nhiệm vụ lặp đi lặp lại.

---

### 2. Luồng Nghiệp Vụ & Sơ Đồ Xử Lý (Business Flow Diagram)

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│               SƠ ĐỒ LUỒNG CÔNG VIỆC LẶP LẠI ĐỊNH KỲ (RECURRING TASK FLOW)              │
└────────────────────────────────────────────────────────────────────────────────────────┘

  [ NGƯỜI DÙNG ]
        │
        │ (1) Hoàn thành task định kỳ (ví dụ: "Tập gym buổi chiều" - Lặp mỗi ngày)
        ▼
  ┌────────────────────────────────────────────────────────┐
  │         Client UI: Bấm tick checkbox hoàn thành        │
  └──────────────────────────┬─────────────────────────────┘
                             │ (2) PATCH /api/v1/tasks/{id}/status { status: "done" }
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │            Backend: TaskController                    │
  └──────────────────────────┬─────────────────────────────┘
                             │ (3) taskService.updateStatus(id, "done")
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │             Service: TaskServiceImpl                  │
  │ • Đánh dấu task hiện tại: status = 'done'             │
  │ • Kiểm tra cột: recurring_pattern != NULL             │
  └──────────┬─────────────────────────────────────────────┘
             │ (4) Nếu có cấu hình lặp -> Kích hoạt sinh task chu kỳ kế tiếp
             ▼
  ┌────────────────────────────────────────────────────────┐
  │          Service: RecurringCalculationService          │
  │ • Tính ngày mới: dueDate_mới = calculateNextDate(...)  │
  │   - DAILY     : Ngày hôm sau (+1 ngày)                 │
  │   - WEEKDAYS  : Bỏ qua T7/CN, lấy Thứ 2 kế tiếp        │
  │   - WEEKLY    : Cùng thứ trong tuần sau (+7 ngày)      │
  │   - MONTHLY   : Cùng ngày tháng sau (+1 tháng)         │
  │ • Kiểm tra: dueDate_mới <= recurring_until (nếu có)    │
  └──────────┬─────────────────────────────────────────────┘
             │ (5) Nhân bản Task mới với status = 'todo'
             ▼
  ┌────────────────────────────────────────────────────────┐
  │            Database: MySQL 8.4 (tasks)                 │
  │ • Lưu Task mới (giữ nguyên title, priority, checklists)│
  │ • Task cũ giữ nguyên trong lịch sử đã hoàn thành       │
  └────────────────────────────────────────────────────────┘
```

#### 2.1. Quy tắc Lịch trình (Calendar View Rules)
- **Các chế độ xem:**
  - **Lưới Tháng (Month Grid):** Hiển thị 7 cột (Thứ 2 đến Chủ nhật) và 4–6 hàng tuần. Mỗi ô ngày hiển thị tối đa 3 thẻ task tóm tắt; task vượt quá hiển thị nhãn `+N việc nữa`.
  - **Lưới Tuần (Week View):** Hiển thị chi tiết 7 ngày với các khung giờ từ 06:00 đến 22:00.
  - **Chế độ Ngày (Day View):** Xem chi tiết dòng thời gian trong 24 giờ của ngày được chọn.
- **Thao tác trực tiếp trên lịch:**
  - Bấm vào một ô ngày bất kỳ trên lưới tháng $\rightarrow$ mở ô nhập nhanh với `dueDate` được điền sẵn là ngày đó.
  - Kéo thả (Drag & Drop) thẻ task sang ngày khác trên lưới tháng $\rightarrow$ tự động cập nhật lại `dueDate` của task.

#### 2.2. Quy tắc Công việc Lặp lại Định kỳ (Recurring Task Rules)
- **Các chu kỳ hỗ trợ:**
  - `DAILY`: Lặp lại mỗi ngày (cách nhau $N$ ngày theo `recurring_interval`, mặc định 1).
  - `WEEKDAYS`: Lặp lại vào các ngày làm việc trong tuần (Thứ 2 đến Thứ 6, tự động bỏ qua Thứ 7 và Chủ nhật).
  - `WEEKLY`: Lặp lại vào ngày cố định trong tuần (ví dụ: Thứ 3 hàng tuần).
  - `MONTHLY`: Lặp lại vào cùng ngày của tháng sau (ví dụ: ngày 15 hàng tháng). Nếu tháng sau không có ngày đó (ví dụ ngày 31 sang tháng 30 ngày hoặc tháng 2), tự động lấy ngày cuối cùng của tháng đó.
- **Điều kiện dừng lặp:**
  - Không giới hạn (Vô hạn).
  - Dừng sau ngày cụ thể (`recurring_until`).
- **Chiến lược tạo task:** Nhân bản bản sao khi hoàn thành task hiện tại (giúp task cũ lưu lại lịch sử hoàn thành, không làm xáo trộn báo cáo tiến độ).

---

### 3. Thiết Kế Cơ Sở Dữ Liệu & Flyway Migration

#### Script Flyway: `V4__add_recurring_columns_to_tasks.sql`
```sql
ALTER TABLE tasks
ADD COLUMN recurring_pattern VARCHAR(30) NULL COMMENT 'DAILY, WEEKDAYS, WEEKLY, MONTHLY',
ADD COLUMN recurring_interval INT NOT NULL DEFAULT 1 COMMENT 'Khoảng cách lặp (mỗi 1 ngày, mỗi 2 tuần...)',
ADD COLUMN recurring_until TIMESTAMP NULL COMMENT 'Thời điểm dừng lặp',
ADD COLUMN parent_task_id BIGINT NULL COMMENT 'ID của task gốc ban đầu',
ADD COLUMN reminder_minutes_before INT NULL COMMENT 'Nhắc trước bao nhiêu phút (15, 60, 1440)';

ALTER TABLE tasks
ADD CONSTRAINT fk_tasks_parent_task FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE SET NULL;

CREATE INDEX idx_tasks_recurring ON tasks(user_id, recurring_pattern);
```

---

### 4. Chi Tiết API Contract

#### 4.1. `GET /api/v1/tasks/calendar` - Lấy Dữ Liệu Lịch Trình
- **Headers:** `Authorization: Bearer <access_token>`
- **Query Parameters:**
  - `startDate=2026-10-01T00:00:00.000Z` (bắt buộc)
  - `endDate=2026-10-31T23:59:59.000Z` (bắt buộc)
- **Response Success (HTTP 200 OK):**
```json
{
  "success": true,
  "code": 200,
  "errorCode": null,
  "message": "Lấy dữ liệu lịch trình thành công",
  "data": [
    {
      "id": 105,
      "title": "Họp tổng kết tuần",
      "dueDate": "2026-10-16T09:00:00.000Z",
      "priority": "high",
      "status": "todo",
      "isRecurring": true,
      "recurringPattern": "WEEKLY"
    },
    {
      "id": 106,
      "title": "Tập thể dục buổi sáng",
      "dueDate": "2026-10-16T06:30:00.000Z",
      "priority": "medium",
      "status": "done",
      "isRecurring": true,
      "recurringPattern": "DAILY"
    }
  ],
  "errors": null,
  "timestamp": "2026-10-12T14:45:00.000Z"
}
```

#### 4.2. `PUT /api/v1/tasks/{id}/recurring` - Cấu Hình Quy Tắc Lặp Lại
- **Headers:** `Authorization: Bearer <access_token>`
- **Request Body:**
```json
{
  "pattern": "WEEKDAYS",
  "interval": 1,
  "until": "2026-12-31T23:59:59.000Z",
  "reminderMinutesBefore": 15
}
```
- **Response Success (HTTP 200 OK):**
```json
{
  "success": true,
  "code": 200,
  "errorCode": null,
  "message": "Cấu hình lặp lại công việc thành công",
  "data": {
    "id": 105,
    "recurringPattern": "WEEKDAYS",
    "recurringInterval": 1,
    "recurringUntil": "2026-12-31T23:59:59.000Z",
    "reminderMinutesBefore": 15
  },
  "errors": null,
  "timestamp": "2026-10-12T14:46:00.000Z"
}
```

#### 4.3. `DELETE /api/v1/tasks/{id}/recurring` - Hủy Bỏ Tính Năng Lặp Lại
- **Headers:** `Authorization: Bearer <access_token>`
- **Response Success (HTTP 200 OK):**
```json
{
  "success": true,
  "code": 200,
  "errorCode": null,
  "message": "Đã hủy bỏ quy tắc lặp lại cho công việc này",
  "data": {
    "id": 105,
    "recurringPattern": null
  },
  "errors": null,
  "timestamp": "2026-10-12T14:47:00.000Z"
}
```

---

### 5. Cấu Trúc Mã Nguồn Backend (`dylask-backend`)

Mã nguồn tổ chức tại module `com.dylask.modules.task`:

```
com.dylask.modules.task/
├── controller/
│   └── TaskCalendarController.java          # API /api/v1/tasks/calendar & /recurring
├── service/
│   ├── RecurringTaskService.java            # Interface tính ngày tiếp theo & clone task
│   └── impl/RecurringTaskServiceImpl.java   # Logic tính toán ngày thông minh
├── util/
│   └── DateTimeRecurrenceUtils.java         # Thuật toán cộng ngày tránh lỗi cuối tháng
├── dto/
│   ├── request/
│   │   └── SetRecurringRequestDTO.java      # Record: pattern, interval, until, reminder
│   └── response/
│       └── CalendarTaskDTO.java             # Record hiển thị thẻ trên ô lịch
```

---

### 6. Cấu Trúc Mã Nguồn Frontend (`dylask-frontend`)

1. **Màn hình & Giao diện:**
   - Màn hình Lịch: `src/pages/standard/CalendarPage.tsx`.
   - Lưới Tháng: `src/components/calendar/MonthGridView.tsx`.
   - Lưới Tuần: `src/components/calendar/WeekGridView.tsx`.
   - Modal cấu hình lặp: `src/components/task/RecurringModal.tsx`.
2. **Hook `useCalendar`:**
   - Quản lý khoảng ngày đang hiển thị, điều hướng chuyển tháng trước/tháng sau (`currentMonth`, `nextMonth`, `prevMonth`), lọc task theo ngày.

---

### 7. Tiêu Chí Nghiệm Thu & Ma Trận Kiểm Thử (Test Matrix)

| ID | Tình huống kiểm thử | Dữ liệu đầu vào | Kết quả mong đợi |
|---|---|---|---|
| **TC-CAL-01** | Lấy dữ liệu lịch tháng | `startDate=2026-10-01`, `endDate=2026-10-31` | Trả về toàn bộ task của user có `dueDate` nằm trong tháng 10. |
| **TC-CAL-02** | Hoàn thành task lặp DAILY | Task có pattern `DAILY`, hạn 12/10 | Task cũ `done`; task mới được tạo tự động với hạn 13/10, status `todo`. |
| **TC-CAL-03** | Hoàn thành task lặp WEEKDAYS vào thứ 6 | Task có pattern `WEEKDAYS`, hạn thứ Sáu (16/10) | Task mới tự động nhảy sang thứ Hai tuần kế tiếp (19/10), bỏ qua thứ Bảy & Chủ nhật. |
| **TC-CAL-04** | Hết hạn lặp `until` | Task có `until = 2026-10-15`, hạn task là 15/10 | Hoàn thành task, hệ thống KHÔNG tạo thêm task mới nào. |
| **TC-CAL-05** | Hủy lặp lại | Gọi `DELETE /recurring` | Cột `recurring_pattern` chuyển về `NULL`, task trở thành task đơn lẻ bình thường. |
| **TC-CAL-06** | Xử lý ngày 31 cuối tháng (MONTHLY) | Task ngày 31/01 sang tháng 2 | Ngày hạn kế tiếp được gán là ngày 28/02 (hoặc 29/02 năm nhuận), không bị lỗi văng exception. |
