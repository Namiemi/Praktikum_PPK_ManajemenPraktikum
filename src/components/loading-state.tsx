import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export interface LoadingStateProps {
  pesan?: string;
}

export function LoadingState({ pesan = 'Memuat data...' }: LoadingStateProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#208AEF" />
      {pesan ? <Text style={styles.text}>{pesan}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  text: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
