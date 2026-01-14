'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface ProfileImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ProfileImage({ src, alt, className }: ProfileImageProps) {
  const [hasError, setHasError] = useState(false);
  
  // Fallback image using the configured placeholder service
  const fallbackSrc = 'https://placehold.co/400x400/1e293b/22d3ee?text=SV';

  return (
    <Image
      key={src}
      src={hasError ? fallbackSrc : src}
      alt={alt}
      fill
      className={className}
      onError={() => {
        if (!hasError) {
          setHasError(true);
        }
      }}
      loading="lazy"
      sizes="(max-width: 768px) 192px, 256px"
      style={{ objectFit: 'cover' }}
    />
  );
}
