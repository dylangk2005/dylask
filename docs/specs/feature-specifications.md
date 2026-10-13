# Đặc tả Yêu cầu Chức năng Hệ thống Dylask (Dylask Feature Specification)

---

## 1. Tổng quan dự án

**Dylask** là ứng dụng quản lý công việc và tối ưu hóa năng suất đa chế độ, được thiết kế để phục vụ hai nhóm đối tượng: người dùng phổ thông (quản lý công việc cá nhân, học tập, đời sống) và lập trình viên / nhóm kỹ thuật (tối ưu quy trình phát triển phần mềm, tích hợp Git và tự động hóa luồng việc).

### 1.1. Triết lý thiết kế
- **Dual-Mode Experience:** Cho phép chuyển đổi linh hoạt giữa giao diện tối giản (*Standard Mode*) và giao diện kỹ thuật chuyên sâu (*Developer Mode*).
- **Automation-First:** Tận dụng tối đa logic quy tắc (rule-based) và Webhook để tự động hóa quy trình mà không làm phát sinh chi phí vận hành.
- **Cost-Effective AI:** Bãi bỏ cơ chế freemium và gói trả phí. Để hỗ trợ người dùng mới hoặc chưa quen lấy API key, hệ thống cấp sẵn **10 lượt gọi AI dùng thử/tháng** (tự động làm mới vào ngày 1 hàng tháng). Để sử dụng tiếp hoặc không giới hạn, người dùng tự cung cấp API key riêng (BYOK). Hệ thống hoàn toàn không phát sinh chi phí vận hành AI lớn và không có hệ thống thanh toán gói cước.

---

## 2. Chi tiết chức năng: Chế độ Người bình thường (Standard Mode)

Chế độ dành cho nhu cầu cá nhân hóa, giao diện thân thiện, tinh gọn, tập trung vào tính dễ dùng và thói quen sinh hoạt hàng ngày.

### 2.1. Quản lý công việc cốt lõi (Core Task Management)
- **Tạo và cập nhật công việc:** Nhập tiêu đề, nội dung ghi chú (Plain text), ngày giờ đến hạn (Due Date) và giờ nhắc nhở.
- **Mức độ ưu tiên trực quan:** Phân loại 3 mức độ (*Thấp, Trung bình, Cao*) được gắn nhãn màu rõ ràng.
- **Danh sách kiểm tra (Checklists):** Tạo các đầu việc con trong từng task với ô đánh dấu hoàn thành nhanh.
- **Phân loại danh mục (Categories / Lists):** Phân chia theo mục đích sống (*Học tập, Công việc, Cá nhân, Mua sắm, Gia đình*).
- **Bộ lọc & Tìm kiếm nhanh:** Tìm kiếm theo từ khóa tiêu đề; lọc công việc theo ngày (*Hôm nay, 7 ngày tới, Quá hạn*).

### 2.2. Lập lịch & Nhắc việc (Scheduling & Reminders)
- **Chế độ xem lịch trình (Calendar View):** Hiển thị công việc theo dạng lưới Ngày, Tuần, Tháng trực quan.
- **Công việc lặp lại (Recurring Tasks):** Cấu hình tự động tạo lại việc định kỳ (*Mỗi ngày, Ngày làm việc, Mỗi tuần, Mỗi tháng*).
- **Thông báo nhắc hẹn:** Gửi cảnh báo âm thanh/pop-up trên trình duyệt hoặc email nhắc nhở trước thời hạn cấu hình (15 phút, 1 giờ, 1 ngày).

### 2.3. Tập trung & Quản lý năng lượng (Productivity & Focus)
- **Kế hoạch hôm nay (My Day):** Cho phép chọn lọc các đầu việc trọng tâm cần giải quyết trong ngày từ danh sách tồn đọng.
- **Bộ đếm Pomodoro:** Bấm giờ 25 phút làm việc / 5 phút nghỉ ngơi gắn trực tiếp vào task đang thực hiện, hỗ trợ ghi nhận số chu kỳ hoàn thành.

