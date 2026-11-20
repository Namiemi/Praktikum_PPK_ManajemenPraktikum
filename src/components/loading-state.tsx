import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export interface LoadingStateProps {
  pesan?: string;
}

export function LoadingState({ pesan = 'Memuat data...' }: LoadingStateProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#344E38" />
      {pesan ? <Text style={styles.text}>{pesan}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  text: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
    color: '#5A6B5A',
    textAlign: 'center',
  },
});
