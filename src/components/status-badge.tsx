import { StyleSheet, Text, View } from 'react-native';

export interface StatusBadgeProps {
  status: 'belum_dibuka' | 'dibuka' | 'ditutup';
}

const STATUS_STYLES: Record<
  'belum_dibuka' | 'dibuka' | 'ditutup',
  { label: string; backgroundColor: string; textColor: string }
> = {
  belum_dibuka: {
    label: 'Belum Dibuka',
    backgroundColor: '#F2F3F5',
    textColor: '#6B7280',
  },
  dibuka: {
    label: 'Dibuka',
    backgroundColor: '#E4F2E4',
    textColor: '#2E7D32',
  },
  ditutup: {
    label: 'Ditutup',
    backgroundColor: '#FAE7E4',
    textColor: '#B3261E',
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
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#F2F3F5',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
