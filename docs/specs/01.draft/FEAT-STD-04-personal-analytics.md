# Đặc Tả Kỹ Thuật Chi Tiết: FEAT-STD-04
## Thống Kê & Phân Tích Năng Suất Cá Nhân (Personal Productivity Analytics)

- **Mã tính năng:** `FEAT-STD-04`
- **Phân hệ:** Standard Mode (Năng suất cá nhân & Thói quen)
- **Trạng thái:** `01.draft` (Chờ người dùng review)
- **Độ ưu tiên:** `P2 (High - Hoàn thiện chu trình năng suất)`

---

### 1. Mục Tiêu (User Story)

Là người dùng cá nhân muốn theo dõi và nâng cao hiệu suất sinh hoạt, học tập và làm việc hàng ngày, tôi muốn xem bảng tổng hợp thống kê trực quan về:
1. **Tỷ lệ hoàn thành công việc (Completion Rate):** So sánh số việc tạo ra so với số việc đã hoàn tất theo tuần/tháng.
2. **Chuỗi ngày duy trì kỷ luật (Productivity Streaks 🔥):** Đếm số ngày liên tục hoàn thành ít nhất 1 công việc để tạo động lực duy trì thói quen tốt.
3. **Phân bổ thời gian & công việc theo danh mục (Category Distribution):** Biểu đồ thể hiện tỷ trọng công việc giữa Học tập, Công việc, Cá nhân, Gia đình.
4. **Hiệu suất Pomodoro & Giờ tập trung (Focus Hours):** Tổng số phiên tập trung 25 phút đã hoàn thành, tổng số giờ làm việc sâu (Deep Work) và khung giờ tập trung nhiều nhất trong ngày.

Toàn bộ tính năng thống kê vận hành bằng **truy vấn tổng hợp dữ liệu SQL (Aggregation Queries)** trên CSDL MySQL nội bộ, hoàn toàn **miễn phí và không tốn chi phí vận hành AI**.

---

### 2. Luồng Nghiệp Vụ & Sơ Đồ Xử Lý (Business Flow Diagram)

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│             SƠ ĐỒ LUỒNG PHÂN TÍCH & THỐNG KÊ NĂNG SUẤT CÁ NHÂN (STANDARD MODE)         │
└────────────────────────────────────────────────────────────────────────────────────────┘

  [ NGƯỜI DÙNG TRUY CẬP TRANG THỐNG KÊ ]
                   │
                   │ (1) Mở menu "Thống kê cá nhân" (Personal Analytics)
                   ▼
  ┌────────────────────────────────────────────────────────┐
  │              Client UI: PersonalAnalyticsPage          │
  │ • Chọn bộ lọc thời gian: 7 ngày qua / Tháng này / Quý  │
  │ • Hiển thị khung chờ tải dữ liệu (Skeleton Loading)   │
  └──────────────────────────┬─────────────────────────────┘
                             │
                             │ (2) GET /api/v1/analytics/personal/overview?range=week
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │                 PersonalAnalyticsController            │
  │ • Trích xuất userId từ JWT SecurityContext             │
  │ • Chuyển tiếp tham số ngày bắt đầu & kết thúc          │
  └──────────────────────────┬─────────────────────────────┘
                             │
                             │ (3) Gọi PersonalAnalyticsService.getPersonalOverview()
                             ▼
  ┌────────────────────────────────────────────────────────────────────────────────┐
  │                        CÁC TRUY VẤN TỔNG HỢP SQL (AGGREGATION)                 │
  │ 1. Đếm tổng task, task hoàn thành, task trễ hạn (tasks table)                  │
  │ 2. Tính chuỗi ngày liên tục hoàn thành task (Streak Algorithm)                 │
  │ 3. Gom nhóm theo Category (categories JOIN tasks)                              │
  │ 4. Gom nhóm Pomodoro sessions & phút tập trung theo ngày (task_work_logs)      │
  └──────────────────────────┬─────────────────────────────────────────────────────┘
                             │
                             │ (4) Đóng gói DTO & Trả về ApiResponse<PersonalAnalyticsDTO>
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │             GIAO DIỆN TRỰC QUAN HÓA (SVG & CSS)        │
  │ • Thẻ chỉ số KPI: Tỷ lệ 85% | 7 ngày Streak 🔥 | 14.5h │
  │ • Biểu đồ tròn Donut phân bổ danh mục (SVG thuần)      │
  │ • Biểu đồ cột Hoàn thành vs Tạo mới theo từng ngày tuần│
  │ • Biểu đồ đường Lịch sử giờ tập trung Pomodoro         │
  └────────────────────────────────────────────────────────┘
