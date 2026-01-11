import { ReactNode } from 'react';

interface SectionProps {
  id: string;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function Section({ id, title, icon, children, className = '' }: SectionProps) {
  return (
    <section id={id} className={`py-20 px-6 max-w-7xl mx-auto ${className}`}>
      <div className='flex items-center gap-3 mb-12'>
        {icon && <div className='text-cyan-400'>{icon}</div>}
        <h2 className='text-3xl font-bold text-slate-100'>{title}</h2>
      </div>
      {children}
    </section>
  );
}
