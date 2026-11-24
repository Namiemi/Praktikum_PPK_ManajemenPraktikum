/**
 * @file lab-activity-sheet.tsx
 * @description Bottom Sheet informasi laboratorium beserta praktikum yang sedang
 * berlangsung dan praktikum berikutnya (FR-39). Dipakai tab Peta praktikan dan asisten.
 */

import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { BottomSheet } from "@/components/bottom-sheet";
import { StatusBadge } from "@/components/status-badge";
import { hitungJarakMeter } from "@/services";
import { Koordinat } from "@/hooks/use-posisi-perangkat";
import { Laboratorium, SesiPraktikum, StatusSesi } from "@/types";
import { formatDateIndo } from "@/utils";
import { getAktivitasLab } from "@/utils/aktivitas-lab";

const BADGE_STATUS = {
  BELUM_DIBUKA: "belum_dibuka",
  DIBUKA: "dibuka",
  DITUTUP: "ditutup",
} as const satisfies Record<StatusSesi, string>;

export interface LabActivitySheetProps {
  lab: Laboratorium | null;
  semuaSesi: SesiPraktikum[];
  posisi: Koordinat | null;
  onClose: () => void;
}

export function LabActivitySheet({
  lab,
  semuaSesi,
  posisi,
  onClose,
}: LabActivitySheetProps) {
  const [sekarang, setSekarang] = useState(() => new Date());

  // Perbarui acuan waktu tiap 30 detik agar status "sedang berlangsung" ikut berganti.
  useEffect(() => {
    if (!lab) return;
    const timer = setInterval(() => setSekarang(new Date()), 30000);
    return () => clearInterval(timer);
  }, [lab]);

  const aktivitas = lab ? getAktivitasLab(lab.id, semuaSesi, sekarang) : null;
  const jarak =
    lab && posisi
      ? hitungJarakMeter(
          posisi.latitude,
          posisi.longitude,
          lab.latitude,
          lab.longitude,
        )
      : null;

  return (
    <BottomSheet
      visible={lab !== null}
      onClose={onClose}
      title={lab?.nama}
      closeText="Tutup"
    >
      {lab && aktivitas ? (
        <View>
          <Text style={styles.meta}>{lab.lokasi || "Lokasi belum diisi"}</Text>
          <Text style={styles.meta}>
            Radius presensi {lab.radius} m
            {jarak !== null
              ? ` · Anda ${jarak} m dari sini${jarak <= lab.radius ? " (dalam radius)" : ""}`
              : ""}
          </Text>

          <Text style={styles.judulBagian}>Sedang berlangsung</Text>
          {aktivitas.berlangsung.length ? (
            aktivitas.berlangsung.map((s) => <KartuSesi key={s.id} sesi={s} />)
          ) : (
            <Text style={styles.kosong}>
              Tidak ada praktikum yang sedang berlangsung.
            </Text>
          )}

          <Text style={styles.judulBagian}>Praktikum berikutnya</Text>
          {aktivitas.berikutnya ? (
            <KartuSesi sesi={aktivitas.berikutnya} />
          ) : (
            <Text style={styles.kosong}>
              Belum ada jadwal praktikum berikutnya.
            </Text>
          )}
        </View>
      ) : null}
    </BottomSheet>
  );
}

function KartuSesi({ sesi }: { sesi: SesiPraktikum }) {
  return (
    <View style={styles.kartu}>
      <View style={styles.kartuHeader}>
        <Text style={styles.kartuJudul} numberOfLines={2}>
          {sesi.mataKuliah} · Kelas {sesi.kelas}
        </Text>
        <StatusBadge status={BADGE_STATUS[sesi.status]} />
      </View>
      <Text style={styles.kartuTeks} numberOfLines={1}>
        Pertemuan {sesi.pertemuan}: {sesi.topik}
      </Text>
      <Text style={styles.kartuTeks}>
        {formatDateIndo(sesi.tanggal)} · {sesi.jamMulai} - {sesi.jamSelesai} WIB
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  meta: {
    fontSize: 13,
    color: "#5A6B5A",
    textAlign: "center",
  },
  judulBagian: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1C281C",
    marginTop: 16,
    marginBottom: 8,
  },
  kosong: {
    fontSize: 13,
    color: "#6B7280",
  },
  kartu: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAECE3",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  kartuHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  kartuJudul: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#1C281C",
  },
  kartuTeks: {
    fontSize: 12,
    color: "#5A6B5A",
    marginTop: 4,
  },
});
