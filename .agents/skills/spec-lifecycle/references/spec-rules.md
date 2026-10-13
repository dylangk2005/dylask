# Quy Chuẩn Quản Lý Đặc Tả Dylask Web

## 1. Nguyên tắc Spec-Driven Development
- Không bắt đầu viết code khi chưa có Spec được duyệt tại `docs/specs/02.approved/`.
- Mọi tài liệu spec phải trả lời được các câu hỏi:
  - Mục tiêu và đối tượng sử dụng (Standard vs Developer Mode)?
  - Dữ liệu và bảng cơ sở dữ liệu liên quan là gì?
  - Các endpoint API nào cần cung cấp (`/api/v1/...`)?
  - Giao diện và tương tác người dùng như thế nào (dẫn chứng từ `docs/layout-html/`)?
  - Các ca kiểm thử (Acceptance Criteria & Edge Cases)?

## 2. Quy ước đặt tên file Spec
- Dạng mã tính năng: `FEAT-<PHÂN_HỆ>-<SỐ_THỨ_TỰ>-<tên-ngắn-gọn>.md`
- Ví dụ:
  - `FEAT-AUTH-01-jwt-authentication.md`
  - `FEAT-STD-01-core-task-and-checklists.md`
  - `FEAT-DEV-01-sprint-kanban-board.md`
  - `FEAT-AI-01-ai-settings-byok.md`
