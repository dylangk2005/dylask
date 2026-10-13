# Xử Lý Ngoại Lệ Tập Trung & Chuẩn Mã Lỗi Hệ Thống Dylask

Tài liệu này hướng dẫn cách cấu hình và ném ngoại lệ trong backend Dylask, đảm bảo API luôn trả về `ApiResponse<T>` đồng nhất theo [api-specs.md](file:///d:/dylann/my-apps/dylask-web/docs/specs/api-specs.md).

---

## 1. Lớp Định Danh Mã Lỗi (`ErrorCode.java`)
Vị trí: `com.dylask.common.exception.ErrorCode`

```java
package com.dylask.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    // 400 Bad Request
    VALIDATION_FAILED("VALIDATION_FAILED", "Dữ liệu đầu vào không hợp lệ", HttpStatus.BAD_REQUEST),
    INVALID_REQUEST("INVALID_REQUEST", "Yêu cầu không hợp lệ", HttpStatus.BAD_REQUEST),
    
    // 401 Unauthorized
    UNAUTHORIZED("UNAUTHORIZED", "Chưa xác thực hoặc token không hợp lệ", HttpStatus.UNAUTHORIZED),
    TOKEN_EXPIRED("TOKEN_EXPIRED", "Phiên đăng nhập đã hết hạn", HttpStatus.UNAUTHORIZED),
    
    // 403 Forbidden
    FORBIDDEN("FORBIDDEN", "Bạn không có quyền truy cập tài nguyên này", HttpStatus.FORBIDDEN),
    
    // 404 Not Found
    RESOURCE_NOT_FOUND("RESOURCE_NOT_FOUND", "Tài nguyên yêu cầu không tồn tại", HttpStatus.NOT_FOUND),
    USER_NOT_FOUND("USER_NOT_FOUND", "Không tìm thấy người dùng", HttpStatus.NOT_FOUND),
    TASK_NOT_FOUND("TASK_NOT_FOUND", "Không tìm thấy công việc", HttpStatus.NOT_FOUND),
    
    // 409 Conflict
    RESOURCE_ALREADY_EXISTS("RESOURCE_ALREADY_EXISTS", "Dữ liệu đã tồn tại trong hệ thống", HttpStatus.CONFLICT),
    EMAIL_ALREADY_EXISTS("EMAIL_ALREADY_EXISTS", "Địa chỉ email này đã được sử dụng", HttpStatus.CONFLICT),
    
    // 429 Too Many Requests
    AI_QUOTA_EXCEEDED("AI_QUOTA_EXCEEDED", "Bạn đã dùng hết 10 lượt AI miễn phí trong tháng. Vui lòng cung cấp API Key riêng trong Cài Đặt (BYOK).", HttpStatus.TOO_MANY_REQUESTS),
    
    // 500 Internal Server Error
    INTERNAL_SERVER_ERROR("INTERNAL_SERVER_ERROR", "Đã xảy ra lỗi hệ thống, vui lòng thử lại sau", HttpStatus.INTERNAL_SERVER_ERROR);

    private final String code;
    private final String defaultMessage;
    private final HttpStatus httpStatus;
}
```

---

## 2. Ngoại Lệ Nghiệp Vụ (`AppException.java`)
Vị trí: `com.dylask.common.exception.AppException`

```java
package com.dylask.common.exception;

import lombok.Getter;

@Getter
public class AppException extends RuntimeException {
    private final ErrorCode errorCode;

    public AppException(ErrorCode errorCode) {
        super(errorCode.getDefaultMessage());
        this.errorCode = errorCode;
    }

    public AppException(ErrorCode errorCode, String customMessage) {
        super(customMessage);
        this.errorCode = errorCode;
    }
}
```

---

## 3. Bộ Xử Lý Ngoại Lệ Toàn Cục (`GlobalExceptionHandler.java`)
Vị trí: `com.dylask.common.exception.GlobalExceptionHandler`

```java
package com.dylask.common.exception;

import com.dylask.common.dto.ApiResponse;
import com.dylask.common.dto.FieldErrorDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.List;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleAppException(AppException ex) {
        log.warn("Business Exception: [{}] {}", ex.getErrorCode().getCode(), ex.getMessage());
        ErrorCode ec = ex.getErrorCode();
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(false)
                .code(ec.getHttpStatus().value())
                .errorCode(ec.getCode())
                .message(ex.getMessage())
                .build();
        return ResponseEntity.status(ec.getHttpStatus()).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException ex) {
        BindingResult result = ex.getBindingResult();
        List<FieldErrorDTO> fieldErrors = result.getFieldErrors().stream()
                .map(err -> FieldErrorDTO.builder()
                        .field(err.getField())
                        .message(err.getDefaultMessage())
                        .rejectedValue(err.getRejectedValue())
                        .build())
                .toList();

        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(false)
                .code(400)
                .errorCode(ErrorCode.VALIDATION_FAILED.getCode())
                .message("Dữ liệu gửi lên không hợp lệ")
                .errors(fieldErrors)
                .build();
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleUncaughtException(Exception ex) {
        log.error("Unhandled Exception caught: ", ex);
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(false)
                .code(500)
                .errorCode(ErrorCode.INTERNAL_SERVER_ERROR.getCode())
                .message("Lỗi máy chủ nội bộ. Vui lòng liên hệ quản trị viên.")
                .build();
        return ResponseEntity.internalServerError().body(response);
    }
}
```
