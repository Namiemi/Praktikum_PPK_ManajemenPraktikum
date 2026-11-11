import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';

import { LoadingState } from '@/components/loading-state';
import { OfflineBanner } from '@/components/offline-banner';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { PraktikumProvider } from '@/context/praktikum-context';

SplashScreen.preventAutoHideAsync();

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

  useEffect(() => {
    if (!initializing) {
      SplashScreen.hideAsync();
    }
  }, [initializing]);

  return (
    <PraktikumProvider>
      <StatusBar style="dark" />
      <OfflineBanner />
      <RouteGuard>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#ffffff' },
            headerTintColor: '#000000',
            headerShadowVisible: false,
            contentStyle: { backgroundColor: '#ffffff' },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="asisten" options={{ headerShown: false }} />
          <Stack.Screen name="praktikan" options={{ headerShown: false }} />
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
