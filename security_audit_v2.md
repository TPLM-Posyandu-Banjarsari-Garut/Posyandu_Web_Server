# Security Audit Report v2: Data Leakage Analysis

> Audit dilakukan terhadap seluruh schema (`src/db/schemas`), middleware (`authorize-role.ts`), route, dan controller, disilangkan dengan Functional Requirements (`fr.txt`) dan screenshot role access matrix.

---

## RINGKASAN EKSEKUTIF

| Kategori Risiko                                                     | Jumlah Temuan |
| :------------------------------------------------------------------ | :-----------: |
| 🔴 **KRITIS** — Kebocoran data antar pengguna yang tidak seharusnya |       4       |
| 🟠 **TINGGI** — Akses kontrol tidak konsisten dengan FR             |       3       |
| 🟡 **SEDANG** — Data sensitif tidak terlindungi di schema           |       3       |
| 🟢 **BAIK** — Sudah diimplementasikan dengan benar                  |       5       |

---

## 🔴 TEMUAN KRITIS

### [KRITIS-1] `parent` dapat melihat data anak orang tua lain (Insecure Direct Object Reference)

**File:** [nutrition-records-route.ts](file:///d:/2026/MY%20FILE/PROJECT/TPLM/Posyandu_Web_Server/src/routes/nutrition-records-route.ts), [nutrition-records-controller.ts](file:///d:/2026/MY%20FILE/PROJECT/TPLM/Posyandu_Web_Server/src/controllers/nutrition-records-controller.ts)

**Masalah:**

- Route GET `/nutrition-records` mengizinkan role `parent` mengakses data.
- Namun, di controller `getNutritionRecords`, **tidak ada filter `parent_id`** di query!
- Seorang `parent` hanya mengirim query kosong dan menerima **semua data gizi semua anak di sistem**.

```typescript
// nutrition-records-controller.ts — TIDAK ADA PROTEKSI
getNutritionRecords = async (req: Request, res: Response) => {
    const query = req.query as unknown as NutritionRecordQueryFilters
    const result =
        await this.nutrition_record_service.getNutritionRecords(query)
    // ☠️ parent bisa dapat semua data gizi anak orang lain!
}
```

**Bandingkan dengan** [childrens-controller.ts](file:///d:/2026/MY%20FILE/PROJECT/TPLM/Posyandu_Web_Server/src/controllers/childrens-controller.ts) yang sudah benar:

```typescript
if (user?.role === 'parent') {
    query.parent_id = user.parent_id // ✅ filter terpasang
}
```

**Rekomendasi Perbaikan:**

```typescript
getNutritionRecords = async (req: Request, res: Response) => {
    const user = res.locals.user
    const query = req.query as unknown as NutritionRecordQueryFilters

    if (user?.role === 'parent') {
        query.parent_id = user.parent_id // enforce filter di sisi server
    }

    const result =
        await this.nutrition_record_service.getNutritionRecords(query)
    return ApiResponse.ok(
        res,
        'Nutrition Records retrieved successfully',
        result
    )
}
```

---

### [KRITIS-2] `parent` dapat mengakses data imunisasi anak orang tua lain (IDOR)

**File:** [immunization-records-controller.ts](file:///d:/2026/MY%20FILE/PROJECT/TPLM/Posyandu_Web_Server/src/controllers/immunization-records-controller.ts)

**Masalah:** `getImmunizationRecords` dan `getImmunizationRecordById` menerima `res.locals.user` dan meneruskannya ke service layer. Namun perlu diverifikasi apakah service layer benar-benar membatasi akses berdasarkan kepemilikan anak. Pola ini berbahaya karena filter bisa terlewat di service layer.

**Rekomendasi:** Pastikan di service layer `immunization-records-service.ts`, ada blok:

```typescript
if (currentUser.role === 'parent') {
    // wajib ada join ke relation_childrens untuk memverifikasi
    // bahwa children_id yang diminta dimiliki parent tersebut
}
```

---

### [KRITIS-3] `parent` dapat melihat profil orang tua lain (Missing Ownership Check)

**File:** [parents-route.ts](file:///d:/2026/MY%20FILE/PROJECT/TPLM/Posyandu_Web_Server/src/routes/parents-route.ts), [parents-controller.ts](file:///d:/2026/MY%20FILE/PROJECT/TPLM/Posyandu_Web_Server/src/controllers/parents-controller.ts)

**Masalah:**

- Route GET `/parents/:public_id` mengizinkan role `parent` tanpa ownership check.
- `parent` A bisa mengakses profil `parent` B jika dia mengetahui `public_id` orang lain, mendapatkan: `identity_number` (NIK!), `date_of_birth`, `address_line`, `rt`, `rw`, `blood_type`, `occupation`, dll.
- Schema `parents` menyimpan **data PII (Personally Identifiable Information) sensitif tinggi**.

**Severity Tinggi karena data yang bocor:**
| Field | Sensitifitas |
| :--- | :--- |
| `identity_number` | 🔴 NIK — Data identitas negara |
| `date_of_birth` | 🟠 Data pribadi |
| `address_line` + `rt` + `rw` | 🟠 Alamat rumah lengkap |
| `blood_type` | 🟡 Data medis |

**Rekomendasi Perbaikan:**

```typescript
// parents-controller.ts
getParentById = async (req: Request, res: Response) => {
    const user = res.locals.user
    const public_id = req.params.public_id as string

    // parent hanya bisa akses profil miliknya sendiri
    if (user?.role === 'parent' && user.parent_id !== public_id) {
        throw ApiError.forbidden('You can only access your own profile')
    }

    return handleGetByIdRequest(req, res, 'Parent', ...)
}
```

---

### [KRITIS-4] `parent` dapat melakukan list semua data orang tua (Mass Data Exposure)

**File:** [parents-route.ts](file:///d:/2026/MY%20FILE/PROJECT/TPLM/Posyandu_Web_Server/src/routes/parents-route.ts#L32-L38)

**Masalah:**

- Route GET `/parents` mengizinkan role `parent`.
- Controller `getParents` tidak memiliki filter berdasarkan `user_id` yang sedang login.
- Seorang `parent` yang login bisa mendapatkan **daftar seluruh orang tua beserta NIK mereka**.

**Rekomendasi:** Route GET `/parents` seharusnya **hanya** dapat diakses oleh `admin`, `midwife`, dan `cadre`.

```typescript
// parents-route.ts — ubah authorizeRoles
router.get(
    '/',
    verifyAuth,
    authorizeRoles('admin', 'midwife', 'cadre'), // ❌ HAPUS 'parent'
    ...
)
```

---

## 🟠 TEMUAN TINGGI

### [TINGGI-1] `parent` dapat mengupdate profil orang tua lain (Missing Ownership Enforcement)

**File:** [parents-controller.ts](file:///d:/2026/MY%20FILE/PROJECT/TPLM/Posyandu_Web_Server/src/controllers/parents-controller.ts#L41-L53)

**Masalah:**

- Route PUT `/parents/:public_id` mengizinkan role `parent`.
- Tidak ada validasi bahwa `public_id` yang diupdate adalah milik user yang sedang login.
- `parent` A bisa mengubah data (`address`, `occupation`, dll.) milik `parent` B.

---

### [TINGGI-2] Konsultasi kehamilan (`consultations`) tidak membatasi akses `parent`

**File:** Schema [consultations-schema.ts](file:///d:/2026/MY%20FILE/PROJECT/TPLM/Posyandu_Web_Server/src/db/schemas/consultations-schema.ts)

**Masalah:**

- `consultations` menyimpan `pregnancy_record_id`, `cancellation_reason`, dan `notes` medis.
- Perlu memastikan bahwa route GET `/consultations` dan GET `/consultations/:id` membatasi akses `parent` hanya ke consultation yang `parent_id`-nya sesuai dengan `user.parent_id`.
- Data kehamilan sangat sensitif dan **tidak boleh bocor antar pengguna**.

---

### [TINGGI-3] Tidak ada validasi posyandu scope untuk `cadre` dan `midwife` di nutrition records

**Masalah:**

- `cadre` dan `midwife` terikat ke satu `posyandu_id` tertentu (lihat schema [cadres-schema.ts](file:///d:/2026/MY%20FILE/PROJECT/TPLM/Posyandu_Web_Server/src/db/schemas/cadres-schema.ts) dan [midwifes-schema.ts](file:///d:/2026/MY%20FILE/PROJECT/TPLM/Posyandu_Web_Server/src/db/schemas/midwifes-schema.ts)).
- Namun di `nutrition-records-controller.ts`, tidak ada filter `posyandu_id` berdasarkan posyandu kader/bidan yang login.
- Kader dari Posyandu A bisa melihat data gizi anak-anak dari Posyandu B.

**Bandingkan dengan `childrens-controller.ts` yang sudah benar:**

```typescript
} else if ((user?.role === 'cadre' || user?.role === 'midwife') && user.posyandu_id) {
    query.posyandu_id = user.posyandu_id // ✅ sudah ada di childrens
}
```

---

## 🟡 TEMUAN SEDANG

### [SEDANG-1] Schema `accounts` menyimpan `password` (hashed) dan `refresh_token` dalam tabel yang sama

**File:** [accounts-schema.ts](file:///d:/2026/MY%20FILE/PROJECT/TPLM/Posyandu_Web_Server/src/db/schemas/accounts-schema.ts)

**Masalah:**

- Field `password`, `access_token`, `refresh_token`, `id_token` tersimpan secara langsung.
- Ini adalah standar Better-Auth, namun perlu dipastikan **field-field ini tidak pernah di-return di API response** mana pun.
- Pastikan semua repository/query yang melibatkan tabel `accounts` menggunakan `omit` atau field selection yang ketat.

---

### [SEDANG-2] `audit_logs` menyimpan `payload` sebagai `jsonb` tanpa redaksi

**File:** [audit-logs-schema.ts](file:///d:/2026/MY%20FILE/PROJECT/TPLM/Posyandu_Web_Server/src/db/schemas/audit-logs-schema.ts)

**Masalah:**

- Field `payload` berupa `jsonb` bisa menyimpan request body mentah, termasuk field sensitif seperti `password` (saat register/login).
- Jika ada kebocoran database audit, password plaintext (sebelum hashing) bisa bocor.

**Rekomendasi:** Terapkan redaksi di `auto-audit-middleware.ts` sebelum menyimpan payload:

```typescript
const sensitiveKeys = ['password', 'token', 'otp', 'secret']
// hapus key sensitif dari payload sebelum disimpan ke audit_logs
```

---

### [SEDANG-3] ⚠️ Design Decision: Apakah `pregnancy_records` Masih Relevan?

**File:** [pregnancy-records-schema.ts](file:///d:/2026/MY%20FILE/PROJECT/TPLM/Posyandu_Web_Server/src/db/schemas/pregnancy-records-schema.ts)

**Latar Belakang Pertanyaan:**
Sistem ini berfokus pada **monitoring tumbuh kembang anak (batita, balita, anak-anak)**. Schema `pregnancy_records` menyimpan data medis ibu hamil (trimester, HPHT, HPL, gravida, paritas) yang tampak **di luar scope utama sistem**.

**Temuan — 3 Bukti Ketergantungan yang Perlu Diputuskan:**

| #   | Bukti Penggunaan                                                     | Lokasi                                                                                                                               | Status             |
| :-- | :------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------- | :----------------- |
| 1   | FR-OT-06 menyebut **"konsultasi kehamilan"** secara eksplisit        | [fr.txt](file:///d:/2026/MY%20FILE/PROJECT/TPLM/Posyandu_Web_Server/fr.txt#L13)                                                      | 🟡 Ambiguitas      |
| 2   | `consultations.pregnancy_record_id` mereferensi tabel ini (opsional) | [consultations-schema.ts](file:///d:/2026/MY%20FILE/PROJECT/TPLM/Posyandu_Web_Server/src/db/schemas/consultations-schema.ts#L17-L19) | 🟡 Tightly coupled |
| 3   | `examinationTypeEnum` memiliki nilai `'pregnant_mother'`             | [enum.ts](file:///d:/2026/MY%20FILE/PROJECT/TPLM/Posyandu_Web_Server/src/constants/enum.ts#L61-L65)                                  | 🟡 In codebase     |

---

**Evaluasi: Dua Opsi Keputusan Desain**

> [!IMPORTANT]
> Ini adalah keputusan arsitektur yang memerlukan konfirmasi dari tim/stakeholder.

**🔴 Opsi A — HAPUS `pregnancy_records` (Fokus Murni Anak):**
Jika fitur pemantauan ibu hamil memang **di luar scope**, maka:

1. Drop table `pregnancy_records` dan buat migrasi baru
2. Hapus field `pregnancy_record_id` dari `consultations` — konsultasi menjadi umum tanpa konteks kehamilan
3. Hapus nilai `'pregnant_mother'` dari `EXAMINATION_TYPE_VALUES` di `enum.ts`
4. Ubah FR-OT-06 dari _"konsultasi kehamilan"_ menjadi _"konsultasi kesehatan anak"_
5. Hapus import dan relasi `pregnancyRecords` di `relations.ts` dan `index.ts`

**Dampak Positif:** Sistem lebih ramping, tidak ada ambiguitas data kehamilan masuk ke sistem anak.

**🟢 Opsi B — PERTAHANKAN dengan Perbaikan Keamanan:**
Posyandu Indonesia secara standar nasional menjalankan program **KIA (Kesehatan Ibu dan Anak)** yang mencakup pemantauan ibu hamil. Jika fitur ini memang direncanakan:

Perbaikan **keamanan** yang WAJIB dilakukan:

```typescript
// Tambahkan posyandu_id ke pregnancy-records-schema.ts
// agar bisa dibatasi scope akses per posyandu
export const pregnancyRecords = pgTable('pregnancy_records', {
    ...createBaseColumns('pregnancy_records'),
    parent_id: text('parent_id')
        .notNull()
        .references(() => parents.id),
    posyandu_id: text('posyandu_id')
        .notNull()
        .references(() => posyandus.id) // ✅ TAMBAH
    // ... kolom lainnya
})
```

Dan tambahkan ownership check di controller agar `parent` hanya bisa akses data kehamilannya sendiri.

---

**Rekomendasi Saat Ini:**
Berdasarkan analisis FR yang ada, FR-OT-06 menyebut "konsultasi kehamilan" secara eksplisit. Namun jika **keputusan bisnis** adalah fokus ke anak saja, **pilih Opsi A** dan hapus schema ini beserta seluruh dependensinya untuk mencegah kompleksitas dan risiko data sensitif yang tidak perlu.

---

## ✅ HAL-HAL YANG SUDAH BENAR

| #    | Yang Sudah Baik                                                                                        | Lokasi                                                                                                                                 |
| :--- | :----------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------- |
| ✅ 1 | **Ownership check pada data anak untuk `parent`** — `verifyParentAccess` di get/update/delete children | [childrens-controller.ts](file:///d:/2026/MY%20FILE/PROJECT/TPLM/Posyandu_Web_Server/src/controllers/childrens-controller.ts)          |
| ✅ 2 | **Posyandu scope filter untuk cadre/midwife pada list anak**                                           | [childrens-controller.ts](file:///d:/2026/MY%20FILE/PROJECT/TPLM/Posyandu_Web_Server/src/controllers/childrens-controller.ts#L43-L46)  |
| ✅ 3 | **Inventaris TIDAK bisa diakses `parent`** — sesuai FR                                                 | [inventories-route.ts](file:///d:/2026/MY%20FILE/PROJECT/TPLM/Posyandu_Web_Server/src/routes/inventories-route.ts)                     |
| ✅ 4 | **Pembuatan imunisasi/vitamin record hanya oleh `cadre`, `midwife`, `admin`**                          | [immunization-records-route.ts](file:///d:/2026/MY%20FILE/PROJECT/TPLM/Posyandu_Web_Server/src/routes/immunization-records-route.ts)   |
| ✅ 5 | **`unique()` constraint pada relasi parent-child** — mencegah duplikasi kepemilikan                    | [relation-childrens-schema.ts](file:///d:/2026/MY%20FILE/PROJECT/TPLM/Posyandu_Web_Server/src/db/schemas/relation-childrens-schema.ts) |

---

## PETA RISIKO BERDASARKAN SCHEMA

```
posyandus ──── childrens ──────── nutrition_records   [🔴 KRITIS-1: No parent filter]
                    │          └── immunization_records [🟠 TINGGI: Verify service layer]
                    │          └── vitamin_records
                    │
parents ──────────── relation_childrens ── childrens
    │            [🔴 KRITIS-3/4: PII Exposed to any parent]
    └── pregnancy_records                  [🟡 SEDANG-3: No posyandu scope]
    └── consultations                      [🟠 TINGGI-2: Needs parent ownership check]

users ──── accounts    [🟡 SEDANG-1: Ensure password/token never returned in API]
       └── sessions
       └── audit_logs  [🟡 SEDANG-2: Redact sensitive payload before storing]
```

---

## PRIORITAS PERBAIKAN

| Prioritas                  | Temuan                                                           | Estimasi Effort   |
| :------------------------- | :--------------------------------------------------------------- | :---------------- |
| **P0 — Segera**            | KRITIS-1: Filter nutrition records by parent_id                  | 30 menit          |
| **P0 — Segera**            | KRITIS-4: Hapus `parent` dari route GET list `/parents`          | 5 menit           |
| **P0 — Segera**            | KRITIS-3: Tambahkan ownership check GET `/parents/:id`           | 15 menit          |
| **P1 — Minggu Ini**        | TINGGI-1: Ownership check PUT `/parents/:id`                     | 20 menit          |
| **P1 — Minggu Ini**        | TINGGI-3: Posyandu scope filter untuk cadre/midwife di nutrition | 30 menit          |
| **P1 — Minggu Ini**        | KRITIS-2: Verifikasi service layer immunization ownership        | 1 jam             |
| **P2 — Sprint Berikutnya** | SEDANG-2: Redaksi payload sensitif di audit logs                 | 1 jam             |
| **P2 — Sprint Berikutnya** | SEDANG-3: Tambah `posyandu_id` ke pregnancy_records              | 2 jam (+ migrasi) |
