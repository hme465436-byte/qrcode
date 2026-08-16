'use client';

import React, { useEffect, useState } from 'react';

/**
 * A subtle, performance-friendly space background.
 * Features a starfield with gentle twinkling and occasional shooting stars.
 */
export function SpaceBackground() {
  const [stars, setStars] = useState<{ id: number; top: string; left: string; size: number; delay: string }[]>([]);

  useEffect(() => {
    // Generate stars only on the client to prevent hydration mismatch
    const generatedStars = Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 1.5 + 0.5,
      delay: `${Math.random() * 5}s`,
    }));
    setStars(generatedStars);
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[#030305] select-none" aria-hidden="true">
      {/* Deep Space Depth Layer */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.03)_0%,transparent_70%)]" />
      
      {/* Primary Atmosphere Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[150px] rounded-full opacity-40" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[150px] rounded-full opacity-30" />

      {/* Twinkling Starfield Matrix */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white/40 animate-fade-pulse"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: star.delay,
            animationDuration: '4s'
          }}
        />
      ))}

      {/* Occasional Shooting Star Protocol */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="shooting-star-protocol" style={{ top: '5%', right: '5%', animationDelay: '0s' }} />
        <div className="shooting-star-protocol" style={{ top: '15%', right: '20%', animationDelay: '7s' }} />
        <div className="shooting-star-protocol" style={{ top: '40%', right: '10%', animationDelay: '14s' }} />
      </div>
    </div>
  );
}
