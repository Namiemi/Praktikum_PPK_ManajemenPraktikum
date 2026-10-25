import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from './status-badge';

// TODO: ganti dengan import dari src/types.ts
export interface Sesi {
  id: string;
  praktikum: string;
  pertemuan: number;
  kelas: string;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  ruang: string;
  status: 'belum_dibuka' | 'dibuka' | 'ditutup';
}

export interface SesiCardProps {
  sesi: Sesi;
  onPress: () => void;
  hadir?: boolean;
}

export function SesiCard({ sesi, onPress, hadir = false }: SesiCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${sesi.praktikum} pertemuan ${sesi.pertemuan}`}
    >
      <View style={styles.cardHeader}>
        {hadir ? (
          <View style={styles.hadirBadge}>
            <Text style={styles.hadirText}>Hadir</Text>
          </View>
        ) : null}
        <Text style={styles.cardTitle} numberOfLines={2}>
          {sesi.praktikum} + Pertemuan {sesi.pertemuan}
        </Text>
        <StatusBadge status={sesi.status} />
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.detailText}>Kelas {sesi.kelas}</Text>
        <Text style={styles.detailText}>Tanggal {sesi.tanggal}</Text>
        <Text style={styles.detailText}>
          Jam {sesi.jamMulai} - {sesi.jamSelesai}
        </Text>
        <Text style={styles.detailText}>Ruang {sesi.ruang}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAECE3',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#1C281C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    color: '#1C281C',
  },
  hadirBadge: {
    backgroundColor: '#E4F2E4',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 8,
  },
  hadirText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2E7D32',
  },
  cardBody: {
    marginTop: 8,
  },
  detailText: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
    color: '#4A4A4A',
  },
});
