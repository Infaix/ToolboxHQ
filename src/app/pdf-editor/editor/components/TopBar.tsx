'use client';

import Link from 'next/link';
import { useEditor } from '../EditorContext';
import { IconButton } from './ui';
import { Icons } from './icons';
import SearchBar from './SearchBar';
import { formatBytes } from '../lib/textUtils';

export interface TopBarProps {
  onOpen: () => void;
  onNew: () => void;
  onExport: () => void;
  onToggleFullscreen: () => void;
  rightPanel: 'properties' | 'layers' | null;
  onTogglePanel: (panel: 'properties' | 'layers' | null) => void;
}

export default function TopBar({ onOpen, onNew, onExport, onToggleFullscreen, rightPanel, onTogglePanel }: TopBarProps) {
  const { state, dispatch, undo, redo } = useEditor();
  const canUndo = state.history.length > 0;
  const canRedo = state.redoStack.length > 0;
  const ready = state.status === 'ready';

  const toggleSearch = () => {
    if (state.search.open) {
      dispatch({ type: 'SET_SEARCH', payload: { open: false, query: '', index: -1, total: 0, perPage: [], rectsByPage: [], searching: false } });
    } else {
      dispatch({ type: 'SET_SEARCH', payload: { open: true } });
    }
  };

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-3 dark:border-gray-800 dark:bg-gray-900">
      <Link href="/" className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white" title="Back to ToolboxHQ">
        <Icons.chevronLeft size={18} />
        <span className="hidden sm:inline">ToolboxHQ</span>
      </Link>

      <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

      <button
        type="button"
        onClick={onNew}
        title="New document (blank)"
        aria-label="New document"
        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
      >
        <Icons.plus size={16} />
        <span className="hidden md:inline">New</span>
      </button>
      <IconButton title="Open PDF (Ctrl+O)" onClick={onOpen}>
        <Icons.open size={18} />
      </IconButton>

      <div className="min-w-0 flex-1" />

      <div className="hidden max-w-[220px] flex-col items-start lg:flex">
        <span className="w-full truncate text-sm font-medium text-gray-900 dark:text-white" title={state.fileName || 'No document open'}>
          {state.fileName || (ready ? 'Untitled' : 'PDF Editor')}
        </span>
        {ready && <span className="text-[11px] leading-tight text-gray-500 dark:text-gray-400">{state.slots.length} page{state.slots.length === 1 ? '' : 's'} · {formatBytes(state.fileSize)}</span>}
      </div>

      <div className="hidden h-6 w-px bg-gray-200 sm:block dark:bg-gray-700" />

      <div className="hidden items-center gap-1 sm:flex">
        <IconButton title="Undo (Ctrl+Z)" onClick={undo} disabled={!canUndo}>
          <Icons.undo size={18} />
        </IconButton>
        <IconButton title="Redo (Ctrl+Shift+Z)" onClick={redo} disabled={!canRedo}>
          <Icons.redo size={18} />
        </IconButton>
      </div>

      <SearchBar open={state.search.open} onToggle={toggleSearch} />

      <div className="hidden h-6 w-px bg-gray-200 md:block dark:bg-gray-700" />

      <div className="hidden items-center gap-1 md:flex">
        <IconButton
          title={state.viewMode === 'single' ? 'Show all pages (continuous)' : 'Show single page'}
          active={state.viewMode === 'single'}
          onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: state.viewMode === 'single' ? 'continuous' : 'single' })}
        >
          <Icons.pages size={18} />
        </IconButton>
        <IconButton title="Properties" active={rightPanel === 'properties'} onClick={() => onTogglePanel(rightPanel === 'properties' ? null : 'properties')}>
          <Icons.textAlignRight size={18} />
        </IconButton>
        <IconButton title="Layers" active={rightPanel === 'layers'} onClick={() => onTogglePanel(rightPanel === 'layers' ? null : 'layers')}>
          <Icons.layers size={18} />
        </IconButton>
      </div>

      <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

      <IconButton title="Toggle fullscreen" onClick={onToggleFullscreen}>
        {state.isFullscreen ? <Icons.fullscreenExit size={18} /> : <Icons.fullscreen size={18} />}
      </IconButton>

      {ready && (
        <button
          type="button"
          onClick={onExport}
          className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          title="Download edited PDF"
        >
          <Icons.download size={16} />
          <span className="hidden sm:inline">Export</span>
        </button>
      )}
    </header>
  );
}
