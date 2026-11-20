import React from 'react';

import { ProfilView } from '@/components/profil-view';
import { usePraktikum } from '@/context/praktikum-context';

export default function AsistenProfilScreen() {
  const { currentUser } = usePraktikum();
  const kelasDiampu =
    currentUser?.kelasDiampu && currentUser.kelasDiampu.length > 0
      ? currentUser.kelasDiampu.join(', ')
      : '-';

  return (
    <ProfilView
      roleLabel="Asisten Praktikum"
      extraLabel="Kelas Diampu"
      extraValue={kelasDiampu}
      isAsisten
    />
  );
}
