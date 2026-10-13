# Quy Chuẩn ApiResponse<T> & ErrorCode Trong Dylask Backend

## 1. Mẫu Lớp ApiResponse<T>
```java
package com.dylask.common.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.time.Instant;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private boolean success;
    private int code;
    private String errorCode;
    private String message;
    private T data;
    private List<FieldErrorDTO> errors;
    @Builder.Default
    private String timestamp = Instant.now().toString();

    public static <T> ApiResponse<T> ok(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .code(200)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> created(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .code(201)
                .message(message)
                .data(data)
                .build();
    }
}
```

## 2. Bảng Danh Mục Mã Lỗi Nghiệp Vụ (ErrorCode)
| ErrorCode | HTTP Status | Ý nghĩa |
|---|---|---|
| `VALIDATION_FAILED` | 400 | Dữ liệu đầu vào không hợp lệ |
| `UNAUTHORIZED` | 401 | Thiếu token hoặc token hết hạn |
| `FORBIDDEN` | 403 | Không có quyền truy cập tài nguyên |
| `RESOURCE_NOT_FOUND` | 404 | Không tìm thấy bản ghi theo ID |
| `RESOURCE_ALREADY_EXISTS` | 409 | Trùng lặp dữ liệu (Email, Username...) |
| `AI_QUOTA_EXCEEDED` | 429 | Hết 10 lượt AI dùng thử/tháng, yêu cầu nhập BYOK key |
| `INTERNAL_SERVER_ERROR` | 500 | Lỗi hệ thống không mong muốn |
