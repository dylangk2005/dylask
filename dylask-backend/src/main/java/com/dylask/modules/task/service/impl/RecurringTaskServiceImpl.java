package com.dylask.modules.task.service.impl;

import com.dylask.common.exception.AppException;
import com.dylask.common.exception.ErrorCode;
import com.dylask.modules.task.dto.request.SetRecurringRequestDTO;
import com.dylask.modules.task.dto.response.CalendarTaskDTO;
import com.dylask.modules.task.dto.response.RecurringConfigDTO;
import com.dylask.modules.task.entity.Task;
import com.dylask.modules.task.entity.TaskChecklist;
import com.dylask.modules.task.mapper.TaskMapper;
import com.dylask.modules.task.repository.TaskRepository;
import com.dylask.modules.task.service.RecurringTaskService;
import com.dylask.modules.task.util.DateTimeRecurrenceUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Hiện thực nghiệp vụ Lịch trình (Calendar View) và Công việc lặp lại định kỳ (Recurring Tasks).
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecurringTaskServiceImpl implements RecurringTaskService {

    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;

    @Override
    public List<CalendarTaskDTO> getCalendarTasks(Long userId, Instant startDate, Instant endDate) {
        if (startDate == null || endDate == null || endDate.isBefore(startDate)) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Khoảng thời gian startDate và endDate không hợp lệ");
        }

        // 1. Truy vấn các task của người dùng có dueDate nằm trong khoảng thời gian
        List<Task> tasks = taskRepository.findByUserIdAndDueDateBetweenOrderByDueDateAsc(userId, startDate, endDate);

        // 2. Chuyển đổi sang CalendarTaskDTO
        return tasks.stream()
                .map(taskMapper::toCalendarDto)
                .toList();
    }

    @Override
    @Transactional
    public RecurringConfigDTO setRecurring(Long userId, Long taskId, SetRecurringRequestDTO request) {
        log.info("Cấu hình lặp lại '{}' cho công việc #{} (user #{})", request.pattern(), taskId, userId);

        // 1. Kiểm tra tồn tại và quyền sở hữu
        Task task = taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));

        // 2. Cập nhật thông tin lặp lại (chuẩn hóa uppercase cho pattern)
        task.setRecurringPattern(request.pattern().trim().toUpperCase());
        task.setRecurringInterval(request.interval() != null ? request.interval() : 1);
        task.setRecurringUntil(request.until());
        task.setReminderMinutesBefore(request.reminderMinutesBefore());

        // Đảm bảo task lặp có dueDate ban đầu để tính chu kỳ kế tiếp chính xác
        if (task.getDueDate() == null) {
            task.setDueDate(Instant.now());
        }

        // 3. Lưu và trả về cấu hình
        Task saved = taskRepository.save(task);
        return toConfigDto(saved);
    }

    @Override
    @Transactional
    public RecurringConfigDTO clearRecurring(Long userId, Long taskId) {
        log.info("Hủy cấu hình lặp lại cho công việc #{} (user #{})", taskId, userId);

        // 1. Kiểm tra tồn tại và quyền sở hữu
        Task task = taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));

        // 2. Xóa bỏ quy tắc lặp lại
        task.setRecurringPattern(null);
        task.setRecurringInterval(1);
        task.setRecurringUntil(null);
        task.setReminderMinutesBefore(null);

        // 3. Lưu thay đổi
        Task saved = taskRepository.save(task);
        return toConfigDto(saved);
    }

    @Override
    @Transactional
    public Optional<Task> generateNextOccurrenceIfRecurring(Task completedTask) {
        if (completedTask == null || completedTask.getRecurringPattern() == null
                || completedTask.getRecurringPattern().isBlank()) {
            return Optional.empty();
        }

        // 1. Tính ngày đến hạn kế tiếp dựa trên pattern & interval
        int interval = completedTask.getRecurringInterval() != null ? completedTask.getRecurringInterval() : 1;
        Instant nextDueDate = DateTimeRecurrenceUtils.calculateNextDueDate(
                completedTask.getDueDate(),
                completedTask.getRecurringPattern(),
                interval
        );

        // 2. Kiểm tra điều kiện dừng lặp (recurringUntil)
        if (completedTask.getRecurringUntil() != null && nextDueDate.isAfter(completedTask.getRecurringUntil())) {
            log.info("Công việc #{} đã vượt quá mốc dừng lặp ({}), không tạo chu kỳ mới",
                    completedTask.getId(), completedTask.getRecurringUntil());
            return Optional.empty();
        }

        // 3. Nhân bản công việc mới với trạng thái 'todo' để giữ nguyên lịch sử task cũ
        Long rootParentId = completedTask.getParentTaskId() != null
                ? completedTask.getParentTaskId()
                : completedTask.getId();

        Task nextTask = Task.builder()
                .user(completedTask.getUser())
                .project(completedTask.getProject())
                .sprintId(completedTask.getSprintId())
                .title(completedTask.getTitle())
                .description(completedTask.getDescription())
                .status("todo")
                .priority(completedTask.getPriority())
                .dueDate(nextDueDate)
                .isMyDay(false)
                .estimatedHours(completedTask.getEstimatedHours())
                .storyPoints(completedTask.getStoryPoints())
                .recurringPattern(completedTask.getRecurringPattern())
                .recurringInterval(interval)
                .recurringUntil(completedTask.getRecurringUntil())
                .parentTaskId(rootParentId)
                .reminderMinutesBefore(completedTask.getReminderMinutesBefore())
                .build();

        // 4. Sao chép các mục checklist con (reset trạng thái chưa hoàn thành)
        if (completedTask.getChecklists() != null && !completedTask.getChecklists().isEmpty()) {
            for (TaskChecklist item : completedTask.getChecklists()) {
                TaskChecklist clonedItem = TaskChecklist.builder()
                        .task(nextTask)
                        .title(item.getTitle())
                        .isCompleted(false)
                        .position(item.getPosition())
                        .build();
                nextTask.getChecklists().add(clonedItem);
            }
        }

        // 5. Lưu task chu kỳ mới vào Database
        Task savedNext = taskRepository.save(nextTask);
        log.info("Đã tự động sinh công việc lặp lại #{} (từ task #{}) với dueDate: {}",
                savedNext.getId(), completedTask.getId(), nextDueDate);
        return Optional.of(savedNext);
    }

    private RecurringConfigDTO toConfigDto(Task task) {
        return new RecurringConfigDTO(
                task.getId(),
                task.getRecurringPattern(),
                task.getRecurringInterval(),
                task.getRecurringUntil(),
                task.getReminderMinutesBefore()
        );
    }
}
