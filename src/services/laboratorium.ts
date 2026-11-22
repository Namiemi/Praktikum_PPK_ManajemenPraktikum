/**
 * @file laboratorium.ts
 * @description Service pengelolaan data laboratorium Informatika beserta titik koordinat
 * dan radius presensi (FR-31, FR-35, FR-40).
 */

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  Timestamp,
} from '@react-native-firebase/firestore';

import { db } from '@/lib/firebase';
import { Laboratorium, LaboratoriumInput } from '@/types';

function mapDocToLaboratorium(id: string, data: any): Laboratorium {
  const diperbaruiTimestamp = data.diperbaruiPada as Timestamp | undefined;
  const diperbaruiDate = diperbaruiTimestamp?.toDate
    ? diperbaruiTimestamp.toDate()
    : undefined;

  return {
    id,
    nama: data.nama ?? '',
    lokasi: data.lokasi ?? '',
    latitude: Number(data.latitude) || 0,
    longitude: Number(data.longitude) || 0,
    radius: Number(data.radius) || 0,
    dibuatOleh: data.dibuatOleh ?? '',
    diperbaruiPada: diperbaruiDate,
  };
}

/**
 * Berlangganan daftar seluruh laboratorium, diurutkan berdasarkan nama.
 */
export function subscribeLaboratorium(
  callback: (list: Laboratorium[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const q = query(collection(db, 'laboratorium'), orderBy('nama', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: Laboratorium[] = [];
      snapshot.forEach((d) => {
        list.push(mapDocToLaboratorium(d.id, d.data()));
      });
      callback(list);
    },
    (err) => {
      if (onError) onError(err);
    }
  );
}

/**
 * Berlangganan data detail satu laboratorium berdasarkan ID.
 */
export function subscribeLaboratoriumById(
  labId: string,
  callback: (lab: Laboratorium | null) => void,
  onError?: (err: unknown) => void
): () => void {
  const ref = doc(db, 'laboratorium', labId);

  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        callback(null);
        return;
      }
      callback(mapDocToLaboratorium(snap.id, snap.data()));
    },
    (err) => {
      if (onError) onError(err);
    }
  );
}

/**
 * Menambahkan data laboratorium baru (Khusus Asisten).
 * @returns ID dokumen laboratorium yang dibuat
 */
export async function tambahLaboratorium(
  input: LaboratoriumInput,
  asisten: { id: string }
): Promise<string> {
  const docRef = await addDoc(collection(db, 'laboratorium'), {
    nama: input.nama.trim(),
    lokasi: input.lokasi.trim(),
    latitude: Number(input.latitude),
    longitude: Number(input.longitude),
    radius: Number(input.radius),
    dibuatOleh: asisten.id,
  });
  return docRef.id;
}

/**
 * Mengubah data laboratorium dan mencatat waktu pembaruan.
 */
export async function ubahLaboratorium(
  labId: string,
  input: LaboratoriumInput
): Promise<void> {
  const ref = doc(db, 'laboratorium', labId);
  await updateDoc(ref, {
    nama: input.nama.trim(),
    lokasi: input.lokasi.trim(),
    latitude: Number(input.latitude),
    longitude: Number(input.longitude),
    radius: Number(input.radius),
    diperbaruiPada: serverTimestamp(),
  });
}

/**
 * Menghapus data laboratorium.
 */
export async function hapusLaboratorium(labId: string): Promise<void> {
  await deleteDoc(doc(db, 'laboratorium', labId));
}
