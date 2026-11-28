# Sprint 3 — Lokasi Presensi, Peta Laboratorium & Push Notification (Frozen)

> [← Sprint 2](./sprint-2.md) · [README Utama](../../README.md) · [Sprint 4 (Aktif) →](./sprint-4.md)

> [!NOTE]
> **Status: Frozen.** Database dan baseline kode Sprint 3 dibekukan sebelum memasuki Sprint 4 (Sprint 4 menggunakan proyek Firebase & database Firestore baru).

## Deskripsi Singkat

Pada Sprint 3, aplikasi dikembangkan dengan memanfaatkan lokasi perangkat, Maps, dan push notification, serta menambahkan penyempurnaan dari evaluasi sebelumnya (pembatasan akun registrasi NIM 14 digit angka, password 6–8 karakter, email `@`; pencarian dan filter jadwal asisten/praktikan berdasarkan mata kuliah, tanggal, jam, dan ruangan; serta pembatasan bahwa sesi praktikum hanya dapat dibuka pada tanggal dan rentang jadwal praktikum yang sudah ditentukan).

Asisten mengelola informasi lokasi laboratorium Informatika (koordinat dan radius presensi) yang disimpan di Firestore. Praktikan melakukan presensi melalui **halaman khusus presensi** yang terpisah dari halaman detail sesi; aplikasi memeriksa jarak posisi perangkat terhadap titik koordinat dan radius laboratorium terkait, sehingga presensi hanya berhasil dicatat apabila sesi sedang dibuka, kode benar, belum pernah presensi pada sesi tersebut, dan praktikan berada di dalam radius yang diizinkan. Halaman **Maps interaktif** menampilkan marker posisi pengguna secara real-time beserta marker seluruh laboratorium Informatika; saat marker laboratorium dipilih, aplikasi menampilkan praktikum yang sedang berlangsung dan praktikum berikutnya berdasarkan data jadwal dan sesi di Firestore. Sistem juga mengirimkan **push notification** kepada pengguna terkait saat sesi dibuka, jadwal berubah, atau pengajuan izin diputuskan, serta menangani kondisi izin akses lokasi/notifikasi dan gangguan perangkat secara jelas.

**Tiga alur demo Sprint 3:**

1. **Presensi berbasis lokasi:** asisten membuka sesi (pada rentang jadwal) → praktikan membuka halaman presensi → aplikasi memeriksa lokasi perangkat dan radius laboratorium → presensi berhasil dicatat apabila memenuhi ketentuan → asisten melihat rekap kehadiran.
2. **Peta dan informasi laboratorium:** pengguna membuka halaman Maps → aplikasi menampilkan posisi pengguna dan marker laboratorium → pengguna memilih laboratorium → aplikasi menampilkan praktikum yang sedang berlangsung dan praktikum berikutnya berdasarkan data Firestore.
3. **Notifikasi kegiatan:** asisten membuka sesi, mengubah jadwal, atau memberikan keputusan izin → sistem mengirimkan push notification → pengguna terkait menerima pemberitahuan mengenai perubahan tersebut.

---

## 1. Software Requirement Specification (SRS)

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

| No  | Kode  | Nama Fitur                                       | Deskripsi Fungsional                                                                                                                                                                                                                                                                                                                                                                         | Ref SRS                                        |
| --- | ----- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 30  | FR-30 | Konfigurasi Maps, Geolocation & Notifikasi       | Konfigurasi plugin `expo-location`, `react-native-maps` (Google Maps API Key di `app.config.js`), `@react-native-firebase/messaging`, dan `@notifee/react-native`, beserta permission Android (`ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`, `POST_NOTIFICATIONS`)                                                                                                                        | SRS-42, SRS-47                                 |
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

| Programmer     | Fitur (Ref FR)                                                       | Branch                                                         | Folder/Modul                                                                                                                                                                                                                         | Catatan Dependency                                                                                                                                                                            |
| -------------- | -------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Rafif** (PM) | -                                                                    | Merge branch lain                                              | Aktifkan *Maps SDK for Android* & siapkan Google Maps API Key di Google Cloud Console, data awal koleksi `laboratorium`, deploy `firestore.rules`, review & merge PR, `README.md`                                                    | Memberikan Google Maps API Key ke Akbar untuk dipasang di `app.config.js` (`google-services.json` tetap memakai file dari Sprint 2)                                                           |
| **Akbar**      | FR-30, FR-31, FR-32 (validasi), FR-33, FR-34                         | `feature/fondasi-lokasi-notif`, lalu `feature/keamanan-sprint3` | `app.json`, `app.config.js`, `package.json`, `src/types.ts`, `src/services/laboratorium.ts`, `location.ts`, `notification.ts`, `src/context/praktikum-context.tsx`, `src/utils/validation.ts`, `src/components/device-permission-banner.tsx`, `firestore.rules` | **Di-merge paling awal.** Semua anggota membutuhkan paket native baru (rebuild dev-client), tipe data Sprint 3, serta service `laboratorium`, `location`, dan `notification`                  |
| **Sofwan**     | FR-32 (UI buka sesi), FR-35, FR-36 (asisten), FR-40 (trigger asisten) | `feature/asisten-lab-notif`, lalu `feature/asisten-filter`     | `src/app/asisten/peta.tsx`, `src/app/asisten/jadwal.tsx`, `src/app/asisten/_layout.tsx`, `src/components/lab-form-modal.tsx`, `src/components/sesi-form.tsx`, `src/components/asisten-panel.tsx`, `src/hooks/use-kelola-sesi.ts`, `src/hooks/use-kelola-lab.ts` | Butuh `services/laboratorium.ts`, `services/notification.ts`, dan validator rentang jadwal dari Akbar. Data laboratorium yang dibuat Sofwan dipakai Abhista untuk uji presensi lokasi & peta  |
| **Abhista**    | FR-36 (praktikan), FR-37, FR-38, FR-39                               | `feature/presensi-lokasi`, lalu `feature/peta-aktivitas-lab`   | `src/app/presensi/[sesiId].tsx`, `src/app/sesi/[id].tsx` (panel praktikan), `src/app/praktikan/peta.tsx`, `src/app/praktikan/jadwal.tsx`, `src/app/praktikan/_layout.tsx`, `src/components/praktikan-panel.tsx`, `src/components/lab-map-view.tsx`, `src/components/lab-activity-sheet.tsx` | Butuh `services/location.ts`, `services/laboratorium.ts`, dan komponen izin perangkat dari Akbar. Komponen `LabMapView` dan `LabActivitySheet` dipakai bersama di tab Peta Praktikan & Asisten |

