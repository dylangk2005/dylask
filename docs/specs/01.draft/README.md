# Thư Mục Specs Đang Chờ Duyệt (Draft Specs)

Tất cả các tài liệu đặc tả ở đây đang ở trạng thái **DRAFT (Đang soạn thảo / Chờ review)**.

---

## 🚦 Quy trình duyệt và triển khai:
1. Bạn mở từng file spec trong thư mục `01.draft/` này để đọc và review.
2. Nếu đồng ý với nội dung của tính năng nào, bạn di chuyển file đó sang thư mục **[`02.approved/`](../02.approved/)**.
3. Khi bạn yêu cầu AI code, AI **CHỈ ĐƯỢC PHÉP** đọc và lập trình các tính năng nằm trong `02.approved/`.
4. Sau khi AI lập trình xong và test pass, file spec đó sẽ được di chuyển sang **[`03.archive/`](../03.archive/)**.

---

## 🏛️ Tài liệu tiêu chuẩn nền tảng dùng chung (Foundation Specs):
- **[`api-specs.md`](../api-specs.md):** Chuẩn cấu trúc phản hồi `ApiResponse<T>`, phân trang `PageResponse<T>`, mã lỗi `ErrorCode` và Global Exception Handler.
- **[`database-specs.md`](../database-specs.md):** Chuẩn naming convention MySQL 8.4, quy tắc Flyway Migration, Audit columns và ánh xạ JPA Entity.
- **[`feature-specifications.md`](../feature-specifications.md):** Tổng quan kiến trúc nghiệp vụ, triết lý Dual-Mode và chính sách AI (BYOK + 10 lượt thử/tháng).

---

## 📋 Danh sách các Specs đang chờ review:

| Mã tính năng | Tên tính năng | File Spec | Trạng thái |
|---|---|---|---|
| **`FEAT-AUTH-01`** | Đăng ký, Đăng nhập & Xác thực JWT | [`FEAT-AUTH-01-jwt-authentication.md`](./FEAT-AUTH-01-jwt-authentication.md) | `Draft - Chờ duyệt` |
| **`FEAT-AUTH-02`** | Quản lý Hồ sơ & Toggle Dual-Mode | [`FEAT-AUTH-02-dual-mode-toggle.md`](./FEAT-AUTH-02-dual-mode-toggle.md) | `Draft - Chờ duyệt` |
| **`FEAT-STD-01`** | CRUD Task cá nhân & Subtask Checklists | [`FEAT-STD-01-core-task-and-checklists.md`](./FEAT-STD-01-core-task-and-checklists.md) | `Draft - Chờ duyệt` |
| **`FEAT-STD-02`** | Lịch trình & Task lặp lại định kỳ | [`FEAT-STD-02-calendar-and-recurring.md`](./FEAT-STD-02-calendar-and-recurring.md) | `Draft - Chờ duyệt` |
| **`FEAT-STD-03`** | Kế hoạch hôm nay (My Day) & Đồng hồ Pomodoro | [`FEAT-STD-03-my-day-and-pomodoro.md`](./FEAT-STD-03-my-day-and-pomodoro.md) | `Draft - Chờ duyệt` |
| **`FEAT-STD-04`** | Thống kê & Phân tích Năng suất Cá nhân (Streak, Pomodoro) | [`FEAT-STD-04-personal-analytics.md`](./FEAT-STD-04-personal-analytics.md) | `Draft - Chờ duyệt` |
| **`FEAT-STD-05`** | Lập Kế Hoạch Tuần, Phân Bổ Công Việc & Chế Độ Xem Chuyên Biệt | [`FEAT-STD-05-weekly-planning-and-smart-scheduler.md`](./FEAT-STD-05-weekly-planning-and-smart-scheduler.md) | `Draft - Chờ duyệt` |
| **`FEAT-DEV-01`** | Bảng Kanban kéo thả, Sprint & Story Points | [`FEAT-DEV-01-sprint-kanban-board.md`](./FEAT-DEV-01-sprint-kanban-board.md) | `Draft - Chờ duyệt` |
| **`FEAT-DEV-02`** | Markdown Editor, Command Palette (`Ctrl+K`) & Focus Coding | [`FEAT-DEV-02-markdown-and-command-palette.md`](./FEAT-DEV-02-markdown-and-command-palette.md) | `Draft - Chờ duyệt` |
| **`FEAT-DEV-03`** | Tự động hóa Git Branch & Webhook GitHub/GitLab | [`FEAT-DEV-03-git-webhooks-automation.md`](./FEAT-DEV-03-git-webhooks-automation.md) | `Draft - Chờ duyệt` |
| **`FEAT-DEV-04`** | Threaded Comments, Async Standup & Audit Log | [`FEAT-DEV-04-team-collaboration.md`](./FEAT-DEV-04-team-collaboration.md) | `Draft - Chờ duyệt` |
| **`FEAT-DEV-05`** | Đo Lường Kỹ Thuật & Báo Cáo Agile (Burndown, Velocity) | [`FEAT-DEV-05-agile-metrics-and-reports.md`](./FEAT-DEV-05-agile-metrics-and-reports.md) | `Draft - Chờ duyệt` |
| **`FEAT-AI-01`** | Cấu hình AI, 10 Lượt Dùng Thử/Tháng & Khóa Riêng (BYOK) | [`FEAT-AI-01-ai-settings-byok.md`](./FEAT-AI-01-ai-settings-byok.md) | `Draft - Chờ duyệt` |
| **`FEAT-AI-02`** | Nhập liệu NLP Quick-Add & Gợi ý chia nhỏ checklist | [`FEAT-AI-02-nlp-quick-add.md`](./FEAT-AI-02-nlp-quick-add.md) | `Draft - Chờ duyệt` |
| **`FEAT-AI-03`** | Sinh Test Cases, Tóm tắt Release Notes & Phân tích Log | [`FEAT-AI-03-test-cases-and-release-notes.md`](./FEAT-AI-03-test-cases-and-release-notes.md) | `Draft - Chờ duyệt` |


