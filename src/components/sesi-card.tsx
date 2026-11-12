import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SesiPraktikum, StatusSesi } from '@/types';
import { formatDateIndo } from '@/utils';

import { StatusBadge, StatusBadgeProps } from './status-badge';

const BADGE_STATUS: Record<StatusSesi, StatusBadgeProps['status']> = {
  BELUM_DIBUKA: 'belum_dibuka',
  DIBUKA: 'dibuka',
  DITUTUP: 'ditutup',
};

export interface SesiCardProps {
  sesi: SesiPraktikum;
  onPress: () => void;
  /** Tanda kehadiran praktikan pada sesi ini */
  tanda?: 'hadir' | 'izin';
}

export function SesiCard({ sesi, onPress, tanda }: SesiCardProps) {
  const tandaLabel = tanda === 'hadir' ? 'Hadir' : tanda === 'izin' ? 'Izin' : null;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${sesi.mataKuliah} pertemuan ${sesi.pertemuan}${
        tandaLabel ? `, ${tandaLabel}` : ''
      }`}
    >
      <View style={styles.cardHeader}>
        {tandaLabel ? (
          <View style={[styles.tandaBadge, tanda === 'izin' && styles.izinBadge]}>
            <Text style={[styles.tandaText, tanda === 'izin' && styles.izinText]}>
              {tandaLabel}
            </Text>
          </View>
        ) : null}
        <Text style={styles.cardTitle} numberOfLines={2}>
          {sesi.mataKuliah} · Pertemuan {sesi.pertemuan}
        </Text>
        <StatusBadge status={BADGE_STATUS[sesi.status]} />
      </View>

      <View style={styles.cardBody}>
        {sesi.topik ? (
          <Text style={styles.topikText} numberOfLines={1}>
            {sesi.topik}
          </Text>
        ) : null}
        <Text style={styles.detailText}>
          {formatDateIndo(sesi.tanggal)} · {sesi.jamMulai} - {sesi.jamSelesai} WIB
        </Text>
        <Text style={styles.detailText}>
          Kelas {sesi.kelas} · {sesi.ruang}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAECE3',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#1C281C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    color: '#1C281C',
  },
  tandaBadge: {
    backgroundColor: '#E4F2E4',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 8,
  },
  tandaText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2E7D32',
  },
  izinBadge: {
    backgroundColor: '#E3EEF9',
  },
  izinText: {
    color: '#1E5A96',
  },
  cardBody: {
    marginTop: 8,
  },
  topikText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: '#1C281C',
    marginBottom: 2,
  },
  detailText: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
    color: '#4A4A4A',
  },
});
