'use client';

import { useState, useEffect } from 'react';

import { ChevronUp } from 'lucide-react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  if (!visible) return null;

  return (
    <button
      onClick={scrollTop}
      aria-label="Back to top"
      className="fixed bottom-8 right-8 z-40 flex items-center justify-center w-12 h-12 bg-charcoal-900 text-white rounded-full shadow-lg hover:bg-brand-red transition-all duration-300 hover:-translate-y-1"
    >
      <ChevronUp size={24} />
    </button>
  );
}
