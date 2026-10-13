---
name: spec-lifecycle
description: >-
  Use this skill when managing feature specifications in docs/specs, checking approval status
  before coding, verifying test suites for approved specs, or archiving completed feature specs
  from 02.approved to 03.archive.
---

# Quy Trình Quản Lý Vòng Đời Đặc Tả (Spec-Driven Development)

Dự án **Dylask** áp dụng triết lý **Spec-Driven Development**. Mọi tính năng đều phải có tài liệu đặc tả và trải qua vòng đời 3 giai đoạn nghiêm ngặt trước khi được phép lập trình.

---

## 📚 Tài Liệu Hướng Dẫn & Tiêu Chuẩn (References)
- [Definition of Done (DoD) Tiêu Chuẩn Hoàn Thành Tính Năng](./references/definition-of-done.md): Danh mục kiểm tra bắt buộc trước khi lưu trữ spec.
- [Hướng Dẫn Phân Rã Tính Năng Sang Code](./references/spec-breakdown-guide.md): Trình tự 7 bước từ Database -> Backend -> Frontend -> Test.
- [Quy Chuẩn Quản Lý Spec Dylask](./references/spec-rules.md): Nguyên tắc và quy ước đặt tên file spec.

---

## 🚦 Vòng Đời 3 Giai Đoạn (Spec Lifecycle)

```text
docs/specs/01.draft/       -->   docs/specs/02.approved/    -->   docs/specs/03.archive/
(Đang soạn thảo / Chờ duyệt)     (Đã duyệt - Được phép code)      (Đã hoàn thành 100% & Test pass)
```

1. **`01.draft/`**: Nơi chứa specs mới tạo hoặc đang chỉnh sửa.
   - ⚠️ **QUY TẮC BẤT DI BẤT DỊCH:** AI **TUYỆT ĐỐI KHÔNG ĐƯỢC PHÉP VIẾT CODE** ứng dụng khi spec còn nằm trong thư mục này.
2. **`02.approved/`**: Nơi chứa specs đã được người dùng / Lead review và duyệt.
   - ✅ AI **CHỈ BẮT ĐẦU LẬP TRÌNH** khi file spec tương ứng đã được chuyển vào thư mục này.
3. **`03.archive/`**: Nơi lưu trữ specs của các tính năng đã hoàn thành.
   - 📦 Sau khi code xong và toàn bộ test pass (`./mvnw test` và `npm run build`), file spec được di chuyển vào đây để lưu trữ lịch sử.

---

## 🛠️ Quy Trình Thực Hiện Cho Agent (Step-by-Step Procedure)

### Bước 1: Kiểm Tra Trạng Thái Duyệt (Approval Verification)
Trước khi nhận lệnh lập trình bất kỳ tính năng nào:
1. Kiểm tra vị trí của file spec tính năng trong thư mục:
   - Nếu spec nằm ở `docs/specs/01.draft/`: **Dừng lại ngay lập tức**. Thông báo cho người dùng rằng tính năng đang ở trạng thái Draft, cần được người dùng review và di chuyển sang `docs/specs/02.approved/` trước khi AI có thể sinh mã.
   - Nếu spec nằm ở `docs/specs/02.approved/`: Ghi nhận đã được duyệt, tiếp tục sang Bước 2.
2. Chạy script kiểm tra nhanh:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .agents/skills/spec-lifecycle/scripts/verify-spec-state.ps1 -FeatureName "FEAT-AUTH-01"
   ```

### Bước 2: Phân Rã Nhiệm Vụ Theo Trình Tự Chuẩn
Thực hiện theo [spec-breakdown-guide.md](./references/spec-breakdown-guide.md):
1. **Database:** Tạo file migration Flyway (Kích hoạt skill `flyway-db-migration`).
2. **Backend:** Tạo module `com.dylask.modules.<name>` (Kích hoạt skill `spring-backend-dev`).
3. **Frontend:** Định nghĩa types, API client, custom hook, dựng component từ `docs/layout-html/` (Kích hoạt skill `react-frontend-dev`).

### Bước 3: Kiểm Thử Toàn Diện (Automated Verification)
Chạy kiểm thử trên cả hai phần:
```powershell
# Kiểm thử Backend
cd dylask-backend
./mvnw clean compile
./mvnw test

# Kiểm thử Frontend
cd ../dylask-frontend
npm run build
npm run lint
```
Chỉ chuyển sang bước kế tiếp khi **100% kiểm thử thành công, không có lỗi biên dịch/lint**.

### Bước 4: Đối Chiếu Tiêu Chí Hoàn Thành (Definition of Done)
Mở [definition-of-done.md](./references/definition-of-done.md) và xác nhận mọi tiêu chuẩn đã được thỏa mãn.

### Bước 5: Lưu Trữ Spec (Archive)
Di chuyển file spec từ `docs/specs/02.approved/<ten-spec>.md` sang `docs/specs/03.archive/<ten-spec>.md`.
