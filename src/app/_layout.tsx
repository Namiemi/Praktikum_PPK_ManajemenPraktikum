import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';

import { PraktikumProvider } from '@/context/praktikum-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <PraktikumProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#ffffff' },
          headerTintColor: '#000000',
          headerShadowVisible: false,
          contentStyle: { backgroundColor: '#ffffff' },
        }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
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
    </PraktikumProvider>
  );
}
