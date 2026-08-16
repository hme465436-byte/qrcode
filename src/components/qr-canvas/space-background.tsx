'use client';

import React, { useEffect, useState } from 'react';

/**
 * A subtle, performance-friendly space background.
 * Features a starfield with gentle twinkling and occasional shooting stars.
 * Improved for high-visibility and glowing effects.
 */
export function SpaceBackground() {
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
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[#030305] select-none" aria-hidden="true">
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

      {/* Occasional Shooting Star Protocol */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="shooting-star-protocol" style={{ top: '5%', right: '0%', animationDelay: '0s' }} />
        <div className="shooting-star-protocol" style={{ top: '15%', right: '10%', animationDelay: '7s' }} />
        <div className="shooting-star-protocol" style={{ top: '40%', right: '5%', animationDelay: '14s' }} />
        <div className="shooting-star-protocol" style={{ top: '70%', right: '20%', animationDelay: '21s' }} />
      </div>
    </div>
  );
}