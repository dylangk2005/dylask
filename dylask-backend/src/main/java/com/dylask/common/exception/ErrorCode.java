package com.dylask.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    // 400 Bad Request
    VALIDATION_FAILED("VALIDATION_FAILED", "Dữ liệu đầu vào không hợp lệ", HttpStatus.BAD_REQUEST),
    INVALID_REQUEST("INVALID_REQUEST", "Yêu cầu không hợp lệ", HttpStatus.BAD_REQUEST),
    
    // 401 Unauthorized
    UNAUTHORIZED("UNAUTHORIZED", "Chưa xác thực hoặc token không hợp lệ", HttpStatus.UNAUTHORIZED),
    TOKEN_EXPIRED("TOKEN_EXPIRED", "Phiên đăng nhập đã hết hạn", HttpStatus.UNAUTHORIZED),
    INVALID_CREDENTIALS("INVALID_CREDENTIALS", "Email hoặc mật khẩu không chính xác", HttpStatus.UNAUTHORIZED),
    EMAIL_NOT_VERIFIED("EMAIL_NOT_VERIFIED", "Tài khoản chưa được kích hoạt. Vui lòng xác thực email.", HttpStatus.UNAUTHORIZED),
    INVALID_OTP("INVALID_OTP", "Mã xác thực OTP không chính xác", HttpStatus.BAD_REQUEST),
    OTP_EXPIRED("OTP_EXPIRED", "Mã xác thực OTP đã hết hạn. Vui lòng yêu cầu gửi lại mã mới.", HttpStatus.BAD_REQUEST),
    
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

    ErrorCode(String code, String defaultMessage, HttpStatus httpStatus) {
        this.code = code;
        this.defaultMessage = defaultMessage;
        this.httpStatus = httpStatus;
    }
}
