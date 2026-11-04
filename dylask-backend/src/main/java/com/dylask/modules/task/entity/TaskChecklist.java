package com.dylask.modules.task.entity;

import com.dylask.common.entity.BaseAuditEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * Thực thể đầu việc con / danh sách kiểm tra (Checklist Item) thuộc về một Task chính.
 */
@Entity
@Table(name = "task_checklists", indexes = {
    @Index(name = "idx_task_checklists_task_id", columnList = "task_id, position")
})
@Getter
@Setter
public class TaskChecklist extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "is_completed", nullable = false)
    private Boolean isCompleted = false;

    @Column(name = "position", nullable = false)
    private Integer position = 0;

    public TaskChecklist() {
    }

    public TaskChecklist(Long id, Task task, String title, Boolean isCompleted, Integer position) {
        this.id = id;
        this.task = task;
        this.title = title;
        this.isCompleted = isCompleted != null ? isCompleted : false;
        this.position = position != null ? position : 0;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private Task task;
        private String title;
        private Boolean isCompleted = false;
        private Integer position = 0;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder task(Task task) {
            this.task = task;
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

        public Builder position(Integer position) {
            this.position = position;
            return this;
        }

        public TaskChecklist build() {
            return new TaskChecklist(id, task, title, isCompleted, position);
        }
    }
}

