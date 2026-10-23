# Manajemen Praktikum

Aplikasi mobile sederhana untuk mencatat kehadiran praktikum dari dua sudut pandang, yaitu **asisten** dan **praktikan**. Asisten melihat jadwal, membuka sesi saat praktikum dimulai, memantau kehadiran, lalu menutup sesi. Praktikan melihat jadwal dan detail sesi, melakukan presensi, serta melihat catatan kehadirannya sendiri.

## Tech Stack

- **Framework:** React Native + Expo SDK 58 (TypeScript)
- **Navigasi:** Expo Router (file-based routing, Stack + Tabs)
- **State:** React Context + `useState`
- **Data:** Dummy lokal (`src/data/dummy.ts`), tanpa database
- **Styling:** `StyleSheet` + Flexbox
- **UI Interaksi:** `TextInput`, `Pressable`, `FlatList`, `Modal` (dipakai juga sebagai Bottom Sheet)

## Deskripsi Singkat

Pengguna memilih peran (asisten/praktikan) dan identitasnya dari daftar dummy di halaman awal. Asisten membuka sesi, lalu sistem membuat kode presensi 4 digit. Praktikan memasukkan kode tersebut untuk presensi, sistem mencatat waktunya, dan praktikan tidak bisa presensi dua kali di sesi yang sama. Asisten dapat melihat rekap daftar hadir beserta waktunya, lalu menutup sesi. Semua perubahan disimpan di state selama aplikasi berjalan dan kembali ke data awal saat aplikasi dimuat ulang.

---

## 1. Software Requirement Specification (SRS)

| No  | Kode   | Deskripsi Requirement                                                                                                          | Aktor              | Prioritas |
| --- | ------ | ------------------------------------------------------------------------------------------------------------------------------ | ------------------ | --------- |
| 1   | SRS-01 | Pengguna dapat memilih peran dan identitas melalui pilihan sederhana di dalam aplikasi                                         | Asisten, Praktikan | Tinggi    |
| 2   | SRS-02 | Pengguna dapat melihat daftar jadwal sesi praktikum sesuai perannya                                                            | Asisten, Praktikan | Tinggi    |
| 3   | SRS-03 | Pengguna dapat melihat detail sesi berisi nama praktikum, kelas, waktu, ruang, dan status sesi                                 | Asisten, Praktikan | Tinggi    |
| 4   | SRS-04 | Asisten dapat membuka sesi yang belum dibuka                                                                                   | Asisten            | Tinggi    |
| 5   | SRS-05 | Asisten dapat menutup sesi yang sedang dibuka                                                                                  | Asisten            | Tinggi    |
| 6   | SRS-06 | Perubahan status sesi langsung terlihat pada semua antarmuka yang berkaitan                                                    | Asisten, Praktikan | Tinggi    |
| 7   | SRS-07 | Praktikan dapat melakukan presensi saat sesi dibuka, sistem mencatat waktu kehadiran dan memberi umpan balik berhasil          | Praktikan          | Tinggi    |
| 8   | SRS-08 | Praktikan yang sama tidak dapat melakukan presensi dua kali pada sesi yang sama                                                | Praktikan          | Tinggi    |
| 9   | SRS-09 | Asisten dapat melihat daftar praktikan yang sudah presensi beserta waktu kehadirannya                                          | Asisten            | Tinggi    |
| 10  | SRS-10 | Praktikan dapat melihat catatan kehadirannya sendiri                                                                           | Praktikan          | Sedang    |
| 11  | SRS-11 | Sistem menggunakan form untuk masukan/pilihan pengguna, serta Modal atau Bottom Sheet untuk konfirmasi dan informasi pendukung | Asisten, Praktikan | Tinggi    |
| 12  | SRS-12 | Sistem menampilkan kondisi khusus saat daftar kosong, sesi belum dibuka, dan presensi sudah tercatat                           | Asisten, Praktikan | Sedang    |
| 13  | SRS-13 | Data pengguna, jadwal, sesi, dan presensi menggunakan data dummy yang dikelola di state                                        | Sistem             | Tinggi    |

## 2. Functional Requirement

