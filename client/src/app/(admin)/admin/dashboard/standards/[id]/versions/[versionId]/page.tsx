'use client';

import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, ChevronRight, ChevronDown, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmDialog } from '@/components/ui/Modal';
import TiptapEditor from '@/components/editor/TiptapEditor';
import { Input } from '@/components/ui/Input';
import { VersionBadge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Button';
import { Section, TiptapDocument } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';
import { useCreateSectionMutation, useDeleteSectionMutation, useGetSectionsQuery, useGetVersionByIdQuery, useUpdateSectionMutation } from '@/store/api/versionsApi';

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function SectionTreeItem({
  section,
  allSections,
  activeId,
  onSelect,
  onDelete,
  depth = 0,
}: {
  section: Section;
  allSections: Section[];
  activeId: string | null;
  onSelect: (s: Section) => void;
  onDelete: (s: Section) => void;
  depth?: number;
}) {
  const children = allSections.filter((s) => s.parentId === section.id).sort((a, b) => a.sortOrder - b.sortOrder);
  const [expanded, setExpanded] = useState(true);

  return (
    <div>
      <div
        className={[
          'group flex items-center gap-1 px-2 py-1.5 rounded-lg cursor-pointer text-sm transition-colors select-none',
          activeId === section.id
            ? 'bg-brand-red/10 text-brand-red font-medium'
            : 'text-charcoal-700 hover:bg-warm-gray-100',
        ].join(' ')}
        style={{ paddingLeft: `${0.5 + depth * 1.25}rem` }}
      >
        <button onClick={() => setExpanded((v) => !v)} className="shrink-0 w-4 h-4 flex items-center justify-center">
          {children.length > 0
            ? (expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />)
            : <span className="w-4" />}
        </button>
        <span className="flex-1 truncate" onClick={() => onSelect(section)}>
          <span className="font-mono text-xs mr-1.5 opacity-60">{section.number}</span>
          {section.title}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(section); }}
          className="opacity-0 group-hover:opacity-100 p-0.5 text-warm-gray-500 hover:text-red-500 transition-all"
        >
          <Trash2 size={12} />
        </button>
      </div>
      {expanded && children.map((child) => (
        <SectionTreeItem key={child.id} section={child} allSections={allSections} activeId={activeId} onSelect={onSelect} onDelete={onDelete} depth={depth + 1} />
      ))}
    </div>
  );
}

