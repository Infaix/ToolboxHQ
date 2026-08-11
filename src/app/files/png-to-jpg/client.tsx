'use client';

import { useState, useRef, useEffect } from 'react';
import ToolHeader from '@/components/tools/ToolHeader';
import ToolContainer from '@/components/tools/ToolContainer';
import FileDropzone from '@/components/tools/FileDropzone';
import DownloadButton from '@/components/tools/DownloadButton';
import ClearButton from '@/components/tools/ClearButton';
import ErrorMessage from '@/components/tools/ErrorMessage';
import RelatedTools from '@/components/tools/RelatedTools';

export default function PngToJpgClient() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [quality, setQuality] = useState(0.92);
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = (selectedFile: File) => {
    setError('');
    setConvertedBlob(null);

    if (!selectedFile.type.match(/image\/png/)) {
      setError('Please select a PNG file');
      return;
    }

    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
  };

  const handleConvert = () => {
    if (!file || !canvasRef.current) return;

    setError('');
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current!;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            setConvertedBlob(blob);
          }
        }, 'image/jpeg', quality);
      }
    };
    img.onerror = () => {
      setError('The selected file could not be read as an image. It may be corrupted or not a valid image file.');
    };
    img.src = previewUrl;
  };

  const handleClear = () => {
    setFile(null);
    setPreviewUrl('');
    setConvertedBlob(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <ToolHeader
          title="PNG to JPG"
          description="Convert PNG images to JPG format with quality control"
          clientSideOnly
        />

        <ToolContainer>
          <div className="space-y-4">
            {!file && (
              <FileDropzone
                onFileSelect={handleFileSelect}
                accept="image/png"
              />
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
                    className="max-w-full h-auto rounded-md border border-gray-200 dark:border-gray-600"
                  />
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </p>
                </div>

                <div>
                  <label htmlFor="quality" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    JPEG Quality: {Math.round(quality * 100)}%
                  </label>
                  <input
                    id="quality"
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

                <div className="flex gap-2">
                  <button
                    onClick={handleConvert}
                    className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Convert to JPG
                  </button>
                  <ClearButton onClear={handleClear} />
                </div>

                {error && <ErrorMessage message={error} />}

                {convertedBlob && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Converted Image
                    </label>
                    <DownloadButton
                      content={convertedBlob}
                      filename={file.name.replace(/\.png$/i, '.jpg')}
                      label="Download JPG"
                      mimeType="image/jpeg"
                    />
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Converted size: {(convertedBlob.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                )}
              </>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>
        </ToolContainer>

        <RelatedTools currentSlug="png-to-jpg" />

        <div className="mt-12 prose prose-gray dark:prose-invert max-w-none">
          <h2>About PNG to JPG Converter</h2>
          <p>
            This tool converts PNG images to JPG (JPEG) format. JPEG is a lossy compression format that&apos;s ideal for photographs and images with smooth color transitions.
          </p>
          <h3>How to use this tool</h3>
          <ol>
            <li>Upload a PNG image by clicking or dragging and dropping</li>
            <li>Preview the image to confirm it&apos;s the correct file</li>
            <li>Adjust the quality slider to balance file size and image quality</li>
            <li>Click &quot;Convert to JPG&quot; to process the image</li>
            <li>Download the converted JPG file</li>
          </ol>
          <h3>Privacy</h3>
          <p>
            This tool processes your image entirely in your browser using the Canvas API. Your image never leaves your device.
          </p>
        </div>
      </div>
    </div>
  );
}
