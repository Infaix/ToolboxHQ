'use client';

import { useEditor } from '../EditorContext';
import { IconButton } from './ui';
import { Icons } from './icons';
import { clamp } from '../lib/geometry';

export default function StatusBar() {
  const { state, dispatch } = useEditor();
  const page = state.currentPage;
  const total = state.slots.length;

  const setFit = (mode: 'custom' | 'width' | 'page' | 'actual') => dispatch({ type: 'SET_FIT_MODE', payload: mode });
  const setZoom = (z: number) => dispatch({ type: 'SET_ZOOM', payload: clamp(z, 0.1, 8) });
  const goPage = (delta: number) => dispatch({ type: 'SET_CURRENT_PAGE', payload: page + delta });

  return (
    <footer className="flex h-9 shrink-0 items-center justify-between gap-2 border-t border-gray-200 bg-white px-3 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          title="Previous page"
          aria-label="Previous page"
          disabled={page <= 0}
          onClick={() => goPage(-1)}
        >
          <Icons.chevronLeft size={15} />
        </button>
        <span className="min-w-[72px] text-center text-xs tabular-nums text-gray-700 dark:text-gray-300">
          Page <strong>{page + 1}</strong> / {total}
        </span>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          title="Next page"
          aria-label="Next page"
          disabled={page >= total - 1}
          onClick={() => goPage(1)}
        >
          <Icons.chevronRight size={15} />
        </button>
      </div>

      <div className="hidden items-center gap-1 sm:flex">
        <button
          type="button"
          title="Fit page"
          aria-label="Fit page"
          className={`rounded-md p-1.5 ${state.fitMode === 'page' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
          onClick={() => setFit('page')}
        >
          <Icons.fitPage size={17} />
        </button>
        <button
          type="button"
          title="Fit width"
          aria-label="Fit width"
          className={`rounded-md p-1.5 ${state.fitMode === 'width' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
          onClick={() => setFit('width')}
        >
          <Icons.fitWidth size={17} />
        </button>
        <button
          type="button"
          title="Actual size"
          aria-label="Actual size"
          className={`rounded-md p-1.5 ${state.fitMode === 'actual' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
          onClick={() => setFit('actual')}
        >
          <Icons.actualSize size={17} />
        </button>
      </div>

      <div className="flex items-center gap-1">
        <IconButton title="Zoom out" onClick={() => setZoom(state.zoom * 0.85)}>
          <Icons.zoomOut size={16} />
        </IconButton>
        <select
          value={state.fitMode === 'custom' ? state.zoom : state.fitMode}
          aria-label="Zoom"
          onChange={(e) => {
            const value = e.target.value;
            if (value === 'page' || value === 'width' || value === 'actual') setFit(value);
            else setZoom(Number(value) / 100);
          }}
          className="rounded-md border border-gray-300 bg-white px-1 py-0.5 text-xs tabular-nums text-gray-700 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
        >
          <option value="width">Fit width</option>
          <option value="page">Fit page</option>
          <option value="actual">Actual</option>
          <option value={0.5}>50%</option>
          <option value={0.75}>75%</option>
          <option value={1}>100%</option>
          <option value={1.25}>125%</option>
          <option value={1.5}>150%</option>
          <option value={2}>200%</option>
        </select>
        <IconButton title="Zoom in" onClick={() => setZoom(state.zoom * 1.18)}>
          <Icons.zoomIn size={16} />
        </IconButton>
      </div>
    </footer>
  );
}
