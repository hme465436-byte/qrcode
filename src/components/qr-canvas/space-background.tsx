'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Recalibrated Galactic Hero Background for High Visibility.
 * Optimized for display on light cream backgrounds using higher contrast primary blue tokens.
 * Features extra-slow cinematic drift for professional atmosphere.
 */
export function SpaceBackground() {
  const [mounted, setMounted] = useState(false);
  const [stars, setStars] = useState<{ id: number; top: string; left: string; size: number; delay: string; duration: string }[]>([]);
  const [planets, setPlanets] = useState<{ id: number; top: string; left: string; size: number; delay: string; type: number }[]>([]);
  const [ships, setShips] = useState<{ id: number; top: string; left: string; size: number; delay: string; duration: string }[]>([]);

  useEffect(() => {
    // High-Density Twinkle Matrix (Visible on Cream)
    const generatedStars = Array.from({ length: 120 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1.5, 
      delay: `${Math.random() * 12}s`,
      duration: `${10 + Math.random() * 8}s`,
    }));

    // Clinical Planetary Units
    const generatedPlanets = Array.from({ length: 4 }).map((_, i) => ({
      id: i,
      top: `${10 + Math.random() * 80}%`,
      left: `${5 + Math.random() * 90}%`,
      size: 45 + Math.random() * 30, 
      delay: `${Math.random() * 5}s`,
      type: Math.floor(Math.random() * 3), 
    }));

    // High-Contrast Research Vessels
    const generatedShips = Array.from({ length: 2 }).map((_, i) => ({
      id: i,
      top: `${15 + Math.random() * 70}%`,
      left: `${Math.random() * 100}%`,
      size: 30 + Math.random() * 15, 
      delay: `${Math.random() * 20}s`,
      duration: `${110 + Math.random() * 40}s`,
    }));

    setStars(generatedStars);
    setPlanets(generatedPlanets);
    setShips(generatedShips);
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true" />;
  }

  return (
    <div className="absolute inset-0 z-0 pointer-events-none select-none" aria-hidden="true">
      {/* Primary Galactic Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.12)_0%,transparent_85%)]" />
      
      {/* High-Contrast Galactic Depth Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] bg-primary/10 blur-[180px] rounded-full opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[100%] h-[100%] bg-primary/15 blur-[220px] rounded-full opacity-40" />

      {/* Calibrated Twinkle Matrix - Darker Blue for Visibility */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-primary/60 dark:bg-white/90 animate-star-twinkle motion-reduce:animate-none"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: star.delay,
            animationDuration: '12s', 
            boxShadow: star.size > 2 ? `0 0 ${star.size * 2}px rgba(59, 130, 246, 0.6)` : 'none'
          }}
        />
      ))}

      {/* High-Visibility Planetary Drift - 75s Float */}
      {planets.map((planet) => (
        <div
          key={planet.id}
          className="absolute opacity-20 dark:opacity-40 animate-float motion-reduce:animate-none"
          style={{
            top: planet.top,
            left: planet.left,
            width: `${planet.size}px`,
            height: `${planet.size}px`,
            animationDelay: planet.delay,
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full fill-primary/40 stroke-primary/30">
             {planet.type === 0 ? (
               <g>
                 <circle cx="50" cy="50" r="30" />
                 <ellipse cx="50" cy="50" rx="48" ry="8" fill="none" stroke="currentColor" strokeWidth="4" transform="rotate(-25 50 50)" />
               </g>
             ) : planet.type === 1 ? (
               <g>
                 <circle cx="50" cy="50" r="35" />
                 <circle cx="38" cy="35" r="5" fill="white" opacity="0.4" />
                 <circle cx="65" cy="60" r="3" fill="white" opacity="0.4" />
               </g>
             ) : (
               <circle cx="50" cy="50" r="33" />
             )}
          </svg>
        </div>
      ))}

      {/* Heavy Research Vessels - 110s Drift */}
      {ships.map((ship) => (
        <div
          key={ship.id}
          className="absolute opacity-20 dark:opacity-30 animate-ship-drift motion-reduce:animate-none"
          style={{
            top: ship.top,
            left: ship.left,
            width: `${ship.size}px`,
            height: `${ship.size * 0.6}px`,
            animationDelay: ship.delay,
            animationDuration: ship.duration,
          }}
        >
          <svg viewBox="0 0 100 60" className="w-full h-full fill-primary/50">
             <path d="M 15 30 Q 50 5 85 30 Q 50 55 15 30 Z" />
             <circle cx="50" cy="28" r="6" fill="white" opacity="0.3" />
             <rect x="75" y="27" width="10" height="5" rx="2" fill="white" opacity="0.5" />
          </svg>
        </div>
      ))}

      {/* 28s Loop - Hyper-Glow Slow Shooting Stars Protocol */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[0, 14, 7, 21, 3].map((delay, i) => (
          <div 
            key={i}
            className="shooting-star-protocol-v2 motion-reduce:hidden" 
            style={{ 
              top: `${5 + Math.random() * 45}%`, 
              right: `${-15 + Math.random() * 20}%`, 
              animationDelay: `${delay}s` 
            }} 
          />
        ))}
      </div>
    </div>
  );
}
