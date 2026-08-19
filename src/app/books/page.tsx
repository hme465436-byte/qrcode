"use client"

import React, { useState } from 'react';
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
  ExternalLink,
  History,
  Settings2,
  ShieldCheck,
  Globe,
  ImageIcon,
  Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

interface BookEntry {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
}

export default function BooksPage() {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BookEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query.trim())}`);
      const data = await response.json();

      if (data.docs && data.docs.length > 0) {
        setResults(data.docs.slice(0, 10));
        toast({ title: "Matrix Synced", description: `Isolated ${Math.min(10, data.docs.length)} relevant signals.` });
      } else {
        setError("Zero matches identified in the Open Library registry.");
      }
    } catch (err) {
      setError("Matrix Retrieval Failure: Discovery nodes are unreachable.");
      toast({ variant: "destructive", title: "Protocol Failed" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
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
              <form onSubmit={handleSearch} className="space-y-6">
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
             <div className="grid grid-cols-1 gap-6 animate-in zoom-in-95 duration-500">
                {results.map((book, idx) => (
                  <Card key={book.key} className="glass-card border-border shadow-xl hover:border-primary/20 transition-all group/item overflow-hidden">
                     <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-48 aspect-[3/4] bg-secondary/50 flex items-center justify-center relative overflow-hidden shrink-0 border-b md:border-b-0 md:border-r border-border">
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
                              ID: {idx + 1}
                           </div>
                        </div>
                        
                        <div className="flex-1 p-8 flex flex-col justify-between">
                           <div className="space-y-4">
                              <div className="space-y-1">
                                 <h3 className="text-xl sm:text-2xl font-headline font-black text-foreground uppercase tracking-tight leading-tight group-hover/item:text-primary transition-colors">
                                   {book.title}
                                 </h3>
                                 <div className="flex items-center gap-3">
                                    <User className="w-3.5 h-3.5 text-primary/40" />
                                    <p className="text-[11px] font-black uppercase text-foreground/50 tracking-widest truncate max-w-[300px]">
                                       {book.author_name?.join(', ') || 'Anonymous Identity'}
                                    </p>
                                 </div>
                              </div>
                              
                              <div className="flex flex-wrap gap-3">
                                 {book.first_publish_year && (
                                   <Badge className="bg-secondary text-foreground/40 border-border text-[9px] font-black uppercase tracking-widest px-3 py-1">
                                      <Calendar className="w-3 h-3 mr-2" /> {book.first_publish_year} Origin
                                   </Badge>
                                 )}
                                 <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest px-3 py-1">
                                    Clinical Metadata
                                 </Badge>
                              </div>
                           </div>

                           <div className="pt-8 flex items-center justify-between border-t border-white/5">
                              <span className="text-[8px] font-black text-foreground/10 uppercase tracking-[0.4em]">Hardware-Native Registry</span>
                              <Button asChild variant="ghost" size="sm" className="h-9 px-4 rounded-xl text-primary text-[9px] font-black uppercase tracking-widest hover:bg-primary/10">
                                 <a href={`https://openlibrary.org${book.key}`} target="_blank" rel="noopener noreferrer">
                                    View Logic <ExternalLink className="w-3 h-3 ml-2" />
                                 </a>
                              </Button>
                           </div>
                        </div>
                     </div>
                  </Card>
                ))}
                
                <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex flex-col sm:flex-row items-center justify-between gap-6">
                   <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20">
                         <Maximize2 className="w-6 h-6" />
                      </div>
                      <div className="space-y-0.5">
                         <h4 className="text-[13px] font-black uppercase text-foreground">Matrix Complete</h4>
                         <p className="text-[9px] font-bold text-foreground/20 uppercase tracking-widest">End of identified results</p>
                      </div>
                   </div>
                   <Button variant="outline" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="h-12 px-8 rounded-xl border-border bg-background text-[9px] font-black uppercase tracking-widest">
                      Back to Matrix Input
                   </Button>
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
