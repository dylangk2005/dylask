package com.dylask.modules.planning.service;

import com.dylask.modules.planning.dto.request.CreateWeeklyGoalRequestDTO;
import com.dylask.modules.planning.dto.response.OverdueTasksResponseDTO;
import com.dylask.modules.planning.dto.response.PlanningTaskDTO;
import com.dylask.modules.planning.dto.response.UpcomingDaysResponseDTO;
import com.dylask.modules.planning.dto.response.WeeklyGoalDTO;
import com.dylask.modules.planning.dto.response.WeeklyPlanningResponseDTO;
import com.dylask.modules.planning.entity.WeeklyGoal;
import com.dylask.modules.planning.repository.WeeklyGoalRepository;
import com.dylask.modules.planning.service.impl.PlanningServiceImpl;
import com.dylask.modules.project.entity.Project;
import com.dylask.modules.task.entity.Task;
import com.dylask.modules.task.repository.TaskRepository;
import com.dylask.modules.user.entity.User;
import com.dylask.modules.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Kiểm thử đơn vị cho {@link PlanningServiceImpl} (FEAT-STD-05).
 */
@ExtendWith(MockitoExtension.class)
class PlanningServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private WeeklyGoalRepository weeklyGoalRepository;

    @Mock
    private UserRepository userRepository;

    private PlanningService planningService;
    private User user;
    private Project project;
    private LocalDate today;

    @BeforeEach
    void setUp() {
        planningService = new PlanningServiceImpl(taskRepository, weeklyGoalRepository, userRepository);
        today = LocalDate.of(2026, 10, 14); // Thứ Tư, tuần 42
        user = User.builder().id(1L).email("plan@dylask.com").build();
        project = Project.builder().id(10L).user(user).name("Cá nhân").build();
    }

    @Test
    @DisplayName("Lấy kế hoạch tuần phân tách đúng Unscheduled và 7 ngày trong tuần")
    void getWeeklyPlanning_Success() {
        Task inbox = Task.builder().id(1L).user(user).project(project).title("Inbox task").status("todo").build();
        Task wednesday = Task.builder().id(2L).user(user).project(project).title("Họp thứ 4")
                .status("todo").scheduledDate(today).build();

        when(taskRepository.findByUserId(1L)).thenReturn(List.of(inbox, wednesday));
        when(weeklyGoalRepository.findByUserIdAndYearAndWeekNumberOrderByIdAsc(1L, 2026, 42))
                .thenReturn(List.of());

        WeeklyPlanningResponseDTO res = planningService.getWeeklyPlanning(1L, 42, 2026, today);

        assertEquals(7, res.scheduledByDay().size());
        assertEquals(1, res.unscheduledTasks().size());
        assertEquals(1, res.scheduledByDay().get(today).size());
    }

    @Test
    @DisplayName("Lọc Upcoming 7 ngày tới chỉ lấy ngày mai đến +7 ngày")
    void getUpcoming7Days_FiltersCorrectWindow() {
        Task tomorrow = Task.builder().id(1L).user(user).project(project).title("Ngày mai")
                .status("todo").scheduledDate(today.plusDays(1)).build();
        Task todayTask = Task.builder().id(2L).user(user).project(project).title("Hôm nay")
                .status("todo").scheduledDate(today).build();

        when(taskRepository.findByUserId(1L)).thenReturn(List.of(tomorrow, todayTask));

        UpcomingDaysResponseDTO res = planningService.getUpcoming7Days(1L, today);

        assertEquals(7, res.days().size());
        assertEquals(1, res.days().getFirst().tasks().size());
        assertTrue(res.days().getFirst().label().startsWith("Ngày mai"));
    }

    @Test
    @DisplayName("Lọc Overdue phân nhóm Trễ nghiêm trọng (>= 3 ngày) và Trễ 1-2 ngày")
    void getOverdueTasks_GroupsBySeverity() {
        Task severe = Task.builder().id(1L).user(user).project(project).title("Trễ 4 ngày")
                .status("todo").scheduledDate(today.minusDays(4)).build();
        Task recent = Task.builder().id(2L).user(user).project(project).title("Trễ 1 ngày")
                .status("todo").scheduledDate(today.minusDays(1)).build();

        when(taskRepository.findByUserId(1L)).thenReturn(List.of(severe, recent));

        OverdueTasksResponseDTO res = planningService.getOverdueTasks(1L, today);

        assertEquals(2, res.totalOverdue());
        assertEquals(1, res.severeOverdue().size());
        assertEquals(1, res.recentOverdue().size());
    }

    @Test
    @DisplayName("Dời lịch hàng loạt cập nhật scheduledDate và dueDate")
    void bulkReschedule_UpdatesAllTasks() {
        Task t1 = Task.builder().id(1L).user(user).project(project).title("Việc 1").status("todo").build();
        Task t2 = Task.builder().id(2L).user(user).project(project).title("Việc 2").status("todo").build();

        when(taskRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(t1));
        when(taskRepository.findByIdAndUserId(2L, 1L)).thenReturn(Optional.of(t2));
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        List<PlanningTaskDTO> res = planningService.bulkReschedule(1L, List.of(1L, 2L), today);

        assertEquals(2, res.size());
        assertEquals(today, t1.getScheduledDate());
        assertEquals(today, t2.getScheduledDate());
        assertNotNull(t1.getDueDate());
    }

    @Test
    @DisplayName("Tạo và toggle hoàn thành mục tiêu tuần")
    void createAndToggleWeeklyGoal_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(weeklyGoalRepository.save(any(WeeklyGoal.class))).thenAnswer(inv -> {
            WeeklyGoal g = inv.getArgument(0);
            if (g.getId() == null) g.setId(50L);
            return g;
        });

        WeeklyGoalDTO created = planningService.createWeeklyGoal(
                1L, new CreateWeeklyGoalRequestDTO("Tập gym 3 buổi", 42, 2026), today);
        assertFalse(created.isCompleted());

        WeeklyGoal stored = WeeklyGoal.builder().id(50L).user(user).weekNumber(42).year(2026)
                .title("Tập gym 3 buổi").isCompleted(false).build();
        when(weeklyGoalRepository.findByIdAndUserId(50L, 1L)).thenReturn(Optional.of(stored));

        WeeklyGoalDTO toggled = planningService.toggleWeeklyGoal(1L, 50L);
        assertTrue(toggled.isCompleted());
    }
}
