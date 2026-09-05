"use client"

import React from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft, ShieldCheck, Scale, AlertCircle, Gavel, FileSignature, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TermsOfServicePage() {
  const sections = [
    {
      icon: Zap,
      title: "1. The Service",
      content: "My Kit Tool is a free online tools website. Features may change, pause, or stop at any time."
    },
    {
      icon: FileSignature,
      title: "2. Your Content",
      content: "You are responsible for the text, images, files, and prompts you upload. As between you and My Kit Tool, we do not claim ownership of your inputs or the files you download. Third-party AI or hosting services may have their own rules. You must follow those too."
    },
    {
      icon: Gavel,
      title: "3. Acceptable Use",
      content: "Do not use My Kit Tool to: break the law, harm others, spread malware or phishing, or abuse/overload the service. We may block access if these rules are broken."
    },
    {
      icon: AlertCircle,
      title: "4. AI Results",
      content: "AI tools can make mistakes. Always check resumes, emails, code, and images before you use them. We do not guarantee accuracy."
    },
    {
      icon: ShieldCheck,
      title: "5. No Warranty",
      content: "The site is provided as is. We are not responsible for lost data, downtime, or results from the tools."
    },
    {
      icon: Scale,
      title: "6. Changes",
      content: "These terms may be updated. Continued use means you accept the new terms."
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
          By using My Kit Tool, you agree to these terms.
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

      <div className="glass-card p-12 rounded-[3.5rem] border-border animate-reveal stagger-3 text-center relative overflow-hidden bg-black/20">
         <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none" />
         <h2 className="text-2xl font-headline font-black text-foreground uppercase tracking-tight mb-4 relative z-10">Studio Compliance</h2>
         <p className="text-sm text-foreground/40 font-medium mb-10 max-w-xl mx-auto uppercase tracking-widest relative z-10">
           Providing professional-grade utilities with a focus on local privacy and user autonomy.
         </p>
         <Button asChild className="h-14 px-10 rounded-2xl bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 relative z-10 active:scale-95 transition-all">
            <Link href="/">I Understand</Link>
         </Button>
      </div>
    </div>
  );
}
