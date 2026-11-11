/**
 * @file types.ts
 * @description Definisi tipe data dan kontrak antarmuka TypeScript untuk aplikasi Manajemen Praktikum.
 * Memenuhi prinsip Interface Segregation (ISP) agar setiap modul hanya bergantung pada tipe yang relevan.
 *
 * Sprint 2: data berasal dari Cloud Firestore. Tipe di bawah adalah bentuk data di sisi aplikasi
 * (Timestamp Firestore sudah dikonversi ke `Date` / string jam oleh lapisan `src/services/`).
 */

/**
 * Peran pengguna dalam sistem praktikum.
 */
export type Peran = 'asisten' | 'praktikan';

/**
 * Status siklus hidup sesi praktikum.
 * - 'BELUM_DIBUKA': Sesi belum dimulai oleh asisten.
 * - 'DIBUKA': Sesi aktif menerima presensi dengan 4-digit kode presensi.
 * - 'DITUTUP': Sesi telah diakhiri oleh asisten.
 */
export type StatusSesi = 'BELUM_DIBUKA' | 'DIBUKA' | 'DITUTUP';

/**
 * Entitas pengguna aplikasi (Asisten atau Praktikan).
 * Disimpan di `users/{uid}`.
 */
export interface User {
  /** Identifier unik pengguna (uid Firebase Authentication) */
  id: string;
  /** Nama lengkap pengguna */
  nama: string;
  /** Nomor Induk Mahasiswa */
  nim: string;
  /** Email akun Firebase Authentication */
  email: string;
  /** Peran aktif pengguna dalam sistem */
  peran: Peran;
  /** ID dokumen kelas yang diikuti praktikan (`users/{uid}.kelas`). Hanya untuk praktikan */
  kelasId?: string | null;
  /** Nama kelas yang diikuti praktikan (misal: 'A' atau 'B'), turunan dari `kelasId`. Hanya untuk praktikan */
  kelas?: string;
  /** Nama-nama kelas yang diampu. Hanya untuk asisten */
  kelasDiampu?: string[];
}

/**
 * Entitas kelas praktikum. Disimpan di `kelas/{kelasId}`.
 * Daftar peserta tidak disimpan di dokumen ini, melainkan lewat `users/{uid}.kelas`.
 */
export interface Kelas {
  /** ID dokumen kelas */
  id: string;
  /** Nama kelas (misal: 'A') */
  nama: string;
  /** Nama mata kuliah praktikum */
  mataKuliah: string;
  /** uid asisten pengampu */
  asistenId: string;
  /** Nama asisten pengampu */
  asistenNama: string;
}

/**
 * Entitas sesi praktikum. Disimpan di `sesi/{sesiId}`.
 */
export interface SesiPraktikum {
  /** Identifier unik sesi (ID dokumen Firestore) */
  id: string;
  /** Nama mata kuliah praktikum */
  mataKuliah: string;
  /** Nomor pertemuan (misal: 1, 2, 3, ...) */
  pertemuan: number;
  /** Topik atau judul materi pertemuan */
  topik: string;
  /** ID dokumen kelas yang dijadwalkan */
  kelasId: string;
  /** Nama kelas praktikum yang dijadwalkan (misal: 'A' atau 'B') */
  kelas: string;
  /** Tanggal pelaksanaan format ISO YYYY-MM-DD */
  tanggal: string;
  /** Waktu mulai praktikum format HH:MM */
  jamMulai: string;
  /** Waktu selesai praktikum format HH:MM */
  jamSelesai: string;
  /** Ruangan laboratorium */
  ruang: string;
  /** Identifier asisten yang mengampu sesi ini */
  asistenId: string;
  /** Nama asisten pengampu */
  asistenNama: string;
  /** Status sesi saat ini */
  status: StatusSesi;
  /**
   * Kode 4 digit presensi acak saat status DIBUKA.
   * Hanya terisi untuk asisten pemilik sesi (dibaca dari `sesi/{id}/rahasia/kode`).
   */
  kodePresensi?: string;
  /** Waktu pembukaan sesi format HH:MM:SS */
  jamBuka?: string;
  /** Waktu penutupan sesi format HH:MM:SS */
  jamTutup?: string;
  /** Waktu pembukaan sesi (dari `dibukaPada`) */
  dibukaPada?: Date;
  /** Waktu penutupan sesi (dari `ditutupPada`) */
  ditutupPada?: Date;
  /** Catatan tambahan atau modul sesi untuk informasi pendukung */
  catatan?: string;
  /**
   * Total praktikan terdaftar dalam kelas ini.
   * Dihitung di sisi asisten; bernilai 0 di sisi praktikan.
   */
  totalPraktikan: number;
}

