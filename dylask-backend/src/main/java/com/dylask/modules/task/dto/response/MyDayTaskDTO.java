package com.dylask.modules.task.dto.response;

import java.time.Instant;

/**
 * DTO công việc hiển thị trong danh sách Kế hoạch hôm nay (My Day).
 */
public record MyDayTaskDTO(
        Long id,
        String title,
        String priority,
        String status,
        Integer pomodoroSessionsCompleted,
        Integer pomodoroTotalMinutes,
        Instant dueDate,
        String categoryName
) {
}
