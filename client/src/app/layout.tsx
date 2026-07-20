import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';

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
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
