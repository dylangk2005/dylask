# Đặc Tả Kỹ Thuật Chi Tiết: FEAT-DEV-04
## Bình Luận Phân Luồng (Threaded Comments), Báo Cáo Tiến Độ Tự Động (Async Daily Standup) & Nhật Ký Kiểm Toán (Audit Log)

- **Mã tính năng:** `FEAT-DEV-04`
- **Phân hệ:** Developer Mode (Hợp tác nhóm kỹ thuật & Bất đồng bộ)
- **Trạng thái:** `01.draft` (Chờ người dùng review)
- **Độ ưu tiên:** `P2 (High - Tối ưu giao tiếp đội nhóm)`

---

### 1. Mục Tiêu (User Story)

Là đội ngũ phát triển phần mềm làm việc phân tán/bất đồng bộ (Async Remote Team), chúng tôi muốn thảo luận kỹ thuật dưới dạng bình luận phân luồng (Threaded Comments) có gắn thẻ `@member` và đính kèm đoạn mã; tự động trích xuất Báo cáo Tiến độ Đầu ngày (*Async Daily Standup*) dựa trên dữ liệu công việc 24h qua mà không cần họp hành trực tuyến; và theo dõi toàn bộ Nhật ký Kiểm toán Thay đổi (*Audit Log*) minh bạch để biết ai đã cập nhật trạng thái, deadline hay phân công.

---

### 2. Luồng Nghiệp Vụ & Sơ Đồ Xử Lý (Business Flow Diagram)

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│          SƠ ĐỒ HỢP TÁC NHÓM KỸ THUẬT: COMMENTS, ASYNC STANDUP & AUDIT LOG              │
└────────────────────────────────────────────────────────────────────────────────────────┘

  [ 1. THREADED COMMENTS (BÌNH LUẬN PHÂN LUỒNG) ]
  Task DYL-102 (Triển khai JWT)
  └── Bình luận gốc (Dev A): "Cần cấu hình Clock Skew 60s phòng lệch giờ giữa các node."
      ├── Trả lời luồng (Dev B): "Đã bổ sung trong Filter rồi nhé @DevA."
      └── Trả lời luồng (Tech Lead): "Nhớ bổ sung test case trong FEAT-AUTH-01."

  ──────────────────────────────────────────────────────────────────

  [ 2. ASYNC DAILY STANDUP (BÁO CÁO TIẾN ĐỘ TỰ ĐỘNG 24 GIỜ QUA) ]
  Truy vấn Database định kỳ hoặc theo yêu cầu lúc 08:30 sáng:
  ├── 1. Hôm qua đã làm gì?  --> Toàn bộ task trạng thái DONE trong 24 giờ qua
  ├── 2. Hôm nay sẽ làm gì?  --> Toàn bộ task trạng thái IN_PROGRESS hoặc TODO
  └── 3. Có trở ngại gì?     --> Toàn bộ task có nhãn tag 'Blocked' hoặc quá hạn
  ──► Nút 1-Click: "Sao chép Markdown Standup" để dán vào Slack / Discord / Teams

  ──────────────────────────────────────────────────────────────────

  [ 3. AUDIT LOG (TỰ ĐỘNG GHI VẾT MỌI THAY ĐỔI) ]
  Mọi thao tác chỉnh sửa task (Đổi status, đổi Assignee, dời deadline, sửa Story Points)
  ──► Spring AOP / Entity Listener tự động bắt sự kiện và ghi vào bảng audit_logs:
      (who, when, action_type, field_name, old_value, new_value)
