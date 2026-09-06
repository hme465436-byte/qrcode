'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight, AppWindow } from 'lucide-react';
import { SpaceBackground } from '@/components/mykittool/space-background';

export function Hero() {
  return (
    <section className="relative w-full h-auto md:h-[90vh] min-h-[700px] flex items-center justify-center overflow-hidden bg-[#0F172A]">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent" />
        <div 
          className="absolute inset-0 z-[-1] bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20 animate-gradient-xy"
          style={{
            animation: 'gradient-xy 15s ease infinite',
          }}
        />
        <SpaceBackground />
      </div>
      
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto">
        <h1 
          className="text-4xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-300 leading-tight md:leading-snug"
          style={{ fontFamily: 'Poppins, Inter, sans-serif' }}
        >
          100% Free Online Advanced Tool Studio
        </h1>
        <p className="mt-4 text-base md:text-xl text-gray-400 max-w-2xl">
          120+ Professional Tools for AI, PDF, Image & More - 100% Browser-Based, No Login Required
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <Button asChild size="lg" className="h-12 px-8 rounded-full bg-blue-600 text-white font-bold text-base shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all duration-300 transform hover:scale-105">
            <Link href="/all-tools">
              Explore All Tools <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 px-8 rounded-full bg-white/10 text-white border-white/20 hover:bg-white/20 transition-all duration-300">
            <Link href="#categories">
              <AppWindow className="w-5 h-5 mr-2" /> Browse by Category
            </Link>
          </Button>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            100% Free
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            No Registration
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Secure & Private
          </div>
        </div>
      </div>
    </section>
  );
}
