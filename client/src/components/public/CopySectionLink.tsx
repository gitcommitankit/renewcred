'use client';

import { Link2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';

interface CopySectionLinkProps {
  sectionId: string;
  sectionTitle: string;
}

export default function CopySectionLink({ sectionId, sectionTitle }: CopySectionLinkProps) {
  const handleCopyLink = () => {
    const url = new URL(window.location.href);
    url.hash = `section-${sectionId}`;
    navigator.clipboard
      .writeText(url.toString())
      .then(() => {
        toast.success('Link copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy link: ', err);
        toast.error('Failed to copy link');
      });
  };

  return (
    <Button
      variant="ghost"
      onClick={handleCopyLink}
      className="opacity-0 group-hover:opacity-100 text-warm-gray-400 hover:text-brand-red transition-all ml-1 h-auto p-1 hover:bg-transparent active:bg-transparent cursor-pointer"
      aria-label={`Copy link to ${sectionTitle}`}
    >
      <Link2 size={16} />
    </Button>
  );
}
