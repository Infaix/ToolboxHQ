import { PDFDocument } from 'pdf-lib';
import type { CompressionLevel, DocRecord, DocSlot, DocMetadata, Overlay } from '../types';
import { renderPageToCanvas } from './renderPage';
import { drawOverlay, preloadOverlayImages } from './overlayCanvas';

export interface ExportOptions {
  docs: Record<string, DocRecord>;
  slots: DocSlot[];
  overlays: Overlay[];
  metadata: DocMetadata;
  fileName: string;
  password?: string;
  compression?: CompressionLevel;
  removeMetadata?: boolean;
  onProgress?: (progress: number) => void;
}

const RASTER_SCALE = 2.2;

const COMPRESSION_PRESETS: Record<Exclude<CompressionLevel, 'none'>, { scale: number; quality: number }> = {
  low: { scale: 2.4, quality: 0.82 },
  medium: { scale: 2.0, quality: 0.62 },
  high: { scale: 1.6, quality: 0.42 },
};

export interface ExportError extends Error {
  kind: 'cancel' | 'unsupported' | 'memory' | 'unknown';
}

function exportError(kind: ExportError['kind'], message: string): ExportError {
  const e = new Error(message) as ExportError;
  e.kind = kind;
  return e;
}

function isExportError(err: unknown): err is ExportError {
  return err instanceof Error && 'kind' in err;
}

export async function exportDocument(opts: ExportOptions): Promise<Blob> {
  const { docs, slots, overlays, metadata, onProgress, password, compression = 'none', removeMetadata = false } = opts;
  if (slots.length === 0) throw exportError('unknown', 'There are no pages to export.');

  await preloadOverlayImages(overlays);

  const out = await PDFDocument.create();
  if (!removeMetadata) {
    out.setProducer('ToolboxHQ PDF Editor');
    out.setCreator('ToolboxHQ PDF Editor');
    if (metadata.title) out.setTitle(metadata.title);
    if (metadata.author) out.setAuthor(metadata.author);
    if (metadata.subject) out.setSubject(metadata.subject);
    if (metadata.keywords) out.setKeywords(metadata.keywords.split(/[,\n]+/).filter(Boolean));
  }

  const sourceCache = new Map<string, PDFDocument>();
  async function getSource(docId: string): Promise<PDFDocument> {
    const cached = sourceCache.get(docId);
    if (cached) return cached;
    const record = docs[docId];
    if (!record) throw exportError('unsupported', 'The source document is no longer available.');
    const loaded = await PDFDocument.load(record.bytes, { ignoreEncryption: false });
    sourceCache.set(docId, loaded);
    return loaded;
  }

  const useVectorPath = compression === 'none';
  const raster = useVectorPath ? { scale: RASTER_SCALE, quality: 1 } : COMPRESSION_PRESETS[compression];

  for (let slotIndex = 0; slotIndex < slots.length; slotIndex++) {
    const slot = slots[slotIndex];
    const pageOverlays = overlays.filter((o) => o.page === slotIndex);
    const userRotation = ((slot.rotation - slot.intrinsicRotation) % 360 + 360) % 360;

    try {
      if (useVectorPath && pageOverlays.length === 0 && userRotation === 0) {
        const source = await getSource(slot.docId);
        const [copied] = await out.copyPages(source, [slot.origIndex]);
        copied.setRotation((await import('pdf-lib')).degrees(slot.intrinsicRotation));
        out.addPage(copied);
      } else {
        const record = docs[slot.docId];
        if (!record) throw exportError('unsupported', 'The source document is no longer available.');
        const rendered = await renderPageToCanvas(record.pdf, slot.origIndex, slot.rotation, raster.scale);
        const ctx = rendered.canvas.getContext('2d');
        if (!ctx) throw exportError('unsupported', 'Canvas rendering is not supported in this browser.');
        ctx.scale(raster.scale, raster.scale);
        for (const overlay of pageOverlays) {
          drawOverlay(ctx, overlay);
        }
        const image = raster.quality < 1 ? await out.embedJpg(canvasToJpegBytes(rendered.canvas, raster.quality)) : await out.embedPng(canvasToPngBytes(rendered.canvas));
        const page = out.addPage([slot.width, slot.height]);
        page.drawImage(image, { x: 0, y: 0, width: slot.width, height: slot.height });
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'PasswordException') {
        throw exportError('unsupported', 'One of the source PDFs is password protected and cannot be exported.');
      }
      if (err instanceof Error && /memory/i.test(err.message)) {
        throw exportError('memory', 'The browser ran out of memory while exporting. Try exporting fewer pages at once.');
      }
      throw isExportError(err) ? err : exportError('unknown', 'Failed to export the PDF.');
    }

    onProgress?.((slotIndex + 1) / slots.length);
  }

  try {
    let bytes = await out.save({ useObjectStreams: true });
    if (password) {
      const { encryptPDF } = await import('@pdfsmaller/pdf-encrypt');
      bytes = await encryptPDF(bytes, password, {
        ownerPassword: password,
        allowPrinting: true,
        allowModifying: true,
        allowCopying: true,
      });
    }
    return new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
  } catch {
    throw exportError('unknown', 'Failed to build the final PDF file.');
  }
}

function canvasToJpegBytes(canvas: HTMLCanvasElement, quality: number): Uint8Array {
  const dataUrl = canvas.toDataURL('image/jpeg', quality);
  const base64 = dataUrl.split(',')[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function canvasToPngBytes(canvas: HTMLCanvasElement): Uint8Array {
  const dataUrl = canvas.toDataURL('image/png');
  const base64 = dataUrl.split(',')[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
