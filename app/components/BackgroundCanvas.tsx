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
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [tweenLoaded, setTweenLoaded] = useState(false);
  const [easeLoaded, setEaseLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use resolvedTheme to handle 'system' preference correctly
  const currentTheme = resolvedTheme || theme;

  useEffect(() => {
    if (mounted && window.initCanvas) {
      window.initCanvas();
    }
  }, [mounted, currentTheme]);

  if (!mounted) return null;

  return (
    <>
      {/* demo.js reads the TweenLite and Sine globals, so the scripts must
          load strictly in dependency order. */}
      <Script
        src="/js/TweenLite.min.js"
        strategy="lazyOnload"
        onLoad={() => setTweenLoaded(true)}
      />
      {tweenLoaded && (
        <Script
          src="/js/EasePack.min.js"
          strategy="lazyOnload"
          onLoad={() => setEaseLoaded(true)}
        />
      )}
      {easeLoaded && (
        <Script
          src="/js/demo.js"
          strategy="lazyOnload"
          onLoad={() => {
            if (window.initCanvas) {
              window.initCanvas();
            }
          }}
        />
      )}
      <div 
        id="large-header" 
        className={`fixed inset-0 z-0 pointer-events-none transition-colors duration-1000 ${
          currentTheme === 'dark' ? 'bg-[#000000]' : 'bg-[#fafafa]'
        }`}
      >
         <canvas id="demo-canvas" className="w-full h-full opacity-60"></canvas>
      </div>
    </>
  );
}