```

#### 2.1. Quy tắc Bình Luận Phân Luồng (Threaded Comments)
- **Cấu trúc phân tầng (2-Level Hierarchy):**
  - Cấp 1 (Root Comment): Bình luận độc lập mở đầu một chủ đề thảo luận trong task.
  - Cấp 2 (Replies): Các phản hồi nằm thụt lề trong luồng của bình luận cấp 1 (`parent_id = root_comment_id`).
- **Nội dung bình luận:**
  - Hỗ trợ định dạng văn bản Markdown ngắn, trích dẫn khối code (Code block) và danh sách gạch đầu dòng.
  - Nhắc tên thành viên (`@username`): Hệ thống tự động phát hiện cú pháp `@tên` để gửi thông báo chuông (Notification) cho thành viên đó.
- **Quyền chỉnh sửa/xóa:** Người tạo bình luận có quyền sửa hoặc xóa bình luận của mình trong vòng 24 giờ; Tech Lead / Admin có quyền xóa bình luận vi phạm.

#### 2.2. Quy tắc Báo Cáo Tiến Độ Tự Động (Async Daily Standup)
- **Chu kỳ tổng hợp 24 giờ:** Hệ thống trích xuất dữ liệu công việc trong vòng 24 giờ gần nhất (tính từ 08:30 sáng hôm trước tới 08:30 sáng hôm nay).
- **Cấu trúc chuẩn 3 câu hỏi Standup:**
  1. **Đã hoàn thành hôm qua (Done Yesterday):** Danh sách các task đã chuyển sang trạng thái `DONE` trong 24h qua, kèm Story Points và tên người thực hiện.
  2. **Kế hoạch hôm nay (In Progress Today):** Danh sách các task đang ở trạng thái `IN_PROGRESS` kèm tên nhánh Git Branch đang phát triển.
  3. **Vấn đề tồn đọng & Trở ngại (Blockers):** Các task bị gán nhãn `Blocked` hoặc task quá hạn cần sự trợ giúp từ đội ngũ.
- **Tính năng 1-Click Copy Markdown:** Cho phép sao chép nhanh toàn bộ báo cáo có định dạng Markdown chuẩn để dán trực tiếp vào các kênh chat của nhóm (Slack, Discord, Microsoft Teams).

#### 2.3. Quy tắc Nhật Ký Kiểm Toán (Audit Log)
- **Tự động bắt sự kiện (Zero Effort):** Lập trình viên không cần nhập tay bất kỳ nội dung nào; mọi thao tác thay đổi trạng thái hoặc thuộc tính đều được hệ thống backend tự động ghi lại thông qua Spring AOP / Entity Listener.
- **Các loại hành động kiểm toán (`action_type`):**
  - `STATUS_CHANGED`: Thay đổi trạng thái (ví dụ: `IN_PROGRESS` $\rightarrow$ `IN_REVIEW`).
  - `ASSIGNEE_CHANGED`: Thay đổi người nhận việc (ví dụ: `Unassigned` $\rightarrow$ `Nguyễn Duy Anh`).
  - `DUE_DATE_CHANGED`: Dời hoặc cập nhật hạn chót (`dueDate`).
  - `PRIORITY_CHANGED`: Thay đổi độ ưu tiên kỹ thuật (ví dụ: `P2` $\rightarrow$ `P1`).
  - `STORY_POINTS_CHANGED`: Ước tính lại điểm công số (Story Points).
- **Tính toàn vẹn (Immutability):** Dữ liệu trong bảng `audit_logs` là **chỉ đọc (Read-Only)**; tuyệt đối không cung cấp API cập nhật hay xóa nhật ký kiểm toán.

---

### 3. Thiết Kế Cơ Sở Dữ Liệu & Flyway Migration

#### Script Flyway: `V9__create_task_comments_and_audit_logs.sql`
```sql
CREATE TABLE task_comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    parent_id BIGINT NULL COMMENT 'ID của comment gốc nếu là reply trong luồng',
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_task_comments_tasks FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    CONSTRAINT fk_task_comments_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_task_comments_parent FOREIGN KEY (parent_id) REFERENCES task_comments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_task_comments_task_id ON task_comments(task_id, parent_id);

CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    task_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    action_type VARCHAR(50) NOT NULL COMMENT 'STATUS_CHANGED, ASSIGNEE_CHANGED...',
    field_name VARCHAR(50) NOT NULL,
    old_value TEXT NULL,
    new_value TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_logs_projects FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_audit_logs_tasks FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    CONSTRAINT fk_audit_logs_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_audit_logs_task_id ON audit_logs(task_id, created_at);
