import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

/**
 * Mengembalikan tinggi soft keyboard pada Android agar bottom-sheet modal
 * tetap berada di atas keyboard saat TextInput difokuskan.
 */
export function useAndroidKeyboardHeight(): number {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onShow = (event: { endCoordinates: { height: number } }) => {
      setKeyboardHeight(event.endCoordinates.height);
    };
    const onHide = () => {
      setKeyboardHeight(0);
    };

    const showSub = Keyboard.addListener('keyboardDidShow', onShow);
    const hideSub = Keyboard.addListener('keyboardDidHide', onHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return keyboardHeight;
}
