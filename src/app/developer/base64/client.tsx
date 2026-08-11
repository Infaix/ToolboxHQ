'use client';

import { useState } from 'react';
import ToolHeader from '@/components/tools/ToolHeader';
import ToolContainer from '@/components/tools/ToolContainer';
import CopyButton from '@/components/tools/CopyButton';
import ClearButton from '@/components/tools/ClearButton';
import ErrorMessage from '@/components/tools/ErrorMessage';
import RelatedTools from '@/components/tools/RelatedTools';

function encodeBase64(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function decodeBase64(input: string): string {
  const binary = atob(input);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

export default function Base64Client() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [error, setError] = useState('');

  const handleEncode = () => {
    setError('');
    if (!input) {
      setOutput('');
      return;
    }
    try {
      setOutput(encodeBase64(input));
    } catch {
      setError('Failed to encode. Please check your input.');
      setOutput('');
    }
  };

  const handleDecode = () => {
    setError('');
    if (!input) {
      setOutput('');
      return;
    }
    try {
      setOutput(decodeBase64(input));
    } catch {
      setError('Invalid Base64 string or the decoded content is not valid UTF-8 text.');
      setOutput('');
    }
  };

  const handleProcess = () => {
    if (mode === 'encode') {
      handleEncode();
    } else {
      handleDecode();
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  const handleModeChange = (nextMode: 'encode' | 'decode') => {
    setMode(nextMode);
    setOutput('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <ToolHeader
          title="Base64 Encoder/Decoder"
          description="Encode text to Base64 or decode Base64 to text"
          clientSideOnly
        />

        <ToolContainer>
          <div className="space-y-4">
            <div className="flex gap-4">
              <button
                onClick={() => handleModeChange('encode')}
                aria-pressed={mode === 'encode'}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  mode === 'encode'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                }`}
              >
                Encode
              </button>
              <button
                onClick={() => handleModeChange('decode')}
                aria-pressed={mode === 'decode'}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  mode === 'decode'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                }`}
              >
                Decode
              </button>
            </div>

            <div>
              <label htmlFor="base64-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {mode === 'encode' ? 'Text to Encode' : 'Base64 to Decode'}
              </label>
              <textarea
                id="base64-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 string to decode...'}
                rows={6}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleProcess}
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {mode === 'encode' ? 'Encode' : 'Decode'}
              </button>
              <CopyButton text={output} label="Copy Result" />
              <ClearButton onClear={handleClear} />
            </div>

            {error && <ErrorMessage message={error} />}

            {output && (
              <div>
                <label htmlFor="base64-output" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Result
                </label>
                <textarea
                  id="base64-output"
                  value={output}
                  readOnly
                  rows={6}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
            )}
          </div>
        </ToolContainer>

        <RelatedTools currentSlug="base64" />

        <div className="mt-12 prose prose-gray dark:prose-invert max-w-none">
          <h2>About Base64 Encoding</h2>
          <p>
            Base64 is a binary-to-text encoding scheme that represents binary data in an ASCII string format. It&apos;s commonly used to encode data in URLs, in email bodies, and for storing complex data in text-based formats like JSON and XML.
          </p>
          <h3>How to use this tool</h3>
          <ol>
            <li>Select &quot;Encode&quot; to convert text to Base64, or &quot;Decode&quot; to convert Base64 back to text</li>
            <li>Enter your input in the text field</li>
            <li>Click the appropriate button to process your input</li>
            <li>Copy the result using the &quot;Copy Result&quot; button</li>
          </ol>
          <h3>Privacy</h3>
          <p>
            This tool processes your data entirely in your browser. Your data never leaves your device.
          </p>
        </div>
      </div>
    </div>
  );
}
