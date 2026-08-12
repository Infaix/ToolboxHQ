'use client';

import { useState, useEffect } from 'react';
import ToolHeader from '@/components/tools/ToolHeader';
import ToolContainer from '@/components/tools/ToolContainer';
import FileDropzone from '@/components/tools/FileDropzone';
import DownloadButton from '@/components/tools/DownloadButton';
import ClearButton from '@/components/tools/ClearButton';
import ErrorMessage from '@/components/tools/ErrorMessage';
import RelatedTools from '@/components/tools/RelatedTools';

type ResizeMode = 'percentage' | 'dimensions';
type OutputFormat = 'auto' | 'jpg' | 'png' | 'webp';

const ACCEPT = 'image/jpeg,image/jpg,image/png,image/webp,image/gif,image/bmp';
const MAX_DIMENSION = 10000;

const mimeOf = (format: Exclude<OutputFormat, 'auto'>): string => {
  if (format === 'jpg') return 'image/jpeg';
  if (format === 'webp') return 'image/webp';
  return 'image/png';
};

function resolveFormat(requested: OutputFormat, originalType: string): { mime: string; ext: string; lossy: boolean } {
  if (requested !== 'auto') {
    const lossy = requested !== 'png';
    return { mime: mimeOf(requested), ext: requested, lossy };
  }
  if (/jpeg/.test(originalType)) return { mime: 'image/jpeg', ext: 'jpg', lossy: true };
  if (/png/.test(originalType)) return { mime: 'image/png', ext: 'png', lossy: false };
  if (/webp/.test(originalType)) return { mime: 'image/webp', ext: 'webp', lossy: true };
  return { mime: 'image/png', ext: 'png', lossy: false };
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image could not be decoded'));
    img.src = url;
  });
}

const clampDimension = (value: number): number => Math.min(MAX_DIMENSION, Math.max(1, Math.round(value)));

