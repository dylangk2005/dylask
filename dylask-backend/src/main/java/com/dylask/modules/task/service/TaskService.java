package com.dylask.modules.task.service;

import com.dylask.common.dto.PageResponse;
import com.dylask.modules.task.dto.request.CreateTaskRequestDTO;
import com.dylask.modules.task.dto.request.UpdateTaskRequestDTO;
import com.dylask.modules.task.dto.request.UpdateTaskStatusDTO;
import com.dylask.modules.task.dto.response.TaskDetailDTO;
import com.dylask.modules.task.dto.response.TaskSummaryDTO;
import org.springframework.data.domain.Pageable;

/**
 * Interface định nghĩa các nghiệp vụ cốt lõi quản lý công việc (Task).
 */
public interface TaskService {

    /**
     * Lấy danh sách công việc của người dùng kèm phân trang và các bộ lọc đa chiều.
     *
     * @param userId ID người dùng đang đăng nhập
     * @param mode Chế độ giao diện ('standard' hoặc 'developer')
     * @param category Tên danh mục công việc
     * @param filter Bộ lọc đặc thù: 'today', 'upcoming', 'overdue'
     * @param search Từ khóa tìm kiếm theo tiêu đề
     * @param status Trạng thái công việc ('todo' hoặc 'done')
     * @param pageable Tham số phân trang và sắp xếp
     * @return PageResponse chứa danh sách TaskSummaryDTO
     */
    PageResponse<TaskSummaryDTO> getTasks(
            Long userId,
            String mode,
            String category,
            String filter,
            String search,
            String status,
            Pageable pageable);

    /**
     * Xem thông tin chi tiết một công việc cùng toàn bộ danh sách kiểm tra con.
     *
     * @param userId ID người dùng
     * @param taskId ID công việc
     * @return TaskDetailDTO Chi tiết công việc
     * @throws com.dylask.common.exception.AppException TASK_NOT_FOUND nếu không tìm thấy hoặc không có quyền
     */
    TaskDetailDTO getTaskById(Long userId, Long taskId);

    /**
     * Tạo một công việc mới. Tự động liên kết hoặc tạo danh mục Project tương ứng cho người dùng.
     *
     * @param userId ID người dùng
     * @param request Dữ liệu tạo công việc
     * @return TaskSummaryDTO Công việc vừa tạo
     */
    TaskSummaryDTO createTask(Long userId, CreateTaskRequestDTO request);

    /**
     * Cập nhật thông tin chi tiết công việc.
     *
     * @param userId ID người dùng
     * @param taskId ID công việc
     * @param request Dữ liệu cập nhật
     * @return TaskDetailDTO Thông tin công việc sau cập nhật
     */
    TaskDetailDTO updateTask(Long userId, Long taskId, UpdateTaskRequestDTO request);

    /**
     * Cập nhật nhanh trạng thái hoàn thành ('todo' <-> 'done').
     *
     * @param userId ID người dùng
     * @param taskId ID công việc
     * @param request Dữ liệu trạng thái mới
     * @return TaskSummaryDTO Công việc với trạng thái mới
     */
    TaskSummaryDTO updateTaskStatus(Long userId, Long taskId, UpdateTaskStatusDTO request);

    /**
     * Xóa vĩnh viễn công việc và toàn bộ danh sách kiểm tra con (Cascade delete).
     *
     * @param userId ID người dùng
     * @param taskId ID công việc
     */
    void deleteTask(Long userId, Long taskId);
}

