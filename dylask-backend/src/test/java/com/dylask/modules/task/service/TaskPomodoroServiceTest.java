package com.dylask.modules.task.service;

import com.dylask.common.exception.AppException;
import com.dylask.common.exception.ErrorCode;
import com.dylask.modules.project.entity.Project;
import com.dylask.modules.task.dto.response.PomodoroSessionResultDTO;
import com.dylask.modules.task.entity.Task;
import com.dylask.modules.task.repository.PomodoroLogRepository;
import com.dylask.modules.task.repository.TaskRepository;
import com.dylask.modules.task.service.impl.TaskPomodoroServiceImpl;
import com.dylask.modules.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Kiểm thử đơn vị cho {@link TaskPomodoroServiceImpl}.
 * Bao phủ TC-POMO-04 theo đặc tả FEAT-STD-03.
 */
@ExtendWith(MockitoExtension.class)
class TaskPomodoroServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private PomodoroLogRepository pomodoroLogRepository;

    private TaskPomodoroService taskPomodoroService;

    @BeforeEach
    void setUp() {
        taskPomodoroService = new TaskPomodoroServiceImpl(taskRepository, pomodoroLogRepository);
    }

    @Test
    @DisplayName("TC-POMO-04: Hoàn thành 1 phiên Pomodoro tăng sessions +1 và minutes +25")
    void completePomodoroSession_IncrementsCounters() {
        User user = User.builder().id(1L).email("pomo@dylask.com").build();
        Project project = Project.builder().id(10L).user(user).name("Cá nhân").build();
        Task task = Task.builder()
                .id(101L).user(user).project(project).title("Code tính năng")
                .pomodoroSessionsCompleted(2).pomodoroTotalMinutes(50)
                .build();

        when(taskRepository.findByIdAndUserId(101L, 1L)).thenReturn(Optional.of(task));
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        PomodoroSessionResultDTO result = taskPomodoroService.completePomodoroSession(1L, 101L);

        assertEquals(101L, result.taskId());
        assertEquals(3, result.pomodoroSessionsCompleted());
        assertEquals(75, result.pomodoroTotalMinutes());
    }

    @Test
    @DisplayName("Ném TASK_NOT_FOUND nếu task không thuộc về user")
    void completePomodoroSession_NotFound_ThrowsException() {
        when(taskRepository.findByIdAndUserId(999L, 1L)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class,
                () -> taskPomodoroService.completePomodoroSession(1L, 999L));
        assertEquals(ErrorCode.TASK_NOT_FOUND, ex.getErrorCode());
    }
}
