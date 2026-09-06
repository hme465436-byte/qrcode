'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, ShieldCheck, Zap, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

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
        <div className="absolute top-1/3 left-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[140px] transform -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col items-center text-center space-y-12">
        {/* Subtle Brand Identifier */}
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/[0.02] border border-white/5 backdrop-blur-md animate-reveal">
           <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
           <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30">My Kit Tool Studio</span>
        </div>
        
        {/* Minimal High-Impact Title */}
        <div className="space-y-4 animate-reveal stagger-1">
          <h1 className="text-5xl md:text-8xl font-headline font-black tracking-tighter leading-[0.9] text-white">
            Tools for work. <br />
            <span className="text-white/30 italic">Free.</span>
          </h1>
          <p className="max-w-xl mx-auto text-xs md:text-sm text-white/20 font-bold uppercase tracking-[0.3em] leading-relaxed">
            High-performance utility units for digital production.
          </p>
        </div>

        {/* Integrated Discovery Node (Search) */}
        <div className="w-full max-w-2xl animate-reveal stagger-2">
          <form onSubmit={handleSearch} className="relative group/search">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-transparent rounded-2xl blur opacity-0 group-focus-within/search:opacity-100 transition-opacity duration-700" />
            <div className="relative flex items-center bg-black/40 border border-white/10 rounded-2xl h-16 shadow-2xl transition-all group-focus-within/search:border-primary/40">
               <Search className="absolute left-6 w-5 h-5 text-white/10 group-focus-within/search:text-primary transition-colors" />
               <Input 
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search 120+ tools (e.g. AI, PDF, Image)..." 
                className="w-full h-full bg-transparent border-none pl-16 pr-32 text-sm font-medium focus-visible:ring-0 placeholder:text-white/10"
               />
               <div className="absolute right-3">
                  <Button type="submit" className="h-10 px-6 rounded-xl bg-white text-black hover:bg-white/90 text-[10px] font-black uppercase tracking-widest">
                     Explore
                  </Button>
               </div>
            </div>
          </form>
        </div>

        {/* Global Nav CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-4 animate-reveal stagger-3">
          <button 
            onClick={() => router.push('/all-tools')}
            className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-primary transition-all"
          >
            Browse Registry <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          
          <div className="hidden sm:flex items-center gap-6 text-[8px] font-bold text-white/10 uppercase tracking-widest">
             <div className="flex items-center gap-2">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified Local</span>
             </div>
             <div className="w-[1px] h-3 bg-white/10" />
             <div className="flex items-center gap-2">
                <Zap className="w-3 h-3" />
                <span>Zero Latency</span>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
