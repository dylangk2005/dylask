# Đặc Tả Tính Năng: FEAT-DEV-04
## Threaded Comments, Async Daily Standup & Audit Log

- **Mã tính năng:** `FEAT-DEV-04`
- **Phân hệ:** Developer Mode
- **Trạng thái:** `01.draft` (Chờ người dùng review)

---

### 1. Mục tiêu (User Story)
Là đội ngũ phát triển làm việc bất đồng bộ (Async Remote), chúng tôi muốn thảo luận kỹ thuật dưới dạng luồng (Threaded), tự động tổng hợp báo cáo Standup đầu ngày và có Audit Log theo dõi thay đổi.

### 2. Luồng nghiệp vụ
1. **Threaded Comments:** Bình luận phân luồng theo từng chủ đề trong task, hỗ trợ tag `@member`, đính kèm ảnh lỗi hoặc đoạn mã.
2. **Async Daily Standup:** Tự động xuất báo cáo 08:30 sáng: Task hoàn thành trong 24h qua, Task đang làm dở, Task bị Blocked.
3. **Audit Log:** Lưu vết lịch sử: ai đổi deadline, ai gán người thực hiện, ai chuyển trạng thái cột.

### 3. API Contract
- `GET /api/v1/tasks/{id}/comments` $\rightarrow$ Lấy danh sách bình luận phân luồng.
- `POST /api/v1/tasks/{id}/comments` $\rightarrow$ Gửi bình luận / trả lời luồng.
- `GET /api/v1/projects/{id}/standup-report` $\rightarrow$ Xuất báo cáo Standup 24h.
- `GET /api/v1/tasks/{id}/audit-logs` $\rightarrow$ Xem lịch sử thay đổi của task.

### 4. Tiêu chí nghiệm thu (Acceptance Criteria)
- [ ] Cho phép gửi và phản hồi bình luận theo luồng (Threaded Comments).
- [ ] Báo cáo Async Standup tự động trích xuất đúng task trong 24 giờ qua.
- [ ] Mọi thay đổi quan trọng trên task đều được ghi vào Audit Log.
