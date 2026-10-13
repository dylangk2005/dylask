# Đặc Tả Kỹ Thuật Chi Tiết: FEAT-DEV-05
## Đo Lường Kỹ Thuật & Báo Cáo Agile Sprint (Agile Metrics & Engineering Reports)

- **Mã tính năng:** `FEAT-DEV-05`
- **Phân hệ:** Developer Mode (Agile, Sprint Metrics & Engineering Efficiency)
- **Trạng thái:** `01.draft` (Chờ người dùng review)
- **Độ ưu tiên:** `P2 (High - Hoàn thiện chu trình Agile/Scrum)`

---

### 1. Mục Tiêu (User Story)

Là Tech Lead, Scrum Master hoặc Lập trình viên trong dự án phần mềm, tôi muốn xem các chỉ số đo lường hiệu suất phát triển Agile một cách tự động, bao gồm:
1. **Biểu đồ Burndown Sprint (Sprint Burndown Chart):** So sánh đường công số lý tưởng (Ideal Story Points) với đường thực tế (Actual Remaining Points) theo từng ngày trong chu kỳ Sprint để phát hiện sớm nguy cơ trễ hạn.
2. **Tốc độ hoàn thành nhóm (Team Velocity):** Biểu đồ so sánh số Story Points cam kết (Committed Points) so với số Story Points thực tế hoàn thành (Completed Points) qua các Sprint liên tiếp để lập kế hoạch chính xác hơn.
3. **Độ chính xác ước lượng công việc (Estimation Accuracy):** So sánh giữa giờ dự toán (`estimated_hours`) và giờ làm việc thực tế (`actual_hours`) theo từng thành viên và theo loại công việc (Feature, Bug, Refactor).
4. **Chu kỳ hoàn thành (Lead Time & Cycle Time):** Thời gian trung bình một task chuyển từ lúc tạo đến lúc hoàn thành (`Lead Time`) và từ lúc bắt đầu làm đến khi kết thúc (`Cycle Time`).

Toàn bộ hệ thống đo lường vận hành dựa trên **sự kiện cập nhật task, work log và trạng thái Sprint nội bộ**, hoàn toàn **không tốn chi phí vận hành AI**.

---

### 2. Luồng Nghiệp Vụ & Sơ Đồ Xử Lý (Business Flow Diagram)

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│               SƠ ĐỒ LUỒNG ĐO LƯỜNG & BÁO CÁO AGILE SPRINT (DEVELOPER MODE)             │
└────────────────────────────────────────────────────────────────────────────────────────┘

  [ TECH LEAD / DEVELOPER TRUY CẬP TAB BÁO CÁO DỰ ÁN ]
                         │
                         │ (1) Mở menu "Báo cáo & Thống kê Sprint" (Agile Reports)
                         ▼
  ┌────────────────────────────────────────────────────────┐
  │              Client UI: AgileMetricsDashboard          │
  │ • Lựa chọn Sprint đang kích hoạt (Active Sprint)       │
  │ • Hoặc chọn so sánh lịch sử 5 Sprint gần nhất         │
  └──────────────────────────┬─────────────────────────────┘
                             │
                             │ (2) GET /api/v1/projects/{pId}/sprints/{sId}/burndown
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │                 SprintMetricsController                │
  │ • Kiểm tra quyền thành viên trong Project              │
  │ • Truy xuất mốc thời gian Sprint (startDate, endDate)   │
  └──────────────────────────┬─────────────────────────────┘
                             │
                             │ (3) Gọi SprintMetricsService.getBurndownData()
                             ▼
  ┌────────────────────────────────────────────────────────────────────────────────┐
  │                    TÍNH TOÁN DỮ LIỆU BURNDOWN & SNAPSHOT HÀNG NGÀY             │
  │ • Tổng Story Points ban đầu lúc Sprint bắt đầu (Committed Scope)               │
  │ • Đường lý tưởng: Ideal(day) = TotalPoints - (TotalPoints / TotalDays) * day   │
  │ • Đường thực tế: Điểm còn lại tính đến cuối mỗi ngày (Remaining Points)       │
  │ • Nhận diện Scope Creep (Task mới thêm vào giữa chừng Sprint)                  │
  └──────────────────────────┬─────────────────────────────────────────────────────┘
                             │
                             │ (4) Trả về ApiResponse<SprintBurndownDTO>
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │        TRỰC QUAN HÓA BẢNG ĐIỀU KHIỂN KỸ THUẬT (SVG)    │
  │ • Biểu đồ Burndown: Đường đứt nét (Ideal) vs Đậm (Real)│
  │ • Biểu đồ Velocity: Cột đôi Committed vs Completed    │
  │ • Bảng phân tích: Giờ dự toán vs Giờ log thực tế       │
  │ • Phân bổ tỷ lệ Task vs Bugfix vs Refactor             │
  └────────────────────────────────────────────────────────┘
