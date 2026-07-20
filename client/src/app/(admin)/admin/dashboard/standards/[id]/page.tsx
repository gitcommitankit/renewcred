'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { Input, Textarea } from '@/components/ui/Input';
import { Button, Spinner } from '@/components/ui/Button';
import { useGetStandardByIdQuery, useUpdateStandardMutation } from '@/store/api/standardsApi';
import { UpdateStandardInput } from '@/types';

export default function EditStandardPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading } = useGetStandardByIdQuery(params.id);
  const [updateStandard, { isLoading: isSaving }] = useUpdateStandardMutation();
  const [form, setForm] = useState<UpdateStandardInput>({});

  useEffect(() => {
    if (data?.data) {
      const s = data.data;
      setForm({ title: s.title, slug: s.slug, description: s.description, icon: s.icon ?? '', sortOrder: s.sortOrder, isPublished: s.isPublished });
    }
  }, [data]);

  const set = (key: keyof UpdateStandardInput, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateStandard({ id: params.id, data: form }).unwrap();
      toast.success('Standard updated!');
    } catch {
      toast.error('Failed to update standard');
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" className="text-brand-red" /></div>;

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/dashboard/standards" className="inline-flex items-center gap-1.5 text-sm text-warm-gray-500 hover:text-charcoal-900 transition-colors">
          <ArrowLeft size={15} /> Back
        </Link>
        <span className="text-warm-gray-300">·</span>
        <Link href={`/admin/dashboard/standards/${params.id}/versions`} className="text-sm text-blue-600 hover:underline">Manage Versions →</Link>
      </div>
      <div className="bg-white rounded-xl border border-warm-gray-200 p-6">
        <h2 className="text-lg font-bold text-charcoal-900 mb-6">Edit Standard</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Title" value={form.title ?? ''} onChange={(e) => set('title', e.target.value)} required />
            <Input label="Icon (emoji)" value={form.icon ?? ''} onChange={(e) => set('icon', e.target.value)} placeholder="🔋" />
          </div>
          <Input label="Slug" value={form.slug ?? ''} onChange={(e) => set('slug', e.target.value)} hint="Changing this will break existing public URLs" required />
          <Textarea label="Description" value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Sort Order" type="number" value={form.sortOrder ?? 0} onChange={(e) => set('sortOrder', Number(e.target.value))} />
            <div className="flex flex-col gap-1.5 justify-end">
              <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={form.isPublished ?? false}
                    onChange={(e) => set('isPublished', e.target.checked)}
                    className="sr-only peer"
                    aria-label="Published"
                  />
                  <div className={`w-10 h-5 rounded-full transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-brand-red ${form.isPublished ? 'bg-brand-red' : 'bg-warm-gray-300'}`}></div>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isPublished ? 'translate-x-5' : ''}`} />
                </div>
                <span className="text-sm font-medium text-charcoal-900 group-hover:text-black">Published</span>
              </label>
              <p className="text-xs text-warm-gray-500">Visible on public website</p>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" isLoading={isSaving}>Save Changes</Button>
            <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </div>
    </>
  );
}
