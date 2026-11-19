package com.dylask.modules.task.dto.response;

import java.time.Instant;

/**
 * DTO phản hồi cấu hình lặp lại định kỳ của một công việc.
 */
public record RecurringConfigDTO(
        Long id,
        String recurringPattern,
        Integer recurringInterval,
        Instant recurringUntil,
        Integer reminderMinutesBefore
) {
}
