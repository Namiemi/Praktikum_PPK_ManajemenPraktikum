import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AlertCircleIcon } from '@/components/icons/modal-icons';
import { Botanical } from '@/constants/theme';

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
      <AlertCircleIcon size={58} />
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
    backgroundColor: Botanical.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 24,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 23,
    color: Botanical.textPrimary,
    textAlign: 'center',
    marginTop: 14,
  },
  description: {
    fontSize: 13.5,
    fontWeight: '400',
    lineHeight: 20,
    color: Botanical.textMuted,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  button: {
    backgroundColor: Botanical.primary,
    paddingVertical: 12,
    paddingHorizontal: 26,
    borderRadius: 14,
  },
  buttonPressed: {
    opacity: 0.84,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
