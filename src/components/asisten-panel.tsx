import React, { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ConfirmModal } from '@/components/confirm-modal';
import {
  CalendarIcon,
  CardCornerLeafOrnament,
  ClockIcon,
  MapPinIcon,
  PencilIcon,
  TrashIcon,
} from '@/components/icons/praktikum-theme-icons';
import { RekapKehadiranCard } from '@/components/rekap-kehadiran-card';
import { SesiFormModal } from '@/components/sesi-form';
import { usePraktikum } from '@/context/praktikum-context';
import { hapusSesi, ubahSesi } from '@/services';
import { SesiInput, SesiPraktikum } from '@/types';
import { getErrorMessage } from '@/utils/errors';

export interface AsistenPanelProps {
  sesi: SesiPraktikum;
}

type ConfirmActionType = 'buka' | 'tutup' | 'hapus' | null;

/**
 * Panel Kontrol Asisten pada Halaman Detail Sesi (FR-08, FR-09, FR-21, FR-22, FR-23).
 * Mengelola siklus hidup sesi (BELUM_DIBUKA -> DIBUKA -> DITUTUP), edit/hapus sesi, dan rekap kehadiran.
 */
export function AsistenPanel({ sesi }: AsistenPanelProps) {
  const { bukaSesi, tutupSesi, getPresensiBySesi, getIzinBySesi, kelasList } =
    usePraktikum();
  const [confirmType, setConfirmType] = useState<ConfirmActionType>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // ponytail: derived state langsung dari context tanpa sinkronisasi useEffect
  const daftarHadir = [...getPresensiBySesi(sesi.id)].sort((a, b) =>
    a.waktuPresensi.localeCompare(b.waktuPresensi)
  );
  const daftarIzinDiterima = getIzinBySesi(sesi.id).filter(
    (item) => item.status === 'diterima'
  );

  const isConfirmDanger = confirmType === 'tutup' || confirmType === 'hapus';

  const handleConfirmAction = async () => {
    const activeType = confirmType;
    setConfirmType(null);
    setActionError(null);

    if (activeType === 'buka') {
      const result = await bukaSesi(sesi.id);
      if (!result.success) {
        setActionError(result.message);
      }
      return;
    }

    if (activeType === 'tutup') {
      const result = await tutupSesi(sesi.id);
      if (!result.success) {
        setActionError(result.message);
      }
      return;
    }

    if (activeType === 'hapus') {
      try {
        await hapusSesi(sesi.id);
        router.back();
      } catch (err) {
        setActionError(getErrorMessage(err, 'Gagal menghapus sesi.'));
      }
    }
  };

  const handleEditSubmit = async (input: SesiInput): Promise<boolean> => {
    setSubmitting(true);
    setEditError(null);
    try {
      await ubahSesi(sesi.id, input);
      setIsEditOpen(false);
      return true;
    } catch (err) {
      setEditError(getErrorMessage(err, 'Gagal memperbarui sesi.'));
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const confirmConfig = (() => {
    if (confirmType === 'tutup') {
      return {
        title: 'Tutup Sesi Praktikum?',
        message:
          'Apakah Anda yakin ingin menutup sesi ini? Sesi yang ditutup tidak dapat dibuka kembali dan praktikan tidak bisa presensi lagi.',
        confirmText: 'Ya, Tutup Sesi',
      };
    }
    if (confirmType === 'hapus') {
      return {
        title: 'Hapus Sesi Praktikum?',
        message: `Apakah Anda yakin ingin menghapus sesi '${sesi.mataKuliah} - Kelas ${sesi.kelas}'?`,
        confirmText: 'Ya, Hapus Sesi',
      };
    }
    return {
      title: 'Buka Sesi Praktikum?',
      message: `Apakah Anda yakin ingin membuka sesi untuk '${sesi.mataKuliah} - Kelas ${sesi.kelas}'? Kode presensi 4 digit akan digenerate otomatis.`,
      confirmText: 'Ya, Buka Sesi',
    };
  })();

  return (
    <View style={styles.container}>
      {actionError !== null && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{actionError}</Text>
        </View>
      )}

      <View style={styles.topActionRow}>
        {sesi.status === 'BELUM_DIBUKA' && (
          <Pressable
            style={({ pressed }) => [
              styles.actionPill,
              styles.editPill,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => {
              setEditError(null);
              setIsEditOpen(true);
            }}
            accessibilityRole="button"
            accessibilityLabel="Ubah sesi"
          >
            <PencilIcon size={13} color="#3E543E" />
            <Text style={styles.editPillText}>Ubah</Text>
          </Pressable>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.actionPill,
            styles.deletePill,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => setConfirmType('hapus')}
          accessibilityRole="button"
          accessibilityLabel="Hapus sesi"
        >
          <TrashIcon size={13} color="#9E3B2B" />
          <Text style={styles.deletePillText}>Hapus</Text>
        </Pressable>
      </View>

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
            daftarIzin={daftarIzinDiterima}
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
            daftarIzin={daftarIzinDiterima}
            totalPraktikan={sesi.totalPraktikan}
            statusSesi={sesi.status}
          />
        </>
      )}

      {/* Modal Konfirmasi Buka / Tutup / Hapus Sesi */}
      <ConfirmModal
        visible={confirmType !== null}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        cancelText="Batal"
        variant={isConfirmDanger ? 'danger' : 'primary'}
        isDestructive={isConfirmDanger}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmType(null)}
      />

      <SesiFormModal
        visible={isEditOpen}
        editingSesi={sesi}
        kelasList={kelasList}
        submitting={submitting}
        errorMessage={editError}
        onSubmit={handleEditSubmit}
        onClose={() => setIsEditOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  errorBanner: {
    backgroundColor: '#F4DFDA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  errorBannerText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    color: '#9E3B2B',
  },
  topActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  editPill: {
    backgroundColor: '#F5F2EB',
    borderWidth: 1,
    borderColor: '#D5E0D5',
  },
  editPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3E543E',
  },
  deletePill: {
    backgroundColor: '#F4DFDA',
  },
  deletePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9E3B2B',
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
