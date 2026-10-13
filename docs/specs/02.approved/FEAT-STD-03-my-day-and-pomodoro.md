# Đặc Tả Kỹ Thuật Chi Tiết: FEAT-STD-03
## Kế Hoạch Hôm Nay (My Day) & Đồng Hồ Bấm Giờ Tập Trung (Pomodoro Timer)

- **Mã tính năng:** `FEAT-STD-03`
- **Phân hệ:** Standard Mode (Năng suất & Tập trung)
- **Trạng thái:** `01.draft` (Chờ người dùng review)
- **Độ ưu tiên:** `P2 (High - Tối ưu năng suất cá nhân)`

---

### 1. Mục Tiêu (User Story)

Là người dùng muốn làm việc sâu và quản lý năng lượng cá nhân hiệu quả, tôi muốn chọn ra một danh sách các công việc trọng tâm cần hoàn thành trong ngày hôm nay (*My Day*) từ danh sách việc tồn đọng để không bị choáng ngợp; đồng thời sử dụng bộ đếm Pomodoro 25 phút làm việc / 5 phút nghỉ ngơi gắn trực tiếp vào công việc để duy trì sự tập trung cao độ và thống kê số giờ làm việc hiệu quả.

---

### 2. Luồng Nghiệp Vụ & Sơ Đồ Xử Lý (Business Flow Diagram)

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│               SƠ ĐỒ LUỒNG KẾ HOẠCH HÔM NAY (MY DAY) & BỘ ĐẾM POMODORO                  │
└────────────────────────────────────────────────────────────────────────────────────────┘

  [ 1. LUỒNG KẾ HOẠCH HÔM NAY - MY DAY ]
  
  [ NGƯỜI DÙNG BẮT ĐẦU NGÀY MỚI ]
        │
        │ (1) Mở trang "Kế hoạch hôm nay" (My Day)
        ▼
  ┌────────────────────────────────────────────────────────┐
  │         Client UI: MyDayPage / Suggestions Drawer      │
  │ • Danh sách hôm nay bắt đầu sạch sẽ (Clean Slate)     │
  │ • Panel gợi ý: Hiện các task quá hạn hoặc có hạn hôm nay│
  └──────────────────────────┬─────────────────────────────┘
                             │ (2) Bấm "+ Thêm vào hôm nay"
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ PATCH /api/v1/tasks/{id}/my-day { "isMyDay": true }    │
  │ Backend lưu: my_day_date = CURRENT_DATE, is_my_day=TRUE│
  └────────────────────────────────────────────────────────┘

  ──────────────────────────────────────────────────────────────────

  [ 2. LUỒNG BỘ ĐẾM POMODORO - FOCUS TIMER ]

  [ CHỌN 1 TASK ĐỂ BẮT ĐẦU ]
        │
        │ (1) Bấm nút "Bắt đầu Pomodoro" trên Task
        ▼
  ┌────────────────────────────────────────────────────────┐
  │         Widget Đồng Hồ Pomodoro (usePomodoroTimer)     │
  │ • Chu kỳ: 25 phút tập trung (Work Session)             │
  │ • Trạng thái: Đang chạy -> Tạm dừng -> Hủy             │
  └──────────────────────────┬─────────────────────────────┘
                             │ (2) Đếm ngược 25:00 -> 00:00 kết thúc
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ • Phát âm thanh chuông nhẹ (Web Audio API)             │
  │ • Bắn Notification trình duyệt: "Hoàn thành 1 phiên!"  │
  │ • Chuyển sang 5 phút nghỉ ngắn (Short Break)           │
  └──────────────────────────┬─────────────────────────────┘
                             │ (3) Gọi ngầm API ghi nhận phiên
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ POST /api/v1/tasks/{id}/pomodoro/complete              │
  │ Backend tăng: pomodoro_sessions += 1, minutes += 25    │
  └────────────────────────────────────────────────────────┘
