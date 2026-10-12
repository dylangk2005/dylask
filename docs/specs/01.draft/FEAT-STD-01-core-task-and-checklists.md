# Đặc Tả Tính Năng: FEAT-STD-01
## Quản Lý Công Việc Cá Nhân Cốt Lõi & Danh Sách Kiểm Tra

- **Mã tính năng:** `FEAT-STD-01`
- **Phân hệ:** Standard Mode
- **Trạng thái:** `01.draft` (Chờ người dùng review)

---

### 1. Mục tiêu (User Story)
Là người dùng ở chế độ cá nhân, tôi muốn thêm/sửa/xóa công việc và đánh dấu các đầu mục con (Checklist) để quản lý đời sống hàng ngày.

### 2. Luồng nghiệp vụ
1. **Quản lý Task:**
   - Tiêu đề (bắt buộc, max 255 ký tự), ghi chú (plain text), hạn chót (`dueDate`), độ ưu tiên (`low`, `medium`, `high`).
   - Phân loại theo Danh mục sống (*Học tập, Công việc, Cá nhân, Mua sắm, Gia đình*).
   - Đánh dấu hoàn thành (`done` / `todo`).
2. **Checklists con:**
   - Thêm nhiều sub-items vào task. Đánh dấu hoàn thành từng mục.

### 3. API Contract
- `GET /api/v1/tasks?mode=standard` $\rightarrow$ Lấy danh sách task (lọc theo hôm nay, 7 ngày tới, quá hạn).
- `POST /api/v1/tasks` $\rightarrow$ Tạo task mới.
- `PUT /api/v1/tasks/{id}` $\rightarrow$ Cập nhật thông tin task.
- `PATCH /api/v1/tasks/{id}/status` $\rightarrow$ Toggle trạng thái hoàn thành.
- `POST /api/v1/tasks/{id}/checklists` $\rightarrow$ Thêm sub-item vào checklist.

### 4. Tiêu chí nghiệm thu (Acceptance Criteria)
- [ ] Giao diện tối giản, trực quan, hỗ trợ check hoàn thành nhanh.
- [ ] Xóa task sẽ tự động cascade xóa các sub-items liên quan.
