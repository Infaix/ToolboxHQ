'use client';

import { useState } from 'react';
import ToolHeader from '@/components/tools/ToolHeader';
import ToolContainer from '@/components/tools/ToolContainer';
import FileDropzone from '@/components/tools/FileDropzone';
import DownloadButton from '@/components/tools/DownloadButton';
import ClearButton from '@/components/tools/ClearButton';
import ErrorMessage from '@/components/tools/ErrorMessage';
import RelatedTools from '@/components/tools/RelatedTools';

export default function PdfSplitterClient() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [selectedPages, setSelectedPages] = useState<string>('');
  const [splitPdf, setSplitPdf] = useState<Blob | null>(null);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = async (selectedFile: File) => {
    setError('');
    setSplitPdf(null);
    setSelectedPages('');

    if (!selectedFile.type.match(/application\/pdf/)) {
      setError('Please select a PDF file');
      return;
    }

    setFile(selectedFile);

    try {
      const { PDFDocument } = await import('pdf-lib');
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      setPageCount(pdfDoc.getPageCount());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load PDF');
    }
  };

  const parsePageRanges = (input: string, maxPage: number): number[] => {
    const pages: number[] = [];
    const parts = input.split(',');

    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;

      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map((n) => parseInt(n.trim()));
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
            if (i >= 1 && i <= maxPage && !pages.includes(i)) {
              pages.push(i);
            }
          }
        }
      } else {
        const pageNum = parseInt(trimmed);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= maxPage && !pages.includes(pageNum)) {
          pages.push(pageNum);
        }
      }
    }

    return pages.sort((a, b) => a - b);
  };

  const handleSplit = async () => {
    if (!file) return;

    const pagesToExtract = parsePageRanges(selectedPages, pageCount);

    if (pagesToExtract.length === 0) {
      setError('Please enter valid page numbers or ranges');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const { PDFDocument } = await import('pdf-lib');
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      const pages = await newPdf.copyPages(pdfDoc, pagesToExtract.map((p) => p - 1));
      pages.forEach((page) => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      setSplitPdf(blob);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to split PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPageCount(0);
    setSelectedPages('');
    setSplitPdf(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <ToolHeader
          title="PDF Splitter"
          description="Split PDF files into separate pages or ranges"
          clientSideOnly
        />

        <ToolContainer>
          <div className="space-y-4">
            {!file && (
              <FileDropzone
                onFileSelect={handleFileSelect}
                accept="application/pdf"
              />
            )}

            {file && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Selected File
                  </label>
                  <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-600 dark:bg-gray-800">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {file.name}
                    </span>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      ({(file.size / 1024).toFixed(2)} KB, {pageCount} pages)
                    </span>
                  </div>
                </div>

                <div>
                  <label htmlFor="page-ranges" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pages to Extract
                  </label>
                  <input
                    id="page-ranges"
                    type="text"
                    value={selectedPages}
                    onChange={(e) => setSelectedPages(e.target.value)}
                    placeholder="e.g., 1, 3-5, 7"
                    className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Enter page numbers or ranges (e.g., &quot;1, 3-5, 7&quot;). Pages are 1-indexed.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSplit}
                    disabled={!selectedPages || isProcessing}
                    className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Splitting...' : 'Split PDF'}
                  </button>
                  <ClearButton onClear={handleClear} />
                </div>

                {error && <ErrorMessage message={error} />}

                {splitPdf && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Split PDF
                    </label>
                    <DownloadButton
                      content={splitPdf}
                      filename={`split-${file.name}`}
                      label="Download Split PDF"
                      mimeType="application/pdf"
                    />
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Size: {(splitPdf.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </ToolContainer>

        <RelatedTools currentSlug="pdf-splitter" />

        <div className="mt-12 prose prose-gray dark:prose-invert max-w-none">
          <h2>About PDF Splitter</h2>
          <p>
            This tool splits PDF files by extracting specific pages or page ranges into a new PDF document. This is useful for extracting specific pages from large PDFs.
          </p>
          <h3>How to use this tool</h3>
          <ol>
            <li>Upload a PDF file by clicking or dragging and dropping</li>
            <li>Enter the pages you want to extract (e.g., &quot;1, 3-5, 7&quot;)</li>
            <li>Click &quot;Split PDF&quot; to create a new PDF with the selected pages</li>
            <li>Download the split PDF file</li>
          </ol>
          <h3>Page Range Format</h3>
          <p>
            You can specify individual pages (e.g., &quot;1, 3, 5&quot;) or ranges (e.g., &quot;1-5&quot; for pages 1 through 5). Combine them with commas (e.g., &quot;1, 3-5, 7&quot;).
          </p>
          <h3>Privacy</h3>
          <p>
            This tool processes your PDF entirely in your browser using the pdf-lib library. Your file never leaves your device.
          </p>
        </div>
      </div>
    </div>
  );
}
