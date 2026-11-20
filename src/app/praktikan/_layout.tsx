import { Tabs } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  CalendarIcon,
  ClipboardListIcon,
  FileTextIcon,
  UserIcon,
} from '@/components/icons/praktikum-theme-icons';

export default function PraktikanTabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#2E4028' },
        headerTintColor: '#FDFBF7',
        headerTitleStyle: { fontWeight: '700', color: '#FDFBF7' },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: '#2E4028',
          borderTopColor: '#202D1D',
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 6,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#FDFBF7',
        tabBarInactiveTintColor: '#A0A79A',
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
            <ClipboardListIcon size={size ?? 22} color={color} />
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
            <FileTextIcon size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil Praktikan',
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <UserIcon size={size ?? 22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
