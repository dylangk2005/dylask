# Đặc Tả Tính Năng: FEAT-AI-03
## Sinh Test Cases, Tóm Tắt Release Notes & Phân Tích Log Lỗi

- **Mã tính năng:** `FEAT-AI-03`
- **Phân hệ:** AI Module (Dành cho Developer Mode)
- **Trạng thái:** `01.draft` (Chờ người dùng review)

---

### 1. Mục tiêu (User Story)
Là lập trình viên, tôi muốn nhờ AI sinh Test Cases/Acceptance Criteria từ mô tả task, tổng hợp Release Notes khi kết thúc Sprint và gợi ý bước debug khi dán log lỗi.

### 2. Luồng nghiệp vụ
1. **Sinh Acceptance Criteria & Test Cases:**
   - Đọc mô tả task $\rightarrow$ Sinh kịch bản kiểm thử dạng `Given - When - Then` và các trường hợp kiểm thử biên (Edge Cases).
2. **Tổng hợp Release Notes (Changelog):**
   - Đọc danh sách các task `DONE` trong Sprint $\rightarrow$ Tổng hợp thành bản tin phát hành Markdown: Features mới, Bug fixes, Refactor.
3. **Phân tích Stack Trace lỗi:**
   - Dán log lỗi vào task $\rightarrow$ AI phân tích nguyên nhân tiềm ẩn và gợi ý 3 bước kiểm tra/sửa lỗi.

### 3. API Contract
- `POST /api/v1/ai/tasks/{id}/generate-test-cases` $\rightarrow$ Trả về AC & Test cases.
- `POST /api/v1/ai/sprints/{id}/release-notes` $\rightarrow$ Trả về nội dung Markdown changelog.
- `POST /api/v1/ai/debug-assistant` $\rightarrow$ Request: `{ stackTrace }` $\rightarrow$ Trả về danh sách bước debug.

### 4. Tiêu chí nghiệm thu (Acceptance Criteria)
- [ ] Sinh Acceptance Criteria dạng `Given - When - Then` và Edge Cases từ mô tả task.
- [ ] Tổng hợp Release Notes định dạng Markdown có phân mục Features, Bugs, Refactor từ Sprint.
- [ ] Phân tích Exception Stack Trace thành checklist gỡ lỗi có logic.