```

#### 2.1. Quy tắc tính toán & Thuật toán

##### A. Thuật toán tính Streak (Chuỗi ngày kỷ luật liên tiếp)
- Một ngày được tính là **"Ngày thành công" (Active Productive Day)** nếu:
  - Có ít nhất một task được chuyển trạng thái sang `done` trong ngày đó (`completed_at::date = DATE`).
  - HOẶC có ít nhất 1 phiên Pomodoro (25 phút) hoàn thành trong ngày đó.
- **Tính chuỗi liên tiếp (Current Streak):**
  - Quét ngược từ hôm nay (`CURRENT_DATE`): Nếu hôm nay chưa có task nào hoàn thành, tạm thời kiểm tra ngày hôm qua (`CURRENT_DATE - 1 day`).
  - Nếu ngày hôm qua không có task nào hoàn thành $\rightarrow$ `currentStreak = 0`.
  - Nếu ngày hôm qua có task hoàn thành $\rightarrow$ tiếp tục lùi dần từng ngày cho đến khi gặp ngày đứt quãng đầu tiên.
  - Tổng số ngày liên tục đếm được là `currentStreak`.
- **Kỷ lục chuỗi (Longest Streak):** Quét toàn bộ lịch sử hoàn thành task của user để tìm chuỗi ngày liên tiếp dài nhất từng đạt được.

##### B. Phân bổ công việc theo danh mục (Category Breakdown)
- Tỷ lệ phần trăm (%): `(Số task thuộc danh mục X / Tổng số task trong khoảng thời gian) * 100`.
- Task không gán danh mục được gom vào nhóm *"Không phân loại" (Uncategorized)*.

##### C. Thống kê Pomodoro & Giờ làm việc sâu (Deep Work)
- Dựa trên dữ liệu ghi nhận tại bảng `task_work_logs` (loại `log_type = 'POMODORO'`) và các cột `pomodoro_sessions_completed`, `pomodoro_total_minutes` trong bảng `tasks`.
- Quy đổi: `Giờ tập trung = Tổng số phút Pomodoro / 60` (làm tròn 1 chữ số thập phân).
- Khung giờ vàng (Peak Focus Hour): Nhóm các phiên Pomodoro theo `HOUR(started_at)` (từ 0h - 23h) để tìm khung 2 giờ trong ngày có số phiên Pomodoro cao nhất (ví dụ: 09:00 - 11:00 sáng).

---

### 3. Thiết Kế Cơ Sở Dữ Liệu & Truy Vấn Tối Ưu

Tính năng tận dụng cấu trúc CSDL hiện có (`tasks`, `categories`, `task_work_logs`), bổ sung thêm index tối ưu hóa cho truy vấn thống kê theo ngày.

#### Script Flyway: `V14__add_analytics_performance_indexes.sql`
```sql
-- Đánh index phục vụ truy vấn thống kê nhanh theo user và thời gian hoàn thành
CREATE INDEX idx_tasks_user_completed_at ON tasks(user_id, completed_at, status);
CREATE INDEX idx_tasks_user_created_at ON tasks(user_id, created_at);

