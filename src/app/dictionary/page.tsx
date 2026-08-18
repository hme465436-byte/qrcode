"use client"

import React, { useState } from 'react';
import { 
  Book, 
  Search, 
  Volume2, 
  Trash2, 
  Info,
  CheckCircle2,
  Languages,
  AlertCircle,
  Loader2,
  ExternalLink,
  RotateCcw,
  AlignLeft,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

interface Definition {
  definition: string;
  example?: string;
  synonyms: string[];
  antonyms: string[];
}

interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
  synonyms: string[];
  antonyms: string[];
}

interface Phonetic {
  text?: string;
  audio?: string;
}

interface DictionaryEntry {
  word: string;
  phonetic?: string;
  phonetics: Phonetic[];
  meanings: Meaning[];
  sourceUrls: string[];
}

export default function DictionaryPage() {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DictionaryEntry[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchWord = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return;

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanQuery)}`);
      
      if (response.status === 404) {
        setError("Linguistic protocol not found. The word does not exist in our primary matrix.");
      } else if (!response.ok) {
        throw new Error("Network response failed.");
      } else {
        const data = await response.json();
        setResults(data);
        toast({ title: "Word Decoded", description: `Matrix updated for "${cleanQuery}".` });
      }
    } catch (err) {
      setError("API connection failure. Please check your uplink and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults(null);
    setError(null);
    toast({ title: "Studio Reset", description: "Search buffers cleared." });
  };

  const playAudio = (url: string) => {
    const audio = new Audio(url);
    audio.play().catch(e => toast({ variant: "destructive", title: "Acoustic Error", description: "Audio stream restricted." }));
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Book className="w-3.5 h-3.5" /> Linguistic Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
                English <span className="text-primary italic">Dictionary Studio</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional linguistic analysis and definition engine. Access high-fidelity meanings, phonetic matrices, and audio pronunciations locally with 1:1 textual fidelity.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="dictionary" />
              {(results || query) && (
                <Button variant="outline" size="sm" onClick={handleClear} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                  <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
                </Button>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Search Panel */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                <Search className="w-5 h-5 text-primary" /> Discovery Node
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-10">
              <form onSubmit={searchWord} className="space-y-8">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Linguistic Input</Label>
                  <div className="relative group/input">
                    <Input 
                      placeholder="Type a word (e.g. Protocol)..." 
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="h-16 bg-secondary border-border rounded-2xl text-lg font-bold placeholder:text-foreground/20 px-6 pr-14 transition-all focus:ring-primary/40 uppercase"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/input:opacity-100 transition-opacity">
                      <Languages className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit"
                  disabled={isLoading || !query.trim()}
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl uppercase tracking-widest text-xs shadow-xl shadow-primary/30 transition-all active:scale-95"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Zap className="w-5 h-5 mr-2" />}
                  Execute Search
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
             <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
             </div>
             <div className="space-y-2">
               <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Privacy Sovereign</h4>
               <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                 Linguistic queries are processed strictly in your browser session. The studio does not log or transmit your search history to any database.
               </p>
             </div>
          </div>
        </div>

        {/* Right Column: Results Panel */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          {!results && !isLoading && !error && (
            <Card className="glass-card border-border shadow-2xl h-[500px] flex flex-col items-center justify-center text-center p-12 border-dashed bg-black/10">
              <div className="w-20 h-20 rounded-[2.5rem] bg-secondary flex items-center justify-center text-foreground/10 mb-6">
                <Book className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-headline font-black text-foreground/40 uppercase tracking-widest">Awaiting Definition</h3>
              <p className="text-sm text-foreground/20 font-medium max-w-xs mt-4 uppercase tracking-tighter">
                Enter a word in the search matrix to isolate its clinical linguistic data.
              </p>
            </Card>
          )}

          {isLoading && (
            <Card className="glass-card border-border shadow-2xl h-[500px] flex flex-col items-center justify-center text-center p-12">
               <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                  <Languages className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />
               </div>
               <p className="mt-8 text-[11px] font-black uppercase tracking-[0.3em] text-primary">Negotiating Linguistic Stream...</p>
            </Card>
          )}

          {error && (
            <Card className="glass-card border-border shadow-2xl h-[500px] flex flex-col items-center justify-center text-center p-12 bg-destructive/5 animate-in shake duration-500">
              <AlertCircle className="w-16 h-16 text-destructive mb-6 animate-bounce" />
              <h3 className="text-xl font-headline font-black text-destructive uppercase tracking-widest">Protocol Failed</h3>
              <p className="text-sm text-foreground/40 font-medium max-w-sm mt-4 leading-relaxed uppercase tracking-tighter">
                {error}
              </p>
            </Card>
          )}

          {results && results.map((entry, entryIndex) => (
            <div key={entryIndex} className="space-y-10 animate-in zoom-in-95 duration-500">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
                <div className="space-y-4">
                   <div className="flex items-center gap-4">
                      <h2 className="text-5xl md:text-7xl font-headline font-black text-foreground uppercase tracking-tighter leading-none">{entry.word}</h2>
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-widest px-3 py-1">#{entryIndex + 1}</Badge>
                   </div>
                  <div className="flex flex-wrap items-center gap-6">
                    {entry.phonetic && <span className="text-primary font-mono text-xl tracking-widest">{entry.phonetic}</span>}
                    {entry.phonetics.map((p, i) => p.audio && (
                      <button 
                        key={i}
                        onClick={() => playAudio(p.audio!)}
                        className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-inner group"
                        title="Play Pronunciation"
                      >
                        <Volume2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-12">
                {entry.meanings.map((meaning, mIndex) => (
                  <div key={mIndex} className="space-y-8 animate-reveal" style={{ animationDelay: `${mIndex * 100}ms` }}>
                    <div className="flex items-center gap-6">
                      <span className="italic font-headline font-black text-2xl text-primary/40 uppercase tracking-tighter">{meaning.partOfSpeech}</span>
                      <div className="h-[1px] flex-1 bg-white/5" />
                    </div>

                    <div className="grid gap-8">
                      {meaning.definitions.map((def, dIndex) => (
                        <div key={dIndex} className="space-y-4 group">
                          <div className="flex gap-6">
                             <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-[10px] font-black text-foreground/20 group-hover:text-primary group-hover:border-primary/40 transition-all shrink-0">
                                {dIndex + 1}
                             </div>
                             <div className="space-y-4 flex-1 min-w-0">
                                <p className="text-lg sm:text-2xl font-medium text-foreground/80 leading-relaxed">
                                  {def.definition}
                                </p>
                                {def.example && (
                                  <div className="p-4 rounded-2xl bg-secondary/30 border-l-4 border-primary/40 italic text-foreground/40 font-medium leading-relaxed">
                                    "{def.example}"
                                  </div>
                                )}
                                
                                {/* Synonyms Logic */}
                                {(def.synonyms?.length > 0 || meaning.synonyms?.length > 0) && (
                                   <div className="flex flex-wrap gap-2 pt-2">
                                      <span className="text-[8px] font-black text-primary/40 uppercase tracking-[0.2em] mt-1 mr-2">Synonyms:</span>
                                      {[...(def.synonyms || []), ...(meaning.synonyms || [])].slice(0, 8).map((s, si) => (
                                        <Badge key={si} onClick={() => { setQuery(s); searchWord(); }} className="cursor-pointer bg-white/5 text-foreground/40 border-white/10 hover:text-primary transition-all text-[9px] font-bold uppercase py-1 px-3">
                                          {s}
                                        </Badge>
                                      ))}
                                   </div>
                                )}
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                 <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase text-foreground/20 tracking-widest">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Clinical Protocol Verified
                    </div>
                    {entry.sourceUrls && entry.sourceUrls[0] && (
                      <a 
                        href={entry.sourceUrls[0]} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[9px] font-black uppercase text-primary/40 hover:text-primary hover:underline underline-offset-4 transition-all tracking-widest"
                      >
                        Linguistic Source <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                 </div>
              </div>
            </div>
          ))}

          {/* Clinical Features Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="p-6 rounded-[2.5rem] bg-secondary border border-border flex items-start gap-5 group hover:border-primary/20 transition-all">
                <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all shadow-inner">
                   <AlignLeft className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                   <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest">Meaning Density</h4>
                   <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">Deep extraction of multiple parts of speech and usage examples for peak context.</p>
                </div>
             </div>
             <div className="p-6 rounded-[2.5rem] bg-secondary border border-border flex items-start gap-5 group hover:border-primary/20 transition-all">
                <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all shadow-inner">
                   <Activity className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                   <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest">Acoustic Signal</h4>
                   <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">Direct synchronization with hardware audio buffers for original pronunciation playback.</p>
                </div>
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
