package com.dylask.modules.task.service;

import com.dylask.modules.task.dto.response.PomodoroSessionResultDTO;

/**
 * Interface dịch vụ ghi nhận các phiên tập trung Pomodoro cho công việc.
 */
public interface TaskPomodoroService {

    /**
     * Ghi nhận hoàn thành 1 phiên Pomodoro 25 phút cho công việc.
     *
     * @param userId ID người dùng sở hữu
     * @param taskId ID công việc
     * @return Số phiên và tổng số phút Pomodoro đã tích lũy
     */
    PomodoroSessionResultDTO completePomodoroSession(Long userId, Long taskId);
}
