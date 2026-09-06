'use client';

import Link from 'next/link';
import { ArrowRight, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="relative w-full h-screen min-h-[700px] flex items-center justify-center bg-gradient-to-b from-[#030712] to-[#0F172A] text-white overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-blue-500/30 to-purple-500/30 rounded-full animate-pulse blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-cyan-400/20 to-indigo-500/20 rounded-full animate-pulse-slow blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-tl from-rose-400/20 to-orange-500/20 rounded-full animate-pulse-slower blur-3xl"></div>
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <div className="inline-block mb-6">
            <div className="px-4 py-2 text-sm font-semibold text-cyan-300 bg-cyan-900/50 border border-cyan-400/30 rounded-full backdrop-blur-sm">
                120+ Free Tools Now Available
            </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 leading-tight">
          The Ultimate Free
          <br />
          Online Tool Studio
        </h1>
        
        <p className="mt-6 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
          Access 120+ professional-grade tools for AI, PDF, Image, Video & more. 100% browser-based, zero registration, complete privacy.
        </p>
        
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="h-14 px-8 text-lg font-bold rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 hover:scale-105 transition-transform duration-300">
            <Link href="/all-tools">Explore All Tools <ArrowRight className="w-5 h-5 ml-2" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg font-bold rounded-full border-2 border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:border-white/30 transition-all duration-300">
            <Link href="#">
              <PlayCircle className="w-5 h-5 mr-2" />
              View Demo
            </Link>
          </Button>
        </div>
        
        <div className="mt-10 flex items-center justify-center gap-x-8 text-sm text-gray-500 font-medium">
            <span className="flex items-center gap-2">✓ 100% Free</span>
            <span className="flex items-center gap-2">✓ No Login Required</span>
            <span className="flex items-center gap-2">✓ Secure & Private</span>
        </div>
      </div>
    </section>
  );
}
