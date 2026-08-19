"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  RefreshCcw, 
  Copy, 
  Trash2, 
  CheckCircle2, 
  Info,
  Zap,
  Activity,
  MessageSquare,
  ShieldCheck,
  Globe,
  Loader2,
  AlertCircle,
  Quote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

export default function AdvicePage() {
  const { toast } = useToast();
  const [advice, setAdvice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const fetchAdvice = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://api.adviceslip.com/advice?t=${Date.now()}`);
      if (!response.ok) throw new Error("Acoustic uplink failed.");
      
      const data = await response.json();
      if (data.slip?.advice) {
        setAdvice(data.slip.advice);
        toast({ title: "Signal Isolated", description: "Linguistic wisdom synthesized." });
      } else {
        throw new Error("Malformed data matrix.");
      }
    } catch (err) {
      setError("Matrix Retrieval Failure: The wisdom registry nodes are unreachable.");
      toast({ variant: "destructive", title: "Protocol Failed" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAdvice();
  }, [fetchAdvice]);

  const handleCopy = () => {
    if (advice) {
      navigator.clipboard.writeText(advice);
      setIsCopied(true);
      toast({ title: "Copied", description: "Wisdom saved to clipboard." });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Sparkles className="w-3.5 h-3.5" /> Linguistic Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
                Advice <span className="text-primary italic">Studio Pro</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional high-fidelity wisdom synthesis. Extract unique linguistic guidance from the global advice matrix with zero-latency visual feedback.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="advice-generator" />
              {(advice || error) && (
                <Button variant="outline" size="sm" onClick={fetchAdvice} disabled={isLoading} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-primary transition-all">
                  <RefreshCcw className={cn("w-3.5 h-3.5 mr-2", isLoading && "animate-spin")} /> New Advice
                </Button>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Results Panel - Main */}
        <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-left-6 duration-1000">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[400px] bg-black/10">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <Activity className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Linguistic Matrix</CardTitle>
                 </div>
              </CardHeader>
              
              <CardContent className="flex-1 p-8 sm:p-16 flex flex-col items-center justify-center relative overflow-hidden">
                 {!advice && !isLoading && !error && (
                   <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-6 py-20">
                      <Globe className="w-24 h-24 text-primary" />
                      <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Discovery Signal</p>
                   </div>
                 )}

                 {isLoading && (
                   <div className="flex-1 flex flex-col items-center justify-center space-y-10 py-20">
                      <div className="relative">
                         <div className="w-28 h-28 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                         <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                      </div>
                      <p className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">Decoding Wisdom Stream...</p>
                   </div>
                 )}

                 {error && !isLoading && (
                   <div className="flex flex-col items-center gap-8 py-20 text-center animate-in shake duration-500">
                      <AlertCircle className="w-16 h-16 text-destructive animate-bounce" />
                      <div className="space-y-2">
                         <h3 className="text-xl font-headline font-black text-destructive uppercase">Reference Failure</h3>
                         <p className="text-[11px] text-foreground/40 font-bold uppercase max-w-sm mx-auto leading-relaxed">{error}</p>
                      </div>
                      <Button onClick={fetchAdvice} variant="outline" className="h-12 bg-secondary border border-border text-foreground font-black rounded-xl text-[9px] uppercase tracking-widest">Restart Protocol</Button>
                   </div>
                 )}

                 {advice && !isLoading && (
                   <div className="w-full space-y-12 animate-in zoom-in-95 duration-500">
                      <div className="text-center space-y-12">
                         <div className="relative p-10 sm:p-16 rounded-[3rem] bg-white/5 border border-white/5 shadow-2xl overflow-hidden group">
                            <Quote className="absolute -top-4 -left-4 w-32 h-32 text-primary/5 -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
                            <h2 className="text-3xl sm:text-5xl md:text-6xl font-headline font-black text-foreground leading-[1.1] tracking-tight text-center relative z-10">
                               "{advice}"
                            </h2>
                            <div className="absolute bottom-6 right-6 opacity-20 pointer-events-none">
                               <Sparkles className="w-12 h-12 text-primary" />
                            </div>
                         </div>

                         <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Button onClick={handleCopy} className="h-16 flex-1 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl hover:bg-white/90 active:scale-95 transition-all">
                               {isCopied ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                               Copy Wisdom
                            </Button>
                            <Button onClick={fetchAdvice} variant="outline" className="h-16 px-10 border-white/10 bg-white/5 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl active:scale-95 transition-all">
                               <RefreshCcw className="w-5 h-5 mr-3" /> New Advice
                            </Button>
                         </div>
                      </div>
                   </div>
                 )}
              </CardContent>
           </Card>
        </div>

        {/* Sidebar - Info */}
        <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-xl">
             <CardHeader className="py-6 border-b border-white/5 bg-white/2">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                   <Settings2 className="w-5 h-5 text-primary" /> Studio Config
                </CardTitle>
             </CardHeader>
             <CardContent className="pt-8 space-y-6">
                <div className="p-6 rounded-[2rem] bg-secondary/50 border border-border flex items-start gap-4">
                   <ShieldCheck className="w-6 h-6 text-primary mt-1 shrink-0" />
                   <div className="space-y-1">
                      <h4 className="text-[11px] font-black text-foreground uppercase tracking-widest">Privacy Sovereign</h4>
                      <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">
                        Advice retrieval is randomized and held strictly in local memory. No history is logged or stored.
                      </p>
                   </div>
                </div>
                <div className="p-6 rounded-[2rem] bg-secondary/50 border border-border flex items-start gap-4">
                   <Activity className="w-6 h-6 text-primary mt-1 shrink-0" />
                   <div className="space-y-1">
                      <h4 className="text-[11px] font-black text-foreground uppercase tracking-widest">Cache Neutral</h4>
                      <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">
                        Protocol uses unique hardware timestamps to ensure every piece of advice is a fresh signal from the registry.
                      </p>
                   </div>
                </div>
             </CardContent>
          </Card>

          <div className="p-8 rounded-[3rem] bg-primary/5 border border-primary/10 flex items-start gap-6 group hover:bg-primary/10 transition-all duration-500">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20 shadow-xl group-hover:scale-110 transition-transform">
               <Zap className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h4 className="text-[13px] font-black text-primary uppercase tracking-widest">Matrix Synthesis</h4>
              <p className="text-[12px] text-foreground/50 leading-relaxed font-medium">
                The studio utilizes high-performance REST protocols to isolate unique guidance slips from the Advice Slip API with zero hardware latency.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
