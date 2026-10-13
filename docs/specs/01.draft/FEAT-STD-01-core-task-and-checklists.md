# Đặc Tả Kỹ Thuật Chi Tiết: FEAT-STD-01
## Quản Lý Công Việc Cá Nhân Cốt Lõi, Danh Mục & Danh Sách Kiểm Tra Con (Checklists)

- **Mã tính năng:** `FEAT-STD-01`
- **Phân hệ:** Standard Mode (Cá nhân hóa & Đời sống)
- **Trạng thái:** `01.draft` (Chờ người dùng review)
- **Độ ưu tiên:** `P1 (Critical - Tính năng cốt lõi Standard Mode)`

---

### 1. Mục Tiêu (User Story)

Là người dùng ở chế độ cá nhân (*Standard Mode*), tôi muốn tạo, chỉnh sửa, lọc, tìm kiếm các đầu việc hàng ngày theo danh mục đời sống (*Học tập, Công việc, Cá nhân, Mua sắm, Gia đình*), thiết lập hạn chót, mức độ ưu tiên trực quan và chia nhỏ công việc thành các danh sách kiểm tra con (Checklists) để quản lý cuộc sống ngăn nắp, dễ dàng.

---

### 2. Luồng Nghiệp Vụ & Sơ Đồ Xử Lý (Business Flow Diagram)

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│               SƠ ĐỒ LUỒNG QUẢN LÝ CÔNG VIỆC CỐT LÕI (CORE TASK & CHECKLIST)            │
└────────────────────────────────────────────────────────────────────────────────────────┘

  [ NGƯỜI DÙNG ]
        │
        │ (1) Nhập tiêu đề nhanh / Mở modal tạo việc
        ▼
  ┌────────────────────────────────────────────────────────┐
  │         Client UI: TaskQuickAdd / TaskDetailModal      │
  │ • Tiêu đề (Bắt buộc, 1–255 ký tự)                      │
  │ • Danh mục: Học tập, Công việc, Cá nhân, Mua sắm...   │
  │ • Mức ưu tiên: Thấp (Low), Vừa (Medium), Cao (High)    │
  │ • Hạn chót: Due Date (ISO UTC)                         │
  └──────────────────────────┬─────────────────────────────┘
                             │ (2) POST /api/v1/tasks
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │            Backend: TaskController                    │
  │ • Bean Validation (@Valid): Kiểm tra ràng buộc dữ liệu │
  └──────────────────────────┬─────────────────────────────┘
                             │ (3) Gọi taskService.createTask(userId, req)
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │             Service: TaskServiceImpl                  │
  │ • Gán project_id mặc định (Danh mục Standard)          │
  │ • Mặc định status = 'todo'                             │
  └──────────┬─────────────────────────────────────────────┘
             │ (4) Lưu dữ liệu
             ▼
  ┌────────────────────────────────────────────────────────┐
  │            Database: MySQL 8.4 (tasks)                 │
  └──────────┬─────────────────────────────────────────────┘
             │ (5) Trả về Task vừa tạo
             ▼
  ┌────────────────────────────────────────────────────────┐
  │          THÊM DANH SÁCH KIỂM TRA CON (CHECKLIST)       │
  │ • POST /api/v1/tasks/{id}/checklists { title }         │
  │ • Lưu vào bảng task_checklists (task_id, position)     │
  │ • Khi xóa Task gốc -> Tự động xóa liên hoàn (Cascade)  │
  └────────────────────────────────────────────────────────┘
