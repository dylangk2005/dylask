# Đặc Tả Kỹ Thuật Chi Tiết: FEAT-AI-02
## Nhập Liệu Tự Nhiên (NLP Quick-Add) & Gợi Ý Chia Nhỏ Mục Tiêu Thành Checklists

- **Mã tính năng:** `FEAT-AI-02`
- **Phân hệ:** AI Module (Dành cho Standard Mode)
- **Trạng thái:** `01.draft` (Chờ người dùng review)
- **Độ ưu tiên:** `P2 (High - Trợ lý thông minh cho đời sống)`

---

### 1. Mục Tiêu (User Story)

Là người dùng cá nhân bận rộn, tôi muốn gõ câu văn tự nhiên bằng tiếng Việt (ví dụ: *"Đóng tiền điện trước 18h thứ Năm tới"*) để hệ thống tự động bóc tách thành công việc có tiêu đề và thời hạn chính xác mà không tốn công chọn lịch thủ công; hoặc nhờ AI đề xuất chia nhỏ một mục tiêu lớn (ví dụ: *"Dọn dẹp phòng làm việc"*) thành 3–5 bước checklist hành động cụ thể, với kết quả luôn hiển thị dạng đề xuất xem trước để tôi duyệt trước khi lưu.

---

### 2. Luồng Nghiệp Vụ & Sơ Đồ Xử Lý (Business Flow Diagram)

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│           SƠ ĐỒ BÓC TÁCH NLP: ƯU TIÊN LUẬT (RULE-BASED) -> FALLBACK AI (BYOK/TRIAL)     │
└────────────────────────────────────────────────────────────────────────────────────────┘

  [ NGƯỜI DÙNG NHẬP CÂU TỰ NHIÊN ]: "Đóng tiền điện trước 18h thứ Năm tới"
        │
        │ Bấm Enter / Gửi phân tích
        ▼
  ┌────────────────────────────────────────────────────────┐
  │ BƯỚC 1: THƯ VIỆN BÓC TÁCH QUY TẮC CỤC BỘ (RULE-BASED)  │
  │ • Thư viện date-time parser (Java / Regex tiếng Việt)  │
  │ • Không tốn chi phí, không cần mạng, tốc độ < 5ms      │
  └──────────────────────────┬─────────────────────────────┘
                             │
         ┌───────────────────┴───────────────────┐
         │                                       │
         ▼                                       ▼
  [ PARSE BẰNG LUẬT THÀNH CÔNG ]          [ PARSE BẰNG LUẬT THẤT BẠI ]
  • Tiêu đề: "Đóng tiền điện"             • Câu văn phức tạp, ngữ nghĩa trừu tượng
  • Hạn chót: Thứ Năm 18:00 (UTC+7)       │
  • Source: "rule"                        ▼
  • HOÀN TOÀN KHÔNG GỌI AI                ┌──────────────────────────────────────────┐
                                          │ BƯỚC 2: FALLBACK GỌI AI (BYOK HOẶC TRIAL)│
                                          │ • Kiểm tra 3 điều kiện kích hoạt         │
                                          │ • Gửi prompt kèm clientTime & timeZone   │
                                          │ • Trả về JSON theo schema cố định        │
                                          │ • Trừ 1 lượt thử (nếu chưa có key riêng) │
                                          └────────────────────┬─────────────────────┘
                                                               │
                                                               ▼
                                          ┌──────────────────────────────────────────┐
                                          │ BƯỚC 3: HIỂN THỊ ĐỀ XUẤT XEM TRƯỚC       │
                                          │ • Không tự động ghi vào DB               │
                                          │ • Người dùng bấm [Xác nhận] mới lưu task │
                                          └──────────────────────────────────────────┘
