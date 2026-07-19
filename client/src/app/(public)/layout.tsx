import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | RenewCred',
    default: 'RenewCred Standards',
  },
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
