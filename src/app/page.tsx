'use client';

import React from 'react';
import { Hero } from '@/components/landing/hero';
import { Features } from '@/components/landing/features';
import { Categories } from '@/components/landing/categories';
import { PopularTools } from '@/components/landing/popular-tools';
import { HowItWorks } from '@/components/landing/how-it-works';

export default function Home() {
  return (
    <div className="flex flex-col items-center w-full max-w-full overflow-x-hidden font-sans bg-[#0F172A]">
      <Hero />
      <Features />
      <Categories />
      {/* The PopularTools section is being temporarily removed as per the next step in the plan */}
      <HowItWorks />
    </div>
  );
}
