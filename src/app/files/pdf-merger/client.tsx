'use client';

import { useState } from 'react';
import ToolHeader from '@/components/tools/ToolHeader';
import ToolContainer from '@/components/tools/ToolContainer';
import FileDropzone from '@/components/tools/FileDropzone';
import DownloadButton from '@/components/tools/DownloadButton';
import ClearButton from '@/components/tools/ClearButton';
import ErrorMessage from '@/components/tools/ErrorMessage';
import RelatedTools from '@/components/tools/RelatedTools';

export default function PdfMergerClient() {
  const [files, setFiles] = useState<File[]>([]);
  const [mergedPdf, setMergedPdf] = useState<Blob | null>(null);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    setError('');
    if (!selectedFile.type.match(/application\/pdf/)) {
      setError('Please select a PDF file');
      return;
    }
    setFiles([...files, selectedFile]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setMergedPdf(null);
  };

  const handleMoveFile = (fromIndex: number, toIndex: number) => {
    const newFiles = [...files];
    const [movedFile] = newFiles.splice(fromIndex, 1);
    newFiles.splice(toIndex, 0, movedFile);
    setFiles(newFiles);
    setMergedPdf(null);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError('Please select at least 2 PDF files to merge');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const { PDFDocument } = await import('pdf-lib');
      const mergedPdfDoc = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pages = await mergedPdfDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
        pages.forEach((page) => mergedPdfDoc.addPage(page));
      }

      const mergedPdfBytes = await mergedPdfDoc.save();
      const blob = new Blob([mergedPdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      setMergedPdf(blob);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to merge PDFs');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setFiles([]);
    setMergedPdf(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <ToolHeader
          title="PDF Merger"
          description="Merge multiple PDF files into one document"
          clientSideOnly
        />

        <ToolContainer>
          <div className="space-y-4">
            <FileDropzone
              onFileSelect={handleFileSelect}
              accept="application/pdf"
            />

            {files.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Selected PDFs ({files.length})
                </label>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-600 dark:bg-gray-800"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {index + 1}.
                        </span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({(file.size / 1024).toFixed(2)} KB)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {index > 0 && (
                          <button
                            onClick={() => handleMoveFile(index, index - 1)}
                            aria-label={`Move ${file.name} up`}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            title="Move up"
                          >
                            &uarr;
                          </button>
                        )}
                        {index < files.length - 1 && (
                          <button
                            onClick={() => handleMoveFile(index, index + 1)}
                            aria-label={`Move ${file.name} down`}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            title="Move down"
                          >
                            &darr;
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveFile(index)}
                          aria-label={`Remove ${file.name}`}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          title="Remove"
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleMerge}
                disabled={files.length < 2 || isProcessing}
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Merging...' : 'Merge PDFs'}
              </button>
              <ClearButton onClear={handleClear} />
            </div>

            {error && <ErrorMessage message={error} />}

            {mergedPdf && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Merged PDF
                </label>
                <DownloadButton
                  content={mergedPdf}
                  filename="merged.pdf"
                  label="Download Merged PDF"
                  mimeType="application/pdf"
                />
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Merged size: {(mergedPdf.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}
          </div>
        </ToolContainer>

        <RelatedTools currentSlug="pdf-merger" />

        <div className="mt-12 prose prose-gray dark:prose-invert max-w-none">
          <h2>About PDF Merger</h2>
          <p>
            This tool merges multiple PDF files into a single document. You can reorder the files before merging to control the page order in the resulting PDF.
          </p>
          <h3>How to use this tool</h3>
          <ol>
            <li>Upload PDF files by clicking or dragging and dropping</li>
            <li>Reorder the files using the up/down arrows if needed</li>
            <li>Remove unwanted files using the &times; button</li>
            <li>Click &quot;Merge PDFs&quot; to combine all files into one</li>
            <li>Download the merged PDF file</li>
          </ol>
          <h3>Privacy</h3>
          <p>
            This tool processes your PDFs entirely in your browser using the pdf-lib library. Your files never leave your device.
          </p>
        </div>
      </div>
    </div>
  );
}
