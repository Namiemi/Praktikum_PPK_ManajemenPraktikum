import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  CardCornerLeafOrnament,
  MapPinIcon,
  PencilIcon,
  TrashIcon,
} from '@/components/icons/praktikum-theme-icons';
import { Laboratorium } from '@/types';

export interface LabCardProps {
  lab: Laboratorium;
  isSelected?: boolean;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * Kartu item laboratorium Informatika pada halaman Peta & Lab Asisten (FR-35).
 */
export function LabCard({
  lab,
  isSelected = false,
  onPress,
  onEdit,
  onDelete,
}: LabCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        isSelected && styles.cardSelected,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Laboratorium ${lab.nama}`}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={2}>
          {lab.nama}
        </Text>
        <View style={styles.radiusPill}>
          <Text style={styles.radiusPillText}>Radius {lab.radius} m</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <MapPinIcon size={13} color="#5A6B5A" />
        <Text style={styles.lokasiText} numberOfLines={1}>
          {lab.lokasi || 'Lokasi belum diisi'}
        </Text>
      </View>

      <Text style={styles.coordText}>
        {lab.latitude.toFixed(6)}, {lab.longitude.toFixed(6)}
      </Text>

      <View style={styles.actionRow}>
        <Pressable
          style={({ pressed }) => [
            styles.actionPill,
            styles.editPill,
            pressed && styles.pressed,
          ]}
          onPress={onEdit}
          accessibilityRole="button"
          accessibilityLabel={`Ubah laboratorium ${lab.nama}`}
        >
          <PencilIcon size={13} color="#3E543E" />
          <Text style={styles.editPillText}>Ubah</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.actionPill,
            styles.deletePill,
            pressed && styles.pressed,
          ]}
          onPress={onDelete}
          accessibilityRole="button"
          accessibilityLabel={`Hapus laboratorium ${lab.nama}`}
        >
          <TrashIcon size={13} color="#9E3B2B" />
          <Text style={styles.deletePillText}>Hapus</Text>
        </Pressable>
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
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  cardSelected: {
    borderColor: '#344E38',
    borderWidth: 1.5,
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
  radiusPill: {
    backgroundColor: '#E5EAD7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  radiusPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2D3E2D',
    fontVariant: ['tabular-nums'],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
    paddingRight: 44,
  },
  lokasiText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    color: '#4A5D4A',
  },
  coordText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#5A6B5A',
    marginTop: 4,
    paddingRight: 44,
    fontVariant: ['tabular-nums'],
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingRight: 44,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
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
    fontWeight: '700',
    color: '#9E3B2B',
  },
  pressed: {
    opacity: 0.82,
  },
  cornerOrnament: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
});
