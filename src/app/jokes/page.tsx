"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Laugh, 
  RefreshCcw, 
  Copy, 
  CheckCircle2, 
  Sparkles, 
  Activity,
  Loader2,
  AlertCircle,
  Quote,
  ShieldCheck,
  Zap,
  Eye,
  Trash2,
  Smartphone,
  Share2,
  Settings2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

interface Joke {
  id: number;
  type: string;
  setup: string;
  punchline: string;
}

export default function JokeStudioPage() {
  const { toast } = useToast();
  const [joke, setJoke] = useState<Joke | null>(null);
  const [showPunchline, setShowPunchline] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Audio Synthesis Helper
  const playWinSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(261.63, ctx.currentTime); 
      osc.frequency.exponentialRampToValueAtTime(523.25, ctx.currentTime + 0.5); 
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch(e) {}
  };

  const fetchJoke = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setShowPunchline(false);
    try {
      const response = await fetch(`https://official-joke-api.appspot.com/random_joke?t=${Date.now()}`);
      if (!response.ok) throw new Error("Humor uplink failed.");
      
      const data = await response.json();
      if (data.setup && data.punchline) {
        setJoke(data);
      } else {
        throw new Error("Malformed humor matrix.");
      }
    } catch (err) {
      setError("Matrix Retrieval Failure: The humor registry is unreachable.");
      toast({ variant: "destructive", title: "Protocol Failed" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchJoke();
  }, [fetchJoke]);

  const handleCopy = () => {
    if (!joke) return;
    const text = `${joke.setup}\n\n${joke.punchline}\n\n— Generated via mykittool.app`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast({ title: "Humor Isolated", description: "Joke saved to clipboard." });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!joke) return;
    const text = `${joke.setup} ... ${joke.punchline} — Shared via mykittool.app`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Joke Studio Humor', text });
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
          <Laugh className="w-3.5 h-3.5" /> Humor Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
                Joke <span className="text-primary italic">Studio</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional high-fidelity humor synthesis. Extract unique linguistic jokes from the global humor matrix with real-time randomization and local archiving.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="jokes" />
              <Button variant="outline" size="sm" onClick={() => fetchJoke()} disabled={isLoading} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-primary transition-all">
                <RefreshCcw className={cn("w-3.5 h-3.5 mr-2", isLoading && "animate-spin")} /> New Joke
              </Button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Results - Right */}
        <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-left-6 duration-1000">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[500px] bg-black/10">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <Activity className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Humor Matrix</CardTitle>
                 </div>
              </CardHeader>
              
              <CardContent className="flex-1 p-8 sm:p-16 flex flex-col items-center justify-center relative overflow-hidden">
                 {isLoading ? (
                   <div className="flex flex-col items-center gap-8 py-24">
                      <div className="relative">
                         <div className="w-28 h-28 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                         <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                      </div>
                      <p className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">Decoding Humor Matrix...</p>
                   </div>
                 ) : error ? (
                   <div className="flex flex-col items-center gap-6 py-24 text-center">
                      <Trash2 className="w-16 h-16 text-destructive opacity-20" />
                      <p className="text-sm font-bold text-destructive uppercase tracking-widest">{error}</p>
                      <Button onClick={() => fetchJoke()} variant="outline" className="h-11 px-8 rounded-xl border-border">Retry Protocol</Button>
                   </div>
                 ) : joke ? (
                   <div className="w-full space-y-12 animate-in zoom-in-95 duration-500">
                      <div className="text-center space-y-12">
                         <div className="relative p-10 sm:p-16 rounded-[3rem] bg-white/5 border border-white/5 shadow-2xl overflow-hidden group">
                            <Quote className="absolute -top-4 -left-4 w-32 h-32 text-primary/5 -rotate-12" />
                            <div className="absolute top-6 right-8 text-[10px] font-mono font-bold text-primary/20 uppercase">Protocol: {joke.type}</div>
                            
                            <div className="space-y-10 relative z-10">
                               <h2 className="text-2xl sm:text-4xl md:text-5xl font-headline font-black text-foreground leading-[1.1] tracking-tight">
                                  {joke.setup}
                               </h2>
                               
                               {showPunchline ? (
                                 <div className="animate-in slide-in-from-top-4 duration-500 py-6 border-t border-white/10">
                                    <p className="text-3xl sm:text-5xl font-headline font-black text-primary italic">
                                       {joke.punchline}
                                    </p>
                                 </div>
                               ) : (
                                 <Button 
                                  onClick={() => { setShowPunchline(true); playWinSound(); }}
                                  className="h-16 px-10 bg-primary text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all"
                                 >
                                    Reveal Punchline
                                 </Button>
                               )}
                            </div>
                         </div>

                         <div className="flex flex-wrap justify-center gap-4">
                            <Button 
                              onClick={handleCopy} 
                              disabled={!showPunchline}
                              className="h-14 px-8 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all disabled:opacity-50"
                            >
                               {isCopied ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                               Copy Joke
                            </Button>
                            <Button onClick={handleShare} disabled={!showPunchline} variant="outline" className="h-14 px-8 border-white/10 bg-white/5 text-white/40 rounded-2xl disabled:opacity-50">
                               <Share2 className="w-5 h-5" />
                            </Button>
                         </div>
                      </div>
                   </div>
                 ) : (
                   <div className="flex flex-col items-center gap-6 py-24 opacity-10">
                      <Laugh className="w-24 h-24 text-primary" />
                      <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Signal Detection</p>
                   </div>
                 )}
              </CardContent>
           </Card>
        </div>

        {/* Info - Right */}
        <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
           <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
             <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
             </div>
             <div className="space-y-2">
               <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Privacy Sovereign</h4>
               <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                 Humor discovery lookups are volatile and held strictly in local memory. The studio does not track or store your reading history.
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
                       <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">Retrieved directly from the Official Joke API with clinical precision.</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4">
                    <Smartphone className="w-5 h-5 text-primary/40 shrink-0" />
                    <div className="space-y-1">
                       <h4 className="text-[11px] font-black uppercase text-foreground">Multi-Device Sync</h4>
                       <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">Responsive matrix ensures high-fidelity humor across all hardware sizes.</p>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
