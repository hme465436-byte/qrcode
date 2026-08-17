"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  User, 
  Mail, 
  Copy, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Heart, 
  Coffee,
  ExternalLink,
  History,
  ArrowRight,
  LayoutGrid,
  Book,
  Terminal,
  Activity,
  Code2,
  Table,
  QrCode,
  Smartphone,
  Box,
  Gamepad2
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
      {/* Premium Hero Section */}
      <section className="relative pt-32 pb-40 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15)_0%,transparent_70%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-5 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        
        <div className="container mx-auto px-6 relative z-10 text-center space-y-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-[0.3em] animate-reveal">
            <User className="w-3.5 h-3.5" /> Identity Matrix
          </div>
          
          <div className="space-y-6 animate-reveal stagger-1">
            <h1 className="text-6xl md:text-9xl font-headline font-black text-foreground uppercase tracking-tighter leading-[0.85]">
              Umar <span className="text-primary italic">Farooq</span>
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />
            <p className="text-xl md:text-3xl font-black text-foreground/40 uppercase tracking-[0.2em] max-w-3xl mx-auto">
              Builder of free browser tools
            </p>
          </div>

          <p className="text-lg md:text-xl text-foreground/50 max-w-3xl mx-auto leading-relaxed font-medium animate-reveal stagger-2 uppercase tracking-tighter">
            I build small digital products to make daily work easier — even if they never go viral. My mission is to provide high-fidelity utilities that respect user privacy and operate with zero friction.
          </p>

          <div className="flex flex-wrap justify-center gap-6 animate-reveal stagger-3">
            <Button asChild className="h-16 px-10 rounded-2xl bg-primary text-white shadow-2xl shadow-primary/30 active:scale-95 transition-all">
               <a href={`mailto:${email}`}><Mail className="w-4 h-4 mr-3" /> Email Support</a>
            </Button>
            <Button asChild variant="outline" className="h-16 px-10 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 transition-all">
               <Link href="/donate"><Coffee className="w-4 h-4 mr-3 text-primary" /> Buy me a coffee</Link>
            </Button>
            <Button asChild variant="ghost" className="h-16 px-10 rounded-2xl text-foreground/40 hover:text-primary transition-all">
               <Link href="/">Explore tools <ArrowRight className="w-4 h-4 ml-3" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Metrics Row - Recalibrated Grid */}
      <section className="container mx-auto px-6 -mt-20 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Studio Units', val: '60+', icon: LayoutGrid },
            { label: 'Other Projects', val: '6', icon: Zap },
            { label: 'Local Engine', val: '100%', icon: ShieldCheck },
            { label: 'Access Protocol', val: 'Free', icon: Heart },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-10 rounded-[3rem] border-white/10 flex flex-col items-center text-center gap-5 hover:border-primary/40 transition-all duration-700 animate-in slide-in-from-bottom-6 group">
               <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-primary/40 group-hover:text-primary group-hover:scale-110 transition-all shadow-xl border border-white/5">
                  <stat.icon className="w-7 h-7" />
               </div>
               <div className="space-y-1">
                  <p className="text-4xl font-headline font-black text-foreground leading-none">{stat.val}</p>
                  <p className="text-[11px] font-black uppercase text-foreground/20 tracking-[0.2em]">{stat.label}</p>
               </div>
            </div>
          ))}
        </div>
      </section>

      {/* Story Section */}
      <section className="container mx-auto px-6 pt-40 space-y-20">
         <div className="text-center space-y-4">
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">The Production Story</p>
            <h2 className="text-4xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight">Timeline <span className="text-primary italic">Matrix</span></h2>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { title: 'The Spark', desc: 'I began by building browser-native scripts so people wouldn’t need to install heavy software for simple daily tasks. One tool led to another as I saw the need for accessible efficiency.' },
              { title: 'The Daily Matrix', desc: 'Focusing on the things we do every day—merging a PDF, generating a branded QR, or cleaning data. Every unit is built with a 100% privacy-first philosophy.' },
              { title: 'The Studio Hub', desc: 'My Kit Tool is the culmination of these efforts. A central hub where 60+ free utilities live together in a high-fidelity, secure production environment.' },
            ].map((card, i) => (
              <Card key={i} className="glass-card p-12 rounded-[4rem] border-white/5 hover:border-primary/20 transition-all group relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                 <span className="text-5xl font-headline font-black text-primary/10 group-hover:text-primary/30 transition-colors mb-8 block">0{i+1}</span>
                 <h3 className="text-2xl font-headline font-black text-foreground uppercase mb-6 tracking-tight">{card.title}</h3>
                 <p className="text-sm text-foreground/40 leading-relaxed font-medium uppercase tracking-tighter">{card.desc}</p>
              </Card>
            ))}
         </div>
      </section>

      {/* Philosophy Section */}
      <section className="container mx-auto px-6 pt-40">
         <div className="glass-card p-12 md:p-24 rounded-[5rem] border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] transition-all group-hover:bg-primary/10" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center relative z-10">
               <div className="space-y-10">
                  <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                    <ShieldCheck className="w-4 h-4" /> Verified Secure
                  </div>
                  <h2 className="text-5xl md:text-7xl font-headline font-black text-foreground uppercase tracking-tighter leading-[0.9]">Definitive <span className="text-primary italic">Privacy</span> Protocol</h2>
                  <p className="text-xl text-foreground/50 font-medium leading-relaxed uppercase tracking-tighter">
                    I believe that your technical data belongs strictly on your hardware. Most logic in My Kit Tool runs entirely in your device memory—no tracking, no signups, and zero data leakage.
                  </p>
               </div>
               <div className="grid grid-cols-1 gap-8">
                  {[
                    { icon: ShieldCheck, title: 'Privacy Sovereignty', desc: 'No tracking or server storage. Your assets stay local.' },
                    { icon: Zap, title: 'Hardware Speed', desc: 'Fast, mobile-friendly units optimized for instant work.' },
                    { icon: Book, title: 'Pro Documentation', desc: 'Help guides and technical specs on every single tool.' },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-8 items-start group/item">
                       <div className="w-16 h-16 rounded-[1.5rem] bg-secondary flex items-center justify-center text-primary shrink-0 transition-all group-hover/item:scale-110 shadow-2xl border border-white/5">
                          <item.icon className="w-7 h-7" />
                       </div>
                       <div className="space-y-2">
                          <h4 className="text-lg font-black uppercase text-foreground tracking-widest leading-none">{item.title}</h4>
                          <p className="text-sm text-foreground/40 font-medium leading-relaxed uppercase tracking-tighter">{item.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* Projects Grid */}
      <section className="container mx-auto px-6 pt-40 space-y-20">
        <div className="text-center space-y-4">
           <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.5em]">Linguistic Portfolio</p>
           <h2 className="text-4xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight">Other <span className="text-primary italic">Projects</span></h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
           {PROJECTS.map((project, i) => (
             <div key={i} className="glass-card p-12 rounded-[4rem] border-white/5 hover:bg-secondary/30 hover:border-primary/30 hover:-translate-y-2 transition-all duration-500 group flex flex-col h-full">
                <div className={cn("w-16 h-16 rounded-[1.75rem] flex items-center justify-center mb-12 border border-white/5 shadow-2xl transition-transform group-hover:scale-110 group-hover:rotate-6", project.color)}>
                   <project.icon className="w-8 h-8" />
                </div>
                <div className="space-y-4 mb-12 flex-1">
                   <h3 className="text-3xl font-headline font-black text-foreground uppercase tracking-tight">{project.name}</h3>
                   <p className="text-base text-foreground/40 font-medium leading-relaxed uppercase tracking-tighter">{project.desc}</p>
                </div>
                <Button asChild variant="outline" className="w-full h-16 rounded-2xl border-white/10 bg-white/2 hover:bg-primary hover:text-white hover:border-primary transition-all uppercase text-[11px] font-black tracking-widest shadow-lg">
                   <a href={project.url} target="_blank" rel="noopener noreferrer">
                      Visit Studio <ExternalLink className="w-4 h-4 ml-3 opacity-40" />
                   </a>
                </Button>
             </div>
           ))}
        </div>
      </section>

      {/* Support Section - Recalibrated Equal Cards */}
      <section className="container mx-auto px-6 pt-40">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
            <Card className="glass-card p-12 sm:p-20 rounded-[5rem] border-white/10 flex flex-col justify-center gap-12 relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] transition-all group-hover:bg-primary/10" />
               <div className="space-y-6 relative z-10">
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Uplink Matrix</p>
                  <h3 className="text-4xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tighter leading-[0.9]">Support & <span className="text-primary italic">Feedback</span></h3>
                  <p className="text-base md:text-lg text-foreground/40 font-medium uppercase tracking-tighter leading-relaxed">
                    Technical issue or project request? Reach out directly to my linguistic uplink. I typically respond within 24 hours.
                  </p>
               </div>

               <div className="space-y-6 relative z-10">
                  <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-2">Secure Email Protocol</Label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 h-20 bg-secondary border border-border rounded-3xl flex items-center px-8 font-mono text-sm font-bold text-foreground overflow-hidden shadow-inner group-hover:border-primary/20 transition-colors">
                      {email}
                    </div>
                    <div className="flex gap-3">
                       <Button 
                        onClick={handleCopyEmail}
                        className="h-20 w-20 rounded-3xl bg-primary shadow-2xl shadow-primary/30 shrink-0 active:scale-90 transition-all"
                      >
                        {isCopied ? <CheckCircle2 className="w-8 h-8" /> : <Copy className="w-8 h-8" />}
                      </Button>
                      <Button asChild variant="outline" className="h-20 px-10 rounded-3xl border-white/10 bg-white/5 uppercase text-[11px] font-black tracking-widest active:scale-95 transition-all">
                        <a href={`mailto:${email}`}><ExternalLink className="w-4 h-4 mr-3" /> Open Mail</a>
                      </Button>
                    </div>
                  </div>
               </div>
            </Card>

            <Card className="glass-card p-12 sm:p-20 rounded-[5rem] border-white/10 flex flex-col items-center justify-center text-center gap-10 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] transition-all group-hover:bg-primary/10" />
               <div className="w-24 h-24 rounded-[2.25rem] bg-primary/10 flex items-center justify-center text-primary shadow-2xl ring-1 ring-primary/20 relative z-10 transition-all group-hover:scale-110 group-hover:rotate-6">
                  <Coffee className="w-12 h-12" />
               </div>
               <div className="space-y-4 relative z-10">
                  <h3 className="text-4xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight leading-none">Fuel the <span className="text-primary italic">Studio</span></h3>
                  <p className="text-sm text-foreground/40 font-medium uppercase leading-relaxed tracking-widest max-w-md mx-auto">
                    Donations directly support server costs and the production of new free tools. Strictly optional, always appreciated.
                  </p>
               </div>
               <Button asChild className="w-full max-w-sm h-20 rounded-3xl bg-primary text-white font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-primary/40 relative z-10 active:scale-95 transition-all">
                  <Link href="/donate">Buy me a coffee</Link>
               </Button>
            </Card>
         </div>
      </section>

      <div className="mt-40 text-center opacity-10 flex flex-col items-center gap-6">
         <Heart className="w-12 h-12 text-primary" />
         <p className="text-[10px] font-black uppercase tracking-[0.6em] text-foreground">Dedicated to high-fidelity digital production.</p>
      </div>
    </div>
  );
}
