# Danh Sách Agent Skills - Dự Án Dylask Web

Thư mục `.agents/skills/` chứa các **Skills** tùy chỉnh chuẩn hóa theo hệ thống **Antigravity Customization System** dành riêng cho dự án Dylask Web.

---

## 🚀 Danh Sách Skills Chính Thức

| Tên Skill | Mục Đích & Phạm Vi Kích Hoạt | Đường Dẫn |
|---|---|---|
| **`spec-lifecycle`** | Quản lý vòng đời đặc tả (Spec-Driven Development): kiểm tra duyệt spec (`01.draft` -> `02.approved`), chạy test suite xác thực, chuyển lưu trữ vào `03.archive`. | [spec-lifecycle/SKILL.md](./spec-lifecycle/SKILL.md) |
| **`flyway-db-migration`** | Thiết kế CSDL MySQL 8.4, sinh file Flyway Migration (`V{n}__...sql`), đảm bảo Audit columns và mapping JPA Entity (Hibernate 6 / Java 25). | [flyway-db-migration/SKILL.md](./flyway-db-migration/SKILL.md) |
| **`spring-backend-dev`** | Phát triển module backend Spring Boot 4 (`com.dylask.modules.<name>`) theo chuẩn Modular Monolith: Controller (`ApiResponse<T>`), Service, Repository, DTO, MapStruct, Exception. | [spring-backend-dev/SKILL.md](./spring-backend-dev/SKILL.md) |
| **`react-frontend-dev`** | Phát triển giao diện React 19 / TypeScript / Vite 8: xây dựng UI component (Dual-Mode), custom hooks, types an toàn (không dùng `any`), API client, đối chiếu layout từ `docs/layout-html`. | [react-frontend-dev/SKILL.md](./react-frontend-dev/SKILL.md) |
| **`custom-skill-template`** | Thư mục mẫu chứa khung sườn chuẩn để nhân bản khi cần tạo thêm workflow mới. | [custom-skill-template/SKILL.md](./custom-skill-template/SKILL.md) |

---

## 🏛️ Cấu Trúc Tổng Thể

```text
.agents/skills/
├── spec-lifecycle/
│   ├── SKILL.md
│   ├── scripts/verify-spec-state.ps1
│   └── references/spec-rules.md
├── flyway-db-migration/
│   ├── SKILL.md
│   ├── scripts/new-migration.ps1
│   └── references/mysql-jpa-rules.md
├── spring-backend-dev/
│   ├── SKILL.md
│   └── references/api-response-conventions.md
├── react-frontend-dev/
│   ├── SKILL.md
│   └── references/dual-mode-dx.md
├── custom-skill-template/
└── README.md
```

---

## 💡 Cách Tạo Thêm Skill Mới
1. Sao chép thư mục `custom-skill-template/` và đổi tên thành tên skill của bạn (`kebab-case`).
2. Chỉnh sửa `SKILL.md` với frontmatter `name` và `description` rõ ràng (nêu rõ điều kiện khi nào AI nên kích hoạt).
3. Antigravity áp dụng cơ chế **Progressive Disclosure**, tự động phát hiện và nạp skill khi có ngữ cảnh phù hợp mà không làm tràn context window.
