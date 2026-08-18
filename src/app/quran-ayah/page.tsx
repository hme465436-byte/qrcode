"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { 
  BookOpen, 
  RefreshCcw, 
  Copy, 
  Search, 
  Languages, 
  Sparkles, 
  CheckCircle2, 
  Info,
  Zap,
  Activity,
  ArrowRight,
  Loader2,
  Book,
  Globe,
  Quote,
  Trash2,
  Hash,
  ShieldCheck,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

interface AyahData {
  number: number;
  text: string;
  translation: string;
  urduTranslation?: string;
  surah: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
  };
  numberInSurah: number;
}

export default function QuranAyahPage() {
  const { toast } = useToast();
  const [ayah, setAyah] = useState<AyahData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [error, setLocalError] = useState<string | null>(null);

  const fetchAyah = useCallback(async (reference: string | number = 'random') => {
    setIsLoading(true);
    setLocalError(null);
    try {
      // 1. Fetch English Translation (Asad) from the correct Cloud endpoint
      const transUrl = reference === 'random' 
        ? `https://api.alquran.cloud/v1/ayah/random/en.asad`
        : `https://api.alquran.cloud/v1/ayah/${reference}/en.asad`;
      
      const transRes = await fetch(transUrl);
      const transJson = await transRes.json();
      
      if (transJson.code !== 200) {
        throw new Error("Reference not identified. Ensure correct Surah:Ayah format (e.g. 2:255).");
      }
      
      const data = transJson.data;
      const ayahNumber = data.number;
      
      // 2. Parallel Fetch for Arabic and Urdu
      const [arabicRes, urduRes] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/ayah/${ayahNumber}/quran-uthmani`),
        fetch(`https://api.alquran.cloud/v1/ayah/${ayahNumber}/ur.jalandhry`).catch(() => null)
      ]);

      const arabicJson = await arabicRes.json();
      let urduTranslation = undefined;
      
      if (urduRes) {
        const urduJson = await urduRes.json();
        if (urduJson.code === 200) {
          urduTranslation = urduJson.data.text;
        }
      }
      
      setAyah({
        number: ayahNumber,
        text: arabicJson.data.text,
        translation: data.text,
        urduTranslation,
        surah: data.surah,
        numberInSurah: data.numberInSurah
      });

      if (reference !== 'random') {
        toast({ title: "Reference Isolated", description: `Surah ${data.surah.englishName} : ${data.numberInSurah}` });
      }
    } catch (err: any) {
      console.error(err);
      setLocalError(err.message || "Protocol Failure");
      toast({ variant: "destructive", title: "Protocol Failure", description: err.message || "Could not retrieve ayah matrix." });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAyah();
  }, [fetchAyah]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    fetchAyah(searchQuery.trim());
    setSearchQuery('');
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(label);
    toast({ title: `${label} Copied`, description: "Linguistic matrix saved to clipboard." });
    setTimeout(() => setIsCopied(null), 2000);
  };

  const handleCopyAll = () => {
    if (!ayah) return;
    const text = `Arabic: ${ayah.text}\n\nEnglish: ${ayah.translation}${ayah.urduTranslation ? `\n\nUrdu: ${ayah.urduTranslation}` : ''}\n\n[Surah ${ayah.surah.englishName} ${ayah.surah.number}:${ayah.numberInSurah}]`;
    handleCopy(text, 'Full Matrix');
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <BookOpen className="w-3.5 h-3.5" /> Linguistic Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <h1 className="text-3xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
                Quran Ayah <span className="text-primary italic">Studio</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional linguistic discovery engine. Explore the Quranic matrix through random synthesis or clinical reference lookups with 1:1 textual fidelity in Arabic, English, and Urdu.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="quran-ayah" />
              {(ayah || error || searchQuery) && (
                <Button variant="outline" size="sm" onClick={() => fetchAyah()} disabled={isLoading} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-primary transition-all">
                  <RefreshCcw className={cn("w-3.5 h-3.5 mr-2", isLoading && "animate-spin")} /> New Ayah
                </Button>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls - Left */}
        <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
               <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                 <Search className="w-5 h-5 text-primary" /> Discovery Node
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
              <form onSubmit={handleSearch} className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Reference Protocol</Label>
                <div className="relative group/input">
                  <Input 
                    placeholder="e.g. 2:255 or 1"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-14 bg-secondary border-border rounded-xl text-center text-lg font-bold tracking-widest focus:ring-primary/40 uppercase"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/input:opacity-100 transition-opacity">
                    <Hash className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <Button type="submit" disabled={isLoading || !searchQuery.trim()} className="w-full h-12 bg-primary text-white font-black text-[9px] uppercase tracking-widest rounded-xl shadow-xl shadow-primary/30">
                   {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />} Execute Lookup
                </Button>
                <p className="text-[9px] text-foreground/20 font-bold uppercase tracking-widest text-center">Enter Surah:Ayah or Ayah Number</p>
              </form>

              <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-3">
                 {[
                   { label: 'The Opening', ref: '1:1' },
                   { label: 'Ayat-ul-Kursi', ref: '2:255' },
                   { label: 'Last Verses', ref: '2:285' },
                   { label: 'The Bee', ref: '16:1' }
                 ].map(preset => (
                   <button 
                    key={preset.ref} 
                    onClick={() => fetchAyah(preset.ref)}
                    className="h-10 px-4 rounded-xl border border-border bg-secondary/50 text-[8px] font-black uppercase text-foreground/40 hover:text-primary transition-all"
                   >
                     {preset.label}
                   </button>
                 ))}
              </div>
            </CardContent>
          </Card>

          <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
             <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
             </div>
             <div className="space-y-2">
               <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Privacy Sovereign</h4>
               <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                 Linguistic queries are processed strictly in your browser session. The studio does not log or transmit your reading history to any database.
               </p>
             </div>
          </div>
        </div>

        {/* Results - Right */}
        <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px] bg-black/10">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <Activity className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Linguistic Matrix</CardTitle>
                 </div>
                 {ayah && (
                    <div className="flex gap-2">
                       <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest">
                          {ayah.surah.englishName} {ayah.surah.number}:{ayah.numberInSurah}
                       </Badge>
                    </div>
                 )}
              </CardHeader>
              
              <CardContent className="flex-1 p-8 sm:p-16 flex flex-col gap-12 relative overflow-hidden">
                 {!ayah && !isLoading && !error && (
                   <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-6 py-20">
                      <Book className="w-24 h-24 text-primary" />
                      <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Signal Detection</p>
                   </div>
                 )}

                 {isLoading && (
                   <div className="flex-1 flex flex-col items-center justify-center space-y-10 py-20">
                      <div className="relative">
                         <div className="w-28 h-28 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                         <Globe className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                      </div>
                      <p className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">Decoding Textual Buffer...</p>
                   </div>
                 )}

                 {error && !isLoading && (
                   <div className="flex flex-col items-center gap-8 py-20 text-center animate-in shake duration-500">
                      <AlertCircle className="w-16 h-16 text-destructive animate-bounce" />
                      <div className="space-y-2">
                         <h3 className="text-xl font-headline font-black text-destructive uppercase">Reference Failure</h3>
                         <p className="text-[11px] text-foreground/40 font-bold uppercase max-w-sm mx-auto leading-relaxed">{error}</p>
                      </div>
                      <Button onClick={() => fetchAyah()} variant="outline" className="h-12 bg-secondary border border-border text-foreground font-black rounded-xl text-[9px] uppercase tracking-widest">Randomize Protocol</Button>
                   </div>
                 )}

                 {ayah && !isLoading && (
                   <div className="w-full space-y-12 animate-in zoom-in-95 duration-500">
                      {/* Arabic Script */}
                      <div className="text-center space-y-8">
                         <div className="flex flex-col items-center gap-4">
                            <h3 className="text-3xl sm:text-5xl font-bold text-primary font-headline tracking-tight">{ayah.surah.name}</h3>
                            <p className="text-[10px] font-black uppercase text-foreground/30 tracking-[0.6em]">{ayah.surah.englishNameTranslation}</p>
                         </div>
                         
                         <div className="p-10 rounded-[3rem] bg-white/5 border border-white/5 shadow-2xl relative overflow-hidden group/arab">
                            <div className="absolute top-0 right-0 p-6 text-white/5 font-mono text-[80px] leading-none pointer-events-none">{ayah.numberInSurah}</div>
                            <p className="text-4xl sm:text-6xl md:text-7xl font-medium text-foreground leading-[1.6] text-center" dir="rtl">
                               {ayah.text}
                            </p>
                            <button 
                              onClick={() => handleCopy(ayah.text, 'Arabic')}
                              className="absolute bottom-4 left-4 p-3 rounded-xl bg-white/5 text-white/20 hover:text-primary transition-all opacity-0 group-hover/arab:opacity-100"
                            >
                               {isCopied === 'Arabic' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                         </div>
                      </div>

                      {/* Urdu Translation */}
                      {ayah.urduTranslation && (
                        <div className="relative p-10 rounded-[2.5rem] bg-emerald-500/[0.03] border border-emerald-500/10 group/urdu overflow-hidden">
                           <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/20 group-hover/urdu:bg-emerald-500 transition-all" />
                           <div className="space-y-6 relative z-10 text-center">
                              <p className="text-2xl sm:text-4xl font-medium text-foreground/90 leading-relaxed" dir="rtl">
                                 {ayah.urduTranslation}
                              </p>
                              <div className="flex items-center justify-center gap-3 pt-4">
                                 <div className="h-[1px] w-8 bg-emerald-500/40" />
                                 <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Urdu Protocol: Fateh Muhammad Jalandhry</p>
                              </div>
                           </div>
                           <button 
                              onClick={() => handleCopy(ayah.urduTranslation!, 'Urdu')}
                              className="absolute bottom-4 left-4 p-3 rounded-xl bg-emerald-500/10 text-emerald-500/40 hover:text-emerald-500 transition-all opacity-0 group-hover/urdu:opacity-100"
                            >
                               {isCopied === 'Urdu' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                      )}

                      {/* English Translation */}
                      <div className="relative p-10 rounded-[2.5rem] bg-secondary/30 border border-border group/trans overflow-hidden">
                         <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover/trans:bg-primary transition-all" />
                         <Quote className="absolute -top-4 -right-4 w-32 h-32 text-white/5 -rotate-12" />
                         <div className="space-y-6 relative z-10">
                            <p className="text-xl sm:text-2xl font-medium text-foreground/80 leading-relaxed italic">
                               "{ayah.translation}"
                            </p>
                            <div className="flex items-center gap-3 pt-4">
                               <div className="h-[1px] w-8 bg-primary/40" />
                               <p className="text-[10px] font-black uppercase tracking-widest text-primary">English Protocol: Muhammad Asad</p>
                            </div>
                         </div>
                         <button 
                            onClick={() => handleCopy(ayah.translation, 'English')}
                            className="absolute bottom-4 left-4 p-3 rounded-xl bg-white/5 text-white/20 hover:text-primary transition-all opacity-0 group-hover/trans:opacity-100"
                          >
                             {isCopied === 'English' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                      </div>

                      {/* Actions Row */}
                      <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-4">
                         <Button onClick={handleCopyAll} className="h-16 flex-1 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl hover:bg-white/90 active:scale-95 transition-all">
                            {isCopied === 'Full Matrix' ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                            Copy Full Matrix
                         </Button>
                         <Button onClick={() => fetchAyah()} variant="outline" className="h-16 px-10 border-white/10 bg-white/5 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl active:scale-95 transition-all">
                            <RefreshCcw className="w-5 h-5" />
                         </Button>
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
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
