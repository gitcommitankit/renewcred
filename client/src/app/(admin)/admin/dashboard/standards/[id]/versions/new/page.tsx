'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGetStandardByIdQuery } from '@/store/api/standardsApi';
import { useCreateVersionMutation } from '@/store/api/versionsApi';
import { CreateVersionInput, VersionStatus } from '@/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

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
      const result = await createVersion({
        standardId: params.id,
        data: form,
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
      <Link
        href={`/admin/dashboard/standards/${params.id}/versions`}
        className="inline-flex items-center gap-1.5 text-sm text-warm-gray-500 hover:text-charcoal-900 mb-6 transition-colors"
      >
        <ArrowLeft size={15} /> {standardData?.data?.title} — Versions
      </Link>

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
            <label className="text-sm font-medium text-charcoal-900">Status</label>
            <div className="flex gap-2 flex-wrap">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set('status', opt.value)}
                  className={[
                    'px-4 py-2 rounded-lg text-sm font-medium border transition-colors',
                    form.status === opt.value
                      ? 'bg-brand-red text-white border-brand-red'
                      : 'bg-white text-[#555] border-warm-gray-300 hover:border-charcoal-900',
                  ].join(' ')}
                >
                  {opt.label}
                </button>
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
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <div
              onClick={() => set('isLatest', !form.isLatest)}
              className={`relative w-10 h-5 rounded-full transition-colors ${form.isLatest ? 'bg-brand-red' : 'bg-warm-gray-300'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isLatest ? 'translate-x-5' : ''}`}
              />
            </div>
            <div>
              <span className="text-sm font-medium text-charcoal-900">Mark as Latest</span>
              <p className="text-xs text-warm-gray-500">
                This version shown by default on public site
              </p>
            </div>
          </label>

          <div className="flex gap-3 pt-2">
            <Button type="submit" isLoading={isLoading}>
              Create & Add Sections
            </Button>
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
