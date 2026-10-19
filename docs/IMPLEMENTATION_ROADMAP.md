# Lộ Trình Triển Khai Phát Triển Dự Án Dylask Web (Implementation Roadmap)

- **Trạng thái:** Đang tiến hành (In Progress)
- **Kiến trúc:** Modular Monolith (Spring Boot 4 / Java 25) & Single Page Application (React 19 / TypeScript / Vite 8)
- **Phương pháp luận:** Spec-Driven Development (SDD) & Test-Driven Development (TDD)
- **Tài liệu tham chiếu:** [AGENTS.md](file:///D:/dylann/my-apps/dylask-web/AGENTS.md) | [02.approved/README.md](file:///D:/dylann/my-apps/dylask-web/docs/specs/02.approved/README.md) | [DESIGN.md](file:///D:/dylann/my-apps/dylask-web/docs/layout-html/DESIGN.md)

---

## 🚦 Quy Chuẩn Vận Hành Cho Từng Tính Năng (Execution Protocol)

Mỗi tính năng trong bất kỳ giai đoạn nào đều **bắt buộc** thực hiện theo chu trình khép kín 8 bước sau:

```text
1. Check Spec (02.approved) ──> 2. Flyway Migration ──> 3. Backend Module ──> 4. Frontend Component
                                                                                     │
8. Archive Spec (03.archive) <── 7. Git Commit <── 6. Chờ User Review & Duyệt OK <── 5. Viết Test
```

1. **Kiểm tra trạng thái Spec:** Xác nhận spec nằm trong [`docs/specs/02.approved/`](file:///D:/dylann/my-apps/dylask-web/docs/specs/02.approved/).
2. **Flyway Migration (CSDL):** Tạo file `V{version}__{description}.sql` trong `dylask-backend/src/main/resources/db/migration/` (tuân thủ chuẩn `snake_case`, InnoDB, audit columns).
3. **Hiện thực Backend:** Xây dựng module độc lập tại `com.dylask.modules.<module>` (`entity`, `dto`, `mapper`, `repository`, `service`, `controller`) trả về `ApiResponse<T>`.
4. **Hiện thực Frontend:** Dựng components từ bản mẫu [`docs/layout-html/`](file:///D:/dylann/my-apps/dylask-web/docs/layout-html/), định nghĩa Types (cấm `any`), API Client và Custom Hook.
5. **Kiểm thử tự động (Testing):**
   - Backend: Viết Unit / Integration Test (sử dụng JUnit 5, Mockito, MockMvc). Chạy lệnh:
     ```powershell
     cd dylask-backend
     .\mvnw.cmd test
     ```
   - Frontend: Kiểm tra type check và build không lỗi:
     ```powershell
     cd dylask-frontend
     npm run build
     npm run lint
     ```
6. ⚠️ **Báo cáo & Chờ User Review Duyệt (Bắt buộc):**
   - AI tổng hợp chi tiết các file đã tạo/sửa, giải thích logic và báo cáo kết quả kiểm thử cho User.
   - **AI TUYỆT ĐỐI KHÔNG TỰ Ý COMMIT.** Chỉ khi User review xong và gửi phản hồi xác nhận "OK" / duyệt thì mới chuyển sang Bước 7.
7. **Git Commit chuẩn Conventional Commits:**
   - Cú pháp: `<type>(<scope>): <mô tả ngắn> (<MÃ-SPEC>)`
   - Ví dụ: `feat(auth): implement jwt authentication and refresh token (FEAT-AUTH-01)`
   - Phân loại type: `feat`, `fix`, `test`, `refactor`, `chore`, `docs`.
8. **Lưu trữ Spec:** Di chuyển file spec từ `docs/specs/02.approved/` sang `docs/specs/03.archive/`.

---

## 📅 Bảng Tổng Quan Các Giai Đoạn (Phases Overview)

| Giai đoạn | Tên Giai Đoạn | Mục Tiêu Chính | Mức Độ Ưu Tiên |
|---|---|---|---|
| **Phase 0** | **Hạ Tầng & Thành Phần Dùng Chung** | Khởi tạo cấu hình, Database V1, ApiResponse wrapper, Security/CORS, Design Tokens, Routing | **P0 - Cực kỳ khẩn cấp** |
| **Phase 1** | **Xác Thực & Quản Lý Người Dùng** | Đăng ký, Đăng nhập JWT, Quản lý tài khoản và Chuyển đổi Dual-Mode | **P1 - Rất cao** |
| **Phase 2** | **Quản Lý Công Việc Chế Độ Tiêu Chuẩn** | CRUD Task cá nhân, Checklists, Lịch trình, My Day, Pomodoro, Thống kê Streak | **P2 - Cao** |
| **Phase 3** | **Chế Độ Lập Trình Viên & Agile Sprint** | Bảng Kanban kéo thả, Backlog, Markdown Editor, Command Palette, Webhook Git | **P3 - Trung bình** |
| **Phase 4** | **Tích Hợp Trợ Lý AI Chi Phí 0đ (BYOK)** | Quản lý quota 10 lượt/tháng, NLP Quick-Add, Sinh Test Cases & Release Notes | **P4 - Nâng cao** |
| **Phase 5** | **Đóng Gói & Tối Ưu Hóa Triển Khai** | Docker production, E2E testing, CI/CD workflow | **P5 - Hoàn thiện** |

---

## 📋 Chi Tiết Từng Giai Đoạn & Checklist Thực Thi

---

### 🟢 GIAI ĐOẠN 0: HẠ TẦNG & THÀNH PHẦN DÙNG CHUNG (PHASE 0 - FOUNDATION)
*Thời gian dự kiến: Khởi tạo ban đầu | Mức độ ưu tiên: P0*

#### 0.1. Cấu hình Môi trường & Cơ sở dữ liệu:
- [x] Tạo file [`.env`](file:///D:/dylann/my-apps/dylask-web/.env) ở thư mục gốc từ [`.env.example`](file:///D:/dylann/my-apps/dylask-web/.env.example).
- [x] Tạo file [`dylask-frontend/.env`](file:///D:/dylann/my-apps/dylask-web/dylask-frontend/.env) với `VITE_API_BASE_URL=http://localhost:8080/api/v1`.
- [ ] Khởi chạy MySQL container qua lệnh: `docker compose up -d` (Chờ người dùng mở Docker Desktop).
- [x] Tạo migration [`V1__init_schema.sql`](file:///D:/dylann/my-apps/dylask-web/dylask-backend/src/main/resources/db/migration/V1__init_schema.sql) tạo bảng nền tảng `users` và `refresh_tokens`.

#### 0.2. Backend Common Core (`dylask-backend`):
- [x] `com.dylask.common.entity.BaseAuditEntity`: Lớp trừu tượng chứa `@CreatedDate created_at` và `@LastModifiedDate updated_at`.
- [x] `com.dylask.common.dto.ApiResponse<T>` & `PageResponse<T>`: Khung đóng gói response toàn hệ thống (tuân thủ [`api-specs.md`](file:///D:/dylann/my-apps/dylask-web/docs/specs/api-specs.md)).
- [x] `com.dylask.common.exception.ErrorCode` & `AppException`: Hệ thống mã lỗi định danh chuẩn nghiệp vụ.
- [x] `com.dylask.common.exception.GlobalExceptionHandler`: Bắt `@Valid` MethodArgumentNotValidException, AppException và Exception chung.
- [x] `com.dylask.common.config.CorsConfig` & `SecurityConfig`: Cấu hình Security không khóa các public endpoints và cho phép CORS từ `http://localhost:5173`.

#### 0.3. Frontend Common Core (`dylask-frontend`):
- [x] Cài đặt các dependencies cần thiết:
  ```powershell
  npm install react-router-dom lucide-react
  ```
- [x] Thiết lập Design Tokens từ [`docs/layout-html/DESIGN.md`](file:///D:/dylann/my-apps/dylask-web/docs/layout-html/DESIGN.md) vào `src/index.css` (Font Plus Jakarta Sans, JetBrains Mono, biến màu CSS cho cả 2 mode).
- [x] Xây dựng Client API tập trung: `src/api/client.ts` (Fetch wrapper xử lý Bearer Token, unwrap ApiResponse, bắt ApiError).
- [x] Xây dựng Layout dùng chung: `src/components/layout/AppLayout.tsx` với thanh Sidebar Responsive (`src/components/layout/Sidebar.tsx`, `Header.tsx`).
- [x] Thiết lập Routes khung tại `src/routes/AppRoutes.tsx`.

#### 0.4. Kiểm thử & Commit:
- [x] **Test Backend:** Kiểm tra Flyway migration & 100% test pass (`ApiResponseTest`, `GlobalExceptionHandlerTest`).
- [x] **Test Frontend:** Kiểm tra TypeScript compile và Vite build thành công (`npm run build`, `npm run lint`).
- [x] **Git Commit:** `chore(init): setup common architecture, flyway baseline, api wrapper and frontend layout`

---

### 🟡 GIAI ĐOẠN 1: XÁC THỰC & QUẢN LÝ NGƯỜI DÙNG (PHASE 1 - AUTH & PROFILE)
*Mục tiêu: Đăng ký, đăng nhập JWT và chuyển đổi giao diện Standard / Developer.*

#### 1.1. Feature `FEAT-AUTH-01`: Đăng Ký, Đăng Nhập & Xác Thực JWT
- **Tài liệu đặc tả:** [`FEAT-AUTH-01-jwt-authentication.md`](file:///D:/dylann/my-apps/dylask-web/docs/specs/02.approved/FEAT-AUTH-01-jwt-authentication.md)
- **Giao diện mẫu:** [`docs/layout-html/auth/layout.html`](file:///D:/dylann/my-apps/dylask-web/docs/layout-html/auth/layout.html)
- **Công việc thực hiện:**
  - [x] **Backend:** 
    - Xây dựng `TokenService` & `JwtTokenServiceImpl` (Access Token 15 phút, SHA-256 Hashed Refresh Token 7 ngày).
    - Tạo `User`, `RefreshToken`, `UserRepository`, `RefreshTokenRepository`.
    - Tạo `AuthService`, `AuthServiceImpl` (register, login, token rotation, reuse detection, logout).
    - Tạo `RefreshTokenCleanupJob` (@Scheduled cron dọn dẹp token định kỳ 03:00 sáng).
    - Tạo `AuthController` với các endpoints: `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me` (hỗ trợ cả HttpOnly Cookie & Request Body).
    - Cấu hình `JwtAuthenticationFilter` và `JwtAuthenticationEntryPoint` tích hợp Spring Security.
  - [x] **Frontend:**
    - Tạo types: `src/types/auth.ts` (`User`, `LoginRequest`, `RegisterRequest`, `AuthResponse`, `AuthState`).
    - Viết API: `src/api/auth.api.ts` & cấu hình auto silent refresh qua cookie HttpOnly trong `src/api/client.ts`.
    - Viết Context & Hook: `src/context/AuthContext.tsx`, `auth-context.ts` và `src/hooks/useAuth.ts`.
    - Dựng trang `src/pages/auth/AuthPage.tsx` và `auth.css` chuẩn xác từ prototype `docs/layout-html/auth/layout.html`.
    - Tạo `src/components/auth/ProtectedRoute.tsx` bảo vệ các route riêng tư.
    - Tích hợp thông tin tài khoản và nút Đăng xuất vào `src/components/layout/Header.tsx`.
  - [x] **Viết Test:**
    - Backend: `TokenServiceTest` (Unit test sinh token, parse claims, hash token).
    - Backend: `AuthServiceTest` (Unit test register, login, token rotation, reuse detection, token expired, logout - 7 tests).
    - Backend: `RefreshTokenCleanupJobTest` (Unit test cron job dọn dẹp tokens).
    - Backend: `ApiResponseTest` & `GlobalExceptionHandlerTest` (100% 17/17 tests pass).
    - Frontend: Chạy `npm run lint` (0 errors) và `npm run build` (build thành công 1.80s).
  - [x] **Review từ người dùng & Git Commit:** Đã commit `feat(auth): complete JWT auth, 2-step email verification with Gmail SMTP, UI motion rules, and code commenting guidelines`.
  - [x] **Archive Spec:** Đã di chuyển `FEAT-AUTH-01-jwt-authentication.md` vào `docs/specs/03.archive/`.

#### 1.2. Feature `FEAT-AUTH-03`: Đăng Nhập Mạng Xã Hội Qua Google & GitHub (OAuth2 Social Login)
- **Tài liệu đặc tả:** [`FEAT-AUTH-03-oauth2-social-login.md`](file:///D:/dylann/my-apps/dylask-web/docs/specs/03.archive/FEAT-AUTH-03-oauth2-social-login.md)
- **Trạng thái:** `03.archive` (Đã hoàn thành lập trình và 100% kiểm thử tự động)
- **Công việc thực hiện:**
  - [x] **Review Spec:** Đã duyệt spec và chuyển sang thực thi.
  - [x] **Database Migration:** Tạo `V3__add_oauth2_providers.sql` (bổ sung `auth_provider`, `provider_id`, cho phép `password_hash` null, đã migrate version 3 lên MySQL thành công).
  - [x] **Backend:** Tích hợp `spring-boot-starter-oauth2-client`, cấu hình Google & GitHub OAuth2 providers trong `application.yaml`, viết `OAuth2AuthService`, `OAuth2AuthServiceImpl`, `CustomOAuth2UserService`, `OAuth2AuthenticationSuccessHandler`, `OAuth2AuthenticationFailureHandler`, cập nhật `SecurityConfig`.
  - [x] **Frontend:** Thêm component `SocialAuthButtons` với logo SVG chuẩn và hiệu ứng hover/active motion vào `LoginPage` và `RegisterPage`, tạo trang `/oauth2/callback`, xử lý lưu token vào `AuthContext`.
  - [x] **Kiểm thử & Archive:** Viết `OAuth2AuthServiceTest` (4 test cases cho cả Google, GitHub, Account Linking), toàn bộ 22/22 unit tests pass 100%, frontend build thành công, di chuyển spec sang `03.archive/`.

#### 1.3. Feature `FEAT-AUTH-02`: Quản Lý Hồ Sơ & Toggle Dual-Mode
- **Tài liệu đặc tả:** [`FEAT-AUTH-02-dual-mode-toggle.md`](file:///D:/dylann/my-apps/dylask-web/docs/specs/03.archive/FEAT-AUTH-02-dual-mode-toggle.md)
- **Giao diện mẫu:** [`docs/layout-html/settings/layout.html`](file:///D:/dylann/my-apps/dylask-web/docs/layout-html/settings/layout.html)
- **Công việc thực hiện:**
  - [x] **Backend:**
    - Cung cấp `UserController`: `GET /api/v1/users/me`, `PATCH /api/v1/users/me/mode`, `PUT /api/v1/users/me/profile`, `PUT /api/v1/users/me/password`.
    - `UserServiceImpl`: Xử lý lấy hồ sơ, cập nhật họ tên, đổi chế độ mặc định, đổi mật khẩu và thu hồi toàn bộ Refresh Token phiên cũ an toàn.
    - Sửa lỗi tương thích Java 25 bytecode verification constructor tường minh.
  - [x] **Frontend:**
    - Nâng cấp `src/hooks/useDualMode.ts` (Optimistic UI < 16ms, đồng bộ `data-mode` trên thẻ `<html>` và `<body>`, lưu `localStorage`, đồng bộ ngầm backend).
    - Thêm inline theme script trong `index.html` ngăn chặn triệt để hiện tượng FOUC.
    - Xây dựng component `ModeSwitcher.tsx` dạng segmented button gắn tại chân Sidebar và Header.
    - Xây dựng màn hình `src/pages/settings/SettingsPage.tsx` và `settings.css` (3 tabs: Giao diện & Chế độ, Hồ sơ & Bảo mật, Trí tuệ nhân tạo).
  - [x] **Viết Test & Kiểm thử:**
    - Backend: `UserServiceTest` với 9 unit tests bao phủ 100% các tình huống (31/31 unit tests backend pass).
    - Frontend: `npm run lint` (0 errors) và `npm run build` thành công.
    - Kiểm thử tự động trên trình duyệt thành công 100%.
  - [x] **Git Commit:** `feat(user): add profile management and dual mode toggle (FEAT-AUTH-02)`
  - [x] **Archive Spec:** Đã di chuyển `FEAT-AUTH-02-dual-mode-toggle.md` vào `docs/specs/03.archive/`.

---

### 🔵 GIAI ĐOẠN 2: CHẾ ĐỘ TIÊU CHUẨN - STANDARD MODE (PHASE 2 - STANDARD PRODUCTIVITY)
*Mục tiêu: Đạt trải nghiệm quản lý công việc cá nhân, lịch trình và theo dõi kỷ luật.*

#### 2.1. Feature `FEAT-STD-01`: CRUD Task Cá Nhân & Subtask Checklists
- **Spec:** [`FEAT-STD-01-core-task-and-checklists.md`](file:///D:/dylann/my-apps/dylask-web/docs/specs/02.approved/FEAT-STD-01-core-task-and-checklists.md)
- **Prototype:** [`docs/layout-html/standard-list/layout.html`](file:///D:/dylann/my-apps/dylask-web/docs/layout-html/standard-list/layout.html) & [`standard-task-modal/layout.html`](file:///D:/dylann/my-apps/dylask-web/docs/layout-html/standard-task-modal/layout.html)
- **Công việc:**
  - [ ] **Database:** Tạo migration `V2__create_standard_tasks_and_checklists.sql` (bảng `categories`, `tasks`, `task_checklists`).
  - [ ] **Backend:** Xây dựng module `com.dylask.modules.task` (Entities, DTOs, TaskService, TaskController: CRUD task, toggle complete, checklist add/check/delete).
  - [ ] **Frontend:** Tạo `src/pages/standard/StandardTaskListPage.tsx`, `TaskItemRow.tsx`, `TaskModal.tsx`, `ChecklistSection.tsx`.
  - [ ] **Viết Test:** `TaskControllerTest`, `TaskServiceTest` (Unit/Integration test CRUD, checklist sorting).
  - [ ] **Git Commit:** `feat(task): implement personal task crud and subtask checklists (FEAT-STD-01)`
  - [ ] **Archive Spec:** Di chuyển spec vào `03.archive/`.

#### 2.2. Feature `FEAT-STD-02`: Lịch Trình (Calendar) & Công Việc Lặp Lại (Recurring)
- **Spec:** [`FEAT-STD-02-calendar-and-recurring.md`](file:///D:/dylann/my-apps/dylask-web/docs/specs/02.approved/FEAT-STD-02-calendar-and-recurring.md)
- **Prototype:** [`docs/layout-html/calendar/layout.html`](file:///D:/dylann/my-apps/dylask-web/docs/layout-html/calendar/layout.html)
- **Công việc:**
  - [ ] **Backend:** Bổ sung trường recurring (`daily`, `weekly`, `monthly`), cấu hình `@Scheduled` cron tự sinh task lặp lại hàng ngày.
  - [ ] **Frontend:** Tạo `src/pages/standard/CalendarPage.tsx` (Lưới Tháng / Tuần / Ngày, hiển thị task badge theo due date).
  - [ ] **Viết Test:** `RecurringTaskSchedulerTest` (Test tự động sinh task lặp lại).
  - [ ] **Git Commit:** `feat(calendar): implement calendar view and recurring task scheduler (FEAT-STD-02)`
  - [ ] **Archive Spec:** Di chuyển spec vào `03.archive/`.

#### 2.3. Feature `FEAT-STD-03`: Kế Hoạch Hôm Nay (My Day) & Đồng Hồ Pomodoro
- **Spec:** [`FEAT-STD-03-my-day-and-pomodoro.md`](file:///D:/dylann/my-apps/dylask-web/docs/specs/02.approved/FEAT-STD-03-my-day-and-pomodoro.md)
- **Prototype:** [`docs/layout-html/my-day/layout.html`](file:///D:/dylann/my-apps/dylask-web/docs/layout-html/my-day/layout.html)
- **Công việc:**
  - [ ] **Backend:** Bổ sung flag `is_my_day` và bảng `pomodoro_sessions` (lưu số phút tập trung, task liên kết).
  - [ ] **Frontend:** Tạo `src/pages/standard/MyDayPage.tsx`, component `PomodoroWidget.tsx` (đồng hồ 25/5 phút, âm thanh thông báo kết thúc phiên).
  - [ ] **Viết Test:** `PomodoroServiceTest` (Ghi nhận phiên tập trung, reset my day mỗi 00:00).
  - [ ] **Git Commit:** `feat(my-day): add my-day focus list and pomodoro timer (FEAT-STD-03)`
  - [ ] **Archive Spec:** Di chuyển spec vào `03.archive/`.

#### 2.4. Feature `FEAT-STD-04`: Thống Kê & Phân Tích Năng Suất Cá Nhân
- **Spec:** [`FEAT-STD-04-personal-analytics.md`](file:///D:/dylann/my-apps/dylask-web/docs/specs/02.approved/FEAT-STD-04-personal-analytics.md)
- **Prototype:** [`docs/layout-html/standard-analytics/layout.html`](file:///D:/dylann/my-apps/dylask-web/docs/layout-html/standard-analytics/layout.html)
- **Công việc:**
  - [ ] **Backend:** Viết các câu truy vấn SQL Aggregation tính chuỗi ngày duy trì (Streak 🔥), tỷ lệ hoàn thành, tổng giờ Pomodoro.
  - [ ] **Frontend:** Tạo `src/pages/standard/StandardAnalyticsPage.tsx` (Vẽ biểu đồ thuần SVG Donut, Bar Chart).
  - [ ] **Viết Test:** `AnalyticsServiceTest` (Test thuật toán tính toán Streak liên tiếp).
  - [ ] **Git Commit:** `feat(analytics): add personal productivity analytics and streak calculation (FEAT-STD-04)`
  - [ ] **Archive Spec:** Di chuyển spec vào `03.archive/`.

#### 2.5. Feature `FEAT-STD-05`: Kế Hoạch Tuần & Chế Độ Xem Chuyên Biệt
- **Spec:** [`FEAT-STD-05-weekly-planning-and-smart-scheduler.md`](file:///D:/dylann/my-apps/dylask-web/docs/specs/02.approved/FEAT-STD-05-weekly-planning-and-smart-scheduler.md)
- **Prototype:** [`standard-planning/layout.html`](file:///D:/dylann/my-apps/dylask-web/docs/layout-html/standard-planning/layout.html), [`standard-upcoming/layout.html`](file:///D:/dylann/my-apps/dylask-web/docs/layout-html/standard-upcoming/layout.html), [`standard-overdue/layout.html`](file:///D:/dylann/my-apps/dylask-web/docs/layout-html/standard-overdue/layout.html)
- **Công việc:**
  - [ ] **Backend:** Thêm bộ lọc API cho Upcoming (7 ngày tới) và Overdue (quá hạn).
  - [ ] **Frontend:** Tạo các màn hình `WeeklyPlanningPage.tsx`, `UpcomingPage.tsx`, `OverdueAlertPage.tsx`.
  - [ ] **Viết Test:** `TaskFilterTest` (Test query lọc ngày quá hạn và 7 ngày tiếp theo).
  - [ ] **Git Commit:** `feat(planning): implement weekly planning, upcoming and overdue filters (FEAT-STD-05)`
  - [ ] **Archive Spec:** Di chuyển spec vào `03.archive/`.

---

### 🟣 GIAI ĐOẠN 3: CHẾ ĐỘ LẬP TRÌNH VIÊN - DEVELOPER MODE (PHASE 3 - DEVELOPER EXPERIENCE)
*Mục tiêu: Đáp ứng nhu cầu kỹ thuật chuyên sâu: Sprint, Kanban kéo thả, Git Branch, Markdown, Command Palette.*

#### 3.1. Feature `FEAT-DEV-01`: Bảng Kanban Kéo Thả, Sprint & Story Points
- **Spec:** [`FEAT-DEV-01-sprint-kanban-board.md`](file:///D:/dylann/my-apps/dylask-web/docs/specs/02.approved/FEAT-DEV-01-sprint-kanban-board.md)
- **Prototype:** [`developer-board/layout.html`](file:///D:/dylann/my-apps/dylask-web/docs/layout-html/developer-board/layout.html), [`developer-backlog/layout.html`](file:///D:/dylann/my-apps/dylask-web/docs/layout-html/developer-backlog/layout.html)
- **Công việc:**
  - [ ] **Database:** Tạo migration `V3__create_projects_and_sprints_tables.sql` (bảng `projects`, `sprints`, mở rộng `tasks` với `story_points`, `git_branch`, `status: backlog/todo/in_progress/in_review/done`).
  - [ ] **Backend:** Xây dựng module `com.dylask.modules.project` và `sprint`, API cập nhật vị trí kéo thả (`PATCH /api/v1/tasks/{id}/move`).
  - [ ] **Frontend:** Tạo `src/pages/developer/KanbanBoardPage.tsx` (Kéo thả thẻ Kanban), `BacklogPage.tsx`.
  - [ ] **Viết Test:** `SprintKanbanTest` (Chuyển trạng thái thẻ giữa các cột, cập nhật sprint).
  - [ ] **Git Commit:** `feat(kanban): implement sprint board with drag and drop and backlog (FEAT-DEV-01)`
  - [ ] **Archive Spec:** Di chuyển spec vào `03.archive/`.

#### 3.2. Feature `FEAT-DEV-02`: Markdown Editor, Command Palette (`Ctrl+K`) & Focus Coding
- **Spec:** [`FEAT-DEV-02-markdown-and-command-palette.md`](file:///D:/dylann/my-apps/dylask-web/docs/specs/02.approved/FEAT-DEV-02-markdown-and-command-palette.md)
- **Prototype:** [`developer-command-palette/layout.html`](file:///D:/dylann/my-apps/dylask-web/docs/layout-html/developer-command-palette/layout.html), [`developer-focus/layout.html`](file:///D:/dylann/my-apps/dylask-web/docs/layout-html/developer-focus/layout.html)
- **Công việc:**
  - [ ] **Frontend:**
    - Tích hợp thư viện Markdown parser an toàn (sanitize chống XSS).
    - Tạo `src/components/developer/CommandPaletteModal.tsx` (lắng nghe phím tắt toàn cục `Ctrl + K` / `Cmd + K`).
    - Tạo `src/pages/developer/FocusCodingPage.tsx` (ẩn toàn bộ navigation, tập trung code 1 task).
  - [ ] **Viết Test:** Test tương tác mở hộp thoại phím tắt và render markdown block code.
  - [ ] **Git Commit:** `feat(dx): add markdown preview, command palette ctrl+k and focus coding mode (FEAT-DEV-02)`
  - [ ] **Archive Spec:** Di chuyển spec vào `03.archive/`.

#### 3.3. Feature `FEAT-DEV-03`: Tự Động Hóa Git Branch & Webhook GitHub/GitLab
- **Spec:** [`FEAT-DEV-03-git-webhooks-automation.md`](file:///D:/dylann/my-apps/dylask-web/docs/specs/02.approved/FEAT-DEV-03-git-webhooks-automation.md)
- **Prototype:** [`developer-board/layout.html`](file:///D:/dylann/my-apps/dylask-web/docs/layout-html/developer-board/layout.html)
- **Công việc:**
  - [ ] **Backend:** Endpoint Webhook `/api/v1/webhooks/git` (xác thực chữ ký HMAC secret, nhận event push commit chuyển task `in_progress`, mở PR chuyển `in_review`, merge PR chuyển `done`).
  - [ ] **Frontend:** Nút bấm 1-click copy tên Git Branch chuẩn định dạng `feature/{key}-{title}`.
  - [ ] **Viết Test:** `GitWebhookControllerTest` (Giả lập webhook payload từ GitHub, kiểm tra cập nhật trạng thái tự động).
  - [ ] **Git Commit:** `feat(git): add git branch format generator and webhook automation (FEAT-DEV-03)`
  - [ ] **Archive Spec:** Di chuyển spec vào `03.archive/`.

#### 3.4. Feature `FEAT-DEV-04`: Threaded Comments, Async Standup & Audit Log
- **Spec:** [`FEAT-DEV-04-team-collaboration.md`](file:///D:/dylann/my-apps/dylask-web/docs/specs/02.approved/FEAT-DEV-04-team-collaboration.md)
- **Prototype:** [`developer-standup/layout.html`](file:///D:/dylann/my-apps/dylask-web/docs/layout-html/developer-standup/layout.html), [`developer-audit-log/layout.html`](file:///D:/dylann/my-apps/dylask-web/docs/layout-html/developer-audit-log/layout.html)
- **Công việc:**
  - [ ] **Database:** Migration `V4__create_comments_and_audit_logs_tables.sql`.
  - [ ] **Backend:** Bảng `task_comments` (phân cấp cây cha-con), ghi `audit_logs` khi thay đổi trạng thái/assignee.
  - [ ] **Frontend:** Dựng màn hình Standup tự động trích xuất các việc đã Done trong 24h và Timeline Audit Log.
  - [ ] **Viết Test:** `CommentServiceTest` và `AuditLogServiceTest`.
  - [ ] **Git Commit:** `feat(collab): add threaded task comments, async daily standup and audit log (FEAT-DEV-04)`
  - [ ] **Archive Spec:** Di chuyển spec vào `03.archive/`.

#### 3.5. Feature `FEAT-DEV-05`: Báo Cáo Agile (Sprint Burndown, Team Velocity)
- **Spec:** [`FEAT-DEV-05-agile-metrics-and-reports.md`](file:///D:/dylann/my-apps/dylask-web/docs/specs/02.approved/FEAT-DEV-05-agile-metrics-and-reports.md)
- **Prototype:** [`developer-metrics/layout.html`](file:///D:/dylann/my-apps/dylask-web/docs/layout-html/developer-metrics/layout.html)
- **Công việc:**
  - [ ] **Backend:** Bảng `sprint_snapshots` ghi nhận số điểm còn lại mỗi ngày; API tính toán Lead Time & Cycle Time.
  - [ ] **Frontend:** Tạo `src/pages/developer/AgileMetricsPage.tsx` (Vẽ biểu đồ Sprint Burndown SVG đường lý tưởng vs đường thực tế, biểu đồ cột Velocity).
  - [ ] **Viết Test:** `AgileMetricsServiceTest` (Test tính toán burndown points và cycle time).
  - [ ] **Git Commit:** `feat(metrics): implement sprint burndown svg chart, velocity and cycle time reports (FEAT-DEV-05)`
  - [ ] **Archive Spec:** Di chuyển spec vào `03.archive/`.

---

### 🔴 GIAI ĐOẠN 4: TRỢ LÝ AI BYOK CHI PHÍ 0Đ (PHASE 4 - COST-EFFECTIVE AI)
*Mục tiêu: Đưa tính năng thông minh vào hệ thống mà không phát sinh chi phí vận hành cho chủ sở hữu.*

#### 4.1. Feature `FEAT-AI-01`: Cài Đặt AI, Hạn Mức 10 Lượt Dùng Thử & Khóa Riêng (BYOK)
- **Spec:** [`FEAT-AI-01-ai-settings-byok.md`](file:///D:/dylann/my-apps/dylask-web/docs/specs/02.approved/FEAT-AI-01-ai-settings-byok.md)
- **Prototype:** [`docs/layout-html/settings/layout.html`](file:///D:/dylann/my-apps/dylask-web/docs/layout-html/settings/layout.html)
- **Công việc:**
  - [ ] **Backend:** Mã hóa AES-256 lưu API key của người dùng vào DB; quản lý quota dùng thử (10 lượt/tháng, reset ngày 1 hàng tháng).
  - [ ] **Frontend:** Tab AI Settings (Thẻ Quota hiển thị X/10 lượt, ô nhập API key, nút Test key kết nối nhà cung cấp).
  - [ ] **Viết Test:** `AiQuotaServiceTest` (Test trừ lượt dùng thử, kiểm tra chặn gọi khi hết lượt và chưa nhập key riêng).
  - [ ] **Git Commit:** `feat(ai): implement ai byok settings, quota management and key encryption (FEAT-AI-01)`
  - [ ] **Archive Spec:** Di chuyển spec vào `03.archive/`.

#### 4.2. Feature `FEAT-AI-02`: NLP Quick-Add & Gợi Ý Chia Nhỏ Checklist
- **Spec:** [`FEAT-AI-02-nlp-quick-add.md`](file:///D:/dylann/my-apps/dylask-web/docs/specs/02.approved/FEAT-AI-02-nlp-quick-add.md)
- **Prototype:** [`docs/layout-html/standard-list/layout.html`](file:///D:/dylann/my-apps/dylask-web/docs/layout-html/standard-list/layout.html)
- **Công việc:**
  - [ ] **Backend:** Parse bằng luật thời gian trước, gọi AI parse câu tự nhiên thành task có Due Date; Prompt sinh 3-5 bước checklist.
  - [ ] **Frontend:** Ô nhập liệu thông minh trên thanh tạo task, Modal xem trước đề xuất của AI trước khi xác nhận lưu.
  - [ ] **Viết Test:** `NlpTaskParserTest` (Test parse thời gian tiếng Việt, validate schema JSON do AI trả về).
  - [ ] **Git Commit:** `feat(ai): add nlp quick-add parser and ai checklist suggestions (FEAT-AI-02)`
  - [ ] **Archive Spec:** Di chuyển spec vào `03.archive/`.

#### 4.3. Feature `FEAT-AI-03`: Sinh Test Cases, Tóm Tắt Release Notes & Phân Tích Log Lỗi
- **Spec:** [`FEAT-AI-03-test-cases-and-release-notes.md`](file:///D:/dylann/my-apps/dylask-web/docs/specs/02.approved/FEAT-AI-03-test-cases-and-release-notes.md)
- **Prototype:** [`docs/layout-html/developer-ai-panel/layout.html`](file:///D:/dylann/my-apps/dylask-web/docs/layout-html/developer-ai-panel/layout.html)
- **Công việc:**
  - [ ] **Backend:** Service kết nối Google Gemini / OpenAI, prompt sinh Acceptance Criteria / Test Cases biên, tổng hợp commit thành Release Notes.
  - [ ] **Frontend:** Drawer trượt từ bên phải 480px (`AiAssistantDrawer.tsx` với 3 tabs: Test Cases, Release Notes, Debug Steps).
  - [ ] **Viết Test:** `AiDeveloperServiceTest` (Kiểm tra format JSON, khử khuẩn XSS đầu ra).
  - [ ] **Git Commit:** `feat(ai): implement developer ai drawer for test cases and release notes (FEAT-AI-03)`
  - [ ] **Archive Spec:** Di chuyển spec vào `03.archive/`.

---

### 🏁 GIAI ĐOẠN 5: ĐÓNG GÓI, TỐI ƯU HÓA & TRIỂN KHAI (PHASE 5 - PRODUCTION READY)
*Mục tiêu: Hoàn thiện sản phẩm để đưa vào vận hành thực tế.*

- [ ] **Tối ưu hóa hiệu năng:**
  - Kiểm tra N+1 query trên Hibernate bằng SQL log (`show-sql: false` trên prod).
  - Đảm bảo lazy loading trên tất cả `@ManyToOne`.
  - Frontend: Code splitting với `React.lazy()` theo từng trang view.
- [ ] **Đóng gói Docker:**
  - Tạo `dylask-backend/Dockerfile` đa tầng (Multi-stage build với JRE 25 tinh gọn).
  - Tạo `dylask-frontend/Dockerfile` đa tầng (Nginx alpine phục vụ static bundle).
  - Cập nhật `docker-compose.prod.yml` chạy trọn gói Backend + Frontend + MySQL.
- [ ] **Kiểm thử tự động toàn diện (Final Test Suite):**
  - Chạy toàn bộ test suite backend: `.\mvnw.cmd clean test`.
  - Chạy toàn bộ build frontend: `npm run build` & `npm run lint`.
- [ ] **Git Commit:** `chore(release): finalize production dockerfiles and full test suite verification`
