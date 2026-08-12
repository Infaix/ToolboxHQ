import { MetadataRoute } from 'next';
import { tools, toolUrl } from '@/lib/toolRegistry';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const toolRoutes = tools.map((tool) => toolUrl(tool));

  const routes = [
    '',
    '/pdf',
    '/images',
    '/documents',
    '/students',
    '/utilities',
    '/developer',
    '/files',
    ...toolRoutes,
    '/pdf-editor/editor',
    '/pricing',
    '/about',
    '/privacy',
    '/contact',
  ];

  const unique = [...new Set(routes)];

  return unique.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : route.split('/').length === 2 ? 0.8 : 0.6,
  }));
}
