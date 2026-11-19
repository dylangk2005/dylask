package com.dylask.modules.task.service;

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
import com.dylask.modules.task.mapper.TaskMapper;
import com.dylask.modules.task.repository.TaskRepository;
import com.dylask.modules.task.service.RecurringTaskService;
import com.dylask.modules.task.service.impl.TaskServiceImpl;
import com.dylask.modules.user.entity.User;
import com.dylask.modules.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Kiểm thử đơn vị cho {@link TaskServiceImpl}.
 * Đáp ứng ma trận kiểm thử TC-STD-01 đến TC-STD-08 theo đặc tả FEAT-STD-01.
 */
@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TaskMapper taskMapper;

    @Mock
    private RecurringTaskService recurringTaskService;

    private TaskService taskService;

    private User sampleUser;
    private Project sampleProject;
    private Task sampleTask;

    @BeforeEach
    void setUp() {
        taskService = new TaskServiceImpl(taskRepository, projectRepository, userRepository, taskMapper, recurringTaskService);

        sampleUser = User.builder()
                .id(1L)
                .email("test@dylask.com")
                .fullName("Test User")
                .defaultMode("standard")
                .build();

        sampleProject = Project.builder()
                .id(10L)
                .user(sampleUser)
                .name("Cá nhân")
                .modeType("standard")
                .build();

        sampleTask = Task.builder()
                .id(101L)
                .user(sampleUser)
                .project(sampleProject)
                .title("Đóng tiền điện")
                .description("Hạn chót ngày 15")
                .priority("high")
                .status("todo")
                .dueDate(Instant.now().plusSeconds(86400))
                .build();
    }

    @Test
    @DisplayName("TC-STD-01: Tạo task mới thành công với danh mục mặc định")
    void createTask_Success_WithDefaultCategory() {
        CreateTaskRequestDTO request = new CreateTaskRequestDTO(
                "Học từ vựng tiếng Anh",
                "Ôn 50 từ mới",
                "high",
                Instant.now().plusSeconds(86400),
                null,
                null
        );

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(projectRepository.findByUserIdAndModeTypeAndName(1L, "standard", "Cá nhân"))
                .thenReturn(Optional.of(sampleProject));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> {
            Task t = invocation.getArgument(0);
            t.setId(102L);
            return t;
        });

        TaskSummaryDTO expectedDto = new TaskSummaryDTO(
                102L, "Học từ vựng tiếng Anh", "Ôn 50 từ mới", "high", "todo",
                request.dueDate(), false, "Cá nhân", 0, 0, false, null, Instant.now(), Instant.now()
        );
        when(taskMapper.toSummaryDto(any(Task.class))).thenReturn(expectedDto);

        TaskSummaryDTO result = taskService.createTask(1L, request);

        assertNotNull(result);
        assertEquals(102L, result.id());
        assertEquals("Học từ vựng tiếng Anh", result.title());
        assertEquals("high", result.priority());
        assertEquals("Cá nhân", result.categoryName());

        ArgumentCaptor<Task> captor = ArgumentCaptor.forClass(Task.class);
        verify(taskRepository).save(captor.capture());
        assertEquals("Học từ vựng tiếng Anh", captor.getValue().getTitle());
        assertEquals("todo", captor.getValue().getStatus());
    }

    @Test
    @DisplayName("TC-STD-01b: Tạo task với danh mục mới thì tự động sinh Project")
    void createTask_Success_CreatesNewCategoryIfNotExist() {
        CreateTaskRequestDTO request = new CreateTaskRequestDTO(
                "Mua sữa tươi",
                null,
                "low",
                null,
                "Mua sắm",
                List.of("1 lít tiệt trùng", "Có đường")
        );

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(projectRepository.findByUserIdAndModeTypeAndName(1L, "standard", "Mua sắm"))
                .thenReturn(Optional.empty());

        Project newProject = Project.builder()
                .id(20L)
                .user(sampleUser)
                .name("Mua sắm")
                .modeType("standard")
                .build();
        when(projectRepository.save(any(Project.class))).thenReturn(newProject);
        when(taskRepository.save(any(Task.class))).thenReturn(sampleTask);

        taskService.createTask(1L, request);

        verify(projectRepository).save(any(Project.class));
        verify(taskRepository).save(any(Task.class));
    }

    @Test
    @DisplayName("TC-STD-02: Lấy danh sách task kèm phân trang")
    void getTasks_Pagination_Success() {
        Pageable pageable = PageRequest.of(0, 10, Sort.by("createdAt").descending());
        Page<Task> page = new PageImpl<>(List.of(sampleTask), pageable, 1);

        when(taskRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(page);

        TaskSummaryDTO summary = new TaskSummaryDTO(
                101L, "Đóng tiền điện", "Hạn chót ngày 15", "high", "todo",
                sampleTask.getDueDate(), false, "Cá nhân", 0, 0, false, null, Instant.now(), Instant.now()
        );
        when(taskMapper.toSummaryDto(sampleTask)).thenReturn(summary);

        PageResponse<TaskSummaryDTO> response = taskService.getTasks(
                1L, "standard", "Cá nhân", null, null, null, pageable);

        assertNotNull(response);
        assertEquals(1, response.getContent().size());
        assertEquals("Đóng tiền điện", response.getContent().get(0).title());
    }

    @Test
    @DisplayName("TC-STD-03: Lấy chi tiết task theo ID thành công")
    void getTaskById_Success() {
        when(taskRepository.findByIdAndUserId(101L, 1L)).thenReturn(Optional.of(sampleTask));

        TaskDetailDTO detailDto = new TaskDetailDTO(
                101L, "Đóng tiền điện", "Hạn chót ngày 15", "high", "todo",
                sampleTask.getDueDate(), false, "Cá nhân", false, null, 1, null, null,
                Collections.emptyList(), Instant.now(), Instant.now()
        );
        when(taskMapper.toDetailDto(sampleTask)).thenReturn(detailDto);

        TaskDetailDTO result = taskService.getTaskById(1L, 101L);

        assertNotNull(result);
        assertEquals(101L, result.id());
        assertEquals("Đóng tiền điện", result.title());
    }

    @Test
    @DisplayName("Cập nhật danh mục công việc sang danh mục khác")
    void updateTask_CategoryChange_Success() {
        when(taskRepository.findByIdAndUserId(101L, 1L)).thenReturn(Optional.of(sampleTask));
        when(projectRepository.findByUserIdAndModeTypeAndName(1L, "standard", "Công việc"))
                .thenReturn(Optional.empty());

        Project workProject = Project.builder()
                .id(30L)
                .user(sampleUser)
                .name("Công việc")
                .modeType("standard")
                .build();
        when(projectRepository.save(any(Project.class))).thenReturn(workProject);
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TaskDetailDTO expectedDetail = new TaskDetailDTO(
                101L, "Đóng tiền điện", "Hạn chót ngày 15", "high", "todo",
                sampleTask.getDueDate(), false, "Công việc", false, null, 1, null, null,
                Collections.emptyList(), Instant.now(), Instant.now()
        );
        when(taskMapper.toDetailDto(any(Task.class))).thenReturn(expectedDetail);

        UpdateTaskRequestDTO req = new UpdateTaskRequestDTO(
                "Đóng tiền điện",
                "Hạn chót ngày 15",
                "high",
                sampleTask.getDueDate(),
                "Công việc"
        );

        TaskDetailDTO result = taskService.updateTask(1L, 101L, req);

        assertNotNull(result);
        assertEquals("Công việc", result.categoryName());
        assertEquals("Công việc", sampleTask.getProject().getName());
    }

    @Test
    @DisplayName("TC-STD-07: Truy cập task không tồn tại hoặc của user khác sẽ ném TASK_NOT_FOUND")
    void getTaskById_NotFound_ThrowsException() {
        when(taskRepository.findByIdAndUserId(999L, 1L)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> taskService.getTaskById(1L, 999L));
        assertEquals(ErrorCode.TASK_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    @DisplayName("TC-STD-04: Cập nhật trạng thái sang 'done'")
    void updateTaskStatus_Success() {
        when(taskRepository.findByIdAndUserId(101L, 1L)).thenReturn(Optional.of(sampleTask));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TaskSummaryDTO doneDto = new TaskSummaryDTO(
                101L, "Đóng tiền điện", "Hạn chót ngày 15", "high", "done",
                sampleTask.getDueDate(), false, "Cá nhân", 0, 0, false, null, Instant.now(), Instant.now()
        );
        when(taskMapper.toSummaryDto(any(Task.class))).thenReturn(doneDto);

        TaskSummaryDTO result = taskService.updateTaskStatus(1L, 101L, new UpdateTaskStatusDTO("done"));

        assertNotNull(result);
        assertEquals("done", result.status());
        assertEquals("done", sampleTask.getStatus());
        verify(recurringTaskService).generateNextOccurrenceIfRecurring(sampleTask);
    }

    @Test
    @DisplayName("TC-STD-06: Xóa task cha thành công")
    void deleteTask_Success() {
        when(taskRepository.findByIdAndUserId(101L, 1L)).thenReturn(Optional.of(sampleTask));

        taskService.deleteTask(1L, 101L);

        verify(taskRepository, times(1)).delete(sampleTask);
    }
}

