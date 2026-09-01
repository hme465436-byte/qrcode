"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Mail, 
  RefreshCcw, 
  RotateCcw,
  Copy, 
  Trash2, 
  Zap, 
  Settings2, 
  FileText, 
  LayoutGrid, 
  FileSpreadsheet, 
  User, 
  Globe, 
  Activity, 
  CheckCircle2,
  X,
  Plus,
  Check,
  Search,
  Download,
  ShieldCheck,
  AlertCircle,
  History,
  Database,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

// --- Types ---
type GenerationMode = 'dots' | 'plus' | 'both' | 'googlemail';

interface HistoryItem {
  id: string;
  email: string;
  timestamp: number;
  mode: string;
  count: number;
}

const HISTORY_KEY = 'mykit_tempmail_history_v1';

export default function GmailAliasGeneratorPage() {
  const { toast } = useToast();
  
  // Input State
  const [emailInput, setEmailInput] = useState('');
  const [mode, setMode] = useState<GenerationMode>('dots');
  const [customTag, setCustomTag] = useState('');
  const [limit, setLimit] = useState('32');
  
  // Results State
  const [results, setResults] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // --- Persistence ---
  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const saveToHistory = (email: string, count: number) => {
    setHistory(prev => {
      const next = [{
        id: Math.random().toString(36).substr(2, 9),
        email,
        timestamp: Date.now(),
        mode: mode.toUpperCase(),
        count
      }, ...prev].slice(0, 30);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  };

  // --- Logic Matrix ---

  const validateEmail = (email: string) => {
    return /^[a-zA-Z0-9._%+-]+@(gmail\.com|googlemail\.com)$/i.test(email.trim());
  };

  const generateAliases = useCallback(() => {
    const trimmed = emailInput.trim();
    if (!validateEmail(trimmed)) {
      toast({ variant: "destructive", title: "Protocol Error", description: "Only @gmail.com or @googlemail.com inputs are valid." });
      return;
    }

    setIsProcessing(true);
    const [username, domain] = trimmed.split('@');
    const maxResults = parseInt(limit);
    const aliasSet = new Set<string>();
    const tag = customTag.trim() || 'alias';

    if (mode === 'googlemail') {
      const altDomain = domain.toLowerCase() === 'gmail.com' ? 'googlemail.com' : 'gmail.com';
      aliasSet.add(`${username}@${altDomain}`);
    } else if (mode === 'plus') {
      for (let i = 1; i <= maxResults; i++) {
        aliasSet.add(`${username}+${tag}${i}@${domain}`);
      }
    } else if (mode === 'dots') {
      // Dot Trick Algorithm
      const bits = username.length - 1;
      const totalCombos = Math.pow(2, bits);
      // If user has a long name, randomized sampling instead of linear
      for (let i = 0; i < 1000 && aliasSet.size < maxResults; i++) {
        const seed = Math.floor(Math.random() * totalCombos);
        let res = username[0];
        for (let j = 0; j < bits; j++) {
          if ((seed >> j) & 1) res += '.';
          res += username[j + 1];
        }
        aliasSet.add(`${res}@${domain}`);
      }
    } else if (mode === 'both') {
      // Combined Logic
      for (let i = 1; i <= maxResults; i++) {
        const dotSeed = Math.floor(Math.random() * Math.pow(2, username.length - 1));
        let res = username[0];
        for (let j = 0; j < username.length - 1; j++) {
          if ((dotSeed >> j) & 1) res += '.';
          res += username[j + 1];
        }
        aliasSet.add(`${res}+${tag}${i}@${domain}`);
      }
    }

    const finalResults = Array.from(aliasSet);
    setResults(finalResults);
    saveToHistory(trimmed, finalResults.length);
    setIsProcessing(false);
    toast({ title: "Synthesis Complete", description: `Generated ${finalResults.length} unique identities.` });
  }, [emailInput, mode, customTag, limit, toast]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(id);
    toast({ title: "Identity Isolated" });
    setTimeout(() => setIsCopied(null), 2000);
  };

  const handleDownload = (format: 'txt' | 'csv') => {
    if (results.length === 0) return;
    const content = format === 'csv' ? "Email\n" + results.join('\n') : results.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gmail_aliases_${Date.now()}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Master Exported" });
  };

  const handleClear = () => {
    setEmailInput('');
    setResults([]);
    toast({ title: "Studio Reset" });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Activity className="w-3.5 h-3.5" /> Identity Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
                Gmail Alias <span className="text-primary italic">Generator</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional linguistic mailbox synthesis. Generate unlimited verified aliases for your Gmail account locally using dot-trick and plus-tag protocols.
              </p>
           </div>
           <div className="flex items-center gap-3 shrink-0 pb-2">
              <GetHelp toolId="gmail-alias" />
              {(results.length > 0 || emailInput) && (
                <Button variant="outline" size="sm" onClick={handleClear} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                  <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
                </Button>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Config */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
              <CardHeader className="py-6 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Settings2 className="w-5 h-5 text-primary" /> Matrix Parameters
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-10 space-y-8">
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Gmail Address</Label>
                    <div className="relative group/input">
                       <Input 
                        placeholder="yourname@gmail.com"
                        value={emailInput}
                        onChange={e => setEmailInput(e.target.value)}
                        className="h-16 bg-secondary border-border rounded-2xl text-lg font-bold px-6 focus:ring-primary/40"
                       />
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/input:opacity-100 transition-opacity">
                          <Mail className="w-6 h-6 text-primary" />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Linguistic Protocol (Mode)</Label>
                    <div className="grid grid-cols-2 gap-2">
                       {[
                         { id: 'dots', label: 'Dot Trick', desc: 'u.ser.name' },
                         { id: 'plus', label: 'Plus Tag', desc: 'user+tag' },
                         { id: 'both', label: 'Combined', desc: 'u.ser+tag' },
                         { id: 'googlemail', label: 'Domain swap', desc: 'googlemail.com' },
                       ].map(m => (
                         <button
                           key={m.id}
                           onClick={() => setMode(m.id as any)}
                           className={cn(
                             "flex flex-col items-center justify-center gap-1 p-4 rounded-2xl border transition-all h-24",
                             mode === m.id ? "bg-primary text-white border-primary shadow-lg scale-105" : "bg-secondary/50 border-border text-foreground/40 hover:text-primary"
                           )}
                         >
                            <span className="text-[10px] font-black uppercase tracking-widest">{m.label}</span>
                            <span className="text-[8px] font-mono opacity-40">{m.desc}</span>
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                       <Label className="text-[9px] font-black text-foreground/30 uppercase ml-1">Custom Tag</Label>
                       <Input 
                        disabled={mode === 'dots' || mode === 'googlemail'}
                        value={customTag} 
                        onChange={e => setCustomTag(e.target.value.replace(/[^a-z0-9]/gi, ''))} 
                        placeholder="e.g. social" 
                        className="h-11 bg-secondary/50 border-border rounded-xl text-xs font-bold"
                       />
                    </div>
                    <div className="space-y-3">
                       <Label className="text-[9px] font-black text-foreground/30 uppercase ml-1">Batch Limit</Label>
                       <Select value={limit} onValueChange={setLimit}>
                          <SelectTrigger className="h-11 bg-secondary/50 border-border rounded-xl font-bold text-xs">
                             <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="glass-card">
                             {['16', '32', '64', '128', '256'].map(v => (
                               <SelectItem key={v} value={v} className="text-xs font-bold">{v} ALIASES</SelectItem>
                             ))}
                          </SelectContent>
                       </Select>
                    </div>
                 </div>

                 <div className="pt-4 flex flex-col gap-4">
                    <Button 
                      onClick={generateAliases} 
                      disabled={isProcessing || !emailInput}
                      className="h-16 w-full bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 text-xs uppercase tracking-widest active:scale-95 transition-all"
                    >
                       {isProcessing ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Zap className="w-5 h-5 mr-3" />}
                       Forge Identities
                    </Button>
                 </div>
              </CardContent>
           </Card>

           {/* History Archive */}
           <Card className="glass-card border-border shadow-xl flex flex-col max-h-[400px]">
              <CardHeader className="py-4 border-b border-border bg-secondary/30 flex flex-row items-center justify-between shrink-0">
                 <div className="flex items-center gap-3">
                    <History className="w-4 h-4 text-primary" />
                    <CardTitle className="text-[10px] font-black uppercase text-foreground">Archive Registry</CardTitle>
                 </div>
                 {history.length > 0 && (
                    <button onClick={() => { setHistory([]); localStorage.removeItem(HISTORY_KEY); }} className="text-[9px] font-black text-foreground/20 hover:text-destructive uppercase transition-colors">Clear</button>
                 )}
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-1">
                 {history.length === 0 ? (
                    <div className="py-20 text-center opacity-10 space-y-4">
                       <Database className="w-10 h-10 mx-auto" />
                       <p className="text-[10px] font-black uppercase tracking-widest">Zero Matrix History</p>
                    </div>
                 ) : (
                    <div className="divide-y divide-white/5">
                       {history.map((item, i) => (
                         <div key={item.id} className="p-5 flex items-center justify-between group hover:bg-white/5 transition-all cursor-pointer" onClick={() => setEmailInput(item.email)}>
                            <div className="min-w-0 flex-1">
                               <p className="text-sm font-bold text-foreground truncate uppercase">{item.email}</p>
                               <div className="flex items-center gap-3 mt-1">
                                  <span className="text-[8px] font-black text-primary uppercase bg-primary/10 px-1.5 py-0.5 rounded leading-none">{item.mode}</span>
                                  <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">{new Date(item.timestamp).toLocaleDateString()}</p>
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

        {/* Right Column: Output Matrix */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px] bg-black/10">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between shrink-0 px-6 sm:px-10">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <Activity className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Identity Output</CardTitle>
                 </div>
                 {results.length > 0 && (
                    <div className="flex gap-2">
                       <Button onClick={() => handleCopy(results.join('\n'), 'all')} variant="outline" size="sm" className="h-9 px-4 rounded-xl border-white/5 bg-white/5 text-[8px] font-black uppercase tracking-widest">
                          {isCopied === 'all' ? <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-primary" /> : <Copy className="w-3.5 h-3.5 mr-2 text-primary" />} Copy Master
                       </Button>
                    </div>
                 )}
              </CardHeader>
              
              <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
                 <div className="flex-1 overflow-y-auto custom-scrollbar p-8 sm:p-10 space-y-2 bg-[#060608]">
                    {results.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center opacity-10 gap-6 py-20">
                         <Mail className="w-24 h-24 text-primary" />
                         <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Linguistic Signal</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2">
                         {results.map((email, i) => (
                           <div key={i} className="p-4 rounded-2xl bg-secondary/40 border border-border flex items-center justify-between gap-6 transition-all hover:bg-secondary/60 animate-in slide-in-from-bottom-2">
                              <div className="flex items-center gap-4 min-w-0">
                                 <div className="w-9 h-9 rounded-xl bg-background border border-border flex items-center justify-center text-primary/40 shrink-0 font-mono text-[10px]">#{i+1}</div>
                                 <p className="text-xs sm:text-sm font-bold text-foreground truncate select-all">{email}</p>
                              </div>
                              <button 
                                onClick={() => handleCopy(email, `item-${i}`)}
                                className={cn(
                                  "w-9 h-9 rounded-xl bg-background border border-border flex items-center justify-center transition-all",
                                  isCopied === `item-${i}` ? "text-primary border-primary" : "text-foreground/10 hover:text-primary"
                                )}
                              >
                                 {isCopied === `item-${i}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              </button>
                           </div>
                         ))}
                      </div>
                    )}
                 </div>

                 {results.length > 0 && (
                    <div className="p-8 border-t border-white/5 bg-[#0a0a0c] flex flex-col sm:flex-row items-center justify-between gap-6 shrink-0">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20">
                             <FileText className="w-6 h-6" />
                          </div>
                          <div>
                             <p className="text-[11px] font-black uppercase text-foreground leading-none">{results.length} Identifiers</p>
                             <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-widest">Master Bundle Ready</p>
                          </div>
                       </div>
                       <div className="flex gap-2">
                          <Button variant="outline" onClick={() => handleDownload('txt')} className="h-12 px-6 rounded-xl border-white/5 bg-white/5 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-primary">
                             <FileText className="w-4 h-4 mr-2" /> TXT
                          </Button>
                          <Button variant="outline" onClick={() => handleDownload('csv')} className="h-12 px-6 rounded-xl border-white/5 bg-white/5 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-primary">
                             <FileSpreadsheet className="w-4 h-4 mr-2" /> CSV
                          </Button>
                       </div>
                    </div>
                 )}
              </CardContent>
           </Card>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Privacy Sovereign</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    All generation occurs 100% locally in your browser memory. Email strings are never transmitted or stored on remote servers.
                  </p>
                </div>
             </div>
             <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <Zap className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Sub-addressing Protocol</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Utilizing official Gmail standards for sub-addressing, ensuring all aliases route correctly to your primary inbox.
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
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
