import type { Overlay } from '../types';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function normalizeRect(a: { x: number; y: number }, b: { x: number; y: number }): Rect {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(b.x - a.x),
    height: Math.abs(b.y - a.y),
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function rotatePoint(p: { x: number; y: number }, center: { x: number; y: number }, deg: number) {
  const rad = degToRad(deg);
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = p.x - center.x;
  const dy = p.y - center.y;
  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  };
}

/** Rotated bounding box of an overlay (page coordinates, top-left origin). */
export function rotatedBounds(overlay: { x: number; y: number; width: number; height: number; rotation: number }): Rect {
  const cx = overlay.x + overlay.width / 2;
  const cy = overlay.y + overlay.height / 2;
  const corners = [
    { x: overlay.x, y: overlay.y },
    { x: overlay.x + overlay.width, y: overlay.y },
    { x: overlay.x + overlay.width, y: overlay.y + overlay.height },
    { x: overlay.x, y: overlay.y + overlay.height },
  ].map((p) => rotatePoint(p, { x: cx, y: cy }, overlay.rotation));
  const xs = corners.map((c) => c.x);
  const ys = corners.map((c) => c.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  return {
    x: minX,
    y: minY,
    width: Math.max(...xs) - minX,
    height: Math.max(...ys) - minY,
  };
}

export function boundsOfOverlays(overlays: Overlay[]): Rect | null {
  if (overlays.length === 0) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const o of overlays) {
    const b = rotatedBounds(o);
    minX = Math.min(minX, b.x);
    minY = Math.min(minY, b.y);
    maxX = Math.max(maxX, b.x + b.width);
    maxY = Math.max(maxY, b.y + b.height);
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export function hitTestOverlay(overlay: Overlay, px: number, py: number): boolean {
  const b = rotatedBounds(overlay);
  const pad = overlay.type === 'ink' ? 6 : 4;
  if (px < b.x - pad || px > b.x + b.width + pad || py < b.y - pad || py > b.y + b.height + pad) {
    return false;
  }
  // For lines use distance-to-segment test for a fairer hit area.
  if (overlay.type === 'line' || overlay.type === 'arrow') {
    return distanceToSegment(px, py, overlay.x, overlay.y, overlay.x + overlay.width, overlay.y + overlay.height) <= Math.max(overlay.strokeWidth / 2 + 4, 6);
  }
  if (overlay.type === 'ink') {
    for (let i = 0; i < overlay.points.length - 1; i++) {
      if (distanceToSegment(px, py, overlay.points[i].x, overlay.points[i].y, overlay.points[i + 1].x, overlay.points[i + 1].y) <= 6) {
        return true;
      }
    }
    return overlay.points.length === 1 && distance(overlay.points[0], { x: px, y: py }) <= 8;
  }
  if (overlay.type === 'ellipse') {
    // Distinguish from rect via the bounding box: ellipse hit = inside rotated ellipse.
    const local = unrotatePoint(px, py, { x: overlay.x + overlay.width / 2, y: overlay.y + overlay.height / 2 }, overlay.rotation);
    const rx = Math.max(overlay.width / 2, 0.001);
    const ry = Math.max(overlay.height / 2, 0.001);
    const nx = (local.x - (overlay.x + overlay.width / 2)) / rx;
    const ny = (local.y - (overlay.y + overlay.height / 2)) / ry;
    return nx * nx + ny * ny <= 1;
  }
  return true;
}

function unrotatePoint(x: number, y: number, center: { x: number; y: number }, deg: number) {
  return rotatePoint({ x, y }, center, -deg);
}

export function distanceToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return distance({ x: px, y: py }, { x: x1, y: y1 });
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = clamp(t, 0, 1);
  return distance({ x: px, y: py }, { x: x1 + t * dx, y: y1 + t * dy });
}

export function pageLabel(index: number): string {
  return `Page ${index + 1}`;
}
