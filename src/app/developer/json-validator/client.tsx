'use client';

import { useState } from 'react';
import ToolHeader from '@/components/tools/ToolHeader';
import ToolContainer from '@/components/tools/ToolContainer';
import CopyButton from '@/components/tools/CopyButton';
import ClearButton from '@/components/tools/ClearButton';
import ErrorMessage from '@/components/tools/ErrorMessage';
import RelatedTools from '@/components/tools/RelatedTools';

export default function JsonValidatorClient() {
  const [input, setInput] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [formattedJson, setFormattedJson] = useState('');

  const validateJson = () => {
    setError('');
    setFormattedJson('');

    if (!input.trim()) {
      setIsValid(null);
      return;
    }

    try {
      const parsed = JSON.parse(input);
      setIsValid(true);
      setFormattedJson(JSON.stringify(parsed, null, 2));
    } catch (e) {
      setIsValid(false);
      setError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  };

  const handleClear = () => {
    setInput('');
    setIsValid(null);
    setError('');
    setFormattedJson('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <ToolHeader
          title="JSON Validator"
          description="Validate JSON syntax and display useful error messages"
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
                onClick={validateJson}
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Validate
              </button>
              <CopyButton text={formattedJson} label="Copy Valid JSON" />
              <ClearButton onClear={handleClear} />
            </div>

            {isValid === true && (
              <div className="rounded-md border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-800 dark:text-green-200">Valid JSON!</p>
                  </div>
                </div>
              </div>
            )}

            {isValid === false && <ErrorMessage message={error} />}

            {formattedJson && (
              <div>
                <label htmlFor="json-output" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Formatted JSON
                </label>
                <textarea
                  id="json-output"
                  value={formattedJson}
                  readOnly
                  rows={10}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
            )}
          </div>
        </ToolContainer>

        <RelatedTools currentSlug="json-validator" />

        <div className="mt-12 prose prose-gray dark:prose-invert max-w-none">
          <h2>About JSON Validator</h2>
          <p>
            This tool validates JSON syntax and helps you identify and fix errors in your JSON data. JSON (JavaScript Object Notation) is a lightweight data-interchange format.
          </p>
          <h3>How to use this tool</h3>
          <ol>
            <li>Paste your JSON data into the input field</li>
            <li>Click &quot;Validate&quot; to check the syntax</li>
            <li>If valid, you&apos;ll see a success message and the formatted JSON</li>
            <li>If invalid, you&apos;ll see an error message explaining the issue</li>
          </ol>
          <h3>Common JSON errors</h3>
          <p>
            Common errors include trailing commas, mismatched brackets, missing quotes around keys, and unexpected characters. The error message will point to the exact position of the problem.
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
