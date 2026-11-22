/**
 * @file notification.ts
 * @description Service notifikasi kegiatan praktikum (FR-31, FR-40).
 *
 * Notifikasi pada Sprint 3 bersifat sinkronisasi event Firestore: listener koleksi
 * `notifikasi` menampilkan notifikasi lokal di perangkat penerima. Ini BUKAN push
 * server melalui Cloud Functions, sehingga notifikasi tidak diterima bila aplikasi
 * ditutup paksa (force stop) oleh pengguna.
 */

import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  type Event as NotifeeEvent,
} from '@notifee/react-native';
import {
  getMessaging,
  getToken,
  onMessage,
  onTokenRefresh,
  requestPermission,
  type RemoteMessage,
} from '@react-native-firebase/messaging';
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from '@react-native-firebase/firestore';

import { db } from '@/lib/firebase';
import { Notifikasi, NotifikasiInput, TipeNotifikasi } from '@/types';

const CHANNEL_ID = 'praktikum';

/**
 * Hasil permintaan izin notifikasi.
 */
export interface HasilIzinNotifikasi {
  granted: boolean;
  status: AuthorizationStatus;
}

function mapDocToNotifikasi(id: string, data: any): Notifikasi {
  const dibuatTimestamp = data.dibuatPada as Timestamp | undefined;
  const dibuatDate = dibuatTimestamp?.toDate
    ? dibuatTimestamp.toDate()
    : undefined;

  return {
    id,
    tipe: (data.tipe as TipeNotifikasi) ?? 'SESI_DIBUKA',
    judul: data.judul ?? '',
    pesan: data.pesan ?? '',
    sesiId: data.sesiId ?? undefined,
    kelasId: data.kelasId ?? undefined,
    targetUid: data.targetUid ?? '',
    dibuatPada: dibuatDate,
  };
}

/**
 * Meminta izin notifikasi: izin FCM, izin Notifee, dan POST_NOTIFICATIONS
 * (Android 13+ ditangani oleh Notifee).
 */
export async function requestIzinNotifikasi(): Promise<HasilIzinNotifikasi> {
  const messaging = getMessaging();

  // Permintaan izin FCM (terutama iOS). Kegagalan FCM tidak menghalangi
  // notifikasi lokal Notifee, jadi hasil akhir mengikuti status Notifee.
  try {
    await requestPermission(messaging);
  } catch {
    // Abaikan; status izin sebenarnya dibaca dari Notifee di bawah.
  }

  const settings = await notifee.requestPermission();
  const status = settings.authorizationStatus;
  const granted =
    status === AuthorizationStatus.AUTHORIZED ||
    status === AuthorizationStatus.PROVISIONAL;

  return { granted, status };
}

/**
 * Mengambil token FCM perangkat.
 * @returns Token FCM, atau `null` bila belum tersedia/gagal
 */
export async function ambilTokenFCM(): Promise<string | null> {
  try {
    return await getToken(getMessaging());
  } catch {
    return null;
  }
}

/**
 * Berlangganan perubahan token FCM.
 * @returns Fungsi untuk berhenti berlangganan
 */
export function langgananRefreshTokenFCM(
  callback: (token: string) => void
): () => void {
  return onTokenRefresh(getMessaging(), callback);
}

/**
 * Menyimpan token FCM ke dokumen `users/{uid}.fcmToken`.
 */
export async function simpanTokenFCM(uid: string, token: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid), {
    fcmToken: token,
  });
}

/**
 * Membuat saluran notifikasi Android untuk kegiatan praktikum.
 */
export async function buatSaluranNotifikasi(): Promise<void> {
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Notifikasi Praktikum',
    description: 'Pemberitahuan sesi, jadwal, dan keputusan izin praktikum.',
    importance: AndroidImportance.HIGH,
  });
}

/**
 * Menampilkan notifikasi lokal di perangkat.
 * @param id ID notifikasi (dipakai untuk mengganti notifikasi dengan ID sama)
 * @param judul Judul notifikasi
 * @param pesan Isi notifikasi
 * @param data Data tambahan yang dapat dibaca saat notifikasi dibuka
 */
export async function tampilkanNotifikasiLokal(
  id: string,
  judul: string,
  pesan: string,
  data?: Record<string, string>
): Promise<void> {
  await buatSaluranNotifikasi();
  await notifee.displayNotification({
    id,
    title: judul,
    body: pesan,
    data,
    android: {
      channelId: CHANNEL_ID,
      pressAction: {
        id: 'default',
      },
    },
  });
}

/**
 * Menulis dokumen notifikasi ke koleksi `notifikasi`.
 * Dipanggil Sofwan dari aksi `bukaSesi`, `ubahSesi`, dan `putuskanIzin`.
 * @returns ID dokumen notifikasi yang dibuat
 */
export async function tulisNotifikasi(
  input: NotifikasiInput
): Promise<string> {
  const docRef = await addDoc(collection(db, 'notifikasi'), {
    tipe: input.tipe,
    judul: input.judul.trim(),
    pesan: input.pesan.trim(),
    sesiId: input.sesiId ?? null,
    kelasId: input.kelasId ?? null,
    targetUid: input.targetUid,
    dibuatPada: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Berlangganan notifikasi milik satu pengguna, terbaru lebih dahulu.
 */
export function langgananNotifikasi(
  targetUid: string,
  callback: (list: Notifikasi[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const q = query(
    collection(db, 'notifikasi'),
    where('targetUid', '==', targetUid)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: Notifikasi[] = [];
      snapshot.forEach((d) => {
        list.push(mapDocToNotifikasi(d.id, d.data()));
      });
      list.sort(
        (a, b) =>
          (b.dibuatPada?.getTime() ?? 0) - (a.dibuatPada?.getTime() ?? 0)
      );
      callback(list);
    },
    (err) => {
      if (onError) onError(err);
    }
  );
}

/**
 * Memasang penerima pesan FCM saat aplikasi di foreground.
 * @returns Fungsi untuk berhenti berlangganan
 */
export function pasangPenerimaPesanForeground(
  callback: (message: RemoteMessage) => void
): () => void {
  return onMessage(getMessaging(), callback);
}

/**
 * Memasang penerima event Notifee saat aplikasi di foreground.
 * @returns Fungsi untuk berhenti berlangganan
 */
export function pasangPenerimaNotifeeForeground(
  callback: (event: NotifeeEvent) => void
): () => void {
  return notifee.onForegroundEvent(callback);
}
