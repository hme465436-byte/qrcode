"use client"

import React, { useState } from 'react';
import { 
  MapPin, 
  Search, 
  Globe, 
  Navigation, 
  Activity, 
  Zap, 
  Loader2, 
  Trash2, 
  RotateCcw, 
  Compass, 
  Hash, 
  ArrowRight,
  Map as MapIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

interface CityData {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
    country: string;
  };
}

export default function CityExplorerPage() {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<CityData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCityData = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const url = `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(query.trim())}&country=Pakistan&format=json&addressdetails=1`;
      const response = await fetch(url, {
        headers: {
          'Accept-Language': 'en'
        }
      });
      const data = await response.json();

      if (data && data.length > 0) {
        setResult(data[0]);
        toast({ title: "Signal Isolated", description: "Geographic matrix mapped successfully." });
      } else {
        setError("Location not identified in the Pakistan regional registry.");
      }
    } catch (err) {
      setError("Uplink failure. Geographic discovery node is unreachable.");
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

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <MapPin className="w-3.5 h-3.5" /> Intelligence Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
                City <span className="text-primary italic">Explorer Studio</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional geographic mapping and address validation. Isolate regional nodes, coordinates, and postal identifiers locally with the OpenStreetMap protocol.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="city-explorer" />
              {(result || query) && (
                <Button variant="outline" size="sm" onClick={handleClear} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                  <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
                </Button>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Input Column */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
               <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                 <Search className="w-5 h-5 text-primary" /> Discovery Protocol
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">City Identifier</Label>
                <div className="relative group/input">
                  <Input 
                    placeholder="Enter city name (e.g. Islamabad)..." 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchCityData()}
                    className="h-16 bg-secondary border-border rounded-2xl text-lg font-bold px-6 focus:ring-primary/40 uppercase"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/input:opacity-100 transition-opacity">
                    <MapIcon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <Button 
                  onClick={fetchCityData} 
                  disabled={isLoading || !query.trim()}
                  className="w-full h-14 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-primary/30 active:scale-95 transition-all"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Zap className="w-5 h-5 mr-2" />}
                  Execute Search
                </Button>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 animate-in shake duration-500">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Result Column */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
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
              
              <CardContent className="flex-1 p-8 sm:p-12 flex flex-col items-center justify-center relative overflow-hidden">
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
                         <Navigation className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                      </div>
                      <p className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">Decoding Geographic Matrix...</p>
                   </div>
                 )}

                 {result && !isLoading && (
                   <div className="w-full space-y-12 animate-in zoom-in-95 duration-500">
                      <div className="text-center space-y-4">
                         <p className="text-[10px] font-black uppercase text-primary tracking-[0.6em]">Validated Identifier</p>
                         <h2 className="text-4xl sm:text-6xl font-headline font-black text-foreground uppercase tracking-tighter leading-none">
                           {result.address.city || result.address.town || result.address.village || query}
                         </h2>
                         <div className="flex flex-wrap justify-center gap-3">
                            <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest px-3 py-1">
                               {result.address.state || 'Autonomous Node'}
                            </Badge>
                            <Badge className="bg-white/5 text-white/40 border-white/10 text-[9px] font-black uppercase tracking-widest px-3 py-1">
                               {result.address.country}
                            </Badge>
                         </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {[
                           { icon: Compass, label: 'Latitude Vector', val: result.lat },
                           { icon: Compass, label: 'Longitude Vector', val: result.lon },
                           { icon: Hash, label: 'Postal Protocol', val: result.address.postcode || 'UNLISTED' },
                           { icon: Globe, label: 'Sovereign Domain', val: result.address.country },
                         ].map((item, i) => (
                           <div key={i} className="p-6 rounded-3xl bg-secondary/50 border border-border group hover:border-primary/20 transition-all flex items-center gap-6">
                              <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all shadow-inner shrink-0">
                                 <item.icon className="w-6 h-6" />
                              </div>
                              <div className="min-w-0">
                                 <p className="text-[8px] font-black uppercase text-foreground/30 tracking-widest mb-0.5">{item.label}</p>
                                 <p className="text-[12px] font-mono font-bold text-foreground truncate uppercase">{item.val}</p>
                              </div>
                           </div>
                         ))}
                      </div>

                      <div className="p-8 rounded-[3rem] bg-secondary border border-border space-y-4 shadow-inner">
                         <Label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-1">Linguistic Address</Label>
                         <p className="text-sm font-medium text-foreground/80 leading-relaxed uppercase">
                            {result.display_name}
                         </p>
                      </div>

                      <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-4">
                         <Button asChild className="h-16 flex-1 bg-white text-black hover:bg-white/90 font-black rounded-2xl flex items-center justify-center gap-4 text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                            <a href={`https://www.openstreetmap.org/#map=13/${result.lat}/${result.lon}`} target="_blank" rel="noopener noreferrer">
                               <MapIcon className="w-5 h-5 mr-1" /> Launch Map Protocol
                            </a>
                         </Button>
                         <Button onClick={() => { navigator.clipboard.writeText(JSON.stringify(result, null, 2)); toast({ title: "Identity Copied" }); }} variant="outline" className="h-16 px-10 border-white/10 bg-white/5 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl">
                            <ArrowRight className="w-5 h-5 mr-2" /> Copy Data
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
