# Đặc Tả Tiêu Chuẩn Cơ Sở Dữ Liệu Dylask (Database Specifications)

- **Phiên bản:** `1.0.0`
- **Hệ quản trị CSDL:** **MySQL 8.4 LTS** (Môi trường Docker Compose)
- **Công cụ di chuyển CSDL:** **Flyway Migration**
- **Ánh xạ thực thể:** **Spring Data JPA / Hibernate 6.x** (Java 25)

---

## 1. Cấu Hình & Tiêu Chuẩn Môi Trường

1. **Storage Engine:** Bắt buộc sử dụng `InnoDB` để đảm bảo tính toàn vẹn giao dịch (ACID), hỗ trợ khóa ngoại (Foreign Keys) và Row-level Locking.
2. **Bảng mã & Đối chiếu (Charset & Collation):**
   - `CHARACTER SET utf8mb4`
   - `COLLATE utf8mb4_unicode_ci`  
   *(Đảm bảo hiển thị chuẩn xác tiếng Việt có dấu, ký tự toán học, biểu tượng kỹ thuật và hỗ trợ tìm kiếm không phân biệt hoa thường/dấu).*
3. **Múi giờ máy chủ DB:** Mặc định cấu hình UTC (`+00:00`) để đồng bộ toàn bộ mốc thời gian hệ thống.

---

## 2. Quy Tắc Đặt Tên (Naming Conventions)

Mọi đối tượng trong cơ sở dữ liệu bắt buộc tuân theo định dạng chữ thường nối nhau bằng dấu gạch dưới (**`snake_case`**):

| Đối tượng | Quy tắc | Ví dụ chuẩn | Ví dụ không hợp lệ (Cấm) |
|---|---|---|---|
| **Bảng (Table)** | Danh từ số nhiều, `snake_case` | `users`, `tasks`, `task_checklists`, `audit_logs` | `User`, `tblTask`, `task_list` |
| **Cột (Column)** | Danh từ số ít, `snake_case` | `email`, `full_name`, `due_date`, `is_completed` | `fullName`, `DueDate`, `bCompleted` |
| **Khóa chính (PK)** | Luôn đặt tên là `id` | `id` (`BIGINT AUTO_INCREMENT PRIMARY KEY`) | `user_id`, `task_id` |
| **Khóa ngoại (FK)** | `<tên_bảng_số_ít>_id` | `user_id`, `project_id`, `task_id`, `sprint_id` | `fk_user`, `id_project` |
| **Ràng buộc FK** | `fk_<table>_<referenced_table>` | `fk_tasks_projects`, `fk_task_checklists_tasks` | `FK_1`, `task_fk` |
| **Chỉ mục thường** | `idx_<table>_<cột_1>_<cột_2>` | `idx_tasks_project_id_status`, `idx_tasks_due_date` | `index_task`, `tasks_idx` |
| **Chỉ mục duy nhất** | `uk_<table>_<cột>` | `uk_users_email`, `uk_projects_user_name` | `unique_email`, `uq_1` |
| **Cột Boolean** | Tiền tố `is_` hoặc `has_` | `is_completed`, `is_ai_enabled`, `has_custom_key` | `completed`, `active`, `ai_status` |

---

## 3. Các Cột Chuẩn Mực Hệ Thống (Audit Columns)

Mọi bảng nghiệp vụ trong hệ thống bắt buộc chứa hai cột theo dõi thời gian sau:

```sql
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

- Không cho phép cập nhật thủ công cột `created_at` sau khi bản ghi đã tạo.
- Hibernate Entity kế thừa từ lớp `BaseAuditEntity` (`@CreatedDate`, `@LastModifiedDate`).

---

## 4. Sơ Đồ Quan Hệ Dữ Liệu (ERD - Visual ASCII Diagram)

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│               SƠ ĐỒ QUAN HỆ BẢNG CƠ SỞ DỮ LIỆU DYLASK (DATABASE ERD)                    │
└────────────────────────────────────────────────────────────────────────────────────────┘

     ┌────────────────────────┐                    ┌────────────────────────┐
     │         users          │                    │     refresh_tokens     │
     ├────────────────────────┤ 1                * ├────────────────────────┤
     │ id (PK)                │───────────────────►│ id (PK)                │
     │ email (UK)             │                    │ user_id (FK)           │
     │ password_hash          │                    │ token_hash (UK)        │
     │ full_name              │                    │ expires_at             │
     │ default_mode           │                    │ is_revoked             │
     │ ai_enabled             │                    └────────────────────────┘
     │ ai_trial_count         │
     │ ai_trial_limit         │
     │ ai_provider / api_key  │
     └───────────┬────────────┘
                 │ 1
                 │
                 │ *
                 ▼
     ┌────────────────────────┐                    ┌────────────────────────┐
     │        projects        │ 1                * │        sprints         │
     ├────────────────────────┼───────────────────►├────────────────────────┤
     │ id (PK)                │                    │ id (PK)                │
     │ user_id (FK)           │                    │ project_id (FK)        │
     │ name                   │                    │ name                   │
     │ mode_type              │                    │ status (plan/active/done
     │ git_repo_url           │                    │ start_date / end_date  │
     │ is_ai_enabled          │                    └───────────┬────────────┘
     └───────────┬────────────┘                                │ 1
                 │ 1                                           │
                 │                                             │ *
                 │ *                                           ▼
                 ▼                                 ┌────────────────────────┐
     ┌─────────────────────────────────────────────┤         tasks          │
     │                                             ├────────────────────────┤
     │                                             │ id (PK)                │
     │                                             │ project_id (FK)        │
     │                                             │ sprint_id (FK - null)  │
     │                                             │ user_id (FK - assignee)│
     │                                             │ title / description    │
     │                                             │ status (todo/dev/done) │
     │                                             │ priority / due_date    │
     │                                             │ story_points           │
     │                                             │ git_branch_name        │
     │                                             └───────────┬────────────┘
     │                                                         │ 1
     │                                                         │
     │                           ┌─────────────────────────────┴─────────────────────────────┐
     │                           │ *                                                         │ *
     │                           ▼                                                           ▼
     │               ┌────────────────────────┐                                  ┌────────────────────────┐
     │               │    task_checklists     │                                  │       audit_logs       │
     │               ├────────────────────────┤                                  ├────────────────────────┤
     │               │ id (PK)                │                                  │ id (PK)                │
     │               │ task_id (FK)           │                                  │ task_id (FK)           │
     │               │ title                  │                                  │ user_id (FK)           │
     │               │ is_completed           │                                  │ action_type            │
     │               │ position               │                                  │ old_value / new_value  │
     │               └────────────────────────┘                                  └────────────────────────┘
```

