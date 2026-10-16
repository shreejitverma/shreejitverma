import { HEADLINE, SITE_URL } from '@/app/lib/profile';
import { ARTICLES, articleUrl } from '@/app/lib/writing';

// Atom 1.0 feed (RFC 4287) of the articles, so feed readers, aggregators, and
// crawlers that follow feeds learn about new writing without recrawling the
// whole site. Generated from app/lib/writing.ts at build time.
export const dynamic = 'force-static';

const escapeXml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const isoDate = (day: string) => `${day}T00:00:00Z`;

export function GET() {
  const articles = [...ARTICLES].sort((a, b) => b.published.localeCompare(a.published));
  const entries = articles.map((article) => {
    const url = `${SITE_URL}${articleUrl(article.slug)}`;
    return `  <entry>
    <title>${escapeXml(article.title)}</title>
    <link rel="alternate" type="text/html" href="${url}"/>
    <link rel="alternate" type="text/markdown" href="${url}.md"/>
    <id>${url}</id>
    <published>${isoDate(article.published)}</published>
    <updated>${isoDate(article.published)}</updated>
    <summary>${escapeXml(article.description)}</summary>
${article.tags.map((tag) => `    <category term="${escapeXml(tag)}"/>`).join('\n')}
  </entry>`;
  });
  const feed = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(HEADLINE.name)} - Writing</title>
  <subtitle>Technical articles on low-latency trading systems, FPGA market making, and market risk.</subtitle>
  <link rel="self" type="application/atom+xml" href="${SITE_URL}/feed.xml"/>
  <link rel="alternate" type="text/html" href="${SITE_URL}/writing"/>
  <id>${SITE_URL}/feed.xml</id>
  <updated>${isoDate(articles[0].published)}</updated>
  <author>
    <name>${escapeXml(HEADLINE.name)}</name>
    <uri>${SITE_URL}</uri>
  </author>
${entries.join('\n')}
</feed>
`;
  return new Response(feed, { headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' } });
}
