-- ==============================================================================
-- Flyway Migration V8: Add Scheduled Date to Tasks & Create Weekly Goals Table
-- Feature: FEAT-STD-05 (Weekly Planning, Upcoming 7 Days & Overdue Views)
-- ==============================================================================

ALTER TABLE tasks
    ADD COLUMN scheduled_date DATE NULL COMMENT 'Ngày lên lịch thực hiện trong kế hoạch tuần';

CREATE INDEX idx_tasks_user_scheduled_date ON tasks(user_id, scheduled_date);

CREATE TABLE weekly_goals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    week_number INT NOT NULL,
    year INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_weekly_goals_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_weekly_goals_user_week (user_id, year, week_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
