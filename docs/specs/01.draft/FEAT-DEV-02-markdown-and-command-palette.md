# Đặc Tả Kỹ Thuật Chi Tiết: FEAT-DEV-02
## Trình Soạn Thảo Markdown, Bảng Điều Khiển Phím Tắt (Command Palette `Ctrl+K`) & Chế Độ Focus Coding

- **Mã tính năng:** `FEAT-DEV-02`
- **Phân hệ:** Developer Mode (Trải nghiệm Lập trình viên - DX)
- **Trạng thái:** `01.draft` (Chờ người dùng review)
- **Độ ưu tiên:** `P2 (High - Tối ưu tốc độ thao tác kỹ thuật)`

---

### 1. Mục Tiêu (User Story)

Là lập trình viên yêu thích làm việc bằng bàn phím (Keyboard-First), tôi muốn viết mô tả công việc bằng Markdown toàn diện có tô màu cú pháp mã nguồn (Syntax Highlighting); mở nhanh thanh tìm kiếm & lệnh điều hướng bằng phím tắt `Ctrl + K` (hoặc `Cmd + K`); và kích hoạt Chế độ Tập trung Lập trình (*Focus Coding Mode*) để loại bỏ mọi xao nhãng giao diện, bấm giờ làm việc thực tế và sao chép tên Git branch nhanh chóng.

---

### 2. Luồng Nghiệp Vụ & Sơ Đồ Xử Lý (Business Flow Diagram)

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│               SƠ ĐỒ BẢNG ĐIỀU KHIỂN PHÍM TẮT (COMMAND PALETTE `CTRL + K`)               │
└────────────────────────────────────────────────────────────────────────────────────────┘

  [ LẬP TRÌNH VIÊN Ở BẤT KỲ MÀN HÌNH NÀO TRONG DEVELOPER MODE ]
        │
        │ Bấm tổ hợp phím [ Ctrl + K ] hoặc [ Cmd + K ]
        ▼
  ┌────────────────────────────────────────────────────────┐
  │         Popup Command Palette Mở Ra Chính Giữa Màn Hình│
  │ • Ô tìm kiếm Autofocus với tiền tố ">" hoặc từ khóa    │
  │ • Điều hướng danh sách bằng phím mũi tên [▲] / [▼]     │
  │ • Nhấn [Enter] để thực thi ngay lập tức                │
  └──────────────────────────┬─────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
  [ HÀNH ĐỘNG NHANH ]   [ ĐIỀU HƯỚNG TRANG ]  [ TÌM KIẾM CÔNG VIỆC ]
  • > Tạo Task mới      • Đi tới Sprint Board • Gõ "DYL-102" hoặc "JWT"
  • > Bật Focus Mode    • Đi tới Audit Log    • Danh sách task gợi ý
  • > Cài đặt AI (BYOK) • Đi tới Standup      • Enter -> Mở chi tiết task
  • > Đổi sang Standard • Đi tới Cài đặt      
```

#### 2.1. Quy tắc Command Palette (`Ctrl + K` / `Cmd + K`)
- **Kích hoạt toàn cục:** Bắt sự kiện bàn phím `keydown` trên toàn bộ cửa sổ ứng dụng khi đang ở Developer Mode. Không kích hoạt khi con trỏ đang nằm trong các ô `textarea` dài để tránh xung đột với phím tắt soạn thảo.
- **Phân nhóm lệnh (Grouped Actions):**
  1. **Lệnh hệ thống (System Actions):**
     - `> Tạo task mới`: Mở modal tạo công việc kỹ thuật.
     - `> Chuyển sang Standard Mode`: Gọi hàm chuyển đổi Dual-Mode tức thì.
     - `> Bật Focus Coding`: Khởi động chế độ tập trung cho task đang chọn.
     - `> Mở Trợ lý AI`: Mở drawer AI Panel ở cạnh phải.
  2. **Điều hướng nhanh (Navigation):**
     - Sprint Board (`/developer/board`).
     - Báo cáo Standup (`/developer/standup`).
     - Nhật ký thay đổi (`/developer/audit-log`).
     - Cài đặt AI & Khóa cá nhân (`/settings`).
  3. **Tìm kiếm nhanh công việc (Task Quick Search):**
     - Tìm kiếm theo mã task (ví dụ: `DYL-102`) hoặc từ khóa trong tiêu đề. Kết quả hiển thị kèm trạng thái badge và Story points.

#### 2.2. Trình Soạn Thảo & Hiển Thị Markdown (Markdown Editor & Viewer)
- **Hỗ trợ định dạng chuẩn GFM (GitHub Flavored Markdown):**
  - Tiêu đề (`#`, `##`, `###`), in đậm, in nghiêng, danh sách gạch đầu dòng, bảng biểu (Tables), trích dẫn (Blockquotes).
