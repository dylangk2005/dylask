-- ==============================================================================
-- Flyway Migration V6: Add My Day Date & Pomodoro Tracking Columns to Tasks
-- Feature: FEAT-STD-03 (My Day & Pomodoro Timer)
-- ==============================================================================

ALTER TABLE tasks
    ADD COLUMN my_day_date DATE NULL COMMENT 'Ngày đưa vào My Day',
    ADD COLUMN pomodoro_sessions_completed INT NOT NULL DEFAULT 0 COMMENT 'Số chu kỳ Pomodoro 25p đã hoàn thành',
    ADD COLUMN pomodoro_total_minutes INT NOT NULL DEFAULT 0 COMMENT 'Tổng số phút làm việc Pomodoro';

CREATE INDEX idx_tasks_my_day ON tasks(user_id, my_day_date, is_my_day);