CREATE INDEX idx_audit_logs_project_id ON audit_logs(project_id, created_at);
```

---

### 4. Chi Tiết API Contract

#### 4.1. `GET /api/v1/tasks/{taskId}/comments` - Lấy Danh Sách Bình Luận Phân Luồng
- **Headers:** `Authorization: Bearer <access_token>`
- **Response Success (HTTP 200 OK):**
```json
{
  "success": true,
  "code": 200,
  "errorCode": null,
  "message": "Lấy danh sách bình luận thành công",
  "data": [
    {
      "id": 801,
      "author": { "id": 1, "fullName": "Nguyễn Duy Anh" },
      "content": "Cần cấu hình Clock Skew 60s phòng lệch giờ giữa các node server.",
      "createdAt": "2026-10-12T15:25:00.000Z",
      "replies": [
        {
          "id": 802,
          "author": { "id": 2, "fullName": "Lê Văn B" },
          "content": "Đã thêm vào JwtAuthenticationFilter rồi nhé @Nguyễn Duy Anh.",
          "createdAt": "2026-10-12T15:28:00.000Z"
        }
      ]
    }
  ],
  "errors": null,
  "timestamp": "2026-10-12T15:30:00.000Z"
}
```

#### 4.2. `POST /api/v1/tasks/{taskId}/comments` - Gửi Bình Luận Hoặc Trả Lời Luồng
- **Headers:** `Authorization: Bearer <access_token>`
- **Request Body:**
```json
{
  "parentId": 801,
  "content": "Nhớ bổ sung test case trong FEAT-AUTH-01 nhé cả team."
}
```
- **Response Success (HTTP 201 Created):**
```json
{
  "success": true,
  "code": 201,
  "errorCode": null,
  "message": "Đã gửi bình luận thành công",
  "data": {
    "id": 803,
    "author": { "id": 1, "fullName": "Nguyễn Duy Anh" },
    "content": "Nhớ bổ sung test case trong FEAT-AUTH-01 nhé cả team.",
    "createdAt": "2026-10-12T15:31:00.000Z"
  },
  "errors": null,
  "timestamp": "2026-10-12T15:31:00.000Z"
}
```

#### 4.3. `GET /api/v1/projects/{projectId}/standup-report` - Xuất Báo Cáo Standup Tự Động 24h
- **Headers:** `Authorization: Bearer <access_token>`
- **Query Parameters:** `date=2026-10-12` (mặc định ngày hiện tại)
- **Response Success (HTTP 200 OK):**
```json
{
  "success": true,
  "code": 200,
  "errorCode": null,
  "message": "Trích xuất báo cáo Standup 24h thành công",
  "data": {
    "projectKey": "DYL",
    "reportDate": "2026-10-12",
    "doneYesterday": [
      {
        "taskKey": "DYL-098",
        "title": "Sửa lỗi 500 khi tạo task trống",
        "assigneeName": "Nguyễn Duy Anh",
        "storyPoints": 2
      }
    ],
    "inProgressToday": [
      {
        "taskKey": "DYL-102",
        "title": "Triển khai xác thực JWT",
        "assigneeName": "Nguyễn Duy Anh",
        "branchName": "feature/DYL-102-jwt-auth",
        "storyPoints": 5
      }
    ],
    "blockers": [],
    "markdownFormatted": "# Async Daily Standup - Dylask Project (12/10/2026)\n\n### 1. Đã xong hôm qua\n- [x] **DYL-098** Sửa lỗi 500 khi tạo task trống (2 SP) - Nguyễn Duy Anh\n\n### 2. Kế hoạch hôm nay\n- [ ] **DYL-102** Triển khai xác thực JWT (5 SP) - Nguyễn Duy Anh (branch: feature/DYL-102-jwt-auth)\n\n### 3. Trở ngại (Blockers)\n- Không có."
  },
  "errors": null,
  "timestamp": "2026-10-12T15:32:00.000Z"
}
```

#### 4.4. `GET /api/v1/tasks/{taskId}/audit-logs` - Lấy Nhật Ký Kiểm Toán Thay Đổi Của Task
- **Headers:** `Authorization: Bearer <access_token>`
- **Response Success (HTTP 200 OK):**
```json
{
  "success": true,
  "code": 200,
  "errorCode": null,
  "message": "Lấy nhật ký kiểm toán thành công",
  "data": [
    {
      "id": 901,
      "actor": { "id": 1, "fullName": "Nguyễn Duy Anh" },
      "actionType": "STATUS_CHANGED",
      "fieldName": "status",
      "oldValue": "IN_PROGRESS",
      "newValue": "IN_REVIEW",
      "createdAt": "2026-10-12T15:20:00.000Z"
    },
    {
      "id": 902,
      "actor": { "id": 1, "fullName": "Nguyễn Duy Anh" },
      "actionType": "STORY_POINTS_CHANGED",
      "fieldName": "storyPoints",
      "oldValue": "3",
      "newValue": "5",
      "createdAt": "2026-10-12T14:10:00.000Z"
    }
  ],
  "errors": null,
  "timestamp": "2026-10-12T15:33:00.000Z"
}
```

---

### 5. Cấu Trúc Mã Nguồn Backend (`dylask-backend`)

Mã nguồn tổ chức tại module `com.dylask.modules.collaboration` & `com.dylask.common.audit`:

```
com.dylask.modules.collaboration/
├── controller/
│   ├── TaskCommentController.java           # API /comments
│   ├── StandupReportController.java         # API /standup-report
│   └── TaskAuditLogController.java          # API /audit-logs
├── service/
│   ├── TaskCommentService.java              # Cấu trúc luồng 2 cấp & parse @mentions
│   ├── StandupReportService.java            # Trích xuất dữ liệu 24h & sinh Markdown
│   └── AuditLogService.java                 # Ghi nhận log bất biến
├── repository/
│   ├── TaskCommentRepository.java
│   └── AuditLogRepository.java
└── entity/
    ├── TaskComment.java
    └── AuditLog.java

