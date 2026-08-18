
"use client"

import React, { useState, useCallback } from 'react';
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
  Lock,
  Shield,
  Search,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<IPData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<string | null>(null);

  const fetchIdentity = async () => {
    setIsLoading(true);
    setError(null);
    setData(null);

    const targetIp = searchQuery.trim();
    
    // Waterfall Endpoints for specific IP or self
    // ipify is mostly for self-ip, so we use others for specific queries
    const endpoints = [
      { 
        url: targetIp ? `https://ipwho.is/${targetIp}` : 'https://ipwho.is/', 
        transform: (d: any) => ({ 
          ip: d.ip, 
          isp: d.connection?.isp || d.isp, 
          city: d.city, 
          region: d.region, 
          country: d.country, 
          timezone: d.timezone?.id, 
          lat: d.latitude, 
          lon: d.longitude 
        })
      },
      { 
        url: targetIp ? `https://ipapi.co/${targetIp}/json/` : 'https://ipapi.co/json/', 
        transform: (d: any) => ({ 
          ip: d.ip, 
          isp: d.org, 
          city: d.city, 
          region: d.region, 
          country: d.country_name, 
          timezone: d.timezone, 
          lat: d.latitude, 
          lon: d.longitude 
        })
      },
      { 
        url: 'https://api.ipify.org?format=json', 
        transform: (d: any) => ({ ip: d.ip }) 
      }
    ];

    let accumulatedData: Partial<IPData> = {};
    let foundSignal = false;

    for (const node of endpoints) {
      // If we are searching a specific IP, skip ipify (it only returns your own)
      if (targetIp && node.url.includes('ipify')) continue;

      try {
        const response = await fetch(node.url);
        if (!response.ok) continue;
        const raw = await response.json();
        const mapped = node.transform(raw);
        
        accumulatedData = { ...accumulatedData, ...mapped };

        // If we have basic info, we are good
        if (accumulatedData.ip && (accumulatedData.country || targetIp)) {
          foundSignal = true;
          // If we have full geo data, we can stop
          if (accumulatedData.city && accumulatedData.isp) break;
        }
      } catch (err) {
        console.warn(`Node lookup restricted: ${node.url}`);
      }
    }

    if (foundSignal && accumulatedData.ip) {
      setData({
        ip: accumulatedData.ip,
        isp: accumulatedData.isp || 'Internal Network / Unknown',
        city: accumulatedData.city || 'Private Node',
        region: accumulatedData.region || '—',
        country: accumulatedData.country || 'Global',
        timezone: accumulatedData.timezone || 'UTC',
        lat: accumulatedData.lat || 0,
        lon: accumulatedData.lon || 0
      });
      toast({ title: "Signal Isolated", description: "Identity matrix successfully mapped." });
    } else {
      setError("Could not load. Check your uplink or IP format and try again.");
      toast({ variant: "destructive", title: "Handshake Failed" });
    }
    
    setIsLoading(false);
  };

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
                Professional network identity extraction. Isolate any public IP, ISP signatures, and geographic coordinates locally with clinical precision.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="ip-finder" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Input Panel */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground uppercase tracking-tight">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <Search className="w-6 h-6" />
                </div>
                Target Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">IP Address Protocol</Label>
                <div className="relative group/input">
                  <Input 
                    placeholder="Enter IP or leave blank for YOURS..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchIdentity()}
                    className="h-16 bg-secondary border-border rounded-2xl text-lg font-mono font-bold text-center tracking-widest focus:ring-primary/40"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/input:opacity-100 transition-opacity">
                    <Globe className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <p className="text-[9px] text-foreground/20 font-bold uppercase tracking-widest text-center leading-relaxed">
                  Supports IPv4 and IPv6 format strings.<br />
                  If empty, the studio will identify your hardware node.
                </p>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={fetchIdentity}
                  disabled={isLoading}
                  className="flex-1 h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                >
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                  Search IP Protocol
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
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
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group min-h-[500px] flex flex-col">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <Activity className="w-5 h-5" />
                </div>
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                   Identity Result
                </CardTitle>
              </div>
              {data && (
                <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[8px] font-black text-primary uppercase tracking-widest">
                   Signal Isolated
                 </div>
              )}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-6 sm:p-12 relative overflow-hidden bg-black/10">
               {!data && !isLoading && !error && (
                 <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-6 py-20">
                    <Fingerprint className="w-24 h-24 text-primary" />
                    <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Identity Signal</p>
                 </div>
               )}

               {isLoading && (
                 <div className="flex-1 flex flex-col items-center justify-center space-y-10 py-20">
                    <div className="relative">
                       <div className="w-28 h-28 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                       <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                    </div>
                    <div className="text-center space-y-2">
                       <p className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">Negotiating Discovery node...</p>
                       <p className="text-[9px] font-bold text-foreground/20 uppercase tracking-widest">WASM Matrix Execution</p>
                    </div>
                 </div>
               )}

               {error && (
                 <div className="flex flex-col items-center gap-8 py-20 text-center animate-in shake duration-500">
                    <AlertCircle className="w-16 h-16 text-destructive animate-bounce" />
                    <div className="space-y-2">
                       <h3 className="text-xl font-headline font-black text-destructive uppercase">Matrix Error</h3>
                       <p className="text-[11px] text-foreground/40 font-bold uppercase max-w-sm mx-auto leading-relaxed">{error}</p>
                    </div>
                 </div>
               )}

               {data && !isLoading && (
                 <div className="w-full space-y-12 animate-in zoom-in-95 duration-500">
                    {/* Primary IP Display */}
                    <div className="flex flex-col items-center gap-6 border-b border-white/5 pb-10">
                       <div className="space-y-2 text-center">
                          <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.5em]">Identity Protocol</p>
                          <h2 className="text-4xl sm:text-7xl font-headline font-black text-foreground tracking-tighter leading-none select-all">{data.ip}</h2>
                       </div>
                       <Button onClick={() => handleCopy(data.ip, 'IP')} variant="outline" className="h-10 rounded-xl border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-widest px-8">
                          {isCopied === 'IP' ? <CheckCircle2 className="w-4 h-4 mr-2 text-primary" /> : <Copy className="w-4 h-4 mr-2" />}
                          Copy Matrix
                       </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-12">
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
                             <p className="text-[9px] font-black uppercase text-foreground/20 tracking-widest">Registry Node (Location)</p>
                             <h4 className="text-sm font-bold text-foreground uppercase">{data.city}, {data.region}</h4>
                          </div>
                       </div>
                       <div className="flex gap-6 group">
                          <div className="w-12 h-12 rounded-2xl bg-secondary border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all shadow-inner">
                             <Clock className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                             <p className="text-[9px] font-black uppercase text-foreground/20 tracking-widest">Temporal Matrix</p>
                             <h4 className="text-sm font-bold text-foreground uppercase">{data.timezone}</h4>
                          </div>
                       </div>
                       <div className="flex gap-6 group">
                          <div className="w-12 h-12 rounded-2xl bg-secondary border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all shadow-inner">
                             <Globe className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                             <p className="text-[9px] font-black uppercase text-foreground/20 tracking-widest">Sovereign Domain</p>
                             <h4 className="text-sm font-bold text-foreground uppercase">{data.country}</h4>
                          </div>
                       </div>
                    </div>

                    {data.lat !== 0 && (
                      <div className="pt-8 border-t border-white/5 space-y-8">
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
                         <Button asChild className="w-full h-16 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all">
                            <a href={`https://www.google.com/maps?q=${data.lat},${data.lon}`} target="_blank" rel="noopener noreferrer">
                               <Compass className="w-5 h-5 mr-3" /> Launch Map Protocol
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

