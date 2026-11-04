package com.dylask.modules.task.service;

import com.dylask.modules.task.dto.request.CreateChecklistRequestDTO;
import com.dylask.modules.task.dto.request.UpdateChecklistRequestDTO;
import com.dylask.modules.task.dto.response.ChecklistItemDTO;

/**
 * Interface định nghĩa các nghiệp vụ quản lý danh sách kiểm tra con (TaskChecklist).
 */
public interface TaskChecklistService {

    /**
     * Thêm mục kiểm tra con mới vào công việc cha.
     *
     * @param userId ID người dùng
     * @param taskId ID công việc cha
     * @param request Dữ liệu tiêu đề mục con
     * @return ChecklistItemDTO Mục vừa tạo
     * @throws com.dylask.common.exception.AppException TASK_NOT_FOUND hoặc VALIDATION_FAILED nếu vượt quá 50 mục
     */
    ChecklistItemDTO addChecklist(Long userId, Long taskId, CreateChecklistRequestDTO request);

    /**
     * Đổi nhanh trạng thái hoàn thành của một mục checklist (hoàn thành <-> chưa xong).
     *
     * @param userId ID người dùng
     * @param taskId ID công việc cha
     * @param checklistId ID mục con
     * @return ChecklistItemDTO Mục sau khi cập nhật
     */
    ChecklistItemDTO toggleChecklist(Long userId, Long taskId, Long checklistId);

    /**
     * Cập nhật thông tin chi tiết của mục kiểm tra con.
     *
     * @param userId ID người dùng
     * @param taskId ID công việc cha
     * @param checklistId ID mục con
     * @param request Dữ liệu cập nhật
     * @return ChecklistItemDTO Mục sau khi cập nhật
     */
    ChecklistItemDTO updateChecklist(Long userId, Long taskId, Long checklistId, UpdateChecklistRequestDTO request);

    /**
     * Xóa một mục danh sách kiểm tra con.
     *
     * @param userId ID người dùng
     * @param taskId ID công việc cha
     * @param checklistId ID mục con
     */
    void deleteChecklist(Long userId, Long taskId, Long checklistId);
}

