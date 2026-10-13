# Đặc Tả Kỹ Thuật Chi Tiết: FEAT-DEV-03
## Tự Động Hóa Chuẩn Tên Nhánh Git & Webhook Đồng Bộ Trạng Thái GitHub/GitLab (Chi Phí 0đ)

- **Mã tính năng:** `FEAT-DEV-03`
- **Phân hệ:** Developer Mode (Tự động hóa tích hợp Git)
- **Trạng thái:** `01.draft` (Chờ người dùng review)
- **Độ ưu tiên:** `P2 (High - Nâng cao hiệu suất nhóm kỹ thuật)`

---

### 1. Mục Tiêu (User Story)

Là lập trình viên, tôi muốn sao chép tên nhánh Git chuẩn kỹ thuật (`feature/DYL-102-jwt-auth`) chỉ bằng một nút bấm; và khi tôi push commit, tạo Pull Request (PR) hoặc merge code trên GitHub/GitLab, hệ thống Dylask sẽ tự động chuyển trạng thái task tương ứng sang `IN_PROGRESS`, `IN_REVIEW` hoặc `DONE` mà không cần tôi phải mất công mở bảng kéo thả thủ công.

---

### 2. Luồng Nghiệp Vụ & Sơ Đồ Xử Lý (Business Flow Diagram)

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│              SƠ ĐỒ TỰ ĐỘNG HÓA LUỒNG CODE VỚI GIT WEBHOOK (CHI PHÍ 0Đ)                 │
└────────────────────────────────────────────────────────────────────────────────────────┘

  [ LẬP TRÌNH VIÊN ]
        │
        │ (1) Thao tác Git: git push / mở PR / merge PR
        ▼
  ┌────────────────────────────────────────────────────────┐
  │              GitHub / GitLab Repository                │
  └──────────────────────────┬─────────────────────────────┘
                             │ (2) Gửi HTTP POST Webhook Payload kèm chữ ký bảo mật
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │         Dylask Backend: GitWebhookController           │
  │ • Xác thực chữ ký: X-Hub-Signature-256 (HMAC-SHA256)   │
  │ • Trích xuất mã task: Regex matching /DYL-(\d+)/       │
  └──────────────────────────┬─────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
  [ 1. SỰ KIỆN PUSH ]      [ 2. SỰ KIỆN MỞ PR ]  [ 3. SỰ KIỆN MERGE PR ]
  • Phát hiện branch mới   • Action: "opened"    • Action: "closed" & merged
  • Commit chứa mã task    • Task chuyển sang:   • Chứa "closes #102"
  • Task chuyển sang:        ──► [ IN_REVIEW ]   • Task chuyển sang:
    ──► [ IN_PROGRESS ]    • Lưu URL của PR        ──► [ DONE ]
  • Lưu Commit Hash        • Gán Reviewer        • Ghi log hoàn thành
```

#### 2.1. Quy tắc Chuẩn hóa Tên Nhánh Git (Git Branch Naming)
- **Cấu trúc chuẩn:** `<prefix>/<PROJECT_KEY>-<TASK_ID>-<slugified-title>`
  - `prefix`: Mặc định là `feature` (hoặc `bugfix` nếu task gắn tag `Bug`, `hotfix` nếu gắn tag `Hotfix`).
  - `PROJECT_KEY`: Tiền tố dự án (ví dụ: `DYL`).
  - `TASK_ID`: Mã số ID của task (ví dụ: `102`).
  - `slugified-title`: Tiêu đề task viết thường, loại bỏ dấu tiếng Việt, thay khoảng trắng bằng dấu gạch ngang (ví dụ: *"Triển khai xác thực JWT"* $\rightarrow$ `jwt-auth`).
  - *Ví dụ mẫu:* `feature/DYL-102-jwt-auth` hoặc `bugfix/DYL-098-fix-500-error`.
- **Thao tác 1-Click Copy:**
  - Nút biểu tượng Git Branch trên thẻ task và modal chi tiết.
  - Bấm nút $\rightarrow$ Sao chép chuỗi `feature/DYL-102-jwt-auth` vào Clipboard $\rightarrow$ Hiển thị tooltip *"Đã sao chép tên branch!"*.

#### 2.2. Quy tắc Xử lý Tự động hóa Webhook (Không phát sinh chi phí AI)
1. **Sự kiện `push` (Đẩy commit hoặc tạo branch mới):**
   - Đọc tên branch hoặc thông điệp commit (Commit Message).
   - Nếu trích xuất được mã task hợp lệ và task đang ở trạng thái `BACKLOG` hoặc `TODO`:
     - Tự động chuyển trạng thái task sang `IN_PROGRESS`.
     - Lưu mã băm commit (`git_latest_commit_hash`) và tên branch vào task.
2. **Sự kiện `pull_request` (Mở yêu cầu hợp nhất code):**
   - Sự kiện GitHub `pull_request.action = 'opened'` hoặc `'reopened'`.
   - Trích xuất mã task từ tên nhánh nguồn (Head Branch) hoặc tiêu đề PR.
   - Tự động chuyển trạng thái task sang `IN_REVIEW`.
   - Lưu đường dẫn PR (`git_pr_url`) và danh sách người duyệt (`git_reviewer_name`) vào task.
3. **Sự kiện `pull_request` merged (Hoàn tất hợp nhất code):**
   - Sự kiện GitHub `pull_request.action = 'closed'` với thuộc tính `merged = true`.
   - Kiểm tra nội dung mô tả PR chứa cú pháp đóng việc (`closes #102`, `fixes DYL-102`, `resolves #102`).
   - Tự động chuyển trạng thái task sang `DONE`.

