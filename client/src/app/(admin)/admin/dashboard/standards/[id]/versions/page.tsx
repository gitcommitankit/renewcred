'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGetStandardByIdQuery } from '@/store/api/standardsApi';
import { useDeleteVersionMutation } from '@/store/api/versionsApi';
import { VersionSummary } from '@/types';
import { Button, Spinner } from '@/components/ui/Button';
import { VersionBadge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/Modal';


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
      await deleteVersion({ id: deleteTarget.id, standardSlug: standard?.slug ?? '' }).unwrap();
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
          <Link href={`/admin/dashboard/standards/${params.id}`} className="inline-flex items-center gap-1.5 text-sm text-warm-gray-500 hover:text-charcoal-900 mb-1 transition-colors">
            <ArrowLeft size={15} />{standard?.icon} {standard?.title}
          </Link>
          <h2 className="text-xl font-bold text-charcoal-900">Versions</h2>
        </div>
        <Link href={`/admin/dashboard/standards/${params.id}/versions/new`}>
          <Button variant="primary" leftIcon={<Plus size={15} />}>New Version</Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-warm-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-10"><Spinner size="lg" className="text-brand-red" /></div>
        ) : versions.length === 0 ? (
          <div className="p-10 text-center text-sm text-warm-gray-500">
            No versions yet.{' '}
            <Link href={`/admin/dashboard/standards/${params.id}/versions/new`} className="text-brand-red underline">Create the first one</Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-warm-gray-200 bg-warm-gray-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-warm-gray-500 uppercase tracking-wider">Version</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-warm-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-warm-gray-500 uppercase tracking-wider">Certified At</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-warm-gray-500 uppercase tracking-wider">Latest</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-warm-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody>
              {versions.map((v: VersionSummary) => (
                <tr key={v.id} className="border-b border-warm-gray-100 hover:bg-warm-gray-100 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-charcoal-900">{v.versionLabel}</td>
                  <td className="px-5 py-3.5"><VersionBadge status={v.status} /></td>
                  <td className="px-5 py-3.5 text-warm-gray-500 text-xs">{v.certifiedAt ? new Date(v.certifiedAt).toLocaleDateString() : '—'}</td>
                  <td className="px-5 py-3.5">
                    {v.isLatest && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Latest</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/dashboard/standards/${params.id}/versions/${v.id}`} className="flex items-center gap-1 text-xs text-brand-red font-medium hover:underline">
                        <Edit size={13} /> Edit Content
                      </Link>
                      <button onClick={() => setDeleteTarget(v)} className="p-1.5 text-warm-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Version" message={`Delete "${deleteTarget?.versionLabel}"? All sections inside will also be deleted.`} isLoading={isDeleting} />
    </>
  );
}
