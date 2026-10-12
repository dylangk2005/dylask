# Đặc Tả Tính Năng: FEAT-DEV-02
## Markdown Editor, Command Palette (`Ctrl+K`) & Focus Coding

- **Mã tính năng:** `FEAT-DEV-02`
- **Phân hệ:** Developer Mode
- **Trạng thái:** `01.draft` (Chờ người dùng review)

---

### 1. Mục tiêu (User Story)
Là lập trình viên yêu thích thao tác bàn phím, tôi muốn viết ghi chú bằng Markdown với tô màu cú pháp, mở thanh lệnh nhanh bằng `Ctrl + K` và có chế độ Focus Coding không bị xao nhãng.

### 2. Luồng nghiệp vụ
1. **Markdown Editor & Syntax Highlighting:**
   - Hỗ trợ format code blocks (JS, TS, Java, Python, SQL, JSON, YAML).
2. **Command Palette (`Ctrl + K` / `Cmd + K`):**
   - Phím tắt mở cửa sổ tìm kiếm lệnh tức thời.
   - Hỗ trợ các lệnh: `> create task`, `> switch project`, `> toggle mode`, `> my tasks`.
3. **Focus Coding Mode:**
   - Ẩn toàn bộ thanh điều hướng bên ngoài.
   - Chỉ giữ: Tên Task, Nút copy Git branch, Đồng hồ đếm giờ làm việc (`actual_hours`).

### 4. Tiêu chí nghiệm thu (Acceptance Criteria)
- [ ] Render Markdown chuẩn, hỗ trợ syntax highlighting cho các ngôn ngữ phổ biến.
- [ ] Bấm `Ctrl + K` (hoặc `Cmd + K`) mở popup Command Palette tức thì và thực hiện được các phím tắt điều hướng.
