import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AsistenPanel } from '@/components/asisten-panel';
import { BottomSheet } from '@/components/bottom-sheet';
import { usePraktikum } from '@/context/praktikum-context';
import { formatDateIndo } from '@/utils';
import { ConfirmModal } from '@/components/confirm-modal';

export default function DetailSesiScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    getSesiById,
    currentUser,
    presensi,
    getPresensiBySesi,
    hasPraktikanPresensi,
  } = usePraktikum();

  const [modalCatatanOpen, setModalCatatanOpen] = useState(false);
  const [kodeInput, setKodeInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [waktuSukses, setWaktuSukses] = useState('');

  const sesi = getSesiById(id);

  if (!sesi) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Sesi praktikum tidak ditemukan.</Text>
      </View>
    );
  }

  const isAsisten = currentUser?.peran === 'asisten';
  const isPraktikanSudahHadir = currentUser
    ? hasPraktikanPresensi(sesi.id, currentUser.id)
    : false;
  const catatanPresensi = currentUser
    ? getPresensiBySesi(sesi.id).find((p) => p.praktikanId === currentUser.id)
    : undefined;

  const handleBukaKonfirmasi = () => {
    const kode = kodeInput.trim();
    if (!kode) {
      setErrorMsg('Kode presensi tidak boleh kosong.');
      return;
    }
    setErrorMsg('');
    setConfirmOpen(true);
  };

  const handleKonfirmasiPresensi = () => {
    const result = presensi(sesi.id, kodeInput.trim());
    setConfirmOpen(false);
    if (result.success && result.data) {
      setWaktuSukses(result.data.waktuPresensi);
      setSuccessOpen(true);
    } else {
      setErrorMsg(result.message ?? 'Gagal mencatat presensi.');
    }
  };

  const getStatusColor = () => {
    switch (sesi.status) {
      case 'DIBUKA':
        return { bg: '#e8f5e9', text: '#2e7d32', label: 'Dibuka' };
      case 'DITUTUP':
        return { bg: '#ffebee', text: '#c62828', label: 'Ditutup' };
      default:
        return { bg: '#f5f5f5', text: '#616161', label: 'Belum Dibuka' };
    }
  };

  const status = getStatusColor();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Detail Sesi (FR-06) */}
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <Text style={styles.mataKuliah}>{sesi.mataKuliah}</Text>
          <View style={[styles.badge, { backgroundColor: status.bg }]}>
            <Text style={[styles.badgeText, { color: status.text }]}>
              {status.label}
            </Text>
          </View>
        </View>

        <Text style={styles.topikTitle}>
          Pertemuan {sesi.pertemuan}: {sesi.topik}
        </Text>

        <View style={styles.divider} />

        <View style={styles.infoList}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Kelas</Text>
            <Text style={styles.infoValue}>Kelas {sesi.kelas}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tanggal</Text>
            <Text style={styles.infoValue}>{formatDateIndo(sesi.tanggal)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Waktu</Text>
            <Text style={styles.infoValue}>
              {sesi.jamMulai} - {sesi.jamSelesai} WIB
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ruang</Text>
            <Text style={styles.infoValue}>{sesi.ruang}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Asisten</Text>
            <Text style={styles.infoValue}>{sesi.asistenNama}</Text>
          </View>

          {sesi.jamBuka && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Jam Buka</Text>
              <Text style={styles.infoValue}>{sesi.jamBuka} WIB</Text>
            </View>
          )}

          {sesi.jamTutup && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Jam Tutup</Text>
              <Text style={styles.infoValue}>{sesi.jamTutup} WIB</Text>
            </View>
          )}

          {isAsisten && sesi.status === 'DIBUKA' && sesi.kodePresensi && (
            <View style={styles.kodeContainer}>
              <Text style={styles.kodeTitle}>Kode Presensi Aktif:</Text>
              <Text style={styles.kodeNumber}>{sesi.kodePresensi}</Text>
            </View>
          )}
        </View>

        <Pressable
          style={styles.infoButton}
          onPress={() => setModalCatatanOpen(true)}>
          <Text style={styles.infoButtonText}>Lihat Catatan Sesi</Text>
        </Pressable>
      </View>

      {/* Panel Bawah Sesuai Peran Aktif */}
      <View style={styles.panelContainer}>
        {isAsisten ? (
          <AsistenPanel sesi={sesi} />
        ) : (
          <>
            {isPraktikanSudahHadir ? (
              <View style={styles.panelTercatat}>
                <Text style={styles.panelJudul}>Presensi Tercatat</Text>
                <Text style={styles.panelWaktu}>
                  Pukul {catatanPresensi?.waktuPresensi}
                </Text>
              </View>
            ) : sesi.status === 'DIBUKA' ? (
              <View style={styles.formPanel}>
                <Text style={styles.formJudul}>Masukkan Kode Presensi</Text>
                <TextInput
                  style={styles.inputKode}
                  value={kodeInput}
                  onChangeText={setKodeInput}
                  placeholder="Masukkan kode 4 digit"
                  maxLength={4}
                  keyboardType="numeric"
                  autoCapitalize="none"
                />
                {errorMsg ? (
                  <Text style={styles.errorText}>{errorMsg}</Text>
                ) : null}
                <Pressable
                  style={[
                    styles.tombolKonfirmasi,
                    !kodeInput.trim() && styles.tombolKonfirmasiDisabled,
                  ]}
                  onPress={handleBukaKonfirmasi}
                  disabled={!kodeInput.trim()}>
                  <Text style={styles.tombolKonfirmasiText}>Konfirmasi</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.panelPlaceholder}>
                <Text style={styles.panelPlaceholderTitle}>Sesi Belum Dibuka</Text>
                <Text style={styles.panelPlaceholderDesc}>
                  Tunggu asisten membuka sesi praktikum.
                </Text>
                <Pressable
                  style={[styles.tombolKonfirmasi, styles.tombolKonfirmasiDisabled]}
                  disabled>
                  <Text style={styles.tombolKonfirmasiText}>Presensi (Tidak Tersedia)</Text>
                </Pressable>
              </View>
            )}
          </>
        )}
      </View>

      {/* Konfirmasi Presensi */}
      <ConfirmModal
        visible={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleKonfirmasiPresensi}
        title="Konfirmasi Presensi"
        message={`Yakin presensi dengan kode ${kodeInput.trim()}?`}
        confirmText="Ya, Konfirmasi"
        cancelText="Batal"
      />

      {/* Bottom Sheet Sukses Presensi */}
      <BottomSheet
        visible={successOpen}
        onClose={() => setSuccessOpen(false)}
        title="Presensi Berhasil"
        closeText="Tutup">
        <View style={styles.bottomSheetBody}>
          <Text style={styles.bottomSheetJudul}>Presensi tercatat</Text>
          <Text style={styles.bottomSheetWaktu}>Pukul {waktuSukses}</Text>
          <Text style={styles.bottomSheetInfo}>Terima kasih telah hadir.</Text>
        </View>
      </BottomSheet>

      {/* Bottom Sheet Info Catatan Sesi */}
      <BottomSheet
        visible={modalCatatanOpen}
        title="Catatan Sesi Praktikum"
        closeText="Tutup"
        onClose={() => setModalCatatanOpen(false)}>
        <Text style={styles.modalBody}>
          {sesi.catatan || 'Tidak ada catatan tambahan untuk sesi ini.'}
        </Text>
      </BottomSheet>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  content: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 15,
    color: '#666666',
  },
  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mataKuliah: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
    textTransform: 'uppercase',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  topikTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
    marginTop: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#eeeeee',
    marginVertical: 12,
  },
  infoList: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111111',
  },
  kodeContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginVertical: 4,
  },
  kodeTitle: {
    fontSize: 12,
    color: '#666666',
  },
  kodeNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111111',
    letterSpacing: 2,
    marginTop: 2,
  },
  infoButton: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dddddd',
  },
  infoButtonText: {
    fontSize: 13,
    color: '#444444',
    fontWeight: '500',
  },
  panelContainer: {
    marginTop: 4,
  },
  panelPlaceholder: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderStyle: 'dashed',
  },
  panelPlaceholderTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
  },
  panelPlaceholderDesc: {
    fontSize: 13,
    color: '#777777',
    marginTop: 4,
  },
  panelTercatat: {
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#c8e6c9',
    alignItems: 'center',
  },
  panelJudul: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2e7d32',
  },
  panelWaktu: {
    fontSize: 13,
    color: '#1b5e20',
    marginTop: 4,
  },
  formPanel: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  formJudul: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 12,
  },
  inputKode: {
    height: 44,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
    marginBottom: 12,
  },
  tombolKonfirmasi: {
    backgroundColor: '#2e7d32',
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tombolKonfirmasiDisabled: {
    backgroundColor: '#cccccc',
  },
  tombolKonfirmasiText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 20,
    width: '100%',
    maxWidth: 360,
  },
  modalHeader: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 8,
  },
  modalBody: {
    fontSize: 14,
    color: '#444444',
    lineHeight: 20,
    marginBottom: 16,
  },
  modalCloseButton: {
    backgroundColor: '#111111',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSheetBody: {
    alignItems: 'center',
  },
  bottomSheetJudul: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111111',
    marginTop: 8,
  },
  bottomSheetWaktu: {
    fontSize: 15,
    color: '#2e7d32',
    fontWeight: '700',
    marginTop: 4,
  },
  bottomSheetInfo: {
    fontSize: 13,
    color: '#666666',
    marginTop: 4,
  },
});
