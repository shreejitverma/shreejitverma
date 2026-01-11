'use client';

import Script from 'next/script';
import { useEffect } from 'react';

export default function BackgroundCanvas() {
  useEffect(() => {
    // Initialize canvas if script is already loaded (for navigation between pages)
    if (typeof window !== 'undefined' && (window as any).initCanvas) {
      (window as any).initCanvas();
    }
  }, []);

  return (
    <>
      <Script src="/js/TweenLite.min.js" strategy="beforeInteractive" />
      <Script src="/js/EasePack.min.js" strategy="beforeInteractive" />
      <Script 
        src="/js/demo.js" 
        strategy="afterInteractive" 
        onLoad={() => {
          if (typeof window !== 'undefined' && (window as any).initCanvas) {
            (window as any).initCanvas();
          }
        }}
      />
      <div id="large-header" className="fixed inset-0 z-0 pointer-events-none">
         <canvas id="demo-canvas" className="w-full h-full"></canvas>
      </div>
    </>
  );
}
