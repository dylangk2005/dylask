package com.dylask.modules.task.service;

import com.dylask.modules.task.dto.response.MyDayResponseDTO;
import com.dylask.modules.task.dto.response.ToggleMyDayResponseDTO;

import java.time.LocalDate;

/**
 * Interface dịch vụ quản lý Kế hoạch hôm nay (My Day) theo nguyên tắc Clean Slate.
 */
public interface TaskMyDayService {

    /**
     * Lấy danh sách công việc trọng tâm hôm nay và danh sách gợi ý thông minh.
     *
     * @param userId ID người dùng
     * @param today  Ngày hiện tại
     * @return Dữ liệu My Day và Smart Suggestions
     */
    MyDayResponseDTO getMyDay(Long userId, LocalDate today);

    /**
     * Thêm hoặc gỡ một công việc khỏi Kế hoạch hôm nay.
     *
     * @param userId  ID người dùng sở hữu
     * @param taskId  ID công việc
     * @param isMyDay true để thêm vào hôm nay, false để gỡ bỏ
     * @param today   Ngày hiện tại
     * @return Trạng thái My Day sau khi cập nhật
     */
    ToggleMyDayResponseDTO toggleMyDay(Long userId, Long taskId, boolean isMyDay, LocalDate today);
}
