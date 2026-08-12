import type { PDFDocumentProxy } from 'pdfjs-dist';

export interface RenderedPage {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  rotation: number;
}

export async function renderPageToCanvas(
  pdf: PDFDocumentProxy,
  origIndex: number,
  rotation: number,
  scale: number
): Promise<RenderedPage> {
  const page = await pdf.getPage(origIndex + 1);
  const viewport = page.getViewport({ scale, rotation });
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvas, canvasContext: ctx, viewport }).promise;
  return { canvas, width: viewport.width / scale, height: viewport.height / scale, rotation };
}
