import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function IndexPlaceholder() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manajemen Praktikum</Text>
      <Text style={styles.subtitle}>Halaman Pilih Peran (Placeholder Fondasi)</Text>
      <Pressable
        style={styles.button}
        onPress={() => router.push('/asisten')}>
        <Text style={styles.buttonText}>Buka Menu Asisten</Text>
      </Pressable>
      <Pressable
        style={[styles.button, { marginTop: 8 }]}
        onPress={() => router.push('/praktikan')}>
        <Text style={styles.buttonText}>Buka Menu Praktikan</Text>
      </Pressable>
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
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#111111',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
