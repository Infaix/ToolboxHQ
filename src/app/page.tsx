import Link from 'next/link';
import { getToolsByCategory } from '@/lib/toolRegistry';

function ToolCard({ slug, name, description }: { slug: string; name: string; description: string }) {
  return (
    <Link href={slug} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{name}</h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </Link>
  );
}

export default function Home() {
  const developerTools = getToolsByCategory('developer');
  const fileTools = getToolsByCategory('files');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            Powerful tools. Simple to use.
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Free, privacy-focused browser-based tools for developers and general users. Process files locally in your browser.
          </p>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Developer Tools</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {developerTools.map((tool) => (
              <ToolCard
                key={tool.slug}
                slug={`/developer/${tool.slug}`}
                name={tool.name}
                description={tool.description}
              />
            ))}
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">File Tools</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {fileTools.map((tool) => (
              <ToolCard
                key={tool.slug}
                slug={`/files/${tool.slug}`}
                name={tool.name}
                description={tool.description}
              />
            ))}
          </div>
        </div>

        <div className="mt-16 rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Privacy First</h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Most of our tools process files locally in your browser. Your files never leave your device unless the operation requires server-side processing. We clearly indicate which tools are 100% client-side.
          </p>
        </div>
      </div>
    </div>
  );
}