```

#### 2.1. Quy tắc Ưu tiên Bóc tách bằng Luật (Rule-Based First)
- Hệ thống luôn ưu tiên giải thuật bóc tách thời gian cục bộ (date-time regex & natural language parser) trước tiên.
- Chỉ khi câu văn không chứa mẫu nhận diện ngày giờ rõ ràng hoặc phân tích thất bại mới kích hoạt cuộc gọi API AI.
- Điều này giúp:
  - Tốc độ phản hồi tức thì (<10ms).
  - Tiết kiệm 10 lượt dùng thử hàng tháng của người dùng.
  - Không làm phát sinh chi phí hay phụ thuộc vào mạng khi nhập liệu thông thường.

#### 2.2. Quy tắc Gọi AI & Điều Kiện Kích Hoạt
- **3 Điều kiện kích hoạt:**
  1. Công tắc AI trong Cài đặt đang BẬT (`users.ai_enabled = TRUE`).
  2. Công tắc AI của danh mục/dự án đang BẬT (`projects.is_ai_enabled = TRUE`).
  3. Người dùng đã cấu hình API Key riêng (BYOK) **HOẶC** còn lượt dùng thử trong tháng (`ai_trial_count < 10`).
- **Trừ lượt dùng thử:**
  - Nếu người dùng đã nhập key riêng: Gọi qua key cá nhân của người dùng, không giới hạn lượt gọi.
  - Nếu người dùng chưa nhập key riêng: Trừ 1 lượt vào hạn mức dùng thử (`ai_trial_count += 1`). Nếu đã hết 10 lượt, từ chối gọi và báo lỗi `AI_TRIAL_LIMIT_EXCEEDED`.

#### 2.3. Nguyên Tắc An Toàn & Trải Nghiệm (Safety Principles)
1. **Kết quả AI luôn là đề xuất (Preview First):** Tuyệt đối không tự động ghi dữ liệu vào bảng `tasks` hay `task_checklists`. Kết quả luôn được render dưới dạng Preview Modal/Card để người dùng duyệt và bấm *"Xác nhận tạo"* hoặc chỉnh sửa lại.
2. **JSON Schema cố định:** Backend yêu cầu AI trả về JSON hợp lệ và validate chặt chẽ trước khi trả về client.
3. **Làm sạch mã độc (Sanitization):** Nội dung Markdown do AI trả về được lọc sạch bằng DOMPurify để chống tấn công XSS.
4. **Giới hạn đầu vào & Cảnh báo bí mật:** Giới hạn input tối đa 4.000 ký tự. Luôn hiển thị cảnh báo: *"Không dán mật khẩu, token hoặc secret vào ô này. Nội dung sẽ được gửi tới nhà cung cấp AI bạn đã chọn."*

---

### 3. Chi Tiết API Contract

#### 3.1. `POST /api/v1/ai/parse-task` - Phân Tích Câu Tự Nhiên
- **Headers:** `Authorization: Bearer <access_token>`
- **Request Body:**
```json
{
  "text": "Đóng tiền điện trước 18h thứ Năm tới",
  "clientTime": "2026-10-12T19:40:00+07:00",
  "timeZone": "Asia/Ho_Chi_Minh"
}
```
- **Response Success (HTTP 200 OK - Parse bằng luật):**
```json
{
  "success": true,
  "code": 200,
  "errorCode": null,
  "message": "Phân tích thành công bằng luật",
  "data": {
    "title": "Đóng tiền điện",
    "dueDate": "2026-10-15T18:00:00.000Z",
    "priority": "medium",
    "source": "rule",
    "trialRemaining": 6
  },
  "errors": null,
  "timestamp": "2026-10-12T15:45:00.000Z"
}
```

#### 3.2. `POST /api/v1/ai/tasks/{id}/suggest-checklists` - Đề Xuất Chia Nhỏ Mục Tiêu
- **Headers:** `Authorization: Bearer <access_token>`
- **Request Body:**
```json
{
  "maxItems": 5
}
```
- **Response Success (HTTP 200 OK):**
```json
{
  "success": true,
  "code": 200,
  "errorCode": null,
  "message": "Đề xuất danh sách checklist thành công",
  "data": {
    "items": [
      { "title": "Thu dọn tài liệu và sách vở trên bàn" },
      { "title": "Lau bụi màn hình và bàn phím máy tính" },
      { "title": "Phân loại và vứt rác, giấy vụn không dùng" }
    ],
    "trialRemaining": 5
  },
  "errors": null,
  "timestamp": "2026-10-12T15:46:00.000Z"
}
```

---

### 4. Cấu Trúc Mã Nguồn Backend (`dylask-backend`)

Mã nguồn tổ chức tại module `com.dylask.modules.ai`:

```
com.dylask.modules.ai/
├── controller/
│   ├── AiTaskParserController.java          # API /api/v1/ai/parse-task
│   └── AiChecklistSuggestionController.java # API /api/v1/ai/tasks/{id}/suggest-checklists
├── service/
│   ├── TaskNlpParserService.java            # Điều phối: Thử parse luật -> fallback AI
│   └── ChecklistDecomposeService.java       # Sinh 3-5 bước checklist con
├── parser/
│   └── VietnameseDateTimeRuleParser.java    # Bộ phân tích quy tắc ngày giờ tiếng Việt
├── prompt/
│   ├── TaskExtractionPromptTemplate.java    # System prompt trích xuất task (JSON Schema)
│   └── ChecklistDecomposePromptTemplate.java# System prompt chia nhỏ mục tiêu
└── dto/
    ├── request/
    │   ├── ParseTaskNlpRequestDTO.java      # Record: text, clientTime, timeZone
    │   └── SuggestChecklistRequestDTO.java  # Record: maxItems
    └── response/
        ├── ParsedTaskPreviewDTO.java        # Record: title, dueDate, priority, source
        └── SuggestedChecklistResponseDTO.java# Record: items, trialRemaining
