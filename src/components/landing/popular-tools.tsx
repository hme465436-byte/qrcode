'use client';

import Link from 'next/link';
import {
  MessageSquare,
  Sparkles,
  Contact2,
  QrCode,
  Mic,
  ArrowRight,
  Activity,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';

const popularTools = [
  {
    href: '/ai-chatbot',
    icon: MessageSquare,
    title: 'AI Chatbot',
    desc: 'Linguistic synthesis and real-time assistance.',
  },
  {
    href: '/ai-image-generator',
    icon: Sparkles,
    title: 'AI Image Gen',
    desc: 'Neural matrix for high-fidelity visual production.',
  },
  {
    href: '/ai-resume-builder',
    icon: Contact2,
    title: 'Resume Builder',
    desc: 'Professional identity synthesis and formatting.',
  },
  {
    href: '/single',
    icon: QrCode,
    title: 'Single Studio',
    desc: 'Branded QR protocols with AI backgrounds.',
  },
  {
    href: '/speech-to-text',
    icon: Mic,
    title: 'Speech to Text',
    desc: 'Hardware-native acoustic transcription.',
  },
  {
    href: '/all-units-converter',
    icon: Activity,
    title: 'Unit Converter',
    desc: 'Universal measurement matrix and translation.',
  },
];

export function PopularTools() {
  return (
    <section className="w-full py-32 sm:py-48 bg-[#02040a]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20 px-2">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-headline font-black text-white uppercase tracking-tight leading-none">
              Featured <span className="text-primary italic">Units</span>
            </h2>
            <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.4em]">Hardware-Optimized Nodes</p>
          </div>
          <Link href="/all-tools" className="inline-flex items-center gap-3 text-[11px] font-black text-primary uppercase tracking-widest hover:gap-4 transition-all group">
            Browse full registry <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {popularTools.map((tool) => (
            <Link key={tool.href} href={tool.href} className="group block h-full">
              <div className="flex flex-col justify-between h-full p-12 rounded-[3rem] bg-white/[0.01] border border-white/5 transition-all duration-700 hover:bg-white/[0.02] hover:border-primary/30 hover:-translate-y-2 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  
                  <div className="relative z-10">
                      <div className="mb-12 w-14 h-14 rounded-2xl bg-secondary/50 flex items-center justify-center text-primary/30 group-hover:text-primary group-hover:scale-110 transition-all duration-700 border border-white/5 shadow-inner">
                          <tool.icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-headline font-black text-white mb-4 uppercase tracking-tight leading-none">{tool.title}</h3>
                      <p className="text-xs text-white/30 font-medium leading-relaxed uppercase tracking-tighter">{tool.desc}</p>
                  </div>

                  <div className="mt-16 flex items-center gap-3 text-[10px] font-black text-white/5 group-hover:text-primary uppercase tracking-[0.3em] transition-colors duration-700">
                      Initialize Studio <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1.5" />
                  </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