### 2.4. Module AI hỗ trợ (Tùy chọn Bật/Tắt)
- **Quy tắc kích hoạt:** AI chỉ chạy khi đồng thời thỏa mãn 3 điều kiện: (a) công tắc AI trong Cài đặt đang bật, (b) công tắc AI của dự án/danh mục đang bật, (c) người dùng đã nhập API key riêng hợp lệ HOẶC còn lượt gọi dùng thử trong tháng (tối đa 10 lượt/tháng). Nếu hết lượt dùng thử mà chưa nhập API key riêng, hoặc công tắc AI bị tắt, hệ thống sẽ ẩn/vô hiệu hóa nút AI và hiển thị thông báo/liên kết dẫn tới Cài đặt > AI.
- **Nhập liệu ngôn ngữ tự nhiên (NLP Quick-Add):** Parse bằng luật (thư viện parse ngày giờ) trước, chỉ gọi AI khi parse thất bại. Gửi kèm ngày giờ hiện tại và múi giờ người dùng (mặc định UTC+7) cho AI.
- **Gợi ý chia nhỏ mục tiêu:** Người dùng nhập mục tiêu lớn (ví dụ: *"Dọn dẹp phòng làm việc"*), AI đề xuất 3–5 bước checklist hành động cụ thể.
- **Nguyên tắc xử lý AI (Áp dụng toàn hệ thống):**
  - **Kết quả AI luôn là đề xuất:** Hiển thị cho người dùng xem và xác nhận trước khi tạo task/checklist, không tự ghi vào dữ liệu.
  - **Định dạng dữ liệu & Xác thực:** AI phải trả về JSON theo schema cố định và được validate trước khi dùng.
  - **Làm sạch nội dung (Sanitization):** Nội dung Markdown do AI trả về phải được sanitize trước khi hiển thị để phòng chống tấn công XSS.
  - **Giới hạn đầu vào & Cảnh báo an toàn:** Giới hạn độ dài input gửi AI (tối đa 4.000 ký tự) và hiện cảnh báo: *"Không dán mật khẩu, token hoặc secret vào ô này. Nội dung sẽ được gửi tới nhà cung cấp AI bạn đã chọn."*

### 2.5. Thống kê & Năng suất cá nhân (Personal Productivity Analytics)
- **Tỷ lệ hoàn thành công việc:** Đo lường tổng số việc tạo ra so với số việc đã hoàn tất theo khoảng thời gian tùy chọn (7 ngày, 30 ngày, tháng này).
- **Chuỗi ngày duy trì kỷ luật (Streak 🔥):** Ghi nhận số ngày liên tiếp hoàn thành ít nhất 1 việc hoặc 1 phiên Pomodoro, giúp duy trì thói quen và động lực làm việc tích cực.
- **Phân bổ theo danh mục:** Biểu đồ Donut SVG trực quan hóa tỷ trọng công việc giữa các mảng đời sống (*Học tập, Công việc, Cá nhân, Gia đình*).
- **Hiệu suất Pomodoro & Giờ tập trung:** Thống kê tổng số phiên tập trung 25 phút đã hoàn tất, tổng giờ làm việc sâu (Deep Work) và phát hiện khung giờ vàng tập trung cao nhất trong ngày.
- **Chi phí vận hành:** 0đ, toàn bộ tính năng dựa trên truy vấn tổng hợp SQL (Aggregation) nội bộ, không phụ thuộc vào AI.

---

## 3. Chi tiết chức năng: Chế độ Lập trình viên (Developer Mode)

Chế độ tối ưu hóa cho quy trình kỹ thuật, thao tác bàn phím, quản lý dự án phần mềm theo phương pháp Agile/Scrum và tích hợp luồng code.

### 3.1. Quản lý công việc kỹ thuật & Sprint
- **Phân cấp dự án chuẩn Agile:** Tổ chức theo mô hình *Workspace $\rightarrow$ Project/Repository $\rightarrow$ Sprint $\rightarrow$ Task / Bug / Feature*.
- **Thuộc tính kỹ thuật nâng cao:**
  - Trạng thái công việc: *Backlog, To Do, In Progress, In Review, Done*.
  - Độ ưu tiên chuẩn kỹ thuật: *P1 (Critical), P2 (High), P3 (Medium), P4 (Low)*.
  - Ước tính công số: Ước tính Story Points hoặc số giờ dự tính (`Estimated Hours`) so với số giờ thực tế (`Actual Hours`).
- **Sprint Board (Kanban kéo thả):** Kéo thả thẻ task giữa các cột trạng thái; hỗ trợ lọc nhanh theo người nhận việc (`Assignee`), nhãn kỹ thuật (`Frontend`, `Backend`, `DevOps`, `Database`, `Bug`, `Hotfix`).

