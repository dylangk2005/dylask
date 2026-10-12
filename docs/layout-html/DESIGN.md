# Dylask Web - Design Tokens & Visual Guidelines (`DESIGN.md`)

Tài liệu này định nghĩa toàn bộ **Design Tokens**, quy tắc trực quan và hệ thống biến CSS (CSS Variables) dùng chung cho mọi màn hình giao diện của dự án **Dylask**.

---

## 1. Triết Lý Thiết Kế & Cảm Giác Trực Quan (Design Aesthetic)

Hệ thống giao diện Dylask vận hành theo kiến trúc **Dual-Mode**, phục vụ hai ngữ cảnh sử dụng riêng biệt:

### 1.1. Chế độ Tiêu Chuẩn (Standard Mode)
- **Cảm giác chủ đạo:** Nhẹ nhàng, thoáng đãng, thân thiện, tinh tế và thanh lịch.
- **Mục tiêu:** Giúp người dùng quản lý công việc cá nhân, gia đình, học tập với trải nghiệm thư thái, giảm thiểu áp lực thị giác.
- **Bố cục & Nhịp điệu:** Khoảng cách rộng rãi (relaxed spacing), mật độ thông tin vừa phải, phân tầng trực quan rõ ràng, dễ tiếp cận trên cả máy tính lẫn thiết bị di động.

### 1.2. Chế độ Lập Trình Viên (Developer Mode)
- **Cảm giác chủ đạo:** Gọn gàng (compact), mật độ thông tin cao (high density), tối (dark theme), chuẩn phong cách công cụ kỹ thuật (technical developer tool / CLI-inspired UI).
- **Mục tiêu:** Tối ưu hóa hiệu suất làm việc của kỹ sư phần mềm; tối đa hóa diện tích hiển thị dữ liệu (Kanban board, Backlog, Git branch, commit diff, story points, server logs) và tối ưu thao tác bằng phím tắt (`Ctrl + K`).
- **Bố cục & Nhịp điệu:** Khoảng cách cô đọng (compact spacing), đường nét kỹ thuật sắc sảo, độ tương phản cao cho mã nguồn và trạng thái.

### 1.3. Nguyên Tắc Bất Khả Xâm Phạm (Strict Constraints)
- **KHÔNG dùng Gradient:** Toàn bộ bề mặt, nút bấm, viền và thẻ sử dụng màu phẳng (Solid Flat Colors).
- **KHÔNG dùng Glow (Phát sáng):** Không sử dụng bất kỳ hiệu ứng ánh sáng neon, đổ bóng màu tỏa viền.
- **KHÔNG dùng Glassmorphism:** Tuyệt đối không dùng nền mờ `backdrop-filter: blur()`, độ trong suốt ảo giác. Mọi bề mặt phải có màu đục dứt khoát.
- **KHÔNG đổ bóng (No Box-Shadow):** Toàn bộ giao diện sử dụng `box-shadow: none;` để giữ phong cách phẳng, hiện đại và tập trung vào nội dung.
- **KHÔNG dùng Emoji:** Tuyệt đối không dùng emoji trong giao diện, icon, nhãn danh mục, độ ưu tiên hay trạng thái. Mọi ký hiệu biểu trưng đều sử dụng **Lucide Icons**.

---

## 2. Hệ Thống Phông Chữ (Typography)

Dylask tích hợp hai bộ phông chữ tiêu chuẩn từ Google Fonts:

