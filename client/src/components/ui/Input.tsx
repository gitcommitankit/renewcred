import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
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
      wrapperClassName = '',
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={['flex flex-col gap-1.5', wrapperClassName].join(' ')}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-charcoal-900"
          >
            {label}
            {props.required && (
              <span className="ml-1 text-brand-red" aria-label="required">
                *
              </span>
            )}
          </label>
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
            className={[
              'w-full rounded-lg border bg-white text-sm text-charcoal-900 placeholder:text-warm-gray-500',
              'transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-0 focus:border-brand-red',
              error
                ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
                : 'border-warm-gray-300 hover:border-warm-gray-400',
              leftIcon ? 'pl-9' : 'pl-3',
              rightIcon ? 'pr-9' : 'pr-3',
              'py-2',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
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
        {hint && !error && (
          <p className="text-xs text-warm-gray-500">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ---- Textarea ----

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, wrapperClassName = '', className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={['flex flex-col gap-1.5', wrapperClassName].join(' ')}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-charcoal-900">
            {label}
            {props.required && (
              <span className="ml-1 text-brand-red" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        <textarea
          ref={ref}
          id={inputId}
          className={[
            'w-full rounded-lg border bg-white px-3 py-2 text-sm text-charcoal-900 placeholder:text-warm-gray-500',
            'transition-colors duration-150 resize-y min-h-[100px]',
            'focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-brand-red',
            error
              ? 'border-red-400 focus:ring-red-400'
              : 'border-warm-gray-300 hover:border-warm-gray-400',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />

        {error && <p className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs text-warm-gray-500">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
