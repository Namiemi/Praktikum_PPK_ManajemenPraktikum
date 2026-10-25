import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  CheckIcon,
  EmptyAttendanceIllustration,
} from '@/components/icons/praktikum-theme-icons';
import { Presensi, StatusSesi } from '@/types';

export interface RekapKehadiranCardProps {
  daftarHadir: Presensi[];
  totalPraktikan: number;
  statusSesi: StatusSesi;
}

/**
 * Kartu Rekap Kehadiran Praktikan (FR-09 & SRS-09, SRS-12).
 * Menampilkan counter x/y, progress bar, empty state daun botani, atau daftar praktikan hadir.
 */
export function RekapKehadiranCard({
  daftarHadir,
  totalPraktikan,
  statusSesi,
}: RekapKehadiranCardProps) {
  const jumlahHadir = daftarHadir.length;
  const persentase =
    totalPraktikan > 0
      ? Math.min(100, Math.round((jumlahHadir / totalPraktikan) * 100))
      : 0;
  const isSesiDitutup = statusSesi === 'DITUTUP';

  return (
    <View style={styles.card}>
      {/* Counter Kehadiran: Angka Utama + Teks Sekunder sejajar baseline */}
      <View style={styles.counterRow}>
        <Text style={styles.counterPrimary}>{jumlahHadir}</Text>
        <Text style={styles.counterSecondary}>
          {' '}
          / {totalPraktikan} Praktikan Hadir
        </Text>
      </View>

      {/* Progress Bar Kehadiran */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${persentase}%` }]} />
      </View>

      {/* Daftar Hadir atau Empty State */}
      {jumlahHadir === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyAttendanceIllustration width={128} height={128} />
          <Text style={styles.emptyDescription}>
            Belum ada praktikan yang{'\n'}melakukan presensi
          </Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {daftarHadir.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.attendeeRow,
                index < jumlahHadir - 1 && styles.attendeeDivider,
              ]}
            >
              <View
                style={[
                  styles.avatarBadge,
                  isSesiDitutup
                    ? styles.avatarBadgeClosed
                    : styles.avatarBadgeOpen,
                ]}
              >
                {!isSesiDitutup && <CheckIcon size={14} color="#384D32" />}
              </View>

              <View style={styles.attendeeInfo}>
                <Text style={styles.attendeeName}>{item.praktikanNama}</Text>
                <Text style={styles.attendeeMeta}>
                  ({item.praktikanNim}) - {item.waktuPresensi}
                </Text>
              </View>

              {!isSesiDitutup && (
                <View style={styles.trailingCheck}>
                  <CheckIcon size={15} color="#4A5D4A" />
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E6E4DD',
    padding: 18,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  counterPrimary: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
    color: '#1C281C',
    fontVariant: ['tabular-nums'],
  },
  counterSecondary: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    color: '#5A6B5A',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#E2E8DF',
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A6B4A',
    borderRadius: 999,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  emptyDescription: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 19,
    color: '#5A6B5A',
    textAlign: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  listContainer: {
    marginTop: 2,
  },
  attendeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  attendeeDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0EFE9',
  },
  avatarBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBadgeOpen: {
    backgroundColor: '#C8D7B8',
  },
  avatarBadgeClosed: {
    backgroundColor: '#EAE4D7',
  },
  attendeeInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  attendeeName: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    color: '#1C281C',
  },
  attendeeMeta: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: '#687868',
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
  trailingCheck: {
    paddingLeft: 4,
  },
});
