package com.dylask.modules.auth.service;

import com.dylask.modules.auth.dto.*;
import com.dylask.modules.user.dto.UserResponse;

/**
 * Service định nghĩa các hợp đồng nghiệp vụ xác thực người dùng (Authentication),
 * bảo mật phiên làm việc và xác minh email 2 bước.
 */
public interface AuthService {

    /**
     * Khởi tạo tài khoản người dùng mới ở trạng thái chưa kích hoạt (is_verified = false).
     * Tự động sinh mã xác thực OTP 6 chữ số và gửi qua email cho người dùng.
     *
     * @param request Thông tin đăng ký gồm email, mật khẩu và họ tên
     * @return RegisterResponse Thông báo kết quả và trạng thái yêu cầu xác thực email
     */
    RegisterResponse register(RegisterRequest request);

    /**
     * Xác thực mã OTP 6 chữ số để kích hoạt tài khoản chính thức.
     * Cấp phát cặp JWT Access Token và Refresh Token nếu mã hợp lệ.
     *
     * @param request Chứa email và mã OTP 6 chữ số
     * @return AuthResponse Phiên làm việc mới kèm thông tin người dùng và Access Token
     */
    AuthResponse verifyEmail(VerifyEmailRequest request);

    /**
     * Gửi lại mã OTP xác thực mới với cơ chế giới hạn tần suất (Rate-limit Cooldown 60s).
     *
     * @param request Chứa email cần nhận lại mã xác thực
     */
    void resendVerification(ResendVerificationRequest request);

    /**
     * Xác thực thông tin đăng nhập bằng Email và Mật khẩu.
     * Chặn đăng nhập nếu tài khoản chưa hoàn tất xác thực email (EMAIL_NOT_VERIFIED).
     *
     * @param request Email và mật khẩu người dùng
     * @return AuthResponse Phiên làm việc mới kèm Access Token và Refresh Token
     */
    AuthResponse login(LoginRequest request);

    /**
     * Làm mới Access Token đã hết hạn bằng Refresh Token hợp lệ (Cơ chế Token Rotation).
     * Thu hồi token cũ và cấp token mới; phát hiện và chặn đứng hành vi tấn công Replay Attack.
     *
     * @param rawRefreshToken Chuỗi Refresh Token thô trích xuất từ HttpOnly Cookie
     * @return AuthResponse Phiên làm việc mới với Access Token và Refresh Token mới
     */
    AuthResponse refreshToken(String rawRefreshToken);

    /**
     * Đăng xuất người dùng bằng cách thu hồi (revoke) Refresh Token hiện tại khỏi CSDL.
     *
     * @param rawRefreshToken Chuỗi Refresh Token cần hủy
     */
    void logout(String rawRefreshToken);

    /**
     * Lấy thông tin hồ sơ của người dùng hiện tại theo ID định danh.
     *
     * @param userId ID người dùng trích xuất từ JWT Access Token
     * @return UserResponse Thông tin chi tiết của người dùng
     */
    UserResponse getCurrentUser(Long userId);
}
