import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  CardCornerLeafOrnament,
  CheckIcon,
  MapPinIcon,
} from '@/components/icons/praktikum-theme-icons';
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
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={2}>
          {sesi.mataKuliah} - Kelas {sesi.kelas}
        </Text>
        <View style={styles.kelasCircle}>
          <Text style={styles.kelasCircleText}>{sesi.kelas}</Text>
        </View>
      </View>

      <Text style={styles.topikText} numberOfLines={1}>
        Pertemuan {sesi.pertemuan}
        {sesi.topik ? `: ${sesi.topik}` : ''}
      </Text>

      <View style={styles.locationRow}>
        <MapPinIcon size={13} color="#5A6B5A" />
        <Text style={styles.subInfoText}>
          {sesi.ruang} • {formatDateIndo(sesi.tanggal)} ({sesi.jamMulai} -{' '}
          {sesi.jamSelesai})
        </Text>
      </View>

      <View style={styles.footerRow}>
        <View style={styles.badgeGroup}>
          <StatusBadge status={BADGE_STATUS[sesi.status]} />
          {tandaLabel ? (
            <View
              style={[
                styles.tandaBadge,
                tanda === 'izin' ? styles.izinBadge : styles.hadirBadge,
              ]}
            >
              {tanda === 'hadir' ? (
                <CheckIcon size={11} color="#2D3E2D" />
              ) : null}
              <Text
                style={[
                  styles.tandaText,
                  tanda === 'izin' ? styles.izinText : styles.hadirText,
                ]}
              >
                {tandaLabel}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.cornerOrnament} pointerEvents="none">
        <CardCornerLeafOrnament width={72} height={72} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6E4DD',
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
    color: '#1C281C',
  },
  kelasCircle: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    backgroundColor: '#344E38',
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
    color: '#4A5D4A',
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
    color: '#5A6B5A',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingRight: 48,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  tandaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  hadirBadge: {
    backgroundColor: '#E5EAD7',
  },
  izinBadge: {
    backgroundColor: '#EFE6CD',
  },
  tandaText: {
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  hadirText: {
    color: '#2D3E2D',
  },
  izinText: {
    color: '#5A4922',
  },
  cornerOrnament: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
});
