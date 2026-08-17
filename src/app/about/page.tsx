"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  User, 
  Mail, 
  Copy, 
  CheckCircle2, 
  ArrowUpRight, 
  ShieldCheck, 
  Zap, 
  Heart, 
  Code2, 
  Globe, 
  Smartphone, 
  Table, 
  QrCode, 
  Gamepad2,
  Box,
  Coffee,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Project {
  name: string;
  url: string;
  desc: string;
  icon: any;
  color: string;
}

const PROJECTS: Project[] = [
  { name: 'Vortex Reach', url: 'https://vortexreach.vercel.app/', desc: 'Lead Generation & Marketing Matrix.', icon: Zap, color: 'text-blue-500 bg-blue-500/10' },
  { name: 'Studio', url: 'https://studio-nu-sandy.vercel.app/', desc: 'Branded Digital Production Suite.', icon: QrCode, color: 'text-indigo-500 bg-indigo-500/10' },
  { name: 'Hisab Flow', url: 'https://hisabflow-coral.vercel.app/login', desc: 'Personal Finance & Ledger Protocol.', icon: Table, color: 'text-emerald-500 bg-emerald-500/10' },
  { name: 'WhatsQuality', url: 'https://whatsquality-pearl.vercel.app/', desc: 'High-Fidelity WhatsApp Asset Manager.', icon: Smartphone, color: 'text-cyan-500 bg-cyan-500/10' },
  { name: 'APK Vault', url: 'https://apkvault.vercel.app/', desc: 'Secure Android Application Repository.', icon: Box, color: 'text-orange-500 bg-orange-500/10' },
  { name: 'LootPro', url: 'https://lootpro.vercel.app/', desc: 'Premium Gaming Reward Analytics.', icon: Gamepad2, color: 'text-rose-500 bg-rose-500/10' },
];

