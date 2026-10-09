import type { Metadata } from 'next';
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
    alternates: { canonical: url },
    openGraph: published
      ? { ...openGraph, type: 'article', publishedTime: published, authors: [HEADLINE.name] }
      : { ...openGraph, type },
    twitter: { card: 'summary_large_image', title, description, creator: TWITTER_HANDLE, images: [OG_IMAGE] },
  };
}
