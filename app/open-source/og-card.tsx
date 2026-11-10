import { ImageResponse } from 'next/og';
import { HEADLINE } from '@/app/lib/profile';

// Link-preview card for the open-source pages, in the same visual language as
// the site card (app/opengraph-image.tsx), so a share on LinkedIn, X, or
// Slack names the repository and its headline numbers instead of the resume.

export const OG_SIZE = { width: 1200, height: 630 };

interface OgCardInput {
  eyebrow: string;
  title: string;
  subtitle: string;
  stats: { value: string; label: string }[];
  titleSize?: number; // px; smaller for titles that wrap to two lines
}

export function openSourceCard({ eyebrow, title, subtitle, stats, titleSize = 76 }: OgCardInput): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 80px',
          background: 'linear-gradient(135deg, #000000 0%, #0a0a0a 55%, #082f3a 100%)',
          color: '#fafafa',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 26, color: '#22d3ee', marginBottom: 18 }}>{eyebrow}</div>
          <div style={{ display: 'flex', fontSize: titleSize, fontWeight: 700, letterSpacing: -2, lineHeight: 1.05 }}>{title}</div>
          <div style={{ display: 'flex', fontSize: 32, color: '#a1a1aa', marginTop: 18, maxWidth: 1040 }}>{subtitle}</div>
        </div>
        <div style={{ display: 'flex' }}>
          {stats.slice(0, 4).map((stat) => (
            <div
              key={stat.label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '16px 22px',
                marginRight: 18,
                borderRadius: 18,
                border: '1px solid #27272a',
                background: '#18181b',
                width: 236,
              }}
            >
              <div style={{ display: 'flex', fontSize: 44, fontWeight: 700 }}>{stat.value}</div>
              <div style={{ display: 'flex', fontSize: 20, color: '#a1a1aa', marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', fontSize: 24, color: '#71717a' }}>
          {`By ${HEADLINE.name}, ${HEADLINE.current} · shreejitverma.com`}
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
