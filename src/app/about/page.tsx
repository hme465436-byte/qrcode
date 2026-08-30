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
  LayoutGrid,
  Smartphone,
  Box,
  Gamepad2,
  Wand2,
  ArrowRight,
  Shield,
  SmartphoneIcon,
  MessageSquare,
  Sword,
  QrCode
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
  { name: 'Vortex Reach', url: 'https://vortexreach.vercel.app/', desc: 'Social services and marketing panel.', icon: Zap, color: 'text-blue-500 bg-blue-500/10' },
  { name: 'Trade Vission', url: 'https://studio-nu-sandy.vercel.app/', desc: 'Digital creative production studio.', icon: Wand2, color: 'text-indigo-500 bg-indigo-500/10' },
  { name: 'Hisab Flow', url: 'https://hisabflow-coral.vercel.app/login', desc: 'Efficient shop accounts and ledger manager.', icon: LayoutGrid, color: 'text-emerald-500 bg-emerald-500/10' },
  { name: 'WhatsQuality', url: 'https://whatsquality-pearl.vercel.app/', desc: 'High-fidelity WhatsApp DP optimization.', icon: Smartphone, color: 'text-cyan-500 bg-cyan-500/10' },
  { name: 'APK Vault', url: 'https://apkvault.vercel.app/', desc: 'Secure Android application library.', icon: Box, color: 'text-orange-500 bg-orange-500/10' },
  { name: 'LootPro', url: 'https://lootpro.vercel.app/', desc: 'Curated deals and loot project.', icon: Gamepad2, color: 'text-rose-500 bg-rose-500/10' },
  { name: 'Stylish Game Name', url: 'https://stylishgamename.vercel.app/', desc: 'Free stylish names for Free Fire, PUBG, BGMI, CODM, Roblox & Minecraft. Fonts + symbols, copy ready.', icon: Sword, color: 'text-yellow-500 bg-yellow-500/10' },
  { name: 'OMAR CHEAT CODE', url: 'https://omarcheatscode.vercel.app/', desc: 'Advanced gaming optimization and script repository.', icon: Zap, color: 'text-red-500 bg-red-500/10' },
  { name: 'QR CANVAS', url: 'https://qrcode-amber-ten.vercel.app/', desc: 'High-performance artistic QR code generation engine.', icon: QrCode, color: 'text-blue-500 bg-blue-500/10' },
];

