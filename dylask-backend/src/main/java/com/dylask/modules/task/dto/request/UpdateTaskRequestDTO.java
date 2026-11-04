package com.dylask.modules.task.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.Instant;

/**
 * DTO yêu cầu cập nhật thông tin công việc.
 */
public record UpdateTaskRequestDTO(
        @NotBlank(message = "Tiêu đề công việc không được để trống")
        @Size(max = 255, message = "Tiêu đề không được vượt quá 255 ký tự")
        String title,

        @Size(max = 2000, message = "Mô tả không được vượt quá 2.000 ký tự")
        String description,

        @Pattern(regexp = "^(?i)(low|medium|high)$", message = "Mức độ ưu tiên phải là 'low', 'medium' hoặc 'high'")
        String priority,

        Instant dueDate,

        @Size(max = 255, message = "Tên danh mục không được vượt quá 255 ký tự")
        String categoryName
) {
}

