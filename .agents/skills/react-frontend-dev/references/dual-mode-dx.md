# Kiến Trúc Giao Diện Dual-Mode Dylask

Dylask sở hữu 2 chế độ hiển thị chuyên biệt:
1. **Standard Mode (Người dùng cá nhân / Học tập):**
   - Tối giản, thân thiện, nhẹ nhàng.
   - Các màn hình chính: My Day (`/app/my-day`), Calendar (`/app/calendar`), Upcoming (`/app/upcoming`), Personal Analytics (`/app/analytics`), Standard Task Modal.
   - Tham khảo layout mẫu tại: `docs/layout-html/my-day/layout.html`, `docs/layout-html/standard-list/layout.html`...

2. **Developer Mode (Lập trình viên / Đội ngũ kỹ thuật):**
   - Đậm chất kỹ thuật, tối ưu thao tác phím tắt, hỗ trợ Dark Mode chuyên sâu.
   - Các màn hình chính: Sprint Kanban Board (`/dev/board`), Backlog (`/dev/backlog`), Command Palette (`Ctrl + K`), Git Automation Webhooks (`/dev/settings/git`), Agile Metrics (`/dev/metrics`), Dev Task Modal.
   - Tham khảo layout mẫu tại: `docs/layout-html/developer-board/layout.html`, `docs/layout-html/developer-backlog/layout.html`...

## Quy tắc thiết kế CSS & Responsive
- Tham khảo toàn bộ hệ thống CSS tokens và responsive class trong [DESIGN.md](file:///d:/dylann/my-apps/dylask-web/docs/layout-html/DESIGN.md).
- Sidebar responsive dùng cấu trúc điều hướng thống nhất theo [responsive-sidebar.css](file:///d:/dylann/my-apps/dylask-web/docs/layout-html/responsive-sidebar.css).
