import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ConfirmModal } from '@/components/confirm-modal';
import {
  CalendarIcon,
  CardCornerLeafOrnament,
  ClockIcon,
  MapPinIcon,
} from '@/components/icons/praktikum-theme-icons';
import { RekapKehadiranCard } from '@/components/rekap-kehadiran-card';
import { usePraktikum } from '@/context/praktikum-context';
import { SesiPraktikum } from '@/types';

export interface AsistenPanelProps {
  sesi: SesiPraktikum;
}

/**
 * Panel Kontrol Asisten pada Halaman Detail Sesi (FR-08 & FR-09).
 * Mengelola siklus hidup sesi (BELUM_DIBUKA -> DIBUKA -> DITUTUP) dan rekap kehadiran.
 */
export function AsistenPanel({ sesi }: AsistenPanelProps) {
  const { bukaSesi, tutupSesi, getPresensiBySesi } = usePraktikum();
  const [confirmType, setConfirmType] = useState<'buka' | 'tutup' | null>(null);

  // ponytail: derived state langsung dari context tanpa sinkronisasi useEffect
  const daftarHadir = [...getPresensiBySesi(sesi.id)].sort((a, b) =>
    a.waktuPresensi.localeCompare(b.waktuPresensi)
  );

  const isConfirmDanger = confirmType === 'tutup';

  const handleConfirmAction = () => {
    if (confirmType === 'buka') {
      bukaSesi(sesi.id);
    } else if (confirmType === 'tutup') {
      tutupSesi(sesi.id);
    }
    setConfirmType(null);
  };

  return (
    <View style={styles.container}>
      {/* Kondisi 03: Sesi Belum Dibuka */}
      {sesi.status === 'BELUM_DIBUKA' && (
        <>
          <View style={styles.locationCard}>
            <View style={styles.locationContent}>
              <Text style={styles.cardTitle}>{sesi.ruang}</Text>
              <View style={styles.subInfoRow}>
                <MapPinIcon size={13} color="#5A6B5A" />
                <Text style={styles.subInfoText}>{sesi.ruang}</Text>
              </View>
            </View>
            <View style={styles.cornerAccent} pointerEvents="none">
              <CardCornerLeafOrnament width={68} height={68} />
            </View>
          </View>

          <View style={styles.notOpenedBox}>
            <Text style={styles.emptyStateTitle}>Sesi belum dimulai.</Text>
            <Text style={styles.emptyStateDesc}>
              Harap buka sesi agar praktikan dapat melakukan presensi.
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                styles.bukaButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => setConfirmType('buka')}
              accessibilityRole="button"
              accessibilityLabel="Buka Sesi"
            >
              <Text style={styles.primaryButtonText}>BUKA SESI</Text>
            </Pressable>
          </View>
        </>
      )}

      {/* Kondisi 04 & 05: Sesi Sedang Dibuka */}
      {sesi.status === 'DIBUKA' && (
        <>
          <View style={styles.kodeCard}>
            <Text style={styles.kodeLabel}>Kode Presensi</Text>
            <Text style={styles.kodeValue}>
              KODE: {sesi.kodePresensi ?? '----'}
            </Text>
            <View style={styles.waktuRow}>
              <ClockIcon size={13} color="#5A6B5A" />
              <Text style={styles.waktuText}>
                Dibuka pukul {sesi.jamBuka ?? '-'}
              </Text>
            </View>
          </View>

          <RekapKehadiranCard
            daftarHadir={daftarHadir}
            totalPraktikan={sesi.totalPraktikan}
            statusSesi={sesi.status}
          />

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              styles.tutupButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => setConfirmType('tutup')}
            accessibilityRole="button"
            accessibilityLabel="Tutup Sesi"
          >
            <Text style={styles.primaryButtonText}>TUTUP SESI</Text>
          </Pressable>
        </>
      )}

      {/* Kondisi 06: Sesi Sudah Ditutup */}
      {sesi.status === 'DITUTUP' && (
        <>
          <Text style={styles.closedTimestampText}>
            Dibuka: {sesi.jamBuka ?? '-'} • Ditutup: {sesi.jamTutup ?? '-'}
          </Text>

          <View style={styles.locationCard}>
            <View style={styles.locationContent}>
              <Text style={styles.cardTitle}>
                {sesi.mataKuliah} - Kelas {sesi.kelas}
              </Text>
              <View style={styles.subInfoRow}>
                <CalendarIcon size={13} color="#5A6B5A" />
                <Text style={styles.subInfoText}>
                  Sesi telah ditutup ({sesi.jamTutup ?? '-'})
                </Text>
              </View>
            </View>
            <View style={styles.cornerAccent} pointerEvents="none">
              <CardCornerLeafOrnament width={68} height={68} />
            </View>
          </View>

          <RekapKehadiranCard
            daftarHadir={daftarHadir}
            totalPraktikan={sesi.totalPraktikan}
            statusSesi={sesi.status}
          />
        </>
      )}

      {/* Modal Konfirmasi Buka / Tutup Sesi */}
      <ConfirmModal
        visible={confirmType !== null}
        title={
          isConfirmDanger ? 'Tutup Sesi Praktikum?' : 'Buka Sesi Praktikum?'
        }
        message={
          isConfirmDanger
            ? 'Apakah Anda yakin ingin menutup sesi ini? Sesi yang ditutup tidak dapat dibuka kembali dan praktikan tidak bisa presensi lagi.'
            : `Apakah Anda yakin ingin membuka sesi untuk '${sesi.mataKuliah} - Kelas ${sesi.kelas}'? Kode presensi 4 digit akan digenerate otomatis.`
        }
        confirmText={isConfirmDanger ? 'Ya, Tutup Sesi' : 'Ya, Buka Sesi'}
        cancelText="Batal"
        variant={isConfirmDanger ? 'danger' : 'primary'}
        isDestructive={isConfirmDanger}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmType(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  locationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6E4DD',
    padding: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  locationContent: {
    paddingRight: 48,
    gap: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    color: '#1C281C',
  },
  subInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subInfoText: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: '#5A6B5A',
  },
  cornerAccent: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  notOpenedBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6E4DD',
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    color: '#1C281C',
    textAlign: 'center',
  },
  emptyStateDesc: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 19,
    color: '#5A6B5A',
    textAlign: 'center',
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 20,
  },
  kodeCard: {
    backgroundColor: '#F4F1EA',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E6E4DD',
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  kodeLabel: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    color: '#4A5D4A',
    textAlign: 'center',
  },
  kodeValue: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
    color: '#1C281C',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
    marginVertical: 6,
  },
  waktuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  waktuText: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    color: '#5A6B5A',
    textAlign: 'center',
  },
  closedTimestampText: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    color: '#5A6B5A',
    textAlign: 'center',
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bukaButton: {
    backgroundColor: '#344E38',
  },
  tutupButton: {
    backgroundColor: '#B84A39',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
