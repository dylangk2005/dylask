# Thư Mục Specs Đã Được Duyệt (Approved Specs)

Tất cả các tài liệu đặc tả ở đây đã được review và **PHÊ DUYỆT (APPROVED)**.
Theo quy chuẩn **Spec-Driven Development** trong `AGENTS.md`, AI và Dev **ĐƯỢC PHÉP TIẾN HÀNH LẬP TRÌNH** các tính năng này.

---

## 🏛️ Tài liệu tiêu chuẩn nền tảng dùng chung (Foundation Specs):
- **[`api-specs.md`](../api-specs.md):** Chuẩn cấu trúc phản hồi `ApiResponse<T>`, phân trang `PageResponse<T>`, mã lỗi `ErrorCode` và Global Exception Handler.
- **[`database-specs.md`](../database-specs.md):** Chuẩn naming convention MySQL 8.4, quy tắc Flyway Migration, Audit columns và ánh xạ JPA Entity.
- **[`feature-specifications.md`](../feature-specifications.md):** Tổng quan kiến trúc nghiệp vụ, triết lý Dual-Mode và chính sách AI (BYOK + 10 lượt thử/tháng).
- **[`DESIGN.md`](../../layout-html/DESIGN.md):** Toàn bộ Design System Tokens (màu sắc, typography, responsive) dùng chung cho cả Standard và Developer Mode.

---

## 📋 Danh Sách Specs Đã Phê Duyệt & Bản Mẫu Giao Diện (HTML Prototypes):

| Mã tính năng | Tên tính năng | File Spec | Giao diện mẫu (HTML Prototype) | Trạng thái |
|---|---|---|---|---|
| **`FEAT-AUTH-01`** | Đăng ký, Đăng nhập & Xác thực JWT | [`FEAT-AUTH-01`](./FEAT-AUTH-01-jwt-authentication.md) | [auth/layout.html](../../layout-html/auth/layout.html) | `Approved - Sẵn sàng code` |
| **`FEAT-AUTH-02`** | Quản lý Hồ sơ & Toggle Dual-Mode | [`FEAT-AUTH-02`](./FEAT-AUTH-02-dual-mode-toggle.md) | [settings/layout.html](../../layout-html/settings/layout.html) | `Approved - Sẵn sàng code` |
| **`FEAT-STD-01`** | CRUD Task cá nhân & Subtask Checklists | [`FEAT-STD-01`](./FEAT-STD-01-core-task-and-checklists.md) | [standard-list/layout.html](../../layout-html/standard-list/layout.html)<br>[standard-task-modal/layout.html](../../layout-html/standard-task-modal/layout.html) | `Approved - Sẵn sàng code` |
| **`FEAT-STD-02`** | Lịch trình & Task lặp lại định kỳ | [`FEAT-STD-02`](./FEAT-STD-02-calendar-and-recurring.md) | [calendar/layout.html](../../layout-html/calendar/layout.html) | `Approved - Sẵn sàng code` |
| **`FEAT-STD-03`** | Kế hoạch hôm nay (My Day) & Đồng hồ Pomodoro | [`FEAT-STD-03`](./FEAT-STD-03-my-day-and-pomodoro.md) | [my-day/layout.html](../../layout-html/my-day/layout.html) | `Approved - Sẵn sàng code` |
| **`FEAT-STD-04`** | Thống kê & Phân tích Năng suất Cá nhân (Streak, Pomodoro) | [`FEAT-STD-04`](./FEAT-STD-04-personal-analytics.md) | [standard-analytics/layout.html](../../layout-html/standard-analytics/layout.html) | `Approved - Sẵn sàng code` |
| **`FEAT-STD-05`** | Lập Kế Hoạch Tuần, Phân Bổ Công Việc & Chế Độ Xem Chuyên Biệt | [`FEAT-STD-05`](./FEAT-STD-05-weekly-planning-and-smart-scheduler.md) | [standard-planning/layout.html](../../layout-html/standard-planning/layout.html)<br>[standard-upcoming/layout.html](../../layout-html/standard-upcoming/layout.html)<br>[standard-overdue/layout.html](../../layout-html/standard-overdue/layout.html) | `Approved - Sẵn sàng code` |
| **`FEAT-DEV-01`** | Bảng Kanban kéo thả, Sprint & Story Points | [`FEAT-DEV-01`](./FEAT-DEV-01-sprint-kanban-board.md) | [developer-board/layout.html](../../layout-html/developer-board/layout.html)<br>[developer-backlog/layout.html](../../layout-html/developer-backlog/layout.html)<br>[developer-task-modal/layout.html](../../layout-html/developer-task-modal/layout.html) | `Approved - Sẵn sàng code` |
| **`FEAT-DEV-02`** | Markdown Editor, Command Palette (`Ctrl+K`) & Focus Coding | [`FEAT-DEV-02`](./FEAT-DEV-02-markdown-and-command-palette.md) | [developer-command-palette/layout.html](../../layout-html/developer-command-palette/layout.html)<br>[developer-focus/layout.html](../../layout-html/developer-focus/layout.html) | `Approved - Sẵn sàng code` |
| **`FEAT-DEV-03`** | Tự động hóa Git Branch & Webhook GitHub/GitLab | [`FEAT-DEV-03`](./FEAT-DEV-03-git-webhooks-automation.md) | [developer-board/layout.html](../../layout-html/developer-board/layout.html)<br>[developer-project-create/layout.html](../../layout-html/developer-project-create/layout.html) | `Approved - Sẵn sàng code` |
| **`FEAT-DEV-04`** | Threaded Comments, Async Standup & Audit Log | [`FEAT-DEV-04`](./FEAT-DEV-04-team-collaboration.md) | [developer-standup/layout.html](../../layout-html/developer-standup/layout.html)<br>[developer-audit-log/layout.html](../../layout-html/developer-audit-log/layout.html) | `Approved - Sẵn sàng code` |
| **`FEAT-DEV-05`** | Đo Lường Kỹ Thuật & Báo Cáo Agile (Burndown, Velocity) | [`FEAT-DEV-05`](./FEAT-DEV-05-agile-metrics-and-reports.md) | [developer-metrics/layout.html](../../layout-html/developer-metrics/layout.html) | `Approved - Sẵn sàng code` |
| **`FEAT-AI-01`** | Cấu hình AI, 10 Lượt Dùng Thử/Tháng & Khóa Riêng (BYOK) | [`FEAT-AI-01`](./FEAT-AI-01-ai-settings-byok.md) | [settings/layout.html](../../layout-html/settings/layout.html) | `Approved - Sẵn sàng code` |
| **`FEAT-AI-02`** | Nhập liệu NLP Quick-Add & Gợi ý chia nhỏ checklist | [`FEAT-AI-02`](./FEAT-AI-02-nlp-quick-add.md) | [standard-list/layout.html](../../layout-html/standard-list/layout.html)<br>[standard-task-modal/layout.html](../../layout-html/standard-task-modal/layout.html) | `Approved - Sẵn sàng code` |
| **`FEAT-AI-03`** | Sinh Test Cases, Tóm tắt Release Notes & Phân tích Log | [`FEAT-AI-03`](./FEAT-AI-03-test-cases-and-release-notes.md) | [developer-ai-panel/layout.html](../../layout-html/developer-ai-panel/layout.html) | `Approved - Sẵn sàng code` |