| No  | Kode  | Nama Fitur                | Deskripsi Fungsional                                                                                                                                                                                                       | Ref SRS                |
| --- | ----- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 1   | FR-01 | Pilih Peran & Identitas   | Halaman awal dengan pilihan peran (Asisten/Praktikan), daftar nama sesuai peran, dan `TextInput` pencarian nama/NIM. Tombol Masuk nonaktif sebelum identitas dipilih, lalu diarahkan ke Tabs peran dengan `router.replace` | SRS-01, SRS-11         |
| 2   | FR-02 | State Global & Data Dummy | `PraktikumProvider` di root layout berisi `currentUser`, `sesiList`, `presensiList`, dan aksi `login`, `logout`, `bukaSesi`, `tutupSesi`, `presensi`. Diakses lewat hook `usePraktikum()`                                  | SRS-06, SRS-13         |
| 3   | FR-03 | Navigasi                  | Root Stack: `index` (pilih peran), `asisten/` (Tabs: Jadwal, Profil), `praktikan/` (Tabs: Jadwal, Riwayat, Profil), dan `sesi/[id]` (detail sesi bersama)                                                                  | SRS-02                 |
| 4   | FR-04 | Komponen Bersama          | `SesiCard`, `StatusBadge` (Belum Dibuka abu, Dibuka hijau, Ditutup merah), dan `EmptyState` (judul, deskripsi, ikon)                                                                                                       | SRS-02, SRS-12         |
| 5   | FR-05 | Modal & Bottom Sheet      | `ConfirmModal` (judul, pesan, tombol konfirmasi/batal, varian bahaya) dan `BottomSheet` (Modal slide dari bawah, tutup saat tap latar)                                                                                     | SRS-11                 |
| 6   | FR-06 | Detail Sesi               | Header berisi praktikum, pertemuan, topik, kelas, tanggal, jam, ruang, asisten, dan status. Tombol info membuka Bottom Sheet catatan sesi. Panel bawah menyesuaikan peran aktif                                            | SRS-03, SRS-11         |
| 7   | FR-07 | Jadwal Asisten            | `FlatList` sesi milik asisten aktif, urut tanggal, dengan chip filter status (Semua/Dibuka/Belum Dibuka/Ditutup) dan empty state                                                                                           | SRS-02, SRS-12         |
| 8   | FR-08 | Buka & Tutup Sesi         | Tombol Buka Sesi (hanya saat belum dibuka) dan Tutup Sesi (hanya saat dibuka) lewat `ConfirmModal`. Setelah dibuka tampil jam buka + kode presensi, setelah ditutup tampil jam tutup tanpa tombol aksi                     | SRS-04, SRS-05, SRS-06 |
| 9   | FR-09 | Rekap Kehadiran           | Counter "x / y praktikan hadir" dan daftar hadir (nama, NIM, jam) urut paling awal. Empty state bila belum ada yang presensi                                                                                               | SRS-09, SRS-12         |
| 10  | FR-10 | Jadwal Praktikan          | `FlatList` sesi sesuai kelas praktikan aktif, kartu bertanda "Hadir" bila sudah presensi, dan empty state                                                                                                                  | SRS-02, SRS-06, SRS-12 |
| 11  | FR-11 | Form Presensi             | Sesi belum dibuka: info + tombol nonaktif. Sesi dibuka: input kode presensi dengan pesan error bila kosong/salah, konfirmasi lewat `ConfirmModal`, lalu Bottom Sheet sukses berisi jam tercatat                            | SRS-07, SRS-11, SRS-12 |
| 12  | FR-12 | Anti Presensi Ganda       | Fungsi `presensi()` menolak bila sesi tidak dibuka, kode salah, atau praktikan sudah tercatat. UI mengganti form dengan kartu "Presensi tercatat pukul HH:MM:SS"                                                           | SRS-08, SRS-12         |
| 13  | FR-13 | Riwayat Kehadiran         | Ringkasan "Hadir x dari y sesi" dan daftar sesi dengan status Hadir (jam) / Tidak Hadir / Menunggu                                                                                                                         | SRS-10, SRS-12         |
| 14  | FR-14 | Profil & Ganti Peran      | Info nama, NIM, peran, kelas, dan tombol Ganti Peran yang memanggil `logout()` lalu kembali ke halaman awal                                                                                                                | SRS-01                 |

## 3. Pembagian Tugas Programmer

