import React from 'react';
import {
  ActivityIndicator,
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
import {
  CardCornerLeafOrnament,
  CheckIcon,
} from '@/components/icons/praktikum-theme-icons';
import { IzinDecisionTarget } from '@/hooks/use-kelola-izin';
import { Izin, StatusIzin } from '@/types';
import { formatDateIndo } from '@/utils';

const STATUS_BADGE_MAP: Record<
  StatusIzin,
  { label: string; bg: string; text: string }
> = {
  menunggu: { label: 'MENUNGGU', bg: '#EAE8E1', text: '#5A6B5A' },
  diterima: { label: 'DITERIMA', bg: '#C8D7B8', text: '#1C281C' },
  ditolak: { label: 'DITOLAK', bg: '#F4DFDA', text: '#9E3B2B' },
};

function toIsoDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export interface IzinReviewCardProps {
  izin: Izin;
  onTerima: () => void;
  onTolak: () => void;
}

/**
 * Kartu pemeriksaan pengajuan izin untuk asisten beserta info AI dan aksi Terima/Tolak (FR-24, FR-29).
 */
export function IzinReviewCard({
  izin,
  onTerima,
  onTolak,
}: IzinReviewCardProps) {
  const badge = STATUS_BADGE_MAP[izin.status];
  const hasAI = izin.statusAI === 'berhasil' && Boolean(izin.kategoriAI);
  const skorPersen =
    izin.skorAI !== null ? ` (${Math.round(izin.skorAI * 100)}%)` : '';

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <UserAvatar
          userId={izin.praktikanId}
          nama={izin.praktikanNama}
          size={36}
        />
        <View style={styles.identityCol}>
          <Text style={styles.praktikanNama} numberOfLines={1}>
            {izin.praktikanNama}
          </Text>
          <Text style={styles.praktikanNim}>({izin.praktikanNim})</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.statusBadgeText, { color: badge.text }]}>
            {badge.label}
          </Text>
        </View>
      </View>

      <Text style={styles.sesiLabel} numberOfLines={2}>
        {izin.sesiLabel}
        {izin.diajukanPada
          ? ` • ${formatDateIndo(toIsoDate(izin.diajukanPada))}`
          : ''}
      </Text>

      <View style={styles.alasanBox}>
        <Text style={styles.alasanText}>{izin.alasan}</Text>
      </View>

      <View style={[styles.aiChip, !hasAI && styles.aiChipFallback]}>
        <Text style={[styles.aiChipText, !hasAI && styles.aiChipTextFallback]}>
          {hasAI
            ? `Klasifikasi AI: ${izin.kategoriAI}${skorPersen}`
            : 'Klasifikasi tidak tersedia'}
        </Text>
      </View>

      {izin.catatanAsisten ? (
        <View style={styles.catatanBox}>
          <Text style={styles.catatanLabel}>Catatan Asisten</Text>
          <Text style={styles.catatanValue}>{izin.catatanAsisten}</Text>
        </View>
      ) : null}

      {izin.status === 'menunggu' && (
        <View style={styles.actionRow}>
          <Pressable
            style={({ pressed }) => [
              styles.actionPill,
              styles.rejectPill,
              pressed && styles.pressed,
            ]}
            onPress={onTolak}
            accessibilityRole="button"
            accessibilityLabel={`Tolak izin ${izin.praktikanNama}`}
          >
            <Text style={styles.rejectPillText}>Tolak</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionPill,
              styles.approvePill,
              pressed && styles.pressed,
            ]}
            onPress={onTerima}
            accessibilityRole="button"
            accessibilityLabel={`Terima izin ${izin.praktikanNama}`}
          >
            <CheckIcon size={13} color="#FFFFFF" />
            <Text style={styles.approvePillText}>Terima</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.cornerOrnament} pointerEvents="none">
        <CardCornerLeafOrnament width={68} height={68} />
      </View>
    </View>
  );
}

