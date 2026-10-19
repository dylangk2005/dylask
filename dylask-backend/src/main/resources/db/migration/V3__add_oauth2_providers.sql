-- ==============================================================================
-- Migration V3: Bổ sung hỗ trợ Đăng nhập Mạng Xã Hội (OAuth2 Google & GitHub)
-- Đặc tả kỹ thuật: FEAT-AUTH-03
-- ==============================================================================

-- 1. Cho phép password_hash mang giá trị NULL đối với người dùng đăng nhập bằng OAuth2
ALTER TABLE users MODIFY COLUMN password_hash VARCHAR(255) NULL;

-- 2. Thêm cột định danh nhà cung cấp xác thực (local, google, github)
ALTER TABLE users ADD COLUMN auth_provider VARCHAR(20) NOT NULL DEFAULT 'local' AFTER email;

-- 3. Thêm cột provider_id (ID duy nhất từ Google hoặc GitHub)
ALTER TABLE users ADD COLUMN provider_id VARCHAR(100) NULL AFTER auth_provider;

-- 4. Ràng buộc duy nhất trên cặp (auth_provider, provider_id) để tránh trùng lặp
ALTER TABLE users ADD CONSTRAINT uq_users_provider UNIQUE (auth_provider, provider_id);

-- 5. Đánh index tìm kiếm nhanh theo nhà cung cấp xác thực
CREATE INDEX idx_users_provider ON users(auth_provider);