-- Đánh index cho bảng nhật ký làm việc / Pomodoro
CREATE INDEX idx_worklogs_user_started ON task_work_logs(user_id, started_at, log_type);
```

#### Các truy vấn SQL cốt lõi (Không dùng AI, tốc độ < 15ms):

##### 1. Tổng quan số lượng & Tỷ lệ hoàn thành:
```sql
SELECT 
    COUNT(*) AS total_tasks,
    COUNT(CASE WHEN status = 'done' THEN 1 END) AS completed_tasks,
    COUNT(CASE WHEN status != 'done' AND due_date < NOW() THEN 1 END) AS overdue_tasks,
    ROUND(COUNT(CASE WHEN status = 'done' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 1) AS completion_rate
FROM tasks
WHERE user_id = :userId 
  AND created_at >= :startDate AND created_at <= :endDate
  AND deleted_at IS NULL;
```

##### 2. Phân bổ theo danh mục:
```sql
SELECT 
    COALESCE(c.id, 0) AS category_id,
    COALESCE(c.name, 'Chưa phân loại') AS category_name,
    COALESCE(c.color, '#6E7681') AS category_color,
    COUNT(t.id) AS task_count,
    COUNT(CASE WHEN t.status = 'done' THEN 1 END) AS completed_count
FROM tasks t
LEFT JOIN categories c ON t.category_id = c.id
WHERE t.user_id = :userId 
  AND t.created_at >= :startDate AND t.created_at <= :endDate
  AND t.deleted_at IS NULL
GROUP BY c.id, c.name, c.color
ORDER BY task_count DESC;
```

##### 3. Thống kê tiến độ 7 ngày gần nhất (Daily Completion Trend):
```sql
SELECT 
    DATE(t.completed_at) AS date_point,
    COUNT(*) AS completed_count
FROM tasks t
WHERE t.user_id = :userId 
  AND t.status = 'done'
  AND t.completed_at >= DATE_SUB(CURRENT_DATE, INTERVAL 6 DAY)
GROUP BY DATE(t.completed_at)
ORDER BY date_point ASC;
```

---

### 4. API Contract Chi Tiết

#### 4.1. Lấy thông số tổng quan & Streak cá nhân
- **Endpoint:** `GET /api/v1/analytics/personal/overview`
- **Query Params:**
  - `range` (string, optional): `week` (mặc định - 7 ngày gần nhất), `month` (30 ngày), `year` (năm nay).
- **Header:** `Authorization: Bearer <jwt_token>`

##### Response Thành công (HTTP 200 OK):
```json
{
  "success": true,
  "code": 200,
  "message": "Lấy dữ liệu thống kê cá nhân thành công",
  "data": {
    "dateRange": {
      "from": "2026-10-06T00:00:00Z",
      "to": "2026-10-12T23:59:59Z",
      "rangeType": "week"
    },
    "kpis": {
      "totalCreated": 28,
      "totalCompleted": 23,
      "overdueTasks": 2,
      "completionRate": 82.1,
      "currentStreakDays": 7,
      "longestStreakDays": 19,
      "totalFocusMinutes": 550,
      "totalFocusHours": 9.2,
      "pomodoroSessions": 22
    },
    "dailyTrend": [
      { "date": "2026-10-06", "dayOfWeek": "Thứ 2", "created": 4, "completed": 3, "pomodoroMinutes": 75 },
      { "date": "2026-10-07", "dayOfWeek": "Thứ 3", "created": 5, "completed": 5, "pomodoroMinutes": 100 },
      { "date": "2026-10-08", "dayOfWeek": "Thứ 4", "created": 3, "completed": 2, "pomodoroMinutes": 50 },
      { "date": "2026-10-09", "dayOfWeek": "Thứ 5", "created": 6, "completed": 4, "pomodoroMinutes": 100 },
      { "date": "2026-10-10", "dayOfWeek": "Thứ 6", "created": 4, "completed": 4, "pomodoroMinutes": 75 },
      { "date": "2026-10-11", "dayOfWeek": "Thứ 7", "created": 3, "completed": 3, "pomodoroMinutes": 75 },
      { "date": "2026-10-12", "dayOfWeek": "Chủ nhật", "created": 3, "completed": 2, "pomodoroMinutes": 75 }
    ],
    "categoryBreakdown": [
      { "categoryId": 1, "name": "Công việc", "color": "#0F766E", "taskCount": 12, "percentage": 42.9 },
      { "categoryId": 2, "name": "Học tập", "color": "#2563EB", "taskCount": 8, "percentage": 28.6 },
      { "categoryId": 3, "name": "Cá nhân", "color": "#D97706", "taskCount": 5, "percentage": 17.9 },
      { "categoryId": 0, "name": "Khác", "color": "#6B6A63", "taskCount": 3, "percentage": 10.6 }
    ],
    "peakFocusHours": {
      "slot": "09:00 - 11:00",
      "description": "Bạn đạt độ tập trung cao nhất vào buổi sáng"
    }
  },
  "timestamp": "2026-10-12T21:30:00Z"
}
```

---

### 5. Kiến Trúc Backend (`dylask-backend`)

Tuân thủ kiến trúc **Modular Monolith**:
```text
com.dylask.modules.analytics.personal/
├── controller/
│   └── PersonalAnalyticsController.java
├── service/
│   ├── PersonalAnalyticsService.java
│   └── impl/PersonalAnalyticsServiceImpl.java
├── repository/
│   └── PersonalAnalyticsRepository.java (Spring Data JPA @Query Native / JPQL)
└── dto/
    ├── PersonalAnalyticsOverviewResponse.java
    ├── DailyProductivityTrendDTO.java
    └── CategoryShareDTO.java
```

#### Phương thức xử lý trong Service:
- `PersonalAnalyticsOverviewResponse getOverview(Long userId, String rangeType)`
  - Xác định `startDate` và `endDate` theo timezone UTC+7 của user.
  - Gọi Repository lấy KPI và Gom nhóm danh mục.
  - Tính toán thuật toán Streak bằng phương thức phụ trợ `calculateStreak(Long userId, LocalDate today)`.

---

### 6. Giao Diện & Frontend Implementation (`dylask-frontend`)

#### 6.1. Cấu trúc Component
- `src/pages/standard/PersonalAnalyticsPage.tsx`: Màn hình điều phối chính.
- `src/components/analytics/MetricCard.tsx`: Thẻ hiển thị chỉ số (Completion Rate, Streak 🔥, Giờ tập trung).
- `src/components/analytics/CategoryDonutChart.tsx`: Biểu đồ Donut vẽ bằng SVG thuần (stroke-dasharray), không cần cài thư viện Chart.js cồng kềnh.
- `src/components/analytics/WeeklyBarChart.tsx`: Biểu đồ cột SVG so sánh task tạo mới vs hoàn thành.
- `src/hooks/usePersonalAnalytics.ts`: Custom hook tải và lọc dữ liệu theo khoảng thời gian.

#### 6.2. Thiết Kế Trực Quan Tuân Thủ Dylask Design Tokens
- **Màu sắc Standard Mode:** Nền `#FAFAF7`, Thẻ `#FFFFFF`, Đường viền `#E7E5E0`, Màu chủ đạo `#0F766E` (Dark Teal).
- **Huy hiệu Streak:** Nhãn cam nhạt `--priority-medium-bg: #FFFBEB`, chữ `--priority-medium: #F59E0B` kèm icon ngọn lửa 🔥.
- **Không sử dụng box-shadow:** `--box-shadow: none`, các thẻ phẳng hoàn toàn (Flat & Crisp).

---

### 7. Ma Trận Kiểm Thử Tự Động (Test Matrix)

| Test ID | Tình huống kiểm thử | Dữ liệu đầu vào | Kết quả mong đợi |
|---|---|---|---|
| `TC-ANL-STD-01` | Lấy thống kê tuần của user có dữ liệu | `range = 'week'`, token hợp lệ | Trả về 200 OK, đầy đủ 7 ngày `dailyTrend`, tỷ lệ % cộng lại = 100%. |
| `TC-ANL-STD-02` | User mới tạo chưa có task nào | `range = 'week'`, user mới | Trả về 200 OK, `completionRate = 0`, `currentStreakDays = 0`, không bị lỗi chia cho 0. |
| `TC-ANL-STD-03` | Tính đúng Streak khi user bỏ lỡ 1 ngày | Hoàn thành task ngày T-2, T-1 không có, hôm nay T có task | `currentStreakDays = 1` (chuỗi bị đứt và tính lại từ hôm nay). |
| `TC-ANL-STD-04` | Tính đúng Streak khi hôm nay chưa xong task nào | Ngày T-1 xong task, hôm nay T chưa xong task | `currentStreakDays` vẫn giữ nguyên chuỗi cũ (chưa bị reset cho đến hết ngày). |
| `TC-ANL-STD-05` | Lọc phân bổ danh mục có task chưa gán danh mục | Task `category_id = NULL` | Gom vào danh mục ID 0 mang tên "Chưa phân loại" / "Khác". |
| `TC-ANL-STD-06` | Bảo mật phân quyền dữ liệu người dùng | User A truy cập API thống kê | Tuyệt đối chỉ đọc dữ liệu của `User A`, không lẫn lộn dữ liệu `User B`. |
