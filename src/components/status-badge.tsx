import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface StatusBadgeProps {
  status: 'belum_dibuka' | 'dibuka' | 'ditutup';
}

const STATUS_STYLES: Record<
  'belum_dibuka' | 'dibuka' | 'ditutup',
  { label: string; backgroundColor: string; textColor: string }
> = {
  belum_dibuka: {
    label: 'BELUM DIBUKA',
    backgroundColor: '#EAE8E1',
    textColor: '#5A6B5A',
  },
  dibuka: {
    label: 'DIBUKA',
    backgroundColor: '#C8D7B8',
    textColor: '#1C281C',
  },
  ditutup: {
    label: 'DITUTUP',
    backgroundColor: '#F4DFDA',
    textColor: '#9E3B2B',
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, backgroundColor, textColor } = STATUS_STYLES[status];

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={[styles.badgeText, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});
