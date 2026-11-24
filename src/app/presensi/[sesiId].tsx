/**
 * Halaman khusus presensi praktikan dengan validasi radius laboratorium (FR-37).
 * Terpisah dari Detail Sesi; dibuka lewat tombol di panel praktikan.
 */

import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheet } from '@/components/bottom-sheet';
import { DevicePermissionBanner } from '@/components/device-permission-banner';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { LoadingState } from '@/components/loading-state';
import { PresensiForm } from '@/components/presensi-form';
import { StatusBadge } from '@/components/status-badge';
import { usePraktikum } from '@/context/praktikum-context';
import { usePosisiPerangkat } from '@/hooks/use-posisi-perangkat';
import { hitungJarakMeter } from '@/services';
import { StatusSesi } from '@/types';
import { formatDateIndo } from '@/utils';

const BADGE_STATUS = {
  BELUM_DIBUKA: 'belum_dibuka',
  DIBUKA: 'dibuka',
  DITUTUP: 'ditutup',
} as const satisfies Record<StatusSesi, string>;

export default function PresensiScreen() {
  const { sesiId } = useLocalSearchParams<{ sesiId: string }>();
  const {
    currentUser,
    getSesiById,
    getPresensiBySesi,
    laboratoriumList,
    loading,
    error,
    retry,
  } = usePraktikum();
  const insets = useSafeAreaInsets();
  const [waktuSukses, setWaktuSukses] = useState<string | null>(null);

  const sesi = getSesiById(sesiId);
  const lab = sesi?.labId
    ? laboratoriumList.find((l) => l.id === sesi.labId)
    : undefined;
  const sudahHadir = sesi
    ? getPresensiBySesi(sesi.id).some((p) => p.praktikanId === currentUser?.id)
    : false;

  // Lokasi hanya dipantau selama presensi memang masih bisa dilakukan.
  const perluLokasi =
    !!sesi && !!lab && sesi.status === 'DIBUKA' && !sudahHadir && !waktuSukses;
  const { status: statusPosisi, posisi, muatUlang } = usePosisiPerangkat(perluLokasi);

  if (currentUser?.peran !== 'praktikan') {
    return (
      <EmptyState
        judul="Khusus Praktikan"
        deskripsi="Halaman presensi hanya dapat dibuka oleh praktikan."
      />
    );
  }
  if (loading) return <LoadingState pesan="Memuat data presensi..." />;
  if (error) return <ErrorState pesan={error} onRetry={retry} />;
  if (!sesi) {
    return (
      <EmptyState
        judul="Sesi Tidak Ditemukan"
        deskripsi="Sesi ini sudah dihapus atau bukan bagian dari kelas Anda."
      />
    );
  }

  const jarakMeter =
    lab && posisi
      ? hitungJarakMeter(posisi.latitude, posisi.longitude, lab.latitude, lab.longitude)
      : null;
  const dalamRadius = lab && jarakMeter !== null ? jarakMeter <= lab.radius : false;

  let bagianLokasi: React.ReactNode = null;
  let bagianAksi: React.ReactNode = null;

  if (sudahHadir && !waktuSukses) {
    bagianAksi = (
      <InfoCard
        nada="sukses"
        judul="Presensi Sudah Tercatat"
        teks="Anda sudah melakukan presensi pada sesi ini."
      />
    );
  } else if (sesi.status === 'BELUM_DIBUKA') {
    bagianAksi = (
      <InfoCard
        judul="Sesi Belum Dibuka"
        teks="Halaman ini akan menampilkan form presensi otomatis saat asisten membuka sesi."
      />
    );
  } else if (sesi.status === 'DITUTUP' && !waktuSukses) {
    bagianAksi = (
      <InfoCard
        nada="bahaya"
        judul="Sesi Sudah Ditutup"
        teks="Presensi untuk sesi ini sudah tidak dapat dilakukan."
      />
    );
  } else if (!lab) {
    bagianAksi = (
      <InfoCard
        nada="bahaya"
        judul="Laboratorium Belum Diatur"
        teks="Sesi ini belum terhubung ke data laboratorium, sehingga lokasi tidak bisa diperiksa. Hubungi asisten."
      />
    );
  } else if (!waktuSukses) {
    if (statusPosisi === 'izin_ditolak') {
      bagianLokasi = <DevicePermissionBanner status="izin_lokasi_ditolak" onRetry={muatUlang} />;
    } else if (statusPosisi === 'gps_mati') {
      bagianLokasi = <DevicePermissionBanner status="gps_mati" onRetry={muatUlang} />;
    } else if (statusPosisi === 'gagal') {
      bagianLokasi = (
        <DevicePermissionBanner
          status="gps_mati"
          pesan="Lokasi perangkat gagal diperoleh. Pastikan GPS aktif lalu coba lagi."
          onRetry={muatUlang}
        />
      );
    } else if (statusPosisi === 'memuat' || jarakMeter === null) {
      bagianLokasi = <DevicePermissionBanner status="lokasi_memuat" />;
    } else if (!dalamRadius) {
      bagianLokasi = (
        <DevicePermissionBanner
          status="di_luar_radius"
          pesan={`Jarak Anda ${jarakMeter} m dari ${lab.nama}, sedangkan batas presensi ${lab.radius} m. Mendekatlah ke laboratorium.`}
        />
      );
    } else {
      bagianLokasi = (
        <InfoCard
          nada="sukses"
          judul="Lokasi Sesuai"
          teks={`Anda berada ${jarakMeter} m dari ${lab.nama} (dalam radius ${lab.radius} m).`}
        />
      );
    }

    bagianAksi = (
      <PresensiForm
        sesiId={sesi.id}
        latitude={posisi?.latitude ?? null}
        longitude={posisi?.longitude ?? null}
        disabled={!dalamRadius}
        onSuccess={(p) => setWaktuSukses(p.waktuPresensi)}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, { paddingBottom: 16 + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <View style={styles.headerTop}>
            <Text style={styles.mataKuliah} numberOfLines={2}>
              {sesi.mataKuliah}
            </Text>
            <StatusBadge status={BADGE_STATUS[sesi.status]} />
          </View>
          <Text style={styles.topik}>
            Pertemuan {sesi.pertemuan}: {sesi.topik}
          </Text>
          <View style={styles.divider} />
          <Baris label="Kelas" nilai={`Kelas ${sesi.kelas}`} />
          <Baris label="Tanggal" nilai={formatDateIndo(sesi.tanggal)} />
          <Baris label="Waktu" nilai={`${sesi.jamMulai} - ${sesi.jamSelesai} WIB`} />
          <Baris label="Laboratorium" nilai={lab?.nama ?? sesi.ruang} />
          {lab ? <Baris label="Radius presensi" nilai={`${lab.radius} m`} /> : null}
          {perluLokasi ? (
            <Baris
              label="Jarak Anda"
              nilai={jarakMeter !== null ? `${jarakMeter} m` : 'Mencari...'}
              tebal
            />
          ) : null}
        </View>

        {bagianLokasi ? <View style={styles.gap}>{bagianLokasi}</View> : null}
        {bagianAksi ? <View style={styles.gap}>{bagianAksi}</View> : null}
      </ScrollView>

      <BottomSheet
        visible={waktuSukses !== null}
        onClose={() => {
          setWaktuSukses(null);
          router.back();
        }}
        title="Presensi Berhasil"
        closeText="Selesai"
      >
        <View style={styles.sheetBody}>
          <Text style={styles.sheetJudul}>Kehadiran Anda tercatat</Text>
          <Text style={styles.sheetWaktu}>Pukul {waktuSukses} WIB</Text>
          <Text style={styles.sheetInfo}>Terima kasih telah hadir.</Text>
        </View>
      </BottomSheet>
    </KeyboardAvoidingView>
  );
}

function Baris({ label, nilai, tebal }: { label: string; nilai: string; tebal?: boolean }) {
  return (
    <View style={styles.baris}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.nilai, tebal && styles.nilaiTebal]}>{nilai}</Text>
    </View>
  );
}

