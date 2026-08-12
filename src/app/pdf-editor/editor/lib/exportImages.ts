import type { DocRecord, DocSlot, ImageExportFormat, Overlay } from '../types';
import { renderPageToCanvas } from './renderPage';
import { drawOverlay, preloadOverlayImages } from './overlayCanvas';
import { downloadBlob } from './utils';

export interface ExportImagesOptions {
  docs: Record<string, DocRecord>;
  slots: DocSlot[];
  overlays: Overlay[];
  baseName: string;
  format: ImageExportFormat;
  scale: number;
  quality?: number;
  range: 'current' | 'all';
  currentPage: number;
}

export async function exportPagesAsImages(opts: ExportImagesOptions): Promise<void> {
  const targets = opts.range === 'all' ? opts.slots.map((_, i) => i) : [opts.currentPage];
  if (targets.length === 0) return;
  await preloadOverlayImages(opts.overlays);

  const mime = opts.format === 'png' ? 'image/png' : 'image/jpeg';
  const ext = opts.format === 'png' ? 'png' : 'jpg';

  for (const index of targets) {
    const slot = opts.slots[index];
    const doc = opts.docs[slot.docId];
    if (!doc) continue;
    const pageOverlays = opts.overlays.filter((o) => o.page === index);

    const rendered = await renderPageToCanvas(doc.pdf, slot.origIndex, slot.rotation, opts.scale);
    const ctx = rendered.canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas rendering is not supported in this browser.');
    ctx.scale(opts.scale, opts.scale);
    for (const overlay of pageOverlays) {
      drawOverlay(ctx, overlay);
    }

    const blob = await new Promise<Blob | null>((resolve) => rendered.canvas.toBlob(resolve, mime, opts.quality ?? 0.9));
    if (!blob) throw new Error('The image could not be encoded.');
    downloadBlob(blob, `${opts.baseName}-page-${index + 1}.${ext}`);
  }
}
