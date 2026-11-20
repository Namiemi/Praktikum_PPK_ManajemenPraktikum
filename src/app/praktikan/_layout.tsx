import { Tabs } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  CalendarIcon,
  ClipboardListIcon,
  ClockIcon,
  UserIcon,
} from '@/components/icons/praktikum-theme-icons';
import { Botanical } from '@/constants/theme';

export default function PraktikanTabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: Botanical.forest },
        headerTintColor: Botanical.tabActive,
        headerTitleStyle: { fontWeight: '700', color: Botanical.tabActive },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: Botanical.forest,
          borderTopColor: Botanical.forestBorder,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 6,
          paddingTop: 6,
        },
        tabBarActiveTintColor: Botanical.tabActive,
        tabBarInactiveTintColor: Botanical.tabInactive,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="jadwal"
        options={{
          title: 'Jadwal Praktikum',
          headerShown: false,
          tabBarLabel: 'Jadwal',
          tabBarIcon: ({ color, size }) => (
            <CalendarIcon size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="riwayat"
        options={{
          title: 'Riwayat Kehadiran',
          headerShown: false,
          tabBarLabel: 'Riwayat',
          tabBarIcon: ({ color, size }) => (
            <ClockIcon size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="izin"
        options={{
          title: 'Pengajuan Izin',
          headerShown: false,
          tabBarLabel: 'Izin',
          tabBarIcon: ({ color, size }) => (
            <ClipboardListIcon size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil Praktikan',
          headerShown: false,
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <UserIcon size={size ?? 22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
