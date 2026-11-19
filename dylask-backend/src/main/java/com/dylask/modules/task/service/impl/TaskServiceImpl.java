package com.dylask.modules.task.service.impl;

import com.dylask.common.dto.PageResponse;
import com.dylask.common.exception.AppException;
import com.dylask.common.exception.ErrorCode;
import com.dylask.modules.project.entity.Project;
import com.dylask.modules.project.repository.ProjectRepository;
import com.dylask.modules.task.dto.request.CreateTaskRequestDTO;
import com.dylask.modules.task.dto.request.UpdateTaskRequestDTO;
import com.dylask.modules.task.dto.request.UpdateTaskStatusDTO;
import com.dylask.modules.task.dto.response.TaskDetailDTO;
import com.dylask.modules.task.dto.response.TaskSummaryDTO;
import com.dylask.modules.task.entity.Task;
import com.dylask.modules.task.entity.TaskChecklist;
import com.dylask.modules.task.mapper.TaskMapper;
import com.dylask.modules.task.repository.TaskRepository;
import com.dylask.modules.task.repository.TaskSpecifications;
import com.dylask.modules.task.service.RecurringTaskService;
import com.dylask.modules.task.service.TaskService;
import com.dylask.modules.user.entity.User;
import com.dylask.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Hiện thực nghiệp vụ quản lý công việc (TaskServiceImpl).
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TaskServiceImpl implements TaskService {

    private static final String DEFAULT_STANDARD_CATEGORY = "Cá nhân";

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TaskMapper taskMapper;
    private final RecurringTaskService recurringTaskService;

    @Override
    public PageResponse<TaskSummaryDTO> getTasks(
            Long userId,
            String mode,
            String category,
            String filter,
            String search,
            String status,
            Pageable pageable) {

        log.debug("Truy vấn danh sách công việc cho user #{}, mode: {}, category: {}, filter: {}", userId, mode, category, filter);

        // 1. Tạo Specification động kết hợp các điều kiện lọc và bảo vệ theo userId
        Specification<Task> spec = TaskSpecifications.buildFilter(userId, mode, category, filter, search, status);

        // 2. Thực thi truy vấn phân trang từ Database
        Page<Task> taskPage = taskRepository.findAll(spec, pageable);

        // 3. Chuyển đổi Page<Task> sang DTO và đóng gói PageResponse
        Page<TaskSummaryDTO> dtoPage = taskPage.map(taskMapper::toSummaryDto);
        return PageResponse.from(dtoPage);
    }

    @Override
    public TaskDetailDTO getTaskById(Long userId, Long taskId) {
        log.debug("Lấy chi tiết công việc #{} của user #{}", taskId, userId);

        // 1. Tìm công việc và kiểm tra quyền sở hữu (Ownership)
        Task task = taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));

        // 2. Chuyển đổi sang TaskDetailDTO
        return taskMapper.toDetailDto(task);
    }

    @Override
    @Transactional
    public TaskSummaryDTO createTask(Long userId, CreateTaskRequestDTO request) {
        log.info("Tạo công việc mới cho user #{}: '{}'", userId, request.title());

        // 1. Xác thực tài khoản người dùng
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // 2. Xác định danh mục (Category / Project)
        String categoryName = (request.categoryName() != null && !request.categoryName().isBlank())
                ? request.categoryName().trim()
                : DEFAULT_STANDARD_CATEGORY;

        Project project = getOrCreateProject(user, categoryName, "standard");

        // 3. Khởi tạo đối tượng Task
        Task task = Task.builder()
                .user(user)
                .project(project)
                .title(request.title().trim())
                .description(request.description() != null ? request.description().trim() : null)
                .priority(request.priority() != null ? request.priority().toLowerCase() : "medium")
                .status("todo")
                .dueDate(request.dueDate())
                .isMyDay(false)
                .build();

        // 4. Đính kèm các mục việc con nếu có
        if (request.checklistTitles() != null && !request.checklistTitles().isEmpty()) {
            int position = 0;
            for (String subTitle : request.checklistTitles()) {
                if (subTitle != null && !subTitle.isBlank()) {
                    TaskChecklist subItem = TaskChecklist.builder()
                            .task(task)
                            .title(subTitle.trim())
                            .isCompleted(false)
                            .position(position++)
                            .build();
                    task.getChecklists().add(subItem);
                }
            }
        }

        // 5. Lưu vào Database (Cascade sẽ tự động lưu cả danh sách task_checklists con)
        Task savedTask = taskRepository.save(task);
        log.info("Đã tạo thành công công việc #{} (danh mục: '{}', số việc con: {})",
                savedTask.getId(), project.getName(), savedTask.getChecklists().size());

        return taskMapper.toSummaryDto(savedTask);
    }

    @Override
    @Transactional
    public TaskDetailDTO updateTask(Long userId, Long taskId, UpdateTaskRequestDTO request) {
        log.info("Cập nhật công việc #{} cho user #{}", taskId, userId);

        // 1. Kiểm tra tồn tại và quyền sở hữu
        Task task = taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));

        // 2. Cập nhật các trường thông tin cơ bản
        task.setTitle(request.title().trim());
        task.setDescription(request.description() != null ? request.description().trim() : null);
        if (request.priority() != null) {
            task.setPriority(request.priority().toLowerCase());
        }
        task.setDueDate(request.dueDate());

        // 3. Cập nhật danh mục nếu có thay đổi
        if (request.categoryName() != null && !request.categoryName().isBlank()) {
            String newCatName = request.categoryName().trim();
            Project currentProj = task.getProject();
            if (currentProj == null || !currentProj.getName().equalsIgnoreCase(newCatName)) {
                User user = task.getUser();
                if (user == null) {
                    user = userRepository.findById(userId)
                            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
                }
                String modeType = (currentProj != null && currentProj.getModeType() != null)
                        ? currentProj.getModeType()
                        : "standard";
                Project newProject = getOrCreateProject(user, newCatName, modeType);
                task.setProject(newProject);
            }
        }

        // 4. Lưu thay đổi
        Task updatedTask = taskRepository.save(task);
        return taskMapper.toDetailDto(updatedTask);
    }

    @Override
    @Transactional
    public TaskSummaryDTO updateTaskStatus(Long userId, Long taskId, UpdateTaskStatusDTO request) {
        log.info("Cập nhật trạng thái công việc #{} sang '{}' cho user #{}", taskId, request.status(), userId);

        // 1. Kiểm tra quyền sở hữu
        Task task = taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));

        // 2. Cập nhật trạng thái và ghi nhận chuyển đổi sang 'done'
        String previousStatus = task.getStatus();
        String normalizedStatus = request.status().toLowerCase();
        task.setStatus(normalizedStatus);
        Task updatedTask = taskRepository.save(task);

        // 3. Nếu vừa hoàn thành task có cấu hình lặp lại -> tự động nhân bản task chu kỳ kế tiếp
        if ("done".equals(normalizedStatus) && !"done".equalsIgnoreCase(previousStatus)) {
            recurringTaskService.generateNextOccurrenceIfRecurring(updatedTask);
        }

        return taskMapper.toSummaryDto(updatedTask);
    }

    @Override
    @Transactional
    public void deleteTask(Long userId, Long taskId) {
        log.info("Xóa công việc #{} của user #{}", taskId, userId);

        // 1. Kiểm tra tồn tại và quyền sở hữu
        Task task = taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));

        // 2. Xóa công việc (Cơ chế Cascade tự động dọn dẹp các checklist con liên kết)
        taskRepository.delete(task);
        log.info("Đã xóa vĩnh viễn công việc #{} thành công", taskId);
    }

    /**
     * Tìm danh mục Project hiện có của User hoặc tạo mới nếu chưa tồn tại.
     */
    private Project getOrCreateProject(User user, String projectName, String modeType) {
        return projectRepository.findByUserIdAndModeTypeAndName(user.getId(), modeType, projectName)
                .orElseGet(() -> {
                    Project newProj = Project.builder()
                            .user(user)
                            .name(projectName)
                            .modeType(modeType)
                            .isAiEnabled(true)
                            .build();
                    return projectRepository.save(newProj);
                });
    }
}

