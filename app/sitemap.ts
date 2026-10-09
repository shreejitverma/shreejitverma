import { MetadataRoute } from 'next';
import { ARTICLES, articleUrl } from './lib/writing';

const SITE = 'https://www.shreejitverma.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: SITE, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE}/resume`, lastModified: now, changeFrequency: 'monthly', priority: 0.95 },
    { url: `${SITE}/work/trishul`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE}/writing`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    ...ARTICLES.map((article) => ({
      url: `${SITE}${articleUrl(article.slug)}`,
      lastModified: new Date(`${article.published}T00:00:00Z`),
      changeFrequency: 'yearly' as const,
      priority: 0.8,
    })),
    { url: `${SITE}/value-investing`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE}/books`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE}/Shreejit_Verma_Resume.pdf`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
  ];
}
