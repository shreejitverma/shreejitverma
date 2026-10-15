import type { NextConfig } from "next";
import { markdownPath, SITE_PAGES } from "./app/lib/agent/pages";

// Markdown for agents (see app/md/[[...path]]/route.ts). Only listed pages
// are rewritten, so static files, API routes, and unknown paths are never
// affected. The Accept match is a substring test, the same rule Cloudflare's
// Markdown for Agents uses; `has` values are anchored regexes in Next.js.
const ACCEPTS_MARKDOWN = [{ type: 'header' as const, key: 'accept', value: '.*[Tt]ext/[Mm]arkdown.*' }];
const markdownRoute = (path: string) => (path === '/' ? '/md' : `/md${path}`);

// Discovery links on every page (RFC 8288), so an agent that fetches any
// page finds the catalogs, the MCP server, llms.txt, and the Markdown twin.
const DISCOVERY_LINKS = [
  '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
  '</mcp/server-card>; rel="service-desc"; type="application/mcp-server-card+json"',
  '</llms.txt>; rel="describedby"; type="text/plain"',
];

// URLs from earlier versions of the site that search engines and old links
// still point at. A permanent redirect hands their ranking signals to the
// current page instead of discarding them as 404s.
const LEGACY_REDIRECTS: [source: string, destination: string][] = [
  ['/index.html', '/'],
  ['/experience.html', '/#experience'],
  ['/education.html', '/#education'],
  ['/projects.html', '/#projects'],
  ['/skills.html', '/#skills'],
  ['/achievements.html', '/#awards'],
  ['/awards.html', '/#awards'],
  ['/certifications.html', '/#certifications'],
  ['/resume.html', '/resume'],
  ['/blog.html', '/writing'],
  ['/books.html', '/books'],
  // Sources match the percent-encoded path, so spaces are written as %20.
  ['/Resources%20-%20Books.html', '/books'],
  ['/resources.html', '/books'],
  // Earlier resume PDFs: always serve the current one, never a stale copy.
  ['/Resume.pdf', '/Shreejit_Verma_Resume.pdf'],
  ['/resume.pdf', '/Shreejit_Verma_Resume.pdf'],
  ['/static/Resume.pdf', '/Shreejit_Verma_Resume.pdf'],
  ['/static/profile.png', '/Shreejit_Verma_profile_pic.jpg'],
];

const nextConfig: NextConfig = {
  async redirects() {
    return [
      ...LEGACY_REDIRECTS.map(([source, destination]) => ({ source, destination, permanent: true })),
      // Any other page of the old static site: the closest current page is home.
      { source: '/:page([^/]+)\\.html', destination: '/', permanent: true },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: SITE_PAGES.flatMap((page) => [
        { source: page.path, has: ACCEPTS_MARKDOWN, destination: markdownRoute(page.path) },
        { source: markdownPath(page.path), destination: markdownRoute(page.path) },
      ]),
      afterFiles: [],
      fallback: [],
    };
  },
  async headers() {
    // HTML responses only: the Markdown response sets its own Link
    // (rel="canonical" back to the page), which this would replace. No Vary
    // here: a config-level Vary replaces the Vary Next.js sets on RSC
    // responses (rsc, next-router-state-tree, ...).
    return SITE_PAGES.map((page) => ({
      source: page.path,
      missing: ACCEPTS_MARKDOWN,
      headers: [
        { key: 'Link', value: [...DISCOVERY_LINKS, `<${markdownPath(page.path)}>; rel="alternate"; type="text/markdown"`].join(', ') },
      ],
    }));
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/u/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'books.google.com',
        port: '',
        pathname: '/books/**',
      },
      {
        protocol: 'https',
        hostname: 'images-na.ssl-images-amazon.com',
        port: '',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'covers.openlibrary.org',
        port: '',
        pathname: '/b/**',
      },
    ],
  },
};

export default nextConfig;
