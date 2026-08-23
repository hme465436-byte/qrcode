
"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Wand2, 
  Search, 
  RefreshCcw, 
  Copy, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Zap, 
  Globe, 
  ShieldCheck, 
  Activity, 
  Loader2, 
  ArrowRight, 
  Smartphone,
  Gamepad2,
  Briefcase,
  Smile,
  Palette,
  Hash,
  Instagram,
  Youtube,
  Github,
  Twitch,
  Facebook,
  Linkedin,
  MessageSquare,
  Lock,
  ChevronRight,
  ChevronLeft,
  LayoutGrid,
  Sparkles,
  Target,
  AlertCircle,
  User,
  Settings2,
  Check,
  CheckSquare,
  Square,
  Shield,
  Trash2,
  Type,
  Scaling,
  Star,
  Flame,
  BadgeCheck,
  Fingerprint,
  ChevronUp,
  ChevronDown,
  Info,
  Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';
import { checkUsernameAction, ForgeResult } from './actions';

// --- Linguistic Engine Matrix ---

const CATEGORY_ROOTS: Record<string, string[]> = {
  gaming: ['apex', 'nova', 'ghost', 'viper', 'zion', 'alpha', 'frag', 'glitch', 'void', 'havoc', 'fury', 'phantom', 'zero', 'vortex', 'flux', 'echo', 'onyx', 'titan', 'reaper', 'nexus'],
  business: ['pillar', 'equity', 'nexus', 'prime', 'elite', 'architect', 'summit', 'global', 'direct', 'capital', 'core', 'flow', 'apex', 'bridge', 'vector', 'strategy', 'pulse'],
  creator: ['studio', 'labs', 'vision', 'mind', 'craft', 'lens', 'canvas', 'draft', 'frame', 'mode', 'edit', 'curator', 'pixel', 'arc', 'blueprint'],
  tech: ['code', 'data', 'byte', 'bit', 'logic', 'sync', 'null', 'hex', 'net', 'web', 'bot', 'cyber', 'stack', 'dev', 'node', 'source', 'socket', 'grid'],
  aesthetic: ['lunar', 'solar', 'ethereal', 'soft', 'pure', 'vibes', 'soul', 'cloud', 'mist', 'haze', 'dream', 'glow', 'bloom', 'silk', 'velvet', 'petal', 'dew'],
  funny: ['captain', 'major', 'sir', 'mister', 'uncle', 'pro', 'zilla', 'saurus', 'tron', 'matic', 'potato', 'banana', 'giggles', 'funky'],
  personal: ['native', 'real', 'iam', 'hello', 'its', 'only', 'daily', 'being', 'true', 'original', 'official', 'verified', 'pure', 'simply'],
};

const MODIFIERS = {
  prefixes: ['the', 'iam', 'only', 'its', 'stay', 'hello', 'ultra', 'hyper', 'neon', 'meta', 'pure', 'real'],
  suffixes: ['hq', 'pro', 'hub', 'box', 'base', 'net', 'io', 'labs', 'plus', 'x', 'mode', 'os', 'y', 'ly'],
  creator: ['media', 'tv', 'studio', 'creative', 'films', 'content', 'vlogs'],
};

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: Instagram },
  { id: 'tiktok', name: 'TikTok', icon: Smartphone },
  { id: 'youtube', name: 'YouTube', icon: Youtube },
  { id: 'twitter', name: 'Twitter / X', icon: MessageSquare },
  { id: 'facebook', name: 'Facebook', icon: Facebook },
  { id: 'github', name: 'GitHub', icon: Github },
  { id: 'reddit', name: 'Reddit', icon: LayoutGrid },
  { id: 'twitch', name: 'Twitch', icon: Twitch },
  { id: 'pinterest', name: 'Pinterest', icon: Palette },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin },
];

