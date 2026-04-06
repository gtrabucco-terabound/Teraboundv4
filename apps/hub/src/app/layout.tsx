import type { Metadata } from 'next';
import { AuthProvider } from '@terabound/auth';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Terabound HUB',
  description: 'Gateway de Identidad, Contexto y Acceso al ecosistema Terabound ERP.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-surface-950 text-surface-50 font-sans selection:bg-orange-500/30">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
