# Đặc Tả Kỹ Thuật Chi Tiết: FEAT-AUTH-02
## Quản Lý Hồ Sơ Người Dùng & Chuyển Đổi Giao Diện Đa Chế Độ (Dual-Mode Toggle)

- **Mã tính năng:** `FEAT-AUTH-02`
- **Phân hệ:** User Profile & Dual-Mode UI System
- **Trạng thái:** `01.draft` (Chờ người dùng review)
- **Độ ưu tiên:** `P1 (Critical - Trải nghiệm cốt lõi của Dylask)`

---

### 1. Mục Tiêu (User Story)

Là người dùng Dylask, tôi muốn quản lý thông tin tài khoản cá nhân (họ tên, đổi mật khẩu) và chuyển đổi mượt mà giữa Chế độ Cá nhân (*Standard Mode*) và Chế độ Lập trình viên (*Developer Mode*) chỉ bằng một thao tác bấm phím hoặc click chuột, đồng thời hệ thống tự động ghi nhớ tùy chọn này cho những lần truy cập sau trên mọi thiết bị.

---

### 2. Luồng Nghiệp Vụ & Sơ Đồ Xử Lý (Business Flow Diagram)

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│               SƠ ĐỒ LUỒNG CHUYỂN ĐỔI CHẾ ĐỘ GIAO DIỆN (DUAL-MODE TOGGLE)                │
└────────────────────────────────────────────────────────────────────────────────────────┘

  [ NGƯỜI DÙNG ]
        │
        │ (1) Bấm nút chọn "Developer Mode" (Sidebar footer hoặc Header)
        ▼
  ┌────────────────────────────────────────────────────────┐
  │              UI Component: ModeSwitcher                │
  └──────────────────────────┬─────────────────────────────┘
                             │ (2) Gọi switchMode("developer")
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │                 Hook: useDualMode                      │
  └──────────┬─────────────────────────────────┬───────────┘
             │                                 │
             │ [Bước 3A: OPTIMISTIC UI < 16ms] │ [Bước 3B: Gửi ngầm API]
             ▼                                 ▼
  ┌───────────────────────────────┐     ┌────────────────────────────────┐
  │ GIAO DIỆN THAY ĐỔI TỨC THÌ    │     │ PATCH /api/v1/users/me/mode    │
  │ • DOM: html[data-mode="dev"]  │     │ Body: { "mode": "developer" }  │
  │ • Lưu cache: localStorage     │     └───────────────┬────────────────┘
  │ • Đổi Route: /developer/board │                     │
  └───────────────────────────────┘                     ▼
                                        ┌────────────────────────────────┐
                                        │ Backend: UserController        │
                                        │ UPDATE users.default_mode      │
                                        └───────────────┬────────────────┘
                                                        │
                         ┌──────────────────────────────┴──────────────────────────────┐
                         │                                                             │
                         ▼                                                             ▼
         [ THÀNH CÔNG: HTTP 200 ]                                       [ THẤT BẠI: Lỗi mạng / HTTP 500 ]
         • DB lưu default_mode = 'developer'                            • Bắn Toast cảnh báo nhẹ nhàng:
         • Lần sau đăng nhập tự mở Dev Mode                             "Không thể lưu chế độ lên máy chủ"
                                                                        • Giữ giao diện hiện tại cho người dùng
