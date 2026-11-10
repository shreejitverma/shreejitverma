import { KNOWLEDGE_BASES } from '@/app/lib/open-source';
import { OG_SIZE, openSourceCard } from './og-card';

export const alt = 'Open-source knowledge bases by Shreejit Verma: The Quant Prep and The Distinguished Engineer';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return openSourceCard({
    eyebrow: 'Open source · MIT · free for everyone',
    title: 'The Quant Prep + The Distinguished Engineer',
    subtitle: 'Over a decade of notes on quant finance, low-latency C++, system design, and agentic AI.',
    titleSize: 54,
    stats: KNOWLEDGE_BASES.flatMap((kb) => kb.stats.slice(0, 2)),
  });
}
