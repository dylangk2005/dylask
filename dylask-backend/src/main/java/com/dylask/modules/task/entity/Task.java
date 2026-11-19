package com.dylask.modules.task.entity;

import com.dylask.common.entity.BaseAuditEntity;
import com.dylask.modules.project.entity.Project;
import com.dylask.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Thực thể công việc (Task).
 * Quản lý thông tin công việc trong cả Standard Mode và Developer Mode.
 */
@Entity
@Table(name = "tasks", indexes = {
    @Index(name = "idx_tasks_user_status", columnList = "user_id, status"),
    @Index(name = "idx_tasks_user_due_date", columnList = "user_id, due_date"),
    @Index(name = "idx_tasks_project_id", columnList = "project_id"),
    @Index(name = "idx_tasks_recurring", columnList = "user_id, recurring_pattern")
})
@Getter
@Setter
public class Task extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "sprint_id")
    private Long sprintId;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "status", nullable = false, length = 50)
    private String status = "todo";

    @Column(name = "priority", nullable = false, length = 20)
    private String priority = "medium";

    @Column(name = "due_date")
    private Instant dueDate;

    @Column(name = "is_my_day", nullable = false)
    private Boolean isMyDay = false;

    @Column(name = "estimated_hours", precision = 5, scale = 2)
    private BigDecimal estimatedHours;

    @Column(name = "actual_hours", precision = 5, scale = 2)
    private BigDecimal actualHours;

    @Column(name = "story_points")
    private Integer storyPoints;

    @Column(name = "git_branch_name", length = 255)
    private String gitBranchName;

    @Column(name = "recurring_pattern", length = 30)
    private String recurringPattern;

    @Column(name = "recurring_interval", nullable = false)
    private Integer recurringInterval = 1;

    @Column(name = "recurring_until")
    private Instant recurringUntil;

    @Column(name = "parent_task_id")
    private Long parentTaskId;

    @Column(name = "reminder_minutes_before")
    private Integer reminderMinutesBefore;

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC, id ASC")
    private List<TaskChecklist> checklists = new ArrayList<>();

    public Task() {
    }

    public Task(Long id, User user, Project project, Long sprintId, String title,
                String description, String status, String priority, Instant dueDate,
                Boolean isMyDay, BigDecimal estimatedHours, BigDecimal actualHours,
                Integer storyPoints, String gitBranchName,
                String recurringPattern, Integer recurringInterval, Instant recurringUntil,
                Long parentTaskId, Integer reminderMinutesBefore) {
        this.id = id;
        this.user = user;
        this.project = project;
        this.sprintId = sprintId;
        this.title = title;
        this.description = description;
        this.status = status != null ? status : "todo";
        this.priority = priority != null ? priority : "medium";
        this.dueDate = dueDate;
        this.isMyDay = isMyDay != null ? isMyDay : false;
        this.estimatedHours = estimatedHours;
        this.actualHours = actualHours;
        this.storyPoints = storyPoints;
        this.gitBranchName = gitBranchName;
        this.recurringPattern = recurringPattern;
        this.recurringInterval = recurringInterval != null ? recurringInterval : 1;
        this.recurringUntil = recurringUntil;
        this.parentTaskId = parentTaskId;
        this.reminderMinutesBefore = reminderMinutesBefore;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private User user;
        private Project project;
        private Long sprintId;
        private String title;
        private String description;
        private String status = "todo";
        private String priority = "medium";
        private Instant dueDate;
        private Boolean isMyDay = false;
        private BigDecimal estimatedHours;
        private BigDecimal actualHours;
        private Integer storyPoints;
        private String gitBranchName;
        private String recurringPattern;
        private Integer recurringInterval = 1;
        private Instant recurringUntil;
        private Long parentTaskId;
        private Integer reminderMinutesBefore;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder user(User user) {
            this.user = user;
            return this;
        }

        public Builder project(Project project) {
            this.project = project;
            return this;
        }

        public Builder sprintId(Long sprintId) {
            this.sprintId = sprintId;
            return this;
        }

        public Builder title(String title) {
            this.title = title;
            return this;
        }

        public Builder description(String description) {
            this.description = description;
            return this;
        }

        public Builder status(String status) {
            this.status = status;
            return this;
        }

        public Builder priority(String priority) {
            this.priority = priority;
            return this;
        }

        public Builder dueDate(Instant dueDate) {
            this.dueDate = dueDate;
            return this;
        }

        public Builder isMyDay(Boolean isMyDay) {
            this.isMyDay = isMyDay;
            return this;
        }

        public Builder estimatedHours(BigDecimal estimatedHours) {
            this.estimatedHours = estimatedHours;
            return this;
        }

        public Builder actualHours(BigDecimal actualHours) {
            this.actualHours = actualHours;
            return this;
        }

        public Builder storyPoints(Integer storyPoints) {
            this.storyPoints = storyPoints;
            return this;
        }

        public Builder gitBranchName(String gitBranchName) {
            this.gitBranchName = gitBranchName;
            return this;
        }

        public Builder recurringPattern(String recurringPattern) {
            this.recurringPattern = recurringPattern;
            return this;
        }

        public Builder recurringInterval(Integer recurringInterval) {
            this.recurringInterval = recurringInterval;
            return this;
        }

        public Builder recurringUntil(Instant recurringUntil) {
            this.recurringUntil = recurringUntil;
            return this;
        }

        public Builder parentTaskId(Long parentTaskId) {
            this.parentTaskId = parentTaskId;
            return this;
        }

        public Builder reminderMinutesBefore(Integer reminderMinutesBefore) {
            this.reminderMinutesBefore = reminderMinutesBefore;
            return this;
        }

        public Task build() {
            return new Task(id, user, project, sprintId, title, description, status, priority, dueDate,
                    isMyDay, estimatedHours, actualHours, storyPoints, gitBranchName,
                    recurringPattern, recurringInterval, recurringUntil, parentTaskId, reminderMinutesBefore);
        }
    }
}

