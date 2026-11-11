import { Redirect } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoadingState } from '@/components/loading-state';
import { useAuth } from '@/context/auth-context';

export default function IndexScreen() {
  const { currentUser, initializing } = useAuth();

  if (initializing) {
    return <LoadingState pesan="Memuat status autentikasi..." />;
  }

  if (currentUser) {
    if (currentUser.peran === 'asisten') {
      return <Redirect href="/asisten/jadwal" />;
    }
    return <Redirect href="/praktikan/jadwal" />;
  }

  // Placeholder sementara sebelum fase auth (Fase 2) diimplementasikan
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Manajemen Praktikum</Text>
        <Text style={styles.subtitle}>
          Fondasi Firebase telah aktif. Modul autentikasi akan diimplementasikan pada fase berikutnya.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
