package com.dylask.modules.planning.controller;

import com.dylask.common.dto.ApiResponse;
import com.dylask.common.exception.AppException;
import com.dylask.common.exception.ErrorCode;
import com.dylask.modules.planning.dto.request.BulkRescheduleRequestDTO;
import com.dylask.modules.planning.dto.request.CreateWeeklyGoalRequestDTO;
import com.dylask.modules.planning.dto.request.ScheduleTaskRequestDTO;
import com.dylask.modules.planning.dto.response.*;
import com.dylask.modules.planning.service.PlanningService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;

/**
 * REST Controller quản lý Lập kế hoạch tuần, 7 ngày tới (Upcoming) và Việc quá hạn (Overdue).
 */
@RestController
@RequestMapping("/planning")
@RequiredArgsConstructor
public class PlanningController {

    private static final ZoneOffset USER_ZONE = ZoneOffset.ofHours(7);

    private final PlanningService planningService;

    @GetMapping("/weekly")
    public ResponseEntity<ApiResponse<WeeklyPlanningResponseDTO>> getWeeklyPlanning(
            @RequestAttribute(value = "currentUserId", required = false) Long currentUserId,
            @RequestParam(value = "week", required = false) Integer week,
            @RequestParam(value = "year", required = false) Integer year) {

        validateUser(currentUserId);
        WeeklyPlanningResponseDTO res = planningService.getWeeklyPlanning(
                currentUserId, week, year, LocalDate.now(USER_ZONE));
        return ResponseEntity.ok(ApiResponse.ok(res, "Lấy kế hoạch tuần thành công"));
    }

    @PutMapping("/tasks/{id}/schedule")
    public ResponseEntity<ApiResponse<PlanningTaskDTO>> scheduleTask(
            @RequestAttribute(value = "currentUserId", required = false) Long currentUserId,
            @PathVariable("id") Long id,
            @Valid @RequestBody ScheduleTaskRequestDTO request) {

        validateUser(currentUserId);
        PlanningTaskDTO res = planningService.scheduleTask(currentUserId, id, request.scheduledDate());
        return ResponseEntity.ok(ApiResponse.ok(res, "Đã lên lịch công việc thành công"));
    }

    @PostMapping("/weekly-goals")
    public ResponseEntity<ApiResponse<WeeklyGoalDTO>> createWeeklyGoal(
            @RequestAttribute(value = "currentUserId", required = false) Long currentUserId,
            @Valid @RequestBody CreateWeeklyGoalRequestDTO request) {

        validateUser(currentUserId);
        WeeklyGoalDTO created = planningService.createWeeklyGoal(
                currentUserId, request, LocalDate.now(USER_ZONE));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(created, "Đã thêm mục tiêu tuần"));
    }

    @PatchMapping("/weekly-goals/{id}/toggle")
    public ResponseEntity<ApiResponse<WeeklyGoalDTO>> toggleWeeklyGoal(
            @RequestAttribute(value = "currentUserId", required = false) Long currentUserId,
            @PathVariable("id") Long id) {

        validateUser(currentUserId);
        WeeklyGoalDTO updated = planningService.toggleWeeklyGoal(currentUserId, id);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Đã cập nhật trạng thái mục tiêu tuần"));
    }

    @DeleteMapping("/weekly-goals/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteWeeklyGoal(
            @RequestAttribute(value = "currentUserId", required = false) Long currentUserId,
            @PathVariable("id") Long id) {

        validateUser(currentUserId);
        planningService.deleteWeeklyGoal(currentUserId, id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Đã xóa mục tiêu tuần"));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<UpcomingDaysResponseDTO>> getUpcoming7Days(
            @RequestAttribute(value = "currentUserId", required = false) Long currentUserId) {

        validateUser(currentUserId);
        UpcomingDaysResponseDTO res = planningService.getUpcoming7Days(
                currentUserId, LocalDate.now(USER_ZONE));
        return ResponseEntity.ok(ApiResponse.ok(res, "Lấy danh sách 7 ngày tới thành công"));
    }

    @GetMapping("/overdue")
    public ResponseEntity<ApiResponse<OverdueTasksResponseDTO>> getOverdueTasks(
            @RequestAttribute(value = "currentUserId", required = false) Long currentUserId) {

        validateUser(currentUserId);
        OverdueTasksResponseDTO res = planningService.getOverdueTasks(
                currentUserId, LocalDate.now(USER_ZONE));
        return ResponseEntity.ok(ApiResponse.ok(res, "Lấy danh sách việc quá hạn thành công"));
    }

    @PostMapping("/tasks/bulk-reschedule")
    public ResponseEntity<ApiResponse<List<PlanningTaskDTO>>> bulkReschedule(
            @RequestAttribute(value = "currentUserId", required = false) Long currentUserId,
            @Valid @RequestBody BulkRescheduleRequestDTO request) {

        validateUser(currentUserId);
        List<PlanningTaskDTO> res = planningService.bulkReschedule(
                currentUserId, request.taskIds(), request.targetDate());
        return ResponseEntity.ok(ApiResponse.ok(res, "Đã dời lịch hàng loạt thành công"));
    }

    private void validateUser(Long currentUserId) {
        if (currentUserId == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }
}
