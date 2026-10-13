# Tiêu Chí Hoàn Thành Tính Năng (Definition of Done - DoD)

Một tính năng chỉ được xem là hoàn thành và được phép chuyển file đặc tả từ [docs/specs/02.approved](file:///d:/dylann/my-apps/dylask-web/docs/specs/02.approved) sang [docs/specs/03.archive](file:///d:/dylann/my-apps/dylask-web/docs/specs/03.archive) khi thỏa mãn 100% các tiêu chí dưới đây:

---

## 1. Cơ Sở Dữ Liệu (Database DoD)
- [ ] File migration Flyway mới (`V{n}__...sql`) đã được tạo trong `dylask-backend/src/main/resources/db/migration/`.
- [ ] Tuân thủ chuẩn `snake_case`, khóa chính `id BIGINT`, ràng buộc FK, Unique, Index và đủ 2 cột audit `created_at`, `updated_at`.
- [ ] Cấu hình Hibernate `ddl-auto` luôn là `validate`.
- [ ] Migration chạy thành công vào cơ sở dữ liệu MySQL mà không có lỗi checksum hay syntax.

## 2. Backend (Spring Boot 4 / Java 25 DoD)
- [ ] Tổ chức mã nguồn theo package module `com.dylask.modules.<tên_module>`.
- [ ] Mọi quan hệ `@ManyToOne` / `@OneToOne` đều khai báo `fetch = FetchType.LAZY`.
- [ ] Entity không dùng `@Data` hoặc `@EqualsAndHashCode`.
- [ ] Controller trả về `ApiResponse<T>` với đúng mã HTTP (200, 201).
- [ ] Xử lý ngoại lệ qua `AppException` và `ErrorCode`, không để lọt raw 500 stacktrace ra client.
- [ ] Ghi log qua `@Slf4j`, không có `System.out.println`.
- [ ] Lệnh kiểm thử tự động `./mvnw test` và `./mvnw clean compile` vượt qua 100%.

## 3. Frontend (React 19 / TypeScript DoD)
- [ ] Toàn bộ imports nội bộ sử dụng Path Alias `@/*`.
- [ ] Tuyệt đối không sử dụng kiểu dữ liệu `any`.
- [ ] Logic gọi API và state được tách vào Custom Hooks (`src/hooks/`).
- [ ] Giao diện tương thích với mẫu HTML/CSS trong `docs/layout-html/` và tuân thủ bảng màu CSS tokens trong `docs/layout-html/DESIGN.md`.
- [ ] Xử lý đầy đủ các trạng thái UI: Loading, Error, Empty, Success.
- [ ] Lệnh kiểm thử `npm run build` và `npm run lint` vượt qua 100% (0 errors, 0 warnings nghiêm trọng).

## 4. Quản Lý Spec (Archive DoD)
- [ ] Di chuyển file spec từ `docs/specs/02.approved/<file>.md` sang `docs/specs/03.archive/<file>.md`.
- [ ] Cập nhật bảng theo dõi trong `docs/specs/01.draft/README.md` (nếu cần).
