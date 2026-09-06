'use client';

import React from 'react';
import { Hero } from '@/components/landing/hero';
import { PopularTools } from '@/components/landing/popular-tools';
import { HowItWorks } from '@/components/landing/how-it-works';

export default function Home() {
  return (
    <div className="flex flex-col items-center w-full max-w-full overflow-x-hidden font-sans bg-[#02040a]">
      <Hero />
      <PopularTools />
      
      {/* Search Intent & Discovery Node */}
      <section className="w-full py-12 border-t border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[10px] md:text-xs text-foreground/40 font-bold uppercase tracking-[0.4em] leading-relaxed">
            My Kit Tool is a free website for AI, PDF and image tools.
          </p>
        </div>
      </section>

      <HowItWorks />
    </div>
  );
}