```

#### 2.1. Quy tắc Quản lý Công việc (Task Rules)
- **Thuộc tính công việc:**
  - `title`: Bắt buộc, chuỗi văn bản thuần (Plain text), độ dài 1–255 ký tự (tự động trim).
  - `description`: Không bắt buộc, Plain text ghi chú chi tiết, tối đa 2.000 ký tự.
  - `priority`: Mức độ ưu tiên, nhận 1 trong 3 giá trị: `low` (Thấp - Xanh nhạt), `medium` (Trung bình - Vàng hổ phách), `high` (Cao - Đỏ cam). Mặc định là `medium`.
  - `status`: Nhận 1 trong 2 giá trị: `todo` (Chưa xong) hoặc `done` (Đã hoàn thành).
  - `dueDate`: Thời hạn hoàn thành (ISO-8601 UTC timestamp).
  - `category`: Danh mục cuộc sống: `Học tập`, `Công việc`, `Cá nhân`, `Mua sắm`, `Gia đình` (lưu dưới dạng dự án mặc định của user `mode_type = 'standard'`).
- **Thao tác nhanh (Quick Actions):**
  - **Đánh dấu hoàn thành:** Click vào checkbox tròn trên danh sách $\rightarrow$ gọi `PATCH /api/v1/tasks/{id}/status` $\rightarrow$ task chuyển sang gạch ngang tiêu đề, mờ nhẹ và di chuyển xuống nhóm việc đã xong.
  - **Xóa việc:** `DELETE /api/v1/tasks/{id}` $\rightarrow$ kiểm tra quyền sở hữu của user $\rightarrow$ xóa vĩnh viễn task cùng toàn bộ các checklist con liên quan.

#### 2.2. Quy tắc Danh sách Kiểm tra Con (Checklists Rules)
- Cho phép đính kèm nhiều đầu việc con vào 1 Task chính (tối đa 50 checklist items/task).
- Mỗi mục có: `title` (bắt buộc, 1–255 ký tự), `is_completed` (mặc định `FALSE`), `position` (số nguyên đánh số thứ tự hiển thị).
- Thao tác check/uncheck từng checklist item không làm thay đổi trạng thái `status` của task chính, nhưng hiển thị thanh tiến độ phần trăm (ví dụ: `2/5 Hoàn thành - 40%`).

#### 2.3. Quy tắc Bộ lọc & Tìm kiếm (Filter & Search Rules)
- **Hôm nay (`filter=today`):** Các task có `dueDate` trong ngày hiện tại theo múi giờ người dùng.
- **7 ngày tới (`filter=upcoming`):** Các task có `dueDate` trong vòng 7 ngày tới.
- **Quá hạn (`filter=overdue`):** Các task có `dueDate < hiện tại` và `status = 'todo'`.
- **Theo danh mục (`category=...`):** Lọc theo tên danh mục tương ứng.
- **Tìm kiếm từ khóa (`search=...`):** Tìm kiếm không phân biệt hoa thường theo `title`.

---

### 3. Thiết Kế Cơ Sở Dữ Liệu & Flyway Migration

#### Script Flyway: `V3__create_tasks_and_checklists_tables.sql`
```sql
CREATE TABLE tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    sprint_id BIGINT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'todo',
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    due_date TIMESTAMP NULL,
    estimated_hours DECIMAL(5, 2) NULL,
    actual_hours DECIMAL(5, 2) NULL,
    story_points INT NULL,
    git_branch_name VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_tasks_projects FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_tasks_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX idx_tasks_user_due_date ON tasks(user_id, due_date);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);

