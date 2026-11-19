package com.dylask.modules.task.service;

import com.dylask.modules.project.entity.Project;
import com.dylask.modules.task.dto.response.MyDayResponseDTO;
import com.dylask.modules.task.dto.response.ToggleMyDayResponseDTO;
import com.dylask.modules.task.entity.Task;
import com.dylask.modules.task.repository.TaskRepository;
import com.dylask.modules.task.service.impl.TaskMyDayServiceImpl;
import com.dylask.modules.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Kiểm thử đơn vị cho {@link TaskMyDayServiceImpl}.
 * Bao phủ TC-POMO-01, TC-POMO-02, TC-POMO-03 theo đặc tả FEAT-STD-03.
 */
@ExtendWith(MockitoExtension.class)
class TaskMyDayServiceTest {

    @Mock
    private TaskRepository taskRepository;

    private TaskMyDayService taskMyDayService;

    private User sampleUser;
    private Project sampleProject;
    private LocalDate today;

    @BeforeEach
    void setUp() {
        taskMyDayService = new TaskMyDayServiceImpl(taskRepository);
        today = LocalDate.of(2026, 10, 12);
        sampleUser = User.builder().id(1L).email("myday@dylask.com").fullName("MyDay User").build();
        sampleProject = Project.builder().id(10L).user(sampleUser).name("Cá nhân").modeType("standard").build();
    }

    @Test
    @DisplayName("TC-POMO-01: Thêm task vào My Day gán isMyDay=true và myDayDate=today")
    void toggleMyDay_Add_Success() {
        Task task = Task.builder().id(101L).user(sampleUser).project(sampleProject).title("Viết spec").build();
        when(taskRepository.findByIdAndUserId(101L, 1L)).thenReturn(Optional.of(task));
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        ToggleMyDayResponseDTO res = taskMyDayService.toggleMyDay(1L, 101L, true, today);

        assertTrue(res.isMyDay());
        assertEquals(today, res.myDayDate());
    }

    @Test
    @DisplayName("TC-POMO-02: Gỡ task khỏi My Day đặt isMyDay=false và myDayDate=null")
    void toggleMyDay_Remove_Success() {
        Task task = Task.builder()
                .id(101L).user(sampleUser).project(sampleProject).title("Viết spec")
                .isMyDay(true).myDayDate(today).build();
        when(taskRepository.findByIdAndUserId(101L, 1L)).thenReturn(Optional.of(task));
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        ToggleMyDayResponseDTO res = taskMyDayService.toggleMyDay(1L, 101L, false, today);

        assertFalse(res.isMyDay());
        assertNull(res.myDayDate());
    }

    @Test
    @DisplayName("TC-POMO-03: Clean Slate - Task từ hôm qua không nằm trong My Day hôm nay mà chuyển sang Gợi ý")
    void getMyDay_CleanSlateAndSmartSuggestions() {
        Task todayTask = Task.builder()
                .id(101L).user(sampleUser).project(sampleProject).title("Họp sáng")
                .status("todo").priority("high").isMyDay(true).myDayDate(today)
                .pomodoroSessionsCompleted(1).pomodoroTotalMinutes(25)
                .build();

        Task yesterdayTask = Task.builder()
                .id(102L).user(sampleUser).project(sampleProject).title("Việc hôm qua chưa xong")
                .status("todo").priority("medium").isMyDay(true).myDayDate(today.minusDays(1))
                .build();

        Task dueTodayTask = Task.builder()
                .id(103L).user(sampleUser).project(sampleProject).title("Nộp báo cáo")
                .status("todo").priority("medium")
                .dueDate(today.atTime(15, 0).toInstant(ZoneOffset.UTC))
                .build();

        when(taskRepository.findByUserIdAndIsMyDayTrueAndMyDayDateOrderByCreatedAtDesc(1L, today))
                .thenReturn(List.of(todayTask));
        when(taskRepository.findByUserIdAndStatusOrderByDueDateAsc(1L, "todo"))
                .thenReturn(List.of(todayTask, yesterdayTask, dueTodayTask));

        MyDayResponseDTO response = taskMyDayService.getMyDay(1L, today);

        assertEquals(today, response.date());
        assertEquals(1, response.tasks().size());
        assertEquals(101L, response.tasks().getFirst().id());

        assertEquals(2, response.suggestions().size());
        assertEquals("Chưa xong từ hôm qua", response.suggestions().get(0).reason());
        assertEquals("Hạn chót là hôm nay", response.suggestions().get(1).reason());
    }
}
