"use client"

import React from 'react';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { HelpCircle, Globe, Shield, Zap, Smartphone, User, Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const FAQ_DATA = [
  {
    icon: Globe,
    q: "What is My Kit Tool?",
    a: "My Kit Tool is a professional digital studio offering high-fidelity asset production and technical data translation tools. It's engineered to streamline workflows with high speed and absolute hardware-native privacy."
  },
  {
    icon: Zap,
    q: "Is My Kit Tool free?",
    a: "Yes. All units within the studio are 100% free for both personal and commercial use. We do not utilize subscriptions, paywalls, or hidden usage fees."
  },
  {
    icon: Shield,
    q: "Do I need an account?",
    a: "No account is required for the majority of our tools. We operate on a 'local-first' principle, meaning your data is processed directly in your browser. Optional accounts are only available for cloud-persistent features like the AI Chatbot or File Host history."
  },
  {
    icon: Sparkles,
    q: "Which tools can I use?",
    a: "Our registry features over 80+ professional units, including an AI Chatbot, high-fidelity Resume Builder, Image Converters, PDF Management tools, and various technical Developer Utilities."
  },
  {
    icon: Smartphone,
    q: "Does it work on mobile?",
    a: "Absolutely. My Kit Tool is optimized for all hardware sizes, providing a consistent production experience on smartphones, tablets, and desktop workstations."
  }
];

export default function FAQPage() {
  return (
    <div className="container mx-auto px-6 py-20 max-w-4xl">
      <div className="mb-12 animate-reveal">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:gap-3 transition-all mb-8">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Studio
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <HelpCircle className="w-3.5 h-3.5" /> Knowledge Base
        </div>
        <h1 className="text-4xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight mb-8">
          Frequent <span className="text-primary italic">Questions</span>
        </h1>
        <p className="text-lg text-foreground/50 leading-relaxed font-medium">
          Everything you need to know about using My Kit Tool for your professional workflow.
        </p>
      </div>

      <div className="glass-card p-1 md:p-8 rounded-[3rem] border-border overflow-hidden animate-reveal stagger-1">
        <Accordion type="single" collapsible className="w-full">
          {FAQ_DATA.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-b border-white/10 px-6 py-2 last:border-0">
              <AccordionTrigger className="hover:no-underline hover:text-primary transition-all text-left group py-6">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm md:text-base font-bold uppercase tracking-tight">{item.q}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-8 pt-2 pl-12 text-sm md:text-base text-foreground/50 leading-relaxed font-medium">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="mt-20 glass-card p-12 rounded-[3rem] border-border text-center animate-reveal stagger-2">
        <h2 className="text-2xl font-headline font-black text-foreground uppercase tracking-tight mb-4 text-center">Still have questions?</h2>
        <p className="text-sm text-foreground/40 font-medium mb-10 text-center uppercase tracking-widest">
          Discover tools optimized for your professional needs.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Button asChild className="h-14 px-10 rounded-2xl bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 active:scale-95">
            <Link href="/">Explore Studio</Link>
          </Button>
          <div className="px-8 py-3 rounded-2xl bg-secondary border border-border text-[10px] font-black uppercase tracking-widest text-foreground/40 flex items-center">
            Studio Engine v7.2 Pro
          </div>
        </div>
      </div>
    </div>
  );
}