## Sprint 1

| Programmer       | Fitur (Ref FR)                                             | Branch                                         | Folder/Modul                                                                                                                                           | Catatan Dependency                                                                                                                                            |
| ---------------- | ---------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Abhista** (PM) | -                                                          | Merge branch lain                              | Repo, collaborator, proteksi branch `main`, `README.md`                                                                                                | -                                                                                                                                                             |
| **Rafif**        | FR-01, FR-02, FR-03, FR-06 (header), FR-12 (logika), FR-14 | `feature/fondasi`, lalu `feature/pilih-peran`  | `src/types.ts`, `src/data/`, `src/context/`, `src/utils/`, `src/app/_layout.tsx`, `src/app/index.tsx`, `src/app/sesi/[id].tsx`, `src/app/*/profil.tsx` | Fondasi (tipe, data dummy, context, root layout, halaman placeholder) di-merge paling awal karena semua modul bergantung pada `usePraktikum()` dan `types.ts` |
| **Sofwan**       | FR-05, FR-07, FR-08, FR-09                                 | `feature/modal`, lalu `feature/asisten`        | `src/components/confirm-modal.tsx`, `bottom-sheet.tsx`, `src/app/asisten/`, `src/components/asisten-panel.tsx`                                         | `ConfirmModal` dan `BottomSheet` di-merge lebih dulu karena dipakai Naufal. Butuh `SesiCard` dari Naufal                                                      |
| **Naufal**       | FR-04, FR-10, FR-11, FR-12 (UI), FR-13                     | `feature/kartu-sesi`, lalu `feature/praktikan` | `src/components/sesi-card.tsx`, `status-badge.tsx`, `empty-state.tsx`, `src/app/praktikan/`, `src/components/praktikan-panel.tsx`                      | `SesiCard`, `StatusBadge`, dan `EmptyState` di-merge lebih dulu karena dipakai Sofwan. Butuh `ConfirmModal` dan `BottomSheet` dari Sofwan                     |

## 4. Akun Dummy

| Peran     | Nama                                                      | Keterangan                       |
| --------- | --------------------------------------------------------- | -------------------------------- |
| Asisten   | Dimas Pratama                                             | Pemrograman Mobile kelas A dan B |
| Asisten   | Sari Wulandari                                            | Basis Data kelas A               |
| Asisten   | Rina Kusuma                                               | Tanpa jadwal (uji empty state)   |
| Praktikan | Andi Saputra, Budi Santoso, Citra Lestari, Dewi Anggraini | Kelas A                          |
| Praktikan | Eko Nugroho, Fajar Ramadhan, Gita Permata                 | Kelas B                          |

## 5. Setup Proyek (Programmer, Setelah Clone)

Prasyarat: **Node.js 20 atau lebih baru** dan aplikasi **Expo Go** di HP (atau emulator Android).

```bash
git clone https://github.com/Namiemi/Praktikum_PPK_ManajemenPraktikum.git
cd Praktikum_PPK_ManajemenPraktikum
npm install
npx expo start
```

Scan QR code di terminal memakai Expo Go. HP dan laptop harus berada di jaringan Wi-Fi yang sama. Buat branch sendiri sebelum mulai ngoding:

```bash
git switch -c feature/nama-fitur
git push -u origin feature/nama-fitur
```

Sebelum push, pastikan tidak ada error:

```bash
npx tsc --noEmit
npx expo lint
```

Untuk menambah paket, gunakan `npx expo install <paket>`, bukan `npm install <paket>`, supaya versinya cocok dengan SDK 58.

## 6. Aturan Git & Commit

- Jangan pernah coding langsung di branch `main`.
- Format commit: `<type>(<scope>): <deskripsi singkat>` diikuti body opsional.
  - Contoh: `feat(asisten): tambah tombol buka sesi dengan modal konfirmasi`
- Type yang dipakai: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.
- Scope yang dipakai: `fondasi`, `pilih-peran`, `komponen`, `asisten`, `praktikan`, `docs`.
- Tidak ada co-author pada commit.
- Sertakan screenshot setiap kondisi tampilan (kosong, normal, sukses) di deskripsi Pull Request.
- Merge ke `main` hanya dilakukan oleh PM setelah branch fitur direview.
