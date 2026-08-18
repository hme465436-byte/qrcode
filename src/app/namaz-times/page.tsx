"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Clock, 
  MapPin, 
  RefreshCcw, 
  Search, 
  Trash2, 
  CheckCircle2, 
  Info,
  Calendar,
  Zap,
  Activity,
  ShieldCheck,
  Moon,
  Sun,
  Navigation2,
  Timer,
  ChevronRight,
  ArrowRight,
  Loader2,
  Book,
  Globe,
  Bell,
  Scale
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

const STORAGE_KEY = 'mykit_namaz_last_city';

interface Timings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface NamazData {
  timings: Timings;
  date: {
    readable: string;
    hijri: {
      day: string;
      month: { en: string; ar: string };
      year: string;
    };
  };
  meta: {
    timezone: string;
    method: { name: string };
  };
}

export default function NamazTimesPage() {
  const { toast } = useToast();
  
  // Input State
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Pakistan');
  const [useHanafi, setUseHanafi] = useState(true);
  
  // Result State
  const [data, setData] = useState<NamazData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; countdown: string } | null>(null);

  // --- Logic Matrix ---

  const fetchTimings = useCallback(async (isGps = false, lat?: number, lon?: number) => {
    setIsLoading(true);
    setError(null);

    const school = useHanafi ? 1 : 0; // 1 = Hanafi, 0 = Shafi/Standard
    const method = 1; // University of Islamic Sciences, Karachi
    
    let url = "";
    if (isGps) {
      url = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=${method}&school=${school}`;
    } else {
      const searchCity = city.trim() || localStorage.getItem(STORAGE_KEY) || 'Karachi';
      url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(searchCity)}&country=${encodeURIComponent(country)}&method=${method}&school=${school}`;
    }

    try {
      const response = await fetch(url);
      const json = await response.json();
      
      if (json.code === 200) {
        setData(json.data);
        if (!isGps) localStorage.setItem(STORAGE_KEY, city.trim() || 'Karachi');
        toast({ title: "Matrix Synced", description: "Prayer timings calibrated." });
      } else {
        setError("Linguistic Error: Location not identified in astronomical registry.");
      }
    } catch (err) {
      setError("Uplink failure. Astronomical nodes are unreachable.");
    } finally {
      setIsLoading(false);
    }
  }, [city, country, useHanafi, toast]);

  // Initial Load
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setCity(saved);
    fetchTimings();
  }, []);

  // Countdown & Next Prayer Ticker
  useEffect(() => {
    if (!data) return;

    const calculateNext = () => {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMins = now.getMinutes();
      const currentTimeInMins = currentHours * 60 + currentMins;

      const prayerOrder = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      const timings = data.timings;

      let next = null;

      for (const name of prayerOrder) {
        const [h, m] = timings[name as keyof Timings].split(':').map(Number);
        const prayerMins = h * 60 + m;

        if (prayerMins > currentTimeInMins) {
          const diff = prayerMins - currentTimeInMins;
          const hours = Math.floor(diff / 60);
          const mins = diff % 60;
          next = { 
            name, 
            time: timings[name as keyof Timings], 
            countdown: `${hours}h ${mins}m` 
          };
          break;
        }
      }

      // If no next prayer today, the next is Fajr tomorrow
      if (!next) {
        const [h, m] = timings.Fajr.split(':').map(Number);
        const diff = (24 * 60 - currentTimeInMins) + (h * 60 + m);
        const hours = Math.floor(diff / 60);
        const mins = diff % 60;
        next = { name: 'Fajr', time: timings.Fajr, countdown: `${hours}h ${mins}m` };
      }

      setNextPrayer(next);
    };

    calculateNext();
    const interval = setInterval(calculateNext, 60000);
    return () => clearInterval(interval);
  }, [data]);

  const handleMyLocation = () => {
    if (!navigator.geolocation) {
      toast({ variant: "destructive", title: "Hardware Block", description: "Geolocation not supported." });
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchTimings(true, pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setIsLoading(false);
        toast({ variant: "destructive", title: "Access Denied", description: "Location permissions required." });
      }
    );
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Clock className="w-3.5 h-3.5" /> Temporal Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <h1 className="text-3xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
                Namaz Times <span className="text-primary italic">Studio</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional astronomical calculation matrix. Synchronize prayer timings with precision Hijri mapping and hardware-native location discovery.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="namaz-times" />
              <Button variant="outline" size="sm" onClick={() => fetchTimings()} disabled={isLoading} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-primary transition-all">
                <RefreshCcw className={cn("w-3.5 h-3.5 mr-2", isLoading && "animate-spin")} /> Re-Sync
              </Button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls - Left */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
               <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                 <Search className="w-5 h-5 text-primary" /> Discovery Node
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">City</Label>
                    <Input value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Lahore" className="h-12 bg-secondary border-border rounded-xl font-bold uppercase" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Country</Label>
                    <Input value={country} onChange={e => setCountry(e.target.value)} placeholder="Pakistan" className="h-12 bg-secondary border-border rounded-xl font-bold uppercase" />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                   <Button onClick={() => fetchTimings()} disabled={isLoading || !city.trim()} className="h-14 flex-1 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/30">
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />} Execute Search
                   </Button>
                   <Button onClick={handleMyLocation} disabled={isLoading} variant="outline" className="h-14 px-8 border-border bg-secondary text-foreground font-black text-xs uppercase tracking-widest rounded-2xl">
                      <Navigation2 className="w-4 h-4 mr-2 text-primary" /> My Location
                   </Button>
                </div>
              </div>

              <div className="p-6 rounded-[2rem] bg-secondary/50 border border-border space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <Scale className="w-4 h-4 text-primary" />
                       <div className="space-y-0.5">
                          <h4 className="text-[10px] font-black uppercase text-foreground/60">Hanafi School</h4>
                          <p className="text-[7px] font-bold text-foreground/20 uppercase tracking-widest">Asr calculation method</p>
                       </div>
                    </div>
                    <Switch checked={useHanafi} onCheckedChange={setUseHanafi} />
                 </div>
                 <div className="pt-4 border-t border-white/5 flex items-center gap-3">
                    <Info className="w-3.5 h-3.5 text-primary/40" />
                    <p className="text-[8px] font-bold text-foreground/20 uppercase leading-relaxed">Default Method: Univ. of Islamic Sciences, Karachi</p>
                 </div>
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
                 Location searches are volatile and held strictly in local memory. The studio does not track or store your spiritual observance history.
               </p>
             </div>
          </div>
        </div>

        {/* Results - Right */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px] bg-black/10">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <Activity className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Linguistic Matrix</CardTitle>
                 </div>
                 {data && (
                    <div className="flex gap-2">
                       <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest">
                          {data.date.readable}
                       </Badge>
                    </div>
                 )}
              </CardHeader>
              
              <CardContent className="flex-1 p-8 sm:p-16 flex flex-col gap-12 relative overflow-hidden">
                 {!data && !isLoading && (
                   <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-6">
                      <Moon className="w-24 h-24 text-primary" />
                      <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Signal Detection</p>
                   </div>
                 )}

                 {isLoading && (
                   <div className="flex-1 flex flex-col items-center justify-center space-y-10">
                      <div className="relative">
                         <div className="w-28 h-28 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                         <Globe className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                      </div>
                      <p className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">Decoding Astronomical Buffer...</p>
                   </div>
                 )}

                 {data && !isLoading && (
                   <div className="w-full space-y-12 animate-in zoom-in-95 duration-500">
                      {/* Header: Next Prayer */}
                      {nextPrayer && (
                        <div className="p-10 rounded-[3rem] bg-primary/10 border border-primary/20 flex flex-col items-center text-center gap-6 relative overflow-hidden shadow-2xl">
                           <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-[80px]" />
                           <div className="w-16 h-16 rounded-[2rem] bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/30 relative z-10">
                              <Bell className="w-8 h-8 animate-bounce" />
                           </div>
                           <div className="space-y-2 relative z-10">
                              <p className="text-[11px] font-black text-primary uppercase tracking-[0.6em]">Next Observed Matrix</p>
                              <h2 className="text-5xl sm:text-7xl font-headline font-black text-foreground uppercase tracking-tight">{nextPrayer.name}</h2>
                              <p className="text-2xl font-headline font-bold text-primary">{nextPrayer.time}</p>
                           </div>
                           <div className="px-6 py-2 rounded-full bg-white text-black font-black text-[10px] uppercase tracking-widest shadow-xl relative z-10">
                              Uplink in {nextPrayer.countdown}
                           </div>
                        </div>
                      )}

                      {/* Date Matrix */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                         <div className="p-6 rounded-[2rem] bg-secondary/50 border border-border flex items-start gap-5">
                            <Calendar className="w-6 h-6 text-primary mt-1 shrink-0" />
                            <div className="space-y-1">
                               <p className="text-[9px] font-black uppercase text-foreground/30 tracking-widest">Hijri Chronology</p>
                               <p className="text-sm font-bold text-foreground uppercase">{data.date.hijri.day} {data.date.hijri.month.en} {data.date.hijri.year}</p>
                            </div>
                         </div>
                         <div className="p-6 rounded-[2rem] bg-secondary/50 border border-border flex items-start gap-5">
                            <MapPin className="w-6 h-6 text-primary mt-1 shrink-0" />
                            <div className="space-y-1">
                               <p className="text-[9px] font-black uppercase text-foreground/30 tracking-widest">Timezone Protocol</p>
                               <p className="text-sm font-bold text-foreground uppercase">{data.meta.timezone}</p>
                            </div>
                         </div>
                      </div>

                      {/* Timings List */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         {Object.entries(data.timings).filter(([k]) => ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].includes(k)).map(([name, time]) => {
                           const isNext = nextPrayer?.name === name;
                           return (
                             <div key={name} className={cn(
                               "p-5 rounded-2xl border transition-all flex items-center justify-between",
                               isNext ? "bg-primary border-primary shadow-xl shadow-primary/20 scale-[1.02]" : "bg-secondary border-border"
                             )}>
                                <div className="flex items-center gap-4">
                                   <div className={cn(
                                     "w-10 h-10 rounded-xl flex items-center justify-center border",
                                     isNext ? "bg-white/20 border-white/20 text-white" : "bg-background border-border text-primary/40"
                                   )}>
                                      {name === 'Sunrise' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                                   </div>
                                   <span className={cn("text-[11px] font-black uppercase tracking-widest", isNext ? "text-white" : "text-foreground/60")}>{name}</span>
                                </div>
                                <span className={cn("text-lg font-headline font-black", isNext ? "text-white" : "text-foreground")}>{time}</span>
                             </div>
                           );
                         })}
                      </div>

                      <div className="pt-6 border-t border-white/5 text-center">
                         <button onClick={() => { navigator.clipboard.writeText(`Namaz Times for ${city || 'Local'}: ${Object.entries(data.timings).map(t => `${t[0]}: ${t[1]}`).join(', ')}`); toast({ title: "Results Copied" }); }} className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20 hover:text-primary transition-colors">
                           Copy Full Observance Matrix
                         </button>
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