#### 2.3. Quy tắc Bảo mật Webhook (HMAC-SHA256 Verification)
- Mỗi dự án kỹ thuật có một chuỗi bí mật ngẫu nhiên `git_webhook_secret` (64 ký tự hex).
- Khi tiếp nhận payload từ GitHub:
  - Trích xuất chữ ký từ Header `X-Hub-Signature-256` (định dạng: `sha256=<hex_digest>`).
  - Backend băm lại toàn bộ raw body payload bằng thuật toán HMAC-SHA256 với secret của dự án.
  - So khớp an toàn bằng `MessageDigest.isEqual(...)` để phòng chống tấn công Timing Attack. Nếu không khớp, từ chối với HTTP 401 Unauthorized `GIT_WEBHOOK_INVALID_SECRET`.

---

### 3. Thiết Kế Cơ Sở Dữ Liệu & Flyway Migration

#### Script Flyway: `V8__add_git_integration_columns_to_tasks.sql`
```sql
ALTER TABLE tasks
ADD COLUMN git_pr_url VARCHAR(255) NULL COMMENT 'Đường dẫn Pull Request tương ứng trên GitHub/GitLab',
ADD COLUMN git_latest_commit_hash VARCHAR(64) NULL COMMENT 'Mã băm commit gần nhất (7-40 ký tự)',
ADD COLUMN git_reviewer_name VARCHAR(100) NULL COMMENT 'Tên người duyệt PR';

CREATE INDEX idx_tasks_git_branch ON tasks(git_branch_name);
```

---

### 4. Chi Tiết API Contract

#### 4.1. `POST /api/v1/webhooks/github/{projectId}` - Tiếp Nhận Webhook GitHub
- **Headers bắt buộc:**
  - `X-GitHub-Event: push | pull_request`
  - `X-Hub-Signature-256: sha256=d579e0034a742da340989f...`
  - `Content-Type: application/json`
- **Request Body mẫu (Sự kiện Push):**
```json
{
  "ref": "refs/heads/feature/DYL-102-jwt-auth",
  "after": "d2248f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e",
  "commits": [
    {
      "id": "d2248f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e",
      "message": "feat(auth): DYL-102 implement jwt filter and security config",
      "author": { "name": "Nguyễn Duy Anh" }
    }
  ]
}
```
- **Response Success (HTTP 200 OK):**
```json
{
  "success": true,
  "code": 200,
  "errorCode": null,
  "message": "Webhook đã được xử lý thành công. Task DYL-102 chuyển sang IN_PROGRESS.",
  "data": {
    "taskId": 102,
    "taskKey": "DYL-102",
    "oldStatus": "TODO",
    "newStatus": "IN_PROGRESS"
  },
  "errors": null,
  "timestamp": "2026-10-12T15:20:00.000Z"
}
```