export interface IzinKeputusanModalProps {
  target: IzinDecisionTarget | null;
  catatan: string;
  onChangeCatatan: (text: string) => void;
  submitting: boolean;
  errorMessage: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * Bottom sheet konfirmasi penerimaan atau penolakan izin beserta catatan opsional asisten (FR-24).
 */
export function IzinKeputusanModal({
  target,
  catatan,
  onChangeCatatan,
  submitting,
  errorMessage,
  onConfirm,
  onClose,
}: IzinKeputusanModalProps) {
  const insets = useSafeAreaInsets();
  const isReject = target?.keputusan === 'ditolak';

  return (
    <Modal
      transparent
      visible={target !== null}
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
            { paddingBottom: Math.max(insets.bottom, 16) + 12 },
          ]}
        >
          <View style={styles.dragHandle} />
          <Text style={styles.modalTitle}>
            {isReject ? 'Tolak Pengajuan Izin?' : 'Terima Pengajuan Izin?'}
          </Text>
          <View style={styles.divider} />

          {target ? (
            <View style={styles.summaryBox}>
              <Text style={styles.summaryName}>
                {target.izin.praktikanNama} ({target.izin.praktikanNim})
              </Text>
              <Text style={styles.summaryMeta}>{target.izin.sesiLabel}</Text>
            </View>
          ) : null}

          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          ) : null}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Catatan Asisten (Opsional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Tambahkan catatan keputusan..."
              placeholderTextColor="#8C9786"
              value={catatan}
              onChangeText={onChangeCatatan}
              multiline
              editable={!submitting}
            />
          </View>

          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [
                styles.modalButton,
                styles.cancelButton,
                pressed && styles.pressed,
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
                styles.modalButton,
                isReject ? styles.dangerButton : styles.primaryButton,
                submitting && styles.disabled,
                pressed && !submitting && styles.pressed,
              ]}
              onPress={onConfirm}
              disabled={submitting}
              accessibilityRole="button"
              accessibilityLabel={isReject ? 'Ya, Tolak' : 'Ya, Terima'}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isReject ? 'Ya, Tolak' : 'Ya, Terima'}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6E4DD',
    padding: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  identityCol: {
    flex: 1,
  },
  praktikanNama: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    color: '#1C281C',
  },
  praktikanNim: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: '#5A6B5A',
    fontVariant: ['tabular-nums'],
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sesiLabel: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
    color: '#4A5D4A',
    marginTop: 10,
  },
  alasanBox: {
    backgroundColor: '#FAF9F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAECE3',
    padding: 12,
    marginTop: 8,
  },
  alasanText: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 19,
    color: '#1C281C',
  },
  aiChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5EAD7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 10,
  },
  aiChipFallback: {
    backgroundColor: '#F0EFE9',
  },
  aiChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2D3E2D',
  },
  aiChipTextFallback: {
    color: '#5A6B5A',
  },
  catatanBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0EFE9',
    paddingRight: 44,
  },
  catatanLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#5A6B5A',
  },
  catatanValue: {
    fontSize: 13,
    color: '#1C281C',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingRight: 36,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  rejectPill: {
    backgroundColor: '#F4DFDA',
  },
  rejectPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9E3B2B',
  },
  approvePill: {
    backgroundColor: '#344E38',
  },
  approvePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cornerOrnament: {
    position: 'absolute',
    right: 0,
    bottom: 0,
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
    minHeight: '68%',
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
  summaryBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6E4DD',
    padding: 12,
    marginBottom: 14,
    gap: 2,
  },
  summaryName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C281C',
  },
  summaryMeta: {
    fontSize: 12,
    color: '#5A6B5A',
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
    marginBottom: 18,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E3E2E',
    marginBottom: 6,
  },
  input: {
    height: 88,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6E4DD',
    paddingHorizontal: 14,
    paddingTop: 12,
    fontSize: 14,
    color: '#1C281C',
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
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
  dangerButton: {
    backgroundColor: '#B84A39',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.84,
  },
});
