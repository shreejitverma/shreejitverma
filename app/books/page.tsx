'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Github, Linkedin, Book, Filter, GraduationCap, Calendar } from 'lucide-react';
import BookCard from './components/BookCard';
import SearchInput from './components/SearchInput';
import CategoryFilter, { type CategoryOption } from './components/CategoryFilter';
import Pagination from './components/Pagination';

// Updated Book Type Definition
interface ScrapedBook {
  title: string;
  author: string;
  year: string;
  category: string;
  downloadLink: string;
  filename: string;
  format: string;
  review?: string;
  isbn?: string;
  publisher?: string;
  genre?: string;
  coverImage?: string;
  description?: string;
  importance?: number;
  salesCount?: number;
}

interface Book extends ScrapedBook {
  rating?: number;
  src?: string;
  link?: string; // Amazon link
}

export default function BooksPage() {
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const gridTopRef = useRef<HTMLDivElement>(null);
  const BOOKS_PER_PAGE = 24;

  useEffect(() => {
    // Switch to validated data source to see sales/importance scores
    fetch('/books_data_validated.json')
      .then(res => res.json())
      .then((data: ScrapedBook[]) => {
        const enhancedData = data.map(b => ({
          ...b,
          rating: 4, 
          review: b.review || b.description || "A valuable addition to any library. This text offers deep insights into its subject matter.",
          link: `https://www.amazon.com/s?k=${encodeURIComponent(b.title + " " + b.author)}`
        }));
        setAllBooks(enhancedData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load books", err);
        setLoading(false);
      });
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1);
  }, []);

  const handleCategorySelect = useCallback((cat: string) => {
    setActiveCategory(cat);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((nextPage: number) => {
    setPage(nextPage);
    gridTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // Filter and Search Logic
  const filteredBooks = useMemo(() => {
    let filtered = allBooks;

    if (activeCategory !== 'All') {
      filtered = filtered.filter(book => book.category === activeCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(query) || 
        book.author.toLowerCase().includes(query) ||
        (book.isbn && book.isbn.includes(query))
      );
    }

    return filtered;
  }, [allBooks, activeCategory, searchQuery]);

  // Pagination Logic
  const paginatedBooks = useMemo(() => {
    const startIndex = (page - 1) * BOOKS_PER_PAGE;
    return filteredBooks.slice(startIndex, startIndex + BOOKS_PER_PAGE);
  }, [filteredBooks, page]);

  const totalPages = Math.ceil(filteredBooks.length / BOOKS_PER_PAGE);

  // Categories are derived from the data so pills always match reality,
  // ordered by shelf size with All first and General (miscellany) last.
  const categories = useMemo<CategoryOption[]>(() => {
    const counts = new Map<string, number>();
    for (const book of allBooks) {
      const cat = book.category || 'General';
      counts.set(cat, (counts.get(cat) ?? 0) + 1);
    }
    const sorted = [...counts.entries()]
      .sort((a, b) => (a[0] === 'General' ? 1 : b[0] === 'General' ? -1 : b[1] - a[1]))
      .map(([name, count]) => ({ name, count }));
    return [{ name: 'All', count: allBooks.length }, ...sorted];
  }, [allBooks]);

  return (
    <div className='min-h-screen bg-background text-muted-foreground font-sans selection:bg-primary/30'>
      {/* Navigation */}
      <nav className='fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-border/50 bg-background/80'>
        <div className='max-w-7xl mx-auto px-6 h-16 flex items-center justify-between'>
          <Link href='/' className='font-mono text-xl font-bold text-primary tracking-tighter hover:text-cyan-500 transition-colors'>
            SV<span className='text-muted-foreground/60'>.quant</span>
          </Link>
          <div className='flex items-center gap-6'>
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
            <div className='flex items-center gap-4 border-l border-border pl-6'>
              <a href='https://github.com/shreejitverma' target='_blank' rel='noopener noreferrer' className='hover:text-primary transition-colors'>
                <Github className='w-5 h-5' />
              </a>
              <a href='https://www.linkedin.com/in/shreejitverma/' target='_blank' rel='noopener noreferrer' className='hover:text-primary transition-colors'>
               <Linkedin className='w-5 h-5' />
              </a>
              <a href='https://scholar.google.com/citations?hl=en&user=qMzU8iAAAAAJ' target='_blank' rel='noopener noreferrer' className='hover:text-primary transition-colors' title="Google Scholar">
                <GraduationCap className='w-5 h-5' />
              </a>
              <a href='https://calendly.com/shreejitverma' target='_blank' rel='noopener noreferrer' className='hover:text-primary transition-colors' title="Schedule a Meeting">
                <Calendar className='w-5 h-5' />
              </a>
              </div>
          </div>
        </div>
      </nav>

      <main className='pt-32 pb-20 px-6 max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-12'>
          <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono mb-6 border border-cyan-500/20'>
            <Book className='w-3 h-3' />
            <span>DIGITAL_LIBRARY</span>
          </div>
          <h1 className='text-5xl md:text-7xl font-bold text-foreground mb-8 tracking-tight'>
            The <span className='text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-500'>Archives</span>
          </h1>
          <p className='text-xl text-muted-foreground dark:text-muted-foreground max-w-3xl leading-relaxed mb-8'>
            A comprehensive digital repository of {allBooks.length > 0 ? allBooks.length : '...'} books covering quantitative finance, algorithms, history, and philosophy.
          </p>
          
          <SearchInput onSearch={handleSearch} />
        </div>

        <CategoryFilter 
          categories={categories} 
          activeCategory={activeCategory} 
          onSelectCategory={handleCategorySelect} 
        />

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
            <p className="text-muted-foreground">Loading library index...</p>
          </div>
        )}

        {/* Books Grid */}
        {!loading && (
          <>
            <div ref={gridTopRef} className='scroll-mt-24 flex items-baseline justify-between mb-6'>
              <p className='text-sm text-muted-foreground font-mono' data-testid='results-summary'>
                {filteredBooks.length === 0
                  ? 'No results'
                  : `Showing ${((page - 1) * BOOKS_PER_PAGE + 1).toLocaleString()}–${Math.min(page * BOOKS_PER_PAGE, filteredBooks.length).toLocaleString()} of ${filteredBooks.length.toLocaleString()} books`}
              </p>
              {totalPages > 1 && (
                <p className='text-sm text-muted-foreground/70 font-mono'>Page {page} of {totalPages}</p>
              )}
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
              {paginatedBooks.map((book, index) => (
                <BookCard 
                  key={`${book.title}-${index}`}
                  title={book.title}
                  author={book.author}
                  category={book.category}
                  year={book.year}
                  format={book.format}
                  review={book.review || ""}
                  downloadLink={book.downloadLink}
                  link={book.link}
                  isbn={book.isbn}
                  publisher={book.publisher}
                  coverImage={book.coverImage}
                  importance={book.importance}
                  salesCount={book.salesCount}
                />
              ))}
            </div>

            {/* Pagination */}
            <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />

            {filteredBooks.length === 0 && (
              <div className='text-center py-32'>
                <Filter className='w-12 h-12 text-slate-300 dark:text-slate-800 mx-auto mb-4' />
                <p className='text-muted-foreground/60 text-lg'>No books found matching your criteria.</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className='py-12 border-t border-border mt-20'>
        <div className='max-w-7xl mx-auto px-6 text-center'>
          <p className='text-muted-foreground/60 text-sm'>
            © {new Date().getFullYear()} Shreejit Verma. Curated for the curious mind.
          </p>
        </div>
      </footer>
    </div>
  );
}