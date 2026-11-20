import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Botanical } from '@/constants/theme';

export interface LoadingStateProps {
  pesan?: string;
}

export function LoadingState({ pesan = 'Memuat data...' }: LoadingStateProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Botanical.primary} />
      {pesan ? <Text style={styles.text}>{pesan}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Botanical.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  text: {
    marginTop: 12,
    fontSize: 14,
    color: Botanical.textMuted,
    textAlign: 'center',
  },
});
