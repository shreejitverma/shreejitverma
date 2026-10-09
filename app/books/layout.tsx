import type { Metadata } from 'next';
import { socialMetadata } from '@/app/lib/seo';

const description =
  'A curated digital library of books on quantitative finance, algorithms, history, and philosophy, collected by Shreejit Verma.';

export const metadata: Metadata = {
  title: 'Reading List',
  description,
  ...socialMetadata({ path: '/books', title: 'Reading List | Shreejit Verma', description }),
};

export default function BooksLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
