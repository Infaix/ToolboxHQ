'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor } from '../EditorContext';
import TopBar from './TopBar';
import Toolbar from './Toolbar';
import ThumbnailsPanel from './ThumbnailsPanel';
import CanvasArea from './CanvasArea';
import InspectorPanel from './InspectorPanel';
import StatusBar from './StatusBar';
import Modals from './Modals';
import { Icons } from './icons';

export default function EditorApp() {
  const { state, dispatch, openFile, resetDocument, undo, redo, deleteSelection, copySelection, pasteBuffer, duplicateSelection, showToast } = useEditor();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [rightPanel, setRightPanel] = useState<'properties' | 'layers' | null>('properties');

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isEditable = target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
      const mod = e.ctrlKey || e.metaKey;

      if (mod && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        fileInputRef.current?.click();
        return;
      }
      if (mod && e.key.toLowerCase() === 's') {
        // Keep the browser's "Save page" dialog away, including while typing.
        e.preventDefault();
        return;
      }
      // Never hijack shortcuts while typing in an editable area — let the
      // contentEditable overlay / input keep native undo, redo, copy, paste.
      if (isEditable) return;
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
        return;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelection();
        return;
      }
      if (mod && e.key.toLowerCase() === 'c') {
        copySelection();
        return;
      }
      if (mod && e.key.toLowerCase() === 'v') {
        pasteBuffer();
        return;
      }
      if (mod && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateSelection();
        return;
      }
      if (e.key === 'Escape') {
        dispatch({ type: 'SET_SELECTION', payload: [] });
        dispatch({ type: 'SET_MODAL', payload: null });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [deleteSelection, copySelection, pasteBuffer, duplicateSelection, undo, redo, dispatch]);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => dispatch({ type: 'SET_FULLSCREEN', payload: Boolean(document.fullscreenElement) });
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, [dispatch]);

  const handlePickFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      showToast('Please choose a .pdf file.', 'warn');
      return;
    }
    await openFile(file);
  };

  const ready = state.status === 'ready';

  if (state.status === 'empty' || state.status === 'error') {
    return (
      <div className="flex h-screen flex-col bg-gray-100 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <WelcomeScreen />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-100 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <TopBar
        onOpen={() => fileInputRef.current?.click()}
        onNew={resetDocument}
        onExport={() => dispatch({ type: 'SET_MODAL', payload: 'export' })}
        onToggleFullscreen={toggleFullscreen}
        rightPanel={rightPanel}
        onTogglePanel={setRightPanel}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => {
          handlePickFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      <div className="flex flex-1 overflow-hidden">
        {ready && <ThumbnailsPanel />}
        <Toolbar />
        <CanvasArea />
        {ready && rightPanel && <InspectorPanel panel={rightPanel} onPanelChange={setRightPanel} />}
      </div>

      {ready && <StatusBar />}

      <Modals />
      <Toast />
      <BusyOverlay />
    </div>
  );
}

function Toast() {
  const { state } = useEditor();
  if (!state.toast) return null;
  const color =
    state.toast.kind === 'error'
      ? 'border-red-500 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200'
      : state.toast.kind === 'warn'
        ? 'border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
        : 'border-gray-300 bg-white text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100';
  return (
    <div className="pointer-events-none fixed bottom-14 left-1/2 z-50 -translate-x-1/2" role="status">
      <div className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm shadow-lg ${color}`}>
        {state.toast.kind === 'error' ? (
          <Icons.warning size={16} />
        ) : state.toast.kind === 'warn' ? (
          <Icons.warning size={16} />
        ) : (
          <Icons.check size={16} />
        )}
        {state.toast.message}
      </div>
    </div>
  );
}

function BusyOverlay() {
  const { state } = useEditor();
  if (!state.isBusy) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="flex items-center gap-3 rounded-xl bg-white px-6 py-4 shadow-xl dark:bg-gray-800">
        <Icons.spinner size={22} className="animate-spin text-blue-600" />
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{state.busyLabel ?? 'Working…'}</p>
          {state.busyProgress !== null && (
            <div className="mt-1 h-1.5 w-48 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${Math.round(state.busyProgress * 100)}%` }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WelcomeScreen() {
  const { state, dispatch, openFile, showToast } = useEditor();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePick = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      showToast('Please choose a .pdf file.', 'warn');
      return;
    }
    await openFile(file);
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-10">
      {state.error ? (
        <div className="w-full max-w-md space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400">
            <Icons.warning size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{state.error.title}</h1>
          <p className="text-gray-600 dark:text-gray-400">{state.error.message}</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Icons.open size={16} />
            Try another PDF
          </button>
        </div>
      ) : (
        <>
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
            <Icons.file size={40} />
          </div>
          <h1 className="mt-6 text-center text-3xl font-bold text-gray-900 dark:text-white">PDF Editor</h1>
          <p className="mt-2 max-w-md text-center text-gray-600 dark:text-gray-400">
            Annotate, fill forms, add images and signatures, rearrange pages, and export — all in your browser. Your files never leave your device.
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700"
          >
            <Icons.open size={18} />
            Open a PDF
          </button>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Supports PDFs up to 200 MB and 1,000 pages.</p>
          <button
            type="button"
            onClick={() => {
              dispatch({ type: 'SET_MODAL', payload: 'add-page' });
            }}
            className="mt-6 inline-flex items-center gap-2 text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            <Icons.plus size={15} />
            Or start with a blank document
          </button>
          <button
            type="button"
            onClick={() => {
              dispatch({ type: 'SET_MODAL', payload: 'from-images' });
            }}
            className="mt-2 inline-flex items-center gap-2 text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            <Icons.image size={15} />
            Or create a PDF from images
          </button>
        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => {
          handlePick(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </div>
  );
}
