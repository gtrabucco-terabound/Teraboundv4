import type { Metadata } from 'next';
import { AuthProvider } from '@terabound/auth';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Terabound — Backend Admin',
  description: 'Control Plane del ecosistema Terabound ERP Multi-tenant. Gobierno, seguridad, módulos y configuración de plataforma.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
