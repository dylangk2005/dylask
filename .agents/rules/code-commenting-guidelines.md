# Quy Chuẩn Comment Mã Nguồn (Code Commenting Guidelines) - Dylask Project

Tài liệu này định nghĩa các nguyên tắc và tiêu chuẩn bắt buộc khi viết chú thích (comments) trong mã nguồn của dự án **Dylask** (áp dụng cho cả Backend Java/Spring Boot và Frontend TypeScript/React).

---

## 🎯 1. Triết lý cốt lõi (Core Philosophy)

> **"Code giải thích CÁI GÌ (WHAT) và NHƯ THẾ NÀO (HOW). Comment giải thích TẠI SAO (WHY) và NGỮ CẢNH (CONTEXT)."**

1. **Ưu tiên code tự thân rõ nghĩa (Self-documenting code):** Đặt tên biến, hàm, class chuẩn mực và tường minh trước khi nghĩ đến việc viết comment.
2. **Comment giải thích lý do nghiệp vụ & quyết định kỹ thuật:** Tập trung giải thích tại sao lại dùng thuật toán này, tại sao lại có ràng buộc này, ca ngoại lệ hoặc rủi ro bảo mật là gì.
3. **Đồng bộ tuyệt đối giữa code và comment:** Khi sửa đổi logic code, **BẮT BUỘC** phải cập nhật lại comment tương ứng. Không bao giờ để lại comment sai lệch logic (Outdated comments).

---

## 📌 2. Bốn Vị Trí BẮT BUỘC Phải Có Comment

### ① Header Method nghiệp vụ (Javadoc & TSDoc)
Mọi phương thức công khai (public methods) trong `Service`, `Repository`, `Controller`, `Custom Hook`, và `API Client` phải có tài liệu chuẩn:

- **Backend (Java - Javadoc chuẩn):**
  ```java
  /**
   * Xác thực mã OTP và kích hoạt tài khoản người dùng.
   * Cấp phát cặp JWT Access Token và Refresh Token Rotation nếu mã hợp lệ.
   *
   * @param request Chứa email người dùng và mã OTP 6 chữ số
   * @return AuthResponse Thông tin phiên đăng nhập mới kèm Access Token
   * @throws AppException USER_NOT_FOUND nếu không tìm thấy người dùng
   * @throws AppException OTP_EXPIRED nếu mã quá hạn 10 phút
   * @throws AppException INVALID_OTP nếu mã không trùng khớp
   */
  AuthResponse verifyEmail(VerifyEmailRequest request);
  ```

- **Frontend (TypeScript - TSDoc chuẩn):**
  ```typescript
  /**
   * Xác thực mã OTP 6 chữ số gửi qua email để kích hoạt tài khoản.
   * Tự động lưu Access Token vào state và chuyển hướng người dùng vào Dashboard.
   *
   * @param payload Email và mã xác thực 6 chữ số
   */
  const verifyEmail = async (payload: VerifyEmailRequest): Promise<void> => { ... };
  ```

---

### ② Đánh số thứ tự các bước trong luồng nghiệp vụ phức tạp (Step-by-Step Flow)
Với các hàm nghiệp vụ có từ 3 bước trở lên, **bắt buộc đánh số thứ tự** `// 1.`, `// 2.`, `// 3.` để người đọc nắm được "mục lục" của hàm chỉ trong vài giây:

```java
@Override
@Transactional
public AuthResponse verifyEmail(VerifyEmailRequest request) {
    // 1. Kiểm tra tài khoản người dùng tồn tại và trạng thái kích hoạt trước đó
    User user = userRepository.findByEmail(request.email())
            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

    // 2. Kiểm tra tính tồn tại và thời hạn hiệu lực của mã xác thực (tối đa 10 phút)
    EmailVerification verification = emailVerificationRepository.findTopByUserIdOrderByCreatedAtDesc(user.getId())
            .orElseThrow(() -> new AppException(ErrorCode.OTP_EXPIRED));

    if (verification.getExpiresAt().isBefore(Instant.now())) {
        throw new AppException(ErrorCode.OTP_EXPIRED);
    }

    // 3. Phòng vệ Brute-force: Giới hạn tối đa 5 lần nhập sai
    if (verification.getAttemptCount() >= MAX_OTP_ATTEMPTS) {
        throw new AppException(ErrorCode.MAX_OTP_ATTEMPTS_EXCEEDED);
    }

    // 4. So khớp mã băm an toàn một chiều SHA-256
    String inputOtpHash = tokenService.hashToken(request.otp().trim());
    if (!verification.getOtpHash().equals(inputOtpHash)) {
        verification.setAttemptCount(verification.getAttemptCount() + 1);
        emailVerificationRepository.save(verification);
        throw new AppException(ErrorCode.INVALID_OTP);
    }

    // 5. Kích hoạt tài khoản chính thức và dọn dẹp mã OTP đã sử dụng
    user.setIsVerified(true);
    userRepository.save(user);
    emailVerificationRepository.deleteAllByUserId(user.getId());

    // 6. Cấp phát phiên làm việc mới (Cơ chế Token Rotation)
    return createAuthResponse(user);
}
```

