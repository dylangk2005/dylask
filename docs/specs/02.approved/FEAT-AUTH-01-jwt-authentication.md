# Đặc Tả Kỹ Thuật Chi Tiết: FEAT-AUTH-01
## Đăng Ký, Đăng Nhập, Quản Lý Phiên Làm Việc & Xác Thực JWT

- **Mã tính năng:** `FEAT-AUTH-01`
- **Phân hệ:** Authentication & Security Module
- **Trạng thái:** `01.draft` (Chờ người dùng review)
- **Độ ưu tiên:** `P1 (Critical - Nền tảng cốt lõi)`

---

### 1. Mục Tiêu (User Story)

Là người dùng mới hoặc người dùng hiện tại của Dylask, tôi muốn đăng ký tài khoản bằng email/mật khẩu và đăng nhập an toàn để dữ liệu công việc cá nhân của tôi được bảo mật, phiên làm việc được duy trì ổn định mà không phải đăng nhập lại liên tục.

---

### 2. Luồng Nghiệp Vụ & Sơ Đồ Xử Lý (Business Flow Diagram)

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   SƠ ĐỒ LUỒNG ĐĂNG NHẬP & XÁC THỰC JWT (LOGIN FLOW)                    │
└────────────────────────────────────────────────────────────────────────────────────────┘

  [ NGƯỜI DÙNG ]
        │
        │ (1) Nhập Email & Mật khẩu
        ▼
  ┌────────────────────────────────────────────────────────┐
  │         Client UI: React Form / useAuth Hook           │
  └──────────────────────────┬─────────────────────────────┘
                             │ (2) POST /api/v1/auth/login { email, password }
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │            Backend: AuthController                    │
  └──────────────────────────┬─────────────────────────────┘
                             │ (3) Gọi authenticate(email, rawPassword)
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │             Service: AuthServiceImpl                  │
  └──────────┬─────────────────────────────────────────────┘
             │ (4) Truy vấn DB & So khớp mã băm BCrypt
             ▼
  ┌────────────────────────────────────────────────────────┐
  │            Database: MySQL 8.4 (users)                 │
  └──────────┬─────────────────────────────────────────────┘
             │
             ├─► [MẬT KHẨU SAI HOẶC EMAIL KHÔNG TỒN TẠI]:
             │   • Ném AppException(AUTH_INVALID_CREDENTIALS)
             │   • Trả về HTTP 401 Unauthorized
             │   • Client hiển thị lỗi: "Email hoặc mật khẩu không chính xác"
             │
             └─► [XÁC THỰC THÀNH CÔNG]:
                 │ (5) Sinh cặp mã thông báo (Tokens)
                 ▼
         ┌─────────────────────────────────────────────────────────┐
         │              Service: JwtTokenService                   │
         │  • Access Token  : HMAC-SHA256 (Hạn 15 phút)            │
         │  • Refresh Token : Secure Random 64 chars (Hạn 7 ngày)  │
         └──────────────────────────┬──────────────────────────────┘
                                    │ (6) Lưu hash Refresh Token vào DB
                                    ▼
         ┌─────────────────────────────────────────────────────────┐
         │         Database: MySQL (refresh_tokens)                │
         └──────────────────────────┬──────────────────────────────┘
                                    │ (7) Trả về AuthResponseDTO
                                    ▼
         ┌─────────────────────────────────────────────────────────┐
         │ HTTP 200 OK: { accessToken, refreshToken, user }        │
         │ • Client lưu AccessToken vào State, RefreshToken an toàn│
         │ • Chuyển hướng tới màn hình chính (/tasks hoặc /board)  │
         └─────────────────────────────────────────────────────────┘
