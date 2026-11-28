# Manajemen Praktikum

Aplikasi mobile React Native (Expo) untuk mengelola kegiatan praktikum dan laboratorium secara terintegrasi bagi tiga peran pengguna: **Asisten Laboratorium (Aslab)**, **Asisten Praktikum (Asprak)**, dan **Praktikan**.

- **Aslab** mengelola laboratorium per mata kuliah (lokasi, koordinat, radius presensi, *grace period*, nominal denda), melakukan *bulk/single insert* laboratorium/praktikan/asprak dengan template `.xlsx` & `.csv`, memindahkan anggota antar lab, serta memantau **Dashboard Keberlangsungan & Keuangan Denda Laboratorium**.
- **Asprak** mengelola kelas, jadwal, dan sesi praktikum pada laboratorium tanggung jawabnya, membuka/menutup sesi secara real-time, memantau rekap kehadiran, dan memutuskan pengajuan izin (*excused absence*).
- **Praktikan** melihat jadwal praktikum, melakukan presensi berbasis kode & radius lokasi laboratorium, mengajukan izin (dengan klasifikasi alasan AI on-device), memantau riwayat kehadiran, serta membayar tagihan denda keterlambatan melalui **Midtrans Sandbox** dengan verifikasi webhook backend.

---

## Daftar Isi

