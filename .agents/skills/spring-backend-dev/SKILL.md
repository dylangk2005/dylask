---
name: spring-backend-dev
description: >-
  Use this skill when developing backend features for dylask-backend, implementing Modular Monolith
  packages in com.dylask.modules, building REST controllers, services, repositories, DTOs,
  MapStruct mappers, or configuring Spring Boot 4 / Java 25.
---

# Quy Trình Phát Triển Backend (Spring Boot 4 / Java 25)

Backend của **Dylask** áp dụng kiến trúc **Modular Monolith** kết hợp **Spec-Driven Development**. Mỗi phân hệ là một module nghiệp vụ độc lập tại `com.dylask.modules.<tên_module>`.

---

## 📚 Tài Liệu & Mẫu Code Chi Tiết (References)
- [Module Implementation Guide](./references/module-implementation-guide.md): Code mẫu đầy đủ cho Entity, DTO, Mapper, Repository, Service và Controller.
- [API Response & ErrorCode Guide](./references/api-response-conventions.md): Chuẩn `ApiResponse<T>`, `PageResponse<T>` và mã lỗi.
- [Error Handling & GlobalExceptionHandler](./references/error-handling-guide.md): Chi tiết xử lý ngoại lệ tập trung.

---

## 🏛️ Cấu Trúc Module Chuẩn (`com.dylask.modules.<module>`)

```text
com.dylask.modules.<tên_module>/
├── controller/        # REST Controller (chỉ nhận HTTP, validate @Valid, trả ApiResponse<T>)
├── service/           # Logic nghiệp vụ (Interface)
│   └── impl/          # Service Implementation (@Transactional(readOnly = true))
├── repository/        # Spring Data JPA Repository
├── entity/            # JPA Entities (kế thừa BaseAuditEntity, ManyToOne LAZY)
├── dto/               # Request & Response DTOs (Record hoặc Lombok)
│   ├── request/       # Create...Request, Update...Request
│   └── response/      # ...Response
└── mapper/            # MapStruct mappers (@Mapper(componentModel = "spring"))
```

---

## ✅ Checklist 7 Bước Lập Trình Module Mới (Execution Checklist)

### 1. Chuẩn Bị & CSDL (Prerequisites)
- [ ] Xác nhận migration CSDL đã có trong `db/migration/` (dùng skill `flyway-db-migration`).
- [ ] Bảng đã có khóa chính `id BIGINT`, các ràng buộc FK, Unique, Index và 2 cột audit `created_at`, `updated_at`.

### 2. Tạo Entity (`entity/`)
- [ ] Kế thừa `BaseAuditEntity` (tự có `created_at`, `updated_at`).
- [ ] Khai báo `@Id @GeneratedValue(strategy = GenerationType.IDENTITY)`.
- [ ] Mọi quan hệ `@ManyToOne` và `@OneToOne` **BẮT BUỘC** có `fetch = FetchType.LAZY`.
- [ ] Dùng `@Getter`, `@Setter`, `@NoArgsConstructor`, `@AllArgsConstructor`, `@Builder`.
- [ ] **TUYỆT ĐỐI CẤM** dùng `@Data` hoặc `@EqualsAndHashCode` trên Entity.
- [ ] Kiểu thời gian dùng `java.time.Instant`.

### 3. Tạo DTOs (`dto/`)
- [ ] Request DTO: Sử dụng Record hoặc class kèm Bean Validation (`@NotBlank`, `@NotNull`, `@Size`...).
- [ ] Response DTO: Không để lộ thông tin nhạy cảm (mật khẩu, secret key).

### 4. Tạo MapStruct Mapper (`mapper/`)
- [ ] `@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)`.
- [ ] Phương thức cập nhật: `@BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE) void updateEntityFromRequest(...)`.

### 5. Tạo Repository (`repository/`)
- [ ] Kế thừa `JpaRepository<Entity, Long>`.
- [ ] Khai báo các query method theo đúng naming convention của Spring Data JPA.

### 6. Tạo Service & ServiceImpl (`service/`)
- [ ] Tạo interface `XxxService`.
- [ ] Viết `XxxServiceImpl` có `@Service`, `@RequiredArgsConstructor`, `@Transactional(readOnly = true)`.
- [ ] Đánh dấu `@Transactional` ở các method write/update/delete.
- [ ] Dùng `@Slf4j` cho logging (`log.info`, `log.error`). **CẤM** dùng `System.out.println`.
- [ ] Kiểm tra quyền sở hữu bản ghi (Ownership check) trước khi update/delete, ném `AppException(ErrorCode.FORBIDDEN)`.

### 7. Tạo REST Controller (`controller/`)
- [ ] `@RestController`, `@RequestMapping("/api/v1/<tài_nguyên>")`.
- [ ] Bắt buộc trả về `ApiResponse<T>` hoặc `ResponseEntity<ApiResponse<T>>`.
- [ ] Thêm `@Valid` cho `@RequestBody`.

---

## 🧪 Kiểm Thử & Xác Minh (Verification)
Sau khi viết mã, chạy lệnh xác minh:
```powershell
cd dylask-backend
./mvnw clean compile
./mvnw test
```
Đảm bảo build thành công, không có lỗi MapStruct annotation processor hay JPA configuration.
