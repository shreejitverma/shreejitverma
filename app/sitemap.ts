import { MetadataRoute } from 'next';
import { SITE_URL } from './lib/profile';
import { ARTICLES, articleUrl } from './lib/writing';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: SITE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/resume`, lastModified: now, changeFrequency: 'monthly', priority: 0.95 },
    { url: `${SITE_URL}/work/trishul`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/writing`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    ...ARTICLES.map((article) => ({
      url: `${SITE_URL}${articleUrl(article.slug)}`,
      lastModified: new Date(`${article.published}T00:00:00Z`),
      changeFrequency: 'yearly' as const,
      priority: 0.8,
    })),
    { url: `${SITE_URL}/value-investing`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/books`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/Shreejit_Verma_Resume.pdf`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
  ];
}
