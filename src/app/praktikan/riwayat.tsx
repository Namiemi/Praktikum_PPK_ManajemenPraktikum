import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

/**
 * Halaman Placeholder Riwayat Praktikan (Sesuai README: 'halaman placeholder' di branch fondasi).
 * Modul ini akan dikerjakan sepenuhnya oleh Naufal (FR-13).
 */
export default function RiwayatPraktikanPlaceholder() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Placeholder Riwayat Kehadiran</Text>
      <Text style={styles.subtitle}>Modul ini akan dikerjakan oleh Naufal (FR-13)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    padding: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  subtitle: {
    fontSize: 13,
    color: '#888888',
    marginTop: 4,
  },
});

