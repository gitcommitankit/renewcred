import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import StandardSidebar from '@/components/public/StandardSidebar';
import SectionBlock from '@/components/public/SectionBlock';
import {
  getStandard,
  getVersions,
  getVersionBySlug,
  getAllPublishedVersionParams,
} from '@/lib/publicApi';

interface Props {
  params: Promise<{ slug: string; versionSlug: string }>;
}

export async function generateStaticParams() {
  return getAllPublishedVersionParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, versionSlug } = await params;
  const [standard, version] = await Promise.all([
    getStandard(slug),
    getVersionBySlug(slug, versionSlug),
  ]);
  if (!standard || !version) return { title: 'Version not found' };
  return {
    title: `${standard.title} — ${version.versionLabel}`,
    description: standard.description,
    openGraph: {
      title: `${standard.title} ${version.versionLabel} | RenewCred Standards`,
      description: standard.description,
    },
  };
}

export default async function VersionPage({ params }: Props) {
  const { slug, versionSlug } = await params;

  const [standard, versions, version] = await Promise.all([
    getStandard(slug),
    getVersions(slug),
    getVersionBySlug(slug, versionSlug),
  ]);

  if (!standard || !version) notFound();

  const sections = version.sections ?? [];
  const sortedSections = [...sections].sort((a, b) => a.sortOrder - b.sortOrder);
  const rootSections = sortedSections.filter((s) => !s.parentId);

  return (
    <main>
      {/* Hero */}
      <section className="bg-warm-gray-100 border-b border-warm-gray-200 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <Link
              href="/standards"
              className="inline-flex items-center px-3 py-1 bg-brand-red/10 text-brand-red text-xs font-semibold rounded-full uppercase tracking-widest hover:bg-brand-red/20 transition-colors"
            >
              Standards
            </Link>
            <span className="text-warm-gray-400">›</span>
            <Link
              href={`/standards/${slug}`}
              className="text-sm text-charcoal-600 hover:text-charcoal-900 transition-colors"
            >
              {standard.title}
            </Link>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-charcoal-900 mb-2 flex items-center gap-3">
            {standard.icon && <span className="text-4xl">{standard.icon}</span>}
            {standard.title}
            <span className="text-2xl text-warm-gray-400 font-normal">{version.versionLabel}</span>
          </h1>
          <p className="text-charcoal-600 max-w-2xl leading-relaxed">{standard.description}</p>
        </div>
      </section>

      {/* 2-column layout */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 relative items-start">
          <div className="w-72 shrink-0 sticky top-24 max-h-nav-offset overflow-y-auto pb-8">
            <h3 className="font-semibold text-charcoal-900 mb-4">Contents</h3>
            <StandardSidebar
              standardSlug={slug}
              versions={versions}
              activeVersionId={version.id}
              sections={sortedSections}
            />
          </div>

          <div className="flex-1 min-w-0">
            {rootSections.length === 0 ? (
              <div className="text-center py-16 text-charcoal-600">
                <p className="text-lg font-medium">No sections yet</p>
                <p className="text-sm mt-2 text-warm-gray-500">
                  Content for this version is being prepared.
                </p>
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
