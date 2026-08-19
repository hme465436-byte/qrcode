"use client"

import React, { useState, useEffect } from 'react';
import { 
  Book, 
  Search, 
  Trash2, 
  Sparkles, 
  Loader2, 
  Info,
  CheckCircle2,
  Zap,
  Activity,
  AlertCircle,
  User,
  Calendar,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  History,
  Settings2,
  ShieldCheck,
  Globe,
  ImageIcon,
  Maximize2,
  Languages,
  Hash,
  BookOpen,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

interface BookEntry {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  language?: string[];
  number_of_pages_median?: number;
  subject?: string[];
}

export default function BooksPage() {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BookEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination Matrix
  const [page, setPage] = useState(1);
  const [totalFound, setTotalFound] = useState(0);

  const executeSearch = async (pageNum: number = 1, isNewSearch: boolean = false) => {
    const searchTarget = query.trim();
    if (!searchTarget) return;

    setIsLoading(true);
    setError(null);
    if (isNewSearch) {
      setResults([]);
      setPage(1);
    }

    try {
      const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(searchTarget)}&page=${pageNum}&limit=12`);
      const data = await response.json();

      if (data.docs && data.docs.length > 0) {
        setResults(data.docs);
        setTotalFound(data.numFound || 0);
        setPage(pageNum);
        if (isNewSearch) {
          toast({ title: "Matrix Synced", description: `Isolated ${data.numFound.toLocaleString()} relevant signals.` });
        }
      } else {
        setResults([]);
        setTotalFound(0);
        setError("Zero matches identified in the Open Library registry.");
      }
    } catch (err) {
      setError("Matrix Retrieval Failure: Discovery nodes are unreachable.");
      toast({ variant: "destructive", title: "Protocol Failed" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(1, true);
  };

  const handlePageChange = (direction: 'next' | 'prev') => {
    const nextPage = direction === 'next' ? page + 1 : page - 1;
    if (nextPage < 1) return;
    executeSearch(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setTotalFound(0);
    setPage(1);
    setError(null);
    toast({ title: "Studio Reset" });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Book className="w-3.5 h-3.5" /> Intelligence Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
              Book <span className="text-primary italic">Studio Pro</span>
            </h1>
            <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
              Professional linguistic discovery engine. Isolate global book identities, author metadata, and high-fidelity covers locally via the Open Library protocol.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <GetHelp toolId="books" />
             {(results.length > 0 || query) && (
               <Button variant="outline" size="sm" onClick={handleClear} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                  <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
               </Button>
             )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Search Panel */}
        <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                <Search className="w-5 h-5 text-primary" /> Discovery Node
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
              <form onSubmit={handleSearchSubmit} className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Linguistic Query</Label>
                  <div className="relative group/input">
                    <Input 
                      placeholder="Title or Author..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="h-16 bg-secondary border-border rounded-2xl text-lg font-bold px-6 pr-14 focus:ring-primary/40 uppercase"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/input:opacity-100 transition-opacity">
                      <Zap className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading || !query.trim()}
                  className="w-full h-16 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Sparkles className="w-5 h-5 mr-2" />}
                  Execute Search
                </Button>
              </form>

              {totalFound > 0 && (
                <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10 flex items-center justify-between">
                   <div className="space-y-1">
                      <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">Identified Signal</p>
                      <p className="text-sm font-bold text-foreground">{totalFound.toLocaleString()} Results</p>
                   </div>
                   <Badge className="bg-primary/20 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest px-3 py-1">Page {page}</Badge>
                </div>
              )}

              <div className="pt-6 border-t border-white/5 space-y-4">
                 <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary/30 border border-border">
                    <ShieldCheck className="w-5 h-5 text-primary/40 shrink-0" />
                    <div className="space-y-1">
                       <h4 className="text-[10px] font-black uppercase text-foreground/60">Privacy Sovereign</h4>
                       <p className="text-[9px] text-foreground/30 font-medium uppercase">All searches are performed anonymously without user-tracking tokens.</p>
                    </div>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Matrix */}
        <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           {!results.length && !isLoading && !error && (
             <div className="h-[500px] flex flex-col items-center justify-center opacity-10 space-y-6">
                <Book className="w-24 h-24 text-primary" />
                <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Discovery Signal</p>
             </div>
           )}

           {isLoading && (
             <div className="h-[500px] flex flex-col items-center justify-center space-y-10">
                <div className="relative">
                   <div className="w-28 h-28 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                   <Globe className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                </div>
                <p className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">Querying Library Matrix...</p>
             </div>
           )}

           {error && (
             <Card className="glass-card border-destructive/20 bg-destructive/5 p-12 text-center flex flex-col items-center gap-6 animate-in shake duration-500">
                <AlertCircle className="w-16 h-16 text-destructive animate-bounce" />
                <div className="space-y-2">
                   <h3 className="text-xl font-headline font-black text-destructive uppercase">Reference Failure</h3>
                   <p className="text-sm text-foreground/40 font-bold uppercase">{error}</p>
                </div>
             </Card>
           )}

           {results.length > 0 && (
             <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in zoom-in-95 duration-500">
                  {results.map((book, idx) => (
                    <Dialog key={book.key}>
                      <DialogTrigger asChild>
                        <Card className="glass-card border-border shadow-xl hover:border-primary/20 transition-all group/item overflow-hidden cursor-pointer flex flex-col">
                          <div className="w-full aspect-[3/2] bg-secondary/50 flex items-center justify-center relative overflow-hidden shrink-0 border-b border-border">
                            {book.cover_i ? (
                              <img 
                                src={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`} 
                                alt={book.title}
                                className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-700"
                              />
                            ) : (
                              <ImageIcon className="w-10 h-10 text-foreground/10" />
                            )}
                            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-black text-white/40 uppercase border border-white/5">
                                SIGNAL: {((page - 1) * 12) + idx + 1}
                            </div>
                          </div>
                          
                          <div className="flex-1 p-6 flex flex-col gap-4">
                            <div className="space-y-2">
                              <h3 className="text-lg font-headline font-black text-foreground uppercase tracking-tight leading-tight group-hover/item:text-primary transition-colors line-clamp-2">
                                {book.title}
                              </h3>
                              <div className="flex items-center gap-2">
                                 <User className="w-3 h-3 text-primary/40" />
                                 <p className="text-[10px] font-black uppercase text-foreground/50 tracking-widest truncate">
                                    {book.author_name?.[0] || 'Anonymous Identity'}
                                 </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-auto">
                               {book.first_publish_year && (
                                 <Badge variant="outline" className="bg-background/50 text-[8px] font-black uppercase tracking-widest py-0.5 border-white/5">
                                    <Calendar className="w-2.5 h-2.5 mr-1" /> {book.first_publish_year}
                                 </Badge>
                               )}
                               {book.language?.[0] && (
                                 <Badge variant="outline" className="bg-background/50 text-[8px] font-black uppercase tracking-widest py-0.5 border-white/5">
                                    <Languages className="w-2.5 h-2.5 mr-1" /> {book.language[0]}
                                 </Badge>
                               )}
                            </div>
                          </div>
                        </Card>
                      </DialogTrigger>
                      <DialogContent className="glass-card max-w-4xl border-white/10 p-0 overflow-hidden outline-none flex flex-col max-h-[90vh]">
                        <DialogHeader className="p-8 border-b border-white/5 bg-secondary/30 relative shrink-0">
                          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                            <div className="w-48 aspect-[3/4] rounded-2xl overflow-hidden bg-black/40 border-4 border-white/5 shadow-2xl shrink-0">
                               {book.cover_i ? (
                                 <img src={`https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`} className="w-full h-full object-cover" alt="" />
                               ) : (
                                 <div className="w-full h-full flex items-center justify-center opacity-10"><ImageIcon className="w-12 h-12" /></div>
                               )}
                            </div>
                            <div className="text-center md:text-left space-y-4 min-w-0 flex-1">
                               <div className="space-y-1">
                                  <DialogTitle className="text-2xl sm:text-4xl font-headline font-black uppercase tracking-tighter text-foreground leading-none">
                                    {book.title}
                                  </DialogTitle>
                                  <p className="text-primary font-black uppercase text-[10px] tracking-[0.4em]">{book.author_name?.join(', ')}</p>
                               </div>
                               <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black px-3 py-1 uppercase tracking-widest">
                                     {book.first_publish_year} Origin
                                  </Badge>
                                  {book.number_of_pages_median && (
                                    <Badge className="bg-white/5 text-white/40 border-white/10 text-[9px] font-black px-3 py-1 uppercase tracking-widest">
                                       <Hash className="w-3 h-3 mr-1" /> {book.number_of_pages_median} Pages
                                    </Badge>
                                  )}
                               </div>
                            </div>
                          </div>
                        </DialogHeader>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10">
                           <div className="space-y-4">
                              <div className="flex items-center gap-3 text-primary/40">
                                 <Maximize2 className="w-4 h-4" />
                                 <h4 className="text-[11px] font-black uppercase tracking-widest">Thematic Matrix (Subjects)</h4>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                 {book.subject?.slice(0, 15).map((s, i) => (
                                   <Badge key={i} variant="outline" className="bg-secondary/50 border-white/5 text-[9px] font-bold text-foreground/40 uppercase tracking-tighter py-1 px-3">
                                      {s}
                                   </Badge>
                                 )) || <p className="text-[10px] text-foreground/20 italic">No subject data identified.</p>}
                              </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
                              <div className="p-6 rounded-[2rem] bg-secondary/50 border border-border flex items-start gap-4">
                                 <Languages className="w-5 h-5 text-primary/40 shrink-0 mt-1" />
                                 <div className="space-y-1">
                                    <p className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">Linguistic Stream</p>
                                    <p className="text-xs font-bold text-foreground uppercase truncate">
                                       {book.language?.join(', ') || 'Global Protocol'}
                                    </p>
                                 </div>
                              </div>
                              <div className="p-6 rounded-[2rem] bg-secondary/50 border border-border flex items-start gap-4">
                                 <Globe className="w-5 h-5 text-primary/40 shrink-0 mt-1" />
                                 <div className="space-y-1">
                                    <p className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">Registry ID</p>
                                    <p className="text-xs font-mono font-bold text-foreground truncate">{book.key}</p>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="p-6 bg-secondary/30 border-t border-white/5 flex items-center justify-between shrink-0">
                           <span className="text-[8px] font-black uppercase text-foreground/10 tracking-[0.4em]">Hardware-Native Registry</span>
                           <Button asChild className="h-12 px-8 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20">
                              <a href={`https://openlibrary.org${book.key}`} target="_blank" rel="noopener noreferrer">
                                 Open Library Protocol <ExternalLink className="w-3.5 h-3.5 ml-2" />
                              </a>
                           </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
                
                {/* Pagination Controls */}
                <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex flex-col sm:flex-row items-center justify-between gap-6">
                   <div className="flex items-center gap-3">
                      <Button 
                        variant="outline" 
                        onClick={() => handlePageChange('prev')} 
                        disabled={page <= 1 || isLoading}
                        className="h-12 w-12 rounded-xl bg-background border-border"
                      >
                         <ChevronLeft className="w-5 h-5" />
                      </Button>
                      <div className="px-6 h-12 flex items-center justify-center bg-background border border-border rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
                         Matrix Page {page}
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => handlePageChange('next')} 
                        disabled={results.length < 12 || isLoading}
                        className="h-12 w-12 rounded-xl bg-background border-border"
                      >
                         <ChevronRight className="w-5 h-5" />
                      </Button>
                   </div>
                   
                   <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20">
                         <BookOpen className="w-6 h-6" />
                      </div>
                      <div className="text-left space-y-0.5">
                         <h4 className="text-[13px] font-black uppercase text-foreground">Registry Stream</h4>
                         <p className="text-[9px] font-bold text-foreground/20 uppercase tracking-widest">End of identified segment</p>
                      </div>
                   </div>
                </div>
             </div>
           )}
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .bg-checkered {
          background-image: linear-gradient(45deg, #111113 25%, transparent 25%), 
                            linear-gradient(-45deg, #111113 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #111113 75%), 
                            linear-gradient(-45deg, transparent 75%, #111113 75%);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
}

