import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  type LayoutChangeEvent,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MapView, {
  Circle,
  type MapPressEvent,
  Marker,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  DevicePermissionBanner,
  StatusIzinPerangkat,
} from '@/components/device-permission-banner';
import { MapPinIcon } from '@/components/icons/praktikum-theme-icons';
import { KoordinatTitik } from '@/hooks/use-kelola-lab';
import { Laboratorium, LaboratoriumInput } from '@/types';
import {
  validateKoordinat,
  validateRadiusLab,
  validateRequired,
} from '@/utils/validation';

const DEFAULT_MAP_CENTER: KoordinatTitik = {
  latitude: -7.7662,
  longitude: 110.3768,
};

export interface LabFormModalProps {
  visible: boolean;
  editingLab: Laboratorium | null;
  submitting: boolean;
  errorMessage: string | null;
  locationStatus: StatusIzinPerangkat | null;
  locationMessage: string | null;
  onRequestCurrentLocation: () => Promise<KoordinatTitik | null>;
  onClearLocationStatus: () => void;
  onSubmit: (input: LaboratoriumInput) => Promise<boolean>;
  onClose: () => void;
}

interface LabErrors {
  nama?: string | null;
  lokasi?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  radius?: string | null;
}

type LabFieldScrollKey = 'nama' | 'lokasi' | 'koordinat' | 'radius';

function parseNumberOrNull(value: string): number | null {
  const normalized = value.trim().replace(',', '.');
  if (!normalized) return null;
  const num = Number(normalized);
  return Number.isFinite(num) ? num : null;
}

