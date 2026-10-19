package com.dylask.modules.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * DTO yêu cầu thay đổi mật khẩu người dùng.
 * Yêu cầu mật khẩu mới từ 8 đến 32 ký tự, bao gồm chữ hoa, chữ thường và chữ số.
 *
 * @param currentPassword Mật khẩu hiện tại của tài khoản
 * @param newPassword Mật khẩu mới mong muốn
 * @param confirmPassword Xác nhận mật khẩu mới (phải khớp chính xác với newPassword)
 */
public record ChangePasswordRequest(
        @NotBlank(message = "Mật khẩu hiện tại không được để trống")
        String currentPassword,

        @NotBlank(message = "Mật khẩu mới không được để trống")
        @Size(min = 8, max = 32, message = "Mật khẩu mới phải từ 8 đến 32 ký tự")
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
                message = "Mật khẩu mới phải bao gồm ít nhất một chữ hoa, một chữ thường và một chữ số"
        )
        String newPassword,

        @NotBlank(message = "Xác nhận mật khẩu không được để trống")
        String confirmPassword
) {
}
