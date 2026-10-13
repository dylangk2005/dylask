---
name: flyway-db-migration
description: >-
  Use this skill when creating Flyway database migrations, modifying MySQL 8.4 database schema,
  designing JPA entities, or verifying database constraints and audit columns for Dylask.
---

# Quy Trình Thiết Kế CSDL & Flyway Migration (MySQL 8.4 LTS)

Hệ thống **Dylask** sử dụng **MySQL 8.4 LTS** kết hợp với **Flyway Migration** và **Spring Data JPA / Hibernate 6.x**. Mọi thay đổi về cấu trúc bảng đều phải được quản lý chặt chẽ thông qua các file migration SQL bất biến.

---

## 📚 Tài Liệu Tham Khảo Kỹ Thuật (References)
- [DDL Cheatsheet & Core Tables](./references/ddl-cheatsheet.md): Cú pháp chuẩn tạo bảng, ràng buộc FK, index và các bảng cốt lõi (`users`, `tasks`, `projects`...).
- [MySQL & JPA Entity Mapping Rules](./references/mysql-jpa-rules.md): Quy tắc ánh xạ kiểu dữ liệu MySQL sang Java JPA.

---

## 📌 Nguyên Tắc Bắt Buộc (Critical Rules)

1. **Quy tắc Bất Biến (Immutability Rule):**
   - Tuyệt đối **KHÔNG SỬA ĐỔI** file migration đã được commit hoặc đã áp dụng (`FlywayChecksumException`).
   - Mọi thay đổi đều phải tạo file migration kế tiếp (`V{n+1}__...`).
2. **Cấm DDL tự động bằng Hibernate:**
   - Trong `application.yaml`, `spring.jpa.hibernate.ddl-auto: validate`. Không dùng `update` hay `create-drop`.
3. **Storage Engine & Charset:**
   - Luôn kết thúc lệnh `CREATE TABLE` bằng:
     ```sql
     ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
     ```
4. **Audit Columns bắt buộc trên mọi bảng nghiệp vụ:**
   ```sql
   created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   ```

---

## ✅ Checklist Tạo File Migration Mới

- [ ] **Bước 1 - Sinh file:** Chạy script tạo template migration tự động:
  ```powershell
  powershell -ExecutionPolicy Bypass -File .agents/skills/flyway-db-migration/scripts/new-migration.ps1 -Description "create_tasks_table"
  ```
- [ ] **Bước 2 - Đặt tên:** Kiểm tra file sinh ra theo đúng định dạng `V{version}__{description}.sql` (chú ý: 2 dấu gạch dưới `__`).
- [ ] **Bước 3 - Viết DDL:**
  - Tên bảng: danh từ số nhiều, `snake_case`.
  - Khóa chính: `id BIGINT AUTO_INCREMENT PRIMARY KEY`.
  - Khóa ngoại: `<tên_bảng_số_ít>_id` kèm `CONSTRAINT fk_<table>_<target_table>`.
  - Cột boolean: tiền tố `is_` hoặc `has_` (kiểu `BOOLEAN` / `TINYINT(1)`).
  - Có đủ 2 cột `created_at`, `updated_at`.
- [ ] **Bước 4 - Xác minh cú pháp:** Chạy `./mvnw flyway:info` hoặc khởi động ứng dụng để kiểm tra Flyway apply thành công.
- [ ] **Bước 5 - Tạo/Cập nhật JPA Entity:** Tạo Entity tương ứng tuân thủ [mysql-jpa-rules.md](./references/mysql-jpa-rules.md).

---

## ⚠️ Xử Lý Sự Cố Thường Gặp (Troubleshooting)

- **Lỗi `Validate failed: Migrations have failed validation` (Checksum Mismatch):**
  - Nguyên nhân: File migration đã được sửa đổi sau khi đã chạy vào DB.
  - Khắc phục: Không sửa file cũ! Rollback thay đổi ở file cũ và tạo file `V{next}__fix_...sql` mới. Trong môi trường local dev nếu cần reset sạch CSDL Docker: `docker compose down -v && docker compose up -d`.
- **Lỗi `Foreign key constraint is incorrectly formed`:**
  - Kiểm tra xem bảng đích đã tồn tại chưa (thứ tự migration), và kiểu dữ liệu của cột FK có khớp chính xác `BIGINT` với `id` của bảng đích hay không.
