import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export interface IconProps {
  size?: number;
  color?: string;
}

const calendarClockAsset = require('../../../assets/icons/modal-calendar-clock.svg');
const alertCircleAsset = require('../../../assets/icons/modal-alert-circle.svg');

/**
 * Calendar with clock badge icon
 * Renders via expo-image to prevent native ViewManager registry errors
 */
export function CalendarClockIcon({ size = 64 }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Image
        source={calendarClockAsset}
        style={{ width: size, height: size }}
        contentFit="contain"
      />
    </View>
  );
}

/**
 * Circular exclamation mark warning icon
 * Renders via expo-image to prevent native ViewManager registry errors
 */
export function AlertCircleIcon({ size = 64 }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Image
        source={alertCircleAsset}
        style={{ width: size, height: size }}
        contentFit="contain"
      />
    </View>
  );
}