export default function ImageResizerClient() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [mode, setMode] = useState<ResizeMode>('percentage');
  const [percent, setPercent] = useState(50);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [keepAspect, setKeepAspect] = useState(true);
  const [format, setFormat] = useState<OutputFormat>('auto');
  const [quality, setQuality] = useState(0.92);
  const [naturalWidth, setNaturalWidth] = useState(0);
  const [naturalHeight, setNaturalHeight] = useState(0);
  const [originalSize, setOriginalSize] = useState(0);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultWidth, setResultWidth] = useState(0);
  const [resultHeight, setResultHeight] = useState(0);
  const [resultSize, setResultSize] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileSelect = (selectedFile: File) => {
    setError('');
    setResultBlob(null);

    if (!/^image\/(jpeg|jpg|png|webp|gif|bmp)$/i.test(selectedFile.type)) {
      setError('Please select a valid image file (JPG, PNG, WebP, GIF, or BMP)');
      return;
    }

    setFile(selectedFile);
    setOriginalSize(selectedFile.size);
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);

    const img = new Image();
    img.onload = () => {
      setNaturalWidth(img.naturalWidth);
      setNaturalHeight(img.naturalHeight);
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
    };
    img.src = url;
  };

  const handleWidthChange = (value: number) => {
    if (!keepAspect || naturalHeight === 0 || naturalWidth === 0) {
      setWidth(clampDimension(value));
      return;
    }
    const next = clampDimension(value);
    setWidth(next);
    setHeight(clampDimension(next * (naturalHeight / naturalWidth)));
  };

  const handleHeightChange = (value: number) => {
    if (!keepAspect || naturalHeight === 0 || naturalWidth === 0) {
      setHeight(clampDimension(value));
      return;
    }
    const next = clampDimension(value);
    setHeight(next);
    setWidth(clampDimension(next * (naturalWidth / naturalHeight)));
  };

  const handleResize = async () => {
    if (!file || !previewUrl || processing) return;
    setError('');
    setResultBlob(null);
    setProcessing(true);

    try {
      const img = await loadImage(previewUrl);
      let targetWidth: number;
      let targetHeight: number;

      if (mode === 'percentage') {
        targetWidth = clampDimension(img.naturalWidth * (percent / 100));
        targetHeight = clampDimension(img.naturalHeight * (percent / 100));
      } else {
        targetWidth = clampDimension(width || img.naturalWidth);
        targetHeight = clampDimension(height || img.naturalHeight);
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas is not available in this browser');

      const output = resolveFormat(format, file.type);
      if (output.mime === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Image encoding failed'))),
          output.mime,
          output.lossy ? quality : undefined
        );
      });

      setResultBlob(blob);
      setResultWidth(targetWidth);
      setResultHeight(targetHeight);
      setResultSize(blob.size);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong while resizing the image.');
    } finally {
      setProcessing(false);
    }
  };

  const handleClear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl('');
    setResultBlob(null);
    setResultWidth(0);
    setResultHeight(0);
    setResultSize(0);
    setError('');
  };

  const getReductionPercentage = () => {
    if (originalSize === 0 || resultSize === 0) return 0;
    return ((originalSize - resultSize) / originalSize) * 100;
  };

  const outputExtension = file ? resolveFormat(format, file.type).ext : 'png';
  const outputBaseName = file ? file.name.replace(/\.[^.]+$/, '') : 'image';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <ToolHeader
          title="Image Resizer"
          description="Resize images to exact dimensions or scale them by percentage"
          clientSideOnly
        />

        <ToolContainer>
          <div className="space-y-4">
            {!file && (
              <FileDropzone onFileSelect={handleFileSelect} accept={ACCEPT} />
            )}

            {file && previewUrl && (
              <>
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
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {file.name} ({naturalWidth}×{naturalHeight}px, {(originalSize / 1024).toFixed(2)} KB)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Resize Method
                  </label>
                  <div className="inline-flex rounded-md border border-gray-300 dark:border-gray-600">
                    <button
                      onClick={() => setMode('percentage')}
                      className={`rounded-l-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        mode === 'percentage'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      Percentage
                    </button>
                    <button
                      onClick={() => setMode('dimensions')}
                      className={`rounded-r-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        mode === 'dimensions'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      Exact Size
                    </button>
                  </div>
                </div>

                {mode === 'percentage' ? (
                  <div>
                    <label htmlFor="resize-percent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Scale: {percent}%
                    </label>
                    <input
                      id="resize-percent"
                      type="range"
                      min="1"
                      max="200"
                      step="1"
                      value={percent}
                      onChange={(e) => setPercent(parseInt(e.target.value, 10))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>1%</span>
                      <span>200%</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Result: {clampDimension(naturalWidth * (percent / 100))}×{clampDimension(naturalHeight * (percent / 100))}px
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Target Dimensions (px)
                    </label>
                    <div className="flex items-end gap-3">
                      <div>
                        <label htmlFor="resize-width" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Width
                        </label>
                        <input
                          id="resize-width"
                          type="number"
                          min="1"
                          max={MAX_DIMENSION}
                          value={width || ''}
                          onChange={(e) => handleWidthChange(parseInt(e.target.value, 10) || 0)}
                          className="block w-32 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <span className="pb-2 text-gray-500 dark:text-gray-400">×</span>
                      <div>
                        <label htmlFor="resize-height" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Height
                        </label>
                        <input
                          id="resize-height"
                          type="number"
                          min="1"
                          max={MAX_DIMENSION}
                          value={height || ''}
                          onChange={(e) => handleHeightChange(parseInt(e.target.value, 10) || 0)}
                          className="block w-32 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                    <label className="mt-3 inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={keepAspect}
                        onChange={(e) => setKeepAspect(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Keep aspect ratio</span>
                    </label>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="resize-format" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Output Format
                    </label>
                    <select
                      id="resize-format"
                      value={format}
                      onChange={(e) => setFormat(e.target.value as OutputFormat)}
                      className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="auto">Auto (keep original)</option>
                      <option value="jpg">JPG</option>
                      <option value="png">PNG</option>
                      <option value="webp">WebP</option>
                    </select>
                  </div>
                  {resolveFormat(format, file.type).lossy && (
                    <div>
                      <label htmlFor="resize-quality" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Quality: {Math.round(quality * 100)}%
                      </label>
                      <input
                        id="resize-quality"
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.01"
                        value={quality}
                        onChange={(e) => setQuality(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleResize}
                    disabled={processing}
                    className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? 'Resizing…' : 'Resize Image'}
                  </button>
                  <ClearButton onClear={handleClear} />
                </div>

                {error && <ErrorMessage message={error} />}

                {resultBlob && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Resize Results
                    </label>
                    <div className="rounded-md border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800">
                      <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Original</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {naturalWidth}×{naturalHeight}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Resized</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {resultWidth}×{resultHeight}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Size</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {(resultSize / 1024).toFixed(2)} KB
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Change</p>
                          <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                            {getReductionPercentage().toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <DownloadButton
                        content={resultBlob}
                        filename={`${outputBaseName}-${resultWidth}x${resultHeight}.${outputExtension}`}
                        label="Download Resized Image"
                        mimeType={resultBlob.type}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </ToolContainer>

        <RelatedTools currentSlug="image-resizer" />

        <div className="mt-12 prose prose-gray dark:prose-invert max-w-none">
          <h2>About Image Resizer</h2>
          <p>
            This tool resizes images to exact pixel dimensions or scales them by a percentage, entirely in your
            browser. It&apos;s perfect for preparing images for the web, social media, or print.
          </p>
          <h3>How to use this tool</h3>
          <ol>
            <li>Upload an image by clicking or dragging and dropping</li>
            <li>Choose a resize method: scale by percentage or set exact dimensions</li>
            <li>Keep the aspect ratio locked to avoid distortion, or unlock it for a free-form size</li>
            <li>Pick an output format and quality, then click &quot;Resize Image&quot;</li>
            <li>Download the resized image</li>
          </ol>
          <h3>Privacy</h3>
          <p>
            This tool processes your image entirely in your browser using the Canvas API. Your image never leaves
            your device.
          </p>
        </div>
      </div>
    </div>
  );
}
