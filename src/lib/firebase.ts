/**
 * @file firebase.ts
 * @description Inisialisasi dan ekspor instance Firebase Auth dan Firestore menggunakan API modular React Native Firebase.
 */

import { getAuth } from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore';

export const auth = getAuth();
export const db = getFirestore();
