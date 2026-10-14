package com.dylask.modules.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record VerifyEmailRequest(
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    String email,

    @NotBlank(message = "Mã xác thực OTP không được để trống")
    @Pattern(regexp = "^[0-9]{6}$", message = "Mã xác thực OTP phải gồm đúng 6 chữ số")
    String otp
) {
}
