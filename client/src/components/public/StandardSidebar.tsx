'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import type { Section, VersionSummary } from '@/types';

interface Props {
  standardSlug: string;
  versions: VersionSummary[];
  activeVersionId: string;
  sections: Section[];
}

function formatDate(dateStr?: string | Date | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getVersionDateText(version: VersionSummary): string {
  if (version.status === 'CERTIFIED' && version.certifiedAt) {
    return formatDate(version.certifiedAt);
  }
  if (version.consultationStartDate && version.consultationEndDate) {
    return `${formatDate(version.consultationStartDate)} - ${formatDate(version.consultationEndDate)}`;
  }
  if (version.createdAt) {
    return formatDate(version.createdAt);
  }
  return '';
}

function hasDescendantMatch(section: Section, allSections: Section[], search: string): boolean {
  const children = allSections.filter((s) => s.parentId === section.id);
  if (children.some((c) => c.title.toLowerCase().includes(search.toLowerCase()))) return true;
  return children.some((c) => hasDescendantMatch(c, allSections, search));
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
  const childMatch = hasDescendantMatch(section, allSections, search);
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
        <TocItem
          key={child.id}
          section={child}
          allSections={allSections}
          activeId={activeId}
          search={search}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

export default function StandardSidebar({
  standardSlug,
  versions,
  activeVersionId,
  sections,
}: Props) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [versionOpen, setVersionOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
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
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(section.id);
        },
        { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [sections]);

  const activeVersion = versions.find((v) => v.id === activeVersionId) ?? versions[0];
  const rootSections = sections
    .filter((s) => !s.parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const handleVersionSelect = useCallback(
    (version: VersionSummary) => {
      setVersionOpen(false);
      router.push(`/standards/${standardSlug}/${version.slug}`);
    },
    [router, standardSlug]
  );

  const activeDateText = activeVersion ? getVersionDateText(activeVersion) : '';

  return (
    <aside className="flex flex-col gap-5">
      {/* Search */}
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray-400 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search sections…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm border border-warm-gray-200 rounded-lg bg-warm-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-red transition-colors"
        />
      </div>

      {/* Version dropdown */}
      {versions.length > 0 && (
        <div className="relative" ref={dropdownRef}>
          <label className="block text-xs font-semibold text-warm-gray-400 uppercase tracking-wider mb-1.5">
            Version
          </label>
          <button
            onClick={() => setVersionOpen((v) => !v)}
            className="w-full flex items-center justify-between px-3 py-2.5 border border-warm-gray-200 rounded-lg bg-white text-sm text-charcoal-900 hover:border-warm-gray-300 transition-colors shadow-sm"
          >
            <div className="flex items-center gap-1.5 min-w-0 font-medium">
              <span className="truncate">{activeVersion?.versionLabel ?? 'Select version'}</span>
              {activeDateText && (
                <span className="text-warm-gray-500 font-normal truncate">- {activeDateText}</span>
              )}
            </div>
            {versionOpen ? (
              <ChevronUp size={16} className="shrink-0 text-warm-gray-500 ml-2" />
            ) : (
              <ChevronDown size={16} className="shrink-0 text-warm-gray-500 ml-2" />
            )}
          </button>

          {versionOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-warm-gray-200 rounded-xl shadow-lg z-30 overflow-y-auto max-h-60 divide-y-warm-gray-200">
              {versions.map((version) => {
                const isSelected = version.id === activeVersionId;
                const isCertified = version.status === 'CERTIFIED';
                const isConsultation = version.status === 'PUBLIC_CONSULTATION';
                const dateText = getVersionDateText(version);

                return (
                  <button
                    key={version.id}
                    onClick={() => handleVersionSelect(version)}
                    className={[
                      'w-full flex items-center justify-between px-4 py-3 text-left transition-colors group',
                      isSelected ? 'bg-warm-gray-100 font-semibold' : 'hover:bg-warm-gray-50',
                    ].join(' ')}
                  >
                    <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                      <span className="font-semibold text-charcoal-900 text-sm">
                        {version.versionLabel}
                      </span>
                      {isCertified && (
                        <span className="text-xs text-warm-gray-600">
                          certified {dateText ? `- ${dateText}` : ''}
                        </span>
                      )}
                      {isConsultation && (
                        <>
                          <span className="text-xs font-medium text-amber-700">
                            Public consultation
                          </span>
                          {dateText && (
                            <span className="text-xs text-warm-gray-500">{dateText}</span>
                          )}
                        </>
                      )}
                      {!isCertified && !isConsultation && dateText && (
                        <span className="text-xs text-warm-gray-500">{dateText}</span>
                      )}
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-warm-gray-400 group-hover:text-charcoal-700 shrink-0 transition-colors"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Table of Contents */}
      <div>
        <p className="text-xs font-semibold text-warm-gray-400 uppercase tracking-wider mb-2 px-2">
          Table of Contents
        </p>
        <nav className="flex flex-col gap-0.5 max-h-[calc(100vh-16rem)] overflow-y-auto pr-1">
          {rootSections.length === 0 ? (
            <p className="text-xs text-warm-gray-500 px-2 py-2">No sections yet.</p>
          ) : (
            rootSections.map((section) => (
              <TocItem
                key={section.id}
                section={section}
                allSections={sections}
                activeId={activeSection}
                search={search}
                depth={0}
              />
            ))
          )}
        </nav>
      </div>
    </aside>
  );
}