### 3.2. Tối ưu trải nghiệm lập trình viên (Developer Experience - DX)
- **Trình soạn thảo Markdown & Syntax Highlighting:** Mô tả task và bình luận hỗ trợ Markdown toàn diện kèm tô màu cú pháp cho các ngôn ngữ phổ biến (JavaScript, TypeScript, Python, Java, Go, SQL, JSON, YAML).
- **Bảng điều khiển phím tắt (Command Palette - `Ctrl + K` / `Cmd + K`):** Hỗ trợ tìm kiếm nhanh, chuyển đổi trang, gán người thực hiện, chuyển trạng thái mà không cần dùng chuột.
- **Chế độ tập trung lập trình (Focus Coding Mode):** Ẩn toàn bộ thanh điều hướng, chỉ hiển thị task hiện tại, tên Git Branch và đồng hồ tính giờ làm việc.

### 3.3. Tự động hóa tích hợp Git (GitHub / GitLab Integration)
- **Chuẩn hóa Git Branch:** Bấm nút sao chép tên branch chuẩn kỹ thuật theo mã định danh task (ví dụ: `feature/DYL-102-jwt-auth`).
- **Tự động chuyển đổi trạng thái bằng Webhook (Không tốn chi phí AI):**
  - Khi phát hiện branch mới hoặc commit mới được push: Task tự động chuyển sang `In Progress`.
  - Khi Pull Request (PR) được mở: Task tự động chuyển sang `In Review`.
  - Khi PR được merge chứa cú pháp liên kết (`closes #102`, `fixes #102`): Task tự động chuyển sang `Done`.
- **Liên kết ngữ cảnh mã nguồn:** Đính kèm trực tiếp đường dẫn PR, mã băm commit (Commit Hash) và người duyệt (Reviewer) vào chi tiết task.

### 3.4. Hợp tác nhóm kỹ thuật (Team Collaboration)
- **Bình luận kỹ thuật theo luồng (Threaded Comments):** Trao đổi trao đổi thông tin, hỗ trợ gắn thẻ `@member`, đính kèm log lỗi hoặc đoạn mã mẫu.
- **Async Daily Standup (Báo cáo tiến độ tự động):** Hệ thống tự động trích xuất các task đã `Done` trong 24 giờ qua, các task đang `In Progress` và các task bị đánh dấu `Blocked` để tạo báo cáo nhanh đầu ngày cho đội nhóm.
- **Nhật ký thay đổi (Audit Log):** Ghi nhận chi tiết lịch sử cập nhật trạng thái, thay đổi deadline và phân công nhân sự.

### 3.5. Module AI hỗ trợ kỹ thuật (Tùy chọn Bật/Tắt)
Tuân thủ đầy đủ quy tắc kích hoạt và nguyên tắc xử lý AI tại mục 2.4 (chỉ chạy khi bật Cài đặt, bật Dự án và có API key riêng hợp lệ HOẶC còn lượt gọi dùng thử trong tháng - 10 lượt/tháng; kết quả luôn là đề xuất để người dùng xác nhận; JSON schema cố định; sanitize Markdown; giới hạn input tối đa 4.000 ký tự kèm cảnh báo không dán secret):
- **Sinh tiêu chí nghiệm thu & Test Cases:** Đề xuất danh sách Acceptance Criteria (AC) và các trường hợp kiểm thử biên (Edge Cases) từ mô tả yêu cầu tính năng để người dùng duyệt và xác nhận trước khi áp dụng vào task.
- **Tự động sinh Release Notes:** Tổng hợp nội dung các commit và task đã hoàn thành trong Sprint thành bản tin phát hành (Changelog) dạng Markdown đề xuất có cấu trúc.
- **Phân tích Log lỗi thành Checklist:** Cho phép lập trình viên dán Stack Trace hoặc mã lỗi (tối đa 4.000 ký tự, có cảnh báo không dán secret) để AI đề xuất các bước gỡ lỗi (Debug Steps) có hệ thống.

