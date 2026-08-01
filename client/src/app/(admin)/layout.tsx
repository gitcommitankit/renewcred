import type { Metadata } from 'next';
import AdminProviders from '@/components/providers/AdminProviders';

export const metadata: Metadata = {
  title: {
    template: '%s | RenewCred Admin',
    default: 'Admin | RenewCred',
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminProviders>{children}</AdminProviders>;
}