com.dylask.common.audit/
└── TaskAuditAspect.java                     # Spring AOP tự động chặn Service method để ghi Audit Log
```

---

### 6. Cấu Trúc Mã Nguồn Frontend (`dylask-frontend`)

1. **Giao diện tham chiếu:**
   - Layout Standup: `docs/layout-html/developer-standup/layout.html`.
   - Layout Audit Log: `docs/layout-html/developer-audit-log/layout.html`.
2. **Cấu trúc Component:**
   - `src/components/collaboration/ThreadedComments.tsx`: Danh sách comment dạng luồng có avatar và nút Reply.
   - `src/components/collaboration/StandupSummaryView.tsx`: Màn hình hiển thị 3 cột Standup kèm nút Copy Markdown.
   - `src/components/collaboration/AuditLogTimeline.tsx`: Dòng thời gian lịch sử thay đổi (Timeline view).
3. **Custom Hooks:**
   - `useThreadedComments.ts`: Quản lý danh sách comment và gửi reply.
   - `useStandupReport.ts`: Lấy dữ liệu báo cáo 24h.

---

### 7. Tiêu Chí Nghiệm Thu & Ma Trận Kiểm Thử (Test Matrix)

| ID | Tình huống kiểm thử | Dữ liệu đầu vào | Kết quả mong đợi |
|---|---|---|---|
| **TC-COL-01** | Gửi comment gốc hợp lệ | `content = "Kiểm tra log lỗi"` | HTTP 201 Created, comment hiển thị ở cấp 1. |
| **TC-COL-02** | Trả lời vào luồng (Reply) | `parentId = 801`, `content = "Đã fix"` | HTTP 201 Created, comment nằm thụt lề dưới comment 801. |
| **TC-COL-03** | Trích xuất Standup 24h | Query ngày 12/10/2026 | Trích xuất đúng các task đã `DONE` trong 24h qua và các task đang `IN_PROGRESS`. |
| **TC-COL-04** | Sao chép Markdown Standup | Bấm nút Copy Markdown | Clipboard nhận đúng định dạng Markdown chia 3 mục: Đã xong, Kế hoạch, Trở ngại. |
| **TC-COL-05** | Tự động ghi Audit Log khi đổi status | Di chuyển task từ `TODO` sang `IN_PROGRESS` | Tự động sinh 1 bản ghi trong `audit_logs` với `actionType = STATUS_CHANGED`, `oldValue = TODO`, `newValue = IN_PROGRESS`. |
| **TC-COL-06** | Tính bất biến của Audit Log | Cố gắng gọi UPDATE/DELETE vào `audit_logs` | Backend không cung cấp API này, Database từ chối quyền sửa đổi. |
| **TC-COL-07** | Nhắc tên thành viên `@member` | Comment chứa `@nguyenduyanh` | Hệ thống trích xuất đúng username và tạo thông báo chuông cho thành viên được nhắc. |
