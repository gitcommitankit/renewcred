'use client';

import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';

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
    <Button
      type="button"
      variant="secondary"
      onClick={scrollTop}
      aria-label="Back to top"
      className="fixed bottom-8 right-8 z-40 w-12 h-12 rounded-full p-0 shadow-lg hover:bg-brand-red border-none transition-all duration-300 hover:-translate-y-1"
    >
      <ChevronUp size={24} />
    </Button>
  );
}
