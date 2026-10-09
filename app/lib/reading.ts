// Home page "Essential Reading" preview of the /books reading list.
import books from '@/public/books_data_validated.json';

export interface FeaturedBook {
  title: string;
  author: string;
  cover: string;
}

// Trading-psychology and technical-analysis classics first, then the quant
// canon. Covers are local files under public/books and public/covers.
export const FEATURED_BOOKS: FeaturedBook[] = [
  { title: 'Encyclopedia of Chart Patterns', author: 'Thomas N. Bulkowski', cover: '/books/51lKgRQh1XL._SX346_BO1204203200_.jpg.webp' },
  { title: 'Trading in the Zone', author: 'Mark Douglas', cover: '/books/51pJPs1sMHL._SX320_BO1204203200_.jpg.webp' },
  { title: 'The Intelligent Investor', author: 'Benjamin Graham', cover: '/books/51DLoxAJ68L._SX324_BO1204203200_.jpg.webp' },
  { title: 'Technical Analysis from A to Z', author: 'Steven B. Achelis', cover: '/books/0071363483.01._SCLZZZZZZZ_SX500_.jpg' },
  { title: 'Super Trader', author: 'Van K. Tharp', cover: '/books/51zIH54q13L._SX346_BO1204203200_.jpg.webp' },
  { title: 'High Probability Trading', author: 'Marcel Link', cover: '/books/51rC1PZVJjL._SX328_BO1204203200_.jpg.webp' },
  { title: 'Options, Futures, and Other Derivatives', author: 'John C. Hull', cover: '/covers/options-futures-and-other-derivatives-8aaef618bc.webp' },
  { title: 'Stochastic Calculus for Finance II', author: 'Steven E. Shreve', cover: '/covers/stochastic-calculus-models-for-finance-ii-continuous-time-mo-e61ea199a1.webp' },
  { title: 'The Man Who Solved the Market', author: 'Gregory Zuckerman', cover: '/covers/the-man-who-solved-the-market-how-jim-simons-launched-the-qu-896905a817.webp' },
  { title: 'Machine Learning for Asset Managers', author: 'Marcos López de Prado', cover: '/covers/machine-learning-for-asset-managers-1c342c7280.webp' },
  { title: 'A Practical Guide to Quantitative Finance Interviews', author: 'Xinfeng Zhou', cover: '/covers/a-practical-guide-to-quantitative-finance-interviews-bed0e3f4df.webp' },
  { title: 'Fooled by Randomness', author: 'Nassim Nicholas Taleb', cover: '/covers/fooled-by-randomness-the-hidden-role-of-chance-in-life-and-i-f61c3aac84.webp' },
];

export interface LibraryShelf {
  name: string;
  count: number;
}

export interface LibraryStats {
  total: number;
  shelves: LibraryShelf[];
}

// Counted from the same dataset /books renders, so the preview cannot drift.
export function getLibraryStats(): LibraryStats {
  const byShelf = new Map<string, number>();
  for (const book of books as { category?: string }[]) {
    const shelf = book.category?.trim() || 'General';
    byShelf.set(shelf, (byShelf.get(shelf) ?? 0) + 1);
  }
  const shelves = [...byShelf.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  return { total: books.length, shelves };
}
