import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  CardCornerLeafOrnament,
  MapPinIcon,
} from '@/components/icons/praktikum-theme-icons';
import { StatusBadge } from '@/components/status-badge';
import { Botanical } from '@/constants/theme';
import { SesiPraktikum } from '@/types';
import { formatDateIndo } from '@/utils';

export interface SesiCardProps {
  sesi: SesiPraktikum;
  onPress: () => void;
  /** Tanda kehadiran praktikan pada sesi ini */
  tanda?: 'hadir' | 'izin';
}

/**
 * Kartu item jadwal sesi praktikum untuk daftar Jadwal Praktikan,
 * diselaraskan dengan AsistenSesiCard (tema Botanical).
 */
export function SesiCard({ sesi, onPress, tanda }: SesiCardProps) {
  const tandaLabel = tanda === 'hadir' ? 'Hadir' : tanda === 'izin' ? 'Izin' : null;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${sesi.mataKuliah} Kelas ${sesi.kelas} pertemuan ${sesi.pertemuan}${
        tandaLabel ? `, ${tandaLabel}` : ''
      }`}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={2}>
          {sesi.mataKuliah} - Kelas {sesi.kelas}
        </Text>
        <View style={styles.kelasCircle}>
          <Text style={styles.kelasCircleText}>{sesi.kelas}</Text>
        </View>
      </View>

      <Text style={styles.topikText} numberOfLines={1}>
        Pertemuan {sesi.pertemuan}: {sesi.topik}
      </Text>

      <View style={styles.locationRow}>
        <MapPinIcon size={13} color={Botanical.textMuted} />
        <Text style={styles.subInfoText}>
          {sesi.ruang} • {formatDateIndo(sesi.tanggal)} ({sesi.jamMulai} -{' '}
          {sesi.jamSelesai})
        </Text>
      </View>

      <View style={styles.footerRow}>
        <StatusBadge status={sesi.status} />
        {tanda ? <StatusBadge status={tanda} /> : null}
      </View>

      <View style={styles.cornerOrnament} pointerEvents="none">
        <CardCornerLeafOrnament width={72} height={72} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Botanical.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Botanical.border,
    padding: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  cardPressed: {
    opacity: 0.86,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    color: Botanical.textPrimary,
  },
  kelasCircle: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    backgroundColor: Botanical.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kelasCircleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  topikText: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    color: Botanical.textSecondary,
    marginTop: 3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
    paddingRight: 48,
  },
  subInfoText: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: Botanical.textMuted,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
    paddingRight: 44,
  },
  cornerOrnament: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
});