```

---

### 5. Cấu Trúc Mã Nguồn Frontend (`dylask-frontend`)

1. **Giao diện tham chiếu:**
   - Ô nhập NLP trên danh sách: `docs/layout-html/standard-list/layout.html`.
   - Nút "Chia nhỏ bằng AI" và Modal đề xuất: `docs/layout-html/standard-task-modal/layout.html`.
2. **Cấu trúc Component:**
   - `src/components/task/NlpQuickAddBar.tsx`: Ô nhập liệu có icon đũa thần và badge nguồn ("Luật" hoặc "AI").
   - `src/components/task/AiChecklistPreviewDialog.tsx`: Modal hiển thị các dòng checklist đề xuất kèm checkbox để người dùng chọn những mục ưng ý trước khi bấm "Thêm vào task".
3. **Custom Hook `useAiTaskHelper`:**
   - Xử lý gọi API phân tích, quản lý trạng thái loading skeleton và hiển thị lỗi nếu hết lượt thử.

---

### 6. Tiêu Chí Nghiệm Thu & Ma Trận Kiểm Thử (Test Matrix)

| ID | Tình huống kiểm thử | Dữ liệu đầu vào | Kết quả mong đợi |
|---|---|---|---|
| **TC-NLP-01** | Bóc tách bằng luật thành công | "Đóng tiền điện trước 18h thứ Năm tới" | Trả về `source: "rule"`, hạn chót đúng ngày thứ Năm 18h, KHÔNG trừ lượt dùng thử. |
| **TC-NLP-02** | Fallback AI khi luật thất bại | "Cuối tuần này rảnh thì ghé siêu thị mua ít trái cây" | Gọi AI thành công, trích xuất title = "Mua trái cây tại siêu thị", `source: "ai"`, trừ 1 lượt thử. |
| **TC-NLP-03** | Chia nhỏ mục tiêu lớn | Task: "Dọn dẹp phòng làm việc" | AI trả về 3–5 bước checklist hành động cụ thể ở dạng đề xuất xem trước. |
| **TC-NLP-04** | Người dùng duyệt đề xuất checklist | Chọn 3/4 mục và bấm "Xác nhận" | Hệ thống chỉ thêm 3 mục đã chọn vào task trong DB; không tự động lưu mục bị bỏ tick. |
| **TC-NLP-05** | Hết 10 lượt thử và chưa có key riêng | `ai_trial_count = 10`, `hasCustomKey = false` | Nút "Chia nhỏ bằng AI" mờ (disabled) kèm tooltip chỉ dẫn vào Cài đặt > AI. |
| **TC-NLP-06** | Giới hạn ký tự và cảnh báo | Nhập câu văn dài > 4.000 ký tự | Bị chặn với lỗi `AI_INPUT_EXCEEDS_LIMIT`, hiển thị cảnh báo không dán secret. |
