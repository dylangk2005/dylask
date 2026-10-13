# Đặc Tả Kỹ Thuật Chi Tiết: FEAT-AI-03
## Sinh Test Cases, Tóm Tắt Release Notes & Phân Tích Log Lỗi Bằng Trợ Lý AI

- **Mã tính năng:** `FEAT-AI-03`
- **Phân hệ:** AI Module (Dành cho Developer Mode)
- **Trạng thái:** `01.draft` (Chờ người dùng review)
- **Độ ưu tiên:** `P2 (High - Trợ lý kỹ thuật thông minh)`

---

### 1. Mục Tiêu (User Story)

Là lập trình viên hoặc nhóm phát triển phần mềm, tôi muốn sử dụng Trợ lý AI để tự động đề xuất tiêu chí nghiệm thu (Acceptance Criteria) và các trường hợp kiểm thử biên (Edge Cases) từ mô tả yêu cầu kỹ thuật; tổng hợp bản thảo Bản tin phát hành (Release Notes) có cấu trúc từ các commit và task trong Sprint; và dán Stack Trace lỗi để nhận 3 bước gỡ lỗi (Debug Steps) có hệ thống, với toàn bộ kết quả ở dạng đề xuất để xem và duyệt trước khi áp dụng.

---

### 2. Luồng Nghiệp Vụ & Sơ Đồ Xử Lý (Business Flow Diagram)

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│               SƠ ĐỒ TRỢ LÝ KỸ THUẬT AI TRONG DEVELOPER MODE (AI PANEL)                 │
└────────────────────────────────────────────────────────────────────────────────────────┘

  [ LẬP TRÌNH VIÊN MỞ PANEL TRỢ LÝ AI (DRAWER CẠNH PHẢI) ]
        │
        │ Kiểm tra 3 điều kiện: (a) Bật Cài đặt, (b) Bật Dự án, (c) Key riêng / Lượt thử
        ▼
  ┌────────────────────────────────────────────────────────┐
  │         AI Panel Viewport (3 Tab Tính Năng)            │
  │ • Hiển thị trạng thái: "Lượt dùng thử: 4/10" hoặc BYOK │
  └──────────────────────────┬─────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
  [ TAB 1: TEST CASES ]    [ TAB 2: RELEASE NOTES ] [ TAB 3: PHÂN TÍCH LOG ]
  • Dán mô tả tính năng    • Chọn Sprint hiện tại   • Dán Stack Trace (max 4.000)
  • Gửi AI sinh AC & Edge  • AI tổng hợp commit &   • Cảnh báo: "Không dán secret"
  • Kết quả: Checkbox list   task DONE trong Sprint • Kết quả: Checklist 3 bước gỡ
  • Duyệt -> Thêm vào Task • Kết quả: Markdown draft  lỗi (Debug Steps) có hệ thống
