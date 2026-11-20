import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfirmModal } from '@/components/confirm-modal';
import { AsistenAvatar, UserAvatar } from '@/components/icons/asisten-avatar';
import { CardCornerLeafOrnament } from '@/components/icons/praktikum-theme-icons';
import { usePraktikum } from '@/context/praktikum-context';

export interface ProfilViewProps {
  roleLabel: string;
  extraLabel: string;
  extraValue: string;
  isAsisten?: boolean;
}

/**
 * Tampilan halaman profil pengguna (Asisten & Praktikan) dengan gaya botani.
 */
export function ProfilView({
  roleLabel,
  extraLabel,
  extraValue,
  isAsisten = false,
}: ProfilViewProps) {
  const { currentUser, logout } = usePraktikum();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleKeluar = async () => {
    setConfirmOpen(false);
    await logout();
    router.replace('/');
  };

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Tidak ada sesi pengguna aktif.</Text>
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
            onPress={() => router.replace('/')}
          >
            <Text style={styles.buttonText}>Pilih Identitas</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const infoRows = [
    { label: 'Nama', value: currentUser.nama },
    { label: 'NIM', value: currentUser.nim },
    { label: 'Email', value: currentUser.email ?? '-' },
    { label: 'Peran', value: roleLabel },
    { label: extraLabel, value: extraValue },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Kartu Ringkasan Identitas */}
        <View style={styles.heroCard}>
          <View style={styles.heroRow}>
            {isAsisten ? (
              <AsistenAvatar
                userId={currentUser.id}
                nama={currentUser.nama}
                size={52}
              />
            ) : (
              <UserAvatar
                userId={currentUser.id}
                nama={currentUser.nama}
                size={52}
              />
            )}
            <View style={styles.heroInfo}>
              <Text style={styles.heroName}>{currentUser.nama}</Text>
              <View style={styles.rolePill}>
                <Text style={styles.rolePillText}>{roleLabel}</Text>
              </View>
            </View>
          </View>
          <View style={styles.cornerOrnament} pointerEvents="none">
            <CardCornerLeafOrnament width={72} height={72} />
          </View>
        </View>

        {/* Kartu Detail Profil */}
        <View style={styles.card}>
          {infoRows.map((item, idx) => (
            <View
              key={item.label}
              style={[styles.row, idx < infoRows.length - 1 && styles.rowDivider]}
            >
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.value} numberOfLines={2}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [styles.gantiButton, pressed && styles.pressed]}
          onPress={() => setConfirmOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Keluar"
        >
          <Text style={styles.gantiButtonText}>Keluar</Text>
        </Pressable>
      </ScrollView>

      <ConfirmModal
        visible={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleKeluar}
        title="Keluar"
        message="Apakah Anda yakin ingin keluar dari akun ini?"
        confirmText="Keluar"
        cancelText="Batal"
        variant="danger"
        isDestructive
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  scrollContent: {
    padding: 18,
    gap: 14,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6E4DD',
    padding: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingRight: 44,
  },
  heroInfo: {
    flex: 1,
    gap: 6,
  },
  heroName: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 22,
    color: '#1C281C',
  },
  rolePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5EAD7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  rolePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2D3E2D',
  },
  cornerOrnament: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E6E4DD',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0EFE9',
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#5A6B5A',
  },
  value: {
    flex: 1,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '600',
    color: '#1C281C',
    fontVariant: ['tabular-nums'],
  },
  gantiButton: {
    backgroundColor: '#F4DFDA',
    borderWidth: 1,
    borderColor: '#E5BEB7',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gantiButtonText: {
    color: '#9E3B2B',
    fontSize: 15,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.84,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 14,
    color: '#5A6B5A',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#344E38',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
