import React from 'react';
import Svg, {
  Circle,
  G,
  Line,
  Path,
  Rect,
} from 'react-native-svg';

export interface ThemeIconProps {
  size?: number;
  width?: number;
  height?: number;
  color?: string;
}

/**
 * 1. Arrow Left Back Icon
 * Used in header of screen 03, 04, 05, 06
 */
export function ArrowLeftIcon({ size = 24, color = '#1C281C' }: ThemeIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="m12 19-7-7 7-7" />
      <Path d="M19 12H5" />
    </Svg>
  );
}

/**
 * 2. Map Pin Location Icon
 * Used in room lab label in screen 01 & 03
 */
export function MapPinIcon({ size = 16, color = '#6E7A68' }: ThemeIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <Circle cx="12" cy="10" r="3" />
    </Svg>
  );
}

/**
 * 3. Clock Time Icon
 * Used in "Dibuka pukul 13.00" in screen 04 & 05
 */
export function ClockIcon({ size = 16, color = '#6E7A68' }: ThemeIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Circle cx="12" cy="12" r="10" />
      <Path d="M12 6v6l4 2" />
    </Svg>
  );
}

/**
 * 4. Calendar Icon
 * Used in session info card in screen 06
 */
export function CalendarIcon({ size = 16, color = '#6E7A68' }: ThemeIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M8 2v4" />
      <Path d="M16 2v4" />
      <Rect width="18" height="18" x="3" y="4" rx="2" />
      <Path d="M3 10h18" />
    </Svg>
  );
}

/**
 * 5. Checkmark Icon
 * Used in attendance list in screen 05
 */
export function CheckIcon({ size = 16, color = '#2E4028' }: ThemeIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M20 6 9 17l-5-5" />
    </Svg>
  );
}

/**
 * 6. Card Corner Botanical Leaves & Contour Lines
 * Appears in the bottom-right corner of session cards
 */
export function CardCornerLeafOrnament({
  width = 80,
  height = 80,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 80 80" fill="none">
      <Path
        d="M12 80C14 55 35 34 60 32C68 31 75 32 80 34"
        stroke="#D1DCB8"
        strokeWidth={1.2}
        strokeLinecap="round"
      />
      <Path
        d="M26 80C28 62 42 48 60 46C67 45 74 46 80 48"
        stroke="#E2EAD2"
        strokeWidth={1.2}
        strokeLinecap="round"
      />
      <G transform="translate(48, 48) rotate(-20)">
        <Path
          d="M-8 30C0 15 12 0 26 -16"
          stroke="#8A9E75"
          strokeWidth={1.6}
          strokeLinecap="round"
        />
        <Path
          d="M26 -16C23 -22 28 -26 29 -26C30 -26 34 -21 26 -16Z"
          fill="#C5D6B4"
          stroke="#8A9E75"
          strokeWidth={1.2}
        />
        <Path
          d="M20 -6C10 -10 8 -4 9 -2C11 1 18 0 20 -6Z"
          fill="#B2C69E"
          stroke="#8A9E75"
          strokeWidth={1.2}
        />
        <Path
          d="M15 4C24 0 27 6 26 8C24 10 17 9 15 4Z"
          fill="#C5D6B4"
          stroke="#8A9E75"
          strokeWidth={1.2}
        />
        <Path
          d="M9 14C-1 10 -3 16 -2 18C0 21 7 20 9 14Z"
          fill="#B2C69E"
          stroke="#8A9E75"
          strokeWidth={1.2}
        />
        <Path
          d="M3 22C12 18 15 24 14 26C12 28 5 27 3 22Z"
          fill="#C5D6B4"
          stroke="#8A9E75"
          strokeWidth={1.2}
        />
      </G>
    </Svg>
  );
}

/**
 * 7. Empty State Calendar Illustration with Botanical Leaves
 * Used in screen 02 (Jadwal Empty State)
 */
