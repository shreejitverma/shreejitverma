import { MetadataRoute } from 'next';
import { SITE_PAGES } from './lib/agent/pages';
import { SITE_URL } from './lib/profile';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    ...SITE_PAGES.map((page) => ({
      url: `${SITE_URL}${page.path === '/' ? '' : page.path}`,
      lastModified: page.published ? new Date(`${page.published}T00:00:00Z`) : now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    { url: `${SITE_URL}/Shreejit_Verma_Resume.pdf`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
  ];
}
