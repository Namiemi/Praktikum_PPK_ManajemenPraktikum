import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  CardCornerLeafOrnament,
  MapPinIcon,
  PencilIcon,
  TrashIcon,
} from '@/components/icons/praktikum-theme-icons';
import { SesiPraktikum, StatusSesi } from '@/types';
import { formatDateIndo } from '@/utils';

export interface AsistenSesiCardProps {
  sesi: SesiPraktikum;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const STATUS_BADGE_MAP: Record<
  StatusSesi,
  { label: string; bg: string; text: string }
> = {
  BELUM_DIBUKA: {
    label: 'BELUM DIBUKA',
    bg: '#EAE8E1',
    text: '#5A6B5A',
  },
  DIBUKA: {
    label: 'DIBUKA',
    bg: '#C8D7B8',
    text: '#1C281C',
  },
  DITUTUP: {
    label: 'DITUTUP',
    bg: '#F4DFDA',
    text: '#9E3B2B',
  },
};

/**
 * Kartu item jadwal sesi praktikum untuk daftar Jadwal Asisten (Layar 01 - FR-07).
 */
export function AsistenSesiCard({
  sesi,
  onPress,
  onEdit,
  onDelete,
}: AsistenSesiCardProps) {
  const badge = STATUS_BADGE_MAP[sesi.status];
  const showEdit = Boolean(onEdit && sesi.status === 'BELUM_DIBUKA');

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${sesi.mataKuliah} Kelas ${sesi.kelas}`}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={2}>
          {sesi.mataKuliah} - Kelas {sesi.kelas}
        </Text>
        <View style={styles.kelasCircle}>
          <Text style={styles.kelasCircleText}>{sesi.kelas}</Text>
        </View>
      </View>

      <Text style={styles.topikText} numberOfLines={1}>
        Pertemuan {sesi.pertemuan}: {sesi.topik}
      </Text>

      <View style={styles.locationRow}>
        <MapPinIcon size={13} color="#5A6B5A" />
        <Text style={styles.subInfoText}>
          {sesi.ruang} • {formatDateIndo(sesi.tanggal)} ({sesi.jamMulai} -{' '}
          {sesi.jamSelesai})
        </Text>
      </View>

      <View style={styles.footerRow}>
        <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.statusBadgeText, { color: badge.text }]}>
            {badge.label}
          </Text>
        </View>

        {(showEdit || onDelete) && (
          <View style={styles.actionRow}>
            {showEdit && onEdit ? (
              <Pressable
                style={({ pressed }) => [
                  styles.actionPill,
                  styles.editPill,
                  pressed && styles.actionPressed,
                ]}
                onPress={onEdit}
                accessibilityRole="button"
                accessibilityLabel={`Ubah sesi ${sesi.mataKuliah}`}
              >
                <PencilIcon size={12} color="#3E543E" />
                <Text style={styles.editPillText}>Ubah</Text>
              </Pressable>
            ) : null}

            {onDelete ? (
              <Pressable
                style={({ pressed }) => [
                  styles.actionPill,
                  styles.deletePill,
                  pressed && styles.actionPressed,
                ]}
                onPress={onDelete}
                accessibilityRole="button"
                accessibilityLabel={`Hapus sesi ${sesi.mataKuliah}`}
              >
                <TrashIcon size={12} color="#9E3B2B" />
                <Text style={styles.deletePillText}>Hapus</Text>
              </Pressable>
            ) : null}
          </View>
        )}
      </View>

      <View style={styles.cornerOrnament} pointerEvents="none">
        <CardCornerLeafOrnament width={72} height={72} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6E4DD',
    padding: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  cardPressed: {
    opacity: 0.86,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    color: '#1C281C',
  },
  kelasCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#344E38',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kelasCircleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  topikText: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    color: '#4A5D4A',
    marginTop: 3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
    paddingRight: 48,
  },
  subInfoText: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: '#5A6B5A',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 10,
    paddingRight: 44,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  actionPressed: {
    opacity: 0.8,
  },
  editPill: {
    backgroundColor: '#F5F2EB',
    borderWidth: 1,
    borderColor: '#D5E0D5',
  },
  editPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3E543E',
  },
  deletePill: {
    backgroundColor: '#F4DFDA',
  },
  deletePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9E3B2B',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  cornerOrnament: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
});
