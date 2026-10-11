# Dylask Web

Ứng dụng web toàn diện gồm **Backend (Spring Boot)** và **Frontend (React + Vite + TypeScript)**.

---

## 📁 Cấu trúc dự án

```text
dylask-web/
├── dylask-backend/          # RESTful API Backend (Spring Boot 4.x, Java 25, MapStruct)
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/dylask/
│   │   │   │   ├── common/       # Dùng chung (config, dto, entity, exception, util)
│   │   │   │   └── modules/      # Các module nghiệp vụ độc lập
│   │   │   │       ├── auth/     # Module Xác thực (controller, dto, service...)
│   │   │   │       └── user/     # Module Người dùng (controller, dto, entity, mapper, repository, service)
│   │   │   └── resources/
│   │   │       ├── db/migration/ # Flyway Database Migrations
│   │   │       └── application.yaml
│   └── pom.xml
├── dylask-frontend/         # Single Page Application (React 19 + TypeScript + Vite)
│   ├── src/
│   │   ├── api/             # API client & endpoints
│   │   ├── assets/          # Static assets (images, icons)
│   │   ├── components/      # UI components tái sử dụng
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Màn hình giao diện
│   │   ├── routes/          # Cấu hình định tuyến
│   │   ├── types/           # Định nghĩa TypeScript types/interfaces
│   │   └── utils/           # Helper functions
│   └── package.json
├── docker-compose.yml       # Khởi chạy MySQL container cho local development
├── .editorconfig            # Đồng bộ định dạng mã nguồn giữa các IDE
├── .env.example             # Biến môi trường mẫu cho database & backend
└── .gitignore               # Root git ignore
```

---

## 🚀 Hướng dẫn khởi chạy (Getting Started)

### 1. Yêu cầu môi trường
- **Java:** JDK 25 (hoặc tương thích theo `pom.xml`)
- **Node.js:** >= 20.x
- **Docker & Docker Compose** (để chạy MySQL)

---

### 2. Khởi chạy Database (MySQL)

Tạo file `.env` từ file mẫu:
```bash
cp .env.example .env
```

Khởi chạy MySQL container:
```bash
docker compose up -d
```
> Database MySQL sẽ chạy ở cổng `3306`, database name: `dylask_db`, password: `root_password`.

---

### 3. Khởi chạy Backend (`dylask-backend`)

Di chuyển vào thư mục backend và chạy ứng dụng:
```bash
cd dylask-backend

# Trên Windows:
./mvnw.cmd spring-boot:run

# Trên Linux/macOS:
./mvnw spring-boot:run
```
Backend API sẽ lắng nghe tại: `http://localhost:8080`

---

### 4. Khởi chạy Frontend (`dylask-frontend`)

Di chuyển vào thư mục frontend:
```bash
cd dylask-frontend

# Tạo file .env từ file mẫu
cp .env.example .env

# Cài đặt thư viện
npm install

# Khởi chạy server dev
npm run dev
```
Frontend sẽ hoạt động tại: `http://localhost:5173`
