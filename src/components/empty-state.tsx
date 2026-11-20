import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  EmptyAttendanceIllustration,
  EmptyScheduleIllustration,
} from '@/components/icons/praktikum-theme-icons';

export interface EmptyStateProps {
  judul: string;
  deskripsi: string;
  ikon?: string;
  variant?: 'schedule' | 'attendance';
}

export function EmptyState({
  judul,
  deskripsi,
  variant = 'schedule',
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {variant === 'attendance' ? (
        <EmptyAttendanceIllustration width={150} height={150} />
      ) : (
        <EmptyScheduleIllustration width={205} height={186} />
      )}
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
    paddingHorizontal: 24,
    paddingVertical: 36,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    color: '#1C281C',
    textAlign: 'center',
    marginTop: 12,
  },
  description: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 19,
    color: '#5A6B5A',
    textAlign: 'center',
    paddingHorizontal: 16,
    marginTop: 6,
  },
});
