'use client';

import { memo } from 'react';
import type { Overlay } from '../types';
import { getFontOption } from '../lib/textUtils';

export interface OverlayNodeProps {
  overlay: Overlay;
  editing?: boolean;
  onTextChange?: (text: string) => void;
  onTextCommit?: () => void;
}

function OverlayNodeInner({ overlay, editing, onTextChange, onTextCommit }: OverlayNodeProps) {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: overlay.x,
    top: overlay.y,
    width: overlay.width,
    height: overlay.height,
    transform: `rotate(${overlay.rotation}deg)`,
    opacity: overlay.opacity,
    transformOrigin: 'center center',
  };

  switch (overlay.type) {
    case 'text': {
      const font = getFontOption(overlay.fontFamily);
      return (
        <div
          style={{
            ...style,
            fontFamily: font.css,
            fontSize: overlay.fontSize,
            fontWeight: overlay.bold ? 700 : 400,
            fontStyle: overlay.italic ? 'italic' : 'normal',
            color: overlay.color,
            textAlign: overlay.align,
            lineHeight: overlay.lineHeight,
            letterSpacing: overlay.letterSpacing,
            background: overlay.background ?? (editing ? 'rgba(59,130,246,0.07)' : undefined),
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            overflow: 'hidden',
            boxSizing: 'border-box',
            textDecoration: overlay.underline ? 'underline' : undefined,
            border: editing ? '2px dashed #3b82f6' : undefined,
            borderRadius: editing ? 3 : undefined,
            padding: editing ? '0 3px' : undefined,
            cursor: editing ? 'text' : undefined,
          }}
          contentEditable={editing}
          suppressContentEditableWarning
          onInput={(e) => onTextChange?.(e.currentTarget.textContent ?? '')}
          onBlur={onTextCommit}
          onKeyDown={(e) => {
            // Don't commit/blur while an IME composition (e.g. CJK) is active.
            if (e.nativeEvent.isComposing) return;
            if (e.key === 'Escape') {
              e.currentTarget.blur();
            } else if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
        >
          {overlay.text}
        </div>
      );
    }
    case 'image':
    case 'signature':
      return <img src={overlay.src} alt="" draggable={false} style={{ ...style, objectFit: 'fill', pointerEvents: 'none', userSelect: 'none' }} />;
    case 'note':
      return (
        <div
          style={{
            ...style,
            background: overlay.color,
            borderRadius: 4,
            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            padding: 6,
            fontSize: overlay.fontSize,
            color: 'rgba(0,0,0,0.85)',
            overflow: 'hidden',
            boxSizing: 'border-box',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {overlay.text}
        </div>
      );
    case 'ink':
      return (
        <svg
          style={{ ...style, pointerEvents: 'none' }}
          width={overlay.width}
          height={overlay.height}
          viewBox={`${overlay.x} ${overlay.y} ${overlay.width} ${overlay.height}`}
          overflow="visible"
        >
          <path
            d={inkPath(overlay.points)}
            fill="none"
            stroke={overlay.stroke}
            strokeWidth={overlay.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'highlight':
      return <div style={{ ...style, background: overlay.color, mixBlendMode: 'multiply' }} />;
    case 'underline':
      return (
        <div style={{ ...style, borderBottom: `${Math.max(1, overlay.height * 0.14)}px solid ${overlay.color}` }} />
      );
    case 'strikethrough':
      return (
        <div
          style={{
            ...style,
            background: overlay.color,
            height: Math.max(1.5, overlay.height * 0.12),
            marginTop: overlay.height / 2,
            top: overlay.y + overlay.height / 2,
          }}
        />
      );
    case 'rect':
      return (
        <div
          style={{
            ...style,
            background: overlay.fill ?? 'transparent',
            border: overlay.strokeWidth > 0 ? `${overlay.strokeWidth}px solid ${overlay.stroke}` : undefined,
            boxSizing: 'border-box',
          }}
        />
      );
    case 'ellipse':
      return (
        <div
          style={{
            ...style,
            background: overlay.fill ?? 'transparent',
            border: overlay.strokeWidth > 0 ? `${overlay.strokeWidth}px solid ${overlay.stroke}` : undefined,
            boxSizing: 'border-box',
            borderRadius: '50%',
          }}
        />
      );
    case 'line':
    case 'arrow':
      return (
        <svg style={{ ...style, overflow: 'visible' }} width={overlay.width} height={overlay.height}>
          <defs>
            <marker id={`arrowhead-${overlay.id}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill={overlay.stroke} />
            </marker>
          </defs>
          <line
            x1={overlay.width === 0 && overlay.height === 0 ? 0 : overlay.type === 'arrow' ? 2 : 0}
            y1={overlay.width === 0 && overlay.height === 0 ? 0 : overlay.type === 'arrow' ? 2 : 0}
            x2={overlay.width}
            y2={overlay.height}
            stroke={overlay.stroke}
            strokeWidth={overlay.strokeWidth}
            strokeLinecap="round"
            markerEnd={overlay.type === 'arrow' ? `url(#arrowhead-${overlay.id})` : undefined}
          />
        </svg>
      );
    case 'form-text':
    case 'form-dropdown':
    case 'form-date':
      return (
        <div
          style={{
            ...style,
            background: overlay.backgroundColor,
            border: `1px solid ${overlay.borderColor}`,
            boxSizing: 'border-box',
            borderRadius: 2,
            padding: '0 4px',
            fontSize: overlay.fontSize,
            fontFamily: getFontOption(overlay.fontFamily).css,
            color: overlay.value ? overlay.color : 'rgba(120,120,120,0.8)',
            display: 'flex',
            alignItems: 'center',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {overlay.value !== '' ? overlay.value : overlay.placeholder}
          </span>
          {overlay.type === 'form-dropdown' && <span style={{ marginLeft: 'auto', paddingLeft: 4 }}>▾</span>}
        </div>
      );
    case 'form-checkbox':
    case 'form-radio':
      return (
        <div
          style={{
            ...style,
            border: `1.5px solid ${overlay.borderColor}`,
            borderRadius: overlay.type === 'form-radio' ? '50%' : 2,
            boxSizing: 'border-box',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {overlay.checked &&
            (overlay.type === 'form-radio' ? (
              <span style={{ width: '45%', height: '45%', borderRadius: '50%', background: overlay.checkColor }} />
            ) : (
              <svg width="70%" height="70%" viewBox="0 0 24 24" fill="none" stroke={overlay.checkColor} strokeWidth={3} strokeLinecap="round">
                <path d="M4 12.5l5 5L20 6.5" />
              </svg>
            ))}
        </div>
      );
    case 'redaction':
      return (
        <div
          style={{
            ...style,
            background: '#111827',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 8,
            overflow: 'hidden',
            textTransform: 'uppercase',
          }}
        >
          {overlay.label || 'Redacted'}
        </div>
      );
    default:
      return null;
  }
}

function inkPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M${points[0].x} ${points[0].y} L${points[0].x + 0.01} ${points[0].y}`;
  if (points.length === 2) return `M${points[0].x} ${points[0].y} L${points[1].x} ${points[1].y}`;
  let d = `M${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  const last = points[points.length - 1];
  d += ` L${last.x} ${last.y}`;
  return d;
}

export const OverlayNode = memo(OverlayNodeInner);
