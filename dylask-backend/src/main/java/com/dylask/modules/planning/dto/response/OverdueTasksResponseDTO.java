package com.dylask.modules.planning.dto.response;

import java.util.List;

/**
 * DTO dữ liệu cho màn hình Việc quá hạn (Overdue Tasks) phân nhóm theo mức độ trễ.
 */
public record OverdueTasksResponseDTO(
        int totalOverdue,
        List<OverdueItem> severeOverdue,
        List<OverdueItem> recentOverdue
) {
    public record OverdueItem(
            PlanningTaskDTO task,
            long daysOverdue
    ) {
    }
}
