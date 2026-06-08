# Posyandu Core API Server

Repositori ini berisi backend server untuk sistem Posyandu Banjarsari Garut. Dibangun menggunakan **Node.js/Bun**, **Express**, **TypeScript**, dan **Drizzle ORM** dengan database **PostgreSQL**.

---

## Prasyarat (Prerequisites)

Sebelum menjalankan aplikasi, pastikan Anda telah menginstal:

- [Bun](https://bun.sh/) (Rekomendasi package manager & runtime)
- [Docker & Docker Compose](https://www.docker.com/) (Jika ingin menjalankan PostgreSQL lokal melalui container)
- Database PostgreSQL aktif jika tidak menggunakan Docker.

---

## Langkah Instalasi & Persiapan

### 1. Kloning Repositori

```bash
git clone <repository_url>
cd Posyandu_Web_Server
```

### 2. Instalasi Dependensi

Gunakan Bun untuk menginstal modul Node:

```bash
bun install
```

### 3. Konfigurasi Environment Variables (`.env`)

Salin file `.env.example` menjadi `.env` lalu sesuaikan isinya:

```bash
cp .env.example .env
```

Isi variabel di `.env` sesuai kredensial database dan konfigurasi Auth Anda:

```env
LOG_LEVEL='info'
NODE_ENV='development'
PORT='3000'
CORS_ORIGIN='http://localhost:3001'

DATABASE_URL="postgresql://username:password@host:port/database"
BETTER_AUTH_SECRET="your_better_auth_secret_here"
BETTER_AUTH_URL="http://localhost:3000"
```

---

## Perintah Pengembangan (Development Commands)

Proyek ini dilengkapi dengan `makefile` untuk mempercepat eksekusi perintah development. Anda dapat menjalankan perintah berikut di terminal:

### Menjalankan Server

- **Mode Development (Lokal dengan watch mode)**:
    ```bash
    make dev
    ```
- **Menjalankan via Docker Compose**:
    ```bash
    make dc-up
    ```

### Operasi Database (Drizzle ORM)

- **Generate Migrasi**:
    ```bash
    make db-gen
    ```
- **Jalankan Migrasi ke Database**:
    ```bash
    make db-mig
    ```
- **Buka GUI Dashboard (Drizzle Studio)**:
    ```bash
    make db-studio
    ```

### Build & Produksi

- **Compile Kode TypeScript ke JavaScript**:
    ```bash
    make build
    ```
- **Jalankan Aplikasi dalam Mode Produksi**:
    ```bash
    make start
    ```

### Validasi Kode & Formatting

- **Typecheck (TypeScript)**:
    ```bash
    make typecheck
    ```
- **Linting Kode (ESLint)**:
    ```bash
    make lint
    ```
- **Formatting Otomatis (Prettier & ESLint Fix)**:
    ```bash
    make format
    ```

---

## Struktur Folder Proyek

Berikut adalah struktur folder keseluruhan di dalam proyek ini:

```text
Posyandu_Web_Server/
├── migrations/             # File hasil auto-generate Drizzle migrations (SQL)
├── src/
│   ├── configs/            # Konfigurasi database client, Swagger generator, dsb.
│   ├── constants/          # Nilai konstanta dan definisi pgEnum Drizzle
│   ├── controllers/        # Pengontrol HTTP (Express request/response handler)
│   ├── db/
│   │   ├── helpers/        # Helper kolom dasar & timestamps skema
│   │   ├── schemas/        # Definisi tabel Drizzle ORM
│   │   └── relations.ts    # Hubungan relasi antartabel database
│   ├── docs/               # Spesifikasi Swagger OpenAPI per fitur
│   ├── middlewares/        # Middleware otentikasi, otorisasi peran, validasi, & error
│   ├── repositories/       # Handler kueri database (Drizzle queries)
│   ├── routes/             # Definisi rute Express per modul
│   ├── services/           # Logika bisnis inti aplikasi
│   ├── types/              # Definisi interface/tipe TypeScript kustom
│   ├── utils/              # Fungsi utilitas (logger, api-response, async-handler)
│   ├── validations/        # Skema validasi muatan request menggunakan Zod
│   ├── app.ts              # Konfigurasi inisialisasi Express app
│   └── server.ts           # Bootstrapper pembuat server & listener port
├── .env.example            # Contoh template file konfigurasi env
├── docker-compose.yml      # Orkestrasi Docker untuk postgres & app
├── dockerfile              # Konfigurasi Docker image builder
├── makefile                # Custom make commands development
├── package.json            # Daftar dependensi npm/bun & scripts
└── tsconfig.json           # Konfigurasi compiler TypeScript
```

---

## Daftar Route API

Semua endpoint API didaftarkan menggunakan prefix `/api`. Berikut adalah daftar endpoint yang tersedia:

| Route Path                  | Deskripsi Modul / Fitur                               |
| :-------------------------- | :---------------------------------------------------- |
| `/api/health`               | Health Check status server                            |
| `/api/users`                | Pengelolaan data Pengguna (User) & Autentikasi        |
| `/api/parents`              | Pengelolaan data Orang Tua (Orang Tua Anak)           |
| `/api/cadres`               | Pengelolaan data Kader Posyandu                       |
| `/api/midwifes`             | Pengelolaan data Bidan                                |
| `/api/posyandus`            | Master data institusi Posyandu                        |
| `/api/health-centers`       | Master data Puskesmas (Pusat Kesehatan)               |
| `/api/vitamins`             | Master data Vitamin                                   |
| `/api/vaccines`             | Master data Vaksin                                    |
| `/api/vitamin-records`      | Riwayat / Pencatatan pemberian vitamin anak           |
| `/api/immunization-records` | Riwayat / Pencatatan imunisasi anak                   |
| `/api/kipi-details`         | Riwayat detail Kejadian Ikutan Pasca Imunisasi (KIPI) |
| `/api/nutrition-records`    | Riwayat tumbuh kembang / catatan gizi anak            |
| `/api/inventories`          | Pencatatan inventaris logistik internal posyandu      |
| `/api/education-categories` | Kategori artikel edukasi kesehatan secara dinamis     |
| `/api/educations`           | Artikel / konten edukasi kesehatan orang tua          |
