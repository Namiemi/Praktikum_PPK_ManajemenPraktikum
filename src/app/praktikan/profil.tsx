import React from 'react';

import { ProfilView } from '@/components/profil-view';
import { usePraktikum } from '@/context/praktikum-context';

export default function PraktikanProfilScreen() {
  const { currentUser } = usePraktikum();
  const kelas = currentUser?.kelas ? `Kelas ${currentUser.kelas}` : 'Belum terdaftar';

  return (
    <ProfilView
      roleLabel="Praktikan"
      extraLabel="Kelas"
      extraValue={kelas}
    />
  );
}
