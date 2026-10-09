import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { HEADLINE } from './lib/profile';
import { OG_IMAGE } from './lib/seo';

// Link-preview card for LinkedIn, Slack, email, and X shares. Rendered at
// build time; routes that set their own openGraph reference it through
// socialMetadata in app/lib/seo.ts.

export const alt = OG_IMAGE.alt;
export const size = { width: OG_IMAGE.width, height: OG_IMAGE.height };
export const contentType = 'image/png';

const HIGHLIGHTS = ['Low-latency C++', 'FPGA & kernel bypass', 'Market making', 'FRTB market risk'];

export default async function OpenGraphImage() {
  const photo = await readFile(join(process.cwd(), 'public/images/profile-square.jpg'));
  const photoSrc = `data:image/jpeg;base64,${photo.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: 'linear-gradient(135deg, #000000 0%, #0a0a0a 55%, #082f3a 100%)',
          color: '#fafafa',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 760 }}>
          <div style={{ display: 'flex', fontSize: 26, color: '#22d3ee', marginBottom: 20 }}>
            {HEADLINE.current} · {HEADLINE.location}
          </div>
          <div style={{ display: 'flex', fontSize: 84, fontWeight: 700, letterSpacing: -2, lineHeight: 1 }}>{HEADLINE.name}</div>
          <div style={{ display: 'flex', fontSize: 40, color: '#a1a1aa', marginTop: 18 }}>
            Quantitative Developer &amp; Researcher
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 40 }}>
            {HIGHLIGHTS.map((item) => (
              <div
                key={item}
                style={{
                  display: 'flex',
                  fontSize: 24,
                  padding: '10px 18px',
                  marginRight: 14,
                  marginBottom: 14,
                  borderRadius: 999,
                  border: '1px solid #27272a',
                  background: '#18181b',
                  color: '#e4e4e7',
                }}
              >
                {item}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', fontSize: 24, color: '#71717a', marginTop: 18 }}>shreejitverma.com</div>
        </div>
        <img
          src={photoSrc}
          alt=''
          width={280}
          height={280}
          style={{ borderRadius: 999, border: '6px solid #27272a', objectFit: 'cover' }}
        />
      </div>
    ),
    size,
  );
}
