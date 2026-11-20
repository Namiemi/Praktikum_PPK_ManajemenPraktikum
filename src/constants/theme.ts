import { Platform } from 'react-native';

/**
 * Palet desain Botanical Cream & Forest Green (acuan konsistensi UI Asisten & Praktikan).
 */
export const Botanical = {
  canvas: '#FDFBF7',
  surface: '#FFFFFF',
  surfaceSubtle: '#FAF9F5',
  surfaceWarm: '#F5F2EB',
  surfaceBeige: '#F4F1EA',
  surfaceSelected: '#F3F6EE',
  border: '#E6E4DD',
  borderSubtle: '#EAECE3',
  borderDivider: '#F0EFE9',
  borderChip: '#D5E0D5',
  forest: '#2E4028',
  forestBorder: '#202D1D',
  primary: '#344E38',
  primaryDark: '#2D3E2D',
  chipActive: '#3E543E',
  sagePill: '#E5EAD7',
  sageBadgeBg: '#C8D7B8',
  neutralBadgeBg: '#EAE8E1',
  disabled: '#C9CEC4',
  textPrimary: '#1C281C',
  textSecondary: '#4A5D4A',
  textMuted: '#5A6B5A',
  textLabel: '#2E3E2E',
  textPlaceholder: '#8C9786',
  danger: '#B84A39',
  dangerText: '#9E3B2B',
  dangerBg: '#F4DFDA',
  dangerSurface: '#FDF4F2',
  infoBg: '#E3EEF9',
  infoText: '#1E5A96',
  progressTrack: '#E2E8DF',
  progressFill: '#4A6B4A',
  tabActive: '#FDFBF7',
  tabInactive: '#A0A79A',
} as const;

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
