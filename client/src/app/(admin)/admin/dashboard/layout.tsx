'use client';

import AdminShell from '@/components/admin/AdminShell';
import Sidebar from '@/components/admin/Sidebar';
import Topbar from '@/components/admin/Topbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminShell>
      <div className="flex h-screen overflow-hidden bg-warm-gray-100">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </AdminShell>
  );
}
