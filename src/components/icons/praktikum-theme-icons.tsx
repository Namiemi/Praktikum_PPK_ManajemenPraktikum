import { Image } from 'expo-image';
import React from 'react';
import { ColorValue, View } from 'react-native';

export interface ThemeIconProps {
  size?: number;
  width?: number;
  height?: number;
  color?: ColorValue | string | null;
}

function resolveTintColor(
  color?: ColorValue | string | null,
  fallback?: string
): string | undefined {
  if (typeof color === 'string') return color;
  return fallback;
}

const arrowLeftAsset = require('../../../assets/icons/arrow-left.svg');
const mapPinAsset = require('../../../assets/icons/map-pin.svg');
const clockAsset = require('../../../assets/icons/clock.svg');
const calendarAsset = require('../../../assets/icons/calendar.svg');
const checkAsset = require('../../../assets/icons/check.svg');
const userAsset = require('../../../assets/icons/user.svg');
const clipboardListAsset = require('../../../assets/icons/clipboard-list.svg');
const usersAsset = require('../../../assets/icons/users.svg');
const plusAsset = require('../../../assets/icons/plus.svg');
const pencilAsset = require('../../../assets/icons/pencil.svg');
const trashAsset = require('../../../assets/icons/trash.svg');
const searchAsset = require('../../../assets/icons/search.svg');
const cardCornerAsset = require('../../../assets/illustrations/card-corner-leaves.svg');
const emptyScheduleAsset = require('../../../assets/illustrations/empty-schedule-calendar.svg');
const emptyAttendanceAsset = require('../../../assets/illustrations/empty-attendance-leaf.svg');
const headerBlobAsset = require('../../../assets/illustrations/header-botanical-blob.svg');

function TintedSvgIcon({
  source,
  size,
  color,
  fallbackColor,
}: {
  source: number;
  size: number;
  color?: ColorValue | string | null;
  fallbackColor: string;
}) {
  const resolvedColor = resolveTintColor(color, fallbackColor);
  return (
    <View
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Image
        source={source}
        style={{ width: size, height: size }}
        tintColor={resolvedColor}
        cachePolicy="none"
        recyclingKey={`${source}-${resolvedColor ?? 'default'}-${size}`}
        contentFit="contain"
      />
    </View>
  );
}

/**
 * 1. Arrow Left Back Icon
 */
export function ArrowLeftIcon({ size = 24, color = '#1C281C' }: ThemeIconProps) {
  return <TintedSvgIcon source={arrowLeftAsset} size={size} color={color} fallbackColor="#1C281C" />;
}

/**
 * 2. Map Pin Location Icon
 */
export function MapPinIcon({ size = 16, color = '#6E7A68' }: ThemeIconProps) {
  return <TintedSvgIcon source={mapPinAsset} size={size} color={color} fallbackColor="#6E7A68" />;
}

/**
 * 3. Clock Time Icon
 */
export function ClockIcon({ size = 16, color = '#6E7A68' }: ThemeIconProps) {
  return <TintedSvgIcon source={clockAsset} size={size} color={color} fallbackColor="#6E7A68" />;
}

/**
 * 4. Calendar Icon
 */
export function CalendarIcon({ size = 16, color = '#6E7A68' }: ThemeIconProps) {
  return <TintedSvgIcon source={calendarAsset} size={size} color={color} fallbackColor="#6E7A68" />;
}

/**
 * 5. Checkmark Icon
 */
export function CheckIcon({ size = 16, color = '#2E4028' }: ThemeIconProps) {
  return <TintedSvgIcon source={checkAsset} size={size} color={color} fallbackColor="#2E4028" />;
}

/**
 * 5b. User / Profile Icon
 */
export function UserIcon({ size = 20, color = '#FDFBF7' }: ThemeIconProps) {
  return <TintedSvgIcon source={userAsset} size={size} color={color} fallbackColor="#FDFBF7" />;
}

/**
 * 5c. Clipboard List / History Icon
 */
export function ClipboardListIcon({ size = 20, color = '#FDFBF7' }: ThemeIconProps) {
  return <TintedSvgIcon source={clipboardListAsset} size={size} color={color} fallbackColor="#FDFBF7" />;
}

/**
 * 5d. Users / Class Group Icon
 */
export function UsersIcon({ size = 20, color = '#3E543E' }: ThemeIconProps) {
  return <TintedSvgIcon source={usersAsset} size={size} color={color} fallbackColor="#3E543E" />;
}

/**
 * 5e. Plus Icon
 */
export function PlusIcon({ size = 16, color = '#FFFFFF' }: ThemeIconProps) {
  return <TintedSvgIcon source={plusAsset} size={size} color={color} fallbackColor="#FFFFFF" />;
}

/**
 * 5f. Pencil / Edit Icon
 */
export function PencilIcon({ size = 14, color = '#3E543E' }: ThemeIconProps) {
  return <TintedSvgIcon source={pencilAsset} size={size} color={color} fallbackColor="#3E543E" />;
}

/**
 * 5g. Trash / Delete Icon
 */
export function TrashIcon({ size = 14, color = '#9E3B2B' }: ThemeIconProps) {
  return <TintedSvgIcon source={trashAsset} size={size} color={color} fallbackColor="#9E3B2B" />;
}

/**
 * 5h. Search Icon
 */
export function SearchIcon({ size = 16, color = '#8C9786' }: ThemeIconProps) {
  return <TintedSvgIcon source={searchAsset} size={size} color={color} fallbackColor="#8C9786" />;
}

/**
 * 6. Card Corner Botanical Leaves & Contour Lines
 */
export function CardCornerLeafOrnament({
  width = 80,
  height = 80,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <View style={{ width, height, overflow: 'hidden' }}>
      <Image
        source={cardCornerAsset}
        style={{ width, height }}
        contentFit="contain"
      />
    </View>
  );
}

/**
 * 7. Empty State Calendar Illustration with Botanical Leaves
 */
export function EmptyScheduleIllustration({
  width = 200,
  height = 180,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      <Image
        source={emptyScheduleAsset}
        style={{ width, height }}
        contentFit="contain"
      />
    </View>
  );
}

/**
 * 8. Empty Attendance Illustration with 5-Leaf Sprig and Grid
 */
export function EmptyAttendanceIllustration({
  width = 130,
  height = 130,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      <Image
        source={emptyAttendanceAsset}
        style={{ width, height }}
        contentFit="contain"
      />
    </View>
  );
}

/**
 * 9. Top-Right Botanical Blob & Grid Header Ornament
 */
export function HeaderBotanicalBlob({
  width = 160,
  height = 115,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <View style={{ width, height, overflow: 'hidden' }}>
      <Image
        source={headerBlobAsset}
        style={{ width, height }}
        contentFit="contain"
      />
    </View>
  );
}
