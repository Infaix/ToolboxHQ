'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useEditor } from '../EditorContext';
import type { Overlay } from '../types';
import { hitTestOverlay } from '../lib/geometry';
import type { EditableTextBlock } from '../lib/pageContent';
import {
  makeTextOverlay,
  makeMarkOverlay,
  makeShapeOverlay,
  makeLineOverlay,
  makeInkOverlay,
  makeNoteOverlay,
  makeFormFieldOverlay,
  makeChoiceOverlay,
  makeRedactionOverlay,
} from '../lib/factories';
import { OverlayNode } from './OverlayNode';
import { SelectionHandles } from './SelectionHandles';

export interface PageViewProps {
  slotIndex: number;
  zoom: number;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

type DragState =
  | { kind: 'move'; startX: number; startY: number; origins: { id: string; x: number; y: number }[] }
  | { kind: 'create'; id: string; startX: number; startY: number; initial: Overlay; minSize: number }
  | { kind: 'draw'; id: string; points: { x: number; y: number }[]; minX: number; minY: number; maxX: number; maxY: number }
  | { kind: 'erase' }
  | { kind: 'pan'; startClientX: number; startClientY: number; startScrollLeft: number; startScrollTop: number }
  | { kind: 'resize'; id: string; base: Overlay; handle: string; startClientX: number; startClientY: number }
  | { kind: 'rotate'; id: string; base: Overlay; startClientX: number; startClientY: number; startAngle: number };

/** Minimum distance (page units) between sampled stroke points. */
const MIN_DRAW_STEP = 0.8;

export default function PageView({ slotIndex, zoom, scrollRef }: PageViewProps) {
  const { state, dispatch, addOverlays, removeOverlays, updateOverlayLive, pushHistory } = useEditor();
  const slot = state.slots[slotIndex];
  const doc = slot ? state.docs[slot.docId] : undefined;
  const pageOverlays = useMemo(
    () => state.overlays.filter((o) => o.page === slotIndex),
    [state.overlays, slotIndex]
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const drawFlushRef = useRef<number | null>(null);

  const flushDraw = useCallback(() => {
    if (drawFlushRef.current != null) {
      cancelAnimationFrame(drawFlushRef.current);
      drawFlushRef.current = null;
    }
    const d = dragRef.current;
    if (d && d.kind === 'draw') {
      updateOverlayLive(d.id, {
        points: d.points,
        x: d.minX,
        y: d.minY,
        width: Math.max(d.maxX - d.minX, 0.01),
        height: Math.max(d.maxY - d.minY, 0.01),
      });
    }
  }, [updateOverlayLive]);

  const scheduleDrawFlush = useCallback(() => {
    if (drawFlushRef.current != null) return;
    drawFlushRef.current = requestAnimationFrame(() => {
      drawFlushRef.current = null;
      flushDraw();
    });
  }, [flushDraw]);

  const width = slot.width;
  const height = slot.height;

  // Render base page via pdf.js whenever the page / zoom / rotation changes.
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    let cancelled = false;
    let lastCanvas: HTMLCanvasElement | null = null;
    if (!doc) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    (async () => {
      try {
        const { renderPageToCanvas } = await import('../lib/renderPage');
        const rendered = await renderPageToCanvas(doc.pdf, slot.origIndex, slot.rotation, zoom * dpr);
        if (cancelled) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        lastCanvas = canvas;
        canvas.width = rendered.canvas.width;
        canvas.height = rendered.canvas.height;
        canvas.style.width = `${slot.width * zoom}px`;
        canvas.style.height = `${slot.height * zoom}px`;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(rendered.canvas, 0, 0);
      } catch {
        if (!cancelled) {
          // Surface a friendly toast instead of a silent failure.
          dispatch({ type: 'SHOW_TOAST', payload: { message: 'This page could not be rendered.', kind: 'warn' } });
        }
      }
    })();
    return () => {
      cancelled = true;
      if (lastCanvas) lastCanvas.getContext('2d')?.clearRect(0, 0, lastCanvas.width, lastCanvas.height);
    };
  }, [doc, slot.origIndex, slot.rotation, zoom, slot.width, slot.height, dispatch]);

