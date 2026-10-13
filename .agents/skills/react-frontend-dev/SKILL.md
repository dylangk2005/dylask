---
name: react-frontend-dev
description: >-
  Use this skill when developing frontend features for dylask-frontend, building React 19 components,
  TypeScript interfaces, custom hooks, API clients, or translating HTML/CSS prototypes from docs/layout-html.
---

# Quy Trình Phát Triển Frontend (React 19 / TypeScript / Vite 8)

Ứng dụng `dylask-frontend` là Single Page Application (SPA) hỗ trợ **Dual-Mode** (Standard Mode & Developer Mode) được xây dựng bằng **React 19**, **TypeScript** và **Vite 8**.

---

## 📚 Tài Liệu Tham Khảo Kỹ Thuật (References)
- [API Client & Request Wrapper Guide](./references/api-client-guide.md): Fetch wrapper chuẩn, quản lý token và xử lý lỗi `ApiError`.
- [HTML Prototype Migration Guide](./references/layout-migration-guide.md): Bảng tra cứu layout HTML từ `docs/layout-html/` và hướng dẫn chuyển sang JSX.
- [Dual-Mode Architecture & Styling](./references/dual-mode-dx.md): Kiến trúc chuyển đổi giao diện Standard vs Developer Mode.

---

## 🏛️ Cấu Trúc Thư Mục Chuẩn (`src/`)

Bắt buộc sử dụng Path Alias `@/*` cho mọi import nội bộ (ví dụ: `import { api } from '@/api/client'`).

```text
src/
├── api/          # Client gọi API Backend (@/api/client, @/api/taskApi...)
├── components/   # UI components tái sử dụng
│   ├── common/   # Button, Input, Modal, Dropdown, Spinner...
│   ├── layout/   # Sidebar, Header, PageContainer...
│   ├── standard/ # Component cho Standard Mode (Pomodoro, Checklist...)
│   └── developer/# Component cho Developer Mode (Kanban, GitBranchButton...)
├── pages/        # Các màn hình view theo URL route
├── hooks/        # Custom React hooks (quản lý state & API effects)
├── routes/       # Cấu hình React Router DOM
├── types/        # TypeScript interfaces và types (CẤM dùng 'any')
└── utils/        # Hàm tiện ích thuần túy (date formatting, calculations...)
```

---

## ✅ Checklist Lập Trình Frontend Feature (Execution Checklist)

### 1. Chuẩn Bị Spec & Prototype
- [ ] Mở file spec đã duyệt trong `docs/specs/02.approved/`.
- [ ] Mở file HTML tương ứng trong `docs/layout-html/` theo hướng dẫn tại [layout-migration-guide.md](./references/layout-migration-guide.md).

### 2. Định Nghĩa Types (`src/types/`)
- [ ] Định nghĩa đầy đủ interface cho dữ liệu và DTO Request/Response.
- [ ] **NGHIÊM CẤM dùng `any`**. Sử dụng Union types, Generics hoặc `unknown` kèm type guards.

### 3. Viết API Client (`src/api/`)
- [ ] Sử dụng helper `api.get`, `api.post`, `api.put`, `api.delete` từ `@/api/client`.
- [ ] Trả về đúng kiểu dữ liệu Generic (`Promise<TaskItem>`).

### 4. Viết Custom Hook (`src/hooks/`)
- [ ] Tách toàn bộ logic gọi API và state (`loading`, `error`, `data`) ra khỏi component.
- [ ] Cung cấp hàm `refetch` hoặc các action (`createTask`, `deleteTask`) với xử lý optimistic UI nếu cần.

### 5. Dựng Giao Diện Component & Page (`src/components/`, `src/pages/`)
- [ ] Chuyển đổi mã HTML/CSS sang JSX chuẩn (`className`, `htmlFor`, đóng thẻ tự đóng).
- [ ] Xử lý đầy đủ 3 trạng thái giao diện: **Loading** (hiển thị skeleton/spinner), **Error** (thông báo lỗi và nút thử lại), **Empty / Data** (danh sách trống hoặc hiển thị dữ liệu).

### 6. Kiểm Thử Build & Type-Check (Verification)
Chạy lệnh kiểm tra tính toàn vẹn:
```powershell
cd dylask-frontend
npm run build
npm run lint
```
Đảm bảo 0 lỗi TypeScript và 0 cảnh báo ESLint.
