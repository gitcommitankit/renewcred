import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page',
};

export default function StubPage() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
      <p style={{ color: '#555' }}>Phase 4 — content coming soon.</p>
    </main>
  );
}
