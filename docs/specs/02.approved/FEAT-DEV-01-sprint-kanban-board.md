# Đặc Tả Kỹ Thuật Chi Tiết: FEAT-DEV-01
## Quản Lý Dự Án Kỹ Thuật, Vòng Lặp Sprint & Bảng Kanban Kéo Thả 5 Cột

- **Mã tính năng:** `FEAT-DEV-01`
- **Phân hệ:** Developer Mode (Agile/Scrum & Luồng việc kỹ thuật)
- **Trạng thái:** `01.draft` (Chờ người dùng review)
- **Độ ưu tiên:** `P1 (Critical - Nền tảng cốt lõi của Developer Mode)`

---

### 1. Mục Tiêu (User Story)

Là lập trình viên hoặc nhóm phát triển phần mềm, tôi muốn tổ chức công việc theo mô hình Agile (*Dự án $\rightarrow$ Sprint $\rightarrow$ Công việc*), quản lý tiến độ trực quan thông qua Bảng Kanban 5 cột kéo thả mượt mà, theo dõi Story Points, công số ước tính và mức độ ưu tiên kỹ thuật (P1–P4) để tối ưu hóa năng suất và luồng phát hành code.

---

### 2. Luồng Nghiệp Vụ & Sơ Đồ Xử Lý (Business Flow Diagram)

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│               SƠ ĐỒ BẢNG KANBAN 5 CỘT & CHU TRÌNH CHUYỂN ĐỔI TRẠNG THÁI TASK           │
└────────────────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
  │   BACKLOG    │     │    TO DO     │     │ IN PROGRESS  │     │  IN REVIEW   │     │     DONE     │
  │  (Tồn đọng)  │────►│ (Sẵn sàng)   │────►│  (Đang làm)  │────►│ (Review PR)  │────►│ (Hoàn thành) │
  │  Mặc định SP │     │ Thuộc Sprint │     │  Có Branch   │     │  Có link PR  │     │ Đóng tự động │
  └──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
         ▲                                         │                    │                    ▲
         │                                         ▼                    ▼                    │
         │                              ┌──────────────────────────────────────────┐         │
         │                              │  TỰ ĐỘNG HÓA WEBHOOK (FEAT-DEV-03)       │         │
         │                              │  • Push branch -> Chuyển IN_PROGRESS     │         │
         │                              │  • Mở PR       -> Chuyển IN_REVIEW       │         │
         │                              │  • Merge PR    -> Chuyển DONE            │─────────┘
         │                              └──────────────────────────────────────────┘
         │
         └─────── [KHI KẾT THÚC SPRINT]: Các task chưa hoàn thành tự động dồn về Backlog
