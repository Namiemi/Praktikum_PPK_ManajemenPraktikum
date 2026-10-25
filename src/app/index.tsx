import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { usePraktikum } from "@/context/praktikum-context";
import { Peran, User } from "@/types";

export default function PilihPeranScreen() {
  const { users, login } = usePraktikum();

  const [selectedRole, setSelectedRole] = useState<Peran>("praktikan");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchRole = u.peran === selectedRole;
      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchRole;
      return (
        matchRole &&
        (u.nama.toLowerCase().includes(query) ||
          u.nim.toLowerCase().includes(query))
      );
    });
  }, [users, selectedRole, searchQuery]);

  const handleRoleChange = (role: Peran) => {
    setSelectedRole(role);
    setSelectedUser(null);
  };

  const handleMasuk = () => {
    if (!selectedUser) return;
    login(selectedUser);
    if (selectedUser.peran === "asisten") {
      router.replace("/asisten/jadwal");
    } else {
      router.replace("/praktikan/jadwal");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Manajemen Praktikum</Text>
          <Text style={styles.subtitle}>
            Silakan pilih peran dan identitas Anda untuk melanjutkan.
          </Text>
        </View>

        {/* Tab Pemilihan Peran */}
        <View style={styles.roleTabContainer}>
          <Pressable
            style={[
              styles.roleTabButton,
              selectedRole === "praktikan" && styles.roleTabButtonActive,
            ]}
            onPress={() => handleRoleChange("praktikan")}
          >
            <Text
              style={[
                styles.roleTabText,
                selectedRole === "praktikan" && styles.roleTabTextActive,
              ]}
            >
              Praktikan
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.roleTabButton,
              selectedRole === "asisten" && styles.roleTabButtonActive,
            ]}
            onPress={() => handleRoleChange("asisten")}
          >
            <Text
              style={[
                styles.roleTabText,
                selectedRole === "asisten" && styles.roleTabTextActive,
              ]}
            >
              Asisten
            </Text>
          </Pressable>
        </View>

        {/* Input Pencarian */}
        <TextInput
          style={styles.searchInput}
          placeholder="Cari berdasarkan nama atau NIM..."
          placeholderTextColor="#888888"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />

        {/* Daftar Pengguna */}
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isSelected = selectedUser?.id === item.id;
            return (
              <Pressable
                style={[styles.userCard, isSelected && styles.userCardSelected]}
                onPress={() => setSelectedUser(item)}
              >
                <View style={styles.userCardInfo}>
                  <Text style={styles.userName}>{item.nama}</Text>
                  <Text style={styles.userNim}>{item.nim}</Text>
                </View>
                <Text style={styles.userMeta}>
                  {item.peran === "asisten"
                    ? item.mataKuliah
                    : `Kelas ${item.kelas}`}
                </Text>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Pengguna tidak ditemukan.</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />

        {/* Tombol Masuk */}
        <View style={styles.footer}>
          <Pressable
            style={[
              styles.masukButton,
              !selectedUser && styles.masukButtonDisabled,
            ]}
            disabled={!selectedUser}
            onPress={handleMasuk}
          >
            <Text
              style={[
                styles.masukButtonText,
                !selectedUser && styles.masukButtonTextDisabled,
              ]}
            >
              {selectedUser ? `Masuk` : "Pilih Identitas Terlebih Dahulu"}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111111",
  },
  subtitle: {
    fontSize: 14,
    color: "#666666",
    marginTop: 4,
  },
  roleTabContainer: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 4,
    marginBottom: 12,
  },
  roleTabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 6,
  },
  roleTabButtonActive: {
    backgroundColor: "#ffffff",
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  roleTabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666666",
  },
  roleTabTextActive: {
    color: "#111111",
    fontWeight: "700",
  },
  searchInput: {
    height: 44,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: "#fafafa",
    marginBottom: 12,
  },
  listContent: {
    gap: 8,
    paddingBottom: 16,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    backgroundColor: "#ffffff",
  },
  userCardSelected: {
    borderColor: "#111111",
    backgroundColor: "#f8f8f8",
    borderWidth: 1.5,
  },
  userCardInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111111",
  },
  userNim: {
    fontSize: 13,
    color: "#777777",
    marginTop: 2,
  },
  userMeta: {
    fontSize: 12,
    color: "#555555",
    fontWeight: "500",
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#999999",
  },
  footer: {
    paddingTop: 12,
  },
  masukButton: {
    backgroundColor: "#111111",
    height: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  masukButtonDisabled: {
    backgroundColor: "#cccccc",
  },
  masukButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  masukButtonTextDisabled: {
    color: "#888888",
  },
});
