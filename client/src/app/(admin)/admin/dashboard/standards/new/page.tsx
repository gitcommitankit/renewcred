'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import { useCreateStandardMutation } from '@/store/api/standardsApi';
import { CreateStandardInput } from '@/types';

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function NewStandardPage() {
  const router = useRouter();
  const [createStandard, { isLoading }] = useCreateStandardMutation();
  const [form, setForm] = useState<CreateStandardInput>({
    title: '',
    slug: '',
    description: '',
    icon: '',
    sortOrder: 0,
    isPublished: false,
  });
  const [slugEdited, setSlugEdited] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateStandardInput, string>>>({});

  const set = (key: keyof CreateStandardInput, value: unknown) => {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === 'title' && !slugEdited) next.slug = slugify(value as string);
      return next;
    });
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.slug.trim()) e.slug = 'Slug is required';
    if (!form.description.trim()) e.description = 'Description is required';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    try {
      const result = await createStandard(form).unwrap();
      toast.success('Standard created!');
      router.push(`/admin/dashboard/standards/${result.data.id}/versions`);
    } catch (err: unknown) {
      toast.error(
        (err as { data?: { message?: string } })?.data?.message || 'Failed to create standard'
      );
    }
  };

  const handleBack = () => {
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push('/admin/dashboard/standards');
    }
  };

  return (
    <>
      <div className="mb-6">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleBack}
          leftIcon={<ArrowLeft size={15} />}
        >
          Back
        </Button>
      </div>
      <div className="bg-white rounded-xl border border-warm-gray-200 p-6">
        <h2 className="text-lg font-bold text-charcoal-900 mb-6">Create Standard</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Title"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              error={errors.title}
              placeholder="e.g. Electric Vehicles"
              required
            />
            <Input
              label="Icon (emoji)"
              value={form.icon ?? ''}
              onChange={(e) => set('icon', e.target.value)}
              placeholder="🔋"
              hint="Optional — use an emoji"
            />
          </div>
          <Input
            label="Slug"
            value={form.slug}
            onChange={(e) => {
              setSlugEdited(true);
              set('slug', e.target.value);
            }}
            error={errors.slug}
            placeholder="electric-vehicles"
            hint="Auto-generated from title. Used in URLs."
            required
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            error={errors.description}
            placeholder="Write a brief description…"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Sort Order"
              type="number"
              value={form.sortOrder}
              onChange={(e) => set('sortOrder', Number(e.target.value))}
              hint="Lower = appears first"
            />
            <div className="flex flex-col gap-1.5 justify-end">
              <div className="flex items-center gap-2.5">
                <Switch
                  id="isPublished"
                  checked={form.isPublished}
                  onCheckedChange={(checked) => set('isPublished', checked)}
                />
                <Label htmlFor="isPublished" className="cursor-pointer">
                  Published
                </Label>
              </div>
              <p className="text-xs text-warm-gray-500">Visible on public website</p>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" isLoading={isLoading}>
              Create Standard
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
