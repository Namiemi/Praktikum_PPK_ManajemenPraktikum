/**
 * @file users.ts
 * @description Service pengelolaan data pengguna (praktikan) untuk asisten (FR-21).
 */

import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from '@react-native-firebase/firestore';

import { db } from '@/lib/firebase';
import { User } from '@/types';

/**
 * Berlangganan daftar seluruh praktikan yang terdaftar di sistem.
 * Digunakan oleh asisten saat memilih peserta kelas.
 */
export function subscribePraktikan(
  callback: (praktikanList: User[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const q = query(
    collection(db, 'users'),
    where('peran', '==', 'praktikan'),
    orderBy('nama', 'asc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: User[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        list.push({
          id: d.id,
          nama: data.nama ?? '',
          nim: data.nim ?? '',
          email: data.email ?? '',
          peran: 'praktikan',
          kelasId: data.kelas ?? null,
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
 * Mengubah penugasan kelas seorang praktikan.
 * @param uid ID pengguna praktikan
 * @param kelasId ID kelas yang ditugaskan, atau null jika dikeluarkan dari kelas
 */
export async function setKelasPraktikan(
  uid: string,
  kelasId: string | null
): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    kelas: kelasId,
  });
}
