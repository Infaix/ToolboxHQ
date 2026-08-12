'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useEditor } from '../EditorContext';
import { IconButton } from './ui';
import { Icons } from './icons';
import type { DocSlot } from '../types';

export interface SearchBarProps {
  open: boolean;
  onToggle: () => void;
}

export default function SearchBar({ open, onToggle }: SearchBarProps) {
  const { state, dispatch } = useEditor();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const query = state.search.query;

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const runSearch = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) {
        dispatch({ type: 'SET_SEARCH', payload: { query: text, index: -1, total: 0, perPage: [], rectsByPage: [], searching: false } });
        return;
      }
      dispatch({ type: 'SET_SEARCH', payload: { query: text, searching: true } });
      const { searchPage } = await import('../lib/search');
      const rectsByPage: { x: number; y: number; width: number; height: number }[][] = [];
      const perPage: number[] = [];
      for (const slot of state.slots) {
        const doc = state.docs[slot.docId];
        if (!doc) {
          rectsByPage.push([]);
          perPage.push(0);
          continue;
        }
        try {
          const result = await searchPage(doc.pdf, slot as DocSlot, trimmed);
          rectsByPage.push(result.rects);
          perPage.push(result.count);
        } catch {
          rectsByPage.push([]);
          perPage.push(0);
        }
      }
      const total = perPage.reduce((a, b) => a + b, 0);
      dispatch({
        type: 'SET_SEARCH',
        payload: { rectsByPage, perPage, total, index: total > 0 ? 0 : -1, searching: false },
      });
    },
    [state.slots, state.docs, dispatch]
  );

  // Debounce search on query change.
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => runSearch(query), 220);
    return () => clearTimeout(timer);
  }, [query, open, runSearch]);

  const goTo = useCallback(
    (dir: 1 | -1) => {
      const { index, total, perPage } = state.search;
      if (total === 0) return;
      const next = (index + dir + total) % total;
      let page = 0;
      let acc = 0;
      for (let i = 0; i < perPage.length; i++) {
        if (next < acc + perPage[i]) {
          page = i;
          break;
        }
        acc += perPage[i];
      }
      dispatch({ type: 'SET_CURRENT_PAGE', payload: page });
      dispatch({ type: 'SET_SEARCH', payload: { index: next } });
    },
    [state.search, dispatch]
  );

  const close = useCallback(() => {
    dispatch({
      type: 'SET_SEARCH',
      payload: { open: false, query: '', index: -1, total: 0, perPage: [], rectsByPage: [], searching: false },
    });
    onToggle();
  }, [dispatch, onToggle]);

  if (!open) {
    return (
      <IconButton title="Search in document" onClick={onToggle}>
        <Icons.search size={18} />
      </IconButton>
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-1.5 py-0.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 dark:border-gray-600 dark:bg-gray-800">
      <Icons.search size={15} className="shrink-0 text-gray-400" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: { query: e.target.value } })}
        onKeyDown={(e) => {
          if (e.key === 'Enter') goTo(e.shiftKey ? -1 : 1);
          if (e.key === 'Escape') close();
        }}
        placeholder="Search pages"
        aria-label="Search in document"
        className="w-32 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 sm:w-44 dark:text-white"
      />
      <span className="shrink-0 px-1 text-xs tabular-nums text-gray-500 dark:text-gray-400">
        {state.search.searching ? '…' : state.search.total > 0 ? `${state.search.index + 1}/${state.search.total}` : '0/0'}
      </span>
      <IconButton title="Previous match (Shift+Enter)" onClick={() => goTo(-1)} disabled={state.search.total === 0}>
        <Icons.chevronUp size={15} />
      </IconButton>
      <IconButton title="Next match (Enter)" onClick={() => goTo(1)} disabled={state.search.total === 0}>
        <Icons.chevronDown size={15} />
      </IconButton>
      <IconButton title="Close search (Esc)" onClick={close}>
        <Icons.close size={15} />
      </IconButton>
    </div>
  );
}
