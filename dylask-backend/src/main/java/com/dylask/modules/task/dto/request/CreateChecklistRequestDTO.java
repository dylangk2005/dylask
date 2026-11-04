package com.dylask.modules.task.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO yêu cầu thêm mục danh sách kiểm tra con mới.
 */
public record CreateChecklistRequestDTO(
        @NotBlank(message = "Tiêu đề mục con không được để trống")
        @Size(max = 255, message = "Tiêu đề mục con không được vượt quá 255 ký tự")
        String title
) {
}

