"use client"

import React, { useState } from 'react';
import { 
  Coffee, 
  Copy, 
  CheckCircle2, 
  Info, 
  Smartphone, 
  Building2, 
  Wallet, 
  ShieldAlert, 
  Heart,
  Zap,
  QrCode,
  Globe,
  Coins,
  BadgeCheck,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
    <div className="container mx-auto px-6 py-12 md:py-20 max-w-6xl">
      {/* Hero Section */}
      <div className="mb-16 animate-reveal text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-primary/10 border border-primary/20 text-primary mb-8 shadow-2xl shadow-primary/20">
          <Coffee className="w-10 h-10 icon-3d" />
        </div>
        <h1 className="text-4xl md:text-7xl font-headline font-black text-foreground uppercase tracking-tight mb-4">
          Buy Me <span className="text-primary italic">a Coffee</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-lg font-medium max-w-2xl mx-auto leading-relaxed uppercase tracking-widest">
          Support My Kit Tool — Regional & Worldwide Protocols
        </p>
        <div className="mt-8 flex justify-center">
          <GetHelp toolId="donate" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
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
                Local Transfer
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="pt-10 space-y-10 flex-1">
            <div className="space-y-8">
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

            <div className="space-y-4 pt-4">
               <Label className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-1">Suggested Tiers</Label>
               <div className="flex flex-wrap gap-2">
                  {['Rs 100', 'Rs 500', 'Rs 1000'].map((tier) => (
                    <div key={tier} className="px-4 py-2 rounded-xl bg-secondary/50 border border-border text-[10px] font-black text-foreground/40 uppercase tracking-widest cursor-default group-hover:border-primary/10 transition-all">
                       {tier}
                    </div>
                  ))}
               </div>
            </div>

            <div className="mt-auto p-6 rounded-[2rem] bg-secondary/50 border border-border flex items-start gap-4">
               <Building2 className="w-5 h-5 text-primary mt-1 shrink-0" />
               <p className="text-[11px] text-foreground/50 leading-relaxed font-medium uppercase">
                 All local banks supported via RAAST. Direct transfers are processed manually within the banking network.
               </p>
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
          
          <CardContent className="pt-10 space-y-10 flex-1">
            <div className="space-y-8 flex-1">
               <div className="flex flex-col items-center gap-8">
                  {/* High-Fidelity QR Visual */}
                  <div className="relative group/qr">
                     <div className="absolute -inset-4 bg-primary/10 blur-2xl rounded-full opacity-0 group-hover/qr:opacity-100 transition-opacity duration-700" />
                     <div className="w-48 h-48 rounded-[2.5rem] bg-white p-3 shadow-2xl ring-1 ring-black/5 relative z-10">
                        <div className="w-full h-full bg-black/5 rounded-[1.5rem] flex items-center justify-center relative overflow-hidden border border-black/5">
                           <QrCode className="w-20 h-20 text-black/10" />
                           <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                           <div className="absolute bottom-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-white text-[7px] font-black uppercase tracking-widest">
                              <Coins className="w-2.5 h-2.5" /> TRC20 Only
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="w-full space-y-4">
                     <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Binance / Crypto Wallet</Label>
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
               <p className="text-[10px] text-red-500/70 leading-relaxed font-black uppercase tracking-tight">
                 Warning: SEND ONLY USDT ON THE TRC20 NETWORK. TRANSFER TO INCORRECT NETWORK PROTOCOLS WILL RESULT IN PERMANENT ASSET LOSS.
               </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Thank You Note */}
      <div className="mt-20 text-center animate-reveal stagger-3">
         <div className="p-12 rounded-[3.5rem] glass-card border-border flex flex-col items-center gap-8 relative overflow-hidden">
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
               <h3 className="text-2xl md:text-3xl font-headline font-black text-foreground uppercase tracking-tight leading-none">Thank You for Fueling the Engine</h3>
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
