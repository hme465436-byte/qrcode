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
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    border: 'group-hover:border-cyan-500/20'
  },
  {
    href: '/ai-image-generator',
    icon: Sparkles,
    title: 'AI Image Gen',
    desc: 'Neural matrix for high-fidelity visual production.',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    border: 'group-hover:border-purple-500/20'
  },
  {
    href: '/ai-resume-builder',
    icon: Contact2,
    title: 'Resume Builder',
    desc: 'Professional identity synthesis and formatting.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'group-hover:border-emerald-500/20'
  },
  {
    href: '/single',
    icon: QrCode,
    title: 'Single Studio',
    desc: 'Branded QR protocols with AI backgrounds.',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'group-hover:border-amber-500/20'
  },
  {
    href: '/speech-to-text',
    icon: Mic,
    title: 'Speech to Text',
    desc: 'Hardware-native acoustic transcription.',
    color: 'text-rose-400',
    bg: 'bg-rose-400/10',
    border: 'group-hover:border-rose-500/20'
  },
  {
    href: '/all-units-converter',
    icon: Activity,
    title: 'Unit Converter',
    desc: 'Universal measurement matrix and translation.',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'group-hover:border-blue-500/20'
  },
];

export function PopularTools() {
  return (
    <section className="w-full py-20 sm:py-24 bg-[#02040a]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 px-2">
          <div className="space-y-3">
            <h2 className="text-2xl md:text-4xl font-headline font-black text-white uppercase tracking-tight leading-none">
              Featured <span className="text-primary italic">tools</span>
            </h2>
            <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.3em]">Popular tools</p>
          </div>
          <Link href="/all-tools" className="inline-flex items-center gap-3 text-[10px] font-black text-primary uppercase tracking-widest hover:gap-4 transition-all group">
            See all tools <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularTools.map((tool) => (
            <Link key={tool.href} href={tool.href} className="group block h-full">
              <div className={cn(
                "flex flex-col justify-between h-full p-8 rounded-[2.5rem] bg-white/[0.01] border border-white/5 transition-all duration-500 hover:bg-white/[0.02] hover:-translate-y-1 shadow-2xl relative overflow-hidden",
                tool.border
              )}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  
                  <div className="relative z-10">
                      <div className={cn(
                        "mb-6 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 border border-white/5 shadow-inner group-hover:scale-110",
                        tool.bg,
                        tool.color
                      )}>
                          <tool.icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-headline font-black text-white mb-3 uppercase tracking-tight leading-none">{tool.title}</h3>
                      <p className="text-[11px] text-white/30 font-medium leading-relaxed uppercase tracking-tighter">{tool.desc}</p>
                  </div>

                  <div className="mt-12 flex items-center gap-3 text-[9px] font-black text-white/5 group-hover:text-primary uppercase tracking-[0.3em] transition-colors duration-500">
                      Open <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