### Urutan Merge (Sprint 3)

1. `feature/fondasi-lokasi-notif` (Akbar): instalasi paket Maps/Location/FCM/Notifee, tipe, service layer, context, revisi validasi akun & jadwal, komponen status izin perangkat
2. `feature/asisten-lab-notif` (Sofwan) dan `feature/presensi-lokasi` (Abhista), paralel
3. `feature/peta-aktivitas-lab` (Abhista) dan `feature/asisten-filter` (Sofwan), paralel
4. `feature/keamanan-sprint3` (Akbar): finalisasi Security Rules Sprint 3, lalu seluruh 3 alur demo diuji bersama

---

## 4. Struktur Data Firestore (Sprint 3)

| Koleksi                        | Isi                                                                                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `users/{uid}`                  | nama, NIM (14 digit angka), email, peran (asisten/praktikan), kelas, `fcmToken` (Sprint 3)                                                       |
| `asistenWhitelist/{email}`     | daftar email yang boleh mendaftar sebagai asisten (diisi lewat Firebase Console)                                                                 |
| `kelas/{kelasId}`              | nama kelas, mataKuliah, asistenId, asistenNama, dibuatPada                                                                                       |
| `laboratorium/{labId}`         | nama laboratorium, lokasi/gedung, `latitude`, `longitude`, `radius` (meter), dibuatOleh, diperbaruiPada (Sprint 3)                               |
| `sesi/{sesiId}`                | mataKuliah, pertemuan, topik, kelasId, kelas, tanggal, jamMulai, jamSelesai, `labId` (Sprint 3), ruang, status sesi, dibukaPada, ditutupPada     |
| `sesi/{sesiId}/rahasia/kode`   | kode presensi 4 digit, hanya bisa dibaca asisten pemilik sesi                                                                                    |
| `sesi/{sesiId}/presensi/{uid}` | catatan hadir per praktikan (ID = uid), waktu server, serta koordinat `latitude`, `longitude`, `jarakMeter`, `dalamRadius` (Sprint 3)            |
| `izin/{sesiId}_{uid}`          | alasan, kategori AI, status (menunggu/diterima/ditolak), catatan dan keputusan asisten                                                           |
| `notifikasi/{notifId}`         | tipe (`SESI_DIBUKA` \| `JADWAL_DIUBAH` \| `IZIN_DIPUTUSKAN`), judul, pesan, `sesiId`, `kelasId`, `targetUid`, dibuatPada (Sprint 3)              |

---

## 5. Akun & Data Uji (Sprint 3)

| Peran / Data | Akun / Dokumen Uji                           | Keterangan                                                                                      |
| ------------ | -------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Asisten      | `asisten1@...` (terdaftar di whitelist)      | Mengelola kelas A, laboratorium, dan sesi Pemrograman Mobile                                    |
| Asisten      | `asisten2@...` (terdaftar di whitelist)      | Tanpa sesi (uji empty state)                                                                    |
| Praktikan    | minimal 3 akun anggota kelas A               | Uji presensi berbasis lokasi (di dalam & di luar radius), presensi ganda, izin, dan notifikasi  |
| Praktikan    | 1 akun bukan anggota kelas mana pun          | Uji bahwa jadwal kosong dan akses ditolak                                                       |
| Laboratorium | minimal 3 laboratorium Informatika           | Titik koordinat & radius (misal 50m) dengan jadwal sesi sedang berlangsung dan sesi berikutnya  |

---

## 6. Catatan Setup Sprint 3

1. Pastikan Google Maps API Key sudah terpasang melalui environment variable `GOOGLE_MAPS_API_KEY` (dibaca oleh `app.config.js`).
2. Paket baru Sprint 3:

   ```bash
   npx expo install react-native-maps expo-location @react-native-firebase/messaging @notifee/react-native
   ```

3. Rebuild development client Android:

   ```bash
   npx expo run:android
   ```
