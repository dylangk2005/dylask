# Đặc Tả Tính Năng: FEAT-AUTH-02
## Quản Lý Hồ Sơ & Chuyển Đổi Dual-Mode

- **Mã tính năng:** `FEAT-AUTH-02`
- **Phân hệ:** Authentication & Profile
- **Trạng thái:** `01.draft` (Chờ người dùng review)

---

### 1. Mục tiêu (User Story)
Là người dùng Dylask, tôi muốn chuyển đổi giao diện giữa Standard Mode (cá nhân) và Developer Mode (kỹ thuật) chỉ bằng 1 nút gạt để phù hợp với ngữ cảnh sử dụng.

### 2. Luồng nghiệp vụ
1. **Lấy thông tin cá nhân (`GET /api/v1/users/me`):** Trả về `default_mode` hiện tại.
2. **Gạt nút Toggle trên Header:**
   - Frontend cập nhật theme/layout ngay lập tức.
   - Gửi API `PATCH /api/v1/users/me/mode` `{ "mode": "developer" | "standard" }` để lưu trạng thái vào database.
   - Lần đăng nhập sau trên thiết bị khác sẽ tự động mở đúng chế độ này.

### 3. Tiêu chí nghiệm thu (Acceptance Criteria)
- [ ] Chuyển đổi giao diện tức thì (smooth transition) mà không cần reload trang.
- [ ] Trạng thái chế độ được lưu bền vững vào DB.
