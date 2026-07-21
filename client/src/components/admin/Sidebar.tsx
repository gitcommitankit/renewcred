'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { useState } from 'react';

const NAV_ITEMS = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/admin/dashboard/standards', icon: BookOpen, label: 'Standards', exact: false },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside
      className={[
        'relative flex flex-col bg-charcoal-900 text-white transition-all duration-300 shrink-0',
        'border-r border-charcoal-800',
        collapsed ? 'w-16' : 'w-60',
      ].join(' ')}
    >
      <div className="flex items-center px-4 py-5 border-b border-charcoal-800 min-h-[72.5px] overflow-hidden">
        <Logo
          className={`h-6 w-auto text-white shrink-0 transition-opacity duration-300 ${collapsed ? 'opacity-0' : 'opacity-100'}`}
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={[
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-brand-red text-white'
                  : 'text-warm-gray-400 hover:bg-charcoal-800 hover:text-white',
              ].join(' ')}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="whitespace-nowrap">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 z-10 flex items-center justify-center w-6 h-6 bg-charcoal-800 border border-charcoal-700 rounded-full text-warm-gray-400 hover:text-white hover:bg-brand-red hover:border-brand-red transition-all duration-150"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
