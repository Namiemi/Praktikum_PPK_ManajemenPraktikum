/**
 * @file dummy.ts
 * @description Sumber data awal dummy lokal untuk pengguna, sesi praktikum, dan presensi.
 * Sesuai dengan spesifikasi Tabel 4 pada README.md.
 */

import { Presensi, SesiPraktikum, User } from '@/types';

/**
 * Daftar Akun Pengguna Dummy
 * Terdiri dari 3 Asisten dan 7 Praktikan lintas Kelas A & B.
 */
export const INITIAL_USERS: User[] = [
  // --- Asisten Praktikum ---
  {
    id: 'ast-1',
    nama: 'Dimas Pratama',
    nim: '22/492100/TK/54123',
    email: 'dimas@ugm.ac.id',
    peran: 'asisten',
    kelasDiampu: ['Pemrograman Mobile A', 'Pemrograman Mobile B'],
  },
  {
    id: 'ast-2',
    nama: 'Sari Wulandari',
    nim: '22/492200/TK/54124',
    email: 'sari@ugm.ac.id',
    peran: 'asisten',
    kelasDiampu: ['Basis Data A'],
  },
  {
    id: 'ast-3',
    nama: 'Rina Kusuma',
    nim: '22/492300/TK/54125',
    email: 'rina@ugm.ac.id',
    peran: 'asisten',
    kelasDiampu: [],
  },

  // --- Praktikan Kelas A ---
  {
    id: 'prak-1',
    nama: 'Andi Saputra',
    nim: '23512001',
    email: 'andi@mail.ugm.ac.id',
    peran: 'praktikan',
    kelasId: 'kelas-a',
    kelas: 'A',
  },
  {
    id: 'prak-2',
    nama: 'Budi Santoso',
    nim: '23512002',
    email: 'budi@mail.ugm.ac.id',
    peran: 'praktikan',
    kelasId: 'kelas-a',
    kelas: 'A',
  },
  {
    id: 'prak-3',
    nama: 'Citra Lestari',
    nim: '23512003',
    email: 'citra@mail.ugm.ac.id',
    peran: 'praktikan',
    kelasId: 'kelas-a',
    kelas: 'A',
  },
  {
    id: 'prak-4',
    nama: 'Dewi Anggraini',
    nim: '23512004',
    email: 'dewi@mail.ugm.ac.id',
    peran: 'praktikan',
    kelasId: 'kelas-a',
    kelas: 'A',
  },

  // --- Praktikan Kelas B ---
  {
    id: 'prak-5',
    nama: 'Eko Nugroho',
    nim: '23512005',
    email: 'eko@mail.ugm.ac.id',
    peran: 'praktikan',
    kelasId: 'kelas-b',
    kelas: 'B',
  },
  {
    id: 'prak-6',
    nama: 'Fajar Ramadhan',
    nim: '23512006',
    email: 'fajar@mail.ugm.ac.id',
    peran: 'praktikan',
    kelasId: 'kelas-b',
    kelas: 'B',
  },
  {
    id: 'prak-7',
    nama: 'Gita Permata',
    nim: '23512007',
    email: 'gita@mail.ugm.ac.id',
    peran: 'praktikan',
    kelasId: 'kelas-b',
    kelas: 'B',
  },
];

/**
 * Daftar Sesi Praktikum Dummy
 * Mencakup variasi status: BELUM_DIBUKA, DIBUKA, dan DITUTUP.
 */
export const INITIAL_SESI: SesiPraktikum[] = [
  {
    id: 'sesi-1',
    mataKuliah: 'Pemrograman Mobile',
    pertemuan: 3,
    topik: 'State Management & Context API',
    kelasId: 'kelas-a',
    kelas: 'A',
    tanggal: '2026-10-25',
    jamMulai: '07:30',
    jamSelesai: '09:30',
    ruang: 'Lab Komputasi 1',
    asistenId: 'ast-1',
    asistenNama: 'Dimas Pratama',
    status: 'BELUM_DIBUKA',
    catatan: 'Praktikan wajib membawa laptop dengan Node.js v20+ dan Expo Go sudah terpasang.',
    totalPraktikan: 4,
  },
  {
    id: 'sesi-2',
    mataKuliah: 'Pemrograman Mobile',
    pertemuan: 3,
    topik: 'State Management & Context API',
    kelasId: 'kelas-b',
    kelas: 'B',
    tanggal: '2026-10-25',
    jamMulai: '10:00',
    jamSelesai: '12:00',
    ruang: 'Lab Komputasi 1',
    asistenId: 'ast-1',
    asistenNama: 'Dimas Pratama',
    status: 'DIBUKA',
    kodePresensi: '4821',
    jamBuka: '10:01:15',
    catatan: 'Gunakan kode presensi 4821 untuk presensi. Waktu presensi dibuka hingga 10:30.',
    totalPraktikan: 3,
  },
  {
    id: 'sesi-3',
    mataKuliah: 'Basis Data',
    pertemuan: 4,
    topik: 'Normalisasi Basis Data Relasional (1NF - 3NF)',
    kelasId: 'kelas-a',
    kelas: 'A',
    tanggal: '2026-10-24',
    jamMulai: '13:00',
    jamSelesai: '15:00',
    ruang: 'Lab Rekayasa Perangkat Lunak',
    asistenId: 'ast-2',
    asistenNama: 'Sari Wulandari',
    status: 'DITUTUP',
    kodePresensi: '9152',
    jamBuka: '13:05:00',
    jamTutup: '14:55:00',
    catatan: 'Sesi praktikum telah selesai. Tugas mandiri dikumpulkan melalui portal LMS.',
    totalPraktikan: 4,
  },
];

/**
 * Daftar Riwayat Presensi Dummy Awal
 * Mengilustrasikan presensi yang sudah tercatat pada sesi yang sedang dibuka.
 */
export const INITIAL_PRESENSI: Presensi[] = [
  {
    id: 'pres-init-1',
    sesiId: 'sesi-2',
    praktikanId: 'prak-5',
    praktikanNama: 'Eko Nugroho',
    praktikanNim: '23512005',
    waktuPresensi: '10:05:22',
  },
  {
    id: 'pres-init-2',
    sesiId: 'sesi-3',
    praktikanId: 'prak-1',
    praktikanNama: 'Andi Saputra',
    praktikanNim: '23512001',
    waktuPresensi: '13:10:04',
  },
];
