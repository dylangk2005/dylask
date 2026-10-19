# Đặc Tả Kỹ Thuật Chi Tiết: FEAT-AUTH-03
## Đăng Nhập Mạng Xã Hội Qua Google & GitHub (OAuth2 Social Login)

- **Mã tính năng:** `FEAT-AUTH-03`
- **Phân hệ:** Authentication & Security Module
- **Trạng thái:** `03.archive` (Đã hoàn thành lập trình và kiểm thử tự động 22/22 unit tests 100%)
- **Độ ưu tiên:** `P1 (High - Trải nghiệm người dùng cốt lõi)`

---

### 1. Mục Tiêu (User Story)

1. **Người dùng cá nhân (Standard Mode):** Là người dùng muốn quản lý công việc và thói quen cá nhân, tôi muốn đăng nhập tức thì chỉ với một cú nhấp chuột bằng tài khoản Google để bắt đầu sử dụng Dylask ngay mà không cần điền form đăng ký hay nhớ thêm mật khẩu.
2. **Lập trình viên (Developer Mode):** Là kỹ sư phần mềm, tôi muốn đăng nhập bằng tài khoản GitHub để hệ sinh thái tự động nhận diện chế độ Developer Mode, đồng bộ ảnh đại diện GitHub, và mở đường cho việc liên kết Git Webhooks (commits, pull requests, issue tracking) sau này.

---

### 2. Kiến Trúc & Luồng Nghiệp Vụ (OAuth2 Authorization Code Flow)

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│              SƠ ĐỒ LUỒNG ĐĂNG NHẬP OAUTH2 VỚI GOOGLE & GITHUB                          │
└────────────────────────────────────────────────────────────────────────────────────────┘

 [ NGƯỜI DÙNG ]
       │
       │ (1) Bấm "Tiếp tục với Google" hoặc "Tiếp tục với GitHub"
       ▼
 ┌───────────────────────────────────────────────────────────────────────┐
 │                     Client Frontend: React SPA                        │
 └──────────────────────────────────┬────────────────────────────────────┘
                                    │ (2) Chuyển hướng trình duyệt tới:
                                    │     /api/v1/oauth2/authorization/{provider}
                                    ▼
 ┌───────────────────────────────────────────────────────────────────────┐
 │                   Spring Boot Backend (OAuth2 Client)                 │
 └──────────────────────────────────┬────────────────────────────────────┘
                                    │ (3) Tạo Authorization Request kèm state CSRF token
                                    │     Chuyển hướng sang Google / GitHub Login Page
                                    ▼
 ┌───────────────────────────────────────────────────────────────────────┐
 │               OAuth2 Provider (Google / GitHub Servers)               │
 │ • Người dùng đăng nhập và bấm "Cho phép" (Consent Screen)              │
 └──────────────────────────────────┬────────────────────────────────────┘
                                    │ (4) Callback về Backend kèm Authorization Code:
                                    │     GET /api/v1/login/oauth2/code/{provider}?code=...
                                    ▼
 ┌───────────────────────────────────────────────────────────────────────┐
 │             Backend: OAuth2AuthenticationSuccessHandler               │
 └──────────────────────────────────┬────────────────────────────────────┘
                                    │ (5) Đổi Authorization Code lấy Access Token & User Info
                                    │     (email, fullName, avatarUrl, providerId)
                                    ▼
 ┌───────────────────────────────────────────────────────────────────────┐
 │                      Service: OAuth2AuthService                       │
 │  1. Tra cứu email trong MySQL:                                        │
 │     • Chưa có -> Tạo User mới: is_verified = true, provider = google/ │
 │       github, default_mode = standard (Google) hoặc developer (GitHub)│
 │     • Đã có -> Liên kết provider_id và cập nhật avatar nếu thiếu     │
 │  2. Sinh cặp Token: JWT Access Token (15m) + HttpOnly Refresh Token    │
 └──────────────────────────────────┬────────────────────────────────────┘
                                    │ (6) Redirect về Frontend kèm Access Token:
                                    │     GET /oauth2/callback?token={jwt}&provider={provider}
                                    │     (Ghi HttpOnly Refresh Token Cookie)
                                    ▼
 ┌───────────────────────────────────────────────────────────────────────┐
 │                     Client Frontend: React SPA                        │
 │  1. Trích xuất token từ URL, lưu vào AuthContext state               │
 │  2. Xóa query token trên thanh địa chỉ URL (chống lộ URL history)     │
 │  3. Chuyển hướng người dùng vào Dashboard: /tasks                     │
 └───────────────────────────────────────────────────────────────────────┘
