import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

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
  hasActiveJadwalFilter,
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

/**
 * Bar pencarian dan filter multi-kriteria untuk daftar jadwal sesi (FR-36, SRS-35).
 */
export function JadwalFilterBar({
  filter,
  options,
  onChangeFilter,
  onReset,
}: JadwalFilterBarProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [activePicker, setActivePicker] = useState<
    'tanggal' | 'jamMulai' | 'jamSelesai' | null
  >(null);

  // ponytail: derived counts langsung dari props filter tanpa useEffect sync
  const advancedCount = countActiveAdvancedFilters(filter);
  const isAnyActive = hasActiveJadwalFilter(filter);

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
            isAdvancedOpen || advancedCount > 0
              ? styles.filterToggleActive
              : styles.chipInactive,
          ]}
          onPress={() => setIsAdvancedOpen((prev) => !prev)}
          accessibilityRole="button"
          accessibilityLabel="Filter lanjutan jadwal"
          accessibilityState={{ expanded: isAdvancedOpen }}
        >
          <Text
            style={[
              styles.chipText,
              isAdvancedOpen || advancedCount > 0
                ? styles.chipTextActive
                : styles.chipTextInactive,
            ]}
          >
            {advancedCount > 0 ? `Filter (${advancedCount})` : 'Filter'}
          </Text>
        </Pressable>
      </View>

      {isAdvancedOpen ? (
        <View style={styles.advancedCard}>
          <ChipFilterRow
            label="Mata Kuliah"
            items={options.mataKuliahList}
            selectedValue={filter.mataKuliah}
            onSelect={(val) => onChangeFilter('mataKuliah', val)}
          />

          <ChipFilterRow
            label="Ruangan"
            items={options.ruangList}
            selectedValue={filter.ruang}
            onSelect={(val) => onChangeFilter('ruang', val)}
          />

          <View style={styles.filterGroup}>
            <View style={styles.labelActionRow}>
              <Text style={styles.filterLabel}>Tanggal</Text>
              {filter.tanggal ? (
                <Pressable
                  onPress={() => onChangeFilter('tanggal', '')}
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
                  filter.tanggal ? styles.pickerText : styles.pickerPlaceholder
                }
                numberOfLines={1}
              >
                {filter.tanggal
                  ? `${formatDateIndo(filter.tanggal)} (${filter.tanggal})`
                  : 'Semua tanggal'}
              </Text>
              <CalendarIcon size={15} color="#4A5D4A" />
            </Pressable>
          </View>

          <View style={styles.filterGroup}>
            <View style={styles.labelActionRow}>
              <Text style={styles.filterLabel}>Rentang Jam</Text>
              {filter.jamMulai || filter.jamSelesai ? (
                <Pressable
                  onPress={() => {
                    onChangeFilter('jamMulai', '');
                    onChangeFilter('jamSelesai', '');
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
                    filter.jamMulai
                      ? styles.pickerText
                      : styles.pickerPlaceholder
                  }
                >
                  {filter.jamMulai ? `Dari ${filter.jamMulai}` : 'Dari jam'}
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
                    filter.jamSelesai
                      ? styles.pickerText
                      : styles.pickerPlaceholder
                  }
                >
                  {filter.jamSelesai
                    ? `Sampai ${filter.jamSelesai}`
                    : 'Sampai jam'}
                </Text>
                <ClockIcon size={14} color="#4A5D4A" />
              </Pressable>
            </View>
          </View>

          {isAnyActive ? (
            <Pressable
              style={({ pressed }) => [
                styles.resetButton,
                pressed && styles.pressed,
              ]}
              onPress={onReset}
              accessibilityRole="button"
              accessibilityLabel="Reset semua filter"
            >
              <Text style={styles.resetButtonText}>Reset Semua Filter</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <DatePickerModal
        visible={activePicker === 'tanggal'}
        value={filter.tanggal}
        onSelect={(val) => {
          onChangeFilter('tanggal', val);
          setActivePicker(null);
        }}
        onClose={() => setActivePicker(null)}
      />

      <TimePickerModal
        visible={activePicker === 'jamMulai'}
        title="Dari Jam"
        value={filter.jamMulai}
        defaultTime="07:00"
        onSelect={(val) => {
          onChangeFilter('jamMulai', val);
          setActivePicker(null);
        }}
        onClose={() => setActivePicker(null)}
      />

      <TimePickerModal
        visible={activePicker === 'jamSelesai'}
        title="Sampai Jam"
        value={filter.jamSelesai}
        defaultTime="17:00"
        onSelect={(val) => {
          onChangeFilter('jamSelesai', val);
          setActivePicker(null);
        }}
        onClose={() => setActivePicker(null)}
      />
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
  advancedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6E4DD',
    padding: 14,
    gap: 12,
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
    height: 42,
    backgroundColor: '#FAF9F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6E4DD',
    paddingHorizontal: 12,
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
  resetButton: {
    backgroundColor: '#F5F2EB',
    borderWidth: 1,
    borderColor: '#D5E0D5',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3E543E',
  },
  pressed: {
    opacity: 0.82,
  },
});