CREATE TABLE task_checklists (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    position INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_task_checklists_tasks FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_task_checklists_task_id ON task_checklists(task_id, position);
```

---

### 4. Chi Tiết API Contract

#### 4.1. `GET /api/v1/tasks` - Lấy Danh Sách Công Việc (Có Lọc & Phân Trang)
- **Headers:** `Authorization: Bearer <access_token>`
- **Query Parameters:**
  - `mode=standard` (bắt buộc)
  - `category=Học tập` (tùy chọn)
  - `filter=today|upcoming|overdue` (tùy chọn)
  - `search=đóng tiền` (tùy chọn)
  - `page=0&size=20&sort=dueDate,asc`
- **Response Success (HTTP 200 OK):**
```json
{
  "success": true,
  "code": 200,
  "errorCode": null,
  "message": "Lấy danh sách công việc thành công",
  "data": {
    "items": [
      {
        "id": 101,
        "title": "Đóng tiền điện sinh hoạt tháng này",
        "priority": "high",
        "status": "todo",
        "dueDate": "2026-10-15T18:00:00.000Z",
        "categoryName": "Cá nhân",
        "totalChecklists": 3,
        "completedChecklists": 1,
        "createdAt": "2026-10-12T14:30:00.000Z"
      }
    ],
    "pageNumber": 0,
    "pageSize": 20,
    "totalElements": 1,
    "totalPages": 1,
    "isFirst": true,
    "isLast": true,
    "hasNext": false,
    "hasPrevious": false
  },
  "errors": null,
  "timestamp": "2026-10-12T14:35:00.000Z"
}
```

#### 4.2. `GET /api/v1/tasks/{id}` - Xem Chi Tiết Công Việc & Checklists Con
- **Headers:** `Authorization: Bearer <access_token>`
- **Response Success (HTTP 200 OK):**
```json
{
  "success": true,
  "code": 200,
  "errorCode": null,
  "message": "Lấy chi tiết công việc thành công",
  "data": {
    "id": 101,
    "title": "Đóng tiền điện sinh hoạt tháng này",
    "description": "Thanh toán qua app ngân hàng trước ngày 15.",
    "priority": "high",
    "status": "todo",
    "dueDate": "2026-10-15T18:00:00.000Z",
    "categoryName": "Cá nhân",
    "checklists": [
      {
        "id": 501,
        "title": "Kiểm tra mã hóa đơn trong tin nhắn SMS",
        "isCompleted": true,
        "position": 0
      },
      {
        "id": 502,
        "title": "Chuyển khoản thanh toán",
        "isCompleted": false,
        "position": 1
      }
    ],
    "createdAt": "2026-10-12T14:30:00.000Z",
    "updatedAt": "2026-10-12T14:32:00.000Z"
  },
  "errors": null,
  "timestamp": "2026-10-12T14:36:00.000Z"
}
```

#### 4.3. `POST /api/v1/tasks` - Tạo Công Việc Mới
- **Headers:** `Authorization: Bearer <access_token>`
- **Request Body:**
```json
{
  "title": "Dọn dẹp bàn làm việc",
  "description": "Lau màn hình, cất sách vở",
  "priority": "medium",
  "dueDate": "2026-10-13T17:00:00.000Z",
  "categoryName": "Cá nhân"
}
```
- **Response Success (HTTP 201 Created):**
```json
{
  "success": true,
  "code": 201,
  "errorCode": null,
  "message": "Tạo công việc thành công",
  "data": {
    "id": 102,
    "title": "Dọn dẹp bàn làm việc",
    "status": "todo",
    "priority": "medium"
  },
  "errors": null,
  "timestamp": "2026-10-12T14:37:00.000Z"
}
```

#### 4.4. `PATCH /api/v1/tasks/{id}/status` - Đổi Trạng Thái Hoàn Thành
- **Headers:** `Authorization: Bearer <access_token>`
- **Request Body:** `{ "status": "done" }`
- **Response Success (HTTP 200 OK):**
```json
{
  "success": true,
  "code": 200,
  "errorCode": null,
  "message": "Cập nhật trạng thái thành công",
  "data": {
    "id": 102,
    "status": "done"
  },
  "errors": null,
  "timestamp": "2026-10-12T14:38:00.000Z"
}
```

#### 4.5. `POST /api/v1/tasks/{id}/checklists` - Thêm Checklist Con
- **Headers:** `Authorization: Bearer <access_token>`
- **Request Body:** `{ "title": "Lau sạch bàn phím" }`
- **Response Success (HTTP 201 Created):**
```json
{
  "success": true,
  "code": 201,
  "errorCode": null,
  "message": "Thêm mục kiểm tra con thành công",
  "data": {
    "id": 503,
    "title": "Lau sạch bàn phím",
    "isCompleted": false,
    "position": 2
  },
  "errors": null,
  "timestamp": "2026-10-12T14:39:00.000Z"
}
```

---

### 5. Cấu Trúc Mã Nguồn Backend (`dylask-backend`)

Mã nguồn tổ chức tại module `com.dylask.modules.task`:

```
com.dylask.modules.task/
├── controller/
│   ├── TaskController.java                  # CRUD Task & Bộ lọc phân trang
│   └── TaskChecklistController.java         # Thao tác checklist con
├── service/
│   ├── TaskService.java                     # Interface nghiệp vụ task
│   ├── impl/TaskServiceImpl.java            # Logic tạo, lọc, xóa cascade
│   ├── TaskChecklistService.java            # Interface checklist
│   └── impl/TaskChecklistServiceImpl.java   # Logic thêm, toggle, sắp xếp checklist
├── repository/
│   ├── TaskRepository.java                  # JPA Specs & Query lọc theo ngày/status
│   └── TaskChecklistRepository.java         # Truy vấn checklist theo task_id
├── entity/
│   ├── Task.java                            # JPA Entity mapping bảng tasks
│   └── TaskChecklist.java                   # JPA Entity mapping bảng task_checklists
├── dto/
│   ├── request/
│   │   ├── CreateTaskRequestDTO.java        # Record: title, desc, priority, dueDate, category
│   │   ├── UpdateTaskRequestDTO.java        # Record: title, desc, priority, dueDate
│   │   ├── UpdateTaskStatusDTO.java         # Record: status ('todo' | 'done')
│   │   └── CreateChecklistRequestDTO.java   # Record: title
│   └── response/
│       ├── TaskSummaryDTO.java              # Hiển thị trên danh sách
│       ├── TaskDetailDTO.java               # Hiển thị trên modal chi tiết
│       └── ChecklistItemDTO.java            # DTO mục checklist con
└── mapper/
    ├── TaskMapper.java                      # MapStruct: Task <-> DTOs
    └── TaskChecklistMapper.java             # MapStruct: Checklist <-> DTOs
```

---

### 6. Cấu Trúc Mã Nguồn Frontend (`dylask-frontend`)

1. **Giao diện tham chiếu:**
   - Danh sách công việc: `docs/layout-html/standard-list/layout.html`
   - Modal chi tiết công việc & Checklist: `docs/layout-html/standard-task-modal/layout.html`
2. **Cấu trúc Component:**
   - `src/pages/standard/TaskListPage.tsx`: Màn hình danh sách chính.
   - `src/components/task/TaskItemRow.tsx`: Dòng công việc với checkbox tròn, nhãn ưu tiên, hạn chót.
   - `src/components/task/TaskQuickAddInput.tsx`: Ô nhập nhanh công việc trên đầu trang.
   - `src/components/task/TaskDetailModal.tsx`: Modal xem chi tiết, sửa ghi chú và checklist con.
   - `src/components/task/ChecklistSection.tsx`: Danh sách checkbox con, ô thêm dòng mới.
3. **Custom Hook `useStandardTasks`:**
   - Quản lý state danh sách task, phân trang, lọc theo category/ngày, optimistic update khi tick hoàn thành.

---

### 7. Tiêu Chí Nghiệm Thu & Ma Trận Kiểm Thử (Test Matrix)

| ID | Tình huống kiểm thử | Dữ liệu đầu vào | Kết quả mong đợi |
|---|---|---|---|
| **TC-STD-01** | Tạo task hợp lệ | `title = "Học từ vựng"`, `priority = "high"` | HTTP 201 Created, task xuất hiện trong danh sách. |
| **TC-STD-02** | Tạo task tiêu đề rỗng | `title = ""` | HTTP 400 Bad Request, mã `VALIDATION_FAILED`. |
| **TC-STD-03** | Lọc task hôm nay | `filter = "today"` | Trả về đúng các task có due date nằm trong ngày hiện tại của user. |
| **TC-STD-04** | Toggle trạng thái task | Gửi `status = "done"` | HTTP 200 OK, `status` đổi thành `done`. |
| **TC-STD-05** | Thêm checklist con | `title = "Bài 1 đến 5"` | HTTP 201 Created, gắn đúng vào task cha. |
| **TC-STD-06** | Xóa task cha | Xóa task ID 101 | HTTP 200/204, task bị xóa và toàn bộ checklists con bị xóa sạch trong DB (Cascade). |
| **TC-STD-07** | Truy cập task của user khác | User A xem task của User B | HTTP 403 Forbidden hoặc HTTP 404 Not Found. |
| **TC-STD-08** | Tìm kiếm từ khóa | `search = "tiền điện"` | Trả về danh sách chỉ chứa các task có tiêu đề chứa "tiền điện". |
