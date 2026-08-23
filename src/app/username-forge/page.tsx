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
  Maximize2,
  Heart,
  Hammer,
  Wind,
  Layers,
  Monitor
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

// --- Advanced Linguistic DNA Matrix ---

const PHONETIC_ROOTS = {
  vowels: ['a', 'e', 'i', 'o', 'u', 'y'],
  consonants: ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w', 'x', 'z'],
  blends: ['st', 'th', 'ch', 'ph', 'cr', 'br', 'sl', 'dr', 'tr', 'sp', 'fl'],
};

const CATEGORY_DNA: Record<string, { roots: string[], styles: string[], modifiers: string[] }> = {
  gaming: {
    roots: ['apex', 'nova', 'ghost', 'viper', 'zion', 'alpha', 'frag', 'glitch', 'void', 'havoc', 'fury', 'phantom', 'zero', 'vortex', 'flux', 'echo', 'onyx', 'titan', 'reaper', 'nexus', 'slayer', 'omega', 'nitro', 'bolt'],
    styles: ['clean', 'aggressive', 'technical'],
    modifiers: ['_GG', 'X', 'Pro', 'Elite', '01']
  },
  business: {
    roots: ['pillar', 'equity', 'nexus', 'prime', 'elite', 'architect', 'summit', 'global', 'direct', 'capital', 'core', 'flow', 'apex', 'bridge', 'vector', 'strategy', 'pulse', 'ascend', 'summit', 'peak', 'venture'],
    styles: ['stable', 'premium', 'clean'],
    modifiers: ['Group', 'HQ', 'Labs', 'Global', 'Inc']
  },
  creator: {
    roots: ['studio', 'labs', 'vision', 'mind', 'craft', 'lens', 'canvas', 'draft', 'frame', 'mode', 'edit', 'curator', 'pixel', 'arc', 'blueprint', 'capture', 'focus', 'prime', 'raw', 'filter'],
    styles: ['sticky', 'minimal', 'modern'],
    modifiers: ['Studio', 'Media', 'Films', 'Creative', 'TV']
  },
  tech: {
    roots: ['code', 'data', 'byte', 'bit', 'logic', 'sync', 'null', 'hex', 'net', 'web', 'bot', 'cyber', 'stack', 'dev', 'node', 'source', 'socket', 'grid', 'array', 'host', 'port', 'cloud', 'layer'],
    styles: ['technical', 'clean', 'modern'],
    modifiers: ['Dev', 'IO', 'OS', 'Net', 'App']
  },
  aesthetic: {
    roots: ['lunar', 'solar', 'ethereal', 'soft', 'pure', 'vibes', 'soul', 'cloud', 'mist', 'haze', 'dream', 'glow', 'bloom', 'silk', 'velvet', 'petal', 'dew', 'aura', 'spirit', 'serene'],
    styles: ['soft', 'minimal', 'pure'],
    modifiers: ['_', '.', 'vibes', 'pure', 'soft']
  },
  funny: {
    roots: ['captain', 'major', 'sir', 'mister', 'uncle', 'pro', 'zilla', 'saurus', 'tron', 'matic', 'potato', 'banana', 'giggles', 'funky', 'crazy', 'lazy', 'pixel', 'super', 'mega'],
    styles: ['chaotic', 'playful'],
    modifiers: ['ALot', 'Face', 'Bot', 'Guy', 'The']
  },
  personal: {
    roots: ['native', 'real', 'iam', 'hello', 'its', 'only', 'daily', 'being', 'true', 'original', 'official', 'verified', 'simply', 'just', 'life', 'path', 'walk', 'story'],
    styles: ['memorable', 'clean'],
    modifiers: ['Official', 'Real', 'Original', 'Daily', 'Now']
  },
};

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, noDots: false, noUnderscore: false },
  { id: 'tiktok', name: 'TikTok', icon: Smartphone, noDots: false, noUnderscore: false },
  { id: 'youtube', name: 'YouTube', icon: Youtube, noDots: true, noUnderscore: true },
  { id: 'twitter', name: 'Twitter / X', icon: MessageSquare, noDots: true, noUnderscore: false },
  { id: 'facebook', name: 'Facebook', icon: Facebook, noDots: false, noUnderscore: true },
  { id: 'github', name: 'GitHub', icon: Github, noDots: true, noUnderscore: false },
  { id: 'reddit', name: 'Reddit', icon: LayoutGrid, noDots: true, noUnderscore: false },
  { id: 'twitch', name: 'Twitch', icon: Twitch, noDots: true, noUnderscore: false },
  { id: 'pinterest', name: 'Pinterest', icon: Palette, noDots: true, noUnderscore: true },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, noDots: false, noUnderscore: false },
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
  const [maxLength, setMaxLength] = useState(15);
  const [style, setStyle] = useState<'short' | 'brand' | 'pro' | 'mixed'>('brand');
  
  // Toggles
  const [noNumbers, setNoNumbers] = useState(true);
  const [noUnderscore, setNoUnderscore] = useState(true);
  
  // Targets
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set(['instagram', 'tiktok', 'youtube']));
  
  // Results
  const [generatedNames, setGeneratedNames] = useState<string[]>([]);
  const [checkResults, setCheckResults] = useState<Record<string, Record<string, ForgeResult>>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState<string | null>(null);

  // --- Advanced Generation Engine ---

  const inventRoot = () => {
    const { vowels, consonants, blends } = PHONETIC_ROOTS;
    const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    
    // Pattern: C-V-C-V or BL-V-C-V
    const startsWithBlend = Math.random() > 0.5;
    let root = startsWithBlend ? pick(blends) : pick(consonants);
    root += pick(vowels);
    root += pick(consonants);
    root += pick(vowels);
    
    return root;
  };

  const getIdentityScore = (name: string): number => {
    let score = 0;
    const len = name.length;
    
    // 1. Length Priority (Sweet spot 5-10)
    if (len >= 5 && len <= 10) score += 40;
    else if (len < 5) score += 30;
    else if (len <= 14) score += 20;

    // 2. Character Cleanliness
    if (!name.match(/\d/)) score += 20;
    if (!name.includes('_') && !name.includes('.')) score += 20;

    // 3. Phonetic Flow (Vowel presence)
    const vowels = name.match(/[aeiouy]/gi)?.length || 0;
    if (vowels > 0 && vowels < len * 0.5) score += 20;

    return score;
  };

  const executeChecks = async (names: string[]) => {
    setIsProcessing(true);
    const platforms = Array.from(selectedPlatforms);
    
    // Initial State Matrix
    const initialMap: Record<string, Record<string, ForgeResult>> = {};
    names.forEach(n => {
      initialMap[n] = {};
      platforms.forEach(p => {
        initialMap[n][p] = { platform: p, status: 'checking', url: '', node: 'Pending' };
      });
    });
    setCheckResults(initialMap);

    // High-Concurrency Audit
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
    toast({ title: "Matrix Audited", description: "Batch synchronization complete." });
  };

  const forgeUsernames = useCallback((overrideBase?: string) => {
    const results = new Set<string>();
    const count = 30;
    const pick = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
    
    const dna = CATEGORY_DNA[category];
    const base = (overrideBase || baseWord.trim() || inventRoot()).toLowerCase().replace(/\s+/g, '');

    const patterns = [
      // 1. Clean Core
      () => base,
      // 2. Premium Blend
      () => `${base}${pick(dna.roots)}`,
      // 3. Modern Prefix
      () => `${pick(['the', 'iam', 'its', 'stay', 'ultra'])}${base}`,
      // 4. Professional Suffix
      () => `${base}${pick(dna.modifiers)}`,
      // 5. Short Modifier
      () => `${base}${pick(['x', 'y', 'z', 'ly', 'io', 'os'])}`,
      // 6. Linguistic Pair
      () => `${pick(dna.roots)}${base}`,
      // 7. Compound
      () => `${base}${pick(['labs', 'studio', 'nexus', 'core'])}`,
      // 8. Abstract Invention (Only if no baseWord)
      () => !baseWord.trim() ? inventRoot() + pick(dna.roots) : base + pick(dna.modifiers)
    ];

    while (results.size < count) {
      let name = patterns[Math.floor(Math.random() * patterns.length)]();
      
      // Sanitization Matrix
      if (noUnderscore) name = name.replace(/_/g, '').replace(/\./g, '');
      if (noNumbers) name = name.replace(/[0-9]/g, '');
      
      // Platform Filter (Apply logic based on most restrictive platform in set)
      const needsNoDots = Array.from(selectedPlatforms).some(p => PLATFORMS.find(pl => pl.id === p)?.noDots);
      if (needsNoDots) name = name.replace(/\./g, '');
      
      // Quality Filter: Reject awkward clusters
      if (/(.)\1\1/.test(name)) continue; // No triple repeated chars (aaa)
      if (name.length < 3) continue;

      name = name.toLowerCase();
      if (name.length > maxLength) name = name.substring(0, maxLength);

      results.add(name);
    }

    const finalBatch = Array.from(results).sort((a, b) => getIdentityScore(b) - getIdentityScore(a));
    setGeneratedNames(finalBatch);
    setStep(3);
    executeChecks(finalBatch);
  }, [baseWord, category, noNumbers, noUnderscore, maxLength, selectedPlatforms]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(id);
    toast({ title: "Identity Isolated" });
    setTimeout(() => setIsCopied(null), 2000);
  };

  const togglePlatform = (id: string) => {
    const next = new Set(selectedPlatforms);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedPlatforms(next);
  };

  const handleMoreLikeThis = (name: string) => {
    setBaseWord(name);
    forgeUsernames(name);
    setStep(3);
    toast({ title: "Isolating Linguistic Vector", description: `Synthesizing variants for "${name}".` });
  };

  // --- Dynamic Ranking Matrix ---
  const sortedNames = useMemo(() => {
    return [...generatedNames].sort((a, b) => {
      const resA = Object.values(checkResults[a] || {});
      const resB = Object.values(checkResults[b] || {});
      
      const availA = resA.filter(r => r.status === 'available').length;
      const availB = resB.filter(r => r.status === 'available').length;

      // Rule 1: Most Available first
      if (availA !== availB) return availB - availA;
      
      // Rule 2: Best identity score
      return getIdentityScore(b) - getIdentityScore(a);
    });
  }, [generatedNames, checkResults]);

  const bestPicks = useMemo(() => {
    return sortedNames.filter(n => {
      const res = Object.values(checkResults[n] || {});
      return res.length > 0 && res.every(r => r.status === 'available');
    }).slice(0, 8);
  }, [sortedNames, checkResults]);

  const stats = useMemo(() => {
    const allResults = Object.values(checkResults).flatMap(r => Object.values(r));
    return {
      available: allResults.filter(r => r.status === 'available').length,
      taken: allResults.filter(r => r.status === 'taken').length,
      unknown: allResults.filter(r => r.status === 'unknown').length,
    };
  }, [checkResults]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Identity Suite PRO
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
             <div>
                <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
                  Username <span className="text-primary italic">Forge Studio</span>
                </h1>
                <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                  Professional linguistic identity synthesis. Forge premium handles across global social registries with clinical 1:1 availability auditing.
                </p>
             </div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 pb-2">
           <GetHelp toolId="username-forge" />
           {step > 1 && (
             <Button variant="outline" size="sm" onClick={() => setStep(prev => prev - 1)} className="h-10 px-6 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest transition-all">
                <ChevronLeft className="w-4 h-4 mr-2" /> Back
             </Button>
           )}
        </div>
      </div>

      {/* Workflow Tracker */}
      <div className="mb-12 max-w-2xl mx-auto flex items-center gap-4 px-4">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
             <div className="flex flex-col items-center gap-3">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500",
                  step === s ? "bg-primary border-primary text-white shadow-xl scale-110" : step > s ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-500" : "bg-secondary border-border text-foreground/20"
                )}>
                   {step > s ? <Check className="w-6 h-6" /> : <span className="text-xs font-black">0{s}</span>}
                </div>
                <span className={cn("text-[8px] font-black uppercase tracking-widest", step === s ? "text-primary" : "text-foreground/20")}>
                   {s === 1 ? 'DNA Config' : s === 2 ? 'Nodes' : 'Production'}
                </span>
             </div>
             {s < 3 && <div className={cn("flex-1 h-[1px] mb-8 transition-all duration-1000", step > s ? "bg-emerald-500/40" : "bg-white/5")} />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-10">
        
        {/* PHASE 1: DNA CONFIG */}
        {step === 1 && (
          <div className="max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-6 duration-700">
             <Card className="glass-card border-border shadow-2xl overflow-hidden relative">
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
                               ].map(t => (
                                 <div key={t.label} className="p-5 rounded-2xl bg-secondary/30 border border-border flex items-center justify-between group hover:border-primary/20 transition-all">
                                    <span className="text-[10px] font-black uppercase text-foreground/40">{t.label}</span>
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
                                  <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Base Word (Optional)</Label>
                                  <span className="text-[8px] font-black text-primary uppercase bg-primary/10 px-2 py-0.5 rounded">Autonomous Mode Available</span>
                               </div>
                               <Input value={baseWord} onChange={e => setBaseWord(e.target.value)} placeholder="e.g. Vesper, Nova" className="h-16 bg-secondary border-border rounded-2xl font-bold uppercase text-lg px-6" />
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
                            <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                            <p className="text-[10px] text-foreground/40 font-bold uppercase leading-relaxed">
                               If "Base Word" is empty, the forge will autonomously synthesize roots based on your chosen Category and Tone.
                            </p>
                         </div>
                      </div>
                   </div>

                   <div className="pt-8 border-t border-white/5">
                      <Button 
                        onClick={() => setStep(2)}
                        className="w-full h-20 bg-primary text-white font-black text-xs uppercase tracking-[0.4em] rounded-[2.5rem] shadow-xl shadow-primary/30 active:scale-95 transition-all"
                      >
                         Configure Registry Nodes <ChevronRight className="w-6 h-6 ml-4" />
                      </Button>
                   </div>
                </CardContent>
             </Card>
          </div>
        )}

        {/* PHASE 2: NODES */}
        {step === 2 && (
          <div className="max-w-3xl mx-auto w-full animate-in fade-in slide-in-from-right-6 duration-700">
             <Card className="glass-card border-border shadow-2xl overflow-hidden">
                <CardHeader className="py-8 border-b border-border bg-secondary/30">
                   <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                      <Globe className="w-5 h-5 text-primary" /> Target Registries
                   </CardTitle>
                </CardHeader>
                <CardContent className="p-8 sm:p-12 space-y-10">
                   <div className="grid grid-cols-2 gap-3">
                      {PLATFORMS.map(p => (
                        <button
                          key={p.id}
                          onClick={() => togglePlatform(p.id)}
                          className={cn(
                            "flex items-center gap-5 p-5 rounded-2xl border transition-all group/p",
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
                         <Zap className="w-6 h-6 mr-4" /> Initialize Forge Batch
                      </Button>
                   </div>
                </CardContent>
             </Card>
          </div>
        )}

        {/* PHASE 3: PRODUCTION */}
        {step === 3 && (
          <div className="space-y-12 animate-in fade-in duration-1000">
             
             {/* Best Picks Viewport */}
             {!isProcessing && bestPicks.length > 0 && (
               <div className="space-y-6 animate-in slide-in-from-top-4 duration-700">
                  <div className="flex items-center gap-3 px-2">
                     <BadgeCheck className="w-6 h-6 text-emerald-500" />
                     <h3 className="text-xl font-headline font-black uppercase tracking-tight text-foreground/60">Registry Perfect Matches</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                     {bestPicks.map(name => (
                       <Card key={name} className="glass-card border-emerald-500/20 bg-emerald-500/[0.03] shadow-2xl relative overflow-hidden group/best">
                          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/best:opacity-30 transition-opacity">
                             <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                          </div>
                          <CardContent className="p-8 space-y-6">
                             <div className="space-y-2">
                                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Fidelity Score: {getIdentityScore(name)}%</span>
                                <h4 className="text-2xl font-headline font-black text-foreground uppercase tracking-tight select-all truncate">{name}</h4>
                             </div>
                             <Button onClick={() => handleCopy(name, `best-${name}`)} className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-[10px] rounded-xl shadow-lg">
                                {isCopied === `best-${name}` ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />} Copy ID
                             </Button>
                          </CardContent>
                       </Card>
                     ))}
                  </div>
               </div>
             )}

             {/* Master Result Matrix */}
             <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
                <div className="xl:col-span-8 space-y-8">
                   <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px]">
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                      <CardHeader className="py-6 border-b border-border bg-secondary/30 flex flex-row items-center justify-between shrink-0 px-6 sm:px-10">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                               <Activity className="w-5 h-5" />
                            </div>
                            <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Identity Matrix Feed</CardTitle>
                         </div>
                         <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => forgeUsernames()} disabled={isProcessing} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-primary transition-all">
                               <RefreshCcw className={cn("w-3.5 h-3.5 mr-2", isProcessing && "animate-spin")} /> Regenerate
                            </Button>
                         </div>
                      </CardHeader>
                      
                      <CardContent className="p-0 flex-1 flex flex-col">
                         <div className="divide-y divide-border max-h-[800px] overflow-auto custom-scrollbar">
                            {sortedNames.map((name, idx) => {
                              const resMap = checkResults[name] || {};
                              const availCount = Object.values(resMap).filter(r => r.status === 'available').length;
                              const isPerfect = availCount === selectedPlatforms.size && selectedPlatforms.size > 0;
                              
                              return (
                               <div key={idx} className={cn(
                                 "p-6 sm:p-10 hover:bg-primary/[0.02] transition-all group/item",
                                 isPerfect ? "bg-emerald-500/[0.03]" : ""
                               )}>
                                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                     <div className="space-y-6 min-w-0 flex-1">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                           <h3 className="text-2xl sm:text-3xl font-headline font-black text-foreground uppercase tracking-tight truncate select-all">{name}</h3>
                                           <div className="flex gap-2">
                                              <Badge className={cn("text-[7px] font-black uppercase px-2", getIdentityScore(name) > 70 ? "bg-primary/20 text-primary border-primary/20" : "bg-white/5 text-white/20 border-white/5")}>
                                                 Score: {getIdentityScore(name)}%
                                              </Badge>
                                           </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                           {Array.from(selectedPlatforms).map(pId => {
                                             const s = resMap[pId]?.status || 'checking';
                                             return (
                                               <div key={pId} className={cn(
                                                 "px-3 py-1.5 rounded-xl border text-[8px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
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
                                     <div className="flex gap-3 shrink-0">
                                        <Button onClick={() => handleCopy(name, `nick-${idx}`)} variant="outline" className="h-12 px-6 rounded-xl border-border bg-background text-[9px] font-black uppercase">
                                           {isCopied === `nick-${idx}` ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />} Copy
                                        </Button>
                                        <Button 
                                          variant="outline" 
                                          onClick={() => handleMoreLikeThis(name)}
                                          className="h-12 px-6 rounded-xl border-border bg-background text-[9px] font-black uppercase text-foreground/40 hover:text-primary"
                                        >
                                           Reforge Similar
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

                {/* Sidebar Analytics */}
                <div className="xl:col-span-4 space-y-8">
                   <Card className="glass-card border-border shadow-xl">
                      <CardHeader className="py-6 border-b border-border bg-secondary/30">
                         <CardTitle className="text-[10px] font-black uppercase tracking-widest text-primary">Forge Telemetry</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-8 space-y-8">
                         <div className="grid grid-cols-1 gap-4">
                            <div className="p-8 rounded-[3rem] bg-secondary border border-border text-center space-y-2 relative overflow-hidden">
                               <div className="absolute inset-0 bg-primary/[0.02] animate-pulse" />
                               <p className="text-4xl font-headline font-black text-foreground">{stats.available}</p>
                               <p className="text-[9px] font-black uppercase text-foreground/30 tracking-widest">Viable Signals Identified</p>
                            </div>
                         </div>

                         <div className="p-8 rounded-[3rem] bg-primary/5 border border-primary/10 space-y-6">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary shadow-inner">
                                  <ShieldCheck className="w-5 h-5" />
                                </div>
                                <h4 className="text-[11px] font-black uppercase text-foreground">Verified Registry Check</h4>
                            </div>
                            <p className="text-[11px] text-foreground/40 font-medium leading-relaxed uppercase tracking-tight">
                               Identity validation uses clinical-grade HTTP probing. Nodes that restrict automated probes are marked as "Unknown" for protocol accuracy.
                            </p>
                         </div>

                         <Button onClick={() => setStep(1)} variant="outline" className="w-full h-16 border-border bg-white/5 text-foreground/60 text-[9px] font-black uppercase tracking-widest rounded-2xl shadow-lg">
                            Re-Calibrate DNA Matrix
                         </Button>
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