```

#### 2.1. Quy tắc Phân cấp & Vòng đời Sprint (Sprint Lifecycle)
- **Mô hình phân cấp:** `Workspace` $\rightarrow$ `Project` $\rightarrow$ `Sprint` $\rightarrow$ `Task / Bug / Feature`.
- **Trạng thái Sprint:**
  - `PLANNING`: Đang lên kế hoạch, các task được gắn vào Sprint nhưng chưa bấm bắt đầu.
  - `ACTIVE`: Sprint đang diễn ra. **Quy tắc bất biến:** Mỗi dự án chỉ được phép có duy nhất **1 Active Sprint** tại một thời điểm.
  - `COMPLETED`: Sprint đã kết thúc.
- **Quy tắc Đóng Sprint (Complete Sprint):**
  - Khi Tech Lead bấm "Hoàn thành Sprint":
    - Toàn bộ task ở cột `DONE` được giữ lại làm dữ liệu lịch sử của Sprint đó.
    - Toàn bộ task chưa xong (`BACKLOG`, `TODO`, `IN_PROGRESS`, `IN_REVIEW`) tự động được gỡ khỏi Sprint hiện tại và đưa về `Backlog` của dự án (hoặc tùy chọn chuyển tiếp sang Sprint tiếp theo).

#### 2.2. Bảng Kanban 5 Cột & Kéo Thả (Drag & Drop Rules)
- **5 Cột trạng thái chuẩn:**
  1. `BACKLOG`: Đầu việc tồn đọng cần tinh chỉnh yêu cầu.
  2. `TODO`: Các đầu việc đã phân tích xong, sẵn sàng bắt tay vào làm.
  3. `IN_PROGRESS`: Lập trình viên đang thực hiện code.
  4. `IN_REVIEW`: Đang mở Pull Request / Review mã nguồn.
  5. `DONE`: Đã merge vào nhánh chính hoặc kiểm thử đạt yêu cầu.
- **Thuộc tính kỹ thuật trên mỗi Thẻ Task:**
  - Mã task kỹ thuật: `DYL-102` (Viết tắt tên project + ID tự tăng).
  - Tiêu đề ngắn & Người nhận việc (`Assignee` Avatar).
  - Độ ưu tiên: `P1 (Critical - Đỏ)`, `P2 (High - Cam)`, `P3 (Medium - Vàng)`, `P4 (Low - Xám)`.
  - Story Points: Hiển thị badge tròn góc phải thẻ (ví dụ: `5 SP`).
  - Nhãn kỹ thuật (Tags): `Frontend`, `Backend`, `DevOps`, `Database`, `Bug`, `Hotfix`.
- **Thống kê Header cột:** Mỗi cột Kanban tự động tính tổng Story Points và số task trong cột (ví dụ: `IN PROGRESS · 5 SP · 2 Tasks`).
- **Cơ chế Kéo Thả (Optimistic UI):**
  - Thẻ di chuyển ngay lập tức trên giao diện khi người dùng thả chuột (<16ms).
  - Gửi ngầm API `PATCH /api/v1/tasks/{id}/move` cập nhật `targetStatus` và `boardPosition`.
  - Nếu API lỗi (mất mạng/500), tự động trả thẻ về vị trí cũ và hiển thị thông báo lỗi.

---

### 3. Thiết Kế Cơ Sở Dữ Liệu & Flyway Migration

#### Script Flyway: `V6__create_projects_and_sprints_tables.sql`
```sql
CREATE TABLE projects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    project_key VARCHAR(10) NOT NULL COMMENT 'Tiền tố mã task, ví dụ DYL, CORE',
    mode_type VARCHAR(20) NOT NULL DEFAULT 'developer',
    git_repo_url VARCHAR(255) NULL,
    git_webhook_secret VARCHAR(100) NULL,
    is_ai_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_projects_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_projects_user_key UNIQUE (user_id, project_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sprints (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL COMMENT 'Ví dụ: Sprint 1 - Authentication',
    goal TEXT NULL COMMENT 'Mục tiêu chính của Sprint',
    status VARCHAR(20) NOT NULL DEFAULT 'PLANNING' COMMENT 'PLANNING, ACTIVE, COMPLETED',
    start_date TIMESTAMP NULL,
    end_date TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_sprints_projects FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_sprints_project_status ON sprints(project_id, status);

-- Bổ sung các cột kỹ thuật cho bảng tasks đã tạo tại V3
ALTER TABLE tasks
ADD COLUMN board_position INT NOT NULL DEFAULT 0 COMMENT 'Thứ tự hiển thị trong cột Kanban',
ADD COLUMN technical_tags VARCHAR(255) NULL COMMENT 'Frontend,Backend,DevOps...',
ADD CONSTRAINT fk_tasks_sprints FOREIGN KEY (sprint_id) REFERENCES sprints(id) ON DELETE SET NULL;

CREATE INDEX idx_tasks_project_status_position ON tasks(project_id, status, board_position);
```

---

### 4. Chi Tiết API Contract

#### 4.1. `GET /api/v1/projects/{projectId}/board` - Lấy Toàn Bộ Thẻ Trên Bảng Kanban
- **Headers:** `Authorization: Bearer <access_token>`
- **Query Parameters:** `sprintId=12` (tùy chọn; nếu không truyền, mặc định lấy Active Sprint hiện tại)
- **Response Success (HTTP 200 OK):**
```json
{
  "success": true,
  "code": 200,
  "errorCode": null,
  "message": "Lấy dữ liệu bảng Kanban thành công",
  "data": {
    "sprint": {
      "id": 12,
      "name": "Sprint 3 - API & Security",
      "status": "ACTIVE",
      "totalStoryPoints": 21,
      "startDate": "2026-10-01T00:00:00.000Z",
      "endDate": "2026-10-14T23:59:59.000Z"
    },
    "columns": {
      "BACKLOG": [
        {
          "id": 105,
          "taskKey": "DYL-105",
          "title": "Viết unit test cho AuthService",
          "priority": "P3",
          "storyPoints": 3,
          "assignee": { "id": 1, "fullName": "Nguyễn Duy Anh" },
          "tags": ["Backend", "Test"],
          "boardPosition": 0
        }
      ],
      "TODO": [],
      "IN_PROGRESS": [
        {
          "id": 102,
          "taskKey": "DYL-102",
          "title": "Triển khai xác thực JWT & Silent Refresh",
          "priority": "P1",
          "storyPoints": 5,
          "assignee": { "id": 1, "fullName": "Nguyễn Duy Anh" },
          "gitBranchName": "feature/DYL-102-jwt-auth",
          "tags": ["Backend", "Security"],
          "boardPosition": 0
        }
      ],
      "IN_REVIEW": [],
      "DONE": [
        {
          "id": 98,
          "taskKey": "DYL-098",
          "title": "Sửa lỗi 500 khi tạo task tiêu đề trống",
          "priority": "P2",
          "storyPoints": 2,
          "assignee": { "id": 1, "fullName": "Nguyễn Duy Anh" },
          "tags": ["Bug"],
          "boardPosition": 0
        }
      ]
    }
  },
  "errors": null,
  "timestamp": "2026-10-12T15:00:00.000Z"
}
```

#### 4.2. `PATCH /api/v1/tasks/{id}/move` - Kéo Thả Thẻ Task (Đổi Cột / Thứ Tự)
- **Headers:** `Authorization: Bearer <access_token>`
- **Request Body:**
```json
{
  "targetStatus": "IN_REVIEW",
  "newPosition": 0
}
```
- **Response Success (HTTP 200 OK):**
```json
{
  "success": true,
  "code": 200,
  "errorCode": null,
  "message": "Di chuyển thẻ công việc thành công",
  "data": {
    "id": 102,
    "status": "IN_REVIEW",
    "boardPosition": 0,
    "updatedAt": "2026-10-12T15:01:00.000Z"
  },
  "errors": null,
  "timestamp": "2026-10-12T15:01:00.000Z"
}
```

#### 4.3. `POST /api/v1/projects/{projectId}/sprints` - Khởi Tạo Sprint Mới
- **Headers:** `Authorization: Bearer <access_token>`
- **Request Body:**
```json
{
  "name": "Sprint 4 - Webhook Automation",
  "goal": "Tích hợp hoàn thiện GitHub/GitLab Webhook tự động hóa",
  "startDate": "2026-10-15T00:00:00.000Z",
  "endDate": "2026-10-28T23:59:59.000Z"
}
```
- **Response Success (HTTP 201 Created):**
```json
{
  "success": true,
  "code": 201,
  "errorCode": null,
  "message": "Tạo Sprint thành công",
  "data": {
    "id": 13,
    "name": "Sprint 4 - Webhook Automation",
    "status": "PLANNING"
  },
  "errors": null,
  "timestamp": "2026-10-12T15:02:00.000Z"
}
```

#### 4.4. `PATCH /api/v1/sprints/{sprintId}/start` - Bắt Đầu Kích Hoạt Sprint
- **Headers:** `Authorization: Bearer <access_token>`
- **Response Success (HTTP 200 OK):**
```json
{
  "success": true,
  "code": 200,
  "errorCode": null,
  "message": "Sprint đã bắt đầu hoạt động",
  "data": {
    "id": 13,
    "status": "ACTIVE"
  },
  "errors": null,
  "timestamp": "2026-10-12T15:03:00.000Z"
}
```

---

### 5. Cấu Trúc Mã Nguồn Backend (`dylask-backend`)

Mã nguồn tổ chức tại module `com.dylask.modules.project` & `com.dylask.modules.task`:

```
com.dylask.modules.project/
├── controller/
│   ├── ProjectController.java               # CRUD Project & Git settings
│   └── SprintController.java                # Quản lý vòng đời Sprint (Create, Start, Complete)
├── service/
│   ├── ProjectService.java
│   ├── SprintService.java                   # Logic kiểm tra 1 Active Sprint duy nhất
│   └── impl/SprintServiceImpl.java
├── repository/
│   ├── ProjectRepository.java
│   └── SprintRepository.java
└── entity/
    ├── Project.java
    └── Sprint.java

com.dylask.modules.task/
├── controller/
│   └── KanbanBoardController.java           # API /api/v1/projects/{id}/board & /move
├── service/
│   └── KanbanBoardService.java              # Xử lý cập nhật position & reorder
└── dto/
    ├── request/
    │   ├── MoveTaskCardRequestDTO.java      # Record: targetStatus, newPosition
    │   └── CreateSprintRequestDTO.java      # Record: name, goal, startDate, endDate
    └── response/
        ├── KanbanBoardResponseDTO.java      # Map 5 cột và thẻ
        └── SprintSummaryDTO.java
```

---

### 6. Cấu Trúc Mã Nguồn Frontend (`dylask-frontend`)

1. **Giao diện tham chiếu:** `docs/layout-html/developer-board/layout.html` (chế độ nền tảng Developer Dark Mode).
2. **Cấu trúc Component:**
   - `src/pages/developer/SprintBoardPage.tsx`: Màn hình chính của bảng Kanban.
   - `src/components/kanban/KanbanBoard.tsx`: Container 5 cột kéo thả.
   - `src/components/kanban/KanbanColumn.tsx`: Từng cột trạng thái với header hiển thị tổng Story Points.
   - `src/components/kanban/TaskCard.tsx`: Thẻ task với mã `DYL-102`, nhãn P1–P4, Avatar assignee, Story points badge.
   - `src/components/kanban/SprintHeader.tsx`: Thanh điều hướng sprint, nút bắt đầu/kết thúc sprint.
3. **Custom Hook `useKanbanBoard`:**
   - Quản lý state của 5 cột, bắt sự kiện `onDragEnd`, cập nhật UI lạc quan (Optimistic Update) và gọi API `task.api.moveCard()`.

---

### 7. Tiêu Chí Nghiệm Thu & Ma Trận Kiểm Thử (Test Matrix)

| ID | Tình huống kiểm thử | Dữ liệu đầu vào | Kết quả mong đợi |
|---|---|---|---|
| **TC-KANBAN-01** | Kéo thẻ từ TODO sang IN_PROGRESS | Kéo thẻ DYL-102 | Thẻ chuyển cột tức thì, DB cập nhật `status = 'IN_PROGRESS'`. |
| **TC-KANBAN-02** | Thay đổi thứ tự thẻ trong cùng cột | Kéo thẻ xuống vị trí thứ 2 | `board_position` của các thẻ trong cột được cập nhật lại chính xác. |
| **TC-KANBAN-03** | Khởi tạo Sprint thành công | `name = "Sprint 1"`, `dates` hợp lệ | HTTP 201 Created, Sprint ở trạng thái `PLANNING`. |
| **TC-KANBAN-04** | Kích hoạt Active Sprint khi đã có sprint active khác | Bấm Start Sprint 2 trong khi Sprint 1 đang ACTIVE | HTTP 400 Bad Request, mã `SPRINT_ALREADY_ACTIVE`. |
| **TC-KANBAN-05** | Hoàn thành Sprint (Complete Sprint) | Bấm Complete Sprint | Sprint chuyển sang `COMPLETED`, các task chưa xong tự động chuyển về Backlog. |
| **TC-KANBAN-06** | Tính toán tổng Story Points cột | Cột có 3 task với 2, 3, 5 SP | Header hiển thị chính xác `10 SP`. |
| **TC-KANBAN-07** | Lọc thẻ theo Assignee | Chọn lọc theo "Nguyễn Duy Anh" | Bảng Kanban chỉ hiển thị các thẻ được gán cho người dùng này. |
