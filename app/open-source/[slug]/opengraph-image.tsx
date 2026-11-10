import { notFound } from 'next/navigation';
import { findKnowledgeBase } from '@/app/lib/open-source';
import { OG_SIZE, openSourceCard } from '../og-card';

export const alt = 'Open-source knowledge base by Shreejit Verma';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const kb = findKnowledgeBase((await params).slug);
  if (!kb) notFound();
  return openSourceCard({
    eyebrow: `Open source · MIT · since ${kb.since}`,
    title: kb.name,
    subtitle: kb.tagline,
    stats: kb.stats,
  });
}
