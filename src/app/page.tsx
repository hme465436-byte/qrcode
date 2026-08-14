
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
  Grid3X3
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* HERO SECTION */}
      <section className="container mx-auto px-6 pt-12 pb-20 md:pt-16 md:pb-32 text-center">
        <div className="max-w-4xl mx-auto animate-reveal">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-primary/15 border border-primary/30 text-[10px] font-black tracking-[0.2em] text-primary mb-10 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PREMIUM BRANDING STUDIO</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-headline font-black mb-8 leading-[1.1] tracking-tight text-foreground">
            The World's Most <br />
            <span className="text-primary italic">Artistic QR Studio</span>
          </h1>
          <p className="text-lg md:text-xl text-foreground/50 max-w-2xl mx-auto leading-relaxed font-medium mb-16">
            Generate high-resolution, branded QR codes for your marketing campaigns. 100% free, high-speed bulk production, and AI-powered backgrounds.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Link href="/single" className="group h-full">
              <div className="glass-card p-8 rounded-[2.5rem] border-border hover:border-primary/40 transition-all hover:-translate-y-2 text-left relative overflow-hidden h-full shadow-lg hover:shadow-primary/10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/30 rounded-full -mr-16 -mt-16 group-hover:bg-primary/40 transition-all blur-2xl" />
                <div className="w-14 h-14 rounded-[1.5rem] bg-primary/40 flex items-center justify-center text-primary mb-6 border border-primary/50 shadow-inner group-hover:scale-110 transition-transform">
                  <QrCode className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-headline font-bold text-foreground mb-3 uppercase tracking-tight">Single QR</h3>
                <p className="text-[11px] text-foreground/40 leading-relaxed font-medium mb-6">
                  Branded QR codes with custom logos and AI backgrounds.
                </p>
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary">
                  Studio <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            <Link href="/bulk" className="group h-full">
              <div className="glass-card p-8 rounded-[2.5rem] border-border hover:border-primary/40 transition-all hover:-translate-y-2 text-left relative overflow-hidden h-full shadow-lg hover:shadow-primary/10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/30 rounded-full -mr-16 -mt-16 group-hover:bg-primary/40 transition-all blur-2xl" />
                <div className="w-14 h-14 rounded-[1.5rem] bg-primary/40 flex items-center justify-center text-primary mb-6 border border-primary/50 shadow-inner group-hover:scale-110 transition-transform">
                  <Layers className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-headline font-bold text-foreground mb-3 uppercase tracking-tight">Bulk Mode</h3>
                <p className="text-[11px] text-foreground/40 leading-relaxed font-medium mb-6">
                  Generate hundreds of high-res QR codes in seconds.
                </p>
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary">
                  Batch <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            <Link href="/dot-art" className="group h-full">
              <div className="glass-card p-8 rounded-[2.5rem] border-border hover:border-primary/40 transition-all hover:-translate-y-2 text-left relative overflow-hidden h-full shadow-lg hover:shadow-primary/10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/30 rounded-full -mr-16 -mt-16 group-hover:bg-primary/40 transition-all blur-2xl" />
                <div className="w-14 h-14 rounded-[1.5rem] bg-primary/40 flex items-center justify-center text-primary mb-6 border border-primary/50 shadow-inner group-hover:scale-110 transition-transform">
                  <Grid3X3 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-headline font-bold text-foreground mb-3 uppercase tracking-tight">Dot Art</h3>
                <p className="text-[11px] text-foreground/40 leading-relaxed font-medium mb-6">
                  Convert images to intricate Braille Unicode text art.
                </p>
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary">
                  Generate <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            <Link href="/repeater" className="group h-full">
              <div className="glass-card p-8 rounded-[2.5rem] border-border hover:border-primary/40 transition-all hover:-translate-y-2 text-left relative overflow-hidden h-full shadow-lg hover:shadow-primary/10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 group-hover:bg-primary/30 transition-all blur-2xl" />
                <div className="w-14 h-14 rounded-[1.5rem] bg-primary/30 flex items-center justify-center text-primary mb-6 border border-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <Repeat className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-headline font-bold text-foreground mb-3 uppercase tracking-tight">Repeater</h3>
                <p className="text-[11px] text-foreground/40 leading-relaxed font-medium mb-6">
                  Multiply text and emojis with professional formatting.
                </p>
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary">
                  Multiply <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            <Link href="/code-converter" className="group h-full">
              <div className="glass-card p-8 rounded-[2.5rem] border-border hover:border-primary/40 transition-all hover:-translate-y-2 text-left relative overflow-hidden h-full shadow-lg hover:shadow-primary/10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 group-hover:bg-primary/30 transition-all blur-2xl" />
                <div className="w-14 h-14 rounded-[1.5rem] bg-primary/30 flex items-center justify-center text-primary mb-6 border border-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <Binary className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-headline font-bold text-foreground mb-3 uppercase tracking-tight">Converter</h3>
                <p className="text-[11px] text-foreground/40 leading-relaxed font-medium mb-6">
                  Advanced AOB pattern conversion for technical assets.
                </p>
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary">
                  Convert <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="container mx-auto px-6 py-24 border-t border-border bg-secondary/10">
        <h2 className="sr-only">Studio Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {[
            { icon: Palette, title: 'Artistic Branding', desc: 'Custom dot patterns, corner geometries, and integrated business logos.' },
            { icon: Download, title: 'Vector Exports', desc: 'Download in PNG, JPG, or professional SVG formats for large-format printing.' },
            { icon: Smartphone, title: 'PWA Ready', desc: 'Install as a high-performance native app on your mobile device for offline scanning.' },
            { icon: Zap, title: 'Instant Render', desc: 'Real-time studio preview with advanced error correction level adjustment.' },
            { icon: ShieldCheck, title: 'Privacy First', desc: 'Zero data storage. All generation happens locally in your browser session.' },
            { icon: HelpCircle, title: 'Expert Support', desc: 'Detailed FAQ and knowledge base to help you create the perfect QR assets.' },
          ].map((item, i) => (
            <div key={i} className="flex gap-6">
              <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-sm">
                <item.icon className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-black uppercase tracking-widest text-foreground">{item.title}</h4>
                <p className="text-xs text-foreground/40 leading-relaxed font-medium">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
