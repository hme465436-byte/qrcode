"use client"

import React from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft, Gavel, CheckCircle, AlertCircle } from 'lucide-react';

export default function TermsOfServicePage() {
  const rules = [
    {
      icon: CheckCircle,
      title: "Ownership of Assets",
      content: "All assets generated through MY KIT TOOL are the sole property of the user. You hold full commercial rights to use, print, and distribute the generated assets without any attribution to this studio."
    },
    {
      icon: Gavel,
      title: "Acceptable Use",
      content: "You agree not to use MY KIT TOOL to generate codes or content that link to malicious software, phishing sites, or content that violates international laws. We reserve the right to block access to users found abusing our technical infrastructure."
    },
    {
      icon: AlertCircle,
      title: "No Warranty",
      content: "MY KIT TOOL provides its services 'as is'. While we strive for 100% precision using advanced algorithms, we are not liable for any technical failures or marketing outcomes resulting from processed assets. Always test your results before mass production."
    }
  ];

  return (
    <div className="container mx-auto px-6 py-20 max-w-4xl">
      <div className="mb-12 animate-reveal">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:gap-3 transition-all mb-8">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Studio
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <FileText className="w-3.5 h-3.5" /> Agreement
        </div>
        <h1 className="text-4xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight mb-8">
          Terms of <span className="text-primary italic">Service</span>
        </h1>
        <p className="text-lg text-foreground/50 leading-relaxed font-medium">
          By using MY KIT TOOL, you agree to these professional standards.
        </p>
      </div>

      <div className="grid gap-8 mb-16">
        {rules.map((rule, i) => (
          <div key={i} className="glass-card p-8 md:p-10 rounded-[2.5rem] border-border animate-reveal" style={{ animationDelay: `${i * 150}ms` }}>
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                <rule.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-headline font-bold text-foreground mb-4 uppercase tracking-tight">{rule.title}</h3>
                <p className="text-sm md:text-base text-foreground/50 leading-relaxed font-medium">{rule.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-10 rounded-[3rem] border-border animate-reveal stagger-3">
        <h2 className="text-2xl font-headline font-black text-foreground uppercase tracking-tight mb-6 text-center">Service Availability</h2>
        <div className="space-y-6 text-sm text-foreground/50 leading-relaxed font-medium">
          <p>
            MY KIT TOOL is a free utility. While we aim for maximum uptime, we do not guarantee uninterrupted access to our AI features or bulk rendering engine. We may update or modify features at any time to improve technical performance.
          </p>
        </div>
      </div>
    </div>
  );
}
