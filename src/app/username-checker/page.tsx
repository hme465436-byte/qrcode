"use client"

import React, { useState } from 'react';
import { 
  Search, 
  User, 
  ExternalLink, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Copy, 
  Trash2, 
  Zap, 
  Globe, 
  ShieldCheck, 
  Activity,
  History,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';
import { checkUsernameAction } from './actions';

type PlatformResult = {
  platform: string;
  status: 'taken' | 'available' | 'unknown';
  url: string;
};

export default function UsernameCheckerPage() {
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [results, setResults] = useState<PlatformResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCheck = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = username.trim().replace(/[^a-zA-Z0-9._-]/g, '');
    if (clean.length < 2) {
      toast({ variant: "destructive", title: "Linguistic Error", description: "Minimum 2 characters required." });
      return;
    }

    setIsProcessing(true);
    setResults([]);

    try {
      const data = await checkUsernameAction(clean);
      setResults(data);
      toast({ title: "Analysis Complete", description: `Scanned ${data.length} global registries.` });
    } catch (err) {
      toast({ variant: "destructive", title: "Protocol Failure", description: "Discovery nodes unreachable." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyAll = () => {
    if (results.length === 0) return;
    const taken = results.filter(r => r.status === 'taken').map(r => `${r.platform}: ${r.url}`).join('\n');
    navigator.clipboard.writeText(taken || 'No profiles identified.');
    setIsCopied(true);
    toast({ title: "Log Copied" });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleReset = () => {
    setUsername('');
    setResults([]);
    toast({ title: "Studio Reset" });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <User className="w-3.5 h-3.5" /> Identity Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
                Username <span className="text-primary italic">OSINT Checker</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional-grade digital intelligence. Isolate identity footprints across 20+ global registries locally and securely without server-side persistence.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="username-checker" />
              {(results.length > 0 || username) && (
                <Button variant="outline" size="sm" onClick={handleReset} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                  <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
                </Button>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Input Panel */}
        <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
               <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                 <Search className="w-5 h-5 text-primary" /> Discovery Node
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
              <form onSubmit={handleCheck} className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Linguistic Handle</Label>
                <div className="relative group/input">
                  <Input 
                    placeholder="Enter username (e.g. torvalds)..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-16 bg-secondary border-border rounded-2xl text-lg font-bold px-6 focus:ring-primary/40 uppercase"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/input:opacity-100 transition-opacity">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  disabled={isProcessing || !username.trim()}
                  className="w-full h-14 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-primary/30 active:scale-95 transition-all"
                >
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <ShieldCheck className="w-5 h-5 mr-3" />}
                  Execute Lookup
                </Button>
              </form>

              <div className="p-6 rounded-[2rem] bg-secondary/50 border border-border flex flex-col gap-6">
                 <div className="flex items-start gap-4">
                    <Globe className="w-10 h-10 text-primary/40 shrink-0" />
                    <div className="space-y-1">
                       <p className="text-[11px] font-black uppercase text-foreground leading-none">Global Coverage</p>
                       <p className="text-[9px] font-bold text-foreground/20 uppercase tracking-widest">20+ Production Nodes</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4">
                    <ShieldCheck className="w-10 h-10 text-primary/40 shrink-0" />
                    <div className="space-y-1">
                       <p className="text-[11px] font-black uppercase text-foreground leading-none">Privacy Safe</p>
                       <p className="text-[9px] font-bold text-foreground/20 uppercase tracking-widest">Zero Server Persistence</p>
                    </div>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Matrix */}
        <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px] bg-black/10">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between shrink-0">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <Activity className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Identity Profile</CardTitle>
                 </div>
                 {results.length > 0 && (
                   <Button variant="outline" size="sm" onClick={handleCopyAll} className="h-9 px-4 rounded-xl border-white/5 bg-white/5 text-[9px] font-black uppercase">
                      {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> : <Copy className="w-3.5 h-3.5 mr-2" />} Copy Taken
                   </Button>
                 )}
              </CardHeader>
              
              <CardContent className="flex-1 p-6 sm:p-10 relative overflow-hidden">
                 {!results.length && !isProcessing && (
                   <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-6 py-20">
                      <Search className="w-24 h-24 text-primary" />
                      <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Discovery Signal</p>
                   </div>
                 )}

                 {isProcessing && (
                   <div className="flex-1 flex flex-col items-center justify-center space-y-10 py-20">
                      <div className="relative">
                         <div className="w-28 h-28 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                         <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                      </div>
                      <p className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">Decoding Identity Matrix...</p>
                   </div>
                 )}

                 {results.length > 0 && (
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in zoom-in-95 duration-500">
                      {results.map((r, i) => (
                        <div key={i} className={cn(
                          "p-5 rounded-3xl border transition-all duration-500 flex items-center justify-between gap-6",
                          r.status === 'taken' ? "bg-red-500/5 border-red-500/10" : 
                          r.status === 'available' ? "bg-green-500/5 border-green-500/10" : 
                          "bg-secondary border-border"
                        )}>
                           <div className="flex items-center gap-5 min-w-0">
                              <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner border",
                                r.status === 'taken' ? "bg-red-500/10 text-red-500 border-red-500/20" : 
                                r.status === 'available' ? "bg-green-500/10 text-green-500 border-green-500/20" : 
                                "bg-background text-foreground/20 border-border"
                              )}>
                                 {r.status === 'taken' ? <XCircle className="w-6 h-6" /> : 
                                  r.status === 'available' ? <CheckCircle2 className="w-6 h-6" /> : 
                                  <HelpCircle className="w-6 h-6" />}
                              </div>
                              <div className="min-w-0">
                                 <p className="text-[11px] font-black text-foreground truncate uppercase tracking-tight">{r.platform}</p>
                                 <p className={cn("text-[9px] font-bold uppercase tracking-widest", 
                                   r.status === 'taken' ? 'text-red-500' : 
                                   r.status === 'available' ? 'text-green-500' : 'text-foreground/20'
                                 )}>{r.status}</p>
                              </div>
                           </div>
                           {r.status === 'taken' && (
                             <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary">
                                <a href={r.url} target="_blank" rel="noopener noreferrer">
                                   <ExternalLink className="w-4 h-4" />
                                </a>
                             </Button>
                           )}
                        </div>
                      ))}
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
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
