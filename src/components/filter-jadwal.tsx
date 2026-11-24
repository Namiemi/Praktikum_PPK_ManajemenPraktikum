/**
 * @file filter-jadwal.tsx
 * @description Bar pencarian dan panel filter jadwal sesi (FR-36).
 */

import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { DatePickerModal } from "@/components/date-time-picker-modal";
import {
  CalendarIcon,
  SearchIcon,
} from "@/components/icons/praktikum-theme-icons";
import { StatusSesi } from "@/types";
import { formatDateIndo } from "@/utils";
import {
  hitungFilterAktif,
  KRITERIA_KOSONG,
  KriteriaFilterSesi,
  RENTANG_JAM,
  RentangJam,
} from "@/utils/filter-sesi";

const STATUS_OPSI: { value: StatusSesi; label: string }[] = [
  { value: "DIBUKA", label: "Dibuka" },
  { value: "BELUM_DIBUKA", label: "Belum Dibuka" },
  { value: "DITUTUP", label: "Ditutup" },
];

export interface FilterJadwalProps {
  kriteria: KriteriaFilterSesi;
  onChange: (kriteria: KriteriaFilterSesi) => void;
  /** Pilihan mata kuliah yang tersedia di daftar sesi */
  daftarMataKuliah: string[];
}

export function FilterJadwal({
  kriteria,
  onChange,
  daftarMataKuliah,
}: FilterJadwalProps) {
  const [panelTerbuka, setPanelTerbuka] = useState(false);
  const [pilihTanggal, setPilihTanggal] = useState(false);
  const jumlahAktif = hitungFilterAktif(kriteria);

  const ubah = (sebagian: Partial<KriteriaFilterSesi>) =>
    onChange({ ...kriteria, ...sebagian });

  return (
    <View style={styles.container}>
      <View style={styles.barRow}>
        <View style={styles.searchBox}>
          <SearchIcon size={16} />
          <TextInput
            style={styles.searchInput}
            value={kriteria.kataKunci}
            onChangeText={(kataKunci) => ubah({ kataKunci })}
            placeholder="Cari mata kuliah, topik, atau ruangan"
            placeholderTextColor="#8C9786"
            returnKeyType="search"
            accessibilityLabel="Cari jadwal"
          />
        </View>
        <Pressable
          style={[
            styles.filterButton,
            jumlahAktif > 0 && styles.filterButtonAktif,
          ]}
          onPress={() => setPanelTerbuka((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel={`Filter jadwal, ${jumlahAktif} aktif`}
          accessibilityState={{ expanded: panelTerbuka }}
        >
          <Text
            style={[
              styles.filterText,
              jumlahAktif > 0 && styles.filterTextAktif,
            ]}
          >
            Filter{jumlahAktif > 0 ? ` (${jumlahAktif})` : ""}
          </Text>
        </Pressable>
      </View>

      {panelTerbuka ? (
        <View style={styles.panel}>
          <GrupChip
            label="Status"
            opsi={STATUS_OPSI}
            nilai={kriteria.status}
            onPilih={(status) => ubah({ status })}
          />

          {daftarMataKuliah.length > 1 ? (
            <GrupChip
              label="Mata kuliah"
              opsi={daftarMataKuliah.map((mk) => ({ value: mk, label: mk }))}
              nilai={kriteria.mataKuliah}
              onPilih={(mataKuliah) => ubah({ mataKuliah })}
            />
          ) : null}

          <GrupChip
            label="Jam mulai"
            opsi={(Object.keys(RENTANG_JAM) as RentangJam[]).map((key) => ({
              value: key,
              label: RENTANG_JAM[key].label,
            }))}
            nilai={kriteria.rentangJam}
            onPilih={(rentangJam) => ubah({ rentangJam })}
          />

          <Text style={styles.grupLabel}>Tanggal</Text>
          <View style={styles.tanggalRow}>
            <Pressable
              style={[
                styles.chip,
                kriteria.tanggal && styles.chipAktif,
                styles.tanggalChip,
              ]}
              onPress={() => setPilihTanggal(true)}
              accessibilityRole="button"
              accessibilityLabel="Pilih tanggal"
            >
              <CalendarIcon
                size={14}
                color={kriteria.tanggal ? "#FFFFFF" : "#3E543E"}
              />
              <Text
                style={[
                  styles.chipText,
                  kriteria.tanggal && styles.chipTextAktif,
                ]}
              >
                {kriteria.tanggal
                  ? formatDateIndo(kriteria.tanggal)
                  : "Semua tanggal"}
              </Text>
            </Pressable>
            {kriteria.tanggal ? (
              <Pressable
                onPress={() => ubah({ tanggal: null })}
                accessibilityRole="button"
                accessibilityLabel="Hapus filter tanggal"
              >
                <Text style={styles.hapusText}>Hapus</Text>
              </Pressable>
            ) : null}
          </View>

          {jumlahAktif > 0 ? (
            <Pressable
              style={styles.resetButton}
              onPress={() =>
                onChange({ ...KRITERIA_KOSONG, kataKunci: kriteria.kataKunci })
              }
              accessibilityRole="button"
              accessibilityLabel="Reset semua filter"
            >
              <Text style={styles.hapusText}>Reset filter</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <DatePickerModal
        visible={pilihTanggal}
        value={kriteria.tanggal ?? ""}
        onSelect={(tanggal) => {
          ubah({ tanggal });
          setPilihTanggal(false);
        }}
        onClose={() => setPilihTanggal(false)}
      />
    </View>
  );
}

function GrupChip<T extends string>({
  label,
  opsi,
  nilai,
  onPilih,
}: {
  label: string;
  opsi: { value: T; label: string }[];
  nilai: T | null;
  onPilih: (nilai: T | null) => void;
}) {
  return (
    <View>
      <Text style={styles.grupLabel}>{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {opsi.map((o) => {
          const aktif = nilai === o.value;
          return (
            <Pressable
              key={o.value}
              style={[styles.chip, aktif && styles.chipAktif]}
              onPress={() => onPilih(aktif ? null : o.value)}
              accessibilityRole="button"
              accessibilityLabel={`${label} ${o.label}`}
              accessibilityState={{ selected: aktif }}
            >
              <Text style={[styles.chipText, aktif && styles.chipTextAktif]}>
                {o.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  barRow: {
    flexDirection: "row",
    gap: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6E4DD",
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: "#1C281C",
  },
  filterButton: {
    justifyContent: "center",
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D5E0D5",
    backgroundColor: "#FFFFFF",
  },
  filterButtonAktif: {
    backgroundColor: "#2D3E2D",
    borderColor: "#2D3E2D",
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2D3E2D",
  },
  filterTextAktif: {
    color: "#FFFFFF",
  },
  panel: {
    marginTop: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAECE3",
    borderRadius: 16,
    padding: 14,
    gap: 4,
  },
  grupLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#5A6B5A",
    marginTop: 6,
    marginBottom: 6,
  },
  chipRow: {
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D5E0D5",
    backgroundColor: "#F5F2EB",
  },
  chipAktif: {
    backgroundColor: "#2D3E2D",
    borderColor: "#2D3E2D",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3E543E",
  },
  chipTextAktif: {
    color: "#FFFFFF",
  },
  tanggalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  tanggalChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  hapusText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9E3B2B",
  },
  resetButton: {
    alignSelf: "flex-start",
    marginTop: 10,
  },
});
