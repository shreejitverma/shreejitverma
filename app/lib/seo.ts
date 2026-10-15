import type { Metadata } from 'next';
import { markdownPath } from './agent/pages';
import { HEADLINE, SITE_URL } from './profile';

export const SITE_NAME = 'Shreejit Verma Portfolio';
export const TWITTER_HANDLE = '@shreejitverma';

// The generated card served by app/opengraph-image.tsx.
export const OG_IMAGE = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: `${HEADLINE.name} - ${HEADLINE.current}, ${HEADLINE.location}`,
};

// Canonical URL plus the page's Markdown twin, advertised to agents with
// <link rel="alternate" type="text/markdown">.
export function markdownAlternates(path: string): NonNullable<Metadata['alternates']> {
  return {
    canonical: `${SITE_URL}${path === '/' ? '' : path}`,
    types: { 'text/markdown': `${SITE_URL}${markdownPath(path)}` },
  };
}

interface SocialMetadataInput {
  path: string;
  title: string;
  description: string;
  type?: 'website' | 'article' | 'profile';
  published?: string; // ISO date; article pages only
}

// Next.js replaces a parent's openGraph and twitter objects wholesale instead
// of merging them, so every route restates both or its link preview falls back
// to the home page card. Restating openGraph also drops the inherited card
// image, so it is listed again here.
export function socialMetadata({ path, title, description, type = 'website', published }: SocialMetadataInput): Metadata {
  const url = `${SITE_URL}${path}`;
  const openGraph = { url, title, description, siteName: SITE_NAME, locale: 'en_US', images: [OG_IMAGE] };
  return {
    alternates: markdownAlternates(path),
    openGraph: published
      ? { ...openGraph, type: 'article', publishedTime: published, authors: [HEADLINE.name] }
      : { ...openGraph, type },
    twitter: { card: 'summary_large_image', title, description, creator: TWITTER_HANDLE, images: [OG_IMAGE] },
  };
}
