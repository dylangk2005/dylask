# Quy Chuẩn Chuyển Động & Tương Tác UI (UI Motion & Interaction Rules)

Tài liệu này là quy ước bắt buộc cho Frontend của dự án **Dylask Web** nhằm đảm bảo mọi trang, component, và thẻ tương tác đều đạt tiêu chuẩn thẩm mỹ cao cấp, sống động, mượt mà và có phản hồi vi mô (micro-interactions) rõ nét.

---

## ⚡ 1. Triết Lý Thiết Kế: "Alive & Responsive"

1. **Không có phần tử bất động (No Dead Elements):** Mọi thành phần người dùng có thể nhấp (Buttons, Links, Cards, Inputs, Tabs, Chips) **bắt buộc** phải có hiệu ứng `hover`, `focus-visible`, và `active/tap`.
2. **GPU-Accelerated 60fps:** Mọi hiệu ứng chuyển động chuyển đổi ưu tiên sử dụng `transform` (`translate`, `scale`, `rotate`) và `opacity`. Hạn chế animate trực tiếp các thuộc tính gây re-layout như `width`, `height`, `top`, `left`, `margin`.
3. **Độ trễ có chủ đích (Intentional Timing):**
   - Phản hồi siêu nhanh (Hover/Click): **120ms - 200ms**.
   - Chuyển trang / Modal / Drawer: **250ms - 400ms**.
   - Hoạt ảnh bồng bềnh / Hào quang nền (Ambient Float / Pulse): **4s - 8s**.

---

## 🎨 2. Motion Design Tokens Chuẩn (CSS Variables)

Các biến CSS này được định nghĩa toàn cục tại `src/index.css`:

```css
:root {
  /* Easing curves */
  --ease-out-quad: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --ease-smooth: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Duration tokens */
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;

  /* Composite transitions */
  --transition-fast: all 150ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --transition-smooth: all 250ms cubic-bezier(0.16, 1, 0.3, 1);
  --transition-spring: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Hover Lift Shadows */
  --shadow-hover-sm: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-hover-md: 0 8px 24px -4px rgba(0, 0, 0, 0.15);
  --shadow-hover-teal: 0 8px 24px -4px rgba(20, 184, 166, 0.35);
}
```

---

## 🎯 3. Quy Chuẩn Cho Từng Thành Phần Cụ Thể

### 3.1. Buttons (Nút Bấm)
- **Normal:** Gradient hoặc màu nền chuẩn token, bo góc `--radius`.
- **Hover:**
  - Nhấc nhẹ lên: `transform: translateY(-1.5px)`.
  - Đổ bóng nhẹ phản quang: `box-shadow: 0 6px 20px rgba(15, 118, 110, 0.3)`.
  - Chuyển màu nền nhẹ hoặc tăng độ rực dải gradient.
- **Active (Click):**
  - Nhún nhẹ xuống: `transform: translateY(0px) scale(0.985)`.
- **Loading:**
  - Giảm opacity về `0.75`, cursor `not-allowed`.
  - Icon spinner xoay đều 360 độ: `animation: spin 0.8s linear infinite`.

### 3.2. Form Inputs (Ô Nhập Liệu)
- **Normal:** Nền surface, border 1px viền trung tính.
- **Hover:** Border chuyển sang `var(--color-border-strong)`.
- **Focus:** 
  - Đổi màu border sang `var(--color-primary)`.
  - Thêm vòng hào quang (Focus Ring): `box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.12)`.
  - Transition mượt `0.18s ease`.
- **Error state:** Viền đỏ `var(--color-danger)` và focus ring ánh đỏ `rgba(220, 38, 38, 0.08)`.

### 3.3. Cards & Containers (Thẻ Nội Dung & Khối Thông Tin)
- **Hover Lift:** `transform: translateY(-4px)` kèm tăng độ sâu bóng đổ.
- **Border Glow:** Khi hover, viền thẻ sáng dần lên theo tông màu thương hiệu (`rgba(45, 212, 191, 0.4)` trong Dark Mode hoặc ngọc bích nhạt trong Standard Mode).
- **Glassmorphism:** Sử dụng `backdrop-filter: blur(12px)` trên nền mờ tối hoặc trắng sáng.

### 3.4. Navigation & Tabs
- Tab chuyển đổi phải có nền pill trượt mềm mại hoặc hiệu ứng shadow mượt mà khi kích hoạt (`box-shadow: 0 1px 3px rgba(0,0,0,0.08)`).
- Không chuyển đổi thô cứng, luôn có transition mượt tối thiểu `0.2s`.

### 3.5. Visual Entrances (Xuất Hiện & Tiết Lộ)
- Khi mở modal, danh sách items, hoặc chuyển trang: dùng `@keyframes fadeInSlide` (trượt nhẹ từ dưới lên 10-15px kết hợp opacity từ 0 đến 1).
- Trình diễn hình ảnh / Hero: Thêm hiệu ứng bồng bềnh tuần hoàn (`animation: heroFloat 6s ease-in-out infinite`).
