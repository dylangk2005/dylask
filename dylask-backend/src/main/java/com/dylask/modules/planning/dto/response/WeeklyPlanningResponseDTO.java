package com.dylask.modules.planning.dto.response;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * DTO tổng hợp dữ liệu cho màn hình Lập kế hoạch tuần (Weekly Planning Grid).
 */
public record WeeklyPlanningResponseDTO(
        int weekNumber,
        int year,
        LocalDate startDate,
        LocalDate endDate,
        List<PlanningTaskDTO> unscheduledTasks,
        Map<LocalDate, List<PlanningTaskDTO>> scheduledByDay,
        List<WeeklyGoalDTO> weeklyGoals
) {
}
