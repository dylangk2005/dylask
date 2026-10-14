package com.dylask.modules.auth.service;

public interface EmailService {
    /**
     * Gửi email chứa mã xác thực OTP 6 chữ số tới người dùng.
     *
     * @param toEmail       Địa chỉ email người nhận
     * @param otpCode       Mã OTP 6 chữ số
     * @param expiryMinutes Thời gian hết hạn (phút)
     */
    void sendOtpEmail(String toEmail, String otpCode, int expiryMinutes);
}
