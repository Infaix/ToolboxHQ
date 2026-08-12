'use client';

import { useState, useRef, useEffect } from 'react';
import ToolHeader from '@/components/tools/ToolHeader';
import ToolContainer from '@/components/tools/ToolContainer';
import FileDropzone from '@/components/tools/FileDropzone';
import DownloadButton from '@/components/tools/DownloadButton';
import ClearButton from '@/components/tools/ClearButton';
import ErrorMessage from '@/components/tools/ErrorMessage';
import RelatedTools from '@/components/tools/RelatedTools';
import { PDFDocument } from 'pdf-lib';

type OutputFormat = 'jpg' | 'png' | 'webp' | 'pdf';

interface ConvertResult {
  blob: Blob;
  filename: string;
}

const ACCEPT = 'image/jpeg,image/jpg,image/png,image/webp,image/gif,image/bmp,application/pdf';
const MAX_PDF_PAGES = 100;

const mimeOf = (format: OutputFormat): string => {
  if (format === 'jpg') return 'image/jpeg';
  if (format === 'png') return 'image/png';
  if (format === 'webp') return 'image/webp';
  return 'application/pdf';
};

const extensionOf = (format: OutputFormat): string => format;

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image could not be decoded'));
    img.src = url;
  });
}

function drawToCanvas(img: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available in this browser');
  ctx.drawImage(img, 0, 0);
  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Image encoding failed'));
    }, mimeType, quality);
  });
}

async function convertImageToImage(img: HTMLImageElement, format: OutputFormat, quality: number): Promise<Blob> {
  const canvas = drawToCanvas(img);
  if (format === 'jpg') {
    const flat = document.createElement('canvas');
    flat.width = canvas.width;
    flat.height = canvas.height;
    const ctx = flat.getContext('2d');
    if (!ctx) throw new Error('Canvas is not available in this browser');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, flat.width, flat.height);
    ctx.drawImage(canvas, 0, 0);
    return canvasToBlob(flat, 'image/jpeg', quality);
  }
  return canvasToBlob(canvas, mimeOf(format), format === 'webp' ? quality : undefined);
}

async function convertImageToPdf(img: HTMLImageElement): Promise<Blob> {
  const canvas = drawToCanvas(img);
  const pngBytes = await canvasToBlob(canvas, 'image/png').then((blob) => blob.arrayBuffer());
  const pdfDoc = await PDFDocument.create();
  const pngImage = await pdfDoc.embedPng(pngBytes);
  const page = pdfDoc.addPage([pngImage.width, pngImage.height]);
  page.drawImage(pngImage, { x: 0, y: 0, width: pngImage.width, height: pngImage.height });
  const bytes = await pdfDoc.save();
  return new Blob([bytes as unknown as ArrayBuffer], { type: 'application/pdf' });
}

async function convertPdfToImages(
  bytes: ArrayBuffer,
  format: OutputFormat,
  quality: number,
  onPage: (blob: Blob, index: number, total: number) => void
): Promise<void> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;

  if (pdf.numPages > MAX_PDF_PAGES) {
    pdf.loadingTask.destroy();
    throw new Error(`PDF has more than ${MAX_PDF_PAGES} pages`);
  }

  try {
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas is not available in this browser');

      if (format === 'jpg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      await page.render({ canvas, canvasContext: ctx, viewport }).promise;
      const blob = await canvasToBlob(canvas, mimeOf(format), format === 'webp' || format === 'jpg' ? quality : undefined);
      onPage(blob, i, pdf.numPages);
    }
  } finally {
    pdf.loadingTask.destroy();
  }
}

