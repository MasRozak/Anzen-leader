import React from 'react';
import { getSession } from '@/lib/auth';
import ToyotaHeader from '@/components/shared/ToyotaHeader';

export default async function AnzenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ToyotaHeader
        title="Absensi Harian Anzen Leader Kontraktor"
        subtitle={`Anzen Leader: ${session?.cardNumber || session?.name || '-'}`}
      />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
