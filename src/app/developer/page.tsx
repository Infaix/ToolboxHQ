import type { Metadata } from 'next';
import Link from 'next/link';
import { getToolsByCategory } from '@/lib/toolRegistry';

export const metadata: Metadata = {
  title: 'Developer Tools',
  description: 'Free browser-based developer tools: JSON formatter and validator, Base64 encoder/decoder, UUID generator, and regex tester. All processing happens locally in your browser.',
};

export default function DeveloperPage() {
  const tools = getToolsByCategory('developer');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Developer Tools</h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Free browser-based tools for developers. Process data locally in your browser.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/developer/${tool.slug}`}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-colors hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{tool.name}</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{tool.description}</p>
              {tool.clientSideOnly && (
                <div className="mt-4 inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-900 dark:text-green-200">
                  100% Client-Side
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
