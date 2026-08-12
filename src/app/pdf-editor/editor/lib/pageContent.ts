import type { PDFDocumentProxy, PDFPageProxy, PageViewport } from 'pdfjs-dist';
import { OPS } from 'pdfjs-dist';

export interface PageRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TextStyleInfo {
  /** One of the editor's font ids (helvetica, arial, times, georgia, courier, verdana). */
  fontFamily: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  /** Hex color, e.g. "#111827". */
  color: string;
  align: 'left' | 'center' | 'right';
}

export interface EditableTextRegion extends PageRegion, TextStyleInfo {
  text: string;
}

/** A cluster of lines that form one paragraph, suitable for a single edit box. */
export interface EditableTextBlock extends PageRegion {
  text: string;
  lines: EditableTextRegion[];
  fontFamily: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  color: string;
  align: 'left' | 'center' | 'right';
  /** Vertical line spacing as a multiple of the font size. */
  lineHeight: number;
}

interface TextItemLike {
  str: string;
  width: number;
  height: number;
  transform: number[];
  fontName: string;
}

interface FontLike {
  name?: string;
  fallbackName?: string;
  bold?: boolean;
  italic?: boolean;
  oblique?: boolean;
  black?: boolean;
}

const IMAGE_OPS = new Set([
  OPS.paintImageXObject,
  OPS.paintInlineImageXObject,
  OPS.paintImageMaskXObject,
  OPS.paintImageXObjectRepeat,
]);

/**
 * Find the bounding boxes of every image drawn on a page, in viewport
 * (top-left origin, scale 1) coordinates. Works by replaying the operator
 * list and tracking the current transformation matrix.
 */
export async function detectImageRegions(pdf: PDFDocumentProxy, origIndex: number, rotation: number): Promise<PageRegion[]> {
  const page = await pdf.getPage(origIndex + 1);
  const viewport = page.getViewport({ scale: 1, rotation });
  const opList = await page.getOperatorList();
  const fns = opList.fnArray;
  const args = opList.argsArray;

  const stack: number[][] = [];
  let ctm = [1, 0, 0, 1, 0, 0];
  const regions: PageRegion[] = [];

  for (let i = 0; i < fns.length; i++) {
    const fn = fns[i];
    const arg = (args[i] ?? []) as number[];
    if (fn === OPS.save) {
      stack.push(ctm);
      continue;
    }
    if (fn === OPS.restore) {
      ctm = stack.pop() ?? ctm;
      continue;
    }
    if (fn === OPS.transform) {
      const [a, b, c, d, e, f] = arg;
      const [p, q, r, s, u, v] = ctm;
      ctm = [
        p * a + r * b,
        q * a + s * b,
        p * c + r * d,
        q * c + s * d,
        p * e + r * f + u,
        q * e + s * f + v,
      ];
      continue;
    }
    if (IMAGE_OPS.has(fn)) {
      const [a, b, c, d, e, f] = ctm;
      const corners: [number, number][] = [
        [e, f],
        [e + a, f + b],
        [e + c, f + d],
        [e + a + c, f + b + d],
      ];
      const pts = corners.map(([x, y]) => viewport.convertToViewportPoint(x, y) as [number, number]);
      const xs = pts.map((p) => p[0]);
      const ys = pts.map((p) => p[1]);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      const width = Math.max(...xs) - minX;
      const height = Math.max(...ys) - minY;
      if (width > 0.5 && height > 0.5) regions.push({ x: minX, y: minY, width, height });
    }
  }

  return dedupeRegions(regions);
}

/**
 * Detect text on a page and group the items into lines, preserving the
 * original font family, size, weight, style, colour and alignment so an
 * edited line can look identical to the source text.
 */
