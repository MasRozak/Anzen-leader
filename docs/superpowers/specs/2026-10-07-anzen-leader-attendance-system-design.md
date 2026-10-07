# Design Spec: Sistem Absensi Harian Anzen Leader Kontraktor (Toyota)

**Tanggal:** 2026-10-07  
**Status:** Approved  
**Teknologi:** Next.js (App Router, TypeScript), Tailwind CSS, Prisma ORM, PostgreSQL (Docker Compose), jsPDF & jspdf-autotable, jose (stateless JWT session)

---

## 1. Ringkasan Eksekutif & Tujuan

Sistem Absensi Harian Anzen Leader Kontraktor dirancang untuk memonitoring kehadiran, alokasi manpower, dan mitigasi keselamatan kerja (khususnya 6 bahaya fatalitas Toyota / STOP 6) dari vendor kontraktor yang bekerja di lingkungan pabrik Toyota.

Sistem melayani 2 tipe pengguna:
1. **Anzen Leader (Vendor Kontraktor):** Mengisi formulir absensi proyek harian, memilih potensi bahaya STOP 6, mencatat metode pencegahan, serta melihat riwayat absensi pribadi.
2. **Staff Internal (Toyota):** Memantau absensi kontraktor secara realtime via dashboard KPI, memantau proyek yang sedang berlangsung, mengecek detail absensi hari ini, serta memfilter dan mengunduh laporan PDF rekap absensi resmi.

Tidak ada pendaftaran (registrasi) mandiri publik. Seluruh akun (Anzen Leader & Staff Internal) digenerate/diseed oleh sistem dengan kredensial bawaan.

---

## 2. Arsitektur & Teknologi

* **Framework:** Next.js 14+ (App Router, React 18/19, TypeScript).
* **Styling:** Tailwind CSS dengan palette warna Toyota (Primary Red: `#EB0A1E`, White, Gray/Slate neutral).
* **Database & ORM:** PostgreSQL 16 (disediakan via `docker-compose.yml`) diakses via Prisma ORM (`prisma/schema.prisma`).
* **Autentikasi & Sesi:** Stateless JWT token via HTTP-only cookie (`token`), di-sign dan diverifikasi menggunakan library `jose`.
* **Routing Protection:** Next.js `middleware.ts` memverifikasi token dan membatasi akses:
  - `/anzen/*` → hanya `Role.ANZEN_LEADER`.
  - `/staff/*` → hanya `Role.STAFF_INTERNAL`.
  - `/login` → rute publik; jika sudah login, diarahkan otomatis ke halaman sesuai role.
* **Laporan PDF:** Client-side generation menggunakan `jspdf` dan `jspdf-autotable` menghasilkan format dokumen Toyota resmi dengan kop, metadata filter, dan tabel rekap absensi.

---

## 3. Skema Database (Prisma)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  ANZEN_LEADER
  STAFF_INTERNAL
}

model User {
  id           String      @id @default(cuid())
  role         Role
  name         String
  cardNumber   String?     @unique // Untuk Anzen Leader (contoh: "123456")
  username     String?     @unique // Untuk Staff Internal (contoh: "staff_sunter1")
  passwordHash String
  companyName  String?     // Nama PT kontraktor
  department   String?     // Departemen Toyota (contoh: "User Sunter 1")
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  attendances  AttendanceRecord[]

  @@map("users")
}

