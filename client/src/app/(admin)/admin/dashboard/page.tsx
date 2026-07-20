'use client';

import Link from 'next/link';
import { BookOpen, FileText, CheckCircle, Clock, Plus, ArrowRight } from 'lucide-react';
import { useGetAllStandardsQuery } from '@/store/api/standardsApi';
import type { Standard } from '@/types';

function StatCard({
  label, value, icon: Icon, color, href,
}: {
  label: string; value: number | string; icon: React.ElementType; color: string; href?: string;
}) {
  const inner = (
    <div className={`flex items-center gap-4 p-5 bg-white rounded-xl border border-warm-gray-200 shadow-sm hover:shadow-md transition-shadow ${href ? 'cursor-pointer' : ''}`}>
      <div className={`flex items-center justify-center w-11 h-11 rounded-xl ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-charcoal-900">{value}</p>
        <p className="text-xs text-warm-gray-500 font-medium">{label}</p>
      </div>
    </div>
  );
  if (href) return <Link href={href}>{inner}</Link>;
  return inner;
}

export default function DashboardPage() {
  const { data, isLoading } = useGetAllStandardsQuery();
  const standards = data?.data ?? [];

  const total = standards.length;
  const published = standards.filter((s: Standard) => s.isPublished).length;
  const drafts = standards.filter((s: Standard) => !s.isPublished).length;
  const totalVersions = standards.reduce((sum: number, s: Standard) => sum + (s._count?.versions ?? 0), 0);

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-charcoal-900">Overview</h2>
        <p className="text-sm text-warm-gray-500 mt-0.5">Welcome back. Here&apos;s what&apos;s happening.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Standards" value={isLoading ? '—' : total} icon={BookOpen} color="bg-brand-red" href="/admin/dashboard/standards" />
        <StatCard label="Published" value={isLoading ? '—' : published} icon={CheckCircle} color="bg-green-500" />
        <StatCard label="Drafts" value={isLoading ? '—' : drafts} icon={Clock} color="bg-amber-500" />
        <StatCard label="Total Versions" value={isLoading ? '—' : totalVersions} icon={FileText} color="bg-blue-500" />
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-charcoal-600 uppercase tracking-wider mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/dashboard/standards/new" className="flex items-center gap-2 px-4 py-2 bg-brand-red text-white! text-sm font-medium rounded-lg hover:bg-brand-red-dark transition-colors">
            <Plus size={15} /> New Standard
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-warm-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-warm-gray-200">
          <h3 className="text-sm font-semibold text-charcoal-900">Standards</h3>
          <Link href="/admin/dashboard/standards" className="flex items-center gap-1 text-xs text-brand-red font-medium hover:underline">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-sm text-warm-gray-500">Loading…</div>
        ) : standards.length === 0 ? (
          <div className="p-8 text-center text-sm text-warm-gray-500">
            No standards yet.{' '}
            <Link href="/admin/dashboard/standards/new" className="text-brand-red underline">Create one</Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-warm-gray-200">
                {['Title', 'Versions', 'Status', ''].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-warm-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {standards.map((s: Standard) => (
                <tr key={s.id} className="border-b border-warm-gray-100 hover:bg-warm-gray-100 transition-colors">
                  <td className="px-5 py-3 font-medium text-charcoal-900">
                    {s.icon && <span className="mr-2">{s.icon}</span>}{s.title}
                  </td>
                  <td className="px-5 py-3 text-charcoal-600 hidden sm:table-cell">{s._count?.versions ?? 0}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.isPublished ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {s.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/admin/dashboard/standards/${s.id}`} className="text-xs text-brand-red font-medium hover:underline">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