```

#### 2.1. Quy tắc Đăng ký Tài khoản (Registration Rules)
- **Validation đầu vào:**
  - `email`: Bắt buộc, định dạng email chuẩn RFC 5322, tối đa 255 ký tự, chữ thường (lowercase).
  - `password`: Bắt buộc, độ dài từ 8 đến 32 ký tự, chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 chữ số.
  - `fullName`: Bắt buộc, độ dài từ 2 đến 100 ký tự, tự động cắt khoảng trắng thừa (trim).
- **Quy trình xử lý:**
  1. Kiểm tra tồn tại email trong bảng `users`: Nếu đã tồn tại, lập tức trả về lỗi HTTP 409 Conflict với mã `AUTH_EMAIL_ALREADY_EXISTS`.
  2. Băm mật khẩu bằng thuật toán **BCrypt** (Strength: 10).
  3. Khởi tạo tài khoản với giá trị mặc định: `default_mode = 'standard'`, `ai_enabled = FALSE`, `ai_trial_count = 0`, `ai_trial_limit = 10`, `ai_trial_reset_at = CURRENT_TIMESTAMP`.

#### 2.2. Quy tắc Đăng nhập & Tạo Token (Authentication & Token Issuance)
- **Access Token:**
  - Định dạng: Chuẩn JWT (JSON Web Token), ký bằng thuật toán HMAC-SHA256 (`HS256`).
  - Khóa bí mật (Secret Key): Chuỗi ngẫu nhiên tối thiểu 256 bits, cấu hình qua biến môi trường `JWT_SECRET`.
  - Thời hạn: **15 phút** (`900` giây).
  - Payload claims: `sub` (User ID), `email`, `defaultMode`, `fullName`, `iat` (Issued at), `exp` (Expiration).
- **Refresh Token & Cơ chế Chống Tái Sử Dụng (Token Rotation & Reuse Detection):**
  - Định dạng: Chuỗi ngẫu nhiên bảo mật 64 ký tự (Cryptographically Secure Random String).
  - Thời hạn: **7 ngày** (`604800` giây).
  - Lưu trữ Database: Bảng `refresh_tokens` lưu chuỗi hash SHA-256 của token, liên kết với `user_id`.
  - **Cơ chế Xoay Vòng (Rotation):** Mỗi khi endpoint `/refresh` được gọi thành công, Refresh Token cũ bị vô hiệu hóa (`is_revoked = TRUE`) và một Refresh Token mới được cấp phát thay thế.
  - **Phát hiện tái sử dụng (Reuse Detection):** Nếu một Refresh Token đã bị revoked được gửi lên, hệ thống phát hiện đây là hành vi chiếm đoạt phiên (token bị lộ), lập tức **thu hồi toàn bộ (Revoke All)** các Refresh Token thuộc về người dùng đó và trả về HTTP 401 `AUTH_REFRESH_TOKEN_REVOKED`.

#### 2.3. Quy tắc Đăng xuất (Logout)
- Endpoint `POST /api/v1/auth/logout` nhận `refreshToken` từ client.
- Hệ thống đánh dấu bản ghi tương ứng trong bảng `refresh_tokens` thành `is_revoked = TRUE`.

---

### 3. Thiết Kế Cơ Sở Dữ Liệu & Flyway Migration

#### Script Flyway: `V1__create_users_table.sql`
```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    default_mode VARCHAR(20) NOT NULL DEFAULT 'standard',
    ai_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    ai_trial_count INT NOT NULL DEFAULT 0,
    ai_trial_limit INT NOT NULL DEFAULT 10,
    ai_trial_reset_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ai_provider VARCHAR(30) NULL,
    ai_api_key_encrypted VARCHAR(500) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_users_email UNIQUE (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_users_email ON users(email);
```

#### Script Flyway: `V2__create_refresh_tokens_table.sql`
```sql
CREATE TABLE refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(64) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_refresh_tokens_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_refresh_tokens_token_hash UNIQUE (token_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash_revoked ON refresh_tokens(token_hash, is_revoked);
```

---

### 4. Chi Tiết API Contract

#### 4.1. `POST /api/v1/auth/register` - Đăng Ký Tài Khoản Mới
- **Request Body:**
```json
{
  "email": "nguyenduyanh@example.com",
  "password": "Password123",
  "fullName": "Nguyễn Duy Anh"
}
```
- **Response Success (HTTP 201 Created):**
```json
{
  "success": true,
  "code": 201,
  "errorCode": null,
  "message": "Đăng ký tài khoản thành công",
  "data": {
    "id": 1,
    "email": "nguyenduyanh@example.com",
    "fullName": "Nguyễn Duy Anh",
    "defaultMode": "standard",
    "createdAt": "2026-10-12T14:20:00.000Z"
  },
  "errors": null,
  "timestamp": "2026-10-12T14:20:00.120Z"
}
```
- **Response Error (HTTP 409 Conflict - Trùng email):**
```json
{
  "success": false,
  "code": 409,
  "errorCode": "AUTH_EMAIL_ALREADY_EXISTS",
  "message": "Địa chỉ email đã được đăng ký",
  "data": null,
  "errors": null,
  "timestamp": "2026-10-12T14:20:05.100Z"
}
```

#### 4.2. `POST /api/v1/auth/login` - Đăng Nhập
- **Request Body:**
```json
{
  "email": "nguyenduyanh@example.com",
  "password": "Password123"
}
```
- **Response Success (HTTP 200 OK):**
```json
{
  "success": true,
  "code": 200,
  "errorCode": null,
  "message": "Đăng nhập thành công",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "7a9f8b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a",
    "tokenType": "Bearer",
    "expiresIn": 900,
    "user": {
      "id": 1,
      "email": "nguyenduyanh@example.com",
      "fullName": "Nguyễn Duy Anh",
      "defaultMode": "standard",
      "aiEnabled": false,
      "aiTrialRemaining": 10
    }
  },
  "errors": null,
  "timestamp": "2026-10-12T14:21:00.000Z"
}
```

#### 4.3. `POST /api/v1/auth/refresh` - Làm Mới Token (Xoay Vòng)
- **Request Body:**
```json
{
  "refreshToken": "7a9f8b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a"
}
```
- **Response Success (HTTP 200 OK):**
```json
{
  "success": true,
  "code": 200,
  "errorCode": null,
  "message": "Làm mới phiên làm việc thành công",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2",
    "tokenType": "Bearer",
    "expiresIn": 900
  },
  "errors": null,
  "timestamp": "2026-10-12T14:35:00.000Z"
}
```

#### 4.4. `POST /api/v1/auth/logout` - Đăng Xuất
- **Request Body:**
```json
{
  "refreshToken": "e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2"
}
```
- **Response Success (HTTP 200 OK):**
```json
{
  "success": true,
  "code": 200,
  "errorCode": null,
  "message": "Đăng xuất thành công",
  "data": null,
  "errors": null,
  "timestamp": "2026-10-12T14:40:00.000Z"
}
```

---

### 5. Cấu Trúc Mã Nguồn Backend (`dylask-backend`)

Tuân thủ kiến trúc **Modular Monolith** quy định tại `AGENTS.md`:

```
com.dylask.modules.auth/
├── controller/
│   └── AuthController.java                  # Tiếp nhận HTTP request, Bean Validation @Valid
├── service/
│   ├── AuthService.java                     # Interface nghiệp vụ auth
│   ├── impl/AuthServiceImpl.java            # Hiện thực logic kiểm tra, mã hóa, transaction
│   ├── TokenService.java                    # Interface sinh/validate JWT & Refresh Token
│   └── impl/JwtTokenServiceImpl.java        # Triển khai ký JWT HMAC-SHA256
├── repository/
│   ├── UserRepository.java                  # Spring Data JPA cho bảng users
│   └── RefreshTokenRepository.java          # Spring Data JPA cho bảng refresh_tokens
├── entity/
│   ├── User.java                            # JPA Entity mapping bảng users
│   └── RefreshToken.java                    # JPA Entity mapping bảng refresh_tokens
├── dto/
│   ├── request/
│   │   ├── RegisterRequestDTO.java          # Record: email, password, fullName
│   │   ├── LoginRequestDTO.java             # Record: email, password
│   │   ├── RefreshTokenRequestDTO.java      # Record: refreshToken
│   │   └── LogoutRequestDTO.java            # Record: refreshToken
│   └── response/
│       ├── AuthResponseDTO.java             # Record: tokens + UserSummaryDTO
│       ├── TokenResponseDTO.java            # Record: accessToken, refreshToken, expiresIn
│       └── UserSummaryDTO.java              # Record: id, email, fullName, defaultMode...
└── mapper/
    └── AuthMapper.java                      # MapStruct: Entity <-> DTO
