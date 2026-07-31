import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { VersionStatus } from '@/types';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-charcoal-900 text-white shadow-xs hover:bg-charcoal-800',
        secondary: 'border-transparent bg-warm-gray-200 text-charcoal-800 hover:bg-warm-gray-300',
        success: 'border-transparent bg-green-100 text-green-700',
        warning: 'border-transparent bg-amber-100 text-amber-700',
        danger: 'border-transparent bg-red-100 text-red-700',
        info: 'border-transparent bg-blue-100 text-blue-700',
        outline: 'text-charcoal-700 border border-warm-gray-300',
        certified: 'border-transparent bg-green-100 text-green-700',
        consultation: 'border-transparent bg-amber-100 text-amber-700',
        draft: 'border-warm-gray-300 bg-warm-gray-200 text-warm-gray-600 border',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

// --- Version status badge helper ---
const statusMap: Record<
  string,
  { label: string; variant: VariantProps<typeof badgeVariants>['variant'] }
> = {
  DRAFT: { label: 'Draft', variant: 'draft' },
  PUBLIC_CONSULTATION: { label: 'Public Consultation', variant: 'consultation' },
  CERTIFIED: { label: 'Certified', variant: 'certified' },
};

function VersionBadge({
  status,
  className,
}: {
  status: VersionStatus | string;
  className?: string;
}) {
  const cfg = statusMap[status] ?? { label: status, variant: 'draft' };
  return (
    <Badge variant={cfg.variant} className={className}>
      {cfg.label}
    </Badge>
  );
}

export { Badge, badgeVariants, VersionBadge };
