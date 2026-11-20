import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  BotanicalPageHeader,
  BotanicalScreenShell,
} from '@/components/botanical-header';
import { ConfirmModal } from '@/components/confirm-modal';
import { AsistenAvatar, UserAvatar } from '@/components/icons/asisten-avatar';
import { CardCornerLeafOrnament } from '@/components/icons/praktikum-theme-icons';
import { Botanical } from '@/constants/theme';
import { usePraktikum } from '@/context/praktikum-context';
import { Peran } from '@/types';

export interface ProfilViewProps {
  peranHarapan: Peran;
}

/**
 * Tampilan Profil terpadu untuk Asisten dan Praktikan dengan tema Botanical.
 */
export function ProfilView({ peranHarapan }: ProfilViewProps) {
  const { currentUser, logout } = usePraktikum();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleKeluar = async () => {
    setConfirmOpen(false);
    await logout();
    router.replace('/');
  };

  const title =
    peranHarapan === 'asisten' ? 'Profil Asisten' : 'Profil Praktikan';

  if (!currentUser) {
    return (
      <BotanicalScreenShell>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Tidak ada sesi pengguna aktif.</Text>
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
            onPress={() => router.replace('/')}
          >
            <Text style={styles.primaryButtonText}>Masuk Kembali</Text>
          </Pressable>
        </View>
      </BotanicalScreenShell>
    );
  }

  const isAsisten = currentUser.peran === 'asisten';
  const kelasInfo = isAsisten
    ? currentUser.kelasDiampu && currentUser.kelasDiampu.length > 0
      ? currentUser.kelasDiampu.join(', ')
      : '-'
    : currentUser.kelas
      ? `Kelas ${currentUser.kelas}`
      : 'Belum terdaftar';

  return (
    <BotanicalScreenShell>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <BotanicalPageHeader
          userId={currentUser.id}
          userName={currentUser.nama}
          peran={currentUser.peran}
          title={title}
        />

        <View style={styles.card}>
          <View style={styles.identityHeader}>
            {isAsisten ? (
              <AsistenAvatar
                userId={currentUser.id}
                nama={currentUser.nama}
                size={54}
              />
            ) : (
              <UserAvatar
                userId={currentUser.id}
                nama={currentUser.nama}
                size={54}
              />
            )}
            <View style={styles.identityText}>
              <Text style={styles.name}>{currentUser.nama}</Text>
              <Text style={styles.nim}>{currentUser.nim}</Text>
            </View>
            <View style={styles.rolePill}>
              <Text style={styles.rolePillText}>
                {isAsisten ? 'ASISTEN' : 'PRAKTIKAN'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoList}>
            <View style={styles.row}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value} numberOfLines={1}>
                {currentUser.email}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Peran</Text>
              <Text style={styles.value}>
                {isAsisten ? 'Asisten Praktikum' : 'Praktikan'}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>
                {isAsisten ? 'Kelas Diampu' : 'Kelas'}
              </Text>
              <Text style={styles.value}>{kelasInfo}</Text>
            </View>
          </View>

          <View style={styles.cornerOrnament} pointerEvents="none">
            <CardCornerLeafOrnament width={72} height={72} />
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.pressed,
          ]}
          onPress={() => setConfirmOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Keluar dari akun"
        >
          <Text style={styles.logoutButtonText}>Keluar</Text>
        </Pressable>
      </ScrollView>

      <ConfirmModal
        visible={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleKeluar}
        title="Keluar dari Akun?"
        message="Apakah Anda yakin ingin keluar dari akun ini?"
        confirmText="Keluar"
        cancelText="Batal"
        variant="danger"
        isDestructive
      />
    </BotanicalScreenShell>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 32,
    flexGrow: 1,
  },
  card: {
    backgroundColor: Botanical.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Botanical.border,
    padding: 18,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  identityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  identityText: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    color: Botanical.textPrimary,
  },
  nim: {
    fontSize: 13,
    color: Botanical.textMuted,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  rolePill: {
    backgroundColor: Botanical.sagePill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  rolePillText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: Botanical.primaryDark,
  },
  divider: {
    height: 1,
    backgroundColor: Botanical.borderDivider,
    marginVertical: 14,
  },
  infoList: {
    gap: 10,
    paddingRight: 44,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontSize: 13,
    color: Botanical.textMuted,
  },
  value: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '600',
    color: Botanical.textPrimary,
  },
  cornerOrnament: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  logoutButton: {
    backgroundColor: Botanical.dangerBg,
    borderWidth: 1,
    borderColor: '#EBC8C0',
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: Botanical.dangerText,
    fontSize: 14,
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
    color: Botanical.textMuted,
    marginBottom: 14,
  },
  primaryButton: {
    backgroundColor: Botanical.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