/* ──────────────── Main editor page ──────────────── */
export default function VersionEditorPage() {
  const params = useParams<{ id: string; versionId: string }>();

  const { data: versionData, isLoading: versionLoading } = useGetVersionByIdQuery(params.versionId);
  const { data: sectionsData, isLoading: sectionsLoading } = useGetSectionsQuery(params.versionId);
  const [createSection, { isLoading: isCreating }] = useCreateSectionMutation();
  const [updateSection, { isLoading: isSaving }] = useUpdateSectionMutation();
  const [deleteSection, { isLoading: isDeleting }] = useDeleteSectionMutation();

  const version = versionData?.data;
  const allSections = [...(sectionsData?.data ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  const rootSections = allSections.filter((s) => !s.parentId);

  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [editorContent, setEditorContent] = useState<TiptapDocument | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Section | null>(null);
  const [showNewSection, setShowNewSection] = useState(false);
  const [newSection, setNewSection] = useState({ number: '', title: '', parentId: '' });

  // Auto-select first section on load
  useEffect(() => {
    if (allSections.length > 0 && !activeSection) {
      setActiveSection(allSections[0]);
      setEditorContent(allSections[0].content);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSections.length]);

  const handleSelectSection = (section: Section) => {
    setActiveSection(section);
    setEditorContent(section.content);
  };

  // Debounced auto-save
  const debouncedContent = useDebounce(editorContent, 1500);

  const doSave = useCallback(async (content: TiptapDocument, sectionId: string) => {
    try {
      await updateSection({ id: sectionId, data: { content } }).unwrap();
    } catch { /* silent on auto-save */ }
  }, [updateSection]);

  useEffect(() => {
    if (debouncedContent && activeSection) {
      doSave(debouncedContent, activeSection.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedContent]);

  const handleManualSave = async () => {
    if (!activeSection || !editorContent) return;
    try {
      await updateSection({ id: activeSection.id, data: { content: editorContent } }).unwrap();
      toast.success('Saved!');
    } catch {
      toast.error('Failed to save');
    }
  };

  const handleCreateSection = async () => {
    if (!newSection.number.trim() || !newSection.title.trim()) { toast.error('Number and title are required'); return; }
    try {
      const slug = `${newSection.number.replace(/\./g, '-')}-${slugify(newSection.title)}`;
      const result = await createSection({
        versionId: params.versionId,
        data: {
          number: newSection.number,
          title: newSection.title,
          slug,
          parentId: newSection.parentId || null,
          sortOrder: allSections.length,
          content: { type: 'doc', content: [{ type: 'paragraph' }] },
        },
      }).unwrap();
      toast.success('Section created');
      setShowNewSection(false);
      setNewSection({ number: '', title: '', parentId: '' });
      setActiveSection(result.data);
      setEditorContent(result.data.content);
    } catch (err: unknown) {
      toast.error((err as { data?: { message?: string } })?.data?.message || 'Failed to create section');
    }
  };

  const handleDeleteSection = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSection(deleteTarget.id).unwrap();
      toast.success('Section deleted');
      if (activeSection?.id === deleteTarget.id) { setActiveSection(null); setEditorContent(null); }
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete section');
    }
  };

  if (versionLoading || sectionsLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" className="text-brand-red" />
      </div>
    );
  }

  return (
    /* Full-height split pane — break out of the main padding by using negative margins */
    <div className="flex flex-col -m-6 h-[calc(100vh-65px)]">

      {/* Top sub-bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-warm-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          <Link href={`/admin/dashboard/standards/${params.id}/versions`} className="flex items-center gap-1.5 text-sm text-warm-gray-500 hover:text-charcoal-900 transition-colors">
            <ArrowLeft size={15} /> Back
          </Link>
          <span className="text-warm-gray-300">·</span>
          <span className="text-sm font-semibold text-charcoal-900">{version?.standard?.title}</span>
          <span className="text-sm text-warm-gray-500">{version?.versionLabel}</span>
          {version && <VersionBadge status={version.status} />}
        </div>
        <div className="flex items-center gap-2">
          {isSaving && (
            <span className="flex items-center gap-1.5 text-xs text-warm-gray-500">
              <Loader2 size={13} className="animate-spin" /> Auto-saving…
            </span>
          )}
          <button
            onClick={handleManualSave}
            disabled={!activeSection || isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-brand-red text-white rounded-lg hover:bg-brand-red-dark transition-colors disabled:opacity-50"
          >
            <Save size={14} /> Save
          </button>
        </div>
      </div>

      {/* Split content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Section Tree */}
        <div className="w-64 flex flex-col bg-white border-r border-warm-gray-200 overflow-y-auto shrink-0">
          <div className="flex items-center justify-between px-3 py-3 border-b border-warm-gray-200">
            <span className="text-xs font-semibold text-warm-gray-500 uppercase tracking-wider">Sections</span>
            <button onClick={() => setShowNewSection((v) => !v)} className="p-1 text-warm-gray-500 hover:text-brand-red transition-colors rounded" title="Add section">
              <Plus size={16} />
            </button>
          </div>

          {/* New section inline form */}
          {showNewSection && (
            <div className="p-3 border-b border-warm-gray-200 bg-[#fafaf9] flex flex-col gap-2">
              <Input
                placeholder="Number (e.g. 3.0)"
                value={newSection.number}
                onChange={(e) => setNewSection((s) => ({ ...s, number: e.target.value }))}
              />
              <Input
                placeholder="Title"
                value={newSection.title}
                onChange={(e) => setNewSection((s) => ({ ...s, title: e.target.value }))}
              />
              <select
                value={newSection.parentId}
                onChange={(e) => setNewSection((s) => ({ ...s, parentId: e.target.value }))}
                className="w-full text-xs border border-warm-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-red"
              >
                <option value="">No parent (top level)</option>
                {rootSections.map((s) => (
                  <option key={s.id} value={s.id}>{s.number} {s.title}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <button onClick={handleCreateSection} disabled={isCreating} className="flex-1 py-1.5 text-xs font-medium bg-brand-red text-white rounded-lg hover:bg-brand-red-dark transition-colors">
                  {isCreating ? 'Creating…' : 'Create'}
                </button>
                <button onClick={() => setShowNewSection(false)} className="flex-1 py-1.5 text-xs font-medium border border-warm-gray-300 text-[#555] rounded-lg hover:bg-warm-gray-100 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 py-2 px-1">
            {allSections.length === 0 ? (
              <p className="text-xs text-warm-gray-500 text-center py-6 px-3">No sections yet. Click + to add one.</p>
            ) : (
              rootSections.map((section) => (
                <SectionTreeItem
                  key={section.id}
                  section={section}
                  allSections={allSections}
                  activeId={activeSection?.id ?? null}
                  onSelect={handleSelectSection}
                  onDelete={setDeleteTarget}
                />
              ))
            )}
          </div>
        </div>

        {/* Right: Tiptap editor */}
        <div className="flex-1 overflow-y-auto p-6 bg-warm-gray-100">
          {!activeSection ? (
            <div className="flex items-center justify-center h-full text-sm text-warm-gray-500">
              Select a section from the left to start editing
            </div>
          ) : (
            <div className="mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-mono text-warm-gray-500 bg-warm-gray-200 px-2 py-0.5 rounded">{activeSection.number}</span>
                <h2 className="text-lg font-bold text-charcoal-900">{activeSection.title}</h2>
              </div>
              <TiptapEditor
                content={editorContent}
                onChange={(content) => setEditorContent(content)}
                placeholder="Start writing section content…"
              />
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteSection}
        title="Delete Section"
        message={`Delete "${deleteTarget?.number} ${deleteTarget?.title}"? Child sections will also be deleted.`}
        isLoading={isDeleting}
      />
    </div>
  );
}
