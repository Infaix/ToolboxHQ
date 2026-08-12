import type {
  Overlay,
  TextOverlay,
  ImageOverlay,
  NoteOverlay,
  InkOverlay,
  MarkOverlay,
  RectOverlay,
  LineOverlay,
  FormTextOverlay,
  FormChoiceOverlay,
  RedactionOverlay,
} from '../types';
import { degToRad } from './geometry';
import { wrapText, getFontOption } from './textUtils';

export function drawOverlay(ctx: CanvasRenderingContext2D, overlay: Overlay) {
  ctx.save();
  ctx.globalAlpha = overlay.opacity;
  if (overlay.rotation) {
    const cx = overlay.x + overlay.width / 2;
    const cy = overlay.y + overlay.height / 2;
    ctx.translate(cx, cy);
    ctx.rotate(degToRad(overlay.rotation));
    ctx.translate(-cx, -cy);
  }
  switch (overlay.type) {
    case 'text':
      drawText(ctx, overlay);
      break;
    case 'image':
    case 'signature':
      drawImage(ctx, overlay);
      break;
    case 'ink':
      drawInk(ctx, overlay);
      break;
    case 'highlight':
      drawHighlight(ctx, overlay);
      break;
    case 'underline':
      drawUnderline(ctx, overlay);
      break;
    case 'strikethrough':
      drawStrikethrough(ctx, overlay);
      break;
    case 'rect':
      drawRect(ctx, overlay);
      break;
    case 'ellipse':
      drawEllipse(ctx, overlay);
      break;
    case 'line':
      drawLine(ctx, overlay);
      break;
    case 'arrow':
      drawArrow(ctx, overlay);
      break;
    case 'note':
      drawNote(ctx, overlay);
      break;
    case 'form-text':
    case 'form-dropdown':
    case 'form-date':
      drawFormText(ctx, overlay);
      break;
    case 'form-checkbox':
      drawCheckbox(ctx, overlay);
      break;
    case 'form-radio':
      drawRadio(ctx, overlay);
      break;
    case 'redaction':
      drawRedaction(ctx, overlay);
      break;
  }
  ctx.restore();
}

function drawText(ctx: CanvasRenderingContext2D, o: TextOverlay) {
  if (o.background) {
    ctx.fillStyle = o.background;
    ctx.fillRect(o.x, o.y, o.width, o.height);
  }
  const font = getFontOption(o.fontFamily);
  const cssFont = `${o.italic ? 'italic ' : ''}${o.bold ? 'bold ' : ''}${o.fontSize}px ${font.css}`;
  ctx.font = cssFont;
  ctx.fillStyle = o.color;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  if (o.letterSpacing) {
    // Canvas doesn't support letter-spacing directly on fillText in all browsers.
    ctx.letterSpacing = `${o.letterSpacing}px` as unknown as string;
  }
  const lines = wrapText(o.text, o.width, (chunk) => ctx.measureText(chunk).width);
  const lineHeight = o.fontSize * o.lineHeight;
  // CSS line boxes place the first line below the box top by half the leading
  // (line-height factor minus one). Match that so exports line up with the
  // on-screen overlay instead of drawing text higher than the user sees it.
  const halfLead = (o.fontSize * (o.lineHeight - 1)) / 2;
  lines.forEach((line, i) => {
    const w = ctx.measureText(line).width;
    let x = o.x;
    if (o.align === 'center') x = o.x + (o.width - w) / 2;
    if (o.align === 'right') x = o.x + o.width - w;
    ctx.fillText(line, x, o.y + halfLead + i * lineHeight);
  });
  ctx.letterSpacing = '0px' as unknown as string;
}

function drawImage(ctx: CanvasRenderingContext2D, o: ImageOverlay) {
  const img = imageCache.get(o.src);
  if (!img) return;
  ctx.drawImage(img, o.x, o.y, o.width, o.height);
}

