import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { LoadingState } from '@/components/loading-state';
import { usePraktikum } from '@/context/praktikum-context';
import { SesiPraktikum } from '@/types';
import { formatDateIndo } from '@/utils';
import { getStatusKehadiran, StatusKehadiran } from '@/utils/kehadiran';

interface ItemRiwayat {
  sesi: SesiPraktikum;
  status: StatusKehadiran;
  keterangan: string;
}

const LABEL_STATUS: Record<StatusKehadiran, string> = {
  hadir: 'Hadir',
  izin: 'Izin',
  tidak_hadir: 'Tidak Hadir',
  menunggu: 'Menunggu',
};

export default function RiwayatPraktikanScreen() {
  const { sesiList, presensiList, izinList, loading, error, retry } =
    usePraktikum();

  if (loading) {
    return <LoadingState pesan="Memuat riwayat kehadiran..." />;
  }

  if (error) {
    return <ErrorState pesan={error} onRetry={retry} />;
  }

  // Sesi dan presensi sudah dibatasi ke kelas dan akun praktikan oleh PraktikumProvider.
  const daftar: ItemRiwayat[] = sesiList
    .map((sesi) => {
      const pres = presensiList.find((p) => p.sesiId === sesi.id);
      const status = getStatusKehadiran(
        sesi,
        pres,
        izinList.find((i) => i.sesiId === sesi.id)
      );
      const keterangan =
        status === 'hadir'
          ? `Pukul ${pres?.waktuPresensi}`
          : status === 'izin'
            ? 'Izin diterima'
            : status === 'menunggu'
              ? sesi.status === 'DIBUKA'
                ? 'Sesi sedang dibuka'
                : 'Belum dimulai'
              : '';
      return { sesi, status, keterangan };
    })
    .sort((a, b) =>
      `${b.sesi.tanggal}-${b.sesi.jamMulai}`.localeCompare(
        `${a.sesi.tanggal}-${a.sesi.jamMulai}`
      )
    );

  const hadirCount = daftar.filter((item) => item.status === 'hadir').length;
  const izinCount = daftar.filter((item) => item.status === 'izin').length;
  const totalSesi = daftar.filter((item) => item.status !== 'menunggu').length;

  const renderItem = ({ item }: { item: ItemRiwayat }) => {
    const chipStyle = {
      hadir: [styles.chipHadir, styles.chipTextHadir] as const,
      izin: [styles.chipIzin, styles.chipTextIzin] as const,
      tidak_hadir: [styles.chipTidakHadir, styles.chipTextTidakHadir] as const,
      menunggu: [styles.chipMenunggu, styles.chipTextMenunggu] as const,
    }[item.status];

    return (
      <View style={styles.itemCard}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemMataKuliah}>
            {item.sesi.mataKuliah} · Pertemuan {item.sesi.pertemuan}
          </Text>
          <Text style={styles.itemTanggal}>
            {formatDateIndo(item.sesi.tanggal)}
          </Text>
          <Text style={styles.itemJam}>
            {item.sesi.jamMulai} - {item.sesi.jamSelesai} WIB
          </Text>
        </View>
        <View style={styles.itemStatus}>
          <View style={[styles.chip, chipStyle[0]]}>
            <Text style={[styles.chipText, chipStyle[1]]}>
              {LABEL_STATUS[item.status]}
            </Text>
          </View>
          {item.keterangan ? (
            <Text style={styles.itemKeterangan}>{item.keterangan}</Text>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <View style={styles.headerRingkasan}>
        <Text style={styles.ringkasan}>
          Hadir {hadirCount} dari {totalSesi} sesi
        </Text>
        {izinCount > 0 ? (
          <Text style={styles.ringkasanSub}>Izin {izinCount} sesi</Text>
        ) : null}
      </View>

      {daftar.length === 0 ? (
        <EmptyState
          judul="Belum Ada Riwayat Praktikum"
          deskripsi="Belum ada sesi praktikum untuk kelas Anda."
        />
      ) : (
        <FlatList
          data={daftar}
          keyExtractor={(item) => item.sesi.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  headerRingkasan: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    margin: 16,
  },
  ringkasan: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
  },
  ringkasanSub: {
    fontSize: 13,
    color: '#555555',
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  itemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemMataKuliah: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
  },
  itemTanggal: {
    fontSize: 13,
    color: '#666666',
    marginTop: 2,
  },
  itemJam: {
    fontSize: 13,
    color: '#666666',
    marginTop: 2,
  },
  itemStatus: {
    alignItems: 'flex-end',
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 4,
    alignSelf: 'flex-end',
  },
  chipHadir: {
    backgroundColor: '#e8f5e9',
  },
  chipTidakHadir: {
    backgroundColor: '#ffebee',
  },
  chipIzin: {
    backgroundColor: '#E3EEF9',
  },
  chipMenunggu: {
    backgroundColor: '#fff9c4',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  chipTextHadir: {
    color: '#2e7d32',
  },
  chipTextTidakHadir: {
    color: '#c62828',
  },
  chipTextIzin: {
    color: '#1E5A96',
  },
  chipTextMenunggu: {
    color: '#f57f17',
  },
  itemKeterangan: {
    fontSize: 12,
    color: '#666666',
  },
});
