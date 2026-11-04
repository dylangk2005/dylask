package com.dylask.modules.task.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * DTO cập nhật nhanh trạng thái hoàn thành của công việc.
 */
public record UpdateTaskStatusDTO(
        @NotBlank(message = "Trạng thái không được để trống")
        @Pattern(regexp = "^(?i)(todo|done)$", message = "Trạng thái phải là 'todo' hoặc 'done'")
        String status
) {
}

