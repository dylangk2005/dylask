package com.dylask.modules.analytics.personal.service.impl;

import com.dylask.modules.analytics.personal.dto.CategoryShareDTO;
import com.dylask.modules.analytics.personal.dto.DailyProductivityTrendDTO;
import com.dylask.modules.analytics.personal.dto.PersonalAnalyticsOverviewResponse;
import com.dylask.modules.analytics.personal.dto.PersonalAnalyticsOverviewResponse.DateRangeDTO;
import com.dylask.modules.analytics.personal.dto.PersonalAnalyticsOverviewResponse.PeakFocusHoursDTO;
import com.dylask.modules.analytics.personal.dto.PersonalAnalyticsOverviewResponse.PersonalKpiDTO;
import com.dylask.modules.analytics.personal.service.PersonalAnalyticsService;
import com.dylask.modules.project.entity.Project;
import com.dylask.modules.task.entity.PomodoroLog;
import com.dylask.modules.task.entity.Task;
import com.dylask.modules.task.repository.PomodoroLogRepository;
import com.dylask.modules.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.*;

/**
 * Hiện thực dịch vụ Thống kê & Phân tích Năng suất Cá nhân (Personal Analytics).
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PersonalAnalyticsServiceImpl implements PersonalAnalyticsService {

    private static final ZoneId USER_ZONE = ZoneOffset.ofHours(7);
    private static final List<String> CATEGORY_PALETTE = List.of(
            "#0F766E", "#2563EB", "#D97706", "#7C3AED", "#DC2626", "#059669"
    );

    private final TaskRepository taskRepository;
    private final PomodoroLogRepository pomodoroLogRepository;

    @Override
    public PersonalAnalyticsOverviewResponse getOverview(Long userId, String rangeType, LocalDate today) {
        LocalDate effectiveToday = today != null ? today : LocalDate.now(USER_ZONE);
        String normalizedRange = normalizeRange(rangeType);

        // 1. Xác định khoảng thời gian [startDate, endDate] theo múi giờ UTC+7
        int daysBack = switch (normalizedRange) {
            case "month" -> 29;
            case "year" -> 364;
            default -> 6;
        };
        LocalDate startLocalDate = effectiveToday.minusDays(daysBack);
        Instant startInstant = startLocalDate.atStartOfDay(USER_ZONE).toInstant();
        Instant endInstant = effectiveToday.plusDays(1).atStartOfDay(USER_ZONE).minusNanos(1).toInstant();

        // 2. Truy vấn dữ liệu của đúng userId (đảm bảo cô lập dữ liệu người dùng)
        List<Task> allUserTasks = taskRepository.findByUserId(userId);
        List<PomodoroLog> allPomoLogs = pomodoroLogRepository.findByUserIdOrderByCompletedAtDesc(userId);

        // 3. Lọc các task và log nằm trong khoảng thời gian thống kê
        List<Task> tasksInRange = allUserTasks.stream()
                .filter(t -> isWithin(t.getCreatedAt(), startInstant, endInstant))
                .toList();

        List<PomodoroLog> logsInRange = allPomoLogs.stream()
                .filter(l -> isWithin(l.getCompletedAt(), startInstant, endInstant))
                .toList();

        // 4. Tính toán các chỉ số KPI
        long totalCreated = tasksInRange.size();
        long totalCompleted = tasksInRange.stream()
                .filter(t -> "done".equalsIgnoreCase(t.getStatus()))
                .count();
        long overdueTasks = allUserTasks.stream()
                .filter(t -> !"done".equalsIgnoreCase(t.getStatus())
                        && t.getDueDate() != null
                        && t.getDueDate().isBefore(endInstant)
                        && t.getDueDate().isBefore(Instant.now()))
                .count();
        double completionRate = totalCreated == 0
                ? 0.0
                : Math.round((totalCompleted * 100.0 / totalCreated) * 10.0) / 10.0;

        long pomodoroSessions = logsInRange.size();
        long totalFocusMinutes = logsInRange.stream()
                .mapToLong(l -> l.getDurationMinutes() != null ? l.getDurationMinutes() : 25)
                .sum();
        double totalFocusHours = Math.round((totalFocusMinutes / 60.0) * 10.0) / 10.0;

        // 5. Tính toán Streak (Chuỗi ngày liên tiếp hiện tại & Kỷ lục)
        StreakResult streak = calculateStreaks(allUserTasks, allPomoLogs, effectiveToday);

        PersonalKpiDTO kpis = new PersonalKpiDTO(
                totalCreated,
                totalCompleted,
                overdueTasks,
                completionRate,
                streak.current(),
                streak.longest(),
                totalFocusMinutes,
                totalFocusHours,
                pomodoroSessions
        );

        // 6. Tính xu hướng theo ngày (Daily Trend) - tối đa 7 ngày gần nhất hoặc 14 điểm gần nhất cho chart
        LocalDate trendStart = "week".equals(normalizedRange)
                ? startLocalDate
                : effectiveToday.minusDays(Math.min(daysBack, 13));
        List<DailyProductivityTrendDTO> dailyTrend = buildDailyTrend(
                trendStart, effectiveToday, allUserTasks, allPomoLogs);

        // 7. Phân bổ theo danh mục (Category Breakdown)
        List<CategoryShareDTO> categoryBreakdown = buildCategoryBreakdown(tasksInRange);

        // 8. Khung giờ tập trung cao nhất (Peak Focus Hours)
        PeakFocusHoursDTO peakFocusHours = resolvePeakFocusHours(logsInRange);

        return new PersonalAnalyticsOverviewResponse(
                new DateRangeDTO(startInstant, endInstant, normalizedRange),
                kpis,
                dailyTrend,
                categoryBreakdown,
                peakFocusHours
        );
    }

    private StreakResult calculateStreaks(
            List<Task> allTasks, List<PomodoroLog> allLogs, LocalDate today) {

        Set<LocalDate> activeDays = new HashSet<>();
        for (Task task : allTasks) {
            if ("done".equalsIgnoreCase(task.getStatus())) {
                Instant completedTs = task.getCompletedAt() != null ? task.getCompletedAt() : task.getUpdatedAt();
                if (completedTs != null) {
                    activeDays.add(completedTs.atZone(USER_ZONE).toLocalDate());
                }
            }
        }
        for (PomodoroLog log : allLogs) {
            if (log.getCompletedAt() != null) {
                activeDays.add(log.getCompletedAt().atZone(USER_ZONE).toLocalDate());
            }
        }

        if (activeDays.isEmpty()) {
            return new StreakResult(0, 0);
        }

        // Current Streak: quét từ hôm nay; nếu hôm nay chưa xong task nào thì giữ chuỗi từ hôm qua (TC-ANL-STD-04)
        LocalDate cursor = activeDays.contains(today) ? today : today.minusDays(1);
        int currentStreak = 0;
        while (activeDays.contains(cursor)) {
            currentStreak++;
            cursor = cursor.minusDays(1);
        }

        // Longest Streak: quét toàn bộ tập ngày đã sắp xếp
        List<LocalDate> sortedDays = activeDays.stream().sorted().toList();
        int longest = 1;
        int run = 1;
        for (int i = 1; i < sortedDays.size(); i++) {
            if (sortedDays.get(i).equals(sortedDays.get(i - 1).plusDays(1))) {
                run++;
                if (run > longest) {
                    longest = run;
                }
            } else {
                run = 1;
            }
        }

        return new StreakResult(currentStreak, Math.max(longest, currentStreak));
    }

    private List<DailyProductivityTrendDTO> buildDailyTrend(
            LocalDate startDate, LocalDate endDate, List<Task> allTasks, List<PomodoroLog> allLogs) {

        Map<LocalDate, Long> createdByDay = new HashMap<>();
        Map<LocalDate, Long> completedByDay = new HashMap<>();
        Map<LocalDate, Long> pomoMinutesByDay = new HashMap<>();

        for (Task t : allTasks) {
            if (t.getCreatedAt() != null) {
                LocalDate d = t.getCreatedAt().atZone(USER_ZONE).toLocalDate();
                createdByDay.merge(d, 1L, Long::sum);
            }
            if ("done".equalsIgnoreCase(t.getStatus())) {
                Instant ts = t.getCompletedAt() != null ? t.getCompletedAt() : t.getUpdatedAt();
                if (ts != null) {
                    LocalDate d = ts.atZone(USER_ZONE).toLocalDate();
                    completedByDay.merge(d, 1L, Long::sum);
                }
            }
        }

        for (PomodoroLog log : allLogs) {
            if (log.getCompletedAt() != null) {
                LocalDate d = log.getCompletedAt().atZone(USER_ZONE).toLocalDate();
                long mins = log.getDurationMinutes() != null ? log.getDurationMinutes() : 25L;
                pomoMinutesByDay.merge(d, mins, Long::sum);
            }
        }

        List<DailyProductivityTrendDTO> trend = new ArrayList<>();
        LocalDate cursor = startDate;
        while (!cursor.isAfter(endDate)) {
            trend.add(new DailyProductivityTrendDTO(
                    cursor,
                    toVietnameseDayOfWeek(cursor.getDayOfWeek()),
                    createdByDay.getOrDefault(cursor, 0L),
                    completedByDay.getOrDefault(cursor, 0L),
                    pomoMinutesByDay.getOrDefault(cursor, 0L)
            ));
            cursor = cursor.plusDays(1);
        }
        return trend;
    }

    private List<CategoryShareDTO> buildCategoryBreakdown(List<Task> tasksInRange) {
        if (tasksInRange.isEmpty()) {
            return List.of();
        }

        Map<Long, CategoryAccumulator> grouped = new LinkedHashMap<>();
        for (Task task : tasksInRange) {
            Project project = task.getProject();
            Long catId = project != null ? project.getId() : 0L;
            String catName = (project != null && project.getName() != null && !project.getName().isBlank())
                    ? project.getName()
                    : "Chưa phân loại";
            grouped.computeIfAbsent(catId, id -> new CategoryAccumulator(id, catName)).count++;
        }

        long total = tasksInRange.size();
        List<CategoryAccumulator> sorted = grouped.values().stream()
                .sorted((a, b) -> Long.compare(b.count, a.count))
                .toList();

        List<CategoryShareDTO> result = new ArrayList<>();
        double runningPct = 0.0;
        for (int i = 0; i < sorted.size(); i++) {
            CategoryAccumulator acc = sorted.get(i);
            double pct;
            if (i == sorted.size() - 1) {
                pct = Math.max(0.0, Math.round((100.0 - runningPct) * 10.0) / 10.0);
            } else {
                pct = Math.round((acc.count * 100.0 / total) * 10.0) / 10.0;
                runningPct += pct;
            }
            String color = acc.id == 0L
                    ? "#6B6A63"
                    : CATEGORY_PALETTE.get(i % CATEGORY_PALETTE.size());
            result.add(new CategoryShareDTO(acc.id, acc.name, color, acc.count, pct));
        }
        return result;
    }

    private PeakFocusHoursDTO resolvePeakFocusHours(List<PomodoroLog> logsInRange) {
        if (logsInRange.isEmpty()) {
            return new PeakFocusHoursDTO(
                    "Chưa có dữ liệu",
                    "Hoàn thành phiên Pomodoro để khám phá khung giờ vàng của bạn"
            );
        }

        // Nhóm theo từng block 2 giờ (00-02, 02-04, ..., 22-24)
        int[] bucketCounts = new int[12];
        for (PomodoroLog log : logsInRange) {
            int hour = log.getCompletedAt().atZone(USER_ZONE).getHour();
            bucketCounts[hour / 2]++;
        }

        int bestBucket = 0;
        for (int i = 1; i < bucketCounts.length; i++) {
            if (bucketCounts[i] > bucketCounts[bestBucket]) {
                bestBucket = i;
            }
        }

        int startHour = bestBucket * 2;
        int endHour = startHour + 2;
        String slot = String.format("%02d:00 - %02d:00", startHour, endHour);
        String periodDesc = startHour < 12
                ? "Bạn đạt độ tập trung cao nhất vào buổi sáng"
                : (startHour < 18
                ? "Bạn đạt độ tập trung cao nhất vào buổi chiều"
                : "Bạn đạt độ tập trung cao nhất vào buổi tối");

        return new PeakFocusHoursDTO(slot, periodDesc);
    }

    private boolean isWithin(Instant target, Instant start, Instant end) {
        return target != null && !target.isBefore(start) && !target.isAfter(end);
    }

    private String normalizeRange(String rangeType) {
        if (rangeType == null) return "week";
        return switch (rangeType.trim().toLowerCase()) {
            case "month", "year" -> rangeType.trim().toLowerCase();
            default -> "week";
        };
    }

    private String toVietnameseDayOfWeek(DayOfWeek dow) {
        return switch (dow) {
            case MONDAY -> "Thứ 2";
            case TUESDAY -> "Thứ 3";
            case WEDNESDAY -> "Thứ 4";
            case THURSDAY -> "Thứ 5";
            case FRIDAY -> "Thứ 6";
            case SATURDAY -> "Thứ 7";
            case SUNDAY -> "Chủ nhật";
        };
    }

    private record StreakResult(int current, int longest) {
    }

    private static class CategoryAccumulator {
        final Long id;
        final String name;
        long count = 0;

        CategoryAccumulator(Long id, String name) {
            this.id = id;
            this.name = name;
        }
    }
}
