/**
 * @file lab-map-view.tsx
 * @description Peta laboratorium Informatika dengan marker, lingkaran radius presensi,
 * dan marker posisi pengguna yang diperbarui real-time (FR-38).
 * Dipakai bersama oleh tab Peta praktikan dan asisten.
 */

import React, { useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
import MapView, {
  Circle,
  Marker,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";

import { Koordinat } from "@/hooks/use-posisi-perangkat";
import { Laboratorium } from "@/types";

export interface LabMapViewProps {
  laboratoriumList: Laboratorium[];
  posisi: Koordinat | null;
  labTerpilihId?: string | null;
  onPilihLab: (lab: Laboratorium) => void;
}

/** Wilayah awal yang mencakup seluruh laboratorium (atau posisi pengguna bila belum ada lab). */
function hitungRegionAwal(
  labs: Laboratorium[],
  posisi: Koordinat | null,
): Region | undefined {
  const titik = labs.length
    ? labs.map((l) => ({ latitude: l.latitude, longitude: l.longitude }))
    : posisi
      ? [posisi]
      : [];
  if (!titik.length) return undefined;

  const lats = titik.map((t) => t.latitude);
  const lngs = titik.map((t) => t.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.6, 0.005),
    longitudeDelta: Math.max((maxLng - minLng) * 1.6, 0.005),
  };
}

export function LabMapView({
  laboratoriumList,
  posisi,
  labTerpilihId,
  onPilihLab,
}: LabMapViewProps) {
  const mapRef = useRef<MapView>(null);
  const regionAwal = hitungRegionAwal(laboratoriumList, posisi);
  const sudahDiarahkan = useRef(false);

  // Begitu data pertama tersedia, arahkan kamera sekali saja; setelah itu
  // pengguna bebas menggeser peta.
  useEffect(() => {
    if (sudahDiarahkan.current || !regionAwal) return;
    sudahDiarahkan.current = true;
    mapRef.current?.animateToRegion(regionAwal, 400);
  }, [regionAwal]);

  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFill}
      provider={PROVIDER_GOOGLE}
      initialRegion={regionAwal}
      showsCompass
      toolbarEnabled={false}
    >
      {laboratoriumList.map((lab) => {
        const terpilih = lab.id === labTerpilihId;
        return (
          <React.Fragment key={lab.id}>
            <Circle
              center={{ latitude: lab.latitude, longitude: lab.longitude }}
              radius={lab.radius}
              strokeColor={terpilih ? "#2D3E2D" : "rgba(45, 62, 45, 0.6)"}
              strokeWidth={terpilih ? 2 : 1}
              fillColor={
                terpilih ? "rgba(62, 84, 62, 0.25)" : "rgba(62, 84, 62, 0.12)"
              }
            />
            <Marker
              coordinate={{ latitude: lab.latitude, longitude: lab.longitude }}
              title={lab.nama}
              description={lab.lokasi}
              pinColor={terpilih ? "#2D3E2D" : "#6B8F5E"}
              onPress={() => onPilihLab(lab)}
            />
          </React.Fragment>
        );
      })}

      {posisi ? (
        <>
          {posisi.akurasi ? (
            <Circle
              center={{
                latitude: posisi.latitude,
                longitude: posisi.longitude,
              }}
              radius={posisi.akurasi}
              strokeColor="rgba(30, 90, 150, 0.4)"
              fillColor="rgba(30, 90, 150, 0.1)"
            />
          ) : null}
          <Marker
            coordinate={{
              latitude: posisi.latitude,
              longitude: posisi.longitude,
            }}
            title="Posisi Anda"
            pinColor="#1E5A96"
            tracksViewChanges={false}
          />
        </>
      ) : null}
    </MapView>
  );
}
