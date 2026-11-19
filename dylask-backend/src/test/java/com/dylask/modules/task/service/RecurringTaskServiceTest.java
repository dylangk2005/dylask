package com.dylask.modules.task.service;

import com.dylask.modules.project.entity.Project;
import com.dylask.modules.task.dto.request.SetRecurringRequestDTO;
import com.dylask.modules.task.dto.response.CalendarTaskDTO;
import com.dylask.modules.task.dto.response.RecurringConfigDTO;
import com.dylask.modules.task.entity.Task;
import com.dylask.modules.task.entity.TaskChecklist;
import com.dylask.modules.task.mapper.TaskMapper;
import com.dylask.modules.task.repository.TaskRepository;
import com.dylask.modules.task.service.impl.RecurringTaskServiceImpl;
import com.dylask.modules.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Kiểm thử đơn vị cho {@link RecurringTaskServiceImpl}.
 * Bao phủ ma trận kiểm thử TC-CAL-01 đến TC-CAL-06 theo đặc tả FEAT-STD-02.
 */
@ExtendWith(MockitoExtension.class)
class RecurringTaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private TaskMapper taskMapper;

    private RecurringTaskService recurringTaskService;

    private User sampleUser;
    private Project sampleProject;

    @BeforeEach
    void setUp() {
        recurringTaskService = new RecurringTaskServiceImpl(taskRepository, taskMapper);

        sampleUser = User.builder()
                .id(1L)
                .email("calendar@dylask.com")
                .fullName("Calendar User")
                .build();

        sampleProject = Project.builder()
                .id(10L)
                .user(sampleUser)
                .name("Cá nhân")
                .modeType("standard")
                .build();
    }

    @Test
    @DisplayName("TC-CAL-01: Lấy dữ liệu lịch tháng trả về danh sách CalendarTaskDTO")
    void getCalendarTasks_Success() {
        Instant start = Instant.parse("2026-10-01T00:00:00Z");
        Instant end = Instant.parse("2026-10-31T23:59:59Z");

        Task task = Task.builder()
                .id(105L)
                .user(sampleUser)
                .project(sampleProject)
                .title("Họp tổng kết tuần")
                .dueDate(Instant.parse("2026-10-16T09:00:00Z"))
                .priority("high")
                .status("todo")
                .recurringPattern("WEEKLY")
                .build();

        CalendarTaskDTO expectedDto = new CalendarTaskDTO(
                105L, "Họp tổng kết tuần", task.getDueDate(), "high", "todo", true, "WEEKLY", "Cá nhân"
        );

        when(taskRepository.findByUserIdAndDueDateBetweenOrderByDueDateAsc(1L, start, end))
                .thenReturn(List.of(task));
        when(taskMapper.toCalendarDto(task)).thenReturn(expectedDto);

        List<CalendarTaskDTO> result = recurringTaskService.getCalendarTasks(1L, start, end);

        assertEquals(1, result.size());
        assertEquals(105L, result.getFirst().id());
        assertTrue(result.getFirst().isRecurring());
    }

    @Test
    @DisplayName("TC-CAL-02: Hoàn thành task lặp DAILY tự động sinh task chu kỳ ngày kế tiếp")
    void generateNextOccurrence_Daily_CreatesNextTaskWithChecklists() {
        Task completedTask = Task.builder()
                .id(200L)
                .user(sampleUser)
                .project(sampleProject)
                .title("Tập thể dục")
                .priority("medium")
                .status("done")
                .dueDate(Instant.parse("2026-10-12T06:30:00Z"))
                .recurringPattern("DAILY")
                .recurringInterval(1)
                .reminderMinutesBefore(15)
                .build();

        TaskChecklist sub = TaskChecklist.builder()
                .id(1L)
                .task(completedTask)
                .title("Khởi động 10 phút")
                .isCompleted(true)
                .position(0)
                .build();
        completedTask.getChecklists().add(sub);

        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> {
            Task t = inv.getArgument(0);
            t.setId(201L);
            return t;
        });

        Optional<Task> nextOpt = recurringTaskService.generateNextOccurrenceIfRecurring(completedTask);

        assertTrue(nextOpt.isPresent());
        ArgumentCaptor<Task> captor = ArgumentCaptor.forClass(Task.class);
        verify(taskRepository).save(captor.capture());

        Task nextTask = captor.getValue();
        assertEquals("todo", nextTask.getStatus());
        assertEquals(Instant.parse("2026-10-13T06:30:00Z"), nextTask.getDueDate());
        assertEquals(200L, nextTask.getParentTaskId());
        assertEquals(1, nextTask.getChecklists().size());
        assertFalse(nextTask.getChecklists().getFirst().getIsCompleted());
    }

    @Test
    @DisplayName("TC-CAL-04: Quá hạn recurringUntil thì không sinh thêm task mới")
    void generateNextOccurrence_PastUntil_DoesNotCreateTask() {
        Task completedTask = Task.builder()
                .id(300L)
                .user(sampleUser)
                .project(sampleProject)
                .title("Uống thuốc")
                .status("done")
                .dueDate(Instant.parse("2026-10-15T08:00:00Z"))
                .recurringPattern("DAILY")
                .recurringInterval(1)
                .recurringUntil(Instant.parse("2026-10-15T23:59:59Z"))
                .build();

        Optional<Task> nextOpt = recurringTaskService.generateNextOccurrenceIfRecurring(completedTask);

        assertTrue(nextOpt.isEmpty());
        verify(taskRepository, never()).save(any(Task.class));
    }

    @Test
    @DisplayName("Cấu hình và hủy lặp lại (TC-CAL-05)")
    void setAndClearRecurring_Success() {
        Task task = Task.builder()
                .id(105L)
                .user(sampleUser)
                .project(sampleProject)
                .title("Review code")
                .dueDate(Instant.parse("2026-10-12T09:00:00Z"))
                .build();

        when(taskRepository.findByIdAndUserId(105L, 1L)).thenReturn(Optional.of(task));
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        SetRecurringRequestDTO req = new SetRecurringRequestDTO(
                "WEEKDAYS", 1, Instant.parse("2026-12-31T23:59:59Z"), 15
        );
        RecurringConfigDTO setRes = recurringTaskService.setRecurring(1L, 105L, req);
        assertEquals("WEEKDAYS", setRes.recurringPattern());
        assertEquals(15, setRes.reminderMinutesBefore());

        RecurringConfigDTO clearRes = recurringTaskService.clearRecurring(1L, 105L);
        assertNull(clearRes.recurringPattern());
        assertNull(clearRes.recurringUntil());
        assertNull(clearRes.reminderMinutesBefore());
    }
}
