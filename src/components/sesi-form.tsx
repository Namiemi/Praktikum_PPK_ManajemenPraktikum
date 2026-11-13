import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  DatePickerModal,
  TimePickerModal,
} from '@/components/date-time-picker-modal';
import {
  CalendarIcon,
  ClockIcon,
} from '@/components/icons/praktikum-theme-icons';
import { Kelas, SesiInput, SesiPraktikum } from '@/types';
import { formatDateIndo } from '@/utils';
import {
  validateBilanganPositif,
  validateJam,
  validateRentangJam,
  validateRequired,
  validateTanggal,
} from '@/utils/validation';

export interface SesiFormModalProps {
  visible: boolean;
  editingSesi: SesiPraktikum | null;
  kelasList: Kelas[];
  submitting: boolean;
  errorMessage: string | null;
  onSubmit: (input: SesiInput) => Promise<boolean>;
  onClose: () => void;
}

interface SesiErrors {
  kelas?: string | null;
  pertemuan?: string | null;
  ruang?: string | null;
  topik?: string | null;
  tanggal?: string | null;
  jamMulai?: string | null;
  jamSelesai?: string | null;
}

type SesiFieldScrollKey = 'pertemuanRuang' | 'topik' | 'catatan';

function SesiFormContent({
  editingSesi,
  kelasList,
  submitting,
  errorMessage,
  onSubmit,
  onClose,
}: Omit<SesiFormModalProps, 'visible'>) {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const scrollViewportHeightRef = useRef<number>(360);
  const fieldLayoutsRef = useRef<
    Partial<Record<SesiFieldScrollKey, { y: number; height: number }>>
  >({});
  const focusedFieldRef = useRef<SesiFieldScrollKey | null>(null);
  const keyboardHeightRef = useRef<number>(0);
  const focusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const [kelasId, setKelasId] = useState(editingSesi?.kelasId ?? '');
  const [kelasNama, setKelasNama] = useState(editingSesi?.kelas ?? '');
  const [mataKuliah, setMataKuliah] = useState(editingSesi?.mataKuliah ?? '');
  const [pertemuan, setPertemuan] = useState(
    editingSesi ? String(editingSesi.pertemuan) : ''
  );
  const [ruang, setRuang] = useState(editingSesi?.ruang ?? '');
  const [topik, setTopik] = useState(editingSesi?.topik ?? '');
  const [tanggal, setTanggal] = useState(editingSesi?.tanggal ?? '');
  const [jamMulai, setJamMulai] = useState(editingSesi?.jamMulai ?? '');
  const [jamSelesai, setJamSelesai] = useState(editingSesi?.jamSelesai ?? '');
  const [catatan, setCatatan] = useState(editingSesi?.catatan ?? '');
  const [errors, setErrors] = useState<SesiErrors>({});
  const [activePicker, setActivePicker] = useState<
    'tanggal' | 'jamMulai' | 'jamSelesai' | null
  >(null);

  const scrollFieldToCenter = (
    key: SesiFieldScrollKey,
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

  const handleFieldFocus = (key: SesiFieldScrollKey) => {
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

  const handleGroupLayout =
    (key: SesiFieldScrollKey) => (e: LayoutChangeEvent) => {
      const { y, height } = e.nativeEvent.layout;
      fieldLayoutsRef.current[key] = { y, height };
    };

  const clearError = (key: keyof SesiErrors) => {
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const handleSelectKelas = (selected: Kelas) => {
    setKelasId(selected.id);
    setKelasNama(selected.nama);
    setMataKuliah(selected.mataKuliah);
    setErrors((prev) => ({ ...prev, kelas: null }));
  };

  const handleSave = async () => {
    const errJamMulai = validateJam(jamMulai, 'Jam mulai');
    const errJamSelesaiFormat = validateJam(jamSelesai, 'Jam selesai');
    const errRentang =
      !errJamMulai && !errJamSelesaiFormat
        ? validateRentangJam(jamMulai, jamSelesai)
        : null;

    const nextErrors: SesiErrors = {
      kelas: validateRequired(kelasId, 'Kelas'),
      pertemuan: validateBilanganPositif(pertemuan, 'Pertemuan'),
      ruang: validateRequired(ruang, 'Ruang'),
      topik: validateRequired(topik, 'Topik'),
      tanggal: validateTanggal(tanggal),
      jamMulai: errJamMulai,
      jamSelesai: errJamSelesaiFormat ?? errRentang,
    };

    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    await onSubmit({
      kelasId,
      kelas: kelasNama,
      mataKuliah,
      pertemuan: Number(pertemuan.trim()),
      ruang,
      topik,
      tanggal,
      jamMulai,
      jamSelesai,
      catatan: catatan.trim() ? catatan : undefined,
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
          {editingSesi ? 'Ubah Sesi' : 'Tambah Sesi'}
        </Text>
        <View style={styles.divider} />

        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={styles.formScroll}
          onLayout={(e) => {
            scrollViewportHeightRef.current = e.nativeEvent.layout.height;
          }}
          contentContainerStyle={[
            styles.formScrollContent,
            (isInputFocused || keyboardHeight > 0) && {
              paddingBottom: Math.max(keyboardHeight, 280),
            },
          ]}
        >
          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          ) : null}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Pilih Kelas</Text>
            {kelasList.length === 0 ? (
              <Text style={styles.emptyKelasText}>
                Belum ada kelas. Buat kelas terlebih dahulu.
              </Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipRow}
              >
                {kelasList.map((k) => {
                  const isActive = kelasId === k.id;
                  return (
                    <Pressable
                      key={k.id}
                      style={[
                        styles.chip,
                        isActive ? styles.chipActive : styles.chipInactive,
                      ]}
                      onPress={() => handleSelectKelas(k)}
                      disabled={submitting}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isActive
                            ? styles.chipTextActive
                            : styles.chipTextInactive,
                        ]}
                      >
                        {k.mataKuliah} - Kelas {k.nama}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
            {errors.kelas ? (
              <Text style={styles.fieldError}>{errors.kelas}</Text>
            ) : null}
          </View>

          <View
            style={styles.twoColRow}
            onLayout={handleGroupLayout('pertemuanRuang')}
          >
            <View style={[styles.fieldGroup, styles.colHalf]}>
              <Text style={styles.label}>Pertemuan</Text>
              <TextInput
                style={[styles.input, !!errors.pertemuan && styles.inputError]}
                placeholder="1"
                placeholderTextColor="#8C9786"
                keyboardType="number-pad"
                value={pertemuan}
                onChangeText={(text) => {
                  setPertemuan(text.replace(/\D/g, ''));
                  clearError('pertemuan');
                }}
                onFocus={() => handleFieldFocus('pertemuanRuang')}
                onPressIn={() => handleFieldFocus('pertemuanRuang')}
                onBlur={() => setIsInputFocused(false)}
                editable={!submitting}
              />
              {errors.pertemuan ? (
                <Text style={styles.fieldError}>{errors.pertemuan}</Text>
              ) : null}
            </View>

            <View style={[styles.fieldGroup, styles.colHalf]}>
              <Text style={styles.label}>Ruang</Text>
              <TextInput
                style={[styles.input, !!errors.ruang && styles.inputError]}
                placeholder="Lab 1"
                placeholderTextColor="#8C9786"
                value={ruang}
                onChangeText={(text) => {
                  setRuang(text);
                  clearError('ruang');
                }}
                onFocus={() => handleFieldFocus('pertemuanRuang')}
                onPressIn={() => handleFieldFocus('pertemuanRuang')}
                onBlur={() => setIsInputFocused(false)}
                editable={!submitting}
              />
              {errors.ruang ? (
                <Text style={styles.fieldError}>{errors.ruang}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.fieldGroup} onLayout={handleGroupLayout('topik')}>
            <Text style={styles.label}>Topik</Text>
            <TextInput
              style={[styles.input, !!errors.topik && styles.inputError]}
              placeholder="Contoh: State Management & Navigation"
              placeholderTextColor="#8C9786"
              value={topik}
              onChangeText={(text) => {
                setTopik(text);
                clearError('topik');
              }}
              onFocus={() => handleFieldFocus('topik')}
              onPressIn={() => handleFieldFocus('topik')}
              onBlur={() => setIsInputFocused(false)}
              editable={!submitting}
            />
            {errors.topik ? (
              <Text style={styles.fieldError}>{errors.topik}</Text>
            ) : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Tanggal</Text>
            <Pressable
              style={[
                styles.pickerField,
                !!errors.tanggal && styles.inputError,
              ]}
              onPress={() => {
                Keyboard.dismiss();
                setActivePicker('tanggal');
              }}
              disabled={submitting}
              accessibilityRole="button"
              accessibilityLabel="Pilih Tanggal"
            >
              <Text
                style={tanggal ? styles.pickerText : styles.pickerPlaceholder}
                numberOfLines={1}
              >
                {tanggal
                  ? `${formatDateIndo(tanggal)} (${tanggal})`
                  : 'Pilih tanggal'}
              </Text>
              <CalendarIcon size={16} color="#4A5D4A" />
            </Pressable>
            {errors.tanggal ? (
              <Text style={styles.fieldError}>{errors.tanggal}</Text>
            ) : null}
          </View>

          <View style={styles.twoColRow}>
            <View style={[styles.fieldGroup, styles.colHalf]}>
              <Text style={styles.label}>Jam Mulai</Text>
              <Pressable
                style={[
                  styles.pickerField,
                  !!errors.jamMulai && styles.inputError,
                ]}
                onPress={() => {
                  Keyboard.dismiss();
                  setActivePicker('jamMulai');
                }}
                disabled={submitting}
                accessibilityRole="button"
                accessibilityLabel="Pilih Jam Mulai"
              >
                <Text
                  style={jamMulai ? styles.pickerText : styles.pickerPlaceholder}
                >
                  {jamMulai || 'Pilih jam'}
                </Text>
                <ClockIcon size={15} color="#4A5D4A" />
              </Pressable>
              {errors.jamMulai ? (
                <Text style={styles.fieldError}>{errors.jamMulai}</Text>
              ) : null}
            </View>

            <View style={[styles.fieldGroup, styles.colHalf]}>
              <Text style={styles.label}>Jam Selesai</Text>
              <Pressable
                style={[
                  styles.pickerField,
                  !!errors.jamSelesai && styles.inputError,
                ]}
                onPress={() => {
                  Keyboard.dismiss();
                  setActivePicker('jamSelesai');
                }}
                disabled={submitting}
                accessibilityRole="button"
                accessibilityLabel="Pilih Jam Selesai"
              >
                <Text
                  style={
                    jamSelesai ? styles.pickerText : styles.pickerPlaceholder
                  }
                >
                  {jamSelesai || 'Pilih jam'}
                </Text>
                <ClockIcon size={15} color="#4A5D4A" />
              </Pressable>
              {errors.jamSelesai ? (
                <Text style={styles.fieldError}>{errors.jamSelesai}</Text>
              ) : null}
            </View>
          </View>

          <View
            style={styles.fieldGroup}
            onLayout={handleGroupLayout('catatan')}
          >
            <Text style={styles.label}>Catatan (Opsional)</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Catatan tambahan sesi"
              placeholderTextColor="#8C9786"
              value={catatan}
              onChangeText={setCatatan}
              onFocus={() => handleFieldFocus('catatan')}
              onPressIn={() => handleFieldFocus('catatan')}
              onBlur={() => setIsInputFocused(false)}
              multiline
              editable={!submitting}
            />
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
            accessibilityLabel="Simpan Sesi"
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Simpan</Text>
            )}
          </Pressable>
        </View>
      </View>

      <DatePickerModal
        visible={activePicker === 'tanggal'}
        value={tanggal}
        onSelect={(val) => {
          setTanggal(val);
          clearError('tanggal');
          setActivePicker(null);
        }}
        onClose={() => setActivePicker(null)}
      />

      <TimePickerModal
        visible={activePicker === 'jamMulai'}
        title="Pilih Jam Mulai"
        value={jamMulai}
        defaultTime="08:00"
        onSelect={(val) => {
          setJamMulai(val);
          clearError('jamMulai');
          clearError('jamSelesai');
          setActivePicker(null);
        }}
        onClose={() => setActivePicker(null)}
      />

      <TimePickerModal
        visible={activePicker === 'jamSelesai'}
        title="Pilih Jam Selesai"
        value={jamSelesai}
        defaultTime="10:00"
        onSelect={(val) => {
          setJamSelesai(val);
          clearError('jamSelesai');
          setActivePicker(null);
        }}
        onClose={() => setActivePicker(null)}
      />
    </KeyboardAvoidingView>
  );
}

/**
 * Modal bottom-sheet untuk menambah atau mengubah sesi praktikum (FR-21).
 */
export function SesiFormModal(props: SesiFormModalProps) {
  return (
    <Modal
      transparent
      visible={props.visible}
      animationType="slide"
      onRequestClose={props.onClose}
    >
      {props.visible ? (
        <SesiFormContent
          key={props.editingSesi?.id ?? 'new'}
          editingSesi={props.editingSesi}
          kelasList={props.kelasList}
          submitting={props.submitting}
          errorMessage={props.errorMessage}
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
    height: '88%',
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
    paddingBottom: 8,
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
  emptyKelasText: {
    fontSize: 12,
    color: '#9E3B2B',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  chipActive: {
    backgroundColor: '#3E543E',
  },
  chipInactive: {
    backgroundColor: '#F5F2EB',
    borderWidth: 1,
    borderColor: '#D5E0D5',
  },
  chipText: {
    fontSize: 12,
    lineHeight: 16,
  },
  chipTextActive: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chipTextInactive: {
    fontWeight: '500',
    color: '#3E543E',
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
  pickerField: {
    height: 46,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6E4DD',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  pickerText: {
    flex: 1,
    fontSize: 14,
    color: '#1C281C',
    fontVariant: ['tabular-nums'],
  },
  pickerPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: '#8C9786',
  },
  multilineInput: {
    height: 76,
    paddingTop: 12,
    textAlignVertical: 'top',
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