1. **Phông Giao Diện Chính (UI Font):** `Plus Jakarta Sans`
   - Sử dụng cho: Tiêu đề, văn bản nội dung, nhãn, nút bấm, điều hướng, form nhập liệu.
   - Thể hiện sự hiện đại, các nét bo tròn nhẹ nhàng tạo cảm giác thân thiện ở Standard Mode và rõ nét ở Developer Mode.
   - Phông chữ dự phòng: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`.

2. **Phông Chữ Kỹ Thuật & Mã Nguồn (Code / Monospace Font):** `JetBrains Mono`
   - Sử dụng cho: Khối mã nguồn (code blocks), mã định danh task (`DYL-102`), tên Git Branch (`feature/DYL-102-jwt-auth`), commit hashes (`a3f89c1`), phím tắt (`Ctrl+K`), Story Points, timestamp kỹ thuật, logs.
   - Phông chữ dự phòng: `'Fira Code', 'Courier New', monospace`.

### Quy chuẩn Tỷ lệ Phông (Typography Scale):
| Token | Kích thước | Chiều cao dòng (Line Height) | Ứng dụng |
| :--- | :--- | :--- | :--- |
| `--font-size-xs` | `11px` (`0.6875rem`) | `14px` | Badge nhỏ, phím tắt, metadata phụ |
| `--font-size-sm` | `12px` (`0.75rem`) | `16px` | Nhãn phụ, thông tin thời gian, git branch |
| `--font-size-base` | `14px` (`0.875rem`) | `20px` | Văn bản chính, nội dung task, input, button |
| `--font-size-md` | `16px` (`1rem`) | `24px` | Tiêu đề card, mục danh mục, tab active |
| `--font-size-lg` | `18px` (`1.125rem`) | `26px` | Tiêu đề nhóm, tiêu đề cột Kanban |
| `--font-size-xl` | `22px` (`1.375rem`) | `28px` | Tiêu đề trang, tiêu đề modal lớn |
| `--font-size-2xl` | `26px` (`1.625rem`) | `32px` | Tiêu đề chính màn hình (H1) |

---

## 3. Bảng Màu (Color Palettes)

### 3.1. Chế độ Standard (Giao diện Sáng - Light)
| Mục đích | Tên biến CSS | Mã màu (HEX) | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Nền chính (Background)** | `--color-bg` | `#FAFAF7` | Tone xám ngà ấm, êm dịu, không chói mắt |
| **Bề mặt (Surface)** | `--color-surface` | `#FFFFFF` | Nền card, danh sách, header, thanh sidebar |
| **Bề mặt phụ (Surface Muted)** | `--color-surface-subtle` | `#F4F3EF` | Hover state, ô input, nền badge phụ |
| **Đường viền (Border)** | `--color-border` | `#E7E5E0` | Viền ngăn cách sắc nét, mảnh 1px |
| **Đường viền nhấn (Border Focus)** | `--color-border-strong` | `#D1CFCA` | Viền khi hover hoặc active |
| **Chữ chính (Text Primary)** | `--color-text` | `#1C1B18` | Đen ấm, độ tương phản cao, dễ đọc |
| **Chữ phụ (Text Secondary)** | `--color-text-muted` | `#6B6A63` | Xám trung tính cho mô tả, thời gian |
| **Chủ đạo (Primary / Brand)** | `--color-primary` | `#0F766E` | Xanh ngọc đậm (Deep Teal) tinh tế, điềm tĩnh |
| **Chủ đạo hover** | `--color-primary-hover` | `#115E59` | Tối hơn khi rê chuột vào nút chính |
| **Chủ đạo nền nhẹ** | `--color-primary-subtle`| `#E6F4F1` | Nền nhãn active, highlight nhẹ |

#### Mức độ Ưu tiên trong Standard Mode:
| Mức ưu tiên | Biến CSS | Mã màu (HEX) | Màu sắc trực quan |
| :--- | :--- | :--- | :--- |
| **Thấp (Low)** | `--priority-low` | `#3B82F6` | Xanh dương (Blue) |
| **Trung bình (Medium)** | `--priority-medium` | `#F59E0B` | Hổ phách / Vàng cam (Amber) |
| **Cao (High)** | `--priority-high` | `#DC2626` | Đỏ đậm (Red) |

---

### 3.2. Chế độ Developer (Giao diện Tối - Dark)
| Mục đích | Tên biến CSS | Mã màu (HEX) | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Nền chính (Background)** | `--color-bg` | `#0E1116` | Đen than kỹ thuật sâu, dịu mắt ban đêm |
| **Bề mặt (Surface)** | `--color-surface` | `#161B22` | Bề mặt chuẩn GitHub/IDE panel |
| **Bề mặt phụ (Surface Muted)** | `--color-surface-subtle` | `#21262D` | Thẻ Kanban, hàng hover, input background |
| **Đường viền (Border)** | `--color-border` | `#262C36` | Viền 1px phân tách chính xác các khung |
| **Đường viền nhấn (Border Focus)** | `--color-border-strong` | `#3A4250` | Viền active, viền cột Kanban chọn |
| **Chữ chính (Text Primary)** | `--color-text` | `#E6EDF3` | Trắng xám công nghệ, sắc nét |
| **Chữ phụ (Text Secondary)** | `--color-text-muted` | `#8B949E` | Xám kỹ thuật cho commit, branch, meta |
| **Chủ đạo (Primary / Brand)** | `--color-primary` | `#2DD4BF` | Xanh ngọc sáng (Teal/Mint), tương phản cao trên nền tối |
| **Chủ đạo hover** | `--color-primary-hover` | `#14B8A6` | Đậm hơn nhẹ khi rê chuột |
| **Chủ đạo nền nhẹ** | `--color-primary-subtle`| `#0D3331` | Nền highlight badge dev |

