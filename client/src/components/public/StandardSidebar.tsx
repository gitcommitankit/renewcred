'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronDown, ChevronUp, ExternalLink, MessageSquare } from 'lucide-react';
import type { Section, VersionSummary } from '@/types';

interface Props {
  standardSlug: string;
  versions: VersionSummary[];
  activeVersionId: string;
  sections: Section[];
}

function VersionStatusLabel({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    CERTIFIED: { label: 'Certified', className: 'bg-green-100 text-green-700' },
    PUBLIC_CONSULTATION: { label: 'Public Consultation', className: 'bg-amber-100 text-amber-700' },
    DRAFT: { label: 'Draft', className: 'bg-warm-gray-200 text-warm-gray-500' },
  };
  const cfg = map[status] ?? map['DRAFT'];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

function TocItem({
  section,
  allSections,
  activeId,
  search,
  depth = 0,
}: {
  section: Section;
  allSections: Section[];
  activeId: string | null;
  search: string;
  depth?: number;
}) {
  const children = allSections
    .filter((s) => s.parentId === section.id)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const titleMatch = section.title.toLowerCase().includes(search.toLowerCase());
  const childMatch = children.some((c) => c.title.toLowerCase().includes(search.toLowerCase()));
  if (search && !titleMatch && !childMatch) return null;

  const scrollTo = () => {
    const el = document.getElementById(`section-${section.id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div>
      <button
        onClick={scrollTo}
        className={[
          'w-full text-left flex items-baseline gap-2 py-1.5 rounded-md text-sm transition-colors',
          activeId === section.id
            ? 'text-brand-red font-semibold bg-brand-red/5'
            : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-warm-gray-100',
        ].join(' ')}
        style={{ paddingLeft: `${0.5 + depth * 1}rem` }}
      >
        <span className="font-mono text-xs text-warm-gray-400 shrink-0">{section.number}</span>
        <span className="leading-snug">{section.title}</span>
      </button>
      {children.map((child) => (
        <TocItem key={child.id} section={child} allSections={allSections} activeId={activeId} search={search} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function StandardSidebar({ standardSlug, versions, activeVersionId, sections }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [versionOpen, setVersionOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [consultationPopover, setConsultationPopover] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close version dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setVersionOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Scroll-spy with IntersectionObserver
  useEffect(() => {
    if (sections.length === 0) return;
    const observers: IntersectionObserver[] = [];
    sections.forEach((section) => {
      const el = document.getElementById(`section-${section.id}`);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(section.id); },
        { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [sections]);

  const activeVersion = versions.find((v) => v.id === activeVersionId);
  const rootSections = sections.filter((s) => !s.parentId).sort((a, b) => a.sortOrder - b.sortOrder);

  const handleVersionSelect = useCallback((version: VersionSummary) => {
    setVersionOpen(false);
    setConsultationPopover(null);
    router.push(`/standards/${standardSlug}/${version.slug}`);
  }, [router, standardSlug]);

  return (
    <aside className="flex flex-col gap-5">
      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search sections…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm border border-warm-gray-200 rounded-lg bg-warm-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-colors"
        />
      </div>

      {/* Version dropdown */}
      {versions.length > 0 && (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setVersionOpen((v) => !v)}
            className="w-full flex items-center justify-between px-3 py-2.5 border border-warm-gray-200 rounded-lg bg-white text-sm font-medium text-charcoal-900 hover:border-warm-gray-300 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold truncate">{activeVersion?.versionLabel ?? 'Select version'}</span>
              {activeVersion && <VersionStatusLabel status={activeVersion.status} />}
            </div>
            {versionOpen
              ? <ChevronUp size={15} className="shrink-0 text-warm-gray-500" />
              : <ChevronDown size={15} className="shrink-0 text-warm-gray-500" />}
          </button>

          {versionOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-warm-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
              {versions.map((version) => (
                <div key={version.id} className="relative">
                  <button
                    onClick={() => {
                      if (version.status === 'PUBLIC_CONSULTATION') {
                        setConsultationPopover(consultationPopover === version.id ? null : version.id);
                      } else {
                        handleVersionSelect(version);
                      }
                    }}
                    className={[
                      'w-full flex items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-warm-gray-100',
                      version.id === activeVersionId ? 'bg-warm-gray-100 font-semibold' : '',
                    ].join(' ')}
                  >
                    <div className="flex flex-col items-start gap-1">
                      <span className="font-medium text-charcoal-900">{version.versionLabel}</span>
                      <VersionStatusLabel status={version.status} />
                      {version.certifiedAt && (
                        <span className="text-xs text-warm-gray-500">
                          {new Date(version.certifiedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                      {version.consultationStartDate && version.consultationEndDate && (
                        <span className="text-xs text-warm-gray-500">
                          {new Date(version.consultationStartDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {' – '}
                          {new Date(version.consultationEndDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Consultation popover (Design 4) */}
                  {consultationPopover === version.id && (
                    <div className="border-t border-warm-gray-200 bg-warm-gray-100">
                      <button
                        onClick={() => handleVersionSelect(version)}
                        className="w-full flex items-center gap-2 px-5 py-2.5 text-sm text-charcoal-700 hover:bg-warm-gray-200 transition-colors"
                      >
                        <ExternalLink size={14} /> View consultation
                      </button>
                      <button
                        onClick={() => { setVersionOpen(false); setConsultationPopover(null); }}
                        className="w-full flex items-start gap-2 px-5 py-2.5 text-sm text-charcoal-700 hover:bg-warm-gray-200 transition-colors"
                      >
                        <MessageSquare size={14} className="mt-0.5 shrink-0" />
                        <span>
                          View Feedback
                          <span className="block text-xs text-warm-gray-500">Feedback summary &amp; actions</span>
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Table of Contents */}
      <div>
        <p className="text-xs font-semibold text-warm-gray-400 uppercase tracking-wider mb-2 px-2">Table of Contents</p>
        <nav className="flex flex-col gap-0.5">
          {rootSections.length === 0 ? (
            <p className="text-xs text-warm-gray-500 px-2 py-2">No sections yet.</p>
          ) : (
            rootSections.map((section) => (
              <TocItem key={section.id} section={section} allSections={sections} activeId={activeSection} search={search} depth={0} />
            ))
          )}
        </nav>
      </div>
    </aside>
  );
}
