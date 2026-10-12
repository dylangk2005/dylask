# AGENTS.md - Chỉ Dẫn Dành Cho AI Assistant

Tài liệu này là quy ước bắt buộc cho các AI Assistant (Antigravity, Cursor, Copilot...) khi tham gia phát triển trong dự án **Dylask Web**.

---

## 📌 1. Bối cảnh dự án (Project Context)

- **Kiến trúc:** Monorepo gồm 2 phần chính:
  - `dylask-backend`: RESTful API xây dựng bằng **Spring Boot 4.x**, **Java 25**, **MySQL 8.4** (Docker), **Flyway**, **MapStruct**, **Lombok**.
  - `dylask-frontend`: Single Page Application bằng **React 19**, **TypeScript**, **Vite 8**, path alias `@/*`.
- **Triết lý kiến trúc:** **Modular Monolith** & **Spec-Driven Development** (Mọi tính năng phải có tài liệu đặc tả trong `docs/specs/` trước khi lập trình).

---

## 🧱 2. Quy tắc phát triển Backend (`dylask-backend`)

### Cấu trúc Module:
- Không gom code theo tầng chung (Package by Layer).
- Bắt buộc chia theo **Module nghiệp vụ** (`com.dylask.modules.<module_name>`):
  - `controller/`: REST Controller chỉ xử lý HTTP request/response.
  - `service/`: Interface và ServiceImpl xử lý logic nghiệp vụ.
  - `repository/`: Spring Data JPA repository interfaces.
  - `entity/`: JPA entities (tuân theo quy chuẩn naming trong `docs/specs/database-specs.md`).
  - `dto/`: Request/Response DTOs (sử dụng record hoặc class kèm Lombok).
  - `mapper/`: MapStruct mapper interfaces (`@Mapper(componentModel = "spring")`).
- Thành phần dùng chung toàn hệ thống nằm trong `com.dylask.common` (`config`, `dto`, `entity`, `exception`, `util`).

### Tiêu chuẩn mã nguồn Backend:
- Không dùng `System.out.println`, dùng SLF4J (`@Slf4j`).
- Không thực hiện business logic trong Controller.
- Luôn trả về phản hồi theo chuẩn `ApiResponse<T>` (quy định tại `docs/specs/api-specs.md`).
- Xử lý ngoại lệ tập trung qua `GlobalExceptionHandler` (`@RestControllerAdvice`).
- Mọi thay đổi cấu trúc bảng database phải thông qua **Flyway migration** (`V{timestamp}__{description}.sql` hoặc `V{n}__{description}.sql` trong `src/main/resources/db/migration`). Không sửa file migration đã được áp dụng.

---

## 🎨 3. Quy tắc phát triển Frontend (`dylask-frontend`)

### Cấu trúc thư mục:
- Mọi import nội bộ trong `src/` phải dùng Path Alias `@/*` (ví dụ: `import { Button } from '@/components/Button'`).
- Tách biệt rõ ràng:
  - `src/api/`: Gọi API backend, cấu hình fetch/axios client.
  - `src/components/`: Reusable UI components.
  - `src/pages/`: Các màn hình view.
  - `src/hooks/`: Custom React hooks.
  - `src/types/`: TypeScript interfaces và types.
  - `src/utils/`: Helper functions độc lập.

### Tiêu chuẩn mã nguồn Frontend:
- Sử dụng Functional Components và Hooks.
- Nghiêm cấm dùng kiểu `any`, luôn định nghĩa type/interface rõ ràng trong `types/`.
- Tách logic phức tạp ra khỏi component vào custom hook.
- Không hardcode API URL, luôn dùng `import.meta.env.VITE_API_BASE_URL`.

---

## 🤝 4. Quy trình làm việc với AI (Workflow & Spec Lifecycle)

### Vòng đời quản lý Specs (Bắt buộc tuân thủ):
- **`docs/specs/01.draft/`:** Nơi chứa specs mới tạo, đang chờ người dùng review. **AI TUYỆT ĐỐI KHÔNG ĐƯỢC TỰ Ý CODE** khi spec còn nằm ở thư mục này.
- **`docs/specs/02.approved/`:** Nơi chứa specs đã được người dùng review và DUYỆT. **AI CHỈ ĐƯỢC PHÉP BẮT ĐẦU CODE KHI SPEC ĐÃ ĐƯỢC CHUYỂN VÀO ĐÂY**.
- **`docs/specs/03.archive/`:** Sau khi AI hoàn thành lập trình tính năng và chạy kiểm thử tự động thành công 100%, AI hoặc Dev sẽ di chuyển file spec đó vào đây để lưu trữ lịch sử.

### Các bước thực hiện:
1. **Kiểm tra trạng thái duyệt:** Xác nhận spec của tính năng đang nằm trong `docs/specs/02.approved/`.
2. **Kế hoạch trước khi code (Plan First):** Liệt kê các bước sẽ thực hiện, các file sẽ tạo hoặc sửa.
3. **Hiện thực hóa mã nguồn:** Tuân thủ chuẩn Modular Monolith (Backend) và Feature/Types (Frontend).
4. **Kiểm thử tự động:** Sau khi sinh mã, chạy build (`npm run build` cho frontend, `./mvnw test` cho backend) để đảm bảo không gãy ứng dụng.
5. **Lưu trữ spec:** Chuyển file spec từ `02.approved/` sang `03.archive/`.
6. **Không chạm vào file nhạy cảm:** Không commit các file `.env` chứa thông tin bảo mật thật.
