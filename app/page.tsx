import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://www.shreejitverma.com',
  },
};

export default function Home() {
  return <HomeClient />;
}