export default function AboutPage() {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const email = "ummarfarooq38990@gmail.com";

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setIsCopied(true);
    toast({ title: "Email Copied", description: "Communication channel saved to clipboard." });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="container mx-auto px-6 py-20 max-w-6xl">
      {/* Hero Section */}
      <div className="text-center mb-24 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-6">
          <User className="w-3.5 h-3.5" /> Identity Matrix
        </div>
        <h1 className="text-5xl md:text-8xl font-headline font-black text-foreground uppercase tracking-tight mb-8">
          Umar <span className="text-primary italic">Farooq</span>
        </h1>
        <p className="text-xl md:text-2xl text-foreground/50 leading-relaxed font-medium max-w-3xl mx-auto uppercase tracking-tighter">
          I build free tools and small websites to make daily work easier.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start mb-32">
        {/* Story Section */}
        <div className="lg:col-span-7 space-y-12 animate-reveal stagger-1">
          <div className="space-y-6">
             <h2 className="text-2xl font-headline font-black text-foreground uppercase tracking-tight flex items-center gap-4">
                <Code2 className="w-6 h-6 text-primary" /> The Production Story
             </h2>
             <div className="space-y-6 text-lg text-foreground/40 leading-relaxed font-medium uppercase tracking-tighter">
                <p>
                  I build browser-native tools so people don’t need to install heavy software for simple daily tasks. Whether it's merging a PDF or generating a branded QR, efficiency should be accessible.
                </p>
                <p>
                  My Kit Tool is a central collection of 60+ free utilities. Every tool is built with a <span className="text-foreground">privacy-first</span> philosophy—most logic runs entirely on your device memory.
                </p>
                <p>
                  Not every project I build goes viral, but I still keep building and helping. The goal is consistent, high-fidelity digital production for everyone.
                </p>
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             <div className="p-8 rounded-[2.5rem] bg-secondary/50 border border-border space-y-4">
                <ShieldCheck className="w-8 h-8 text-primary" />
                <h4 className="text-xs font-black uppercase tracking-widest text-foreground">Privacy Sovereign</h4>
                <p className="text-[11px] text-foreground/40 font-medium leading-relaxed uppercase">No tracking, no data storage. Your assets stay on your hardware.</p>
             </div>
             <div className="p-8 rounded-[2.5rem] bg-secondary/50 border border-border space-y-4">
                <Globe className="w-8 h-8 text-primary" />
                <h4 className="text-xs font-black uppercase tracking-widest text-foreground">100% Free Access</h4>
                <p className="text-[11px] text-foreground/40 font-medium leading-relaxed uppercase">No paywalls for core utilities. Supported entirely by voluntary contributions.</p>
             </div>
          </div>
        </div>

        {/* Support Card */}
        <div className="lg:col-span-5 animate-reveal stagger-2">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <CardContent className="p-10 space-y-10">
                 <div className="space-y-2">
                    <h3 className="text-xl font-headline font-black text-foreground uppercase tracking-tight">Direct Support</h3>
                    <p className="text-[10px] text-foreground/30 font-bold uppercase tracking-widest leading-relaxed">
                       Have a technical issue or project request? Reach out directly to my linguistic uplink.
                    </p>
                 </div>

                 <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Linguistic Uplink (Email)</Label>
                    <div className="flex gap-2 group/field">
                      <div className="flex-1 h-16 bg-secondary border border-border rounded-2xl flex items-center px-6 font-mono text-xs font-bold text-foreground overflow-hidden group-hover/field:border-primary/20 transition-colors">
                        {email}
                      </div>
                      <Button 
                        onClick={handleCopyEmail}
                        className="h-16 w-16 rounded-2xl bg-primary shadow-xl shadow-primary/20 shrink-0"
                      >
                        {isCopied ? <CheckCircle2 className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                      </Button>
                    </div>
                    <Button asChild variant="outline" className="w-full h-12 rounded-xl border-border bg-secondary text-[10px] font-black uppercase tracking-widest hover:text-primary">
                       <a href={`mailto:${email}`}><Mail className="w-4 h-4 mr-2" /> Open Mail Client</a>
                    </Button>
                 </div>

                 <div className="pt-8 border-t border-white/5 space-y-6">
                    <div className="flex items-center justify-between">
                       <p className="text-[10px] font-black uppercase text-foreground/30 tracking-widest">Maintenance Mode</p>
                       <Link href="/donate" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:gap-3 transition-all">
                          Buy me a coffee <ArrowUpRight className="w-3.5 h-3.5" />
                       </Link>
                    </div>
                    <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-4">
                       <Coffee className="w-5 h-5 text-primary" />
                       <p className="text-[10px] text-foreground/50 font-bold uppercase leading-relaxed">Contributions are manual and strictly optional.</p>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="animate-reveal stagger-3">
        <div className="flex items-center gap-6 mb-12">
           <div className="h-[1px] flex-1 bg-white/5" />
           <h2 className="text-xl font-headline font-black text-foreground/40 uppercase tracking-widest">Other projects I&apos;ve built</h2>
           <div className="h-[1px] flex-1 bg-white/5" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {PROJECTS.map((project, i) => (
             <div key={i} className="glass-card p-8 rounded-[2.5rem] border-border hover:bg-secondary/30 hover:-translate-y-2 transition-all duration-500 group">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-8 border border-white/5 shadow-xl transition-transform group-hover:scale-110", project.color)}>
                   <project.icon className="w-6 h-6" />
                </div>
                <div className="space-y-2 mb-8">
                   <h3 className="text-xl font-headline font-bold text-foreground uppercase tracking-tight">{project.name}</h3>
                   <p className="text-sm text-foreground/40 font-medium leading-relaxed uppercase tracking-tighter">{project.desc}</p>
                </div>
                <Button asChild variant="outline" className="w-full h-12 rounded-2xl border-white/5 bg-white/2 hover:bg-primary hover:text-white transition-all">
                   <a href={project.url} target="_blank" rel="noopener noreferrer">
                      Visit Studio <ExternalLink className="w-4 h-4 ml-2 opacity-40" />
                   </a>
                </Button>
             </div>
           ))}
        </div>
      </div>

      <div className="mt-32 text-center opacity-20">
         <Heart className="w-10 h-10 mx-auto mb-4" />
         <p className="text-[10px] font-black uppercase tracking-[0.4em]">Dedicated to helping everyone build better.</p>
      </div>
    </div>
  );
}
