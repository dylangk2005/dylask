package com.dylask.modules.planning.service;

import com.dylask.modules.planning.dto.request.CreateWeeklyGoalRequestDTO;
import com.dylask.modules.planning.dto.response.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Interface dịch vụ Lập kế hoạch tuần, 7 ngày tới (Upcoming) và Việc quá hạn (Overdue).
 */
public interface PlanningService {

    WeeklyPlanningResponseDTO getWeeklyPlanning(Long userId, Integer weekNumber, Integer year, LocalDate referenceToday);

    PlanningTaskDTO scheduleTask(Long userId, Long taskId, LocalDate scheduledDate);

    WeeklyGoalDTO createWeeklyGoal(Long userId, CreateWeeklyGoalRequestDTO request, LocalDate referenceToday);

    WeeklyGoalDTO toggleWeeklyGoal(Long userId, Long goalId);

    void deleteWeeklyGoal(Long userId, Long goalId);

    UpcomingDaysResponseDTO getUpcoming7Days(Long userId, LocalDate today);

    OverdueTasksResponseDTO getOverdueTasks(Long userId, LocalDate today);

    List<PlanningTaskDTO> bulkReschedule(Long userId, List<Long> taskIds, LocalDate targetDate);
}
