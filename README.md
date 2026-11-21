# Manajemen Praktikum

Aplikasi mobile sederhana untuk mencatat kehadiran praktikum dari dua sudut pandang, yaitu **asisten** dan **praktikan**. Asisten melihat jadwal, membuka sesi saat praktikum dimulai, memantau kehadiran, lalu menutup sesi. Praktikan melihat jadwal dan detail sesi, melakukan presensi, serta melihat catatan kehadirannya sendiri.

README ini memuat dokumen **Sprint 1** (antarmuka dan alur dengan data dummy), **Sprint 2** (data dinamis dengan Firebase, pengajuan izin, dan integrasi AI), dan **Sprint 3** (validasi lokasi presensi, peta laboratorium interaktif, push notification, serta penyempurnaan filter dan validasi jadwal/akun). Kode SRS dan FR tiap sprint melanjutkan penomoran dari sprint sebelumnya.

## Daftar Isi

- [Tech Stack](#tech-stack)
- [Deskripsi Singkat](#deskripsi-singkat)
- [1. Software Requirement Specification (SRS)](#1-software-requirement-specification-srs)
- [2. Functional Requirement](#2-functional-requirement)
- [3. Pembagian Tugas Programmer](#3-pembagian-tugas-programmer)
- [4. Struktur Data Firestore (Sprint 2 & Sprint 3)](#4-struktur-data-firestore-sprint-2--sprint-3)
- [5. Akun Dummy & Akun Uji](#5-akun-dummy--akun-uji)
- [6. Setup Proyek (Programmer, Setelah Clone)](#6-setup-proyek-programmer-setelah-clone)
- [7. Aturan Git & Commit](#7-aturan-git--commit)

---

## Tech Stack

| Kebutuhan | Teknologi |
|---|---|
| Framework | React Native dengan [Expo](https://expo.dev) SDK 58 |
| Bahasa | TypeScript |
| Navigasi | [Expo Router](https://docs.expo.dev/router/introduction) (file-based routing, Stack dan Tabs) |
| Autentikasi | [Firebase Authentication](https://firebase.google.com/docs/auth) email & password (Sprint 2) |
| Database | [Cloud Firestore](https://firebase.google.com/docs/firestore) dengan real-time listener `onSnapshot` (Sprint 2); Sprint 1 memakai data dummy lokal |
| Integrasi Firebase | [React Native Firebase](https://rnfirebase.io) (`app`, `auth`, `firestore`, `messaging`) dengan API modular, memakai `google-services.json` dari Android app di Firebase |
| Keamanan data | Firebase Security Rules (`firestore.rules`) |
| State | React Context dan `useState` |
| Tata letak | Flexbox (`StyleSheet`) |
| Interaksi | `TextInput`, `Pressable`, `FlatList`, dan `Modal` (juga dipakai sebagai Bottom Sheet) |
| Klasifikasi izin | Model AI dari pengajar (`sentiment.js` + `model-edom.json`), berjalan langsung di perangkat tanpa internet |
| Peta & Geolocation | [`react-native-maps`](https://github.com/react-native-maps/react-native-maps) (Google Maps) dan [`expo-location`](https://docs.expo.dev/versions/latest/sdk/location/) (Sprint 3) |
| Push Notification | [`@react-native-firebase/messaging`](https://rnfirebase.io/messaging/usage) (FCM) dan [`@notifee/react-native`](https://notifee.app/) dengan sinkronisasi event Firestore (Sprint 3) |
| Menjalankan aplikasi | Expo Go (Sprint 1); development build dengan `expo-dev-client` (Sprint 2 & Sprint 3) |

---

## Deskripsi Singkat

### Sprint 1

Pengguna memilih peran (asisten/praktikan) dan identitasnya dari daftar dummy di halaman awal. Asisten membuka sesi, lalu sistem membuat kode presensi 4 digit. Praktikan memasukkan kode tersebut untuk presensi, sistem mencatat waktunya, dan praktikan tidak bisa presensi dua kali di sesi yang sama. Asisten dapat melihat rekap daftar hadir beserta waktunya, lalu menutup sesi. Semua perubahan disimpan di state selama aplikasi berjalan dan kembali ke data awal saat aplikasi dimuat ulang.

### Sprint 2

Pengguna registrasi dengan memilih peran (praktikan/asisten), lalu login. Asisten mengelola kelas, jadwal, dan sesi (CRUD), membuka sesi, memantau rekap kehadiran secara real-time, menutup sesi, dan memeriksa pengajuan izin. Praktikan melihat jadwal kelasnya, melakukan presensi saat sesi dibuka (satu kali per sesi), mengajukan izin berisi alasan, dan memantau status izinnya. Alasan izin dikirim ke API AI untuk diprediksi kategorinya; hasilnya disimpan bersama pengajuan dan ditampilkan ke asisten. Semua data tersimpan di Firestore dan dibatasi oleh Security Rules sesuai peran.

**Aturan utama:** presensi hanya sah saat sesi Dibuka dengan kode yang benar, satu praktikan hanya satu presensi per sesi, dan hasil AI tidak pernah menerima atau menolak izin secara otomatis.

**Dua alur demo Sprint 2:**

1. Asisten login → buka sesi → praktikan login dan presensi → asisten melihat rekap real-time → asisten menutup sesi.
2. Praktikan login → ajukan izin → AI mengklasifikasikan alasan → asisten memeriksa dan memutuskan → praktikan melihat status izin.

### Sprint 3

Pada Sprint 3, aplikasi dikembangkan dengan memanfaatkan lokasi perangkat, Maps, dan push notification, serta menambahkan penyempurnaan dari evaluasi sebelumnya (pembatasan akun registrasi NIM 14 digit angka, password 6–8 karakter, email `@`; pencarian dan filter jadwal asisten/praktikan berdasarkan mata kuliah, tanggal, jam, dan ruangan; serta pembatasan bahwa sesi praktikum hanya dapat dibuka pada tanggal dan rentang jadwal praktikum yang sudah ditentukan).

Asisten mengelola informasi lokasi laboratorium Informatika (koordinat dan radius presensi) yang disimpan di Firestore. Praktikan melakukan presensi melalui **halaman khusus presensi** yang terpisah dari halaman detail sesi; aplikasi memeriksa jarak posisi perangkat terhadap titik koordinat dan radius laboratorium terkait, sehingga presensi hanya berhasil dicatat apabila sesi sedang dibuka, kode benar, belum pernah presensi pada sesi tersebut, dan praktikan berada di dalam radius yang diizinkan. Halaman **Maps interaktif** menampilkan marker posisi pengguna secara real-time beserta marker seluruh laboratorium Informatika; saat marker laboratorium dipilih, aplikasi menampilkan praktikum yang sedang berlangsung dan praktikum berikutnya berdasarkan data jadwal dan sesi di Firestore. Sistem juga mengirimkan **push notification** kepada pengguna terkait saat sesi dibuka, jadwal berubah, atau pengajuan izin diputuskan, serta menangani kondisi izin akses lokasi/notifikasi dan gangguan perangkat secara jelas.

**Tiga alur demo Sprint 3:**

1. **Presensi berbasis lokasi:** asisten membuka sesi (pada rentang jadwal) → praktikan membuka halaman presensi → aplikasi memeriksa lokasi perangkat dan radius laboratorium → presensi berhasil dicatat apabila memenuhi ketentuan → asisten melihat rekap kehadiran.
2. **Peta dan informasi laboratorium:** pengguna membuka halaman Maps → aplikasi menampilkan posisi pengguna dan marker laboratorium → pengguna memilih laboratorium → aplikasi menampilkan praktikum yang sedang berlangsung dan praktikum berikutnya berdasarkan data Firestore.
3. **Notifikasi kegiatan:** asisten membuka sesi, mengubah jadwal, atau memberikan keputusan izin → sistem mengirimkan push notification → pengguna terkait menerima pemberitahuan mengenai perubahan tersebut.

---

## 1. Software Requirement Specification (SRS)

### Sprint 1

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

### Sprint 2

| No  | Kode   | Deskripsi Requirement                                                                                                                              | Aktor              | Prioritas |
| --- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | --------- |
| 14  | SRS-14 | Pengguna dapat registrasi, login, dan logout menggunakan Firebase Authentication                                                                   | Asisten, Praktikan | Tinggi    |
| 15  | SRS-15 | Setiap akun memiliki identitas (nama, NIM, email) dan peran (asisten/praktikan); antarmuka dan tindakan menyesuaikan peran                         | Asisten, Praktikan | Tinggi    |
| 16  | SRS-16 | Sesi login tetap tersimpan setelah aplikasi ditutup; pengguna yang belum login diarahkan ke halaman login                                          | Asisten, Praktikan | Tinggi    |
| 17  | SRS-17 | Data kelas, peserta, jadwal, dan sesi disimpan di Cloud Firestore                                                                                  | Sistem             | Tinggi    |
| 18  | SRS-18 | Asisten dapat menambah, melihat, mengubah, dan menghapus (CRUD) data kelas, peserta kelas, dan sesi/jadwal praktikum                               | Asisten            | Tinggi    |
| 19  | SRS-19 | Praktikan hanya dapat melihat jadwal dan informasi sesi dari kelas yang diikutinya                                                                 | Praktikan          | Tinggi    |
| 20  | SRS-20 | Asisten dapat membuka dan menutup sesi; status sesi tersimpan di Firestore                                                                         | Asisten            | Tinggi    |
| 21  | SRS-21 | Praktikan dapat presensi saat sesi dibuka dengan kode presensi; data kehadiran tersimpan berdasarkan identitas praktikan dan sesi                  | Praktikan          | Tinggi    |
| 22  | SRS-22 | Praktikan tidak dapat presensi lebih dari satu kali pada sesi yang sama (dijaga di aplikasi **dan** Security Rules)                                | Praktikan          | Tinggi    |
| 23  | SRS-23 | Perubahan status sesi, presensi, dan rekap kehadiran tampil real-time pada pengguna terkait tanpa restart aplikasi                                 | Asisten, Praktikan | Tinggi    |
| 24  | SRS-24 | Data tetap tersedia setelah aplikasi ditutup dan dibuka kembali                                                                                    | Sistem             | Tinggi    |
| 25  | SRS-25 | Praktikan dapat mengajukan izin untuk sesi tertentu dengan mengisi alasan; pengajuan tersimpan di Firestore dengan status yang dapat dipantau      | Praktikan          | Tinggi    |
| 26  | SRS-26 | Alasan izin dianalisis model AI dari pengajar (berjalan di perangkat) untuk mendapat label klasifikasi; hasilnya ditampilkan dan disimpan bersama pengajuan| Sistem             | Tinggi    |
| 27  | SRS-27 | Model AI tidak menentukan diterima/ditolaknya izin; status awal selalu "Menunggu"                                                                  | Sistem             | Tinggi    |
| 28  | SRS-28 | Asisten dapat melihat daftar pengajuan izin beserta alasan dan hasil klasifikasi, lalu menerima atau menolak                                       | Asisten            | Tinggi    |
| 29  | SRS-29 | Keputusan izin tersimpan di Firestore dan terlihat oleh praktikan yang mengajukan                                                                  | Asisten, Praktikan | Tinggi    |
| 30  | SRS-30 | Aplikasi memvalidasi input (email, password, NIM, alasan izin, kode presensi) dan menampilkan pesan error yang jelas                               | Asisten, Praktikan | Tinggi    |
| 31  | SRS-31 | Aplikasi menangani kegagalan autentikasi, kesalahan Firestore, dan alasan yang tidak dapat dikenali model AI (pengajuan izin tetap tersimpan tanpa klasifikasi)| Sistem             | Tinggi    |
| 32  | SRS-32 | Akses dan perubahan data dibatasi sesuai identitas dan peran melalui Firebase Security Rules                                                       | Sistem             | Tinggi    |
| 33  | SRS-33 | Aplikasi menampilkan kondisi khusus: belum login, loading, data kosong, koneksi terganggu, AI tidak merespons, presensi sudah tercatat              | Asisten, Praktikan | Sedang    |

### Sprint 3

| No  | Kode   | Deskripsi Requirement                                                                                                                                                                     | Aktor              | Prioritas |
| --- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | --------- |
| 34  | SRS-34 | Sistem memvalidasi registrasi akun dengan ketentuan NIM tepat 14 digit angka, password 6–8 karakter, dan email memuat `@`                                                                 | Asisten, Praktikan | Tinggi    |
| 35  | SRS-35 | Asisten dan praktikan dapat mencari serta memfilter daftar jadwal sesi berdasarkan mata kuliah, tanggal, jam, ruangan, atau status sesi                                                   | Asisten, Praktikan | Tinggi    |
| 36  | SRS-36 | Asisten hanya dapat membuka sesi praktikum ketika waktu saat ini berada pada tanggal dan rentang jam pelaksanaan (`jamMulai`–`jamSelesai`) sesi tersebut                                  | Asisten            | Tinggi    |
| 37  | SRS-37 | Praktikan melakukan presensi melalui halaman khusus presensi yang terpisah dari halaman detail sesi, memuat informasi sesi, status sesi, dan hasil pemeriksaan lokasi                     | Praktikan          | Tinggi    |
| 38  | SRS-38 | Aplikasi memeriksa lokasi perangkat praktikan terhadap koordinat dan radius laboratorium; presensi hanya dapat dilakukan jika sesi sedang dibuka dan praktikan berada dalam radius izinan | Praktikan          | Tinggi    |
| 39  | SRS-39 | Validasi lokasi menjadi bagian dari proses pencatatan kehadiran ke Firestore (menyimpan koordinat dan jarak saat presensi) serta tetap menolak presensi ganda pada sesi yang sama         | Sistem             | Tinggi    |
| 40  | SRS-40 | Asisten dapat menambah, melihat, mengubah, dan menghapus (CRUD) data lokasi laboratorium beserta koordinat dan radius presensi di Cloud Firestore                                         | Asisten            | Tinggi    |
| 41  | SRS-41 | Setiap sesi praktikum mengacu pada data laboratorium di Firestore untuk informasi ruangan, titik koordinat, dan radius validasi presensi                                                  | Asisten, Sistem    | Tinggi    |
| 42  | SRS-42 | Aplikasi menyediakan halaman Maps interaktif yang menampilkan marker lokasi laboratorium Informatika serta marker posisi pengguna yang diperbarui mengikuti perubahan lokasi perangkat    | Asisten, Praktikan | Tinggi    |
| 43  | SRS-43 | Pengguna dapat memilih marker laboratorium pada peta untuk melihat informasi laboratorium beserta praktikum yang sedang berlangsung dan praktikum berikutnya secara real-time             | Asisten, Praktikan | Tinggi    |
| 44  | SRS-44 | Sistem mengirimkan push notification kepada praktikan kelas terkait ketika asisten membuka sesi praktikum                                                                                 | Sistem, Praktikan  | Tinggi    |
| 45  | SRS-45 | Sistem mengirimkan push notification kepada praktikan kelas terkait ketika jadwal atau informasi waktu/ruang sesi mengalami perubahan                                                     | Sistem, Praktikan  | Tinggi    |
| 46  | SRS-46 | Sistem mengirimkan push notification kepada praktikan pengaju ketika pengajuan izinnya diterima atau ditolak oleh asisten                                                                 | Sistem, Praktikan  | Tinggi    |
| 47  | SRS-47 | Aplikasi meminta izin akses lokasi dan push notification kepada pengguna sesuai kebutuhan fitur                                                                                           | Sistem             | Tinggi    |
| 48  | SRS-48 | Aplikasi menampilkan informasi yang jelas ketika pengguna menolak izin akses, layanan lokasi (GPS) tidak aktif, lokasi belum tersedia, di luar radius, koneksi terganggu, atau notifikasi gagal | Asisten, Praktikan | Tinggi    |

---

## 2. Functional Requirement

### Sprint 1

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

### Sprint 2

| No  | Kode  | Nama Fitur                       | Deskripsi Fungsional                                                                                                                                                                                                                            | Ref SRS                        |
| --- | ----- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| 15  | FR-15 | Konfigurasi Firebase | `app.json` memuat `android.package` (sama dengan yang didaftarkan di Firebase), `android.googleServicesFile`, dan plugin `@react-native-firebase/app`. `src/lib/firebase.ts` mengekspor `auth` dan `db` (API modular). `google-services.json` masuk `.gitignore` dan tidak di-commit | SRS-16, SRS-17, SRS-24 |
| 16  | FR-16 | Autentikasi & Profil | Registrasi (nama, NIM, email, password, konfirmasi password, pilihan peran) membuat akun Auth lalu dokumen `users/{uid}`; peran asisten hanya diterima bila email terdaftar di whitelist (dicek di Security Rules). Login dengan pesan error ramah (`auth/invalid-credential`, `auth/network-request-failed`, dll) dan logout lewat `signOut()`. `AuthProvider` (`onAuthStateChanged`) mengarahkan ke login bila belum login, atau ke Tabs sesuai peran. Layar Profil menampilkan nama, NIM, email, peran, kelas, dan tombol Keluar | SRS-14, SRS-15, SRS-16, SRS-30, SRS-33 |
| 17  | FR-17 | Service Layer & State Real-time | `src/services/` berisi fungsi CRUD dan listener per koleksi (`kelas`, `sesi`, `presensi`, `izin`); UI tidak memanggil Firestore langsung. `PraktikumProvider` berlangganan `onSnapshot` sesuai peran (asisten: sesi miliknya; praktikan: sesi kelasnya) dan menyediakan `data`, `loading`, `error`, serta aksi (`bukaSesi`, `tutupSesi`, `presensi`, `ajukanIzin`, `putuskanIzin`). Listener di-unsubscribe saat unmount/logout | SRS-17, SRS-23, SRS-24, SRS-33 |
| 18  | FR-18 | Komponen Bersama Baru | `LoadingState`, `ErrorState` (dengan tombol coba lagi), `FormField` (label, input, pesan error), `Toast`/banner offline. Komponen Sprint 1 (`SesiCard`, `StatusBadge`, `EmptyState`, `ConfirmModal`, `BottomSheet`) dipakai ulang | SRS-30, SRS-33 |
| 19  | FR-19 | Validasi & Penanganan Error | Utilitas validasi (`src/utils/validation.ts`) dan pemetaan kode error Firebase ke pesan Bahasa Indonesia (`src/utils/errors.ts`). Semua operasi tulis memakai `try/catch` dan menampilkan umpan balik | SRS-30, SRS-31 |
| 20  | FR-20 | Firebase Security Rules | `firestore.rules` membatasi baca/tulis per koleksi sesuai peran & kepemilikan. Diuji dengan Rules Playground/emulator sebelum di-deploy | SRS-32 |
| 21  | FR-21 | Kelola Kelas, Jadwal & Sesi (CRUD) | Asisten menambah/mengubah/menghapus kelas dan mengatur peserta kelas (pilih dari praktikan terdaftar, cari nama/NIM). Form tambah/ubah sesi (praktikum, pertemuan, topik, kelas, tanggal, jam, ruang, catatan) dengan validasi, daftar sesi `FlatList` real-time dengan filter status. Hapus lewat `ConfirmModal` varian bahaya (menghapus sesi juga menghapus presensinya) | SRS-17, SRS-18, SRS-33 |
| 22  | FR-22 | Buka & Tutup Sesi | Tombol Buka Sesi membuat kode presensi 4 digit, mengisi `dibukaPada`, status `dibuka`. Tutup Sesi mengisi `ditutupPada`, status `ditutup`. Perubahan langsung tampil di sisi praktikan lewat listener | SRS-20, SRS-23 |
| 23  | FR-23 | Rekap Kehadiran Real-time | Listener `sesi/{id}/presensi`: counter "x / y hadir", daftar hadir (nama, NIM, jam) urut paling awal, bertambah otomatis saat praktikan presensi. Sertakan daftar yang berstatus izin diterima | SRS-23, SRS-33 |
| 24  | FR-24 | Pemeriksaan Izin Asisten | Daftar pengajuan untuk sesi milik asisten (filter status), menampilkan nama, NIM, sesi, alasan, dan kategori AI. Tombol Terima/Tolak lewat `ConfirmModal` (opsional catatan). Keputusan disimpan beserta `diputuskanOleh` dan waktu | SRS-28, SRS-29 |
| 25  | FR-25 | Jadwal & Detail Sesi Praktikan | Daftar sesi dari kelas praktikan (real-time), kartu bertanda Hadir/Izin bila sudah tercatat. Detail sesi menyesuaikan peran dan status | SRS-19, SRS-23, SRS-33 |
| 26  | FR-26 | Presensi & Anti Presensi Ganda | Input kode presensi dengan validasi (kosong/salah), konfirmasi `ConfirmModal`, lalu tulis ke `sesi/{sesiId}/presensi/{uid}` dengan `serverTimestamp()`; Bottom Sheet sukses memuat jam tercatat. Dokumen memakai `uid` sebagai ID sehingga satu praktikan hanya punya satu dokumen per sesi; `presensi()` mengecek dokumen yang sudah ada dan Security Rules menolak `create` ganda. UI mengganti form dengan kartu "Presensi tercatat" | SRS-21, SRS-22, SRS-30 |
| 27  | FR-27 | Riwayat Kehadiran | Ringkasan "Hadir x dari y sesi" dan daftar sesi dengan status Hadir (jam) / Izin / Tidak Hadir / Menunggu, dari data Firestore | SRS-21, SRS-25 |
| 28  | FR-28 | Pengajuan Izin & Status | Praktikan memilih sesi (belum ditutup dan belum presensi) dan mengisi alasan (min. 10, maks. 300 karakter); satu pengajuan per sesi, konfirmasi lewat `ConfirmModal`, status awal `menunggu`. Daftar pengajuan milik praktikan (real-time) dengan badge Menunggu (abu) / Diterima (hijau) / Ditolak (merah) dan catatan asisten bila ada | SRS-25, SRS-27, SRS-29, SRS-30 |
| 29  | FR-29 | Integrasi AI | `sentiment.js` dan `model-edom.json` dari pengajar disalin ke `src/lib/ai/`. `src/services/ai.ts` membungkus `createSentimentClassifier(model)` dan mengembalikan `{label, skor}`; prediksi berjalan di perangkat tanpa internet. Hasilnya (`kategoriAI`, `skorAI`, `statusAI`) disimpan bersama dokumen izin dan ditampilkan sebagai chip informasi ke praktikan dan asisten. Jika alasan kosong atau tidak dikenali (`label: null`), pengajuan tetap tersimpan dengan `statusAI: "tidak_dikenali"` dan UI menampilkan "Klasifikasi tidak tersedia". Hasil AI tidak pernah mengubah status izin | SRS-26, SRS-27, SRS-31 |

### Sprint 3

| No  | Kode  | Nama Fitur                                       | Deskripsi Fungsional                                                                                                                                                                                                                                                                                                                                                                         | Ref SRS                                        |
| --- | ----- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 30  | FR-30 | Konfigurasi Maps, Geolocation & Notifikasi       | Konfigurasi plugin `expo-location`, `react-native-maps` (Google Maps API Key di `app.json`), `@react-native-firebase/messaging`, dan `@notifee/react-native`, beserta permission Android (`ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`, `POST_NOTIFICATIONS`)                                                                                                                        | SRS-42, SRS-47                                 |
| 31  | FR-31 | Service Layer Lokasi, Laboratorium & Notifikasi  | `src/services/laboratorium.ts` (CRUD & listener koleksi `laboratorium`), `src/services/location.ts` (izin lokasi, `getCurrentPositionAsync`, `watchPositionAsync`, hitung jarak Haversine), dan `src/services/notification.ts` (izin FCM/Notifee, simpan token di `users/{uid}`, tulis & langganan koleksi `notifikasi`). `PraktikumProvider` menyediakan `laboratoriumList`, daftar seluruh sesi lintas kelas untuk kalkulasi aktivitas lab di peta, serta aksi `presensi` dengan parameter lokasi | SRS-38, SRS-40, SRS-43, SRS-44, SRS-45, SRS-46 |
| 32  | FR-32 | Revisi Validasi Akun & Rentang Waktu Buka Sesi   | `validateNim` memeriksa tepat 14 digit angka (`/^\d{14}$/`), `validatePassword` memeriksa panjang 6–8 karakter, dan `validateEmail` memeriksa `@`. Fungsi `validateWaktuBukaSesi(tanggal, jamMulai, jamSelesai)` menolak pembukaan sesi di luar tanggal atau di luar rentang `jamMulai`–`jamSelesai` baik di context maupun pada tombol Buka Sesi di `AsistenPanel`                          | SRS-34, SRS-36                                 |
| 33  | FR-33 | Penanganan Izin Perangkat & Kondisi Lokasi/Notif | Komponen banner/kartu status perangkat untuk menangani kondisi: izin lokasi/notifikasi ditolak (disertai tombol buka pengaturan perangkat), GPS tidak aktif, lokasi sedang dimuat/belum tersedia, praktikan berada di luar radius laboratorium, dan kegagalan penerimaan notifikasi                                                                                                           | SRS-47, SRS-48                                 |
| 34  | FR-34 | Pembaruan Firebase Security Rules (Sprint 3)     | `firestore.rules` diperbarui: validasi `nim.size() == 14` pada `users`, aturan baca seluruh pengguna login & tulis khusus asisten pada `laboratorium/{labId}`, validasi field `latitude`, `longitude`, `jarakMeter`, dan `dalamRadius == true` saat membuat `sesi/{sesiId}/presensi/{uid}`, serta aturan baca/tulis pada `notifikasi/{notifId}`                                           | SRS-34, SRS-38, SRS-39, SRS-40                 |
| 35  | FR-35 | Pengelolaan Lokasi Laboratorium (Asisten)        | Modal/halaman CRUD laboratorium bagi asisten untuk menambah/mengubah/menghapus laboratorium (`nama`, `lokasi`/`gedung`, `latitude`, `longitude`, `radius` meter) dengan bantuan pilih titik di peta atau lokasi perangkat saat ini. `SesiFormModal` memilih laboratorium dari daftar `laboratoriumList` dan menyimpan `labId` beserta `ruang`                                               | SRS-40, SRS-41                                 |
| 36  | FR-36 | Filter & Pencarian Jadwal (Asisten & Praktikan)  | Bar pencarian (`TextInput` mata kuliah, topik, ruangan) serta filter berdasarkan mata kuliah, tanggal, rentang jam, dan status sesi pada halaman Jadwal Asisten (`src/app/asisten/jadwal.tsx`) dan Jadwal Praktikan (`src/app/praktikan/jadwal.tsx`)                                                                                                                                         | SRS-35                                         |
| 37  | FR-37 | Halaman Khusus Presensi & Validasi Radius Lokasi | Halaman khusus `src/app/presensi/[sesiId].tsx` terpisah dari Detail Sesi (`sesi/[id].tsx` menampilkan tombol menuju halaman presensi). Menampilkan info sesi, status sesi, nama & radius laboratorium, jarak perangkat praktikan ke laboratorium secara real-time, hasil pemeriksaan lokasi (di dalam/luar radius atau lokasi gagal diperoleh), dan input kode presensi 4 digit. Pencatatan presensi memvalidasi sesi `DIBUKA`, kode benar, belum pernah presensi, dan jarak `<= radius` sebelum menyimpan ke Firestore | SRS-37, SRS-38, SRS-39, SRS-48                 |
| 38  | FR-38 | Peta Laboratorium Interaktif                     | Tab baru `Peta` pada navigasi Asisten (`src/app/asisten/peta.tsx`) dan Praktikan (`src/app/praktikan/peta.tsx`). Menampilkan komponen `MapView` dengan marker seluruh laboratorium Informatika, visualisasi lingkaran radius (`Circle`), dan marker lokasi pengguna yang diperbarui real-time selama halaman dibuka                                                                        | SRS-42, SRS-47, SRS-48                         |
| 39  | FR-39 | Informasi Aktivitas Laboratorium di Peta         | Memilih marker laboratorium pada peta membuka Bottom Sheet informasi laboratorium yang menampilkan detail lokasi, radius, praktikum yang **sedang berlangsung** (sesi berstatus `DIBUKA` atau jadwal aktif pada jam saat ini di lab tersebut), dan **praktikum berikutnya** (sesi terdekat berikutnya di lab tersebut) lengkap dengan nama praktikum, kelas, waktu pelaksanaan, dan `StatusBadge` secara real-time | SRS-43                                         |
| 40  | FR-40 | Push Notification Kegiatan Praktikum             | Saat asisten membuka sesi (`bukaSesi`), mengubah jadwal sesi (`ubahSesi`), atau memutuskan pengajuan izin (`putuskanIzin`), sistem membuat dokumen pemberitahuan di koleksi `notifikasi` yang ditujukan ke pengguna terkait (`kelasId` untuk buka sesi & ubah jadwal; `praktikanId` untuk keputusan izin). Listener aktif dan handler FCM/Notifee menampilkan push notification pada perangkat penerima | SRS-44, SRS-45, SRS-46, SRS-47, SRS-48         |

---

## 3. Pembagian Tugas Programmer

### Sprint 1

| Programmer       | Fitur (Ref FR)                                             | Branch                                         | Folder/Modul                                                                                                                                           | Catatan Dependency                                                                                                                                            |
| ---------------- | ---------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Abhista** (PM) | -                                                          | Merge branch lain                              | Repo, collaborator, proteksi branch `main`, `README.md`, `src/lib/ai/` | -                                                                                                                                                             |
| **Rafif**        | FR-01, FR-02, FR-03, FR-06 (header), FR-12 (logika), FR-14 | `feature/fondasi`, lalu `feature/pilih-peran`  | `src/types.ts`, `src/data/`, `src/context/`, `src/utils/`, `src/app/_layout.tsx`, `src/app/index.tsx`, `src/app/sesi/[id].tsx`, `src/app/*/profil.tsx` | Fondasi (tipe, data dummy, context, root layout, halaman placeholder) di-merge paling awal karena semua modul bergantung pada `usePraktikum()` dan `types.ts` |
| **Sofwan**       | FR-05, FR-07, FR-08, FR-09                                 | `feature/modal`, lalu `feature/asisten`        | `src/components/confirm-modal.tsx`, `bottom-sheet.tsx`, `src/app/asisten/`, `src/components/asisten-panel.tsx`                                         | `ConfirmModal` dan `BottomSheet` di-merge lebih dulu karena dipakai Naufal. Butuh `SesiCard` dari Naufal                                                      |
| **Naufal**       | FR-04, FR-10, FR-11, FR-12 (UI), FR-13                     | `feature/kartu-sesi`, lalu `feature/praktikan` | `src/components/sesi-card.tsx`, `status-badge.tsx`, `empty-state.tsx`, `src/app/praktikan/`, `src/components/praktikan-panel.tsx`                      | `SesiCard`, `StatusBadge`, dan `EmptyState` di-merge lebih dulu karena dipakai Sofwan. Butuh `ConfirmModal` dan `BottomSheet` dari Sofwan                     |

### Sprint 2

| Programmer   | Fitur (Ref FR)                                                    | Branch                                            | Folder/Modul                                                                                                                                                                  | Catatan Dependency                                                                                                                                                                         |
| ------------ | ----------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Akbar** (PM) | - | Merge branch lain | Project Firebase, pendaftaran Android app & unduh `google-services.json`, whitelist asisten, deploy `firestore.rules`, `README.md` | Membagikan `google-services.json` ke tim (lewat chat pribadi) sebelum sprint dimulai |
| **Rafif**    | FR-15, FR-16, FR-17, FR-18, FR-19, FR-20 | `feature/fondasi-firebase`, lalu `feature/auth`, `feature/keamanan` | `app.json`, `.gitignore`, `src/lib/firebase.ts`, `src/services/`, `src/context/`, `src/types.ts`, `src/utils/validation.ts`, `errors.ts`, `src/components/` (`loading-state`, `error-state`, `form-field`), `src/app/_layout.tsx`, `src/app/(auth)/`, `firestore.rules`, `src/app/*/profil.tsx` | **Di-merge paling awal.** Rafif juga memastikan development build bisa dijalankan semua anggota. Semua modul bergantung pada `services/`, `usePraktikum()`, tipe, dan komponen bersama. Hapus `src/data/dummy.ts` setelah semua modul pindah ke Firestore            |
| **Sofwan**  | FR-21, FR-22, FR-23, FR-24 | `feature/asisten-crud`, lalu `feature/asisten-izin` | `src/app/asisten/` (kelas, jadwal, form sesi, rekap, izin), `src/components/asisten-panel.tsx`, `kelas-form.tsx`, `sesi-form.tsx`, `izin-review-card.tsx`                      | Butuh `services/` dan `FormField` dari Rafif. Hasil FR-22 (status sesi) dibutuhkan Abhista untuk uji presensi. FR-24 butuh data izin dari Abhista, bisa diuji dengan dokumen manual di Console |
| **Abhista**  | FR-25, FR-26, FR-27, FR-28, FR-29 | `feature/presensi`, lalu `feature/izin`           | `src/app/praktikan/` (jadwal, riwayat, izin), `src/components/praktikan-panel.tsx`, `presensi-form.tsx`, `izin-form.tsx`, `izin-card.tsx`, `sesi/[id].tsx` (panel praktikan), `src/services/ai.ts` | Butuh `services/` dan komponen bersama dari Rafif, serta sesi berstatus dibuka dari Sofwan untuk uji presensi. `sentiment.js` dan `model-edom.json` dari pengajar disalin ke `src/lib/ai/`; model berjalan di perangkat, jadi tidak butuh API atau koneksi internet |

### Urutan Merge (Sprint 2)

1. `feature/fondasi-firebase` (Rafif): config, tipe, service, context, komponen bersama
2. `feature/auth` (Rafif): registrasi, login, route guard
3. `feature/asisten-crud` (Sofwan) dan `feature/presensi` (Abhista), paralel
4. `feature/izin` (Abhista) dan `feature/asisten-izin` (Sofwan), paralel
5. `feature/keamanan` (Rafif): finalisasi Security Rules, lalu seluruh alur diuji ulang

### Sprint 3

| Programmer      | Fitur (Ref FR)                                                       | Branch                                                     | Folder/Modul                                                                                                                                                                                                                         | Catatan Dependency                                                                                                                                                                            |
| --------------- | -------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Rafif** (PM)  | -                                                                    | Merge branch lain                                          | Aktifkan *Maps SDK for Android* & siapkan Google Maps API Key di Google Cloud Console, data awal koleksi `laboratorium`, deploy `firestore.rules`, review & merge PR, `README.md` | Memberikan Google Maps API Key ke Akbar untuk dipasang di `app.json` (`google-services.json` tetap memakai file dari Sprint 2)                                                                |
| **Akbar**       | FR-30, FR-31, FR-32 (validasi), FR-33, FR-34                         | `feature/fondasi-lokasi-notif`, lalu `feature/keamanan-sprint3` | `app.json`, `package.json`, `src/types.ts`, `src/services/laboratorium.ts`, `location.ts`, `notification.ts`, `src/context/praktikum-context.tsx`, `src/utils/validation.ts`, `src/components/device-permission-banner.tsx`, `firestore.rules` | **Di-merge paling awal.** Semua anggota membutuhkan paket native baru (rebuild dev-client), tipe data Sprint 3, serta service `laboratorium`, `location`, dan `notification`                  |
| **Sofwan**      | FR-32 (UI buka sesi), FR-35, FR-36 (asisten), FR-40 (trigger asisten) | `feature/asisten-lab-notif`, lalu `feature/asisten-filter` | `src/app/asisten/peta.tsx`, `src/app/asisten/jadwal.tsx`, `src/app/asisten/_layout.tsx`, `src/components/lab-form-modal.tsx`, `src/components/sesi-form.tsx`, `src/components/asisten-panel.tsx`, `src/hooks/use-kelola-sesi.ts`, `src/hooks/use-kelola-lab.ts` | Butuh `services/laboratorium.ts`, `services/notification.ts`, dan validator rentang jadwal dari Akbar. Data laboratorium yang dibuat Sofwan dipakai Abhista untuk uji presensi lokasi & peta  |
| **Abhista**     | FR-36 (praktikan), FR-37, FR-38, FR-39                               | `feature/presensi-lokasi`, lalu `feature/peta-aktivitas-lab` | `src/app/presensi/[sesiId].tsx`, `src/app/sesi/[id].tsx` (panel praktikan), `src/app/praktikan/peta.tsx`, `src/app/praktikan/jadwal.tsx`, `src/app/praktikan/_layout.tsx`, `src/components/praktikan-panel.tsx`, `src/components/lab-map-view.tsx`, `src/components/lab-activity-sheet.tsx` | Butuh `services/location.ts`, `services/laboratorium.ts`, dan komponen izin perangkat dari Akbar. Komponen `LabMapView` dan `LabActivitySheet` dipakai bersama di tab Peta Praktikan & Asisten |

### Urutan Merge (Sprint 3)

1. `feature/fondasi-lokasi-notif` (Akbar): instalasi paket Maps/Location/FCM/Notifee, tipe, service layer, context, revisi validasi akun & jadwal, komponen status izin perangkat
2. `feature/asisten-lab-notif` (Sofwan) dan `feature/presensi-lokasi` (Abhista), paralel
3. `feature/peta-aktivitas-lab` (Abhista) dan `feature/asisten-filter` (Sofwan), paralel
4. `feature/keamanan-sprint3` (Akbar): finalisasi Security Rules Sprint 3, lalu seluruh 3 alur demo diuji bersama

---

## 4. Struktur Data Firestore (Sprint 2 & Sprint 3)

Struktur koleksi Firestore yang dipakai di Sprint 2 dan diperluas pada Sprint 3:

| Koleksi                         | Isi                                                                                                                                              |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `users/{uid}`                   | nama, NIM (14 digit angka), email, peran (asisten/praktikan), kelas, `fcmToken` (Sprint 3)                                                       |
| `asistenWhitelist/{email}`      | daftar email yang boleh mendaftar sebagai asisten (diisi lewat Firebase Console)                                                                 |
| `kelas/{kelasId}`               | nama kelas, mataKuliah, asistenId, asistenNama, dibuatPada                                                                                       |
| `laboratorium/{labId}`          | nama laboratorium, lokasi/gedung, `latitude`, `longitude`, `radius` (meter), dibuatOleh, diperbaruiPada (Sprint 3)                               |
| `sesi/{sesiId}`                 | mataKuliah, pertemuan, topik, kelasId, kelas, tanggal, jamMulai, jamSelesai, `labId` (Sprint 3), ruang, status sesi, dibukaPada, ditutupPada     |
| `sesi/{sesiId}/rahasia/kode`    | kode presensi 4 digit, hanya bisa dibaca asisten pemilik sesi                                                                                    |
| `sesi/{sesiId}/presensi/{uid}`  | catatan hadir per praktikan (ID = uid), waktu server, serta koordinat `latitude`, `longitude`, `jarakMeter`, `dalamRadius` (Sprint 3)            |
| `izin/{sesiId}_{uid}`           | alasan, kategori AI, status (menunggu/diterima/ditolak), catatan dan keputusan asisten                                                           |
| `notifikasi/{notifId}`          | tipe (`SESI_DIBUKA` \| `JADWAL_DIUBAH` \| `IZIN_DIPUTUSKAN`), judul, pesan, `sesiId`, `kelasId`, `targetUid`, dibuatPada (Sprint 3)              |

Akses dibatasi lewat `firestore.rules`: praktikan hanya membuat presensi (wajib `dalamRadius == true` dan jarak memenuhi radius lab) atau izin atas namanya sendiri, sedangkan data laboratorium, sesi, keputusan izin, dan pemicu notifikasi hanya bisa dibuat/diubah asisten.

---

## 5. Akun Dummy & Akun Uji

### Sprint 1 — Akun Dummy

| Peran     | Nama                                                      | Keterangan                       |
| --------- | --------------------------------------------------------- | -------------------------------- |
| Asisten   | Dimas Pratama                                             | Pemrograman Mobile kelas A dan B |
| Asisten   | Sari Wulandari                                            | Basis Data kelas A               |
| Asisten   | Rina Kusuma                                               | Tanpa jadwal (uji empty state)   |
| Praktikan | Andi Saputra, Budi Santoso, Citra Lestari, Dewi Anggraini | Kelas A                          |
| Praktikan | Eko Nugroho, Fajar Ramadhan, Gita Permata                 | Kelas B                          |

### Sprint 2 & Sprint 3 — Akun & Data Uji

Akun sekarang dibuat lewat fitur registrasi (NIM wajib 14 digit angka, password 6–8 karakter). Siapkan data uji berikut di project Firebase untuk demo:

| Peran / Data | Akun / Dokumen Uji                           | Keterangan                                                                                      |
| ------------ | -------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Asisten      | `asisten1@...` (terdaftar di whitelist)      | Mengelola kelas A, laboratorium, dan sesi Pemrograman Mobile                                    |
| Asisten      | `asisten2@...` (terdaftar di whitelist)      | Tanpa sesi (uji empty state)                                                                    |
| Praktikan    | minimal 3 akun anggota kelas A               | Uji presensi berbasis lokasi (di dalam & di luar radius), presensi ganda, izin, dan notifikasi  |
| Praktikan    | 1 akun bukan anggota kelas mana pun          | Uji bahwa jadwal kosong dan akses ditolak                                                       |
| Laboratorium | minimal 3 laboratorium Informatika           | Titik koordinat & radius (misal 50m) dengan jadwal sesi sedang berlangsung dan sesi berikutnya  |

---

## 6. Setup Proyek (Programmer, Setelah Clone)

### Sprint 1

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

### Tambahan Sprint 2

Mulai Sprint 2 aplikasi memakai Firebase native (React Native Firebase), sehingga **Expo Go tidak bisa dipakai lagi**. Aplikasi dijalankan lewat development build di emulator atau HP Android.

Prasyarat tambahan: **Android Studio** (emulator + Android SDK) dan **JDK 17**, atau HP Android dengan USB debugging aktif.

1. Taruh `google-services.json` di folder paling luar proyek (minta ke PM, jangan di-commit).
2. Paket baru (dipasang Rafif pada `feature/fondasi-firebase`):

   ```bash
   npx expo install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore expo-dev-client
   ```

3. Build dan jalankan di Android (pertama kali agak lama), lalu seterusnya cukup `npx expo start --dev-client`:

   ```bash
   npx expo run:android
   ```

Nama package Android harus sama persis di Firebase Console dan di `app.json` (`android.package`).

### Tambahan Sprint 3

Pada Sprint 3 ditambahkan modul native untuk Maps, Geolocation, dan Push Notification, sehingga **development build wajib di-rebuild** setelah `feature/fondasi-lokasi-notif` di-merge.

1. Pastikan Google Maps API Key dari Rafif (PM) sudah terpasang pada konfigurasi `android.config.googleMaps.apiKey` di `app.json` (file `google-services.json` di root proyek tetap memakai file yang sama dari Sprint 2, tidak perlu diunduh ulang).
2. Paket baru Sprint 3 (dipasang Akbar pada `feature/fondasi-lokasi-notif`):

   ```bash
   npx expo install react-native-maps expo-location @react-native-firebase/messaging @notifee/react-native
   ```

3. Rebuild development client di Android:

   ```bash
   npx expo run:android
   ```

4. Saat menguji di emulator atau perangkat fisik, aktifkan layanan lokasi (GPS) serta berikan izin akses Lokasi dan Notifikasi ketika diminta aplikasi.

---

## 7. Aturan Git & Commit

- Jangan pernah coding langsung di branch `main`.
- Format commit: `<type>(<scope>): <deskripsi singkat>` diikuti body opsional.
  - Contoh: `feat(asisten): tambah tombol buka sesi dengan modal konfirmasi`
- Type yang dipakai: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.
- Scope yang dipakai: `fondasi`, `pilih-peran`, `komponen`, `asisten`, `praktikan`, `docs`.
- Tidak ada co-author pada commit.
- Sertakan screenshot setiap kondisi tampilan (kosong, normal, sukses) di deskripsi Pull Request.
- Merge ke `main` hanya dilakukan oleh PM setelah branch fitur direview.
- Scope tambahan Sprint 2: `firebase`, `auth`, `izin`, `rules`.
- Scope tambahan Sprint 3: `lokasi`, `maps`, `lab`, `notif`.
- Jangan commit `google-services.json` atau file rahasia lain (misalnya service account).
- Perubahan struktur data Firestore dikabarkan ke tim dan diperbarui di README ini.
- Layar tidak memanggil Firestore atau model AI langsung, hanya lewat folder `src/services/`.
