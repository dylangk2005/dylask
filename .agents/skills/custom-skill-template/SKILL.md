---
name: custom-skill-template
description: >-
  Use this skill when you need a template or baseline procedure for creating custom workflows.
  Replace this description with specific triggers for your skill (e.g., when the user asks to perform X, debug Y, or deploy Z).
---

# Tên Quy Trình / Skill

Mô tả ngắn gọn mục đích của Skill này và kết quả mong đợi sau khi thực hiện.

---

## 1. Điều kiện tiên quyết (Prerequisites)
- Các công cụ, biến môi trường hoặc trạng thái cần chuẩn bị trước khi bắt đầu.
- Ví dụ: Docker container đang chạy, dependencies đã được cài đặt (`npm install` hoặc `./mvnw install`).

---

## 2. Quy trình thực hiện (Step-by-Step Procedure)

### Bước 1: Chuẩn bị và Kiểm tra
- Hướng dẫn AI kiểm tra trạng thái hiện tại.
- Có thể tham khảo tài liệu kỹ thuật tại: [references/guide.md](./references/guide.md)

### Bước 2: Thực thi tác vụ chính
- Chạy script hỗ trợ hoặc lệnh cụ thể:
  ```powershell
  # Chạy script tự động nếu có
  powershell -ExecutionPolicy Bypass -File ./scripts/run.ps1
  ```
- Hoặc thực hiện các thay đổi code theo mẫu tại: [examples/example.md](./examples/example.md)

### Bước 3: Xác thực kết quả (Validation Steps)
- Tiêu chí đánh giá thành công:
  - [ ] Lệnh build/test chạy thành công không có lỗi.
  - [ ] Kiểm tra phản hồi hoặc file log đầu ra.

---

## 3. Xử lý sự cố thường gặp (Troubleshooting)
- **Lỗi A**: Cách xử lý khi gặp lỗi kết nối hoặc build fail.
- **Lỗi B**: Khắc phục xung đột cấu hình.
