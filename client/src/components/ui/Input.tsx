import React from 'react';
import { cn } from '@/lib/utils';
import { Label } from './Label';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  wrapperClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      wrapperClassName,
      className,
      id,
      required,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
        {label && (
          <Label htmlFor={inputId} required={required}>
            {label}
          </Label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3 flex items-center text-warm-gray-500">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            required={required}
            className={cn(
              'w-full rounded-lg border bg-white text-sm text-charcoal-900',
              'transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-brand-red',
              error
                ? 'border-red-400 focus:ring-red-400'
                : 'border-warm-gray-300 hover:border-warm-gray-400',
              leftIcon ? 'pl-9' : 'pl-3',
              rightIcon ? 'pr-9' : 'pr-3',
              'py-2',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <span className="pointer-events-none absolute right-3 flex items-center text-warm-gray-500">
              {rightIcon}
            </span>
          )}
        </div>

        {error && (
          <p className="flex items-center gap-1 text-xs text-red-500" role="alert">
            {error}
          </p>
        )}
        {hint && !error && <p className="text-xs text-warm-gray-500">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

// --- Textarea ---

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, wrapperClassName, className, id, required, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
        {label && (
          <Label htmlFor={inputId} required={required}>
            {label}
          </Label>
        )}

        <textarea
          ref={ref}
          id={inputId}
          required={required}
          className={cn(
            'w-full rounded-lg border bg-white px-3 py-2 text-sm text-charcoal-900',
            'transition-colors duration-150 resize-y min-h-24',
            'focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-brand-red',
            error
              ? 'border-red-400 focus:ring-red-400'
              : 'border-warm-gray-300 hover:border-warm-gray-400',
            className
          )}
          {...props}
        />

        {error && <p className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs text-warm-gray-500">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
