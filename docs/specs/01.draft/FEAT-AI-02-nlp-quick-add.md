# Đặc Tả Tính Năng: FEAT-AI-02
## Nhập Liệu Tự Nhiên (NLP Quick-Add) & Gợi Ý Chia Nhỏ Việc

- **Mã tính năng:** `FEAT-AI-02`
- **Phân hệ:** AI Module (Dành cho Standard Mode)
- **Trạng thái:** `01.draft` (Chờ người dùng review)

---

### 1. Mục tiêu (User Story)
Là người dùng cá nhân, tôi muốn gõ câu văn tự do để AI tự trích xuất thành task có deadline, hoặc nhờ AI chia nhỏ việc lớn thành 3-5 bước checklist cụ thể.

### 2. Luồng nghiệp vụ
1. **NLP Quick-Add:**
   - Người dùng gõ: *"Đóng tiền điện trước 18h thứ Năm tới"*.
   - AI phân tích $\rightarrow$ Tạo task: Tiêu đề: "Đóng tiền điện", Due Date: Thứ Năm 18h.
2. **Gợi ý chia nhỏ checklist:**
   - Bấm nút "✨ Chia nhỏ bằng AI" trên task: *"Dọn dẹp phòng làm việc"*.
   - AI sinh danh sách 3-5 sub-items checklist hành động cụ thể.

### 3. API Contract
- `POST /api/v1/ai/parse-task` $\rightarrow$ Request: `{ text }` $\rightarrow$ Response: `{ title, dueDate, priority }`.
- `POST /api/v1/ai/tasks/{id}/suggest-checklists` $\rightarrow$ Response: `[{ title }]`.

### 4. Tiêu chí nghiệm thu (Acceptance Criteria)
- [ ] Phân tích chính xác câu tiếng Việt có chứa mốc thời gian thành task có `dueDate` hợp lệ.
- [ ] Gợi ý chia nhỏ checklist trả về 3-5 sub-items có nghĩa và gắn trực tiếp vào task khi người dùng bấm đồng ý.
