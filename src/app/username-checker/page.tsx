"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  User, 
  ExternalLink, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Copy, 
  Trash2, 
  Zap, 
  Globe, 
  ShieldCheck, 
  Activity,
  History,
  RotateCcw,
  ShieldAlert,
  ArrowRight,
  Filter,
  Download,
  Share2,
  AlertTriangle,
  UserPlus,
  LayoutGrid,
  Gamepad2,
  Code2,
  Smartphone,
  Palette,
  Fingerprint
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';
import { checkSinglePlatform, getPlatformList, PlatformResult } from './actions';

type CategoryFilter = 'all' | 'social' | 'gaming' | 'dev' | 'media' | 'finance';

export default function UsernameCheckerPage() {
  const { toast } = useToast();
  const [username, setUsername] = useState('umar');
  const [results, setResults] = useState<PlatformResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<PlatformResult['status'] | 'all'>('all');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [platformNames, setPlatformNames] = useState<string[]>([]);

  // --- Initialize Registry ---
  useEffect(() => {
    getPlatformList().then(setPlatformNames);
  }, []);

  const handleCheck = async (targetName: string) => {
    if (!targetName.trim() || targetName.length < 2) return;
    
    setIsProcessing(true);
    // Initialize results with 'checking' state
    const initialResults: PlatformResult[] = platformNames.map(name => ({
      platform: name,
      status: 'checking',
      url: '',
      category: 'other',
      confidence: 'low'
    }));
    setResults(initialResults);

    // Parallel Execution Matrix
    const promises = platformNames.map(async (pName) => {
      try {
        const res = await checkSinglePlatform(targetName, pName);
        setResults(prev => prev.map(r => r.platform === pName ? res : r));
      } catch (e) {
        setResults(prev => prev.map(r => r.platform === pName ? { ...r, status: 'unknown', confidence: 'low' } : r));
      }
    });

    await Promise.all(promises);
    setIsProcessing(false);
    toast({ title: "Scan Complete", description: "All global nodes synchronized." });
  };

  const handleCheckVariants = () => {
    const clean = username.trim();
    if (!clean) return;
    const variants = [
      `${clean}123`,
      clean.includes('.') ? clean.replace('.', '_') : `${clean}_`,
      clean.includes('_') ? clean.replace('_', '.') : `${clean}.`,
    ];
    // For MVP, we just set the username to the most likely variant and re-run
    const nextVariant = variants[0];
    setUsername(nextVariant);
    handleCheck(nextVariant);
    toast({ title: "Variant Rotation", description: `Synthesizing matrix for "${nextVariant}".` });
  };

  const handleCopyTaken = () => {
    const list = results.filter(r => r.status === 'taken').map(r => `${r.platform}: ${r.url}`).join('\n');
    if (!list) return;
    navigator.clipboard.writeText(list);
    setIsCopied('taken');
    toast({ title: "Signals Isolated", description: "Profile registry copied to clipboard." });
    setTimeout(() => setIsCopied(null), 2000);
  };

  const handleExportTxt = () => {
    const content = `[MY KIT TOOL - USERNAME OSINT REPORT]\nTarget: ${username}\nTimestamp: ${new Date().toLocaleString()}\n\n` + 
      results.map(r => `${r.platform} [${r.status.toUpperCase()}]: ${r.url}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `osint_report_${username}.txt`;
    a.click();
  };

  const filteredResults = useMemo(() => {
    return results.filter(r => {
      const matchStatus = activeFilter === 'all' || r.status === activeFilter;
      const matchCat = activeCategory === 'all' || r.category === activeCategory;
      return matchStatus && matchCat;
    });
  }, [results, activeFilter, activeCategory]);

  const stats = useMemo(() => ({
    taken: results.filter(r => r.status === 'taken').length,
    available: results.filter(r => r.status === 'available').length,
    unknown: results.filter(r => r.status === 'unknown').length,
  }), [results]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
            <ShieldCheck className="w-3.5 h-3.5" /> Identity Intel Pro
          </div>
          <h1 className="text-4xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tighter leading-none">
            Username <span className="text-primary italic">OSINT Checker</span>
          </h1>
          <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
            Professional high-fidelity identity discovery. Isolate digital footprints across 40+ global registries with 1:1 signal validation and zero-storage local privacy.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 pb-2">
           <GetHelp toolId="username-checker" />
           {results.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => { setResults([]); setUsername(''); }} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
              </Button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
              <CardHeader className="pb-8 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Search className="w-5 h-5 text-primary" /> Discovery Node
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-10 space-y-10">
                 <form onSubmit={(e) => { e.preventDefault(); handleCheck(username); }} className="space-y-6">
                    <div className="space-y-4">
                       <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Linguistic Handle</Label>
                       <div className="relative group/input">
                          <Input 
                            value={username}
                            onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                            placeholder="Enter handle..."
                            className="h-16 bg-secondary border-border rounded-2xl font-bold uppercase px-6 focus:ring-primary/40 text-lg"
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/input:opacity-100 transition-opacity">
                             <Zap className="w-6 h-6 text-primary" />
                          </div>
                       </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                       <Button 
                        type="submit" 
                        disabled={isProcessing || !username.trim()}
                        className="w-full h-14 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-xl active:scale-95 transition-all"
                       >
                          {isProcessing ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Zap className="w-5 h-5 mr-3" />}
                          Execute Lookup
                       </Button>
                       <Button 
                        type="button"
                        variant="outline"
                        onClick={handleCheckVariants}
                        disabled={isProcessing || !username.trim()}
                        className="w-full h-11 border-white/10 bg-white/5 text-foreground/40 hover:text-primary rounded-xl text-[9px] font-black uppercase tracking-widest"
                       >
                          <Smartphone className="w-4 h-4 mr-2" /> Check Similar Names
                       </Button>
                    </div>
                 </form>

                 <div className="pt-8 border-t border-white/5 space-y-4">
                    <Label className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em] ml-1">Identity Categorization</Label>
                    <div className="grid grid-cols-2 gap-2">
                       {[
                         { id: 'all', icon: LayoutGrid },
                         { id: 'social', icon: Smartphone },
                         { id: 'gaming', icon: Gamepad2 },
                         { id: 'dev', icon: Code2 },
                         { id: 'media', icon: Palette },
                         { id: 'finance', icon: Globe },
                       ].map(cat => (
                         <button
                           key={cat.id}
                           onClick={() => setActiveCategory(cat.id as any)}
                           className={cn(
                             "h-10 px-4 rounded-xl border flex items-center gap-3 transition-all",
                             activeCategory === cat.id ? "bg-primary text-white border-primary shadow-lg" : "bg-secondary/30 border-border text-foreground/40 hover:text-foreground"
                           )}
                         >
                            <cat.icon className="w-3.5 h-3.5" />
                            <span className="text-[8px] font-black uppercase tracking-widest">{cat.id}</span>
                         </button>
                       ))}
                    </div>
                 </div>
              </CardContent>
           </Card>

           <div className="grid grid-cols-1 gap-6">
              <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Privacy Sovereign</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    All discovery occurs strictly via secure server-side handshakes. Your search strings and identity targets are never logged or stored.
                  </p>
                </div>
             </div>
           </div>
        </div>

        {/* Results Matrix - Right */}
        <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px] bg-black/10">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shrink-0">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <Activity className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Identity Profile</CardTitle>
                 </div>
                 
                 <div className="flex flex-wrap items-center gap-2">
                    {[
                      { id: 'all', label: 'All', icon: Search },
                      { id: 'taken', label: 'Taken', icon: XCircle, count: stats.taken },
                      { id: 'available', label: 'Ready', icon: CheckCircle2, count: stats.available },
                      { id: 'unknown', label: 'Blocked', icon: HelpCircle, count: stats.unknown }
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setActiveFilter(f.id as any)}
                        className={cn(
                          "px-4 py-2 rounded-xl border text-[8px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                          activeFilter === f.id ? "bg-primary text-white border-primary shadow-lg" : "bg-background border-border text-foreground/40 hover:text-foreground"
                        )}
                      >
                         {f.label} {f.count !== undefined && <span className="opacity-40">{f.count}</span>}
                      </button>
                    ))}
                 </div>
              </CardHeader>
              
              <CardContent className="flex-1 p-6 sm:p-10 overflow-hidden flex flex-col">
                 <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10">
                    {results.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center py-40 opacity-10 gap-8 grayscale">
                         <Fingerprint className="w-32 h-32 text-primary" />
                         <p className="text-xl font-black uppercase tracking-[0.4em]">Awaiting Inbound Signal</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in zoom-in-95 duration-500">
                         {filteredResults.map((r, i) => (
                           <div key={i} className={cn(
                             "p-5 rounded-3xl border transition-all duration-500 flex flex-col gap-6",
                             r.status === 'taken' ? "bg-red-500/5 border-red-500/10" : 
                             r.status === 'available' ? "bg-green-500/5 border-green-500/10" : 
                             r.status === 'checking' ? "bg-primary/5 animate-pulse border-primary/20" :
                             "bg-secondary border-border"
                           )}>
                              <div className="flex items-center justify-between gap-4">
                                 <div className="flex items-center gap-4 min-w-0">
                                    <div className={cn(
                                      "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner border border-white/5",
                                      r.status === 'taken' ? "bg-red-500/10 text-red-500" : 
                                      r.status === 'available' ? "bg-green-500/10 text-green-500" : 
                                      "bg-background text-foreground/10"
                                    )}>
                                       {r.status === 'checking' ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                                        r.status === 'taken' ? <XCircle className="w-6 h-6" /> : 
                                        r.status === 'available' ? <CheckCircle2 className="w-6 h-6" /> : 
                                        <HelpCircle className="w-6 h-6" />}
                                    </div>
                                    <div className="min-w-0">
                                       <p className="text-[11px] font-black text-foreground truncate uppercase tracking-tight">{r.platform}</p>
                                       <div className="flex items-center gap-2 mt-0.5">
                                          <span className={cn("text-[8px] font-black uppercase tracking-widest", 
                                            r.status === 'taken' ? 'text-red-500' : 
                                            r.status === 'available' ? 'text-green-500' : 
                                            r.status === 'checking' ? 'text-primary/60' : 'text-foreground/20'
                                          )}>{r.status}</span>
                                          {r.confidence && r.status !== 'checking' && (
                                            <span className="text-[7px] font-bold text-foreground/10 uppercase tracking-tighter">Confidence: {r.confidence}</span>
                                          )}
                                       </div>
                                    </div>
                                 </div>
                                 {r.status === 'taken' && (
                                   <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary shrink-0 shadow-lg">
                                      <a href={r.url} target="_blank" rel="noopener noreferrer">
                                         <ExternalLink className="w-4 h-4" />
                                      </a>
                                   </Button>
                                 )}
                              </div>

                              {r.status === 'taken' && r.displayName && (
                                <div className="px-4 py-3 rounded-2xl bg-black/20 border border-white/5 flex items-center gap-4 animate-in slide-in-from-top-2">
                                   {r.avatar ? (
                                     <img src={r.avatar} alt="" className="w-8 h-8 rounded-lg border border-white/10" />
                                   ) : (
                                     <User className="w-4 h-4 text-white/20" />
                                   )}
                                   <div className="min-w-0">
                                      <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">Display Identity</p>
                                      <p className="text-[10px] font-bold text-white truncate">{r.displayName}</p>
                                   </div>
                                </div>
                              )}

                              {r.reason && (
                                <div className="px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-2">
                                   <AlertTriangle className="w-3 h-3 text-amber-600 mt-0.5 shrink-0" />
                                   <p className="text-[8px] font-bold text-amber-600/60 leading-tight uppercase">{r.reason}</p>
                                </div>
                              )}
                           </div>
                         ))}
                      </div>
                    )}
                 </div>

                 {/* Results Footer Actions */}
                 {results.length > 0 && !isProcessing && (
                    <div className="p-8 border-t border-white/5 bg-[#0a0a0c] flex flex-col sm:flex-row items-center justify-between gap-6 shrink-0 mt-auto">
                       <div className="flex items-center gap-4">
                          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-center min-w-[100px]">
                             <p className="text-[8px] font-black uppercase opacity-60 mb-1">Taken</p>
                             <p className="text-lg font-headline font-black">{stats.taken}</p>
                          </div>
                          <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-500 text-center min-w-[100px]">
                             <p className="text-[8px] font-black uppercase opacity-60 mb-1">Available</p>
                             <p className="text-lg font-headline font-black">{stats.available}</p>
                          </div>
                       </div>
                       <div className="flex gap-4 w-full sm:w-auto">
                          <Button 
                            onClick={handleCopyTaken} 
                            variant="outline" 
                            className="h-14 px-8 border-white/10 bg-white/5 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl flex-1 sm:flex-none"
                          >
                             {isCopied === 'taken' ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                             Copy Logs
                          </Button>
                          <Button onClick={handleExportTxt} className="h-14 px-10 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all flex-1 sm:flex-none">
                             <Download className="w-5 h-5 mr-3" /> Save Report
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
