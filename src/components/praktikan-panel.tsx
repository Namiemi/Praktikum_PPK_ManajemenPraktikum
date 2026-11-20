/**
 * @file praktikan-panel.tsx
 * @description Panel bawah Detail Sesi untuk praktikan bergaya Botanical selaras AsistenPanel (FR-25, FR-26).
 */

import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from '@/components/bottom-sheet';
import {
  CardCornerLeafOrnament,
  CheckIcon,
  ClockIcon,
} from '@/components/icons/praktikum-theme-icons';
import { PresensiForm } from '@/components/presensi-form';
import { Botanical } from '@/constants/theme';
import { usePraktikum } from '@/context/praktikum-context';
import { SesiPraktikum } from '@/types';

export interface PraktikanPanelProps {
  sesi: SesiPraktikum;
}

export function PraktikanPanel({ sesi }: PraktikanPanelProps) {
  const { currentUser, getPresensiBySesi, getIzinBySesi } = usePraktikum();
  const [waktuSukses, setWaktuSukses] = useState<string | null>(null);

  const presensiSaya = getPresensiBySesi(sesi.id).find(
    (p) => p.praktikanId === currentUser?.id
  );
  const izinSaya = getIzinBySesi(sesi.id).find(
    (i) => i.praktikanId === currentUser?.id
  );

  let konten: React.ReactNode;

  if (presensiSaya) {
    konten = (
      <View style={[styles.card, styles.cardHadir]}>
        <View style={styles.hadirBadge}>
          <CheckIcon size={18} color={Botanical.primaryDark} />
        </View>
        <Text style={styles.judulHadir}>Presensi Tercatat</Text>
        <View style={styles.waktuRow}>
          <ClockIcon size={13} color={Botanical.textSecondary} />
          <Text style={styles.teksHadir}>
            Pukul {presensiSaya.waktuPresensi} WIB
          </Text>
        </View>
        <View style={styles.cornerOrnament} pointerEvents="none">
          <CardCornerLeafOrnament width={64} height={64} />
        </View>
      </View>
    );
  } else if (izinSaya?.status === 'diterima') {
    konten = (
      <View style={[styles.card, styles.cardIzin]}>
        <Text style={styles.judulIzin}>Izin Diterima</Text>
        <Text style={styles.teksIzin}>
          Anda tercatat izin pada sesi ini, tidak perlu melakukan presensi.
        </Text>
        <View style={styles.cornerOrnament} pointerEvents="none">
          <CardCornerLeafOrnament width={64} height={64} />
        </View>
      </View>
    );
  } else if (sesi.status === 'DIBUKA') {
    konten = (
      <PresensiForm
        sesiId={sesi.id}
        onSuccess={(p) => setWaktuSukses(p.waktuPresensi)}
      />
    );
  } else if (sesi.status === 'DITUTUP') {
    konten = (
      <View style={[styles.card, styles.cardInfo]}>
        <Text style={styles.judulInfo}>Sesi Sudah Ditutup</Text>
        <Text style={styles.teksInfo}>
          Presensi untuk sesi ini sudah tidak dapat dilakukan.
        </Text>
        <View style={styles.cornerOrnament} pointerEvents="none">
          <CardCornerLeafOrnament width={64} height={64} />
        </View>
      </View>
    );
  } else {
    konten = (
      <View style={[styles.card, styles.cardInfo]}>
        <Text style={styles.judulInfo}>Sesi Belum Dibuka</Text>
        <Text style={styles.teksInfo}>
          Form presensi akan muncul otomatis saat asisten membuka sesi.
        </Text>
        <View style={styles.cornerOrnament} pointerEvents="none">
          <CardCornerLeafOrnament width={64} height={64} />
        </View>
      </View>
    );
  }

  let infoIzin: React.ReactNode = null;
  if (!presensiSaya && izinSaya && izinSaya.status !== 'diterima') {
    const isRejected = izinSaya.status === 'ditolak';
    infoIzin = (
      <View
        style={[
          styles.card,
          isRejected ? styles.cardDitolak : styles.cardMenunggu,
          styles.izinInfo,
        ]}
      >
        <Text style={isRejected ? styles.judulDitolak : styles.judulInfo}>
          {izinSaya.status === 'menunggu'
            ? 'Izin Menunggu Keputusan'
            : 'Izin Ditolak'}
        </Text>
        <Text style={isRejected ? styles.teksDitolak : styles.teksInfo}>
          {izinSaya.status === 'menunggu'
            ? 'Pengajuan izin Anda sedang diperiksa asisten.'
            : izinSaya.catatanAsisten
              ? `Catatan asisten: ${izinSaya.catatanAsisten}`
              : 'Silakan hadir dan lakukan presensi bila sesi dibuka.'}
        </Text>
      </View>
    );
  } else if (!presensiSaya && !izinSaya && sesi.status !== 'DITUTUP') {
    infoIzin = (
      <Pressable
        style={({ pressed }) => [styles.linkIzin, pressed && styles.linkPressed]}
        onPress={() =>
          router.push({ pathname: '/izin/ajukan', params: { sesiId: sesi.id } })
        }
        accessibilityRole="button"
        accessibilityLabel="Ajukan izin untuk sesi ini"
      >
        <Text style={styles.linkIzinText}>Tidak bisa hadir? Ajukan izin</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.wrapper}>
      {konten}
      {infoIzin}

      <BottomSheet
        visible={waktuSukses !== null}
        onClose={() => setWaktuSukses(null)}
        title="Presensi Berhasil"
        closeText="Tutup"
      >
        <View style={styles.sheetBody}>
          <Text style={styles.sheetJudul}>Kehadiran Anda tercatat</Text>
          <Text style={styles.sheetWaktu}>Pukul {waktuSukses} WIB</Text>
          <Text style={styles.sheetInfo}>Terima kasih telah hadir.</Text>
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
  },
  card: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  cardHadir: {
    backgroundColor: Botanical.sagePill,
    borderColor: Botanical.sageBadgeBg,
    alignItems: 'center',
  },
  hadirBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Botanical.sageBadgeBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  judulHadir: {
    fontSize: 16,
    fontWeight: '700',
    color: Botanical.textPrimary,
  },
  waktuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  teksHadir: {
    fontSize: 14,
    fontWeight: '600',
    color: Botanical.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  cardIzin: {
    backgroundColor: Botanical.infoBg,
    borderColor: '#C5DBF0',
  },
  judulIzin: {
    fontSize: 16,
    fontWeight: '700',
    color: Botanical.infoText,
  },
  teksIzin: {
    fontSize: 13,
    lineHeight: 19,
    color: '#2F4F6F',
    marginTop: 4,
    paddingRight: 40,
  },
  cardInfo: {
    backgroundColor: Botanical.surface,
    borderColor: Botanical.border,
    alignItems: 'center',
    paddingVertical: 22,
  },
  cardMenunggu: {
    backgroundColor: Botanical.surfaceWarm,
    borderColor: Botanical.borderChip,
  },
  cardDitolak: {
    backgroundColor: Botanical.dangerBg,
    borderColor: '#EBC8C0',
  },
  judulInfo: {
    fontSize: 16,
    fontWeight: '700',
    color: Botanical.textPrimary,
    textAlign: 'center',
  },
  teksInfo: {
    fontSize: 13,
    lineHeight: 19,
    color: Botanical.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  judulDitolak: {
    fontSize: 15,
    fontWeight: '700',
    color: Botanical.dangerText,
  },
  teksDitolak: {
    fontSize: 13,
    lineHeight: 19,
    color: Botanical.dangerText,
    marginTop: 4,
  },
  izinInfo: {
    marginTop: 0,
  },
  cornerOrnament: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  linkIzin: {
    paddingVertical: 13,
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: Botanical.surfaceWarm,
    borderWidth: 1,
    borderColor: Botanical.borderChip,
  },
  linkPressed: {
    opacity: 0.78,
  },
  linkIzinText: {
    fontSize: 14,
    fontWeight: '600',
    color: Botanical.chipActive,
  },
  sheetBody: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  sheetJudul: {
    fontSize: 17,
    fontWeight: '700',
    color: Botanical.textPrimary,
  },
  sheetWaktu: {
    fontSize: 15,
    fontWeight: '700',
    color: Botanical.primary,
    marginTop: 4,
    fontVariant: ['tabular-nums'],
  },
  sheetInfo: {
    fontSize: 13,
    color: Botanical.textMuted,
    marginTop: 4,
  },
});
