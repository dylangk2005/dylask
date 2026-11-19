package com.dylask.modules.planning.dto.response;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO dữ liệu cho màn hình 7 ngày tới (Upcoming 7 Days), phân nhóm theo từng ngày.
 */
public record UpcomingDaysResponseDTO(
        List<UpcomingDayGroup> days
) {
    public record UpcomingDayGroup(
            LocalDate date,
            String label,
            List<PlanningTaskDTO> tasks
    ) {
    }
}
