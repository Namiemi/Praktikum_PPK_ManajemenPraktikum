import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ArrowLeftIcon } from '@/components/icons/praktikum-theme-icons';

const NAMA_BULAN = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const NAMA_HARI = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function parseDateParts(value: string): { year: number; month: number; dateStr: string } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (match) {
    const year = Number(match[1]);
    const monthIndex = Number(match[2]) - 1;
    const day = Number(match[3]);
    const d = new Date(year, monthIndex, day);
    if (
      d.getFullYear() === year &&
      d.getMonth() === monthIndex &&
      d.getDate() === day
    ) {
      return { year, month: monthIndex, dateStr: value.trim() };
    }
  }
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  return {
    year,
    month,
    dateStr: `${year}-${pad2(month + 1)}-${pad2(day)}`,
  };
}

function parseTimeParts(
  value: string,
  defaultTime: string
): { hour: string; minute: string } {
  const target = /^([01]\d|2[0-3]):([0-5]\d)$/.test(value.trim())
    ? value.trim()
    : defaultTime;
  const [hour = '08', minute = '00'] = target.split(':');
  return { hour, minute };
}

export interface DatePickerModalProps {
  visible: boolean;
  value: string;
  onSelect: (tanggal: string) => void;
  onClose: () => void;
}

function DatePickerContent({
  value,
  onSelect,
  onClose,
}: Omit<DatePickerModalProps, 'visible'>) {
  const initial = parseDateParts(value);
  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);
  const [selectedDate, setSelectedDate] = useState(initial.dateStr);

  const firstDayOffset = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array<null>(firstDayOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleConfirm = () => {
    onSelect(selectedDate);
    onClose();
  };

  return (
    <View style={styles.backdrop}>
      <Pressable style={styles.backdropDismiss} onPress={onClose} />
      <View style={styles.card}>
        <Text style={styles.modalTitle}>Pilih Tanggal</Text>

        <View style={styles.monthHeader}>
          <Pressable
            style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}
            onPress={handlePrevMonth}
            accessibilityRole="button"
            accessibilityLabel="Bulan sebelumnya"
          >
            <ArrowLeftIcon size={16} color="#2D3E2D" />
          </Pressable>

          <Text style={styles.monthTitle}>
            {NAMA_BULAN[viewMonth]} {viewYear}
          </Text>

          <Pressable
            style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}
            onPress={handleNextMonth}
            accessibilityRole="button"
            accessibilityLabel="Bulan berikutnya"
          >
            <View style={styles.rotate180}>
              <ArrowLeftIcon size={16} color="#2D3E2D" />
            </View>
          </Pressable>
        </View>

        <View style={styles.weekHeaderRow}>
          {NAMA_HARI.map((hari) => (
            <Text key={hari} style={styles.weekHeaderText}>
              {hari}
            </Text>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {weeks.map((week, wIdx) => (
            <View key={wIdx} style={styles.weekRow}>
              {week.map((day, dIdx) => {
                if (day === null) {
                  return <View key={`empty-${dIdx}`} style={styles.dayCell} />;
                }
                const cellDateStr = `${viewYear}-${pad2(viewMonth + 1)}-${pad2(day)}`;
                const isSelected = selectedDate === cellDateStr;
                return (
                  <Pressable
                    key={cellDateStr}
                    style={[styles.dayCell, isSelected && styles.dayCellActive]}
                    onPress={() => setSelectedDate(cellDateStr)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isSelected && styles.dayTextActive,
                      ]}
                    >
                      {day}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        <View style={styles.buttonRow}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.cancelButton,
              pressed && styles.pressed,
            ]}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Batal"
          >
            <Text style={styles.cancelButtonText}>Batal</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
            onPress={handleConfirm}
            accessibilityRole="button"
            accessibilityLabel="Pilih Tanggal"
          >
            <Text style={styles.primaryButtonText}>Pilih</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/**
 * Modal kalender murni React Native untuk memilih tanggal sesi (YYYY-MM-DD).
 */
export function DatePickerModal({
  visible,
  value,
  onSelect,
  onClose,
}: DatePickerModalProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      {visible ? (
        <DatePickerContent
          key={value || 'default-date'}
          value={value}
          onSelect={onSelect}
          onClose={onClose}
        />
      ) : null}
    </Modal>
  );
}

export interface TimePickerModalProps {
  visible: boolean;
  title: string;
  value: string;
  defaultTime?: string;
  onSelect: (jam: string) => void;
  onClose: () => void;
}

function TimePickerContent({
  title,
  value,
  defaultTime = '08:00',
  onSelect,
  onClose,
}: Omit<TimePickerModalProps, 'visible'>) {
  const initial = parseTimeParts(value, defaultTime);
  const [selectedHour, setSelectedHour] = useState(initial.hour);
  const [selectedMinute, setSelectedMinute] = useState(initial.minute);

  const handleConfirm = () => {
    onSelect(`${selectedHour}:${selectedMinute}`);
    onClose();
  };

  return (
    <View style={styles.backdrop}>
      <Pressable style={styles.backdropDismiss} onPress={onClose} />
      <View style={styles.card}>
        <Text style={styles.modalTitle}>{title}</Text>
        <Text style={styles.timePreview}>
          {selectedHour}:{selectedMinute}
        </Text>

        <View style={styles.timeColumnsRow}>
          <View style={styles.timeColumn}>
            <Text style={styles.timeColumnLabel}>Jam</Text>
            <ScrollView
              style={styles.timeScroll}
              showsVerticalScrollIndicator={false}
            >
              {HOURS.map((hour) => {
                const isSelected = selectedHour === hour;
                return (
                  <Pressable
                    key={hour}
                    style={[
                      styles.timeItem,
                      isSelected && styles.timeItemActive,
                    ]}
                    onPress={() => setSelectedHour(hour)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text
                      style={[
                        styles.timeItemText,
                        isSelected && styles.timeItemTextActive,
                      ]}
                    >
                      {hour}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.timeColumn}>
            <Text style={styles.timeColumnLabel}>Menit</Text>
            <ScrollView
              style={styles.timeScroll}
              showsVerticalScrollIndicator={false}
            >
              {MINUTES.map((minute) => {
                const isSelected = selectedMinute === minute;
                return (
                  <Pressable
                    key={minute}
                    style={[
                      styles.timeItem,
                      isSelected && styles.timeItemActive,
                    ]}
                    onPress={() => setSelectedMinute(minute)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text
                      style={[
                        styles.timeItemText,
                        isSelected && styles.timeItemTextActive,
                      ]}
                    >
                      {minute}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.cancelButton,
              pressed && styles.pressed,
            ]}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Batal"
          >
            <Text style={styles.cancelButtonText}>Batal</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
            onPress={handleConfirm}
            accessibilityRole="button"
            accessibilityLabel="Pilih Jam"
          >
            <Text style={styles.primaryButtonText}>Pilih</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/**
 * Modal pemilih jam & menit murni React Native (format HH:MM).
 */
export function TimePickerModal({
  visible,
  title,
  value,
  defaultTime,
  onSelect,
  onClose,
}: TimePickerModalProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      {visible ? (
        <TimePickerContent
          key={`${value}-${defaultTime ?? '08:00'}`}
          title={title}
          value={value}
          defaultTime={defaultTime}
          onSelect={onSelect}
          onClose={onClose}
        />
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(28, 40, 28, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backdropDismiss: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FAF9F5',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E6E4DD',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C281C',
    textAlign: 'center',
    marginBottom: 14,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F0EEE6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rotate180: {
    transform: [{ rotate: '180deg' }],
  },
  monthTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C281C',
  },
  weekHeaderRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: '#5A6B5A',
  },
  calendarGrid: {
    gap: 4,
    marginBottom: 16,
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  dayCellActive: {
    backgroundColor: '#2D3E2D',
  },
  dayText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1C281C',
    fontVariant: ['tabular-nums'],
  },
  dayTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  timePreview: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C281C',
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
    marginBottom: 14,
  },
  timeColumnsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  timeColumn: {
    flex: 1,
  },
  timeColumnLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5A6B5A',
    textAlign: 'center',
    marginBottom: 6,
  },
  timeScroll: {
    height: 192,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6E4DD',
  },
  timeItem: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginHorizontal: 6,
    marginVertical: 2,
  },
  timeItemActive: {
    backgroundColor: '#2D3E2D',
  },
  timeItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1C281C',
    fontVariant: ['tabular-nums'],
  },
  timeItemTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
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
    opacity: 0.84,
  },
});
