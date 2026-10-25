/**
 * @file types.ts
 * @description Definisi tipe data dan kontrak antarmuka TypeScript untuk aplikasi Manajemen Praktikum.
 * Memenuhi prinsip Interface Segregation (ISP) agar setiap modul hanya bergantung pada tipe yang relevan.
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
 */
export interface User {
  /** Identifier unik pengguna (misal: 'ast-1' atau 'prak-1') */
  id: string;
  /** Nama lengkap pengguna */
  nama: string;
  /** Nomor Induk Mahasiswa */
  nim: string;
  /** Peran aktif pengguna dalam sistem */
  peran: Peran;
  /** Kelas yang diikuti praktikan (misal: 'A' atau 'B'). Hanya untuk praktikan */
  kelas?: string;
  /** Mata kuliah praktikum yang diampu. Hanya untuk asisten */
  mataKuliah?: string;
}

/**
 * Entitas sesi praktikum.
 */
export interface SesiPraktikum {
  /** Identifier unik sesi (misal: 'sesi-1') */
  id: string;
  /** Nama mata kuliah praktikum */
  mataKuliah: string;
  /** Nomor pertemuan (misal: 1, 2, 3, ...) */
  pertemuan: number;
  /** Topik atau judul materi pertemuan */
  topik: string;
  /** Kelas praktikum yang dijadwalkan (misal: 'A' atau 'B') */
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
  /** Kode 4 digit presensi acak saat status DIBUKA */
  kodePresensi?: string;
  /** Waktu pembukaan sesi format HH:MM:SS */
  jamBuka?: string;
  /** Waktu penutupan sesi format HH:MM:SS */
  jamTutup?: string;
  /** Catatan tambahan atau modul sesi untuk informasi pendukung */
  catatan?: string;
  /** Total praktikan terdaftar dalam kelas ini */
  totalPraktikan: number;
}

/**
 * Entitas riwayat catatan kehadiran praktikan.
 */
export interface Presensi {
  /** Identifier unik catatan presensi (misal: 'pres-1234567890') */
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
 */
export interface PraktikumContextType {
  /** Pengguna yang sedang aktif login, atau null jika belum memilih identitas */
  currentUser: User | null;
  /** Daftar seluruh akun pengguna dummy yang tersedia */
  users: User[];
  /** Daftar seluruh sesi praktikum */
  sesiList: SesiPraktikum[];
  /** Daftar seluruh riwayat presensi */
  presensiList: Presensi[];

  /**
   * Menetapkan identitas pengguna yang sedang login.
   * @param user Data pengguna yang dipilih
   */
  login: (user: User) => void;

  /**
   * Mengakhiri sesi pengguna aktif dan kembali ke state awal.
   */
  logout: () => void;

  /**
   * Membuka sesi praktikum yang berstatus BELUM_DIBUKA (Khusus Asisten).
   * Menghasilkan kode presensi 4 digit dan mencatat jam buka.
   * @param sesiId ID sesi yang akan dibuka
   */
  bukaSesi: (sesiId: string) => ActionResult<SesiPraktikum>;

  /**
   * Menutup sesi praktikum yang berstatus DIBUKA (Khusus Asisten).
   * Mencatat jam tutup sesi.
   * @param sesiId ID sesi yang akan ditutup
   */
  tutupSesi: (sesiId: string) => ActionResult<SesiPraktikum>;

  /**
   * Melakukan pencatatan kehadiran oleh praktikan (FR-07, FR-12).
   * Menerapkan validasi anti-presensi ganda dan verifikasi kode presensi.
   * @param sesiId ID sesi yang dihadiri
   * @param kodeInput Kode 4 digit yang dimasukkan oleh praktikan
   */
  presensi: (sesiId: string, kodeInput: string) => ActionResult<Presensi>;

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
}

