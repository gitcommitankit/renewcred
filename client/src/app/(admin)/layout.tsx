import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | RenewCred Admin',
    default: 'Admin | RenewCred',
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