---

### ③ Quyết định kiến trúc, Ràng buộc phi chức năng & Edge Cases (Architecture & Security)
Những nơi code xử lý kỹ thuật ngầm, không hiển nhiên (non-obvious) phải có giải thích rõ ràng:

1. **Bảo mật (Security):**
   ```java
   // Chỉ lưu mã băm SHA-256 của Refresh Token và OTP trong CSDL.
   // Nếu CSDL bị lộ, kẻ tấn công cũng không thể sử dụng để giả mạo phiên làm việc.
   String hashedRefreshToken = tokenService.hashToken(rawRefreshToken);
   ```
2. **Khả năng chịu lỗi (Graceful Degradation):**
   ```java
   // Nếu gửi qua SMTP thất bại do mạng/cấu hình, hệ thống vẫn in mã OTP dự phòng ra log terminal
   // để lập trình viên và người kiểm thử không bị gián đoạn luồng làm việc.
   ```
3. **Tương thích hệ điều hành / Định dạng bên thứ 3:**
   ```java
   // Google App Password có định dạng 4 cụm "xxxx xxxx xxxx xxxx".
   // Cần loại bỏ khoảng trắng trước khi xác thực qua JavaMail SMTP.
   value = value.replace(" ", "");
   ```
4. **Hạn chế kỹ thuật / Version quirks:**
   ```java
   // Spring Boot 4 / Jackson 3 sử dụng tools.jackson.databind thay cho com.fasterxml.jackson.
   ```

---

### ④ Chuẩn hóa định dạng `TODO` và `FIXME`
Không viết `// TODO: fix this` chung chung. Mọi ghi chú việc cần làm phải tuân thủ format:

- `// TODO(<tên_module>): <Mô tả rõ ràng việc cần làm, điều kiện kích hoạt>`
  *Ví dụ:* `// TODO(auth): Chuyển Refresh Token sang lưu trên Redis Cluster khi quy mô đạt >100k DAU.`
- `// FIXME(<tác_giả/ngày>): <Vấn đề phát hiện và giải pháp đề xuất>`
  *Ví dụ:* `// FIXME: Bổ sung rate-limit theo IP cho API resend-verification để chống spam mailer.`

---

## 🚫 3. Ba Điều TUYỆT ĐỐI CẤM (Anti-patterns)

1. **CẤM để code chết (Commented-out code):**
   - Không comment code cũ lại để "dự phòng". Mọi lịch sử code đã được lưu trữ an toàn trong Git.
   - Code không dùng nữa phải xóa triệt để để giữ file sạch sẽ.
2. **CẤM viết comment hiển nhiên (Noise comments):**
   ```java
   // ❌ KHÔNG VIẾT THẾ NÀY:
   // Gán tên cho user
   user.setName(name);
   // Kiểm tra nếu danh sách rỗng
   if (list.isEmpty()) return;
   ```
3. **CẤM dùng comment để giải thích cho code viết ẩu:**
   - Nếu một hàm quá dài hoặc khó hiểu, hãy **Refactor** (tách hàm nhỏ, đặt tên hàm rõ nghĩa) thay vì cố viết một đoạn comment thật dài để bào chữa cho đoạn code đó.

---

## 📋 4. Bảng Tra Cứu Nhanh (Quick Checklist)

- [ ] Phương thức nghiệp vụ có Javadoc / TSDoc tóm tắt mục đích, param, return, throws chưa?
- [ ] Hàm nghiệp vụ nhiều bước đã được đánh số `// 1.`, `// 2.`, `// 3.` chưa?
- [ ] Các xử lý liên quan đến băm bảo mật (SHA-256, BCrypt), Token Rotation đã có ghi chú giải thích chưa?
- [ ] Đã xóa sạch code cũ bị comment đi chưa?
- [ ] Không có comment hiển nhiên, lặp lại tên biến/hàm?
