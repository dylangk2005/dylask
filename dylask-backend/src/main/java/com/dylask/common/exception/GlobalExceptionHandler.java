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
                .message("Đã xảy ra lỗi máy chủ nội bộ. Vui lòng liên hệ quản trị viên.")
                .build();
        return ResponseEntity.internalServerError().body(response);
    }
}
