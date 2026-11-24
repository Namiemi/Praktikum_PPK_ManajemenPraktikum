import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfirmModal } from '@/components/confirm-modal';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import {
  PilihPeranWaveTop,
  PlusIcon,
} from '@/components/icons/praktikum-theme-icons';
import { LabCard } from '@/components/lab-card';
import { LabFormModal } from '@/components/lab-form-modal';
import { LoadingState } from '@/components/loading-state';
import { TabHeader } from '@/components/tab-header';
import { useKelolaLab } from '@/hooks/use-kelola-lab';
import { cekIzinLokasi } from '@/services';
import { Laboratorium } from '@/types';

const DEFAULT_REGION = {
  latitude: -7.7662,
  longitude: 110.3768,
  latitudeDelta: 0.008,
  longitudeDelta: 0.008,
};

/**
 * Halaman Peta & Pengelolaan Lokasi Laboratorium untuk Asisten (FR-35).
 */
export default function AsistenPetaScreen() {
  const {
    currentUser,
    laboratoriumList,
    loading,
    error,
    retry,
    formOpen,
    editingLab,
    deletingLab,
    submitting,
    actionError,
    locationStatus,
    locationMessage,
    handleOpenTambah,
    handleOpenUbah,
    handleCloseForm,
    handleClearLocationStatus,
    handleAmbilLokasiSaatIni,
    handleSimpanLab,
    handleRequestHapus,
    handleCancelHapus,
    handleConfirmHapus,
  } = useKelolaLab();

  const listRef = useRef<FlatList<Laboratorium>>(null);
  const mapRef = useRef<MapView>(null);
  const hasAutoFocusedRef = useRef(false);
  const [selectedLabId, setSelectedLabId] = useState<string | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  const firstLab = laboratoriumList[0] ?? null;

  useEffect(() => {
    if (!firstLab || hasAutoFocusedRef.current) return;
    hasAutoFocusedRef.current = true;
    mapRef.current?.animateToRegion(
      {
        latitude: firstLab.latitude,
        longitude: firstLab.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      },
      250
    );
  }, [firstLab]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      cekIzinLokasi()
        .then((izin) => {
          if (active) setHasLocationPermission(izin.granted);
        })
        .catch(() => {
          if (active) setHasLocationPermission(false);
        });
      return () => {
        active = false;
      };
    }, [])
  );

  useEffect(() => {
    if (formOpen) return;
    let active = true;
    cekIzinLokasi()
      .then((izin) => {
        if (active) setHasLocationPermission(izin.granted);
      })
      .catch(() => {
        if (active) setHasLocationPermission(false);
      });
    return () => {
      active = false;
    };
  }, [formOpen]);

  if (loading) {
    return <LoadingState pesan="Memuat data laboratorium..." />;
  }

  if (error) {
    return <ErrorState pesan={error} onRetry={retry} />;
  }

  const focusedLab =
    laboratoriumList.find((l) => l.id === selectedLabId) ??
    laboratoriumList[0] ??
    null;

  const initialRegion = focusedLab
    ? {
        latitude: focusedLab.latitude,
        longitude: focusedLab.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }
    : DEFAULT_REGION;

  const handleSelectLab = (lab: Laboratorium, scrollToMap = false) => {
    setSelectedLabId(lab.id);
    if (scrollToMap) {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    }
    mapRef.current?.animateToRegion(
      {
        latitude: lab.latitude,
        longitude: lab.longitude,
        latitudeDelta: 0.0035,
        longitudeDelta: 0.0035,
      },
      250
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.waveTopWrapper} pointerEvents="none">
        <PilihPeranWaveTop width="100%" height={175} />
      </View>

      <FlatList
        ref={listRef}
        data={laboratoriumList}
        style={styles.list}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <TabHeader
              userId={currentUser?.id}
              nama={currentUser?.nama ?? 'Asisten Praktikum'}
              title="Peta & Lab"
              isAsisten
              rightSlot={
                <Pressable
                  style={({ pressed }) => [
                    styles.addButton,
                    pressed && styles.pressed,
                  ]}
                  onPress={handleOpenTambah}
                  accessibilityRole="button"
                  accessibilityLabel="Tambah Laboratorium"
                >
                  <PlusIcon size={14} color="#FFFFFF" />
                  <Text style={styles.addButtonText}>Lab</Text>
                </Pressable>
              }
            >
              {actionError && !formOpen && !deletingLab ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>{actionError}</Text>
                </View>
              ) : null}
            </TabHeader>

            <View style={styles.mapCard}>
              <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={initialRegion}
                showsUserLocation={hasLocationPermission}
                showsMyLocationButton={hasLocationPermission}
              >
                {laboratoriumList.map((lab) => (
                  <React.Fragment key={lab.id}>
                    <Marker
                      coordinate={{
                        latitude: lab.latitude,
                        longitude: lab.longitude,
                      }}
                      title={lab.nama}
                      description={`${lab.lokasi} • Radius ${lab.radius} m`}
                      tracksViewChanges={false}
                      onPress={() => handleSelectLab(lab)}
                    />
                    <Circle
                      key={`${lab.id}-${lab.latitude}-${lab.longitude}-${lab.radius}`}
                      center={{
                        latitude: lab.latitude,
                        longitude: lab.longitude,
                      }}
                      radius={lab.radius}
                      strokeColor="rgba(52, 78, 56, 0.85)"
                      fillColor="rgba(200, 215, 184, 0.35)"
                      strokeWidth={2}
                    />
                  </React.Fragment>
                ))}
              </MapView>
            </View>

            <Text style={styles.sectionTitle}>
              Daftar Laboratorium ({laboratoriumList.length})
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <LabCard
            lab={item}
            isSelected={item.id === focusedLab?.id}
            onPress={() => handleSelectLab(item, true)}
            onEdit={() => handleOpenUbah(item)}
            onDelete={() => handleRequestHapus(item)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            variant="schedule"
            judul="Belum Ada Laboratorium"
            deskripsi="Tambahkan titik koordinat dan radius laboratorium untuk validasi presensi praktikan."
          />
        }
      />

      <LabFormModal
        visible={formOpen}
        editingLab={editingLab}
        submitting={submitting}
        errorMessage={actionError}
        locationStatus={locationStatus}
        locationMessage={locationMessage}
        onRequestCurrentLocation={handleAmbilLokasiSaatIni}
        onClearLocationStatus={handleClearLocationStatus}
        onSubmit={handleSimpanLab}
        onClose={handleCloseForm}
      />

      <ConfirmModal
        visible={deletingLab !== null}
        title="Hapus Laboratorium?"
        message={
          deletingLab
            ? `Hapus '${deletingLab.nama}' dari daftar laboratorium? Sesi yang sudah terhubung perlu diperbarui laboratoriumnya.`
            : ''
        }
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
        isDestructive
        onConfirm={handleConfirmHapus}
        onCancel={handleCancelHapus}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
    position: 'relative',
  },
  waveTopWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  list: {
    flex: 1,
    zIndex: 1,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 32,
    flexGrow: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#344E38',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.82,
  },
  errorBanner: {
    backgroundColor: '#F4DFDA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
  },
  errorBannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9E3B2B',
  },
  mapCard: {
    height: 220,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E6E4DD',
    backgroundColor: '#EAE8E1',
    marginBottom: 16,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E3E2E',
    marginBottom: 10,
  },
});