### 3.6. Đo lường & Báo cáo kỹ thuật Agile (Agile Metrics & Engineering Reports)
- **Biểu đồ Sprint Burndown (SVG):** So sánh đường công số lý tưởng (Ideal Story Points) với đường thực tế (Actual Remaining Points) theo từng ngày; nhận diện rủi ro trễ hạn và hiện tượng mở rộng phạm vi (Scope Creep).
- **Đo lường Team Velocity:** Biểu đồ so sánh Story Points cam kết vs hoàn thành qua 3–5 Sprint liên tiếp; tự động gợi ý công số khả thi cho Sprint kế tiếp.
- **Độ chính xác ước lượng (Estimation Accuracy):** So sánh giờ dự toán (`estimated_hours`) so với giờ thực tế ghi nhận (`actual_hours`) theo phân loại Feature, Bug, Refactor.
- **Chỉ số luân chuyển (Lead Time & Cycle Time):** Thời gian trung bình hoàn thành thẻ task từ khi khởi tạo hoặc từ khi bắt đầu làm (`in_progress`) đến khi hoàn tất (`done`).
- **Chi phí vận hành:** 0đ, tự động lưu trữ ảnh chụp nhanh hàng ngày (Daily Sprint Snapshot) qua Spring Scheduler và tổng hợp dữ liệu nội bộ.

---

## 4. Ma trận so sánh tính năng giữa hai chế độ

| Nhóm chức năng | Chế độ Người bình thường (Standard) | Chế độ Lập trình viên (Developer) |
| :--- | :--- | :--- |
| **Giao diện chính** | Danh sách việc cá nhân (List) & Lịch tháng | Bảng Kanban / Sprint Board & Backlog |
| **Phân loại công việc** | Danh mục đời sống (Học tập, Gia đình, Mua sắm) | Project, Repository, Sprint, Milestone |
| **Độ ưu tiên** | Thấp / Trung bình / Cao (Màu sắc trực quan) | P1 (Critical) đến P4 (Low) |
| **Định dạng văn bản** | Plain text đơn giản | Markdown + Code Block Syntax Highlighting |
| **Thao tác điều hướng** | Thao tác chuột, chạm trực quan | Phím tắt & Command Palette (`Ctrl + K`) |
| **Tự động hóa** | Nhắc hẹn theo mốc thời gian | Webhook đồng bộ trạng thái GitHub / GitLab |
| **Đơn vị đo lường** | Đếm phiên Pomodoro | Story Points, Giờ dự tính vs. Giờ thực tế |
| **Báo cáo & Thống kê** | Tỷ lệ hoàn thành, Chuỗi ngày kỷ luật (Streak), Phân bổ danh mục, Pomodoro Focus hours | Sprint Burndown Chart, Team Velocity, Độ chính xác ước lượng (Hours/SP), Lead/Cycle Time |
| **Tương tác nhóm** | Cá nhân hóa hoặc chia sẻ cơ bản | Phân quyền RBAC, Comment luồng, Async Standup |
| **Tính năng AI** | Phân tích câu tự nhiên, gợi ý việc sinh hoạt | Sinh Test Cases, tóm tắt Release Notes, Debug log |

---

## 5. Lộ trình triển khai khuyến nghị cho Intern / Fresher

### Giai đoạn 1: Xây dựng nền tảng (MVP Core - Tuần 1 & 2)
- Thiết lập hệ thống xác thực người dùng (Đăng ký, Đăng nhập với JWT, Bcrypt).
- Xây dựng API và giao diện CRUD Task cơ bản (Title, Description, Status, Priority, Due Date).
- Xây dựng giao diện Danh sách (List View) và chuyển đổi giao diện Bảng (Kanban Board đơn giản).
- Cài đặt nút Toggle chuyển đổi giữa Standard Mode và Developer Mode trong giao diện cá nhân.

### Giai đoạn 2: Trải nghiệm Dev & Tự động hóa Webhook (Tuần 3)
- Tích hợp trình soạn thảo Markdown có Syntax Highlighting cho Developer Mode.
- Xây dựng API tiếp nhận Webhook từ GitHub để tự động chuyển trạng thái task khi nhận sự kiện Push / Pull Request.
- Bổ sung thanh tìm kiếm nhanh bằng phím tắt (`Ctrl + K`).
- Bổ sung bộ đếm Pomodoro và tính năng phân chia danh mục cho Standard Mode.

