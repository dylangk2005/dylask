# DDL Cheatsheet Chuẩn Cho MySQL 8.4 (Dylask Web)

Mọi file migration trong `dylask-backend/src/main/resources/db/migration/` phải tuân thủ chuẩn DDL dưới đây.

---

## 1. Mẫu Tạo Bảng Nghiệp Vụ Chuẩn (Table Template)

```sql
CREATE TABLE tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    sprint_id BIGINT NULL,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'todo',
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    story_points INT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    due_date TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Khóa ngoại (Đặt tên fk_<table>_<target_table>)
    CONSTRAINT fk_tasks_projects FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_tasks_sprints FOREIGN KEY (sprint_id) REFERENCES sprints(id) ON DELETE SET NULL,
    CONSTRAINT fk_tasks_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Chỉ mục (Đặt tên idx_<table>_<cols>)
    INDEX idx_tasks_project_id_status (project_id, status),
    INDEX idx_tasks_user_id (user_id),
    INDEX idx_tasks_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 2. Các Bảng Cốt Lõi Hệ Thống Theo Spec

### Bảng `users`
```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    avatar_url VARCHAR(500) NULL,
    default_mode VARCHAR(20) NOT NULL DEFAULT 'standard', -- 'standard' hoặc 'developer'
    is_ai_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    ai_trial_count INT NOT NULL DEFAULT 0,
    ai_trial_limit INT NOT NULL DEFAULT 10,
    ai_provider VARCHAR(50) NULL,
    ai_api_key_encrypted TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT uk_users_email UNIQUE (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Bảng `refresh_tokens`
```sql
CREATE TABLE refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_refresh_tokens_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_refresh_tokens_token_hash UNIQUE (token_hash),
    INDEX idx_refresh_tokens_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Bảng `projects` & `sprints`
```sql
CREATE TABLE projects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    mode_type VARCHAR(20) NOT NULL DEFAULT 'standard',
    git_repo_url VARCHAR(500) NULL,
    is_ai_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_projects_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_projects_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sprints (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    goal TEXT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'planning', -- 'planning', 'active', 'completed'
    start_date TIMESTAMP NULL,
    end_date TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_sprints_projects FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_sprints_project_id_status (project_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 3. Mẫu Cập Nhật Bảng (ALTER TABLE) An Toàn

### Thêm cột mới:
```sql
ALTER TABLE tasks 
    ADD COLUMN estimated_hours DECIMAL(5, 2) NULL AFTER story_points,
    ADD COLUMN actual_hours DECIMAL(5, 2) NULL AFTER estimated_hours;
```

### Thêm index mới:
```sql
ALTER TABLE tasks 
    ADD INDEX idx_tasks_status_due_date (status, due_date);
```

### Sửa kiểu cột:
```sql
ALTER TABLE users 
    MODIFY COLUMN full_name VARCHAR(200) NOT NULL;
```
