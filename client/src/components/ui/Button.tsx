import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-red text-white hover:bg-brand-red-dark active:bg-[#9a2820] border border-brand-red',
  secondary:
    'bg-charcoal-900 text-white hover:bg-charcoal-800 active:bg-charcoal-700 border border-charcoal-900',
  ghost:
    'bg-transparent text-charcoal-700 hover:bg-warm-gray-100 active:bg-warm-gray-200 border border-transparent',
  danger:
    'bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200 border border-red-200',
  outline:
    'bg-transparent text-charcoal-900 hover:bg-warm-gray-100 border border-warm-gray-300 hover:border-charcoal-900',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-md',
  md: 'text-sm px-4 py-2 gap-2 rounded-lg',
  lg: 'text-base px-6 py-2.5 gap-2.5 rounded-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center font-medium transition-all duration-150',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <Spinner size="sm" />
          {children}
        </span>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}

// ---- Spinner (also exported from this file for convenience) ----

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const spinnerSizes: Record<string, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
};

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <svg
      className={['animate-spin text-current', spinnerSizes[size], className]
        .filter(Boolean)
        .join(' ')}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Loading"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
