# Sprint 2 — Firebase Auth, Cloud Firestore, Pengajuan Izin & AI

> [← Sprint 1](./sprint-1.md) · [README Utama](../../README.md) · [Sprint 3 →](./sprint-3.md)

## Deskripsi Singkat

Pengguna registrasi dengan memilih peran (**praktikan**/**asisten**), lalu login. Asisten mengelola kelas, jadwal, dan sesi (CRUD), membuka sesi, memantau rekap kehadiran secara real-time, menutup sesi, dan memeriksa pengajuan izin. Praktikan melihat jadwal kelasnya, melakukan presensi saat sesi dibuka (satu kali per sesi), mengajukan izin berisi alasan, dan memantau status izinnya. Alasan izin dikirim ke model AI dari pengajar (berjalan di perangkat) untuk diprediksi kategorinya; hasilnya disimpan bersama pengajuan dan ditampilkan ke asisten. Semua data tersimpan di Firestore dan dibatasi oleh Security Rules sesuai peran.

**Aturan utama:** presensi hanya sah saat sesi Dibuka dengan kode yang benar, satu praktikan hanya satu presensi per sesi, dan hasil AI tidak pernah menerima atau menolak izin secara otomatis.

**Dua alur demo Sprint 2:**

1. Asisten login → buka sesi → praktikan login dan presensi → asisten melihat rekap real-time → asisten menutup sesi.
2. Praktikan login → ajukan izin → AI mengklasifikasikan alasan → asisten memeriksa dan memutuskan → praktikan melihat status izin.

---

## 1. Software Requirement Specification (SRS)

| No  | Kode   | Deskripsi Requirement                                                                                                                               | Aktor              | Prioritas |
| --- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | --------- |
| 14  | SRS-14 | Pengguna dapat registrasi, login, dan logout menggunakan Firebase Authentication                                                                    | Asisten, Praktikan | Tinggi    |
| 15  | SRS-15 | Setiap akun memiliki identitas (nama, NIM, email) dan peran (asisten/praktikan); antarmuka dan tindakan menyesuaikan peran                          | Asisten, Praktikan | Tinggi    |
| 16  | SRS-16 | Sesi login tetap tersimpan setelah aplikasi ditutup; pengguna yang belum login diarahkan ke halaman login                                           | Asisten, Praktikan | Tinggi    |
| 17  | SRS-17 | Data kelas, peserta, jadwal, dan sesi disimpan di Cloud Firestore                                                                                   | Sistem             | Tinggi    |
| 18  | SRS-18 | Asisten dapat menambah, melihat, mengubah, dan menghapus (CRUD) data kelas, peserta kelas, dan sesi/jadwal praktikum                                | Asisten            | Tinggi    |
| 19  | SRS-19 | Praktikan hanya dapat melihat jadwal dan informasi sesi dari kelas yang diikutinya                                                                  | Praktikan          | Tinggi    |
| 20  | SRS-20 | Asisten dapat membuka dan menutup sesi; status sesi tersimpan di Firestore                                                                          | Asisten            | Tinggi    |
| 21  | SRS-21 | Praktikan dapat presensi saat sesi dibuka dengan kode presensi; data kehadiran tersimpan berdasarkan identitas praktikan dan sesi                   | Praktikan          | Tinggi    |
| 22  | SRS-22 | Praktikan tidak dapat presensi lebih dari satu kali pada sesi yang sama (dijaga di aplikasi **dan** Security Rules)                                 | Praktikan          | Tinggi    |
| 23  | SRS-23 | Perubahan status sesi, presensi, dan rekap kehadiran tampil real-time pada pengguna terkait tanpa restart aplikasi                                  | Asisten, Praktikan | Tinggi    |
| 24  | SRS-24 | Data tetap tersedia setelah aplikasi ditutup dan dibuka kembali                                                                                     | Sistem             | Tinggi    |
| 25  | SRS-25 | Praktikan dapat mengajukan izin untuk sesi tertentu dengan mengisi alasan; pengajuan tersimpan di Firestore dengan status yang dapat dipantau       | Praktikan          | Tinggi    |
| 26  | SRS-26 | Alasan izin dianalisis model AI dari pengajar (berjalan di perangkat) untuk mendapat label klasifikasi; hasilnya ditampilkan dan disimpan bersama pengajuan | Sistem      | Tinggi    |
| 27  | SRS-27 | Model AI tidak menentukan diterima/ditolaknya izin; status awal selalu "Menunggu"                                                                   | Sistem             | Tinggi    |
| 28  | SRS-28 | Asisten dapat melihat daftar pengajuan izin beserta alasan dan hasil klasifikasi, lalu menerima atau menolak                                        | Asisten            | Tinggi    |
| 29  | SRS-29 | Keputusan izin tersimpan di Firestore dan terlihat oleh praktikan yang mengajukan                                                                   | Asisten, Praktikan | Tinggi    |
| 30  | SRS-30 | Aplikasi memvalidasi input (email, password, NIM, alasan izin, kode presensi) dan menampilkan pesan error yang jelas                                | Asisten, Praktikan | Tinggi    |
| 31  | SRS-31 | Aplikasi menangani kegagalan autentikasi, kesalahan Firestore, dan alasan yang tidak dapat dikenali model AI (pengajuan izin tetap tersimpan tanpa klasifikasi) | Sistem | Tinggi    |
| 32  | SRS-32 | Akses dan perubahan data dibatasi sesuai identitas dan peran melalui Firebase Security Rules                                                        | Sistem             | Tinggi    |
| 33  | SRS-33 | Aplikasi menampilkan kondisi khusus: belum login, loading, data kosong, koneksi terganggu, AI tidak merespons, presensi sudah tercatat               | Asisten, Praktikan | Sedang    |

---

## 2. Functional Requirement

| No  | Kode  | Nama Fitur                         | Deskripsi Fungsional                                                                                                                                                                                                                              | Ref SRS                                |
| --- | ----- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| 15  | FR-15 | Konfigurasi Firebase               | `app.json` memuat `android.package` (sama dengan yang didaftarkan di Firebase), `android.googleServicesFile`, dan plugin `@react-native-firebase/app`. `src/lib/firebase.ts` mengekspor `auth` dan `db` (API modular). `google-services.json` masuk `.gitignore` dan tidak di-commit | SRS-16, SRS-17, SRS-24                 |
| 16  | FR-16 | Autentikasi & Profil               | Registrasi (nama, NIM, email, password, konfirmasi password, pilihan peran) membuat akun Auth lalu dokumen `users/{uid}`; peran asisten hanya diterima bila email terdaftar di whitelist (dicek di Security Rules). Login dengan pesan error ramah (`auth/invalid-credential`, `auth/network-request-failed`, dll) dan logout lewat `signOut()`. `AuthProvider` (`onAuthStateChanged`) mengarahkan ke login bila belum login, atau ke Tabs sesuai peran. Layar Profil menampilkan nama, NIM, email, peran, kelas, dan tombol Keluar | SRS-14, SRS-15, SRS-16, SRS-30, SRS-33 |
| 17  | FR-17 | Service Layer & State Real-time    | `src/services/` berisi fungsi CRUD dan listener per koleksi (`kelas`, `sesi`, `presensi`, `izin`); UI tidak memanggil Firestore langsung. `PraktikumProvider` berlangganan `onSnapshot` sesuai peran (asisten: sesi miliknya; praktikan: sesi kelasnya) dan menyediakan `data`, `loading`, `error`, serta aksi (`bukaSesi`, `tutupSesi`, `presensi`, `ajukanIzin`, `putuskanIzin`). Listener di-unsubscribe saat unmount/logout | SRS-17, SRS-23, SRS-24, SRS-33         |
| 18  | FR-18 | Komponen Bersama Baru              | `LoadingState`, `ErrorState` (dengan tombol coba lagi), `FormField` (label, input, pesan error), `Toast`/banner offline. Komponen Sprint 1 (`SesiCard`, `StatusBadge`, `EmptyState`, `ConfirmModal`, `BottomSheet`) dipakai ulang                 | SRS-30, SRS-33                         |
| 19  | FR-19 | Validasi & Penanganan Error        | Utilitas validasi (`src/utils/validation.ts`) dan pemetaan kode error Firebase ke pesan Bahasa Indonesia (`src/utils/errors.ts`). Semua operasi tulis memakai `try/catch` dan menampilkan umpan balik                                            | SRS-30, SRS-31                         |
| 20  | FR-20 | Firebase Security Rules            | `firestore.rules` membatasi baca/tulis per koleksi sesuai peran & kepemilikan. Diuji dengan Rules Playground/emulator sebelum di-deploy                                                                                                          | SRS-32                                 |
| 21  | FR-21 | Kelola Kelas, Jadwal & Sesi (CRUD) | Asisten menambah/mengubah/menghapus kelas dan mengatur peserta kelas (pilih dari praktikan terdaftar, cari nama/NIM). Form tambah/ubah sesi (praktikum, pertemuan, topik, kelas, tanggal, jam, ruang, catatan) dengan validasi, daftar sesi `FlatList` real-time dengan filter status. Hapus lewat `ConfirmModal` varian bahaya (menghapus sesi juga menghapus presensinya) | SRS-17, SRS-18, SRS-33                 |
| 22  | FR-22 | Buka & Tutup Sesi                  | Tombol Buka Sesi membuat kode presensi 4 digit, mengisi `dibukaPada`, status `dibuka`. Tutup Sesi mengisi `ditutupPada`, status `ditutup`. Perubahan langsung tampil di sisi praktikan lewat listener                                            | SRS-20, SRS-23                         |
| 23  | FR-23 | Rekap Kehadiran Real-time          | Listener `sesi/{id}/presensi`: counter "x / y hadir", daftar hadir (nama, NIM, jam) urut paling awal, bertambah otomatis saat praktikan presensi. Sertakan daftar yang berstatus izin diterima                                                   | SRS-23, SRS-33                         |
| 24  | FR-24 | Pemeriksaan Izin Asisten           | Daftar pengajuan untuk sesi milik asisten (filter status), menampilkan nama, NIM, sesi, alasan, dan kategori AI. Tombol Terima/Tolak lewat `ConfirmModal` (opsional catatan). Keputusan disimpan beserta `diputuskanOleh` dan waktu             | SRS-28, SRS-29                         |
| 25  | FR-25 | Jadwal & Detail Sesi Praktikan     | Daftar sesi dari kelas praktikan (real-time), kartu bertanda Hadir/Izin bila sudah tercatat. Detail sesi menyesuaikan peran dan status                                                                                                           | SRS-19, SRS-23, SRS-33                 |
| 26  | FR-26 | Presensi & Anti Presensi Ganda     | Input kode presensi dengan validasi (kosong/salah), konfirmasi `ConfirmModal`, lalu tulis ke `sesi/{sesiId}/presensi/{uid}` dengan `serverTimestamp()`; Bottom Sheet sukses memuat jam tercatat. Dokumen memakai `uid` sebagai ID sehingga satu praktikan hanya punya satu dokumen per sesi; `presensi()` mengecek dokumen yang sudah ada dan Security Rules menolak `create` ganda. UI mengganti form dengan kartu "Presensi tercatat" | SRS-21, SRS-22, SRS-30                 |
| 27  | FR-27 | Riwayat Kehadiran                  | Ringkasan "Hadir x dari y sesi" dan daftar sesi dengan status Hadir (jam) / Izin / Tidak Hadir / Menunggu, dari data Firestore                                                                                                                   | SRS-21, SRS-25                         |
| 28  | FR-28 | Pengajuan Izin & Status            | Praktikan memilih sesi (belum ditutup dan belum presensi) dan mengisi alasan (min. 10, maks. 300 karakter); satu pengajuan per sesi, konfirmasi lewat `ConfirmModal`, status awal `menunggu`. Daftar pengajuan milik praktikan (real-time) dengan badge Menunggu (abu) / Diterima (hijau) / Ditolak (merah) dan catatan asisten bila ada | SRS-25, SRS-27, SRS-29, SRS-30         |
| 29  | FR-29 | Integrasi AI                       | `sentiment.js` dan `model-edom.json` dari pengajar disalin ke `src/lib/ai/`. `src/services/ai.ts` membungkus `createSentimentClassifier(model)` dan mengembalikan `{label, skor}`; prediksi berjalan di perangkat tanpa internet. Hasilnya (`kategoriAI`, `skorAI`, `statusAI`) disimpan bersama dokumen izin dan ditampilkan sebagai chip informasi ke praktikan dan asisten. Jika alasan kosong atau tidak dikenali (`label: null`), pengajuan tetap tersimpan dengan `statusAI: "tidak_dikenali"` dan UI menampilkan "Klasifikasi tidak tersedia". Hasil AI tidak pernah mengubah status izin | SRS-26, SRS-27, SRS-31                 |

---

## 3. Pembagian Tugas Programmer

| Programmer   | Fitur (Ref FR)                             | Branch                                                              | Folder/Modul                                                                                                                                                                  | Catatan Dependency                                                                                                                                                                          |
| ------------ | ------------------------------------------ | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Akbar** (PM) | -                                        | Merge branch lain                                                   | Project Firebase, pendaftaran Android app & unduh `google-services.json`, whitelist asisten, deploy `firestore.rules`, `README.md`                                             | Membagikan `google-services.json` ke tim (lewat chat pribadi) sebelum sprint dimulai                                                                                                        |
| **Rafif**    | FR-15, FR-16, FR-17, FR-18, FR-19, FR-20   | `feature/fondasi-firebase`, lalu `feature/auth`, `feature/keamanan` | `app.json`, `.gitignore`, `src/lib/firebase.ts`, `src/services/`, `src/context/`, `src/types.ts`, `src/utils/validation.ts`, `errors.ts`, `src/components/` (`loading-state`, `error-state`, `form-field`), `src/app/_layout.tsx`, `src/app/(auth)/`, `firestore.rules`, `src/app/*/profil.tsx` | **Di-merge paling awal.** Rafif juga memastikan development build bisa dijalankan semua anggota. Semua modul bergantung pada `services/`, `usePraktikum()`, tipe, dan komponen bersama. Hapus `src/data/dummy.ts` setelah semua modul pindah ke Firestore |
| **Sofwan**   | FR-21, FR-22, FR-23, FR-24                 | `feature/asisten-crud`, lalu `feature/asisten-izin`                 | `src/app/asisten/` (kelas, jadwal, form sesi, rekap, izin), `src/components/asisten-panel.tsx`, `kelas-form.tsx`, `sesi-form.tsx`, `izin-review-card.tsx`                      | Butuh `services/` dan `FormField` dari Rafif. Hasil FR-22 (status sesi) dibutuhkan Abhista untuk uji presensi. FR-24 butuh data izin dari Abhista, bisa diuji dengan dokumen manual di Console |
| **Abhista**  | FR-25, FR-26, FR-27, FR-28, FR-29          | `feature/presensi`, lalu `feature/izin`                             | `src/app/praktikan/` (jadwal, riwayat, izin), `src/components/praktikan-panel.tsx`, `presensi-form.tsx`, `izin-form.tsx`, `izin-card.tsx`, `sesi/[id].tsx` (panel praktikan), `src/services/ai.ts` | Butuh `services/` dan komponen bersama dari Rafif, serta sesi berstatus dibuka dari Sofwan untuk uji presensi. `sentiment.js` dan `model-edom.json` dari pengajar disalin ke `src/lib/ai/`; model berjalan di perangkat, jadi tidak butuh API atau koneksi internet |

### Urutan Merge (Sprint 2)

1. `feature/fondasi-firebase` (Rafif): config, tipe, service, context, komponen bersama
2. `feature/auth` (Rafif): registrasi, login, route guard
3. `feature/asisten-crud` (Sofwan) dan `feature/presensi` (Abhista), paralel
4. `feature/izin` (Abhista) dan `feature/asisten-izin` (Sofwan), paralel
5. `feature/keamanan` (Rafif): finalisasi Security Rules, lalu seluruh alur diuji ulang

---

## 4. Struktur Data Firestore (Sprint 2)

| Koleksi                        | Isi                                                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `users/{uid}`                  | nama, NIM, email, peran (asisten/praktikan), kelas                                                      |
| `asistenWhitelist/{email}`     | daftar email yang boleh mendaftar sebagai asisten (diisi lewat Firebase Console)                        |
| `kelas/{kelasId}`              | nama kelas, mataKuliah, asistenId, asistenNama, dibuatPada                                              |
| `sesi/{sesiId}`                | mataKuliah, pertemuan, topik, kelasId, kelas, tanggal, jamMulai, jamSelesai, ruang, status, dibukaPada, ditutupPada |
| `sesi/{sesiId}/rahasia/kode`   | kode presensi 4 digit, hanya bisa dibaca asisten pemilik sesi                                           |
| `sesi/{sesiId}/presensi/{uid}` | catatan hadir per praktikan (ID = uid), waktu server                                                    |
| `izin/{sesiId}_{uid}`          | alasan, kategori AI, status (menunggu/diterima/ditolak), catatan dan keputusan asisten                  |

---

## 5. Catatan Setup Sprint 2

Mulai Sprint 2 aplikasi memakai Firebase native (`@react-native-firebase/*`), sehingga **Expo Go tidak bisa dipakai lagi**. Aplikasi dijalankan lewat development build (`expo-dev-client`) di emulator atau HP Android (prasyarat: Android Studio + Android SDK + JDK 17).

1. Taruh `google-services.json` di folder paling luar proyek (minta ke PM, jangan di-commit).
2. Paket baru Sprint 2:

   ```bash
   npx expo install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore expo-dev-client
   ```

3. Build dan jalankan di Android:

   ```bash
   npx expo run:android
   ```
