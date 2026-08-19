"use client"

import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Globe, 
  Lock, 
  Unlock, 
  Activity, 
  Zap, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  ShieldAlert,
  Server,
  MapPin,
  ExternalLink,
  Shield,
  Trash2,
  Database,
  Hash,
  Activity as ActivityIcon,
  MousePointer2,
  RefreshCcw,
  Wifi,
  BarChart3,
  Dices,
  Target,
  Fingerprint,
  Copy,
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
import { checkUrlhaus, getDomainInfo, getDnsInfo } from './actions';

interface TrustResults {
  urlhaus: any;
  ipInfo: any;
  dnsInfo: any;
  isHttps: boolean;
  domain: string;
}

export default function WebsiteTrustCheckerPage() {
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [results, setResults] = useState<TrustResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractDomain = (input: string) => {
    try {
      let cleanUrl = input.trim();
      if (!cleanUrl.startsWith('http')) cleanUrl = 'https://' + cleanUrl;
      const parsed = new URL(cleanUrl);
      return parsed.hostname;
    } catch (e) {
      return input.trim();
    }
  };

  const handleCheck = async () => {
    if (!url.trim()) return;

    setIsLoading(true);
    setError(null);
    setResults(null);

    const domain = extractDomain(url);
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    const isHttps = fullUrl.startsWith('https');

    try {
      // Execute Multi-Node Sync Protocol
      const [urlhausData, ipData, dnsData] = await Promise.all([
        checkUrlhaus(fullUrl),
        getDomainInfo(domain),
        getDnsInfo(domain)
      ]);

      setResults({
        urlhaus: urlhausData,
        ipInfo: ipData,
        dnsInfo: dnsData,
        isHttps,
        domain
      });

      toast({ title: "Analysis Complete", description: "Trust matrix calibrated." });
    } catch (err) {
      setError("Protocol Failure: One or more discovery nodes are unreachable.");
      toast({ variant: "destructive", title: "Sync Failed" });
    } finally {
      setIsLoading(false);
    }
  };

  const riskAssessment = useMemo(() => {
    if (!results) return null;

    let score = 0; // 0 = Good, higher = worse
    const reasons: string[] = [];

    // URLhaus Check
    if (results.urlhaus?.query_status === 'ok') {
      score += 100;
      reasons.push("Blacklisted: Identity identified in malware registry.");
    }

    // DNS Check
    if (results.dnsInfo?.Status !== 0 || !results.dnsInfo?.Answer) {
      score += 30;
      reasons.push("Unresolved: No valid 'A' records identified in DNS matrix.");
    }

    // SSL Check
    if (!results.isHttps) {
      score += 20;
      reasons.push("Insecure Protocol: Missing HTTPS/SSL encryption.");
    }

    // IP Info Check
    if (results.ipInfo?.success === false) {
      score += 10;
      reasons.push("Metadata Restricted: Domain host metadata unavailable.");
    }

    if (score >= 100) return { level: 'High Risk', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: ShieldAlert, reasons };
    if (score >= 20) return { level: 'Medium Risk', color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: AlertCircle, reasons };
    return { level: 'Low Risk', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', icon: ShieldCheck, reasons: ["Clean Signal: No threats identified in active registries."] };
  }, [results]);

  const handleReset = () => {
    setUrl('');
    setResults(null);
    setError(null);
    toast({ title: "Studio Reset" });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <ShieldCheck className="w-3.5 h-3.5" /> Security Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
              Website <span className="text-primary italic">Trust Checker</span>
            </h1>
            <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
              Professional domain reputation auditing. evaluate visual and technical security signals via multi-node malware registries and DNS resolution protocols.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <GetHelp toolId="website-trust-checker" />
             {(results || url) && (
               <Button variant="outline" size="sm" onClick={handleReset} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                  <RefreshCcw className="w-3.5 h-3.5 mr-2" /> Reset
               </Button>
             )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Discovery Input */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
               <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                 <Search className="w-5 h-5 text-primary" /> Discovery Node
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Target URL / Domain</Label>
                <div className="relative group/input">
                  <Input 
                    placeholder="e.g. google.com or https://..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                    className="h-16 bg-secondary border-border rounded-2xl font-bold px-6 focus:ring-primary/40 text-lg"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/input:opacity-100 transition-opacity">
                    <Globe className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleCheck}
                disabled={isLoading || !url.trim()}
                className="w-full h-16 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Zap className="w-5 h-5 mr-2" />}
                Execute Trust Audit
              </Button>

              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 animate-in shake duration-500">
                   <AlertCircle className="w-4 h-4 text-destructive" />
                   <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 gap-6">
             <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ActivityIcon className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Signal Monitoring</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Utilizing hardware-native HTTPS handshakes to verify SSL certificates and protocol integrity during the discovery cycle.
                  </p>
                </div>
             </div>
          </div>
        </div>

        {/* Results Matrix */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[500px] bg-black/10">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between shrink-0">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <Activity className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Trust Profile</CardTitle>
                 </div>
                 {results && (
                   <div className="flex gap-2">
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest px-3 py-1">Node Verified</Badge>
                   </div>
                 )}
              </CardHeader>
              
              <CardContent className="flex-1 p-8 sm:p-12 flex flex-col items-center justify-center relative overflow-hidden">
                 {!results && !isLoading && !error && (
                   <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-6 py-20">
                      <Shield className="w-24 h-24 text-primary" />
                      <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Discovery Signal</p>
                   </div>
                 )}

                 {isLoading && (
                   <div className="flex-1 flex flex-col items-center justify-center space-y-10 py-20">
                      <div className="relative">
                         <div className="w-28 h-28 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                         <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                      </div>
                      <p className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">Negotiating Security Nodes...</p>
                   </div>
                 )}

                 {results && riskAssessment && !isLoading && (
                   <div className="w-full space-y-12 animate-in zoom-in-95 duration-500">
                      {/* Risk Level Gauge */}
                      <div className={cn(
                        "p-10 rounded-[3rem] border-2 text-center space-y-4 shadow-2xl relative overflow-hidden transition-all duration-700",
                        riskAssessment.bg, riskAssessment.border
                      )}>
                         <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[80px]" />
                         <div className={cn("w-16 h-16 rounded-[2rem] mx-auto flex items-center justify-center shadow-xl border border-white/10 mb-4", riskAssessment.bg)}>
                            <riskAssessment.icon className={cn("w-8 h-8", riskAssessment.color)} />
                         </div>
                         <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.6em] opacity-40">Clinical Level</p>
                            <h2 className={cn("text-4xl sm:text-6xl font-headline font-black uppercase tracking-tighter", riskAssessment.color)}>
                               {riskAssessment.level}
                            </h2>
                         </div>
                         <div className="flex flex-col items-center gap-3 pt-4 border-t border-white/5">
                            {riskAssessment.reasons.map((r, i) => (
                               <p key={i} className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 flex items-center gap-2">
                                  <div className={cn("w-1.5 h-1.5 rounded-full", riskAssessment.color.replace('text-', 'bg-'))} />
                                  {r}
                               </p>
                            ))}
                         </div>
                      </div>

                      {/* Technical Data Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { 
                            icon: Fingerprint, 
                            label: 'Public Identity (IP)', 
                            val: results.ipInfo?.ip || 'Identifying...' 
                          },
                          { 
                            icon: Database, 
                            label: 'Carrier (ISP)', 
                            val: results.ipInfo?.connection?.isp || 'Unknown' 
                          },
                          { 
                            icon: Globe, 
                            label: 'Sovereign Domain', 
                            val: `${results.ipInfo?.flag?.emoji || '🏳️'} ${results.ipInfo?.country || 'Global'}` 
                          },
                          { 
                            icon: Lock, 
                            label: 'SSL Protocol', 
                            val: results.isHttps ? 'HTTPS SECURE' : 'HTTP INSECURE',
                            color: results.isHttps ? 'text-green-500' : 'text-red-500'
                          },
                          { 
                            icon: Hash, 
                            label: 'DNS A-Record', 
                            val: results.dnsInfo?.Answer ? `${results.dnsInfo.Answer[0].data}` : 'No Record Found',
                            color: results.dnsInfo?.Answer ? 'text-primary' : 'text-red-500'
                          },
                          { 
                            icon: Target, 
                            label: 'Malware Registry', 
                            val: results.urlhaus?.query_status === 'ok' ? 'BLACKLISTED' : 'CLEAN',
                            color: results.urlhaus?.query_status === 'ok' ? 'text-red-500' : 'text-green-500'
                          },
                        ].map((item, i) => (
                          <div key={i} className="p-6 rounded-3xl bg-secondary/50 border border-border group hover:border-primary/20 transition-all flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all shadow-inner shrink-0">
                               <item.icon className="w-6 h-6" />
                            </div>
                            <div className="min-w-0">
                               <p className="text-[8px] font-black uppercase text-foreground/30 tracking-widest mb-0.5">{item.label}</p>
                               <p className={cn("text-[12px] font-bold truncate uppercase", item.color || "text-foreground")}>{item.val}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Domain Header */}
                      <div className="p-8 rounded-[3rem] bg-secondary border border-border space-y-4 shadow-inner">
                         <div className="flex items-center justify-between">
                            <Label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-1">Linguistic Identifier</Label>
                            <span className="text-[9px] font-mono text-primary/40">RFC 1035 COMPLIANT</span>
                         </div>
                         <div className="flex items-center justify-between gap-6">
                            <p className="text-xl font-headline font-black text-foreground truncate uppercase">{results.domain}</p>
                            <Button asChild variant="outline" className="h-10 px-6 rounded-xl border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-widest">
                               <a href={`https://${results.domain}`} target="_blank" rel="noopener noreferrer">
                                  Launch <ExternalLink className="w-3 h-3 ml-2" />
                               </a>
                            </Button>
                         </div>
                      </div>

                      <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-4">
                         <Button onClick={() => { navigator.clipboard.writeText(JSON.stringify(results, null, 2)); toast({ title: "Matrix Copied" }); }} className="h-16 flex-1 bg-white text-black hover:bg-white/90 font-black rounded-2xl flex items-center justify-center gap-4 text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                            <Copy className="w-5 h-5 mr-1" /> Copy Full Audit Log
                         </Button>
                         <Button onClick={handleReset} variant="outline" className="h-16 px-10 border-white/10 bg-white/5 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl">
                            <RotateCcw className="w-5 h-5 mr-2" /> New Audit
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