export async function detectTextRegions(pdf: PDFDocumentProxy, origIndex: number, rotation: number): Promise<EditableTextRegion[]> {
  const page = await pdf.getPage(origIndex + 1);
  const content = await page.getTextContent();
  const viewport = page.getViewport({ scale: 1, rotation });
  const opList = await page.getOperatorList();

  const colorSegments = textColorSegments(opList);
  let charOffset = 0;

  const entries = (content.items as TextItemLike[])
    .map((item) => {
      const style = styleForItem(page, item, viewport, colorSegments, charOffset);
      charOffset += item.str.length;
      const rect = itemToRect(item, viewport);
      return {
        rect,
        text: item.str ?? '',
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        bold: style.bold,
        italic: style.italic,
        underline: style.underline,
        color: style.color,
        align: 'left' as const,
      };
    })
    .filter((e) => e.text.trim().length > 0 && e.rect.width > 0.1 && e.rect.height > 0.1);

  const lines: EditableTextRegion[] = [];

  for (const entry of entries) {
    const yCenter = entry.rect.y + entry.rect.height / 2;
    let placed = false;
    for (const line of lines) {
      const lineCenter = line.y + line.height / 2;
      const tolerance = Math.max(line.fontSize, entry.fontSize) * 0.65;
      if (Math.abs(yCenter - lineCenter) <= tolerance) {
        line.x = Math.min(line.x, entry.rect.x);
        line.y = Math.min(line.y, entry.rect.y);
        const right = Math.max(line.x + line.width, entry.rect.x + entry.rect.width);
        const bottom = Math.max(line.y + line.height, entry.rect.y + entry.rect.height);
        line.width = right - line.x;
        line.height = bottom - line.y;
        line.text = `${line.text} ${entry.text}`;
        line.fontSize = Math.max(line.fontSize, entry.fontSize);
        if (entry.bold) line.bold = true;
        if (entry.italic) line.italic = true;
        if (entry.underline) line.underline = true;
        placed = true;
        break;
      }
    }
    if (!placed) {
      lines.push({
        x: entry.rect.x,
        y: entry.rect.y,
        width: entry.rect.width,
        height: entry.rect.height,
        text: entry.text,
        fontFamily: entry.fontFamily,
        fontSize: entry.fontSize,
        bold: entry.bold,
        italic: entry.italic,
        underline: entry.underline,
        color: entry.color,
        align: 'left',
      });
    }
  }

  const pageWidth = viewport.width;
  return lines
    .filter((l) => l.text.trim().length > 0 && l.width > 1 && l.height > 1)
    .map((l) => ({ ...l, align: detectAlign(l, pageWidth) }));
}

/**
 * Group the detected lines into paragraph blocks so clicking anywhere in a
 * paragraph edits the whole paragraph as one box rather than a single line.
 */
export async function detectTextBlocks(pdf: PDFDocumentProxy, origIndex: number, rotation: number): Promise<EditableTextBlock[]> {
  const lines = await detectTextRegions(pdf, origIndex, rotation);
  const sorted = [...lines].sort((a, b) => a.y - b.y || a.x - b.x);

  const blocks: EditableTextBlock[] = [];
  let current: EditableTextRegion[] = [];

  const flush = () => {
    if (current.length === 0) return;
    const x = Math.min(...current.map((l) => l.x));
    const y = Math.min(...current.map((l) => l.y));
    const maxX = Math.max(...current.map((l) => l.x + l.width));
    const maxY = Math.max(...current.map((l) => l.y + l.height));
    const first = current[0];
    const fontSize = Math.max(...current.map((l) => l.fontSize));
    const lineHeight = estimateLineHeight(current, fontSize);
    blocks.push({
      x,
      y,
      width: maxX - x,
      height: maxY - y,
      text: current.map((l) => l.text).join('\n'),
      lines: current,
      fontFamily: first.fontFamily,
      fontSize,
      bold: current.some((l) => l.bold),
      italic: current.some((l) => l.italic),
      color: first.color,
      align: first.align,
      lineHeight,
    });
    current = [];
  };

  for (const line of sorted) {
    if (current.length === 0) {
      current.push(line);
      continue;
    }
    const last = current[current.length - 1];
    const gap = line.y - (last.y + last.height);
    const lineHeight = Math.max(last.height, line.height);
    const startX = current[0].x;
    const indent = line.x - startX;
    const fontChanged = Math.abs(line.fontSize - current[0].fontSize) > 5;
    const newBlock =
      gap > lineHeight * 1.9 ||
      (gap > lineHeight * 0.8 && indent > Math.max(18, lineHeight * 1.5)) ||
      fontChanged;
    if (newBlock) flush();
    current.push(line);
  }
  flush();

  return blocks;
}

