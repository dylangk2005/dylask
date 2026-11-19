package com.dylask.modules.task.dto.response;

import java.time.LocalDate;

/**
 * DTO phản hồi sau khi cập nhật trạng thái My Day của một công việc.
 */
public record ToggleMyDayResponseDTO(
        Long id,
        Boolean isMyDay,
        LocalDate myDayDate
) {
}
