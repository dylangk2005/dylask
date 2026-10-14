-- V2: Bổ sung xác thực email 2 bước khi đăng ký tài khoản (Email Verification OTP)

-- 1. Thêm cột is_verified vào bảng users
ALTER TABLE users 
ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT FALSE AFTER default_mode;

-- Cập nhật các tài khoản hiện có thành đã xác thực
UPDATE users SET is_verified = TRUE;

-- 2. Tạo bảng lưu trữ mã xác thực OTP email
CREATE TABLE IF NOT EXISTS email_verifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    otp_hash VARCHAR(64) NOT NULL,
    expires_at DATETIME NOT NULL,
    attempt_count INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_verif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_verif_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
