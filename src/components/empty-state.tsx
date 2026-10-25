import { StyleSheet, Text, View } from 'react-native';

export interface EmptyStateProps {
  judul: string;
  deskripsi: string;
  ikon?: string;
}

export function EmptyState({
  judul,
  deskripsi,
  ikon = '📭',
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{ikon}</Text>
      <Text style={styles.title}>{judul}</Text>
      <Text style={styles.description}>{deskripsi}</Text>
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
    fontSize: 56,
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
  },
});
