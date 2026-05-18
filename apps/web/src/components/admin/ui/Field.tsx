'use client';

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type FieldShellProps = {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
};

export function FieldShell({
  label,
  error,
  hint,
  required,
  className,
  children,
}: FieldShellProps) {
  return (
    <label className={cn('block', className)}>
      <div className="mb-1 flex items-baseline gap-1">
        <span className="text-[0.75rem] font-medium text-admin-text-muted">
          {label}
        </span>
        {required ? (
          <span className="text-[0.75rem] text-admin-red" aria-hidden="true">
            *
          </span>
        ) : null}
      </div>
      {children}
      {error ? (
        <div className="mt-1 text-[0.75rem] text-admin-red">{error}</div>
      ) : hint ? (
        <div className="mt-1 text-[0.75rem] text-admin-text-muted">{hint}</div>
      ) : null}
    </label>
  );
}

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  label: string;
  error?: string;
  hint?: string;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField({ label, error, hint, required, className, ...rest }, ref) {
    return (
      <FieldShell label={label} error={error} hint={hint} required={required}>
        <input
          ref={ref}
          required={required}
          {...rest}
          className={cn(
            'w-full rounded-md border bg-admin-bg-elev px-3 py-2 text-[0.875rem] text-admin-text outline-none transition-colors',
            'placeholder:text-admin-text-muted/70 focus:border-admin-brand',
            error ? 'border-admin-red/50' : 'border-admin-border',
            className
          )}
        />
      </FieldShell>
    );
  }
);

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function TextareaField({ label, error, hint, required, className, ...rest }, ref) {
    return (
      <FieldShell label={label} error={error} hint={hint} required={required}>
        <textarea
          ref={ref}
          required={required}
          {...rest}
          className={cn(
            'w-full rounded-md border bg-admin-bg-elev px-3 py-2 text-[0.875rem] text-admin-text outline-none transition-colors',
            'placeholder:text-admin-text-muted/70 focus:border-admin-brand',
            error ? 'border-admin-red/50' : 'border-admin-border',
            className
          )}
        />
      </FieldShell>
    );
  }
);
