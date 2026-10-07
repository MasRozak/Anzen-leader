import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Absensi Harian Anzen Leader Kontraktor - Toyota',
  description: 'Sistem Absensi Harian Anzen Leader Kontraktor & Dashboard Monitoring Staff Toyota',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-white text-toyota-black antialiased">
        {children}
      </body>
    </html>
  );
}
