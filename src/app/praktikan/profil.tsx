import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function PraktikanProfilPlaceholder() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil Praktikan</Text>
      <Text style={styles.subtitle}>Placeholder Profil (Fondasi)</Text>
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
    color: '#111111',
  },
  subtitle: {
    fontSize: 13,
    color: '#777777',
    marginTop: 4,
  },
});
