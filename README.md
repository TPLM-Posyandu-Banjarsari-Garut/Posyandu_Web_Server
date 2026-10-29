# Posyandu Core API Server

Dokumentasi gabungan server dan client tersedia di [Posyandu Web Docs](../Posyandu_Docs/README.md).

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

Development memakai environment Infisical `dev`. Target production memakai environment `prod` secara terpisah. Simpan URL host dan kredensial PostgreSQL lokal di environment `dev`, pada root folder secret `/`:

| Secret                          | Nilai untuk testing lokal                                                                                                  |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                  | `postgresql://<DATABASE_USER>:<DATABASE_PASSWORD>@localhost:5432/<DATABASE_NAME>` untuk perintah yang dijalankan dari host |
| `DATABASE_USER`                 | Nama role PostgreSQL lokal                                                                                                 |
| `DATABASE_PASSWORD`             | Password lokal yang kuat; gunakan karakter alfanumerik agar aman dalam URL Compose                                         |
| `DATABASE_NAME`                 | Nama database lokal                                                                                                        |
| `DB_POOL_MAX`                   | `10` koneksi maksimum per proses aplikasi                                                                                  |
| `DB_POOL_IDLE_TIMEOUT_MS`       | `30000`                                                                                                                    |
| `DB_POOL_CONNECTION_TIMEOUT_MS` | `5000`                                                                                                                     |

Compose membentuk `DATABASE_URL` internal dengan hostname `postgres`, sehingga aplikasi dalam container mengakses database pada jaringan Podman. Jangan memakai URL host `localhost` untuk aplikasi dalam container. File Compose production saat ini menjalankan PostgreSQL pada host yang sama; siapkan backup volume PostgreSQL dan gunakan kredensial Infisical `prod`.

### 4. Konfigurasi `.env` Lokal (Opsional / Fallback)

Jika Anda menjalankan perintah tanpa Infisical, salin `.env.example` menjadi `.env` lalu ganti semua placeholder. Buat `DATA_ENCRYPTION_KEY` dengan `openssl rand -hex 32`. Nilai `DATABASE_URL` harus memakai `localhost` saat perintah dijalankan dari host. File `.env` diabaikan Git dan tidak boleh berisi kredensial production.

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
    Compose memakai port internal `3000`. Ubah port host melalui `APP_HOST_PORT` bila diperlukan.
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
- **Jalankan migrasi production**:
    ```bash
    make dc-prod-db-up
    make db-mig-prod
    ```
    `dc-prod-db-up` menunggu PostgreSQL sehat. Simpan `DATABASE_URL` host-reachable di Infisical environment `prod` untuk menjalankan migrasi dari host. Untuk PostgreSQL Compose, gunakan `localhost:${DB_PORT:-5432}`. Aplikasi production memakai hostname internal `postgres`.
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
├── .env.example            # Template environment lokal tanpa secret production
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

Stack development dijalankan melalui `make dc-up` atau `make dc-bg`. Untuk production, jalankan migrasi terlebih dahulu, lalu `make dc-prod-up` atau `make dc-prod-bg`. Target production selalu memakai Infisical environment `prod`; target development tetap memakai `dev`. `APP_HOST_PORT` mengatur port host, sementara aplikasi dalam container tetap mendengarkan port `3000`.

Sebelum deployment production:

- Set `CORS_ORIGIN` dan `BETTER_AUTH_URL` ke domain HTTPS, serta isi `TRUSTED_ORIGINS` dengan origin frontend yang sah.
- Gunakan `DATA_ENCRYPTION_KEY` yang sama dengan data terenkripsi yang sudah ada. Jangan mengganti key tanpa prosedur rotasi dan migrasi terencana.
- Isi kredensial R2 dan buat bucket/public domain yang sesuai. Jika cache lintas instance diperlukan, isi `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, dan `CLOUDFLARE_KV_NAMESPACE_ID`.
- Isi `TURNSTILE_SECRET_KEY` dan `CSRF_SECRET` production. Bila web push aktif, buat pasangan VAPID baru untuk deployment; jika tidak digunakan, biarkan kedua variabel VAPID kosong. Pasangan VAPID yang sebelumnya tertanam di source harus dianggap terekspos dan dirotasi.
- Upstash Redis masih digunakan untuk Better Auth secondary storage dan distributed rate limiting; Cloudflare KV hanya dipakai untuk cache data aplikasi. Siapkan Upstash untuk deployment multi-instance.
- Siapkan OAuth redirect URI Google, domain pengirim terverifikasi Resend, reverse proxy TLS, DNS, firewall, backup/restore PostgreSQL, dan pemantauan log.
- Jalankan migrasi sebelum aplikasi diperbarui. Untuk data lama yang memerlukan backfill enkripsi, lakukan backup, preview dengan `make data-encrypt-preview-prod`, lalu apply dengan `make data-encrypt-apply-prod` setelah hasilnya ditinjau.
- GitHub Actions saat ini hanya menjalankan unit test sesuai konfigurasi CI. Build image dan deployment belum dijalankan otomatis oleh workflow.

---

## CI/CD Pipeline

Proyek memiliki satu workflow GitHub Actions untuk unit test. Build, lint, formatting, dan deployment tidak dijalankan oleh workflow ini.

### 1. Continuous Integration (CI)

Berkas konfigurasi: `.github/workflows/ci.yml`. Workflow berjalan pada push ke `main` dan pull request ke `main` atau `dev`. Tahapannya:

- **Instalasi Dependensi** dari `bun.lock`.
- **Unit testing** dengan `bun run test:ci`.

Build dan unit testing juga dijalankan oleh hook pre-push lokal. Tidak ada workflow deployment otomatis.

---

## Daftar Route API

Semua endpoint API didaftarkan menggunakan prefix `/api`. Berikut adalah daftar endpoint yang tersedia:

| Route Path                  | Deskripsi Modul / Fitur                               |
| :-------------------------- | :---------------------------------------------------- |
| `/api/health/live`          | Liveness check server                                 |
| `/api/health/ready`         | Readiness check server dan database                   |
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
