'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Github, Linkedin, Book, Filter } from 'lucide-react';
import BookCard from './components/BookCard';
import SearchInput from './components/SearchInput';
import CategoryFilter from './components/CategoryFilter';

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

  const categories = [
    'All', 
    'Finance & Trading', 
    'Computer Science & Data',
    'Business & Leadership',
    'Self-Help & Psychology', 
    'Philosophy & Spirituality', 
    'History & Geopolitics',
    'Science & Math',
    'Fiction & Literature',
    'General'
  ];

  return (
    <div className='min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-cyan-500/30'>
      {/* Navigation */}
      <nav className='fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-slate-800/50 bg-slate-950/80'>
        <div className='max-w-7xl mx-auto px-6 h-16 flex items-center justify-between'>
          <Link href='/' className='font-mono text-xl font-bold text-cyan-400 tracking-tighter hover:text-cyan-300 transition-colors'>
            SV<span className='text-slate-500'>.quant</span>
          </Link>
          <div className='flex items-center gap-6'>
            <Link href="/" className="text-sm font-medium hover:text-cyan-400 transition-colors">Home</Link>
            <div className='flex items-center gap-4 border-l border-slate-800 pl-6'>
              <a href='https://github.com/shreejitverma' target='_blank' rel='noopener noreferrer' className='hover:text-cyan-400 transition-colors'>
                <Github className='w-5 h-5' />
              </a>
              <a href='https://www.linkedin.com/in/shreejitverma/' target='_blank' rel='noopener noreferrer' className='hover:text-cyan-400 transition-colors'>
                <Linkedin className='w-5 h-5' />
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className='pt-32 pb-20 px-6 max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-12'>
          <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono mb-6 border border-cyan-500/20'>
            <Book className='w-3 h-3' />
            <span>DIGITAL_LIBRARY</span>
          </div>
          <h1 className='text-5xl md:text-7xl font-bold text-slate-100 mb-8 tracking-tight'>
            The <span className='text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500'>Archives</span>
          </h1>
          <p className='text-xl text-slate-400 max-w-3xl leading-relaxed mb-8'>
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
            <p className="text-slate-500">Loading library index...</p>
          </div>
        )}

        {/* Books Grid */}
        {!loading && (
          <>
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
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-16">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 disabled:opacity-50 hover:border-cyan-500/30 transition-all"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-500 font-mono">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 disabled:opacity-50 hover:border-cyan-500/30 transition-all"
                >
                  Next
                </button>
              </div>
            )}

            {filteredBooks.length === 0 && (
              <div className='text-center py-32'>
                <Filter className='w-12 h-12 text-slate-800 mx-auto mb-4' />
                <p className='text-slate-500 text-lg'>No books found matching your criteria.</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className='py-12 border-t border-slate-800/50 mt-20'>
        <div className='max-w-7xl mx-auto px-6 text-center'>
          <p className='text-slate-500 text-sm'>
            © {new Date().getFullYear()} Shreejit Verma. Curated for the curious mind.
          </p>
        </div>
      </footer>
    </div>
  );
}