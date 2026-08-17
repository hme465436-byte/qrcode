"use client"

import React, { useState } from 'react';
import { 
  Coffee, 
  Copy, 
  CheckCircle2, 
  Info, 
  Smartphone, 
  Building2, 
  ShieldAlert, 
  Heart,
  Zap,
  QrCode,
  Globe,
  Coins,
  BadgeCheck,
  Star,
  EyeOff,
  HandHeart,
  MessageCircle,
  HelpCircle,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

export default function DonatePage() {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(label);
    toast({ 
      title: "Protocol Copied", 
      description: "Identity saved. Thank you for fueling the studio!" 
    });
    setTimeout(() => setIsCopied(null), 2000);
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-24 max-w-6xl">
      {/* Hero Section */}
      <div className="mb-20 animate-reveal text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2.5rem] bg-primary/10 border border-primary/20 text-primary mb-8 shadow-2xl shadow-primary/20">
          <Coffee className="w-10 h-10 icon-3d" />
        </div>
        <h1 className="text-4xl md:text-7xl font-headline font-black text-foreground uppercase tracking-tight mb-4">
          Buy Me <span className="text-primary italic">a Coffee</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-lg font-medium max-w-2xl mx-auto leading-relaxed uppercase tracking-widest">
          Support My Kit Tool — Regional & Worldwide Protocols
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <GetHelp toolId="donate" />
        </div>
      </div>

      {/* 1. Why Donate - Visual Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24 animate-reveal stagger-1">
        {[
          { icon: Heart, title: "100% Free", desc: "No subscriptions or hidden fees." },
          { icon: EyeOff, title: "No Forced Ads", desc: "A clean, clinical focus on your work." },
          { icon: Zap, title: "Local Tech", desc: "Tools run in your browser memory." },
          { icon: HandHeart, title: "Optional", desc: "Never required to use any studio unit." }
        ].map((item, i) => (
          <div key={i} className="glass-card p-6 rounded-3xl border-white/5 flex flex-col items-center text-center gap-4 group hover:border-primary/20 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary/40 group-hover:text-primary transition-all">
               <item.icon className="w-6 h-6" />
            </div>
            <div className="space-y-1">
               <h4 className="text-[11px] font-black uppercase text-foreground tracking-widest">{item.title}</h4>
               <p className="text-[10px] text-foreground/40 font-medium uppercase leading-tight">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 2. How to Pay - Main Cards */}
      <div className="mb-8 flex items-center gap-4 px-2">
         <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <Smartphone className="w-5 h-5" />
         </div>
         <div className="space-y-0.5">
            <h3 className="text-xl font-headline font-black text-foreground uppercase tracking-tight">Manual Transfer Protocols</h3>
            <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">Select your regional matrix</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mb-24 animate-reveal stagger-2">
        {/* Card 1: Pakistan */}
        <Card className="glass-card border-border shadow-2xl overflow-hidden relative group hover:-translate-y-2 transition-all duration-500 flex flex-col h-full">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          
          <CardHeader className="pb-8 border-b border-border bg-secondary/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner">
                  <Smartphone className="w-6 h-6" />
                </div>
                Pakistan Protocol
              </CardTitle>
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                Local Matrix
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="pt-10 space-y-10 flex-1 flex flex-col">
            <div className="space-y-8 flex-1">
              <p className="text-[11px] text-foreground/40 font-bold uppercase leading-relaxed tracking-wider border-l-2 border-primary/20 pl-4">
                Execute a manual transfer for any amount. No account setup or site login is required for this contribution.
              </p>

              <div className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Easypaisa / JazzCash</Label>
                <div className="flex gap-2 group/field">
                  <div className="flex-1 h-16 bg-secondary border border-border rounded-2xl flex items-center px-6 font-mono text-xl font-bold text-foreground overflow-hidden group-hover/field:border-primary/20 transition-colors">
                    03194259023
                  </div>
                  <Button 
                    onClick={() => handleCopy('03194259023', 'easypaisa')}
                    className="h-16 w-16 rounded-2xl bg-primary shadow-xl shadow-primary/20 shrink-0"
                  >
                    {isCopied === 'easypaisa' ? <CheckCircle2 className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">RAAST IBAN Matrix</Label>
                <div className="flex gap-2 group/field">
                  <div className="flex-1 h-16 bg-secondary border border-border rounded-2xl flex items-center px-6 font-mono text-[11px] sm:text-sm font-bold text-foreground overflow-hidden group-hover/field:border-primary/20 transition-colors">
                    PK26MEZN0000300112583758
                  </div>
                  <Button 
                    onClick={() => handleCopy('PK26MEZN0000300112583758', 'iban')}
                    className="h-16 w-16 rounded-2xl bg-primary shadow-xl shadow-primary/20 shrink-0"
                  >
                    {isCopied === 'iban' ? <CheckCircle2 className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-8 border-t border-white/5">
               <Label className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-1">Friendly Tiers</Label>
               <div className="flex flex-wrap gap-2">
                  {['Rs 100', 'Rs 500', 'Rs 1000'].map((tier) => (
                    <div key={tier} className="px-4 py-2 rounded-xl bg-secondary/50 border border-border text-[10px] font-black text-foreground/40 uppercase tracking-widest cursor-default">
                       {tier}
                    </div>
                  ))}
               </div>
               <p className="text-[9px] text-foreground/20 font-bold uppercase">Any amount fuels the caffeine engine.</p>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Worldwide */}
        <Card className="glass-card border-border shadow-2xl overflow-hidden relative group hover:-translate-y-2 transition-all duration-500 flex flex-col h-full">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          
          <CardHeader className="pb-8 border-b border-border bg-secondary/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner">
                  <Globe className="w-6 h-6" />
                </div>
                Worldwide Protocol
              </CardTitle>
              <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                USDT TRC20
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="pt-10 space-y-10 flex-1 flex flex-col">
            <div className="space-y-8 flex-1">
               <div className="flex flex-col items-center gap-8">
                  <div className="relative group/qr">
                     <div className="absolute -inset-4 bg-primary/10 blur-2xl rounded-full opacity-0 group-hover/qr:opacity-100 transition-opacity duration-700" />
                     <div className="w-48 h-48 rounded-[2.5rem] bg-white p-3 shadow-2xl ring-1 ring-black/5 relative z-10">
                        <div className="w-full h-full bg-black/5 rounded-[1.5rem] flex items-center justify-center relative overflow-hidden border border-black/5">
                           <QrCode className="w-20 h-20 text-black/10" />
                           <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                           <div className="absolute bottom-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-white text-[7px] font-black uppercase tracking-widest">
                              <Coins className="w-2.5 h-2.5" /> TRC20 Network Only
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="w-full space-y-4">
                     <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Binance / Crypto Address</Label>
                     <div className="flex gap-2 group/field">
                        <div className="flex-1 h-16 bg-secondary border border-border rounded-2xl flex items-center px-6 font-mono text-[9px] sm:text-xs font-bold text-foreground overflow-hidden break-all group-hover/field:border-primary/20 transition-colors">
                           TDhUm3utKqQ4sE974RCRefAFpdNAVGcLtQ
                        </div>
                        <Button 
                          onClick={() => handleCopy('TDhUm3utKqQ4sE974RCRefAFpdNAVGcLtQ', 'usdt')}
                          className="h-16 w-16 rounded-2xl bg-primary shadow-xl shadow-primary/20 shrink-0"
                        >
                          {isCopied === 'usdt' ? <CheckCircle2 className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                        </Button>
                     </div>
                  </div>
               </div>
            </div>

            <div className="p-6 rounded-[2.5rem] bg-red-500/5 border border-red-500/10 flex items-start gap-4">
               <ShieldAlert className="w-5 h-5 text-red-500 mt-1 shrink-0" />
               <div className="space-y-1">
                  <p className="text-[10px] text-red-500/70 leading-relaxed font-black uppercase tracking-tight">
                    Security protocol alert
                  </p>
                  <p className="text-[9px] text-red-500/40 font-bold uppercase leading-relaxed">
                    Verify the network is TRC20. Incorrect network protocols will result in permanent asset loss.
                  </p>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. After You Send & 4. FAQ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-32 animate-reveal stagger-3">
         <div className="space-y-8">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary border border-border">
                  <BadgeCheck className="w-5 h-5" />
               </div>
               <h3 className="text-xl font-headline font-black text-foreground uppercase tracking-tight">After You Contribute</h3>
            </div>
            <div className="glass-card p-8 rounded-[2.5rem] border-white/5 space-y-6">
               <p className="text-sm text-foreground/60 leading-relaxed font-medium">
                  Since MY KIT TOOL is a privacy-first studio, we do not have an automated "user account" or tracking system.
               </p>
               <ul className="space-y-4">
                  {[
                    "No automated thank-you emails will be generated.",
                    "The studio stays 100% free for you and everyone else.",
                    "Your personal identity is not logged or required.",
                    "Contact via social/email is optional and not necessary."
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-3">
                       <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                       <span className="text-[11px] font-bold text-foreground/40 uppercase tracking-widest leading-tight">{text}</span>
                    </li>
                  ))}
               </ul>
            </div>
         </div>

         <div className="space-y-8">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary border border-border">
                  <HelpCircle className="w-5 h-5" />
               </div>
               <h3 className="text-xl font-headline font-black text-foreground uppercase tracking-tight">Contribution FAQ</h3>
            </div>
            <div className="glass-card p-4 rounded-[2.5rem] border-white/5">
               <Accordion type="single" collapsible className="w-full">
                 {[
                   { q: "Is donation mandatory?", a: "No. All tools are 100% free to use regardless of contribution." },
                   { q: "Is there a minimum amount?", a: "None. Any contribution is viewed as a supportive fuel for the studio engine." },
                   { q: "Do I get extra features?", a: "No. Every user has full access to the professional suite by default." },
                   { q: "Is payment automatic?", a: "No. You must perform a manual transfer using the provided protocols." }
                 ].map((item, i) => (
                   <AccordionItem key={i} value={`item-${i}`} className="border-b border-white/5 px-4 last:border-0">
                     <AccordionTrigger className="text-[10px] font-black uppercase tracking-[0.15em] text-foreground/60 hover:text-primary hover:no-underline py-5">
                       {item.q}
                     </AccordionTrigger>
                     <AccordionContent className="text-[11px] font-medium text-foreground/40 leading-relaxed uppercase pb-6 pl-2">
                       {item.a}
                     </AccordionContent>
                   </AccordionItem>
                 ))}
               </Accordion>
            </div>
         </div>
      </div>

      {/* Final Thank You */}
      <div className="text-center animate-reveal stagger-4">
         <div className="p-12 rounded-[3.5rem] glass-card border-border flex flex-col items-center gap-8 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_70%)]" />
            
            <div className="flex gap-4">
               <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-xl ring-1 ring-primary/20">
                  <Heart className="w-6 h-6 fill-current" />
               </div>
               <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-xl ring-1 ring-primary/20">
                  <Star className="w-6 h-6 fill-current" />
               </div>
               <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-xl ring-1 ring-primary/20">
                  <BadgeCheck className="w-6 h-6 fill-current" />
               </div>
            </div>

            <div className="space-y-3 relative z-10">
               <h3 className="text-2xl md:text-3xl font-headline font-black text-foreground uppercase tracking-tight leading-none">Thank You for Supporting the Studio</h3>
               <p className="text-sm text-foreground/40 font-medium max-w-xl mx-auto leading-relaxed">
                 Every contribution directly supports server costs and the development of new high-fidelity production units. Your support keeps the studio free for everyone.
               </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
               <div className="px-5 py-2 rounded-full bg-secondary border border-border text-[8px] font-black uppercase tracking-[0.3em] text-foreground/30">Studio Standard v7.2</div>
               <div className="px-5 py-2 rounded-full bg-secondary border border-border text-[8px] font-black uppercase tracking-[0.3em] text-foreground/30">Verified Secure</div>
               <div className="px-5 py-2 rounded-full bg-secondary border border-border text-[8px] font-black uppercase tracking-[0.3em] text-foreground/30">100% Client-Side</div>
            </div>
         </div>
      </div>
    </div>
  );
}
