import React, { useState } from 'react';
import {
  Keyboard,
  Modal,
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
  SearchIcon,
} from '@/components/icons/praktikum-theme-icons';
import { formatDateIndo } from '@/utils';
import {
  countActiveAdvancedFilters,
  FilterStatusSesi,
  INITIAL_JADWAL_FILTER,
  JadwalFilterOptions,
  JadwalFilterState,
} from '@/utils/jadwal-filter';

const STATUS_OPTIONS: { value: FilterStatusSesi; label: string }[] = [
  { value: 'SEMUA', label: 'Semua' },
  { value: 'DIBUKA', label: 'Dibuka' },
  { value: 'BELUM_DIBUKA', label: 'Belum Dibuka' },
  { value: 'DITUTUP', label: 'Ditutup' },
];

export interface JadwalFilterBarProps {
  filter: JadwalFilterState;
  options: JadwalFilterOptions;
  onChangeFilter: <K extends keyof JadwalFilterState>(
    key: K,
    value: JadwalFilterState[K]
  ) => void;
  onApplyFilter: (nextFilter: JadwalFilterState) => void;
  onReset: () => void;
}

function ChipFilterRow({
  label,
  items,
  selectedValue,
  onSelect,
}: {
  label: string;
  items: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
}) {
  if (items.length === 0) return null;

  return (
    <View style={styles.filterGroup}>
      <Text style={styles.filterLabel}>{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalChips}
      >
        <Pressable
          style={[
            styles.chip,
            selectedValue === '' ? styles.chipActive : styles.chipInactive,
          ]}
          onPress={() => onSelect('')}
          accessibilityRole="button"
          accessibilityState={{ selected: selectedValue === '' }}
        >
          <Text
            style={[
              styles.chipText,
              selectedValue === ''
                ? styles.chipTextActive
                : styles.chipTextInactive,
            ]}
          >
            Semua
          </Text>
        </Pressable>

        {items.map((item) => {
          const isActive = selectedValue === item;
          return (
            <Pressable
              key={item}
              style={[
                styles.chip,
                isActive ? styles.chipActive : styles.chipInactive,
              ]}
              onPress={() => onSelect(isActive ? '' : item)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <Text
                style={[
                  styles.chipText,
                  isActive ? styles.chipTextActive : styles.chipTextInactive,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function FilterJadwalModalContent({
  initialFilter,
  options,
  onApply,
  onReset,
  onClose,
}: {
  initialFilter: JadwalFilterState;
  options: JadwalFilterOptions;
  onApply: (nextFilter: JadwalFilterState) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<JadwalFilterState>(initialFilter);
  const [activePicker, setActivePicker] = useState<
    'tanggal' | 'jamMulai' | 'jamSelesai' | null
  >(null);

  const updateDraft = <K extends keyof JadwalFilterState>(
    key: K,
    value: JadwalFilterState[K]
  ) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <View style={styles.backdrop}>
      <Pressable style={styles.backdropDismiss} onPress={onClose} />
      <View
        style={[
          styles.sheetContainer,
          { paddingBottom: Math.max(insets.bottom, 16) + 12 },
        ]}
      >
        <View style={styles.dragHandle} />
        <Text style={styles.modalTitle}>Filter Jadwal</Text>
        <View style={styles.divider} />

        <ScrollView
          style={styles.modalScroll}
          contentContainerStyle={styles.modalScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Status Sesi</Text>
            <View style={styles.chipRow}>
              {STATUS_OPTIONS.map((chip) => {
                const isActive = draft.status === chip.value;
                return (
                  <Pressable
                    key={chip.value}
                    style={[
                      styles.chip,
                      isActive ? styles.chipActive : styles.chipInactive,
                    ]}
                    onPress={() => updateDraft('status', chip.value)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isActive
                          ? styles.chipTextActive
                          : styles.chipTextInactive,
                      ]}
                    >
                      {chip.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <ChipFilterRow
            label="Mata Kuliah"
            items={options.mataKuliahList}
            selectedValue={draft.mataKuliah}
            onSelect={(val) => updateDraft('mataKuliah', val)}
          />

          <ChipFilterRow
            label="Ruangan"
            items={options.ruangList}
            selectedValue={draft.ruang}
            onSelect={(val) => updateDraft('ruang', val)}
          />

          <View style={styles.filterGroup}>
            <View style={styles.labelActionRow}>
              <Text style={styles.filterLabel}>Tanggal</Text>
              {draft.tanggal ? (
                <Pressable
                  onPress={() => updateDraft('tanggal', '')}
                  hitSlop={6}
                >
                  <Text style={styles.resetInlineText}>Hapus</Text>
                </Pressable>
              ) : null}
            </View>
            <Pressable
              style={styles.pickerField}
              onPress={() => setActivePicker('tanggal')}
              accessibilityRole="button"
              accessibilityLabel="Filter berdasarkan tanggal"
            >
              <Text
                style={
                  draft.tanggal ? styles.pickerText : styles.pickerPlaceholder
                }
                numberOfLines={1}
              >
                {draft.tanggal
                  ? `${formatDateIndo(draft.tanggal)} (${draft.tanggal})`
                  : 'Semua tanggal'}
              </Text>
              <CalendarIcon size={15} color="#4A5D4A" />
            </Pressable>
          </View>

          <View style={styles.filterGroup}>
            <View style={styles.labelActionRow}>
              <Text style={styles.filterLabel}>Rentang Jam</Text>
              {draft.jamMulai || draft.jamSelesai ? (
                <Pressable
                  onPress={() => {
                    updateDraft('jamMulai', '');
                    updateDraft('jamSelesai', '');
                  }}
                  hitSlop={6}
                >
                  <Text style={styles.resetInlineText}>Hapus</Text>
                </Pressable>
              ) : null}
            </View>

            <View style={styles.twoColRow}>
              <Pressable
                style={[styles.pickerField, styles.colHalf]}
                onPress={() => setActivePicker('jamMulai')}
                accessibilityRole="button"
                accessibilityLabel="Filter dari jam"
              >
                <Text
                  style={
                    draft.jamMulai
                      ? styles.pickerText
                      : styles.pickerPlaceholder
                  }
                >
                  {draft.jamMulai ? `Dari ${draft.jamMulai}` : 'Dari jam'}
                </Text>
                <ClockIcon size={14} color="#4A5D4A" />
              </Pressable>

              <Pressable
                style={[styles.pickerField, styles.colHalf]}
                onPress={() => setActivePicker('jamSelesai')}
                accessibilityRole="button"
                accessibilityLabel="Filter sampai jam"
              >
                <Text
                  style={
                    draft.jamSelesai
                      ? styles.pickerText
                      : styles.pickerPlaceholder
                  }
                >
                  {draft.jamSelesai
                    ? `Sampai ${draft.jamSelesai}`
                    : 'Sampai jam'}
                </Text>
                <ClockIcon size={14} color="#4A5D4A" />
              </Pressable>
            </View>
          </View>
        </ScrollView>

        <View style={styles.buttonRow}>
          <Pressable
            style={({ pressed }) => [
              styles.modalButton,
              styles.cancelButton,
              pressed && styles.pressed,
            ]}
            onPress={() => {
              setDraft(INITIAL_JADWAL_FILTER);
              onReset();
              onClose();
            }}
            accessibilityRole="button"
            accessibilityLabel="Reset semua filter"
          >
            <Text style={styles.cancelButtonText}>Reset</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.modalButton,
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
            onPress={() => {
              onApply(draft);
              onClose();
            }}
            accessibilityRole="button"
            accessibilityLabel="Terapkan filter jadwal"
          >
            <Text style={styles.primaryButtonText}>Terapkan</Text>
          </Pressable>
        </View>
      </View>

      <DatePickerModal
        visible={activePicker === 'tanggal'}
        value={draft.tanggal}
        onSelect={(val) => {
          updateDraft('tanggal', val);
          setActivePicker(null);
        }}
        onClose={() => setActivePicker(null)}
      />

      <TimePickerModal
        visible={activePicker === 'jamMulai'}
        title="Dari Jam"
        value={draft.jamMulai}
        defaultTime="07:00"
        onSelect={(val) => {
          updateDraft('jamMulai', val);
          setActivePicker(null);
        }}
        onClose={() => setActivePicker(null)}
      />

      <TimePickerModal
        visible={activePicker === 'jamSelesai'}
        title="Sampai Jam"
        value={draft.jamSelesai}
        defaultTime="17:00"
        onSelect={(val) => {
          updateDraft('jamSelesai', val);
          setActivePicker(null);
        }}
        onClose={() => setActivePicker(null)}
      />
    </View>
  );
}

/**
 * Bar pencarian dan tombol modal filter multi-kriteria untuk jadwal sesi (FR-36, SRS-35).
 */
export function JadwalFilterBar({
  filter,
  options,
  onChangeFilter,
  onApplyFilter,
  onReset,
}: JadwalFilterBarProps) {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // ponytail: derived count langsung dari props filter tanpa useEffect sync
  const advancedCount = countActiveAdvancedFilters(filter);

  const handleOpenFilterModal = () => {
    Keyboard.dismiss();
    setIsFilterModalOpen(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <SearchIcon size={16} color="#8C9786" />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari mata kuliah, topik, atau ruangan..."
          placeholderTextColor="#8C9786"
          value={filter.query}
          onChangeText={(text) => onChangeFilter('query', text)}
          returnKeyType="search"
          accessibilityLabel="Cari jadwal praktikum"
        />
        {filter.query.length > 0 ? (
          <Pressable
            onPress={() => onChangeFilter('query', '')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Hapus pencarian"
          >
            <Text style={styles.clearText}>Hapus</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.chipRow}>
        {STATUS_OPTIONS.map((chip) => {
          const isActive = filter.status === chip.value;
          return (
            <Pressable
              key={chip.value}
              style={[
                styles.chip,
                isActive ? styles.chipActive : styles.chipInactive,
              ]}
              onPress={() => onChangeFilter('status', chip.value)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <Text
                style={[
                  styles.chipText,
                  isActive ? styles.chipTextActive : styles.chipTextInactive,
                ]}
              >
                {chip.label}
              </Text>
            </Pressable>
          );
        })}

        <Pressable
          style={[
            styles.chip,
            advancedCount > 0 ? styles.filterToggleActive : styles.chipInactive,
          ]}
          onPress={handleOpenFilterModal}
          accessibilityRole="button"
          accessibilityLabel="Buka modal filter jadwal"
        >
          <Text
            style={[
              styles.chipText,
              advancedCount > 0
                ? styles.chipTextActive
                : styles.chipTextInactive,
            ]}
          >
            {advancedCount > 0 ? `Filter (${advancedCount})` : 'Filter'}
          </Text>
        </Pressable>
      </View>

      <Modal
        transparent
        visible={isFilterModalOpen}
        animationType="slide"
        onRequestClose={() => setIsFilterModalOpen(false)}
      >
        {isFilterModalOpen ? (
          <FilterJadwalModalContent
            key={JSON.stringify(filter)}
            initialFilter={filter}
            options={options}
            onApply={onApplyFilter}
            onReset={onReset}
            onClose={() => setIsFilterModalOpen(false)}
          />
        ) : null}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 14,
    gap: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6E4DD',
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#1C281C',
    paddingVertical: 0,
  },
  clearText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9E3B2B',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  horizontalChips: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 999,
  },
  chipActive: {
    backgroundColor: '#3E543E',
  },
  filterToggleActive: {
    backgroundColor: '#2D3E2D',
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
    maxHeight: '84%',
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
  modalTitle: {
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
  modalScroll: {
    flexGrow: 0,
  },
  modalScrollContent: {
    gap: 16,
    paddingBottom: 12,
  },
  filterGroup: {
    gap: 6,
  },
  labelActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E3E2E',
  },
  resetInlineText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9E3B2B',
  },
  pickerField: {
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6E4DD',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 10,
  },
  colHalf: {
    flex: 1,
  },
  pickerText: {
    flex: 1,
    fontSize: 13,
    color: '#1C281C',
    fontVariant: ['tabular-nums'],
  },
  pickerPlaceholder: {
    flex: 1,
    fontSize: 13,
    color: '#8C9786',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  modalButton: {
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
  pressed: {
    opacity: 0.82,
  },
});
