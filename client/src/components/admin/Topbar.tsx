'use client';

import { LogOut, Bell } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

import { usePathname } from 'next/navigation';

export default function Topbar() {
  const { admin, logout, isLogoutLoading } = useAuth();
  const pathname = usePathname();
  
  let title = 'Admin Dashboard';
  if (pathname.includes('/dashboard/standards')) title = 'Standards Management';
  if (pathname.includes('/dashboard/pages')) title = 'Pages Management';
  if (pathname.includes('/dashboard/settings')) title = 'Site Settings';

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-warm-gray-200 shrink-0 min-h-16.25">
      {/* Page Title */}
      <h1 className="text-base font-semibold text-charcoal-900">
        {title}
      </h1>

      {/* Right: admin info + logout */}
      <div className="flex items-center gap-3">
        <button
          className="relative p-2 rounded-lg text-warm-gray-500 hover:text-charcoal-900 hover:bg-warm-gray-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>

        <div className="h-5 w-px bg-warm-gray-200" />

        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-red text-white text-xs font-bold shrink-0">
            {admin?.name?.charAt(0).toUpperCase() ?? 'A'}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-charcoal-900 leading-tight">{admin?.name}</p>
            <p className="text-xs text-warm-gray-500 leading-tight">{admin?.email}</p>
          </div>
        </div>

        <button
          onClick={logout}
          disabled={isLogoutLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#555] hover:text-brand-red hover:bg-red-50 rounded-lg transition-colors"
          aria-label="Logout"
        >
          <LogOut size={14} />
          <span className="hidden sm:block">Logout</span>
        </button>
      </div>
    </header>
  );
}
