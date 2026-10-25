import { Image } from 'expo-image';
import React from 'react';
import { View } from 'react-native';

export interface ThemeIconProps {
  size?: number;
  width?: number;
  height?: number;
  color?: string;
}

const arrowLeftAsset = require('../../../assets/icons/arrow-left.svg');
const mapPinAsset = require('../../../assets/icons/map-pin.svg');
const clockAsset = require('../../../assets/icons/clock.svg');
const calendarAsset = require('../../../assets/icons/calendar.svg');
const checkAsset = require('../../../assets/icons/check.svg');
const cardCornerAsset = require('../../../assets/illustrations/card-corner-leaves.svg');
const emptyScheduleAsset = require('../../../assets/illustrations/empty-schedule-calendar.svg');
const emptyAttendanceAsset = require('../../../assets/illustrations/empty-attendance-leaf.svg');
const headerBlobAsset = require('../../../assets/illustrations/header-botanical-blob.svg');

/**
 * 1. Arrow Left Back Icon
 */
export function ArrowLeftIcon({ size = 24, color = '#1C281C' }: ThemeIconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Image
        source={arrowLeftAsset}
        style={{ width: size, height: size }}
        tintColor={color}
        contentFit="contain"
      />
    </View>
  );
}

/**
 * 2. Map Pin Location Icon
 */
export function MapPinIcon({ size = 16, color = '#6E7A68' }: ThemeIconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Image
        source={mapPinAsset}
        style={{ width: size, height: size }}
        tintColor={color}
        contentFit="contain"
      />
    </View>
  );
}

/**
 * 3. Clock Time Icon
 */
export function ClockIcon({ size = 16, color = '#6E7A68' }: ThemeIconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Image
        source={clockAsset}
        style={{ width: size, height: size }}
        tintColor={color}
        contentFit="contain"
      />
    </View>
  );
}

/**
 * 4. Calendar Icon
 */
export function CalendarIcon({ size = 16, color = '#6E7A68' }: ThemeIconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Image
        source={calendarAsset}
        style={{ width: size, height: size }}
        tintColor={color}
        contentFit="contain"
      />
    </View>
  );
}

/**
 * 5. Checkmark Icon
 */
export function CheckIcon({ size = 16, color = '#2E4028' }: ThemeIconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Image
        source={checkAsset}
        style={{ width: size, height: size }}
        tintColor={color}
        contentFit="contain"
      />
    </View>
  );
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
