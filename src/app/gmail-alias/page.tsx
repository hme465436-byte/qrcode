
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
  Loader2,
  Star,
  Clock,
  Shuffle,
  Tag,
  Hammer,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';
import { Badge } from '@/components/ui/badge';

// --- Types ---
type GenerationMode = 'dots' | 'plus' | 'random' | 'timestamp' | 'combined' | 'googlemail';

interface HistoryItem {
  id: string;
  email: string;
  timestamp: number;
  mode: string;
  count: number;
}

const HISTORY_KEY = 'mykit_gmail_history_v2';
const FAVS_KEY = 'mykit_gmail_favs_v2';

const ADJECTIVES = ['happy', 'fast', 'blue', 'silver', 'silent', 'brave', 'cool', 'smart', 'wild', 'pure', 'elite', 'pro', 'neon', 'dark', 'light'];
const NOUNS = ['fox', 'wolf', 'hawk', 'nebula', 'storm', 'pixel', 'logic', 'node', 'grid', 'shield', 'bolt', 'star', 'zen', 'wave', 'matrix'];

const PRESETS = [
  'Shopping', 'Work', 'Newsletter', 'Testing', 'Social', 'Finance', 'Privacy', 'Job', 'Travel', 'Promo'
];

export default function GmailAliasGeneratorPage() {
  const { toast } = useToast();
  
  // Input State
  const [emailInput, setEmailInput] = useState('');
  const [mode, setMode] = useState<GenerationMode>('dots');
  const [customTags, setCustomTags] = useState('');
  const [selectedPresets, setSelectedPresets] = useState<string[]>([]);
  const [limit, setLimit] = useState('32');
  
  // Results State
  const [results, setResults] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  // --- Initialization ---
  useEffect(() => {
    const savedHistory = localStorage.getItem(HISTORY_KEY);
    const savedFavs = localStorage.getItem(FAVS_KEY);
    if (savedHistory) try { setHistory(JSON.parse(savedHistory)); } catch (e) {}
    if (savedFavs) try { setFavorites(JSON.parse(savedFavs)); } catch (e) {}
  }, []);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem(FAVS_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const saveToHistory = (email: string, count: number) => {
    setHistory(prev => {
      const next = [{
        id: Math.random().toString(36).substr(2, 9),
        email,
        timestamp: Date.now(),
        mode: mode.toUpperCase(),
        count
      }, ...prev].slice(0, 30);
      return next;
    });
  };

  const toggleFavorite = (email: string) => {
    setFavorites(prev => {
      const isFav = prev.includes(email);
      if (isFav) return prev.filter(f => f !== email);
      return [email, ...prev];
    });
    toast({ title: favorites.includes(email) ? "Removed from Shortlist" : "Saved to Shortlist" });
  };

  // --- Logic Matrix ---

  const validateEmail = (email: string) => {
    return /^[a-zA-Z0-9._%+-]+@(gmail\.com|googlemail\.com)$/i.test(email.trim());
  };

  const normalizeAlias = () => {
    const trimmed = emailInput.trim();
    if (!trimmed) return;
    const [user, domain] = trimmed.split('@');
    const cleanUser = user.replace(/\./g, '').split('+')[0];
    const normalized = `${cleanUser}@${domain || 'gmail.com'}`;
    setEmailInput(normalized);
    toast({ title: "Identity Normalized", description: "Dots and tags removed." });
  };

  const generateAliases = useCallback(() => {
    const trimmed = emailInput.trim();
    if (!validateEmail(trimmed)) {
      toast({ variant: "destructive", title: "Protocol Error", description: "Input must be @gmail.com or @googlemail.com" });
      return;
    }

    setIsProcessing(true);
    const [username, domain] = trimmed.replace(/\./g, '').split('+')[0].split('@');
    const maxResults = parseInt(limit);
    const aliasSet = new Set<string>();

    const userTags = [
      ...customTags.split(',').map(t => t.trim()).filter(Boolean),
      ...selectedPresets
    ];

    const pickRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

    const getDotted = (user: string) => {
      const bits = user.length - 1;
      const seed = Math.floor(Math.random() * Math.pow(2, bits));
      let res = user[0];
      for (let j = 0; j < bits; j++) {
        if ((seed >> j) & 1) res += '.';
        res += user[j + 1];
      }
      return res;
    };

    if (mode === 'googlemail') {
      const altDomain = domain.toLowerCase() === 'gmail.com' ? 'googlemail.com' : 'gmail.com';
      aliasSet.add(`${username}@${altDomain}`);
    } 
    else if (mode === 'plus' || mode === 'combined' || mode === 'random' || mode === 'timestamp') {
      for (let i = 0; i < maxResults * 2 && aliasSet.size < maxResults; i++) {
        let tag = 'alias';
        if (mode === 'timestamp') {
          tag = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 12);
        } else if (mode === 'random') {
          tag = `${pickRandom(ADJECTIVES)}-${pickRandom(NOUNS)}`;
        } else if (userTags.length > 0) {
          tag = userTags[i % userTags.length];
          if (userTags.length === 1) tag += (i + 1);
        } else {
          tag = `id${i + 1}`;
        }

        const userPart = mode === 'combined' ? getDotted(username) : username;
        aliasSet.add(`${userPart}+${tag}@${domain}`);
      }
    } 
    else if (mode === 'dots') {
      const bits = username.length - 1;
      const totalCombos = Math.pow(2, bits);
      for (let i = 0; i < 2000 && aliasSet.size < maxResults; i++) {
        aliasSet.add(`${getDotted(username)}@${domain}`);
      }
    }

    const finalResults = Array.from(aliasSet);
    setResults(finalResults);
    saveToHistory(trimmed, finalResults.length);
    setIsProcessing(false);
    toast({ title: "Synthesis Complete", description: `Generated ${finalResults.length} identities.` });
  }, [emailInput, mode, customTags, selectedPresets, limit, toast]);

  const filteredResults = useMemo(() => {
    return results.filter(r => r.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [results, searchQuery]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(id);
    toast({ title: "Identity Isolated" });
    setTimeout(() => setIsCopied(null), 2000);
  };

  const handleExport = (data: string[], format: 'txt' | 'csv') => {
    const content = format === 'csv' ? "Email\n" + data.join('\n') : data.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gmail_aliases_${Date.now()}.${format}`;
    a.click();
    toast({ title: "Master Exported" });
  };

  const handleClear = () => {
    setEmailInput('');
    setResults([]);
    setSelectedPresets([]);
    setCustomTags('');
    toast({ title: "Studio Reset" });
  };

  const togglePreset = (p: string) => {
    setSelectedPresets(prev => 
      prev.includes(p) ? prev.filter(item => item !== p) : [...prev, p]
    );
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
            <Activity className="w-3.5 h-3.5" /> Identity Suite Pro
          </div>
          <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
            Gmail Alias <span className="text-primary italic">Forge</span>
          </h1>
          <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
            Advanced linguistic mailbox synthesis. Generate professional aliases for tracking, privacy, and automated filtering locally in your browser.
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Config */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
              <CardHeader className="py-6 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Settings2 className="w-5 h-5 text-primary" /> Matrix Config
                 </CardTitle>
                 {emailInput.includes('+') || emailInput.includes('.') && (
                    <button onClick={normalizeAlias} className="text-[8px] font-black uppercase text-primary/60 hover:text-primary transition-all">Normalize</button>
                 )}
              </CardHeader>
              <CardContent className="pt-10 space-y-8">
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Primary Gmail</Label>
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
                    {emailInput.split('@')[0].length > 40 && (
                      <div className="flex items-center gap-2 text-amber-500 bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                        <AlertCircle className="w-3 h-3" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Entropy Warning: User part exceeds standard 40-char limit</span>
                      </div>
                    )}
                 </div>

                 <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Linguistic Mode</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                       {[
                         { id: 'dots', label: 'Dots', icon: Hash },
                         { id: 'plus', label: 'Plus', icon: Plus },
                         { id: 'combined', label: 'Hybrid', icon: Hammer },
                         { id: 'random', label: 'Words', icon: Shuffle },
                         { id: 'timestamp', label: 'Time', icon: Clock },
                         { id: 'googlemail', label: 'Domain', icon: Globe },
                       ].map(m => (
                         <button
                           key={m.id}
                           onClick={() => setMode(m.id as any)}
                           className={cn(
                             "flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border transition-all h-20",
                             mode === m.id ? "bg-primary text-white border-primary shadow-lg scale-105" : "bg-secondary/50 border-border text-foreground/40 hover:text-primary"
                           )}
                         >
                            <m.icon className="w-4 h-4" />
                            <span className="text-[9px] font-black uppercase tracking-widest">{m.label}</span>
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Contextual Presets</Label>
                    <div className="flex flex-wrap gap-2">
                       {PRESETS.map(p => (
                         <button
                           key={p}
                           onClick={() => togglePreset(p.toLowerCase())}
                           className={cn(
                             "px-3 py-1.5 rounded-xl border text-[8px] font-black uppercase tracking-widest transition-all",
                             selectedPresets.includes(p.toLowerCase()) ? "bg-primary/10 text-primary border-primary/20 shadow-inner" : "bg-secondary/30 border-white/5 text-foreground/30 hover:text-primary"
                           )}
                         >
                            {p}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                       <Label className="text-[9px] font-black text-foreground/30 uppercase ml-1">Custom Tags</Label>
                       <Input 
                        disabled={mode === 'dots' || mode === 'googlemail' || mode === 'random' || mode === 'timestamp'}
                        value={customTags} 
                        onChange={e => setCustomTags(e.target.value.replace(/[^a-z0-9,]/gi, ''))} 
                        placeholder="work, social..." 
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
                               <SelectItem key={v} value={v} className="text-xs font-bold">{v} UNITS</SelectItem>
                             ))}
                          </SelectContent>
                       </Select>
                    </div>
                 </div>

                 <Button 
                   onClick={generateAliases} 
                   disabled={isProcessing || !emailInput}
                   className="h-16 w-full bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 text-xs uppercase tracking-widest active:scale-95 transition-all"
                 >
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Zap className="w-5 h-5 mr-3" />}
                    Forge Matrix
                 </Button>
              </CardContent>
           </Card>

           <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
             <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
             </div>
             <div className="space-y-2">
               <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Privacy Absolute</h4>
               <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                 Identity synthesis occurs 100% locally. No email strings are ever transmitted or logged on our infrastructure.
               </p>
             </div>
          </div>
        </div>

        {/* Right Column: Output & Archive */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
           
           {/* Favorites Repository */}
           {favorites.length > 0 && (
             <div className="space-y-6 animate-in slide-in-from-top-4">
                <div className="flex items-center gap-3 px-2">
                   <Star className="w-5 h-5 text-yellow-500 fill-current" />
                   <h3 className="text-xl font-headline font-black uppercase text-foreground/60 tracking-tight">Identity Shortlist</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {favorites.map((fav, i) => (
                     <div key={i} className="p-5 rounded-3xl bg-primary/[0.03] border border-primary/20 flex items-center justify-between group shadow-xl">
                        <p className="text-sm font-bold text-foreground truncate uppercase select-all">{fav}</p>
                        <div className="flex gap-2">
                           <button onClick={() => handleCopy(fav, `fav-${i}`)} className="p-2 text-primary/40 hover:text-primary transition-all">
                              {isCopied === `fav-${i}` ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                           </button>
                           <button onClick={() => toggleFavorite(fav)} className="p-2 text-yellow-500 hover:text-red-500 transition-all">
                              <X className="w-4 h-4" />
                           </button>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           )}

           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px] bg-black/10">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-col gap-6 shrink-0">
                 <div className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                          <Activity className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Linguistic Output</CardTitle>
                    </div>
                    {results.length > 0 && <Badge className="bg-primary text-white text-[8px] font-black px-2 py-0.5 rounded-full">{results.length} Signals</Badge>}
                 </div>

                 <div className="relative group/search">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within/search:text-primary transition-colors" />
                    <Input 
                      placeholder="Filter identities..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-12 pl-12 bg-background/50 border-white/5 rounded-xl text-[10px] font-black uppercase"
                    />
                 </div>
              </CardHeader>
              
              <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
                 <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-10 space-y-2 bg-[#060608]">
                    {filteredResults.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center py-40 opacity-10 gap-6 grayscale">
                         <Mail className="w-24 h-24 text-primary" />
                         <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Linguistic Signal</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2">
                         {filteredResults.map((alias, i) => (
                           <div key={i} className="p-4 rounded-2xl bg-secondary/40 border border-border flex items-center justify-between gap-6 transition-all hover:bg-secondary/60 group">
                              <div className="flex items-center gap-4 min-w-0">
                                 <button onClick={() => toggleFavorite(alias)} className="w-9 h-9 rounded-xl bg-background border border-border flex items-center justify-center text-foreground/10 hover:text-yellow-500 transition-all">
                                    <Star className={cn("w-4 h-4", favorites.includes(alias) && "fill-current text-yellow-500")} />
                                 </button>
                                 <p className="text-sm font-bold text-foreground truncate select-all uppercase tracking-tight">{alias}</p>
                              </div>
                              <button 
                                onClick={() => handleCopy(alias, `item-${i}`)}
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
                       <Button onClick={() => handleCopy(results.join('\n'), 'all')} className="h-12 flex-1 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl hover:bg-white/90">
                          {isCopied === 'all' ? <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> : <Copy className="w-3.5 h-3.5 mr-2" />} Copy All
                       </Button>
                       <div className="flex gap-2">
                          <Button variant="outline" onClick={() => handleExport(results, 'txt')} className="h-12 px-6 rounded-xl border-white/5 bg-white/5 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-primary">
                             <FileText className="w-4 h-4 mr-2" /> TXT
                          </Button>
                          <Button variant="outline" onClick={() => handleExport(results, 'csv')} className="h-12 px-6 rounded-xl border-white/5 bg-white/5 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-primary">
                             <FileSpreadsheet className="w-4 h-4 mr-2" /> CSV
                          </Button>
                       </div>
                    </div>
                 )}
              </CardContent>
           </Card>

           {/* History Module */}
           <Card className="glass-card border-border shadow-xl flex flex-col max-h-[400px]">
              <CardHeader className="py-6 border-b border-border bg-secondary/30 flex items-center justify-between shrink-0">
                 <div className="flex items-center gap-3">
                    <History className="w-4 h-4 text-primary" />
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-foreground">Archive Registry</CardTitle>
                 </div>
                 {history.length > 0 && (
                   <div className="flex gap-3">
                      <button onClick={() => handleExport(history.map(h => h.email), 'txt')} className="text-[9px] font-black text-primary/60 hover:text-primary uppercase transition-colors">Export</button>
                      <button onClick={() => { setHistory([]); localStorage.removeItem(HISTORY_KEY); }} className="text-[9px] font-black text-foreground/20 hover:text-red-500 uppercase transition-colors">Clear</button>
                   </div>
                 )}
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-1">
                 {history.length === 0 ? (
                    <div className="py-20 text-center opacity-10 space-y-2">
                       <Database className="w-10 h-10 mx-auto" />
                       <p className="text-[10px] font-black uppercase tracking-widest">Zero Matrix History</p>
                    </div>
                 ) : (
                    <div className="divide-y divide-white/5">
                       {history.map((item, i) => (
                         <div key={item.id || i} className="p-5 flex items-center justify-between group hover:bg-white/5 transition-all cursor-pointer" onClick={() => setEmailInput(item.email)}>
                            <div className="min-w-0 flex-1">
                               <p className="text-sm font-bold text-foreground truncate uppercase">{item.email}</p>
                               <div className="flex items-center gap-3 mt-1">
                                  <span className="text-[8px] font-black text-primary uppercase bg-primary/10 px-1.5 py-0.5 rounded leading-none">{item.mode}</span>
                                  <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">{new Date(item.timestamp).toLocaleDateString()}</p>
                               </div>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); setHistory(prev => prev.filter(h => h.id !== item.id)); }} className="p-2 text-foreground/10 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                               <Trash2 className="w-4 h-4" />
                            </button>
                            <ChevronRight className="w-4 h-4 text-foreground/10 group-hover:text-primary transition-all" />
                         </div>
                       ))}
                    </div>
                 )}
              </CardContent>
           </Card>

           {/* Field Guide Section */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
              <div className="p-8 rounded-[3rem] bg-primary/5 border border-primary/20 space-y-4">
                 <div className="flex items-center gap-3 text-primary">
                    <ShieldCheck className="w-5 h-5" />
                    <h4 className="text-[11px] font-black uppercase tracking-widest">Dot Trick Logic</h4>
                 </div>
                 <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Gmail ignores periods in your username. `u.m.a.r@gmail.com` is identical to `umar@gmail.com` for incoming signals. This matrix expands your address into thousands of unique combinations.
                 </p>
              </div>
              <div className="p-8 rounded-[3rem] bg-indigo-500/5 border border-indigo-500/10 space-y-4">
                 <div className="flex items-center gap-3 text-indigo-500">
                    <Zap className="w-5 h-5" />
                    <h4 className="text-[11px] font-black uppercase tracking-widest">Plus Addressing</h4>
                 </div>
                 <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Appending `+tag` after your username allows for instant server-side filtering. Use unique tags for each service to isolate data leaks and manage marketing high-volume streams.
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