function LabFormContent({
  editingLab,
  submitting,
  errorMessage,
  locationStatus,
  locationMessage,
  onRequestCurrentLocation,
  onClearLocationStatus,
  onSubmit,
  onClose,
}: Omit<LabFormModalProps, 'visible'>) {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const scrollViewRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const scrollViewportHeightRef = useRef<number>(360);
  const fieldLayoutsRef = useRef<
    Partial<Record<LabFieldScrollKey, { y: number; height: number }>>
  >({});
  const focusedFieldRef = useRef<LabFieldScrollKey | null>(null);
  const keyboardHeightRef = useRef<number>(0);
  const focusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isMapInteracting, setIsMapInteracting] = useState(false);

  const [nama, setNama] = useState(editingLab?.nama ?? '');
  const [lokasi, setLokasi] = useState(editingLab?.lokasi ?? '');
  const [latitudeText, setLatitudeText] = useState(
    editingLab ? String(editingLab.latitude) : ''
  );
  const [longitudeText, setLongitudeText] = useState(
    editingLab ? String(editingLab.longitude) : ''
  );
  const [radiusText, setRadiusText] = useState(
    editingLab ? String(editingLab.radius) : '50'
  );
  const [errors, setErrors] = useState<LabErrors>({});

  const scrollFieldToCenter = (
    key: LabFieldScrollKey,
    kbHeightOverride?: number
  ) => {
    const layout = fieldLayoutsRef.current[key];
    if (!layout || !scrollViewRef.current) return;
    const kbHeight =
      kbHeightOverride ??
      (keyboardHeightRef.current > 0 ? keyboardHeightRef.current : 280);
    const viewportHeight = scrollViewportHeightRef.current;
    const visibleScrollHeight = Math.max(
      160,
      viewportHeight - Math.max(0, kbHeight - 80)
    );
    const targetCenterOffset = visibleScrollHeight * 0.42;
    const fieldCenter = layout.y + layout.height / 2;
    const targetY = Math.max(0, fieldCenter - targetCenterOffset);
    scrollViewRef.current.scrollTo({ y: targetY, animated: true });
  };

  useEffect(() => {
    const handleShow = (event: { endCoordinates: { height: number } }) => {
      const nextHeight = event.endCoordinates.height;
      keyboardHeightRef.current = nextHeight;
      setKeyboardHeight(nextHeight);
      if (focusedFieldRef.current) {
        scrollFieldToCenter(focusedFieldRef.current, nextHeight);
      }
    };

    const handleHide = () => {
      keyboardHeightRef.current = 0;
      setKeyboardHeight(0);
    };

    const subs = [
      Keyboard.addListener('keyboardDidShow', handleShow),
      Keyboard.addListener('keyboardDidHide', handleHide),
    ];
    if (Platform.OS === 'ios') {
      subs.push(
        Keyboard.addListener('keyboardWillShow', handleShow),
        Keyboard.addListener('keyboardWillHide', handleHide)
      );
    }

    return () => {
      subs.forEach((sub) => sub.remove());
      if (focusTimerRef.current) {
        clearTimeout(focusTimerRef.current);
      }
    };
  }, []);

  const handleFieldFocus = (key: LabFieldScrollKey) => {
    focusedFieldRef.current = key;
    setIsInputFocused(true);
    scrollFieldToCenter(key);
    if (focusTimerRef.current) {
      clearTimeout(focusTimerRef.current);
    }
    focusTimerRef.current = setTimeout(() => {
      scrollFieldToCenter(key);
    }, 120);
  };

  const recordFieldLayout = (
    key: LabFieldScrollKey,
    e: LayoutChangeEvent
  ) => {
    const { y, height } = e.nativeEvent.layout;
    fieldLayoutsRef.current[key] = { y, height };
  };

  // ponytail: derived map marker & circle preview dari input teks tanpa useEffect sync
  const parsedLat = parseNumberOrNull(latitudeText);
  const parsedLon = parseNumberOrNull(longitudeText);
  const hasValidCoord =
    parsedLat !== null &&
    parsedLon !== null &&
    parsedLat >= -90 &&
    parsedLat <= 90 &&
    parsedLon >= -180 &&
    parsedLon <= 180;
  const parsedRadius = parseNumberOrNull(radiusText);
  const previewRadius = parsedRadius && parsedRadius > 0 ? parsedRadius : 50;

  const initialRegion = {
    latitude: hasValidCoord ? parsedLat : DEFAULT_MAP_CENTER.latitude,
    longitude: hasValidCoord ? parsedLon : DEFAULT_MAP_CENTER.longitude,
    latitudeDelta: 0.004,
    longitudeDelta: 0.004,
  };

  const clearError = (key: keyof LabErrors) => {
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const applyCoordinate = (latitude: number, longitude: number) => {
    setLatitudeText(latitude.toFixed(6));
    setLongitudeText(longitude.toFixed(6));
    setErrors((prev) => ({ ...prev, latitude: null, longitude: null }));
    onClearLocationStatus();
    mapRef.current?.animateToRegion(
      {
        latitude,
        longitude,
        latitudeDelta: 0.003,
        longitudeDelta: 0.003,
      },
      250
    );
  };

  const handleMapPress = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    applyCoordinate(latitude, longitude);
  };

  const handleUseCurrentLocation = async () => {
    Keyboard.dismiss();
    const coords = await onRequestCurrentLocation();
    if (coords) {
      applyCoordinate(coords.latitude, coords.longitude);
    }
  };

  const handleSave = async () => {
    const nextErrors: LabErrors = {
      nama: validateRequired(nama, 'Nama laboratorium'),
      lokasi: validateRequired(lokasi, 'Lokasi / Gedung'),
      latitude: validateKoordinat(latitudeText, 'Latitude', -90, 90),
      longitude: validateKoordinat(longitudeText, 'Longitude', -180, 180),
      radius: validateRadiusLab(radiusText),
    };

    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    const latVal = parseNumberOrNull(latitudeText);
    const lonVal = parseNumberOrNull(longitudeText);
    const radiusVal = parseNumberOrNull(radiusText);
    if (latVal === null || lonVal === null || radiusVal === null) return;

    await onSubmit({
      nama,
      lokasi,
      latitude: latVal,
      longitude: lonVal,
      radius: Math.round(radiusVal),
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.backdrop}
    >
      <Pressable style={styles.backdropDismiss} onPress={onClose} />
      <View
        style={[
          styles.sheetContainer,
          { paddingBottom: Math.max(insets.bottom, 16) + 12 },
        ]}
      >
        <View style={styles.dragHandle} />
        <Text style={styles.title}>
          {editingLab ? 'Ubah Laboratorium' : 'Tambah Laboratorium'}
        </Text>
        <View style={styles.divider} />

        <ScrollView
          ref={scrollViewRef}
          style={styles.formScroll}
          scrollEnabled={!isMapInteracting}
          onLayout={(e) => {
            scrollViewportHeightRef.current = e.nativeEvent.layout.height;
          }}
          contentContainerStyle={[
            styles.formScrollContent,
            (isInputFocused || keyboardHeight > 0) && {
              paddingBottom: Math.max(keyboardHeight, 280),
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          ) : null}

          <View
            style={styles.fieldGroup}
            onLayout={(e) => recordFieldLayout('nama', e)}
          >
            <Text style={styles.label}>Nama Laboratorium</Text>
            <TextInput
              style={[styles.input, !!errors.nama && styles.inputError]}
              placeholder="Contoh: Lab Pemrograman 1"
              placeholderTextColor="#8C9786"
              value={nama}
              onChangeText={(text) => {
                setNama(text);
                clearError('nama');
              }}
              onFocus={() => handleFieldFocus('nama')}
              onPressIn={() => handleFieldFocus('nama')}
              onBlur={() => setIsInputFocused(false)}
              editable={!submitting}
            />
            {errors.nama ? (
              <Text style={styles.fieldError}>{errors.nama}</Text>
            ) : null}
          </View>

          <View
            style={styles.fieldGroup}
            onLayout={(e) => recordFieldLayout('lokasi', e)}
          >
            <Text style={styles.label}>Lokasi / Gedung</Text>
            <TextInput
              style={[styles.input, !!errors.lokasi && styles.inputError]}
              placeholder="Contoh: Gedung Informatika Lt. 2"
              placeholderTextColor="#8C9786"
              value={lokasi}
              onChangeText={(text) => {
                setLokasi(text);
                clearError('lokasi');
              }}
              onFocus={() => handleFieldFocus('lokasi')}
              onPressIn={() => handleFieldFocus('lokasi')}
              onBlur={() => setIsInputFocused(false)}
              editable={!submitting}
            />
            {errors.lokasi ? (
              <Text style={styles.fieldError}>{errors.lokasi}</Text>
            ) : null}
          </View>

          <View style={styles.fieldGroup}>
            <View style={styles.mapLabelRow}>
              <Text style={styles.label}>Titik Koordinat di Peta</Text>
              <Pressable
                style={({ pressed }) => [
                  styles.gpsButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleUseCurrentLocation}
                disabled={submitting}
                accessibilityRole="button"
                accessibilityLabel="Gunakan Lokasi Saat Ini"
              >
                <MapPinIcon size={13} color="#2D3E2D" />
                <Text style={styles.gpsButtonText}>Lokasi Saat Ini</Text>
              </Pressable>
            </View>

            <View
              style={styles.mapFrame}
              onTouchStart={() => setIsMapInteracting(true)}
              onTouchEnd={() => setIsMapInteracting(false)}
              onTouchCancel={() => setIsMapInteracting(false)}
            >
              <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={initialRegion}
                onPress={handleMapPress}
              >
                {hasValidCoord ? (
                  <>
                    <Marker
                      coordinate={{ latitude: parsedLat, longitude: parsedLon }}
                      draggable
                      onDragStart={() => setIsMapInteracting(true)}
                      onDragEnd={(e) => {
                        setIsMapInteracting(false);
                        const { latitude, longitude } = e.nativeEvent.coordinate;
                        applyCoordinate(latitude, longitude);
                      }}
                      title={nama.trim() || 'Titik Laboratorium'}
                    />
                    <Circle
                      key={`${parsedLat}-${parsedLon}-${previewRadius}`}
                      center={{ latitude: parsedLat, longitude: parsedLon }}
                      radius={previewRadius}
                      strokeColor="rgba(52, 78, 56, 0.8)"
                      fillColor="rgba(200, 215, 184, 0.35)"
                      strokeWidth={2}
                    />
                  </>
                ) : null}
              </MapView>
            </View>
            <Text style={styles.helperText}>
              Ketuk peta untuk memilih titik laboratorium atau isi koordinat secara manual.
            </Text>
          </View>

          {locationStatus ? (
            <View style={styles.bannerGap}>
              <DevicePermissionBanner
                status={locationStatus}
                pesan={locationMessage ?? undefined}
                onRetry={
                  locationStatus !== 'lokasi_memuat'
                    ? handleUseCurrentLocation
                    : undefined
                }
              />
            </View>
          ) : locationMessage ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{locationMessage}</Text>
            </View>
          ) : null}

          <View
            style={styles.twoColRow}
            onLayout={(e) => recordFieldLayout('koordinat', e)}
          >
            <View style={[styles.fieldGroup, styles.colHalf]}>
              <Text style={styles.label}>Latitude</Text>
              <TextInput
                style={[styles.input, !!errors.latitude && styles.inputError]}
                placeholder="-7.766200"
                placeholderTextColor="#8C9786"
                keyboardType="numbers-and-punctuation"
                value={latitudeText}
                onChangeText={(text) => {
                  setLatitudeText(text);
                  clearError('latitude');
                }}
                onFocus={() => handleFieldFocus('koordinat')}
                onPressIn={() => handleFieldFocus('koordinat')}
                onBlur={() => setIsInputFocused(false)}
                editable={!submitting}
              />
              {errors.latitude ? (
                <Text style={styles.fieldError}>{errors.latitude}</Text>
              ) : null}
            </View>

            <View style={[styles.fieldGroup, styles.colHalf]}>
              <Text style={styles.label}>Longitude</Text>
              <TextInput
                style={[styles.input, !!errors.longitude && styles.inputError]}
                placeholder="110.376800"
                placeholderTextColor="#8C9786"
                keyboardType="numbers-and-punctuation"
                value={longitudeText}
                onChangeText={(text) => {
                  setLongitudeText(text);
                  clearError('longitude');
                }}
                onFocus={() => handleFieldFocus('koordinat')}
                onPressIn={() => handleFieldFocus('koordinat')}
                onBlur={() => setIsInputFocused(false)}
                editable={!submitting}
              />
              {errors.longitude ? (
                <Text style={styles.fieldError}>{errors.longitude}</Text>
              ) : null}
            </View>
          </View>

          <View
            style={styles.fieldGroup}
            onLayout={(e) => recordFieldLayout('radius', e)}
          >
            <Text style={styles.label}>Radius Presensi (Meter)</Text>
            <TextInput
              style={[styles.input, !!errors.radius && styles.inputError]}
              placeholder="50"
              placeholderTextColor="#8C9786"
              keyboardType="number-pad"
              value={radiusText}
              onChangeText={(text) => {
                setRadiusText(text.replace(/\D/g, ''));
                clearError('radius');
              }}
              onFocus={() => handleFieldFocus('radius')}
              onPressIn={() => handleFieldFocus('radius')}
              onBlur={() => setIsInputFocused(false)}
              editable={!submitting}
            />
            {errors.radius ? (
              <Text style={styles.fieldError}>{errors.radius}</Text>
            ) : null}
          </View>
        </ScrollView>

        <View style={styles.buttonRow}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.cancelButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={onClose}
            disabled={submitting}
            accessibilityRole="button"
            accessibilityLabel="Batal"
          >
            <Text style={styles.cancelButtonText}>Batal</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.primaryButton,
              submitting && styles.buttonDisabled,
              pressed && !submitting && styles.buttonPressed,
            ]}
            onPress={handleSave}
            disabled={submitting}
            accessibilityRole="button"
            accessibilityLabel="Simpan Laboratorium"
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Simpan</Text>
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

/**
 * Modal bottom-sheet CRUD laboratorium Informatika untuk asisten (FR-35).
 */
export function LabFormModal(props: LabFormModalProps) {
  return (
    <Modal
      transparent
      visible={props.visible}
      animationType="slide"
      onRequestClose={props.onClose}
    >
      {props.visible ? (
        <LabFormContent
          key={props.editingLab?.id ?? 'new-lab'}
          editingLab={props.editingLab}
          submitting={props.submitting}
          errorMessage={props.errorMessage}
          locationStatus={props.locationStatus}
          locationMessage={props.locationMessage}
          onRequestCurrentLocation={props.onRequestCurrentLocation}
          onClearLocationStatus={props.onClearLocationStatus}
          onSubmit={props.onSubmit}
          onClose={props.onClose}
        />
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(28, 40, 28, 0.65)',
    justifyContent: 'flex-end',
  },
  backdropDismiss: {
    flex: 1,
  },
  sheetContainer: {
    width: '100%',
    maxWidth: 540,
    height: '90%',
    alignSelf: 'center',
    backgroundColor: '#FAF9F5',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D7C9',
    alignSelf: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 24,
    color: '#1C281C',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#EAECE3',
    marginVertical: 14,
  },
  formScroll: {
    flex: 1,
  },
  formScrollContent: {
    paddingBottom: 12,
  },
  errorBanner: {
    backgroundColor: '#F4DFDA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  errorBannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9E3B2B',
  },
  fieldGroup: {
    marginBottom: 14,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 12,
  },
  colHalf: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E3E2E',
    marginBottom: 6,
  },
  mapLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#E5EAD7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  gpsButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2D3E2D',
  },
  mapFrame: {
    height: 185,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E6E4DD',
    backgroundColor: '#EAE8E1',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  helperText: {
    fontSize: 11,
    color: '#5A6B5A',
    marginTop: 6,
    lineHeight: 16,
  },
  bannerGap: {
    marginBottom: 14,
  },
  input: {
    height: 46,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6E4DD',
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#1C281C',
    fontVariant: ['tabular-nums'],
  },
  inputError: {
    borderColor: '#B84A39',
    backgroundColor: '#FDF4F2',
  },
  fieldError: {
    fontSize: 12,
    color: '#9E3B2B',
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#E5EAD7',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3E2D',
  },
  primaryButton: {
    backgroundColor: '#2D3E2D',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonPressed: {
    opacity: 0.84,
  },
});
