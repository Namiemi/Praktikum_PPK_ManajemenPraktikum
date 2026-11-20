import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AsistenAvatar, UserAvatar } from '@/components/icons/asisten-avatar';
import { HeaderBotanicalBlob } from '@/components/icons/praktikum-theme-icons';
import { Botanical } from '@/constants/theme';
import { Peran } from '@/types';

export interface FilterChipOption<T extends string> {
  value: T;
  label: string;
}

export interface BotanicalScreenShellProps {
  children: React.ReactNode;
}

/**
 * Pembungkus layar standar bertema Botanical (#FDFBF7 + ornamen daun kanan atas).
 */
export function BotanicalScreenShell({ children }: BotanicalScreenShellProps) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerOrnament} pointerEvents="none">
        <HeaderBotanicalBlob width={160} height={115} />
      </View>
      {children}
    </SafeAreaView>
  );
}

export interface BotanicalPageHeaderProps<T extends string = string> {
  userId?: string;
  userName?: string;
  peran?: Peran;
  title: string;
  rightSlot?: React.ReactNode;
  errorBanner?: string | null;
  filterOptions?: FilterChipOption<T>[];
  selectedFilter?: T;
  onSelectFilter?: (value: T) => void;
}

/**
 * Header halaman standar Asisten & Praktikan: avatar + nama, judul halaman,
 * slot aksi/badge di kanan, banner error opsional, serta chip filter status.
 */
export function BotanicalPageHeader<T extends string = string>({
  userId,
  userName,
  peran = 'praktikan',
  title,
  rightSlot,
  errorBanner,
  filterOptions,
  selectedFilter,
  onSelectFilter,
}: BotanicalPageHeaderProps<T>) {
  const fallbackName =
    peran === 'asisten' ? 'Asisten Praktikum' : 'Praktikan';

  return (
    <View style={styles.headerSection}>
      <View style={styles.profileRow}>
        {peran === 'asisten' ? (
          <AsistenAvatar userId={userId} nama={userName} size={38} />
        ) : (
          <UserAvatar userId={userId} nama={userName} size={38} />
        )}
        <Text style={styles.profileName} numberOfLines={1}>
          {userName ?? fallbackName}
        </Text>
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.pageTitle}>{title}</Text>
        {rightSlot}
      </View>

      {errorBanner ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{errorBanner}</Text>
        </View>
      ) : null}

      {filterOptions && filterOptions.length > 0 && onSelectFilter ? (
        <View style={styles.chipRow}>
          {filterOptions.map((chip) => {
            const isActive = selectedFilter === chip.value;
            return (
              <Pressable
                key={chip.value}
                style={[
                  styles.chip,
                  isActive ? styles.chipActive : styles.chipInactive,
                ]}
                onPress={() => onSelectFilter(chip.value)}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
              >
                <Text
                  style={[
                    styles.chipText,
                    isActive ? styles.chipTextActive : styles.chipTextInactive,
                  ]}
                >
                  {chip.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Botanical.canvas,
    position: 'relative',
  },
  headerOrnament: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 0,
  },
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
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    color: Botanical.textLabel,
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
    color: Botanical.textPrimary,
    letterSpacing: -0.5,
  },
  errorBanner: {
    backgroundColor: Botanical.dangerBg,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
  },
  errorBannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: Botanical.dangerText,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  chipActive: {
    backgroundColor: Botanical.chipActive,
  },
  chipInactive: {
    backgroundColor: Botanical.surfaceWarm,
    borderWidth: 1,
    borderColor: Botanical.borderChip,
  },
  chipText: {
    fontSize: 12,
    lineHeight: 16,
  },
  chipTextActive: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chipTextInactive: {
    fontWeight: '500',
    color: Botanical.chipActive,
  },
});
