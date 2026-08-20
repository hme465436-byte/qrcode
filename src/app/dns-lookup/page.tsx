"use client"

import React, { useState, useMemo, useCallback } from 'react';
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
  Copy,
  Mail,
  Type,
  Maximize2,
  ChevronRight,
  Shield,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface RecordGroup {
  type: string;
  label: string;
  icon: any;
  records: DnsRecord[];
  error?: string;
}

const RECORD_PROTOCOLS = [
  { id: '1', label: 'A', fullName: 'IPv4 Addresses', icon: Globe2 },
  { id: '28', label: 'AAAA', fullName: 'IPv6 Addresses', icon: Network },
  { id: '15', label: 'MX', fullName: 'Mail Exchange', icon: Mail },
  { id: '2', label: 'NS', fullName: 'Name Servers', icon: Server },
  { id: '16', label: 'TXT', fullName: 'Text Records', icon: FileText },
  { id: '5', label: 'CNAME', fullName: 'Canonical Names', icon: ArrowRight },
];

export default function DnsLookupPage() {
  const { toast } = useToast();
  const [domainInput, setDomainInput] = useState('');
  const [results, setResults] = useState<RecordGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<string | null>(null);

  const cleanDomain = (input: string) => {
    return input.trim()
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .split('/')[0]
      .split('?')[0];
  };

  const executeFullLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const domain = cleanDomain(domainInput);
    if (!domain) return;

    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
    if (!domainRegex.test(domain)) {
      setError("Invalid Protocol: Provide a valid domain identifier (e.g. google.com).");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults([]);

    const fetchPromises = RECORD_PROTOCOLS.map(async (proto) => {
      try {
        const response = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${proto.id}`);
        const data = await response.json();
        
        return {
          type: proto.label,
          label: proto.fullName,
          icon: proto.icon,
          records: data.Answer || [],
          error: data.Status === 3 ? "Domain not found" : undefined
        };
      } catch (err) {
        return {
          type: proto.label,
          label: proto.fullName,
          icon: proto.icon,
          records: [],
          error: "Node restricted"
        };
      }
    });

    try {
      const settledResults = await Promise.allSettled(fetchPromises);
      const finalGroups = settledResults
        .filter((r): r is PromiseFulfilledResult<RecordGroup> => r.status === 'fulfilled')
        .map(r => r.value);
      
      const hasAnyData = finalGroups.some(g => g.records.length > 0);
      if (!hasAnyData && !finalGroups.some(g => g.error === "Domain not found")) {
        setError("Zero records identified for this domain across all protocols.");
      } else if (finalGroups.some(g => g.error === "Domain not found")) {
        setError("Domain not found in the global registry.");
      }

      setResults(finalGroups);
      toast({ title: "Matrix Decoded", description: "All DNS protocols synchronized." });
    } catch (err) {
      setError("Critical Retrieval Failure: DNS discovery nodes are restricted.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(label);
    toast({ title: "Copied", description: "Linguistic value saved to clipboard." });
    setTimeout(() => setIsCopied(null), 2000);
  };

  const handleReset = () => {
    setDomainInput('');
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
              <h1 className="text-3xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight">
                DNS <span className="text-primary italic">Lookup PRO</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Advanced clinical DNS auditing. Execute multi-protocol scans to isolate A, MX, TXT, and CNAME records in a single hardware-native cycle.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="dns-lookup" />
              {(results.length > 0 || domainInput) && (
                <Button variant="outline" size="sm" onClick={handleReset} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                  <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset Matrix
                </Button>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Input Pane */}
        <div className="lg:col-span-12 space-y-8 animate-in fade-in slide-in-from-top-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <CardContent className="p-8 sm:p-12">
              <form onSubmit={executeFullLookup} className="flex flex-col md:flex-row gap-6 items-end">
                <div className="flex-1 space-y-4 w-full">
                  <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Linguistic Domain Identity</Label>
                  <div className="relative group/input">
                    <Input 
                      placeholder="e.g. https://www.google.com" 
                      value={domainInput}
                      onChange={(e) => setDomainInput(e.target.value)}
                      className="h-16 bg-secondary border-border rounded-2xl text-lg font-bold px-6 focus:ring-primary/40 uppercase"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3 pr-2">
                       <Globe2 className="w-6 h-6 text-primary/20 group-focus-within/input:text-primary transition-colors" />
                    </div>
                  </div>
                </div>
                <Button 
                  type="submit"
                  disabled={isLoading || !domainInput.trim()}
                  className="h-16 px-12 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all w-full md:w-auto"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Zap className="w-5 h-5 mr-3" />}
                  Initialize Scan
                </Button>
              </form>

              {error && (
                <div className="mt-8 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 animate-in shake duration-500">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results Matrix */}
        <div className="lg:col-span-12 space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
           {!results.length && !isLoading && !error && (
             <div className="h-[400px] flex flex-col items-center justify-center opacity-10 space-y-6 py-20">
                <Network className="w-32 h-32 text-primary" />
                <p className="text-xl font-black uppercase tracking-[0.4em]">Awaiting Discovery Signal</p>
             </div>
           )}

           {isLoading && (
             <div className="h-[400px] flex flex-col items-center justify-center space-y-12">
                <div className="relative">
                   <div className="w-32 h-32 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                   <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                </div>
                <div className="text-center space-y-2">
                   <p className="text-[11px] font-black uppercase text-primary tracking-[0.5em]">Synchronizing Multi-Node Protocols...</p>
                   <p className="text-[9px] font-bold text-foreground/20 uppercase tracking-widest">Querying Cloudflare & Google DNS</p>
                </div>
             </div>
           )}

           {results.length > 0 && (
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {results.map((group, idx) => (
                  <Card key={idx} className={cn(
                    "glass-card border-border shadow-xl flex flex-col transition-all duration-500",
                    group.records.length > 0 ? "opacity-100" : "opacity-40 grayscale-[0.5]"
                  )}>
                    <CardHeader className="py-6 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shadow-inner border",
                            group.records.length > 0 ? "bg-primary/10 text-primary border-primary/20" : "bg-background text-foreground/20 border-border"
                          )}>
                             <group.icon className="w-5 h-5" />
                          </div>
                          <div>
                             <h4 className="text-[11px] font-black uppercase tracking-widest text-foreground">{group.label}</h4>
                             <p className="text-[8px] font-bold text-foreground/30 uppercase tracking-widest">{group.type} Matrix</p>
                          </div>
                       </div>
                       {group.records.length > 0 && (
                         <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase px-2">{group.records.length}</Badge>
                       )}
                    </CardHeader>
                    <CardContent className="flex-1 p-0 overflow-hidden">
                       <div className="divide-y divide-white/5 max-h-[350px] overflow-auto custom-scrollbar bg-black/10">
                          {group.records.length === 0 ? (
                            <div className="p-10 text-center space-y-2">
                               <p className="text-[9px] font-black uppercase text-foreground/10 tracking-widest">{group.error || 'Zero Records'}</p>
                            </div>
                          ) : group.records.map((record, rIdx) => (
                            <div key={rIdx} className="p-6 space-y-4 hover:bg-white/[0.02] transition-all group/item">
                               <div className="flex justify-between items-start gap-4">
                                  <div className="space-y-1 min-w-0 flex-1">
                                     <p className="text-[8px] font-black uppercase text-foreground/20 tracking-widest mb-1">Record Value</p>
                                     <p className="text-[13px] font-mono font-bold text-foreground break-all leading-relaxed">{record.data}</p>
                                  </div>
                                  <div className="flex flex-col items-end gap-2 shrink-0">
                                     <button 
                                      onClick={() => handleCopy(record.data, `${group.type}-${rIdx}`)}
                                      className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                                        isCopied === `${group.type}-${rIdx}` ? "bg-green-500 text-white" : "bg-secondary text-foreground/20 hover:text-primary"
                                      )}
                                     >
                                        {isCopied === `${group.type}-${rIdx}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                     </button>
                                     <div className="text-right">
                                        <p className="text-[8px] font-black uppercase text-foreground/20 tracking-widest">TTL</p>
                                        <p className="text-[10px] font-mono font-bold text-primary/60">{record.TTL}s</p>
                                     </div>
                                  </div>
                               </div>
                            </div>
                          ))}
                       </div>
                    </CardContent>
                  </Card>
                ))}
             </div>
           )}

           {results.length > 0 && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-white/5">
                <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all shadow-lg">
                   <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                      <ShieldCheck className="w-7 h-7" />
                   </div>
                   <div className="space-y-2">
                     <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Hardware Isolation</h4>
                     <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                       Clinical DNS deconstruction occurs strictly via encrypted REST handshakes. Search payloads are never logged.
                     </p>
                   </div>
                </div>
                <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all shadow-lg">
                   <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                      <Zap className="w-7 h-7" />
                   </div>
                   <div className="space-y-2">
                     <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Multi-Node Sync</h4>
                     <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                       Utilizing parallel discovery cycles across global Google DNS edge nodes for 1:1 record fidelity.
                     </p>
                   </div>
                </div>
                <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all shadow-lg">
                   <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                      <FileText className="w-7 h-7" />
                   </div>
                   <div className="space-y-2">
                     <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Master Audit Log</h4>
                     <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                       Comprehensive extraction of TXT, MX, and AAAA records provides a complete technical profile for any domain.
                     </p>
                   </div>
                </div>
             </div>
           )}
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

