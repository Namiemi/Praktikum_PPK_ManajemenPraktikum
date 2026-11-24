import notifee, { EventType } from '@notifee/react-native';
import { setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';

import { LoadingState } from '@/components/loading-state';
import { OfflineBanner } from '@/components/offline-banner';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { PraktikumProvider } from '@/context/praktikum-context';
import { useNotifikasi } from '@/hooks/use-notifikasi';
import { messaging } from '@/lib/firebase';
import { buatSaluranNotifikasi, tampilkanNotifikasiLokal } from '@/services';

SplashScreen.preventAutoHideAsync();

// Handler pesan FCM di latar belakang/quit. Wajib didaftarkan di level modul,
// bukan di dalam komponen, agar pesan tetap diproses saat aplikasi tidak aktif.
setBackgroundMessageHandler(messaging, async (remoteMessage) => {
  const judul = remoteMessage.notification?.title ?? 'Notifikasi Praktikum';
  const pesan =
    remoteMessage.notification?.body ??
    'Ada pembaruan kegiatan praktikum. Silakan buka aplikasi.';

  const data = Object.fromEntries(
    Object.entries(remoteMessage.data ?? {}).map(([key, value]) => [
      key,
      String(value),
    ])
  );

  await tampilkanNotifikasiLokal(
    remoteMessage.messageId ?? `fcm-${Date.now()}`,
    judul,
    pesan,
    data
  );
});

// Event Notifee di latar belakang. Notifee sudah menampilkan notifikasinya;
// di sini saluran dipastikan tersedia saat pengguna menekan notifikasi.
notifee.onBackgroundEvent(async (event) => {
  if (event.type === EventType.PRESS) {
    await buatSaluranNotifikasi();
  }
});

function RouteGuard({ children }: { children: React.ReactNode }) {
  const { currentUser, initializing } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (initializing) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!currentUser) {
      // Belum login: arahkan ke login jika mencoba mengakses halaman di luar (auth)
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else {
      // Sudah login: jika berada di halaman login/register atau root, arahkan ke dashboard peran
      if (inAuthGroup || !segments[0]) {
        if (currentUser.peran === 'asisten') {
          router.replace('/asisten/jadwal');
        } else {
          router.replace('/praktikan/jadwal');
        }
      } else if (segments[0] === 'asisten' && currentUser.peran !== 'asisten') {
        // Praktikan mencoba akses halaman asisten
        router.replace('/praktikan/jadwal');
      } else if (segments[0] === 'praktikan' && currentUser.peran !== 'praktikan') {
        // Asisten mencoba akses halaman praktikan
        router.replace('/asisten/jadwal');
      }
    }
  }, [currentUser, initializing, segments, router]);

  if (initializing) {
    return <LoadingState pesan="Memeriksa sesi login..." />;
  }

  return <>{children}</>;
}

function RootContent() {
  const { initializing } = useAuth();
  useNotifikasi();
  useEffect(() => {
    if (!initializing) {
      SplashScreen.hideAsync();
    }
  }, [initializing]);

  return (
    <PraktikumProvider>
      <StatusBar style="light" />
      <OfflineBanner />
      <RouteGuard>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#2E4028' },
            headerTintColor: '#FDFBF7',
            headerTitleStyle: { fontWeight: '700', color: '#FDFBF7' },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: '#FDFBF7' },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="asisten" options={{ headerShown: false }} />
          <Stack.Screen name="praktikan" options={{ headerShown: false }} />
          <Stack.Screen
            name="presensi/[sesiId]"
            options={{ title: 'Presensi', headerBackTitle: 'Kembali' }}
          />
          <Stack.Screen
            name="sesi/[id]"
            options={{
              title: 'Detail Sesi',
              headerBackTitle: 'Kembali',
            }}
          />
        </Stack>
      </RouteGuard>
    </PraktikumProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootContent />
    </AuthProvider>
  );
}
