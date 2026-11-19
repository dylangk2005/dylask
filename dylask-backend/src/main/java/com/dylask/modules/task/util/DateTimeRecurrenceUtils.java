package com.dylask.modules.task.util;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;

/**
 * Tiện ích tính toán mốc thời gian lặp lại định kỳ (Recurring Tasks).
 * Đảm bảo xử lý chính xác các trường hợp biên như cuối tuần (WEEKDAYS) và cuối tháng (MONTHLY ngày 31).
 */
public final class DateTimeRecurrenceUtils {

    private DateTimeRecurrenceUtils() {
    }

    /**
     * Tính thời điểm đến hạn (dueDate) cho chu kỳ kế tiếp dựa trên quy tắc lặp lại.
     *
     * @param baseDueDate Mốc thời gian hiện tại (nếu null sẽ lấy thời điểm hiện tại)
     * @param pattern     Chu kỳ lặp: DAILY, WEEKDAYS, WEEKLY, MONTHLY
     * @param interval    Khoảng cách lặp (mặc định tối thiểu 1)
     * @return Thời điểm Instant của chu kỳ tiếp theo
     */
    public static Instant calculateNextDueDate(Instant baseDueDate, String pattern, int interval) {
        if (pattern == null || pattern.isBlank()) {
            throw new IllegalArgumentException("Chu kỳ lặp lại không được để trống");
        }

        int safeInterval = Math.max(1, interval);
        Instant anchor = baseDueDate != null ? baseDueDate : Instant.now();
        ZonedDateTime zdt = anchor.atZone(ZoneOffset.UTC);

        return switch (pattern.trim().toUpperCase()) {
            case "DAILY" -> zdt.plusDays(safeInterval).toInstant();
            case "WEEKDAYS" -> advanceWeekdays(zdt, safeInterval).toInstant();
            case "WEEKLY" -> zdt.plusWeeks(safeInterval).toInstant();
            // java.time ZonedDateTime.plusMonths tự động kẹp về ngày cuối tháng (ví dụ 31/01 -> 28/02 hoặc 29/02)
            case "MONTHLY" -> zdt.plusMonths(safeInterval).toInstant();
            default -> throw new IllegalArgumentException("Chu kỳ lặp lại không hợp lệ: " + pattern);
        };
    }

    /**
     * Cộng thêm N ngày làm việc (bỏ qua Thứ 7 và Chủ nhật).
     */
    private static ZonedDateTime advanceWeekdays(ZonedDateTime start, int weekdaySteps) {
        ZonedDateTime cursor = start;
        int remaining = weekdaySteps;
        while (remaining > 0) {
            cursor = cursor.plusDays(1);
            DayOfWeek dow = cursor.getDayOfWeek();
            if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY) {
                remaining--;
            }
        }
        return cursor;
    }
}
