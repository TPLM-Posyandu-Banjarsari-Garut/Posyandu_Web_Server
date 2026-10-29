# Posyandu Core API Server

Dokumentasi gabungan server dan client tersedia di [Posyandu Web Docs](../Posyandu_Web_Docs/README.md).

Repositori ini berisi backend server untuk sistem Posyandu Banjarsari Garut. Dibangun menggunakan **Node.js/Bun**, **Express**, **TypeScript**, dan **Drizzle ORM** dengan database **PostgreSQL**.

---

## Prasyarat (Prerequisites)

Sebelum menjalankan aplikasi, pastikan Anda telah menginstal:

- [Bun 1.4.4](https://bun.sh/) (versi yang diwajibkan sebagai package manager dan runtime)
- [Podman dan Podman Compose](https://podman.io/) (Untuk menjalankan PostgreSQL dan aplikasi secara lokal)
- [Infisical CLI](https://infisical.com/docs/cli/overview) (Untuk manajemen secrets & environment variables)
- Database PostgreSQL aktif jika tidak menggunakan Podman.

---

## Langkah Instalasi & Persiapan

### 1. Kloning Repositori

```bash
git clone <repository_url>
cd Posyandu_Web_Server
```

### 2. Instalasi Dependensi

Gunakan Bun 1.4.4 untuk menginstal dependensi dari lockfile:

```bash
bun install --frozen-lockfile
```

### 3. Konfigurasi Secrets menggunakan Infisical

Proyek ini menggunakan **Infisical** untuk mengelola secrets secara aman.

1. **Login ke Akun Infisical Anda**:
    ```bash
    infisical login
    ```
2. **Inisialisasi Proyek**:
    ```bash
    infisical init
    ```
    Pilih organisasi `Posyandu Banjarsari` dan proyek `Posyandu Web Server`.

Server testing ini memakai environment Infisical `dev` (default pada `.infisical.json` dan Makefile). Simpan URL host dan kredensial PostgreSQL lokal di environment `dev`, pada root folder secret `/`:

| Secret                          | Nilai untuk testing lokal                                                                                                  |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                  | `postgresql://<DATABASE_USER>:<DATABASE_PASSWORD>@localhost:5432/<DATABASE_NAME>` untuk perintah yang dijalankan dari host |
| `DATABASE_USER`                 | Nama role PostgreSQL lokal                                                                                                 |
| `DATABASE_PASSWORD`             | Password lokal yang kuat; gunakan karakter alfanumerik agar aman dalam URL Compose                                         |
| `DATABASE_NAME`                 | Nama database lokal                                                                                                        |
| `DB_POOL_MAX`                   | `10` koneksi maksimum per proses aplikasi                                                                                  |
| `DB_POOL_IDLE_TIMEOUT_MS`       | `30000`                                                                                                                    |
| `DB_POOL_CONNECTION_TIMEOUT_MS` | `5000`                                                                                                                     |

Compose membentuk `DATABASE_URL` internal dengan hostname `postgres`, sehingga aplikasi dalam container mengakses database pada jaringan Podman. Jangan memakai URL host `localhost` untuk aplikasi dalam container. Server production harus memakai environment Infisical `prod` dan database production secara terpisah.

### 4. Konfigurasi `.env` Lokal (Opsional / Fallback)

Jika Anda menjalankan perintah tanpa Infisical, siapkan `.env` lokal yang diabaikan Git dan isi konfigurasi aplikasi yang diwajibkan. Nilai `DATABASE_URL` harus memakai `localhost` saat aplikasi berjalan langsung di host. Pool memakai default di atas jika variabelnya tidak diatur.

---

## Perintah Pengembangan (Development Commands)

Proyek ini dilengkapi dengan `makefile` untuk mempercepat eksekusi perintah development. Anda dapat menjalankan perintah berikut di terminal:

### Menjalankan Server

- **Mode Development (Lokal dengan watch mode)**:
    ```bash
    make dev
    ```
- **Menjalankan via Podman Compose**:
    ```bash
    make dc-up
    ```
- **Menjalankan di background**:
    ```bash
    make dc-bg
    ```
- **Menghentikan container tanpa menghapus data database**:
    ```bash
    make dc-down
    ```
- **Reset database lokal beserta volumenya**:
    ```bash
    make dc-reset
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
    Jalankan migrasi setelah PostgreSQL lokal sehat. Perintah ini memakai URL host `localhost` dari Infisical atau `.env`.
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

Enkripsi data sensitif, pengelolaan key Infisical, dan prosedur backfill dijelaskan di [panduan enkripsi](../Posyandu_Web_Docs/Posyandu_Web_Server/SECURITY_ENCRYPTION.md).

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
├── docker/
│   └── compose/
│       ├── base.yml         # Layanan bersama: app, PostgreSQL, jaringan, volume
│       ├── development.yml  # Target development, source mount, bun dev
│       └── production.yml   # Target production
├── dockerfile              # Konfigurasi image builder
├── makefile                # Custom make commands development
├── package.json            # Daftar dependensi npm/bun & scripts
└── tsconfig.json           # Konfigurasi compiler TypeScript
```

Stack container dijalankan melalui `make dc-up` atau `make dc-bg` untuk development. Untuk production gunakan `make dc-prod-up` atau `make dc-prod-bg`. Kedua stack mengambil konfigurasi environment dari Infisical; Compose hanya meneruskan variabel yang diperlukan aplikasi.

---

## CI/CD Pipeline

Proyek ini telah dikonfigurasi dengan alur kerja (_workflow_) GitHub Actions untuk mengotomatisasi integrasi dan pengujian kode secara kontinu (_Continuous Integration_ & _Continuous Testing_):

### 1. Continuous Integration (CI)

Berkas konfigurasi: `.github/workflows/ci.yml`
Berjalan otomatis pada setiap _Push_ ke branch `main` dan _Pull Request_ ke branch `main` & `dev`.
Tahapan yang dilakukan:

- **Instalasi Dependensi**: Mengunduh dan meng-cache modul dari `bun.lock`.
- **Typecheck**: Memastikan kode TypeScript bebas dari error tipe statik (`bun run typecheck`).
- **Linting & Formatting**: Memvalidasi standar penulisan kode (`bun run lint:check` dan `bun run format:check`).
- **Build**: Menguji kompilasi kode untuk memastikan tidak ada masalah saat _build_ rilis (`bun run build`).

### 2. Continuous Testing (CT)

Berkas konfigurasi: `.github/workflows/ct.yml`
Berjalan otomatis bersamaan dengan alur CI untuk memastikan fungsionalitas logika program tetap berjalan baik.
Tahapan yang dilakukan:

- **Unit Testing dengan Coverage**: Menjalankan seluruh pengujian (tes) unit otomatis menggunakan Jest (`bun run test:coverage`).
- **Laporan Otomatis (Artifacts)**: Mengunggah hasil dari laporan HTML pengujian (`jest-test-report`) dan _code coverage_ (`jest-coverage-report`) yang dapat diunduh langsung dari menu _Artifacts_ di halaman eksekusi GitHub Actions.

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
