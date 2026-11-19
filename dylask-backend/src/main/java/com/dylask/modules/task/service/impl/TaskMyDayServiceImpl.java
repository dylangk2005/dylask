package com.dylask.modules.task.service.impl;

import com.dylask.common.exception.AppException;
import com.dylask.common.exception.ErrorCode;
import com.dylask.modules.task.dto.response.MyDayResponseDTO;
import com.dylask.modules.task.dto.response.MyDaySuggestionDTO;
import com.dylask.modules.task.dto.response.MyDayTaskDTO;
import com.dylask.modules.task.dto.response.ToggleMyDayResponseDTO;
import com.dylask.modules.task.entity.Task;
import com.dylask.modules.task.repository.TaskRepository;
import com.dylask.modules.task.service.TaskMyDayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Hiện thực nghiệp vụ Kế hoạch hôm nay (My Day) với cơ chế Clean Slate qua ngày mới.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TaskMyDayServiceImpl implements TaskMyDayService {

    private final TaskRepository taskRepository;

    @Override
    public MyDayResponseDTO getMyDay(Long userId, LocalDate today) {
        LocalDate effectiveToday = today != null ? today : LocalDate.now(ZoneOffset.UTC);

        // 1. Chỉ lấy các task được gán isMyDay = true đúng vào ngày hôm nay (Clean Slate tự động bỏ qua ngày cũ)
        List<Task> todayTasks = taskRepository.findByUserIdAndIsMyDayTrueAndMyDayDateOrderByCreatedAtDesc(
                userId, effectiveToday);

        List<MyDayTaskDTO> taskDtos = todayTasks.stream()
                .map(this::toMyDayTaskDto)
                .toList();

        Set<Long> todayTaskIds = todayTasks.stream()
                .map(Task::getId)
                .collect(Collectors.toSet());

        // 2. Xây dựng danh sách gợi ý thông minh từ các task 'todo' chưa nằm trong My Day hôm nay
        List<Task> todoTasks = taskRepository.findByUserIdAndStatusOrderByDueDateAsc(userId, "todo");
        Instant startOfToday = effectiveToday.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant endOfToday = effectiveToday.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();

        List<MyDaySuggestionDTO> suggestions = new ArrayList<>();
        for (Task candidate : todoTasks) {
            if (todayTaskIds.contains(candidate.getId())) {
                continue;
            }
            String reason = resolveSuggestionReason(candidate, effectiveToday, startOfToday, endOfToday);
            if (reason != null) {
                suggestions.add(new MyDaySuggestionDTO(
                        candidate.getId(),
                        candidate.getTitle(),
                        candidate.getPriority(),
                        candidate.getDueDate(),
                        reason
                ));
            }
        }

        return new MyDayResponseDTO(effectiveToday, taskDtos, suggestions);
    }

    @Override
    @Transactional
    public ToggleMyDayResponseDTO toggleMyDay(Long userId, Long taskId, boolean isMyDay, LocalDate today) {
        LocalDate effectiveToday = today != null ? today : LocalDate.now(ZoneOffset.UTC);
        log.info("Cập nhật trạng thái My Day={} cho công việc #{} (user #{})", isMyDay, taskId, userId);

        // 1. Kiểm tra tồn tại và quyền sở hữu
        Task task = taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));

        // 2. Gán cờ My Day và ngày tương ứng
        task.setIsMyDay(isMyDay);
        task.setMyDayDate(isMyDay ? effectiveToday : null);

        Task saved = taskRepository.save(task);
        return new ToggleMyDayResponseDTO(saved.getId(), saved.getIsMyDay(), saved.getMyDayDate());
    }

    private String resolveSuggestionReason(
            Task task, LocalDate today, Instant startOfToday, Instant endOfToday) {
        Instant due = task.getDueDate();
        if (due != null) {
            if (due.isBefore(startOfToday)) {
                return "Đã quá hạn";
            }
            if (!due.isBefore(startOfToday) && due.isBefore(endOfToday)) {
                return "Hạn chót là hôm nay";
            }
        }
        if (Boolean.TRUE.equals(task.getIsMyDay())
                && task.getMyDayDate() != null
                && task.getMyDayDate().isBefore(today)) {
            return "Chưa xong từ hôm qua";
        }
        if ("high".equalsIgnoreCase(task.getPriority())) {
            return "Ưu tiên cao";
        }
        return null;
    }

    private MyDayTaskDTO toMyDayTaskDto(Task task) {
        return new MyDayTaskDTO(
                task.getId(),
                task.getTitle(),
                task.getPriority(),
                task.getStatus(),
                task.getPomodoroSessionsCompleted() != null ? task.getPomodoroSessionsCompleted() : 0,
                task.getPomodoroTotalMinutes() != null ? task.getPomodoroTotalMinutes() : 0,
                task.getDueDate(),
                task.getProject() != null ? task.getProject().getName() : null
        );
    }
}