export function EmptyScheduleIllustration({
  width = 200,
  height = 180,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 220 200" fill="none">
      <Path
        d="M45 105C35 60 70 30 115 25C160 20 185 45 190 90C195 135 160 175 115 178C70 180 55 150 45 105Z"
        fill="#E2EAD8"
        opacity={0.85}
      />
      <G transform="translate(30, 65) rotate(-35)">
        <Path
          d="M5 45C12 30 25 15 45 5"
          stroke="#3A4D33"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <Path
          d="M45 5C40 1 30 2 28 8C26 14 36 12 45 5Z"
          fill="#586E4D"
          stroke="#3A4D33"
          strokeWidth={1.5}
        />
        <Path
          d="M33 16C26 12 18 16 19 22C20 28 29 23 33 16Z"
          fill="#7D956E"
          stroke="#3A4D33"
          strokeWidth={1.5}
        />
        <Path
          d="M22 28C14 26 8 32 11 38C14 44 21 36 22 28Z"
          fill="#586E4D"
          stroke="#3A4D33"
          strokeWidth={1.5}
        />
      </G>
      <G transform="translate(62, 42) rotate(4)">
        <Rect
          x="2"
          y="4"
          width="88"
          height="96"
          rx="14"
          fill="#000000"
          fillOpacity={0.08}
        />
        <Rect x="0" y="0" width="88" height="96" rx="14" fill="#2E4028" />
        <Rect x="3" y="14" width="82" height="78" rx="8" fill="#FAF9F5" />
        <Rect
          x="18"
          y="-4"
          width="6"
          height="14"
          rx="3"
          fill="#E2EAD8"
          stroke="#2E4028"
          strokeWidth={2}
        />
        <Rect
          x="41"
          y="-4"
          width="6"
          height="14"
          rx="3"
          fill="#E2EAD8"
          stroke="#2E4028"
          strokeWidth={2}
        />
        <Rect
          x="64"
          y="-4"
          width="6"
          height="14"
          rx="3"
          fill="#E2EAD8"
          stroke="#2E4028"
          strokeWidth={2}
        />
        <Rect x="3" y="14" width="82" height="16" fill="#879F75" />
        <Line
          x1="10"
          y1="42"
          x2="78"
          y2="42"
          stroke="#BACAB0"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <Line
          x1="10"
          y1="54"
          x2="78"
          y2="54"
          stroke="#BACAB0"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <Line
          x1="10"
          y1="66"
          x2="78"
          y2="66"
          stroke="#BACAB0"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <Line
          x1="10"
          y1="78"
          x2="78"
          y2="78"
          stroke="#BACAB0"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <Line
          x1="24"
          y1="36"
          x2="24"
          y2="84"
          stroke="#BACAB0"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <Line
          x1="38"
          y1="36"
          x2="38"
          y2="84"
          stroke="#BACAB0"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <Line
          x1="52"
          y1="36"
          x2="52"
          y2="84"
          stroke="#BACAB0"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <Line
          x1="66"
          y1="36"
          x2="66"
          y2="84"
          stroke="#BACAB0"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </G>
      <G transform="translate(135, 125) rotate(15)">
        <Path
          d="M0 45C10 32 24 18 42 2"
          stroke="#3A4D33"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <Path
          d="M42 2C42 8 36 15 28 13C22 11 32 4 42 2Z"
          fill="#586E4D"
          stroke="#3A4D33"
          strokeWidth={1.5}
        />
        <Path
          d="M26 16C31 21 32 29 25 30C20 31 18 22 26 16Z"
          fill="#7D956E"
          stroke="#3A4D33"
          strokeWidth={1.5}
        />
        <Path
          d="M12 32C18 36 17 44 11 44C6 44 6 36 12 32Z"
          fill="#586E4D"
          stroke="#3A4D33"
          strokeWidth={1.5}
        />
      </G>
    </Svg>
  );
}

/**
 * 8. Empty Attendance Illustration with 5-Leaf Sprig and Grid
 * Used in screen 04 (Detail Dibuka 0 Hadir)
 */
