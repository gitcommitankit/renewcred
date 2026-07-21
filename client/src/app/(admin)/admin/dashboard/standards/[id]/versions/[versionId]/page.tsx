'use client';

import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, ChevronRight, ChevronDown, Save, Loader2, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ConfirmDialog } from '@/components/ui/Modal';
import TiptapEditor from '@/components/editor/TiptapEditor';
import { Input } from '@/components/ui/Input';
import { VersionBadge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Button';
import { Section, TiptapDocument, TiptapNode } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';
import {
  useCreateSectionMutation,
  useDeleteSectionMutation,
  useGetVersionByIdQuery,
  useUpdateSectionMutation,
  useAutoSaveSectionMutation,
  useReorderSectionsMutation,
} from '@/store/api/versionsApi';

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function SortableTreeItem({
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
  const children = allSections
    .filter((s) => s.parentId === section.id)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const [expanded, setExpanded] = useState(true);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    paddingLeft: `${0.5 + depth * 1.25}rem`,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={[
          'group flex items-center gap-1 py-1.5 pr-2 rounded-lg cursor-pointer text-sm transition-colors select-none',
          activeId === section.id
            ? 'bg-brand-red/10 text-brand-red font-medium'
            : 'text-charcoal-700 hover:bg-warm-gray-100',
        ].join(' ')}
      >
        {/* Drag handle */}
        <span
          {...attributes}
          {...listeners}
          className="shrink-0 active:cursor-grabbing text-warm-gray-400 hover:text-charcoal-700 touch-none"
        >
          <GripVertical size={13} />
        </span>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="shrink-0 w-4 h-4 flex items-center justify-center"
        >
          {children.length > 0
            ? expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />
            : <span className="w-4" />}
        </button>

        {/* Section label */}
        <span className="flex-1 truncate" onClick={() => onSelect(section)}>
          <span className="font-mono text-xs mr-1.5 opacity-60">{section.number}</span>
          {section.title}
        </span>

        {/* Delete */}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(section); }}
          className="opacity-0 group-hover:opacity-100 p-0.5 text-warm-gray-500 hover:text-red-500 transition-all"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {expanded && children.map((child) => (
        <SortableTreeItem
          key={child.id}
          section={child}
          allSections={allSections}
          activeId={activeId}
          onSelect={onSelect}
          onDelete={onDelete}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

export default function VersionEditorPage() {
  const params = useParams<{ id: string; versionId: string }>();

  const { data: versionData, isLoading: versionLoading } = useGetVersionByIdQuery(params.versionId);
  const [createSection, { isLoading: isCreating }] = useCreateSectionMutation();
  const [updateSection, { isLoading: isSaving }] = useUpdateSectionMutation();
  const [autoSaveSection] = useAutoSaveSectionMutation();
  const [deleteSection, { isLoading: isDeleting }] = useDeleteSectionMutation();
  const [reorderSections] = useReorderSectionsMutation();

  const version = versionData?.data;
  const allSections = [...(version?.sections ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  const rootSections = allSections.filter((s) => !s.parentId);

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const activeSection = allSections.find((s) => s.id === activeSectionId) ?? null;
  const [editorKey, setEditorKey] = useState(0);
  const [editorContent, setEditorContent] = useState<TiptapDocument | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Section | null>(null);
  const [showNewSection, setShowNewSection] = useState(false);
  const [newSection, setNewSection] = useState({ title: '', parentId: '' });

  const buildEditorContent = useCallback((section: Section): TiptapDocument => {
    const base = section.content as TiptapDocument | null;
    const bodyNodes = base?.content ?? [];
    return {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: section.title }] },
        ...bodyNodes,
      ],
    };
  }, []);

  const splitEditorContent = useCallback((doc: TiptapDocument): { title: string; content: TiptapDocument } => {
    const nodes = doc.content ?? [];
    const [first, ...rest] = nodes;
    const title =
      first?.type === 'heading'
        ? (first.content ?? []).map((n: TiptapNode) => n.text ?? '').join('')
        : '';
    return {
      title: title.trim(),
      content: { type: 'doc', content: rest },
    };
  }, []);

  useEffect(() => {
    if (allSections.length > 0 && !activeSectionId) {
      const first = allSections[0];
      setActiveSectionId(first.id);
      setEditorContent(buildEditorContent(first));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!allSections.length]);

  useEffect(() => {
    if (activeSectionId && allSections.length > 0) {
      const stillExists = allSections.some((s) => s.id === activeSectionId);
      if (!stillExists) {
        setActiveSectionId(null);
        setEditorContent(null);
        setEditorKey((k) => k + 1);
      }
    }
  }, [allSections, activeSectionId]);

  const handleSelectSection = (section: Section) => {
    setActiveSectionId(section.id);
    setEditorContent(buildEditorContent(section));
    setEditorKey((k) => k + 1);
  };

  const debouncedContent = useDebounce(editorContent, 1500);

  const doSave = useCallback(async (doc: TiptapDocument, sectionId: string) => {
    const { title, content } = splitEditorContent(doc);
    try {
      await autoSaveSection({ id: sectionId, versionId: params.versionId, data: { content, title } }).unwrap();
    } catch { /* silent on auto-save */ }
  }, [autoSaveSection, params.versionId, splitEditorContent]);

  useEffect(() => {
    if (debouncedContent && activeSectionId) {
      doSave(debouncedContent, activeSectionId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedContent]);

  const handleManualSave = async () => {
    if (!activeSectionId || !editorContent) return;
    const { title, content } = splitEditorContent(editorContent);
    if (!title.trim()) return;
    try {
      await updateSection({ id: activeSectionId, versionId: params.versionId, data: { content, title }, standardSlug: version?.standard?.slug ?? '' }).unwrap();
      toast.success('Saved!');
    } catch {
      toast.error('Failed to save');
    }
  };

  const handleCreateSection = async () => {
    if (!newSection.title.trim()) {
      toast.error('Title is required');
      return;
    }
    try {
      const selectedParentId = newSection.parentId || null;
      const siblings = allSections.filter((s) => s.parentId === selectedParentId);
      const sortOrder = siblings.length > 0 ? Math.max(...siblings.map((s) => s.sortOrder)) + 1 : allSections.length;

      let generatedNumber = '';
      if (!selectedParentId) {
        generatedNumber = `${siblings.length + 1}.0`;
      } else {
        const parent = allSections.find(s => s.id === selectedParentId);
        const parentBase = parent?.number.endsWith('.0') ? parent.number.slice(0, -2) : parent?.number;
        generatedNumber = `${parentBase}.${siblings.length + 1}`;
      }

      const slug = `${generatedNumber.replace(/\./g, '-')}-${slugify(newSection.title)}`;

      const result = await createSection({
        versionId: params.versionId,
        standardSlug: version?.standard?.slug ?? '',
        data: {
          number: generatedNumber,
          title: newSection.title,
          slug,
          parentId: selectedParentId,
          sortOrder,
          content: { type: 'doc', content: [{ type: 'paragraph' }] },
        },
      }).unwrap();
      toast.success('Section created');
      setShowNewSection(false);
      setNewSection({ title: '', parentId: '' });
      setActiveSectionId(result.data.id);
      setEditorContent(buildEditorContent(result.data));
      setEditorKey((k) => k + 1);
    } catch (err: unknown) {
      toast.error((err as { data?: { message?: string } })?.data?.message || 'Failed to create section');
    }
  };

  const handleDeleteSection = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSection({ id: deleteTarget.id, versionId: params.versionId, standardSlug: version?.standard?.slug ?? '' }).unwrap();
      toast.success('Section deleted');
      if (activeSectionId === deleteTarget.id) {
        setActiveSectionId(null);
        setEditorContent(null);
        setEditorKey((k) => k + 1);
      }
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete section');
    }
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const computeNumbers = (sections: Section[], parentId: string | null, prefix: string): Map<string, string> => {
    const result = new Map<string, string>();
    const siblings = sections.filter((s) => s.parentId === parentId);
    siblings.forEach((s, i) => {
      const basePrefix = prefix ? `${prefix}.${i + 1}` : `${i + 1}`;
      const num = prefix ? basePrefix : `${basePrefix}.0`;
      result.set(s.id, num);
      const childNums = computeNumbers(sections, s.id, basePrefix);
      childNums.forEach((v, k) => result.set(k, v));
    });
    return result;
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = allSections.findIndex((s) => s.id === active.id);
    const newIndex = allSections.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...allSections];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    const numbers = computeNumbers(reordered, null, '');

    const payload = reordered.map((s, i) => ({
      id: s.id,
      sortOrder: i,
      parentId: s.parentId ?? undefined,
      number: numbers.get(s.id) ?? s.number,
    }));

    try {
      await reorderSections({ versionId: params.versionId, sections: payload, standardSlug: version?.standard?.slug ?? '' }).unwrap();
    } catch {
      toast.error('Failed to reorder sections');
    }
  };

  if (versionLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" className="text-brand-red" />
      </div>
    );
  }

  return (
    <div className="flex flex-col -m-6 h-dashboard md:h-dashboard">
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

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        <div className="w-full md:w-64 flex flex-col bg-white border-b md:border-b-0 md:border-r border-warm-gray-200 overflow-y-auto shrink-0 md:max-h-full max-h-40vh">
          <div className="flex items-center justify-between px-3 py-3 border-b border-warm-gray-200">
            <span className="text-xs font-semibold text-warm-gray-500 uppercase tracking-wider">Sections</span>
            <button onClick={() => setShowNewSection((v) => !v)} className="p-1 text-warm-gray-500 hover:text-brand-red transition-colors rounded" title="Add section">
              <Plus size={16} />
            </button>
          </div>

          {showNewSection && (
            <div className="p-3 border-b border-warm-gray-200 bg-warm-gray-100 flex flex-col gap-2">

              <Input
                placeholder="Title"
                value={newSection.title}
                onChange={(e) => setNewSection((s) => ({ ...s, title: e.target.value }))}
              />
              <select
                value={newSection.parentId}
                onChange={(e) => setNewSection((s) => ({ ...s, parentId: e.target.value }))}
                className="w-full text-xs border border-warm-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-red bg-white"
              >
                <option value="">No parent (top level)</option>
                {allSections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {'  '.repeat(s.parentId ? (allSections.find(p => p.id === s.parentId)?.parentId ? 2 : 1) : 0)}{s.number} {s.title}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button onClick={handleCreateSection} disabled={isCreating} className="flex-1 py-1.5 text-xs font-medium bg-brand-red text-white rounded-lg hover:bg-brand-red-dark transition-colors">
                  {isCreating ? 'Creating…' : 'Create'}
                </button>
                <button onClick={() => setShowNewSection(false)} className="flex-1 py-1.5 text-xs font-medium border border-warm-gray-300 text-charcoal-600 rounded-lg hover:bg-warm-gray-100 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 py-2 px-1">
            {allSections.length === 0 ? (
              <p className="text-xs text-warm-gray-500 text-center py-6 px-3">No sections yet. Click + to add one.</p>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={allSections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  {rootSections.map((section) => (
                    <SortableTreeItem
                      key={section.id}
                      section={section}
                      allSections={allSections}
                      activeId={activeSection?.id ?? null}
                      onSelect={handleSelectSection}
                      onDelete={setDeleteTarget}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-warm-gray-100">
          {!activeSection ? (
            <div className="flex items-center justify-center h-full text-sm text-warm-gray-500">
              Select a section from the left to start editing
            </div>
          ) : (
            <div className="mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-mono text-warm-gray-500 bg-warm-gray-200 px-2 py-1 rounded shrink-0">{activeSection.number}</span>
                <h2 className="flex-1 text-lg font-bold text-charcoal-900 px-1 py-0.5 select-none">{activeSection.title}</h2>
              </div>
              <TiptapEditor
                key={editorKey}
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
