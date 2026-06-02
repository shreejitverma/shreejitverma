'use client';

import React, { useEffect, useState } from 'react';
import Script from 'next/script';
import { useTheme } from 'next-themes';

declare global {
  interface Window {
    initCanvas?: () => void;
  }
}

export default function BackgroundCanvas() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Initialize canvas if script is already loaded (for navigation between pages)
    if (typeof window !== 'undefined' && window.initCanvas) {
      window.initCanvas();
    }
  }, []);

  if (!mounted || theme === 'light') return null;

  return (
    <>
      <Script src="/js/TweenLite.min.js" strategy="beforeInteractive" />
      <Script src="/js/EasePack.min.js" strategy="beforeInteractive" />
      <Script 
        src="/js/demo.js" 
        strategy="afterInteractive" 
        onLoad={() => {
          if (typeof window !== 'undefined' && window.initCanvas) {
            window.initCanvas();
          }
        }}
      />
      <div id="large-header" className="fixed inset-0 z-0 pointer-events-none">
         <canvas id="demo-canvas" className="w-full h-full"></canvas>
      </div>
    </>
  );
}
