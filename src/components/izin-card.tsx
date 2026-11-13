/**
 * @file izin-card.tsx
 * @description Kartu pengajuan izin dengan status keputusan dan hasil klasifikasi AI (FR-28, FR-29).
 */

import { StyleSheet, Text, View } from 'react-native';

import { Izin, StatusIzin } from '@/types';
import { formatDateIndo } from '@/utils';

const STATUS_STYLE: Record<StatusIzin, { label: string; bg: string; text: string }> = {
  menunggu: { label: 'Menunggu', bg: '#F2F3F5', text: '#4B5563' },
  diterima: { label: 'Diterima', bg: '#E4F2E4', text: '#2E7D32' },
  ditolak: { label: 'Ditolak', bg: '#FAE7E4', text: '#B3261E' },
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
        <Text style={styles.meta}>
          Diajukan {formatDateIndo(tanggalIso(izin.diajukanPada))}
        </Text>
      ) : null}

      <Text style={styles.alasan}>{izin.alasan}</Text>

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
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAECE3',
    borderRadius: 16,
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  judul: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
    color: '#1C281C',
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  meta: {
    fontSize: 12,
    color: '#5A6B5A',
    marginTop: 2,
  },
  alasan: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333333',
    marginTop: 8,
  },
  aiChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2E6',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 10,
  },
  aiChipGagal: {
    backgroundColor: '#F2F3F5',
  },
  aiText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3A4D3A',
  },
  aiTextGagal: {
    color: '#6B7280',
  },
  catatan: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  catatanLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5A6B5A',
  },
  catatanText: {
    fontSize: 13,
    color: '#333333',
    marginTop: 2,
  },
});
