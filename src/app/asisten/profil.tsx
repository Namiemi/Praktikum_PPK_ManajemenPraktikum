import { router } from 'expo-router';
import {
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { usePraktikum } from '@/context/praktikum-context';

export default function AsistenProfilScreen() {
  const { currentUser, logout } = usePraktikum();

  const handleGantiPeran = () => {
    Alert.alert('Ganti Peran', 'Apakah Anda yakin ingin keluar dan berganti peran?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/');
        },
      },
    ]);
  };

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Tidak ada sesi pengguna aktif.</Text>
          <Pressable style={styles.button} onPress={() => router.replace('/')}>
            <Text style={styles.buttonText}>Pilih Identitas</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>

        <View style={styles.row}>
          <Text style={styles.label}>Nama</Text>
          <Text style={styles.value}>{currentUser.nama}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>NIM</Text>
          <Text style={styles.value}>{currentUser.nim}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Peran</Text>
          <Text style={styles.value}>Asisten Praktikum</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Mata Kuliah</Text>
          <Text style={styles.value}>{currentUser.mataKuliah || '-'}</Text>
        </View>
      </View>

      <Pressable style={styles.gantiButton} onPress={handleGantiPeran}>
        <Text style={styles.gantiButtonText}>Ganti Peran</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
  },
  divider: {
    height: 1,
    backgroundColor: '#eeeeee',
    marginVertical: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    color: '#666666',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
  },
  gantiButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d32f2f',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  gantiButtonText: {
    color: '#d32f2f',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#111111',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
