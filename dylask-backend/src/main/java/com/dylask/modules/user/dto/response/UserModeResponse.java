package com.dylask.modules.user.dto.response;

/**
 * DTO phản hồi chế độ giao diện mặc định sau khi cập nhật thành công.
 *
 * @param defaultMode Chế độ giao diện hiện tại ('standard' hoặc 'developer')
 */
public record UserModeResponse(
        String defaultMode
) {
}
