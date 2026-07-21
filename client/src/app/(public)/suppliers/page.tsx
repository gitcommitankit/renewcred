import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Suppliers',
  description: 'RenewCred — suppliers section, coming soon.',
};

export default function Page() {
  return (
    <main>
      <section className="bg-warm-gray-100 border-b border-warm-gray-200 py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <span className="inline-flex items-center px-3 py-1 bg-brand-red/10 text-brand-red text-xs font-semibold rounded-full uppercase tracking-widest mb-4">
            Coming Soon
          </span>
          <h1 className="text-4xl font-bold text-charcoal-900 mb-4 capitalize">suppliers</h1>
          <p className="text-charcoal-600 max-w-xl">
            This page is currently being built. Check back soon.
          </p>
        </div>
      </section>
    </main>
  );
}