export default function AboutPage() {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const email = "ummarfarooq38990@gmail.com";

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setIsCopied(true);
    toast({ title: "Identity Copied", description: "Email saved to clipboard." });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col w-full pb-32 selection:bg-primary/20">
      {/* Sticky Mini-Nav Matrix */}
      <div className="sticky top-16 z-40 w-full flex justify-center pt-6 pointer-events-none">
         <div className="pointer-events-auto glass-card px-6 py-2.5 rounded-full border-white/10 shadow-2xl flex items-center gap-8 backdrop-blur-3xl">
            {['about', 'work', 'contact'].map((item) => (
              <button 
                key={item}
                onClick={() => scrollTo(item)}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 hover:text-primary transition-all"
              >
                {item}
              </button>
            ))}
         </div>
      </div>

      {/* Hero Section */}
      <section id="about" className="container mx-auto px-6 pt-32 pb-40 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-5 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '60px 60px' }} />
        
        <div className="max-w-4xl mx-auto text-center space-y-10 animate-reveal">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-9xl font-headline font-black text-foreground uppercase tracking-tighter leading-none">
              Umar <span className="text-primary italic">Farooq</span>
            </h1>
            <div className="h-1.5 w-24 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto rounded-full" />
            <p className="text-lg md:text-xl font-black text-foreground/40 uppercase tracking-[0.3em]">
              Builder of free browser tools
            </p>
          </div>

          <p className="text-lg md:text-xl text-foreground/50 max-w-2xl mx-auto leading-relaxed font-medium uppercase tracking-tighter">
            I build small digital products to make daily work easier — even if they never go viral. My mission is high-fidelity utilities that respect your privacy and operate with zero friction.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Button onClick={() => scrollTo('contact')} className="h-14 px-8 rounded-xl bg-primary text-white shadow-xl shadow-primary/20 active:scale-95 transition-all">
               Email Support
            </Button>
            <Button asChild variant="outline" className="h-14 px-8 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-all">
               <Link href="/donate">Buy me a coffee</Link>
            </Button>
            <Button asChild variant="ghost" className="h-14 px-8 rounded-xl text-foreground/40 hover:text-primary transition-all">
               <Link href="/">Explore tools <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Metrics Matrix */}
      <section className="container mx-auto px-6 mb-40">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Studio Units', val: '200+', icon: LayoutGrid },
            { label: 'Other Projects', val: '9', icon: Zap },
            { label: 'Hardware Logic', val: '100%', icon: ShieldCheck },
            { label: 'Access', val: 'Free', icon: Heart },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-10 rounded-[2.5rem] border-white/5 flex flex-col items-center text-center gap-4 hover:border-primary/20 transition-all duration-700 animate-in slide-in-from-bottom-6 group">
               <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary/40 group-hover:text-primary transition-all border border-white/5 shadow-xl">
                  <stat.icon className="w-6 h-6" />
               </div>
               <div className="space-y-1">
                  <p className="text-3xl font-headline font-black text-foreground">{stat.val}</p>
                  <p className="text-[10px] font-black uppercase text-foreground/20 tracking-widest">{stat.label}</p>
               </div>
            </div>
          ))}
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="container mx-auto px-6 pb-40 space-y-20">
         <div className="text-center space-y-4">
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">The Production Standard</p>
            <h2 className="text-4xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight">How I <span className="text-primary italic">Help</span></h2>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Wand2, title: 'Free Forever', desc: 'No subscriptions or paywalls. Every unit is open for professional use.' },
              { icon: Shield, title: 'Privacy First', desc: 'Most logic runs entirely on your device. Your data belongs to you.' },
              { icon: SmartphoneIcon, title: 'Zero Friction', desc: 'Fast, mobile-friendly units optimized for instant production work.' },
              { icon: MessageSquare, title: 'Pro Support', desc: 'Clinical documentation and direct email uplink for every project.' },
            ].map((card, i) => (
              <div key={i} className="glass-card p-8 rounded-[2.5rem] border-white/5 space-y-6 group hover:border-primary/20 transition-all">
                 <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform border border-primary/20 shadow-inner">
                    <card.icon className="w-6 h-6" />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-sm font-black uppercase tracking-widest text-foreground">{card.title}</h3>
                    <p className="text-xs text-foreground/40 leading-relaxed font-medium uppercase tracking-tighter">{card.desc}</p>
                 </div>
              </div>
            ))}
         </div>
      </section>

      {/* Projects Grid */}
      <section id="work" className="container mx-auto px-6 pb-40 space-y-20">
        <div className="text-center space-y-4">
           <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em]">The Digital Ecosystem</p>
           <h2 className="text-4xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight">Other <span className="text-primary italic">Projects</span></h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {PROJECTS.map((project, i) => (
             <div key={i} className="glass-card p-10 rounded-[3rem] border-white/5 hover:bg-secondary/30 hover:border-primary/30 hover:-translate-y-2 transition-all duration-500 group flex flex-col h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-10 border border-white/5 shadow-2xl transition-transform group-hover:scale-110 group-hover:rotate-3", project.color)}>
                   <project.icon className="w-7 h-7" />
                </div>
                <div className="space-y-4 mb-10 flex-1">
                   <h3 className="text-2xl font-headline font-black text-foreground uppercase tracking-tight">{project.name}</h3>
                   <p className="text-sm text-foreground/40 font-medium leading-relaxed uppercase tracking-tighter">{project.desc}</p>
                </div>
                <Button asChild variant="outline" className="w-full h-14 rounded-xl border-white/10 bg-white/2 hover:bg-primary hover:text-white hover:border-primary transition-all uppercase text-[10px] font-black tracking-widest">
                   <a href={project.url} target="_blank" rel="noopener noreferrer">
                      Visit Project <ExternalLink className="w-3.5 h-3.5 ml-2 opacity-40" />
                   </a>
                </Button>
             </div>
           ))}
        </div>
      </section>

      {/* Support Hub */}
      <section id="contact" className="container mx-auto px-6 pb-40">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            <Card className="glass-card p-10 sm:p-16 rounded-[3.5rem] border-white/10 flex flex-col justify-center gap-10 relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="space-y-4 relative z-10">
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Uplink Matrix</p>
                  <h3 className="text-4xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tighter leading-[0.9]">Support & <span className="text-primary italic">Feedback</span></h3>
                  <p className="text-sm md:text-base text-foreground/40 font-medium uppercase tracking-tighter leading-relaxed">
                    Technical issue or project request? Reach out directly via the linguistic uplink. I typically respond within 24 hours.
                  </p>
               </div>

               <div className="space-y-4 relative z-10">
                  <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-2">Secure Email Protocol</Label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 h-16 bg-secondary border border-border rounded-2xl flex items-center px-6 font-mono text-xs font-bold text-foreground overflow-hidden shadow-inner group-hover:border-primary/20 transition-colors">
                      {email}
                    </div>
                    <div className="flex gap-2">
                       <Button 
                        onClick={handleCopyEmail}
                        className="h-16 w-16 rounded-2xl bg-primary shadow-xl shadow-primary/20 shrink-0"
                      >
                        {isCopied ? <CheckCircle2 className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                      </Button>
                      <Button asChild variant="outline" className="h-16 px-6 rounded-2xl border-white/10 bg-white/5 uppercase text-[10px] font-black tracking-widest active:scale-95 transition-all">
                        <a href={`mailto:${email}`}><ExternalLink className="w-4 h-4 mr-2" /> Open Mail</a>
                      </Button>
                    </div>
                  </div>
               </div>
            </Card>

            <Card className="glass-card p-10 sm:p-16 rounded-[3.5rem] border-white/10 flex flex-col items-center justify-center text-center gap-10 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="w-20 h-20 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary shadow-2xl ring-1 ring-primary/20 relative z-10 transition-transform group-hover:scale-110">
                  <Coffee className="w-10 h-10" />
               </div>
               <div className="space-y-4 relative z-10">
                  <h3 className="text-4xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight leading-none">Fuel the <span className="text-primary italic">Studio</span></h3>
                  <p className="text-xs text-foreground/40 font-medium uppercase leading-relaxed tracking-widest max-sm mx-auto">
                    Donations directly support server costs and the production of new free tools. Strictly optional, always appreciated.
                  </p>
               </div>
               <Button asChild className="w-full max-w-sm h-16 rounded-2xl bg-primary text-white font-black uppercase text-[11px] tracking-[0.3em] shadow-xl shadow-primary/30 relative z-10 active:scale-95 transition-all">
                  <Link href="/donate">Buy me a coffee</Link>
               </Button>
            </Card>
         </div>
      </section>

      <div className="text-center opacity-10 flex flex-col items-center gap-4">
         <Heart className="w-10 h-10 text-primary" />
         <p className="text-[10px] font-black uppercase tracking-[0.6em] text-foreground">Built by Umar Farooq — My Kit Tool</p>
      </div>
    </div>
  );
}
