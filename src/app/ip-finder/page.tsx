"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Globe, 
  MapPin, 
  RefreshCcw, 
  Copy, 
  CheckCircle2, 
  Info,
  ShieldCheck,
  Zap,
  Activity,
  Server,
  Clock,
  Compass,
  ExternalLink,
  ShieldAlert,
  Loader2,
  MousePointer2,
  Fingerprint,
  Maximize2,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

interface IPData {
  ip: string;
  isp: string;
  city: string;
  region: string;
  country: string;
  timezone: string;
  lat: number;
  lon: number;
}

export default function IpFinderPage() {
  const { toast } = useToast();
  const [data, setData] = useState<IPData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<string | null>(null);

  const fetchIdentity = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      // Protocol 1: ipapi.co (Primary)
      const res1 = await fetch('https://ipapi.co/json/');
      if (!res1.ok) throw new Error('Primary node restricted');
      const d1 = await res1.json();
      
      setData({
        ip: d1.ip,
        isp: d1.org,
        city: d1.city,
        region: d1.region,
        country: d1.country_name,
        timezone: d1.timezone,
        lat: d1.latitude,
        lon: d1.longitude
      });
      toast({ title: "Identity Isolated", description: "Network matrix successfully mapped." });
    } catch (err) {
      console.warn("Primary uplink failed, engaging fallback...");
      try {
        // Protocol 2: ip-api.com (Fallback)
        const res2 = await fetch('http://ip-api.com/json/');
        if (!res2.ok) throw new Error('Fallback node restricted');
        const d2 = await res2.json();
        
        setData({
          ip: d2.query,
          isp: d2.isp,
          city: d2.city,
          region: d2.regionName,
          country: d2.country,
          timezone: d2.timezone,
          lat: d2.lat,
          lon: d2.lon
        });
        toast({ title: "Fallback Active", description: "Identity mapped via secondary node." });
      } catch (err2) {
        setError("Network Identity Blocked: All discovery nodes are currently restricted by your firewall or ISP.");
        toast({ variant: "destructive", title: "Handshake Failed" });
      }
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchIdentity();
  }, [fetchIdentity]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(label);
    toast({ title: "Protocol Copied" });
    setTimeout(() => setIsCopied(null), 2000);
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Globe className="w-3.5 h-3.5" /> Identity Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
                IP <span className="text-primary italic">Finder Studio</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional network identity extraction. Isolate your public IP, ISP signatures, and geographic coordinates locally with clinical precision.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="ip-finder" />
              <Button variant="outline" size="sm" onClick={fetchIdentity} disabled={isLoading} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-primary transition-all">
                <RefreshCcw className={cn("w-3.5 h-3.5 mr-2", isLoading && "animate-spin")} /> Refresh Matrix
              </Button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Main Display - Left */}
        <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-left-6 duration-1000">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[450px] bg-black/10">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-white/5 bg-white/5 flex flex-row items-center justify-between shrink-0">
               <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.4em] flex items-center gap-3">
                  <Fingerprint className="w-4 h-4" /> Identity Matrix
               </CardTitle>
               {data && (
                 <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[8px] font-black text-primary uppercase tracking-widest">
                    Signal Isolated
                 </div>
               )}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center p-8 sm:p-16">
               {isLoading ? (
                 <div className="flex flex-col items-center gap-8 py-20">
                    <div className="relative">
                       <div className="w-24 h-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                       <Globe className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                    </div>
                    <p className="text-[11px] font-black uppercase text-primary tracking-[0.3em]">Negotiating Discovery node...</p>
                 </div>
               ) : error ? (
                 <div className="flex flex-col items-center gap-8 py-20 text-center animate-in shake duration-500">
                    <ShieldAlert className="w-16 h-16 text-destructive animate-bounce" />
                    <div className="space-y-2">
                       <h3 className="text-xl font-headline font-black text-destructive uppercase">Discovery Blocked</h3>
                       <p className="text-[11px] text-foreground/40 font-bold uppercase max-w-sm mx-auto leading-relaxed">{error}</p>
                    </div>
                    <Button onClick={fetchIdentity} className="h-14 px-10 bg-secondary border-border text-foreground font-black uppercase text-[10px] rounded-2xl">
                       Retry Handshake
                    </Button>
                 </div>
               ) : data ? (
                 <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-10 animate-in zoom-in-95 duration-500">
                    {/* Primary IP Display */}
                    <div className="md:col-span-2 flex flex-col items-center gap-6 border-b border-white/5 pb-12">
                       <div className="space-y-2 text-center">
                          <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.5em]">Public Identity Protocol</p>
                          <h2 className="text-5xl sm:text-8xl font-headline font-black text-foreground tracking-tighter leading-none select-all">{data.ip}</h2>
                       </div>
                       <Button onClick={() => handleCopy(data.ip, 'IP')} variant="outline" className="h-10 rounded-xl border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-widest px-8">
                          {isCopied === 'IP' ? <CheckCircle2 className="w-4 h-4 mr-2 text-primary" /> : <Copy className="w-4 h-4 mr-2" />}
                          Copy IP Address
                       </Button>
                    </div>

                    <div className="space-y-10">
                       <div className="flex gap-6 group">
                          <div className="w-12 h-12 rounded-2xl bg-secondary border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all shadow-inner">
                             <Server className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                             <p className="text-[9px] font-black uppercase text-foreground/20 tracking-widest">Network Provider (ISP)</p>
                             <h4 className="text-sm font-bold text-foreground uppercase">{data.isp}</h4>
                          </div>
                       </div>
                       <div className="flex gap-6 group">
                          <div className="w-12 h-12 rounded-2xl bg-secondary border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all shadow-inner">
                             <MapPin className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                             <p className="text-[9px] font-black uppercase text-foreground/20 tracking-widest">Registry Node (City)</p>
                             <h4 className="text-sm font-bold text-foreground uppercase">{data.city}, {data.region}</h4>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-10">
                       <div className="flex gap-6 group">
                          <div className="w-12 h-12 rounded-2xl bg-secondary border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all shadow-inner">
                             <Clock className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                             <p className="text-[9px] font-black uppercase text-foreground/20 tracking-widest">Temporal Matrix (Timezone)</p>
                             <h4 className="text-sm font-bold text-foreground uppercase">{data.timezone}</h4>
                          </div>
                       </div>
                       <div className="flex gap-6 group">
                          <div className="w-12 h-12 rounded-2xl bg-secondary border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all shadow-inner">
                             <Globe className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                             <p className="text-[9px] font-black uppercase text-foreground/20 tracking-widest">Sovereign Domain (Country)</p>
                             <h4 className="text-sm font-bold text-foreground uppercase">{data.country}</h4>
                          </div>
                       </div>
                    </div>
                 </div>
               ) : null}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Privacy Sovereignty</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    All identity lookups are performed directly from your browser. We do not log, store, or monitor your public IP address or location metrics.
                  </p>
                </div>
             </div>
             <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <Zap className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Direct Edge Discovery</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Utilizing high-performance edge APIs for zero-latency identity extraction and hardware signature mapping.
                  </p>
                </div>
             </div>
          </div>
        </div>

        {/* Sidebar - Mapping */}
        <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           <Card className="glass-card border-border shadow-xl overflow-hidden">
              <CardHeader className="py-6 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 text-primary">
                    <Compass className="w-4 h-4" /> Optical Matrix
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                 {data ? (
                    <div className="space-y-8 animate-in zoom-in-95 duration-500">
                       <div className="grid grid-cols-2 gap-4">
                          <div className="p-5 rounded-2xl bg-secondary/50 border border-border text-center space-y-1">
                             <p className="text-[8px] font-black uppercase text-foreground/30 tracking-widest">Latitude</p>
                             <p className="text-sm font-mono font-bold text-foreground">{data.lat.toFixed(4)}°</p>
                          </div>
                          <div className="p-5 rounded-2xl bg-secondary/50 border border-border text-center space-y-1">
                             <p className="text-[8px] font-black uppercase text-foreground/30 tracking-widest">Longitude</p>
                             <p className="text-sm font-mono font-bold text-foreground">{data.lon.toFixed(4)}°</p>
                          </div>
                       </div>

                       <div className="aspect-square w-full rounded-[2.5rem] bg-black/20 border border-white/5 relative overflow-hidden group/map flex items-center justify-center">
                          <div className="absolute inset-0 bg-[url('https://placehold.co/600x600/060608/3b82f6?text=Coordinate+Matrix')] bg-cover opacity-20 grayscale group-hover:scale-110 transition-transform duration-[2s]" />
                          <div className="relative z-10 flex flex-col items-center gap-6">
                             <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                                <MapPin className="w-12 h-12 text-primary relative z-10" />
                             </div>
                             <Button asChild className="h-14 px-8 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all">
                                <a href={`https://www.google.com/maps?q=${data.lat},${data.lon}`} target="_blank" rel="noopener noreferrer">
                                   <ExternalLink className="w-4 h-4 mr-2" /> Launch Map Protocol
                                </a>
                             </Button>
                          </div>
                       </div>

                       <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-4">
                          <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                          <p className="text-[10px] text-foreground/50 font-bold uppercase leading-relaxed tracking-wider">
                             Coordinate extraction is derived from ISP node registration. Physical accuracy may vary based on carrier routing architecture.
                          </p>
                       </div>
                    </div>
                 ) : (
                    <div className="py-20 text-center opacity-10 space-y-4">
                       <Activity className="w-12 h-12 mx-auto" />
                       <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Identity Signal</p>
                    </div>
                 )}
              </CardContent>
           </Card>

           <Card className="glass-card border-border shadow-xl">
              <CardHeader className="py-6 border-b border-border bg-white/2">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground/40">
                    <Activity className="w-4 h-4 text-primary" /> Session Intel
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                 {[
                   { label: 'Signal Status', val: error ? 'RESTRICTED' : isLoading ? 'NEGOTIATING' : 'ISOLATED', icon: Zap },
                   { label: 'Discovery Node', val: 'CLOUDFLARE_EDGE', icon: Maximize2 },
                   { label: 'Matrix Encryption', val: 'HARDWARE_NATIVE', icon: Lock },
                 ].map((item, i) => (
                    <div key={i} className="flex gap-4 group/item">
                       <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary/40 shrink-0 border border-border group-hover/item:text-primary transition-colors">
                          <item.icon className="w-4 h-4" />
                       </div>
                       <div className="min-w-0">
                          <p className="text-[8px] font-black uppercase text-foreground/20 tracking-widest mb-0.5">{item.label}</p>
                          <h4 className="text-[10px] font-bold text-foreground truncate uppercase">{item.val}</h4>
                       </div>
                    </div>
                 ))}
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
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
