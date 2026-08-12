import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { DocRecord, DocSlot } from '../types';

export const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200 MB
export const MAX_PAGES = 1000;

let pdfjsPromise: Promise<typeof import('pdfjs-dist')> | null = null;
function getPdfjs(): Promise<typeof import('pdfjs-dist')> {
  if (!pdfjsPromise) {
    pdfjsPromise = import('pdfjs-dist').then((m) => {
      m.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
      return m;
    });
  }
  return pdfjsPromise;
}

export class PdfOpenError extends Error {
  code: 'password' | 'corrupt' | 'not-pdf' | 'too-large' | 'too-many-pages' | 'unsupported' | 'unknown';
  constructor(code: PdfOpenError['code'], message: string) {
    super(message);
    this.name = 'PdfOpenError';
    this.code = code;
  }
}

export interface LoadedPdf {
  doc: DocRecord;
  slots: DocSlot[];
  fileName: string;
  fileSize: number;
}

async function readMagic(file: File | ArrayBuffer): Promise<Uint8Array> {
  if (file instanceof ArrayBuffer) {
    return new Uint8Array(file.slice(0, 1024));
  }
  return new Uint8Array(await file.slice(0, 1024).arrayBuffer());
}

export function friendlyOpenError(error: unknown): { title: string; message: string } {
  if (error instanceof PdfOpenError) {
    switch (error.code) {
      case 'password':
        return {
          title: 'This PDF is password protected',
          message:
            'We could not open this PDF because it is encrypted. Password-protected PDFs are not supported yet — please remove the password and try again.',
        };
      case 'too-large':
        return {
          title: 'This PDF is too large',
          message: `We could not open this PDF because it exceeds the ${MAX_FILE_SIZE / (1024 * 1024)} MB limit supported in the browser editor.`,
        };
      case 'too-many-pages':
        return {
          title: 'This PDF has too many pages',
          message: `We could not open this PDF because it has more than ${MAX_PAGES} pages.`,
        };
      case 'corrupt':
        return {
          title: "We couldn't open this PDF",
          message: 'The file appears to be corrupted or was not saved correctly. Try opening it in a PDF reader first, then retry.',
        };
      case 'not-pdf':
        return {
          title: 'That file is not a PDF',
          message: 'The selected file does not look like a valid PDF document. Please choose a .pdf file.',
        };
      default:
        return {
          title: "We couldn't open this PDF",
          message: 'Something went wrong while opening this file. The file may be damaged or use an unsupported feature.',
        };
    }
  }
  return {
    title: "We couldn't open this PDF",
    message: 'Something went wrong while opening this file. The file may be damaged or use an unsupported feature.',
  };
}

export async function openPdfFile(file: File): Promise<LoadedPdf> {
  if (file.size > MAX_FILE_SIZE) {
    throw new PdfOpenError('too-large', 'file exceeds size limit');
  }
  const magic = await readMagic(file);
  if (!isPdfMagic(magic)) {
    throw new PdfOpenError('not-pdf', 'file is not a PDF');
  }
  const bytes = await file.arrayBuffer();
  return openPdfBytes(bytes, file.name, file.size);
}

export async function openPdfBytes(bytes: ArrayBuffer, name: string, fileSize: number): Promise<LoadedPdf> {
  const magic = await readMagic(bytes);
  if (!isPdfMagic(magic)) {
    throw new PdfOpenError('not-pdf', 'file is not a PDF');
  }
  let pdf: PDFDocumentProxy;
  try {
    const pdfjsLib = await getPdfjs();
    const task = pdfjsLib.getDocument({ data: bytes });
    pdf = await task.promise;
  } catch (err) {
    const e = err as { name?: string; code?: string };
    if (e && (e.name === 'PasswordException' || String(e.code).toLowerCase().includes('password'))) {
      throw new PdfOpenError('password', 'PDF is password protected');
    }
    throw new PdfOpenError('corrupt', 'PDF could not be parsed');
  }

  const numPages = pdf.numPages;
  if (numPages > MAX_PAGES) {
    pdf.loadingTask.destroy();
    throw new PdfOpenError('too-many-pages', 'too many pages');
  }

  const slots: DocSlot[] = [];
  for (let i = 0; i < numPages; i++) {
    const page = await pdf.getPage(i + 1);
    const viewport = page.getViewport({ scale: 1 });
    slots.push({
      docId: 'main',
      origIndex: i,
      rotation: 0,
      intrinsicRotation: 0,
      width: Math.max(1, viewport.width),
      height: Math.max(1, viewport.height),
    });
  }

  const doc: DocRecord = {
    id: 'main',
    name,
    pdf,
    bytes,
    fileSize,
  };

  return { doc, slots, fileName: name, fileSize };
}

function isPdfMagic(bytes: Uint8Array): boolean {
  const header = new TextDecoder('ascii').decode(bytes.slice(0, 5));
  return header === '%PDF-';
}