#### Mức độ Ưu tiên Kỹ thuật trong Developer Mode (P1 - P4):
| Mức ưu tiên | Biến CSS | Mã màu (HEX) | Phân loại & Màu sắc |
| :--- | :--- | :--- | :--- |
| **P1 (Critical / Blocker)** | `--priority-p1` | `#EF4444` | Đỏ (Red) - Sự cố khẩn cấp, chặn tiến độ |
| **P2 (High)** | `--priority-p2` | `#F97316` | Cam (Orange) - Nhiệm vụ trọng tâm Sprint |
| **P3 (Medium)** | `--priority-p3` | `#EAB308` | Vàng (Yellow) - Tính năng bình thường |
| **P4 (Low / Backlog)** | `--priority-p4` | `#6E7681` | Xám (Gray) - Cải tiến nhỏ, việc phụ |

---

### 3.3. Màu Trạng Thái Nghiệp Vụ Chung (Status Colors)
| Trạng thái | Biến CSS | Standard Mode | Developer Mode |
| :--- | :--- | :--- | :--- |
| **Thành công (Done / Success)** | `--color-success` | `#16A34A` | `#238636` |
| **Cảnh báo (Blocked / Warn)** | `--color-warning` | `#D97706` | `#D29922` |
| **Lỗi (Failed / Danger)** | `--color-danger` | `#DC2626` | `#F85149` |
| **Đang chạy (In Progress / Info)** | `--color-info` | `#2563EB` | `#58A6FF` |

---

## 4. Hình Học, Khoảng Cách & Quy Cách Viền (Geometry & Spacing)

- **Bo góc (Border Radius):** Cố định chuẩn **`6px`** (`--radius: 6px`) cho toàn bộ thành phần: nút bấm (button), ô nhập (input), thẻ (card), popover, modal dialog, bảng mã.
  - Các chi tiết đặc biệt: `--radius-sm: 4px` (cho badge nhỏ/phím tắt), `--radius-full: 9999px` (chỉ dùng cho avatar tròn hoặc radio indicator).
- **Độ dày viền (Border Width):** Chuẩn **`1px solid`** (`--border-width: 1px`). Không dùng viền dày 2px+ trừ khi là vòng focus bàn phím (`outline: 2px solid`).
- **Đổ bóng (Shadow):** Tuyệt đối **không đổ bóng** (`box-shadow: none;`). Phân tách lớp bằng màu viền và màu nền bề mặt.
- **Hệ thống khoảng cách (Spacing System):** Bắt buộc tuân theo **bội số của 4px**:

| Token | Giá trị | Ứng dụng |
| :--- | :--- | :--- |
| `--space-1` | `4px` | Khoảng cách micro: padding tag, gap icon nhỏ |
| `--space-2` | `8px` | Khoảng cách compact: gap nút bấm, padding bảng Dev, gap badge |
| `--space-3` | `12px` | Padding card nhỏ, gap danh sách task, padding input |
| `--space-4` | `16px` | Padding card tiêu chuẩn, khoảng cách giữa các phần tử |
| `--space-5` | `20px` | Padding header cột Kanban, padding modal |
| `--space-6` | `24px` | Khoảng cách giữa các cột lớn, padding trang |
| `--space-8` | `32px` | Khoảng cách phân đoạn lớn trên trang |
| `--space-10`| `40px` | Padding trang tổng quan (Standard Mode) |
| `--space-12`| `48px` | Khoảng cách khối chính |

---

## 5. Quy Chuẩn Biểu Tượng (Iconography)

- **Bộ biểu tượng duy nhất:** **Lucide Icons** (`https://lucide.dev`).
- **Kích thước tiêu chuẩn:**
  - Icon phụ / trong nhãn: `14px` x `14px` (stroke width: `1.75px`).
  - Icon nút bấm / điều hướng thông thường: `16px` x `16px` (stroke width: `1.75px`).
  - Icon tiêu đề nhóm / thanh công cụ chính: `20px` x `20px` (stroke width: `1.5px`).