### Bảng Ma Trận Quan Hệ Dữ Liệu (Relationship Matrix)

| Bảng nguồn | Quan hệ | Bảng đích | Khóa ngoại (FK) | Hành vi xóa (ON DELETE) |
|---|---|---|---|---|
| `users` | $1 \rightarrow N$ | `projects` | `projects.user_id` | `CASCADE` (Xóa user sẽ xóa các dự án của họ) |
| `users` | $1 \rightarrow N$ | `refresh_tokens` | `refresh_tokens.user_id` | `CASCADE` (Xóa user sẽ hủy toàn bộ phiên) |
| `projects` | $1 \rightarrow N$ | `sprints` | `sprints.project_id` | `CASCADE` (Xóa dự án sẽ xóa sprints) |
| `projects` | $1 \rightarrow N$ | `tasks` | `tasks.project_id` | `CASCADE` (Xóa dự án sẽ xóa tasks) |
| `sprints` | $1 \rightarrow N$ | `tasks` | `tasks.sprint_id` | `SET NULL` (Xóa sprint giữ lại task về Backlog) |
| `tasks` | $1 \rightarrow N$ | `task_checklists` | `task_checklists.task_id` | `CASCADE` (Xóa task sẽ xóa checklists con) |
| `tasks` | $1 \rightarrow N$ | `audit_logs` | `audit_logs.task_id` | `CASCADE` (Xóa task sẽ dọn dẹp log lịch sử) |

---

## 5. Quy Chuẩn Quản Lý Migration (Flyway)

1. **Vị trí file migration:**  
   `dylask-backend/src/main/resources/db/migration/`
2. **Quy tắc đặt tên file:**  
   `V{version}__{description}.sql` (Sử dụng 2 dấu gạch dưới giữa version và description).  
   *Ví dụ:*
   - `V1__create_users_table.sql`
   - `V2__create_refresh_tokens_table.sql`
   - `V3__create_projects_and_sprints_tables.sql`
   - `V4__create_tasks_and_checklists_tables.sql`
   - `V5__create_audit_logs_table.sql`
3. **Quy tắc bất biến (Immutability Rule):**
   - Tuyệt đối **KHÔNG SỬA ĐỔI** nội dung file migration đã được commit hoặc đã áp dụng trên bất kỳ môi trường nào (kể cả Local Dev của đồng đội).
   - Mọi thay đổi về cấu trúc bảng hoặc thêm cột phải tạo file migration kế tiếp (`V6__add_column_xyz.sql`).
4. **Cấm DDL tự động bằng Hibernate:**
   - Cấu hình bắt buộc trong `application.yml`:
     ```yaml
     spring:
       jpa:
         hibernate:
           ddl-auto: validate # Tuyệt đối không dùng update hay create-drop trong môi trường phát triển chính thức
     ```

---

## 6. Quy Ước Ánh Xạ JPA Entity (`dylask-backend`)

Để đảm bảo hiệu năng và tính ổn định của ứng dụng Spring Boot 4:

1. **Chiến lược sinh khóa chính:**
   ```java
   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   private Long id;
   ```
2. **Fetch Type:**
   - Mọi quan hệ `@ManyToOne` và `@OneToOne` **BẮT BUỘC** khai báo `fetch = FetchType.LAZY` (tránh Hibernate tự động sinh join không kiểm soát hoặc vấp phải lỗi N+1 Query).
   - Không sử dụng `FetchType.EAGER` dưới mọi hình thức.
3. **Quy tắc sử dụng Lombok trên JPA Entity:**
   - **ĐƯỢC DÙNG:** `@Getter`, `@Setter`, `@NoArgsConstructor`, `@AllArgsConstructor`, `@Builder`.
   - **NGHIÊM CẤM:** Không dùng `@Data` hoặc `@EqualsAndHashCode` mặc định trên Entity vì dễ dẫn đến vòng lặp vô hạn `StackOverflowError` trong quan hệ hai chiều và làm hỏng cơ chế dirty-checking của Hibernate Session.
4. **Kiểu dữ liệu thời gian:** Sử dụng `java.time.Instant` cho các trường UTC timestamp để đồng nhất với chuẩn ISO-8601 toàn hệ thống.
