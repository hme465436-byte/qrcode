'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
    <section className="relative w-full min-h-[85vh] flex flex-col items-center justify-center bg-[#02040a] text-white overflow-hidden pt-20">
      {/* Premium Atmospheric Depth */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/3 left-1/2 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-[160px] transform -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col items-center text-center space-y-12">
        {/* Subtle Brand Identifier */}
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/[0.02] border border-white/5 backdrop-blur-3xl animate-reveal shadow-2xl">
           <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
           <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/40">120+ free tools</span>
        </div>
        
        {/* Refined Luxury Title */}
        <div className="space-y-6 animate-reveal stagger-1">
          <h1 className="text-4xl md:text-7xl font-headline font-black tracking-tighter leading-tight text-white">
            Free tools <br className="sm:hidden" /> for work.
          </h1>
          <p className="max-w-xl mx-auto text-[10px] md:text-[11px] text-white/20 font-bold uppercase tracking-[0.3em] leading-relaxed">
            Professional high-performance units for private data synthesis.
          </p>
        </div>

        {/* Integrated Discovery Node (Search) */}
        <div className="w-full max-w-2xl animate-reveal stagger-2 px-4">
          <form onSubmit={handleSearch} className="relative group/search">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-transparent rounded-3xl blur-xl opacity-0 group-focus-within/search:opacity-100 transition-opacity duration-1000" />
            <div className="relative flex items-center bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] h-20 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.8)] transition-all group-focus-within/search:border-primary/40 group-focus-within/search:scale-[1.01]">
               <Search className="absolute left-8 w-6 h-6 text-white/10 group-focus-within/search:text-primary transition-colors" />
               <Input 
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search tools..." 
                className="w-full h-full bg-transparent border-none pl-20 pr-40 text-base font-medium focus-visible:ring-0 placeholder:text-white/10"
               />
               <div className="absolute right-3">
                  <Button type="submit" className="h-14 px-8 rounded-2xl bg-white text-black hover:bg-white/90 text-[11px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95">
                     Search
                  </Button>
               </div>
            </div>
          </form>
        </div>

        {/* Global Nav CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-12 pt-4 animate-reveal stagger-3">
          <button 
            onClick={() => router.push('/all-tools')}
            className="group flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-white/30 hover:text-primary transition-all"
          >
            See all tools <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          
          <div className="hidden sm:flex items-center gap-8 text-[9px] font-black text-white/5 uppercase tracking-[0.3em]">
             <div className="flex items-center gap-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Private</span>
             </div>
             <div className="flex items-center gap-3">
                <Zap className="w-3.5 h-3.5" />
                <span>Instant</span>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
