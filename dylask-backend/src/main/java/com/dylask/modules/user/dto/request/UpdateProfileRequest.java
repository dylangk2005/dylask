package com.dylask.modules.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO yêu cầu cập nhật thông tin họ tên người dùng.
 *
 * @param fullName Họ tên hiển thị mới (từ 2 đến 100 ký tự)
 */
public record UpdateProfileRequest(
        @NotBlank(message = "Họ tên không được để trống")
        @Size(min = 2, max = 100, message = "Họ tên phải từ 2 đến 100 ký tự")
        String fullName
) {
}
