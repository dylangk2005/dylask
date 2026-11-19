package com.dylask.modules.task.controller;

import com.dylask.common.dto.ApiResponse;
import com.dylask.common.exception.AppException;
import com.dylask.common.exception.ErrorCode;
import com.dylask.modules.task.dto.request.SetRecurringRequestDTO;
import com.dylask.modules.task.dto.response.CalendarTaskDTO;
import com.dylask.modules.task.dto.response.RecurringConfigDTO;
import com.dylask.modules.task.service.RecurringTaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

/**
 * REST Controller phục vụ chế độ xem Lịch trình (Calendar View) và cấu hình Công việc lặp lại (Recurring Tasks).
 */
@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class TaskCalendarController {

    private final RecurringTaskService recurringTaskService;

    /**
     * Lấy danh sách công việc trong khoảng thời gian cho Calendar View.
     *
     * @param currentUserId ID người dùng từ JWT
     * @param startDate     Mốc bắt đầu (ISO-8601 UTC)
     * @param endDate       Mốc kết thúc (ISO-8601 UTC)
     * @return Danh sách công việc hiển thị trên lịch
     */
    @GetMapping("/calendar")
    public ResponseEntity<ApiResponse<List<CalendarTaskDTO>>> getCalendarTasks(
            @RequestAttribute(value = "currentUserId", required = false) Long currentUserId,
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate) {

        validateUser(currentUserId);
        List<CalendarTaskDTO> tasks = recurringTaskService.getCalendarTasks(currentUserId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok(tasks, "Lấy dữ liệu lịch trình thành công"));
    }

    /**
     * Cấu hình quy tắc lặp lại định kỳ cho một công việc.
     *
     * @param currentUserId ID người dùng từ JWT
     * @param id            ID công việc
     * @param request       Thông tin quy tắc lặp lại
     * @return Cấu hình lặp lại đã lưu
     */
    @PutMapping("/{id}/recurring")
    public ResponseEntity<ApiResponse<RecurringConfigDTO>> setRecurring(
            @RequestAttribute(value = "currentUserId", required = false) Long currentUserId,
            @PathVariable("id") Long id,
            @Valid @RequestBody SetRecurringRequestDTO request) {

        validateUser(currentUserId);
        RecurringConfigDTO config = recurringTaskService.setRecurring(currentUserId, id, request);
        return ResponseEntity.ok(ApiResponse.ok(config, "Cấu hình lặp lại công việc thành công"));
    }

    /**
     * Hủy bỏ quy tắc lặp lại định kỳ của một công việc.
     *
     * @param currentUserId ID người dùng từ JWT
     * @param id            ID công việc
     * @return Cấu hình sau khi hủy
     */
    @DeleteMapping("/{id}/recurring")
    public ResponseEntity<ApiResponse<RecurringConfigDTO>> clearRecurring(
            @RequestAttribute(value = "currentUserId", required = false) Long currentUserId,
            @PathVariable("id") Long id) {

        validateUser(currentUserId);
        RecurringConfigDTO config = recurringTaskService.clearRecurring(currentUserId, id);
        return ResponseEntity.ok(ApiResponse.ok(config, "Đã hủy bỏ quy tắc lặp lại cho công việc này"));
    }

    private void validateUser(Long currentUserId) {
        if (currentUserId == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }
}