```

#### 2.1. Quy tắc Sinh Tiêu Chí Nghiệm Thu & Test Cases
- Lập trình viên cung cấp mô tả kỹ thuật của task $\rightarrow$ Gửi prompt tới AI yêu cầu cấu trúc theo định dạng chuẩn `Given - When - Then` cho Acceptance Criteria (AC) và liệt kê 2–3 trường hợp kiểm thử biên (Edge Cases).
- Kết quả trả về hiển thị dạng danh sách checkbox. Lập trình viên có thể tick chọn các tiêu chí ưng ý và bấm nút *"Thêm vào Acceptance Criteria của Task"*.

#### 2.2. Quy tắc Tổng Hợp Bản Tin Phát Hành (Release Notes / Changelog)
- Trích xuất danh sách toàn bộ các task ở cột `DONE` và thông điệp commit tương ứng trong Sprint được chọn.
- AI tổng hợp dự thảo Changelog có phân mục rõ ràng:
  - `Tính năng mới (Features)`
  - `Sửa lỗi (Bug Fixes)`
  - `Cải tiến & Tối ưu (Improvements & Refactoring)`
- Kết quả hiển thị trong khung Markdown có nút *"Sao chép Markdown"* hoặc *"Chỉnh sửa trực tiếp"* trước khi xuất bản.

#### 2.3. Quy tắc Phân Tích Stack Trace & Log Lỗi (Debug Assistant)
- **Giới hạn ký tự & Bộ đếm thời gian thực:**
  - Ô nhập liệu văn bản Monospace giới hạn tối đa 4.000 ký tự.
  - Hiển thị bộ đếm ký tự trực quan (ví dụ: `398 / 4.000`).
- **Cảnh báo bảo mật bắt buộc:**
  - Hiển thị thông báo nổi bật màu cảnh báo: *"Không dán mật khẩu, token hoặc secret vào ô này. Nội dung sẽ được gửi tới nhà cung cấp AI bạn đã chọn."*
- **Checklist gỡ lỗi có hệ thống (Debug Steps):**
  - AI phân tích nguyên nhân cốt lõi (Root Cause) và đề xuất chính xác 3 bước hành động cụ thể để sửa lỗi.
  - Người dùng có thể tick từng bước khi đã kiểm tra xong (ví dụ: `1/3 Hoàn thành`).

#### 2.4. Nguyên Tắc An Toàn & Bảo Mật
1. **Kết quả luôn là đề xuất (No Auto-overwrite):** Mọi kết quả do AI trả về chỉ là bản thảo/gợi ý xem trước, không tự động ghi đè hay cập nhật vào dữ liệu chính của task.
2. **Không ghi log nội dung gửi AI:** Máy chủ backend tuyệt đối không ghi log nội dung prompt, mô tả task, mã lỗi hay Stack Trace vào hệ thống logging.
3. **Làm sạch mã độc (Sanitization):** Nội dung Markdown do AI trả về được lọc sạch bằng DOMPurify trước khi render để phòng chống XSS.

---

### 3. Chi Tiết API Contract

#### 3.1. `POST /api/v1/ai/tasks/{id}/generate-test-cases` - Sinh Acceptance Criteria & Edge Cases
- **Headers:** `Authorization: Bearer <access_token>`
- **Request Body:**
```json
{
  "prompt": "Triển khai xác thực JWT cho API đăng nhập và silent refresh token"
}
```
- **Response Success (HTTP 200 OK):**
```json
{
  "success": true,
  "code": 200,
  "errorCode": null,
  "message": "Sinh Test Cases thành công",
  "data": {
    "acceptanceCriteria": [
      "Given thông tin đăng nhập hợp lệ, When gửi request đăng nhập, Then trả về HTTP 200 và cặp Access Token (15p) & Refresh Token (7 ngày)",
      "Given Access Token hết hạn, When gửi request kèm Refresh Token hợp lệ, Then trả về cặp token mới (Token Rotation)"
    ],
    "edgeCases": [
      "Thử gửi lại Refresh Token đã bị thu hồi để kiểm tra tính năng phát hiện xâm nhập và thu hồi toàn bộ phiên",
      "Thử đăng nhập sai liên tiếp quá 5 lần để kiểm tra cơ chế khóa tạm thời"
    ],
    "trialRemaining": 4
  },
  "errors": null,
  "timestamp": "2026-10-12T15:50:00.000Z"
}
```

#### 3.2. `POST /api/v1/ai/sprints/{id}/release-notes` - Tổng Hợp Release Notes
- **Headers:** `Authorization: Bearer <access_token>`
- **Response Success (HTTP 200 OK):**
```json
{
  "success": true,
  "code": 200,
  "errorCode": null,
  "message": "Tổng hợp Release Notes thành công",
  "data": {
    "sprintName": "Sprint 3 - API & Security",
    "markdown": "# Bản Tin Phát Hành: Sprint 3\n\n### 🚀 Tính Năng Mới\n- **DYL-102** Triển khai xác thực JWT với cơ chế Silent Refresh và Token Rotation.\n\n### 🐛 Sửa Lỗi\n- **DYL-098** Sửa lỗi 500 khi tạo task tiêu đề trống bằng Bean Validation.\n",
    "trialRemaining": 3
  },
  "errors": null,
  "timestamp": "2026-10-12T15:51:00.000Z"
}
```

#### 3.3. `POST /api/v1/ai/debug-assistant` - Phân Tích Log Lỗi
- **Headers:** `Authorization: Bearer <access_token>`
- **Request Body:**
```json
{
  "stackTrace": "io.jsonwebtoken.ExpiredJwtException: JWT expired at 2026-10-12T07:15:20Z..."
}
```
- **Response Success (HTTP 200 OK):**
```json
{
  "success": true,
  "code": 200,
  "errorCode": null,
  "message": "Phân tích lỗi thành công",
  "data": {
    "rootCause": "Access Token đã hết hạn trước khi request được xử lý tại JwtAuthenticationFilter.",
    "steps": [
      {
        "title": "Kiểm tra vòng đời Access Token",
        "description": "Access token đã hết hạn 15 phút. Xác nhận client có tự động kích hoạt flow refresh token trước khi gửi request tới API bảo mật hay không."
      },
      {
        "title": "Bắt ngoại lệ ExpiredJwtException trong Filter",
        "description": "Bọc khối try/catch trong JwtAuthenticationFilter để trả về HTTP 401 Unauthorized và mã lỗi ApiResponse('AUTH_ACCESS_TOKEN_EXPIRED') thay vì để văng lỗi 500."
      },
      {
        "title": "Cấu hình Clock Skew",
        "description": "Cấu hình setAllowedClockSkewSeconds(60) trong JwtParser để xử lý chênh lệch đồng hồ giữa server và client."
      }
    ],
    "trialRemaining": 2
  },
  "errors": null,
  "timestamp": "2026-10-12T15:52:00.000Z"
}
```

---

### 4. Cấu Trúc Mã Nguồn Backend (`dylask-backend`)

Mã nguồn tổ chức tại module `com.dylask.modules.ai`:

```
com.dylask.modules.ai/
├── controller/
│   ├── AiTestCaseController.java            # API /generate-test-cases
│   ├── AiReleaseNotesController.java        # API /release-notes
│   └── AiDebugAssistantController.java      # API /debug-assistant
├── service/
│   ├── TestCaseGeneratorService.java        # Prompt engineering sinh Given-When-Then
│   ├── ReleaseNotesGeneratorService.java    # Tổng hợp commit/task DONE thành Markdown
│   └── DebugAssistantService.java           # Phân tích Stack Trace thành 3 bước gỡ lỗi
├── prompt/
│   ├── TestCasePromptTemplate.java
│   ├── ReleaseNotesPromptTemplate.java
│   └── DebugAssistantPromptTemplate.java
└── dto/
    ├── request/
    │   ├── GenerateTestCaseRequestDTO.java  # Record: prompt (max 4.000 chars)
    │   └── AnalyzeStackTraceRequestDTO.java # Record: stackTrace (max 4.000 chars)
    └── response/
        ├── TestCaseResultDTO.java           # Record: acceptanceCriteria, edgeCases
        ├── ReleaseNotesResultDTO.java       # Record: sprintName, markdown
        └── DebugAnalysisResultDTO.java      # Record: rootCause, steps
