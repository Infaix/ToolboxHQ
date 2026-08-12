import { PDFDocument, PDFImage } from 'pdf-lib';
import type { ImagePdfPageSize } from '../types';
import { dataUrlToBytes } from './utils';

const MAX_FIT_DIMENSION = 1440;

export async function createPdfFromImages(
  files: File[],
  pageSize: ImagePdfPageSize
): Promise<{ bytes: Uint8Array; name: string }> {
  const out = await PDFDocument.create();

  for (const file of files) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const isPng = file.type === 'image/png' || /\.png$/i.test(file.name);
    const isJpeg = file.type === 'image/jpeg' || /\.jpe?g$/i.test(file.name);

    let image: PDFImage;
    if (isPng) {
      image = await out.embedPng(bytes);
    } else if (isJpeg) {
      image = await out.embedJpg(bytes);
    } else {
      image = await out.embedPng(await rasterizeToPngBytes(file));
    }

    let pageWidth = image.width;
    let pageHeight = image.height;
    const maxDim = Math.max(pageWidth, pageHeight);
    if (pageSize === 'fit' && maxDim > MAX_FIT_DIMENSION) {
      const shrink = MAX_FIT_DIMENSION / maxDim;
      pageWidth *= shrink;
      pageHeight *= shrink;
    }
    if (pageSize === 'a4') {
      pageWidth = 595.28;
      pageHeight = 841.89;
    } else if (pageSize === 'letter') {
      pageWidth = 612;
      pageHeight = 792;
    }

    const page = out.addPage([pageWidth, pageHeight]);
    const margin = pageSize === 'fit' ? 0 : 20;
    const availableWidth = pageWidth - margin * 2;
    const availableHeight = pageHeight - margin * 2;
    const ratio = Math.min(availableWidth / image.width, availableHeight / image.height, 1);
    const drawWidth = image.width * ratio;
    const drawHeight = image.height * ratio;
    page.drawImage(image, {
      x: (pageWidth - drawWidth) / 2,
      y: (pageHeight - drawHeight) / 2,
      width: drawWidth,
      height: drawHeight,
    });
  }

  const bytes = await out.save({ useObjectStreams: true });
  return { bytes, name: 'images.pdf' };
}

async function rasterizeToPngBytes(file: File): Promise<Uint8Array> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('The image could not be read.'));
      image.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext('2d')?.drawImage(img, 0, 0);
    return dataUrlToBytes(canvas.toDataURL('image/png'));
  } finally {
    URL.revokeObjectURL(url);
  }
}