- **Tô màu cú pháp mã nguồn (Syntax Highlighting):**
  - Hỗ trợ tự động tô màu code block cho các ngôn ngữ chính: Java, TypeScript, JavaScript, Python, SQL, JSON, YAML, Bash.
  - Nút 1-click "Sao chép mã" (Copy Code) ở góc phải mỗi block code.
- **An toàn phòng chống XSS (Sanitization):**
  - Bắt buộc xử lý lọc sạch các thẻ HTML nguy hiểm (`<script>`, `<iframe`, `onerror=`) bằng thư viện DOMPurify trước khi render ra giao diện.

#### 2.3. Chế Độ Tập Trung Lập Trình (Focus Coding Mode)
- **Ẩn toàn bộ giao diện thừa:**
  - Ẩn hoàn toàn Sidebar trái (220px), Topbar và thanh cuộn bên ngoài.
  - Màn hình chuyển sang nền đen tối giản (`#0A0C10`).
- **Nội dung trọng tâm:**
  - Tiêu đề & Mã định danh task (ví dụ: `DYL-102 Triển khai xác thực JWT`).
  - Nút sao chép tên Git Branch chuẩn: Bấm nút sao chép `feature/DYL-102-jwt-auth` vào Clipboard.
  - Đồng hồ tính giờ làm việc thực tế (`Actual Hours Stopwatch`): Đếm tiến độ thời gian thực (`01:25:40`).
- **Thoát chế độ:**
  - Bấm phím `Esc` hoặc nút "Thoát Focus": Tự động mở hộp thoại hỏi có muốn lưu thời gian vừa làm việc vào trường `actual_hours` của task hay không.

---

### 3. Thiết Kế Cơ Sở Dữ Liệu & Flyway Migration

#### Script Flyway: `V7__create_task_work_logs_table.sql`
```sql
CREATE TABLE task_work_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    duration_minutes INT NOT NULL COMMENT 'Số phút làm việc thực tế ghi nhận',
    started_at TIMESTAMP NULL,
    ended_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_task_work_logs_tasks FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    CONSTRAINT fk_task_work_logs_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_task_work_logs_task_id ON task_work_logs(task_id);
CREATE INDEX idx_task_work_logs_user_id ON task_work_logs(user_id);
```

---

### 4. Chi Tiết API Contract

#### 4.1. `POST /api/v1/tasks/{id}/work-logs` - Ghi Nhận Thời Gian Làm Việc Thực Tế (Focus Mode)
- **Headers:** `Authorization: Bearer <access_token>`
- **Request Body:**
```json
{
  "durationMinutes": 85,
  "notes": "Code JwtAuthenticationFilter và kiểm thử với Postman"
}
```
- **Response Success (HTTP 201 Created):**
```json
{
  "success": true,
  "code": 201,
  "errorCode": null,
  "message": "Ghi nhận thời gian làm việc thành công",
  "data": {
    "taskId": 102,
    "actualHours": 1.42,
    "totalMinutesLogged": 85
  },
  "errors": null,
  "timestamp": "2026-10-12T15:10:00.000Z"
}
```

