/**
 * @file kelas.ts
 * @description Service pengelolaan data kelas praktikum (FR-17, FR-21).
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
} from '@react-native-firebase/firestore';

import { db } from '@/lib/firebase';
import { Kelas, KelasInput, User } from '@/types';

/**
 * Berlangganan daftar kelas yang diampu oleh asisten tertentu.
 */
export function subscribeKelasAsisten(
  asistenId: string,
  callback: (kelasList: Kelas[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const q = query(
    collection(db, 'kelas'),
    where('asistenId', '==', asistenId),
    orderBy('nama', 'asc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: Kelas[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        list.push({
          id: d.id,
          nama: data.nama ?? '',
          mataKuliah: data.mataKuliah ?? '',
          asistenId: data.asistenId ?? '',
          asistenNama: data.asistenNama ?? '',
        });
      });
      callback(list);
    },
    (err) => {
      if (onError) onError(err);
    }
  );
}

/**
 * Berlangganan data detail satu kelas berdasarkan ID.
 */
export function subscribeKelasById(
  kelasId: string,
  callback: (kelas: Kelas | null) => void,
  onError?: (err: unknown) => void
): () => void {
  const ref = doc(db, 'kelas', kelasId);
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        callback(null);
        return;
      }
      const data = snap.data();
      callback({
        id: snap.id,
        nama: data?.nama ?? '',
        mataKuliah: data?.mataKuliah ?? '',
        asistenId: data?.asistenId ?? '',
        asistenNama: data?.asistenNama ?? '',
      });
    },
    (err) => {
      if (onError) onError(err);
    }
  );
}

/**
 * Menambahkan kelas baru oleh asisten.
 */
export async function tambahKelas(
  input: KelasInput,
  asisten: User
): Promise<string> {
  const docRef = await addDoc(collection(db, 'kelas'), {
    nama: input.nama.trim(),
    mataKuliah: input.mataKuliah.trim(),
    asistenId: asisten.id,
    asistenNama: asisten.nama,
    dibuatPada: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Mengubah data nama dan mata kuliah kelas.
 */
export async function ubahKelas(
  kelasId: string,
  input: KelasInput
): Promise<void> {
  const ref = doc(db, 'kelas', kelasId);
  await updateDoc(ref, {
    nama: input.nama.trim(),
    mataKuliah: input.mataKuliah.trim(),
  });
}

/**
 * Menghapus kelas dan melepas penugasan seluruh praktikan di kelas tersebut.
 */
export async function hapusKelas(kelasId: string): Promise<void> {
  const batch = writeBatch(db);

  // 1. Hapus dokumen kelas
  batch.delete(doc(db, 'kelas', kelasId));

  // 2. Kosongkan kelas dari praktikan yang terdaftar di kelas ini
  const qPeserta = query(
    collection(db, 'users'),
    where('kelas', '==', kelasId)
  );
  const pesertaSnap = await getDocs(qPeserta);
  pesertaSnap.forEach((pDoc) => {
    batch.update(pDoc.ref, { kelas: null });
  });

  await batch.commit();
}
