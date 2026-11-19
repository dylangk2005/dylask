package com.dylask.modules.task.controller;

import com.dylask.common.dto.ApiResponse;
import com.dylask.common.exception.AppException;
import com.dylask.common.exception.ErrorCode;
import com.dylask.modules.task.dto.request.ToggleMyDayRequestDTO;
import com.dylask.modules.task.dto.response.MyDayResponseDTO;
import com.dylask.modules.task.dto.response.ToggleMyDayResponseDTO;
import com.dylask.modules.task.service.TaskMyDayService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.ZoneOffset;

/**
 * REST Controller quản lý Kế hoạch hôm nay (My Day) và Ngăn gợi ý thông minh.
 */
@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class TaskMyDayController {

    private final TaskMyDayService taskMyDayService;

    /**
     * Lấy danh sách công việc trọng tâm hôm nay và danh sách gợi ý thông minh.
     *
     * @param currentUserId ID người dùng từ JWT
     * @return Dữ liệu My Day
     */
    @GetMapping("/my-day")
    public ResponseEntity<ApiResponse<MyDayResponseDTO>> getMyDay(
            @RequestAttribute(value = "currentUserId", required = false) Long currentUserId) {

        validateUser(currentUserId);
        MyDayResponseDTO response = taskMyDayService.getMyDay(currentUserId, LocalDate.now(ZoneOffset.UTC));
        return ResponseEntity.ok(ApiResponse.ok(response, "Lấy danh sách My Day thành công"));
    }

    /**
     * Thêm hoặc gỡ công việc khỏi Kế hoạch hôm nay.
     *
     * @param currentUserId ID người dùng từ JWT
     * @param id            ID công việc
     * @param request       Trạng thái isMyDay
     * @return Trạng thái My Day sau khi cập nhật
     */
    @PatchMapping("/{id}/my-day")
    public ResponseEntity<ApiResponse<ToggleMyDayResponseDTO>> toggleMyDay(
            @RequestAttribute(value = "currentUserId", required = false) Long currentUserId,
            @PathVariable("id") Long id,
            @Valid @RequestBody ToggleMyDayRequestDTO request) {

        validateUser(currentUserId);
        ToggleMyDayResponseDTO response = taskMyDayService.toggleMyDay(
                currentUserId, id, Boolean.TRUE.equals(request.isMyDay()), LocalDate.now(ZoneOffset.UTC));
        String message = Boolean.TRUE.equals(request.isMyDay())
                ? "Đã thêm công việc vào Kế hoạch hôm nay"
                : "Đã gỡ công việc khỏi Kế hoạch hôm nay";
        return ResponseEntity.ok(ApiResponse.ok(response, message));
    }

    private void validateUser(Long currentUserId) {
        if (currentUserId == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }
}
