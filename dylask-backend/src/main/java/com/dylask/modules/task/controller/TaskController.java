package com.dylask.modules.task.controller;

import com.dylask.common.dto.ApiResponse;
import com.dylask.common.dto.PageResponse;
import com.dylask.common.exception.AppException;
import com.dylask.common.exception.ErrorCode;
import com.dylask.modules.task.dto.request.CreateTaskRequestDTO;
import com.dylask.modules.task.dto.request.UpdateTaskRequestDTO;
import com.dylask.modules.task.dto.request.UpdateTaskStatusDTO;
import com.dylask.modules.task.dto.response.TaskDetailDTO;
import com.dylask.modules.task.dto.response.TaskSummaryDTO;
import com.dylask.modules.task.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller quản lý các thao tác CRUD và bộ lọc công việc cá nhân.
 */
@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    /**
     * Lấy danh sách công việc của người dùng kèm phân trang và lọc đa tiêu chí.
     *
     * @param currentUserId ID người dùng từ JWT
     * @param mode Chế độ hiển thị ('standard' hoặc 'developer')
     * @param category Tên danh mục (Học tập, Công việc, Cá nhân...)
     * @param filter Bộ lọc đặc thù: 'today', 'upcoming', 'overdue'
     * @param search Từ khóa tìm kiếm theo tiêu đề
     * @param status Trạng thái công việc ('todo', 'done')
     * @param pageable Cấu hình phân trang (mặc định 20 phần tử/trang, sắp xếp theo createdAt giảm dần)
     * @return Phản hồi danh sách công việc
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<TaskSummaryDTO>>> getTasks(
            @RequestAttribute(value = "currentUserId", required = false) Long currentUserId,
            @RequestParam(value = "mode", defaultValue = "standard") String mode,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "filter", required = false) String filter,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "status", required = false) String status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        validateUser(currentUserId);
        PageResponse<TaskSummaryDTO> result = taskService.getTasks(
                currentUserId, mode, category, filter, search, status, pageable);
        return ResponseEntity.ok(ApiResponse.ok(result, "Lấy danh sách công việc thành công"));
    }

    /**
     * Xem thông tin chi tiết một công việc cùng các checklist con.
     *
     * @param currentUserId ID người dùng từ JWT
     * @param id ID công việc
     * @return Chi tiết công việc
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskDetailDTO>> getTaskById(
            @RequestAttribute(value = "currentUserId", required = false) Long currentUserId,
            @PathVariable("id") Long id) {

        validateUser(currentUserId);
        TaskDetailDTO task = taskService.getTaskById(currentUserId, id);
        return ResponseEntity.ok(ApiResponse.ok(task, "Lấy chi tiết công việc thành công"));
    }

    /**
     * Tạo một công việc mới.
     *
     * @param currentUserId ID người dùng từ JWT
     * @param request Dữ liệu tạo công việc
     * @return Công việc vừa được tạo
     */
    @PostMapping
    public ResponseEntity<ApiResponse<TaskSummaryDTO>> createTask(
            @RequestAttribute(value = "currentUserId", required = false) Long currentUserId,
            @Valid @RequestBody CreateTaskRequestDTO request) {

        validateUser(currentUserId);
        TaskSummaryDTO created = taskService.createTask(currentUserId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(created, "Tạo công việc thành công"));
    }

    /**
     * Cập nhật thông tin chi tiết công việc.
     *
     * @param currentUserId ID người dùng từ JWT
     * @param id ID công việc cần cập nhật
     * @param request Dữ liệu cập nhật
     * @return Thông tin sau khi cập nhật
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskDetailDTO>> updateTask(
            @RequestAttribute(value = "currentUserId", required = false) Long currentUserId,
            @PathVariable("id") Long id,
            @Valid @RequestBody UpdateTaskRequestDTO request) {

        validateUser(currentUserId);
        TaskDetailDTO updated = taskService.updateTask(currentUserId, id, request);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Cập nhật công việc thành công"));
    }

    /**
     * Cập nhật trạng thái hoàn thành ('todo' <-> 'done').
     *
     * @param currentUserId ID người dùng từ JWT
     * @param id ID công việc
     * @param request Dữ liệu trạng thái
     * @return Thông tin công việc sau khi đổi trạng thái
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TaskSummaryDTO>> updateTaskStatus(
            @RequestAttribute(value = "currentUserId", required = false) Long currentUserId,
            @PathVariable("id") Long id,
            @Valid @RequestBody UpdateTaskStatusDTO request) {

        validateUser(currentUserId);
        TaskSummaryDTO updated = taskService.updateTaskStatus(currentUserId, id, request);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Cập nhật trạng thái thành công"));
    }

    /**
     * Xóa vĩnh viễn công việc và toàn bộ checklists con liên kết.
     *
     * @param currentUserId ID người dùng từ JWT
     * @param id ID công việc cần xóa
     * @return Thông báo kết quả xóa
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            @RequestAttribute(value = "currentUserId", required = false) Long currentUserId,
            @PathVariable("id") Long id) {

        validateUser(currentUserId);
        taskService.deleteTask(currentUserId, id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Xóa công việc thành công"));
    }

    private void validateUser(Long userId) {
        if (userId == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Chưa xác thực hoặc phiên làm việc không hợp lệ");
        }
    }
}

