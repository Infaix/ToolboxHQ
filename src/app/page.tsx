import Link from 'next/link';
import ToolSearch from '@/components/tools/ToolSearch';
import { getToolBySlug, getToolsByCategory, getToolsByGroup, toolUrl } from '@/lib/toolRegistry';
import type { Tool } from '@/lib/toolRegistry';

const FEATURED_SLUGS = [
  'pdf-editor',
  'image-compressor',
  'jpg-to-png',
  'pdf-merger',
  'png-to-jpg',
  'json-formatter',
];

const CATEGORY_SECTIONS = [
  { group: 'pdf' as const, title: 'PDF Tools', tagline: 'Edit, merge, split and compress PDFs.', href: '/pdf' },
  { group: 'images' as const, title: 'Image Tools', tagline: 'Convert, compress and resize images.', href: '/images' },
  { group: 'developer' as const, title: 'Developer Tools', tagline: 'Format, validate and generate.', href: '/developer' },
  { group: 'utilities' as const, title: 'Utility Tools', tagline: 'Convert units and generate QR codes.', href: '/utilities' },
];

const COMING_SOON = [
  { title: 'Document Tools', tagline: 'Markdown, CSV & document utilities', href: '/documents', icon: '🗂️' },
  { title: 'Student Tools', tagline: 'Word counts, citations & more', href: '/students', icon: '🎓' },
];

function ToolCard({ tool, highlight = false }: { tool: Tool; highlight?: boolean }) {
  return (
    <Link
      href={toolUrl(tool)}
      className={`group flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-800 ${
        highlight
          ? 'border-blue-500 dark:border-blue-600'
          : 'border-gray-200 hover:border-blue-300 dark:border-gray-700 dark:hover:border-blue-600'
      }`}
    >
      {tool.icon && <span className="text-2xl">{tool.icon}</span>}
      <h3 className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">{tool.name}</h3>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{tool.description}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors group-hover:text-blue-700 dark:text-blue-400">
        Open tool
        <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </span>
    </Link>
  );
}

function CategorySection({ group, title, tagline, href }: { group: 'pdf' | 'images' | 'developer' | 'utilities'; title: string; tagline: string; href: string }) {
  const tools = getToolsByGroup(group);
  return (
    <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{title}</h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">{tagline}</p>
        </div>
        <Link href={href} className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400">
          Explore {title}
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const featured = FEATURED_SLUGS.map((slug) => getToolBySlug(slug)).filter((t): t is Tool => Boolean(t));

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      {/* Hero */}
      <section className="border-b border-gray-200 bg-gradient-to-b from-blue-50/70 to-transparent dark:border-gray-800 dark:from-blue-950/20">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            Free • No sign-up • Your files stay on your device
          </p>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            Free tools for everyday tasks.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            Edit PDFs, convert images, format code and more — a growing toolbox that runs
            entirely in your browser.
          </p>
          <div className="mx-auto mt-10 max-w-xl">
            <ToolSearch size="lg" />
          </div>
        </div>
      </section>

      {/* Popular tools */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Popular Tools</h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">A quick look at what people use most.</p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((tool, index) => (
            <ToolCard key={tool.slug} tool={tool} highlight={index === 0} />
          ))}
        </div>
      </section>

      {/* Category sections */}
      {CATEGORY_SECTIONS.map((section) => (
        <CategorySection key={section.group} {...section} />
      ))}

      {/* Coming soon */}
      <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-center text-xl font-bold text-gray-900 dark:text-white">More of the toolbox is on the way</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {COMING_SOON.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl border border-gray-200 p-5 transition-colors hover:border-blue-300 dark:border-gray-700 dark:hover:border-blue-600"
              >
                <span className="text-2xl">{item.icon}</span>
                <h3 className="mt-2 font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{item.tagline}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Privacy first</h2>
          <p className="mt-4 max-w-3xl text-gray-600 dark:text-gray-400">
            Most of our tools process everything locally in your browser — your files never leave
            your device. No accounts, no tracking, no uploads.
          </p>
        </div>
      </section>
    </div>
  );
}
