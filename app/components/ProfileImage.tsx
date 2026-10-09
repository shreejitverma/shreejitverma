'use client';

import Image from 'next/image';
import { useState } from 'react';

interface ProfileImageProps {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}

// Local fallbacks only: if the photo fails, try the full-size original, then
// show the "SV" monogram rather than a broken image or a third-party
// placeholder.
const FALLBACK_SRC = '/Shreejit_Verma_profile_pic.jpg';

export default function ProfileImage({ src, alt, sizes, className, priority = false }: ProfileImageProps) {
  const [current, setCurrent] = useState(src);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        role='img'
        aria-label={alt}
        className='absolute inset-0 flex items-center justify-center bg-card font-mono text-5xl font-bold text-primary'
      >
        SV
      </span>
    );
  }

  return (
    <Image
      src={current}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => {
        if (current !== FALLBACK_SRC) setCurrent(FALLBACK_SRC);
        else setFailed(true);
      }}
    />
  );
}
