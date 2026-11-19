package com.dylask.modules.task.entity;

import com.dylask.common.entity.BaseAuditEntity;
import com.dylask.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

/**
 * Thực thể nhật ký phiên tập trung Pomodoro (pomodoro_logs).
 * Ghi nhận thời điểm hoàn thành từng phiên 25 phút phục vụ thống kê Streak & Khung giờ vàng.
 */
@Entity
@Table(name = "pomodoro_logs", indexes = {
    @Index(name = "idx_pomodoro_logs_user_completed", columnList = "user_id, completed_at")
})
@Getter
@Setter
public class PomodoroLog extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    private Task task;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes = 25;

    @Column(name = "completed_at", nullable = false)
    private Instant completedAt;

    public PomodoroLog() {
    }

    public PomodoroLog(Long id, User user, Task task, Integer durationMinutes, Instant completedAt) {
        this.id = id;
        this.user = user;
        this.task = task;
        this.durationMinutes = durationMinutes != null ? durationMinutes : 25;
        this.completedAt = completedAt != null ? completedAt : Instant.now();
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private User user;
        private Task task;
        private Integer durationMinutes = 25;
        private Instant completedAt;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder user(User user) {
            this.user = user;
            return this;
        }

        public Builder task(Task task) {
            this.task = task;
            return this;
        }

        public Builder durationMinutes(Integer durationMinutes) {
            this.durationMinutes = durationMinutes;
            return this;
        }

        public Builder completedAt(Instant completedAt) {
            this.completedAt = completedAt;
            return this;
        }

        public PomodoroLog build() {
            return new PomodoroLog(id, user, task, durationMinutes, completedAt);
        }
    }
}