function estimateLineHeight(lines: EditableTextRegion[], fontSize: number): number {
  if (lines.length < 2) return 1.25;
  const ratios: number[] = [];
  for (let i = 1; i < lines.length; i++) {
    const spacing = lines[i].y - lines[i - 1].y;
    ratios.push(spacing / fontSize);
  }
  const avg = ratios.reduce((a, b) => a + b, 0) / ratios.length;
  return Math.min(1.7, Math.max(1.0, avg));
}

function detectAlign(line: PageRegion, pageWidth: number): 'left' | 'center' | 'right' {
  if (line.width > pageWidth * 0.85) return 'left';
  const leftGap = line.x;
  const rightGap = pageWidth - (line.x + line.width);
  if (Math.abs(leftGap - rightGap) < Math.min(24, pageWidth * 0.08)) return 'center';
  if (rightGap < Math.max(12, leftGap * 0.5)) return 'right';
  return 'left';
}

function styleForItem(
  page: PDFPageProxy,
  item: TextItemLike,
  viewport: PageViewport,
  colorSegments: { offset: number; color: string }[],
  charOffset: number
): TextStyleInfo {
  const transformSize = fontSizeFromTransform(item.transform);
  // Keep the transform-derived size in a sane range relative to the measured
  // text height so a page-level CTM scale doesn't make fonts come out too big.
  const heightSize = item.height && item.height > 0 ? item.height : transformSize;
  const fontSize = Math.max(1, Math.min(Math.max(transformSize, heightSize * 0.5), Math.max(transformSize, heightSize * 1.5)));
  const font = resolveFont(page, item.fontName);
  return {
    fontFamily: fontFamilyFor(font),
    fontSize,
    bold: Boolean(font?.bold || font?.black),
    italic: Boolean(font?.italic || font?.oblique),
    underline: false,
    color: colorForOffset(colorSegments, charOffset),
    align: 'left',
  };
}

function resolveFont(page: PDFPageProxy, fontName: string): FontLike | null {
  try {
    const obj = (page as unknown as { commonObjs?: { get?: (id: string) => unknown } }).commonObjs?.get?.(fontName);
    if (!obj) return null;
    const font = obj as FontLike;
    return {
      name: typeof font.name === 'string' ? font.name : undefined,
      fallbackName: typeof font.fallbackName === 'string' ? font.fallbackName : undefined,
      bold: Boolean(font.bold),
      italic: Boolean(font.italic),
      oblique: Boolean(font.oblique),
      black: Boolean(font.black),
    };
  } catch {
    return null;
  }
}

function fontFamilyFor(font: FontLike | null): string {
  const name = (font?.name ?? '').toLowerCase();
  if (name.includes('times')) return 'times';
  if (name.includes('georgia')) return 'georgia';
  if (name.includes('verdana')) return 'verdana';
  if (name.includes('courier')) return 'courier';
  if (name.includes('arial')) return 'arial';
  if (name.includes('helvetica')) return 'helvetica';

  const fallback = (font?.fallbackName ?? '').toLowerCase();
  if (fallback.includes('times') || fallback.includes('serif')) return 'times';
  if (fallback.includes('courier') || fallback.includes('mono')) return 'courier';
  return 'helvetica';
}

function fontSizeFromTransform(transform: number[]): number {
  const a = Math.abs(transform[0] ?? 0);
  const b = Math.abs(transform[1] ?? 0);
  const size = Math.max(a, b) === 0 ? 10 : Math.hypot(a, b);
  return Math.min(200, Math.max(1, size));
}

/**
 * Replay the operator list and record the fill colour that was active at the
 * start of every shown text chunk, keyed by cumulative character offset so the
 * colours line up with the items returned by getTextContent().
 */