/**
 * Entitas riwayat catatan kehadiran praktikan.
 * Disimpan di `sesi/{sesiId}/presensi/{uid}`.
 */
export interface Presensi {
  /** Identifier catatan presensi (= uid praktikan, sehingga tidak bisa ganda) */
  id: string;
  /** Identifier sesi praktikum yang dihadiri */
  sesiId: string;
  /** Identifier praktikan yang melakukan presensi */
  praktikanId: string;
  /** Nama lengkap praktikan */
  praktikanNama: string;
  /** NIM praktikan */
  praktikanNim: string;
  /** Waktu pencatatan presensi format HH:MM:SS */
  waktuPresensi: string;
  /** Waktu pencatatan presensi (waktu server) */
  waktuAt?: Date;
}

/**
 * Status keputusan pengajuan izin.
 */
export type StatusIzin = 'menunggu' | 'diterima' | 'ditolak';

/**
 * Status klasifikasi AI untuk alasan izin.
 */
export type StatusAI = 'berhasil' | 'gagal';

/**
 * Hasil klasifikasi AI yang diteruskan saat mengajukan izin.
 */
export interface HasilAI {
  kategoriAI: string | null;
  skorAI: number | null;
  statusAI: StatusAI;
}

/**
 * Entitas pengajuan izin praktikan. Disimpan di `izin/{sesiId}_{uid}`.
 * Hasil AI tidak pernah mengubah `status`.
 */
export interface Izin {
  /** ID dokumen (`{sesiId}_{uid}`) */
  id: string;
  sesiId: string;
  praktikanId: string;
  praktikanNama: string;
  praktikanNim: string;
  /** uid asisten pemilik sesi */
  asistenId: string;
  /** Label sesi singkat (misal: 'Pemrograman Mobile · Pertemuan 3') */
  sesiLabel: string;
  alasan: string;
  kategoriAI: string | null;
  skorAI: number | null;
  statusAI: StatusAI;
  status: StatusIzin;
  catatanAsisten?: string;
  diajukanPada?: Date;
  diputuskanOleh?: string;
  diputuskanPada?: Date;
}

/**
 * Data masukan form kelas (FR-21).
 */
export interface KelasInput {
  nama: string;
  mataKuliah: string;
}

/**
 * Data masukan form sesi (FR-21).
 */
export interface SesiInput {
  mataKuliah: string;
  pertemuan: number;
  topik: string;
  kelasId: string;
  /** Nama kelas (denormalisasi untuk tampilan) */
  kelas: string;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  ruang: string;
  catatan?: string;
}

/**
 * Data masukan form registrasi (FR-16).
 */
export interface RegisterInput {
  nama: string;
  nim: string;
  email: string;
  password: string;
  peran: Peran;
}

/**
 * Tipe standar return hasil aksi mutasi (Command/Result pattern).
 * Memudahkan penanganan status dan umpan balik pesan di lapisan UI tanpa try-catch berlebih.
 */
export interface ActionResult<T = unknown> {
  /** Status keberhasilan operasi */
  success: boolean;
  /** Pesan deskriptif hasil operasi atau alasan kegagalan */
  message: string;
  /** Payload data kembalian jika operasi berhasil */
  data?: T;
}

/**
 * Kontrak antarmuka State Management Global `usePraktikum()`.
 * Data berlangganan real-time ke Firestore sesuai peran pengguna aktif.
 */
export interface PraktikumContextType {
  /** Pengguna yang sedang login, atau null jika belum login */
  currentUser: User | null;
  /** true selama data awal listener belum diterima */
  loading: boolean;
  /** Pesan error listener (Bahasa Indonesia), atau null */
  error: string | null;
  /** Memasang ulang seluruh listener (dipakai tombol "Coba Lagi") */
  retry: () => void;

