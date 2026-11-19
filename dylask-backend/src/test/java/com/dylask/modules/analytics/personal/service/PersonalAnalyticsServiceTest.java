package com.dylask.modules.analytics.personal.service;

import com.dylask.modules.analytics.personal.dto.PersonalAnalyticsOverviewResponse;
import com.dylask.modules.analytics.personal.service.impl.PersonalAnalyticsServiceImpl;
import com.dylask.modules.project.entity.Project;
import com.dylask.modules.task.entity.PomodoroLog;
import com.dylask.modules.task.entity.Task;
import com.dylask.modules.task.repository.PomodoroLogRepository;
import com.dylask.modules.task.repository.TaskRepository;
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

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Kiểm thử đơn vị cho {@link PersonalAnalyticsServiceImpl}.
 * Bao phủ ma trận kiểm thử TC-ANL-STD-01 đến TC-ANL-STD-06 theo đặc tả FEAT-STD-04.
 */
@ExtendWith(MockitoExtension.class)
class PersonalAnalyticsServiceTest {

    private static final ZoneOffset ZONE_VN = ZoneOffset.ofHours(7);

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private PomodoroLogRepository pomodoroLogRepository;

    private PersonalAnalyticsService analyticsService;
    private User userA;
    private Project workProject;
    private LocalDate today;

    @BeforeEach
    void setUp() {
        analyticsService = new PersonalAnalyticsServiceImpl(taskRepository, pomodoroLogRepository);
        today = LocalDate.of(2026, 10, 12);
        userA = User.builder().id(1L).email("usera@dylask.com").build();
        workProject = Project.builder().id(10L).user(userA).name("Công việc").modeType("standard").build();
    }

    @Test
    @DisplayName("TC-ANL-STD-01: Lấy thống kê tuần đầy đủ 7 ngày và tổng tỷ lệ danh mục = 100%")
    void getOverview_Week_ReturnsFullTrendAndCategorySum100() {
        Task t1 = Task.builder().id(1L).user(userA).project(workProject).title("Task 1")
                .status("done").completedAt(today.atTime(10, 0).toInstant(ZONE_VN)).build();
        t1.setCreatedAt(today.atTime(8, 0).toInstant(ZONE_VN));

        Task t2 = Task.builder().id(2L).user(userA).project(workProject).title("Task 2")
                .status("todo").build();
        t2.setCreatedAt(today.minusDays(1).atTime(9, 0).toInstant(ZONE_VN));

        PomodoroLog log = PomodoroLog.builder().id(100L).user(userA).task(t1)
                .durationMinutes(25).completedAt(today.atTime(9, 30).toInstant(ZONE_VN)).build();

        when(taskRepository.findByUserId(1L)).thenReturn(List.of(t1, t2));
        when(pomodoroLogRepository.findByUserIdOrderByCompletedAtDesc(1L)).thenReturn(List.of(log));

        PersonalAnalyticsOverviewResponse res = analyticsService.getOverview(1L, "week", today);

        assertEquals(7, res.dailyTrend().size());
        assertEquals(2, res.kpis().totalCreated());
        assertEquals(1, res.kpis().totalCompleted());
        assertEquals(50.0, res.kpis().completionRate());
        assertEquals(25, res.kpis().totalFocusMinutes());
        assertEquals("08:00 - 10:00", res.peakFocusHours().slot());

        double pctSum = res.categoryBreakdown().stream().mapToDouble(c -> c.percentage()).sum();
        assertEquals(100.0, pctSum, 0.1);
    }

    @Test
    @DisplayName("TC-ANL-STD-02: User mới chưa có task nào không lỗi chia cho 0")
    void getOverview_EmptyUser_ZeroDivisionSafe() {
        when(taskRepository.findByUserId(99L)).thenReturn(List.of());
        when(pomodoroLogRepository.findByUserIdOrderByCompletedAtDesc(99L)).thenReturn(List.of());

        PersonalAnalyticsOverviewResponse res = analyticsService.getOverview(99L, "week", today);

        assertEquals(0, res.kpis().totalCreated());
        assertEquals(0.0, res.kpis().completionRate());
        assertEquals(0, res.kpis().currentStreakDays());
        assertEquals(0, res.kpis().longestStreakDays());
        assertTrue(res.categoryBreakdown().isEmpty());
    }

