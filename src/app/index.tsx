import { Redirect } from 'expo-router';
import React from 'react';

import { LoadingState } from '@/components/loading-state';
import { useAuth } from '@/context/auth-context';

export default function IndexScreen() {
  const { currentUser, initializing } = useAuth();

  if (initializing) {
    return <LoadingState pesan="Memuat status autentikasi..." />;
  }

  if (!currentUser) {
    return <Redirect href="/(auth)/login" />;
  }

  if (currentUser.peran === 'asisten') {
    return <Redirect href="/asisten/jadwal" />;
  }

  return <Redirect href="/praktikan/jadwal" />;
}
