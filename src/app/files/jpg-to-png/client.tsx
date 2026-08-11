'use client';

import { useState, useRef, useEffect } from 'react';
import ToolHeader from '@/components/tools/ToolHeader';
import ToolContainer from '@/components/tools/ToolContainer';
import FileDropzone from '@/components/tools/FileDropzone';
import DownloadButton from '@/components/tools/DownloadButton';
import ClearButton from '@/components/tools/ClearButton';
import ErrorMessage from '@/components/tools/ErrorMessage';
import RelatedTools from '@/components/tools/RelatedTools';

export default function JpgToPngClient() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
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

    if (!selectedFile.type.match(/image\/jpeg|image\/jpg/)) {
      setError('Please select a JPG or JPEG file');
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
        }, 'image/png');
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
          title="JPG to PNG"
          description="Convert JPG images to PNG format"
          clientSideOnly
        />

        <ToolContainer>
          <div className="space-y-4">
            {!file && (
              <FileDropzone
                onFileSelect={handleFileSelect}
                accept="image/jpeg,image/jpg"
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

                <div className="flex gap-2">
                  <button
                    onClick={handleConvert}
                    className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Convert to PNG
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
                      filename={file.name.replace(/\.(jpg|jpeg)$/i, '.png')}
                      label="Download PNG"
                      mimeType="image/png"
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

        <RelatedTools currentSlug="jpg-to-png" />

        <div className="mt-12 prose prose-gray dark:prose-invert max-w-none">
          <h2>About JPG to PNG Converter</h2>
          <p>
            This tool converts JPG (JPEG) images to PNG format. PNG is a lossless image format that supports transparency and is ideal for graphics with sharp edges and text.
          </p>
          <h3>How to use this tool</h3>
          <ol>
            <li>Upload a JPG or JPEG image by clicking or dragging and dropping</li>
            <li>Preview the image to confirm it&apos;s the correct file</li>
            <li>Click &quot;Convert to PNG&quot; to process the image</li>
            <li>Download the converted PNG file</li>
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