function drawInk(ctx: CanvasRenderingContext2D, o: InkOverlay) {
  if (o.points.length === 0) return;
  ctx.strokeStyle = o.stroke;
  ctx.lineWidth = o.strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  if (o.points.length === 1) {
    ctx.moveTo(o.points[0].x, o.points[0].y);
    ctx.lineTo(o.points[0].x + 0.01, o.points[0].y);
    ctx.stroke();
    return;
  }
  if (o.points.length === 2) {
    ctx.moveTo(o.points[0].x, o.points[0].y);
    ctx.lineTo(o.points[1].x, o.points[1].y);
    ctx.stroke();
    return;
  }
  const pts = o.smooth ? smoothPoints(o.points) : o.points;
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length - 1; i++) {
    const p0 = pts[i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    ctx.bezierCurveTo(c1x, c1y, c2x, c2y, p2.x, p2.y);
  }
  const last = pts[pts.length - 1];
  ctx.lineTo(last.x, last.y);
  ctx.stroke();
}

function drawHighlight(ctx: CanvasRenderingContext2D, o: MarkOverlay) {
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = o.color;
  ctx.fillRect(o.x, o.y, o.width, o.height);
  ctx.globalCompositeOperation = 'source-over';
}

function drawUnderline(ctx: CanvasRenderingContext2D, o: MarkOverlay) {
  ctx.strokeStyle = o.color;
  ctx.lineWidth = Math.max(1, o.height * 0.12);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(o.x, o.y + o.height * 0.85);
  ctx.lineTo(o.x + o.width, o.y + o.height * 0.85);
  ctx.stroke();
}

function drawStrikethrough(ctx: CanvasRenderingContext2D, o: MarkOverlay) {
  ctx.strokeStyle = o.color;
  ctx.lineWidth = Math.max(1, o.height * 0.1);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(o.x, o.y + o.height / 2);
  ctx.lineTo(o.x + o.width, o.y + o.height / 2);
  ctx.stroke();
}

function drawRect(ctx: CanvasRenderingContext2D, o: RectOverlay) {
  if (o.fill) {
    ctx.fillStyle = o.fill;
    ctx.fillRect(o.x, o.y, o.width, o.height);
  }
  if (o.stroke && o.strokeWidth > 0) {
    ctx.strokeStyle = o.stroke;
    ctx.lineWidth = o.strokeWidth;
    ctx.strokeRect(o.x, o.y, o.width, o.height);
  }
}

function drawEllipse(ctx: CanvasRenderingContext2D, o: RectOverlay) {
  ctx.beginPath();
  ctx.ellipse(o.x + o.width / 2, o.y + o.height / 2, Math.max(0.5, o.width / 2), Math.max(0.5, o.height / 2), 0, 0, Math.PI * 2);
  if (o.fill) {
    ctx.fillStyle = o.fill;
    ctx.fill();
  }
  if (o.stroke && o.strokeWidth > 0) {
    ctx.strokeStyle = o.stroke;
    ctx.lineWidth = o.strokeWidth;
    ctx.stroke();
  }
}

function drawLine(ctx: CanvasRenderingContext2D, o: LineOverlay) {
  ctx.strokeStyle = o.stroke;
  ctx.lineWidth = o.strokeWidth;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(o.x, o.y);
  ctx.lineTo(o.x + o.width, o.y + o.height);
  ctx.stroke();
}

function drawArrow(ctx: CanvasRenderingContext2D, o: LineOverlay) {
  const x1 = o.x;
  const y1 = o.y;
  const x2 = o.x + o.width;
  const y2 = o.y + o.height;
  ctx.strokeStyle = o.stroke;
  ctx.fillStyle = o.stroke;
  ctx.lineWidth = o.strokeWidth;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = Math.max(8, o.strokeWidth * 3.5);
  const spread = Math.PI / 7;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - head * Math.cos(angle - spread), y2 - head * Math.sin(angle - spread));
  ctx.lineTo(x2 - head * Math.cos(angle + spread), y2 - head * Math.sin(angle + spread));
  ctx.closePath();
  ctx.fill();
}

