# Thư Mục Specs Đang Chờ Duyệt (Draft Specs)

Tất cả các tài liệu đặc tả ở đây đang ở trạng thái **DRAFT (Đang soạn thảo / Chờ review)**.

---

## 🚦 Quy trình duyệt và triển khai:
1. Soạn thảo file spec mới trong thư mục `01.draft/` này.
2. Khi người dùng review và đồng ý nội dung, di chuyển file sang thư mục **[`02.approved/`](../02.approved/)**.
3. AI **CHỈ ĐƯỢC PHÉP** bắt đầu lập trình khi spec nằm trong thư mục `02.approved/`.
4. Sau khi lập trình xong và toàn bộ test pass (`./mvnw test` và `npm run build`), file spec sẽ được di chuyển sang **[`03.archive/`](../03.archive/)**.

---

## 📋 Trạng Thái Hiện Tại:
> [!NOTE]
> Toàn bộ 15 specs tính năng ban đầu (`FEAT-AUTH-01` -> `FEAT-AI-03`) đã được duyệt và chuyển sang thư mục **[`02.approved/`](../02.approved/)**.
> Khi có tính năng mới cần phát triển, hãy tạo file spec dạng `FEAT-<PHÂN_HỆ>-<STT>-<tên>.md` tại thư mục này.
