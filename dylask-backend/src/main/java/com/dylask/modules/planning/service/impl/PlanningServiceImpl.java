package com.dylask.modules.planning.service.impl;

import com.dylask.common.exception.AppException;
import com.dylask.common.exception.ErrorCode;
import com.dylask.modules.planning.dto.request.CreateWeeklyGoalRequestDTO;
import com.dylask.modules.planning.dto.response.*;
import com.dylask.modules.planning.dto.response.OverdueTasksResponseDTO.OverdueItem;
import com.dylask.modules.planning.dto.response.UpcomingDaysResponseDTO.UpcomingDayGroup;
import com.dylask.modules.planning.entity.WeeklyGoal;
import com.dylask.modules.planning.repository.WeeklyGoalRepository;
import com.dylask.modules.planning.service.PlanningService;
import com.dylask.modules.task.entity.Task;
import com.dylask.modules.task.repository.TaskRepository;
import com.dylask.modules.user.entity.User;
import com.dylask.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.time.temporal.WeekFields;
import java.util.*;

/**
 * Hiện thực dịch vụ Lập kế hoạch tuần, 7 ngày tới và Xử lý việc quá hạn (FEAT-STD-05).
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlanningServiceImpl implements PlanningService {

    private static final ZoneId USER_ZONE = ZoneOffset.ofHours(7);
    private static final DateTimeFormatter DD_MM = DateTimeFormatter.ofPattern("dd/MM");

    private final TaskRepository taskRepository;
    private final WeeklyGoalRepository weeklyGoalRepository;
    private final UserRepository userRepository;

    @Override
    public WeeklyPlanningResponseDTO getWeeklyPlanning(
            Long userId, Integer weekNumber, Integer year, LocalDate referenceToday) {

        LocalDate today = referenceToday != null ? referenceToday : LocalDate.now(USER_ZONE);
        WeekFields iso = WeekFields.ISO;
        int targetYear = year != null ? year : today.get(iso.weekBasedYear());
        int targetWeek = weekNumber != null ? weekNumber : today.get(iso.weekOfWeekBasedYear());

        // 1. Xác định ngày Thứ Hai -> Chủ Nhật của tuần ISO được chọn
        LocalDate monday = LocalDate.of(targetYear, 1, 4)
                .with(iso.weekOfWeekBasedYear(), targetWeek)
                .with(DayOfWeek.MONDAY);
        LocalDate sunday = monday.plusDays(6);

        Map<LocalDate, List<PlanningTaskDTO>> scheduledByDay = new LinkedHashMap<>();
        for (int i = 0; i < 7; i++) {
            scheduledByDay.put(monday.plusDays(i), new ArrayList<>());
        }

        // 2. Truy vấn toàn bộ task của user và phân loại Unscheduled vs Scheduled trong tuần
        List<Task> allTasks = taskRepository.findByUserId(userId);
        List<PlanningTaskDTO> unscheduledTasks = new ArrayList<>();

        for (Task task : allTasks) {
            LocalDate effectiveDate = resolveEffectiveDate(task);
            if (effectiveDate == null) {
                if ("todo".equalsIgnoreCase(task.getStatus())) {
                    unscheduledTasks.add(toPlanningDto(task));
                }
            } else if (!effectiveDate.isBefore(monday) && !effectiveDate.isAfter(sunday)) {
                scheduledByDay.get(effectiveDate).add(toPlanningDto(task));
            }
        }

        // 3. Lấy danh sách mục tiêu trọng tâm tuần
        List<WeeklyGoalDTO> goals = weeklyGoalRepository
                .findByUserIdAndYearAndWeekNumberOrderByIdAsc(userId, targetYear, targetWeek)
                .stream()
                .map(this::toGoalDto)
                .toList();

        return new WeeklyPlanningResponseDTO(
                targetWeek,
                targetYear,
                monday,
                sunday,
                unscheduledTasks,
                scheduledByDay,
                goals
        );
    }

    @Override
    @Transactional
    public PlanningTaskDTO scheduleTask(Long userId, Long taskId, LocalDate scheduledDate) {
        log.info("Lên lịch công việc #{} vào ngày {} (user #{})", taskId, scheduledDate, userId);

        Task task = taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));

        applyScheduleDate(task, scheduledDate);
        Task saved = taskRepository.save(task);
        return toPlanningDto(saved);
    }

    @Override
    @Transactional
    public WeeklyGoalDTO createWeeklyGoal(
            Long userId, CreateWeeklyGoalRequestDTO request, LocalDate referenceToday) {

        LocalDate today = referenceToday != null ? referenceToday : LocalDate.now(USER_ZONE);
        WeekFields iso = WeekFields.ISO;
        int targetYear = request.year() != null ? request.year() : today.get(iso.weekBasedYear());
        int targetWeek = request.weekNumber() != null ? request.weekNumber() : today.get(iso.weekOfWeekBasedYear());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        WeeklyGoal goal = WeeklyGoal.builder()
                .user(user)
                .year(targetYear)
                .weekNumber(targetWeek)
                .title(request.title().trim())
                .isCompleted(false)
                .build();

        WeeklyGoal saved = weeklyGoalRepository.save(goal);
        return toGoalDto(saved);
    }

    @Override
    @Transactional
    public WeeklyGoalDTO toggleWeeklyGoal(Long userId, Long goalId) {
        WeeklyGoal goal = weeklyGoalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy mục tiêu tuần"));

        goal.setIsCompleted(!Boolean.TRUE.equals(goal.getIsCompleted()));
        WeeklyGoal saved = weeklyGoalRepository.save(goal);
        return toGoalDto(saved);
    }

    @Override
    @Transactional
    public void deleteWeeklyGoal(Long userId, Long goalId) {
        WeeklyGoal goal = weeklyGoalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy mục tiêu tuần"));
        weeklyGoalRepository.delete(goal);
    }

    @Override
    public UpcomingDaysResponseDTO getUpcoming7Days(Long userId, LocalDate today) {
        LocalDate effectiveToday = today != null ? today : LocalDate.now(USER_ZONE);
        LocalDate start = effectiveToday.plusDays(1);
        LocalDate end = effectiveToday.plusDays(7);

        Map<LocalDate, List<PlanningTaskDTO>> byDay = new LinkedHashMap<>();
        for (int i = 0; i < 7; i++) {
            byDay.put(start.plusDays(i), new ArrayList<>());
        }

        List<Task> allTasks = taskRepository.findByUserId(userId);
        for (Task task : allTasks) {
            LocalDate effectiveDate = resolveEffectiveDate(task);
            if (effectiveDate != null && !effectiveDate.isBefore(start) && !effectiveDate.isAfter(end)) {
                byDay.get(effectiveDate).add(toPlanningDto(task));
            }
        }

        List<UpcomingDayGroup> groups = new ArrayList<>();
        for (Map.Entry<LocalDate, List<PlanningTaskDTO>> entry : byDay.entrySet()) {
            LocalDate date = entry.getKey();
            String prefix = date.equals(start) ? "Ngày mai · " : "";
            String label = prefix + toVietnameseDay(date.getDayOfWeek()) + ", " + date.format(DD_MM);
            groups.add(new UpcomingDayGroup(date, label, entry.getValue()));
        }

        return new UpcomingDaysResponseDTO(groups);
    }

    @Override
    public OverdueTasksResponseDTO getOverdueTasks(Long userId, LocalDate today) {
        LocalDate effectiveToday = today != null ? today : LocalDate.now(USER_ZONE);
        List<Task> allTasks = taskRepository.findByUserId(userId);

        List<OverdueItem> severe = new ArrayList<>();
        List<OverdueItem> recent = new ArrayList<>();

        for (Task task : allTasks) {
            if (!"todo".equalsIgnoreCase(task.getStatus())) {
                continue;
            }
            LocalDate effectiveDate = resolveEffectiveDate(task);
            if (effectiveDate != null && effectiveDate.isBefore(effectiveToday)) {
                long daysOverdue = ChronoUnit.DAYS.between(effectiveDate, effectiveToday);
                OverdueItem item = new OverdueItem(toPlanningDto(task), daysOverdue);
                if (daysOverdue >= 3) {
                    severe.add(item);
                } else {
                    recent.add(item);
                }
            }
        }

        severe.sort((a, b) -> Long.compare(b.daysOverdue(), a.daysOverdue()));
        recent.sort((a, b) -> Long.compare(b.daysOverdue(), a.daysOverdue()));

        return new OverdueTasksResponseDTO(severe.size() + recent.size(), severe, recent);
    }

    @Override
    @Transactional
    public List<PlanningTaskDTO> bulkReschedule(Long userId, List<Long> taskIds, LocalDate targetDate) {
        log.info("Dời lịch hàng loạt {} công việc sang ngày {} (user #{})", taskIds.size(), targetDate, userId);

        List<PlanningTaskDTO> updated = new ArrayList<>();
        for (Long taskId : taskIds) {
            Task task = taskRepository.findByIdAndUserId(taskId, userId)
                    .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));
            applyScheduleDate(task, targetDate);
            updated.add(toPlanningDto(taskRepository.save(task)));
        }
        return updated;
    }

    private void applyScheduleDate(Task task, LocalDate targetDate) {
        task.setScheduledDate(targetDate);
        // Đồng bộ dueDate cuối ngày (23:59 UTC+7) để Calendar & Overdue cập nhật nhất quán
        task.setDueDate(targetDate.atTime(23, 59).atZone(USER_ZONE).toInstant());
    }

    private LocalDate resolveEffectiveDate(Task task) {
        if (task.getScheduledDate() != null) {
            return task.getScheduledDate();
        }
        if (task.getDueDate() != null) {
            return task.getDueDate().atZone(USER_ZONE).toLocalDate();
        }
        return null;
    }

    private PlanningTaskDTO toPlanningDto(Task task) {
        return new PlanningTaskDTO(
                task.getId(),
                task.getTitle(),
                task.getPriority(),
                task.getStatus(),
                task.getDueDate(),
                task.getScheduledDate(),
                task.getEstimatedHours(),
                task.getProject() != null ? task.getProject().getName() : null
        );
    }

    private WeeklyGoalDTO toGoalDto(WeeklyGoal goal) {
        return new WeeklyGoalDTO(
                goal.getId(),
                goal.getTitle(),
                goal.getIsCompleted(),
                goal.getWeekNumber(),
                goal.getYear()
        );
    }

    private String toVietnameseDay(DayOfWeek dow) {
        return switch (dow) {
            case MONDAY -> "Thứ Hai";
            case TUESDAY -> "Thứ Ba";
            case WEDNESDAY -> "Thứ Tư";
            case THURSDAY -> "Thứ Năm";
            case FRIDAY -> "Thứ Sáu";
            case SATURDAY -> "Thứ Bảy";
            case SUNDAY -> "Chủ Nhật";
        };
    }
}
