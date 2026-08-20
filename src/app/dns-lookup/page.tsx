"use client"

import React, { useState, useMemo } from 'react';
import { 
  Globe, 
  Search, 
  Server, 
  Hash, 
  Clock, 
  Zap, 
  Activity, 
  Info, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  RotateCcw, 
  Trash2, 
  ArrowRight,
  Globe2,
  FileText,
  Network,
  Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

interface DnsRecord {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

const RECORD_TYPES = [
  { id: '1', label: 'A (IPv4 Address)' },
  { id: '28', label: 'AAAA (IPv6 Address)' },
  { id: '15', label: 'MX (Mail Exchange)' },
  { id: '2', label: 'NS (Name Server)' },
  { id: '16', label: 'TXT (Text Record)' },
  { id: '5', label: 'CNAME (Canonical Name)' },
  { id: '6', label: 'SOA (Start of Authority)' },
];

export default function DnsLookupPage() {
  const { toast } = useToast();
  const [domain, setDomain] = useState('');
  const [recordType, setRecordType] = useState('1');
  const [results, setResults] = useState<DnsRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRecordLabel = (type: number) => {
    return RECORD_TYPES.find(r => r.id === type.toString())?.label.split(' ')[0] || type.toString();
  };

  const executeLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const cleanDomain = domain.trim().replace(/^https?:\/\//i, '').split('/')[0];
    if (!cleanDomain) return;

    // Simple domain regex validation
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
    if (!domainRegex.test(cleanDomain)) {
      setError("Invalid Protocol: Provide a valid domain identifier (e.g. google.com).");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(cleanDomain)}&type=${recordType}`);
      if (!response.ok) throw new Error("DNS node restricted.");
      
      const data = await response.json();

      if (data.Answer && Array.isArray(data.Answer)) {
        setResults(data.Answer);
        toast({ title: "Signal Isolated", description: `Found ${data.Answer.length} records.` });
      } else {
        if (data.Status === 3) {
          setError("Domain not found in the global registry.");
        } else {
          const typeLabel = RECORD_TYPES.find(r => r.id === recordType)?.label.split(' ')[0];
          setError(`Zero ${typeLabel} records identified for this domain.`);
        }
      }
    } catch (err) {
      setError("Matrix Retrieval Failure: DNS discovery node is unreachable.");
      toast({ variant: "destructive", title: "Protocol Failed" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setDomain('');
    setResults([]);
    setError(null);
    toast({ title: "Studio Reset" });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Globe className="w-3.5 h-3.5" /> Discovery Node
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
                DNS <span className="text-primary italic">Lookup Studio</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional DNS record discovery and auditing. Resolve global DNS records including A, MX, TXT, and CNAME locally with clinical precision via Google DNS nodes.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="dns-lookup" />
              {(results.length > 0 || domain) && (
                <Button variant="outline" size="sm" onClick={handleReset} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
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
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
               <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                 <Search className="w-5 h-5 text-primary" /> Configuration Node
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
              <form onSubmit={executeLookup} className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Domain Identifier</Label>
                  <div className="relative group/input">
                    <Input 
                      placeholder="e.g. google.com" 
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      className="h-16 bg-secondary border-border rounded-2xl text-lg font-bold px-6 focus:ring-primary/40 uppercase"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/input:opacity-100 transition-opacity">
                      <Globe2 className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                   <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Record Protocol</Label>
                   <Select value={recordType} onValueChange={setRecordType}>
                      <SelectTrigger className="h-14 bg-secondary border-border rounded-2xl font-bold uppercase text-[10px] tracking-widest">
                         <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card">
                         {RECORD_TYPES.map(type => (
                           <SelectItem key={type.id} value={type.id} className="text-[10px] font-black uppercase tracking-widest">
                              {type.label}
                           </SelectItem>
                         ))}
                      </SelectContent>
                   </Select>
                </div>

                <Button 
                  type="submit"
                  disabled={isLoading || !domain.trim()}
                  className="w-full h-14 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-primary/30 active:scale-95 transition-all"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Zap className="w-5 h-5 mr-2" />}
                  Execute Lookup
                </Button>
              </form>

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
                 Domain lookups are processed strictly via secure API nodes. Search history and domain interests are volatile and held only in your local session.
               </p>
             </div>
          </div>
        </div>

        {/* Results Matrix - Right */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[500px] bg-black/10">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between shrink-0">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <Activity className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Identity Results</CardTitle>
                 </div>
                 {results.length > 0 && (
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest px-3 py-1">Node Active</Badge>
                 )}
              </CardHeader>
              
              <CardContent className="flex-1 p-8 sm:p-12 flex flex-col items-center justify-center relative overflow-hidden">
                 {!results.length && !isLoading && !error && (
                   <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-6 py-20">
                      <Network className="w-24 h-24 text-primary" />
                      <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Discovery Signal</p>
                   </div>
                 )}

                 {isLoading && (
                   <div className="flex-1 flex flex-col items-center justify-center space-y-10 py-20">
                      <div className="relative">
                         <div className="w-28 h-28 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                         <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                      </div>
                      <p className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">Querying DNS Matrix...</p>
                   </div>
                 )}

                 {results.length > 0 && (
                   <div className="w-full space-y-6 animate-in zoom-in-95 duration-500">
                      <div className="grid grid-cols-1 gap-4">
                         {results.map((record, i) => (
                           <div key={i} className="p-6 rounded-3xl bg-secondary/50 border border-border group hover:border-primary/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                              <div className="flex items-center gap-6 min-w-0">
                                 <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all shadow-inner shrink-0 font-black text-[10px]">
                                    {getRecordLabel(record.type)}
                                 </div>
                                 <div className="min-w-0">
                                    <p className="text-[8px] font-black uppercase text-foreground/30 tracking-widest mb-0.5">Value / Record Data</p>
                                    <p className="text-[13px] font-mono font-bold text-foreground break-all leading-relaxed">{record.data}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-4 shrink-0 sm:border-l sm:border-white/5 sm:pl-6">
                                 <div className="text-right">
                                    <p className="text-[8px] font-black uppercase text-foreground/30 tracking-widest mb-0.5">TTL</p>
                                    <p className="text-xs font-mono font-bold text-primary">{record.TTL}s</p>
                                 </div>
                                 <button onClick={() => { navigator.clipboard.writeText(record.data); toast({ title: "Value Copied" }); }} className="p-2 text-foreground/10 hover:text-primary transition-colors">
                                    <Copy className="w-4 h-4" />
                                 </button>
                              </div>
                           </div>
                         ))}
                      </div>

                      <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-4">
                         <Button onClick={() => { navigator.clipboard.writeText(JSON.stringify(results, null, 2)); toast({ title: "Full Report Copied" }); }} className="h-16 flex-1 bg-white text-black hover:bg-white/90 font-black rounded-2xl flex items-center justify-center gap-4 text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                            <FileText className="w-5 h-5 mr-1" /> Copy Full DNS Report
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