  const pagePoint = useCallback(
    (e: React.PointerEvent) => {
      const el = boxRef.current;
      if (!el) return { x: 0, y: 0 };
      const rect = el.getBoundingClientRect();
      return { x: (e.clientX - rect.left) / zoom, y: (e.clientY - rect.top) / zoom };
    },
    [zoom]
  );

  const topmostOverlay = useCallback(
    (p: { x: number; y: number }) => {
      for (let i = pageOverlays.length - 1; i >= 0; i--) {
        const o = pageOverlays[i];
        if (hitTestOverlay(o, p.x, p.y)) return o;
      }
      return undefined;
    },
    [pageOverlays]
  );

  const editPageContent = useCallback(
    async (p: { x: number; y: number }) => {
      if (!doc || !slot) return;
      let blocks: EditableTextBlock[] = [];
      try {
        const { detectTextBlocks } = await import('../lib/pageContent');
        blocks = await detectTextBlocks(doc.pdf, slot.origIndex, slot.rotation);
      } catch {
        dispatch({ type: 'SHOW_TOAST', payload: { message: 'The text on this page could not be read.', kind: 'warn' } });
        return;
      }
      const tolerance = 4;
      const block = blocks.find(
        (b) => p.x >= b.x - tolerance && p.x <= b.x + b.width + tolerance && p.y >= b.y - tolerance && p.y <= b.y + b.height + tolerance
      );
      if (!block) return;
      const line =
        block.lines.find(
          (l) => p.x >= l.x - tolerance && p.x <= l.x + l.width + tolerance && p.y >= l.y - tolerance && p.y <= l.y + l.height + tolerance
        ) ?? block.lines[0];

      const pad = 1.5;
      const o = makeTextOverlay(slotIndex, block.x - pad, block.y - pad);
      o.width = Math.max(block.width + pad * 2, 24);
      o.height = Math.max(block.height + pad * 2, line.fontSize * block.lineHeight * block.lines.length + pad * 2);
      o.text = block.text;
      o.fontFamily = line.fontFamily;
      o.fontSize = Math.max(Math.min(line.fontSize, 72), 6);
      o.bold = line.bold;
      o.italic = line.italic;
      o.underline = line.underline;
      o.color = line.color;
      o.align = line.align;
      o.lineHeight = block.lineHeight;
      o.background = '#ffffff';
      addOverlays([o]);
      dispatch({ type: 'SET_SELECTION', payload: [o.id] });
      setEditingId(o.id);
    },
    [doc, slot, slotIndex, dispatch, addOverlays]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0 && e.button !== 2) return;
      if ((e.target as HTMLElement).isContentEditable) return;
      if (state.status !== 'ready') return;
      const p = pagePoint(e);
      const tool = state.tool;

