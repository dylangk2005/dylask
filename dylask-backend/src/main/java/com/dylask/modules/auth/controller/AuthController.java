package com.dylask.modules.auth.controller;

import com.dylask.common.dto.ApiResponse;
import com.dylask.common.exception.AppException;
import com.dylask.common.exception.ErrorCode;
import com.dylask.modules.auth.dto.*;
import com.dylask.modules.auth.service.AuthService;
import com.dylask.modules.user.dto.UserResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final String REFRESH_TOKEN_COOKIE_NAME = "refreshToken";
    private static final Duration REFRESH_TOKEN_DURATION = Duration.ofDays(7);

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Bước 1: Khởi tạo tài khoản và gửi mã xác thực OTP 6 chữ số tới email
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(@Valid @RequestBody RegisterRequest request) {
        RegisterResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, response.message()));
    }

    /**
     * Bước 2: Xác thực mã OTP để kích hoạt tài khoản và nhận phiên làm việc
     */
    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        AuthResponse response = authService.verifyEmail(request);
        ResponseCookie cookie = buildRefreshTokenCookie(response.refreshToken(), REFRESH_TOKEN_DURATION);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(ApiResponse.ok(response, "Kích hoạt tài khoản thành công! Chào mừng bạn đến với Dylask."));
    }

    /**
     * Gửi lại mã xác thực OTP (Cooldown 60s)
     */
    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse<Void>> resendVerification(@Valid @RequestBody ResendVerificationRequest request) {
        authService.resendVerification(request);
        return ResponseEntity.ok(ApiResponse.ok(null, "Mã xác thực mới đã được gửi lại vào email của bạn."));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        ResponseCookie cookie = buildRefreshTokenCookie(response.refreshToken(), REFRESH_TOKEN_DURATION);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(ApiResponse.ok(response, "Đăng nhập thành công"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @CookieValue(name = REFRESH_TOKEN_COOKIE_NAME, required = false) String cookieToken,
            @RequestBody(required = false) RefreshTokenRequest bodyRequest) {

        String rawToken = (cookieToken != null && !cookieToken.isBlank())
                ? cookieToken
                : (bodyRequest != null ? bodyRequest.refreshToken() : null);

        if (rawToken == null || rawToken.isBlank()) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Thiếu Refresh Token để làm mới phiên");
        }

        AuthResponse response = authService.refreshToken(rawToken);
        ResponseCookie cookie = buildRefreshTokenCookie(response.refreshToken(), REFRESH_TOKEN_DURATION);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(ApiResponse.ok(response, "Làm mới phiên làm việc thành công"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @CookieValue(name = REFRESH_TOKEN_COOKIE_NAME, required = false) String cookieToken,
            @RequestBody(required = false) RefreshTokenRequest bodyRequest) {

        String rawToken = (cookieToken != null && !cookieToken.isBlank())
                ? cookieToken
                : (bodyRequest != null ? bodyRequest.refreshToken() : null);

        authService.logout(rawToken);
        ResponseCookie deleteCookie = buildRefreshTokenCookie("", Duration.ZERO);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, deleteCookie.toString())
                .body(ApiResponse.ok(null, "Đăng xuất thành công"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
            @RequestAttribute(value = "currentUserId", required = false) Long currentUserId) {
        if (currentUserId == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        UserResponse response = authService.getCurrentUser(currentUserId);
        return ResponseEntity.ok(ApiResponse.ok(response, "Lấy thông tin tài khoản thành công"));
    }

    private ResponseCookie buildRefreshTokenCookie(String value, Duration maxAge) {
        return ResponseCookie.from(REFRESH_TOKEN_COOKIE_NAME, value)
                .httpOnly(true)
                .secure(false) // localhost dev (production qua cấu hình profile)
                .path("/")
                .maxAge(maxAge)
                .sameSite("Lax")
                .build();
    }
}
