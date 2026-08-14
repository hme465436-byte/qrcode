"use client"

import React from 'react';
import Link from 'next/link';
import { Cookie, ArrowLeft, Info, Settings, Database } from 'lucide-react';

export default function CookiePolicyPage() {
  const sections = [
    {
      icon: Settings,
      title: "Essential Storage",
      content: "We use 'Local Storage' to remember your studio preferences, such as your selected brand colors, active tool styles, and theme settings. This allows you to resume your design work across sessions."
    },
    {
      icon: Database,
      title: "Functional Cookies",
      content: "We utilize minimal functional cookies to manage security sessions and ensure our AI integrations (Imagen/Gemini) function correctly within your browser context."
    },
    {
      icon: Info,
      title: "How to Manage",
      content: "You can clear all stored data by resetting the studio parameters within the app or by clearing your browser's cache and site data for mykittool.app."
    }
  ];

  return (
    <div className="container mx-auto px-6 py-20 max-w-4xl">
      <div className="mb-12 animate-reveal">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:gap-3 transition-all mb-8">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Studio
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Cookie className="w-3.5 h-3.5" /> Privacy
        </div>
        <h1 className="text-4xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight mb-8">
          Cookie <span className="text-primary italic">Policy</span>
        </h1>
        <p className="text-lg text-foreground/50 leading-relaxed font-medium">
          Simple, transparent technical storage. No tracking, just performance.
        </p>
      </div>

      <div className="grid gap-8 mb-16">
        {sections.map((section, i) => (
          <div key={i} className="glass-card p-8 md:p-10 rounded-[2.5rem] border-border animate-reveal" style={{ animationDelay: `${i * 150}ms` }}>
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                <section.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-headline font-bold text-foreground mb-4 uppercase tracking-tight">{section.title}</h3>
                <p className="text-sm md:text-base text-foreground/50 leading-relaxed font-medium">{section.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-10 rounded-[3rem] border-border animate-reveal stagger-3 text-center">
        <h2 className="text-2xl font-headline font-black text-foreground uppercase tracking-tight mb-6">Zero Tracking Guarantee</h2>
        <p className="text-sm text-foreground/50 leading-relaxed font-medium max-w-xl mx-auto">
          Unlike other utility suites, MY KIT TOOL does not use third-party advertising cookies that follow you across the web. Your studio activity is private and localized.
        </p>
      </div>
    </div>
  );
}
