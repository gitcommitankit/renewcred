import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Link2 } from 'lucide-react';
import StandardSidebar from '@/components/public/StandardSidebar';
import TiptapRenderer from '@/components/public/TiptapRenderer';
import type { Standard, Version, Section, VersionSummary } from '@/types';
import { API_URL } from '@/lib/constants';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getStandard(slug: string): Promise<Standard | null> {
  try {
    const res = await fetch(`${API_URL}/standards/${slug}`, { next: { tags: ['standards-list', `standard-${slug}`], revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data ?? null;
  } catch { return null; }
}

async function getVersions(slug: string): Promise<VersionSummary[]> {
  try {
    const res = await fetch(`${API_URL}/standards/${slug}/versions`, { next: { tags: [`standard-${slug}`], revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
  } catch { return []; }
}

async function getLatestVersion(slug: string): Promise<Version | null> {
  try {
    const res = await fetch(`${API_URL}/standards/${slug}/versions/latest`, { next: { tags: [`standard-${slug}`], revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data ?? null;
  } catch { return null; }
}



export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const standard = await getStandard(slug);
  if (!standard) return { title: 'Standard not found' };
  return {
    title: standard.title,
    description: standard.description,
    openGraph: {
      title: `${standard.title} | RenewCred Standards`,
      description: standard.description,
    },
  };
}

export default async function StandardDetailPage({ params }: Props) {
  const { slug } = await params;

  const [standard, versions, latestVersion] = await Promise.all([
    getStandard(slug),
    getVersions(slug),
    getLatestVersion(slug),
  ]);

  if (!standard) notFound();

  const sections = latestVersion?.sections ?? [];
  const sortedSections = [...sections].sort((a, b) => a.sortOrder - b.sortOrder);
  const rootSections = sortedSections.filter((s) => !s.parentId);

  return (
    <main>
      {/* Hero / breadcrumb */}
      <section className="bg-warm-gray-100 border-b border-warm-gray-200 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <Link href="/standards" className="inline-flex items-center px-3 py-1 bg-brand-red/10 text-brand-red text-xs font-semibold rounded-full uppercase tracking-widest hover:bg-brand-red/20 transition-colors">
              Standards
            </Link>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-charcoal-900 mb-3 flex items-center gap-3">
            {standard.icon && <span className="text-4xl">{standard.icon}</span>}
            {standard.title}
          </h1>
          <p className="text-charcoal-600 max-w-2xl leading-relaxed">
            {standard.description}
          </p>
        </div>
      </section>

      {/* 2-column layout */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 relative items-start">
          {/* Left sidebar */}
          <div className="w-full md:w-72 shrink-0 md:sticky md:top-24 max-h-40vh md:max-h-nav-offset overflow-y-auto pb-4 md:pb-8 border-b md:border-b-0 border-warm-gray-200">
            <h3 className="font-semibold text-charcoal-900 mb-4 hidden md:block">Contents</h3>
            <StandardSidebar
              standardSlug={slug}
              versions={versions}
              activeVersionId={latestVersion?.id ?? ''}
              sections={sortedSections}
            />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {!latestVersion ? (
              <div className="text-center py-16 text-charcoal-600">
                <p className="text-lg font-medium">No published version available</p>
                <p className="text-sm mt-2 text-warm-gray-500">This standard does not yet have a certified or public version.</p>
              </div>
            ) : rootSections.length === 0 ? (
              <div className="text-center py-16 text-charcoal-600">
                <p className="text-lg font-medium">No sections yet</p>
                <p className="text-sm mt-2 text-warm-gray-500">Content for this standard is being prepared.</p>
              </div>
            ) : (
              <div className="space-y-10">
                {rootSections.map((section) => (
                  <SectionBlock key={section.id} section={section} allSections={sortedSections} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

/* ──────────────── Section block with anchor ──────────────── */
function SectionBlock({ section, allSections, depth = 0 }: { section: Section; allSections: Section[]; depth?: number }) {
  const children = allSections
    .filter((s) => s.parentId === section.id)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const HeadingTag = depth === 0 ? 'h2' : depth === 1 ? 'h3' : 'h4';
  const headingClass = depth === 0
    ? 'text-2xl font-bold text-charcoal-900'
    : depth === 1
    ? 'text-xl font-semibold text-charcoal-900'
    : 'text-lg font-semibold text-charcoal-800';

  return (
    <div id={`section-${section.id}`} className="scroll-mt-24">
      <div className="flex items-center gap-2 group mb-4">
        <span className="text-sm font-mono text-warm-gray-400 shrink-0">{section.number}</span>
        <HeadingTag className={headingClass}>{section.title}</HeadingTag>
        <a
          href={`#section-${section.id}`}
          className="opacity-0 group-hover:opacity-100 text-warm-gray-400 hover:text-brand-red transition-all ml-1"
          aria-label={`Link to ${section.title}`}
        >
          <Link2 size={16} />
        </a>
      </div>

      {section.content && (
        <TiptapRenderer content={section.content} />
      )}

      {children.length > 0 && (
        <div className={`mt-6 ${depth > 0 ? 'pl-4 border-l border-warm-gray-200' : ''} space-y-8`}>
          {children.map((child) => (
            <SectionBlock key={child.id} section={child} allSections={allSections} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
