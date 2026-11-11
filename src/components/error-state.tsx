import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export interface ErrorStateProps {
  judul?: string;
  pesan: string;
  onRetry?: () => void;
  teksRetry?: string;
}

export function ErrorState({
  judul = 'Terjadi Kesalahan',
  pesan,
  onRetry,
  teksRetry = 'Coba Lagi',
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.title}>{judul}</Text>
      <Text style={styles.description}>{pesan}</Text>
      {onRetry ? (
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel={teksRetry}
        >
          <Text style={styles.buttonText}>{teksRetry}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 24,
  },
  icon: {
    fontSize: 48,
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    color: '#1C281C',
    textAlign: 'center',
    marginTop: 16,
  },
  description: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#208AEF',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
