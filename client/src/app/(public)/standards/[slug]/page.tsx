import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: slug.charAt(0).toUpperCase() + slug.slice(1),
  };
}

// Placeholder — full implementation in Phase 4
export default async function StandardDetailPage({ params }: Props) {
  const { slug } = await params;
  return (
    <main style={{ padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, textTransform: 'capitalize' }}>
        {slug}
      </h1>
      <p style={{ color: '#555', marginTop: '0.5rem' }}>
        Phase 4 — standard detail page coming soon.
      </p>
    </main>
  );
}
