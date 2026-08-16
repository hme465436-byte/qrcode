'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * High-Fidelity Galactic Hero Background.
 * Features a deliberate, high-contrast cosmic field with slow-moving bodies
 * and hyper-visible shooting stars with blue trails.
 */
export function SpaceBackground() {
  const [mounted, setMounted] = useState(false);
  const [stars, setStars] = useState<{ id: number; top: string; left: string; size: number; delay: string; duration: string }[]>([]);
  const [planets, setPlanets] = useState<{ id: number; top: string; left: string; size: number; delay: string; type: number }[]>([]);
  const [ships, setShips] = useState<{ id: number; top: string; left: string; size: number; delay: string; duration: string }[]>([]);

  useEffect(() => {
    // Generate lower-density but clearer cosmic matrix
    const generatedStars = Array.from({ length: 90 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1.2, // Slightly larger stars
      delay: `${Math.random() * 10}s`,
      duration: `${5 + Math.random() * 5}s`,
    }));

    const generatedPlanets = Array.from({ length: 4 }).map((_, i) => ({
      id: i,
      top: `${10 + Math.random() * 80}%`,
      left: `${5 + Math.random() * 90}%`,
      size: 35 + Math.random() * 25, // Larger planets
      delay: `${Math.random() * 5}s`,
      type: Math.floor(Math.random() * 3), // 0: Ringed, 1: Spotted, 2: Smooth
    }));

    const generatedShips = Array.from({ length: 2 }).map((_, i) => ({
      id: i,
      top: `${10 + Math.random() * 60}%`,
      left: `${Math.random() * 100}%`,
      size: 25 + Math.random() * 10, // Larger ships
      delay: `${Math.random() * 15}s`,
      duration: `${50 + Math.random() * 20}s`, // Even slower drift
    }));

    setStars(generatedStars);
    setPlanets(generatedPlanets);
    setShips(generatedShips);
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true" />;
  }

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
      {/* Dynamic Atmospheric Depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.08)_0%,transparent_80%)]" />
      
      {/* Primary Galactic Glows */}
      <div className="absolute top-[-30%] left-[-20%] w-[100%] h-[100%] bg-primary/10 blur-[200px] rounded-full opacity-40" />
      <div className="absolute bottom-[-30%] right-[-20%] w-[100%] h-[100%] bg-primary/10 blur-[200px] rounded-full opacity-30" />

      {/* High-Contrast Twinkling Matrix */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-primary/40 dark:bg-white/80 animate-star-twinkle motion-reduce:animate-none"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: star.delay,
            animationDuration: '6s', // Slower pulse
            boxShadow: star.size > 1.8 ? `0 0 ${star.size * 3}px rgba(59, 130, 246, 0.5)` : 'none'
          }}
        />
      ))}

      {/* Drifting Celestial Units - Higher Contrast */}
      {planets.map((planet) => (
        <div
          key={planet.id}
          className="absolute opacity-10 dark:opacity-30 animate-float motion-reduce:animate-none"
          style={{
            top: planet.top,
            left: planet.left,
            width: `${planet.size}px`,
            height: `${planet.size}px`,
            animationDelay: planet.delay,
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full fill-primary/60 stroke-primary/30">
             {planet.type === 0 ? (
               <g>
                 <circle cx="50" cy="50" r="30" />
                 <ellipse cx="50" cy="50" rx="48" ry="8" fill="none" stroke="currentColor" strokeWidth="4" transform="rotate(-25 50 50)" />
               </g>
             ) : planet.type === 1 ? (
               <g>
                 <circle cx="50" cy="50" r="35" />
                 <circle cx="38" cy="35" r="5" fill="white" opacity="0.6" />
                 <circle cx="65" cy="60" r="3" fill="white" opacity="0.6" />
               </g>
             ) : (
               <circle cx="50" cy="50" r="33" />
             )}
          </svg>
        </div>
      ))}

      {/* Deep Space Research Vessels - Clearer Silhouette */}
      {ships.map((ship) => (
        <div
          key={ship.id}
          className="absolute opacity-10 dark:opacity-20 animate-ship-drift motion-reduce:animate-none"
          style={{
            top: ship.top,
            left: ship.left,
            width: `${ship.size}px`,
            height: `${ship.size * 0.6}px`,
            animationDelay: ship.delay,
            animationDuration: ship.duration,
          }}
        >
          <svg viewBox="0 0 100 60" className="w-full h-full fill-primary/70">
             <path d="M 15 30 Q 50 5 85 30 Q 50 55 15 30 Z" />
             <circle cx="50" cy="28" r="6" fill="white" opacity="0.4" />
             <rect x="75" y="27" width="10" height="5" rx="2" fill="white" opacity="0.8" />
          </svg>
        </div>
      ))}

      {/* Slow Hyper-Glow Shooting Stars Protocol V2 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[0, 9, 4, 13, 2].map((delay, i) => (
          <div 
            key={i}
            className="shooting-star-protocol-v2 motion-reduce:hidden" 
            style={{ 
              top: `${5 + Math.random() * 40}%`, 
              right: `${-15 + Math.random() * 20}%`, 
              animationDelay: `${delay}s` 
            }} 
          />
        ))}
      </div>
    </div>
  );
}

