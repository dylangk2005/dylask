# Đặc Tả Tiêu Chuẩn RESTful API Hệ Thống Dylask (API Specifications)

- **Phiên bản:** `1.0.0`
- **Áp dụng cho:** `dylask-backend` (Spring Boot 4 / Java 25) & `dylask-frontend` (React 19 / TypeScript / Vite 8)
- **Quy ước đường dẫn gốc:** `/api/v1`

---

## 1. Nguyên Tắc Thiết Kế API Cốt Lõi

1. **Chuẩn RESTful:** Sử dụng danh từ số nhiều cho tài nguyên (`/tasks`, `/projects`, `/users`), các thao tác hành động dựa trên HTTP Method chuẩn (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
2. **Định dạng dữ liệu:** Mọi trao đổi dữ liệu (Request & Response body) đều ở định dạng `application/json;charset=UTF-8`.
3. **Múi giờ & Thời gian:** Mọi trường thời gian (`timestamp`, `dueDate`, `createdAt`...) trao đổi qua API đều theo chuẩn ISO-8601 UTC (`yyyy-MM-dd'T'HH:mm:ss.SSS'Z'`). Client chịu trách nhiệm hiển thị theo múi giờ địa phương của người dùng (mặc định UTC+7).
4. **Bảo mật Header:** 
   - Mọi request cần xác thực bắt buộc đính kèm header:  
     `Authorization: Bearer <access_token>`
   - Không truyền thông tin nhạy cảm (mật khẩu, API key, token) qua Query Parameters.

---

## 2. Chuẩn Phản Hồi Toàn Hệ Thống (`ApiResponse<T>`)

Mọi Controller trong `dylask-backend` **BẮT BUỘC** đóng gói dữ liệu trả về thông qua lớp generic `com.dylask.common.dto.ApiResponse<T>`. Tuyệt đối không trả về raw Entity hoặc primitive type trực tiếp.

### 2.1. Cấu Trúc Khung Phản Hồi (Response Wrapper Schema)

```typescript
interface ApiResponse<T> {
  success: boolean;               // true nếu thành công, false nếu có lỗi
  code: number;                   // Mã trạng thái HTTP (200, 201, 400, 401, 404, 500...)
  errorCode?: string;             // Mã lỗi định danh nghiệp vụ (chỉ xuất hiện khi success = false)
  message: string;                // Thông điệp ngắn gọn cho người dùng/lập trình viên
  data: T | null;                 // Dữ liệu nghiệp vụ trả về (null nếu có lỗi)
  errors?: FieldErrorDTO[] | null;// Chi tiết lỗi validate từng trường (nếu có)
  timestamp: string;              // ISO-8601 UTC timestamp tại thời điểm response được sinh ra
}

interface FieldErrorDTO {
  field: string;                  // Tên trường bị lỗi (ví dụ: "email", "dueDate")
  message: string;                // Mô tả chi tiết lỗi (ví dụ: "Email không đúng định dạng")
  rejectedValue?: any;            // Giá trị bị từ chối
}
```

### 2.2. Ví Dụ Phản Hồi Thành Công (Success Response)

- **HTTP 200 OK:**
```json
{
  "success": true,
  "code": 200,
  "errorCode": null,
  "message": "Thao tác thành công",
  "data": {
    "id": 102,
    "title": "Thiết kế database schema",
    "status": "in_progress",
    "priority": "high"
  },
  "errors": null,
  "timestamp": "2026-10-12T14:15:30.120Z"
}
```

- **HTTP 201 Created:**
```json
{
  "success": true,
  "code": 201,
  "errorCode": null,
  "message": "Tạo công việc mới thành công",
  "data": {
    "id": 103,
    "title": "Viết tài liệu API specs"
  },
  "errors": null,
  "timestamp": "2026-10-12T14:16:00.000Z"
}
```

### 2.3. Ví Dụ Phản Hồi Thất Bại (Error Response)

- **Lỗi Validate dữ liệu đầu vào (HTTP 400 Bad Request):**
```json
{
  "success": false,
  "code": 400,
  "errorCode": "VALIDATION_FAILED",
  "message": "Dữ liệu gửi lên không hợp lệ",
  "data": null,
  "errors": [
    {
      "field": "email",
      "message": "Email không đúng định dạng chuẩn",
      "rejectedValue": "nguyenduyanh@"
    },
    {
      "field": "password",
      "message": "Mật khẩu phải có độ dài từ 8 đến 32 ký tự",
      "rejectedValue": "123"
    }
  ],
  "timestamp": "2026-10-12T14:17:15.540Z"
}
```

- **Lỗi Nghiệp Vụ Cụ Thể (HTTP 403 Forbidden - Hết Lượt Thử AI):**
```json
{
  "success": false,
  "code": 403,
  "errorCode": "AI_TRIAL_LIMIT_EXCEEDED",
  "message": "Bạn đã sử dụng hết 10 lượt gọi AI dùng thử trong tháng. Vui lòng nhập API Key riêng (BYOK) tại Cài đặt > AI để tiếp tục.",
  "data": null,
  "errors": null,
  "timestamp": "2026-10-12T14:18:22.012Z"
}
```

---

## 3. Chuẩn Phân Trang & Sắp Xếp (`PageResponse<T>`)

Mọi endpoint trả về danh sách có số lượng phần tử biến động (Tasks, Projects, Audit Logs, Commits) bắt buộc hỗ trợ phân trang chuẩn Spring Data JPA.

### 3.1. Query Parameters Chuẩn

| Parameter | Kiểu | Mặc định | Giới hạn | Ý nghĩa |
|---|---|---|---|---|
| `page` | `int` | `0` | $\ge 0$ | Chỉ số trang (0-indexed theo chuẩn Spring Boot). |
| `size` | `int` | `20` | `1` đến `100` | Số lượng phần tử tối đa trên mỗi trang. |
| `sort` | `string` | `createdAt,desc` | - | Cú pháp: `<tên_thuộc_tính>,<asc\|desc>`. Có thể truyền nhiều sort (ví dụ: `priority,desc&sort=createdAt,asc`). |

### 3.2. Cấu Trúc Khung Phân Trang Schema

```typescript
interface PageResponse<T> {
  items: T[];                     // Danh sách phần tử của trang hiện tại
  pageNumber: number;             // Trang hiện tại (bắt đầu từ 0)
  pageSize: number;               // Kích thước trang
  totalElements: number;          // Tổng số phần tử trên toàn bộ các trang
  totalPages: number;             // Tổng số trang tính toán được
  isFirst: boolean;               // Có phải trang đầu tiên không
  isLast: boolean;                // Có phải trang cuối cùng không
  hasNext: boolean;               // Có trang kế tiếp không
  hasPrevious: boolean;           // Có trang phía trước không
}
```

---

## 4. Bảng Danh Mục Mã Lỗi Toàn Hệ Thống (`ErrorCode`)

Được khai báo tập trung tại `com.dylask.common.exception.ErrorCode` enum:

| Nhóm | ErrorCode | HTTP Status | Thông điệp mặc định |
|---|---|---|---|
| **Chung** | `COMMON_SUCCESS` | `200` | Thao tác thành công. |
| | `COMMON_BAD_REQUEST` | `400` | Yêu cầu không hợp lệ. |
| | `VALIDATION_FAILED` | `400` | Dữ liệu đầu vào không vượt qua kiểm tra ràng buộc. |
| | `UNAUTHORIZED` | `401` | Chưa xác thực hoặc phiên đăng nhập không hợp lệ. |
| | `FORBIDDEN` | `403` | Bạn không có quyền truy cập tài nguyên này. |
| | `RESOURCE_NOT_FOUND` | `404` | Tài nguyên yêu cầu không tồn tại trên hệ thống. |
| | `METHOD_NOT_ALLOWED` | `405` | Phương thức HTTP không được hỗ trợ. |
| | `INTERNAL_SERVER_ERROR` | `500` | Đã xảy ra lỗi nội bộ máy chủ. |
| **Xác thực** | `AUTH_EMAIL_ALREADY_EXISTS` | `409` | Địa chỉ email đã được đăng ký. |
| | `AUTH_INVALID_CREDENTIALS` | `401` | Email hoặc mật khẩu không chính xác. |
| | `AUTH_ACCESS_TOKEN_EXPIRED` | `401` | Access token đã hết hạn, vui lòng làm mới. |
| | `AUTH_INVALID_TOKEN` | `401` | Token không đúng định dạng hoặc đã bị chỉnh sửa trái phép. |
| | `AUTH_REFRESH_TOKEN_EXPIRED` | `401` | Refresh token đã hết hạn, vui lòng đăng nhập lại. |
| | `AUTH_REFRESH_TOKEN_REVOKED` | `401` | Refresh token đã bị thu hồi hoặc bị tái sử dụng (phát hiện xâm nhập). |
| **Công việc** | `TASK_NOT_FOUND` | `404` | Không tìm thấy công việc với ID đã cung cấp. |
| | `TASK_ACCESS_DENIED` | `403` | Bạn không có quyền chỉnh sửa công việc này. |
| | `CHECKLIST_NOT_FOUND` | `404` | Không tìm thấy mục kiểm tra con tương ứng. |
| **Dự án** | `PROJECT_NOT_FOUND` | `404` | Dự án không tồn tại. |
| | `PROJECT_NAME_DUPLICATE` | `409` | Tên dự án đã tồn tại trong không gian làm việc của bạn. |
| | `SPRINT_NOT_FOUND` | `404` | Không tìm thấy Sprint yêu cầu. |
| | `SPRINT_ALREADY_ACTIVE` | `400` | Dự án đang có một Sprint khác đang diễn ra (chỉ 1 Active Sprint). |
| **Webhook** | `GIT_WEBHOOK_INVALID_SECRET` | `401` | Chữ ký HMAC của Webhook không khớp. |
| | `GIT_EVENT_NOT_SUPPORTED` | `400` | Loại sự kiện Git không nằm trong phạm vi xử lý tự động. |
| **AI Module**| `AI_MODULE_DISABLED` | `400` | Module AI đang tắt tại Cài đặt hoặc Dự án. |
| | `AI_KEY_REQUIRED` | `400` | Chưa cấu hình khóa API riêng và không còn lượt dùng thử. |
| | `AI_KEY_INVALID` | `400` | Khóa API không thể kết nối tới nhà cung cấp mô hình. |
| | `AI_TRIAL_LIMIT_EXCEEDED` | `403` | Đã sử dụng hết 10 lượt gọi AI dùng thử trong tháng. |
| | `AI_INPUT_EXCEEDS_LIMIT` | `400` | Độ dài nội dung gửi tới AI vượt quá giới hạn 4.000 ký tự. |
| | `AI_PROVIDER_ERROR` | `502` | Lỗi phản hồi từ phía nhà cung cấp dịch vụ AI (Gemini/OpenAI). |

---

## 5. Xử Lý Ngoại Lệ Tập Trung (`GlobalExceptionHandler`)

Mọi lỗi phát sinh trong hệ thống được chặn và xử lý thống nhất thông qua lớp `@RestControllerAdvice` tại `com.dylask.common.exception.GlobalExceptionHandler`:

1. **`MethodArgumentNotValidException` (Bean Validation):**
   - Trả về HTTP 400 Bad Request.
   - Trích xuất danh sách các trường vi phạm vào `errors: FieldErrorDTO[]`.
2. **`AppException` (Custom Business Exception):**
   - Trả về HTTP Status tương ứng cấu hình trong `ErrorCode`.
   - Trả về `errorCode` và `message` chuẩn hóa.
3. **`BadCredentialsException` & `AuthenticationException`:**
   - Trả về HTTP 401 Unauthorized và mã `AUTH_INVALID_CREDENTIALS`.
4. **`AccessDeniedException`:**
   - Trả về HTTP 403 Forbidden và mã `FORBIDDEN`.
5. **`Exception` (Unchecked Runtime Exception):**
   - Trả về HTTP 500 Internal Server Error.
   - Ghi chi tiết Stack Trace vào SLF4J (`log.error(...)`).
   - Che giấu toàn bộ chi tiết nội bộ, chỉ hiển thị thông điệp chung: *"Đã xảy ra sự cố nội bộ. Vui lòng thử lại sau."*

---

## 6. Tiêu Chuẩn Client Frontend (`dylask-frontend`)

### 6.1. Cấu Hình Base URL
- Sử dụng biến môi trường: `import.meta.env.VITE_API_BASE_URL` (ví dụ: `http://localhost:8080/api/v1`).
- Tuyệt đối không hard-code `localhost` hay IP máy chủ vào mã nguồn.

### 6.2. Cơ Chế Tự Động Làm Mới Token (Silent Refresh Interceptor)
1. Frontend lưu `accessToken` trong bộ nhớ ứng dụng (Memory / React State) hoặc Storage; `refreshToken` được quản lý bảo mật.
2. Request Interceptor: Đính kèm `Authorization: Bearer <accessToken>`.
3. Response Interceptor:
   - Khi nhận HTTP `401 Unauthorized` với mã `AUTH_ACCESS_TOKEN_EXPIRED`:
   - Tạm giữ (queue) các request đang chờ.
   - Gửi yêu cầu `POST /api/v1/auth/refresh` kèm `refreshToken`.
   - Nếu làm mới thành công: Cập nhật `accessToken` mới và tự động gửi lại các request trong hàng đợi.
   - Nếu làm mới thất bại (Refresh Token hết hạn hoặc revoked): Xóa toàn bộ phiên lưu trữ và chuyển hướng người dùng về trang `/login`.
