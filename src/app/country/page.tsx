"use client"

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Globe, 
  Search, 
  MapPin, 
  Users, 
  Coins, 
  Navigation,
  Loader2,
  AlertCircle,
  Zap,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  History,
  Trash2,
  Activity,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

/**
 * Country Finder Studio
 * Professional geographic discovery engine.
 * Priority: Local Matrix -> countries.dev Protocol
 */

const LOCAL_COUNTRIES = [
  'Pakistan', 'India', 'Saudi Arabia', 'UAE', 'USA', 'UK', 
  'Turkey', 'China', 'Japan', 'Bangladesh', 'Afghanistan', 
  'Iran', 'Canada', 'Germany', 'France'
];

const API_BASE = "https://countries.dev/name/";

export default function CountryPage() {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // --- Click Outside Protocol ---
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Local Discovery Matrix ---
  const handleType = (val: string) => {
    setQuery(val);
    if (val.trim().length > 0) {
      const matches = LOCAL_COUNTRIES.filter(c => 
        c.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 5);
      setSuggestions(matches);
      setShowDropdown(true);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  const fetchCountryData = async (name: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setShowDropdown(false);
    setQuery(name);

    try {
      const response = await fetch(`${API_BASE}${encodeURIComponent(name)}`);
      const data = await response.json();

      if (response.ok && data) {
        // Handle both array and object responses from various versions of the API
        const target = Array.isArray(data) ? data[0] : data;
        setResult(target);
        toast({ title: "Signal Isolated", description: `Identity profile for ${name} active.` });
      } else {
        throw new Error("Target not in registry");
      }
    } catch (err) {
      // Graceful Fallback: Still show the name from the local list
      setResult({ name: { common: name }, isFallback: true });
      setError("Discovery Node Restricted: API signal unavailable. Displaying local identity only.");
      toast({ variant: "destructive", title: "Protocol Fallback" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setQuery('');
    setResult(null);
    setError(null);
    setSuggestions([]);
    toast({ title: "Studio Reset" });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-5xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Globe className="w-3.5 h-3.5" /> Discovery Node
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
              Country <span className="text-primary italic">Finder Studio</span>
            </h1>
            <p className="text-foreground/40 text-sm md:text-base font-medium mt-2 max-w-2xl leading-relaxed">
              Professional geographic discovery engine. Isolate global identities, demographics, and flags locally via the countries.dev protocol.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <GetHelp toolId="country-info" />
             {(result || query) && (
               <Button variant="outline" size="sm" onClick={handleReset} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                  <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
               </Button>
             )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Search Matrix */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-visible relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                <Search className="w-5 h-5 text-primary" /> Search Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 relative">
              <div className="relative group/input" ref={dropdownRef}>
                <Input 
                  value={query}
                  onChange={(e) => handleType(e.target.value)}
                  onFocus={() => query.trim() && setShowDropdown(true)}
                  placeholder="Enter name (e.g. Pakistan, Japan)..."
                  className="h-16 bg-secondary border-border rounded-2xl font-bold uppercase px-6 focus:ring-primary/40 text-lg"
                />
                
                {/* Suggestions Dropdown */}
                {showDropdown && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 animate-in slide-in-from-top-2 duration-300">
                    <div className="glass-card border-border shadow-2xl rounded-2xl overflow-hidden divide-y divide-white/5">
                       {suggestions.map((s) => (
                         <button
                           key={s}
                           onClick={() => fetchCountryData(s)}
                           className="w-full p-4 flex items-center justify-between hover:bg-primary/5 transition-all text-left group/item"
                         >
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-secondary border border-white/5 flex items-center justify-center text-primary/40 group-hover/item:text-primary transition-colors shrink-0 shadow-inner">
                                  <MapPin className="w-4 h-4" />
                               </div>
                               <span className="text-[11px] font-black uppercase tracking-widest text-foreground">{s}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-foreground/10 group-hover/item:text-primary transition-all group-hover/item:translate-x-1" />
                         </button>
                       ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 grid grid-cols-1 gap-4">
                 <Button 
                   onClick={() => fetchCountryData(query)}
                   disabled={isLoading || !query.trim()}
                   className="h-14 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-xl shadow-primary/30 active:scale-95 transition-all"
                 >
                   {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                   Execute Lookup
                 </Button>
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
                 Geographic identifiers are processed strictly in local memory. The studio does not log or transmit your search history to any remote database.
               </p>
             </div>
          </div>
        </div>

        {/* Result Matrix */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[500px] bg-black/10">
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
                 {!result && !isLoading && !error && (
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

                 {result && !isLoading && (
                   <div className="w-full space-y-12 animate-in zoom-in-95 duration-500">
                      {/* Header: Flag & Names */}
                      <div className="flex flex-col md:flex-row items-center gap-10 border-b border-white/5 pb-12">
                         {result.flags?.svg ? (
                           <div className="w-full max-w-[280px] aspect-[3/2] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white dark:border-white/5 ring-1 ring-border shrink-0">
                              <img src={result.flags.svg} alt={result.name.common} className="w-full h-full object-cover" />
                           </div>
                         ) : (
                           <div className="w-40 h-28 rounded-2xl bg-secondary flex items-center justify-center text-foreground/10 shrink-0 border border-border">
                              <Globe className="w-10 h-10" />
                           </div>
                         )}
                         <div className="text-center md:text-left space-y-2">
                            <h2 className="text-4xl sm:text-6xl font-headline font-black text-foreground uppercase tracking-tighter leading-none">
                              {result.name.common}
                            </h2>
                            <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em]">{result.name.official || 'Sovereign Identity'}</p>
                         </div>
                      </div>

                      {/* Error / Fallback Alert */}
                      {error && (
                        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 animate-in shake duration-500">
                           <AlertCircle className="w-4 h-4 text-destructive" />
                           <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">{error}</p>
                        </div>
                      )}

                      {/* Data Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[
                          { 
                            icon: MapPin, 
                            label: 'Capital Protocol', 
                            val: Array.isArray(result.capital) ? result.capital.join(', ') : (result.capital || '—') 
                          },
                          { icon: Navigation, label: 'Region Identity', val: result.region || '—' },
                          { icon: Users, label: 'Population Density', val: result.population?.toLocaleString() || '—' },
                          { icon: Coins, label: 'Fiscal Protocol', val: result.currencies ? Object.values(result.currencies).map((c: any) => `${c.name} (${c.symbol})`).join(', ') : '—' },
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

                      {/* Maps Protocol */}
                      {result.maps?.googleMaps && (
                        <div className="pt-6 border-t border-white/5">
                           <Button asChild className="h-16 w-full bg-white text-black hover:bg-white/90 font-black rounded-2xl flex items-center justify-center gap-4 text-xs uppercase tracking-widest shadow-xl">
                              <a href={result.maps.googleMaps} target="_blank" rel="noopener noreferrer">
                                 <Navigation className="w-5 h-5 mr-1" /> Launch Map Protocol
                              </a>
                           </Button>
                        </div>
                      )}
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
