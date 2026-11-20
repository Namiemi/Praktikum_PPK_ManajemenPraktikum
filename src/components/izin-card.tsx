/**
 * @file izin-card.tsx
 * @description Kartu pengajuan izin praktikan bergaya Botanical selaras dengan IzinReviewCard (FR-28, FR-29).
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CardCornerLeafOrnament } from '@/components/icons/praktikum-theme-icons';
import { StatusBadge } from '@/components/status-badge';
import { Botanical } from '@/constants/theme';
import { Izin } from '@/types';
import { formatDateIndo } from '@/utils';

function tanggalIso(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export interface IzinCardProps {
  izin: Izin;
}

export function IzinCard({ izin }: IzinCardProps) {
  const aiTersedia = izin.statusAI === 'berhasil' && Boolean(izin.kategoriAI);
  const skorPersen =
    izin.skorAI !== null ? ` (${Math.round(izin.skorAI * 100)}%)` : '';

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleCol}>
          <Text style={styles.judul} numberOfLines={2}>
            {izin.sesiLabel}
          </Text>
          {izin.diajukanPada ? (
            <Text style={styles.meta}>
              Diajukan {formatDateIndo(tanggalIso(izin.diajukanPada))}
            </Text>
          ) : null}
        </View>
        <StatusBadge status={izin.status} />
      </View>

      <View style={styles.alasanBox}>
        <Text style={styles.alasanText}>{izin.alasan}</Text>
      </View>

      <View style={[styles.aiChip, !aiTersedia && styles.aiChipFallback]}>
        <Text style={[styles.aiChipText, !aiTersedia && styles.aiChipTextFallback]}>
          {aiTersedia
            ? `Klasifikasi AI: ${izin.kategoriAI}${skorPersen}`
            : 'Klasifikasi tidak tersedia'}
        </Text>
      </View>

      {izin.catatanAsisten ? (
        <View style={styles.catatanBox}>
          <Text style={styles.catatanLabel}>Catatan Asisten</Text>
          <Text style={styles.catatanValue}>{izin.catatanAsisten}</Text>
        </View>
      ) : null}

      <View style={styles.cornerOrnament} pointerEvents="none">
        <CardCornerLeafOrnament width={68} height={68} />
      </View>
    </View>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  titleCol: {
    flex: 1,
  },
  judul: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    color: Botanical.textPrimary,
  },
  meta: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: Botanical.textMuted,
    marginTop: 3,
  },
  alasanBox: {
    backgroundColor: Botanical.surfaceSubtle,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Botanical.borderSubtle,
    padding: 12,
    marginTop: 10,
  },
  alasanText: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 19,
    color: Botanical.textPrimary,
  },
  aiChip: {
    alignSelf: 'flex-start',
    backgroundColor: Botanical.sagePill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 10,
  },
  aiChipFallback: {
    backgroundColor: Botanical.borderDivider,
  },
  aiChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Botanical.primaryDark,
  },
  aiChipTextFallback: {
    color: Botanical.textMuted,
  },
  catatanBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Botanical.borderDivider,
    paddingRight: 44,
  },
  catatanLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Botanical.textMuted,
  },
  catatanValue: {
    fontSize: 13,
    color: Botanical.textPrimary,
    marginTop: 2,
  },
  cornerOrnament: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
});