const CATEGORIES = [
  { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
  { id: 'business', label: 'Business', icon: Briefcase },
  { id: 'creator', label: 'Creator', icon: Sparkles },
  { id: 'personal', label: 'Personal', icon: User },
  { id: 'tech', label: 'Tech', icon: Zap },
  { id: 'funny', label: 'Funny', icon: Smile },
  { id: 'aesthetic', label: 'Aesthetic', icon: Palette },
];

export default function UsernameForgePage() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  
  // Parameters
  const [category, setCategory] = useState('personal');
  const [baseWord, setBaseWord] = useState('');
  const [profession, setProfession] = useState('');
  const [hobby, setHobby] = useState('');
  const [style, setStyle] = useState('Mixed');
  const [maxLength, setMaxLength] = useState(15);
  
  // Toggles
  const [noNumbers, setNoNumbers] = useState(false);
  const [noUnderscore, setNoUnderscore] = useState(true);
  const [shortOnly, setShortOnly] = useState(false);

  // Targets
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set(['instagram', 'tiktok', 'github']));
  
  // Results
  const [generatedNames, setGeneratedNames] = useState<string[]>([]);
  const [checkResults, setCheckResults] = useState<Record<string, Record<string, ForgeResult>>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState<string | null>(null);

  // --- Generation Logic ---

  const getScore = (name: string) => {
    let score = 0;
    if (name.length < 10) score += 20;
    if (!name.match(/\d/)) score += 15;
    if (!name.includes('_') && !name.includes('.')) score += 10;
    // Pronounceability check (simple vowel/consonant ratio proxy)
    const vowels = name.match(/[aeiou]/gi)?.length || 0;
    if (vowels > 0 && vowels < name.length * 0.6) score += 15;
    return score;
  };

  const forgeUsernames = useCallback((overrideBase?: string) => {
    const results: string[] = [];
    const count = 24;
    const pick = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
    
    const roots = CATEGORY_ROOTS[category] || CATEGORY_ROOTS.personal;
    const activeBase = (overrideBase || baseWord.trim() || pick(roots)).toLowerCase().replace(/\s+/g, '');

    const patterns = [
      // 1. Single Clean
      () => activeBase,
      // 2. Compound
      () => `${activeBase}${pick(roots)}`,
      // 3. Prefix
      () => `${pick(MODIFIERS.prefixes)}${activeBase}`,
      // 4. Suffix
      () => `${activeBase}${pick(MODIFIERS.suffixes)}`,
      // 5. Creator Tag
      () => `${activeBase}${pick(MODIFIERS.creator)}`,
      // 6. Professional
      () => `${activeBase}${category === 'business' ? 'Group' : 'HQ'}`,
      // 7. Aesthetic Join
      () => `${activeBase}${noUnderscore ? '' : '_'}${pick(roots)}`,
    ];

    for (let i = 0; i < count; i++) {
      let name = patterns[i % patterns.length]();
      
      // Clean up
      if (noUnderscore) name = name.replace(/_/g, '');
      if (noNumbers) name = name.replace(/[0-9]/g, '');
      
      // Enforce case and length
      name = name.toLowerCase();
      if (maxLength < name.length) name = name.substring(0, maxLength);
      if (shortOnly && name.length > 10) name = name.substring(0, 10);

      if (name.length >= 3) results.push(name);
    }

    const uniqueResults = Array.from(new Set(results));
    
    // Sort by internal score
    const scored = uniqueResults.sort((a, b) => getScore(b) - getScore(a));
    
    setGeneratedNames(scored);
    setStep(3);
    executeChecks(scored);
  }, [baseWord, category, noNumbers, noUnderscore, shortOnly, maxLength, profession, hobby]);

  const executeChecks = async (names: string[]) => {
    setIsProcessing(true);
    const platforms = Array.from(selectedPlatforms);
    
    const initialMap: Record<string, Record<string, ForgeResult>> = {};
    names.forEach(n => {
      initialMap[n] = {};
      platforms.forEach(p => {
        initialMap[n][p] = { platform: p, status: 'checking', url: '', node: 'Pending' };
      });
    });
    setCheckResults(initialMap);

    const promises = names.flatMap(n => 
      platforms.map(async (p) => {
        try {
          const res = await checkUsernameAction(n, p);
          setCheckResults(prev => ({
            ...prev,
            [n]: { ...prev[n], [p]: res }
          }));
        } catch (e) {
          setCheckResults(prev => ({
            ...prev,
            [n]: { ...prev[n], [p]: { platform: p, status: 'unknown', url: '', node: 'Failed' } }
          }));
        }
      })
    );

    await Promise.all(promises);
    setIsProcessing(false);
    toast({ title: "Audit Complete", description: "Batch checked across nodes." });
  };

  const handleMoreLikeThis = (name: string) => {
    setBaseWord(name);
    forgeUsernames(name);
    toast({ title: "Signal Injected", description: `Synthesizing variations of "${name}".` });
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(id);
    toast({ title: "Copied" });
    setTimeout(() => setIsCopied(null), 2000);
  };

  const togglePlatform = (id: string) => {
    const next = new Set(selectedPlatforms);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedPlatforms(next);
  };

  const bestPicks = useMemo(() => {
    return generatedNames.filter(n => {
      const res = Object.values(checkResults[n] || {});
      return res.length > 0 && res.every(r => r.status === 'available');
    }).slice(0, 6);
  }, [generatedNames, checkResults]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
            <Wand2 className="w-3.5 h-3.5" /> Identity Suite
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-headline font-black text-foreground uppercase tracking-tight leading-[0.9]">
            Username <span className="text-primary italic">Forge Studio</span>
          </h1>
          <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
            Professional linguistic identity synthesis. Forge unique handles across global registries with clinical availability auditing.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 pb-2">
           <GetHelp toolId="username-forge" />
           {step > 1 && (
             <Button variant="outline" size="sm" onClick={() => setStep(prev => prev - 1)} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest">
                <ChevronLeft className="w-3.5 h-3.5 mr-2" /> Back
             </Button>
           )}
        </div>
      </div>

      {/* Wizard Track */}
      <div className="mb-12 max-w-3xl mx-auto flex items-center gap-4 px-4">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
             <div className="flex flex-col items-center gap-2">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500",
                  step === s ? "bg-primary border-primary text-white shadow-xl scale-110" : step > s ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-500" : "bg-secondary border-border text-foreground/20"
                )}>
                   {step > s ? <Check className="w-5 h-5" /> : <span className="text-[10px] font-black">0{s}</span>}
                </div>
                <span className={cn("text-[7px] font-black uppercase tracking-widest", step === s ? "text-primary" : "text-foreground/20")}>
                   {s === 1 ? 'DNA Config' : s === 2 ? 'Nodes' : 'Master Matrix'}
                </span>
             </div>
             {s < 3 && <div className={cn("flex-1 h-[1px] mb-6 transition-all duration-1000", step > s ? "bg-emerald-500/40" : "bg-white/5")} />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-10">
        
        {/* STEP 1: Parameters */}
        {step === 1 && (
          <div className="max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-6 duration-700">
             <Card className="glass-card border-border shadow-2xl overflow-hidden">
                <CardHeader className="py-8 border-b border-border bg-secondary/30">
                   <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                      <Settings2 className="w-5 h-5 text-primary" /> Linguistic DNA Config
                   </CardTitle>
                </CardHeader>
                <CardContent className="p-8 sm:p-12 space-y-12">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-10">
                         <div className="space-y-4">
                            <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Identity Category</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                               {CATEGORIES.map(cat => (
                                 <button
                                   key={cat.id}
                                   onClick={() => setCategory(cat.id)}
                                   className={cn(
                                     "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all h-24",
                                     category === cat.id ? "bg-primary text-white border-primary shadow-xl scale-105" : "bg-secondary/50 border-border text-foreground/40 hover:text-primary"
                                   )}
                                 >
                                    <cat.icon className="w-5 h-5" />
                                    <span className="text-[8px] font-black uppercase tracking-widest">{cat.label}</span>
                                 </button>
                               ))}
                            </div>
                         </div>

                         <div className="space-y-4">
                            <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Linguistic Constraints</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                               {[
                                 { label: 'No Numbers', state: noNumbers, set: setNoNumbers },
                                 { label: 'No Underscore', state: noUnderscore, set: setNoUnderscore },
                                 { label: 'Short Only (<12)', state: shortOnly, set: setShortOnly },
                               ].map(t => (
                                 <div key={t.label} className="p-4 rounded-xl bg-secondary/30 border border-border flex items-center justify-between">
                                    <span className="text-[9px] font-black uppercase text-foreground/40">{t.label}</span>
                                    <Switch checked={t.state} onCheckedChange={t.set} className="scale-75" />
                                 </div>
                               ))}
                            </div>
                         </div>
                      </div>

                      <div className="space-y-10">
                         <div className="space-y-6">
                            <div className="space-y-2">
                               <div className="flex justify-between items-center px-1">
                                  <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Base Word / Name</Label>
                                  <span className="text-[7px] font-black text-primary uppercase bg-primary/10 px-2 py-0.5 rounded">Optional</span>
                               </div>
                               <Input value={baseWord} onChange={e => setBaseWord(e.target.value)} placeholder="e.g. Matrix, Ghost" className="h-16 bg-secondary border-border rounded-2xl font-bold uppercase text-lg" />
                            </div>
                         </div>

                         <div className="space-y-4">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-foreground/30">
                               <Label>Max Character Density</Label>
                               <span className="text-primary font-mono">{maxLength}</span>
                            </div>
                            <Slider value={[maxLength]} min={4} max={30} step={1} onValueChange={v => setMaxLength(v[0])} />
                         </div>

                         <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-4">
                            <Info className="w-5 h-5 text-primary/40 mt-0.5 shrink-0" />
                            <p className="text-[10px] text-foreground/40 font-bold uppercase leading-relaxed">
                               If "Base Word" is empty, the forge will autonomously synthesize high-quality roots based on your chosen Category and Tone.
                            </p>
                         </div>
                      </div>
                   </div>

                   <div className="pt-8 border-t border-white/5">
                      <Button 
                        onClick={() => setStep(2)}
                        className="w-full h-20 bg-primary text-white font-black text-xs uppercase tracking-[0.4em] rounded-[2rem] shadow-xl shadow-primary/30"
                      >
                         Configure Registry Nodes <ChevronRight className="w-5 h-5 ml-4" />
                      </Button>
                   </div>
                </CardContent>
             </Card>
          </div>
        )}

        {/* STEP 2: Nodes */}
        {step === 2 && (
          <div className="max-w-3xl mx-auto w-full animate-in fade-in slide-in-from-right-6 duration-700">
             <Card className="glass-card border-border shadow-2xl overflow-hidden">
                <CardHeader className="py-8 border-b border-border bg-secondary/30">
                   <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                      <Globe className="w-5 h-5 text-primary" /> Target Registries
                   </CardTitle>
                </CardHeader>
                <CardContent className="p-8 sm:p-12 space-y-10">
                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {PLATFORMS.map(p => (
                        <button
                          key={p.id}
                          onClick={() => togglePlatform(p.id)}
                          className={cn(
                            "flex items-center gap-4 p-5 rounded-2xl border transition-all group/p",
                            selectedPlatforms.has(p.id) ? "bg-primary text-white border-primary shadow-lg scale-105" : "bg-secondary/30 border-border text-foreground/40 hover:border-primary/20"
                          )}
                        >
                           <p.icon className={cn("w-5 h-5 transition-transform group-hover/p:scale-110", selectedPlatforms.has(p.id) ? "text-white" : "text-primary/40")} />
                           <span className="text-[10px] font-black uppercase tracking-widest truncate">{p.name}</span>
                        </button>
                      ))}
                   </div>

                   <div className="pt-8 border-t border-white/5">
                      <Button 
                        onClick={() => forgeUsernames()}
                        disabled={selectedPlatforms.size === 0}
                        className="w-full h-20 bg-primary text-white font-black text-sm uppercase tracking-[0.4em] rounded-[2.5rem] shadow-xl active:scale-95 transition-all"
                      >
                         <Zap className="w-6 h-6 mr-4" /> Initialize Forge + Check
                      </Button>
                   </div>
                </CardContent>
             </Card>
          </div>
        )}

        {/* STEP 3: Production */}
        {step === 3 && (
          <div className="space-y-12 animate-in fade-in duration-1000">
             
             {/* Best Picks Panel */}
             {!isProcessing && bestPicks.length > 0 && (
               <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center gap-3 px-2">
                     <BadgeCheck className="w-5 h-5 text-emerald-500" />
                     <h3 className="text-xl font-headline font-black uppercase tracking-tight text-foreground/60">Registry Perfect Matches</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                     {bestPicks.map(name => (
                       <Card key={name} className="glass-card border-emerald-500/20 bg-emerald-500/[0.03] shadow-2xl relative overflow-hidden group/best">
                          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/best:opacity-30 transition-opacity">
                             <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                          </div>
                          <CardContent className="p-8 space-y-6">
                             <h4 className="text-2xl font-headline font-black text-foreground uppercase tracking-tight select-all truncate">{name}</h4>
                             <div className="flex flex-wrap gap-2">
                                {Array.from(selectedPlatforms).map(p => (
                                   <div key={p} className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 text-[7px] font-black uppercase tracking-widest border border-emerald-500/20">
                                      {p}
                                   </div>
                                ))}
                             </div>
                             <Button onClick={() => handleCopy(name, `best-${name}`)} className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-[10px] rounded-xl shadow-lg">
                                {isCopied === `best-${name}` ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />} Copy Identity
                             </Button>
                          </CardContent>
                       </Card>
                     ))}
                  </div>
               </div>
             )}

             {/* Main Matrix List */}
             <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                <div className="xl:col-span-8 space-y-6">
                   <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px]">
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                      <CardHeader className="py-6 border-b border-border bg-secondary/30 flex flex-row items-center justify-between shrink-0">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                               <Activity className="w-5 h-5" />
                            </div>
                            <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Forge Master Result</CardTitle>
                         </div>
                         <Button variant="outline" size="sm" onClick={() => forgeUsernames()} disabled={isProcessing} className="h-9 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase">
                            <RefreshCcw className={cn("w-3.5 h-3.5 mr-2", isProcessing && "animate-spin")} /> Generate Stronger Set
                         </Button>
                      </CardHeader>
                      
                      <CardContent className="p-0 flex-1 flex flex-col">
                         <div className="divide-y divide-border max-h-[800px] overflow-auto custom-scrollbar">
                            {sortedNames.map((name, idx) => {
                              const res = Object.values(checkResults[name] || {});
                              const availCount = res.filter(r => r.status === 'available').length;
                              const isFull = availCount === selectedPlatforms.size && selectedPlatforms.size > 0;
                              
                              return (
                               <div key={idx} className={cn(
                                 "p-6 sm:p-8 hover:bg-secondary/30 transition-all group/item",
                                 isFull ? "bg-emerald-500/[0.02]" : ""
                               )}>
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                     <div className="space-y-4 min-w-0 flex-1">
                                        <div className="flex items-center gap-4">
                                           <h3 className="text-xl sm:text-2xl font-headline font-black text-foreground uppercase tracking-tight truncate select-all">{name}</h3>
                                           <div className="flex gap-1">
                                              {getScore(name) > 40 && <Badge className="bg-primary/10 text-primary text-[7px] font-black">TOP PICK</Badge>}
                                              {name.length < 8 && <Badge className="bg-emerald-500/10 text-emerald-500 text-[7px] font-black">RARE</Badge>}
                                           </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                           {Array.from(selectedPlatforms).map(pId => {
                                             const s = checkResults[name]?.[pId]?.status || 'checking';
                                             return (
                                               <div key={pId} className={cn(
                                                 "px-2.5 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
                                                 s === 'available' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                                 s === 'taken' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                                 s === 'checking' ? "bg-primary/5 text-primary/40 border-primary/10 animate-pulse" :
                                                 "bg-secondary text-foreground/20 border-border"
                                               )}>
                                                  {s === 'available' ? <Check className="w-2 h-2" /> : s === 'taken' ? <XCircle className="w-2 h-2" /> : <Loader2 className="w-2 h-2 animate-spin" />}
                                                  {PLATFORMS.find(p => p.id === pId)?.name}
                                               </div>
                                             );
                                           })}
                                        </div>
                                     </div>
                                     <div className="flex gap-2 shrink-0">
                                        <Button onClick={() => handleCopy(name, `nick-${idx}`)} variant="outline" size="sm" className="h-10 px-4 rounded-xl border-border bg-background text-[8px] font-black uppercase">
                                           {isCopied === `nick-${idx}` ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />} Copy
                                        </Button>
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          onClick={() => handleMoreLikeThis(name)}
                                          className="h-10 px-4 rounded-xl border-border bg-background text-[8px] font-black uppercase text-foreground/40 hover:text-primary"
                                        >
                                           More Like This
                                        </Button>
                                     </div>
                                  </div>
                               </div>
                              );
                            })}
                         </div>
                      </CardContent>
                   </Card>
                </div>

                {/* Sidebar Summary */}
                <div className="xl:col-span-4 space-y-8">
                   <Card className="glass-card border-border shadow-xl">
                      <CardHeader className="py-6 border-b border-white/5 bg-secondary/30">
                         <CardTitle className="text-[10px] font-black uppercase tracking-widest text-primary">Matrix Telemetry</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-8 space-y-8">
                         <div className="grid grid-cols-1 gap-4">
                            <div className="p-6 rounded-3xl bg-secondary border border-border text-center space-y-2">
                               <p className="text-3xl font-headline font-black text-foreground">{stats.available}</p>
                               <p className="text-[9px] font-black uppercase text-foreground/30 tracking-widest">Available Signals</p>
                            </div>
                         </div>

                         <div className="p-8 rounded-[3rem] bg-primary/5 border border-primary/10 space-y-6">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary shadow-inner">
                                  <Target className="w-5 h-5" />
                               </div>
                               <div className="min-w-0">
                                  <h4 className="text-[11px] font-black uppercase text-foreground truncate">Signal Fidelity</h4>
                                  <p className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest">WASM Registry Audit</p>
                               </div>
                            </div>
                            <p className="text-[10px] text-foreground/40 font-bold uppercase leading-relaxed tracking-tight">
                               Identity validation uses clinical-grade HTTP probing. Blocked nodes are marked as "Unknown" to maintain protocol accuracy.
                            </p>
                         </div>

                         <div className="flex flex-col gap-3">
                            <Button onClick={() => setStep(1)} variant="outline" className="h-16 border-border bg-white/5 text-foreground/60 text-[9px] font-black uppercase tracking-widest rounded-2xl">
                               Modify Linguistic DNA
                            </Button>
                         </div>
                      </CardContent>
                   </Card>
                </div>
             </div>
          </div>
        )}
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
