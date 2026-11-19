package com.dylask.modules.task.service.impl;

import com.dylask.common.exception.AppException;
import com.dylask.common.exception.ErrorCode;
import com.dylask.modules.task.dto.response.PomodoroSessionResultDTO;
import com.dylask.modules.task.entity.Task;
import com.dylask.modules.task.repository.TaskRepository;
import com.dylask.modules.task.service.TaskPomodoroService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Hiện thực nghiệp vụ ghi nhận phiên tập trung Pomodoro (25 phút / phiên).
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TaskPomodoroServiceImpl implements TaskPomodoroService {

    private static final int POMODORO_WORK_MINUTES = 25;

    private final TaskRepository taskRepository;

    @Override
    @Transactional
    public PomodoroSessionResultDTO completePomodoroSession(Long userId, Long taskId) {
        log.info("Ghi nhận hoàn thành 1 phiên Pomodoro 25p cho công việc #{} (user #{})", taskId, userId);

        // 1. Kiểm tra tồn tại và quyền sở hữu
        Task task = taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));

        // 2. Cộng dồn số phiên và tổng số phút tập trung
        int currentSessions = task.getPomodoroSessionsCompleted() != null ? task.getPomodoroSessionsCompleted() : 0;
        int currentMinutes = task.getPomodoroTotalMinutes() != null ? task.getPomodoroTotalMinutes() : 0;

        task.setPomodoroSessionsCompleted(currentSessions + 1);
        task.setPomodoroTotalMinutes(currentMinutes + POMODORO_WORK_MINUTES);

        // 3. Lưu kết quả
        Task saved = taskRepository.save(task);
        return new PomodoroSessionResultDTO(
                saved.getId(),
                saved.getPomodoroSessionsCompleted(),
                saved.getPomodoroTotalMinutes()
        );
    }
}
