'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGetStandardByIdQuery } from '@/store/api/standardsApi';
import { useDeleteVersionMutation } from '@/store/api/versionsApi';
import { VersionSummary } from '@/types';
import { Button, Spinner } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';
import { Badge, VersionBadge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/Modal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function VersionsListPage() {
  const params = useParams<{ id: string }>();
  const { data: standardData, isLoading: standardLoading } = useGetStandardByIdQuery(params.id);
  const standard = standardData?.data;
  const [deleteVersion, { isLoading: isDeleting }] = useDeleteVersionMutation();
  const [deleteTarget, setDeleteTarget] = useState<VersionSummary | null>(null);

  // standard.versions is populated by getStandardById and includes all versions (including drafts)
  const versions = standard?.versions ?? [];
  const isLoading = standardLoading;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteVersion({
        id: deleteTarget.id,
        standardSlug: standard?.slug ?? '',
        versionSlug: deleteTarget.slug,
      }).unwrap();
      toast.success('Version deleted');
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete version');
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-warm-gray-500 mb-1">
            <BackButton fallbackHref="/admin/dashboard/standards" />
            <span className="text-warm-gray-300">·</span>
            <span className="font-semibold text-charcoal-900 flex items-center gap-1">
              {standard?.icon} {standard?.title}
            </span>
          </div>
          <h2 className="text-xl font-bold text-charcoal-900">Versions</h2>
        </div>
        <Link href={`/admin/dashboard/standards/${params.id}/versions/new`}>
          <Button variant="primary" leftIcon={<Plus size={15} />}>
            New Version
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-warm-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-10">
            <Spinner size="lg" className="text-brand-red" />
          </div>
        ) : versions.length === 0 ? (
          <div className="p-10 text-center text-sm text-warm-gray-500">
            No versions yet.{' '}
            <Link
              href={`/admin/dashboard/standards/${params.id}/versions/new`}
              className="text-brand-red underline"
            >
              Create the first one
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Certified At</TableHead>
                <TableHead>Latest</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {versions.map((v: VersionSummary) => (
                <TableRow key={v.id}>
                  <TableCell className="font-semibold text-charcoal-900">
                    {v.versionLabel}
                  </TableCell>
                  <TableCell>
                    <VersionBadge status={v.status} />
                  </TableCell>
                  <TableCell className="text-warm-gray-500 text-xs">
                    {v.certifiedAt ? new Date(v.certifiedAt).toLocaleDateString() : '—'}
                  </TableCell>
                  <TableCell>{v.isLatest && <Badge variant="info">Latest</Badge>}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/dashboard/standards/${params.id}/versions/${v.id}`}
                        className="flex items-center gap-1 text-xs text-brand-red font-medium hover:underline"
                      >
                        <Edit size={13} /> Edit Content
                      </Link>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(v)}
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
        title="Delete Version"
        message={`Delete "${deleteTarget?.versionLabel}"? All sections inside will also be deleted.`}
        isLoading={isDeleting}
      />
    </>
  );
}
