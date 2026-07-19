import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string; versionSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, versionSlug } = await params;
  return {
    title: `${slug} — ${versionSlug}`,
  };
}

// Placeholder — full implementation in Phase 4
export default async function VersionDetailPage({ params }: Props) {
  const { slug, versionSlug } = await params;
  return (
    <main style={{ padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>
        {slug} / {versionSlug}
      </h1>
      <p style={{ color: '#555', marginTop: '0.5rem' }}>
        Phase 4 — specific version view coming soon.
      </p>
    </main>
  );
}
