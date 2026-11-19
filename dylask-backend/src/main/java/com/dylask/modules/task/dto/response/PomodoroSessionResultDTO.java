package com.dylask.modules.task.dto.response;

/**
 * DTO phản hồi kết quả sau khi hoàn thành một phiên Pomodoro 25 phút.
 */
public record PomodoroSessionResultDTO(
        Long taskId,
        Integer pomodoroSessionsCompleted,
        Integer pomodoroTotalMinutes
) {
}