export default function FileConverterClient() {
  const [file, setFile] = useState<File | null>(null);
  const [inputIsPdf, setInputIsPdf] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [format, setFormat] = useState<OutputFormat>('png');
  const [quality, setQuality] = useState(0.92);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<ConvertResult[]>([]);
  const objectUrls = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrl]);

  const availableFormats: OutputFormat[] = inputIsPdf ? ['jpg', 'png', 'webp'] : ['jpg', 'png', 'webp', 'pdf'];

  const handleFileSelect = (selectedFile: File) => {
    setError('');
    setResults([]);
    setConverting(false);

    const isPdf = selectedFile.type === 'application/pdf' || /\.pdf$/i.test(selectedFile.name);
    const isImage = /^image\/(jpeg|jpg|png|webp|gif|bmp)$/i.test(selectedFile.type);

    if (!isPdf && !isImage) {
      setError('Please select an image (JPG, PNG, WebP, GIF, BMP) or a PDF file');
      return;
    }

    setFile(selectedFile);
    setInputIsPdf(isPdf);
    setFormat('png');

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (isPdf) {
      setPreviewUrl('');
    } else {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleConvert = async () => {
    if (!file || converting) return;
    setError('');
    setResults([]);
    setConverting(true);

    const baseName = file.name.replace(/\.[^.]+$/, '');
    const outResults: ConvertResult[] = [];

    try {
      if (!inputIsPdf) {
        const img = await loadImage(previewUrl);
        if (format === 'pdf') {
          const blob = await convertImageToPdf(img);
          outResults.push({ blob, filename: `${baseName}.pdf` });
        } else {
          const blob = await convertImageToImage(img, format, quality);
          outResults.push({ blob, filename: `${baseName}.${extensionOf(format)}` });
        }
      } else {
        if (format === 'pdf') {
          throw new Error('PDF to PDF conversion is not supported here');
        }
        const bytes = await file.arrayBuffer();
        await convertPdfToImages(bytes, format, quality, (blob, index) => {
          const url = URL.createObjectURL(blob);
          objectUrls.current.push(url);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = `${baseName}-page-${index}.${extensionOf(format)}`;
          document.body.appendChild(anchor);
          anchor.click();
          document.body.removeChild(anchor);
          outResults.push({
            blob,
            filename: `${baseName}-page-${index}.${extensionOf(format)}`,
          });
        });
      }

      setResults(outResults);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown error';
      if (message.includes('password')) {
        setError('This PDF is password protected and could not be converted.');
      } else if (message.includes('not a PDF') || message.includes('PDF')) {
        setError('The selected PDF could not be read. It may be corrupted or use an unsupported format.');
      } else {
        setError('Something went wrong during conversion. Please try a different file.');
      }
    } finally {
      setConverting(false);
    }
  };

  const handleClear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl('');
    setInputIsPdf(false);
    setResults([]);
    setError('');
    setConverting(false);
    objectUrls.current = [];
  };

  const showQuality = format === 'jpg' || format === 'webp';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <ToolHeader
          title="Universal File Converter"
          description="Convert images and PDFs between JPG, PNG, WebP and PDF formats"
          clientSideOnly
        />

        <ToolContainer>
          <div className="space-y-4">
            {!file && (
              <FileDropzone onFileSelect={handleFileSelect} accept={ACCEPT} />
            )}

            {file && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Input File
                  </label>
                  <div className="rounded-md border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {(file.size / 1024).toFixed(2)} KB • {inputIsPdf ? 'PDF' : 'Image'}
                    </p>
                  </div>
                </div>

                {!inputIsPdf && previewUrl && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Preview
                    </label>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-64 max-w-full h-auto rounded-md border border-gray-200 dark:border-gray-600"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="output-format" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Convert To
                  </label>
                  <select
                    id="output-format"
                    value={format}
                    onChange={(e) => setFormat(e.target.value as OutputFormat)}
                    className="block w-48 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    {availableFormats.map((f) => (
                      <option key={f} value={f}>
                        {f.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                {showQuality && (
                  <div>
                    <label htmlFor="converter-quality" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Quality: {Math.round(quality * 100)}%
                    </label>
                    <input
                      id="converter-quality"
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.01"
                      value={quality}
                      onChange={(e) => setQuality(parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>Lower quality (smaller file)</span>
                      <span>Higher quality (larger file)</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleConvert}
                    disabled={converting}
                    className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {converting ? 'Converting…' : 'Convert File'}
                  </button>
                  <ClearButton onClear={handleClear} />
                </div>

                {error && <ErrorMessage message={error} />}

                {results.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Converted {results.length > 1 ? 'Files' : 'File'}
                    </label>
                    <div className="space-y-2">
                      {results.map((result, index) => (
                        <div
                          key={`${result.filename}-${index}`}
                          className="flex items-center justify-between gap-4 rounded-md border border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-600 dark:bg-gray-800"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{result.filename}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {(result.blob.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                          <DownloadButton content={result.blob} filename={result.filename} label="Download" mimeType={result.blob.type} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </ToolContainer>

        <RelatedTools currentSlug="file-converter" />

        <div className="mt-12 prose prose-gray dark:prose-invert max-w-none">
          <h2>About Universal File Converter</h2>
          <p>
            This tool converts images and PDF documents between common formats entirely in your browser.
            Images (JPG, PNG, WebP, GIF and BMP) can be converted to JPG, PNG, WebP or a single-page PDF,
            while PDFs can be exported as JPG, PNG or WebP images.
          </p>
          <h3>How to use this tool</h3>
          <ol>
            <li>Upload an image or PDF by clicking or dragging and dropping</li>
            <li>Choose the output format from the &quot;Convert To&quot; dropdown</li>
            <li>Adjust quality when converting to a lossy format (JPG or WebP)</li>
            <li>Click &quot;Convert File&quot; to process the file</li>
            <li>Download the converted file</li>
          </ol>
          <h3>Privacy</h3>
          <p>
            This tool processes your files entirely in your browser using the Canvas API, pdf.js and pdf-lib.
            Your files never leave your device.
          </p>
        </div>
      </div>
    </div>
  );
}
