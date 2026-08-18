"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Fingerprint,
  Search,
  Trash2,
  AlertCircle,
  Hash,
  Database,
  History,
  Target,
  Smartphone,
  ChevronRight,
  Maximize2,
  Share2,
  Flag,
  Coins,
  Shield,
  PhoneCall,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

const HISTORY_KEY = 'mykit_ip_history_v2';

interface IPData {
  ip: string;
  version: string;
  isp: string;
  org: string;
  asn: string;
  city: string;
  region: string;
  country: string;
  countryCode: string;
  flag: string;
  postal: string;
  timezone: string;
  lat: number;
  lon: number;
  source: string;
  currency: string;
  callingCode: string;
  connectionType?: string;
  security?: {
    isVpn: boolean;
    isProxy: boolean;
    isHosting: boolean;
  };
}

interface HistoryItem {
  id: string;
  ip: string;
  city: string;
  country: string;
  flag: string;
  timestamp: number;
}

export default function IpFinderPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<IPData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load History
  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const saveToHistory = (ip: string, city: string, country: string, flag: string) => {
    setHistory(prev => {
      const filtered = prev.filter(h => h.ip !== ip);
      const next = [{ 
        id: Math.random().toString(36).substr(2, 9), 
        ip, city, country, flag,
        timestamp: Date.now() 
      }, ...filtered].slice(0, 5);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  };

  const validateIp = (ip: string) => {
    if (!ip) return true; // Empty for "My IP"
    const ipv4Regex = /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}$/;
    const ipv6Regex = /^(?:(?:[a-fA-F\d]{1,4}:){7}(?:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){6}(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){5}(?::(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,2}|:)|(?:[a-fA-F\d]{1,4}:){4}(?:(?::[a-fA-F\d]{1,4}){0,1}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,3}|:)|(?:[a-fA-F\d]{1,4}:){3}(?:(?::[a-fA-F\d]{1,4}){0,2}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,4}|:)|(?:[a-fA-F\d]{1,4}:){2}(?:(?::[a-fA-F\d]{1,4}){0,3}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,5}|:)|(?:[a-fA-F\d]{1,4}:){1}(?:(?::[a-fA-F\d]{1,4}){0,4}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,6}|:)|(?::(?:(?::[a-fA-F\d]{1,4}){0,5}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,7}|:)))(?:%[0-9a-zA-Z]{1,})?$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  };

  const fetchIdentity = async (queryOverride?: string) => {
    const target = queryOverride !== undefined ? queryOverride : searchQuery.trim();
    
    if (target && !validateIp(target)) {
      setError("Matrix Incomplete: Provide a valid IPv4 or IPv6 identity string.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setData(null);

    const endpoints = [
      { 
        url: target ? `https://ipwho.is/${target}` : 'https://ipwho.is/', 
        source: 'IPWHOIS',
        transform: (d: any) => ({ 
          ip: d.ip, 
          version: d.type || '—',
          isp: d.connection?.isp || '—', 
          org: d.connection?.org || '—',
          asn: d.connection?.asn ? `AS${d.connection.asn}` : '—',
          city: d.city, 
          region: d.region, 
          country: d.country, 
          countryCode: d.country_code,
          flag: d.flag?.emoji || '🏳️',
          postal: d.postal || '—',
          timezone: d.timezone?.id || '—', 
          lat: d.latitude, 
          lon: d.longitude,
          currency: d.currency?.code || '—',
          callingCode: d.calling_code || '—',
          connectionType: d.connection?.type || 'Standard',
          security: d.security ? {
            isVpn: d.security.vpn,
            isProxy: d.security.proxy,
            isHosting: d.security.hosting
          } : undefined
        })
      },
      { 
        url: target ? `https://ipapi.co/${target}/json/` : 'https://ipapi.co/json/', 
        source: 'IPAPI',
        transform: (d: any) => ({ 
          ip: d.ip, 
          version: d.version || '—',
          isp: d.org || '—', 
          org: d.org || '—',
          asn: d.asn || '—',
          city: d.city, 
          region: d.region, 
          country: d.country_name, 
          countryCode: d.country_code,
          flag: '🏳️',
          postal: d.postal || '—',
          timezone: d.timezone || '—', 
          lat: d.latitude, 
          lon: d.longitude,
          currency: d.currency || '—',
          callingCode: d.country_calling_code || '—',
        })
      }
    ];

    let foundData: IPData | null = null;

    for (const node of endpoints) {
      try {
        const response = await fetch(node.url);
        if (!response.ok) continue;
        const raw = await response.json();
        
        if (node.source === 'IPWHOIS' && raw.success === false) continue;

        foundData = { ...node.transform(raw), source: node.source };
        break;
      } catch (err) {
        console.warn(`Node ${node.source} restricted.`);
      }
    }

    if (foundData) {
      setData(foundData);
      saveToHistory(foundData.ip, foundData.city, foundData.country, foundData.flag);
      toast({ title: "Signal Isolated", description: `Identity mapped via ${foundData.source}.` });
    } else {
      setError("Matrix Retrieval Failure: Discovery nodes are unreachable.");
    }
    
    setIsLoading(false);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(label);
    toast({ title: "Protocol Copied" });
    setTimeout(() => setIsCopied(null), 2000);
  };

  const copyAll = () => {
    if (!data) return;
    const text = [
      `[MY KIT TOOL - IP DIAGNOSTIC]`,
      `IP: ${data.ip} (${data.version})`,
      `ISP: ${data.isp}`,
      `Org: ${data.org}`,
      `Location: ${data.city}, ${data.region}, ${data.country}`,
      `Coords: ${data.lat}, ${data.lon}`,
      `Currency: ${data.currency}`,
      `Calling Code: ${data.callingCode}`,
      `Timezone: ${data.timezone}`,
      `Protocol Node: ${data.source}`,
      `Timestamp: ${new Date().toLocaleString()}`
    ].join('\n');
    handleCopy(text, 'all');
  };

  const handleShare = () => {
    if (!data) return;
    const text = `IP Finder Results: ${data.ip} (${data.country}). Identified via mykittool.app`;
    if (navigator.share) {
      navigator.share({ title: 'My Kit Tool IP Finder', text });
    } else {
      copyAll();
    }
  };

  const purgeHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
    toast({ title: "History Purged" });
  };

  const resultItems = useMemo(() => {
    if (!data) return [];
    return [
      { icon: Fingerprint, label: 'Public Identity (IP)', val: data.ip, copy: true },
      { icon: Database, label: 'Carrier (ISP)', val: data.isp, copy: true },
      { icon: Server, label: 'ASN Signature', val: data.asn, copy: true },
      { icon: Globe, label: 'Sovereign Domain', val: `${data.flag} ${data.country}`, copy: false },
      { icon: MapPin, label: 'City & Region', val: `${data.city}, ${data.region}`, copy: false },
      { icon: PhoneCall, label: 'Calling Code', val: data.callingCode, copy: true },
      { icon: Coins, label: 'Local Currency', val: data.currency, copy: true },
      { icon: Clock, label: 'Temporal Matrix', val: data.timezone, copy: false },
      { icon: Target, label: 'Postal Code', val: data.postal, copy: true },
    ];
  }, [data]);

  const securityThreat = useMemo(() => {
    if (!data?.security) return null;
    const { isVpn, isProxy, isHosting } = data.security;
    if (isVpn) return { label: 'VPN DETECTED', desc: 'Hardware routing through a Virtual Private Network.' };
    if (isProxy) return { label: 'PROXY ACTIVE', desc: 'Inbound signal masking detected.' };
    if (isHosting) return { label: 'DATA CENTER', desc: 'IP associated with a cloud/hosting provider.' };
    return null;
  }, [data]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Globe className="w-3.5 h-3.5" /> Discovery Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
                IP <span className="text-primary italic">Finder Studio</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Advanced network identity extraction. Isolate any public IP, ISP signatures, and geographic coordinates locally with clinical precision.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="ip-finder" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Input & History */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground uppercase tracking-tight">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <Search className="w-6 h-6" />
                </div>
                Discovery Protocol
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Target Identity (IPv4/IPv6)</Label>
                <div className="relative group/input">
                  <Input 
                    placeholder="Enter IP Address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value.trim())}
                    onKeyDown={(e) => e.key === 'Enter' && fetchIdentity()}
                    className="h-16 bg-secondary border-border rounded-2xl text-lg font-mono font-bold text-center tracking-widest focus:ring-primary/40"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/input:opacity-100 transition-opacity">
                    <Globe className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button 
                  onClick={() => fetchIdentity()}
                  disabled={isLoading}
                  className="h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                >
                  {isLoading && searchQuery ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                  Search IP
                </Button>
                <Button 
                  onClick={() => { setSearchQuery(''); fetchIdentity(''); }}
                  disabled={isLoading}
                  variant="outline"
                  className="h-16 border-border bg-secondary hover:bg-white/10 text-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg transition-all active:scale-95"
                >
                  {isLoading && !searchQuery ? <Loader2 className="w-6 h-6 animate-spin" /> : <Smartphone className="w-6 h-6" />}
                  My IP
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* History Tracker */}
          <Card className="glass-card border-border shadow-xl overflow-hidden flex flex-col min-h-[300px]">
             <CardHeader className="py-6 border-b border-border bg-secondary/30 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                   <History className="w-4 h-4 text-primary" />
                   <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Archive Matrix</CardTitle>
                </div>
                {history.length > 0 && (
                   <button onClick={purgeHistory} className="text-[9px] font-black text-foreground/20 hover:text-red-500 uppercase transition-colors">Purge</button>
                )}
             </CardHeader>
             <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-1">
                {history.length === 0 ? (
                  <div className="py-20 text-center opacity-10 space-y-4">
                     <Activity className="w-10 h-10 mx-auto" />
                     <p className="text-[10px] font-black uppercase tracking-widest">Zero Matrix History</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                     {history.map(item => (
                       <div key={item.id} className="p-5 flex items-center justify-between group hover:bg-white/5 transition-all cursor-pointer" onClick={() => { setSearchQuery(item.ip); fetchIdentity(item.ip); }}>
                          <div className="flex items-center gap-4 overflow-hidden">
                             <div className="w-10 h-10 rounded-xl bg-secondary border border-white/5 flex items-center justify-center text-primary/40 group-hover:text-primary transition-colors shrink-0 shadow-inner">
                                <span className="text-sm">{item.flag}</span>
                             </div>
                             <div className="min-w-0">
                                <p className="text-sm font-mono font-bold text-foreground truncate">{item.ip}</p>
                                <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">{item.city}, {item.country}</p>
                             </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-foreground/10 group-hover:text-primary transition-all" />
                       </div>
                     ))}
                  </div>
                )}
             </CardContent>
          </Card>
        </div>

        {/* Results Panel - Right */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group min-h-[600px] flex flex-col">
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
                <div className="flex gap-2">
                   <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[8px] font-black text-primary uppercase tracking-widest">
                      {data.version}
                   </div>
                   <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[8px] font-black text-primary uppercase tracking-widest">
                      Node: {data.source}
                   </div>
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-6 sm:p-10 relative overflow-hidden bg-black/10">
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
                    <Button onClick={() => fetchIdentity()} className="h-12 bg-secondary border border-border text-foreground font-black rounded-xl text-[9px] uppercase tracking-widest">Restart Protocol</Button>
                 </div>
               )}

               {data && !isLoading && (
                 <div className="w-full space-y-10 animate-in zoom-in-95 duration-500">
                    {/* Header: Large IP */}
                    <div className="text-center space-y-4">
                       <p className="text-[10px] font-black uppercase text-primary tracking-[0.6em]">Isolated Protocol</p>
                       <h2 className="text-4xl sm:text-7xl font-headline font-black text-foreground break-all leading-none">{data.ip}</h2>
                       <div className="flex flex-wrap items-center justify-center gap-3">
                          <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest">{data.version}</Badge>
                          {data.connectionType && <Badge className="bg-white/5 text-white/40 border-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest">{data.connectionType}</Badge>}
                       </div>
                    </div>

                    {/* Threat Logic */}
                    {securityThreat && (
                       <div className="p-6 rounded-[2rem] bg-amber-500/10 border border-amber-500/20 flex items-center gap-6 animate-in slide-in-from-top-4">
                          <ShieldAlert className="w-8 h-8 text-amber-500 shrink-0" />
                          <div className="space-y-0.5">
                             <h4 className="text-[11px] font-black uppercase text-amber-600 tracking-widest">{securityThreat.label}</h4>
                             <p className="text-[10px] text-foreground/40 font-medium uppercase">{securityThreat.desc}</p>
                          </div>
                       </div>
                    )}

                    {/* Data Matrix */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {resultItems.map((item, i) => (
                         <div key={i} className="p-5 rounded-3xl bg-secondary/50 border border-border group hover:border-primary/20 transition-all flex items-center justify-between gap-6">
                            <div className="flex items-center gap-5 min-w-0">
                               <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all shadow-inner shrink-0">
                                  <item.icon className="w-4 h-4" />
                               </div>
                               <div className="min-w-0">
                                  <p className="text-[8px] font-black uppercase text-foreground/30 tracking-widest mb-0.5">{item.label}</p>
                                  <h4 className="text-[12px] font-bold text-foreground truncate uppercase select-all">{item.val}</h4>
                               </div>
                            </div>
                            {item.copy && (
                               <button 
                                onClick={() => handleCopy(item.val, item.label)} 
                                className={cn(
                                  "p-2 rounded-lg transition-colors",
                                  isCopied === item.label ? "text-primary" : "text-foreground/10 hover:text-primary"
                                )}
                               >
                                  <Copy className="w-3.5 h-3.5" />
                               </button>
                            )}
                         </div>
                       ))}
                    </div>

                    {/* Actions Row */}
                    <div className="pt-6 border-t border-white/5 space-y-4">
                       <div className="flex flex-col sm:flex-row gap-4">
                          <Button onClick={copyAll} className="h-16 flex-1 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl hover:bg-white/90">
                             {isCopied === 'all' ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
                             Copy All Details
                          </Button>
                          <Button onClick={handleShare} variant="outline" className="h-16 px-10 border-white/10 bg-white/5 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl">
                             <Share2 className="w-5 h-5 mr-2" /> Share Result
                          </Button>
                       </div>
                       <Button asChild variant="outline" className="w-full h-14 bg-secondary border-border rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg">
                          <a href={`https://www.google.com/maps?q=${data.lat},${data.lon}`} target="_blank" rel="noopener noreferrer">
                             <Compass className="w-4 h-4 mr-2" /> Launch Map Protocol
                          </a>
                       </Button>
                    </div>
                 </div>
               )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Privacy Sovereign</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    All identity deconstruction occurs 100% locally in browser memory. Hardware identifiers are never logged or stored.
                  </p>
                </div>
             </div>
             <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <Lock className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Matrix Encryption</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Utilizing hardware-native HTTPS handshakes to ensure end-to-end signal integrity between your browser and discovery nodes.
                  </p>
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
