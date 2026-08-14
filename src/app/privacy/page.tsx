"use client"

import React from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft, Lock, EyeOff, Scale } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const sections = [
    {
      icon: EyeOff,
      title: "Zero-Storage Policy",
      content: "MY KIT TOOL is built on a privacy-first architecture. We do not store, log, or transmit the data you input into our generators or converters. All digital production happens locally within your browser using JavaScript."
    },
    {
      icon: Lock,
      title: "Data Security",
      content: "Since no data is sent to our servers for storage, your sensitive information (passwords, contact details, private URLs, binary files) remains strictly on your device. We use industry-standard encryption protocols only when interacting with our AI services."
    },
    {
      icon: Scale,
      title: "Information We Collect",
      content: "We collect minimal, non-identifying technical data via standard web analytics to improve our studio performance. This includes browser type, device category, and page interactions. We do not collect PII (Personally Identifiable Information)."
    }
  ];

  return (
    <div className="container mx-auto px-6 py-20 max-w-4xl">
      <div className="mb-12 animate-reveal">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:gap-3 transition-all mb-8">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Studio
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Shield className="w-3.5 h-3.5" /> Compliance
        </div>
        <h1 className="text-4xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight mb-8">
          Privacy <span className="text-primary italic">Policy</span>
        </h1>
        <p className="text-lg text-foreground/50 leading-relaxed font-medium">
          Last Updated: March 2024. Your privacy is not a feature; it is our foundation at MY KIT TOOL.
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

      <div className="glass-card p-10 rounded-[3rem] border-border animate-reveal stagger-3">
        <h2 className="text-2xl font-headline font-black text-foreground uppercase tracking-tight mb-6 text-center">Third-Party Services</h2>
        <div className="space-y-6 text-sm text-foreground/50 leading-relaxed font-medium">
          <p>
            Our studio integrates with **Google Imagen** for AI background generation and **Gemini** for content refinement. When using these specific features, the text or prompts you provide are sent to Google Cloud services to process the request.
          </p>
          <p>
            We recommend reviewing the privacy policies of these third-party providers if you have specific concerns regarding AI data processing.
          </p>
        </div>
      </div>
    </div>
  );
}
