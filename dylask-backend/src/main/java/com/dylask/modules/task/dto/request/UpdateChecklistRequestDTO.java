package com.dylask.modules.task.dto.request;

import jakarta.validation.constraints.Size;

/**
 * DTO yêu cầu cập nhật mục danh sách kiểm tra con (tiêu đề, trạng thái hoặc vị trí).
 */
public record UpdateChecklistRequestDTO(
        @Size(max = 255, message = "Tiêu đề mục con không được vượt quá 255 ký tự")
        String title,

        Boolean isCompleted,

        Integer position
) {
}