  /** Daftar sesi praktikum (asisten: miliknya; praktikan: sesi kelasnya) */
  sesiList: SesiPraktikum[];
  /** Daftar presensi (asisten: seluruh presensi sesi miliknya; praktikan: presensinya sendiri) */
  presensiList: Presensi[];
  /** Daftar kelas (asisten: kelas yang diampu; praktikan: kelas yang diikuti) */
  kelasList: Kelas[];
  /** Daftar pengajuan izin (asisten: untuk sesi miliknya; praktikan: miliknya sendiri) */
  izinList: Izin[];
  /** Daftar seluruh praktikan terdaftar. Hanya terisi untuk asisten (pemilih peserta) */
  praktikanList: User[];

  /**
   * Mengakhiri sesi login pengguna aktif (signOut).
   */
  logout: () => Promise<void>;

  /**
   * Membuka sesi praktikum yang berstatus BELUM_DIBUKA (Khusus Asisten).
   * Menghasilkan kode presensi 4 digit dan mencatat waktu buka.
   * @param sesiId ID sesi yang akan dibuka
   */
  bukaSesi: (sesiId: string) => Promise<ActionResult<SesiPraktikum>>;

  /**
   * Menutup sesi praktikum yang berstatus DIBUKA (Khusus Asisten).
   * Mencatat waktu tutup sesi.
   * @param sesiId ID sesi yang akan ditutup
   */
  tutupSesi: (sesiId: string) => Promise<ActionResult<SesiPraktikum>>;

  /**
   * Melakukan pencatatan kehadiran oleh praktikan (FR-26).
   * Menerapkan validasi anti-presensi ganda; kebenaran kode diverifikasi Security Rules.
   * @param sesiId ID sesi yang dihadiri
   * @param kodeInput Kode 4 digit yang dimasukkan oleh praktikan
   */
  presensi: (sesiId: string, kodeInput: string) => Promise<ActionResult<Presensi>>;

  /**
   * Mengajukan izin untuk sesi tertentu (FR-28). Status awal selalu 'menunggu'.
   * @param sesiId ID sesi
   * @param alasan Alasan izin (10–300 karakter)
   * @param hasilAI Hasil klasifikasi AI; jika tidak diberikan disimpan `statusAI: 'gagal'`
   */
  ajukanIzin: (
    sesiId: string,
    alasan: string,
    hasilAI?: HasilAI
  ) => Promise<ActionResult<Izin>>;

  /**
   * Menerima atau menolak pengajuan izin (Khusus Asisten, FR-24).
   * @param izinId ID dokumen izin
   * @param keputusan 'diterima' atau 'ditolak'
   * @param catatan Catatan asisten (opsional)
   */
  putuskanIzin: (
    izinId: string,
    keputusan: 'diterima' | 'ditolak',
    catatan?: string
  ) => Promise<ActionResult<Izin>>;

  /**
   * Mengambil data sesi berdasarkan ID.
   * @param sesiId ID sesi
   */
  getSesiById: (sesiId: string) => SesiPraktikum | undefined;

  /**
   * Mengambil seluruh daftar presensi pada sesi tertentu (untuk rekap asisten).
   * Diurutkan dari yang hadir paling awal.
   * @param sesiId ID sesi
   */
  getPresensiBySesi: (sesiId: string) => Presensi[];

  /**
   * Mengambil seluruh riwayat kehadiran untuk praktikan tertentu.
   * @param praktikanId ID praktikan
   */
  getPresensiByPraktikan: (praktikanId: string) => Presensi[];

  /**
   * Memeriksa apakah praktikan tertentu sudah tercatat presensi pada suatu sesi.
   * @param sesiId ID sesi
   * @param praktikanId ID praktikan
   */
  hasPraktikanPresensi: (sesiId: string, praktikanId: string) => boolean;

  /**
   * Mengambil daftar pengajuan izin pada sesi tertentu.
   * @param sesiId ID sesi
   */
  getIzinBySesi: (sesiId: string) => Izin[];
}
