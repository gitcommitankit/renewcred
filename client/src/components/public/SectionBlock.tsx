import Link from 'next/link';
import { Link2 } from 'lucide-react';
import TiptapRenderer from '@/components/public/TiptapRenderer';
import type { Section } from '@/types';

interface SectionBlockProps {
  section: Section;
  allSections: Section[];
  depth?: number;
}

/**
 * Renders a standard section block recursively with its child sections.
 * Supports anchor link navigation on hover and deep rendering indentation.
 */
export default function SectionBlock({ section, allSections, depth = 0 }: SectionBlockProps) {
  const children = allSections
    .filter((s) => s.parentId === section.id)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const HeadingTag = depth === 0 ? 'h2' : depth === 1 ? 'h3' : 'h4';
  const headingClass =
    depth === 0
      ? 'text-2xl font-bold text-charcoal-900'
      : depth === 1
        ? 'text-xl font-semibold text-charcoal-900'
        : 'text-lg font-semibold text-charcoal-800';

  return (
    <div id={`section-${section.id}`} className="scroll-mt-24">
      <div className="flex items-center gap-2 group mb-4">
        <span className="text-sm font-mono text-warm-gray-400 shrink-0">{section.number}</span>
        <HeadingTag className={headingClass}>{section.title}</HeadingTag>
        <Link
          href={`#section-${section.id}`}
          className="opacity-0 group-hover:opacity-100 text-warm-gray-400 hover:text-brand-red transition-all ml-1"
          aria-label={`Link to ${section.title}`}
        >
          <Link2 size={16} />
        </Link>
      </div>

      {section.content && <TiptapRenderer content={section.content} />}

      {children.length > 0 && (
        <div className={`mt-6 ${depth > 0 ? 'pl-4 border-l border-warm-gray-200' : ''} space-y-8`}>
          {children.map((child) => (
            <SectionBlock
              key={child.id}
              section={child}
              allSections={allSections}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
