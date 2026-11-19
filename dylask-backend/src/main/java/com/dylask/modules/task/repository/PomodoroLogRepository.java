package com.dylask.modules.task.repository;

import com.dylask.modules.task.entity.PomodoroLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

/**
 * Repository truy vấn nhật ký các phiên tập trung Pomodoro.
 */
@Repository
public interface PomodoroLogRepository extends JpaRepository<PomodoroLog, Long> {

    /**
     * Lấy toàn bộ nhật ký Pomodoro của người dùng phục vụ tính Streak & Khung giờ vàng.
     */
    List<PomodoroLog> findByUserIdOrderByCompletedAtDesc(Long userId);

    /**
     * Lấy nhật ký Pomodoro của người dùng trong khoảng thời gian thống kê.
     */
    List<PomodoroLog> findByUserIdAndCompletedAtBetween(Long userId, Instant startDate, Instant endDate);
}
