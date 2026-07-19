import type { Metadata } from 'next';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import BackToTop from '@/components/public/BackToTop';

export const metadata: Metadata = {
  title: {
    template: '%s | RenewCred',
    default: 'RenewCred — Climate Standards',
  },
  description:
    'RenewCred sets the global standard for climate credibility. Explore rigorous, transparent, and science-based certification standards.',
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
      <BackToTop />
    </div>
  );
}
