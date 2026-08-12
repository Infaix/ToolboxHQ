'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor } from '../EditorContext';
import PageView from './PageView';
import { Icons } from './icons';

export default function CanvasArea() {
  const { state, dispatch, openFile, addOverlays, showToast } = useEditor();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      setSize({ width: rect.width, height: rect.height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const slot = state.slots[state.currentPage];
  const zoom = computeZoom(state.fitMode, state.zoom, size, slot);

  const scrollToPage = useCallback(
    (index: number) => {
      const el = containerRef.current;
      if (!el) return;
      if (state.viewMode === 'single') {
        el.scrollTop = 0;
        return;
      }
      const target = el.querySelector(`[data-page="${index}"]`) as HTMLElement | null;
      if (target) target.scrollIntoView({ block: 'center', behavior: 'smooth' });
    },
    [state.viewMode]
  );

  useEffect(() => {
    scrollToPage(state.currentPage);
  }, [state.currentPage, state.viewMode, scrollToPage]);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDraggingFile(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;
      const pdf = files.find((f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
      const image = files.find((f) => f.type.startsWith('image/'));
      if (pdf) {
        await openFile(pdf);
        return;
      }
      if (image && state.tool === 'image') {
        const src = await readFileAsDataUrl(image);
        const img = new Image();
        img.onload = () => {
          const targetW = Math.min(240, state.slots[state.currentPage]?.width ?? 600);
          const ratio = img.naturalHeight / Math.max(1, img.naturalWidth);
          const overlay = {
            id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            page: state.currentPage,
            type: 'image' as const,
            x: (state.slots[state.currentPage]?.width ?? 600) / 2 - targetW / 2,
            y: (state.slots[state.currentPage]?.height ?? 800) / 2 - (targetW * ratio) / 2,
            width: targetW,
            height: targetW * ratio,
            rotation: 0,
            opacity: 1,
            src,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
          };
          addOverlays([overlay]);
          dispatch({ type: 'SET_SELECTION', payload: [overlay.id] });
        };
        img.src = src;
        return;
      }
      showToast('Drop a PDF here, or select the Image tool to insert an image.', 'info');
    },
    [openFile, state.tool, state.currentPage, state.slots, addOverlays, dispatch, showToast]
  );

  const pageIndices = state.viewMode === 'single' ? [state.currentPage] : state.slots.map((_, i) => i);

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-auto bg-gray-200/70 dark:bg-gray-900"
      onDragEnter={(e) => {
        e.preventDefault();
        setIsDraggingFile(true);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDraggingFile(false);
      }}
      onDrop={handleDrop}
    >
      <div className="flex min-h-full flex-col items-center gap-6 px-6 py-8">
        {pageIndices.map((index) => (
          <PageView key={`${index}-${state.slots[index]?.docId}`} slotIndex={index} zoom={zoom} scrollRef={containerRef} />
        ))}
      </div>

      {isDraggingFile && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-blue-500/10">
          <div className="rounded-xl border-2 border-dashed border-blue-500 bg-white/90 px-8 py-6 text-center dark:bg-gray-800/90">
            <Icons.file size={32} className="mx-auto text-blue-500" />
            <p className="mt-2 font-medium text-gray-900 dark:text-white">Drop to open a PDF</p>
          </div>
        </div>
      )}
    </div>
  );
}

function computeZoom(
  fitMode: string,
  zoom: number,
  size: { width: number; height: number },
  slot: { width: number; height: number } | undefined
): number {
  const cw = Math.max(size.width, 100);
  const ch = Math.max(size.height, 100);
  switch (fitMode) {
    case 'actual':
      return 1;
    case 'custom':
      return zoom;
    case 'page':
      return slot ? Math.max(0.08, Math.min((cw - 48) / slot.width, (ch - 48) / slot.height)) : zoom;
    case 'width':
    default:
      return slot ? Math.max(0.08, (cw - 48) / slot.width) : zoom;
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}
