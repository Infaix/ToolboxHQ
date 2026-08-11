'use client';

import { useState, useRef, useEffect } from 'react';
import ToolHeader from '@/components/tools/ToolHeader';
import ToolContainer from '@/components/tools/ToolContainer';
import FileDropzone from '@/components/tools/FileDropzone';
import DownloadButton from '@/components/tools/DownloadButton';
import ClearButton from '@/components/tools/ClearButton';
import ErrorMessage from '@/components/tools/ErrorMessage';
import RelatedTools from '@/components/tools/RelatedTools';

export default function ImageCompressorClient() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [quality, setQuality] = useState(0.8);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
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
    setCompressedBlob(null);
    setCompressedSize(0);

    if (!selectedFile.type.match(/image\/(jpeg|jpg|png|webp)/)) {
      setError('Please select a valid image file (JPG, PNG, or WebP)');
      return;
    }

    setFile(selectedFile);
    setOriginalSize(selectedFile.size);
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
  };

  const handleCompress = () => {
    if (!file || !canvasRef.current) return;

    setError('');
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current!;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(img, 0, 0);

        const mimeType = file.type === 'image/png' ? 'image/jpeg' : file.type;

        canvas.toBlob((blob) => {
          if (blob) {
            setCompressedBlob(blob);
            setCompressedSize(blob.size);
          }
        }, mimeType, quality);
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
    setCompressedBlob(null);
    setOriginalSize(0);
    setCompressedSize(0);
    setError('');
  };

  const getReductionPercentage = () => {
    if (originalSize === 0 || compressedSize === 0) return 0;
    return ((originalSize - compressedSize) / originalSize) * 100;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <ToolHeader
          title="Image Compressor"
          description="Compress images while maintaining quality"
          clientSideOnly
        />

        <ToolContainer>
          <div className="space-y-4">
            {!file && (
              <FileDropzone
                onFileSelect={handleFileSelect}
                accept="image/jpeg,image/jpg,image/png,image/webp"
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
                    {file.name} ({(originalSize / 1024).toFixed(2)} KB)
                  </p>
                </div>

                <div>
                  <label htmlFor="quality" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quality: {Math.round(quality * 100)}%
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
                    onClick={handleCompress}
                    className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Compress Image
                  </button>
                  <ClearButton onClear={handleClear} />
                </div>

                {error && <ErrorMessage message={error} />}

                {compressedBlob && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Compression Results
                    </label>
                    <div className="rounded-md border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Original</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {(originalSize / 1024).toFixed(2)} KB
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Compressed</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {(compressedSize / 1024).toFixed(2)} KB
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Reduction</p>
                          <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                            {getReductionPercentage().toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <DownloadButton
                        content={compressedBlob}
                        filename={`${file.name.replace(/\.[^/.]+$/, '')}-compressed.${compressedBlob.type === 'image/png' ? 'png' : compressedBlob.type === 'image/webp' ? 'webp' : 'jpg'}`}
                        label="Download Compressed Image"
                        mimeType={compressedBlob.type}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>
        </ToolContainer>

        <RelatedTools currentSlug="image-compressor" />

        <div className="mt-12 prose prose-gray dark:prose-invert max-w-none">
          <h2>About Image Compressor</h2>
          <p>
            This tool compresses images to reduce file size while maintaining acceptable quality. Compression is useful for reducing storage space and improving load times on websites.
          </p>
          <h3>How to use this tool</h3>
          <ol>
            <li>Upload an image (JPG, PNG, or WebP) by clicking or dragging and dropping</li>
            <li>Preview the image to confirm it&apos;s the correct file</li>
            <li>Adjust the quality slider to balance file size and image quality</li>
            <li>Click &quot;Compress Image&quot; to process the image</li>
            <li>View the compression results and download the compressed image</li>
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
