import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';

export default function PraktikanTabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#ffffff' },
        headerTintColor: '#000000',
        headerTitleStyle: { fontWeight: '600' },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e0e0e0',
        },
        tabBarActiveTintColor: '#111111',
        tabBarInactiveTintColor: '#888888',
      }}>
      <Tabs.Screen
        name="jadwal"
        options={{
          title: 'Jadwal Praktikum',
          tabBarLabel: 'Jadwal',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 18, color }}>📚</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="riwayat"
        options={{
          title: 'Riwayat Kehadiran',
          tabBarLabel: 'Riwayat',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 18, color }}>📋</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil Praktikan',
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 18, color }}>👤</Text>
          ),
        }}
      />
    </Tabs>
  );
}
