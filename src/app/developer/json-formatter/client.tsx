'use client';

import { useState } from 'react';
import ToolHeader from '@/components/tools/ToolHeader';
import ToolContainer from '@/components/tools/ToolContainer';
import CopyButton from '@/components/tools/CopyButton';
import ClearButton from '@/components/tools/ClearButton';
import ErrorMessage from '@/components/tools/ErrorMessage';
import RelatedTools from '@/components/tools/RelatedTools';

export default function JsonFormatterClient() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isMinified, setIsMinified] = useState(false);

  const formatJson = () => {
    setError('');
    try {
      if (!input.trim()) {
        setOutput('');
        return;
      }
      const parsed = JSON.parse(input);
      if (isMinified) {
        setOutput(JSON.stringify(parsed));
      } else {
        setOutput(JSON.stringify(parsed, null, 2));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
      setOutput('');
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <ToolHeader
          title="JSON Formatter"
          description="Format and beautify JSON data with syntax highlighting"
          clientSideOnly
        />

        <ToolContainer>
          <div className="space-y-4">
            <div>
              <label htmlFor="json-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Input JSON
              </label>
              <textarea
                id="json-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='{"key": "value"}'
                rows={10}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={formatJson}
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isMinified ? 'Minify' : 'Format'}
              </button>
              <button
                onClick={() => setIsMinified(!isMinified)}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                {isMinified ? 'Switch to Format' : 'Switch to Minify'}
              </button>
              <CopyButton text={output} label="Copy Result" />
              <ClearButton onClear={handleClear} />
            </div>

            {error && <ErrorMessage message={error} />}

            {output && (
              <div>
                <label htmlFor="json-output" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Output
                </label>
                <textarea
                  id="json-output"
                  value={output}
                  readOnly
                  rows={10}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
            )}
          </div>
        </ToolContainer>

        <RelatedTools currentSlug="json-formatter" />

        <div className="mt-12 prose prose-gray dark:prose-invert max-w-none">
          <h2>About JSON Formatter</h2>
          <p>
            JSON (JavaScript Object Notation) is a lightweight data-interchange format that is easy for humans to read and write and easy for machines to parse and generate.
          </p>
          <h3>How to use this tool</h3>
          <ol>
            <li>Paste your JSON data into the input field</li>
            <li>Click &quot;Format&quot; to beautify the JSON with proper indentation</li>
            <li>Click &quot;Switch to Minify&quot; to remove unnecessary whitespace</li>
            <li>Copy the result using the &quot;Copy Result&quot; button</li>
          </ol>
          <h3>Common JSON errors</h3>
          <p>
            Common mistakes include trailing commas, unquoted or single-quoted keys, and missing brackets. Use the JSON Validator to check your data for syntax errors.
          </p>
          <h3>Privacy</h3>
          <p>
            This tool processes your JSON data entirely in your browser. Your data never leaves your device.
          </p>
        </div>
      </div>
    </div>
  );
}
