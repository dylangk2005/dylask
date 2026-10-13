# Hướng Dẫn Chuyển Đổi Prototype HTML Sang React 19 Component

Thư mục `docs/layout-html/` chứa toàn bộ giao diện hoàn chỉnh của Dylask bằng HTML/CSS tĩnh. Tài liệu này hướng dẫn cách chuyển đổi sang React 19 một cách chuẩn xác, giữ nguyên 100% trải nghiệm và responsive.

---

## 1. Bản Đồ Tham Chiếu Prototype (`docs/layout-html/`)

| Chế độ | Màn hình | Thư mục Prototype |
|---|---|---|
| **Auth** | Đăng ký / Đăng nhập / Quên mật khẩu | `docs/layout-html/auth/layout.html` |
| **Standard** | Kế hoạch hôm nay (My Day) | `docs/layout-html/my-day/layout.html` |
| **Standard** | Danh sách công việc theo phân loại | `docs/layout-html/standard-list/layout.html` |
| **Standard** | Lịch trình & Lặp lại (Calendar) | `docs/layout-html/calendar/layout.html` |
| **Standard** | Việc sắp tới (Upcoming) | `docs/layout-html/standard-upcoming/layout.html` |
| **Standard** | Việc quá hạn (Overdue) | `docs/layout-html/standard-overdue/layout.html` |
| **Standard** | Thống kê cá nhân (Streak, Pomodoro) | `docs/layout-html/standard-analytics/layout.html` |
| **Standard** | Modal chi tiết Task chuẩn | `docs/layout-html/standard-task-modal/layout.html` |
| **Developer** | Bảng Sprint Kanban kéo thả | `docs/layout-html/developer-board/layout.html` |
| **Developer** | Quản lý Backlog & Sprint | `docs/layout-html/developer-backlog/layout.html` |
| **Developer** | Báo cáo Agile (Burndown, Velocity) | `docs/layout-html/developer-metrics/layout.html` |
| **Developer** | Chế độ tập trung (Focus Coding) | `docs/layout-html/developer-focus/layout.html` |
| **Developer** | Command Palette (`Ctrl + K`) | `docs/layout-html/developer-command-palette/layout.html` |
| **Developer** | Modal Task kỹ thuật (Git, Branch) | `docs/layout-html/developer-task-modal/layout.html` |
| **Chung** | Cài đặt & Quản lý AI (BYOK) | `docs/layout-html/settings/layout.html` |

---

## 2. Các Bước Chuyển Đổi Sang React 19

### Bước 1: Thay thế Thuộc tính HTML sang JSX
- Đổi `class="..."` thành `className="..."`.
- Đổi `for="..."` thành `htmlFor="..."`.
- Đổi các thuộc tính inline style dạng chuỗi `style="display: none;"` thành đối tượng: `style={{ display: 'none' }}`.
- Đóng tất cả thẻ đơn: `<input />`, `<img />`, `<br />`, `<hr />`.

### Bước 2: Tách Component Reusable
- **Shell Layout:** Tách phần Sidebar và Header thành component dùng chung (`Sidebar.tsx`, `Header.tsx`).
- **Cards & Items:** Tách `TaskCard.tsx`, `PomodoroTimer.tsx`, `KanbanColumn.tsx`.
- **Modals:** Đưa vào `src/components/modals/`.

### Bước 3: Thay Thế JavaScript Thao Tác DOM Bằng State
- Thay các đoạn JS DOM (`document.querySelector`, `classList.toggle('active')`) bằng React State:
  ```tsx
  const [isOpen, setIsOpen] = useState(false);
  // Thay vì toggle class, render có điều kiện:
  {isOpen && <TaskModal onClose={() => setIsOpen(false)} />}
  ```

### Bước 4: Tích Hợp CSS Tokens Từ `DESIGN.md`
- Luôn kiểm tra [docs/layout-html/DESIGN.md](file:///d:/dylann/my-apps/dylask-web/docs/layout-html/DESIGN.md) để sử dụng đúng biến màu CSS (CSS Variables) như `--color-primary`, `--bg-surface`, `--text-muted` nhằm đảm bảo hỗ trợ chuyển đổi mượt mà giữa **Light Mode**, **Dark Mode**, và giữa **Standard Mode** với **Developer Mode**.