```

Thành phần bảo mật toàn hệ thống tại `com.dylask.common.config.security`:
- `SecurityConfig.java`: Cấu hình stateless session (`SessionCreationPolicy.STATELESS`), CORS filter, permit public các endpoint `/api/v1/auth/**`.
- `JwtAuthenticationFilter.java`: Chặn request, parse Header `Authorization: Bearer <token>`, validate token và nạp `UsernamePasswordAuthenticationToken` vào `SecurityContextHolder`.
- `JwtAuthenticationEntryPoint.java`: Bắt lỗi khi không có quyền/thiếu token, xuất trả JSON `ApiResponse` 401 chuẩn.

---

### 6. Cấu Trúc Mã Nguồn Frontend (`dylask-frontend`)

1. **Giao diện & Màn hình:**
   - Trang Đăng nhập: `src/pages/auth/LoginPage.tsx`
   - Trang Đăng ký: `src/pages/auth/RegisterPage.tsx`
   - Tuân thủ thiết kế tối giản, tông màu thương hiệu `#0F766E`, font Plus Jakarta Sans, không gradient, không bóng mờ.
2. **Hook & Context:**
   - `src/context/AuthContext.tsx`: Quản lý state đăng nhập toàn cầu (`user`, `isAuthenticated`, `isLoading`, `login`, `logout`, `register`).
   - `src/hooks/useAuth.ts`: Hook tiện ích truy xuất Context.
3. **API Client & Interceptor:**
   - `src/api/auth.api.ts`: Các hàm gọi API `login()`, `register()`, `refresh()`, `logout()`.
   - `src/api/client.ts`: Axios instance với interceptor tự động bắt mã `AUTH_ACCESS_TOKEN_EXPIRED` để gọi `auth.api.refresh()` và retry request gốc.

---

### 7. Tiêu Chí Nghiệm Thu & Ma Trận Kiểm Thử (Test Matrix)

| ID | Tình huống kiểm thử | Dữ liệu đầu vào | Kết quả mong đợi |
|---|---|---|---|
| **TC-AUTH-01** | Đăng ký thành công | Email mới, password hợp lệ | HTTP 201 Created, mật khẩu trong DB được băm BCrypt, trả về UserDTO. |
| **TC-AUTH-02** | Đăng ký trùng email | Email đã tồn tại | HTTP 409 Conflict, mã lỗi `AUTH_EMAIL_ALREADY_EXISTS`. |
| **TC-AUTH-03** | Đăng ký sai validation | Mật khẩu chỉ có 4 ký tự | HTTP 400 Bad Request, danh sách lỗi chỉ rõ trường `password`. |
| **TC-AUTH-04** | Đăng nhập thành công | Email & mật khẩu chính xác | HTTP 200 OK, nhận đủ cặp Access Token (15p) & Refresh Token (7 ngày). |
| **TC-AUTH-05** | Đăng nhập sai mật khẩu | Mật khẩu không khớp | HTTP 401 Unauthorized, mã lỗi `AUTH_INVALID_CREDENTIALS`. |
| **TC-AUTH-06** | Làm mới token thành công (Rotation) | Refresh Token còn hạn | HTTP 200 OK, nhận cặp token mới; Refresh Token cũ bị đánh dấu `is_revoked = TRUE`. |
| **TC-AUTH-07** | Bắt hành vi tái sử dụng token | Gửi lại Refresh Token đã revoked | HTTP 401 Unauthorized, mã `AUTH_REFRESH_TOKEN_REVOKED`, toàn bộ token của user bị thu hồi. |
| **TC-AUTH-08** | Truy cập API bảo mật không có token | GET `/api/v1/users/me` | HTTP 401 Unauthorized với mã `UNAUTHORIZED`. |
| **TC-AUTH-09** | Đăng xuất thành công | Gửi Refresh Token hợp lệ | HTTP 200 OK, bản ghi Refresh Token chuyển sang `is_revoked = TRUE`. |
