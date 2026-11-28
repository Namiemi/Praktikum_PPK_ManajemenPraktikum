# Sprint 4 — Manajemen Laboratorium Aslab, Sistem Denda, Pembayaran Midtrans & Finalisasi UI (PRD)

> [← Sprint 3 (Frozen)](./sprint-3.md) · [README Utama](../../README.md)

> [!IMPORTANT]
> **Database Baru (Sprint 3 Freeze):** Sprint 4 menggunakan proyek Firebase & Cloud Firestore **baru** beserta konfigurasi Midtrans **Sandbox**. Baseline Sprint 3 dibekukan (*freeze* pada tag `v3.0-sprint3`) sehingga migrasi skema 3 peran (`aslab`, `asprak`, `praktikan`) dan sistem denda/pembayaran berjalan bersih tanpa merusak data Sprint 3.

---

## Daftar Isi

- [1. Ringkasan Eksekutif & Alur Demo](#1-ringkasan-eksekutif--alur-demo)
- [2. Daftar Revisi & Perbaikan Evaluasi Sprint 3](#2-daftar-revisi--perbaikan-evaluasi-sprint-3)
  - [2.1 Daftar Fitur, Kode & Kewenangan Lama yang WAJIB Dihapus / Dipindahkan](#21-daftar-fitur-kode--kewenangan-lama-yang-wajib-dihapus--dipindahkan-dampak-penambahan-role-aslab)
  - [2.2 Matriks Kewenangan 3 Peran](#22-matriks-kewenangan-3-peran-ringkasan)
- [3. Software Requirement Specification (SRS-49 s/d SRS-75)](#3-software-requirement-specification-srs-49-sd-srs-75)
- [4. Functional Requirement (FR-41 s/d FR-58)](#4-functional-requirement-fr-41-sd-fr-58)
- [5. Arsitektur Sistem & Kontrak Backend Midtrans](#5-arsitektur-sistem--kontrak-backend-midtrans)
- [6. Struktur Data Firestore Baru & Security Rules (Sprint 4)](#6-struktur-data-firestore-baru--security-rules-sprint-4)
- [7. Pembagian Tugas Programmer & Urutan Merge Anti-Konflik](#7-pembagian-tugas-programmer--urutan-merge-anti-konflik)
- [8. Akun & Data Uji Sprint 4](#8-akun--data-uji-sprint-4)
- [9. Setup Proyek Sprint 4 (Mobile + Backend Midtrans)](#9-setup-proyek-sprint-4-mobile--backend-midtrans)

---

## 1. Ringkasan Eksekutif & Alur Demo

Pada Sprint 4, aplikasi **Manajemen Praktikum** disempurnakan menjadi sistem manajemen laboratorium dan praktikum penuh berbasis **tiga peran pengguna**:

1. **Aslab (Asisten Laboratorium — Role Baru):** Bertanggung jawab atas manajemen laboratorium per mata kuliah (nama, lokasi, koordinat, radius validasi presensi, batas toleransi keterlambatan/*grace period*, nominal denda tetap), distribusi praktikan dan asprak melalui 3 fitur *bulk/single insert* terpisah (template `.xlsx` & `.csv` + *interactive preview ScrollView*), perpindahan praktikan/asprak antar laboratorium, serta pemantauan **Dashboard Keberlangsungan Laboratorium & Keuangan Denda**.
2. **Asprak (Asisten Praktikum — Migrasi dari Role `asisten`):** Difokuskan pada pelaksanaan praktikum di kelas/laboratorium yang menjadi tanggung jawabnya (lihat jadwal/kelas/sesi, buat/ubah sesi dengan pertemuan otomatis & validasi durasi 30–240 menit, buka/tutup sesi real-time, pantau presensi tepat waktu/terlambat, dan putuskan izin sebagai *excused absence* bebas denda). Asprak **tidak memiliki kewenangan** mengelola konfigurasi laboratorium global maupun distribusi peserta.
3. **Praktikan:** Melihat jadwal praktikum, mengajukan izin melalui dropdown sesi, melihat riwayat kehadiran (hanya sesi yang diikuti/berakhir), melakukan presensi berbasis lokasi dengan deteksi keterlambatan otomatis, membayar tagihan denda keterlambatan melalui **Midtrans Sandbox** (client → backend → Midtrans → webhook terverifikasi), menerima notifikasi status tagihan/pembayaran, serta melihat riwayat pembayaran persisten.

Selain itu, seluruh antarmuka disempurnakan agar konsisten, modern, bebas ketertutupan keyboard saat mengisi form (`KeyboardAvoidingView`), dan memiliki pagination seragam (**limit 8 item/halaman**) pada seluruh daftar panjang.

### Empat Alur Demo Utama Sprint 4

1. **Manajemen Lab, Bulk Insert & Perpindahan Anggota (Aslab):**
   Aslab login → unduh template `.xlsx`/`.csv` → lakukan bulk insert Laboratorium berdasarkan 1 mata kuliah → tinjau baris di *ScrollView preview* (accept/deny/edit field kosong) → simpan → lakukan bulk insert Praktikan & Asprak (terpisah) ke lab tertentu → pindahkan seorang praktikan dari Lab A ke Lab B → konfigurasi radius lokasi, `gracePeriodMenit`, dan `nominalDenda`.
2. **Dashboard Keberlangsungan & Keuangan Lab (Aslab):**
   Aslab membuka Dashboard → melihat total lab & praktikan, status praktikum tiap lab, jadwal berlangsung/mendatang, riwayat kegiatan lab, dan riwayat keuangan denda praktikum → mengganti filter **Hari / Minggu / Bulan** dan melihat data terbarui secara real-time dari Firestore.
3. **Pelaksanaan Sesi, Presensi Terlambat, Denda & Izin Bebas Denda (Asprak & Praktikan):**
   Asprak membuat sesi (pertemuan otomatis `count + 1`, durasi preset `60 menit` dalam batas `30–240 menit`) → membuka sesi → Praktikan A presensi dalam masa toleransi (*Tepat Waktu*, tanpa denda) → Praktikan B presensi melewati `max(jamMulai, dibukaPada) + gracePeriod` (*Terlambat*, otomatis muncul 1 tagihan denda + notifikasi `TAGIHAN_DENDA_BARU`) → Praktikan C mengajukan izin lewat dropdown sesi dan disetujui Asprak (tercatat `IZIN` / *excused absence*, tidak jadi hadir, bebas denda).
4. **Pembayaran Denda Midtrans Sandbox, Webhook & Riwayat (Praktikan & Backend):**
   Praktikan B membuka halaman Tagihan & Denda → tap **Bayar Sekarang** → aplikasi memanggil `backend/` → membuka halaman Midtrans Snap Sandbox di `expo-web-browser` → menyelesaikan simulasi pembayaran → Midtrans mengirim webhook ke `backend/` → backend memverifikasi SHA-512 `signature_key`, memperbarui status tagihan & pembayaran di Firestore menjadi `success`, dan mengirim notifikasi `PEMBAYARAN_BERHASIL` → UI Praktikan (serta Riwayat Keuangan Dashboard Aslab) terbarui otomatis secara real-time; status kehadiran Praktikan B tetap tercatat **Terlambat**; riwayat pembayaran tetap tampil setelah aplikasi ditutup & dibuka kembali.

---

## 2. Daftar Revisi & Perbaikan Evaluasi Sprint 3

Seluruh temuan dari evaluasi Sprint 3 wajib diselesaikan di Sprint 4 sesuai pemetaan berikut:

| No | Evaluasi / Bugfix Sprint 3 | Solusi Standar Sprint 4 | Ref SRS / FR | Penanggung Jawab |
| -- | --- | --- | --- | --- |
| 1 | Pada kelola kelas, fitur tambah peserta tidak diperlukan | Hapus tombol & modal `PesertaKelasModal` pada `src/app/asprak/kelas.tsx`. Distribusi praktikan sepenuhnya dilakukan oleh **Aslab** pada level Laboratorium. | SRS-49, FR-52 | Abhy |
| 2 | Pada pengajuan izin, pemilihan sesi praktikum dibuat dropdown | Ganti daftar/chip pilihan sesi pada form Pengajuan Izin (`src/app/izin/ajukan.tsx` & `src/components/izin-form.tsx`) menjadi komponen **Dropdown Select** yang ringkas dan mudah dipindai. | SRS-50, FR-53 | Abhy |
| 3 | Pagination di semua list yang bakal banyak elemennya (limit 7–10) | Bangun komponen bersama `PaginationControls` dengan standar **8 item per halaman** (`Sebelumnya` / `Halaman X dari Y` / `Berikutnya`) dan terapkan di seluruh daftar panjang (Jadwal, Kelas, Laboratorium, Daftar Anggota Lab, Rekap Presensi, Pengajuan Izin, Riwayat Kehadiran, Dashboard Riwayat Kegiatan/Keuangan, Tagihan, Riwayat Pembayaran). | SRS-51, FR-44 | Akbar (komponen), Setya & Abhy (penerapan) |
| 4 | Riwayat praktikan hanya menampilkan sesi yang sudah diikuti | Filter halaman Riwayat Praktikan agar hanya menampilkan sesi dengan status `hadir`, `terlambat`, `izin` (diterima), atau sesi yang sudah `DITUTUP` (`tidak_hadir`). Hilangkan sesi masa depan berstatus `MENUNGGU`. | SRS-52, FR-53 | Abhy |
| 5 | Nomor pertemuan tidak perlu input manual (otomatis `count + 1`) | Saat Asprak memilih kelas pada `SesiFormModal` (mode tambah), field `pertemuan` terisi otomatis dari `(jumlah sesi eksisting pada kelas tersebut) + 1` (atau `max(pertemuan) + 1`) dan bersifat *read-only*. | SRS-53, FR-52 | Abhy |
| 6 | Constraint durasi sesi minimal 30 menit, maksimal 4 jam + preset | Tambahkan validasi `30 <= durasiMenit <= 240` pada `validation.ts` dan `SesiFormModal`, disertai chip preset durasi cepat (`30`, `45`, `60`, `90`, `120`, `180`, `240` menit) yang otomatis menghitung `jamSelesai` dari `jamMulai`. | SRS-53, FR-43, FR-52 | Akbar (validasi), Abhy (UI) |
| 7 | Sprint 4 buat DB baru (Sprint 3 freeze) | Freeze Sprint 3 pada tag `v3.0-sprint3`, buat proyek Firebase & Firestore baru, terapkan `google-services.json` baru dan `firestore.rules` Sprint 4. | SRS-55, FR-41 | Sofwan (PM), Akbar |
| 8 | Saat input form, tampilan ikut geser ke atas (tidak terhalang keyboard) | Standarisasi wrapper `KeyboardAwareScroll` (`KeyboardAvoidingView` + `ScrollView` dengan `keyboardShouldPersistTaps="handled"`) pada seluruh halaman dan modal form (Login, Register, Form Lab, Bulk Edit Modal, Form Kelas, Form Sesi, Form Izin, Form Presensi). | SRS-54, FR-44 | Akbar (komponen), Setya & Abhy (penerapan) |

### 2.1 Daftar Fitur, Kode & Kewenangan Lama yang WAJIB Dihapus / Dipindahkan (Dampak Penambahan Role Aslab)

Karena peran `asisten` dipecah menjadi **Aslab** (`aslab`) dan **Asprak** (`asprak`), beberapa fitur, komponen, service, dan izin akses yang sebelumnya ada di Sprint 2–3 **wajib dihapus atau dicabut dari Asprak** agar tidak terjadi tumpang tindih kewenangan:

| No | Fitur / Artefak Lama (Sprint 2–3) | Lokasi Saat Ini | Tindakan Wajib di Sprint 4 | Penanggung Jawab |
| -- | --- | --- | --- | --- |
| 1 | **Tambah / Atur Peserta Kelas oleh Asisten** (`PesertaKelasModal`, tombol *Peserta*, `handleTogglePeserta`, `setKelasPraktikan`) | `src/app/asisten/kelas.tsx`, `src/components/kelas-form.tsx`, `src/hooks/use-kelola-kelas.ts`, `src/services/users.ts` | **HAPUS total** dari sisi Asprak. Distribusi praktikan sepenuhnya dilakukan Aslab pada level Laboratorium (`laboratorium.praktikanIds` & `users.labIds`). | Akbar (service), Abhy (UI & hook) |
| 2 | **CRUD Laboratorium di Tab Peta Asisten** (tombol `+ Lab`, `LabFormModal`, edit/hapus pada `LabCard`, `useKelolaLab`) | `src/app/asisten/peta.tsx`, `src/hooks/use-kelola-lab.ts`, `src/components/lab-form-modal.tsx` | **HAPUS dari sisi Asprak & PINDAHKAN ke Aslab.** Tab `Peta` pada Asprak berubah menjadi **read-only** (hanya melihat peta & aktivitas lab via `LabMapView` + `LabActivitySheet`, tanpa tambah/ubah/hapus lab). | Setya (pindah ke Aslab), Abhy (ubah peta Asprak jadi read-only) |
| 3 | **Input Mata Kuliah Bebas pada Form Kelas Asprak** | `src/components/kelas-form.tsx`, `src/components/sesi-form.tsx` | **BATASI:** Di `KelasFormModal`, Asprak tidak lagi mengetik `mataKuliah` bebas melainkan memilih dari **Laboratorium yang ditugaskan kepadanya** (`kelas.labId`, di mana `asprakId in lab.asprakIds`). Di `SesiFormModal`, `sesi.labId` terisi default dari `kelas.labId`, namun **boleh diubah ke lab lain** apabila ruang pelaksanaan sesi minggu tersebut berpindah (koordinat & radius presensi selalu mengikuti `sesi.labId`). | Abhy |
| 4 | **Langganan Seluruh `praktikanList` & Single `kelasId` di `PraktikumProvider`** | `src/context/praktikum-context.tsx` (`subscribePraktikan`, `currentUser.kelasId`) | **HAPUS** `subscribePraktikan` untuk Asprak (`totalPraktikan` dihitung dari `labDoc(kelas.labId).praktikanIds.length`). Untuk Praktikan, **GANTI** langganan berbasis single `kelasId` menjadi berbasis `currentUser.labIds` (multi-lab/matkul). Untuk Asprak, **GANTI** filter `where('asistenId', '==', uid)` menjadi berbasis `currentUser.labIds` agar multi-Asprak & perpindahan Asprak antar lab berjalan mulus. | Akbar |
| 5 | **Role `'asisten'` & Koleksi `asistenWhitelist/{email}`** | `src/types.ts`, `src/app/(auth)/register.tsx`, `src/app/asisten/`, `firestore.rules` | **HAPUS & MIGRASI:** Ganti tipe `'asisten'` → `'asprak'`, tambah `'aslab'`; ganti folder `src/app/asisten/` → `src/app/asprak/`; ganti `asistenWhitelist` → `roleWhitelist/{email}`; perbarui pilihan peran di form Register menjadi 3 peran (`praktikan`, `asprak`, `aslab`). | Akbar (types, auth, rules), Abhy (folder route) |
| 6 | **Izin Tulis `asisten` di `firestore.rules`** (`users.kelas`, `laboratorium/*`, helper `isAsisten()`) | `firestore.rules` (baris 14–16, 70–74, 104–121) | **HAPUS** helper `isAsisten()`, cabut hak tulis `asprak` pada `users/{uid}` dan `laboratorium/{labId}`, lalu terapkan `isAslab()` (shared admin seluruh lab) dan `isAsprak()` (berbasis `lab.asprakIds`) sesuai matriks hak akses di bawah. | Akbar |
| 7 | **Input Manual Nomor Pertemuan pada `SesiFormModal`** | `src/components/sesi-form.tsx` | **HAPUS** input manual `pertemuan`; ganti menjadi nilai otomatis `count + 1` (*read-only*). | Abhy |
| 8 | **Daftar Pilihan Sesi Non-Dropdown pada Form Izin** | `src/components/izin-form.tsx`, `src/app/izin/ajukan.tsx` | **HAPUS** list/chip pilihan sesi memanjang; ganti dengan komponen **Dropdown Select**. | Abhy |
| 9 | **Tampilan Sesi `MENUNGGU` di Halaman Riwayat Praktikan** | `src/app/praktikan/riwayat.tsx` | **HAPUS** sesi berstatus `menunggu` dari daftar Riwayat (hanya tampilkan `hadir`, `terlambat`, `izin`, dan `tidak_hadir` untuk sesi `DITUTUP`). | Abhy |
| 10 | **Hapus Sesi yang Sudah `DIBUKA` atau `DITUTUP`** | `src/services/sesi.ts`, `src/app/asisten/jadwal.tsx`, `firestore.rules` | **HAPUS / LARANG:** Sesi hanya boleh dihapus saat berstatus `BELUM_DIBUKA` agar catatan presensi, tagihan denda, dan riwayat pembayaran tidak kehilangan referensi sesi. | Akbar (rules), Abhy (UI) |

### 2.2 Matriks Kewenangan 3 Peran (Ringkasan)

| Kemampuan / Fitur | Aslab | Asprak | Praktikan |
| --- | :---: | :---: | :---: |
| CRUD Laboratorium (lokasi, koordinat, radius, *grace period*, nominal denda) | ✅ | ❌ *(dihapus)* | ❌ |
| 3 Fitur Bulk/Single Insert (Lab, Praktikan, Asprak) + Template `.xlsx`/`.csv` | ✅ | ❌ | ❌ |
| Pindah Praktikan & Asprak Antar Laboratorium | ✅ | ❌ *(dihapus)* | ❌ |
| Dashboard Keberlangsungan Lab & Riwayat Keuangan Denda (Hari/Minggu/Bulan) | ✅ | ❌ | ❌ |
| Lihat Peta Laboratorium & Aktivitas Praktikum | ✅ | ✅ *(read-only)* | ✅ *(read-only)* |
| CRUD Kelas & Sesi (pada lab tanggung jawabnya, tanpa tambah peserta) | ❌ | ✅ | ❌ |
| Buka/Tutup Sesi, Pantau Presensi & Putuskan Izin (*Excused Absence*) | ❌ | ✅ | ❌ |
| Presensi Berbasis Lokasi & Ajukan Izin (Dropdown) | ❌ | ❌ | ✅ |
| Bayar Denda Midtrans Sandbox & Lihat Riwayat Pembayaran Pribadi | ❌ | ❌ | ✅ |

---

## 3. Software Requirement Specification (SRS-49 s/d SRS-75)

Penomoran SRS melanjutkan dari Sprint 3 (`SRS-48`).

### A. Revisi Sprint 3 & Standar UX Global

| No | Kode | Deskripsi Requirement | Aktor | Prioritas |
| -- | --- | --- | --- | --- |
| 49 | SRS-49 | Halaman Kelola Kelas Asprak tidak lagi menyediakan fitur tambah/atur peserta; distribusi praktikan sepenuhnya berada di bawah kewenangan Aslab pada tingkat Laboratorium | Asprak, Aslab | Tinggi |
| 50 | SRS-50 | Praktikan memilih sesi praktikum pada form Pengajuan Izin menggunakan komponen dropdown (bukan daftar memanjang) | Praktikan | Tinggi |
| 51 | SRS-51 | Seluruh daftar data yang berpotensi memiliki banyak elemen menerapkan pagination dengan batas konsisten **8 item per halaman** (rentang 7–10) | Aslab, Asprak, Praktikan | Tinggi |
| 52 | SRS-52 | Halaman Riwayat Kehadiran Praktikan hanya menampilkan sesi yang sudah memiliki catatan kehadiran (`hadir`/`terlambat`), izin diterima (`izin`), atau sesi yang sudah ditutup (`tidak_hadir`), tanpa menampilkan sesi berstatus `menunggu` | Praktikan | Tinggi |
| 53 | SRS-53 | Form pembuatan sesi mengisi nomor pertemuan secara otomatis (`jumlah sesi kelas terkait + 1`) serta memberlakukan batas durasi sesi minimal **30 menit** dan maksimal **4 jam (240 menit)** dilengkapi preset durasi cepat | Asprak | Tinggi |
| 54 | SRS-54 | Seluruh layar dan modal yang memiliki input form secara otomatis bergeser ke atas ketika keyboard perangkat muncul agar kolom input dan tombol aksi tidak terhalang keyboard | Aslab, Asprak, Praktikan | Tinggi |

### B. Manajemen Laboratorium oleh Aslab (Role Baru)

| No | Kode | Deskripsi Requirement | Aktor | Prioritas |
| -- | --- | --- | --- | --- |
| 55 | SRS-55 | Sistem mendukung tiga peran pengguna (`aslab`, `asprak`, `praktikan`) pada database Firebase baru, dengan proteksi registrasi `aslab` dan `asprak` melalui koleksi whitelist (`roleWhitelist`) di Security Rules | Sistem, Aslab, Asprak, Praktikan | Tinggi |
| 56 | SRS-56 | Aslab dapat menambah, melihat, mengubah, dan menghapus (CRUD) data laboratorium per mata kuliah meliputi nama, mata kuliah, lokasi/gedung, titik koordinat, radius validasi presensi, batas toleransi keterlambatan (*grace period* dalam menit), dan nominal denda tetap | Aslab | Tinggi |
| 57 | SRS-57 | Aslab dapat melakukan **bulk insert** maupun **single insert** secara terpisah untuk tiga entitas berbeda: (a) sejumlah laboratorium berdasarkan satu mata kuliah, (b) praktikan ke laboratorium tertentu, dan (c) asprak ke laboratorium tertentu | Aslab | Tinggi |
| 58 | SRS-58 | Sistem menyediakan file template yang dapat diunduh dalam format **`.xlsx`** dan **`.csv`** secara terpisah untuk masing-masing dari ketiga fitur bulk insert | Aslab | Tinggi |
| 59 | SRS-59 | Setiap baris data hasil unggah bulk insert ditampilkan sebagai daftar interaktif dalam `ScrollView` yang memungkinkan Aslab menerima (*accept*), menolak (*deny*), mengubah (*update*), atau melengkapi data kosong sebelum disimpan; khusus bulk insert Praktikan/Asprak, sistem memvalidasi keberadaan akun di Firestore dan menandai baris yang belum terdaftar dengan peringatan/error | Aslab | Tinggi |
| 60 | SRS-60 | Aslab dapat memindahkan praktikan dari satu laboratorium ke laboratorium lainnya serta memindahkan/menugaskan ulang asprak antar laboratorium tanpa melakukan perpindahan jadwal praktikum | Aslab | Tinggi |

### C. Dashboard Keberlangsungan Laboratorium (Aslab)

| No | Kode | Deskripsi Requirement | Aktor | Prioritas |
| -- | --- | --- | --- | --- |
| 61 | SRS-61 | Aslab memiliki Dashboard Keberlangsungan Laboratorium berbasis data real-time Firestore yang menampilkan: jumlah laboratorium dan praktikan, status kegiatan praktikum tiap laboratorium, informasi lokasi dan waktu pelaksanaan, jadwal praktikum yang sedang berlangsung maupun akan datang, riwayat kegiatan laboratorium, serta **riwayat keuangan hasil denda praktikum** | Aslab | Tinggi |
| 62 | SRS-62 | Dashboard Aslab menyediakan filter rentang waktu berdasarkan **Hari**, **Minggu**, dan **Bulan** untuk memantau keberlangsungan kegiatan dan keuangan denda secara terstruktur | Aslab | Tinggi |

### D. Pengelolaan Sesi oleh Asprak

| No | Kode | Deskripsi Requirement | Aktor | Prioritas |
| -- | --- | --- | --- | --- |
| 63 | SRS-63 | Asprak hanya dapat melihat daftar kelas, jadwal, dan sesi praktikum pada laboratorium yang menjadi tanggung jawabnya, membuka/menutup sesi, memantau & mengelola presensi secara real-time, serta memutuskan izin — tanpa kewenangan mengelola distribusi praktikan atau konfigurasi seluruh laboratorium | Asprak | Tinggi |

### E. Perhitungan Keterlambatan & Pengelolaan Denda

| No | Kode | Deskripsi Requirement | Aktor | Prioritas |
| -- | --- | --- | --- | --- |
| 64 | SRS-64 | Sistem menghitung keterlambatan presensi terhadap acuan waktu mulai `max(jamMulai jadwal, dibukaPada)` ditambah durasi *grace period* laboratorium terkait; presensi sebelum atau tepat pada akhir *grace period* dicatat **tepat waktu**, sedangkan setelahnya dicatat **terlambat** | Sistem, Praktikan | Tinggi |
| 65 | SRS-65 | Setiap kejadian presensi terlambat otomatis menghasilkan **tepat satu** tagihan denda dengan nominal tetap sesuai konfigurasi laboratorium (dijaga di aplikasi dengan ID deterministik `{sesiId}_{uid}` dan Security Rules) yang terhubung ke `praktikanId`, `sesiId`, `labId`, dan catatan `presensi` terkait | Sistem | Tinggi |
| 66 | SRS-66 | Pembayaran denda tidak pernah mengubah status kehadiran praktikan (tetap tercatat hadir terlambat) | Sistem | Tinggi |
| 67 | SRS-67 | Praktikan yang pengajuan izinnya disetujui Asprak tetap dicatat sebagai tidak hadir dengan izin (*excused absence*), dibebaskan dari denda keterlambatan, dan keputusan izin tidak pernah mengubah catatan kehadiran menjadi hadir | Sistem, Asprak, Praktikan | Tinggi |

### F. Integrasi Payment Gateway (Midtrans Sandbox)

| No | Kode | Deskripsi Requirement | Aktor | Prioritas |
| -- | --- | --- | --- | --- |
| 68 | SRS-68 | Praktikan dapat melihat daftar tagihan denda beserta rincian sesi, keterlambatan, nominal denda, dan status tagihan | Praktikan | Tinggi |
| 69 | SRS-69 | Seluruh proses pembuatan transaksi pembayaran mengikuti arsitektur **client → backend → Midtrans Sandbox**; secret key / Server Key Midtrans tidak pernah disimpan atau dikirim ke aplikasi React Native | Sistem | Tinggi |
| 70 | SRS-70 | Aplikasi mengarahkan praktikan ke halaman pembayaran Midtrans Sandbox (Snap) untuk memilih metode pembayaran dan menyelesaikan transaksi | Praktikan | Tinggi |
| 71 | SRS-71 | Status pembayaran (`pending`, `success`, `failed`) dan pembaruan status tagihan hanya ditentukan melalui verifikasi **callback/webhook Midtrans yang valid** (verifikasi SHA-512 `signature_key`) pada backend, bukan semata-mata respons sisi client | Sistem | Tinggi |

### G. Notifikasi, Riwayat Pembayaran & Finalisasi UI

| No | Kode | Deskripsi Requirement | Aktor | Prioritas |
| -- | --- | --- | --- | --- |
| 72 | SRS-72 | Sistem mengirimkan notifikasi kepada praktikan (terintegrasi dengan sistem notifikasi Sprint 3) ketika: (a) tagihan denda baru dibuat, (b) pembayaran berhasil diverifikasi, dan (c) pembayaran gagal atau membutuhkan penyelesaian lebih lanjut | Sistem, Praktikan | Tinggi |
| 73 | SRS-73 | Praktikan memiliki halaman Riwayat Pembayaran yang menampilkan informasi sesi, tanggal tagihan, nominal, waktu transaksi, dan status pembayaran (`pending`/`success`/`failed`) secara persisten di Firestore meskipun aplikasi ditutup dan dibuka kembali | Praktikan | Tinggi |
| 74 | SRS-74 | Aplikasi menangani kondisi error pembayaran (jaringan terputus, backend tidak merespons, transaksi kedaluwarsa/dibatalkan, coba bayar ulang pada tagihan gagal) dengan umpan balik yang jelas | Praktikan, Sistem | Sedang |
| 75 | SRS-75 | Seluruh layar untuk ketiga peran (`aslab`, `asprak`, `praktikan`) memiliki antarmuka modern, konsisten dalam tipografi/palet/spacing/komponen, serta menangani loading, empty state, dan error state secara seragam | Aslab, Asprak, Praktikan | Tinggi |

---

## 4. Functional Requirement (FR-41 s/d FR-58)

Penomoran FR melanjutkan dari Sprint 3 (`FR-40`).

| No | Kode | Nama Fitur | Deskripsi Fungsional | Ref SRS |
| -- | --- | --- | --- | --- |
| 41 | FR-41 | Setup DB Firebase Baru, Paket Sprint 4 & Tipe Data 3 Peran | Konfigurasi proyek Firebase baru (`google-services.json` baru, `EXPO_PUBLIC_API_URL` untuk backend), instalasi paket bulk (`expo-document-picker`, `expo-file-system`, `expo-sharing`, `xlsx`), serta pembaruan `src/types.ts` untuk `Peran = 'aslab' \| 'asprak' \| 'praktikan'`, `Laboratorium` (tambah `mataKuliah`, `gracePeriodMenit`, `nominalDenda`, `aslabId`, `asprakIds`, `praktikanIds`), `Presensi` (tambah `terlambat`, `menitTerlambat`, `acuanMulai`, `batasToleransi`), `TagihanDenda`, `TransaksiPembayaran`, dan `TipeNotifikasi` pembayaran. | SRS-55, SRS-56, SRS-64, SRS-65 |
| 42 | FR-42 | Autentikasi 3 Peran & Service Layer Sprint 4 | Pembaruan `AuthProvider` & halaman registrasi/login untuk 3 peran (`aslab`/`asprak` dicek terhadap `roleWhitelist/{email}`). Pembaruan `src/services/` (`laboratorium.ts`, `presensi.ts`, `notification.ts`, `users.ts`, `sesi.ts`) dan penambahan `src/services/denda.ts`, `src/services/pembayaran.ts`, serta `src/services/bulk-import.ts` (generator & parser `.xlsx`/`.csv`). `PraktikumProvider` berlangganan koleksi sesuai peran aktif: **Aslab** (*shared admin* semua lab/sesi/tagihan/pembayaran), **Asprak** (berbasis `currentUser.labIds` — bukan `sesi.asprakId` — agar multi-Asprak & pindah lab mulus), **Praktikan** (sesi kelas dari `currentUser.labIds` dengan *empty-array guard* bila `labIds` kosong, plus `tagihan` & `pembayaran` berdasarkan `praktikanId` agar tetap tampil bila pindah lab). Sertakan `firestore.indexes.json` atau gunakan single-field `where` + client sort agar bebas error index pada DB baru. | SRS-55, SRS-58, SRS-65, SRS-72, SRS-73 |
| 43 | FR-43 | Utilitas Validasi Durasi, Auto-Pertemuan & Kalkulasi Keterlambatan | Pembaruan `src/utils/validation.ts` dan `src/utils/keterlambatan.ts`: `validateDurasiSesi(jamMulai, jamSelesai)` memastikan `30 <= durasi <= 240` menit; `hitungPertemuanBerikutnya(sesiKelasList)` menghitung `count + 1`; `evaluasiKeterlambatan(waktuPresensi, tanggal, jamMulai, dibukaPada, gracePeriodMenit)` mengembalikan `{ terlambat, menitTerlambat, acuanMulai, batasToleransi }`. | SRS-53, SRS-64 |
| 44 | FR-44 | Komponen Bersama: `PaginationControls` & `KeyboardAwareScroll` | Komponen `src/components/pagination-controls.tsx` (hook `usePagination(items, 8)` + UI navigasi halaman `Sebelumnya / Hal X dari Y / Berikutnya`) dan `src/components/keyboard-aware-scroll.tsx` (wrapper `KeyboardAvoidingView` + `ScrollView` standar lintas platform Android/iOS, memperbaiki bug Android `behavior={undefined}` Sprint 3). | SRS-51, SRS-54, SRS-75 |
| 45 | FR-45 | Backend Midtrans Sandbox & Webhook Verification (`backend/`) | Layanan Node.js/TypeScript di folder `backend/` (siap deploy Vercel/Render) dengan **Midtrans Sandbox Snap API** dan **Firebase Admin SDK**: `POST /api/payments/create` (autentikasi Firebase ID Token, validasi kepemilikan & status tagihan, cegah order ganda bila masih ada order `pending` aktif, set `expiry` 60 menit untuk uji Sandbox, catat `pembayaran/{orderId}` status `pending`), `POST /api/payments/webhook` (verifikasi SHA-512 `signature_key`, atomic update `pembayaran` & `tagihan`, buat dokumen `notifikasi` `PEMBAYARAN_BERHASIL` atau `PEMBAYARAN_GAGAL`), `GET /api/payments/:orderId/status` (fallback cek status ke Midtrans Status API), dan `POST /api/payments/:orderId/cancel` (membatalkan transaksi `pending` agar tidak *stuck* jika user menekan Back di Snap). | SRS-69, SRS-71, SRS-72, SRS-74 |
| 46 | FR-46 | Firebase Security Rules Sprint 4 | Pembaruan `firestore.rules` untuk 3 peran: `roleWhitelist` pada registrasi, `users/{uid}` boleh dibaca oleh `isAslab()` (untuk validasi bulk insert) & `isAsprak()`, `laboratorium` hanya ditulis `isAslab()` (*shared admin*), `kelas`/`sesi`/`izin` dibatasi pada `isAsprak()` anggota `labDoc(kelas.labId).asprakIds`, larangan hapus `sesi` jika `status != 'BELUM_DIBUKA'`, validasi `waktu == request.time` dan `terlambat == (request.time > sesiDoc.batasToleransi)` pada `presensi` (anti manipulasi jam HP), proteksi silang izin `diterima` ↔ presensi, `tagihan/{sesiId}_{uid}` hanya boleh `create` saat presensi terlambat (**`update`/`delete` dari client dilarang** — hanya Admin SDK), `pembayaran/{orderId}` read-only bagi pemilik & `isAslab()`, serta `notifikasi` mengizinkan `isPraktikan()` membuat `TAGIHAN_DENDA_BARU` khusus `targetUid == auth.uid`. | SRS-55, SRS-63, SRS-64, SRS-65, SRS-67, SRS-71 |
| 47 | FR-47 | Navigasi & Manajemen Laboratorium (Aslab) | Navigasi baru `src/app/aslab/_layout.tsx` (Tabs: `Dashboard`, `Laboratorium`, `Peta`, `Profil`). Halaman `src/app/aslab/laboratorium.tsx` + `AslabLabFormModal` untuk CRUD seluruh laboratorium (*shared admin* antar-Aslab) per mata kuliah termasuk pilih koordinat di peta / GPS perangkat, atur radius validasi presensi (meter), atur `gracePeriodMenit` (batasan keterlambatan waktu), dan `nominalDenda` (Rp). Dilengkapi pencarian, filter mata kuliah, dan `PaginationControls` (limit 8). | SRS-51, SRS-56, SRS-75 |
| 48 | FR-48 | Tiga Fitur Bulk & Single Insert Terpisah + Template `.xlsx`/`.csv` | Tiga alur/modal terpisah di modul Aslab: (1) **Insert Laboratorium** (bulk/single berdasarkan 1 mata kuliah), (2) **Insert Praktikan ke Lab** (bulk/single ke lab terpilih), dan (3) **Insert Asprak ke Lab** (bulk/single ke lab terpilih). Masing-masing menyediakan tombol **Unduh Template `.xlsx`** dan **Unduh Template `.csv`** (via `expo-file-system` + `expo-sharing`) serta tombol **Unggah File** (via `expo-document-picker`). | SRS-57, SRS-58 |
| 49 | FR-49 | Interactive Bulk Preview `ScrollView` & Validasi Akun Firestore | Komponen `BulkPreviewList` menampilkan setiap baris file hasil parse sebagai kartu di dalam `ScrollView` yang fleksibel: Aslab dapat men-toggle **Accept / Deny** per baris, melakukan **edit inline** untuk memperbaiki/melengkapi field kosong, serta melihat ringkasan jumlah baris valid/ditolak/error. Validasi otomatis mencakup: kelengkapan & rentang angka (`latitude`/`longitude`/`radius`/`gracePeriod`/`nominalDenda`), keberadaan akun di Firestore `users` **beserta kesesuaian peran** (`peran === 'praktikan'` untuk bulk praktikan; `peran === 'asprak'` untuk bulk asprak), serta deteksi duplikat (dalam file yang sama atau sudah terdaftar di lab tujuan). Tombol simpan hanya memproses baris berstatus `accepted && valid`. | SRS-59 |
| 50 | FR-50 | Perpindahan Praktikan & Asprak Antar Laboratorium | Modal/fitur di detail laboratorium Aslab untuk memindahkan Praktikan dari Lab asal ke Lab tujuan serta memindahkan/menugaskan ulang Asprak antar Lab secara atomik (`writeBatch` menyinkronkan `laboratorium.praktikanIds`/`asprakIds` dan `users.labIds`). Tidak memindahkan jadwal/sesi praktikum. | SRS-60 |
| 51 | FR-51 | Dashboard Keberlangsungan & Keuangan Laboratorium (Aslab) | Halaman `src/app/aslab/dashboard.tsx` dengan filter segmen **Hari / Minggu / Bulan** mencakup seluruh laboratorium (*shared admin*). Menampilkan: kartu ringkasan (jumlah lab, jumlah praktikan, total denda terkumpul, tagihan belum dibayar), daftar status kegiatan setiap lab (sedang berlangsung / terjadwal / selesai + lokasi & waktu berdasarkan `sesi.labId`), daftar jadwal berlangsung & akan datang, bagian **Riwayat Kegiatan Laboratorium**, dan bagian **Riwayat Keuangan Denda Praktikum** (real-time dari Firestore `laboratorium`, `sesi`, `tagihan`, `pembayaran`) dengan `PaginationControls` limit 8. | SRS-51, SRS-61, SRS-62 |
| 52 | FR-52 | Penyesuaian Modul Asprak & Revisi Form Sesi/Kelas | Refactor peran `asisten` → `asprak` (`src/app/asprak/`). Hapus fitur tambah peserta di `kelas.tsx` dan hapus CRUD laboratorium dari `peta.tsx` (ubah Peta Asprak menjadi *read-only*). Kelas yang dikelola Asprak terhubung ke `kelas.labId` tempat Asprak ditugaskan (`asprakId in lab.asprakIds`). Pembaruan `SesiFormModal`: nomor pertemuan otomatis (`count + 1`, read-only), `sesi.labId` default mengikuti `kelas.labId` namun boleh diganti ke lab lain jika pindah ruang, constraint durasi `30–240 menit` + preset durasi cepat (`30, 45, 60, 90, 120, 180, 240` menit), dan `KeyboardAwareScroll`. Hapus sesi hanya diizinkan saat `BELUM_DIBUKA`. Rekap kehadiran menampilkan badge `Tepat Waktu` / `Terlambat (+X mnt)` dan izin sebagai `Izin (Bebas Denda)` tanpa mengubah jadi hadir. Terapkan `PaginationControls` (limit 8) di seluruh list Asprak. | SRS-49, SRS-51, SRS-53, SRS-54, SRS-63, SRS-67 |
| 53 | FR-53 | Revisi Pengajuan Izin (Dropdown) & Riwayat Kehadiran Praktikan | Pembaruan `src/app/izin/ajukan.tsx` & `src/components/izin-form.tsx`: pemilihan sesi praktikum memakai komponen **Dropdown** + `KeyboardAwareScroll`. Pembaruan sub-tab `Kehadiran` pada `src/app/praktikan/riwayat.tsx`: hanya menampilkan sesi dengan status `hadir`, `terlambat`, `izin`, atau sesi `DITUTUP` (`tidak_hadir`) — menghilangkan sesi `MENUNGGU` — serta tetap menampilkan riwayat sesi yang pernah diikuti/izin dari lab lama bila praktikan sempat dipindahkan lab, dengan `PaginationControls` (limit 8). | SRS-50, SRS-51, SRS-52, SRS-54, SRS-67 |
| 54 | FR-54 | Presensi dengan Kalkulasi Keterlambatan & Pembuatan Tagihan Denda | Saat `bukaSesi` dijalankan Asprak, dokumen `sesi/{sesiId}` menyimpan `dibukaPada`, `acuanMulai = max(jamMulai, dibukaPada)`, dan `batasToleransi = acuanMulai + gracePeriodMenit` (dari `labDoc(sesi.labId)`). Pada `src/app/presensi/[sesiId].tsx` & aksi `presensi()`: tampilkan info `gracePeriodMenit` & jam batas tepat waktu; tolak presensi bila izin sesi ini sudah `diterima`. Saat presensi dicatat dalam radius, jika terlambat (`waktu > batasToleransi`), sistem mengeksekusi **1 `writeBatch` atomik** untuk menulis `sesi/{sesiId}/presensi/{uid}` + `tagihan/{sesiId}_{uid}` (`status: 'belum_bayar'`) + `notifikasi` (`TAGIHAN_DENDA_BARU`), lalu menampilkan info denda pada Bottom Sheet sukses. | SRS-64, SRS-65, SRS-66, SRS-67, SRS-72 |
| 55 | FR-55 | Daftar Tagihan Denda & Pembayaran Midtrans Snap (Praktikan) | Navigasi Praktikan tetap **5 tab** (`Jadwal`, `Riwayat`, `Izin`, `Peta`, `Profil`). Sub-tab **`Tagihan & Denda`** di dalam `src/app/praktikan/riwayat.tsx` (beserta banner pengingat tagihan belum lunas di `src/app/praktikan/jadwal.tsx`) menampilkan seluruh tagihan denda milik `currentUser.id` (tetap tampil meski praktikan pindah lab) lengkap dengan rincian sesi, durasi keterlambatan, nominal, dan status (`Belum Bayar` / `Pending` / `Lunas` / `Gagal`). Tombol **Bayar Sekarang** memanggil `POST /api/payments/create` lalu membuka `redirectUrl` Midtrans Snap lewat `expo-web-browser`. Jika status `Pending`, tersedia tombol **Lanjutkan Pembayaran** (buka `redirectUrl` aktif tanpa buat order ganda), **Cek Status**, dan **Batalkan & Buat Ulang** (`POST /api/payments/:orderId/cancel`) agar transaksi tidak pernah *stuck*. Status lunas hanya diperbarui dari listener Firestore hasil verifikasi webhook backend. | SRS-51, SRS-68, SRS-69, SRS-70, SRS-71, SRS-74 |
| 56 | FR-56 | Sub-Tab Riwayat Pembayaran Persisten (Praktikan) | Sub-tab **`Riwayat Bayar`** di dalam `src/app/praktikan/riwayat.tsx` menampilkan seluruh riwayat transaksi pembayaran milik `currentUser.id` dari koleksi Firestore `pembayaran`: info sesi, tanggal tagihan, nominal, waktu transaksi, metode pembayaran (jika tersedia dari webhook), dan badge status (`pending` / `success` / `failed`). Persisten saat aplikasi ditutup & dibuka kembali, dilengkapi `PaginationControls` limit 8. | SRS-51, SRS-73 |
| 57 | FR-57 | Integrasi Notifikasi Denda & Pembayaran | Memperluas `src/services/notification.ts` & `useNotifikasi` untuk menangani 3 tipe notifikasi baru: `TAGIHAN_DENDA_BARU`, `PEMBAYARAN_BERHASIL`, dan `PEMBAYARAN_GAGAL`. Notifikasi ditampilkan lewat Notifee saat listener Firestore menerima dokumen baru (termasuk yang ditulis oleh backend webhook). | SRS-72 |
| 58 | FR-58 | Finalisasi Konsistensi UI & Keyboard Handling Seluruh Peran | Audit & penyelarasan seluruh layar (`(auth)`, `aslab`, `asprak`, `praktikan`, `sesi`, `presensi`, `izin`) terhadap design token `src/constants/theme.ts`, pemakaian `KeyboardAwareScroll` di seluruh form, konsistensi `StatusBadge`, `LoadingState`, `ErrorState`, `EmptyState`, dan `PaginationControls` (limit 8). | SRS-51, SRS-54, SRS-75 |

---

## 5. Arsitektur Sistem & Kontrak Backend Midtrans

### 5.1 Alur Client – Server – Midtrans Sandbox – Webhook

```mermaid
sequenceDiagram
    actor Praktikan
    participant App as React Native App
    participant FS as Cloud Firestore
    participant BE as Backend API (backend/)
    participant MT as Midtrans Sandbox (Snap)

    Note over Praktikan,FS: 1. Presensi Terlambat (> max(jamMulai, dibukaPada) + gracePeriod)
    Praktikan->>App: Submit presensi (kode + lokasi dalam radius)
    App->>FS: Simpan presensi (terlambat: true) + tagihan/{sesiId}_{uid} + notifikasi TAGIHAN_DENDA_BARU

    Note over Praktikan,MT: 2. Inisiasi Pembayaran (Client -> Server -> Midtrans)
    Praktikan->>App: Tap "Bayar Sekarang" pada tagihan
    App->>BE: POST /api/payments/create (Authorization: Bearer Firebase ID Token, { tagihanId })
    BE->>FS: Verifikasi ID Token, kepemilikan & status tagihan != lunas
    BE->>MT: POST /snap/v1/transactions (Basic Auth: MIDTRANS_SERVER_KEY)
    MT-->>BE: { token, redirect_url }
    BE->>FS: Simpan pembayaran/{orderId} (status: "pending") & update tagihan.status = "pending"
    BE-->>App: 200 OK { orderId, snapToken, redirectUrl }
    App->>MT: WebBrowser.openBrowserAsync(redirectUrl)

    Note over MT,FS: 3. Verifikasi Pembayaran via Webhook (Server-Authoritative)
    MT->>BE: POST /api/payments/webhook (payload notifikasi Midtrans)
    BE->>BE: Hitung & cocokkan SHA-512(order_id + status_code + gross_amount + SERVER_KEY)
    BE->>FS: Transaction/Batch update pembayaran/{orderId} & tagihan/{tagihanId}
    BE->>FS: Tambah notifikasi/{notifId} (PEMBAYARAN_BERHASIL atau PEMBAYARAN_GAGAL)
    BE-->>MT: 200 OK
    FS-->>App: Real-time onSnapshot update UI Praktikan & Dashboard Keuangan Aslab + Notifee
```

### 5.2 Kontrak REST API (`backend/`)

Base URL dikonfigurasi di aplikasi mobile melalui environment variable `EXPO_PUBLIC_API_URL` (contoh: `https://praktikum-payment-api.vercel.app`).

#### 1) `POST /api/payments/create`

Membuat transaksi Midtrans Snap Sandbox untuk sebuah tagihan denda.

- **Headers:**
  - `Authorization: Bearer <Firebase_ID_Token>`
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "tagihanId": "sesi123_uidPraktikan456"
  }
  ```
- **Validasi Server:**
  1. Verifikasi Firebase ID Token melalui Firebase Admin SDK → peroleh `uid`.
  2. Baca `tagihan/{tagihanId}` di Firestore. Tolak (`404`) jika tidak ada, tolak (`403`) jika `tagihan.praktikanId !== uid`, tolak (`409`) jika `tagihan.status === 'lunas'`.
  3. **Cegah order ganda:** jika `tagihan.status === 'pending'` dan `pembayaran/{tagihan.orderIdTerakhir}` masih berstatus `pending` serta memiliki `redirectUrl` aktif, langsung kembalikan `{ orderId, snapToken, redirectUrl }` yang sudah ada (bukan membuat order Midtrans baru).
  4. Generate `orderId` unik (format `DENDA-<shortTagihan>-<timestamp>`).
  5. Panggil Midtrans Sandbox Snap API (`https://app.sandbox.midtrans.com/snap/v1/transactions`) dengan `gross_amount = tagihan.nominal` (diambil dari Firestore, **bukan** dari input client) dan `expiry: { duration: 60, unit: 'minutes' }` agar pengujian status `expire` di Sandbox cepat & realistis.
  6. Simpan `pembayaran/{orderId}` (`status: 'pending'`, `tagihanId`, `praktikanId`, `sesiId`, `labId`, `nominal`, `snapToken`, `redirectUrl`, `dibuatPada`) dan update `tagihan/{tagihanId}.status = 'pending'` serta `tagihan.orderIdTerakhir = orderId`.
- **Response `200 OK`:**
  ```json
  {
    "orderId": "DENDA-abc123-1732790000",
    "snapToken": "66e4fa55-fdac-4ef9-91b5-733b97d1b862",
    "redirectUrl": "https://app.sandbox.midtrans.com/snap/v4/redirection/66e4fa55-fdac-4ef9-91b5-733b97d1b862"
  }
  ```

#### 2) `POST /api/payments/webhook`

Endpoint publik yang didaftarkan sebagai **Payment Notification URL** pada Midtrans Sandbox Dashboard.

- **Verifikasi Keamanan Wajib:**
  ```ts
  const expectedSignature = crypto
    .createHash('sha512')
    .update(`${order_id}${status_code}${gross_amount}${process.env.MIDTRANS_SERVER_KEY}`)
    .digest('hex');
  // Tolak 401/403 jika expectedSignature !== payload.signature_key
  ```
- **Pemetaan Status Midtrans → Status Aplikasi:**
  | `transaction_status` Midtrans | `fraud_status` | Status `pembayaran` | Status `tagihan` | Notifikasi |
  | --- | --- | --- | --- | --- |
  | `settlement` atau `capture` | `accept` (atau kosong) | `success` | `lunas` | `PEMBAYARAN_BERHASIL` |
  | `capture` | `challenge` | `pending` | `pending` | — |
  | `pending` | — | `pending` | `pending` | — |
  | `deny`, `cancel`, `expire`, `failure` | — | `failed` | `gagal` (boleh bayar ulang) | `PEMBAYARAN_GAGAL` |
- **Idempotensi:** Jika `pembayaran/{orderId}` sudah berstatus `success`, abaikan pembaruan duplikat dan tetap kembalikan `200 OK` ke Midtrans tanpa membuat notifikasi ganda.

#### 3) `GET /api/payments/:orderId/status` (Sinkronisasi Status)

Memungkinkan aplikasi meminta backend memeriksa status terbaru langsung ke Midtrans Status API (`GET https://api.sandbox.midtrans.com/v2/{orderId}/status`) apabila webhook sempat tertunda saat pengujian lokal, tetap dengan verifikasi Firebase ID Token dan otoritas server.

#### 4) `POST /api/payments/:orderId/cancel` (Anti-Stuck Pending)

Dipanggil saat praktikan menekan **Batalkan & Buat Ulang** pada tagihan `pending` (misalnya setelah sempat menutup halaman Snap tanpa memilih metode pembayaran). Backend memverifikasi Firebase ID Token + kepemilikan order, memanggil Midtrans Cancel API (`POST /v2/{orderId}/cancel`, bila order belum ada di Midtrans tetap lanjutkan pembatalan lokal), lalu memperbarui `pembayaran/{orderId}.status = 'failed'` dan `tagihan/{tagihanId}.status = 'gagal'` agar praktikan dapat memulai transaksi baru secara bersih.

---

## 6. Struktur Data Firestore Baru & Security Rules (Sprint 4)

### 6.1 Koleksi Cloud Firestore (DB Baru Sprint 4)

| Koleksi | Field Utama | Keterangan |
| --- | --- | --- |
| `users/{uid}` | `nama`, `nim` (14 digit), `email`, `peran` (`aslab` \| `asprak` \| `praktikan`), `labIds` (`string[]`), `fcmToken`, `dibuatPada` | `labIds` menampung daftar ID laboratorium tempat praktikan/asprak ditugaskan oleh Aslab. |
| `roleWhitelist/{email}` | `peran` (`aslab` \| `asprak`), `ditambahkanPada` | Menggantikan `asistenWhitelist`. Menentukan email yang diizinkan registrasi sebagai `aslab` atau `asprak`. |
| `laboratorium/{labId}` | `nama`, `mataKuliah`, `lokasi`, `latitude`, `longitude`, `radius` (meter), `gracePeriodMenit` (default `15`), `nominalDenda` (default `10000`), `aslabId`, `aslabNama`, `asprakIds` (`string[]`), `praktikanIds` (`string[]`), `dibuatPada`, `diperbaruiPada` | Unit utama per mata kuliah yang dikelola oleh seluruh Aslab (*shared admin*). 1 `labId` menempel ke 1 lokasi fisik (koordinat + radius) sekaligus menyimpan kebijakan keterlambatan dan daftar anggota lab. |
| `kelas/{kelasId}` | `nama`, `mataKuliah`, `labId`, `labNama`, `asprakId`, `asprakNama`, `dibuatPada` | Berada di bawah `laboratorium/{labId}` (tanpa fitur tambah peserta manual — peserta otomatis seluruh `praktikanIds` dari `kelas.labId`). 1 kelas memiliki banyak sesi. |
| `sesi/{sesiId}` | `mataKuliah`, `pertemuan` (otomatis `count+1`), `topik`, `kelasId`, `kelas`, `labId`, `ruang`, `tanggal`, `jamMulai`, `jamSelesai` (durasi 30–240m), `asprakId`, `asprakNama`, `status` (`BELUM_DIBUKA` \| `DIBUKA` \| `DITUTUP`), `dibukaPada`, `acuanMulai`, `batasToleransi`, `ditutupPada`, `catatan`, `dibuatPada` | Setiap sesi memiliki tepat 1 `sesi.labId` (default = `kelas.labId`, boleh diubah Asprak ke lab lain bila ruang pelaksanaan pindah minggu itu). `acuanMulai` & `batasToleransi` diisi saat `bukaSesi` sebagai sumber kebenaran validasi keterlambatan. |
| `sesi/{sesiId}/rahasia/kode` | `kode` (4 digit) | Hanya dapat dibaca/ditulis oleh Asprak yang tergabung pada `labDoc(kelasDoc(sesi.kelasId).labId).asprakIds`. |
| `sesi/{sesiId}/presensi/{uid}` | `praktikanId`, `praktikanNama`, `praktikanNim`, `kode`, `waktu` (`serverTimestamp`), `latitude`, `longitude`, `jarakMeter`, `dalamRadius` (`true`), `terlambat` (`boolean`), `menitTerlambat` (`number`), `acuanMulai` (`Timestamp`), `batasToleransi` (`Timestamp`) | ID = `uid` mencegah presensi ganda. Status `terlambat` diverifikasi terhadap `request.time` server dan tidak pernah diubah oleh pembayaran denda. |
| `izin/{sesiId}_{uid}` | `sesiId`, `kelasId`, `labId`, `praktikanId`, `praktikanNama`, `praktikanNim`, `asprakId`, `sesiLabel`, `alasan`, `kategoriAI`, `skorAI`, `statusAI`, `status` (`menunggu` \| `diterima` \| `ditolak`), `catatanAsprak`, `diajukanPada`, `diputuskanOleh`, `diputuskanPada` | Izin `diterima` = *excused absence* (tidak jadi hadir & bebas denda). Dapat diputuskan oleh setiap Asprak pada lab kelas terkait. |
| `tagihan/{sesiId}_{uid}` | `sesiId`, `presensiId` (`uid`), `labId`, `mataKuliah`, `sesiLabel`, `praktikanId`, `praktikanNama`, `praktikanNim`, `nominal`, `menitTerlambat`, `status` (`belum_bayar` \| `pending` \| `lunas` \| `gagal`), `orderIdTerakhir`, `tanggalTagihan`, `dibayarPada` | ID deterministik `{sesiId}_{uid}` menjamin **maksimal 1 tagihan per kejadian keterlambatan**. Di-query via `praktikanId` sehingga tetap bertahan meski praktikan dipindah lab. |
| `pembayaran/{orderId}` | `orderId`, `tagihanId`, `sesiId`, `labId`, `sesiLabel`, `praktikanId`, `praktikanNama`, `praktikanNim`, `nominal`, `status` (`pending` \| `success` \| `failed`), `metodePembayaran`, `snapToken`, `redirectUrl`, `tanggalTagihan`, `waktuTransaksi`, `diperbaruiPada` | Ditulis & diperbarui **eksklusif oleh Backend (Firebase Admin SDK)** berdasarkan Midtrans Snap & Webhook terverifikasi. |
| `notifikasi/{notifId}` | `tipe` (`SESI_DIBUKA` \| `JADWAL_DIUBAH` \| `IZIN_DIPUTUSKAN` \| `TAGIHAN_DENDA_BARU` \| `PEMBAYARAN_BERHASIL` \| `PEMBAYARAN_GAGAL`), `judul`, `pesan`, `sesiId`, `kelasId`, `tagihanId`, `orderId`, `targetUid`, `dibuatPada` | Sumber event notifikasi Notifee/FCM. |

### 6.2 Ringkasan Aturan `firestore.rules` (Sprint 4)

- **`users/{uid}`:**
  - `read`: pemilik (`request.auth.uid == uid`), `isAslab()` (untuk validasi bulk insert & pindah anggota), atau `isAsprak()`.
  - `create`: registrasi `aslab` wajib cocok `roleWhitelist/{email}.peran == 'aslab'`; `asprak` wajib `roleWhitelist/{email}.peran == 'asprak'`; `labIds == []`.
  - `update`: pemilik hanya boleh ubah `nama`/`nim` atau `fcmToken`; **hanya `isAslab()`** yang boleh mengubah field `labIds`.
- **`laboratorium/{labId}`:** `read` untuk semua pengguna login; `create`/`update`/`delete` **hanya `isAslab()`** (*shared admin* seluruh lab, memvalidasi `radius > 0`, `gracePeriodMenit >= 0`, `nominalDenda >= 0`).
- **`kelas/{kelasId}` & `sesi/{sesiId}`:**
  - Akses tulis `kelas`: hanya `isAsprak()` yang terdaftar pada `labDoc(kelas.labId).asprakIds`.
  - Akses tulis `sesi`: hanya `isAsprak()` yang terdaftar pada `labDoc(kelasDoc(sesi.kelasId).labId).asprakIds` (sehingga multi-Asprak dalam satu lab dapat berkolaborasi dan perpindahan Asprak otomatis mengalihkan kewenangan tanpa pindah jadwal).
  - **`delete` pada `sesi/{sesiId}`:** hanya diizinkan jika `resource.data.status == 'BELUM_DIBUKA'` (sesi `DIBUKA`/`DITUTUP` tidak boleh dihapus agar presensi, tagihan, dan riwayat pembayaran tetap utuh).
- **`sesi/{sesiId}/presensi/{uid}`:**
  - `create`: hanya `isPraktikan()` anggota `labDoc(kelasDoc(sesiDoc.kelasId).labId).praktikanIds`, sesi `DIBUKA`, kode cocok, `dalamRadius == true`, `jarakMeter <= labDoc(sesiDoc.labId).radius`, **belum punya izin berstatus `diterima` pada sesi tersebut**, `waktu == request.time` (server time), dan `terlambat == (request.time > sesiDoc.batasToleransi)` (anti manipulasi jam HP).
  - `update`: **`false`**.
- **`izin/{sesiId}_{uid}`:**
  - `create`: `isPraktikan()` pemilik, belum pernah presensi pada sesi tersebut, sesi belum `DITUTUP`.
  - `update`: `isAsprak()` anggota `labDoc(kelasDoc(sesiDoc.kelasId).labId).asprakIds`; status `diterima` ditolak bila praktikan sudah tercatat presensi pada sesi tersebut.
- **`tagihan/{sesiId}_{uid}`:**
  - `read`: pemilik (`praktikanId == auth.uid`), `isAslab()`, atau `isAsprak()` lab terkait.
  - `create`: `isPraktikan()` pemilik dalam 1 `writeBatch` atomik bersama `presensi` saat `terlambat == true`, dengan `status == 'belum_bayar'`, `nominal == labDoc(sesiDoc.labId).nominalDenda`, dan ID dokumen `sesiId + '_' + auth.uid`.
  - `update` & `delete` dari client: **`false`** (status `pending`/`lunas`/`gagal` hanya diubah oleh Backend via Firebase Admin SDK).
- **`pembayaran/{orderId}`:**
  - `read`: pemilik (`praktikanId == auth.uid`) atau `isAslab()` (untuk Dashboard Keuangan).
  - `write` dari client: **`false`** (eksklusif Backend Admin SDK).
- **`notifikasi/{notifId}`:**
  - `read`: hanya `resource.data.targetUid == request.auth.uid`.
  - `create`: `isAsprak()` untuk `SESI_DIBUKA` / `JADWAL_DIUBAH` / `IZIN_DIPUTUSKAN`, **atau** `isPraktikan()` khusus `tipe == 'TAGIHAN_DENDA_BARU' && targetUid == request.auth.uid` (sedangkan `PEMBAYARAN_BERHASIL` & `PEMBAYARAN_GAGAL` ditulis oleh Backend Admin SDK).

### 6.3 Format Kolom Template Bulk Insert (`.xlsx` & `.csv`)

Ketiga template dibuat dan diunduh secara terpisah:

1. **Template Bulk Insert Laboratorium** (`template-bulk-laboratorium.xlsx` / `.csv`) — *mata kuliah dipilih 1 kali di form sebelum/saat upload*:
   `nama_lab, lokasi, latitude, longitude, radius_meter, grace_period_menit, nominal_denda`
2. **Template Bulk Insert Praktikan ke Lab** (`template-bulk-praktikan.xlsx` / `.csv`) — *lab tujuan dipilih di form*:
   `email, nim, nama` *(pencocokan akun ber-peran `praktikan` yang terdaftar di Firestore via `email` atau `nim`)*
3. **Template Bulk Insert Asprak ke Lab** (`template-bulk-asprak.xlsx` / `.csv`) — *lab tujuan dipilih di form*:
   `email, nim, nama` *(pencocokan akun ber-peran `asprak` yang terdaftar di Firestore via `email` atau `nim`)*

### 6.4 Ringkasan Penanganan Edge Cases Kritis (Anti-Hole Checklist)

| No | Skenario / Edge Case | Perilaku Wajib Sistem |
| -- | --- | --- |
| 1 | **Praktikan memanipulasi jam HP mundur** agar tidak kena denda | `bukaSesi` menyimpan `batasToleransi` pada dokumen `sesi`; `firestore.rules` memvalidasi `presensi.waktu == request.time` dan `terlambat == (request.time > sesi.batasToleransi)`. |
| 2 | **Internet putus di tengah presensi terlambat** | `presensi` + `tagihan/{sesiId}_{uid}` + `notifikasi` ditulis dalam **1 `writeBatch` atomik** sehingga keduanya sukses bersamaan atau gagal bersamaan. |
| 3 | **Praktikan dipindahkan dari Lab A ke Lab B** | Jadwal & notifikasi sesi baru otomatis mengikuti Lab B; Riwayat Kehadiran tetap menampilkan sesi historis Lab A yang pernah diikuti/izin; Tagihan Denda & Riwayat Pembayaran Lab A (di-query via `praktikanId`) tetap muncul dan wajib dibayar. |
| 4 | **Asprak dipindahkan dari Lab A ke Lab B** | Hak akses kelas, sesi, kode rahasia, presensi, dan izin dicek lewat `labDoc(kelas.labId).asprakIds` (bukan `sesi.asprakId == uid`), sehingga Asprak pengganti langsung dapat mengelola sesi Lab A tanpa memindahkan jadwal. |
| 5 | **Praktikan sudah punya izin `diterima` lalu mencoba presensi (atau sebaliknya)** | Presensi ditolak di UI & Security Rules bila izin sudah `diterima`; sebaliknya persetujuan izin ditolak bila praktikan sudah tercatat presensi pada sesi tersebut. |
| 6 | **Praktikan menutup browser Snap sebelum memilih metode bayar** | Status `pending` tidak *stuck*: UI menyediakan tombol **Lanjutkan Pembayaran** (pakai `redirectUrl` aktif), **Cek Status**, dan **Batalkan & Buat Ulang** (`POST /api/payments/:orderId/cancel`), ditambah expiry Snap 60 menit. |
| 7 | **Praktikan/Asprak baru belum di-assign ke lab mana pun (`labIds: []`)** | `PraktikumProvider` wajib memasang guard `if (labIds.length === 0)` sebelum query Firestore `where(..., 'in', labIds)` agar tidak menghasilkan error Firestore dan langsung menampilkan `EmptyState`. |
| 8 | **Database baru belum punya composite index Firestore** | Query baru memakai single-field `where` + pengurutan di klien (pola `subscribeSemuaSesi`) dan/atau menyediakan `firestore.indexes.json` di `feature/fondasi-sprint4` untuk di-deploy bersama `firestore.rules`. |

---

## 7. Pembagian Tugas Programmer & Urutan Merge Anti-Konflik

Pembagian dirancang **seadil mungkin** dengan **isolasi direktori ketat** sehingga tidak terjadi *merge conflict* antar developer setelah fondasi di-merge.

### 7.1 Tabel Pembagian Tugas

| Anggota | Peran / Track | Fitur (Ref FR) | Branch | Kepemilikan Folder / Modul (Disjoint) | Catatan Dependency |
| --- | --- | --- | --- | --- | --- |
| **Sofwan** | **PM** | Freeze Sprint 3, Setup DB Baru & Midtrans, Review & Merge | Merge semua branch ke `main` | Tag `v3.0-sprint3`, proyek Firebase baru (`google-services.json` + Firebase Service Account JSON untuk backend), akun & kredensial **Midtrans Sandbox** (Server Key & Client Key), isi dokumen `roleWhitelist`, deploy `firestore.rules` & `firestore.indexes.json`, review PR & uji E2E 4 alur demo, `docs/sprints/` | Membagikan `google-services.json` ke semua dev dan Midtrans Server Key + Service Account ke Akbar sebelum fase coding dimulai |
| **Akbar** | **Track 1: Fondasi DB Baru, Backend Midtrans & Security Rules** | FR-41, FR-42, FR-43, FR-44, FR-45, FR-46 | 1. `feature/fondasi-sprint4`<br>2. `feature/backend-midtrans`<br>3. `feature/keamanan-sprint4` | `app.json`, `app.config.js`, `package.json`, `src/types.ts`, `src/lib/firebase.ts`, `src/services/*` (`auth`, `users`, `laboratorium`, `sesi`, `presensi`, `denda`, `pembayaran`, `bulk-import`, `notification`), `src/context/*`, `src/utils/validation.ts`, `src/utils/keterlambatan.ts`, `src/components/pagination-controls.tsx`, `src/components/keyboard-aware-scroll.tsx`, `src/app/_layout.tsx`, `src/app/(auth)/*`, **`backend/`**, `firestore.rules`, `firestore.indexes.json` | **`feature/fondasi-sprint4` WAJIB di-merge PERTAMA (Gerbang Serial #1).** Setelah itu, `feature/backend-midtrans` berjalan paralel di folder `backend/` tanpa menyentuh layar UI Setya & Abhy. `feature/keamanan-sprint4` di-merge paling akhir. |
| **Setya** | **Track 2: Modul Role Baru Aslab (Lab, 3 Bulk Insert, Pindah Anggota & Dashboard)** | FR-47, FR-48, FR-49, FR-50, FR-51 | 1. `feature/aslab-manajemen-lab`<br>2. `feature/aslab-dashboard` | **`src/app/aslab/*`** (`_layout`, `dashboard`, `laboratorium`, `peta`, `profil`), **`src/components/aslab/*`** (`aslab-lab-form-modal`, `bulk-insert-lab-modal`, `bulk-insert-praktikan-modal`, `bulk-insert-asprak-modal`, `bulk-preview-list`, `pindah-anggota-modal`, `dashboard-keuangan-card`), **`src/hooks/use-aslab-*.ts`** | Mulai setelah `feature/fondasi-sprint4` di-merge. Memakai `bulk-import.ts`, `laboratorium.ts`, `PaginationControls`, dan `KeyboardAwareScroll` dari Akbar. **0 file overlap** dengan Abhy. |
| **Abhy** | **Track 3: Modul Asprak, Praktikan, UI Pembayaran Midtrans, Notifikasi Denda & Revisi Sprint 3** | FR-52, FR-53, FR-54, FR-55, FR-56, FR-57, FR-58 | 1. `feature/asprak-revisi-sesi`<br>2. `feature/praktikan-denda-pembayaran` | **`src/app/asprak/*`** (migrasi dari `asisten/*`), **`src/app/praktikan/*`** (`jadwal` + banner tagihan, `riwayat` dengan 3 sub-tab `Kehadiran`/`Tagihan & Denda`/`Riwayat Bayar`, `izin`, `peta`, `profil`), **`src/app/presensi/*`**, **`src/app/izin/*`**, **`src/app/sesi/*`**, `src/components/sesi-form.tsx`, `src/components/kelas-form.tsx`, `src/components/izin-form.tsx`, `src/components/asisten-panel.tsx`, `src/components/praktikan-panel.tsx`, **`src/components/denda/*`** (`tagihan-list-tab`, `riwayat-bayar-tab`, `tagihan-banner`), `src/hooks/use-kelola-*.ts`, `src/hooks/use-notifikasi.ts` | Mulai setelah `feature/fondasi-sprint4` di-merge. Integrasi tombol Bayar/Cancel/Cek Status Midtrans memakai `src/services/pembayaran.ts` (kontrak endpoint disepakati sejak Fondasi, uji end-to-end setelah `feature/backend-midtrans` dideploy Akbar). **0 file overlap** dengan Setya. |

### 7.2 Urutan Merge Serial & Paralel (Anti-Konflik)

```mermaid
flowchart TD
    G0["Gerbang 0 — Sofwan (PM)<br/>Freeze Sprint 3 (v3.0-sprint3), buat DB Firebase baru & Midtrans Sandbox"] --> G1
    G1["Gerbang 1 (SERIAL) — Akbar<br/>Merge feature/fondasi-sprint4 ke main<br/>(Types, Services, Context 3 Role, Shared Components, Dev Client Rebuild)"] --> P1
    G1 --> P2
    G1 --> P3

    P1["Paralel A — Akbar<br/>feature/backend-midtrans<br/>(folder backend/ + Deploy Vercel/Render + Webhook URL)"] --> G2
    P2["Paralel B — Setya<br/>1) feature/aslab-manajemen-lab<br/>2) feature/aslab-dashboard"] --> G2
    P3["Paralel C — Abhy<br/>1) feature/asprak-revisi-sesi<br/>2) feature/praktikan-denda-pembayaran"] --> G2

    G2["Gerbang 2 — Integrasi & Uji E2E<br/>Merge semua fitur ke main, uji 4 alur demo bersama"] --> G3
    G3["Gerbang 3 (SERIAL TERAKHIR) — Akbar + Sofwan (PM)<br/>Merge feature/keamanan-sprint4 (firestore.rules) & Deploy Rules"]
```

**Aturan anti-konflik wajib:**
1. Setya dan Abhy **tidak boleh mulai membuat branch fitur** sebelum `feature/fondasi-sprint4` (Akbar) di-merge ke `main`.
2. Bila Setya atau Abhy menemukan kebutuhan perubahan pada `src/types.ts` atau `src/services/*`, perubahan tersebut dikoordinasikan melalui PM + Akbar dalam PR kecil khusus agar tidak mengubah file bersama secara paralel.
3. Setya hanya bekerja di `src/app/aslab/`, `src/components/aslab/`, dan `src/hooks/use-aslab-*.ts`. Abhy hanya bekerja di `src/app/asprak/` (migrasi `asisten/`), `src/app/praktikan/`, `src/app/izin/`, `src/app/presensi/`, `src/app/sesi/`, dan `src/components/denda/`. Akbar bekerja di `backend/` dan `firestore.rules`.

---

## 8. Akun & Data Uji Sprint 4

Siapkan akun & data uji berikut pada proyek Firebase **baru** Sprint 4:

| Peran / Data | Akun / Dokumen Uji | Keterangan |
| --- | --- | --- |
| Whitelist (`roleWhitelist`) | `aslab1@...` (`aslab`), `asprak1@...` (`asprak`), `asprak2@...` (`asprak`) | Ditambahkan oleh Sofwan (PM) di Firebase Console sebelum registrasi. |
| Aslab | `aslab1@...` | Mengelola mata kuliah Pemrograman Mobile & Basis Data, bulk insert, pindah anggota, dan Dashboard. |
| Asprak | `asprak1@...`, `asprak2@...` | Ditugaskan oleh Aslab ke Lab A / Lab B untuk mengelola kelas, sesi, presensi, dan izin. |
| Praktikan | minimal 4 akun praktikan terdaftar (`praktikan1`–`praktikan4`) | Untuk uji bulk insert (termasuk 1 baris dummy email belum terdaftar untuk uji warning), pindah lab, presensi tepat waktu, presensi terlambat → bayar Midtrans, dan izin *excused absence*. |
| Template Uji Bulk | 3 file `.xlsx` & 3 file `.csv` contoh | Mencakup baris normal, baris dengan kolom kosong (uji edit inline), dan baris akun belum terdaftar (uji penanda error + deny). |
| Midtrans Sandbox | Simulator Pembayaran Midtrans Sandbox (VA BCA/BNI / GoPay / QRIS Sandbox) | Digunakan saat demo pembayaran untuk memicu status `success`, `pending`, dan `expire`/`cancel` (`failed`). |

---

## 9. Setup Proyek Sprint 4 (Mobile + Backend Midtrans)

### 9.1 Setup Mobile App (React Native / Expo)

1. Tarik branch `main` setelah `feature/fondasi-sprint4` di-merge.
2. Ganti file `google-services.json` di root proyek dengan file **DB baru Sprint 4** dari Sofwan (PM) (`project_id`: `ppk-manajemen-praktikum`, `android.package` di `app.json`: `com.praktikum.manajemen`). **Jangan di-commit.**
3. Buat/perbarui file `.env` di root proyek (tidak di-commit):
   ```bash
   GOOGLE_MAPS_API_KEY=<kunci_google_maps_android>
   EXPO_PUBLIC_API_URL=https://<domain-backend-anda>
   ```
4. Pasang dependensi baru Sprint 4 (dipasang Akbar pada `feature/fondasi-sprint4`):
   ```bash
   npx expo install expo-document-picker expo-file-system expo-sharing
   npm install xlsx
   ```
5. Rebuild development client Android:
   ```bash
   npx expo run:android
   ```

### 9.2 Setup Backend Midtrans (`backend/`)

1. Masuk ke folder `backend/` dan install dependensi:
   ```bash
   npm install
   ```
2. Buat file `backend/.env` (jangan di-commit — contoh template ada di `backend/.env.example`):
   ```bash
   PORT=3001
   MIDTRANS_IS_PRODUCTION=false
   MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxxxxxx
   MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxxxxxx
   FIREBASE_PROJECT_ID=<project-id-baru-sprint4>
   FIREBASE_CLIENT_EMAIL=<service-account-email>
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```
3. Deploy `backend/` ke Vercel atau Render, lalu salin URL publiknya dan daftarkan `https://<domain-backend-anda>/api/payments/webhook` pada **Midtrans Sandbox Dashboard → Settings → Configuration → Payment Notification URL**.
4. Verifikasi sebelum PR:
   ```bash
   npx tsc --noEmit
   npx expo lint
   ```
