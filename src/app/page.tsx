'use client';

import React, { useState, useCallback, useLayoutEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight,
  QrCode, MessageSquare as MessageIcon, Contact2, Mail, Code2, Sparkles, RotateCcw, Mic, Volume2, Mic2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Hero } from '@/components/landing/hero';
import { Features } from '@/components/landing/features';
import { Categories } from '@/components/landing/categories';
import { WhyChooseUs } from '@/components/landing/why-choose-us';
import { HowItWorks } from '@/components/landing/how-it-works';
import { Testimonials } from '@/components/landing/testimonials';

const SCROLL_POS_KEY = 'mykit_home_scroll_v1';

interface Tool {
  href: string;
  icon: any;
  title: string;
  desc: string;
  label: string;
  color: string;
  glowClass: string;
}

const TOOLS: Tool[] = [
  { href: '/single', icon: QrCode, title: 'Single Studio', desc: 'Branded QR codes with logos and AI backgrounds.', label: 'PRO MODE', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', glowClass: 'bg-blue-500/10' },
  { href: '/ai-chatbot', icon: MessageIcon, title: 'AI Chatbot', desc: 'Chat with a fast AI assistant.', label: 'AI STUDIO', color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20', glowClass: 'bg-indigo-400/10' },
  { href: '/ai-resume-builder', icon: Contact2, title: 'AI Resume Builder', desc: 'Create a clean professional resume in minutes.', label: 'AI STUDIO', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', glowClass: 'bg-emerald-400/10' },
  { href: '/ai-email-writer', icon: Mail, title: 'AI Email Writer', desc: 'Write a clean email in seconds.', label: 'AI STUDIO', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', glowClass: 'bg-blue-400/10' },
  { href: '/ai-code-generator', icon: Code2, title: 'AI Code Generator', desc: 'Create code from a simple request.', label: 'AI STUDIO', color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20', glowClass: 'bg-cyan-400/10' },
  { href: '/ai-image-generator', icon: Sparkles, title: 'AI Image Generator', desc: 'Create images from text for free.', label: 'CREATIVE', color: 'text-rose-400 bg-rose-400/10 border-rose-400/20', glowClass: 'bg-rose-400/10' },
  { href: '/reverse-video', icon: RotateCcw, title: 'Reverse Video', desc: 'Reverse any video in your browser.', label: 'MEDIA', color: 'text-purple-500 bg-purple-500/10 border-purple-500/20', glowClass: 'bg-purple-500/10' },
  { href: '/speech-to-text', icon: Mic, title: 'Speech to Text', desc: 'Convert your voice into text instantly.', label: 'MEDIA', color: 'text-orange-500 bg-orange-500/10 border-orange-500/20', glowClass: 'bg-orange-500/10' },
  { href: '/text-to-speech', icon: Volume2, title: 'Text to Speech', desc: 'Convert any text into speech instantly.', label: 'MEDIA', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', glowClass: 'bg-blue-500/10' },
  { href: '/voice-changer', icon: Mic2, title: 'Voice Changer', desc: 'Change your voice live with various effects.', label: 'MEDIA', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20', glowClass: 'bg-rose-500/10' },
];

const ToolItem = React.memo(({ item, onNavigate }: { item: Tool, onNavigate: () => void }) => {
  return (
    <Link 
      href={item.href} 
      onClick={onNavigate}
      className="group relative flex transition-all duration-300 h-full w-full"
    >
      <Card className="relative flex-1 flex flex-col p-5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 shadow-lg group-hover:shadow-primary/10 overflow-hidden text-left hover:-translate-y-1">
        <div className={cn("rounded-md flex items-center justify-center border transition-all duration-300 relative z-10 shrink-0 w-10 h-10 mb-3", item.color, "bg-opacity-20 border-opacity-30")}>
          <item.icon className="w-5 h-5" />
        </div>
        <div className="relative z-10 flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-white tracking-tight">
              {item.title}
            </h3>
          <p className="mt-1 text-xs text-white/50 leading-normal font-light line-clamp-2">
            {item.desc}
          </p>
        </div>
      </Card>
    </Link>
  );
});

ToolItem.displayName = 'ToolItem';

export default function Home() {
  const router = useRouter();
  
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    const saved = sessionStorage.getItem(SCROLL_POS_KEY);
    if (saved) {
      window.scrollTo(0, parseInt(saved));
    }
  }, []);

  const handleToolNavigation = useCallback(() => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(SCROLL_POS_KEY, window.scrollY.toString());
  }, []);

  return (
    <div className="flex flex-col items-center w-full max-w-full overflow-x-hidden font-sans bg-[#0F172A]">
      <Hero />
      <Features />
      <Categories />
      <WhyChooseUs />
      <HowItWorks />
      <Testimonials />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10 text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Most Popular Tools</h2>
            <p className="mt-2 text-base text-gray-400 max-w-xl mx-auto">Explore our most used tools, trusted by thousands of users daily.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {TOOLS.map((item) => (
            <ToolItem key={item.href} item={item} onNavigate={handleToolNavigation} />
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button asChild className="h-12 px-8 rounded-full bg-blue-600 text-white font-bold text-base shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all duration-300 transform hover:scale-105">
            <Link href="/all-tools">View All 120+ Tools</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
