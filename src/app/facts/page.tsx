"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Lightbulb, 
  RefreshCcw, 
  Copy, 
  CheckCircle2, 
  Zap, 
  Activity,
  Loader2,
  AlertCircle,
  Quote,
  ShieldCheck,
  Settings2,
  Share2,
  Smartphone,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

interface Fact {
  id: string;
  text: string;
  source: string;
  source_url: string;
}

export default function FactStudioPage() {
  const { toast } = useToast();
  const [fact, setFact] = useState<Fact | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const fetchFact = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://uselessfacts.jsph.pl/api/v2/facts/random?t=${Date.now()}`);
      if (!response.ok) throw new Error("Knowledge uplink failed.");
      
      const data = await response.json();
      if (data.text) {
        setFact(data);
      } else {
        throw new Error("Malformed data matrix.");
      }
    } catch (err) {
      setError("Matrix Retrieval Failure: The knowledge registry is unreachable.");
      toast({ variant: "destructive", title: "Protocol Failed" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchFact();
  }, [fetchFact]);

  const handleCopy = () => {
    if (!fact) return;
    const text = `${fact.text}\n\n— Generated via mykittool.app`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast({ title: "Signal Isolated", description: "Fact saved to clipboard." });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!fact) return;
    const text = `${fact.text} — Shared via mykittool.app`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Fact Studio Knowledge', text });
      } catch (err) {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Lightbulb className="w-3.5 h-3.5" /> Intelligence Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
                Fact <span className="text-primary italic">Studio</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional high-fidelity knowledge synthesis. Extract unique randomized facts from the global registry with real-time calibration and local archiving.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="facts" />
              <Button variant="outline" size="sm" onClick={() => fetchFact()} disabled={isLoading} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-primary transition-all">
                <RefreshCcw className={cn("w-3.5 h-3.5 mr-2", isLoading && "animate-spin")} /> New Fact
              </Button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Main Display */}
        <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-left-6 duration-1000">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[500px] bg-black/10">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <Activity className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Knowledge Matrix</CardTitle>
                 </div>
              </CardHeader>
              
              <CardContent className="flex-1 p-8 sm:p-16 flex flex-col items-center justify-center relative overflow-hidden">
                 {isLoading ? (
                   <div className="flex flex-col items-center gap-8 py-24">
                      <div className="relative">
                         <div className="w-28 h-28 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                         <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                      </div>
                      <p className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">Decoding Signal Stream...</p>
                   </div>
                 ) : error ? (
                   <div className="flex flex-col items-center gap-6 py-24 text-center">
                      <Trash2 className="w-16 h-16 text-destructive opacity-20" />
                      <p className="text-sm font-bold text-destructive uppercase tracking-widest">{error}</p>
                      <Button onClick={() => fetchFact()} variant="outline" className="h-11 px-8 rounded-xl border-border">Retry Protocol</Button>
                   </div>
                 ) : fact ? (
                   <div className="w-full space-y-12 animate-in zoom-in-95 duration-500">
                      <div className="text-center space-y-12">
                         <div className="relative p-10 sm:p-16 rounded-[3rem] bg-white/5 border border-white/5 shadow-2xl overflow-hidden group">
                            <Quote className="absolute -top-4 -left-4 w-32 h-32 text-primary/5 -rotate-12" />
                            <div className="absolute top-6 right-8 text-[10px] font-mono font-bold text-primary/20 uppercase tracking-widest">Signal Verified</div>
                            
                            <div className="space-y-10 relative z-10">
                               <h2 className="text-2xl sm:text-4xl md:text-5xl font-headline font-black text-foreground leading-[1.2] tracking-tight text-center">
                                  {fact.text}
                               </h2>
                            </div>
                         </div>

                         <div className="flex flex-wrap justify-center gap-4">
                            <Button 
                              onClick={handleCopy} 
                              className="h-14 px-8 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all"
                            >
                               {isCopied ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                               Copy Fact
                            </Button>
                            <Button onClick={handleShare} variant="outline" className="h-14 px-8 border-white/10 bg-white/5 text-white/40 rounded-2xl">
                               <Share2 className="w-5 h-5" />
                            </Button>
                            {fact.source_url && (
                              <Button asChild variant="outline" className="h-14 px-8 border-white/10 bg-white/5 text-white/40 rounded-2xl">
                                <a href={fact.source_url} target="_blank" rel="noopener noreferrer">
                                   <ExternalLink className="w-5 h-5" />
                                </a>
                              </Button>
                            )}
                         </div>
                      </div>
                   </div>
                 ) : (
                   <div className="flex flex-col items-center gap-6 py-24 opacity-10">
                      <Lightbulb className="w-24 h-24 text-primary" />
                      <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Signal Detection</p>
                   </div>
                 )}
              </CardContent>
           </Card>
        </div>

        {/* Info Column */}
        <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
           <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
             <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
             </div>
             <div className="space-y-2">
               <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Privacy Sovereign</h4>
               <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                 Knowledge discovery lookups are volatile and held strictly in local memory. The studio does not track or store your reading history.
               </p>
             </div>
          </div>

          <Card className="glass-card border-border shadow-xl">
              <CardHeader className="py-6 border-b border-white/5 bg-white/2">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Settings2 className="w-5 h-5 text-primary" /> Studio Config
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                 <div className="flex items-start gap-4">
                    <Zap className="w-5 h-5 text-primary/40 shrink-0" />
                    <div className="space-y-1">
                       <h4 className="text-[11px] font-black uppercase text-foreground">Instant Synthesis</h4>
                       <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">Retrieved directly from the Useless Facts registry with 1:1 linguistic fidelity.</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4">
                    <Smartphone className="w-5 h-5 text-primary/40 shrink-0" />
                    <div className="space-y-1">
                       <h4 className="text-[11px] font-black uppercase text-foreground">Multi-Device Sync</h4>
                       <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">Responsive matrix ensures high-fidelity knowledge across all hardware sizes.</p>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