```

---

### 3. Mô Hình Dữ Liệu & Database Migration (`V3__add_oauth2_providers.sql`)

Để hỗ trợ người dùng đăng nhập qua bên thứ ba (không có mật khẩu cục bộ), bảng `users` cần được điều chỉnh:

```sql
-- 1. Cho phép password_hash mang giá trị NULL đối với tài khoản chỉ đăng nhập qua mạng xã hội
ALTER TABLE users MODIFY COLUMN password_hash VARCHAR(255) NULL;

-- 2. Bổ sung nhà cung cấp xác thực (local, google, github)
ALTER TABLE users ADD COLUMN auth_provider VARCHAR(20) NOT NULL DEFAULT 'local' AFTER email;

-- 3. Bổ sung mã định danh duy nhất từ nhà cung cấp (Google 'sub' ID hoặc GitHub 'id')
ALTER TABLE users ADD COLUMN provider_id VARCHAR(100) NULL AFTER auth_provider;

-- 4. Đảm bảo tính duy nhất của cặp (auth_provider, provider_id)
ALTER TABLE users ADD CONSTRAINT uq_users_provider UNIQUE (auth_provider, provider_id);

-- 5. Đánh index tìm kiếm nhanh theo auth_provider
CREATE INDEX idx_users_provider ON users(auth_provider);
```

---

### 4. Thiết Kế Backend & Cấu Hình Spring Boot

#### 4.1. Thư viện phụ thuộc (`pom.xml`):
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-client</artifactId>
</dependency>
```

#### 4.2. Cấu hình Spring Security (`SecurityConfig.java`):
- Cho phép các endpoint xác thực OAuth2 không cần token:
  - `/oauth2/**`
  - `/login/oauth2/**`
- Kích hoạt `oauth2Login()` với custom `authorizationEndpoint`, `CustomOAuth2UserService`, `OAuth2AuthenticationSuccessHandler`, `OAuth2AuthenticationFailureHandler`.

#### 4.3. Xử lý Logic Sau Khi Đăng Nhập Thành Công (`OAuth2AuthenticationSuccessHandler`):
1. Đọc thuộc tính của người dùng:
   - **Google:** `email`, `name`, `picture`, `sub` (providerId).
   - **GitHub:** `email` (gọi thêm GitHub API emails nếu tài khoản để email private), `name`/`login`, `avatar_url`, `id` (providerId).
2. Xử lý tài khoản trong `UserRepository`:
   - Nếu email đã tồn tại: Liên kết tài khoản (`auth_provider = 'google'/'github'`), cập nhật `avatar_url` nếu chưa có.
   - Nếu email chưa có: Tạo tài khoản mới, tự động đánh dấu `is_verified = true` (không cần gửi email xác thực OTP vì Google/GitHub đã bảo chứng email), gán chế độ mặc định:
     - Google -> `default_mode = 'standard'`
     - GitHub -> `default_mode = 'developer'`
3. Sinh cặp mã **JWT Access Token (15 phút)** và **Refresh Token (7 ngày)**.
4. Đính kèm Refresh Token vào `HttpOnly Cookie`.
5. Redirect người dùng về địa chỉ:
   `${FRONTEND_URL}/oauth2/callback?token=${accessToken}`

---

### 5. Thiết Kế Giao Diện Frontend & Trải Nghiệm Tương Tác (UI Motion)

