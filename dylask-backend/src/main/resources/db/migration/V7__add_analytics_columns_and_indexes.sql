-- ==============================================================================
-- Flyway Migration V7: Add Analytics Columns, Pomodoro Logs & Performance Indexes
-- Feature: FEAT-STD-04 (Personal Productivity Analytics)
-- ==============================================================================

ALTER TABLE tasks
    ADD COLUMN completed_at TIMESTAMP NULL COMMENT 'Thời điểm hoàn thành công việc';

UPDATE tasks
SET completed_at = updated_at
WHERE status = 'done' AND completed_at IS NULL;

CREATE INDEX idx_tasks_user_completed_at ON tasks(user_id, completed_at, status);
CREATE INDEX idx_tasks_user_created_at ON tasks(user_id, created_at);

CREATE TABLE pomodoro_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    task_id BIGINT NULL,
    duration_minutes INT NOT NULL DEFAULT 25,
    completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_pomodoro_logs_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_pomodoro_logs_tasks FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
    INDEX idx_pomodoro_logs_user_completed (user_id, completed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
