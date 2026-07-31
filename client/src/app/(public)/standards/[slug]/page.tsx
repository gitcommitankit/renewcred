import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import StandardSidebar from '@/components/public/StandardSidebar';
import SectionBlock from '@/components/public/SectionBlock';
import { getStandard, getVersions, getLatestVersion, getAllPublishedSlugs } from '@/lib/publicApi';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
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
            <Link
              href="/standards"
              className="inline-flex items-center px-3 py-1 bg-brand-red/10 text-brand-red text-xs font-semibold rounded-full uppercase tracking-widest hover:bg-brand-red/20 transition-colors"
            >
              Standards
            </Link>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-charcoal-900 mb-3 flex items-center gap-3">
            {standard.icon && <span className="text-4xl">{standard.icon}</span>}
            {standard.title}
          </h1>
          <p className="text-charcoal-600 max-w-2xl leading-relaxed">{standard.description}</p>
        </div>
      </section>

      {/* 2-column layout */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 relative items-start">
          {/* Left sidebar */}
          <div className="w-full md:w-72 shrink-0 md:sticky md:top-24 pb-4 md:pb-8 border-b md:border-b-0 border-warm-gray-200">
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
                <p className="text-sm mt-2 text-warm-gray-500">
                  This standard does not yet have a certified or public version.
                </p>
              </div>
            ) : rootSections.length === 0 ? (
              <div className="text-center py-16 text-charcoal-600">
                <p className="text-lg font-medium">No sections yet</p>
                <p className="text-sm mt-2 text-warm-gray-500">
                  Content for this standard is being prepared.
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