```

#### 2.1. Quy tắc Tính toán Agile Metrics

##### A. Sprint Burndown Chart (Biểu đồ tiêu hao công số)
- **Tổng số ngày Sprint ($N$):** Tính từ `start_date` đến `end_date` (không tính thứ 7 và CN nếu dự án bật cấu hình `skip_weekends`).
- **Đường lý tưởng (Ideal Burndown):**
  $$\text{IdealPoints}(d) = \text{TotalCommittedPoints} - \left( \frac{\text{TotalCommittedPoints}}{N} \times d \right)$$
- **Đường thực tế (Actual Remaining Points):**
  - Vào thời điểm ngày $d$, điểm còn lại là tổng `story_points` của tất cả task thuộc Sprint có trạng thái chưa `Done` tại thời điểm 23:59:59 của ngày $d$.
  - Nếu có task mới thêm vào Sprint sau khi Sprint đã bắt đầu $\rightarrow$ đường thực tế có bước nhảy lên (Scope Creep).

##### B. Team Velocity (Tốc độ hoàn thành của đội nhóm)
- Tính toán trên tối thiểu 3 đến 5 Sprint đã đóng (`status = 'closed'`).
- `Committed Points`: Tổng Story Points của các task nằm trong Sprint tại thời điểm bấm nút *"Bắt đầu Sprint"* (`start_date`).
- `Completed Points`: Tổng Story Points của các task đạt trạng thái `Done` trước hoặc đúng thời điểm Sprint kết thúc.
- `Average Velocity`: Trung bình cộng `Completed Points` qua $K$ Sprint gần nhất. Dùng làm cơ sở khuyến nghị số Story Points tối ưu cho Sprint tiếp theo.

##### C. Độ chính xác ước lượng (Estimation vs Actual Ratio)
- Công thức tỷ lệ:
  $$\text{Accuracy Ratio} = \frac{\text{Actual Hours Logged}}{\text{Estimated Hours}} \times 100\%$$
  - Tỷ lệ $= 100\%$: Ước lượng hoàn hảo.
  - Tỷ lệ $> 120\%$: Ước lượng thiếu (Under-estimated), phát sinh chi phí tiềm ẩn.
  - Tỷ lệ $< 80\%$: Ước lượng dư (Over-estimated).

##### D. Lead Time & Cycle Time
- **Lead Time:** Thời gian từ lúc tạo thẻ task (`created_at`) $\rightarrow$ lúc hoàn thành (`completed_at`).
- **Cycle Time:** Thời gian từ lúc chuyển sang `in_progress` lần đầu tiên $\rightarrow$ lúc hoàn thành (`completed_at`). Đơn vị: Giờ làm việc (Working Hours).

---

### 3. Thiết Kế Cơ Sở Dữ Liệu & Snapshot Tự Động

Để biểu đồ Burndown chạy siêu nhanh mà không phải quét ngược toàn bộ lịch sử Audit Log phức tạp mỗi khi truy vấn, hệ thống sử dụng bảng lưu trữ ảnh chụp nhanh hàng ngày (Daily Sprint Snapshot).

#### Script Flyway: `V15__create_sprint_metrics_tables.sql`
```sql
-- Bảng lưu trữ ảnh chụp tiến độ Sprint hàng ngày (Chạy bằng Spring Scheduler lúc 23:59 mỗi đêm)
CREATE TABLE sprint_daily_snapshots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sprint_id BIGINT NOT NULL,
    snapshot_date DATE NOT NULL,
    total_story_points INT NOT NULL DEFAULT 0,
    remaining_story_points INT NOT NULL DEFAULT 0,
    completed_story_points INT NOT NULL DEFAULT 0,
    total_tasks INT NOT NULL DEFAULT 0,
    remaining_tasks INT NOT NULL DEFAULT 0,
    completed_tasks INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_snapshot_sprint FOREIGN KEY (sprint_id) REFERENCES sprints(id) ON DELETE CASCADE,
    UNIQUE KEY uk_sprint_snapshot_date (sprint_id, snapshot_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_snapshot_sprint_date ON sprint_daily_snapshots(sprint_id, snapshot_date);
```

#### Truy vấn SQL trích xuất Velocity của dự án:
```sql
SELECT 
    s.id AS sprint_id,
    s.name AS sprint_name,
    s.start_date,
    s.end_date,
    COALESCE(SUM(t.story_points), 0) AS total_committed_points,
    COALESCE(SUM(CASE WHEN t.status = 'done' THEN t.story_points ELSE 0 END), 0) AS completed_points
FROM sprints s
LEFT JOIN tasks t ON t.sprint_id = s.id AND t.deleted_at IS NULL
WHERE s.project_id = :projectId AND s.status IN ('active', 'closed')
GROUP BY s.id, s.name, s.start_date, s.end_date
ORDER BY s.start_date ASC
LIMIT 10;
```

---

### 4. API Contract Chi Tiết

#### 4.1. Lấy dữ liệu Burndown Chart cho 1 Sprint
- **Endpoint:** `GET /api/v1/projects/{projectId}/sprints/{sprintId}/burndown`
- **Header:** `Authorization: Bearer <jwt_token>`

##### Response Thành công (HTTP 200 OK):
```json
{
  "success": true,
  "code": 200,
  "message": "Lấy dữ liệu Burndown thành công",
  "data": {
    "sprintId": 12,
    "sprintName": "Sprint 3 - API & Kanban Core",
    "startDate": "2026-10-01",
    "endDate": "2026-10-14",
    "totalDays": 14,
    "currentDay": 12,
    "totalCommittedPoints": 42,
    "currentRemainingPoints": 8,
    "burndownPoints": [
      { "date": "2026-10-01", "dayIndex": 1, "idealPoints": 42.0, "actualPoints": 42, "event": "Sprint Started" },
      { "date": "2026-10-03", "dayIndex": 3, "idealPoints": 36.0, "actualPoints": 38, "event": null },
      { "date": "2026-10-06", "dayIndex": 6, "idealPoints": 27.0, "actualPoints": 32, "event": "Task added (+3 SP)" },
      { "date": "2026-10-09", "dayIndex": 9, "idealPoints": 18.0, "actualPoints": 19, "event": null },
      { "date": "2026-10-12", "dayIndex": 12, "idealPoints": 9.0, "actualPoints": 8, "event": null },
      { "date": "2026-10-14", "dayIndex": 14, "idealPoints": 0.0, "actualPoints": null, "event": "Sprint End" }
    ],
    "statusSummary": {
      "isAheadOfSchedule": true,
      "variancePoints": -1.0,
      "message": "Sprint đang nhanh hơn tiến độ lý tưởng 1 Story Point"
    }
  },
  "timestamp": "2026-10-12T21:32:00Z"
}
```

#### 4.2. Lấy dữ liệu Velocity & Báo cáo so sánh các Sprint
- **Endpoint:** `GET /api/v1/projects/{projectId}/metrics/velocity`
- **Header:** `Authorization: Bearer <jwt_token>`

##### Response Thành công (HTTP 200 OK):
```json
{
  "success": true,
  "code": 200,
  "message": "Lấy chỉ số Velocity thành công",
  "data": {
    "projectId": 1,
    "averageVelocity": 38.5,
    "recommendedPointsNextSprint": 38,
    "sprintHistory": [
      { "sprintId": 10, "name": "Sprint 1", "committedPoints": 35, "completedPoints": 32, "completionRate": 91.4 },
      { "sprintId": 11, "name": "Sprint 2", "committedPoints": 40, "completedPoints": 39, "completionRate": 97.5 },
      { "sprintId": 12, "name": "Sprint 3", "committedPoints": 42, "completedPoints": 34, "completionRate": 80.9 }
    ]
  },
  "timestamp": "2026-10-12T21:32:00Z"
}
```

#### 4.3. Lấy độ chính xác ước lượng công số (Estimation Accuracy)
- **Endpoint:** `GET /api/v1/projects/{projectId}/metrics/estimation`
- **Header:** `Authorization: Bearer <jwt_token>`

##### Response Thành công (HTTP 200 OK):
```json
{
  "success": true,
  "code": 200,
  "message": "Lấy dữ liệu ước lượng thành công",
  "data": {
    "overallAccuracyPercentage": 92.4,
    "totalEstimatedHours": 160.0,
    "totalActualHours": 172.5,
    "byWorkType": [
      { "type": "FEATURE", "estimatedHours": 110.0, "actualHours": 118.0, "ratio": 107.2 },
      { "type": "BUG", "estimatedHours": 30.0, "actualHours": 38.5, "ratio": 128.3 },
      { "type": "REFACTOR", "estimatedHours": 20.0, "actualHours": 16.0, "ratio": 80.0 }
    ],
    "averageCycleTimeHours": 18.4,
    "averageLeadTimeHours": 42.1
  },
  "timestamp": "2026-10-12T21:32:00Z"
}
```

---

### 5. Kiến Trúc Backend (`dylask-backend`)

Tuân thủ kiến trúc **Modular Monolith**:
```text
com.dylask.modules.analytics.developer/
├── controller/
│   └── DeveloperMetricsController.java
├── service/
│   ├── DeveloperMetricsService.java
│   └── impl/DeveloperMetricsServiceImpl.java
├── job/
│   └── SprintDailySnapshotJob.java (Scheduled @Scheduled(cron = "0 59 23 * * *"))
├── repository/
│   ├── SprintDailySnapshotRepository.java
│   └── DeveloperMetricsRepository.java
└── dto/
    ├── SprintBurndownResponse.java
    ├── VelocityReportResponse.java
    └── EstimationAccuracyResponse.java
```

---

### 6. Giao Diện & Frontend Implementation (`dylask-frontend`)

#### 6.1. Cấu trúc Component
- `src/pages/developer/AgileMetricsPage.tsx`: Màn hình tổng hợp dashboard kỹ thuật.
- `src/components/developer/metrics/BurndownSvgChart.tsx`: Biểu đồ đường Burndown biểu diễn bằng SVG thuần (polyline / path) với tooltip xem điểm từng ngày.
- `src/components/developer/metrics/VelocityBarChart.tsx`: Biểu đồ so sánh cột đôi (Committed vs Completed).
- `src/components/developer/metrics/EstimationAccuracyTable.tsx`: Bảng kê khai chi tiết giờ ước tính vs giờ thực tế theo loại task.
- `src/hooks/useSprintMetrics.ts`: Hook gọi API và quản lý state chọn Sprint.

#### 6.2. Thiết Kế Trực Quan Developer Mode
- **Màu sắc Dark Theme:** Nền tối `#0E1116`, Thẻ Surface `#161B22`, Viền `#262C36`.
- **Primary Color:** Cyan/Teal sáng `#2DD4BF`.
- **Đường Burndown:** Đường lý tưởng nét đứt màu xám nhạt (`#8B949E`, `stroke-dasharray="4 4"`), đường thực tế nét liền màu Cyan sáng (`#2DD4BF`, `stroke-width="2.5"`).
- **Font chữ:** Dùng `JetBrains Mono` cho các chỉ số công số, Story Points, giờ và tỷ lệ %.

---

### 7. Ma Trận Kiểm Thử Tự Động (Test Matrix)

| Test ID | Tình huống kiểm thử | Dữ liệu đầu vào | Kết quả mong đợi |
|---|---|---|---|
| `TC-ANL-DEV-01` | Lấy dữ liệu Burndown của Sprint hợp lệ | `projectId = 1, sprintId = 12` | Trả về 200 OK, mảng `burndownPoints` từ ngày 1 đến ngày kết thúc, tính đúng điểm lý tưởng dốc xuống 0. |
| `TC-ANL-DEV-02` | Sprint có task mới thêm vào giữa chu kỳ | Ngày 6 thêm task 3 SP | `actualPoints` ngày 6 tăng lên tương ứng (nhận diện Scope Creep). |
| `TC-ANL-DEV-03` | Tính toán Velocity qua nhiều Sprint | Dự án có 3 Sprint đã đóng | Trả về trung bình chính xác, đúng số điểm cam kết vs hoàn thành. |
| `TC-ANL-DEV-04` | Task không ước lượng số giờ (`estimated_hours = NULL`) | Tính tỷ lệ chính xác | Coi như 0 hoặc lọc bỏ khỏi mẫu chia, không để xảy ra lỗi chia cho NULL/0. |
| `TC-ANL-DEV-05` | Job Cron chụp snapshot ban đêm | 23:59:00 hàng ngày | Ghi nhận bản ghi snapshot vào `sprint_daily_snapshots`, không bị trùng lặp khóa (Idempotent). |
| `TC-ANL-DEV-06` | Phân quyền truy cập theo Project | User không phải thành viên dự án | Trả về `403 Forbidden` (`ACCESS_DENIED`). |
