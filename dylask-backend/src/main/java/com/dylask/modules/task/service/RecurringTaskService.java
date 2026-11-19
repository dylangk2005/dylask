package com.dylask.modules.task.service;

import com.dylask.modules.task.dto.request.SetRecurringRequestDTO;
import com.dylask.modules.task.dto.response.CalendarTaskDTO;
import com.dylask.modules.task.dto.response.RecurringConfigDTO;
import com.dylask.modules.task.entity.Task;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Interface dịch vụ quản lý Lịch trình (Calendar View) và Công việc lặp lại (Recurring Tasks).
 */
public interface RecurringTaskService {

    /**
     * Lấy danh sách công việc trong khoảng thời gian hiển thị trên lịch.
     *
     * @param userId    ID người dùng
     * @param startDate Mốc bắt đầu
     * @param endDate   Mốc kết thúc
     * @return Danh sách thẻ công việc trên lịch
     */
    List<CalendarTaskDTO> getCalendarTasks(Long userId, Instant startDate, Instant endDate);

    /**
     * Cấu hình hoặc cập nhật quy tắc lặp lại định kỳ cho công việc.
     *
     * @param userId  ID người dùng sở hữu
     * @param taskId  ID công việc
     * @param request Cấu hình lặp lại
     * @return Cấu hình lặp lại sau khi lưu
     */
    RecurringConfigDTO setRecurring(Long userId, Long taskId, SetRecurringRequestDTO request);

    /**
     * Hủy bỏ quy tắc lặp lại của công việc.
     *
     * @param userId ID người dùng sở hữu
     * @param taskId ID công việc
     * @return Cấu hình lặp lại với pattern = null
     */
    RecurringConfigDTO clearRecurring(Long userId, Long taskId);

    /**
     * Nhân bản công việc cho chu kỳ kế tiếp nếu công việc vừa hoàn thành có cấu hình lặp lại.
     *
     * @param completedTask Công việc vừa được đánh dấu hoàn thành
     * @return Optional chứa công việc mới được sinh ra, hoặc empty nếu không lặp hoặc đã quá hạn recurringUntil
     */
    Optional<Task> generateNextOccurrenceIfRecurring(Task completedTask);
}
