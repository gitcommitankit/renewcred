import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import MaintenancePage from '@/components/MaintenancePage';

export const metadata: Metadata = {
  title: {
    template: '%s | RenewCred',
    default: 'RenewCred — Climate Standards Registry',
  },
  description:
    'RenewCred is the trusted registry for climate standards, certifications, and carbon credit documentation.',
  keywords: ['climate standards', 'carbon credits', 'sustainability', 'certification'],
  openGraph: {
    siteName: 'RenewCred',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const isMaintenanceMode = process.env.NEXT_PUBLIC_IS_MAINTENANCE_MODE === 'true';

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <Providers>{isMaintenanceMode ? <MaintenancePage /> : children}</Providers>
      </body>
    </html>
  );
}
