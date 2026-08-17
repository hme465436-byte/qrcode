'use client';

import React from 'react';

/**
 * Static Background Matrix.
 * Star and animation engines removed for performance optimization.
 */
export function SpaceBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none select-none" aria-hidden="true">
      {/* Primary Atmospheric Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.12)_0%,transparent_85%)]" />
      
      {/* High-Contrast Depth Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] bg-primary/10 blur-[180px] rounded-full opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[100%] h-[100%] bg-primary/15 blur-[220px] rounded-full opacity-40" />
    </div>
  );
}