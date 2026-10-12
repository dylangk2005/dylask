# Đặc Tả Tính Năng: FEAT-DEV-01
## Quản Lý Dự Án Kỹ Thuật, Sprint & Bảng Kanban Kéo Thả

- **Mã tính năng:** `FEAT-DEV-01`
- **Phân hệ:** Developer Mode
- **Trạng thái:** `01.draft` (Chờ người dùng review)

---

### 1. Mục tiêu (User Story)
Là lập trình viên / nhóm kỹ thuật, tôi muốn quản lý công việc theo mô hình Sprint với bảng Kanban kéo thả, hỗ trợ Story Points và độ ưu tiên kỹ thuật P1-P4.

### 2. Luồng nghiệp vụ
1. **Mô hình phân cấp:** `Project` $\rightarrow$ `Sprint` $\rightarrow$ `Task`.
2. **Cột trạng thái Kanban:** `BACKLOG` $\rightarrow$ `TODO` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `IN_REVIEW` $\rightarrow$ `DONE`.
3. **Kéo thả (Drag & Drop):** Kéo thẻ giữa các cột hoặc thay đổi thứ tự ưu tiên trong cột.
4. **Thuộc tính kỹ thuật:**
   - Priority: `P1` (Critical), `P2` (High), `P3` (Medium), `P4` (Low).
   - Công số: `story_points`, `estimated_hours`, `actual_hours`.
   - Tags: `Frontend`, `Backend`, `DevOps`, `Database`, `Bug`, `Hotfix`.

### 3. API Contract
- `GET /api/v1/projects/{id}/board` $\rightarrow$ Lấy toàn bộ card theo 5 cột trạng thái.
- `PATCH /api/v1/tasks/{id}/move` $\rightarrow$ Cập nhật `targetStatus` và `newPosition`.
- `POST /api/v1/projects/{id}/sprints` $\rightarrow$ Tạo Sprint mới.

### 4. Tiêu chí nghiệm thu (Acceptance Criteria)
- [ ] Kéo thả card giữa các cột trạng thái mượt mà và cập nhật trạng thái ngay lập tức trên DB.
- [ ] Hỗ trợ lọc task theo Sprint, Assignee và Tags kỹ thuật.
