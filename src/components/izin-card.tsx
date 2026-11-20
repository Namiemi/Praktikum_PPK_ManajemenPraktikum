/**
 * @file izin-card.tsx
 * @description Kartu pengajuan izin dengan status keputusan dan hasil klasifikasi AI (FR-28, FR-29).
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  CalendarIcon,
  CardCornerLeafOrnament,
} from '@/components/icons/praktikum-theme-icons';
import { Izin, StatusIzin } from '@/types';
import { formatDateIndo } from '@/utils';

const STATUS_STYLE: Record<StatusIzin, { label: string; bg: string; text: string }> = {
  menunggu: { label: 'MENUNGGU', bg: '#EAE8E1', text: '#5A6B5A' },
  diterima: { label: 'DITERIMA', bg: '#C8D7B8', text: '#1C281C' },
  ditolak: { label: 'DITOLAK', bg: '#F4DFDA', text: '#9E3B2B' },
};

function tanggalIso(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export interface IzinCardProps {
  izin: Izin;
}

export function IzinCard({ izin }: IzinCardProps) {
  const status = STATUS_STYLE[izin.status];
  const aiTersedia = izin.statusAI === 'berhasil' && izin.kategoriAI;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.judul} numberOfLines={2}>
          {izin.sesiLabel}
        </Text>
        <View style={[styles.badge, { backgroundColor: status.bg }]}>
          <Text style={[styles.badgeText, { color: status.text }]}>{status.label}</Text>
        </View>
      </View>

      {izin.diajukanPada ? (
        <View style={styles.metaRow}>
          <CalendarIcon size={12} color="#5A6B5A" />
          <Text style={styles.meta}>
            Diajukan {formatDateIndo(tanggalIso(izin.diajukanPada))}
          </Text>
        </View>
      ) : null}

      <View style={styles.alasanBox}>
        <Text style={styles.alasan}>{izin.alasan}</Text>
      </View>

      <View style={[styles.aiChip, !aiTersedia && styles.aiChipGagal]}>
        <Text style={[styles.aiText, !aiTersedia && styles.aiTextGagal]}>
          {aiTersedia
            ? `Sentimen AI: ${izin.kategoriAI}`
            : 'Klasifikasi AI tidak tersedia'}
        </Text>
      </View>

      {izin.catatanAsisten ? (
        <View style={styles.catatan}>
          <Text style={styles.catatanLabel}>Catatan asisten</Text>
          <Text style={styles.catatanText}>{izin.catatanAsisten}</Text>
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E4DD',
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  judul: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    color: '#1C281C',
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },
  meta: {
    fontSize: 12,
    color: '#5A6B5A',
  },
  alasanBox: {
    backgroundColor: '#FAF9F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAECE3',
    padding: 12,
    marginTop: 10,
  },
  alasan: {
    fontSize: 13,
    lineHeight: 19,
    color: '#1C281C',
  },
  aiChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5EAD7',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 10,
  },
  aiChipGagal: {
    backgroundColor: '#F0EFE9',
  },
  aiText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2D3E2D',
  },
  aiTextGagal: {
    color: '#5A6B5A',
  },
  catatan: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0EFE9',
    paddingRight: 44,
  },
  catatanLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#5A6B5A',
  },
  catatanText: {
    fontSize: 13,
    color: '#1C281C',
    marginTop: 2,
  },
  cornerOrnament: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
});
