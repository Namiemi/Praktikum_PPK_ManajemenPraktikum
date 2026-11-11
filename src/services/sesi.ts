/**
 * @file sesi.ts
 * @description Service pengelolaan data sesi praktikum, pembukaan, dan penutupan sesi (FR-17, FR-21, FR-22).
 */

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  Timestamp,
} from '@react-native-firebase/firestore';

import { db } from '@/lib/firebase';
import { SesiInput, SesiPraktikum, StatusSesi, User } from '@/types';
import { generateKodePresensi, getFormattedTime } from '@/utils';

function mapDocToSesi(id: string, data: any): SesiPraktikum {
  const dibukaTimestamp = data.dibukaPada as Timestamp | undefined;
  const ditutupTimestamp = data.ditutupPada as Timestamp | undefined;

  const dibukaDate = dibukaTimestamp?.toDate ? dibukaTimestamp.toDate() : undefined;
  const ditutupDate = ditutupTimestamp?.toDate ? ditutupTimestamp.toDate() : undefined;

  return {
    id,
    mataKuliah: data.mataKuliah ?? '',
    pertemuan: Number(data.pertemuan) || 1,
    topik: data.topik ?? '',
    kelasId: data.kelasId ?? '',
    kelas: data.kelas ?? '',
    tanggal: data.tanggal ?? '',
    jamMulai: data.jamMulai ?? '',
    jamSelesai: data.jamSelesai ?? '',
    ruang: data.ruang ?? '',
    catatan: data.catatan,
    asistenId: data.asistenId ?? '',
    asistenNama: data.asistenNama ?? '',
    status: (data.status as StatusSesi) || 'BELUM_DIBUKA',
    dibukaPada: dibukaDate,
    ditutupPada: ditutupDate,
    jamBuka: dibukaDate ? getFormattedTime(dibukaDate) : undefined,
    jamTutup: ditutupDate ? getFormattedTime(ditutupDate) : undefined,
    totalPraktikan: 0, // Akan di-enrich di context untuk asisten
  };
}

/**
 * Berlangganan daftar seluruh sesi yang diampu oleh seorang asisten.
 */
export function subscribeSesiAsisten(
  asistenId: string,
  callback: (sesiList: SesiPraktikum[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const q = query(
    collection(db, 'sesi'),
    where('asistenId', '==', asistenId),
    orderBy('tanggal', 'asc'),
    orderBy('jamMulai', 'asc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: SesiPraktikum[] = [];
      snapshot.forEach((d) => {
        list.push(mapDocToSesi(d.id, d.data()));
      });
      callback(list);
    },
    (err) => {
      if (onError) onError(err);
    }
  );
}

/**
 * Berlangganan daftar sesi untuk kelas tertentu (digunakan oleh praktikan).
 */
export function subscribeSesiKelas(
  kelasId: string,
  callback: (sesiList: SesiPraktikum[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const q = query(
    collection(db, 'sesi'),
    where('kelasId', '==', kelasId),
    orderBy('tanggal', 'asc'),
    orderBy('jamMulai', 'asc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: SesiPraktikum[] = [];
      snapshot.forEach((d) => {
        list.push(mapDocToSesi(d.id, d.data()));
      });
      callback(list);
    },
    (err) => {
      if (onError) onError(err);
    }
  );
}

/**
 * Berlangganan kode presensi sesi (khusus asisten pemilik sesi).
 */
export function subscribeKode(
  sesiId: string,
  callback: (kode: string | null) => void,
  onError?: (err: unknown) => void
): () => void {
  const ref = doc(db, 'sesi', sesiId, 'rahasia', 'kode');
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        callback(null);
        return;
      }
      const data = snap.data();
      callback((data?.kode as string) ?? null);
    },
    (err) => {
      if (onError) onError(err);
    }
  );
}

/**
 * Menambah sesi praktikum baru (Khusus Asisten).
 */
export async function tambahSesi(
  input: SesiInput,
  asisten: User
): Promise<string> {
  const docRef = await addDoc(collection(db, 'sesi'), {
    mataKuliah: input.mataKuliah.trim(),
    pertemuan: Number(input.pertemuan),
    topik: input.topik.trim(),
    kelasId: input.kelasId,
    kelas: input.kelas.trim(),
    tanggal: input.tanggal.trim(),
    jamMulai: input.jamMulai.trim(),
    jamSelesai: input.jamSelesai.trim(),
    ruang: input.ruang.trim(),
    catatan: input.catatan ? input.catatan.trim() : null,
    asistenId: asisten.id,
    asistenNama: asisten.nama,
    status: 'BELUM_DIBUKA',
    dibuatPada: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Mengubah rincian sesi praktikum.
 */
export async function ubahSesi(
  sesiId: string,
  input: SesiInput
): Promise<void> {
  const ref = doc(db, 'sesi', sesiId);
  await updateDoc(ref, {
    mataKuliah: input.mataKuliah.trim(),
    pertemuan: Number(input.pertemuan),
    topik: input.topik.trim(),
    kelasId: input.kelasId,
    kelas: input.kelas.trim(),
    tanggal: input.tanggal.trim(),
    jamMulai: input.jamMulai.trim(),
    jamSelesai: input.jamSelesai.trim(),
    ruang: input.ruang.trim(),
    catatan: input.catatan ? input.catatan.trim() : null,
  });
}

/**
 * Menghapus sesi beserta data presensi dan rahasia kodenya.
 */
export async function hapusSesi(sesiId: string): Promise<void> {
  const batch = writeBatch(db);

  // 1. Hapus subkoleksi presensi
  const presensiSnap = await getDocs(
    collection(db, 'sesi', sesiId, 'presensi')
  );
  presensiSnap.forEach((pDoc) => {
    batch.delete(pDoc.ref);
  });

  // 2. Hapus rahasia/kode
  batch.delete(doc(db, 'sesi', sesiId, 'rahasia', 'kode'));

  // 3. Hapus dokumen sesi
  batch.delete(doc(db, 'sesi', sesiId));

  await batch.commit();
}

/**
 * Membuka sesi praktikum: mengubah status menjadi DIBUKA,
 * mencatat waktu dibuka, dan menyimpan kode presensi 4 digit di `sesi/{id}/rahasia/kode`.
 */
export async function bukaSesi(sesiId: string): Promise<string> {
  const kode = generateKodePresensi();
  const batch = writeBatch(db);

  batch.update(doc(db, 'sesi', sesiId), {
    status: 'DIBUKA',
    dibukaPada: serverTimestamp(),
  });

  batch.set(doc(db, 'sesi', sesiId, 'rahasia', 'kode'), {
    kode,
  });

  await batch.commit();
  return kode;
}

/**
 * Menutup sesi praktikum: mengubah status menjadi DITUTUP
 * dan mencatat waktu ditutup.
 */
export async function tutupSesi(sesiId: string): Promise<void> {
  await updateDoc(doc(db, 'sesi', sesiId), {
    status: 'DITUTUP',
    ditutupPada: serverTimestamp(),
  });
}
