package com.dylask.modules.task.controller;

import com.dylask.common.dto.ApiResponse;
import com.dylask.common.exception.AppException;
import com.dylask.common.exception.ErrorCode;
import com.dylask.modules.task.dto.request.CreateChecklistRequestDTO;
import com.dylask.modules.task.dto.request.UpdateChecklistRequestDTO;
import com.dylask.modules.task.dto.response.ChecklistItemDTO;
import com.dylask.modules.task.service.TaskChecklistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller quản lý các mục kiểm tra con (TaskChecklists) thuộc một công việc cha.
 */
@RestController
@RequestMapping("/tasks/{taskId}/checklists")
@RequiredArgsConstructor
public class TaskChecklistController {

    private final TaskChecklistService checklistService;

    /**
     * Thêm một mục kiểm tra con mới vào công việc cha.
     *
     * @param currentUserId ID người dùng từ JWT
     * @param taskId ID công việc cha
     * @param request Dữ liệu mục con
     * @return Mục kiểm tra con vừa tạo
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ChecklistItemDTO>> addChecklist(
            @RequestAttribute(value = "currentUserId", required = false) Long currentUserId,
            @PathVariable("taskId") Long taskId,
            @Valid @RequestBody CreateChecklistRequestDTO request) {

        validateUser(currentUserId);
        ChecklistItemDTO created = checklistService.addChecklist(currentUserId, taskId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(created, "Thêm mục kiểm tra con thành công"));
    }

    /**
     * Đảo ngược trạng thái hoàn thành (hoàn thành <-> chưa xong) của mục kiểm tra con.
     *
     * @param currentUserId ID người dùng từ JWT
     * @param taskId ID công việc cha
     * @param checklistId ID mục con cần toggle
     * @return Mục kiểm tra con với trạng thái mới
     */
    @PatchMapping("/{checklistId}/toggle")
    public ResponseEntity<ApiResponse<ChecklistItemDTO>> toggleChecklist(
            @RequestAttribute(value = "currentUserId", required = false) Long currentUserId,
            @PathVariable("taskId") Long taskId,
            @PathVariable("checklistId") Long checklistId) {

        validateUser(currentUserId);
        ChecklistItemDTO updated = checklistService.toggleChecklist(currentUserId, taskId, checklistId);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Cập nhật trạng thái mục con thành công"));
    }

    /**
     * Cập nhật thông tin chi tiết mục kiểm tra con (tiêu đề, trạng thái, vị trí).
     *
     * @param currentUserId ID người dùng từ JWT
     * @param taskId ID công việc cha
     * @param checklistId ID mục con
     * @param request Dữ liệu cập nhật
     * @return Mục kiểm tra con sau khi cập nhật
     */
    @PutMapping("/{checklistId}")
    public ResponseEntity<ApiResponse<ChecklistItemDTO>> updateChecklist(
            @RequestAttribute(value = "currentUserId", required = false) Long currentUserId,
            @PathVariable("taskId") Long taskId,
            @PathVariable("checklistId") Long checklistId,
            @Valid @RequestBody UpdateChecklistRequestDTO request) {

        validateUser(currentUserId);
        ChecklistItemDTO updated = checklistService.updateChecklist(currentUserId, taskId, checklistId, request);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Cập nhật mục kiểm tra con thành công"));
    }

    /**
     * Xóa một mục kiểm tra con khỏi công việc cha.
     *
     * @param currentUserId ID người dùng từ JWT
     * @param taskId ID công việc cha
     * @param checklistId ID mục con cần xóa
     * @return Thông báo xóa thành công
     */
    @DeleteMapping("/{checklistId}")
    public ResponseEntity<ApiResponse<Void>> deleteChecklist(
            @RequestAttribute(value = "currentUserId", required = false) Long currentUserId,
            @PathVariable("taskId") Long taskId,
            @PathVariable("checklistId") Long checklistId) {

        validateUser(currentUserId);
        checklistService.deleteChecklist(currentUserId, taskId, checklistId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Xóa mục kiểm tra con thành công"));
    }

    private void validateUser(Long userId) {
        if (userId == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Chưa xác thực hoặc phiên làm việc không hợp lệ");
        }
    }
}

