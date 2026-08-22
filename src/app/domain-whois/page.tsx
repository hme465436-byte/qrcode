
"use client"

import React, { useState, useMemo } from 'react';
import { 
  Globe, 
  Search, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  Zap, 
  Activity, 
  Info, 
  ExternalLink, 
  Loader2, 
  AlertCircle, 
  Copy, 
  RotateCcw,
  CheckCircle2,
  ShieldAlert,
  Server,
  Hash,
  Database,
  History,
  Target,
  FileText,
  BadgeCheck,
  ChevronRight,
  Fingerprint
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';
import { fetchWhoisData, WhoisResult } from './actions';

export default function DomainWhoisPage() {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<WhoisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateAge = (createdStr?: string) => {
    if (!createdStr) return null;
    const created = new Date(createdStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const years = Math.floor(diffDays / 365);
    const remainingDays = diffDays % 365;
    
    return { years, days: remainingDays, totalDays: diffDays };
  };

  const ageData = useMemo(() => calculateAge(result?.createdDate), [result]);

  const handleCheck = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await fetchWhoisData(query);
      setResult(data);
      if (!data.exists) {
        toast({ title: "Registry Null", description: "This domain appears to be available." });
      } else {
        toast({ title: "Matrix Synced", description: "Whois data Isolated successfully." });
      }
    } catch (err: any) {
      setError("Discovery Protocol Error: Could not connect to registry nodes.");
      toast({ variant: "destructive", title: "Protocol Failed" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const text = [
      `[MY KIT TOOL - DOMAIN WHOIS REPORT]`,
      `Domain: ${result.domain}`,
      `Status: ${result.status.join(', ')}`,
      `Age: ${ageData ? `${ageData.years}y ${ageData.days}d` : 'Unknown'}`,
      `Created: ${result.createdDate || 'N/A'}`,
      `Expiry: ${result.expiryDate || 'N/A'}`,
      `Registrar: ${result.registrar || 'N/A'}`,
      `Nameservers: ${result.nameservers.join(', ') || 'N/A'}`,
      `Source: ${result.source}`,
      `Timestamp: ${new Date().toLocaleString()}`
    ].join('\n');
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast({ title: "Report Copied" });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const isNewDomain = ageData && ageData.totalDays < 30;

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Globe className="w-3.5 h-3.5" /> Intelligence Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
                Domain Whois <span className="text-primary italic">& Age Studio</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional registry auditing engine. Isolate domain birth-dates, registrar metadata, and security status locally using the global RDAP protocol matrix.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="domain-whois" />
              {(result || query) && (
                <Button variant="outline" size="sm" onClick={() => { setQuery(''); setResult(null); setError(null); }} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                  <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
                </Button>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Search Node */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
               <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                 <Search className="w-5 h-5 text-primary" /> Discovery Protocol
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
              <form onSubmit={handleCheck} className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Domain Identifier</Label>
                <div className="relative group/input">
                  <Input 
                    placeholder="e.g. google.com"
                    value={query}
                    onChange={(e) => setQuery(e.target.value.toLowerCase().replace(/[^a-z0-9.-]/g, ''))}
                    className="h-16 bg-secondary border-border rounded-2xl text-lg font-bold px-6 focus:ring-primary/40 uppercase tracking-widest"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/input:opacity-100 transition-opacity">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  disabled={isLoading || !query.trim()} 
                  className="w-full h-14 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-primary/30 active:scale-95 transition-all"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <ShieldCheck className="w-5 h-5 mr-3" />}
                  Identify Matrix
                </Button>
              </form>

              <div className="p-8 rounded-[2.5rem] bg-secondary/50 border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <Fingerprint className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Identity Masking</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Our engine prioritizes the RDAP protocol for clinical accuracy while maintaining 100% hardware-native privacy. No lookup history is logged.
                  </p>
                </div>
             </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Matrix */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px] bg-black/10">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between shrink-0">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <Activity className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Identity Profile</CardTitle>
                 </div>
                 {result && (
                    <Badge className={cn(
                      "px-4 py-1.5 border uppercase text-[9px] font-black tracking-widest",
                      result.exists ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                    )}>
                       {result.exists ? 'Registered' : 'Not Identified'}
                    </Badge>
                 )}
              </CardHeader>
              
              <CardContent className="flex-1 p-6 sm:p-12 relative overflow-hidden">
                 {!result && !isLoading && !error && (
                   <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-6 py-24">
                      <Database className="w-24 h-24 text-primary" />
                      <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Discovery Signal</p>
                   </div>
                 )}

                 {isLoading && (
                   <div className="flex-1 flex flex-col items-center justify-center space-y-10 py-24">
                      <div className="relative">
                         <div className="w-28 h-28 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                         <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                      </div>
                      <p className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">Decoding Registry matrix...</p>
                   </div>
                 )}

                 {error && (
                    <div className="flex flex-col items-center gap-6 py-20 text-center animate-in shake duration-500">
                       <AlertCircle className="w-16 h-16 text-destructive animate-bounce" />
                       <p className="text-sm font-bold text-destructive uppercase tracking-widest">{error}</p>
                    </div>
                 )}

                 {result && !isLoading && (
                   <div className="w-full space-y-10 animate-in zoom-in-95 duration-500">
                      {/* Alert for New Domain */}
                      {isNewDomain && (
                        <div className="p-6 rounded-[2.5rem] bg-red-600/10 border border-red-600/20 flex items-center gap-5 shadow-xl shadow-red-600/5">
                           <ShieldAlert className="w-8 h-8 text-red-600 animate-pulse" />
                           <div className="space-y-1">
                              <h4 className="text-[11px] font-black uppercase text-red-600 tracking-widest">Protocol Alert: New Domain</h4>
                              <p className="text-[11px] text-foreground/50 font-bold uppercase tracking-tighter">Registered within last 30 days. Exercise caution.</p>
                           </div>
                        </div>
                      )}

                      <div className="text-center space-y-4">
                         <p className="text-[10px] font-black uppercase text-primary tracking-[0.6em]">Validated Identifier</p>
                         <h2 className="text-4xl sm:text-6xl font-headline font-black text-foreground uppercase tracking-tighter leading-none break-all">{result.domain}</h2>
                         <div className="flex flex-wrap justify-center gap-3">
                            <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest px-3 py-1">Node: {result.source}</Badge>
                         </div>
                      </div>

                      {result.exists && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            { icon: Calendar, label: 'Creation Date', val: result.createdDate ? new Date(result.createdDate).toLocaleDateString() : '—' },
                            { icon: Clock, label: 'Domain Age', val: ageData ? `${ageData.years} Years, ${ageData.days} Days` : '—' },
                            { icon: ShieldCheck, label: 'Expiry Matrix', val: result.expiryDate ? new Date(result.expiryDate).toLocaleDateString() : '—' },
                            { icon: Server, label: 'Registrar Node', val: result.registrar || '—' },
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
                      )}

                      {/* Nameservers */}
                      {result.nameservers.length > 0 && (
                        <div className="p-8 rounded-[3rem] bg-secondary border border-border space-y-4 shadow-inner">
                           <div className="flex items-center justify-between px-1">
                              <Label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">Name Server Matrix</Label>
                              <BadgeCheck className="w-4 h-4 text-primary/40" />
                           </div>
                           <div className="flex flex-wrap gap-2">
                              {result.nameservers.map((ns, i) => (
                                <span key={i} className="px-3 py-1 rounded-lg bg-background border border-border text-[11px] font-mono font-bold text-foreground/60 uppercase">{ns}</span>
                              ))}
                           </div>
                        </div>
                      )}

                      <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-4">
                         <Button onClick={handleCopy} className="h-16 flex-1 bg-white text-black hover:bg-white/90 font-black rounded-2xl flex items-center justify-center gap-4 text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                            {isCopied ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
                            Copy Full Audit
                         </Button>
                         <Button asChild variant="outline" className="h-16 px-10 border-white/10 bg-white/5 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl active:scale-95 transition-all">
                            <a href={`https://rdap.org/domain/${result.domain}`} target="_blank" rel="noopener noreferrer">
                               <ExternalLink className="w-5 h-5 mr-1" /> Registry Node
                            </a>
                         </Button>
                      </div>
                   </div>
                 )}
              </CardContent>
           </Card>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-[2rem] bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
                 <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                 <p className="text-[10px] text-foreground/40 font-bold leading-relaxed uppercase">
                    RDAP data availability depends on the TLD registry policies. If private, owner details are automatically redacted for clinical privacy compliance.
                 </p>
              </div>
              <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10 flex items-start gap-4">
                 <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                 <p className="text-[10px] text-foreground/40 font-bold leading-relaxed uppercase">
                    All lookup signals are processed via secure server actions. Your browser hardware identifiers are never shared with the target registry.
                 </p>
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
