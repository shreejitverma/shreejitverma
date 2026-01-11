'use client';

import { memo } from 'react';
import Image from 'next/image';
import { Download, ExternalLink, FileText, Hash, TrendingUp, Users } from 'lucide-react';

interface BookCardProps {
  title: string;
  author: string;
  category: string;
  year: string;
  format: string;
  review: string;
  downloadLink: string;
  link?: string;
  isbn?: string;
  publisher?: string;
  coverImage?: string;
  importance?: number;
  salesCount?: number;
}

const PLACEHOLDER_COVER = 'https://placehold.co/400x600/1e293b/cbd5e1?text=Book+Cover';

const BookCard = memo(({ title, author, category, year, format, review, downloadLink, link, isbn, publisher, coverImage, importance, salesCount }: BookCardProps) => {
  return (
    <div className='group relative bg-slate-900/30 border border-slate-800/50 rounded-2xl p-5 hover:border-cyan-500/40 transition-all duration-300 flex flex-col hover:shadow-xl hover:shadow-cyan-500/5 backdrop-blur-sm'>
      <div className='flex gap-4 mb-4'>
        <div className='relative w-20 h-28 shrink-0 rounded-lg overflow-hidden shadow-lg border border-slate-700/50 bg-slate-800'>
          <Image 
            src={coverImage || PLACEHOLDER_COVER} 
            alt={title} 
            fill 
            className='object-cover opacity-80 group-hover:opacity-100 transition-opacity'
            sizes="(max-width: 768px) 80px, 100px"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60"></div>
        </div>
        <div className='flex flex-col justify-between min-w-0 flex-1'>
          <div>
            <div className='flex justify-between items-start gap-2'>
              <div className='text-[10px] uppercase tracking-widest font-bold text-cyan-400 mb-1 truncate flex-1'>
                {category.split('&')[0]}
              </div>
              
              <div className="flex gap-1">
                {importance !== undefined && (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded-full border border-emerald-400/20" title="Importance Score">
                    <TrendingUp className="w-3 h-3" />
                    {importance}
                  </div>
                )}
              </div>
            </div>
            
            <h3 className='font-bold text-slate-100 leading-snug text-sm group-hover:text-cyan-400 transition-colors duration-300 line-clamp-2' title={title}>
              {title}
            </h3>
            <p className='text-xs text-slate-500 mt-1 line-clamp-1' title={author}>{author}</p>
            
            {/* Metadata Row */}
            <div className='flex flex-wrap items-center gap-2 mt-2 text-[10px] text-slate-600 font-mono'>
               {salesCount !== undefined && salesCount > 0 && (
                  <span className="flex items-center gap-1 bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20" title="Estimated Popularity Index (Based on Ratings)">
                    <Users className="w-2.5 h-2.5" />
                    {salesCount.toLocaleString()}
                  </span>
                )}
               <span className="bg-slate-800 px-1.5 py-0.5 rounded">{year !== "Unknown" ? year : "N/A"}</span>
            </div>
          </div>
        </div>
      </div>
      
      {review && !review.startsWith("A valuable addition") && (
        <div className="mb-4">
          <p className="text-xs text-slate-400 italic line-clamp-3 bg-slate-950/30 p-2 rounded border border-slate-800/50">
            "{review}"
          </p>
        </div>
      )}

      <div className='mt-auto pt-4 border-t border-slate-800/50 flex justify-between items-center gap-2'>
        {downloadLink ? (
          <a 
            href={downloadLink} 
            download
            className='flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 text-xs font-bold rounded-lg transition-all duration-300 border border-cyan-500/20 hover:border-transparent'
          >
            <Download className='w-3 h-3' />
            Download
          </a>
        ) : (
          <div className='flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-800/50 text-slate-500 text-xs font-bold rounded-lg cursor-not-allowed border border-slate-800'>
            <FileText className='w-3 h-3' />
            Info Only
          </div>
        )}
        <a 
          href={link} 
          target='_blank' 
          rel='noopener noreferrer'
          className='p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-yellow-500 transition-colors'
          title="Buy on Amazon"
        >
          <ExternalLink className='w-3 h-3' />
        </a>
      </div>
    </div>
  );
});

BookCard.displayName = 'BookCard';

export default BookCard;