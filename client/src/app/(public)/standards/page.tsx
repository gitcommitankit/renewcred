import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Standard } from '@/types';
import { API_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Standards',
  description:
    'Browse all published RenewCred climate standards — covering Electric Vehicles, Biochar, Methane, Renewable Energy, and more.',
};

async function getStandards(): Promise<Standard[]> {
  try {
    const res = await fetch(
      `${API_URL}/standards`,
      { next: { tags: ['standards-list'], revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

export default async function StandardsPage() {
  const standards = await getStandards();

  return (
    <main>
      {/* Hero */}
      <section className="bg-warm-gray-100 border-b border-warm-gray-200 py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <span className="inline-flex items-center px-3 py-1 bg-brand-red/10 text-brand-red text-xs font-semibold rounded-full uppercase tracking-widest mb-4">
            Standards
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-charcoal-900 leading-tight mb-4">
            RenewCred Standards
          </h1>
          <p className="text-lg text-charcoal-600 leading-relaxed max-w-2xl">
            Our standards are developed through rigorous scientific processes, stakeholder consultation, and independent review. Each standard provides clear, measurable criteria for climate impact verification.
          </p>
        </div>
      </section>

      {/* Standards list */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        {standards.length === 0 ? (
          <div className="text-center py-16 text-charcoal-600">
            <p className="text-lg">No standards are currently published.</p>
            <p className="text-sm mt-2 text-warm-gray-500">Check back soon as we publish our certification frameworks.</p>
          </div>
        ) : (
          <div className="divide-y divide-warm-gray-200">
            {standards.map((standard: Standard) => (
              <article key={standard.id} className="py-10 group">
                <div className="flex items-start gap-5">
                  {standard.icon && (
                    <span className="text-4xl shrink-0 mt-1" aria-hidden="true">
                      {standard.icon}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold text-charcoal-900 mb-3 group-hover:text-brand-red transition-colors">
                      {standard.title}
                    </h2>
                    <p className="text-charcoal-600 leading-relaxed mb-4">
                      {standard.description}
                    </p>
                    <div className="flex justify-end">
                      <Link
                        href={`/standards/${standard.slug}`}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-brand-red hover:text-brand-red-dark transition-colors group/link"
                      >
                        Read more
                        <ArrowRight size={16} className="transition-transform group-hover/link:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
