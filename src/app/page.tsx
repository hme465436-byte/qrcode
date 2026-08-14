"use client"

import React from 'react';
import Link from 'next/link';
import { 
  QrCode, 
  Layers, 
  Zap, 
  ShieldCheck, 
  Palette, 
  Download,
  ArrowRight,
  Sparkles,
  Smartphone,
  HelpCircle,
  Repeat,
  Binary,
  Grid3X3,
  FileText,
  ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* HERO SECTION */}
      <section className="container mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-40 text-center relative">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto animate-reveal relative z-10">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/15 border border-primary/30 text-[11px] font-black tracking-[0.3em] text-primary mb-10 shadow-2xl shadow-primary/10">
            <Sparkles className="w-4 h-4" />
            <span>PREMIUM BRANDING STUDIO</span>
          </div>
          <h1 className="text-4xl md:text-7xl lg:text-8xl font-headline font-black mb-8 leading-[1.05] tracking-tighter text-foreground uppercase">
            Artistic <span className="text-primary italic">Precision</span> <br />
            <span className="text-foreground/80">QR Studio</span>
          </h1>
          <p className="text-lg md:text-xl text-foreground/50 max-w-2xl mx-auto leading-relaxed font-medium mb-16 px-4">
            The world's most advanced professional QR studio. Generate high-resolution, branded assets for global marketing campaigns with AI-powered creativity.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
            {[
              { href: '/single', icon: QrCode, title: 'Single Studio', desc: 'Branded QR codes with logos and AI backgrounds.', label: 'PRO MODE', color: 'bg-primary/50' },
              { href: '/bulk', icon: Layers, title: 'Bulk Production', desc: 'Generate hundreds of high-res assets in seconds.', label: 'BATCH', color: 'bg-primary/50' },
              { href: '/photo-editor', icon: ImageIcon, title: 'Photo Studio', desc: 'Professional filters and local image editing.', label: 'EDITOR', color: 'bg-primary/50' },
              { href: '/ocr', icon: FileText, title: 'OCR Extraction', desc: 'Extract text from images locally and securely.', label: 'INTEL', color: 'bg-primary/40' },
              { href: '/dot-art', icon: Grid3X3, title: 'Dot Art Studio', desc: 'Intricate Braille Unicode artistic generation.', label: 'ART', color: 'bg-primary/40' },
              { href: '/repeater', icon: Repeat, title: 'Text Repeater', desc: 'Professional emoji and text multiplication.', label: 'UTIL', color: 'bg-primary/30' }
            ].map((item, i) => (
              <Link key={i} href={item.href} className="group h-full">
                <div className="glass-card p-10 rounded-[3rem] border-border hover:border-primary/40 transition-all duration-500 hover:-translate-y-3 text-left relative overflow-hidden h-full shadow-2xl hover:shadow-primary/20">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-primary/30 rounded-full -mr-20 -mt-20 group-hover:bg-primary/40 transition-all blur-3xl" />
                  <div className={cn("w-16 h-16 rounded-[1.8rem] flex items-center justify-center text-primary mb-8 border border-primary/60 shadow-inner group-hover:scale-110 transition-transform duration-500", item.color)}>
                    <item.icon className="w-8 h-8" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-headline font-black text-foreground uppercase tracking-tight">{item.title}</h3>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded bg-primary/10 text-primary uppercase tracking-widest">{item.label}</span>
                    </div>
                    <p className="text-[12px] text-foreground/40 leading-relaxed font-medium">
                      {item.desc}
                    </p>
                    <div className="flex items-center gap-3 pt-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary opacity-60 group-hover:opacity-100 transition-opacity">
                      Open Studio <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-500" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="w-full bg-secondary/20 py-32 border-y border-border">
        <div className="container mx-auto px-6">
          <div className="text-center mb-24 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-headline font-black uppercase tracking-tight mb-6">Built for <span className="text-primary italic">Excellence</span></h2>
            <p className="text-foreground/40 font-medium leading-relaxed">High-performance technical assets with a focus on privacy and precision scannability.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 max-w-6xl mx-auto">
            {[
              { icon: Palette, title: 'Artistic Branding', desc: 'Custom dot patterns, corner geometries, and integrated business logos for consistent brand identity.' },
              { icon: Download, title: 'Vector Exports', desc: 'Download in PNG, JPG, or professional SVG formats suitable for large-format billboards and print.' },
              { icon: Smartphone, title: 'PWA Native', desc: 'Install as a high-performance native app on your mobile device for offline studio access anytime.' },
              { icon: Zap, title: 'Instant Engine', desc: 'Real-time studio preview with advanced error correction level adjustment and scannability scores.' },
              { icon: ShieldCheck, title: 'Privacy Absolute', desc: 'Zero data storage. All generation, OCR, and editing happens locally in your secure browser session.' },
              { icon: Binary, title: 'Technical Tools', desc: 'Code converters, AOB pattern processors, and developer-centric utilities for modern workflows.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-8 group">
                <div className="w-16 h-16 rounded-[1.8rem] bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-xl group-hover:border-primary/40 transition-all duration-500">
                  <item.icon className="w-7 h-7" />
                </div>
                <div className="space-y-3">
                  <h4 className="text-base font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">{item.title}</h4>
                  <p className="text-[13px] text-foreground/40 leading-relaxed font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="container mx-auto px-6 py-32 text-center">
        <div className="glass-card p-16 md:p-24 rounded-[4rem] max-w-5xl mx-auto border-border relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-32 -mt-32" />
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -ml-32 -mb-32" />
           
           <h2 className="text-3xl md:text-6xl font-headline font-black uppercase tracking-tight mb-8 relative z-10">Start Your <span className="text-primary italic">Production</span></h2>
           <p className="text-lg text-foreground/40 font-medium mb-12 max-w-2xl mx-auto relative z-10">
             Join thousands of marketing professionals creating premium branded assets for free. No credit card, no signup, just performance.
           </p>
           <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
             <Link href="/single" className="w-full sm:w-auto px-10 py-5 bg-primary text-primary-foreground font-black text-sm uppercase tracking-widest rounded-2xl shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all">
               Open Studio
             </Link>
             <Link href="/faq" className="w-full sm:w-auto px-10 py-5 bg-secondary border border-border text-foreground font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-secondary/80 transition-all">
               View Documentation
             </Link>
           </div>
        </div>
      </section>
    </div>
  );
}