"use client"

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Globe, 
  ArrowRight, 
  Loader2, 
  Zap, 
  Activity, 
  ShieldAlert, 
  Link as LinkIcon, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  ChevronRight,
  ExternalLink,
  Shield,
  Trash2,
  ListTree,
  Fingerprint,
  RotateCcw,
  Network,
  Lock,
  Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';
import { expandUrlAction, checkSafetyAction } from './actions';

interface ResultMatrix {
  original: string;
  final: string;
  chain: { url: string; status: number }[];
  domain: string;
  score: number;
  status: 'Safe' | 'Suspicious' | 'Dangerous';
  reasons: string[];
}

export default function LinkSafetyCheckerPage() {
  const { toast } = useToast();
  const [urlInput, setUrlInput] = useState('');
  const [results, setResults] = useState<ResultMatrix | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!urlInput.trim()) return;

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      // Phase 1: Expansion Protocol
      const expansion = await expandUrlAction(urlInput);
      if (!expansion.success && expansion.chain.length === 0) {
        throw new Error("Expansion node failure. Target URL is unreachable.");
      }

      // Phase 2: Safety Audit Protocol
      const audit = await checkSafetyAction(expansion.finalUrl);

      let status: ResultMatrix['status'] = 'Safe';
      if (audit.score < 40) status = 'Dangerous';
      else if (audit.score < 85) status = 'Suspicious';

      setResults({
        original: urlInput,
        final: expansion.finalUrl,
        chain: expansion.chain,
        domain: audit.domain,
        score: audit.score,
        status,
        reasons: audit.reasons
      });

      toast({ title: "Analysis Complete", description: "Link deconstructed successfully." });
    } catch (err: any) {
      setError(err.message || "Protocol Failure: Discovery node restricted.");
      toast({ variant: "destructive", title: "Sync Failed" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (results?.final) {
      navigator.clipboard.writeText(results.final);
      setIsCopied(true);
      toast({ title: "Final URL Copied" });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setUrlInput('');
    setResults(null);
    setError(null);
    toast({ title: "Studio Reset" });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <ShieldCheck className="w-3.5 h-3.5" /> Security Suite Pro
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
              <h1 className="text-3xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
                Link Safety <span className="text-primary italic">Checker</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional URL deconstruction studio. Unmask shorteners, identify redirect chains, and evaluate destination risk factors without exposing your hardware.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="link-safety" />
              {(results || urlInput) && (
                <Button variant="outline" size="sm" onClick={handleReset} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                   <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
                </Button>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Input Node - Left */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
              <CardHeader className="pb-8 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Search className="w-5 h-5 text-primary" /> Target Protocol
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-10 space-y-8">
                 <form onSubmit={handleAnalyze} className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Inbound URL / Short Link</Label>
                    <div className="relative group/input">
                       <Input 
                        placeholder="Paste link (e.g. bit.ly/..., t.co/...)" 
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        className="h-16 bg-secondary border-border rounded-2xl text-sm font-bold px-6 focus:ring-primary/40 uppercase"
                       />
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/input:opacity-100 transition-opacity">
                          <Zap className="w-6 h-6 text-primary" />
                       </div>
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isLoading || !urlInput.trim()}
                      className="w-full h-16 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-primary/30 active:scale-95 transition-all"
                    >
                       {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <ShieldCheck className="w-5 h-5 mr-3" />}
                       Audit Link Integrity
                    </Button>
                 </form>

                 {error && (
                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 animate-in shake duration-500">
                       <AlertCircle className="w-4 h-4 text-destructive" />
                       <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">{error}</p>
                    </div>
                 )}

                 <div className="pt-6 border-t border-white/5 space-y-6">
                    <div className="flex items-start gap-4">
                       <Fingerprint className="w-5 h-5 text-primary/40 shrink-0" />
                       <div className="space-y-1">
                          <h4 className="text-[11px] font-black uppercase text-foreground/60">Anonymous Trace</h4>
                          <p className="text-[10px] text-foreground/30 font-medium leading-relaxed uppercase">Uplinks are followed server-side. No cookies or hardware fingerprints are shared with the target.</p>
                       </div>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* Results Matrix - Right */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px] bg-black/10">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between shrink-0">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <Activity className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Audit Identity</CardTitle>
                 </div>
                 {results && (
                    <Badge className={cn(
                      "px-4 py-1.5 border uppercase text-[9px] font-black tracking-widest",
                      results.status === 'Safe' ? "bg-green-500/10 text-green-500 border-green-500/20" : 
                      results.status === 'Suspicious' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" : 
                      "bg-red-500/10 text-red-500 border-red-500/20"
                    )}>
                       {results.status}
                    </Badge>
                 )}
              </CardHeader>
              
              <CardContent className="flex-1 p-6 sm:p-12 relative overflow-hidden">
                 {!results && !isLoading && !error && (
                   <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-6 py-24">
                      <Lock className="w-24 h-24 text-primary" />
                      <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Security Protocol</p>
                   </div>
                 )}

                 {isLoading && (
                   <div className="flex-1 flex flex-col items-center justify-center space-y-10 py-24">
                      <div className="relative">
                         <div className="w-28 h-28 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                         <Globe className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                      </div>
                      <p className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">Deconstructing Redirect Matrix...</p>
                   </div>
                 )}

                 {results && (
                   <div className="w-full space-y-10 animate-in zoom-in-95 duration-500">
                      {/* Score Indicator */}
                      <div className="flex flex-col items-center gap-6">
                         <div className="relative w-48 h-48 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                               <circle cx="50%" cy="50%" r="45%" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-white/5" />
                               <circle 
                                cx="50%" cy="50%" r="45%" 
                                fill="transparent" 
                                stroke="currentColor" 
                                strokeWidth="12" 
                                strokeDasharray="283" 
                                strokeDashoffset={283 - (283 * results.score) / 100}
                                className={cn(
                                  "transition-all duration-1000",
                                  results.status === 'Safe' ? "text-green-500" : 
                                  results.status === 'Suspicious' ? "text-yellow-500" : "text-red-500"
                                )} 
                               />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
                               <span className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em]">Safety Score</span>
                               <h2 className="text-5xl sm:text-7xl font-headline font-black text-foreground leading-none">{results.score}</h2>
                            </div>
                         </div>
                      </div>

                      {/* URL Display */}
                      <div className="space-y-4">
                         <div className="p-6 rounded-[2.5rem] bg-secondary/50 border border-border space-y-4 shadow-inner">
                            <div className="flex items-center justify-between px-1">
                               <Label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">Final Destination Matrix</Label>
                               <span className="text-[9px] font-black text-primary uppercase bg-primary/10 px-2 py-0.5 rounded leading-none">{results.domain}</span>
                            </div>
                            <p className="text-sm font-medium text-foreground/80 break-all leading-relaxed uppercase">
                               {results.final}
                            </p>
                            <div className="flex gap-3">
                               <Button onClick={handleCopy} className="h-12 flex-1 bg-white text-black font-black uppercase text-[9px] tracking-widest rounded-xl shadow-xl active:scale-95 transition-all">
                                  {isCopied ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                  Copy Master URL
                               </Button>
                            </div>
                         </div>
                      </div>

                      {/* Redirect Chain */}
                      <div className="space-y-4">
                         <div className="flex items-center gap-3 px-1">
                            <ListTree className="w-4 h-4 text-primary" />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40">Redirection Trace ({results.chain.length} Hops)</h4>
                         </div>
                         <div className="space-y-2">
                            {results.chain.map((hop, i) => (
                               <div key={i} className="flex items-center gap-4 group">
                                  <div className="flex flex-col items-center gap-1 shrink-0">
                                     <div className={cn(
                                       "w-8 h-8 rounded-lg flex items-center justify-center border font-bold text-[9px]",
                                       i === results.chain.length - 1 ? "bg-primary/20 border-primary/40 text-primary" : "bg-white/5 border-white/5 text-white/20"
                                     )}>
                                        {i + 1}
                                     </div>
                                     {i < results.chain.length - 1 && <div className="w-[1px] h-4 bg-white/5" />}
                                  </div>
                                  <div className="flex-1 min-w-0 p-3 rounded-xl bg-white/[0.02] border border-white/5 group-hover:border-white/10 transition-all flex items-center justify-between gap-4">
                                     <span className="text-[10px] font-mono text-foreground/50 truncate uppercase">{hop.url}</span>
                                     <Badge variant="outline" className="bg-background/50 text-[8px] font-mono border-white/5 text-foreground/20">{hop.status}</Badge>
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>

                      {/* Risk Factors */}
                      <div className="space-y-4">
                         <div className="flex items-center gap-3 px-1">
                            <ShieldAlert className="w-4 h-4 text-primary" />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40">Risk Assessment Report</h4>
                         </div>
                         <div className="space-y-3">
                            {results.reasons.map((r, i) => (
                               <div key={i} className="p-4 rounded-2xl bg-secondary/50 border border-border flex items-center gap-4">
                                  <div className={cn(
                                    "w-1.5 h-1.5 rounded-full shrink-0",
                                    results.status === 'Safe' ? "bg-green-500" : 
                                    results.status === 'Suspicious' ? "bg-yellow-500" : "bg-red-500"
                                  )} />
                                  <p className="text-[11px] font-bold text-foreground/60 uppercase tracking-tighter leading-tight">{r}</p>
                               </div>
                            ))}
                         </div>
                      </div>

                      <div className="p-6 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
                         <Shield className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                         <p className="text-[10px] text-foreground/40 font-bold leading-relaxed uppercase">
                            Analysis based on current cryptographic signals and remote registries. Security of dynamic JavaScript content beyond the initial load cannot be clinically verified. Proceed with caution.
                         </p>
                      </div>
                   </div>
                 )}
              </CardContent>
           </Card>
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
      `}</style>
    </div>
  );
}

