# Đặc Tả Tính Năng: FEAT-DEV-03
## Tự Động Hóa Git Branch & Webhook GitHub/GitLab

- **Mã tính năng:** `FEAT-DEV-03`
- **Phân hệ:** Developer Mode
- **Trạng thái:** `01.draft` (Chờ người dùng review)

---

### 1. Mục tiêu (User Story)
Là lập trình viên, tôi muốn sao chép tên branch chuẩn và hệ thống tự động đổi trạng thái task khi nhận webhook từ GitHub/GitLab mà không tốn công chỉnh bằng tay.

### 2. Luồng nghiệp vụ
1. **Chuẩn hóa Git Branch:**
   - Format: `feature/DYL-{taskId}-{slug}` (VD: `feature/DYL-102-jwt-auth`). Nút 1-click copy trên task card.
2. **Luồng Webhook tự động (Chi phí 0đ, không dùng AI):**
   - Push commit/branch có mã `DYL-{id}` $\rightarrow$ Task chuyển sang `IN_PROGRESS`.
   - Mở Pull Request $\rightarrow$ Task chuyển sang `IN_REVIEW`. Lưu URL PR vào task.
   - Merge Pull Request có `closes #102` $\rightarrow$ Task chuyển sang `DONE`.

### 3. API Contract
- `POST /api/v1/webhooks/github/{projectSecret}` $\rightarrow$ Tiếp nhận payload webhook từ GitHub.
- `POST /api/v1/webhooks/gitlab/{projectSecret}` $\rightarrow$ Tiếp nhận payload webhook từ GitLab.

### 4. Tiêu chí nghiệm thu (Acceptance Criteria)
- [ ] Nút 1-click copy tên branch đúng định dạng `feature/DYL-{taskId}-{slug}`.
- [ ] Xử lý chính xác webhook: commit push $\rightarrow$ `IN_PROGRESS`, mở PR $\rightarrow$ `IN_REVIEW`, merge PR $\rightarrow$ `DONE`.
