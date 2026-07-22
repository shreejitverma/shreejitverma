import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://www.shreejitverma.com/value-investing',
  },
};

export default function ValueInvestingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
