'use client';

import { memo } from 'react';
import type { Overlay } from '../types';
import { boundsOfOverlays } from '../lib/geometry';

export interface SelectionHandlesProps {
  overlays: Overlay[];
  zoom: number;
  onStartResize: (id: string, base: Overlay, handle: string, e: React.PointerEvent) => void;
  onStartRotate: (id: string, base: Overlay, e: React.PointerEvent) => void;
}

const HANDLE_STYLE: React.CSSProperties = {
  position: 'absolute',
  width: 8,
  height: 8,
  border: '1.5px solid #ffffff',
  background: '#3b82f6',
  borderRadius: 2,
  boxShadow: '0 0 0 1px rgba(0,0,0,0.4)',
  touchAction: 'none',
};

const CURSORS: Record<string, string> = {
  nw: 'nwse-resize',
  n: 'ns-resize',
  ne: 'nesw-resize',
  e: 'ew-resize',
  se: 'nwse-resize',
  s: 'ns-resize',
  sw: 'nesw-resize',
  w: 'ew-resize',
};

function SelectionHandlesInner({ overlays, onStartResize, onStartRotate }: SelectionHandlesProps) {
  const bounds = boundsOfOverlays(overlays);
  if (!bounds) return null;

  const single = overlays.length === 1;
  const base = single ? overlays[0] : undefined;

  const handles: { id: string; x: number; y: number }[] = [
    { id: 'nw', x: bounds.x, y: bounds.y },
    { id: 'n', x: bounds.x + bounds.width / 2, y: bounds.y },
    { id: 'ne', x: bounds.x + bounds.width, y: bounds.y },
    { id: 'e', x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2 },
    { id: 'se', x: bounds.x + bounds.width, y: bounds.y + bounds.height },
    { id: 's', x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height },
    { id: 'sw', x: bounds.x, y: bounds.y + bounds.height },
    { id: 'w', x: bounds.x, y: bounds.y + bounds.height / 2 },
  ];

  return (
    <div
      style={{
        position: 'absolute',
        left: bounds.x - 4,
        top: bounds.y - 4,
        width: bounds.width + 8,
        height: bounds.height + 8,
        border: '1.5px solid #3b82f6',
        pointerEvents: 'none',
      }}
    >
      {/* Rotate handle */}
      <div
        style={{
          position: 'absolute',
          left: bounds.width / 2 - 5,
          top: -28,
          width: 10,
          height: 10,
          borderRadius: '50%',
          border: '1.5px solid #ffffff',
          background: '#3b82f6',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.4)',
          pointerEvents: 'auto',
          cursor: 'grab',
          touchAction: 'none',
        }}
        onPointerDown={(e) => {
          if (base) onStartRotate(base.id, base, e);
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: bounds.width / 2 - 0.5,
          top: -19,
          width: 1,
          height: 12,
          background: '#3b82f6',
          pointerEvents: 'none',
        }}
      />

      {single &&
        handles.map((h) => (
          <div
            key={h.id}
            style={{
              ...HANDLE_STYLE,
              left: h.x - bounds.x - 4,
              top: h.y - bounds.y - 4,
              cursor: CURSORS[h.id] ?? 'move',
              pointerEvents: 'auto',
              touchAction: 'none',
            }}
            onPointerDown={(e) => {
              if (base) onStartResize(base.id, base, h.id, e);
            }}
          />
        ))}
    </div>
  );
}

export const SelectionHandles = memo(SelectionHandlesInner);
