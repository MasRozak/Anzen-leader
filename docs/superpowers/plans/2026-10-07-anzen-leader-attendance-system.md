# Sistem Absensi Harian Anzen Leader Kontraktor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun aplikasi web fullstack berbasis Next.js (App Router), Tailwind CSS, dan PostgreSQL (Prisma ORM) untuk sistem absensi harian Anzen Leader kontraktor dan dashboard monitoring Staff Internal Toyota dengan tampilan presisi sesuai acuan PDF dan responsif di berbagai perangkat.

**Architecture:** Arsitektur fullstack modular Next.js dengan pemisahan komponen atomik UI (`components/ui`), komponen domain Anzen Leader (`components/anzen`), komponen domain Staff Internal (`components/staff`), utilitas PDF (`components/pdf`), dan autentikasi berbasis stateless JWT cookie (`lib/auth.ts` + `middleware.ts`). Database PostgreSQL dikelola via Prisma ORM lengkap dengan script seed pre-generated accounts.

**Tech Stack:** Next.js 14+ (App Router, TypeScript), Tailwind CSS, Prisma ORM, PostgreSQL (Docker Compose), jose (JWT), bcryptjs, jsPDF & jspdf-autotable, Vitest untuk pengujian.

**Spec:** [`docs/superpowers/specs/2026-10-07-anzen-leader-attendance-system-design.md`](file:///C:/Users/rizki/code/project-toyota/docs/superpowers/specs/2026-10-07-anzen-leader-attendance-system-design.md)

---

## Global Constraints

- Semua UI form, header, tabel, dan kartu wajib meniru tata letak dan hierarki visual dari acuan PDF (`source/absen kontraktor.pdf` dan `source/user.pdf`).
- Tampilan harus sepenuhnya responsif (grid menyesuaikan di perangkat mobile, tablet, dan desktop; tabel memiliki horizontal scroll handling).
- Komponen wajib modular dan tidak ditumpuk dalam 1 file monolitik.
- Seluruh akun bawaan (Anzen Leader & Staff Internal) wajib disediakan via `prisma/seed.ts` (tidak ada halaman registrasi publik).
- Warna aksen Toyota menggunakan merah `#EB0A1E` dengan background bersih `#FFFFFF` dan slate borders.

---

## Review Focus

1. **Format Waktu Kerja:** Validasi format waktu (`HH:mm`) dan memastikan waktu selesai tidak mendahului waktu mulai.
2. **Kalkulasi "Berlangsung Sekarang":** Proyek hanya dihitung "Berlangsung sekarang" jika tanggal absensi adalah hari ini dan jam sistem saat ini berada di antara `workStartTime` dan `workEndTime`.
3. **Array STOP 6 Bahaya:** Checkbox STOP 6 (A s/d F) harus tersimpan dan ter-render dengan label deskriptif yang rapi pada tabel maupun ekspor PDF.
4. **Isolasi Role pada Middleware:** Akses Anzen Leader ke `/staff/*` atau Staff ke `/anzen/*` harus di-redirect ke rutenya masing-masing tanpa infinite redirect loop.
5. **Reaktivitas Filter Cetak PDF:** Perubahan dropdown filter harus secara instan memperbarui teks counter `"[N] absensi akan dicetak"` dan data yang dimasukkan ke PDF.

---

## Implementation Tasks

### Task 1: Project Scaffolding, Tailwind Styling & Docker Setup

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.mjs`
- Create: `tailwind.config.ts`
- Create: `postcss.config.mjs`
- Create: `docker-compose.yml`
- Create: `src/app/globals.css`
- Create: `src/app/layout.tsx`
- Create: `vitest.config.ts`
- Test: `tests/setup.test.ts`

**Interfaces:**
- Consumes: Node.js & npm runtime environment.
- Produces: Base running Next.js App Router application with Tailwind CSS (Toyota theme colors) & Vitest test runner.

- [ ] **Step 1: Write failing test for base setup**
  Buat `tests/setup.test.ts` untuk menguji konfigurasi environment dan styling token.
- [ ] **Step 2: Run test to verify it fails**
  Jalankan `npx vitest run tests/setup.test.ts`. Expected: FAIL (modul/file belum ada).
- [ ] **Step 3: Setup project dependencies, Tailwind config, docker-compose.yml & Vitest**
  Inisialisasi `package.json` dengan dependensi: `next`, `react`, `react-dom`, `typescript`, `@types/node`, `@types/react`, `tailwindcss`, `postcss`, `autoprefixer`, `prisma`, `@prisma/client`, `jose`, `bcryptjs`, `@types/bcryptjs`, `jspdf`, `jspdf-autotable`, `lucide-react`, `vitest`. Buat `docker-compose.yml` untuk PostgreSQL 16 (port 5432).
- [ ] **Step 4: Run test to verify it passes**
  Jalankan `npx vitest run tests/setup.test.ts`. Expected: PASS.
- [ ] **Step 5: Commit**
  `git init && git add . && git commit -m "chore: initialize nextjs project scaffolding, tailwind, docker-compose and vitest"`

---

### Task 2: Database Schema & Seed Data (Prisma ORM)

**Files:**
- Create: `prisma/schema.prisma`
- Create: `prisma/seed.ts`
- Create: `src/lib/prisma.ts`
- Test: `tests/db.test.ts`

**Interfaces:**
- Consumes: PostgreSQL connection string (`DATABASE_URL`).
- Produces:
  - `prisma` singleton instance in `src/lib/prisma.ts`.
  - Database models: `User` (with `Role`), `AttendanceRecord`.
  - Pre-seeded users: Anzen Leader (`123456`, `654321`, `112233`) dan Staff (`staff_sunter1`, `staff_karawang`).

- [ ] **Step 1: Write failing test for Prisma models & seed validation**
  Buat `tests/db.test.ts` untuk memverifikasi export singleton Prisma dan kelengkapan skema data.
- [ ] **Step 2: Run test to verify it fails**
  Jalankan `npx vitest run tests/db.test.ts`. Expected: FAIL (Prisma client belum di-generate).
- [ ] **Step 3: Implement Prisma schema, singleton `src/lib/prisma.ts`, dan `prisma/seed.ts`**
  Tulis skema sesuai spec, jalankan `npx prisma generate`, dan implementasikan seed script dengan bcrypt hash untuk password (`anzen123` & `staff123`).
- [ ] **Step 4: Run test to verify it passes**
  Jalankan `npx vitest run tests/db.test.ts`. Expected: PASS.
- [ ] **Step 5: Commit**
  `git add prisma/ src/lib/prisma.ts tests/db.test.ts && git commit -m "feat: setup prisma schema, database models and seed script"`

---

### Task 3: Authentication Logic, Session Helpers & Middleware

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/middleware.ts`
- Test: `tests/auth.test.ts`

**Interfaces:**
- Consumes: `bcryptjs`, `jose`, HTTP cookies.
- Produces:
  - `createSessionToken(payload: SessionUser): Promise<string>`
  - `verifySessionToken(token: string): Promise<SessionUser | null>`
  - `getSession(): Promise<SessionUser | null>`
  - Next.js middleware enforcing role routing (`/anzen/*` vs `/staff/*`).

- [ ] **Step 1: Write failing test for JWT session encryption, decryption, and role validation**
  Buat `tests/auth.test.ts` untuk menguji enkripsi token, verifikasi kadaluarsa, dan ekstraksi role.
- [ ] **Step 2: Run test to verify it fails**
  Jalankan `npx vitest run tests/auth.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement `src/lib/auth.ts` dan `src/middleware.ts`**
  Gunakan `jose` SignJWT / jwtVerify dengan secret key aman, serta proteksi rute Next.js middleware.
- [ ] **Step 4: Run test to verify it passes**
  Jalankan `npx vitest run tests/auth.test.ts`. Expected: PASS.
- [ ] **Step 5: Commit**
  `git add src/lib/auth.ts src/middleware.ts tests/auth.test.ts && git commit -m "feat: implement jwt auth session helper and role-based middleware"`

---

### Task 4: Auth API Routes & Login Page

**Files:**
- Create: `src/app/api/auth/login/route.ts`
- Create: `src/app/api/auth/logout/route.ts`
- Create: `src/app/api/auth/me/route.ts`
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/page.tsx`
- Test: `tests/api-auth.test.ts`

**Interfaces:**
- Consumes: `prisma`, `src/lib/auth.ts`.
- Produces:
  - `POST /api/auth/login` (body: `{ role, identifier, password }`).
  - `POST /api/auth/logout`.
  - `GET /api/auth/me`.
  - Responsive `/login` page with tabs for Anzen Leader and Staff Internal.

- [ ] **Step 1: Write failing test for login authentication API routes**
  Buat `tests/api-auth.test.ts` menguji login valid, salah password, user tidak ditemukan, dan logout.
- [ ] **Step 2: Run test to verify it fails**
  Jalankan `npx vitest run tests/api-auth.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement auth API routes dan halaman `/login`**
  Lengkapi endpoint login dengan validasi credential, set HttpOnly cookie, dan buat UI login Toyota dengan tab switcher & bantuan akun demo.
- [ ] **Step 4: Run test to verify it passes**
  Jalankan `npx vitest run tests/api-auth.test.ts`. Expected: PASS.
- [ ] **Step 5: Commit**
  `git add src/app/api/auth/ src/app/\(auth\)/ src/app/page.tsx tests/api-auth.test.ts && git commit -m "feat: implement auth api routes and toyota branded login page"`

---

### Task 5: Modular Atomic UI & Shared Header Components

**Files:**
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Input.tsx`
- Create: `src/components/ui/Select.tsx`
- Create: `src/components/ui/Textarea.tsx`
- Create: `src/components/ui/Checkbox.tsx`
- Create: `src/components/shared/ToyotaHeader.tsx`
- Create: `src/components/shared/LogoutButton.tsx`
- Test: `tests/ui-components.test.ts`

**Interfaces:**
- Consumes: React, Tailwind CSS.
- Produces: Modular reusable components conforming to Toyota visual styles (red border buttons, clean labels, responsive padding).

- [ ] **Step 1: Write failing test for UI component rendering**
  Buat `tests/ui-components.test.ts` untuk memverifikasi export komponen dan atribut penting.
- [ ] **Step 2: Run test to verify it fails**
  Jalankan `npx vitest run tests/ui-components.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement modular UI components & ToyotaHeader**
  Implementasikan masing-masing komponen di file terpisah, lengkap dengan dukungan accessibility dan styling responsive.
- [ ] **Step 4: Run test to verify it passes**
  Jalankan `npx vitest run tests/ui-components.test.ts`. Expected: PASS.
- [ ] **Step 5: Commit**
  `git add src/components/ui/ src/components/shared/ tests/ui-components.test.ts && git commit -m "feat: create modular ui components and shared toyota header"`

---

### Task 6: Anzen Leader Attendance Form, STOP 6 Grid & Submission API

**Files:**
- Create: `src/lib/stop6.ts`
- Create: `src/components/anzen/Stop6HazardGroup.tsx`
- Create: `src/components/anzen/AttendanceForm.tsx`
- Create: `src/app/api/attendances/route.ts`
- Create: `src/app/anzen/layout.tsx`
- Create: `src/app/anzen/attendance/page.tsx`
- Test: `tests/attendance-form.test.ts`

**Interfaces:**
- Consumes: Modular UI components, `src/lib/stop6.ts`, `prisma`.
- Produces:
  - Form absensi presisi sesuai `source/absen kontraktor.pdf`.
  - Grid 6 checkbox STOP 6 bahaya fatalitas.
  - `POST /api/attendances` untuk menyimpan data absensi baru.

- [ ] **Step 1: Write failing test for STOP 6 constants and attendance creation logic**
  Buat `tests/attendance-form.test.ts` memverifikasi validasi field dan persistensi array STOP 6.
- [ ] **Step 2: Run test to verify it fails**
  Jalankan `npx vitest run tests/attendance-form.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement Stop6HazardGroup, AttendanceForm, layout, dan POST API**
  Terapkan grid input 3 kolom yang responsif ke 1 kolom di mobile, validasi waktu kerja, dan integrasikan dengan endpoint API.
- [ ] **Step 4: Run test to verify it passes**
  Jalankan `npx vitest run tests/attendance-form.test.ts`. Expected: PASS.
- [ ] **Step 5: Commit**
  `git add src/lib/stop6.ts src/components/anzen/ src/app/anzen/ src/app/api/attendances/ tests/attendance-form.test.ts && git commit -m "feat: implement anzen leader attendance form, stop 6 grid and submission api"`

---

### Task 7: Anzen Leader Personal Attendance History

**Files:**
- Create: `src/components/anzen/MyAttendanceHistory.tsx`
- Modify: `src/app/anzen/attendance/page.tsx`
- Test: `tests/attendance-history.test.ts`

**Interfaces:**
- Consumes: Attendance records array for logged-in Anzen Leader.
- Produces: Riwayat absensi saya table (Tanggal, Proyek, Lokasi, MP, Waktu, Potensi bahaya) with horizontal scroll and responsive styling.

- [ ] **Step 1: Write failing test for history table data formatting**
  Buat `tests/attendance-history.test.ts` untuk memverifikasi formatting tanggal, rentang waktu, dan render list STOP 6.
- [ ] **Step 2: Run test to verify it fails**
  Jalankan `npx vitest run tests/attendance-history.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement `MyAttendanceHistory.tsx` dan integrasikan ke halaman Anzen**
  Tampilkan tabel dengan styling presisi persis `absen kontraktor.pdf`, penanganan state kosong, dan scroll horizontal di layar kecil.
- [ ] **Step 4: Run test to verify it passes**
  Jalankan `npx vitest run tests/attendance-history.test.ts`. Expected: PASS.
- [ ] **Step 5: Commit**
  `git add src/components/anzen/MyAttendanceHistory.tsx src/app/anzen/attendance/page.tsx tests/attendance-history.test.ts && git commit -m "feat: implement anzen leader personal attendance history table"`

---

### Task 8: Staff Internal Dashboard - KPI Summary Cards & Active Projects Table

**Files:**
- Create: `src/lib/utils.ts`
- Create: `src/components/staff/SummaryCards.tsx`
- Create: `src/components/staff/ActiveProjectsTable.tsx`
- Create: `src/app/staff/layout.tsx`
- Create: `src/app/staff/dashboard/page.tsx`
- Test: `tests/staff-metrics.test.ts`

**Interfaces:**
- Consumes: Attendance records data of today.
- Produces:
  - Utility `calculateKpiMetrics()` & `isProjectOngoingNow()`.
  - 5 KPI summary cards (Project hari ini, Berlangsung sekarang, Perusahaan, Anzen Leader, Total MP).
  - Tabel "Project yang sedang berlangsung".

- [ ] **Step 1: Write failing test for KPI metrics calculation and ongoing project filter**
  Buat `tests/staff-metrics.test.ts` memvalidasi kalkulasi 5 metrik dan deteksi jam aktif kerja.
- [ ] **Step 2: Run test to verify it fails**
  Jalankan `npx vitest run tests/staff-metrics.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement utils, SummaryCards, ActiveProjectsTable, dan Staff layout**
  Terapkan desain kartu KPI dengan angka hijau tebal persis `user.pdf`, dan tabel proyek sedang berlangsung.
- [ ] **Step 4: Run test to verify it passes**
  Jalankan `npx vitest run tests/staff-metrics.test.ts`. Expected: PASS.
- [ ] **Step 5: Commit**
  `git add src/lib/utils.ts src/components/staff/SummaryCards.tsx src/components/staff/ActiveProjectsTable.tsx src/app/staff/ tests/staff-metrics.test.ts && git commit -m "feat: implement staff kpi summary cards and ongoing projects table"`

---

### Task 9: Staff Internal Dashboard - Detail Table, Multi-Filter & PDF Export

**Files:**
- Create: `src/components/staff/AttendanceDetailTable.tsx`
- Create: `src/components/staff/PdfExportSection.tsx`
- Create: `src/components/pdf/generateAttendanceReport.ts`
- Modify: `src/app/staff/dashboard/page.tsx`
- Test: `tests/staff-filters-pdf.test.ts`

**Interfaces:**
- Consumes: Attendance records, `jspdf`, `jspdf-autotable`.
- Produces:
  - Tabel "Detail absensi" hari ini.
  - Filter multi-kriteria (Perusahaan, Proyek, Lokasi, Anzen Leader, User).
  - Counter reaktif `"[N] absensi akan dicetak"`.
  - Generator PDF resmi rekap Toyota.

- [ ] **Step 1: Write failing test for multi-filter logic and PDF payload formatting**
  Buat `tests/staff-filters-pdf.test.ts` memverifikasi filter kombinasi dan penyiapan dataset PDF.
- [ ] **Step 2: Run test to verify it fails**
  Jalankan `npx vitest run tests/staff-filters-pdf.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement AttendanceDetailTable, PdfExportSection, dan PDF generator**
  Terapkan filter interaktif, counter absensi reaktif, tombol "Unduh PDF" dengan outline merah, dan logic download jsPDF.
- [ ] **Step 4: Run test to verify it passes**
  Jalankan `npx vitest run tests/staff-filters-pdf.test.ts`. Expected: PASS.
- [ ] **Step 5: Commit**
  `git add src/components/staff/ src/components/pdf/ src/app/staff/dashboard/page.tsx tests/staff-filters-pdf.test.ts && git commit -m "feat: implement detail table, reactive multi-filter and toyota pdf export"`

---

### Task 10: E2E Workflow Verification & Responsive Device Polish

**Files:**
- Modify: `src/app/globals.css`
- Modify: Komponen UI untuk touch & mobile layout adjustments
- Test: `tests/e2e-workflow.test.ts`

**Interfaces:**
- Consumes: Seluruh komponen dan endpoint aplikasi.
- Produces: Sistem absensi terverifikasi penuh, bebas error linting/tipe data, dan responsif sempurna di mobile, tablet, dan desktop.

- [ ] **Step 1: Write comprehensive integration test simulating Anzen Leader submission and Staff Dashboard monitoring**
  Buat `tests/e2e-workflow.test.ts`.
- [ ] **Step 2: Run test to verify pass/fail status**
  Jalankan `npx vitest run tests/e2e-workflow.test.ts`.
- [ ] **Step 3: Refine styling for mobile breakpoints & run build check**
  Jalankan `npm run build` dan verifikasi tidak ada error TypeScript, linting, atau hydration error.
- [ ] **Step 4: Verify test suite complete**
  Jalankan seluruh test suite `npx vitest run`. Expected: 100% PASS.
- [ ] **Step 5: Commit**
  `git add . && git commit -m "feat: complete e2e workflow integration and responsive device polish"`
