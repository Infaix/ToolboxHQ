import { MetadataRoute } from 'next';
import { tools } from '@/lib/toolRegistry';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://toolboxhq.com';

  const toolRoutes = tools.map((tool) => `/${tool.category}/${tool.slug}`);

  const routes = [
    '',
    '/developer',
    '/files',
    ...toolRoutes,
    '/pricing',
    '/about',
    '/privacy',
    '/contact',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : route.split('/').length === 2 ? 0.8 : 0.6,
  }));
}
