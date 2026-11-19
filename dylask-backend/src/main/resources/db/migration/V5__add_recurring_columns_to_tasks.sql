-- ==============================================================================
-- Flyway Migration V5: Add Recurring & Reminder Columns to Tasks Table
-- Feature: FEAT-STD-02 (Calendar View & Recurring Tasks)
-- ==============================================================================

ALTER TABLE tasks
    ADD COLUMN recurring_pattern VARCHAR(30) NULL COMMENT 'DAILY, WEEKDAYS, WEEKLY, MONTHLY',
    ADD COLUMN recurring_interval INT NOT NULL DEFAULT 1 COMMENT 'Khoảng cách lặp (mỗi N ngày/tuần/tháng)',
    ADD COLUMN recurring_until TIMESTAMP NULL COMMENT 'Thời điểm dừng lặp',
    ADD COLUMN parent_task_id BIGINT NULL COMMENT 'ID của task gốc ban đầu',
    ADD COLUMN reminder_minutes_before INT NULL COMMENT 'Nhắc trước bao nhiêu phút (15, 60, 1440)';

ALTER TABLE tasks
    ADD CONSTRAINT fk_tasks_parent_task
        FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE SET NULL;

CREATE INDEX idx_tasks_recurring ON tasks(user_id, recurring_pattern);
