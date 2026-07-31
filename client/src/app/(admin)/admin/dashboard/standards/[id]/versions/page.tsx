'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit, Trash2, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGetStandardByIdQuery } from '@/store/api/standardsApi';
import { useDeleteVersionMutation, useUpdateVersionMutation } from '@/store/api/versionsApi';
import { VersionSummary, VersionStatus, UpdateVersionInput } from '@/types';
import { Button, Spinner } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';
import { Badge, VersionBadge } from '@/components/ui/Badge';
import { ConfirmDialog, Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { toIsoOrNull } from '@/lib/utils';

const STATUS_OPTIONS: { value: VersionStatus; label: string }[] = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLIC_CONSULTATION', label: 'Public Consultation' },
  { value: 'CERTIFIED', label: 'Certified' },
];

export default function VersionsListPage() {
  const params = useParams<{ id: string }>();
  const {
    data: standardData,
    isLoading: standardLoading,
    refetch,
  } = useGetStandardByIdQuery(params.id);
  const standard = standardData?.data;
  const [deleteVersion, { isLoading: isDeleting }] = useDeleteVersionMutation();
  const [updateVersion, { isLoading: isUpdating }] = useUpdateVersionMutation();
  const [deleteTarget, setDeleteTarget] = useState<VersionSummary | null>(null);
  const [editTarget, setEditTarget] = useState<VersionSummary | null>(null);

  const [editForm, setEditForm] = useState<UpdateVersionInput>({
    versionLabel: '',
    slug: '',
    status: 'DRAFT',
    isLatest: false,
    certifiedAt: null,
    consultationStartDate: null,
    consultationEndDate: null,
  });

  const versions = standard?.versions ?? [];
  const isLoading = standardLoading;

  const handleOpenEdit = (v: VersionSummary) => {
    setEditTarget(v);
    setEditForm({
      versionLabel: v.versionLabel,
      slug: v.slug,
      status: v.status,
      isLatest: v.isLatest,
      certifiedAt: v.certifiedAt ? v.certifiedAt.split('T')[0] : null,
      consultationStartDate: v.consultationStartDate ? v.consultationStartDate.split('T')[0] : null,
      consultationEndDate: v.consultationEndDate ? v.consultationEndDate.split('T')[0] : null,
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    try {
      const payload: UpdateVersionInput = {
        ...editForm,
        certifiedAt: toIsoOrNull(editForm.certifiedAt),
        consultationStartDate: toIsoOrNull(editForm.consultationStartDate),
        consultationEndDate: toIsoOrNull(editForm.consultationEndDate),
      };
      await updateVersion({
        id: editTarget.id,
        data: payload,
        standardSlug: standard?.slug ?? '',
        standardId: params.id,
        // Capture the slug before the edit so we can revalidate the old ISR path
        // if the user changed it (prevents stale HTML lingering on the old URL)
        oldVersionSlug: editTarget.slug,
      }).unwrap();
      await refetch();
      toast.success('Version updated!');
      setEditTarget(null);
    } catch (err: unknown) {
      toast.error(
        (err as { data?: { message?: string } })?.data?.message || 'Failed to update version'
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteVersion({
        id: deleteTarget.id,
        standardSlug: standard?.slug ?? '',
        versionSlug: deleteTarget.slug,
        standardId: params.id,
      }).unwrap();
      await refetch();
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
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(v)}
                        className="flex items-center gap-1 text-xs text-warm-gray-600 hover:text-charcoal-900"
                        title="Edit Version Settings"
                      >
                        <Settings size={13} /> Settings
                      </Button>
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

      {/* Edit Version Modal */}
      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title={`Edit Version Settings (${editTarget?.versionLabel})`}
        size="lg"
      >
        <form onSubmit={handleUpdate} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Version Label"
              value={editForm.versionLabel ?? ''}
              onChange={(e) => setEditForm((f) => ({ ...f, versionLabel: e.target.value }))}
              required
            />
            <Input
              label="Slug"
              value={editForm.slug ?? ''}
              onChange={(e) => setEditForm((f) => ({ ...f, slug: e.target.value }))}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Status</Label>
            <div className="flex gap-2 flex-wrap">
              {STATUS_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  size="sm"
                  variant={editForm.status === opt.value ? 'primary' : 'outline'}
                  onClick={() => setEditForm((f) => ({ ...f, status: opt.value }))}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          {editForm.status === 'PUBLIC_CONSULTATION' && (
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Consultation Start"
                type="date"
                value={editForm.consultationStartDate ?? ''}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    consultationStartDate: e.target.value || null,
                  }))
                }
              />
              <Input
                label="Consultation End"
                type="date"
                value={editForm.consultationEndDate ?? ''}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    consultationEndDate: e.target.value || null,
                  }))
                }
              />
            </div>
          )}

          {editForm.status === 'CERTIFIED' && (
            <Input
              label="Certified At"
              type="date"
              value={editForm.certifiedAt ?? ''}
              onChange={(e) => setEditForm((f) => ({ ...f, certifiedAt: e.target.value || null }))}
            />
          )}

          <div className="flex items-center gap-2.5 pt-2">
            <Switch
              id="editIsLatest"
              checked={editForm.isLatest ?? false}
              onCheckedChange={(checked) => setEditForm((f) => ({ ...f, isLatest: checked }))}
            />
            <div>
              <Label htmlFor="editIsLatest" className="cursor-pointer">
                Mark as Latest Version
              </Label>
              <p className="text-xs text-warm-gray-500">
                Will automatically unmark any previously latest version
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-warm-gray-200 mt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEditTarget(null)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isUpdating}>
              Save Settings
            </Button>
          </div>
        </form>
      </Modal>

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
