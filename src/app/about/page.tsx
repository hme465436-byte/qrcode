
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
  ExternalLink,
  History,
  Terminal,
  ArrowRight,
  Sparkles,
  LayoutGrid
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
    <div className="flex flex-col w-full pb-32">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.1)_0%,transparent_70%)]" />
        <div className="container mx-auto px-6 relative z-10 text-center space-y-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-[0.3em] animate-reveal">
            <User className="w-3.5 h-3.5" /> Identity Matrix
          </div>
          
          <div className="space-y-4 animate-reveal stagger-1">
            <h1 className="text-5xl md:text-8xl font-headline font-black text-foreground uppercase tracking-tighter leading-none">
              Umar <span className="text-primary italic">Farooq</span>
            </h1>
            <p className="text-xl md:text-2xl font-black text-foreground/40 uppercase tracking-widest max-w-2xl mx-auto">
              Builder of free browser tools
            </p>
          </div>

          <p className="text-base md:text-lg text-foreground/50 max-w-3xl mx-auto leading-relaxed font-medium animate-reveal stagger-2">
            I build small digital products to make daily work easier — even if they never go viral. My mission is to provide high-fidelity utilities that respect user privacy and operate with zero friction.
          </p>

          <div className="flex flex-wrap justify-center gap-4 animate-reveal stagger-3">
            <Button asChild className="h-14 px-8 rounded-2xl bg-primary shadow-xl shadow-primary/20">
               <a href={`mailto:${email}`}><Mail className="w-4 h-4 mr-2" /> Email Support</a>
            </Button>
            <Button asChild variant="outline" className="h-14 px-8 rounded-2xl border-white/10 bg-white/5">
               <Link href="/donate"><Coffee className="w-4 h-4 mr-2" /> Buy me a coffee</Link>
            </Button>
            <Button asChild variant="ghost" className="h-14 px-8 rounded-2xl text-foreground/40 hover:text-primary">
               <Link href="/">Explore tools <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="container mx-auto px-6 -mt-16 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Studio Units', val: '60+', icon: LayoutGrid },
            { label: 'Other Projects', val: '6', icon: Zap },
            { label: 'Local Engine', val: '100%', icon: ShieldCheck },
            { label: 'Access Protocol', val: 'Free', icon: Heart },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-8 rounded-[2.5rem] border-white/10 flex flex-col items-center text-center gap-4 animate-in slide-in-from-bottom-6 duration-700" style={{ animationDelay: `${i * 100}ms` }}>
               <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary/40">
                  <stat.icon className="w-6 h-6" />
               </div>
               <div className="space-y-1">
                  <p className="text-3xl font-headline font-black text-foreground leading-none">{stat.val}</p>
                  <p className="text-[10px] font-black uppercase text-foreground/20 tracking-[0.2em]">{stat.label}</p>
               </div>
            </div>
          ))}
        </div>
      </section>

      {/* Story Section */}
      <section className="container mx-auto px-6 pt-32 space-y-16">
         <div className="flex items-center gap-6">
            <div className="h-[1px] flex-1 bg-white/5" />
            <h2 className="text-2xl font-headline font-black text-foreground uppercase tracking-widest flex items-center gap-4">
               <History className="w-6 h-6 text-primary" /> The Production Story
            </h2>
            <div className="h-[1px] flex-1 bg-white/5" />
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'The Spark', desc: 'I began by building browser-native scripts so people wouldn’t need to install heavy software for simple daily tasks. One tool led to another as I saw the need for accessible efficiency.' },
              { title: 'The Daily Matrix', desc: 'Focusing on the things we do every day—merging a PDF, generating a branded QR, or cleaning data. Every unit is built with a 100% privacy-first philosophy.' },
              { title: 'The Studio Hub', desc: 'My Kit Tool is the culmination of these efforts. A central hub where 60+ free utilities live together in a high-fidelity, secure production environment.' },
            ].map((card, i) => (
              <Card key={i} className="glass-card p-10 rounded-[3rem] border-white/5 hover:border-primary/20 transition-all group">
                 <span className="text-4xl font-headline font-black text-primary/10 group-hover:text-primary/20 transition-colors mb-6 block">0{i+1}</span>
                 <h3 className="text-xl font-headline font-black text-foreground uppercase mb-4 tracking-tight">{card.title}</h3>
                 <p className="text-sm text-foreground/40 leading-relaxed font-medium uppercase tracking-tighter">{card.desc}</p>
              </Card>
            ))}
         </div>
      </section>

      {/* Philosophy Section */}
      <section className="container mx-auto px-6 pt-32">
         <div className="glass-card p-12 md:p-20 rounded-[4rem] border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] transition-all group-hover:bg-primary/10" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
               <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                    Verified Secure
                  </div>
                  <h2 className="text-4xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tighter leading-[0.95]">Definitive <span className="text-primary italic">Privacy</span> Protocol</h2>
                  <p className="text-lg text-foreground/50 font-medium leading-relaxed uppercase tracking-tighter">
                    I believe that your technical data belongs strictly on your hardware. Most logic in My Kit Tool runs entirely in your device memory—no tracking, no signups, and zero data leakage.
                  </p>
               </div>
               <div className="grid grid-cols-1 gap-6">
                  {[
                    { icon: ShieldCheck, title: 'Privacy Sovereignty', desc: 'No tracking or server storage. Your assets stay local.' },
                    { icon: Zap, title: 'Hardware Speed', desc: 'Fast, mobile-friendly units optimized for instant work.' },
                    { icon: Book, title: 'Pro Documentation', desc: 'Help guides and technical specs on every single tool.' },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-6 items-start group/item">
                       <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary shrink-0 transition-transform group-hover/item:scale-110 shadow-xl border border-white/5">
                          <item.icon className="w-6 h-6" />
                       </div>
                       <div className="space-y-1">
                          <h4 className="text-sm font-black uppercase text-foreground tracking-widest">{item.title}</h4>
                          <p className="text-xs text-foreground/40 font-medium leading-relaxed uppercase tracking-tighter">{item.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* Projects Grid */}
      <section className="container mx-auto px-6 pt-32 space-y-16">
        <div className="flex items-center gap-6">
           <div className="h-[1px] flex-1 bg-white/5" />
           <h2 className="text-xl font-headline font-black text-foreground/40 uppercase tracking-[0.4em]">Other projects I&apos;ve built</h2>
           <div className="h-[1px] flex-1 bg-white/5" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {PROJECTS.map((project, i) => (
             <div key={i} className="glass-card p-10 rounded-[3rem] border-white/5 hover:bg-secondary/30 hover:-translate-y-2 transition-all duration-500 group">
                <div className={cn("w-14 h-14 rounded-[1.5rem] flex items-center justify-center mb-10 border border-white/5 shadow-xl transition-transform group-hover:scale-110", project.color)}>
                   <project.icon className="w-7 h-7" />
                </div>
                <div className="space-y-3 mb-10 min-h-[80px]">
                   <h3 className="text-2xl font-headline font-black text-foreground uppercase tracking-tight">{project.name}</h3>
                   <p className="text-sm text-foreground/40 font-medium leading-relaxed uppercase tracking-tighter">{project.desc}</p>
                </div>
                <Button asChild variant="outline" className="w-full h-14 rounded-2xl border-white/10 bg-white/2 hover:bg-primary hover:text-white transition-all uppercase text-[10px] font-black tracking-widest">
                   <a href={project.url} target="_blank" rel="noopener noreferrer">
                      Visit Studio <ExternalLink className="w-4 h-4 ml-2 opacity-40" />
                   </a>
                </Button>
             </div>
           ))}
        </div>
      </section>

      {/* Support Section */}
      <section className="container mx-auto px-6 pt-32">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <Card className="lg:col-span-7 glass-card p-10 sm:p-16 rounded-[4rem] border-white/10 flex flex-col justify-center gap-10 relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] transition-all group-hover:bg-primary/10" />
               <div className="space-y-4 relative z-10">
                  <h3 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tighter leading-none">Support & <span className="text-primary italic">Feedback</span></h3>
                  <p className="text-sm md:text-lg text-foreground/40 font-medium uppercase tracking-tighter leading-relaxed">
                    Technical issue or project request? Reach out directly to my linguistic uplink. I typically respond within 24 hours.
                  </p>
               </div>

               <div className="space-y-6 relative z-10">
                  <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.3em] ml-1">Linguistic Uplink (Email)</Label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 h-16 bg-secondary border border-border rounded-2xl flex items-center px-6 font-mono text-sm font-bold text-foreground overflow-hidden">
                      {email}
                    </div>
                    <div className="flex gap-2">
                       <Button 
                        onClick={handleCopyEmail}
                        className="h-16 w-16 rounded-2xl bg-primary shadow-xl shadow-primary/20 shrink-0"
                      >
                        {isCopied ? <CheckCircle2 className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                      </Button>
                      <Button asChild variant="outline" className="h-16 px-8 rounded-2xl border-white/10 bg-white/5 uppercase text-[10px] font-black tracking-widest">
                        <a href={`mailto:${email}`}><ExternalLink className="w-4 h-4 mr-2" /> Open Mail</a>
                      </Button>
                    </div>
                  </div>
               </div>
            </Card>

            <Card className="lg:col-span-5 glass-card p-10 sm:p-16 rounded-[4rem] border-white/10 flex flex-col items-center justify-center text-center gap-8 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] transition-all group-hover:bg-primary/10" />
               <div className="w-20 h-20 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary shadow-xl ring-1 ring-primary/20 relative z-10 transition-transform group-hover:scale-110">
                  <Coffee className="w-10 h-10" />
               </div>
               <div className="space-y-3 relative z-10">
                  <h3 className="text-3xl font-headline font-black text-foreground uppercase tracking-tight">Fuel the Studio</h3>
                  <p className="text-xs text-foreground/40 font-medium uppercase leading-relaxed tracking-tighter">
                    Donations directly support server costs and the production of new free tools. Strictly optional, always appreciated.
                  </p>
               </div>
               <Button asChild className="w-full h-16 rounded-2xl bg-primary text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl shadow-primary/30 relative z-10 active:scale-95">
                  <Link href="/donate">Buy me a coffee</Link>
               </Button>
            </Card>
         </div>
      </section>

      <div className="mt-32 text-center opacity-10 flex flex-col items-center gap-4">
         <Heart className="w-10 h-10" />
         <p className="text-[9px] font-black uppercase tracking-[0.5em]">Dedicated to high-fidelity digital production.</p>
      </div>
    </div>
  );
}
