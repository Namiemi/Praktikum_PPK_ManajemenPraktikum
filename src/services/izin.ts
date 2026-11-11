/**
 * @file izin.ts
 * @description Service pengajuan izin praktikan dan persetujuan izin oleh asisten (FR-17, FR-24, FR-28).
 */

import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  Timestamp,
} from '@react-native-firebase/firestore';

import { db } from '@/lib/firebase';
import { HasilAI, Izin, SesiPraktikum, StatusAI, StatusIzin, User } from '@/types';

function mapDocToIzin(id: string, data: any): Izin {
  const diajukanTs = data.diajukanPada as Timestamp | undefined;
  const diputuskanTs = data.diputuskanPada as Timestamp | undefined;

  return {
    id,
    sesiId: data.sesiId ?? '',
    praktikanId: data.praktikanId ?? '',
    praktikanNama: data.praktikanNama ?? '',
    praktikanNim: data.praktikanNim ?? '',
    asistenId: data.asistenId ?? '',
    sesiLabel: data.sesiLabel ?? '',
    alasan: data.alasan ?? '',
    kategoriAI: data.kategoriAI ?? null,
    skorAI: data.skorAI ?? null,
    statusAI: (data.statusAI as StatusAI) || 'gagal',
    status: (data.status as StatusIzin) || 'menunggu',
    catatanAsisten: data.catatanAsisten ?? undefined,
    diajukanPada: diajukanTs?.toDate ? diajukanTs.toDate() : undefined,
    diputuskanOleh: data.diputuskanOleh ?? undefined,
    diputuskanPada: diputuskanTs?.toDate ? diputuskanTs.toDate() : undefined,
  };
}

/**
 * Berlangganan daftar seluruh izin yang diajukan oleh seorang praktikan.
 */
export function subscribeIzinPraktikan(
  uid: string,
  callback: (izinList: Izin[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const q = query(
    collection(db, 'izin'),
    where('praktikanId', '==', uid),
    orderBy('diajukanPada', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: Izin[] = [];
      snapshot.forEach((d) => {
        list.push(mapDocToIzin(d.id, d.data()));
      });
      callback(list);
    },
    (err) => {
      if (onError) onError(err);
    }
  );
}

/**
 * Berlangganan daftar izin sesi yang diampu oleh asisten.
 */
export function subscribeIzinAsisten(
  asistenId: string,
  callback: (izinList: Izin[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const q = query(
    collection(db, 'izin'),
    where('asistenId', '==', asistenId),
    orderBy('diajukanPada', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: Izin[] = [];
      snapshot.forEach((d) => {
        list.push(mapDocToIzin(d.id, d.data()));
      });
      callback(list);
    },
    (err) => {
      if (onError) onError(err);
    }
  );
}

/**
 * Mengajukan izin praktikan untuk suatu sesi praktikum.
 * Dokumen disimpan dengan ID `{sesiId}_{praktikanId}` agar satu praktikan hanya
 * memiliki satu pengajuan izin per sesi.
 */
export async function ajukanIzin(
  sesi: SesiPraktikum,
  user: User,
  alasan: string,
  hasilAI?: HasilAI
): Promise<Izin> {
  const id = `${sesi.id}_${user.id}`;
  const now = new Date();

  await setDoc(doc(db, 'izin', id), {
    sesiId: sesi.id,
    praktikanId: user.id,
    praktikanNama: user.nama,
    praktikanNim: user.nim,
    asistenId: sesi.asistenId,
    sesiLabel: `${sesi.mataKuliah} · Pertemuan ${sesi.pertemuan}`,
    alasan: alasan.trim(),
    kategoriAI: hasilAI?.kategoriAI ?? null,
    skorAI: hasilAI?.skorAI ?? null,
    statusAI: hasilAI?.statusAI ?? 'gagal',
    status: 'menunggu',
    diajukanPada: serverTimestamp(),
  });

  return {
    id,
    sesiId: sesi.id,
    praktikanId: user.id,
    praktikanNama: user.nama,
    praktikanNim: user.nim,
    asistenId: sesi.asistenId,
    sesiLabel: `${sesi.mataKuliah} · Pertemuan ${sesi.pertemuan}`,
    alasan: alasan.trim(),
    kategoriAI: hasilAI?.kategoriAI ?? null,
    skorAI: hasilAI?.skorAI ?? null,
    statusAI: hasilAI?.statusAI ?? 'gagal',
    status: 'menunggu',
    diajukanPada: now,
  };
}

/**
 * Memutuskan status pengajuan izin (Diterima / Ditolak) oleh asisten.
 */
export async function putuskanIzin(
  izinId: string,
  keputusan: 'diterima' | 'ditolak',
  asistenId: string,
  catatan?: string
): Promise<void> {
  const ref = doc(db, 'izin', izinId);
  await updateDoc(ref, {
    status: keputusan,
    catatanAsisten: catatan ? catatan.trim() : null,
    diputuskanOleh: asistenId,
    diputuskanPada: serverTimestamp(),
  });
}