```

#### 2.1. Quy tắc Chuyển đổi Dual-Mode (Dual-Mode Switching)
- **Hai chế độ được hỗ trợ:**
  - `standard`: Giao diện tối giản, gam màu dịu, tập trung vào Danh sách việc cá nhân (List View), Lịch trình và Pomodoro.
  - `developer`: Giao diện kỹ thuật độ mật độ cao (Compact High Density), gam màu tối kỹ thuật, phông chữ `JetBrains Mono` kết hợp `Plus Jakarta Sans`, Sprint Board (Kanban 5 cột), phím tắt `Ctrl + K`.
- **Cơ chế Giao diện Lạc quan (Optimistic UI):**
  - Khi người dùng click nút chuyển chế độ tại Sidebar footer hoặc Header:
    1. Thay đổi thuộc tính DOM `data-mode` trên thẻ `<html>` lập tức để CSS Variables tự động chuyển bảng màu (Theme Token Switch).
    2. Điều hướng URL tương ứng: từ `/tasks` sang `/developer/board` (hoặc ngược lại).
    3. Ghi đè bộ nhớ đệm `localStorage.setItem('dylask_active_mode', mode)` để ngăn chặn hiện tượng nhấp nháy giao diện (Flash of Unstyled Content - FOUC) khi F5/reload trang.
  - Gửi request ngầm `PATCH /api/v1/users/me/mode` về backend.
- **Ràng buộc giá trị:** Chỉ chấp nhận duy nhất 2 giá trị: `"standard"` hoặc `"developer"`. Mọi giá trị khác đều bị backend từ chối với HTTP 400 Bad Request.

#### 2.2. Quy tắc Quản lý Hồ sơ Cá nhân (Profile Management)
- **Xem thông tin (`GET /api/v1/users/me`):**
  - Trả về thông tin đầy đủ của tài khoản đang đăng nhập: `id`, `email`, `fullName`, `defaultMode`, `aiEnabled`, `aiTrialCount`, `aiTrialLimit`, `createdAt`.
- **Cập nhật họ tên (`PUT /api/v1/users/me/profile`):**
  - Chỉ cho phép cập nhật `fullName` (độ dài 2–100 ký tự, không được chỉ chứa khoảng trắng). Email là định danh bất biến, không cho phép đổi qua endpoint này.
- **Đổi mật khẩu (`PUT /api/v1/users/me/password`):**
  - Yêu cầu: `currentPassword`, `newPassword`, `confirmPassword`.
  - Kiểm tra mật khẩu hiện tại có khớp với `password_hash` trong DB.
  - Mật khẩu mới không được trùng mật khẩu cũ, độ dài 8–32 ký tự, đủ chữ hoa, thường và số.
  - Đổi mật khẩu thành công: Tự động thu hồi toàn bộ Refresh Tokens hiện có ngoại trừ phiên hiện tại để bảo vệ tài khoản khỏi rò rỉ.

---

### 3. Thiết Kế Cơ Sở Dữ Liệu

Tính năng này sử dụng trực tiếp cấu trúc bảng `users` đã thiết kế tại `FEAT-AUTH-01` và `database-specs.md`:

```sql
-- Cột lưu trữ chế độ mặc định của tài khoản
ALTER TABLE users 
ADD CONSTRAINT chk_users_default_mode CHECK (default_mode IN ('standard', 'developer'));
```

---

### 4. Chi Tiết API Contract

#### 4.1. `GET /api/v1/users/me` - Lấy Thông Tin Hồ Sơ Cá Nhân
- **Headers:** `Authorization: Bearer <access_token>`
- **Response Success (HTTP 200 OK):**
```json
{
  "success": true,
  "code": 200,
  "errorCode": null,
  "message": "Lấy thông tin tài khoản thành công",
  "data": {
    "id": 1,
    "email": "nguyenduyanh@example.com",
    "fullName": "Nguyễn Duy Anh",
    "defaultMode": "standard",
    "aiEnabled": true,
    "aiTrialCount": 4,
    "aiTrialLimit": 10,
    "aiTrialResetAt": "2026-11-01T00:00:00.000Z",
    "createdAt": "2026-10-12T14:20:00.000Z"
  },
  "errors": null,
  "timestamp": "2026-10-12T14:25:00.000Z"
}
```

#### 4.2. `PATCH /api/v1/users/me/mode` - Chuyển Đổi Chế Độ Mặc Định
- **Headers:** `Authorization: Bearer <access_token>`
- **Request Body:**
```json
{
  "mode": "developer"
}
```
- **Response Success (HTTP 200 OK):**
```json
{
  "success": true,
  "code": 200,
  "errorCode": null,
  "message": "Chuyển đổi chế độ thành công",
  "data": {
    "defaultMode": "developer"
  },
  "errors": null,
  "timestamp": "2026-10-12T14:26:00.000Z"
}
```
- **Response Error (HTTP 400 Bad Request - Giá trị mode không hợp lệ):**
```json
{
  "success": false,
  "code": 400,
  "errorCode": "VALIDATION_FAILED",
  "message": "Chế độ không hợp lệ, chỉ chấp nhận 'standard' hoặc 'developer'",
  "data": null,
  "errors": [
    {
      "field": "mode",
      "message": "Chế độ phải là 'standard' hoặc 'developer'",
      "rejectedValue": "pro_mode"
    }
  ],
  "timestamp": "2026-10-12T14:26:05.000Z"
}
```

#### 4.3. `PUT /api/v1/users/me/profile` - Cập Nhật Họ Tên
- **Headers:** `Authorization: Bearer <access_token>`
- **Request Body:**
```json
{
  "fullName": "Nguyễn Duy Anh (Lead Dev)"
}
```
- **Response Success (HTTP 200 OK):**
```json
{
  "success": true,
  "code": 200,
  "errorCode": null,
  "message": "Cập nhật hồ sơ thành công",
  "data": {
    "id": 1,
    "fullName": "Nguyễn Duy Anh (Lead Dev)"
  },
  "errors": null,
  "timestamp": "2026-10-12T14:27:00.000Z"
}
```

#### 4.4. `PUT /api/v1/users/me/password` - Đổi Mật Khẩu
- **Headers:** `Authorization: Bearer <access_token>`
- **Request Body:**
```json
{
  "currentPassword": "Password123",
  "newPassword": "NewPassword456",
  "confirmPassword": "NewPassword456"
}
```
- **Response Success (HTTP 200 OK):**
```json
{
  "success": true,
  "code": 200,
  "errorCode": null,
  "message": "Đổi mật khẩu thành công. Các phiên đăng nhập trên thiết bị khác đã được thu hồi an toàn.",
  "data": null,
  "errors": null,
  "timestamp": "2026-10-12T14:28:00.000Z"
}
```

---

### 5. Cấu Trúc Mã Nguồn Backend (`dylask-backend`)

Mã nguồn tổ chức tại module `com.dylask.modules.user`:

```
com.dylask.modules.user/
├── controller/
│   └── UserController.java                  # API /api/v1/users/me/**
├── service/
│   ├── UserService.java                     # Interface nghiệp vụ user & profile
│   └── impl/UserServiceImpl.java            # Logic xử lý đổi mode, profile, password
├── dto/
│   ├── request/
│   │   ├── UpdateModeRequestDTO.java        # Record: String mode (@Pattern(regexp = "^(standard|developer)$"))
│   │   ├── UpdateProfileRequestDTO.java     # Record: String fullName (@NotBlank, @Size(min=2, max=100))
│   │   └── ChangePasswordRequestDTO.java    # Record: currentPassword, newPassword, confirmPassword
│   └── response/
│       ├── UserProfileDTO.java              # Record thông tin hồ sơ
│       └── UserModeResponseDTO.java         # Record: defaultMode
└── mapper/
    └── UserMapper.java                      # MapStruct: User -> UserProfileDTO
