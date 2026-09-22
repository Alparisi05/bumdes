# Backend Sistem Informasi BUMDes Budidaya Melon

Backend RESTful API untuk Sistem Informasi BUMDes Budidaya Melon menggunakan Node.js, Express, Prisma ORM, SQLite (Development), dan PostgreSQL (Production).

---

## 🛠️ Tech Stack

- **Runtime & Framework:** Node.js + Express.js
- **Database & ORM:** SQLite (Development) / PostgreSQL (Production) + Prisma ORM
- **Authentication & Security:** JWT (JSON Web Token), bcrypt
- **Validation:** Zod
- **Environment Management:** dotenv
- **Development Tool:** Nodemon

---

## 📁 Struktur Folder Project

```text
c:\CAPSTONEPROJECT
├── prisma/
│   └── schema.prisma        # Definisi ERD Database, Model, & Enum Prisma
├── src/
│   ├── controllers/         # Handler logic bisnis untuk setiap endpoint (Placeholders)
│   ├── middlewares/         # Middleware Express (JWT Auth, Validator, Error Handler)
│   │   └── errorHandler.js  # Global error handler middleware
│   ├── routes/              # Routing URL API
│   │   └── health.routes.js # Endpoint health check (/api/health)
│   ├── utils/               # Helper & utilities
│   │   ├── prisma.js        # Client Prisma singleton
│   │   └── response.js      # Helper format response JSON standar
│   ├── validators/          # Skema validasi request input menggunakan Zod
│   └── index.js             # Entry point aplikasi Express
├── .env.example             # Template konfigurasi variabel environment
├── .env                     # Variabel environment lokal (tidak di-commit ke Git)
├── .gitignore               # Daftar file/folder yang diabaikan oleh Git
├── package.json             # Dependensi & script aplikasi
└── README.md                # Dokumentasi & panduan penggunaan
```

---

## 📄 Penjelasan Singkat File Utama

1. **`src/index.js`**: File utama (entry point) aplikasi. Menginisialisasi Express, mengaktifkan middleware `cors` dan `express.json`, mendaftarkan rute, memproses request 404, serta menjalankan server di port dari `.env`.
2. **`prisma/schema.prisma`**: Mengatur koneksi database dan mendefinisikan seluruh struktur model ERD (User, Product, PlantingPeriod, Transaction, TransactionItem, ExpenseCategory, Expense, StockMovement) beserta enum (Role, TipeStok).
3. **`src/utils/response.js`**: Helper fungsi (`successResponse` & `errorResponse`) untuk memastikan format JSON yang dikembalikan API selalu konsisten:
   ```json
   {
     "success": true,
     "message": "Pesan deskriptif",
     "data": { ... }
   }
   ```
4. **`src/middlewares/errorHandler.js`**: Middleware penanganan error terpusat yang otomatis menangani Zod validation error, Prisma error, JSON syntax error, dan internal server error (500).
5. **`src/utils/prisma.js`**: Menginisialisasi instance tunggal (singleton) PrismaClient agar koneksi database dapat digunakan ulang dengan efisien di seluruh aplikasi.
6. **`package.json`**: Menyimpan metadata project, daftar package dependensi (`express`, `@prisma/client`, `jsonwebtoken`, `bcrypt`, `zod`, `dotenv`, `cors`), dan script pengembang (`npm run dev`, `npx prisma migrate dev`, dll).
7. **`.env.example`**: Contoh variabel lingkungan seperti `PORT`, `DATABASE_URL`, dan `JWT_SECRET`.

---

## 🚀 Panduan Setup & Cara Menjalankan

### 1. Prasyarat
Pastikan **Node.js** (v18+) dan **npm** sudah terinstall di komputer Anda.

### 2. Install Dependensi
Jalankan perintah berikut di terminal root proyek untuk memasang seluruh paket yang dibutuhkan:
```bash
npm install
```

### 3. Konfigurasi Environment File
Salin file `.env.example` menjadi `.env`:
```bash
# Untuk PowerShell / CMD di Windows:
copy .env.example .env
```

Isi variabel di dalam `.env` sesuai kebutuhan (default SQLite sudah siap pakai):
```env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="bumdes_melon_super_secret_key_123"
NODE_ENV="development"
```

### 4. Jalankan Migrasi Database (Prisma)
Jalankan migrasi untuk membuat tabel database SQLite secara otomatis sesuai skema ERD:
```bash
npx prisma migrate dev --name init
```

*Note: Perintah di atas juga akan otomatis melakukan `npx prisma generate` untuk mengenerate Prisma Client.*

### 5. Jalankan Database Seed (Mengisi Data Awal)
Untuk mengisi data awal (3 User, 4 Produk Melon, 5 Kategori Pengeluaran, 1 Periode Tanam), jalankan:
```bash
npm run db:seed
# Atau menggunakan CLI Prisma:
npx prisma db seed
```

### 6. Jalankan Server Pengembang
Jalankan server dalam mode development dengan auto-reload menggunakan `nodemon`:
```bash
npm run dev
```

Server akan berjalan di `http://localhost:5000`.

---

## 🧪 Contoh Payload JSON untuk Pengujian Postman

### Pengujian Tambah Produk Baru (`POST /api/auth/login` -> `POST /api/products`)

Untuk menguji endpoint `POST /api/products` (khusus role ADMIN), Anda dapat menyalin salah satu contoh JSON request body berikut ke dalam Postman:

#### 🟢 Contoh 1: Melon Intanon
```json
{
  "nama": "Melon Intanon",
  "hargaPerKg": 40000,
  "stokKg": 80
}
```

#### 🟡 Contoh 2: Melon Japanese Musk
```json
{
  "nama": "Melon Japanese Musk",
  "hargaPerKg": 45000,
  "stokKg": 50
}
```

#### 🟠 Contoh 3: Melon Golden Langkawi
```json
{
  "nama": "Melon Golden Langkawi",
  "hargaPerKg": 38000,
  "stokKg": 100
}
```

---

## 🧪 Pengujian Endpoint API

### Health Check Endpoint
Buka browser atau API client (Postman/Thunder Client/Insomnia) dan akses:
- **URL**: `GET http://localhost:5000/api/health`
- **Response**:
```json
{
  "success": true,
  "message": "Service BUMDes Budidaya Melon beroperasi dengan baik",
  "data": {
    "status": "UP",
    "timestamp": "2026-09-20T12:45:00.000Z",
    "uptime": 12.34
  }
}
```

---

## 🔄 Migrasi dari SQLite ke PostgreSQL (Production)

Untuk beralih ke PostgreSQL di lingkungan produksi:
1. Ubah `provider` pada file `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Update `DATABASE_URL` di file `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/bumdes_melon?schema=public"
   ```
3. Jalankan migrasi:
   ```bash
   npx prisma migrate dev
   ```