- **Nguyên tắc nghiêm ngặt:** **Tuyệt đối không sử dụng Emoji** trong giao diện sản phẩm. Các ký hiệu như cờ ưu tiên, checkbox, lịch, đồng hồ Pomodoro, nhánh Git, nhãn thư mục đều bắt buộc dùng biểu tượng Lucide tương ứng (ví dụ: `Calendar`, `Clock`, `GitBranch`, `CheckSquare`, `Tag`, `AlertCircle`, `Command`).

---

## 6. Định Nghĩa Toàn Diện Dưới Dạng CSS Variables

Đoạn mã CSS bên dưới là bản quy chuẩn chính xác, sẵn sàng nhúng trực tiếp vào tệp stylesheet cốt lõi (`index.css` hoặc `variables.css`). Chế độ mặc định `:root` tương ứng với **Standard Mode** và thuộc tính `[data-mode="developer"]` kích hoạt **Developer Mode**.

```css
/* ==========================================================================
   DYLASK DESIGN SYSTEM - CSS VARIABLES
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. CẤU HÌNH MẶC ĐỊNH & STANDARD MODE (LIGHT - THOÁNG, THÂN THIỆN)
   -------------------------------------------------------------------------- */
:root {
  /* --- Typography --- */
  --font-family-sans: "Plus Jakarta Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-family-mono: "JetBrains Mono", "Fira Code", "Courier New", monospace;

  --font-size-xs: 11px;
  --font-size-sm: 12px;
  --font-size-base: 14px;
  --font-size-md: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 22px;
  --font-size-2xl: 26px;

  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* --- Spacing (Bội số 4px) --- */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;

  /* --- Geometry & Borders --- */
  --radius-sm: 4px;
  --radius: 6px;
  --radius-full: 9999px;
  --border-width: 1px;
  --box-shadow: none;

  /* --- Standard Mode Colors (Light Theme) --- */
  --color-bg: #FAFAF7;
  --color-surface: #FFFFFF;
  --color-surface-subtle: #F4F3EF;
  --color-border: #E7E5E0;
  --color-border-strong: #D1CFCA;

  --color-text: #1C1B18;
  --color-text-muted: #6B6A63;

  --color-primary: #0F766E;
  --color-primary-hover: #115E59;
  --color-primary-subtle: #E6F4F1;
  --color-primary-text: #FFFFFF;

  /* Standard Priorities */
  --priority-low: #3B82F6;
  --priority-low-bg: #EFF6FF;
  --priority-medium: #F59E0B;
  --priority-medium-bg: #FFFBEB;
  --priority-high: #DC2626;
  --priority-high-bg: #FEF2F2;

  /* System Status Colors */
  --color-success: #16A34A;
  --color-success-bg: #F0FDF4;
  --color-warning: #D97706;
  --color-warning-bg: #FFFBEB;
  --color-danger: #DC2626;
  --color-danger-bg: #FEF2F2;
  --color-info: #2563EB;
  --color-info-bg: #EFF6FF;

  /* Density & Layout Metrics for Standard Mode */
  --layout-density-padding-y: 12px;
  --layout-density-padding-x: 16px;
  --layout-item-gap: 12px;
  --table-row-height: 48px;
}

/* --------------------------------------------------------------------------
   2. DEVELOPER MODE (DARK - GỌN, MẬT ĐỘ CAO, KỸ THUẬT)
   -------------------------------------------------------------------------- */
[data-mode="developer"] {
  /* --- Developer Mode Colors (Dark Technical Theme) --- */
  --color-bg: #0E1116;
  --color-surface: #161B22;
  --color-surface-subtle: #21262D;
  --color-border: #262C36;
  --color-border-strong: #3A4250;

  --color-text: #E6EDF3;
  --color-text-muted: #8B949E;

  --color-primary: #2DD4BF;
  --color-primary-hover: #14B8A6;
  --color-primary-subtle: #0D3331;
  --color-primary-text: #0E1116;

  /* Developer Priorities (P1 -> P4) */
  --priority-p1: #EF4444;           /* Đỏ - Critical / Blocker */
  --priority-p1-bg: #3D1418;
  --priority-p2: #F97316;           /* Cam - High */
  --priority-p2-bg: #3B1F11;
  --priority-p3: #EAB308;           /* Vàng - Medium */
  --priority-p3-bg: #382C10;
  --priority-p4: #6E7681;           /* Xám - Low / Backlog */
  --priority-p4-bg: #1F242C;

  /* System Status Colors (Dark Adjusted) */
  --color-success: #238636;
  --color-success-bg: #0F2D17;
  --color-warning: #D29922;
  --color-warning-bg: #332408;
  --color-danger: #F85149;
  --color-danger-bg: #3E1616;
  --color-info: #58A6FF;
  --color-info-bg: #12243D;

  /* Density & Layout Metrics for Developer Mode (Compact / High-density) */
  --layout-density-padding-y: 8px;
  --layout-density-padding-x: 12px;
  --layout-item-gap: 8px;
  --table-row-height: 36px;
}
```

