import { Tabs } from 'expo-router';
import React from 'react';

import {
  CalendarIcon,
  UserIcon,
  UsersIcon,
  ClipboardListIcon
} from '@/components/icons/praktikum-theme-icons';

export default function AsistenTabLayout() {
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
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
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
          title: 'Jadwal Asisten',
          headerShown: false,
          tabBarLabel: 'Jadwal',
          tabBarIcon: ({ color, size }) => (
            <CalendarIcon size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="kelas"
        options={{
          title: 'Kelola Kelas',
          headerShown: false,
          tabBarLabel: 'Kelas',
          tabBarIcon: ({ color, size }) => (
            <UsersIcon size={size ?? 22} color={color} />
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
          title: 'Profil Asisten',
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <UserIcon size={size ?? 22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
