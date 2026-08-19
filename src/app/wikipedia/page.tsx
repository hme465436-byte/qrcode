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
  Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

interface WikipediaSummary {
  title: string;
  displaytitle: string;
  extract: string;
  thumbnail?: {
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

export default function WikipediaPage() {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<WikipediaSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<string | null>(null);

  const fetchSummary = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanQuery.replace(/\s+/g, '_'))}`);
      
      if (response.status === 404) {
        setError("Linguistic Error: Topic not identified in the global registry.");
      } else if (!response.ok) {
        throw new Error("Uplink failure.");
      } else {
        const data = await response.json();
        setResult(data);
        toast({ title: "Signal Isolated", description: `Matrix updated for "${data.title}".` });
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

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(label);
    toast({ title: "Copied", description: "Content saved to clipboard." });
    setTimeout(() => setIsCopied(null), 2000);
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Globe className="w-3.5 h-3.5" /> Intelligence Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
                Wikipedia <span className="text-primary italic">Studio</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional linguistic discovery engine. Isolate global knowledge summaries, visual assets, and full documentation locally via the Wikipedia REST protocol.
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
        {/* Search Panel */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
              <CardHeader className="pb-8 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Search className="w-5 h-5 text-primary" /> Discovery Protocol
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-10 space-y-6">
                 <form onSubmit={fetchSummary} className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Linguistic Target</Label>
                    <div className="relative group/input">
                       <Input 
                        placeholder="Search topic (e.g. Physics, Rome)..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="h-16 bg-secondary border-border rounded-2xl text-sm font-bold px-6 focus:ring-primary/40 uppercase"
                       />
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/input:opacity-100 transition-opacity">
                          <Zap className="w-6 h-6 text-primary" />
                       </div>
                    </div>
                    <Button type="submit" disabled={isLoading || !query.trim()} className="h-14 w-full bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-primary/30 active:scale-95 transition-all">
                       {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                       Execute Search
                    </Button>
                 </form>

                 {error && (
                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 animate-in shake duration-500">
                       <AlertCircle className="w-4 h-4 text-destructive" />
                       <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">{error}</p>
                    </div>
                 )}
              </CardContent>
           </Card>

           <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
             <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
             </div>
             <div className="space-y-2">
               <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Privacy Sovereign</h4>
               <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                 Linguistic queries are processed strictly within your browser's volatile memory. No search history is logged to remote registries.
               </p>
             </div>
          </div>
        </div>

        {/* Result Column */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px] bg-black/10">
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

                 {result && !isLoading && (
                   <div className="w-full space-y-12 animate-in zoom-in-95 duration-500">
                      {/* Header: Title & Thumbnail */}
                      <div className="flex flex-col md:flex-row items-start gap-10">
                         {result.thumbnail && (
                            <div className="w-full md:w-64 aspect-square rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white dark:border-white/5 ring-1 ring-border shrink-0">
                               <img src={result.thumbnail.source} alt={result.title} className="w-full h-full object-cover" />
                            </div>
                         )}
                         <div className="space-y-6 flex-1 min-w-0">
                            <div className="space-y-2">
                               <h2 className="text-4xl sm:text-6xl font-headline font-black text-foreground uppercase tracking-tighter leading-none" dangerouslySetInnerHTML={{ __html: result.displaytitle }} />
                               <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Verified Knowledge Node</p>
                            </div>
                            <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border shadow-inner">
                               <p className="text-base sm:text-lg font-medium text-foreground/70 leading-relaxed">
                                  {result.extract}
                               </p>
                            </div>
                         </div>
                      </div>

                      <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-4">
                         <Button asChild className="h-16 flex-1 bg-white text-black hover:bg-white/90 font-black rounded-2xl flex items-center justify-center gap-4 text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                            <a href={result.content_urls.desktop.page} target="_blank" rel="noopener noreferrer">
                               Read More on Wikipedia <ExternalLink className="w-4 h-4 ml-1" />
                            </a>
                         </Button>
                         <Button variant="outline" onClick={() => handleCopy(`${result.title}\n\n${result.extract}\n\nRead more: ${result.content_urls.desktop.page}`, 'summary')} className="h-16 px-10 border-white/10 bg-white/5 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl">
                            {isCopied === 'summary' ? <CheckCircle2 className="w-5 h-5 mr-1" /> : <Copy className="w-5 h-5 mr-1" />} 
                            Copy Summary
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
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
      `}</style>
    </div>
  );
}
