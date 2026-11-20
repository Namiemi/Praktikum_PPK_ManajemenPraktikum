import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Botanical } from '@/constants/theme';
import { StatusIzin, StatusSesi } from '@/types';
import { StatusKehadiran } from '@/utils/kehadiran';

export type BadgeStatusKey =
  | StatusSesi
  | StatusIzin
  | StatusKehadiran
  | 'belum_dibuka'
  | 'dibuka'
  | 'ditutup';

export interface StatusBadgeProps {
  status: BadgeStatusKey;
}

const STATUS_STYLES: Record<
  BadgeStatusKey,
  { label: string; bg: string; text: string }
> = {
  BELUM_DIBUKA: {
    label: 'BELUM DIBUKA',
    bg: Botanical.neutralBadgeBg,
    text: Botanical.textMuted,
  },
  belum_dibuka: {
    label: 'BELUM DIBUKA',
    bg: Botanical.neutralBadgeBg,
    text: Botanical.textMuted,
  },
  DIBUKA: {
    label: 'DIBUKA',
    bg: Botanical.sageBadgeBg,
    text: Botanical.textPrimary,
  },
  dibuka: {
    label: 'DIBUKA',
    bg: Botanical.sageBadgeBg,
    text: Botanical.textPrimary,
  },
  DITUTUP: {
    label: 'DITUTUP',
    bg: Botanical.dangerBg,
    text: Botanical.dangerText,
  },
  ditutup: {
    label: 'DITUTUP',
    bg: Botanical.dangerBg,
    text: Botanical.dangerText,
  },
  menunggu: {
    label: 'MENUNGGU',
    bg: Botanical.neutralBadgeBg,
    text: Botanical.textMuted,
  },
  diterima: {
    label: 'DITERIMA',
    bg: Botanical.sageBadgeBg,
    text: Botanical.textPrimary,
  },
  ditolak: {
    label: 'DITOLAK',
    bg: Botanical.dangerBg,
    text: Botanical.dangerText,
  },
  hadir: {
    label: 'HADIR',
    bg: Botanical.sageBadgeBg,
    text: Botanical.textPrimary,
  },
  izin: {
    label: 'IZIN',
    bg: Botanical.infoBg,
    text: Botanical.infoText,
  },
  tidak_hadir: {
    label: 'TIDAK HADIR',
    bg: Botanical.dangerBg,
    text: Botanical.dangerText,
  },
};

/**
 * Badge status seragam bergaya kapsul uppercase Botanical.
 */
export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, bg, text } = STATUS_STYLES[status];

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
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
