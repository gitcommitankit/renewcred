'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDeleteStandardMutation, useGetAllStandardsQuery } from '@/store/api/standardsApi';
import { useDebounce } from '@/hooks/useDebounce';
import { Standard } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/Modal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function StandardsListPage() {
  const { data, isLoading } = useGetAllStandardsQuery();
  const [deleteStandard, { isLoading: isDeleting }] = useDeleteStandardMutation();
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Standard | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const standards = (data?.data ?? []).filter(
    (s: Standard) =>
      !debouncedSearch ||
      s.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      s.slug.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteStandard({ id: deleteTarget.id, slug: deleteTarget.slug }).unwrap();
      toast.success(`"${deleteTarget.title}" deleted`);
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete standard');
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-charcoal-900">Standards</h2>
          <p className="text-sm text-warm-gray-500">Manage all climate standards</p>
        </div>
        <Link href="/admin/dashboard/standards/new">
          <Button variant="primary" leftIcon={<Plus size={15} />}>
            New Standard
          </Button>
        </Link>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search standards…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search size={15} />}
        />
      </div>

      <div className="bg-white rounded-xl border border-warm-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-sm text-warm-gray-500">Loading…</div>
        ) : standards.length === 0 ? (
          <div className="p-10 text-center text-sm text-warm-gray-500">
            {search ? 'No standards match your search.' : 'No standards yet.'}{' '}
            {!search && (
              <Link href="/admin/dashboard/standards/new" className="text-brand-red underline">
                Create one
              </Link>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title / Slug</TableHead>
                <TableHead>Versions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {standards.map((s: Standard) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <p className="font-medium text-charcoal-900 flex items-center gap-2">
                      {s.icon && <span>{s.icon}</span>} {s.title}
                    </p>
                    <p className="text-xs text-warm-gray-500 mt-0.5">/{s.slug}</p>
                  </TableCell>
                  <TableCell className="text-charcoal-600">{s._count?.versions ?? 0}</TableCell>
                  <TableCell>
                    <Badge variant={s.isPublished ? 'success' : 'warning'}>
                      {s.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-warm-gray-500">{s.sortOrder}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/dashboard/standards/${s.id}/versions`}
                        className="text-xs text-blue-600 font-medium hover:underline"
                      >
                        Versions
                      </Link>
                      <Link
                        href={`/admin/dashboard/standards/${s.id}`}
                        className="p-1.5 text-warm-gray-500 hover:text-charcoal-900 hover:bg-warm-gray-100 rounded-md transition-colors"
                        title="Edit"
                      >
                        <Edit size={14} />
                      </Link>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(s)}
                        className="p-1.5 text-warm-gray-500 hover:text-red-600 hover:bg-red-50 h-auto"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Standard"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This will also delete all its versions and sections.`}
        isLoading={isDeleting}
      />
    </>
  );
}