```

---

### 6. Cấu Trúc Mã Nguồn Frontend (`dylask-frontend`)

1. **Layout & UI Components:**
   - Liên kết giao diện mẫu: `docs/layout-html/settings/layout.html` (Tab Hồ sơ & Tab Giao diện).
   - Component chuyển đổi chế độ: `src/components/common/ModeSwitcher.tsx` (nhúng tại Footer Sidebar của cả hai chế độ).
2. **Custom Hook `useDualMode`:**
   ```typescript
   // src/hooks/useDualMode.ts
   export const useDualMode = () => {
     // Quản lý mode hiện tại ('standard' | 'developer')
     // Tự động set data-mode trên <html>
     // Gọi API PATCH /api/v1/users/me/mode ngầm
     // Điều hướng route tương ứng (/tasks <-> /developer/board)
   };
   ```
3. **Màn hình Cài đặt:**
   - `src/pages/settings/SettingsPage.tsx`
   - Tab 1: Cấu hình AI (kế thừa `FEAT-AI-01`).
   - Tab 2: Hồ sơ cá nhân & Đổi mật khẩu.
   - Tab 3: Tùy chỉnh chế độ mặc định ban đầu.

---

### 7. Tiêu Chí Nghiệm Thu & Ma Trận Kiểm Thử (Test Matrix)

| ID | Tình huống kiểm thử | Dữ liệu đầu vào | Kết quả mong đợi |
|---|---|---|---|
| **TC-USER-01** | Lấy profile hợp lệ | Access Token hợp lệ | HTTP 200 OK, trả về đúng UserProfileDTO kèm `defaultMode`. |
| **TC-USER-02** | Chuyển đổi mode thành công | `{ "mode": "developer" }` | HTTP 200 OK, DB cập nhật `default_mode = 'developer'`, giao diện đổi sang Dark Tech theme tức thì. |
| **TC-USER-03** | Chuyển đổi mode giá trị sai | `{ "mode": "pro_gamer" }` | HTTP 400 Bad Request với mã `VALIDATION_FAILED`. |
| **TC-USER-04** | Đổi họ tên thành công | `{ "fullName": "Lê Văn B" }` | HTTP 200 OK, DB lưu tên mới. |
| **TC-USER-05** | Đổi mật khẩu sai pass cũ | `currentPassword` không khớp | HTTP 400 Bad Request, mã lỗi `AUTH_INVALID_CREDENTIALS`. |
| **TC-USER-06** | Mật khẩu mới trùng pass cũ | `newPassword` = `currentPassword` | HTTP 400 Bad Request, thông báo mật khẩu mới phải khác mật khẩu hiện tại. |
| **TC-USER-07** | FOUC Prevention trên Frontend | Reload trang ở mode developer | Giao diện hiển thị trực tiếp Developer theme, không bị chớp giật sang Standard theme. |
