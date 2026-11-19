package com.dylask.modules.task.dto.request;

import jakarta.validation.constraints.NotNull;

/**
 * DTO yêu cầu thêm hoặc gỡ công việc khỏi Kế hoạch hôm nay (My Day).
 */
public record ToggleMyDayRequestDTO(
        @NotNull(message = "Trạng thái isMyDay không được để trống")
        Boolean isMyDay
) {
}
