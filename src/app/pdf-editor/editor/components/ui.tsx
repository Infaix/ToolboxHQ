'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icons } from './icons';

export function ToolButton({
  active,
  label,
  children,
  onClick,
  title,
  disabled,
}: {
  active?: boolean;
  label?: string;
  children: ReactNode;
  onClick?: () => void;
  title?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title ?? label}
      aria-label={title ?? label}
      aria-pressed={active}
      className={`group relative flex w-full flex-col items-center gap-1 rounded-md px-1 py-2 text-xs transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
      } ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}
    >
      {children}
      {label && <span className="text-[10px] leading-none">{label}</span>}
    </button>
  );
}

export function IconButton({
  title,
  children,
  onClick,
  active,
  disabled,
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { title: string; children: ReactNode; active?: boolean }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
      } disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function PrimaryButton({
  children,
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-900 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function PanelSection({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      {title && (
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{title}</h3>
      )}
      {children}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">{label}</span>
      {children}
    </label>
  );
}

export function TextInput({ className = '', ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white ${className}`}
      {...rest}
    />
  );
}

export function NumberInput({ className = '', ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="number"
      className={`w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white ${className}`}
      {...rest}
    />
  );
}

export function SelectInput({ className = '', ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white ${className}`}
      {...rest}
    />
  );
}

export function ColorInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <label className="relative h-7 w-7 shrink-0 cursor-pointer overflow-hidden rounded-md border border-gray-300 dark:border-gray-600">
        <span className="absolute inset-0" style={{ backgroundColor: value }} />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`${label} (hex)`}
        className="w-24 rounded-md border border-gray-300 bg-white px-2 py-1 font-mono text-xs text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      />
    </div>
  );
}

export function SwatchRow({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const swatches = ['#000000', '#ffffff', '#ef4444', '#f97316', '#f59e0b', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899'];
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {swatches.map((c) => (
        <button
          key={c}
          type="button"
          aria-label={`${label}: ${c}`}
          onClick={() => onChange(c)}
          className={`h-6 w-6 rounded-full border border-black/20 transition-transform hover:scale-110 ${value.toLowerCase() === c.toLowerCase() ? 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-gray-900' : ''}`}
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  );
}

export function SliderInput({
  value,
  onChange,
  min = 0,
  max = 100,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="flex-1 accent-blue-600"
      />
      <span className="w-12 shrink-0 text-right text-xs tabular-nums text-gray-600 dark:text-gray-400">{value}%</span>
    </div>
  );
}

export function Modal({
  title,
  onClose,
  children,
  footer,
  width = 'max-w-lg',
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`flex max-h-[90vh] w-full ${width} flex-col rounded-xl bg-white shadow-2xl dark:bg-gray-800`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <Icons.close size={18} />
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-3 dark:border-gray-700">{footer}</div>}
      </div>
    </div>
  );
}
