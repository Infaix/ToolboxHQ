import Link from 'next/link';
import { getToolBySlug, toolUrl } from '@/lib/toolRegistry';

interface RelatedToolsProps {
  currentSlug: string;
}

export default function RelatedTools({ currentSlug }: RelatedToolsProps) {
  const tool = getToolBySlug(currentSlug);
  const related = (tool?.relatedTools ?? [])
    .map((slug) => getToolBySlug(slug))
    .filter((t): t is NonNullable<ReturnType<typeof getToolBySlug>> => Boolean(t));

  if (related.length === 0) return null;

  return (
    <div className="mt-12 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Related Tools</h2>
      <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {related.map((relatedTool) => (
          <li key={relatedTool.slug}>
            <Link
              href={toolUrl(relatedTool)}
              className="block rounded-md border border-gray-200 p-4 transition-colors hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
            >
              <span className="block font-medium text-gray-900 dark:text-white">{relatedTool.name}</span>
              <span className="mt-1 block text-sm text-gray-600 dark:text-gray-400">{relatedTool.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
