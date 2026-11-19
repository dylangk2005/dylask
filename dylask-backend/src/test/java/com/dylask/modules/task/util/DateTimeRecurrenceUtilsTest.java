package com.dylask.modules.task.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

/**
 * Kiểm thử đơn vị cho {@link DateTimeRecurrenceUtils}.
 * Bao phủ các tình huống tính ngày lặp lại DAILY, WEEKDAYS, WEEKLY và MONTHLY cuối tháng.
 */
class DateTimeRecurrenceUtilsTest {

    @Test
    @DisplayName("TC-CAL-02: Tính ngày tiếp theo cho chu kỳ DAILY")
    void calculateNextDueDate_Daily() {
        Instant base = Instant.parse("2026-10-12T09:00:00Z");
        Instant next = DateTimeRecurrenceUtils.calculateNextDueDate(base, "DAILY", 1);
        assertEquals(Instant.parse("2026-10-13T09:00:00Z"), next);
    }

    @Test
    @DisplayName("TC-CAL-03: WEEKDAYS vào Thứ Sáu phải nhảy sang Thứ Hai tuần kế tiếp")
    void calculateNextDueDate_Weekdays_FridayToMonday() {
        // 2026-10-16 là Thứ Sáu
        Instant friday = Instant.parse("2026-10-16T09:00:00Z");
        Instant next = DateTimeRecurrenceUtils.calculateNextDueDate(friday, "WEEKDAYS", 1);
        // 2026-10-19 là Thứ Hai
        assertEquals(Instant.parse("2026-10-19T09:00:00Z"), next);
    }

    @Test
    @DisplayName("Tính ngày tiếp theo cho chu kỳ WEEKLY")
    void calculateNextDueDate_Weekly() {
        Instant base = Instant.parse("2026-10-12T09:00:00Z");
        Instant next = DateTimeRecurrenceUtils.calculateNextDueDate(base, "WEEKLY", 2);
        assertEquals(Instant.parse("2026-10-26T09:00:00Z"), next);
    }

    @Test
    @DisplayName("TC-CAL-06: MONTHLY ngày 31/01 sang tháng 2 không nhuận phải kẹp về 28/02")
    void calculateNextDueDate_Monthly_EndOfMonth_NonLeapYear() {
        Instant jan31 = Instant.parse("2026-01-31T10:00:00Z");
        Instant next = DateTimeRecurrenceUtils.calculateNextDueDate(jan31, "MONTHLY", 1);
        assertEquals(Instant.parse("2026-02-28T10:00:00Z"), next);
    }

    @Test
    @DisplayName("TC-CAL-06: MONTHLY ngày 31/01 sang tháng 2 năm nhuận phải kẹp về 29/02")
    void calculateNextDueDate_Monthly_EndOfMonth_LeapYear() {
        Instant jan31Leap = Instant.parse("2024-01-31T10:00:00Z");
        Instant next = DateTimeRecurrenceUtils.calculateNextDueDate(jan31Leap, "MONTHLY", 1);
        assertEquals(Instant.parse("2024-02-29T10:00:00Z"), next);
    }

    @Test
    @DisplayName("Ném ngoại lệ khi pattern không hợp lệ")
    void calculateNextDueDate_InvalidPattern_ThrowsException() {
        Instant base = Instant.parse("2026-10-12T09:00:00Z");
        assertThrows(IllegalArgumentException.class,
                () -> DateTimeRecurrenceUtils.calculateNextDueDate(base, "HOURLY", 1));
    }
}
