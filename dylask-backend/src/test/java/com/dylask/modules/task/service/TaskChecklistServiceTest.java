package com.dylask.modules.task.service;

import com.dylask.common.exception.AppException;
import com.dylask.common.exception.ErrorCode;
import com.dylask.modules.project.entity.Project;
import com.dylask.modules.task.dto.request.CreateChecklistRequestDTO;
import com.dylask.modules.task.dto.request.UpdateChecklistRequestDTO;
import com.dylask.modules.task.dto.response.ChecklistItemDTO;
import com.dylask.modules.task.entity.Task;
import com.dylask.modules.task.entity.TaskChecklist;
import com.dylask.modules.task.mapper.TaskChecklistMapper;
import com.dylask.modules.task.repository.TaskChecklistRepository;
import com.dylask.modules.task.repository.TaskRepository;
import com.dylask.modules.task.service.impl.TaskChecklistServiceImpl;
import com.dylask.modules.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Kiểm thử đơn vị cho {@link TaskChecklistServiceImpl}.
 */
@ExtendWith(MockitoExtension.class)
class TaskChecklistServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private TaskChecklistRepository checklistRepository;

    @Mock
    private TaskChecklistMapper checklistMapper;

    private TaskChecklistService checklistService;

    private Task sampleTask;
    private TaskChecklist sampleChecklist;

    @BeforeEach
    void setUp() {
        checklistService = new TaskChecklistServiceImpl(taskRepository, checklistRepository, checklistMapper);

        User sampleUser = User.builder().id(1L).email("user@test.com").build();
        Project sampleProject = Project.builder().id(10L).user(sampleUser).name("Cá nhân").build();

        sampleTask = Task.builder()
                .id(101L)
                .user(sampleUser)
                .project(sampleProject)
                .title("Đóng tiền điện")
                .status("todo")
                .build();

        sampleChecklist = TaskChecklist.builder()
                .id(501L)
                .task(sampleTask)
                .title("Kiểm tra tin nhắn SMS")
                .isCompleted(false)
                .position(0)
                .build();
    }

    @Test
    @DisplayName("TC-STD-05: Thêm checklist con vào task thành công")
    void addChecklist_Success() {
        CreateChecklistRequestDTO req = new CreateChecklistRequestDTO("Lấy mã khách hàng");

        when(taskRepository.findByIdAndUserId(101L, 1L)).thenReturn(Optional.of(sampleTask));
        when(checklistRepository.countByTaskId(101L)).thenReturn(1);
        when(checklistRepository.save(any(TaskChecklist.class))).thenAnswer(inv -> {
            TaskChecklist tc = inv.getArgument(0);
            tc.setId(502L);
            return tc;
        });

        ChecklistItemDTO dto = new ChecklistItemDTO(502L, "Lấy mã khách hàng", false, 1, Instant.now());
        when(checklistMapper.toDto(any(TaskChecklist.class))).thenReturn(dto);

        ChecklistItemDTO result = checklistService.addChecklist(1L, 101L, req);

        assertNotNull(result);
        assertEquals(502L, result.id());
        assertEquals("Lấy mã khách hàng", result.title());
        assertFalse(result.isCompleted());
    }

    @Test
    @DisplayName("Thêm checklist vượt quá 50 mục ném VALIDATION_FAILED")
    void addChecklist_LimitExceeded_ThrowsException() {
        CreateChecklistRequestDTO req = new CreateChecklistRequestDTO("Mục thứ 51");

        when(taskRepository.findByIdAndUserId(101L, 1L)).thenReturn(Optional.of(sampleTask));
        when(checklistRepository.countByTaskId(101L)).thenReturn(50);

        AppException ex = assertThrows(AppException.class, () -> checklistService.addChecklist(1L, 101L, req));
        assertEquals(ErrorCode.VALIDATION_FAILED, ex.getErrorCode());
    }

    @Test
    @DisplayName("Toggle trạng thái checklist con đảo ngược isCompleted")
    void toggleChecklist_Success() {
        when(taskRepository.findByIdAndUserId(101L, 1L)).thenReturn(Optional.of(sampleTask));
        when(checklistRepository.findByIdAndTaskId(501L, 101L)).thenReturn(Optional.of(sampleChecklist));
        when(checklistRepository.save(sampleChecklist)).thenReturn(sampleChecklist);

        ChecklistItemDTO toggledDto = new ChecklistItemDTO(501L, "Kiểm tra tin nhắn SMS", true, 0, Instant.now());
        when(checklistMapper.toDto(sampleChecklist)).thenReturn(toggledDto);

        ChecklistItemDTO result = checklistService.toggleChecklist(1L, 101L, 501L);

        assertTrue(result.isCompleted());
        assertTrue(sampleChecklist.getIsCompleted());
    }

    @Test
    @DisplayName("Cập nhật thông tin checklist con")
    void updateChecklist_Success() {
        UpdateChecklistRequestDTO req = new UpdateChecklistRequestDTO("Tiêu đề mới", true, 2);

        when(taskRepository.findByIdAndUserId(101L, 1L)).thenReturn(Optional.of(sampleTask));
        when(checklistRepository.findByIdAndTaskId(501L, 101L)).thenReturn(Optional.of(sampleChecklist));
        when(checklistRepository.save(sampleChecklist)).thenReturn(sampleChecklist);

        ChecklistItemDTO updatedDto = new ChecklistItemDTO(501L, "Tiêu đề mới", true, 2, Instant.now());
        when(checklistMapper.toDto(sampleChecklist)).thenReturn(updatedDto);

        ChecklistItemDTO result = checklistService.updateChecklist(1L, 101L, 501L, req);

        assertEquals("Tiêu đề mới", result.title());
        assertTrue(result.isCompleted());
        assertEquals(2, result.position());
    }

    @Test
    @DisplayName("Xóa checklist con thành công")
    void deleteChecklist_Success() {
        when(taskRepository.findByIdAndUserId(101L, 1L)).thenReturn(Optional.of(sampleTask));
        when(checklistRepository.findByIdAndTaskId(501L, 101L)).thenReturn(Optional.of(sampleChecklist));

        checklistService.deleteChecklist(1L, 101L, 501L);

        verify(checklistRepository).delete(sampleChecklist);
    }
}

