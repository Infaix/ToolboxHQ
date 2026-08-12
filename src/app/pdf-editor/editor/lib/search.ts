import type { PDFDocumentProxy, PageViewport } from 'pdfjs-dist';
import type { DocSlot } from '../types';

export interface MatchRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PageSearchResult {
  count: number;
  rects: MatchRect[];
}

interface TextItemLike {
  str: string;
  width: number;
  height: number;
  transform: number[];
}

interface CharRef {
  itemIndex: number;
}

export async function searchPage(pdf: PDFDocumentProxy, slot: DocSlot, query: string): Promise<PageSearchResult> {
  if (!query.trim()) return { count: 0, rects: [] };
  const needle = query.trim().toLowerCase();
  const page = await pdf.getPage(slot.origIndex + 1);
  const content = await page.getTextContent();
  const viewport = page.getViewport({ scale: 1, rotation: slot.rotation });

  const items = content.items as TextItemLike[];
  const charMap: CharRef[] = [];
  const itemRects: MatchRect[] = items.map((item) => itemToRect(item, viewport));

  let pageText = '';
  for (let i = 0; i < items.length; i++) {
    const str = items[i].str ?? '';
    const start = pageText.length;
    pageText += str.toLowerCase();
    for (let c = start; c < pageText.length; c++) charMap.push({ itemIndex: i });
    // Insert a space so matches don't span arbitrary item boundaries weirdly.
    pageText += ' ';
    charMap.push({ itemIndex: -1 });
  }

  const matches: MatchRect[] = [];
  let idx = 0;
  while (idx < pageText.length) {
    const found = pageText.indexOf(needle, idx);
    if (found === -1) break;
    const end = found + needle.length;
    const involved = new Set<number>();
    for (let c = found; c < end; c++) {
      const ref = charMap[c];
      if (ref && ref.itemIndex >= 0) involved.add(ref.itemIndex);
    }
    if (involved.size > 0) {
      const indices = [...involved].sort((a, b) => a - b);
      const rect = unionRects(indices.map((i) => itemRects[i]));
      matches.push(rect);
    }
    idx = found + 1;
  }

  return { count: matches.length, rects: matches };
}

function itemToRect(item: TextItemLike, viewport: PageViewport): MatchRect {
  const [a, , , d, e, f] = item.transform;
  const textWidth = item.width;
  const fontSize = Math.max(item.height || Math.abs(d) || 10, 1);
  // Baseline at (e, f) in page coords (y-up). Rough ascent/descent box.
  const ascent = fontSize * 0.85;
  const descent = fontSize * 0.2;
  const x0 = e;
  const y0 = f + ascent;
  const x1 = e + textWidth;
  const y1 = f - descent;
  void a;
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

function unionRects(rects: MatchRect[]): MatchRect {
  const minX = Math.min(...rects.map((r) => r.x));
  const minY = Math.min(...rects.map((r) => r.y));
  const maxX = Math.max(...rects.map((r) => r.x + r.width));
  const maxY = Math.max(...rects.map((r) => r.y + r.height));
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}
