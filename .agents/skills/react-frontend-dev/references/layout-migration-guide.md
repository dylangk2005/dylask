# Hướng Dẫn Chuyển Đổi Prototype HTML Sang React 19 Component

Thư mục `docs/layout-html/` chứa toàn bộ giao diện hoàn chỉnh của Dylask bằng HTML/CSS tĩnh và JavaScript responsive thuần. Tài liệu này cung cấp **Bản đồ liên kết 1:1** giữa từng tài liệu đặc tả tính năng (`docs/specs/02.approved/`) và các file mẫu HTML (`docs/layout-html/`) nhằm giúp AI và lập trình viên chuyển đổi sang React 19 / TypeScript một cách trực tiếp, dễ dàng và chính xác nhất.

---

## 🗺️ 1. Bản Đồ Liên Kết Toàn Diện (Specs <-> HTML Prototypes)

| Mã Spec | Tên Tính Năng | File Đặc Tả (Approved Spec) | Bản Mẫu Giao Diện (HTML Prototype) | Các Component Cần Dựng |
|---|---|---|---|---|
| **`FEAT-AUTH-01`** | Xác thực JWT & Phiên làm việc | [`FEAT-AUTH-01`](file:///d:/dylann/my-apps/dylask-web/docs/specs/02.approved/FEAT-AUTH-01-jwt-authentication.md) | [auth/layout.html](file:///d:/dylann/my-apps/dylask-web/docs/layout-html/auth/layout.html) | `LoginForm`, `RegisterForm`, `ForgotPasswordModal` |
| **`FEAT-AUTH-02`** | Quản lý Hồ sơ & Toggle Dual-Mode | [`FEAT-AUTH-02`](file:///d:/dylann/my-apps/dylask-web/docs/specs/02.approved/FEAT-AUTH-02-dual-mode-toggle.md) | [settings/layout.html](file:///d:/dylann/my-apps/dylask-web/docs/layout-html/settings/layout.html) | `ProfileTab`, `AppearanceTab`, `DualModeToggle` |
| **`FEAT-STD-01`** | CRUD Task cá nhân & Subtasks | [`FEAT-STD-01`](file:///d:/dylann/my-apps/dylask-web/docs/specs/02.approved/FEAT-STD-01-core-task-and-checklists.md) | [standard-list/layout.html](file:///d:/dylann/my-apps/dylask-web/docs/layout-html/standard-list/layout.html)<br>[standard-task-modal/layout.html](file:///d:/dylann/my-apps/dylask-web/docs/layout-html/standard-task-modal/layout.html) | `TaskList`, `TaskItemRow`, `StandardTaskModal`, `ChecklistSection` |
| **`FEAT-STD-02`** | Lịch trình & Task lặp lại định kỳ | [`FEAT-STD-02`](file:///d:/dylann/my-apps/dylask-web/docs/specs/02.approved/FEAT-STD-02-calendar-and-recurring.md) | [calendar/layout.html](file:///d:/dylann/my-apps/dylask-web/docs/layout-html/calendar/layout.html) | `CalendarView`, `MonthGrid`, `WeekGrid`, `RecurringModal` |
| **`FEAT-STD-03`** | Kế hoạch hôm nay & Pomodoro | [`FEAT-STD-03`](file:///d:/dylann/my-apps/dylask-web/docs/specs/02.approved/FEAT-STD-03-my-day-and-pomodoro.md) | [my-day/layout.html](file:///d:/dylann/my-apps/dylask-web/docs/layout-html/my-day/layout.html) | `MyDayView`, `PomodoroWidget`, `SuggestionDrawer` |
| **`FEAT-STD-04`** | Thống kê năng suất cá nhân | [`FEAT-STD-04`](file:///d:/dylann/my-apps/dylask-web/docs/specs/02.approved/FEAT-STD-04-personal-analytics.md) | [standard-analytics/layout.html](file:///d:/dylann/my-apps/dylask-web/docs/layout-html/standard-analytics/layout.html) | `StreakBadge`, `CategoryDonutSvg`, `WeeklyBarSvg` |
| **`FEAT-STD-05`** | Kế hoạch tuần & Lọc chuyên biệt | [`FEAT-STD-05`](file:///d:/dylann/my-apps/dylask-web/docs/specs/02.approved/FEAT-STD-05-weekly-planning-and-smart-scheduler.md) | [standard-planning/layout.html](file:///d:/dylann/my-apps/dylask-web/docs/layout-html/standard-planning/layout.html)<br>[standard-upcoming/layout.html](file:///d:/dylann/my-apps/dylask-web/docs/layout-html/standard-upcoming/layout.html)<br>[standard-overdue/layout.html](file:///d:/dylann/my-apps/dylask-web/docs/layout-html/standard-overdue/layout.html) | `WeeklyPlanningBoard`, `UpcomingView`, `OverdueAlertList` |
| **`FEAT-DEV-01`** | Sprint Kanban Board & Backlog | [`FEAT-DEV-01`](file:///d:/dylann/my-apps/dylask-web/docs/specs/02.approved/FEAT-DEV-01-sprint-kanban-board.md) | [developer-board/layout.html](file:///d:/dylann/my-apps/dylask-web/docs/layout-html/developer-board/layout.html)<br>[developer-backlog/layout.html](file:///d:/dylann/my-apps/dylask-web/docs/layout-html/developer-backlog/layout.html)<br>[developer-task-modal/layout.html](file:///d:/dylann/my-apps/dylask-web/docs/layout-html/developer-task-modal/layout.html) | `KanbanBoard`, `KanbanColumn`, `DevTaskCard`, `BacklogList`, `SprintHeader` |
| **`FEAT-DEV-02`** | Command Palette & Focus Coding | [`FEAT-DEV-02`](file:///d:/dylann/my-apps/dylask-web/docs/specs/02.approved/FEAT-DEV-02-markdown-and-command-palette.md) | [developer-command-palette/layout.html](file:///d:/dylann/my-apps/dylask-web/docs/layout-html/developer-command-palette/layout.html)<br>[developer-focus/layout.html](file:///d:/dylann/my-apps/dylask-web/docs/layout-html/developer-focus/layout.html) | `CommandPaletteModal` (`Ctrl+K`), `FocusCodingView` |
| **`FEAT-DEV-03`** | Tự động hóa Git Branch & Webhook | [`FEAT-DEV-03`](file:///d:/dylann/my-apps/dylask-web/docs/specs/02.approved/FEAT-DEV-03-git-webhooks-automation.md) | [developer-board/layout.html](file:///d:/dylann/my-apps/dylask-web/docs/layout-html/developer-board/layout.html)<br>[developer-project-create/layout.html](file:///d:/dylann/my-apps/dylask-web/docs/layout-html/developer-project-create/layout.html) | `GitBranchCopyButton`, `ProjectCreateModal`, `WebhookSettings` |
| **`FEAT-DEV-04`** | Threaded Comments & Standup | [`FEAT-DEV-04`](file:///d:/dylann/my-apps/dylask-web/docs/specs/02.approved/FEAT-DEV-04-team-collaboration.md) | [developer-standup/layout.html](file:///d:/dylann/my-apps/dylask-web/docs/layout-html/developer-standup/layout.html)<br>[developer-audit-log/layout.html](file:///d:/dylann/my-apps/dylask-web/docs/layout-html/developer-audit-log/layout.html) | `DailyStandupPanel`, `AuditLogTimeline`, `ThreadedComments` |
| **`FEAT-DEV-05`** | Báo cáo Agile (Burndown, Velocity) | [`FEAT-DEV-05`](file:///d:/dylann/my-apps/dylask-web/docs/specs/02.approved/FEAT-DEV-05-agile-metrics-and-reports.md) | [developer-metrics/layout.html](file:///d:/dylann/my-apps/dylask-web/docs/layout-html/developer-metrics/layout.html) | `BurndownSvgChart`, `VelocityBarChart`, `AccuracyTable` |
| **`FEAT-AI-01`** | Quản lý Cài đặt AI & Khóa BYOK | [`FEAT-AI-01`](file:///d:/dylann/my-apps/dylask-web/docs/specs/02.approved/FEAT-AI-01-ai-settings-byok.md) | [settings/layout.html](file:///d:/dylann/my-apps/dylask-web/docs/layout-html/settings/layout.html) | `AiSettingsTab`, `QuotaCard` (4/10 calls), `ApiKeyInput` |
| **`FEAT-AI-02`** | NLP Quick-Add & Gợi ý Checklist | [`FEAT-AI-02`](file:///d:/dylann/my-apps/dylask-web/docs/specs/02.approved/FEAT-AI-02-nlp-quick-add.md) | [standard-list/layout.html](file:///d:/dylann/my-apps/dylask-web/docs/layout-html/standard-list/layout.html)<br>[standard-task-modal/layout.html](file:///d:/dylann/my-apps/dylask-web/docs/layout-html/standard-task-modal/layout.html) | `NlpQuickAddInput`, `AiBreakdownModal` |
| **`FEAT-AI-03`** | Sinh Test Cases & Release Notes | [`FEAT-AI-03`](file:///d:/dylann/my-apps/dylask-web/docs/specs/02.approved/FEAT-AI-03-test-cases-and-release-notes.md) | [developer-ai-panel/layout.html](file:///d:/dylann/my-apps/dylask-web/docs/layout-html/developer-ai-panel/layout.html) | `AiAssistantDrawer` (Right Slide-over 480px, 3 tabs) |

---

## 🎨 2. Quy Chuẩn Design System & Layout Dùng Chung

1. **Tokens & Typography ([DESIGN.md](file:///d:/dylann/my-apps/dylask-web/docs/layout-html/DESIGN.md)):**
   - Font chính: `Plus Jakarta Sans` (Standard Mode) & `JetBrains Mono` cho mã nguồn / số liệu kỹ thuật (Developer Mode).
   - Biến màu CSS dùng chung (`var(--bg-app)`, `var(--bg-surface)`, `var(--border-subtle)`...).
2. **Sidebar Thống Nhất ([responsive-sidebar.css](file:///d:/dylann/my-apps/dylask-web/docs/layout-html/responsive-sidebar.css)):**
   - Thanh điều hướng bên trái đã được tối ưu cho Desktop, Tablet và Mobile.
   - Khi chuyển sang React, tạo một layout wrapper chung: `src/components/layout/AppLayout.tsx`.

---

## 🛠️ 3. Quy Trình 4 Bước Chuyển Đổi Từ HTML Sang React 19

1. **Khảo sát:** Mở file HTML tương ứng trong trình duyệt hoặc editor để nắm cấu trúc DOM và class CSS.
2. **Chuyển JSX:**
   - Thay `class="..."` bằng `className="..."`.
   - Thay `for="..."` bằng `htmlFor="..."`.
   - Đóng các thẻ tự đóng (`<input />`, `<img />`, `<hr />`...).
3. **Thay thao tác DOM bằng React State:**
   - Thay các hàm `classList.toggle('active')` hoặc `addEventListener('click')` bằng `useState`, `onClick`.
4. **Tách Reusable Components:**
   - Tách các item lặp lại (thẻ task, dòng bảng, pill badge) thành các sub-components độc lập có Props type rõ ràng trong TypeScript.
