import { ReactNode } from 'react';

interface SectionProps {
  id: string;
  title: string;
  icon?: ReactNode;
  // One-line framing under the heading.
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function Section({ id, title, icon, description, children, className = '' }: SectionProps) {
  return (
    <section id={id} className={`py-20 px-6 max-w-7xl mx-auto scroll-mt-16 ${className}`}>
      <div className={description ? 'mb-10' : 'mb-12'}>
        <div className='flex items-center gap-3'>
          {icon && <div className='text-primary'>{icon}</div>}
          <h2 className='text-3xl font-bold text-foreground'>{title}</h2>
        </div>
        {description && <p className='mt-3 max-w-3xl text-muted-foreground leading-relaxed'>{description}</p>}
      </div>
      {children}
    </section>
  );
}
