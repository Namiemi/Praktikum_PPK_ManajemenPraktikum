import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DevicePermissionBanner } from "@/components/device-permission-banner";
import { ErrorState } from "@/components/error-state";
import { LabActivitySheet } from "@/components/lab-activity-sheet";
import { LabMapView } from "@/components/lab-map-view";
import { LoadingState } from "@/components/loading-state";
import { usePraktikum } from "@/context/praktikum-context";
import { usePosisiPerangkat } from "@/hooks/use-posisi-perangkat";

export default function PetaPraktikanScreen() {
  const { laboratoriumList, semuaSesiList, loading, error, retry } =
    usePraktikum();
  const { status, posisi, muatUlang } = usePosisiPerangkat();
  const [labTerpilihId, setLabTerpilihId] = useState<string | null>(null);

  if (loading) return <LoadingState pesan="Memuat peta laboratorium..." />;
  if (error) return <ErrorState pesan={error} onRetry={retry} />;

  const labTerpilih =
    laboratoriumList.find((l) => l.id === labTerpilihId) ?? null;

  let banner: React.ReactNode = null;
  if (status === "izin_ditolak") {
    banner = (
      <DevicePermissionBanner
        status="izin_lokasi_ditolak"
        onRetry={muatUlang}
      />
    );
  } else if (status === "gps_mati") {
    banner = <DevicePermissionBanner status="gps_mati" onRetry={muatUlang} />;
  } else if (status === "gagal") {
    banner = (
      <DevicePermissionBanner
        status="gps_mati"
        pesan="Lokasi perangkat gagal diperoleh. Peta tetap bisa dipakai tanpa posisi Anda."
        onRetry={muatUlang}
      />
    );
  } else if (status === "memuat") {
    banner = <DevicePermissionBanner status="lokasi_memuat" />;
  }

  return (
    <View style={styles.container}>
      <LabMapView
        laboratoriumList={laboratoriumList}
        posisi={posisi}
        labTerpilihId={labTerpilihId}
        onPilihLab={(lab) => setLabTerpilihId(lab.id)}
      />

      <SafeAreaView
        style={styles.overlay}
        edges={["top"]}
        pointerEvents="box-none"
      >
        <View style={styles.judulCard} pointerEvents="none">
          <Text style={styles.judul}>Peta Laboratorium</Text>
          <Text style={styles.subjudul}>
            {laboratoriumList.length
              ? "Ketuk marker laboratorium untuk melihat praktikum."
              : "Belum ada data laboratorium."}
          </Text>
        </View>
        {banner ? <View style={styles.banner}>{banner}</View> : null}
      </SafeAreaView>

      <LabActivitySheet
        key={labTerpilihId ?? "tutup"}
        lab={labTerpilih}
        semuaSesi={semuaSesiList}
        posisi={posisi}
        onClose={() => setLabTerpilihId(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFBF7",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  judulCard: {
    backgroundColor: "rgba(253, 251, 247, 0.95)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E6E4DD",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  judul: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1C281C",
  },
  subjudul: {
    fontSize: 12,
    color: "#5A6B5A",
    marginTop: 2,
  },
  banner: {
    marginTop: 10,
  },
});
