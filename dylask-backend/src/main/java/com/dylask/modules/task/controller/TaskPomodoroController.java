package com.dylask.modules.task.controller;

import com.dylask.common.dto.ApiResponse;
import com.dylask.common.exception.AppException;
import com.dylask.common.exception.ErrorCode;
import com.dylask.modules.task.dto.response.PomodoroSessionResultDTO;
import com.dylask.modules.task.service.TaskPomodoroService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller ghi nhận các phiên tập trung Pomodoro gắn với từng công việc.
 */
@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class TaskPomodoroController {

    private final TaskPomodoroService taskPomodoroService;

    /**
     * Ghi nhận hoàn thành 1 phiên Pomodoro 25 phút cho công việc.
     *
     * @param currentUserId ID người dùng từ JWT
     * @param id            ID công việc
     * @return Tổng số phiên và số phút tập trung đã tích lũy
     */
    @PostMapping("/{id}/pomodoro/complete")
    public ResponseEntity<ApiResponse<PomodoroSessionResultDTO>> completePomodoro(
            @RequestAttribute(value = "currentUserId", required = false) Long currentUserId,
            @PathVariable("id") Long id) {

        if (currentUserId == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        PomodoroSessionResultDTO result = taskPomodoroService.completePomodoroSession(currentUserId, id);
        return ResponseEntity.ok(ApiResponse.ok(result, "Chúc mừng bạn đã hoàn thành 1 phiên Pomodoro tập trung!"));
    }
}
