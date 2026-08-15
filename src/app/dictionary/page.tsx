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
  ArrowRight,
  ExternalLink,
  WholeWord,
  Hash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Definition {
  definition: string;
  example?: string;
  synonyms: string[];
  antonyms: string[];
}

interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
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
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(query.trim().toLowerCase())}`);
      
      if (response.status === 404) {
        setError("Linguistic protocol not found. The word does not exist in our primary matrix.");
      } else if (!response.ok) {
        throw new Error("Network response failed.");
      } else {
        const data = await response.json();
        setResults(data);
        toast({ title: "Word Decoded", description: `Matrix updated for "${query}".` });
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

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Book className="w-3.5 h-3.5" /> Linguistic Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          English <span className="text-primary italic">Dictionary</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl">
          Professional linguistic analysis and definition engine. Decode meanings, phonetics, and usage protocols instantly via our global word matrix.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Search Panel */}
        <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <Languages className="w-6 h-6" />
                </div>
                Search Matrix
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-10">
              <form onSubmit={searchWord} className="space-y-8">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Input Protocol</Label>
                  <div className="relative group/input">
                    <Input 
                      placeholder="e.g. innovation, studio, synthesis..." 
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="h-16 bg-secondary border-border rounded-2xl text-lg font-bold placeholder:text-foreground/20 px-6 pr-14 transition-all focus:ring-primary/40"
                    />
                    <button 
                      type="submit"
                      disabled={isLoading || !query.trim()}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    type="submit"
                    disabled={isLoading || !query.trim()}
                    className="h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20"
                  >
                    Search Word
                  </Button>
                  <Button 
                    variant="outline"
                    type="button"
                    onClick={handleClear}
                    className="h-14 bg-secondary border-border text-foreground/40 hover:text-destructive transition-all rounded-xl uppercase tracking-widest text-[10px]"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Clear
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
            <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Linguistic Protocol</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                Our dictionary utilizes the Free Dictionary API to provide standardized definitions and phonetics. Results are processed and displayed in real-time.
              </p>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          {!results && !isLoading && !error && (
            <Card className="glass-card border-border shadow-2xl h-[500px] flex flex-col items-center justify-center text-center p-12 border-dashed">
              <div className="w-20 h-20 rounded-[2.5rem] bg-secondary flex items-center justify-center text-foreground/10 mb-6">
                <Book className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-headline font-black text-foreground/40 uppercase tracking-widest">Awaiting Definition</h3>
              <p className="text-sm text-foreground/20 font-medium max-w-xs mt-4 uppercase tracking-tighter">
                Enter a word in the search matrix to begin linguistic analysis.
              </p>
            </Card>
          )}

          {isLoading && (
            <Card className="glass-card border-border shadow-2xl h-[500px] flex flex-col items-center justify-center text-center p-12">
               <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                  <Languages className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />
               </div>
               <p className="mt-8 text-[11px] font-black uppercase tracking-[0.3em] text-primary">Fetching Linguistic Data...</p>
            </Card>
          )}

          {error && (
            <Card className="glass-card border-border shadow-2xl h-[500px] flex flex-col items-center justify-center text-center p-12 bg-destructive/5">
              <AlertCircle className="w-16 h-16 text-destructive mb-6 animate-bounce" />
              <h3 className="text-xl font-headline font-black text-destructive uppercase tracking-widest">Extraction Failed</h3>
              <p className="text-sm text-foreground/40 font-medium max-w-sm mt-4 leading-relaxed uppercase tracking-tighter">
                {error}
              </p>
              <Button 
                variant="outline" 
                onClick={handleClear} 
                className="mt-10 h-12 rounded-xl border-destructive/20 text-destructive text-[10px] font-black uppercase tracking-widest px-8"
              >
                Reset Search
              </Button>
            </Card>
          )}

          {results && results.map((entry, entryIndex) => (
            <Card key={entryIndex} className="glass-card border-border shadow-2xl overflow-hidden relative group animate-in zoom-in duration-500">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              
              <CardHeader className="py-10 border-b border-border bg-secondary/30">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h2 className="text-4xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tighter">{entry.word}</h2>
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest">Entry #{entryIndex + 1}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-foreground/40 font-mono text-lg">
                      {entry.phonetic && <span>{entry.phonetic}</span>}
                      {entry.phonetics.find(p => p.audio) && (
                        <button 
                          onClick={() => {
                            const audio = new Audio(entry.phonetics.find(p => p.audio)?.audio);
                            audio.play();
                          }}
                          className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-inner"
                        >
                          <Volume2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="px-4 py-2 rounded-xl bg-background border border-border text-[9px] font-black uppercase text-foreground/30 tracking-widest">
                       Linguistic Result
                     </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-10 pb-12 space-y-12">
                {entry.meanings.map((meaning, mIndex) => (
                  <div key={mIndex} className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Badge className="h-8 px-4 rounded-lg bg-foreground text-background font-black text-[10px] uppercase tracking-widest">
                        {meaning.partOfSpeech}
                      </Badge>
                      <div className="h-[1px] flex-1 bg-border" />
                    </div>

                    <div className="grid gap-4">
                      {meaning.definitions.map((def, dIndex) => (
                        <div key={dIndex} className="group/def relative p-6 md:p-8 rounded-[2rem] bg-secondary/50 border border-border hover:border-primary/20 transition-all">
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-primary/20 rounded-r-full group-hover/def:bg-primary transition-colors" />
                          <div className="flex gap-6">
                             <span className="text-xl font-headline font-black text-primary/20 mt-1">{dIndex + 1}</span>
                             <div className="space-y-4 flex-1">
                                <p className="text-lg md:text-xl font-medium text-foreground leading-relaxed">
                                  {def.definition}
                                </p>
                                {def.example && (
                                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                                    <p className="text-sm italic text-foreground/50 leading-relaxed font-medium">
                                      "{def.example}"
                                    </p>
                                  </div>
                                )}
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
                   <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase text-foreground/30">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Verified Definition
                      </div>
                      {entry.sourceUrls && entry.sourceUrls[0] && (
                        <a 
                          href={entry.sourceUrls[0]} 
                          target="_blank" 
                          className="flex items-center gap-2 text-[10px] font-black uppercase text-primary hover:underline underline-offset-4"
                        >
                          Source Protocol <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                   </div>
                   <div className="flex gap-2">
                     <Button 
                      variant="ghost" 
                      onClick={() => {
                        const allText = entry.meanings.map(m => `${m.partOfSpeech}: ${m.definitions[0].definition}`).join('\n');
                        navigator.clipboard.writeText(`${entry.word.toUpperCase()}\n${allText}`);
                        toast({ title: "Result Copied" });
                      }}
                      className="h-10 rounded-xl text-[9px] font-black uppercase tracking-widest text-foreground/40 hover:text-primary transition-all"
                    >
                      <Copy className="w-3.5 h-3.5 mr-2" /> Copy Entry
                    </Button>
                   </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
