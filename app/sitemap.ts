import { MetadataRoute } from 'next';
import { SITE_PAGES } from './lib/agent/pages';
import { SITE_URL } from './lib/profile';

// lastmod is set only where a real date exists (an article's publication
// date). Stamping every page with the build time would claim a change on
// each deploy, and search engines learn to ignore a sitemap's lastmod once
// it proves unreliable. changeFrequency and priority are kept as hints for
// crawlers that still read them.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...SITE_PAGES.map((page) => ({
      url: `${SITE_URL}${page.path === '/' ? '' : page.path}`,
      ...(page.published ? { lastModified: new Date(`${page.published}T00:00:00Z`) } : {}),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    { url: `${SITE_URL}/Shreejit_Verma_Resume.pdf`, changeFrequency: 'monthly', priority: 0.9 },
  ];
}
