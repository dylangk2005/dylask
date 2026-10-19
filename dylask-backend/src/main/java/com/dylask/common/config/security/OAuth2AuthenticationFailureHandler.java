package com.dylask.common.config.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * Xử lý khi quá trình đăng nhập OAuth2 thất bại (người dùng từ chối cấp quyền,
 * lỗi kết nối mạng tới Google/GitHub, hoặc cấu hình Client ID chưa hợp lệ).
 * Chuyển hướng người dùng về trang Đăng nhập Frontend kèm thông báo lỗi rõ ràng.
 */
@Component
@Slf4j
public class OAuth2AuthenticationFailureHandler extends SimpleUrlAuthenticationFailureHandler {

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    /**
     * Điểm tiếp nhận lỗi xác thực OAuth2.
     * Mã hóa thông điệp lỗi và chuyển hướng về trang /login của Frontend.
     */
    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception
    ) throws IOException, ServletException {
        log.warn("Đăng nhập OAuth2 thất bại: {}", exception.getMessage());

        // 1. Mã hóa thông điệp lỗi URL-safe để tránh lỗi định dạng HTTP Redirect
        String rawMessage = exception.getMessage() != null ? exception.getMessage() : "Xác thực qua mạng xã hội không thành công";
        String encodedMessage = URLEncoder.encode(rawMessage, StandardCharsets.UTF_8);

        // 2. Chuyển hướng người dùng về trang đăng nhập với tham số error
        String targetUrl = frontendUrl + "/login?error=" + encodedMessage;
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