```

---

### 5. Cấu Trúc Mã Nguồn Frontend (`dylask-frontend`)

1. **Giao diện tham chiếu:** `docs/layout-html/developer-ai-panel/layout.html` (Drawer 480px trượt từ cạnh phải, 3 tab: Test Cases, Release Notes, Phân tích log).
2. **Cấu trúc Component:**
   - `src/components/developer/ai/AiPanelDrawer.tsx`: Khung panel trượt từ phải.
   - `src/components/developer/ai/TestCaseGeneratorTab.tsx`: Form sinh kịch bản kiểm thử.
   - `src/components/developer/ai/ReleaseNotesTab.tsx`: Khung hiển thị dự thảo Changelog Markdown.
   - `src/components/developer/ai/LogAnalysisTab.tsx`: Ô dán Stack Trace monospace có đếm ký tự `398 / 4.000`, cảnh báo secret và checklist gỡ lỗi.
3. **Custom Hook `useDeveloperAi`:**
   - Quản lý trạng thái mở/đóng drawer, gọi API và copy kết quả vào Clipboard.

---

### 6. Tiêu Chí Nghiệm Thu & Ma Trận Kiểm Thử (Test Matrix)

| ID | Tình huống kiểm thử | Dữ liệu đầu vào | Kết quả mong đợi |
|---|---|---|---|
| **TC-AIDEV-01** | Sinh Test Cases thành công | Mô tả kỹ thuật hợp lệ | Trả về danh sách Acceptance Criteria dạng Given-When-Then và Edge Cases. |
| **TC-AIDEV-02** | Thêm AC vào Task | Tick chọn 2 tiêu chí và bấm Thêm | Tiêu chí được thêm vào trường `description` của task; không tự động đè mất nội dung cũ. |
| **TC-AIDEV-03** | Tổng hợp Release Notes | Sprint có 3 task DONE | Trả về bản tin Markdown phân chia đúng 3 mục: Features, Bug Fixes, Improvements. |
| **TC-AIDEV-04** | Phân tích Stack Trace lỗi | Dán ExpiredJwtException | AI đề xuất chính xác 3 bước gỡ lỗi có hệ thống, hiển thị checklist để tick từng bước. |
| **TC-AIDEV-05** | Dán log vượt quá 4.000 ký tự | Dán văn bản 4.500 ký tự | Ô input tự chặn tại ký tự 4.000, hiển thị cảnh báo đỏ và không cho gửi quá giới hạn. |
| **TC-AIDEV-06** | Không ghi log bảo mật trên server | Gửi request chứa log lỗi | File log SLF4J của server hoàn toàn không ghi nội dung stack trace hoặc prompt. |
