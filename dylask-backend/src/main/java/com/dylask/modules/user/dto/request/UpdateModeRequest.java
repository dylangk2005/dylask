package com.dylask.modules.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * DTO yêu cầu cập nhật chế độ giao diện mặc định (Dual-Mode).
 * Chỉ chấp nhận hai giá trị hợp lệ: 'standard' hoặc 'developer'.
 *
 * @param mode Chế độ giao diện người dùng lựa chọn ('standard' hoặc 'developer')
 */
public record UpdateModeRequest(
        @NotBlank(message = "Chế độ không được để trống")
        @Pattern(regexp = "^(standard|developer)$", message = "Chế độ phải là 'standard' hoặc 'developer'")
        String mode
) {
}
