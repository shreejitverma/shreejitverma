// Every indexable HTML page on the site. The sitemap, llms.txt, the Markdown
// endpoint's allowlist, and the agent tools all read from here, so a page
// added to this list becomes discoverable everywhere at once.

import type { MetadataRoute } from 'next';
import { ARTICLES, articleUrl } from '../writing';

export interface SitePage {
  path: string; // canonical path; '/' for home
  title: string;
  summary: string; // one line, shown in llms.txt and agent tool output
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;
  priority: number;
  published?: string; // ISO date; article pages only
}

export const SITE_PAGES: SitePage[] = [
  {
    path: '/',
    title: 'Home',
    summary: 'Profile, experience, research, projects, skills, education, GitHub activity, and writing',
    changeFrequency: 'weekly',
    priority: 1,
  },
  {
    path: '/resume',
    title: 'Resume',
    summary: 'Full resume as a web page, including certifications',
    changeFrequency: 'monthly',
    priority: 0.95,
  },
  {
    path: '/work/trishul',
    title: 'Trishul case study',
    summary: 'AI-integrated FPGA market-making system (MS thesis): sub-10us tick-to-trade design and results',
    changeFrequency: 'monthly',
    priority: 0.9,
  },
  {
    path: '/writing',
    title: 'Writing',
    summary: 'Technical articles on low-latency systems and market risk',
    changeFrequency: 'weekly',
    priority: 0.8,
  },
  ...ARTICLES.map((article) => ({
    path: articleUrl(article.slug),
    title: article.title,
    summary: article.description,
    changeFrequency: 'yearly' as const,
    priority: 0.8,
    published: article.published,
  })),
  {
    path: '/value-investing',
    title: 'Value Intelligence Platform',
    summary: 'Reproducible value-investing screen with a deterministic multi-factor scoring engine',
    changeFrequency: 'monthly',
    priority: 0.6,
  },
  {
    path: '/books',
    title: 'Reading List',
    summary: 'Curated finance and engineering library',
    changeFrequency: 'monthly',
    priority: 0.5,
  },
];

export function findPage(path: string): SitePage | undefined {
  return SITE_PAGES.find((page) => page.path === path);
}

// The `.md` twin of a page: `/` is served as `/index.md`, `/resume` as `/resume.md`.
export function markdownPath(path: string): string {
  return path === '/' ? '/index.md' : `${path}.md`;
}
