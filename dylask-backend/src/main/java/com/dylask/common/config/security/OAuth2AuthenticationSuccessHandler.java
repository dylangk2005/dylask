package com.dylask.common.config.security;

import com.dylask.modules.auth.dto.AuthResponse;
import com.dylask.modules.auth.service.OAuth2AuthService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;

/**
 * Xử lý sự kiện sau khi người dùng xác thực thành công qua OAuth2 Provider (Google hoặc GitHub).
 * Trích xuất hồ sơ cá nhân, đồng bộ người dùng vào cơ sở dữ liệu, cấp phát Refresh Token qua
 * HttpOnly Cookie và chuyển hướng trình duyệt về giao diện Frontend kèm Access Token.
 */
@Component
@Slf4j
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private static final String REFRESH_TOKEN_COOKIE_NAME = "refreshToken";
    private static final Duration REFRESH_TOKEN_DURATION = Duration.ofDays(7);

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    private final OAuth2AuthService oAuth2AuthService;

    public OAuth2AuthenticationSuccessHandler(OAuth2AuthService oAuth2AuthService) {
        super();
        this.oAuth2AuthService = oAuth2AuthService;
    }

    /**
     * Điểm tiếp nhận sự kiện xác thực OAuth2 thành công.
     * Quy trình 5 bước:
     * 1. Xác định Provider (Google / GitHub) và trích xuất Principal OAuth2.
     * 2. Bóc tách thuộc tính đặc thù theo từng nhà cung cấp (sub/id, email, name, avatar).
     * 3. Đồng bộ tài khoản và sinh cặp mã thông báo (Access Token & Refresh Token).
     * 4. Gắn Refresh Token vào HttpOnly Cookie để bảo vệ chống tấn công XSS.
     * 5. Chuyển hướng trình duyệt về Frontend Callback URL với JWT Access Token.
     */
    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {
        // 1. Kiểm tra đối tượng xác thực OAuth2
        if (!(authentication instanceof OAuth2AuthenticationToken authToken)) {
            log.error("Authentication không phải là đối tượng OAuth2AuthenticationToken: {}", authentication);
            super.onAuthenticationSuccess(request, response, authentication);
            return;
        }

        String provider = authToken.getAuthorizedClientRegistrationId();
        OAuth2User oAuth2User = authToken.getPrincipal();
        Map<String, Object> attributes = oAuth2User.getAttributes();

        log.info("Xác thực OAuth2 thành công từ nhà cung cấp: {}", provider);

        // 2. Bóc tách thông tin hồ sơ theo cấu trúc chuẩn của từng Provider
        String providerId;
        String email;
        String fullName;
        String avatarUrl;

        if ("github".equalsIgnoreCase(provider)) {
            providerId = String.valueOf(attributes.get("id"));
            email = (String) attributes.get("email");
            fullName = attributes.get("name") != null ? (String) attributes.get("name") : (String) attributes.get("login");
            avatarUrl = (String) attributes.get("avatar_url");
        } else {
            // Mặc định Google ('google')
            providerId = (String) attributes.get("sub");
            email = (String) attributes.get("email");
            fullName = (String) attributes.get("name");
            avatarUrl = (String) attributes.get("picture");
        }

        // 3. Gọi tầng nghiệp vụ để tạo/liên kết tài khoản và sinh Token
        AuthResponse authResponse = oAuth2AuthService.processOAuth2Login(
                provider,
                providerId,
                email,
                fullName,
                avatarUrl
        );

        // 4. Thiết lập HttpOnly Cookie chứa Refresh Token
        ResponseCookie cookie = ResponseCookie.from(REFRESH_TOKEN_COOKIE_NAME, authResponse.refreshToken())
                .httpOnly(true)
                .secure(false) // Môi trường dev localhost
                .path("/")
                .maxAge(REFRESH_TOKEN_DURATION)
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        // 5. Chuyển hướng trình duyệt về Frontend tiếp nhận Access Token
        String targetUrl = frontendUrl + "/oauth2/callback?token=" + authResponse.accessToken();
        log.info("Chuyển hướng người dùng về Frontend: {}", targetUrl);

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
