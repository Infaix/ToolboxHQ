import Link from 'next/link';
import { getToolsByGroup, toolUrl } from '@/lib/toolRegistry';
import type { ToolGroup } from '@/lib/toolRegistry';

interface ToolCategoryPageProps {
  group: ToolGroup;
  title: string;
  description: string;
}

export default function ToolCategoryPage({ group, title, description }: ToolCategoryPageProps) {
  const tools = getToolsByGroup(group);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            All tools
          </Link>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">{title}</h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">{description}</p>
        </div>

        {tools.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
            <p className="text-3xl">🧰</p>
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">More {title} are on the way</h2>
            <p className="mx-auto mt-2 max-w-md text-gray-600 dark:text-gray-400">
              We’re building out this section of the toolbox. In the meantime, explore the tools that are already live.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Browse all tools
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <Link
                key={tool.slug}
                href={toolUrl(tool)}
                className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600"
              >
                {tool.icon && <span className="text-2xl">{tool.icon}</span>}
                <h2 className="mt-3 text-xl font-semibold text-gray-900 dark:text-white">{tool.name}</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{tool.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors group-hover:text-blue-700 dark:text-blue-400">
                  Open tool
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
