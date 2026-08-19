"use client"

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  RefreshCcw, 
  Copy, 
  CheckCircle2, 
  Zap, 
  Activity,
  Loader2,
  AlertCircle,
  Quote,
  Settings2,
  Heart,
  Share2,
  Search,
  Hash,
  History,
  ArrowRight,
  Bookmark,
  X,
  ShieldCheck,
  BadgeCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

interface AdviceSlip {
  id: number;
  advice: string;
}

export default function AdvicePage() {
  const { toast } = useToast();
  
  // Primary State
  const [currentAdvice, setCurrentAdvice] = useState<AdviceSlip | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<number | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AdviceSlip[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Persistence State
  const [history, setHistory] = useState<AdviceSlip[]>([]);
  const [favorites, setFavorites] = useState<AdviceSlip[]>([]);

  // --- Persistence Handshake ---
  useEffect(() => {
    const savedFavs = localStorage.getItem('mykit_advice_favs');
    const savedHistory = localStorage.getItem('mykit_advice_history');
    if (savedFavs) try { setFavorites(JSON.parse(savedFavs)); } catch (e) {}
    if (savedHistory) try { setHistory(JSON.parse(savedHistory)); } catch (e) {}
    
    // Initial Synthesis
    fetchRandomAdvice();
  }, []);

  useEffect(() => {
    localStorage.setItem('mykit_advice_favs', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('mykit_advice_history', JSON.stringify(history));
  }, [history]);

  // --- Logic Matrix ---

  const addToHistory = (slip: AdviceSlip) => {
    setHistory(prev => {
      const filtered = prev.filter(s => s.id !== slip.id);
      return [slip, ...filtered].slice(0, 10);
    });
  };

  const fetchRandomAdvice = async () => {
    setIsLoading(true);
    setError(null);
    setSearchResults([]);
    try {
      const response = await fetch(`https://api.adviceslip.com/advice?t=${Date.now()}`);
      if (!response.ok) throw new Error("Acoustic uplink failed.");
      
      const data = await response.json();
      if (data.slip) {
        setCurrentAdvice(data.slip);
        addToHistory(data.slip);
      } else {
        throw new Error("Malformed data matrix.");
      }
    } catch (err) {
      setError("Matrix Retrieval Failure: The wisdom registry is unreachable.");
      toast({ variant: "destructive", title: "Protocol Failed" });
    } finally {
      setIsLoading(false);
    }
  };

  const executeSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);
    try {
      const response = await fetch(`https://api.adviceslip.com/advice/search/${encodeURIComponent(searchQuery.trim())}`);
      const data = await response.json();
      
      if (data.slips && data.slips.length > 0) {
        setSearchResults(data.slips);
        toast({ title: "Signal Mapped", description: `Isolated ${data.slips.length} matches.` });
      } else {
        setSearchResults([]);
        setError(`Zero matches identified for query: "${searchQuery}"`);
      }
    } catch (err) {
      setError("Search uplink failure.");
    } finally {
      setIsSearching(false);
    }
  };

  const toggleFavorite = (slip: AdviceSlip) => {
    const isFav = favorites.some(f => f.id === slip.id);
    if (isFav) {
      setFavorites(prev => prev.filter(f => f.id !== slip.id));
      toast({ title: "Removed from Favorites" });
    } else {
      setFavorites(prev => [slip, ...prev]);
      toast({ title: "Saved to Repository" });
    }
  };

  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setIsCopied(id);
    toast({ title: "Matrix Copied" });
    setTimeout(() => setIsCopied(null), 2000);
  };

  const handleShare = (slip: AdviceSlip) => {
    const text = `"${slip.advice}" — Wisdom ID: ${slip.id}. Shared via mykittool.app`;
    if (navigator.share) {
      navigator.share({ title: 'Advice Studio Wisdom', text });
    } else {
      handleCopy(text, slip.id);
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
                Professional high-fidelity wisdom synthesis. Extract unique linguistic guidance from the global advice matrix with real-time keyword discovery and local archiving.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="advice-generator" />
              <Button variant="outline" size="sm" onClick={fetchRandomAdvice} disabled={isLoading} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-primary transition-all">
                <RefreshCcw className={cn("w-3.5 h-3.5 mr-2", isLoading && "animate-spin")} /> New Random Advice
              </Button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Main Interface Column */}
        <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-left-6 duration-1000">
           
           {/* 1. Primary Viewport */}
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[400px] bg-black/10">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <Activity className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Linguistic Matrix</CardTitle>
                 </div>
                 {currentAdvice && (
                   <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[8px] font-black text-primary uppercase tracking-widest">
                    <BadgeCheck className="w-3 h-3" /> Verified Signal
                  </div>
                 )}
              </CardHeader>
              
              <CardContent className="flex-1 p-8 sm:p-16 flex flex-col items-center justify-center relative overflow-hidden">
                 {isLoading && !currentAdvice && (
                   <div className="flex flex-col items-center gap-6 py-20">
                      <div className="relative">
                         <div className="w-24 h-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                         <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />
                      </div>
                      <p className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">Decoding Wisdom Stream...</p>
                   </div>
                 )}

                 {currentAdvice && !isLoading && (
                   <div className="w-full space-y-12 animate-in zoom-in-95 duration-500">
                      <div className="text-center space-y-12">
                         <div className="relative p-10 sm:p-16 rounded-[3rem] bg-white/5 border border-white/5 shadow-2xl overflow-hidden group">
                            <Quote className="absolute -top-4 -left-4 w-32 h-32 text-primary/5 -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
                            <div className="absolute top-6 right-8 text-[10px] font-mono font-bold text-primary/20">ID: {currentAdvice.id}</div>
                            <h2 className="text-3xl sm:text-5xl md:text-6xl font-headline font-black text-foreground leading-[1.1] tracking-tight text-center relative z-10">
                               "{currentAdvice.advice}"
                            </h2>
                            <div className="absolute bottom-6 right-6 opacity-20 pointer-events-none">
                               <Sparkles className="w-12 h-12 text-primary" />
                            </div>
                         </div>

                         <div className="flex flex-wrap justify-center gap-4">
                            <Button 
                              onClick={() => handleCopy(currentAdvice.advice, currentAdvice.id)} 
                              className="h-14 px-8 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl hover:bg-primary/90 active:scale-95 transition-all"
                            >
                               {isCopied === currentAdvice.id ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                               Copy Wisdom
                            </Button>
                            <Button 
                              onClick={() => toggleFavorite(currentAdvice)}
                              variant="outline" 
                              className={cn(
                                "h-14 px-8 border-white/10 bg-white/5 rounded-2xl transition-all",
                                favorites.some(f => f.id === currentAdvice.id) ? "text-primary border-primary/20" : "text-white/40"
                              )}
                            >
                               <Heart className={cn("w-5 h-5", favorites.some(f => f.id === currentAdvice.id) && "fill-current")} />
                            </Button>
                            <Button onClick={() => handleShare(currentAdvice)} variant="outline" className="h-14 px-8 border-white/10 bg-white/5 text-white/40 rounded-2xl">
                               <Share2 className="w-5 h-5" />
                            </Button>
                         </div>
                      </div>
                   </div>
                 )}
              </CardContent>
           </Card>

           {/* 2. Search Protocol */}
           <Card className="glass-card border-border shadow-xl">
              <CardHeader className="py-6 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Search className="w-5 h-5 text-primary" /> Search Matrix
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                 <form onSubmit={executeSearch} className="flex gap-4">
                    <div className="relative flex-1 group">
                       <Input 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search keywords (e.g. Life, Future, Love)..."
                        className="h-14 bg-secondary border-border rounded-2xl text-sm font-bold px-6 focus:ring-primary/40 uppercase"
                       />
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity">
                          <Activity className="w-5 h-5 text-primary" />
                       </div>
                    </div>
                    <Button type="submit" disabled={isSearching || !searchQuery.trim()} className="h-14 px-10 bg-primary text-white font-black rounded-2xl shadow-xl">
                       {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
                    </Button>
                 </form>

                 {searchResults.length > 0 && (
                   <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
                      <Label className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-1">Results Identified</Label>
                      <div className="grid grid-cols-1 gap-3">
                         {searchResults.map(slip => (
                           <div key={slip.id} className="p-6 rounded-3xl bg-secondary/50 border border-border flex items-center justify-between gap-6 group hover:bg-secondary transition-all">
                              <div className="flex items-center gap-5 min-w-0">
                                 <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary/40 font-mono text-[9px] font-bold shrink-0">
                                    #{slip.id}
                                 </div>
                                 <p className="text-sm font-medium text-foreground/80 leading-relaxed truncate">{slip.advice}</p>
                              </div>
                              <div className="flex gap-2 shrink-0">
                                 <button onClick={() => setCurrentAdvice(slip)} className="p-2 text-foreground/10 hover:text-primary transition-colors"><ArrowRight className="w-4 h-4" /></button>
                                 <button onClick={() => handleCopy(slip.advice, slip.id)} className="p-2 text-foreground/10 hover:text-primary transition-colors"><Copy className="w-4 h-4" /></button>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                 )}

                 {error && (
                   <div className="p-6 rounded-[2rem] bg-destructive/10 border border-destructive/20 flex items-center gap-4 animate-in shake duration-500">
                      <AlertCircle className="w-6 h-6 text-destructive" />
                      <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">{error}</p>
                   </div>
                 )}
              </CardContent>
           </Card>
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
           
           {/* 3. Favorites Repository */}
           <Card className="glass-card border-border shadow-xl flex flex-col max-h-[400px]">
              <CardHeader className="py-6 border-b border-border bg-secondary/30 flex items-center justify-between shrink-0">
                 <div className="flex items-center gap-3">
                    <Bookmark className="w-4 h-4 text-primary" />
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Favorites</CardTitle>
                 </div>
                 {favorites.length > 0 && (
                   <button onClick={() => setFavorites([])} className="text-[9px] font-black text-foreground/20 hover:text-red-500 uppercase transition-colors">Purge</button>
                 )}
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-1">
                 {favorites.length === 0 ? (
                   <div className="py-20 text-center opacity-10 space-y-4">
                      <Heart className="w-10 h-10 mx-auto" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Empty Repository</p>
                   </div>
                 ) : (
                   <div className="divide-y divide-white/5">
                      {favorites.map(f => (
                        <div key={f.id} className="p-5 flex items-center justify-between group hover:bg-white/5 transition-all cursor-pointer" onClick={() => setCurrentAdvice(f)}>
                           <div className="flex items-center gap-4 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                 <Hash className="w-3.5 h-3.5" />
                              </div>
                              <p className="text-xs font-bold text-foreground/60 truncate uppercase">{f.advice}</p>
                           </div>
                           <button onClick={(e) => { e.stopPropagation(); toggleFavorite(f); }} className="p-2 text-primary hover:text-destructive"><X className="w-4 h-4" /></button>
                        </div>
                      ))}
                   </div>
                 )}
              </CardContent>
           </Card>

           {/* 4. History Log */}
           <Card className="glass-card border-border shadow-xl flex flex-col max-h-[400px]">
              <CardHeader className="py-6 border-b border-border bg-secondary/30 flex items-center justify-between shrink-0">
                 <div className="flex items-center gap-3">
                    <History className="w-4 h-4 text-primary" />
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Recent Signals</CardTitle>
                 </div>
                 {history.length > 0 && (
                   <button onClick={() => setHistory([])} className="text-[9px] font-black text-foreground/20 hover:text-red-500 uppercase transition-colors">Clear</button>
                 )}
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-1">
                 {history.length === 0 ? (
                   <div className="py-20 text-center opacity-10">
                      <Activity className="w-8 h-8 mx-auto" />
                   </div>
                 ) : (
                   <div className="divide-y divide-white/5">
                      {history.map(h => (
                        <div key={h.id} className="p-5 flex items-center justify-between group hover:bg-white/5 transition-all cursor-pointer" onClick={() => setCurrentAdvice(h)}>
                           <div className="flex items-center gap-4 min-w-0">
                              <p className="text-xs font-medium text-foreground/40 truncate uppercase">{h.advice}</p>
                           </div>
                           <div className="text-[8px] font-mono text-foreground/10 shrink-0">#{h.id}</div>
                        </div>
                      ))}
                   </div>
                 )}
              </CardContent>
           </Card>

           {/* Studio Config Info */}
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
                         Favorites and History are mapped strictly to local browser memory. Hardware IDs are never transmitted.
                       </p>
                    </div>
                 </div>
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