#### 4.2. `POST /api/v1/projects/{projectId}/webhook/regenerate-secret` - Tạo Lại Khóa Bí Mật Webhook
- **Headers:** `Authorization: Bearer <access_token>`
- **Response Success (HTTP 200 OK):**
```json
{
  "success": true,
  "code": 200,
  "errorCode": null,
  "message": "Đã tạo lại khóa bí mật Webhook thành công",
  "data": {
    "webhookUrl": "https://api.dylask.com/api/v1/webhooks/github/1",
    "webhookSecret": "a8f3b4c9e0d1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7"
  },
  "errors": null,
  "timestamp": "2026-10-12T15:21:00.000Z"
}
```

---

### 5. Cấu Trúc Mã Nguồn Backend (`dylask-backend`)

Mã nguồn tổ chức tại module `com.dylask.modules.git`:

```
com.dylask.modules.git/
├── controller/
│   ├── GitWebhookController.java            # Endpoint mở tiếp nhận Webhook từ GitHub/GitLab
│   └── ProjectGitSettingsController.java    # Quản lý Webhook URL & Secret của dự án
├── service/
│   ├── GitWebhookService.java               # Interface điều phối xử lý sự kiện Git
│   ├── impl/GitWebhookServiceImpl.java      # Parse payload, regex mã task, đổi trạng thái
│   └── HmacSignatureVerifier.java           # Thuật toán xác thực chữ ký HMAC-SHA256 an toàn
├── strategy/
│   ├── GitEventParser.java                  # Interface chiến lược đa nền tảng
│   ├── GitHubEventParser.java               # Parse format JSON của GitHub
│   └── GitLabEventParser.java               # Parse format JSON của GitLab
└── util/
    └── GitBranchSlugifier.java              # Sinh tên branch chuẩn từ title task
```

---

### 6. Cấu Trúc Mã Nguồn Frontend (`dylask-frontend`)

1. **Giao diện tham chiếu:** Thẻ task trên `docs/layout-html/developer-board/layout.html` và modal cài đặt dự án `docs/layout-html/developer-project-create/layout.html`.
2. **Cấu trúc Component:**
   - `src/components/git/GitBranchCopyButton.tsx`: Nút sao chép tên branch 1-click kèm tooltip copy thành công.
   - `src/components/git/GitPrBadge.tsx`: Badge gắn link mở trực tiếp PR trên GitHub kèm trạng thái Reviewer.
   - `src/components/project/ProjectGitSettingsTab.tsx`: Tab hướng dẫn cấu hình Webhook trong Settings.

---

### 7. Tiêu Chí Nghiệm Thu & Ma Trận Kiểm Thử (Test Matrix)

| ID | Tình huống kiểm thử | Dữ liệu đầu vào | Kết quả mong đợi |
|---|---|---|---|
| **TC-GIT-01** | Sinh tên branch chuẩn | Task title = "Triển khai JWT", ID = 102 | Tên branch sinh ra: `feature/DYL-102-trien-khai-jwt`. |
| **TC-GIT-02** | Webhook Push hợp lệ | Push nhánh `feature/DYL-102-jwt` | HTTP 200 OK, Task DYL-102 tự động chuyển từ `TODO` sang `IN_PROGRESS`. |
| **TC-GIT-03** | Webhook Mở PR hợp lệ | PR mở từ nhánh `feature/DYL-102-jwt` | HTTP 200 OK, Task DYL-102 chuyển sang `IN_REVIEW`, link PR được đính kèm. |
| **TC-GIT-04** | Webhook Merge PR thành công | PR closed với `merged: true` và `closes #102` | HTTP 200 OK, Task DYL-102 tự động chuyển sang `DONE`. |
| **TC-GIT-05** | Chữ ký HMAC sai | Header `X-Hub-Signature-256` không khớp | HTTP 401 Unauthorized, mã `GIT_WEBHOOK_INVALID_SECRET`, từ chối xử lý. |
| **TC-GIT-06** | Payload không chứa mã task | Push vào nhánh `main` không chứa mã task | HTTP 200 OK với thông điệp: "Bỏ qua vì không phát hiện mã task liên kết". |
| **TC-GIT-07** | Tạo lại secret của dự án | Bấm Regenerate Secret | Secret cũ bị vô hiệu hóa, tạo secret mới 64 ký tự hex. |
