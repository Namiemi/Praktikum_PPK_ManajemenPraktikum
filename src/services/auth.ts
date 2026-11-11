/**
 * @file auth.ts
 * @description Service autentikasi pengguna dan langganan profil pengguna dari Cloud Firestore (FR-16).
 */

import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User as FirebaseAuthUser,
} from '@react-native-firebase/auth';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from '@react-native-firebase/firestore';

import { auth, db } from '@/lib/firebase';
import { RegisterInput, User } from '@/types';

/**
 * Berlangganan perubahan status autentikasi Firebase.
 */
export function subscribeAuth(
  callback: (user: FirebaseAuthUser | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * Masuk menggunakan email dan password.
 */
export async function login(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email.trim(), password);
}

/**
 * Pendaftaran pengguna baru (asisten / praktikan).
 * Untuk asisten, email wajib terdaftar di koleksi asistenWhitelist/{email}.
 */
export async function register(input: RegisterInput): Promise<void> {
  const emailClean = input.email.trim().toLowerCase();

  // 1. Buat akun di Firebase Authentication
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    emailClean,
    input.password
  );
  const user = userCredential.user;

  try {
    // 2. Validasi whitelist jika peran asisten
    if (input.peran === 'asisten') {
      const whitelistDoc = await getDoc(doc(db, 'asistenWhitelist', emailClean));
      if (!whitelistDoc.exists()) {
        throw new Error('Email ini tidak terdaftar sebagai asisten.');
      }
    }

    // 3. Simpan dokumen profil di Cloud Firestore: users/{uid}
    await setDoc(doc(db, 'users', user.uid), {
      nama: input.nama.trim(),
      nim: input.nim.trim(),
      email: emailClean,
      peran: input.peran,
      kelas: null,
      dibuatPada: serverTimestamp(),
    });
  } catch (err) {
    // Bersihkan akun Auth jika penulisan profil atau validasi whitelist gagal
    try {
      await deleteUser(user);
    } catch {
      // Abaikan jika pembersihan akun auth gagal
    }
    throw err;
  }
}

/**
 * Keluar dari sesi login aktif.
 */
export async function logout(): Promise<void> {
  await signOut(auth);
}

/**
 * Berlangganan profil dokumen user di `users/{uid}` secara real-time.
 */
export function subscribeUserProfile(
  uid: string,
  callback: (user: User | null) => void,
  onError?: (err: unknown) => void
): () => void {
  const userRef = doc(db, 'users', uid);

  let unsubsKelas: (() => void) | null = null;

  const unsubscribeUser = onSnapshot(
    userRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        if (unsubsKelas) {
          unsubsKelas();
          unsubsKelas = null;
        }
        callback(null);
        return;
      }

      const data = snapshot.data();
      if (!data) {
        callback(null);
        return;
      }

      const peran = data.peran as 'asisten' | 'praktikan';
      const kelasId = data.kelas as string | null | undefined;

      if (peran === 'praktikan') {
        if (!kelasId) {
          callback({
            id: snapshot.id,
            nama: data.nama ?? '',
            nim: data.nim ?? '',
            email: data.email ?? '',
            peran: 'praktikan',
            kelasId: null,
            kelas: undefined,
          });
          return;
        }

        // Langganan detail kelas praktikan untuk mendapatkan nama kelas secara live
        if (unsubsKelas) unsubsKelas();
        unsubsKelas = onSnapshot(
          doc(db, 'kelas', kelasId),
          (kelasSnap) => {
            const namaKelas = kelasSnap.exists()
              ? (kelasSnap.data()?.nama as string)
              : undefined;
            callback({
              id: snapshot.id,
              nama: data.nama ?? '',
              nim: data.nim ?? '',
              email: data.email ?? '',
              peran: 'praktikan',
              kelasId,
              kelas: namaKelas,
            });
          },
          () => {
            // Jika gagal baca kelas, fallback tanpa nama kelas
            callback({
              id: snapshot.id,
              nama: data.nama ?? '',
              nim: data.nim ?? '',
              email: data.email ?? '',
              peran: 'praktikan',
              kelasId,
              kelas: undefined,
            });
          }
        );
      } else {
        // Asisten: ambil daftar nama kelas yang diampu
        if (unsubsKelas) unsubsKelas();
        const qKelas = query(
          collection(db, 'kelas'),
          where('asistenId', '==', snapshot.id)
        );
        unsubsKelas = onSnapshot(
          qKelas,
          (kelasSnaps) => {
            const daftarKelas: string[] = [];
            kelasSnaps.forEach((kDoc) => {
              const kData = kDoc.data();
              if (kData?.nama) {
                daftarKelas.push(kData.nama);
              }
            });
            callback({
              id: snapshot.id,
              nama: data.nama ?? '',
              nim: data.nim ?? '',
              email: data.email ?? '',
              peran: 'asisten',
              kelasDiampu: daftarKelas,
            });
          },
          () => {
            callback({
              id: snapshot.id,
              nama: data.nama ?? '',
              nim: data.nim ?? '',
              email: data.email ?? '',
              peran: 'asisten',
              kelasDiampu: [],
            });
          }
        );
      }
    },
    (error) => {
      if (onError) onError(error);
    }
  );

  return () => {
    unsubscribeUser();
    if (unsubsKelas) {
      unsubsKelas();
      unsubsKelas = null;
    }
  };
}
