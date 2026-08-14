"use client"

import React from 'react';
import { Info, Shield, Zap, Globe, Heart, Code2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-6 py-20 max-w-4xl">
      <div className="text-center mb-20 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Info className="w-3.5 h-3.5" /> Our Mission
        </div>
        <h1 className="text-4xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight mb-8">
          About <span className="text-primary italic">MY KIT TOOL</span>
        </h1>
        <p className="text-lg text-foreground/50 leading-relaxed font-medium">
          The world's most advanced professional digital studio. We believe premium utilities and branded assets should be high-quality, free, and secure.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
        {[
          { icon: Shield, title: 'Privacy Absolute', desc: 'We do not store your data. All assets are generated locally in your browser. Your sensitive information stays yours.' },
          { icon: Zap, title: 'High Performance', desc: 'Built with Next.js and high-resolution rendering engines for instant previews and lightning-fast exports.' },
          { icon: Globe, title: 'Open Standards', desc: 'Supporting QR, WiFi, OCR, and technical hex protocols. All tools are permanent and static.' },
          { icon: Heart, title: 'Free Forever', desc: 'No subscriptions, no hidden fees, and no expiring assets. Professional tools for everyone.' },
        ].map((item, i) => (
          <div key={i} className="glass-card p-8 rounded-[2.5rem] border-border animate-reveal stagger-1">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 border border-primary/20">
              <item.icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-headline font-bold text-foreground mb-4 uppercase tracking-tight">{item.title}</h3>
            <p className="text-sm text-foreground/40 leading-relaxed font-medium">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="glass-card p-12 rounded-[3rem] border-border text-center animate-reveal stagger-3">
        <h2 className="text-2xl font-headline font-black text-foreground uppercase tracking-tight mb-6">Developed by Umar Farooq 💝</h2>
        <p className="text-sm text-foreground/50 leading-relaxed font-medium mb-10 max-w-xl mx-auto">
          Whether you are a developer needing technical conversions or a business owner wanting a unique logo-integrated code, MY KIT TOOL provides the precision instruments you need for a modern workflow.
        </p>
        <div className="flex justify-center gap-6">
          <div className="px-6 py-2 rounded-full bg-secondary border border-border text-[9px] font-black uppercase tracking-widest text-foreground/40">v6.0 Studio Edition</div>
          <div className="px-6 py-2 rounded-full bg-secondary border border-border text-[9px] font-black uppercase tracking-widest text-foreground/40">Technical Suite</div>
        </div>
      </div>
    </div>
  );
}
