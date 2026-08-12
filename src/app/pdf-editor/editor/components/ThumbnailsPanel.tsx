'use client';

import { memo, useEffect, useRef, useState } from 'react';
import { useEditor } from '../EditorContext';
import { Icons } from './icons';

export default function ThumbnailsPanel() {
  const { state, dispatch } = useEditor();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const handleDrop = (to: number) => {
    if (dragIndex !== null && dragIndex !== to) {
      dispatch({ type: 'REORDER_SLOTS', payload: { from: dragIndex, to } });
    }
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <aside className="hidden w-52 shrink-0 flex-col border-r border-gray-200 bg-white md:flex dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between px-3 pb-1 pt-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Pages</h2>
        <span className="text-xs tabular-nums text-gray-500 dark:text-gray-400">{state.slots.length}</span>
      </div>

      <div className="flex-1 space-y-1.5 overflow-y-auto px-2 py-1.5" onDragOver={(e) => e.preventDefault()} onDrop={() => handleDrop(overIndex ?? dragIndex ?? 0)}>
        {state.slots.map((slot, index) => (
          <div
            key={`${index}-${slot.docId}`}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => {
              e.preventDefault();
              setOverIndex(index);
            }}
            onDrop={(e) => {
              e.preventDefault();
              handleDrop(index);
            }}
            onDragEnd={() => {
              setDragIndex(null);
              setOverIndex(null);
            }}
            className={`group relative cursor-pointer rounded-lg border p-1 transition-colors ${
              index === state.currentPage
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40'
                : 'border-transparent hover:border-gray-300 dark:hover:border-gray-700'
            } ${overIndex === index && dragIndex !== null && dragIndex !== index ? 'ring-2 ring-blue-400' : ''}`}
            onClick={() => dispatch({ type: 'SET_CURRENT_PAGE', payload: index })}
          >
            <PageThumb slotIndex={index} />
            <span className="pointer-events-none absolute bottom-1.5 left-1.5 rounded bg-black/60 px-1 text-[10px] font-medium text-white">
              {index + 1}
            </span>
            <div className="pointer-events-none absolute right-1 top-1 flex gap-0.5 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
              <MiniAction title="Rotate clockwise" onClick={(e) => { e.stopPropagation(); dispatch({ type: 'ROTATE_SLOTS', payload: { indices: [index], delta: 90 } }); }}>
                <Icons.rotateCw size={12} />
              </MiniAction>
              <MiniAction title="Duplicate page" onClick={(e) => { e.stopPropagation(); dispatch({ type: 'DUPLICATE_SLOT', payload: index }); }}>
                <Icons.copy size={12} />
              </MiniAction>
              <MiniAction title="Delete page" danger onClick={(e) => { e.stopPropagation(); dispatch({ type: 'DELETE_SLOTS', payload: [index] }); }}>
                <Icons.trash size={12} />
              </MiniAction>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-1 border-t border-gray-200 p-2 dark:border-gray-800">
        <PanelAction onClick={() => dispatch({ type: 'SET_MODAL', payload: 'add-page' })}>
          <Icons.plus size={14} />
          Add page
        </PanelAction>
        <PanelAction onClick={() => dispatch({ type: 'SET_MODAL', payload: 'insert-pdf' })}>
          <Icons.open size={14} />
          Insert PDF
        </PanelAction>
        <PanelAction onClick={() => dispatch({ type: 'SET_MODAL', payload: 'extract' })}>
          <Icons.pages size={14} />
          Extract pages
        </PanelAction>
      </div>
    </aside>
  );
}

function MiniAction({ title, onClick, danger, children }: { title: string; onClick: (e: React.MouseEvent) => void; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={`rounded p-0.5 text-white transition-colors ${
        danger ? 'bg-red-500/80 hover:bg-red-600' : 'bg-gray-700/80 hover:bg-blue-600'
      }`}
    >
      {children}
    </button>
  );
}

function PanelAction({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
    >
      {children}
    </button>
  );
}

const PageThumb = memo(function PageThumb({ slotIndex }: { slotIndex: number }) {
  const { state } = useEditor();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const slot = state.slots[slotIndex];
  const doc = slot ? state.docs[slot.docId] : undefined;

  useEffect(() => {
    let cancelled = false;
    if (!doc) return;
    (async () => {
      try {
        const { renderPageToCanvas } = await import('../lib/renderPage');
        const thumb = await renderPageToCanvas(doc.pdf, slot.origIndex, slot.rotation, 0.22);
        if (cancelled || !canvasRef.current) return;
        const canvas = canvasRef.current;
        canvas.width = thumb.canvas.width;
        canvas.height = thumb.canvas.height;
        canvas.getContext('2d')?.drawImage(thumb.canvas, 0, 0);
      } catch {
        // ignore thumbnail failures
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [doc, slot.origIndex, slot.rotation]);

  const ratio = slot ? slot.height / Math.max(1, slot.width) : 1.414;
  const width = 168;
  const height = Math.round(width * ratio);

  return (
    <div className="flex items-center justify-center rounded bg-gray-100 dark:bg-gray-800" style={{ height }}>
      {slot ? (
        <canvas
          ref={canvasRef}
          style={{
            width: 168,
            height,
            objectFit: 'contain',
            background: '#fff',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.08)',
          }}
        />
      ) : null}
    </div>
  );
});