model AttendanceRecord {
  id                 String   @id @default(cuid())
  userId             String
  user               User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Identitas & Header Form
  companyName        String   // Nama perusahaan
  anzenLeaderName    String   // Nama Anzen Leader
  cardNumber         String   // No. kartu AL
  date               DateTime @db.Date // Tanggal absensi (YYYY-MM-DD)
  
  // Detail Pekerjaan & Manpower
  projectName        String   // Nama pekerjaan (proyek)
  locationDetail     String   // Detail lokasi (misal: "pgd")
  manpowerCount      Int      // Jumlah MP (orang)
  userDepartment     String   // User (departemen pemberi pekerjaan)
  workStartTime      String   // Format "HH:mm" (misal: "08:00")
  workEndTime        String   // Format "HH:mm" (misal: "16:00")
  
  // Potensi Bahaya (STOP 6) & Pengendalian
  stop6Hazards       String[] // ["A. Terjepit mesin", "B. Tertimpa benda berat", ...]
  preventiveControl  String   @db.Text // Deskripsi pengendalian pencegahan

  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  @@index([date])
  @@index([cardNumber])
  @@index([companyName])
  @@map("attendance_records")
}
```

---

## 4. Akun Bawaan & Seed Data (`prisma/seed.ts`)

### Akun Anzen Leader:
1. **No. Kartu:** `123456` | **Password:** `anzen123` | **Nama:** Fia | **Perusahaan:** PT Multi Karya Mandiri
2. **No. Kartu:** `654321` | **Password:** `anzen123` | **Nama:** Budi Santoso | **Perusahaan:** PT Anzen Safety Mitra
3. **No. Kartu:** `112233` | **Password:** `anzen123` | **Nama:** Agus Prayitno | **Perusahaan:** PT Prima Konstruksi

### Akun Staff Internal:
1. **Username:** `staff_sunter1` | **Password:** `staff123` | **Nama:** Staff Sunter 1 | **Dept:** User Sunter 1
2. **Username:** `staff_karawang` | **Password:** `staff123` | **Nama:** Safety Specialist Karawang | **Dept:** Safety Division

### Sample Data Absensi:
- Menghasilkan 3-5 rekaman absensi awal (termasuk rekaman hari ini yang aktif sekarang dan rekaman lampau) agar dashboard staff langsung menampilkan metrik KPI dan tabel aktif.

---

## 5. Struktur Folder & Modularitas Komponen

```
project-toyota/
├── docker-compose.yml
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── anzen/
│   │   │   ├── layout.tsx
│   │   │   └── attendance/
│   │   │       └── page.tsx
│   │   ├── staff/
│   │   │   ├── layout.tsx
│   │   │   └── dashboard/
│   │   │       └── page.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts
│   │   │   │   ├── logout/route.ts
│   │   │   │   └── me/route.ts
│   │   │   └── attendances/
│   │   │       └── route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Textarea.tsx
│   │   │   └── Checkbox.tsx
│   │   ├── shared/
│   │   │   ├── ToyotaHeader.tsx
│   │   │   └── LogoutButton.tsx
│   │   ├── anzen/
│   │   │   ├── AttendanceForm.tsx
│   │   │   ├── Stop6HazardGroup.tsx
│   │   │   └── MyAttendanceHistory.tsx
│   │   ├── staff/
│   │   │   ├── SummaryCards.tsx
│   │   │   ├── ActiveProjectsTable.tsx
│   │   │   ├── AttendanceDetailTable.tsx
│   │   │   └── PdfExportSection.tsx
│   │   └── pdf/
│   │       └── generateAttendanceReport.ts
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── stop6.ts
│   │   └── utils.ts
│   └── middleware.ts
```

---

## 6. Detail Fungsional & Spesifikasi UI

### 6.1 Halaman Login (`/login`)
* Desain elegan bernuansa Toyota (Merah & Putih).
* Role Switcher Tabs:
  * **Tab Anzen Leader**: Input `No. Kartu AL` & `Password`.
  * **Tab Staff Internal**: Input `Username` & `Password`.
* Info Box ringkas berisi akun demo untuk memudahkan tester menguji sistem.
* Tombol submit dengan spinner status loading dan penanganan error kredensial.

### 6.2 Halaman Anzen Leader (`/anzen/attendance`)
* **ToyotaHeader:**
  * Kiri: Judul *"Absensi Harian Anzen Leader Kontraktor"* & Subteks *"Anzen Leader: [no_kartu]"*.
  * Kanan: Logo TOYOTA (teks merah tebal) + tombol `Keluar`.
* **Section "Isi absensi hari ini":**
  * Grid 3 Kolom:
    * Nama perusahaan (text input)
    * Nama Anzen Leader (text input)
    * No. kartu AL (text input)
    * Tanggal (date input, default hari ini YYYY-MM-DD)
    * Nama pekerjaan (proyek) (text input)
    * Detail lokasi (text input)
    * Jumlah MP (orang) (number input)
    * User (departemen pemberi pekerjaan) (text input)
    * Waktu kerja: mulai (time input format HH:mm, misal 08:00)
    * Waktu kerja: selesai (time input format HH:mm, misal 16:00)
  * STOP 6 Potensi Bahaya (Grid 3x2 checkbox):
    * [ ] A. Terjepit mesin
    * [ ] B. Tertimpa benda berat
    * [ ] C. Tertabrak kendaraan
    * [ ] D. Terjatuh dari ketinggian
    * [ ] E. Tersengat listrik
    * [ ] F. Kontak benda panas
  * Pengendalian pencegahan: Textarea dengan placeholder *"Contoh: full body harness, area dibarikade, LOTO"*.
  * Tombol `Kirim absensi` (border/background merah khas Toyota).
* **Section "Riwayat absensi saya":**
  * Tabel horizontal scrollable: Tanggal, Proyek, Lokasi, MP, Waktu, Potensi bahaya STOP 6.
  * Menampilkan data absensi yang pernah disubmit oleh Anzen Leader yang bersangkutan.

### 6.3 Halaman Staff Internal (`/staff/dashboard`)
* **ToyotaHeader:**
  * Kiri: Judul *"Absensi Harian Anzen Leader Kontraktor"* & Subteks *"[Nama User/Dept] | Hari ini: [YYYY-MM-DD]"*.
  * Kanan: Logo TOYOTA + tombol `Keluar`.
* **Summary Cards (5 Metrik):**
  1. *Project hari ini:* Total proyek hari ini.
  2. *Berlangsung sekarang:* Jumlah proyek yang jam kerjanya sedang aktif di rentang waktu saat ini.
  3. *Perusahaan:* Jumlah vendor PT unik hari ini.
  4. *Anzen Leader:* Jumlah Anzen Leader unik yang mengisi hari ini.
  5. *Total MP:* Akumulasi Man Power (orang) hari ini.
* **Tabel "Project yang sedang berlangsung (X)":**
  * Kolom: Nama pekerjaan (proyek), Perusahaan, Detail lokasi, Anzen Leader, Total MP, Waktu kerja, User.
  * Hanya menampilkan proyek yang aktif saat jam sistem saat ini berada di antara `waktu_mulai` dan `waktu_selesai`.
* **Tabel "Detail absensi":**
  * Kolom lengkap: Perusahaan, Anzen Leader, No. Kartu, Proyek, Lokasi, MP, Waktu kerja, User, Potensi Bahaya STOP 6, Pengendalian.
* **Section "Cetak PDF (tanggal hari ini)":**
  * Filter: Perusahaan, Proyek, Lokasi, Anzen Leader, User (semua dropdown default "Semua").
  * Counter reaktif: `"[N] absensi akan dicetak"`.
  * Tombol `Unduh PDF` (border merah).

### 6.4 Modul Cetak PDF (`generateAttendanceReport.ts`)
* Menggunakan `jsPDF` (orientation landscape) & `jspdf-autotable`.
* Header Dokumen: Logo/Teks "TOYOTA", Judul "REKAPITULASI ABSENSI HARIAN ANZEN LEADER KONTRAKTOR", Tanggal Laporan, Filter yang digunakan.
* Tabel Data: No, Perusahaan, Anzen Leader (No. Kartu), Proyek, Lokasi, MP, Waktu, Dept User, Bahaya STOP 6, Tindakan Pencegahan.
* Footer Dokumen: Tanggal & jam unduh, halaman otomatis.

---

## 7. Penanganan Error & Validasi

1. **Validasi Form Absensi:** Memastikan field wajib (nama proyek, lokasi, MP, waktu mulai/selesai) tidak kosong dan MP > 0.
2. **Validasi Format Waktu:** Waktu mulai dan selesai harus valid (HH:mm) dan waktu selesai lebih besar dari waktu mulai.
3. **Session Expiry / Invalid Role:** Otomatis redirect ke `/login` jika token kadaluarsa atau diakses oleh role yang tidak berwenang.
4. **Database Connection:** Penanganan graceful jika PostgreSQL belum berjalan dengan menampilkan instruksi jelas (`docker-compose up -d`).

---

## 8. Verifikasi & Pengujian

1. **Pengujian Docker & DB:** Memastikan PostgreSQL container aktif, Prisma migration berjalan sukses, dan `prisma/seed.ts` mengisi akun & sampel data.
2. **Pengujian Login:** 
   - Login Anzen Leader dengan No. Kartu `123456` dan password `anzen123` berhasil menuju `/anzen/attendance`.
   - Login Staff Internal dengan Username `staff_sunter1` dan password `staff123` berhasil menuju `/staff/dashboard`.
3. **Pengujian Form Absensi:** Submit absensi baru, verifikasi muncul di "Riwayat absensi saya" dan langsung terlihat di Dashboard Staff Internal.
4. **Pengujian Realtime Berlangsung:** Verifikasi indikator "Berlangsung sekarang" dan tabel proyek berlangsung aktif sesuai jam kerja.
5. **Pengujian Filter & Download PDF:** Mengubah filter, memeriksa perubahan angka counter absensi, dan menekan "Unduh PDF" untuk memastikan file PDF berhasil terunduh dengan layout rapi.