    @Test
    @DisplayName("TC-ANL-STD-03: Streak bị đứt ở T-1 thì currentStreakDays = 1 khi hôm nay có task")
    void getOverview_BrokenStreakYesterday_ResetsCurrentStreakTo1() {
        Task tMinus2 = Task.builder().id(1L).user(userA).project(workProject).title("T-2")
                .status("done").completedAt(today.minusDays(2).atTime(10, 0).toInstant(ZONE_VN)).build();
        tMinus2.setCreatedAt(today.minusDays(2).atTime(8, 0).toInstant(ZONE_VN));

        Task tToday = Task.builder().id(2L).user(userA).project(workProject).title("Today")
                .status("done").completedAt(today.atTime(10, 0).toInstant(ZONE_VN)).build();
        tToday.setCreatedAt(today.atTime(8, 0).toInstant(ZONE_VN));

        when(taskRepository.findByUserId(1L)).thenReturn(List.of(tMinus2, tToday));
        when(pomodoroLogRepository.findByUserIdOrderByCompletedAtDesc(1L)).thenReturn(List.of());

        PersonalAnalyticsOverviewResponse res = analyticsService.getOverview(1L, "week", today);

        assertEquals(1, res.kpis().currentStreakDays());
        assertEquals(1, res.kpis().longestStreakDays());
    }

    @Test
    @DisplayName("TC-ANL-STD-04: Hôm nay chưa xong task nào nhưng hôm qua có -> vẫn giữ nguyên Streak")
    void getOverview_TodayNotDoneYet_PreservesYesterdayStreak() {
        Task tMinus1 = Task.builder().id(1L).user(userA).project(workProject).title("T-1")
                .status("done").completedAt(today.minusDays(1).atTime(14, 0).toInstant(ZONE_VN)).build();
        tMinus1.setCreatedAt(today.minusDays(1).atTime(8, 0).toInstant(ZONE_VN));

        Task tMinus2 = Task.builder().id(2L).user(userA).project(workProject).title("T-2")
                .status("done").completedAt(today.minusDays(2).atTime(14, 0).toInstant(ZONE_VN)).build();
        tMinus2.setCreatedAt(today.minusDays(2).atTime(8, 0).toInstant(ZONE_VN));

        when(taskRepository.findByUserId(1L)).thenReturn(List.of(tMinus1, tMinus2));
        when(pomodoroLogRepository.findByUserIdOrderByCompletedAtDesc(1L)).thenReturn(List.of());

        PersonalAnalyticsOverviewResponse res = analyticsService.getOverview(1L, "week", today);

        assertEquals(2, res.kpis().currentStreakDays());
        assertEquals(2, res.kpis().longestStreakDays());
    }

    @Test
    @DisplayName("TC-ANL-STD-05 & TC-ANL-STD-06: Task không có danh mục gom vào 'Chưa phân loại' và chỉ truy vấn đúng userId")
    void getOverview_UncategorizedAndUserIsolation() {
        Task uncategorized = Task.builder().id(10L).user(userA).project(null).title("Việc tự do")
                .status("todo").build();
        uncategorized.setCreatedAt(today.atTime(9, 0).toInstant(ZONE_VN));

        when(taskRepository.findByUserId(1L)).thenReturn(List.of(uncategorized));
        when(pomodoroLogRepository.findByUserIdOrderByCompletedAtDesc(1L)).thenReturn(List.of());

        PersonalAnalyticsOverviewResponse res = analyticsService.getOverview(1L, "week", today);

        verify(taskRepository).findByUserId(1L);
        verify(pomodoroLogRepository).findByUserIdOrderByCompletedAtDesc(1L);
        assertEquals(1, res.categoryBreakdown().size());
        assertEquals(0L, res.categoryBreakdown().getFirst().categoryId());
        assertEquals("Chưa phân loại", res.categoryBreakdown().getFirst().name());
    }
}