```

#### 2.1. Quy tắc Kế hoạch Hôm nay (My Day Rules)
- **Triết lý Clean Slate:** Mỗi ngày mới bắt đầu, danh sách *My Day* tự động làm mới về trạng thái trống. Điều này giúp người dùng không bị áp lực bởi khối lượng công việc dồn ứ từ ngày hôm trước.
- **Cơ chế Reset tự động:**
  - Cột `my_day_date` lưu ngày mà task được đưa vào My Day (theo ngày dương lịch địa phương của user).
  - Khi gọi `GET /api/v1/tasks/my-day`, backend kiểm tra nếu `my_day_date < CURRENT_DATE` thì tự động coi như task đã rời khỏi My Day (task vẫn tồn tại trong Backlog/Danh mục gốc bình thường, không bị xóa).
- **Ngăn gợi ý thông minh (Smart Suggestions):**
  - Hiển thị danh sách task đề xuất đưa vào hôm nay:
    1. Các task có `dueDate` rơi vào ngày hôm nay.
    2. Các task đã quá hạn (`dueDate < hiện tại` và `status = 'todo'`).
    3. Các task có mức độ ưu tiên cao (`priority = 'high'`).

#### 2.2. Quy tắc Đồng hồ Pomodoro (Pomodoro Rules)
- **Cấu hình chu kỳ chuẩn:**
  - **Phiên làm việc (Work Session):** 25 phút.
  - **Nghỉ ngắn (Short Break):** 5 phút.
  - **Nghỉ dài (Long Break):** 15 phút (tự động kích hoạt sau mỗi 4 phiên làm việc hoàn thành).
- **Quy tắc tính toán & Ghi nhận:**
  - Mỗi khi kết thúc đủ 25 phút làm việc, hệ thống gửi request `POST /api/v1/tasks/{id}/pomodoro/complete`.
  - Backend cập nhật vào task:
    - `pomodoro_sessions_completed = pomodoro_sessions_completed + 1`
    - `pomodoro_total_minutes = pomodoro_total_minutes + 25`
  - Nếu người dùng bấm Reset hoặc dừng giữa chừng khi chưa hết 25 phút, phiên đó **không được tính** là hoàn thành (đúng nguyên tắc kỷ luật Pomodoro).

---

### 3. Thiết Kế Cơ Sở Dữ Liệu & Flyway Migration

#### Script Flyway: `V5__add_my_day_and_pomodoro_columns.sql`
```sql
ALTER TABLE tasks
ADD COLUMN is_my_day BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Đánh dấu nằm trong kế hoạch hôm nay',
ADD COLUMN my_day_date DATE NULL COMMENT 'Ngày đưa vào My Day',
ADD COLUMN pomodoro_sessions_completed INT NOT NULL DEFAULT 0 COMMENT 'Số chu kỳ Pomodoro 25p đã hoàn thành',
ADD COLUMN pomodoro_total_minutes INT NOT NULL DEFAULT 0 COMMENT 'Tổng số phút làm việc Pomodoro';

