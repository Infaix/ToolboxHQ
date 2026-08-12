import type { DocRecord, DocSlot, Overlay, TextOverlay } from '../types';

interface TextItemLike {
  str: string;
  transform: number[];
  hasEOL?: boolean;
}

export async function extractDocumentText(docs: Record<string, DocRecord>, slots: DocSlot[], overlays: Overlay[]): Promise<string> {
  const chunks: string[] = [];

  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const doc = docs[slot.docId];
    chunks.push(`\n===== Page ${i + 1} =====\n`);
    try {
      const page = await doc.pdf.getPage(slot.origIndex + 1);
      const content = await page.getTextContent();
      chunks.push(textContentToString(content.items as TextItemLike[]));
    } catch {
      chunks.push('[Text could not be extracted from this page.]');
    }
    const addedText = overlays.filter((o) => o.page === i && o.type === 'text') as TextOverlay[];
    for (const o of addedText) {
      if (o.text.trim()) chunks.push(`\n[Added text box]: ${o.text}`);
    }
    chunks.push('\n');
  }

  return chunks.join('');
}

function textContentToString(items: TextItemLike[]): string {
  const lines: string[] = [];
  let current = '';
  let lastY: number | null = null;

  for (const item of items) {
    const str = item.str ?? '';
    if (!str) continue;
    const y = item.transform?.[5] ?? 0;
    if (lastY !== null && Math.abs(y - lastY) > 2 && current.trim()) {
      lines.push(current.trimEnd());
      current = '';
    }
    if (current && str) current += ' ';
    current += str;
    if (item.hasEOL && current.trim()) {
      lines.push(current.trimEnd());
      current = '';
    }
    lastY = y;
  }
  if (current.trim()) lines.push(current.trimEnd());

  return lines.join('\n');
}
