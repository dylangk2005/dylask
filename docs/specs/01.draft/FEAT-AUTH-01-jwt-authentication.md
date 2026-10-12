# Đặc Tả Tính Năng: FEAT-AUTH-01
## Đăng Ký, Đăng Nhập & Xác Thực JWT

- **Mã tính năng:** `FEAT-AUTH-01`
- **Phân hệ:** Authentication
- **Trạng thái:** `01.draft` (Chờ người dùng review)

---

### 1. Mục tiêu (User Story)
Là người dùng Dylask, tôi muốn đăng ký và đăng nhập bằng email/mật khẩu an toàn để lưu trữ dữ liệu công việc cá nhân.

### 2. Luồng nghiệp vụ
1. **Đăng ký (`/api/v1/auth/register`):**
   - Nhập `email`, `password` (tối thiểu 8 ký tự), `fullName`.
   - Kiểm tra email duy nhất $\rightarrow$ Mã hóa BCrypt mật khẩu $\rightarrow$ Tạo tài khoản với `default_mode = 'standard'`.
2. **Đăng nhập (`/api/v1/auth/login`):**
   - Kiểm tra email & password $\rightarrow$ Trả về cặp JWT: `accessToken` (1h) và `refreshToken` (7 ngày).
3. **Làm mới Token (`/api/v1/auth/refresh`):**
   - Gửi `refreshToken` $\rightarrow$ Nhận `accessToken` mới mà không cần đăng nhập lại.

### 3. API Contract
- `POST /api/v1/auth/register` $\rightarrow$ Request: `{ email, password, fullName }` $\rightarrow$ Response: `ApiResponse<UserDTO>`
- `POST /api/v1/auth/login` $\rightarrow$ Request: `{ email, password }` $\rightarrow$ Response: `ApiResponse<AuthResponseDTO>`
- `POST /api/v1/auth/refresh` $\rightarrow$ Request: `{ refreshToken }` $\rightarrow$ Response: `ApiResponse<TokenDTO>`

### 4. Tiêu chí nghiệm thu (Acceptance Criteria)
- [ ] Không cho phép đăng ký email trùng lặp.
- [ ] Mật khẩu trong DB được băm BCrypt an toàn.
- [ ] Endpoint bảo mật trả về `401 Unauthorized` nếu thiếu/sai JWT token.
