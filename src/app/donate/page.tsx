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
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="container mx-auto px-6 py-12 md:py-20 max-w-5xl">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest mb-4">
            <Coffee className="w-3.5 h-3.5" /> Support Studio
          </div>
          <h1 className="text-3xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight">
            Buy Me <span className="text-primary italic">a Coffee</span>
          </h1>
          <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
            Fuel the tools. I’ll convert it to caffeine (and server bills). Your contributions keep MY KIT TOOL free, private, and permanent.
          </p>
        </div>
        <div className="shrink-0 pb-2">
           <GetHelp toolId="donate" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Pakistan Protocol */}
        <div className="space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <Smartphone className="w-6 h-6" />
                </div>
                Pakistan Protocol
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
              <div className="space-y-6">
                <div className="space-y-3">
                   <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Easypaisa / JazzCash</Label>
                   <div className="flex gap-2">
                      <div className="flex-1 h-14 bg-secondary border border-border rounded-2xl flex items-center px-6 font-mono text-lg font-bold text-foreground overflow-hidden">
                        03194259023
                      </div>
                      <Button 
                        onClick={() => handleCopy('03194259023', 'easypaisa')}
                        className="h-14 w-14 rounded-2xl bg-primary shadow-lg shadow-primary/20 shrink-0"
                      >
                        {isCopied === 'easypaisa' ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      </Button>
                   </div>
                </div>

                <div className="space-y-3">
                   <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Bank RAAST / IBAN</Label>
                   <div className="flex gap-2">
                      <div className="flex-1 h-14 bg-secondary border border-border rounded-2xl flex items-center px-6 font-mono text-xs font-bold text-foreground overflow-hidden">
                        PK26MEZN0000300112583758
                      </div>
                      <Button 
                        onClick={() => handleCopy('PK26MEZN0000300112583758', 'iban')}
                        className="h-14 w-14 rounded-2xl bg-primary shadow-lg shadow-primary/20 shrink-0"
                      >
                        {isCopied === 'iban' ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      </Button>
                   </div>
                </div>
              </div>

              <div className="p-6 rounded-[2rem] bg-secondary border border-border flex items-start gap-4">
                 <Building2 className="w-5 h-5 text-primary mt-1 shrink-0" />
                 <p className="text-[11px] text-foreground/50 leading-relaxed font-medium uppercase">
                   JazzCash, Easypaisa, or any RAAST-enabled bank transfer is supported.
                 </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* International Matrix */}
        <div className="space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <Wallet className="w-6 h-6" />
                </div>
                International Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
              <div className="space-y-4">
                 <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Binance USDT (TRC20)</Label>
                 <div className="p-6 bg-secondary/50 border border-border rounded-[2rem] space-y-6">
                    <div className="flex flex-col items-center gap-6">
                       {/* Simple placeholder QR style visual for context */}
                       <div className="w-32 h-32 rounded-2xl bg-white p-2 shadow-inner">
                          <div className="w-full h-full bg-black/5 flex items-center justify-center rounded-lg">
                             <Zap className="w-10 h-10 text-primary/20" />
                          </div>
                       </div>
                       <div className="w-full text-center space-y-4">
                          <code className="block p-4 rounded-xl bg-background border border-border text-[10px] font-mono font-bold text-foreground break-all select-all">
                             TDhUm3utKqQ4sE974RCRefAFpdNAVGcLtQ
                          </code>
                          <Button 
                            onClick={() => handleCopy('TDhUm3utKqQ4sE974RCRefAFpdNAVGcLtQ', 'usdt')}
                            className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px]"
                          >
                             {isCopied === 'usdt' ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                             Copy USDT Address
                          </Button>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="p-6 rounded-[2rem] bg-destructive/5 border border-destructive/20 flex items-start gap-4">
                 <ShieldAlert className="w-5 h-5 text-destructive mt-1 shrink-0" />
                 <p className="text-[10px] text-destructive/60 leading-relaxed font-bold uppercase tracking-tight">
                   WARNING: SEND ONLY USDT ON THE TRC20 NETWORK. TRANSFER TO INCORRECT NETWORK PROTOCOLS WILL RESULT IN PERMANENT ASSET LOSS.
                 </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-16 text-center animate-reveal stagger-3">
         <div className="p-10 rounded-[3rem] glass-card border-border flex flex-col items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
               <Heart className="w-8 h-8 fill-current" />
            </div>
            <div className="space-y-2">
               <h3 className="text-xl font-headline font-black text-foreground uppercase tracking-tight">Thank You for Supporting Local Dev</h3>
               <p className="text-sm text-foreground/40 font-medium max-w-xl mx-auto">
                 Every contribution directly supports server costs and the development of new high-fidelity production units.
               </p>
            </div>
            <div className="flex items-center gap-4">
               <div className="px-4 py-1.5 rounded-full bg-secondary border border-border text-[8px] font-black uppercase tracking-widest text-foreground/40">Zero Spam</div>
               <div className="px-4 py-1.5 rounded-full bg-secondary border border-border text-[8px] font-black uppercase tracking-widest text-foreground/40">100% Hardware Native</div>
            </div>
         </div>
      </div>
    </div>
  );
}