#### 5.1. Nút bấm Đăng nhập Mạng xã hội trên `LoginPage` và `RegisterPage`:
- Đặt bên dưới nút đăng nhập chính, phân tách bằng dải phân cách:
  `─── Hoặc tiếp tục với ───`
- **Nút "Tiếp tục với Google":**
  - Icon: Google 'G' Logo đa màu chuẩn hãng (SVG).
  - Giao diện: Nền trắng viền xám nhẹ `border: 1px solid var(--color-border)`.
  - Hiệu ứng: Hover nâng nhẹ `translateY(-1.5px)`, bóng phản quang đa tầng, nhún nhẹ khi click `scale(0.985)`.
- **Nút "Tiếp tục với GitHub":**
  - Icon: GitHub Invertocat Logo (SVG).
  - Giao diện: Tone màu Dark Slate `#24292F` tạo sự tương phản mạnh mẽ và uy tín cho dân Dev.
  - Hiệu ứng: Hover đổi sắc độ phát sáng viền nhẹ, nâng `translateY(-1.5px)`.

#### 5.2. Màn hình tiếp nhận Callback (`/oauth2/callback`):
- Component `OAuth2CallbackPage.tsx`:
  - Hiển thị spinner chuyển động mượt mà (60fps) với thông điệp: *"Đang đồng bộ tài khoản Dylask của bạn..."*.
  - Đọc `token` từ URL search params, gọi `handleOAuth2Success(token)` trong `AuthContext`.
  - Xóa token khỏi URL bằng `window.history.replaceState` để bảo mật.
  - Chuyển hướng mượt mà vào Dashboard `http://localhost:5173/tasks`.

---

### 6. Cấu Hình Biến Môi Trường (`.env`)

```env
# ==========================================
# 6. Cấu hình Đăng nhập Mạng xã hội OAuth2
# ==========================================
# Google Cloud Console: https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# GitHub Developer Settings: https://github.com/settings/developers
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

---

### 7. Ma Trận Kiểm Thử Tự Động (Test Matrix & Acceptance Criteria)

| Mã Test | Kịch bản kiểm thử | Kết quả thực tế |
| :--- | :--- | :--- |
| **TC-OAUTH-01** | Người dùng mới đăng nhập qua Google | **PASS** (Tạo User mới `default_mode = 'standard'`, `is_verified = true`, cấp cặp JWT token) |
| **TC-OAUTH-02** | Người dùng mới đăng nhập qua GitHub | **PASS** (Tạo User mới `default_mode = 'developer'`, đồng bộ avatar, cấp cặp JWT token) |
| **TC-OAUTH-03** | Người dùng đã đăng ký email trước đó, nay đăng nhập qua Google/GitHub trùng email | **PASS** (Tự động liên kết tài khoản an toàn qua Account Linking) |
| **TC-OAUTH-04** | Người dùng cũ đăng nhập lại qua Google/GitHub | **PASS** (Cấp phát token mới ngay lập tức mà không trùng lặp bản ghi) |
| **TC-OAUTH-05** | Người dùng bấm Hủy/Từ chối cấp quyền trên màn hình Google/GitHub | **PASS** (Failure Handler redirect về `/login?error=...`) |

---

### 8. Lịch Sử Hoàn Thành (Execution Record)

- [x] **Bước 1 (Review Spec):** Phê duyệt spec `FEAT-AUTH-03`.
- [x] **Bước 2 (Database Migration):** Hoàn thành `V3__add_oauth2_providers.sql`, đã chạy migrate lên MySQL DB schema version 3.
- [x] **Bước 3 (Backend Implementation):** Tích hợp `spring-boot-starter-oauth2-client`, `CustomOAuth2UserService`, `OAuth2AuthenticationSuccessHandler`, `OAuth2AuthenticationFailureHandler`, `OAuth2AuthService`.
- [x] **Bước 4 (Frontend Implementation):** Component `SocialAuthButtons`, trang `OAuth2CallbackPage`, cập nhật `LoginPage` và `RegisterPage`.
- [x] **Bước 5 (Kiểm thử & Archive):** 22/22 unit tests passed 100%, chuyển spec sang `03.archive`.