- [Dokumentasi Sprint (PRD, SRS, FR & Pembagian Tugas)](#dokumentasi-sprint-prd-srs-fr--pembagian-tugas)
- [Tech Stack](#tech-stack)
- [Ringkasan Struktur Data Firestore Terkini (Sprint 4)](#ringkasan-struktur-data-firestore-terkini-sprint-4)
- [Setup Proyek (Setelah Clone)](#setup-proyek-setelah-clone)
- [Aturan Git & Commit](#aturan-git--commit)

---

## Dokumentasi Sprint (PRD, SRS, FR & Pembagian Tugas)

Seluruh rincian kebutuhan perangkat lunak (SRS), functional requirement (FR), pembagian tugas programmer, urutan merge, dan data uji tiap sprint disimpan terpisah di direktori [`docs/sprints/`](./docs/sprints/):

| Sprint | Status | Fokus Utama | Dokumen |
| --- | --- | --- | --- |
| **Sprint 1** | Selesai | Antarmuka dasar, alur presensi & rekap kehadiran dengan data dummy lokal (`SRS-01`–`SRS-13`, `FR-01`–`FR-14`) | [docs/sprints/sprint-1.md](./docs/sprints/sprint-1.md) |
| **Sprint 2** | Selesai | Firebase Auth, Cloud Firestore real-time, CRUD kelas/sesi, pengajuan izin + klasifikasi AI on-device, Security Rules (`SRS-14`–`SRS-33`, `FR-15`–`FR-29`) | [docs/sprints/sprint-2.md](./docs/sprints/sprint-2.md) |
| **Sprint 3** | *Frozen* | Validasi lokasi presensi (GPS + radius lab), Peta Laboratorium interaktif, Push Notification (FCM/Notifee), pencarian & filter jadwal (`SRS-34`–`SRS-48`, `FR-30`–`FR-40`) | [docs/sprints/sprint-3.md](./docs/sprints/sprint-3.md) |
| **Sprint 4** | **Aktif (PRD)** | DB baru, Role baru **Aslab** (Manajemen Lab, 3 Bulk Insert `.xlsx`/`.csv` + preview interaktif, pindah anggota, Dashboard Keberlangsungan & Keuangan), denda keterlambatan (*grace period*), **Midtrans Sandbox + Backend Webhook**, notifikasi & riwayat pembayaran, serta seluruh revisi evaluasi Sprint 3 (`SRS-49`–`SRS-75`, `FR-41`–`FR-58`) | [docs/sprints/sprint-4.md](./docs/sprints/sprint-4.md) |

---

## Tech Stack

| Kebutuhan | Teknologi |
| --- | --- |
| Framework Mobile | React Native dengan [Expo](https://expo.dev) SDK 58 (`expo-dev-client`) |
| Bahasa | TypeScript |
| Navigasi | [Expo Router](https://docs.expo.dev/router/introduction) (file-based routing, Stack & Tabs untuk 3 peran) |
| Autentikasi | [Firebase Authentication](https://firebase.google.com/docs/auth) email & password + whitelist peran (`roleWhitelist`) |
| Database | [Cloud Firestore](https://firebase.google.com/docs/firestore) real-time (`onSnapshot`) — proyek DB baru mulai Sprint 4 |
| Integrasi Firebase | [React Native Firebase](https://rnfirebase.io) (`app`, `auth`, `firestore`, `messaging`) dengan `google-services.json` |
| Keamanan Data | Firebase Security Rules (`firestore.rules`) & Firebase Admin SDK di backend |
| State & UI | React Context (`AuthProvider`, `PraktikumProvider`), `StyleSheet`, `FlatList` + `PaginationControls` (limit 8), `KeyboardAwareScroll`, `Modal` / `BottomSheet` |
| Klasifikasi Izin | Model AI on-device (`ai/sentiment.js` + `ai/model-edom.json`), berjalan lokal tanpa internet |
| Peta & Geolocation | [`react-native-maps`](https://github.com/react-native-maps/react-native-maps) (Google Maps) dan [`expo-location`](https://docs.expo.dev/versions/latest/sdk/location/) |
| Push Notification | [`@react-native-firebase/messaging`](https://rnfirebase.io/messaging/usage) (FCM) dan [`@notifee/react-native`](https://notifee.app/) |
| Bulk Insert & Template | `expo-document-picker`, `expo-file-system`, `expo-sharing`, dan `xlsx` (dukungan `.xlsx` & `.csv`) |
| Payment Gateway & Backend | **Midtrans Sandbox (Snap)** dibuka via `expo-web-browser`, diproses melalui layanan **`backend/`** (Node.js/TypeScript + Firebase Admin SDK, deploy Vercel/Render) dengan verifikasi webhook SHA-512 |

---

## Ringkasan Struktur Data Firestore Terkini (Sprint 4)

Detail lengkap tiap field dan Security Rules tersedia di [docs/sprints/sprint-4.md](./docs/sprints/sprint-4.md#6-struktur-data-firestore-baru--security-rules-sprint-4).

| Koleksi | Deskripsi Singkat |
| --- | --- |
| `users/{uid}` | Identitas pengguna (`nama`, `nim` 14 digit, `email`, `peran`: `aslab` \| `asprak` \| `praktikan`, `labIds[]`, `fcmToken`) |
| `roleWhitelist/{email}` | Daftar email yang diizinkan mendaftar sebagai `aslab` atau `asprak` |
| `laboratorium/{labId}` | Unit lab per mata kuliah: lokasi, koordinat, radius, `gracePeriodMenit`, `nominalDenda`, `aslabId`, `asprakIds[]`, `praktikanIds[]` |
| `kelas/{kelasId}` | Kelas praktikum di bawah `kelas.labId` (tanpa tambah peserta manual — peserta otomatis dari `lab.praktikanIds`) |
| `sesi/{sesiId}` | Jadwal & status sesi per `kelasId` dengan 1 `sesi.labId` (ruang pelaksanaan), `pertemuan` otomatis `count+1`, durasi 30–240 menit, `acuanMulai`, `batasToleransi` |
| `sesi/{sesiId}/rahasia/kode` | Kode presensi 4 digit (hanya dapat dibaca Asprak anggota lab kelas terkait) |
| `sesi/{sesiId}/presensi/{uid}` | Catatan hadir per praktikan (ID = `uid`, koordinat, jarak, `terlambat`, `menitTerlambat`) |
| `izin/{sesiId}_{uid}` | Pengajuan izin praktikan + hasil klasifikasi AI + keputusan Asprak (*excused absence*, bebas denda) |
| `tagihan/{sesiId}_{uid}` | Tagihan denda keterlambatan (maksimal 1 per kejadian; status `belum_bayar`/`pending`/`lunas`/`gagal` diverifikasi backend) |
| `pembayaran/{orderId}` | Riwayat transaksi pembayaran Midtrans Sandbox (dikelola eksklusif oleh `backend/` Admin SDK) |
| `notifikasi/{notifId}` | Event notifikasi kegiatan praktikum, tagihan denda baru, serta status pembayaran berhasil/gagal |

---

## Setup Proyek (Setelah Clone)

Prasyarat: **Node.js 20+**, **Android Studio** (Android SDK + emulator) dan **JDK 17**, atau perangkat Android fisik dengan USB debugging aktif. Karena menggunakan modul native (`@react-native-firebase/*`, `react-native-maps`, `@notifee/react-native`), aplikasi dijalankan lewat **development build** (`expo-dev-client`), bukan Expo Go.

### 1. Aplikasi Mobile (Root Proyek)

```bash
git clone https://github.com/Namiemi/Praktikum_PPK_ManajemenPraktikum.git
cd Praktikum_PPK_ManajemenPraktikum
npm install
```

1. Minta file `google-services.json` (proyek Firebase **baru Sprint 4**) dari PM dan letakkan di root proyek (**jangan di-commit**).
2. Siapkan environment variable di `.env` (jangan di-commit):
   ```bash
   GOOGLE_MAPS_API_KEY=<kunci_google_maps_android>
   EXPO_PUBLIC_API_URL=https://<domain-backend-midtrans>
   ```
3. Build development client Android (wajib dijalankan ulang setiap kali ada penambahan modul native baru):
   ```bash
   npx expo run:android
   ```
4. Untuk menjalankan ulang sehari-hari setelah dev-client terpasang:
   ```bash
   npx expo start --dev-client
   ```

> Untuk menambah paket React Native/Expo, selalu gunakan `npx expo install <paket>` agar versinya kompatibel dengan Expo SDK 58.

### 2. Backend Midtrans Sandbox (`backend/`)

Panduan lengkap environment variable (`MIDTRANS_SERVER_KEY`, kredensial Firebase Admin SDK) serta registrasi Webhook URL pada Midtrans Sandbox Dashboard tersedia di [docs/sprints/sprint-4.md §9.2](./docs/sprints/sprint-4.md#92-setup-backend-midtrans-backend).

---

## Aturan Git & Commit

- Jangan pernah coding langsung di branch `main`. Buat branch fitur sendiri sebelum mulai bekerja:
  ```bash
  git switch -c feature/nama-fitur
  git push -u origin feature/nama-fitur
  ```
- Format commit: `<type>(<scope>): <deskripsi singkat>` diikuti body opsional.
  - Contoh: `feat(aslab): tambah modal bulk insert praktikan dengan preview interaktif`
- **Type:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.
- **Scope:**
  - Umum: `fondasi`, `komponen`, `firebase`, `auth`, `izin`, `rules`, `lokasi`, `maps`, `lab`, `notif`, `docs`
  - Peran & Sprint 4: `aslab`, `asprak`, `praktikan`, `bulk`, `dashboard`, `denda`, `payment`, `backend`, `pagination`
- Tidak ada co-author pada commit.
- Sebelum push / membuat PR, pastikan tidak ada error TypeScript maupun lint:
  ```bash
  npx tsc --noEmit
  npx expo lint
  ```
- Sertakan screenshot setiap kondisi tampilan (kosong, loading, normal, sukses, error) di deskripsi Pull Request.
- Merge ke `main` hanya dilakukan oleh PM setelah branch fitur direview dan sesuai urutan merge sprint.
- **Jangan pernah commit** `google-services.json`, `.env`, Midtrans Server Key, maupun file service account Firebase.
- Layar UI tidak boleh memanggil Firestore, model AI, ataupun Midtrans secara langsung — semua akses data wajib melalui lapisan `src/services/`.
- Setiap perubahan struktur data Firestore wajib dikabarkan ke tim dan diperbarui pada dokumentasi sprint terkait.
