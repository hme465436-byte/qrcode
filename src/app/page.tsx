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
      <HowItWorks />
    </div>
  );
}
