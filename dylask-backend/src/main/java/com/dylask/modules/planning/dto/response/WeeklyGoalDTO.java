package com.dylask.modules.planning.dto.response;

/**
 * DTO mục tiêu trọng tâm tuần.
 */
public record WeeklyGoalDTO(
        Long id,
        String title,
        Boolean isCompleted,
        Integer weekNumber,
        Integer year
) {
}
