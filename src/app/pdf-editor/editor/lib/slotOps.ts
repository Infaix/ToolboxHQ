export const PAGE_SIZES = {
  A4: { width: 595.28, height: 841.89 },
  Letter: { width: 612, height: 792 },
  Legal: { width: 612, height: 1008 },
  A3: { width: 841.89, height: 1190.55 },
  A5: { width: 419.53, height: 595.28 },
} as const;

export type PageSizeName = keyof typeof PAGE_SIZES;

export async function createBlankPdfBytes(width: number, height: number): Promise<ArrayBuffer> {
  const { PDFDocument } = await import('pdf-lib');
  const doc = await PDFDocument.create();
  doc.addPage([width, height]);
  const bytes = await doc.save();
  return bytes as unknown as ArrayBuffer;
}
