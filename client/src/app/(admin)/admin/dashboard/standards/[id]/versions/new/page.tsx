'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useGetStandardByIdQuery } from '@/store/api/standardsApi';
import { useCreateVersionMutation } from '@/store/api/versionsApi';
import { CreateVersionInput, VersionStatus } from '@/types';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';
import { toIsoOrNull } from '@/lib/utils';

const STATUS_OPTIONS: { value: VersionStatus; label: string }[] = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLIC_CONSULTATION', label: 'Public Consultation' },
  { value: 'CERTIFIED', label: 'Certified' },
];

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function NewVersionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: standardData } = useGetStandardByIdQuery(params.id);
  const [createVersion, { isLoading }] = useCreateVersionMutation();

  const [form, setForm] = useState<CreateVersionInput>({
    versionLabel: '',
    slug: '',
    status: 'DRAFT',
    isLatest: false,
    certifiedAt: null,
    consultationStartDate: null,
    consultationEndDate: null,
  });
  const [slugEdited, setSlugEdited] = useState(false);

  const set = (key: keyof CreateVersionInput, value: unknown) => {
    setForm((f: CreateVersionInput) => {
      const next = { ...f, [key]: value };
      if (key === 'versionLabel' && !slugEdited) next.slug = slugify(value as string);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.versionLabel.trim() || !form.slug.trim()) {
      toast.error('Label and slug are required');
      return;
    }
    try {
      const payload: CreateVersionInput = {
        ...form,
        certifiedAt: toIsoOrNull(form.certifiedAt),
        consultationStartDate: toIsoOrNull(form.consultationStartDate),
        consultationEndDate: toIsoOrNull(form.consultationEndDate),
      };
      const result = await createVersion({
        standardId: params.id,
        data: payload,
        standardSlug: standardData?.data?.slug ?? '',
      }).unwrap();
      toast.success('Version created!');
      router.push(`/admin/dashboard/standards/${params.id}/versions/${result.data.id}`);
    } catch (err: unknown) {
      toast.error(
        (err as { data?: { message?: string } })?.data?.message || 'Failed to create version'
      );
    }
  };

  return (
    <>
      <div className="mb-6">
        <BackButton fallbackHref={`/admin/dashboard/standards/${params.id}/versions`} />
      </div>

      <div className="bg-white rounded-xl border border-warm-gray-200 p-6">
        <h2 className="text-lg font-bold text-charcoal-900 mb-6">Create Version</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Version Label"
              value={form.versionLabel}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                set('versionLabel', e.target.value)
              }
              placeholder="v1.0.0"
              required
            />
            <Input
              label="Slug"
              value={form.slug}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSlugEdited(true);
                set('slug', e.target.value);
              }}
              placeholder="v1-0-0"
              hint="Auto-generated"
              required
            />
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <Label>Status</Label>
            <div className="flex gap-2 flex-wrap">
              {STATUS_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  size="sm"
                  variant={form.status === opt.value ? 'primary' : 'outline'}
                  onClick={() => set('status', opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Conditional date fields */}
          {form.status === 'PUBLIC_CONSULTATION' && (
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Consultation Start"
                type="date"
                value={form.consultationStartDate ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  set('consultationStartDate', e.target.value || null)
                }
              />
              <Input
                label="Consultation End"
                type="date"
                value={form.consultationEndDate ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  set('consultationEndDate', e.target.value || null)
                }
              />
            </div>
          )}
          {form.status === 'CERTIFIED' && (
            <Input
              label="Certified At"
              type="date"
              value={form.certifiedAt ?? ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                set('certifiedAt', e.target.value || null)
              }
            />
          )}

          {/* isLatest toggle */}
          <div className="flex items-center gap-2.5">
            <Switch
              id="isLatest"
              checked={form.isLatest}
              onCheckedChange={(checked) => set('isLatest', checked)}
            />
            <div>
              <Label htmlFor="isLatest" className="cursor-pointer">
                Mark as Latest
              </Label>
              <p className="text-xs text-warm-gray-500">
                This version shown by default on public site
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" isLoading={isLoading}>
              Create & Add Sections
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