      if (tool === 'select') {
        const hit = topmostOverlay(p);
        if (hit) {
          const isSelected = state.selection.includes(hit.id);
          const next = e.shiftKey ? (isSelected ? state.selection.filter((id) => id !== hit.id) : [...state.selection, hit.id]) : [hit.id];
          if (JSON.stringify(next) !== JSON.stringify(state.selection)) {
            dispatch({ type: 'SET_SELECTION', payload: next });
          }
          const selectedOverlays = state.overlays.filter((o) => next.includes(o.id));
          const origins = selectedOverlays.map((o) => ({ id: o.id, x: o.x, y: o.y }));
          dragRef.current = { kind: 'move', startX: p.x, startY: p.y, origins };
        } else {
          dispatch({ type: 'SET_SELECTION', payload: [] });
        }
      } else if (tool === 'edit') {
        const hit = topmostOverlay(p);
        if (hit) {
          const isSelected = state.selection.includes(hit.id);
          const next = e.shiftKey ? (isSelected ? state.selection.filter((id) => id !== hit.id) : [...state.selection, hit.id]) : [hit.id];
          if (JSON.stringify(next) !== JSON.stringify(state.selection)) {
            dispatch({ type: 'SET_SELECTION', payload: next });
          }
          const selectedOverlays = state.overlays.filter((o) => next.includes(o.id));
          const origins = selectedOverlays.map((o) => ({ id: o.id, x: o.x, y: o.y }));
          dragRef.current = { kind: 'move', startX: p.x, startY: p.y, origins };
          if (hit.type === 'text' || hit.type === 'note') {
            setEditingId(hit.id);
          }
        } else {
          void editPageContent(p);
        }
      } else if (tool === 'hand') {
        const el = scrollRef.current;
        dragRef.current = {
          kind: 'pan',
          startClientX: e.clientX,
          startClientY: e.clientY,
          startScrollLeft: el ? el.scrollLeft : 0,
          startScrollTop: el ? el.scrollTop : 0,
        };
        (e.currentTarget as HTMLElement).style.cursor = 'grabbing';
      } else if (tool === 'text') {        const o = makeTextOverlay(slotIndex, p.x, p.y);
        addOverlays([o]);
        dispatch({ type: 'SET_SELECTION', payload: [o.id] });
        setEditingId(o.id);
      } else if (tool === 'highlight' || tool === 'underline' || tool === 'strikethrough') {
        const o = makeMarkOverlay(slotIndex, p.x, p.y, 0, 0, tool);
        addOverlays([o]);
        dragRef.current = { kind: 'create', id: o.id, startX: p.x, startY: p.y, initial: o, minSize: 4 };
      } else if (tool === 'rect' || tool === 'ellipse') {
        const o = makeShapeOverlay(slotIndex, p.x, p.y, tool);
        addOverlays([o]);
        dragRef.current = { kind: 'create', id: o.id, startX: p.x, startY: p.y, initial: o, minSize: 4 };
      } else if (tool === 'line' || tool === 'arrow') {
        const o = makeLineOverlay(slotIndex, p.x, p.y, tool);
        addOverlays([o]);
        dragRef.current = { kind: 'create', id: o.id, startX: p.x, startY: p.y, initial: o, minSize: 4 };
      } else if (tool === 'draw') {
        const o = makeInkOverlay(slotIndex, p.x, p.y, '#1f2937', 2.5);
        addOverlays([o]);
        dragRef.current = { kind: 'draw', id: o.id, points: [{ x: p.x, y: p.y }], minX: p.x, minY: p.y, maxX: p.x, maxY: p.y };
      } else if (tool === 'eraser') {
        const hit = topmostOverlay(p);
        if (hit) removeOverlays([hit.id]);
        dragRef.current = { kind: 'erase' };
      } else if (tool === 'note') {
        const o = makeNoteOverlay(slotIndex, p.x, p.y, '#fde68a');
        addOverlays([o]);
        dispatch({ type: 'SET_SELECTION', payload: [o.id] });
        setEditingId(o.id);
      } else if (tool === 'signature') {
        dispatch({ type: 'SET_MODAL', payload: 'signature' });
      } else if (tool === 'form-text' || tool === 'form-dropdown' || tool === 'form-date') {
        const o = makeFormFieldOverlay(slotIndex, p.x, p.y, tool);
        addOverlays([o]);
        dispatch({ type: 'SET_SELECTION', payload: [o.id] });
        setEditingId(o.id);
      } else if (tool === 'form-checkbox' || tool === 'form-radio') {
        const o = makeChoiceOverlay(slotIndex, p.x, p.y, tool);
        addOverlays([o]);
        dispatch({ type: 'SET_SELECTION', payload: [o.id] });
      } else if (tool === 'redact') {
        const o = makeRedactionOverlay(slotIndex, p.x, p.y, 0, 0);
        addOverlays([o]);
        dragRef.current = { kind: 'create', id: o.id, startX: p.x, startY: p.y, initial: o, minSize: 4 };
      }

