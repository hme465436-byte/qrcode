'use client';

import React, { useEffect, useState } from 'react';

/**
 * A subtle, performance-friendly space background.
 * Features a starfield with gentle twinkling and occasional shooting stars.
 * Updated to use absolute positioning for containment within specific sections.
 */
export function SpaceBackground() {
  const [mounted, setMounted] = useState(false);
  const [stars, setStars] = useState<{ id: number; top: string; left: string; size: number; delay: string; duration: string }[]>([]);

  useEffect(() => {
    // Generate stars only on the client to prevent hydration mismatch
    const generatedStars = Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 0.8,
      delay: `${Math.random() * 8}s`,
      duration: `${4 + Math.random() * 4}s`,
    }));
    setStars(generatedStars);
    setMounted(true);
  }, []);

  // Use absolute positioning so it fills the nearest relative parent
  if (!mounted) {
    return <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true" />;
  }

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
      {/* Deep Space Depth Layer */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.05)_0%,transparent_80%)]" />
      
      {/* Primary Atmosphere Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary/10 blur-[180px] rounded-full opacity-40" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-primary/10 blur-[180px] rounded-full opacity-30" />

      {/* Twinkling Starfield Matrix */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white animate-star-twinkle"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: star.delay,
            animationDuration: star.duration,
            boxShadow: star.size > 1.5 ? `0 0 ${star.size * 3}px ${star.size}px rgba(255, 255, 255, 0.3)` : 'none'
          }}
        />
      ))}

      {/* Occasional Shooting Star Protocol - High Visibility Matrix */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="shooting-star-protocol" style={{ top: '2%', right: '-5%', animationDelay: '0s' }} />
        <div className="shooting-star-protocol" style={{ top: '15%', right: '15%', animationDelay: '4s' }} />
        <div className="shooting-star-protocol" style={{ top: '35%', right: '-10%', animationDelay: '8s' }} />
        <div className="shooting-star-protocol" style={{ top: '55%', right: '5%', animationDelay: '12s' }} />
        <div className="shooting-star-protocol" style={{ top: '10%', right: '25%', animationDelay: '16s' }} />
        <div className="shooting-star-protocol" style={{ top: '45%', right: '35%', animationDelay: '2s' }} />
      </div>
    </div>
  );
}