#### 4.2. `GET /api/v1/search/command-palette` - Tìm Kiếm Nhanh Cho Command Palette
- **Headers:** `Authorization: Bearer <access_token>`
- **Query Parameters:** `q=jwt&projectId=1`
- **Response Success (HTTP 200 OK):**
```json
{
  "success": true,
  "code": 200,
  "errorCode": null,
  "message": "Tìm kiếm thành công",
  "data": [
    {
      "id": 102,
      "taskKey": "DYL-102",
      "title": "Triển khai xác thực JWT",
      "status": "IN_PROGRESS",
      "priority": "P1"
    }
  ],
  "errors": null,
  "timestamp": "2026-10-12T15:11:00.000Z"
}
```

---

### 5. Cấu Trúc Mã Nguồn Backend (`dylask-backend`)

Mã nguồn tổ chức tại module `com.dylask.modules.task`:

```
com.dylask.modules.task/
├── controller/
│   ├── TaskWorkLogController.java           # API ghi nhận actual hours
│   └── TaskSearchController.java            # API tìm kiếm nhanh command palette
├── service/
│   ├── TaskWorkLogService.java              # Tự động cộng dồn actual_hours vào task
│   └── impl/TaskWorkLogServiceImpl.java
├── repository/
│   └── TaskWorkLogRepository.java
└── entity/
    └── TaskWorkLog.java
```

---

### 6. Cấu Trúc Mã Nguồn Frontend (`dylask-frontend`)

1. **Giao diện tham chiếu:**
   - Layout Command Palette: `docs/layout-html/developer-command-palette/layout.html`.
2. **Cấu trúc Component:**
   - `src/components/developer/CommandPaletteModal.tsx`: Modal tìm kiếm lệnh dạng Spotlight.
   - `src/components/developer/MarkdownEditor.tsx`: Soạn thảo Markdown với tab Preview.
   - `src/components/developer/MarkdownViewer.tsx`: Render Markdown kèm highlight.js / Prism.
   - `src/components/developer/FocusCodingView.tsx`: Chế độ toàn màn hình không viền.
3. **Custom Hooks:**
   - `useCommandPalette.ts`: Lắng nghe phím tắt `Ctrl + K`, quản lý focus input và danh sách lệnh.
   - `useFocusStopwatch.ts`: Bấm giờ đếm tiến độ thời gian thực.

---

### 7. Tiêu Chí Nghiệm Thu & Ma Trận Kiểm Thử (Test Matrix)

| ID | Tình huống kiểm thử | Dữ liệu đầu vào | Kết quả mong đợi |
|---|---|---|---|
| **TC-DX-01** | Mở Command Palette bằng phím tắt | Nhấn `Ctrl + K` (Windows) hoặc `Cmd + K` (macOS) | Modal mở ngay lập tức trong <50ms, input được tự động focus. |
| **TC-DX-02** | Điều hướng bằng phím mũi tên | Nhấn mũi tên xuống `[▼]` | Con trỏ chọn di chuyển xuống mục tiếp theo, nhấn Enter thực thi mục đó. |
| **TC-DX-03** | Đóng Command Palette | Nhấn phím `Esc` | Modal đóng lại, trả focus về vị trí ban đầu của trang. |
| **TC-DX-04** | Render Markdown có khối code | Nội dung chứa ````java public class App {} ```` | Code hiển thị tô màu cú pháp chuẩn, có nút Copy mã nguồn. |
| **TC-DX-05** | Lọc mã độc XSS trong Markdown | Nội dung chứa `<script>alert('hack')</script>` | Thẻ script bị DOMPurify loại bỏ hoàn toàn, không thực thi mã độc. |
| **TC-DX-06** | Thoát Focus Coding Mode | Bấm Thoát sau 45 phút làm việc | Bắn popup hỏi lưu giờ, DB cập nhật `actual_hours += 0.75`. |
