"use client"

import React, { useState } from 'react';
import { 
  Globe, 
  Search, 
  BookOpen, 
  RefreshCcw, 
  ExternalLink, 
  Trash2, 
  Sparkles, 
  Loader2, 
  Info,
  CheckCircle2,
  Zap, 
  Activity,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Languages,
  ImageIcon,
  Copy,
  History,
  Maximize2,
  Share2,
  Globe2,
  FileText,
  Quote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

interface WikipediaSummary {
  title: string;
  displaytitle: string;
  extract: string;
  description?: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  originalimage?: {
    source: string;
    width: number;
    height: number;
  };
  content_urls: {
    desktop: {
      page: string;
    };
  };
}

const TRENDING_NODES = ['Physics', 'Architecture', 'Artificial Intelligence', 'Ancient Rome', 'Mars', 'Quantum Computing'];

export default function WikipediaPage() {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<WikipediaSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const fetchSummary = async (topic?: string) => {
    const target = topic || query.trim();
    if (!target) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setQuery(target);

    try {
      const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(target.replace(/\s+/g, '_'))}`);
      
      if (response.status === 404) {
        setError("Linguistic Error: Topic not identified in the global registry matrix.");
      } else if (!response.ok) {
        throw new Error("Uplink failure.");
      } else {
        const data = await response.json();
        setResult(data);
        toast({ title: "Signal Isolated", description: `Identity mapped for "${data.title}".` });
      }
    } catch (err) {
      setError("Matrix Retrieval Failure: Discovery nodes are restricted.");
      toast({ variant: "destructive", title: "Protocol Failed" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResult(null);
    setError(null);
    toast({ title: "Studio Reset" });
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `${result.title}\n${result.description ? `(${result.description})` : ''}\n\n${result.extract}\n\nRead more: ${result.content_urls.desktop.page}`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast({ title: "Content Copied", description: "Identity data saved to clipboard." });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Globe className="w-3.5 h-3.5" /> Intelligence Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <h1 className="text-3xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
                Wikipedia <span className="text-primary italic">Studio Pro</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional linguistic discovery engine. Isolate global knowledge summaries, visual assets, and high-fidelity documentation locally via the Wikipedia REST protocol.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="wikipedia" />
              {(result || query) && (
                <Button variant="outline" size="sm" onClick={handleClear} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                   <Trash2 className="w-3.5 h-3.5 mr-2" /> Reset
                </Button>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Search Matrix */}
        <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="pb-8 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Search className="w-5 h-5 text-primary" /> Discovery Protocol
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-10 space-y-8">
                 <form onSubmit={(e) => { e.preventDefault(); fetchSummary(); }} className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Linguistic Target</Label>
                    <div className="relative group/input">
                       <Input 
                        placeholder="Search any topic..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="h-16 bg-secondary border-border rounded-2xl text-sm font-bold px-6 focus:ring-primary/40 uppercase"
                       />
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/input:opacity-100 transition-opacity">
                          <Zap className="w-6 h-6 text-primary" />
                       </div>
                    </div>
                    <Button type="submit" disabled={isLoading || !query.trim()} className="w-full h-14 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-primary/30 active:scale-95 transition-all">
                       {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Globe2 className="w-5 h-5 mr-2" />}
                       Execute Search
                    </Button>
                 </form>

                 <div className="space-y-4 pt-4 border-t border-white/5">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Trending Nodes</Label>
                    <div className="flex flex-wrap gap-2">
                       {TRENDING_NODES.map(node => (
                         <button
                           key={node}
                           onClick={() => fetchSummary(node)}
                           className="px-4 py-2 rounded-xl bg-secondary/50 border border-border text-[9px] font-black uppercase tracking-widest hover:text-primary hover:border-primary/40 transition-all"
                         >
                            {node}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="pt-6 border-t border-white/5 space-y-4">
                    <div className="p-6 rounded-[2rem] bg-secondary/50 border border-border flex items-start gap-4">
                       <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                       <div className="space-y-1">
                          <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest">Privacy Sovereign</h4>
                          <p className="text-[9px] text-foreground/40 font-medium leading-relaxed uppercase">Linguistic queries are processed strictly in local memory. No data is stored.</p>
                       </div>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* Result Matrix */}
        <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[500px] bg-black/10">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between shrink-0">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <Activity className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Identity Profile</CardTitle>
                 </div>
              </CardHeader>
              
              <CardContent className="flex-1 p-8 sm:p-16 flex flex-col items-center justify-center relative overflow-hidden">
                 {!result && !isLoading && !error && (
                   <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-6 py-20">
                      <BookOpen className="w-24 h-24 text-primary" />
                      <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Discovery Signal</p>
                   </div>
                 )}

                 {isLoading && (
                   <div className="flex-1 flex flex-col items-center justify-center space-y-10 py-20">
                      <div className="relative">
                         <div className="w-28 h-28 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                         <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                      </div>
                      <p className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">Decoding Knowledge Matrix...</p>
                   </div>
                 )}

                 {error && !isLoading && (
                   <div className="flex flex-col items-center gap-8 py-20 text-center animate-in shake duration-500">
                      <AlertCircle className="w-16 h-16 text-destructive animate-bounce" />
                      <div className="space-y-2">
                         <h3 className="text-xl font-headline font-black text-destructive uppercase">Reference Failure</h3>
                         <p className="text-[11px] text-foreground/40 font-bold uppercase max-w-sm mx-auto leading-relaxed">{error}</p>
                      </div>
                      <Button onClick={() => fetchSummary('Main Page')} variant="outline" className="h-12 bg-secondary border border-border text-foreground font-black rounded-xl text-[9px] uppercase tracking-widest">Restart Protocol</Button>
                   </div>
                 )}

                 {result && !isLoading && (
                   <div className="w-full space-y-12 animate-in zoom-in-95 duration-500">
                      {/* Visual Header - Stacked for better readability */}
                      <div className="flex flex-col gap-10 items-center border-b border-white/5 pb-12">
                         {result.originalimage?.source || result.thumbnail?.source ? (
                            <div className="w-full max-w-2xl aspect-video rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white dark:border-white/5 ring-1 ring-border shrink-0 relative group/img">
                               <img src={result.originalimage?.source || result.thumbnail?.source} alt={result.title} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-1000" />
                               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity" />
                            </div>
                         ) : (
                            <div className="w-full max-w-2xl aspect-video rounded-[3rem] bg-secondary border border-border flex items-center justify-center text-foreground/10 shrink-0 shadow-inner">
                               <ImageIcon className="w-16 h-16" />
                            </div>
                         )}
                         <div className="space-y-8 w-full">
                            <div className="text-center space-y-4">
                               <h2 className="text-4xl sm:text-6xl font-headline font-black text-foreground uppercase tracking-tighter leading-none" dangerouslySetInnerHTML={{ __html: result.displaytitle }} />
                               {result.description && (
                                 <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-widest px-4 py-1.5">{result.description}</Badge>
                               )}
                            </div>
                            <div className="p-10 sm:p-14 rounded-[3.5rem] bg-secondary/50 border border-border shadow-inner relative group/extract">
                               <Quote className="absolute -top-6 -right-6 w-32 h-32 text-primary/5 -rotate-12" />
                               <p className="text-lg sm:text-2xl font-medium text-foreground/80 leading-relaxed relative z-10 text-center sm:text-left">
                                  {result.extract}
                                </p>
                            </div>
                         </div>
                      </div>

                      <div className="pt-6 flex flex-col sm:flex-row gap-4">
                         <Button asChild className="h-16 flex-1 bg-white text-black hover:bg-white/90 font-black rounded-2xl flex items-center justify-center gap-4 text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                            <a href={result.content_urls.desktop.page} target="_blank" rel="noopener noreferrer">
                               <BookOpen className="w-5 h-5 mr-1" /> Open Full Registry Node
                            </a>
                         </Button>
                         <Button onClick={handleCopy} variant="outline" className="h-16 px-10 border-white/10 bg-white/5 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl">
                            {isCopied ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />} 
                            Copy Matrix
                         </Button>
                      </div>
                   </div>
                 )}
              </CardContent>
           </Card>
        </div>
      </div>
      
      <style jsx global>{`
        .bg-checkered {
          background-image: linear-gradient(45deg, #111113 25%, transparent 25%), 
                            linear-gradient(-45deg, #111113 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #111113 75%), 
                            linear-gradient(-45deg, transparent 75%, #111113 75%);
          background-size: 20px 20px;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
      `}</style>
    </div>
  );
}
