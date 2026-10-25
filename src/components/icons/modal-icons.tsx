import React from 'react';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
}

/**
 * Calendar with clock badge icon
 * Colors match the matcha/sage palette from mockup Screen 02:
 * - Header banner: Sage Green (#7D9266)
 * - Calendar body: Light Sage (#DDE6D5)
 * - Binder tabs: Matcha (#5C7047)
 * - Clock badge: Olive/Matcha (#738A5C) with white hands (#FFFFFF)
 */
export function CalendarClockIcon({ size = 64 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 72 72" fill="none">
      {/* Calendar Base Card */}
      <Rect
        x="10"
        y="14"
        width="46"
        height="44"
        rx="8"
        fill="#DCE5D4"
      />

      {/* Calendar Header Band */}
      <Path
        d="M10 22C10 17.5817 13.5817 14 18 14H48C52.4183 14 56 17.5817 56 22V27H10V22Z"
        fill="#7F9468"
      />

      {/* Binder Loops / Tabs */}
      <Rect x="19" y="9" width="4.5" height="9" rx="2.25" fill="#586C44" />
      <Rect x="31" y="9" width="4.5" height="9" rx="2.25" fill="#586C44" />
      <Rect x="43" y="9" width="4.5" height="9" rx="2.25" fill="#586C44" />

      {/* Calendar Date Dots */}
      <G fill="#82976C">
        {/* Row 1 */}
        <Circle cx="19" cy="34" r="2.2" />
        <Circle cx="28" cy="34" r="2.2" />
        <Circle cx="37" cy="34" r="2.2" />
        <Circle cx="46" cy="34" r="2.2" />

        {/* Row 2 */}
        <Circle cx="19" cy="42" r="2.2" />
        <Circle cx="28" cy="42" r="2.2" />
        <Circle cx="37" cy="42" r="2.2" />

        {/* Row 3 */}
        <Circle cx="19" cy="50" r="2.2" />
        <Circle cx="28" cy="50" r="2.2" />
      </G>

      {/* Overlapping Clock Badge at Bottom Right */}
      <G>
        {/* Outer border to separate from calendar */}
        <Circle
          cx="48"
          cy="48"
          r="15"
          fill="#768C5E"
          stroke="#FAF9F5"
          strokeWidth="3"
        />

        {/* Clock center pin */}
        <Circle cx="48" cy="48" r="1.5" fill="#FFFFFF" />

        {/* Clock minute hand (pointing up) */}
        <Path
          d="M48 48V40"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Clock hour hand (pointing to ~2 o'clock) */}
        <Path
          d="M48 48L54 44"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </G>
    </Svg>
  );
}

/**
 * Circular exclamation mark warning icon
 * Matches the terracotta/burnt red danger palette from mockup Screen 03:
 * - Circle: Terracotta / Burnt Red (#D66244)
 * - Exclamation: Pure White (#FFFFFF)
 */
export function AlertCircleIcon({ size = 64 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Red Circular Background */}
      <Circle cx="32" cy="32" r="28" fill="#D66244" />

      {/* Exclamation Bar */}
      <Path
        d="M32 17V33"
        stroke="#FFFFFF"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Exclamation Dot */}
      <Circle cx="32" cy="43.5" r="2.8" fill="#FFFFFF" />
    </Svg>
  );
}