      if (dragRef.current && dragRef.current.kind !== 'pan') {
        e.currentTarget.setPointerCapture(e.pointerId);
      }
    },
    [state.status, state.tool, state.selection, state.overlays, pagePoint, topmostOverlay, editPageContent, scrollRef, slotIndex, dispatch, addOverlays, removeOverlays]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const p = pagePoint(e);
      switch (drag.kind) {
        case 'move': {
          const dx = p.x - drag.startX;
          const dy = p.y - drag.startY;
          for (const origin of drag.origins) {
            updateOverlayLive(origin.id, { x: origin.x + dx, y: origin.y + dy });
          }
          break;
        }
        case 'create': {
          const minX = Math.min(drag.startX, p.x);
          const minY = Math.min(drag.startY, p.y);
          const w = Math.abs(p.x - drag.startX);
          const h = Math.abs(p.y - drag.startY);
          if (drag.initial.type === 'line' || drag.initial.type === 'arrow') {
            updateOverlayLive(drag.id, { x: drag.startX, y: drag.startY, width: p.x - drag.startX, height: p.y - drag.startY });
          } else {
            updateOverlayLive(drag.id, { x: minX, y: minY, width: Math.max(w, 1), height: Math.max(h, 1) });
          }
          break;
        }
        case 'draw': {
          const last = drag.points[drag.points.length - 1];
          const dx = p.x - last.x;
          const dy = p.y - last.y;
          if (dx * dx + dy * dy < MIN_DRAW_STEP * MIN_DRAW_STEP) return;
          dragRef.current = {
            ...drag,
            points: [...drag.points, { x: p.x, y: p.y }],
            minX: Math.min(drag.minX, p.x),
            minY: Math.min(drag.minY, p.y),
            maxX: Math.max(drag.maxX, p.x),
            maxY: Math.max(drag.maxY, p.y),
          };
          scheduleDrawFlush();
          break;
        }
        case 'erase': {
          const hit = topmostOverlay(p);
          if (hit) removeOverlays([hit.id]);
          break;
        }
        case 'pan': {
          const el = scrollRef.current;
          if (el) {
            el.scrollLeft = drag.startScrollLeft - (e.clientX - drag.startClientX);
            el.scrollTop = drag.startScrollTop - (e.clientY - drag.startClientY);
          }
          break;
        }
        case 'resize': {
          const dx = e.clientX - drag.startClientX;
          const dy = e.clientY - drag.startClientY;
          resizeFromHandle(drag.base, drag.handle, dx / zoom, dy / zoom, updateOverlayLive);
          break;
        }
        case 'rotate': {
          const base = drag.base;
          const centerX = base.x + base.width / 2;
          const centerY = base.y + base.height / 2;
          const angle = (Math.atan2(p.y - centerY, p.x - centerX) * 180) / Math.PI;
          const delta = angle - drag.startAngle;
          updateOverlayLive(drag.id, { rotation: Math.round(drag.base.rotation + delta) });
          break;
        }
      }
    },
    [pagePoint, topmostOverlay, updateOverlayLive, removeOverlays, scrollRef, zoom, scheduleDrawFlush]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      if (drag.kind === 'draw') flushDraw();
      dragRef.current = null;
      (e.currentTarget as HTMLElement).style.cursor = '';
      switch (drag.kind) {
        case 'move':
        case 'create':
        case 'draw':
        case 'resize':
        case 'rotate':
          if (drag.kind === 'create') {
            const overlay = state.overlays.find((o) => o.id === drag.id);
            const w = overlay ? overlay.width : 0;
            const h = overlay ? overlay.height : 0;
            if (w < drag.minSize && h < drag.minSize) {
              removeOverlays([drag.id]);
              return;
            }
          }
          if (drag.kind === 'draw') {
            const overlay = state.overlays.find((o) => o.id === drag.id);
            if (!overlay || (overlay as Extract<Overlay, { type: 'ink' }>).points.length < 2) {
              if (overlay) removeOverlays([drag.id]);
              return;
            }
          }
          pushHistory();
          break;
        case 'pan':
          break;
        case 'erase':
          break;
      }
    },
    [state.overlays, removeOverlays, pushHistory, flushDraw]
  );

  const commitTextEdit = useCallback(
    (id: string) => {
      setEditingId((current) => (current === id ? null : current));
      pushHistory();
    },
    [pushHistory]
  );

  const selectionOverlays = pageOverlays.filter((o) => state.selection.includes(o.id));

  const searchRects = state.search.rectsByPage[slotIndex] ?? [];
  const matchesBefore = state.search.perPage.slice(0, slotIndex).reduce((a, b) => a + b, 0);
  const activeMatchIndex = state.search.index - matchesBefore;

  return (
    <div
      className="page-slot relative mx-auto"
      style={{ width: width * zoom, height: height * zoom }}
      ref={boxRef}
      data-page={slotIndex}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.25)' }} />

      <div
        className="pdf-overlay-layer absolute inset-0"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
          touchAction: 'none',
          userSelect: 'none',
          cursor:
            state.tool === 'draw'
              ? 'crosshair'
              : state.tool === 'text' || state.tool === 'edit'
                ? 'text'
                : state.tool === 'hand'
                  ? 'grab'
                  : state.tool === 'select'
                    ? 'default'
                    : 'crosshair',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="relative" style={{ width, height }}>
          {pageOverlays.map((o) => (
            <OverlayNode
              key={o.id}
              overlay={o}
              editing={o.id === editingId}
              onTextChange={(text) => updateOverlayLive(o.id, { text })}
              onTextCommit={() => commitTextEdit(o.id)}
            />
          ))}

          {searchRects.map((r, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: r.x,
                top: r.y,
                width: r.width,
                height: r.height,
                background: i === activeMatchIndex ? 'rgba(250,204,21,0.55)' : 'rgba(59,130,246,0.3)',
                boxShadow: i === activeMatchIndex ? '0 0 0 1.5px rgba(180,83,9,0.7)' : undefined,
                pointerEvents: 'none',
              }}
            />
          ))}

          {selectionOverlays.length > 0 && (
            <SelectionHandles
              overlays={selectionOverlays}
              zoom={zoom}
              onStartResize={(id, base, handle, e) => {
                dragRef.current = {
                  kind: 'resize',
                  id,
                  base,
                  handle,
                  startClientX: e.clientX,
                  startClientY: e.clientY,
                };
                e.stopPropagation();
                e.currentTarget.setPointerCapture(e.pointerId);
              }}
              onStartRotate={(id, base, e) => {
                const centerX = base.x + base.width / 2;
                const centerY = base.y + base.height / 2;
                const el = boxRef.current;
                const rect = el?.getBoundingClientRect();
                const px = rect ? (e.clientX - rect.left) / zoom : 0;
                const py = rect ? (e.clientY - rect.top) / zoom : 0;
                dragRef.current = {
                  kind: 'rotate',
                  id,
                  base,
                  startClientX: e.clientX,
                  startClientY: e.clientY,
                  startAngle: (Math.atan2(py - centerY, px - centerX) * 180) / Math.PI,
                };
                e.stopPropagation();
                e.currentTarget.setPointerCapture(e.pointerId);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function resizeFromHandle(
  base: Overlay,
  handle: string,
  ldx: number,
  ldy: number,
  update: (id: string, patch: Partial<Overlay>) => void
) {
  // Un-rotate the drag delta into the overlay's local frame.
  const rad = (-base.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = ldx * cos - ldy * sin;
  const dy = ldx * sin + ldy * cos;

  let x = base.x;
  let y = base.y;
  let width = base.width;
  let height = base.height;

  if (handle.includes('e')) width = base.width + dx;
  if (handle.includes('s')) height = base.height + dy;
  if (handle.includes('w')) {
    x = base.x + dx;
    width = base.width - dx;
  }
  if (handle.includes('n')) {
    y = base.y + dy;
    height = base.height - dy;
  }

  const minW = base.type === 'text' ? 24 : base.type === 'form-checkbox' || base.type === 'form-radio' ? 8 : 3;
  const minH = base.type === 'text' ? 14 : 8;
  if (width < minW) {
    if (handle.includes('w')) x -= minW - width;
    width = minW;
  }
  if (height < minH) {
    if (handle.includes('n')) y -= minH - height;
    height = minH;
  }

  update(base.id, { x, y, width, height });
}
