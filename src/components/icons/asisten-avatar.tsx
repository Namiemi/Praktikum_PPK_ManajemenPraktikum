import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const dimasAvatarAsset = require('../../../assets/avatars/avatar-dimas.svg');
const rinaAvatarAsset = require('../../../assets/avatars/avatar-rina.svg');

export interface AsistenAvatarProps {
  userId?: string;
  nama?: string;
  size?: number;
}

export function AsistenAvatar({
  userId,
  nama = 'Asisten',
  size = 38,
}: AsistenAvatarProps) {
  const isDimas = userId === 'ast-1' || nama.toLowerCase().includes('dimas');
  const isRina = userId === 'ast-3' || nama.toLowerCase().includes('rina');

  if (isDimas || isRina) {
    return (
      <View
        style={[
          styles.avatarContainer,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      >
        <Image
          source={isDimas ? dimasAvatarAsset : rinaAvatarAsset}
          style={{ width: size, height: size }}
          contentFit="cover"
        />
      </View>
    );
  }

  const initials = nama
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <View
      style={[
        styles.avatarContainer,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={styles.initialsText}>{initials}</Text>
    </View>
  );
}

export function UserAvatar({
  userId,
  nama = 'User',
  size = 38,
}: AsistenAvatarProps) {
  const isFemale =
    nama.toLowerCase().includes('rina') ||
    nama.toLowerCase().includes('citra') ||
    nama.toLowerCase().includes('dewi') ||
    nama.toLowerCase().includes('sari') ||
    userId === 'ast-3';

  return (
    <View
      style={[
        styles.userAvatarContainer,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Image
        source={isFemale ? rinaAvatarAsset : dimasAvatarAsset}
        style={{ width: size, height: size }}
        contentFit="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  avatarContainer: {
    backgroundColor: '#E2EAD8',
    borderWidth: 1.5,
    borderColor: '#9AB394',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  userAvatarContainer: {
    backgroundColor: '#EAEFE5',
    borderWidth: 1,
    borderColor: '#DFE8D9',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initialsText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C281C',
  },
});
