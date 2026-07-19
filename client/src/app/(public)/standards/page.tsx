import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Standards',
  description: 'Browse all published climate standards from RenewCred.',
};

// Placeholder — full implementation in Phase 4
export default function StandardsPage() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Standards</h1>
      <p style={{ color: '#555', marginTop: '0.5rem' }}>
        Phase 4 — content coming soon. Backend API is live at{' '}
        <code>http://localhost:4000/api/v1/standards</code>.
      </p>
    </main>
  );
}
