package com.dylask.modules.task.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;

/**
 * DTO yêu cầu tạo mới một công việc cá nhân (hỗ trợ đính kèm danh sách việc con).
 */
public record CreateTaskRequestDTO(
        @NotBlank(message = "Tiêu đề công việc không được để trống")
        @Size(max = 255, message = "Tiêu đề không được vượt quá 255 ký tự")
        String title,

        @Size(max = 2000, message = "Mô tả không được vượt quá 2.000 ký tự")
        String description,

        @Pattern(regexp = "^(?i)(low|medium|high)$", message = "Mức độ ưu tiên phải là 'low', 'medium' hoặc 'high'")
        String priority,

        Instant dueDate,

        @Size(max = 255, message = "Tên danh mục không được vượt quá 255 ký tự")
        String categoryName,

        List<String> checklistTitles
) {
}
