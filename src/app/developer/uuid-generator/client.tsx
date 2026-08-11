'use client';

import { useState } from 'react';
import ToolHeader from '@/components/tools/ToolHeader';
import ToolContainer from '@/components/tools/ToolContainer';
import CopyButton from '@/components/tools/CopyButton';
import RelatedTools from '@/components/tools/RelatedTools';

const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export default function UuidGeneratorClient() {
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState(5);

  const handleGenerate = () => {
    const newUuids = Array.from({ length: count }, () => generateUUID());
    setUuids(newUuids);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <ToolHeader
          title="UUID Generator"
          description="Generate UUID v4 identifiers"
          clientSideOnly
        />

        <ToolContainer>
          <div className="space-y-4">
            <div>
              <label htmlFor="uuid-count" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Number of UUIDs to generate
              </label>
              <input
                id="uuid-count"
                type="number"
                min="1"
                max="100"
                value={count}
                onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                className="mt-1 block w-32 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleGenerate}
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Generate UUIDs
              </button>
              {uuids.length > 0 && (
                <CopyButton text={uuids.join('\n')} label="Copy All" />
              )}
            </div>

            {uuids.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Generated UUIDs
                </label>
                <div className="space-y-2">
                  {uuids.map((uuid, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-600 dark:bg-gray-800"
                    >
                      <code className="text-sm font-mono text-gray-900 dark:text-white break-all">{uuid}</code>
                      <CopyButton text={uuid} label="Copy" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ToolContainer>

        <RelatedTools currentSlug="uuid-generator" />

        <div className="mt-12 prose prose-gray dark:prose-invert max-w-none">
          <h2>About UUID Generator</h2>
          <p>
            UUID (Universally Unique Identifier) is a 128-bit identifier used to uniquely identify information in computer systems. UUID v4 is a randomly generated UUID that has a very low probability of collision.
          </p>
          <h3>How to use this tool</h3>
          <ol>
            <li>Set the number of UUIDs you want to generate (1-100)</li>
            <li>Click &quot;Generate UUIDs&quot; to create new UUIDs</li>
            <li>Copy individual UUIDs or all UUIDs at once</li>
          </ol>
          <h3>Privacy</h3>
          <p>
            This tool generates UUIDs entirely in your browser. No data is sent to any server.
          </p>
        </div>
      </div>
    </div>
  );
}
