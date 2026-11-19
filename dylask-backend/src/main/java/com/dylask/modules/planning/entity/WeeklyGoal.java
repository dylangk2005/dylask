package com.dylask.modules.planning.entity;

import com.dylask.common.entity.BaseAuditEntity;
import com.dylask.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * Thực thể mục tiêu trọng tâm tuần (WeeklyGoal).
 */
@Entity
@Table(name = "weekly_goals", indexes = {
    @Index(name = "idx_weekly_goals_user_week", columnList = "user_id, year, week_number")
})
@Getter
@Setter
public class WeeklyGoal extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "week_number", nullable = false)
    private Integer weekNumber;

    @Column(name = "year", nullable = false)
    private Integer year;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "is_completed", nullable = false)
    private Boolean isCompleted = false;

    public WeeklyGoal() {
    }

    public WeeklyGoal(Long id, User user, Integer weekNumber, Integer year, String title, Boolean isCompleted) {
        this.id = id;
        this.user = user;
        this.weekNumber = weekNumber;
        this.year = year;
        this.title = title;
        this.isCompleted = isCompleted != null ? isCompleted : false;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private User user;
        private Integer weekNumber;
        private Integer year;
        private String title;
        private Boolean isCompleted = false;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder user(User user) {
            this.user = user;
            return this;
        }

        public Builder weekNumber(Integer weekNumber) {
            this.weekNumber = weekNumber;
            return this;
        }

        public Builder year(Integer year) {
            this.year = year;
            return this;
        }

        public Builder title(String title) {
            this.title = title;
            return this;
        }

        public Builder isCompleted(Boolean isCompleted) {
            this.isCompleted = isCompleted;
            return this;
        }

        public WeeklyGoal build() {
            return new WeeklyGoal(id, user, weekNumber, year, title, isCompleted);
        }
    }
}
