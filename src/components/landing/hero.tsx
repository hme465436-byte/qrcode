'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="relative w-full h-[90vh] min-h-[600px] flex items-center justify-center bg-[#020617] text-white overflow-hidden">
      {/* Premium Atmospheric Depth */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 w-[1000px] h-[1000px] bg-primary/10 rounded-full blur-[120px] transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.03)_1px,transparent_0)] bg-[size:40px_40px] pointer-events-none" />
      </div>

      <div className="relative z-10 text-center max-w-5xl mx-auto px-6 space-y-10">
        <div className="inline-block animate-reveal">
            <div className="px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.3em] text-primary bg-primary/5 border border-primary/20 rounded-full backdrop-blur-md shadow-2xl">
                120+ Pro Utility Units Active
            </div>
        </div>
        
        <h1 className="text-5xl md:text-8xl font-headline font-black tracking-tighter leading-[0.95] text-foreground animate-reveal stagger-1">
          Free AI, PDF <br />
          <span className="text-primary italic">and Image tools</span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-sm md:text-lg text-foreground/40 font-medium leading-relaxed uppercase tracking-widest animate-reveal stagger-2">
          High-performance digital production units. 100% browser-side synthesis with absolute privacy and zero-latency hardware access.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4 animate-reveal stagger-3">
          <Button asChild size="lg" className="h-16 px-10 text-xs font-black uppercase tracking-[0.2em] rounded-2xl bg-primary text-white shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all duration-500">
            <Link href="/all-tools">
              Explore all tools 
              <ArrowRight className="w-4 h-4 ml-3" />
            </Link>
          </Button>
          
          <div className="flex items-center gap-6 px-8 h-16 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-xl">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Secure Node</span>
             </div>
             <div className="w-[1px] h-4 bg-white/10" />
             <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-primary/40" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Local Only</span>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