---

## 7. Quy Tắc Ứng Dụng Thành Phần Giao Diện (Component Guidelines)

Để đảm bảo không màn hình nào bị lệch quy chuẩn khi xây dựng cấu trúc HTML & CSS, các thành phần phải tuân theo mẫu sau:

### 7.1. Nút Bấm (Button)
- Chiều cao: `32px` (Standard) / `28px` (Developer Mode).
- Bo góc: `6px`.
- Viền: `1px solid`.
- Hiệu ứng: Chuyển màu nền nhẹ (`transition: background-color 0.15s ease, border-color 0.15s ease`), không đổ bóng, không bóng mở rộng khi click.

### 7.2. Ô Nhập Liệu (Input / Select)
- Font: `var(--font-family-sans)` cho ô thường, `var(--font-family-mono)` cho ô nhập branch, commit, filter query.
- Nền: `var(--color-surface)` hoặc `var(--color-surface-subtle)`.
- Viền: `1px solid var(--color-border)`.
- Trạng thái focus: `outline: 2px solid var(--color-primary); outline-offset: -1px;` mà không dùng glow/shadow.

### 7.3. Thẻ Công Việc (Task Card / Kanban Card)
- Bo góc: `6px`.
- Viền: `1px solid var(--color-border)`.
- Nền: `var(--color-surface)`.
- Trong Developer Mode: Thẻ hiển thị mã task (ví dụ: `DYL-102` dạng monospace), badge P1–P4, story point, tên branch kỹ thuật dạng tag nhỏ gọn.
- Trong Standard Mode: Thẻ hiển thị tiêu đề, checkbox tròn/vuông, nhãn Thấp/Trung bình/Cao, mốc giờ đến hạn.

### 7.4. Mã Kỹ Thuật & Phím Tắt (Keybinding & Code Badge)
- Luôn sử dụng font: `var(--font-family-mono)`.
- Ký hiệu phím tắt (ví dụ: `<kbd>Ctrl</kbd> + <kbd>K</kbd>`): nền `var(--color-surface-subtle)`, viền `1px solid var(--color-border)`, bo góc `4px`, chữ `var(--font-size-xs)`.

---

## 8. Bảng Đối Chiếu Nhanh (Cheat Sheet)

| Yếu tố | Standard Mode | Developer Mode |
| :--- | :--- | :--- |
| **Giao diện tổng quan** | Nền `#FAFAF7`, Chữ `#1C1B18` | Nền `#0E1116`, Chữ `#E6EDF3` |
| **Bề mặt chính (Card)** | `#FFFFFF` | `#161B22` |
| **Màu viền** | `#E7E5E0` | `#262C36` |
| **Màu thương hiệu (Accent)** | `#0F766E` (Deep Teal) | `#2DD4BF` (Bright Mint Teal) |
| **Độ ưu tiên (Priority)** | Thấp (`#3B82F6`), Vừa (`#F59E0B`), Cao (`#DC2626`) | P1 (Đỏ `#EF4444`), P2 (Cam `#F97316`), P3 (Vàng `#EAB308`), P4 (Xám `#6E7681`) |
| **Độ bo góc** | `6px` | `6px` |
| **Đổ bóng (Shadow)** | `none` | `none` |
| **Hiệu ứng đặc biệt** | Cấm tuyệt đối Gradient, Glow, Glassmorphism | Cấm tuyệt đối Gradient, Glow, Glassmorphism |
| **Biểu tượng** | Lucide Icons (Cấm Emoji) | Lucide Icons (Cấm Emoji) |
| **Mật độ thông tin** | Thoáng, thư thái, nhịp nhàng | Gọn, dày đặc, tối ưu không gian |
