'use client';

import Link from 'next/link';
import { BookOpen, FileText, CheckCircle, Clock, Plus, ArrowRight } from 'lucide-react';
import { useGetAllStandardsQuery } from '@/store/api/standardsApi';
import type { Standard } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  href,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  href?: string;
}) {
  const inner = (
    <div
      className={`flex items-center gap-4 p-5 bg-white rounded-xl border border-warm-gray-200 shadow-sm hover:shadow-md transition-shadow ${href ? 'cursor-pointer' : ''}`}
    >
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
  const totalVersions = standards.reduce(
    (sum: number, s: Standard) => sum + (s._count?.versions ?? 0),
    0
  );

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-charcoal-900">Overview</h2>
        <p className="text-sm text-warm-gray-500 mt-0.5">
          Welcome back. Here&apos;s what&apos;s happening.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Standards"
          value={isLoading ? '—' : total}
          icon={BookOpen}
          color="bg-brand-red"
          href="/admin/dashboard/standards"
        />
        <StatCard
          label="Published"
          value={isLoading ? '—' : published}
          icon={CheckCircle}
          color="bg-green-500"
        />
        <StatCard
          label="Drafts"
          value={isLoading ? '—' : drafts}
          icon={Clock}
          color="bg-amber-500"
        />
        <StatCard
          label="Total Versions"
          value={isLoading ? '—' : totalVersions}
          icon={FileText}
          color="bg-blue-500"
        />
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-charcoal-600 uppercase tracking-wider mb-3">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="primary" className="text-white!" leftIcon={<Plus size={15} />}>
            <Link href="/admin/dashboard/standards/new">New Standards</Link>
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-warm-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-warm-gray-200">
          <h3 className="text-sm font-semibold text-charcoal-900">Standards</h3>
          <Link
            href="/admin/dashboard/standards"
            className="flex items-center gap-1 text-xs text-brand-red font-medium hover:underline"
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-sm text-warm-gray-500">Loading…</div>
        ) : standards.length === 0 ? (
          <div className="p-8 text-center text-sm text-warm-gray-500">
            No standards yet.{' '}
            <Link href="/admin/dashboard/standards/new" className="text-brand-red underline">
              Create one
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="hidden sm:table-cell">Versions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {standards.map((s: Standard) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium text-charcoal-900">
                    {s.icon && <span className="mr-2">{s.icon}</span>}
                    {s.title}
                  </TableCell>
                  <TableCell className="text-charcoal-600 hidden sm:table-cell">
                    {s._count?.versions ?? 0}
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.isPublished ? 'success' : 'warning'}>
                      {s.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/admin/dashboard/standards/${s.id}`}
                      className="text-xs text-brand-red font-medium hover:underline"
                    >
                      Edit
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </>
  );
}
