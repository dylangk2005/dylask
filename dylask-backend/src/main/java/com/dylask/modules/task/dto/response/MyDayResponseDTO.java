package com.dylask.modules.task.dto.response;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO tổng hợp dữ liệu màn hình Kế hoạch hôm nay (My Day) và Ngăn gợi ý thông minh.
 */
public record MyDayResponseDTO(
        LocalDate date,
        List<MyDayTaskDTO> tasks,
        List<MyDaySuggestionDTO> suggestions
) {
}
