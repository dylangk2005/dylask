package com.dylask.modules.task.service.impl;

import com.dylask.common.exception.AppException;
import com.dylask.common.exception.ErrorCode;
import com.dylask.modules.task.dto.request.CreateChecklistRequestDTO;
import com.dylask.modules.task.dto.request.UpdateChecklistRequestDTO;
import com.dylask.modules.task.dto.response.ChecklistItemDTO;
import com.dylask.modules.task.entity.Task;
import com.dylask.modules.task.entity.TaskChecklist;
import com.dylask.modules.task.mapper.TaskChecklistMapper;
import com.dylask.modules.task.repository.TaskChecklistRepository;
import com.dylask.modules.task.repository.TaskRepository;
import com.dylask.modules.task.service.TaskChecklistService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Hiện thực nghiệp vụ quản lý danh sách kiểm tra con (TaskChecklistServiceImpl).
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TaskChecklistServiceImpl implements TaskChecklistService {

    private static final int MAX_CHECKLIST_ITEMS_PER_TASK = 50;

    private final TaskRepository taskRepository;
    private final TaskChecklistRepository checklistRepository;
    private final TaskChecklistMapper checklistMapper;

    @Override
    @Transactional
    public ChecklistItemDTO addChecklist(Long userId, Long taskId, CreateChecklistRequestDTO request) {
        log.info("Thêm checklist con vào task #{} của user #{}: '{}'", taskId, userId, request.title());

        // 1. Kiểm tra quyền sở hữu đối với task cha
        Task task = taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));

        // 2. Kiểm tra giới hạn số lượng (Tối đa 50 checklist items / task)
        int currentCount = checklistRepository.countByTaskId(taskId);
        if (currentCount >= MAX_CHECKLIST_ITEMS_PER_TASK) {
            throw new AppException(ErrorCode.VALIDATION_FAILED);
        }

        // 3. Khởi tạo đối tượng TaskChecklist với position tăng dần
        TaskChecklist checklist = TaskChecklist.builder()
                .task(task)
                .title(request.title().trim())
                .isCompleted(false)
                .position(currentCount)
                .build();

        // 4. Lưu vào Database
        TaskChecklist savedItem = checklistRepository.save(checklist);
        return checklistMapper.toDto(savedItem);
    }

    @Override
    @Transactional
    public ChecklistItemDTO toggleChecklist(Long userId, Long taskId, Long checklistId) {
        log.info("Toggle trạng thái checklist #{} của task #{} (user #{})", checklistId, taskId, userId);

        // 1. Xác thực quyền sở hữu task cha
        taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));

        // 2. Tìm mục checklist tương ứng
        TaskChecklist checklist = checklistRepository.findByIdAndTaskId(checklistId, taskId)
                .orElseThrow(() -> new AppException(ErrorCode.CHECKLIST_NOT_FOUND));

        // 3. Đảo ngược trạng thái hoàn thành
        checklist.setIsCompleted(!Boolean.TRUE.equals(checklist.getIsCompleted()));
        TaskChecklist updated = checklistRepository.save(checklist);

        return checklistMapper.toDto(updated);
    }

    @Override
    @Transactional
    public ChecklistItemDTO updateChecklist(Long userId, Long taskId, Long checklistId, UpdateChecklistRequestDTO request) {
        log.info("Cập nhật checklist #{} của task #{} (user #{})", checklistId, taskId, userId);

        // 1. Xác thực quyền sở hữu task cha
        taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));

        // 2. Tìm mục checklist
        TaskChecklist checklist = checklistRepository.findByIdAndTaskId(checklistId, taskId)
                .orElseThrow(() -> new AppException(ErrorCode.CHECKLIST_NOT_FOUND));

        // 3. Cập nhật các trường được chỉ định
        if (request.title() != null && !request.title().isBlank()) {
            checklist.setTitle(request.title().trim());
        }
        if (request.isCompleted() != null) {
            checklist.setIsCompleted(request.isCompleted());
        }
        if (request.position() != null) {
            checklist.setPosition(request.position());
        }

        TaskChecklist updated = checklistRepository.save(checklist);
        return checklistMapper.toDto(updated);
    }

    @Override
    @Transactional
    public void deleteChecklist(Long userId, Long taskId, Long checklistId) {
        log.info("Xóa checklist #{} của task #{} (user #{})", checklistId, taskId, userId);

        // 1. Xác thực quyền sở hữu task cha
        taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));

        // 2. Tìm mục checklist
        TaskChecklist checklist = checklistRepository.findByIdAndTaskId(checklistId, taskId)
                .orElseThrow(() -> new AppException(ErrorCode.CHECKLIST_NOT_FOUND));

        // 3. Xóa bản ghi
        checklistRepository.delete(checklist);
    }
}

