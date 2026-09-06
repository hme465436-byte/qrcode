'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SpaceBackground } from '@/components/mykittool/space-background';

export function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/all-tools?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <section className="relative w-full min-h-[75vh] flex flex-col items-center justify-center bg-[#02040a] text-white overflow-hidden pt-20 pb-12">
      {/* Premium Atmospheric Depth & Particles */}
      <div className="absolute inset-0 z-0">
        <SpaceBackground />
        {/* Animated Luxury Glow */}
        <div className="absolute top-1/2 left-1/2 w-[1200px] h-[800px] bg-primary/10 rounded-full blur-[180px] transform -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-50 animate-fade-pulse" />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col items-center text-center space-y-12">
        {/* Subtle Brand Identifier */}
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-3xl animate-reveal shadow-2xl">
           <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
           <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/70">120+ free tools</span>
        </div>
        
        {/* Refined Luxury Title */}
        <div className="space-y-6 animate-reveal stagger-1">
          <h1 className="text-4xl md:text-6xl font-headline font-black tracking-tighter leading-[1.1] text-white max-w-3xl mx-auto">
            Free tools for work.
          </h1>
          <p className="max-w-xl mx-auto text-[10px] text-white/40 font-bold uppercase tracking-[0.3em] leading-relaxed">
            100% Safe • Local Processing • Zero Data Logging
          </p>
        </div>

        {/* Integrated Discovery Node (Search) */}
        <div className="w-full max-w-xl animate-reveal stagger-2 px-4">
          <form onSubmit={handleSearch} className="relative group/search">
            {/* Persistent Luxury Glow */}
            <div className="absolute -inset-1.5 bg-primary/15 rounded-3xl blur-2xl opacity-40 animate-pulse pointer-events-none" />
            
            {/* Search Field Container */}
            <div className="relative flex items-center bg-black/40 backdrop-blur-3xl border border-white/10 rounded-2xl h-16 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] transition-all group-focus-within/search:border-primary/40 group-focus-within/search:bg-black/60">
               <Search className="absolute left-6 w-5 h-5 text-white/10 group-focus-within/search:text-primary transition-colors" />
               <Input 
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search all tools..." 
                className="w-full h-full bg-transparent border-none pl-16 pr-32 text-sm font-medium focus-visible:ring-0 placeholder:text-white/20"
               />
               <div className="absolute right-2.5">
                  <Button type="submit" className="h-11 px-8 rounded-xl bg-white text-black hover:bg-white/90 text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95">
                     Search
                  </Button>
               </div>
            </div>
          </form>
        </div>

        {/* Global Nav CTA */}
        <div className="flex items-center justify-center gap-12 pt-6 animate-reveal stagger-3">
          <button 
            onClick={() => router.push('/all-tools')}
            className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/60 hover:text-primary transition-all"
          >
            See all tools <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          
          <div className="hidden sm:flex items-center gap-8 text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">
             <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Private</span>
             </div>
             <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4" />
                <span>Instant</span>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