function textColorSegments(opList: { fnArray: number[]; argsArray: unknown[][] }): { offset: number; color: string }[] {
  const fns = opList.fnArray;
  const args = opList.argsArray;
  const stack: string[] = [];
  let color = '#000000';
  let space = 'DeviceRGB';
  const segments: { offset: number; color: string }[] = [];
  let offset = 0;

  const emit = (text: string) => {
    if (text.length === 0) return;
    segments.push({ offset, color });
    offset += text.length;
  };

  for (let i = 0; i < fns.length; i++) {
    const fn = fns[i];
    const a = (args[i] ?? []) as (string | number)[];
    switch (fn) {
      case OPS.save:
        stack.push(color);
        break;
      case OPS.restore:
        color = stack.pop() ?? '#000000';
        break;
      case OPS.setFillColorSpace:
        space = String(a[0] ?? '');
        break;
      case OPS.setFillGray:
        color = hexRgb(Number(a[0]), Number(a[0]), Number(a[0]));
        break;
      case OPS.setFillRGBColor:
        color = hexRgb(Number(a[0]), Number(a[1]), Number(a[2]));
        break;
      case OPS.setFillCMYKColor:
        color = hexCmyk(Number(a[0]), Number(a[1]), Number(a[2]), Number(a[3]));
        break;
      case OPS.setFillColorN: {
        if (space === 'DeviceGray') {
          color = hexRgb(Number(a[0]), Number(a[0]), Number(a[0]));
        } else if (space === 'DeviceRGB') {
          color = hexRgb(Number(a[0]), Number(a[1]), Number(a[2]));
        } else if (space === 'DeviceCMYK') {
          color = hexCmyk(Number(a[0]), Number(a[1]), Number(a[2]), Number(a[3]));
        }
        break;
      }
      case OPS.showText:
      case OPS.showSpacedText:
      case OPS.nextLineShowText: {
        const chars = a[0];
        if (Array.isArray(chars)) {
          for (const c of chars) {
            if (typeof c === 'string') emit(c);
          }
        }
        break;
      }
      default:
        break;
    }
  }

  return segments;
}

function colorForOffset(segments: { offset: number; color: string }[], offset: number): string {
  let color = '#000000';
  for (const seg of segments) {
    if (seg.offset > offset) break;
    color = seg.color;
  }
  return color;
}

function itemToRect(item: TextItemLike, viewport: PageViewport): PageRegion {
  const [, , , d, e, f] = item.transform;
  const textWidth = item.width;
  const fontSize = Math.max(item.height || Math.abs(d) || 10, 1);
  const ascent = fontSize * 0.85;
  const descent = fontSize * 0.2;
  const x0 = e;
  const y0 = f + ascent;
  const x1 = e + textWidth;
  const y1 = f - descent;
  const topLeft = viewport.convertToViewportPoint(x0, y0) as [number, number];
  const bottomRight = viewport.convertToViewportPoint(x1, y1) as [number, number];
  const x = Math.min(topLeft[0], bottomRight[0]);
  const y = Math.min(topLeft[1], bottomRight[1]);
  return {
    x,
    y,
    width: Math.max(Math.abs(bottomRight[0] - topLeft[0]), 1),
    height: Math.max(Math.abs(bottomRight[1] - topLeft[1]), 1),
  };
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function hexRgb(r: number, g: number, b: number): string {
  const toHex = (v: number) =>
    Math.round(clamp01(v) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexCmyk(c: number, m: number, y: number, k: number): string {
  const r = 1 - Math.min(1, c) * (1 - Math.min(1, k)) - Math.min(1, k);
  const g = 1 - Math.min(1, m) * (1 - Math.min(1, k)) - Math.min(1, k);
  const b = 1 - Math.min(1, y) * (1 - Math.min(1, k)) - Math.min(1, k);
  return hexRgb(r, g, b);
}

function dedupeRegions(regions: PageRegion[]): PageRegion[] {
  const out: PageRegion[] = [];
  for (const region of regions) {
    const overlaps = out.some((existing) => {
      return existing.x < region.x + region.width && region.x < existing.x + existing.width && existing.y < region.y + region.height && region.y < existing.y + existing.height;
    });
    if (!overlaps) out.push(region);
  }
  return out;
}