### Giai đoạn 3: Tích hợp AI (BYOK & Dùng thử 10 lượt/tháng) & Hoàn thiện (Tuần 4)
- Thiết lập trang cấu hình AI Settings: Công tắc Bật/Tắt, hiển thị số lượt gọi dùng thử còn lại trong tháng (10 lượt/tháng, reset ngày 1 hàng tháng), chọn nhà cung cấp (Gemini, OpenAI...), ô nhập API key riêng (BYOK), nút "Kiểm tra key".
- Viết Prompt tạo Subtasks / Checklist (Standard Mode) và tạo Acceptance Criteria / Test Cases (Developer Mode).
- Đóng gói ứng dụng, cấu hình Dockerfile và triển khai thực tế (Deploy) lên nền tảng đám mây.

---

## 6. Thiết kế cơ sở dữ liệu mẫu (Relational Database Schema)

```sql
-- Bảng người dùng
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    default_mode VARCHAR(20) DEFAULT 'standard', -- 'standard' hoặc 'developer'
    ai_enabled BOOLEAN DEFAULT FALSE,
    ai_trial_count INT DEFAULT 0, -- Số lượt gọi AI đã dùng trong tháng hiện tại (tối đa 10 lượt cho người dùng chưa quen lấy key)
    ai_trial_limit INT DEFAULT 10, -- Hạn mức dùng thử hàng tháng (10 lượt/tháng, làm mới vào ngày 1 hàng tháng)
    ai_trial_reset_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Thời điểm làm mới lượt dùng thử gần nhất
    ai_provider VARCHAR(30), -- 'gemini', 'openai'... (khi dùng BYOK)
    ai_api_key_encrypted VARCHAR(500), -- Mã hóa AES-GCM trước khi lưu, khóa mã hóa để trong biến môi trường, không bao giờ trả nguyên văn về frontend (chỉ hiện 4 ký tự cuối), không ghi vào log
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng dự án / danh mục
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    mode_type VARCHAR(20) NOT NULL, -- 'standard' hoặc 'developer'
    git_repo_url VARCHAR(255),
    is_ai_enabled BOOLEAN DEFAULT FALSE, -- AI chạy khi cả users.ai_enabled và projects.is_ai_enabled đều TRUE
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng công việc (Task)
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    project_id INT REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'todo', -- 'todo', 'in_progress', 'in_review', 'done'
    priority VARCHAR(20) DEFAULT 'medium', -- Standard: low, medium, high | Dev: p1, p2, p3, p4
    due_date TIMESTAMP,
    estimated_hours NUMERIC(5, 2),
    actual_hours NUMERIC(5, 2),
    git_branch_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng danh sách kiểm tra con (Checklists / Subtasks)
CREATE TABLE task_checklists (
    id SERIAL PRIMARY KEY,
    task_id INT REFERENCES tasks(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    position INT DEFAULT 0
);
```

---

## 7. Bảo mật & quyền riêng tư cho tính năng AI

- **Cơ chế dùng thử minh bạch (10 lượt/tháng):** Đối với người dùng chưa quen lấy API key, hệ thống cấp 10 lượt gọi/tháng qua key mặc định phía máy chủ (giới hạn chặt chẽ theo user và rate limit). Khi người dùng tự nhập key riêng (BYOK), toàn bộ các cuộc gọi AI sẽ chuyển hẳn sang dùng key riêng của người dùng và không còn phụ thuộc hay chịu giới hạn 10 lượt của hệ thống.
- **Mã hóa khóa API (BYOK):** Khóa API người dùng cung cấp được mã hóa bằng thuật toán AES-GCM trước khi lưu vào cơ sở dữ liệu (`ai_api_key_encrypted`). Khóa mã hóa được lưu trữ an toàn trong biến môi trường máy chủ. Hệ thống không bao giờ trả nguyên văn API key về frontend (chỉ hiển thị 4 ký tự cuối) và không bao giờ ghi khóa vào log hệ thống.
- **Không ghi log nội dung gửi AI:** Máy chủ tuyệt đối không ghi log nội dung prompt, mô tả task, mã lỗi hay Stack Trace gửi tới các dịch vụ AI.
- **Minh bạch luồng dữ liệu:** Thông báo rõ ràng cho người dùng biết dữ liệu nào được gửi tới nhà cung cấp AI nào (Gemini, OpenAI...) trước khi gửi yêu cầu.
- **Thu hồi và xóa khóa an toàn:** Xóa khóa API ngay khi người dùng tắt tính năng AI hoặc yêu cầu xóa tài khoản khỏi hệ thống.
