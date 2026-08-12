'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import QRCode, { QRCodeErrorCorrectionLevel } from 'qrcode';
import ToolHeader from '@/components/tools/ToolHeader';
import ToolContainer from '@/components/tools/ToolContainer';
import DownloadButton from '@/components/tools/DownloadButton';
import ErrorMessage from '@/components/tools/ErrorMessage';
import RelatedTools from '@/components/tools/RelatedTools';

const SIZE_MIN = 128;
const SIZE_MAX = 2048;

export default function QrCodeGeneratorClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState('');
  const [size, setSize] = useState(512);
  const [level, setLevel] = useState<QRCodeErrorCorrectionLevel>('M');
  const [dark, setDark] = useState('#000000');
  const [light, setLight] = useState('#ffffff');
  const [blob, setBlob] = useState<Blob | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const run = useCallback(
    async (value: string) => {
      const canvas = canvasRef.current;
      if (!canvas || !value.trim()) return;
      setGenerating(true);
      setError('');
      try {
        await QRCode.toCanvas(canvas, value.trim(), {
          width: size,
          margin: 2,
          errorCorrectionLevel: level,
          color: { dark, light },
        });
        canvas.toBlob((b) => {
          if (b) setBlob(b);
        }, 'image/png');
      } catch (err) {
        setBlob(null);
        setError(
          err instanceof Error && /too long/i.test(err.message)
            ? 'The content is too long for this error correction level. Try shorter text or a lower level.'
            : 'Could not generate a QR code for this content.'
        );
      } finally {
        setGenerating(false);
      }
    },
    [size, level, dark, light]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (text.trim()) {
        run(text);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [text, size, level, dark, light, run]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <ToolHeader
          title="QR Code Generator"
          description="Generate QR codes for URLs, text and more with custom size and colors"
          clientSideOnly
        />

        <ToolContainer>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label htmlFor="qr-text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content (URL or text)
                </label>
                <textarea
                  id="qr-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={4}
                  placeholder="https://example.com or any text…"
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="qr-size" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Size: {size}px
                  </label>
                  <input
                    id="qr-size"
                    type="range"
                    min={SIZE_MIN}
                    max={SIZE_MAX}
                    step="64"
                    value={size}
                    onChange={(e) => setSize(parseInt(e.target.value, 10))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="qr-level" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Error Correction
                  </label>
                  <select
                    id="qr-level"
                    value={level}
                    onChange={(e) => setLevel(e.target.value as QRCodeErrorCorrectionLevel)}
                    className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="L">Low (7%)</option>
                    <option value="M">Medium (15%)</option>
                    <option value="Q">Quartile (25%)</option>
                    <option value="H">High (30%)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="qr-dark" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Foreground Color
                  </label>
                  <input
                    id="qr-dark"
                    type="color"
                    value={dark}
                    onChange={(e) => setDark(e.target.value)}
                    className="h-10 w-full cursor-pointer rounded-md border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label htmlFor="qr-light" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Background Color
                  </label>
                  <input
                    id="qr-light"
                    type="color"
                    value={light}
                    onChange={(e) => setLight(e.target.value)}
                    className="h-10 w-full cursor-pointer rounded-md border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700"
                  />
                </div>
              </div>

              <button
                onClick={() => run(text)}
                disabled={generating || !text.trim()}
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? 'Generating…' : 'Generate QR Code'}
              </button>

              {error && <ErrorMessage message={error} />}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preview
              </label>
              <div className="flex items-center justify-center rounded-md border border-gray-200 bg-white p-6 dark:border-gray-600">
                {text.trim() ? (
                  <canvas ref={canvasRef} className="max-w-full h-auto" />
                ) : (
                  <p className="py-16 text-sm text-gray-500 dark:text-gray-400">
                    Enter some content to generate your QR code.
                  </p>
                )}
              </div>
              {blob && (
                <div className="mt-4">
                  <DownloadButton
                    content={blob}
                    filename="qr-code.png"
                    label="Download PNG"
                    mimeType="image/png"
                  />
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {(blob.size / 1024).toFixed(2)} KB • {size}×{size}px
                  </p>
                </div>
              )}
            </div>
          </div>
        </ToolContainer>

        <RelatedTools currentSlug="qr-code-generator" />

        <div className="mt-12 prose prose-gray dark:prose-invert max-w-none">
          <h2>About QR Code Generator</h2>
          <p>
            This tool creates QR codes from URLs or any text. QR codes are scanned by phone cameras and most
            scanner apps, making them great for linking to websites, sharing contact details or connecting to
            Wi-Fi networks.
          </p>
          <h3>How to use this tool</h3>
          <ol>
            <li>Enter the URL or text you want to encode</li>
            <li>Adjust the size and error correction level as needed</li>
            <li>Customize the foreground and background colors</li>
            <li>Preview the QR code, then download it as a PNG image</li>
          </ol>
          <h3>Privacy</h3>
          <p>
            QR codes are generated entirely in your browser. Your content never leaves your device.
          </p>
        </div>
      </div>
    </div>
  );
}
