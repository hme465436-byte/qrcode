
"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Globe, 
  Search, 
  MapPin, 
  Users, 
  Coins, 
  Languages, 
  Maximize, 
  Clock, 
  Navigation, 
  ExternalLink,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Activity,
  Zap,
  Trash2,
  Compass,
  ArrowRight,
  RefreshCcw,
  Smartphone,
  Navigation2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

interface CountryData {
  name: {
    common: string;
    official: string;
    nativeName?: Record<string, { common: string }>;
  };
  cca2: string;
  flags: { svg: string; png: string; alt?: string };
  capital: string[];
  region: string;
  subregion: string;
  languages: Record<string, string>;
  currencies: Record<string, { name: string; symbol: string }>;
  population: number;
  area: number;
  timezones: string[];
  maps: { googleMaps: string };
}

export default function CountryInfoPage() {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{name: string, cca2: string, flag: string}[]>([]);
  const [country, setCountry] = useState<CountryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Suggestion Protocol ---
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(query)}?fields=name,flags,cca2`);
        if (res.ok) {
          const data = await res.json();
          const list = data.slice(0, 5).map((c: any) => ({
            name: c.name.common,
            cca2: c.cca2,
            flag: c.flags.png
          }));
          setSuggestions(list);
        }
      } catch (e) {}
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const fetchCountry = async (id: string, isFullMatch = false) => {
    setIsLoading(true);
    setError(null);
    setCountry(null);
    setSuggestions([]);
    setQuery('');

    try {
      const url = isFullMatch 
        ? `https://restcountries.com/v3.1/name/${encodeURIComponent(id)}?fullText=true`
        : `https://restcountries.com/v3.1/alpha/${id}`;
        
      const response = await fetch(url);
      if (!response.ok) throw new Error("Location matrix unreachable.");
      
      const data = await response.json();
      setCountry(data[0]);
      toast({ title: "Signal Isolated", description: `Clinical profile for ${data[0].name.common} active.` });
    } catch (err) {
      setError("Discovery Node Failure: Target identity not identified.");
      toast({ variant: "destructive", title: "Protocol Failed" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setQuery('');
    setCountry(null);
    setError(null);
    setSuggestions([]);
    toast({ title: "Studio Reset" });
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
                Country Info <span className="text-primary italic">Studio</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional geographic diagnostic unit. Isolate global identities, demographic matrices, and fiscal protocols locally and securely.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="country-info" />
              {(country || error || query) && (
                <Button variant="outline" size="sm" onClick={handleReset} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                   <Trash2 className="w-3.5 h-3.5 mr-2" /> Reset
                </Button>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Discovery */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
           <Card className="glass-card border-border shadow-2xl overflow-visible relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
              <CardHeader className="pb-8 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Search className="w-5 h-5 text-primary" /> Discovery Protocol
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-10 space-y-6 relative">
                 <div className="relative group/input">
                    <Input 
                      placeholder="Search name (e.g. Pakistan, Japan)..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="h-16 bg-secondary border-border rounded-2xl text-sm font-bold px-6 focus:ring-primary/40 uppercase"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/input:opacity-100 transition-opacity">
                       <Navigation className="w-6 h-6 text-primary" />
                    </div>

                    {/* Suggestions Matrix */}
                    {suggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-2 z-50 animate-in slide-in-from-top-2 duration-300">
                         <div className="glass-card border-border shadow-2xl rounded-2xl overflow-hidden divide-y divide-white/5">
                            {suggestions.map((s) => (
                              <button 
                                key={s.cca2}
                                onClick={() => fetchCountry(s.cca2)}
                                className="w-full p-4 flex items-center gap-4 hover:bg-primary/5 transition-all text-left"
                              >
                                 <div className="w-10 h-7 rounded-md overflow-hidden border border-white/10 shrink-0 shadow-sm">
                                    <img src={s.flag} className="w-full h-full object-cover" alt="" />
                                 </div>
                                 <span className="text-[10px] font-black uppercase tracking-widest text-foreground">{s.name}</span>
                              </button>
                            ))}
                         </div>
                      </div>
                    )}
                 </div>

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
                 Identity discovery occurs strictly within your browser's volatile memory. No search history or geographic interest is logged to remote registries.
               </p>
             </div>
          </div>
        </div>

        {/* Right Column: Results Matrix */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px] bg-black/10">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <Activity className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Identity Profile</CardTitle>
                 </div>
              </CardHeader>
              
              <CardContent className="flex-1 p-8 sm:p-16 flex flex-col items-center justify-center relative overflow-hidden">
                 {!country && !isLoading && !error && (
                   <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-6 py-20">
                      <Globe className="w-24 h-24 text-primary" />
                      <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Discovery Signal</p>
                   </div>
                 )}

                 {isLoading && (
                   <div className="flex-1 flex flex-col items-center justify-center space-y-10 py-20">
                      <div className="relative">
                         <div className="w-28 h-28 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                         <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                      </div>
                      <p className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">Decoding Geographic Matrix...</p>
                   </div>
                 )}

                 {country && !isLoading && (
                   <div className="w-full space-y-12 animate-in zoom-in-95 duration-500">
                      {/* Flag & Primary Headers */}
                      <div className="flex flex-col md:flex-row items-center gap-10 border-b border-white/5 pb-12">
                         <div className="w-full max-w-[280px] aspect-[3/2] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white dark:border-white/5 ring-1 ring-border shrink-0">
                            <img src={country.flags.svg} alt={country.flags.alt || country.name.common} className="w-full h-full object-cover" />
                         </div>
                         <div className="text-center md:text-left space-y-4">
                            <div className="space-y-1">
                               <h2 className="text-4xl sm:text-6xl font-headline font-black text-foreground uppercase tracking-tighter leading-none">{country.name.common}</h2>
                               <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em]">{country.name.official}</p>
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3">
                               <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest px-3 py-1">Code: {country.cca2}</Badge>
                               <Badge className="bg-white/5 text-white/40 border-white/10 text-[9px] font-black uppercase tracking-widest px-3 py-1">{country.region} / {country.subregion}</Badge>
                            </div>
                         </div>
                      </div>

                      {/* Technical Matrix Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         {[
                           { icon: MapPin, label: 'Capital Protocol', val: country.capital?.join(', ') || '—' },
                           { icon: Users, label: 'Population Density', val: country.population.toLocaleString() },
                           { icon: Maximize, label: 'Land Mass (sq km)', val: country.area.toLocaleString() },
                           { icon: Coins, label: 'Fiscal Protocol', val: Object.values(country.currencies || {}).map(c => `${c.name} (${c.symbol})`).join(', ') || '—' },
                           { icon: Languages, label: 'Linguistic Stream', val: Object.values(country.languages || {}).join(', ') || '—' },
                           { icon: Clock, label: 'Temporal Matrix', val: country.timezones[0] },
                         ].map((item, i) => (
                           <div key={i} className="p-6 rounded-3xl bg-secondary/50 border border-border group hover:border-primary/20 transition-all flex items-center gap-6">
                              <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all shadow-inner shrink-0">
                                 <item.icon className="w-6 h-6" />
                              </div>
                              <div className="min-w-0">
                                 <p className="text-[8px] font-black uppercase text-foreground/30 tracking-widest mb-0.5">{item.label}</p>
                                 <p className="text-[13px] font-bold text-foreground truncate uppercase">{item.val}</p>
                              </div>
                           </div>
                         ))}
                      </div>

                      {/* Navigation Link */}
                      <div className="pt-6 border-t border-white/5">
                         <Button asChild className="h-16 w-full bg-white text-black hover:bg-white/90 font-black rounded-2xl flex items-center justify-center gap-4 text-xs uppercase tracking-widest shadow-xl">
                            <a href={country.maps.googleMaps} target="_blank" rel="noopener noreferrer">
                               <Navigation2 className="w-5 h-5 mr-1" /> Launch Map Protocol
                            </a>
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
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
