'use client';

import { memo } from 'react';
import Image from 'next/image';
import { Download, ExternalLink, FileText, TrendingUp, Users } from 'lucide-react';

interface BookCardProps {
  title: string;
  author: string;
  category: string;
  year: string;
  format?: string;
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

const BookCard = memo(({ title, author, category, year, review, downloadLink, link, coverImage, importance, salesCount }: BookCardProps) => {
  return (
    <div className='group relative bg-card/30 dark:bg-card border border-border/50 rounded-2xl p-5 hover:border-cyan-500/40 transition-all duration-300 flex flex-col hover:shadow-xl hover:shadow-cyan-500/5 backdrop-blur-sm'>
      <div className='flex gap-4 mb-4'>
        <div className='relative w-20 h-28 shrink-0 rounded-lg overflow-hidden shadow-lg border border-border/50 bg-muted dark:bg-muted'>
          <Image 
            src={coverImage || PLACEHOLDER_COVER} 
            alt={title} 
            fill 
            className='object-cover opacity-80 group-hover:opacity-100 transition-opacity'
            sizes="(max-width: 768px) 80px, 100px"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-muted dark:from-card to-transparent opacity-60"></div>
        </div>
        <div className='flex flex-col justify-between min-w-0 flex-1'>
          <div>
            <div className='flex justify-between items-start gap-2'>
              <div className='text-[10px] uppercase tracking-widest font-bold text-primary mb-1 truncate flex-1'>
                {category.split('&')[0]}
              </div>
              
              <div className="flex gap-1">
                {importance !== undefined && (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded-full border border-emerald-400/20" title="Importance Score">
                    <TrendingUp className="w-3 h-3" />
                    {importance}
                  </div>
                )}
              </div>
            </div>
            
            <h3 className='font-bold text-foreground leading-snug text-sm group-hover:text-cyan-600 dark:group-hover:text-primary transition-colors duration-300 line-clamp-2' title={title}>
              {title}
            </h3>
            <p className='text-xs text-muted-foreground mt-1 line-clamp-1' title={author}>{author}</p>
            
            {/* Metadata Row */}
            <div className='flex flex-wrap items-center gap-2 mt-2 text-[10px] text-muted-foreground dark:text-slate-600 font-mono'>
               {salesCount !== undefined && salesCount > 0 && (
                  <span className="flex items-center gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20" title="Estimated Popularity Index (Based on Ratings)">
                    <Users className="w-2.5 h-2.5" />
                    {salesCount.toLocaleString()}
                  </span>
                )}
               <span className="bg-muted px-1.5 py-0.5 rounded">{year !== "Unknown" ? year : "N/A"}</span>
            </div>
          </div>
        </div>
      </div>
      
      {review && !review.startsWith("A valuable addition") && (
        <div className="mb-4">
          <p className="text-xs text-muted-foreground italic line-clamp-3 bg-background/30 p-2 rounded border border-border/50">
            &quot;{review}&quot;
          </p>
        </div>
      )}

      <div className='mt-auto pt-4 border-t border-border/50 flex justify-between items-center gap-2'>
        {downloadLink ? (
          <a 
            href={downloadLink} 
            download
            className='flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary hover:text-slate-950 dark:hover:text-slate-950 text-primary text-xs font-bold rounded-lg transition-all duration-300 border border-cyan-500/20 hover:border-transparent'
          >
            <Download className='w-3 h-3' />
            Download
          </a>
        ) : (
          <div className='flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-muted dark:bg-muted/50 text-muted-foreground/60 text-xs font-bold rounded-lg cursor-not-allowed border border-border'>
            <FileText className='w-3 h-3' />
            Info Only
          </div>
        )}
        <a 
          href={link} 
          target='_blank' 
          rel='noopener noreferrer'
          className='p-2 rounded-lg bg-muted dark:bg-muted hover:bg-slate-200 dark:hover:bg-slate-700 text-muted-foreground dark:text-muted-foreground hover:text-yellow-600 dark:hover:text-yellow-500 transition-colors'
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