export function EmptyAttendanceIllustration({
  width = 130,
  height = 130,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 140 140" fill="none">
      <G stroke="#D4DEC9" strokeWidth={1.2} strokeLinecap="round">
        <Line x1="25" y1="35" x2="115" y2="35" />
        <Line x1="25" y1="55" x2="115" y2="55" />
        <Line x1="25" y1="75" x2="115" y2="75" />
        <Line x1="25" y1="95" x2="115" y2="95" />
        <Line x1="25" y1="115" x2="115" y2="115" />
        <Line x1="35" y1="25" x2="35" y2="115" />
        <Line x1="55" y1="25" x2="55" y2="115" />
        <Line x1="75" y1="25" x2="75" y2="115" />
        <Line x1="95" y1="25" x2="95" y2="115" />
        <Line x1="115" y1="25" x2="115" y2="115" />
      </G>
      <G transform="translate(70, 72)">
        <Path
          d="M-2 42C-1 25 1 2 2 -32"
          stroke="#384D32"
          strokeWidth={2.2}
          strokeLinecap="round"
        />
        <Path
          d="M2 -32C-4 -42 2 -48 3 -48C4 -48 10 -42 2 -32Z"
          fill="#A5B895"
          stroke="#384D32"
          strokeWidth={1.8}
        />
        <Path
          d="M1 -18C-14 -24 -18 -16 -18 -13C-16 -9 -4 -8 1 -18Z"
          fill="#889E78"
          stroke="#384D32"
          strokeWidth={1.8}
        />
        <Path
          d="M2 -10C16 -16 22 -10 21 -6C19 -2 8 0 2 -10Z"
          fill="#A5B895"
          stroke="#384D32"
          strokeWidth={1.8}
        />
        <Path
          d="M0 6C-16 2 -21 11 -20 15C-18 19 -5 18 0 6Z"
          fill="#758B65"
          stroke="#384D32"
          strokeWidth={1.8}
        />
        <Path
          d="M-1 16C15 12 21 21 20 25C18 29 6 28 -1 16Z"
          fill="#889E78"
          stroke="#384D32"
          strokeWidth={1.8}
        />
      </G>
    </Svg>
  );
}

/**
 * 9. Top-Right Botanical Blob & Grid Header Ornament
 * Appears in the top-right of all screens
 */
export function HeaderBotanicalBlob({
  width = 160,
  height = 115,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 180 130" fill="none">
      <G stroke="#C6D3B6" strokeWidth={1} strokeOpacity={0.5} strokeLinecap="round">
        <Line x1="80" y1="10" x2="180" y2="10" />
        <Line x1="80" y1="28" x2="180" y2="28" />
        <Line x1="80" y1="46" x2="180" y2="46" />
        <Line x1="80" y1="64" x2="180" y2="64" />
        <Line x1="95" y1="0" x2="95" y2="70" />
        <Line x1="115" y1="0" x2="115" y2="70" />
        <Line x1="135" y1="0" x2="135" y2="70" />
        <Line x1="155" y1="0" x2="155" y2="70" />
        <Line x1="175" y1="0" x2="175" y2="70" />
      </G>
      <Path
        d="M70 0C85 25 110 40 135 48C155 54 175 45 180 35V0H70Z"
        fill="#2E4027"
      />
      <Path
        d="M40 0C60 40 95 65 135 72C155 75 175 65 180 50"
        stroke="#7E966B"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Path
        d="M20 0C45 45 85 75 130 84C155 88 175 78 180 65"
        stroke="#9BB288"
        strokeWidth={1.8}
        strokeDasharray="4 4"
        strokeLinecap="round"
      />
      <G transform="translate(130, 20) rotate(45)">
        <Path
          d="M0 0C10 15 20 28 32 40"
          stroke="#FAF8F2"
          strokeWidth={1.8}
          strokeLinecap="round"
        />
        <Path
          d="M12 12C6 16 12 24 18 20C20 18 16 10 12 12Z"
          fill="#8FA87B"
        />
        <Path
          d="M22 24C16 28 22 36 28 32C30 30 26 22 22 24Z"
          fill="#8FA87B"
        />
      </G>
    </Svg>
  );
}
