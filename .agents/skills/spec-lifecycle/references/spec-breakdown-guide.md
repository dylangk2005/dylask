# Hướng Dẫn Phân Rã Tính Năng Từ Spec Sang Nhiệm Vụ Lập Trình

Khi một tính năng được duyệt trong `docs/specs/02.approved/`, hãy phân rã theo thứ tự thực thi chuẩn (Top-Down Implementation Flow) để tránh xung đột và thiếu sót:

---

## Sơ Đồ Trình Tự Thực Thi Chuẩn

```text
1. Đọc Spec & Xác Định Data Model
   └──> 2. Viết Migration Flyway (MySQL 8.4)
        └──> 3. Viết Backend Module (Entity -> Repo -> DTO -> Mapper -> Service -> Controller)
             └──> 4. Viết Frontend Types & API Client (@/types, @/api)
                  └──> 5. Viết Custom Hook & Dựng UI Component (@/hooks, @/components)
                       └──> 6. Kiểm Thử Tự Động (mvnw test + npm run build)
                            └──> 7. Chuyển Spec sang 03.archive/
```

---

## Chi Tiết Các Tác Vụ Con

### Giai đoạn 1: Cơ Sở Dữ Liệu
- Đọc phần "Cơ sở dữ liệu / Schema" trong spec.
- Sử dụng skill `flyway-db-migration` để tạo file migration `V{n}__...sql`.
- Chạy thử migration trên môi trường dev.

### Giai đoạn 2: Lập Trình Backend
- Sử dụng skill `spring-backend-dev`.
- Tạo package module tại `com.dylask.modules.<module>`.
- Viết Entity kế thừa `BaseAuditEntity`.
- Viết Repository và DTO (kèm Validation).
- Viết MapStruct Mapper.
- Viết Service xử lý nghiệp vụ và Controller trả về `ApiResponse<T>`.

### Giai đoạn 3: Lập Trình Frontend
- Sử dụng skill `react-frontend-dev`.
- Định nghĩa interface dữ liệu trong `src/types/`.
- Viết các hàm gọi API trong `src/api/`.
- Viết Custom Hook quản lý dữ liệu trong `src/hooks/`.
- Mở bản mẫu HTML tương ứng trong `docs/layout-html/` và dựng Component trong `src/components/` & `src/pages/`.

### Giai đoạn 4: Xác Minh & Lưu Trữ
- Chạy `./mvnw test` ở Backend.
- Chạy `npm run build` ở Frontend.
- Chuyển file spec sang `docs/specs/03.archive/`.