function drawNote(ctx: CanvasRenderingContext2D, o: NoteOverlay) {
  ctx.fillStyle = o.color;
  const r = 3;
  const w = o.width;
  const h = o.height;
  ctx.beginPath();
  ctx.moveTo(o.x + r, o.y);
  ctx.lineTo(o.x + w - r, o.y);
  ctx.quadraticCurveTo(o.x + w, o.y, o.x + w, o.y + r);
  ctx.lineTo(o.x + w, o.y + h - r);
  ctx.quadraticCurveTo(o.x + w, o.y + h, o.x + w - r, o.y + h);
  ctx.lineTo(o.x + r, o.y + h);
  ctx.quadraticCurveTo(o.x, o.y + h, o.x, o.y + h - r);
  ctx.lineTo(o.x, o.y + r);
  ctx.quadraticCurveTo(o.x, o.y, o.x + r, o.y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 1;
  ctx.stroke();
  if (o.text) {
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.font = `${o.fontSize}px Helvetica, Arial, sans-serif`;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    const lines = wrapText(o.text, o.width - 10, (chunk) => ctx.measureText(chunk).width).slice(0, 4);
    lines.forEach((line, i) => ctx.fillText(line, o.x + 5, o.y + 5 + i * (o.fontSize + 2)));
  }
}

function drawFormText(ctx: CanvasRenderingContext2D, o: FormTextOverlay) {
  ctx.fillStyle = o.backgroundColor;
  ctx.fillRect(o.x, o.y, o.width, o.height);
  ctx.strokeStyle = o.borderColor;
  ctx.lineWidth = 1;
  ctx.strokeRect(o.x + 0.5, o.y + 0.5, o.width - 1, o.height - 1);
  const text = o.value !== '' ? o.value : o.placeholder;
  if (text) {
    ctx.fillStyle = o.value !== '' ? o.color : 'rgba(120,120,120,0.8)';
    ctx.font = `${o.fontSize}px ${getFontOption(o.fontFamily).css}`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText(text, o.x + 5, o.y + o.height / 2);
  }
  if (o.type === 'form-dropdown') {
    const cy = o.y + o.height / 2;
    const cx = o.x + o.width - 12;
    ctx.fillStyle = o.color;
    ctx.beginPath();
    ctx.moveTo(cx - 4, cy - 1);
    ctx.lineTo(cx + 4, cy - 1);
    ctx.lineTo(cx, cy + 3);
    ctx.closePath();
    ctx.fill();
  }
}

function drawCheckbox(ctx: CanvasRenderingContext2D, o: FormChoiceOverlay) {
  ctx.strokeStyle = o.borderColor;
  ctx.lineWidth = Math.max(1, o.width * 0.08);
  ctx.strokeRect(o.x + 0.5, o.y + 0.5, o.width - 1, o.height - 1);
  if (o.checked) {
    ctx.strokeStyle = o.checkColor;
    ctx.lineWidth = Math.max(1.5, o.width * 0.12);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(o.x + o.width * 0.22, o.y + o.height * 0.52);
    ctx.lineTo(o.x + o.width * 0.44, o.y + o.height * 0.72);
    ctx.lineTo(o.x + o.width * 0.8, o.y + o.height * 0.28);
    ctx.stroke();
  }
}

function drawRadio(ctx: CanvasRenderingContext2D, o: FormChoiceOverlay) {
  ctx.beginPath();
  ctx.arc(o.x + o.width / 2, o.y + o.height / 2, Math.max(0.5, o.width / 2 - 1), 0, Math.PI * 2);
  ctx.strokeStyle = o.borderColor;
  ctx.lineWidth = Math.max(1, o.width * 0.08);
  ctx.stroke();
  if (o.checked) {
    ctx.beginPath();
    ctx.arc(o.x + o.width / 2, o.y + o.height / 2, Math.max(1, o.width * 0.25), 0, Math.PI * 2);
    ctx.fillStyle = o.checkColor;
    ctx.fill();
  }
}

function drawRedaction(ctx: CanvasRenderingContext2D, o: RedactionOverlay) {
  ctx.fillStyle = '#000000';
  ctx.fillRect(o.x, o.y, o.width, o.height);
}

export function smoothPoints(points: { x: number; y: number }[]): { x: number; y: number }[] {
  if (points.length < 3) return points;
  const out: { x: number; y: number }[] = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];
    out.push({ x: (prev.x + curr.x * 2 + next.x) / 4, y: (prev.y + curr.y * 2 + next.y) / 4 });
  }
  out.push(points[points.length - 1]);
  return out;
}

const imageCache = new Map<string, HTMLImageElement>();
export async function loadImage(src: string): Promise<HTMLImageElement | null> {
  const cached = imageCache.get(src);
  if (cached) return cached;
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export async function preloadOverlayImages(overlays: Overlay[]): Promise<void> {
  await Promise.all(
    overlays
      .filter((o) => o.type === 'image' || o.type === 'signature')
      .map((o) => loadImage((o as ImageOverlay).src))
  );
}
