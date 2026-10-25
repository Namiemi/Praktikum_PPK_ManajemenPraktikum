import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

const DIMAS_AVATAR_XML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 360" fill="none"><rect width="360" height="360" fill="#E2EAD8"/><g transform="translate(80 23)"><path d="M154 319.5c-14.4-20-25.67-58.67-27-78L58.5 212 30 319.5h124Z" fill="#ac6651" stroke="#000" stroke-width="4"/><path d="M181.94 151.37A75.72 75.72 0 0 1 34.93 187.7L18 117.13A75.72 75.72 0 0 1 165.2 81.55l16.74 69.82Z" fill="#ac6651" stroke="#000" stroke-width="4"/></g><g transform="translate(170 183)"><path d="M10 24.16c4.94 6.45 12.43 13.6 23.98 11.96 11.55-1.62 16.68-9.6 15.17-16.04" stroke="#000" stroke-width="4"/></g><g transform="translate(142 119)"><ellipse cx="16.53" cy="29.4" rx="9" ry="13.5" fill="#000"/><ellipse cx="80.53" cy="19.4" rx="9" ry="13.5" fill="#000"/></g><g transform="translate(53 272)"><path d="M260.67 91h-273.3c16.3-29.34 39.49-48.02 77.07-56.59 25-5 150-5 196.23 56.59Z" fill="#2E4028" stroke="#000" stroke-width="4"/></g></svg>`;

const RINA_AVATAR_XML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 360" fill="none"><rect width="360" height="360" fill="#E2EAD8"/><g transform="translate(80 23)"><path d="M154 319.5c-14.4-20-25.67-58.67-27-78L58.5 212 30 319.5h124Z" fill="#f9c9b6" stroke="#000" stroke-width="4"/><path d="M181.94 151.37A75.72 75.72 0 0 1 34.93 187.7L18 117.13A75.72 75.72 0 0 1 165.2 81.55l16.74 69.82Z" fill="#f9c9b6" stroke="#000" stroke-width="4"/></g><g transform="translate(170 183)"><path d="M10 24c6 6 16 10 28 4" stroke="#000" stroke-width="4"/></g><g transform="translate(142 119)"><ellipse cx="16.5" cy="29" rx="8" ry="12" fill="#000"/><ellipse cx="80.5" cy="19" rx="8" ry="12" fill="#000"/></g><g transform="translate(53 272)"><path d="M260.7 91H-12.64C3.67 61.66 26.86 42.98 64.44 34.4c40-8 140-8 196.26 56.6Z" fill="#586E4D" stroke="#000" stroke-width="4"/></g></svg>`;

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
        <SvgXml
          xml={isDimas ? DIMAS_AVATAR_XML : RINA_AVATAR_XML}
          width={size}
          height={size}
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

const styles = StyleSheet.create({
  avatarContainer: {
    backgroundColor: '#E2EAD8',
    borderWidth: 1.5,
    borderColor: '#9AB394',
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
