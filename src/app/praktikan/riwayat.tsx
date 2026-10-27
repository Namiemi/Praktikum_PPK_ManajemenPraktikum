import { SafeAreaView, FlatList, StyleSheet, Text, View } from 'react-native';

import { usePraktikum } from '@/context/praktikum-context';
import { EmptyState } from '@/components/empty-state';
import { formatDateIndo } from '@/utils';

export default function RiwayatPraktikanScreen() {
  const { currentUser, sesiList, getPresensiByPraktikan } = usePraktikum();

  const praktikanId = currentUser?.id ?? '';
  const kelas = currentUser?.kelas;

  const presensiSaya = getPresensiByPraktikan(praktikanId);

  const sesiKelas = kelas
    ? sesiList.filter((sesi) => sesi.kelas === kelas)
    : sesiList;

  const daftar = sesiKelas
    .map((sesi) => {
      const pres = presensiSaya.find((p) => p.sesiId === sesi.id);

      let status: 'hadir' | 'tidak_hadir' | 'menunggu';
      let keterangan = '';

      if (pres) {
        status = 'hadir';
        keterangan = pres.waktuPresensi;
      } else if (sesi.status === 'DITUTUP') {
        status = 'tidak_hadir';
        keterangan = 'Tidak hadir';
      } else {
        status = 'menunggu';
        keterangan = 'Menunggu presensi';
      }

      return { sesi, status, keterangan };
    })
    .sort((a, b) => b.sesi.tanggal.localeCompare(a.sesi.tanggal));

  const hadirCount = daftar.filter((item) => item.status === 'hadir').length;
  const totalSesi = daftar.filter((item) => item.status !== 'menunggu').length;

  const renderItem = ({ item }: { item: { sesi: any; status: string; keterangan: string } }) => {
    const chipBg =
      item.status === 'hadir'
        ? styles.chipHadir
        : item.status === 'tidak_hadir'
          ? styles.chipTidakHadir
          : styles.chipMenunggu;

    const chipTextColor =
      item.status === 'hadir'
        ? styles.chipTextHadir
        : item.status === 'tidak_hadir'
          ? styles.chipTextTidakHadir
          : styles.chipTextMenunggu;

    const label =
      item.status === 'hadir'
        ? 'Hadir'
        : item.status === 'tidak_hadir'
          ? 'Tidak Hadir'
          : 'Menunggu';

    return (
      <View style={styles.itemCard}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemMataKuliah}>
            {item.sesi.mataKuliah} - Pertemuan {item.sesi.pertemuan}
          </Text>
          <Text style={styles.itemTanggal}>
            {formatDateIndo(item.sesi.tanggal)}
          </Text>
          <Text style={styles.itemJam}>
            {item.sesi.jamMulai} - {item.sesi.jamSelesai} WIB
          </Text>
        </View>
        <View style={styles.itemStatus}>
          <View style={[styles.chip, chipBg]}>
            <Text style={[styles.chipText, chipTextColor]}>{label}</Text>
          </View>
          <Text style={styles.itemKeterangan}>{item.keterangan}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRingkasan}>
        <Text style={styles.judulRingkasan}>Riwayat Kehadiran</Text>
        <Text style={styles.ringkasan}>
          Hadir {hadirCount} dari {totalSesi} sesi
        </Text>
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
  judulRingkasan: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
  },
  ringkasan: {
    fontSize: 14,
    color: '#666666',
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
  chipTextMenunggu: {
    color: '#f57f17',
  },
  itemKeterangan: {
    fontSize: 12,
    color: '#666666',
  },
});
