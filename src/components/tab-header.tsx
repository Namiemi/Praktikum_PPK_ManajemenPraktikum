import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AsistenAvatar, UserAvatar } from '@/components/icons/asisten-avatar';

export interface TabHeaderProps {
  userId?: string;
  nama?: string;
  title: string;
  isAsisten?: boolean;
  rightSlot?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Header halaman tab dengan avatar pengguna, judul halaman, dan slot aksi opsional.
 */
export function TabHeader({
  userId,
  nama = 'Pengguna',
  title,
  isAsisten = false,
  rightSlot,
  children,
}: TabHeaderProps) {
  return (
    <View style={styles.headerSection}>
      <View style={styles.profileRow}>
        {isAsisten ? (
          <AsistenAvatar userId={userId} nama={nama} size={38} />
        ) : (
          <UserAvatar userId={userId} nama={nama} size={38} />
        )}
        <Text style={styles.profileName}>{nama}</Text>
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.pageTitle}>{title}</Text>
        {rightSlot}
      </View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  headerSection: {
    marginBottom: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  profileName: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    color: '#2E3E2E',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  pageTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    color: '#1C281C',
    letterSpacing: -0.5,
  },
});
