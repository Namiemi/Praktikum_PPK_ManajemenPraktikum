import { useNetInfo } from '@react-native-community/netinfo';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WifiOffIcon } from '@/components/icons/praktikum-theme-icons';

export function OfflineBanner() {
  const netInfo = useNetInfo();
  const insets = useSafeAreaInsets();

  // Hanya tampilkan jika netInfo sudah terdeteksi dan tidak terhubung
  const isOffline = netInfo.isConnected === false;

  if (!isOffline) {
    return null;
  }

  return (
    <View style={[styles.banner, { paddingTop: Math.max(insets.top, 8) }]}>
      <View style={styles.row}>
        <WifiOffIcon size={14} color="#FFFFFF" />
        <Text style={styles.text}>
          Koneksi terputus. Data ditampilkan dari cache offline.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#B84A39',
    paddingHorizontal: 16,
    paddingBottom: 8,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
