import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { UserAvatar } from '@/components/icons/asisten-avatar';
import { CheckIcon, SearchIcon } from '@/components/icons/praktikum-theme-icons';
import { Kelas, KelasInput, User } from '@/types';
import { validateRequired } from '@/utils/validation';

export interface KelasFormModalProps {
  visible: boolean;
  editingKelas: Kelas | null;
  submitting: boolean;
  errorMessage: string | null;
  onSubmit: (input: KelasInput) => Promise<boolean>;
  onClose: () => void;
}

function KelasFormContent({
  editingKelas,
  submitting,
  errorMessage,
  onSubmit,
  onClose,
}: Omit<KelasFormModalProps, 'visible'>) {
  const insets = useSafeAreaInsets();
  const [nama, setNama] = useState(editingKelas?.nama ?? '');
  const [mataKuliah, setMataKuliah] = useState(editingKelas?.mataKuliah ?? '');
  const [namaError, setNamaError] = useState<string | null>(null);
  const [matkulError, setMatkulError] = useState<string | null>(null);

  const handleSave = async () => {
    const errNama = validateRequired(nama, 'Nama kelas');
    const errMatkul = validateRequired(mataKuliah, 'Mata kuliah');
    setNamaError(errNama);
    setMatkulError(errMatkul);
    if (errNama || errMatkul) return;

    await onSubmit({ nama, mataKuliah });
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
          styles.kelasFormSheet,
          { paddingBottom: Math.max(insets.bottom, 16) + 12 },
        ]}
      >
        <View style={styles.dragHandle} />
        <Text style={styles.title}>
          {editingKelas ? 'Ubah Kelas' : 'Tambah Kelas'}
        </Text>
        <View style={styles.divider} />

        {errorMessage ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Nama Kelas</Text>
          <TextInput
            style={[styles.input, !!namaError && styles.inputError]}
            placeholder="Contoh: A"
            placeholderTextColor="#8C9786"
            value={nama}
            onChangeText={(text) => {
              setNama(text);
              if (namaError) setNamaError(null);
            }}
            editable={!submitting}
          />
          {namaError ? <Text style={styles.fieldError}>{namaError}</Text> : null}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Mata Kuliah</Text>
          <TextInput
            style={[styles.input, !!matkulError && styles.inputError]}
            placeholder="Contoh: Pemrograman Mobile"
            placeholderTextColor="#8C9786"
            value={mataKuliah}
            onChangeText={(text) => {
              setMataKuliah(text);
              if (matkulError) setMatkulError(null);
            }}
            editable={!submitting}
          />
          {matkulError ? (
            <Text style={styles.fieldError}>{matkulError}</Text>
          ) : null}
        </View>

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
            accessibilityLabel="Simpan Kelas"
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
 * Modal bottom-sheet untuk menambah atau mengubah kelas praktikum (FR-21).
 */
export function KelasFormModal(props: KelasFormModalProps) {
  return (
    <Modal
      transparent
      visible={props.visible}
      animationType="slide"
      onRequestClose={props.onClose}
    >
      {props.visible ? (
        <KelasFormContent
          key={props.editingKelas?.id ?? 'new'}
          editingKelas={props.editingKelas}
          submitting={props.submitting}
          errorMessage={props.errorMessage}
          onSubmit={props.onSubmit}
          onClose={props.onClose}
        />
      ) : null}
    </Modal>
  );
}

export interface PesertaKelasModalProps {
  kelas: Kelas | null;
  praktikanList: User[];
  searchQuery: string;
  onChangeSearch: (query: string) => void;
  togglingUid: string | null;
  errorMessage: string | null;
  onTogglePeserta: (praktikan: User) => void;
  onClose: () => void;
}

/**
 * Modal bottom-sheet pemilih peserta kelas praktikum (FR-21).
 */
export function PesertaKelasModal({
  kelas,
  praktikanList,
  searchQuery,
  onChangeSearch,
  togglingUid,
  errorMessage,
  onTogglePeserta,
  onClose,
}: PesertaKelasModalProps) {
  const insets = useSafeAreaInsets();
  const terdaftarCount = kelas
    ? praktikanList.filter((p) => p.kelasId === kelas.id).length
    : 0;

  return (
    <Modal
      transparent
      visible={kelas !== null}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <Pressable style={styles.backdropDismiss} onPress={onClose} />
        <View
          style={[
            styles.sheetContainer,
            styles.pesertaSheet,
            { paddingBottom: Math.max(insets.bottom, 16) + 12 },
          ]}
        >
          <View style={styles.dragHandle} />

          <View style={styles.pesertaHeader}>
            <Text style={styles.title}>
              Peserta Kelas {kelas?.nama ?? ''}
            </Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>
                {terdaftarCount} Terdaftar
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          ) : null}

          <View style={styles.searchWrapper}>
            <SearchIcon size={16} color="#8C9786" />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari Nama atau NIM"
              placeholderTextColor="#8C9786"
              value={searchQuery}
              onChangeText={onChangeSearch}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.listCard}>
            <FlatList
              data={praktikanList}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              style={styles.pesertaList}
              renderItem={({ item }) => {
                const isMember = kelas !== null && item.kelasId === kelas.id;
                const hasOtherClass =
                  kelas !== null &&
                  item.kelasId !== null &&
                  item.kelasId !== undefined &&
                  item.kelasId !== kelas.id;
                const isBusy = togglingUid === item.id;

                return (
                  <Pressable
                    style={[styles.userRow, isMember && styles.userRowSelected]}
                    onPress={() => onTogglePeserta(item)}
                    disabled={isBusy}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isMember }}
                  >
                    <UserAvatar userId={item.id} nama={item.nama} size={36} />
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{item.nama}</Text>
                      <Text style={styles.userNim}>
                        ({item.nim}){hasOtherClass ? ' • Kelas lain' : ''}
                      </Text>
                    </View>
                    {isBusy ? (
                      <ActivityIndicator size="small" color="#3E5033" />
                    ) : isMember ? (
                      <View style={styles.checkWrapper}>
                        <CheckIcon size={18} color="#3E5033" />
                      </View>
                    ) : null}
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyListBox}>
                  <Text style={styles.emptyListText}>
                    Praktikan tidak ditemukan.
                  </Text>
                </View>
              }
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.doneButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Selesai"
          >
            <Text style={styles.primaryButtonText}>Selesai</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
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
  pesertaSheet: {
    maxHeight: '85%',
  },
  kelasFormSheet: {
    minHeight: '72%',
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D7C9',
    alignSelf: 'center',
    marginBottom: 14,
  },
  pesertaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 24,
    color: '#1C281C',
    textAlign: 'center',
  },
  countBadge: {
    backgroundColor: '#E5EAD7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2D3E2D',
    fontVariant: ['tabular-nums'],
  },
  divider: {
    height: 1,
    backgroundColor: '#EAECE3',
    marginVertical: 14,
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
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E3E2E',
    marginBottom: 6,
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
    marginTop: 6,
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
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    backgroundColor: '#FFFFFF',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#EAE3D5',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#23311E',
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 6,
    borderWidth: 1,
    borderColor: '#EFE8DC',
    maxHeight: 280,
    marginBottom: 16,
  },
  pesertaList: {
    flexGrow: 0,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 2,
  },
  userRowSelected: {
    backgroundColor: '#E6EFE1',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212F1C',
  },
  userNim: {
    fontSize: 12,
    color: '#55634E',
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  checkWrapper: {
    marginLeft: 8,
    marginRight: 4,
  },
  emptyListBox: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: 13,
    color: '#8C9786',
  },
  doneButton: {
    backgroundColor: '#2D3E2D',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
