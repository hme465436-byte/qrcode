'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SpaceBackground } from '@/components/mykittool/space-background';
import { cn } from '@/lib/utils';

export function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  
  // --- Usage Logic ---
  const [usageCount, setUsageCount] = useState(0);

  useEffect(() => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const raw = localStorage.getItem('mykit_local_usage_log');
      if (raw) {
        const data = JSON.parse(raw);
        if (data.date === todayStr) {
          setUsageCount(data.paths.length);
        }
      }
    } catch (e) {}
  }, []);

  // --- Linguistic Typewriter Matrix ---
  const [placeholderText, setPlaceholderText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  const words = useMemo(() => [
    'AI Chatbot', 
    'Resume Builder', 
    'PDF Merger', 
    'Image Generator', 
    'Logo Maker', 
    'Photo to Text', 
    'Background Remove', 
    'Password Generator',
    'Units Converter',
    'Speed Test',
    'Email Writer',
    'QR Studio'
  ], []);

  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % words.length;
      const fullText = words[i];

      setPlaceholderText(
        isDeleting
          ? fullText.substring(0, placeholderText.length - 1)
          : fullText.substring(0, placeholderText.length + 1)
      );

      setTypingSpeed(isDeleting ? 50 : 150);

      if (!isDeleting && placeholderText === fullText) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && placeholderText === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [placeholderText, isDeleting, loopNum, typingSpeed, words]);

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
        {/* Animated Luxury Glow - Reduced complexity for LCP */}
        <div className="absolute top-1/2 left-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-[150px] transform -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col items-center text-center space-y-12">
        <div className="flex flex-wrap items-center justify-center gap-3 animate-reveal">
           {/* Primary Brand Badge */}
           <div className="inline-flex h-6 items-center gap-1.5 px-3 rounded-full bg-primary/10 border border-primary/30 backdrop-blur-3xl shadow-[0_0_15px_rgba(59,130,246,0.15)] cursor-default whitespace-nowrap">
              <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
              <span className="text-[8px] font-black uppercase tracking-widest text-primary">120+ free tools</span>
           </div>

           {/* Secondary Identity Badges */}
           <div className="inline-flex h-6 items-center px-3 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-3xl shadow-[0_0_15px_rgba(255,255,255,0.05)] cursor-default whitespace-nowrap">
              <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Free online tools</span>
           </div>
           
           <div className="inline-flex h-6 items-center px-3 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-3xl shadow-[0_0_15px_rgba(255,255,255,0.05)] cursor-default whitespace-nowrap">
              <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Free AI tools</span>
           </div>
        </div>
        
        {/* Refined Luxury Title */}
        <div className="space-y-6 animate-reveal stagger-2">
          <h1 className="text-4xl md:text-6xl font-headline font-black tracking-tighter leading-[1.1] text-white max-w-3xl mx-auto">
            FREE online <span className="text-primary italic">advanced tool studio</span>
          </h1>
          <p className="max-w-xl mx-auto text-[10px] text-white/40 font-bold uppercase tracking-[0.3em] leading-relaxed">
            Master your digital workflow with 120+ private, instant, and high-fidelity utilities.
          </p>
        </div>

        {/* Integrated Discovery Node (Search) */}
        <div className="w-full max-w-lg animate-reveal stagger-3 px-4 relative">
          <div className="absolute -inset-6 bg-primary/10 blur-[40px] rounded-full pointer-events-none opacity-40" />
          
          <form onSubmit={handleSearch} className="relative group/search">
            <div className="relative flex items-center bg-black/60 backdrop-blur-3xl border border-primary/30 rounded-full h-14 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)] transition-all group-focus-within/search:border-primary">
               <Search className="absolute left-6 w-3.5 h-3.5 text-primary/40 group-focus-within/search:text-primary transition-colors" />
               <Input 
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={`Search ${placeholderText}...`} 
                className="w-full h-full bg-transparent border-none pl-14 pr-16 text-sm font-bold placeholder:text-white/20 focus-visible:ring-0"
                aria-label="Search all tools"
               />
               <div className="absolute right-1.5">
                  <Button type="submit" size="icon" className="h-11 w-11 rounded-full bg-white text-black hover:bg-white/90 shadow-xl transition-all active:scale-95 border-none" aria-label="Execute Search">
                     <Search className="w-3.5 h-3.5" />
                  </Button>
               </div>
            </div>
          </form>

          {/* Honest Trust Line */}
          <div className="mt-4 flex flex-col items-center gap-1.5 animate-reveal stagger-4">
             <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                Free tools for resume, PDF and images.
             </p>
             {usageCount > 0 && (
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60">
                   You used {usageCount} {usageCount === 1 ? 'tool' : 'tools'} today on this device only.
                </p>
             )}
          </div>
        </div>

        {/* Global Nav CTA */}
        <div className="flex items-center justify-center gap-12 pt-2 animate-reveal stagger-4">
          <button 
            onClick={() => router.push('/all-tools')}
            className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/60 hover:text-primary transition-all"
            aria-label="View all tools"
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