function InfoCard({
  judul,
  teks,
  nada = 'info',
}: {
  judul: string;
  teks: string;
  nada?: 'info' | 'sukses' | 'bahaya';
}) {
  return (
    <View style={[styles.infoCard, styles[`info_${nada}`]]}>
      <Text style={[styles.infoJudul, styles[`infoJudul_${nada}`]]}>{judul}</Text>
      <Text style={styles.infoTeks}>{teks}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  content: {
    padding: 16,
  },
  gap: {
    marginTop: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EAECE3',
    padding: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  mataKuliah: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#5A6B5A',
    textTransform: 'uppercase',
  },
  topik: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C281C',
    marginTop: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 12,
  },
  baris: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#5A6B5A',
  },
  nilai: {
    flexShrink: 1,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '500',
    color: '#1C281C',
  },
  nilaiTebal: {
    fontWeight: '700',
  },
  infoCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  info_info: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EAECE3',
    borderStyle: 'dashed',
  },
  info_sukses: {
    backgroundColor: '#E4F2E4',
    borderColor: '#C8E6C9',
  },
  info_bahaya: {
    backgroundColor: '#FDECEA',
    borderColor: '#F4C7C0',
  },
  infoJudul: {
    fontSize: 15,
    fontWeight: '700',
  },
  infoJudul_info: {
    color: '#1C281C',
  },
  infoJudul_sukses: {
    color: '#2E7D32',
  },
  infoJudul_bahaya: {
    color: '#B3261E',
  },
  infoTeks: {
    fontSize: 13,
    lineHeight: 19,
    color: '#4A4A4A',
    marginTop: 4,
  },
  sheetBody: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  sheetJudul: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C281C',
  },
  sheetWaktu: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2E7D32',
    marginTop: 4,
  },
  sheetInfo: {
    fontSize: 13,
    color: '#5A6B5A',
    marginTop: 4,
  },
});