CREATE INDEX idx_tasks_my_day ON tasks(user_id, my_day_date, is_my_day);
```

---

### 4. Chi Tiết API Contract

#### 4.1. `GET /api/v1/tasks/my-day` - Lấy Danh Sách Việc Trọng Tâm Hôm Nay & Gợi Ý
- **Headers:** `Authorization: Bearer <access_token>`
- **Response Success (HTTP 200 OK):**
```json
{
  "success": true,
  "code": 200,
  "errorCode": null,
  "message": "Lấy danh sách My Day thành công",
  "data": {
    "date": "2026-10-12",
    "tasks": [
      {
        "id": 101,
        "title": "Hoàn thành tài liệu kiến trúc hệ thống",
        "priority": "high",
        "status": "todo",
        "pomodoroSessionsCompleted": 2,
        "dueDate": "2026-10-12T18:00:00.000Z"
      }
    ],
    "suggestions": [
      {
        "id": 103,
        "title": "Gửi báo cáo công việc tuần",
        "priority": "medium",
        "reason": "Hạn chót là hôm nay"
      }
    ]
  },
  "errors": null,
  "timestamp": "2026-10-12T14:50:00.000Z"
}
```

#### 4.2. `PATCH /api/v1/tasks/{id}/my-day` - Thêm / Bớt Công Việc Khỏi My Day
- **Headers:** `Authorization: Bearer <access_token>`
- **Request Body:**
```json
{
  "isMyDay": true
}
```
- **Response Success (HTTP 200 OK):**
```json
{
  "success": true,
  "code": 200,
  "errorCode": null,
  "message": "Đã thêm công việc vào Kế hoạch hôm nay",
  "data": {
    "id": 103,
    "isMyDay": true,
    "myDayDate": "2026-10-12"
  },
  "errors": null,
  "timestamp": "2026-10-12T14:51:00.000Z"
}
```

#### 4.3. `POST /api/v1/tasks/{id}/pomodoro/complete` - Ghi Nhận Hoàn Thành 1 Phiên Pomodoro
- **Headers:** `Authorization: Bearer <access_token>`
- **Response Success (HTTP 200 OK):**
```json
{
  "success": true,
  "code": 200,
  "errorCode": null,
  "message": "Chúc mừng bạn đã hoàn thành 1 phiên Pomodoro tập trung!",
  "data": {
    "taskId": 101,
    "pomodoroSessionsCompleted": 3,
    "pomodoroTotalMinutes": 75
  },
  "errors": null,
  "timestamp": "2026-10-12T14:52:00.000Z"
}
```

---

### 5. Cấu Trúc Mã Nguồn Backend (`dylask-backend`)

Mã nguồn tổ chức tại module `com.dylask.modules.task`:

```
com.dylask.modules.task/
├── controller/
│   ├── TaskMyDayController.java             # API /api/v1/tasks/my-day
│   └── TaskPomodoroController.java          # API /api/v1/tasks/{id}/pomodoro/**
├── service/
│   ├── TaskMyDayService.java                # Interface lấy danh sách & gợi ý
│   ├── impl/TaskMyDayServiceImpl.java       # Logic lọc task hôm nay & clean slate
│   ├── TaskPomodoroService.java             # Interface ghi nhận phiên
│   └── impl/TaskPomodoroServiceImpl.java    # Logic cộng phiên & tính tổng phút
├── dto/
│   ├── request/
│   │   └── ToggleMyDayRequestDTO.java       # Record: boolean isMyDay
│   └── response/
│       ├── MyDayResponseDTO.java            # Record: date, tasks, suggestions
│       └── PomodoroSessionResultDTO.java    # Record: sessionsCompleted, totalMinutes
```

---

### 6. Cấu Trúc Mã Nguồn Frontend (`dylask-frontend`)

1. **Màn hình & Giao diện:**
   - Màn hình My Day: `src/pages/standard/MyDayPage.tsx`.
   - Widget Pomodoro Timer: `src/components/pomodoro/PomodoroWidget.tsx` (Thanh đếm giờ nổi hoặc gắn trên header).
   - Panel gợi ý việc: `src/components/task/MyDaySuggestionsDrawer.tsx`.
2. **Custom Hook `usePomodoroTimer`:**
   - Sử dụng Web Worker để đếm giây chính xác ngay cả khi tab trình duyệt bị ẩn/chuyển tab (tránh lỗi `setInterval` bị bóp nghẽn tài nguyên bởi trình duyệt).
   - Tích hợp Web Audio API phát tiếng "Ding" êm ái khi hoàn thành.
   - Gọi Notification API nếu người dùng cho phép hiển thị thông báo màn hình.

---

### 7. Tiêu Chí Nghiệm Thu & Ma Trận Kiểm Thử (Test Matrix)

| ID | Tình huống kiểm thử | Dữ liệu đầu vào | Kết quả mong đợi |
|---|---|---|---|
| **TC-POMO-01** | Thêm task vào My Day | `isMyDay = true` | HTTP 200 OK, `my_day_date` gán ngày hôm nay, task xuất hiện trong danh sách My Day. |
| **TC-POMO-02** | Xóa task khỏi My Day | `isMyDay = false` | HTTP 200 OK, `is_my_day` chuyển thành `false`, task rời khỏi danh sách My Day nhưng vẫn còn trong danh mục gốc. |
| **TC-POMO-03** | Reset tự động qua ngày (Clean Slate) | Task được gán My Day ngày hôm qua | Khi mở app vào ngày hôm sau, task không còn xuất hiện trong My Day mà xuất hiện trong danh sách gợi ý. |
| **TC-POMO-04** | Hoàn thành phiên Pomodoro 25p | Gọi API `/pomodoro/complete` | HTTP 200 OK, `pomodoro_sessions_completed` tăng thêm 1, `pomodoro_total_minutes` tăng thêm 25. |
| **TC-POMO-05** | Nghỉ dài sau 4 phiên | Đạt 4 phiên làm việc | Frontend tự động chuyển bộ đếm sang 15 phút Long Break. |
| **TC-POMO-06** | Timer chạy nền khi chuyển tab | Chuyển sang tab khác làm việc | Bộ đếm vẫn chạy mượt mà nhờ Web Worker, phát chuông đúng sau 25 phút. |
