'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { searchTools, toolUrl } from '@/lib/toolRegistry';

interface ToolSearchProps {
  size?: 'md' | 'lg';
  placeholder?: string;
  className?: string;
}

const RESULT_LIMIT = 8;

export default function ToolSearch({ size = 'md', placeholder = 'What do you need to do?', className }: ToolSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const results = useMemo(() => (open ? searchTools(query).slice(0, RESULT_LIMIT) : []), [query, open]);

  const large = size === 'lg';

  const goTo = (slug: string) => {
    setOpen(false);
    setQuery('');
    router.push(slug);
  };

  return (
    <div
      className={`relative ${className ?? ''}`}
      onBlur={() => {
        if (blurTimer.current) clearTimeout(blurTimer.current);
        blurTimer.current = setTimeout(() => setOpen(false), 120);
      }}
    >
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          width={large ? 20 : 16}
          height={large ? 20 : 16}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="search"
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-controls="tool-search-results"
          aria-label="Search tools"
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => query && setOpen(true)}
          onKeyDown={(e) => {
            if (!open || results.length === 0) return;
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setActive((i) => Math.min(i + 1, results.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActive((i) => Math.max(i - 1, 0));
            } else if (e.key === 'Enter') {
              e.preventDefault();
              goTo(toolUrl(results[active]));
            } else if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
          className={`w-full rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 ${
            large ? 'px-11 py-3.5 text-base' : 'px-9 py-2 text-sm'
          }`}
        />
      </div>

      {open && results.length > 0 && (
        <ul
          id="tool-search-results"
          role="listbox"
          className="absolute z-50 mt-1.5 max-h-96 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
        >
          {results.map((tool, index) => (
            <li key={tool.slug} role="option" aria-selected={index === active}>
              <Link
                href={toolUrl(tool)}
                onMouseDown={() => {
                  if (blurTimer.current) clearTimeout(blurTimer.current);
                }}
                onMouseEnter={() => setActive(index)}
                onClick={() => {
                  setOpen(false);
                  setQuery('');
                }}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 ${
                  index === active ? 'bg-blue-50 dark:bg-gray-700' : ''
                }`}
              >
                {tool.icon && <span className="text-base leading-none">{tool.icon}</span>}
                <span className="flex-1">
                  <span className="block font-medium text-gray-900 dark:text-white">{tool.name}</span>
                  <span className="block truncate text-xs text-gray-500 dark:text-gray-400">{tool.description}</span>
                </span>
                <span className="shrink-0 text-xs uppercase tracking-wide text-gray-400">{tool.group}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
