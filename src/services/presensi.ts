/**
 * @file presensi.ts
 * @description Service pencatatan kehadiran praktikan dan pemantauan rekap presensi (FR-17, FR-23, FR-26).
 */

import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
} from '@react-native-firebase/firestore';

import { db } from '@/lib/firebase';
import { Presensi, User } from '@/types';
import { getFormattedTime } from '@/utils';

function mapDocToPresensi(sesiId: string, id: string, data: any): Presensi {
  const ts = data.waktu as Timestamp | undefined;
  const date = ts?.toDate ? ts.toDate() : new Date();

  return {
    id,
    sesiId,
    praktikanId: data.praktikanId ?? id,
    praktikanNama: data.praktikanNama ?? '',
    praktikanNim: data.praktikanNim ?? '',
    waktuPresensi: getFormattedTime(date),
    waktuAt: date,
  };
}

/**
 * Berlangganan seluruh riwayat presensi pada satu sesi praktikum.
 * Diurutkan berdasarkan waktu kehadiran paling awal (untuk rekap asisten).
 */
export function subscribePresensiSesi(
  sesiId: string,
  callback: (presensiList: Presensi[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const q = query(
    collection(db, 'sesi', sesiId, 'presensi'),
    orderBy('waktu', 'asc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: Presensi[] = [];
      snapshot.forEach((d) => {
        list.push(mapDocToPresensi(sesiId, d.id, d.data()));
      });
      callback(list);
    },
    (err) => {
      if (onError) onError(err);
    }
  );
}

/**
 * Berlangganan status presensi seorang praktikan pada sesi tertentu.
 */
export function subscribePresensiSaya(
  sesiId: string,
  uid: string,
  callback: (presensi: Presensi | null) => void,
  onError?: (err: unknown) => void
): () => void {
  const ref = doc(db, 'sesi', sesiId, 'presensi', uid);
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        callback(null);
        return;
      }
      callback(mapDocToPresensi(sesiId, snap.id, snap.data()));
    },
    (err) => {
      if (onError) onError(err);
    }
  );
}

/**
 * Mencatat presensi praktikan ke Firestore.
 * Menggunakan uid sebagai ID dokumen untuk mencegah presensi ganda (SRS-22, FR-26).
 * Kebenaran kode presensi diverifikasi oleh Firebase Security Rules.
 */
export async function catatPresensi(
  sesiId: string,
  user: User,
  kode: string
): Promise<Presensi> {
  const presensiRef = doc(db, 'sesi', sesiId, 'presensi', user.id);

  // 1. Validasi awal di klien sebelum request ke server
  const existingDoc = await getDoc(presensiRef);
  if (existingDoc.exists()) {
    throw new Error('Anda sudah melakukan presensi pada sesi ini.');
  }

  const now = new Date();
  const waktuPresensi = getFormattedTime(now);

  // 2. Tulis dokumen presensi
  await setDoc(presensiRef, {
    praktikanId: user.id,
    praktikanNama: user.nama,
    praktikanNim: user.nim,
    kode: kode.trim(),
    waktu: serverTimestamp(),
  });

  return {
    id: user.id,
    sesiId,
    praktikanId: user.id,
    praktikanNama: user.nama,
    praktikanNim: user.nim,
    waktuPresensi,
    waktuAt: now,
  };
}
