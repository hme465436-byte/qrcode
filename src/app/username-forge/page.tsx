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
  Settings2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';
import { checkUsernameAction, ForgeResult } from './actions';

// --- Production Constants ---
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

const STYLES = ['Short', 'Cool', 'Pro', 'Rare', 'Mixed'];
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
  
  // Step 1: Parameters
  const [category, setCategory] = useState('personal');
  const [profession, setProfession] = useState('');
  const [hobby, setHobby] = useState('');
  const [baseWord, setBaseWord] = useState('');
  const [style, setStyle] = useState('Cool');
  const [maxLength, setMaxLength] = useState(15);
  
  // Step 2: Platforms
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set(['instagram', 'github', 'youtube']));
  
  // Step 3: Forging Results
  const [generatedNames, setGeneratedNames] = useState<string[]>([]);
  const [checkResults, setCheckResults] = useState<Record<string, Record<string, ForgeResult>>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState<string | null>(null);

  // --- Identity Synthesis Logic ---
  const forgeUsernames = useCallback(() => {
    const base = baseWord.trim() || 'User';
    const prof = profession.trim();
    const hob = hobby.trim();
    
    const prefixes = ['The', 'Real', 'Official', 'IAm', 'Its', 'Mr', 'Ms', 'Im', 'Only', 'My'];
    const suffixes = ['HQ', 'Studio', 'Pro', 'Labs', 'Dev', 'Art', 'X', 'Zen', 'Core', 'Vibes'];
    const proSuffixes = ['Architect', 'Analyst', 'Systems', 'Global', 'Solutions', 'Direct'];
    const gamingPrefixes = ['Shadow', 'Apex', 'Nova', 'Ghost', 'Viper', 'Zion', 'Alpha'];

    let pool: string[] = [];

    // Strategy 1: Simple Combos
    pool.push(`${base}${prof}`, `${prof}${base}`, `${base}${hob}`);
    
    // Strategy 2: Styled
    if (style === 'Cool') {
      pool.push(`${prefixes[Math.floor(Math.random() * prefixes.length)]}${base}`);
      pool.push(`${base}${suffixes[Math.floor(Math.random() * suffixes.length)]}`);
    } else if (style === 'Pro') {
      pool.push(`${base}${proSuffixes[Math.floor(Math.random() * proSuffixes.length)]}`);
      pool.push(`${prof}_${base}`);
    } else if (category === 'gaming') {
      pool.push(`${gamingPrefixes[Math.floor(Math.random() * gamingPrefixes.length)]}${base}`);
      pool.push(`${base}_GG`);
    }

    // Variations
    const variants: string[] = [];
    pool.forEach(p => {
      const clean = p.replace(/\s+/g, '');
      if (clean.length <= maxLength) variants.push(clean);
      if (clean.includes('_')) variants.push(clean.replace('_', ''));
      else if (clean.length < maxLength) variants.push(`${clean}_`);
    });

    const final = Array.from(new Set(variants)).slice(0, 15);
    setGeneratedNames(final);
    setStep(3);
    executeChecks(final);
  }, [baseWord, profession, hobby, style, category, maxLength]);

  const executeChecks = async (names: string[]) => {
    setIsProcessing(true);
    const platforms = Array.from(selectedPlatforms);
    
    // Initialize results map
    const initialMap: Record<string, Record<string, ForgeResult>> = {};
    names.forEach(n => {
      initialMap[n] = {};
      platforms.forEach(p => {
        initialMap[n][p] = { platform: p, status: 'checking', url: '' };
      });
    });
    setCheckResults(initialMap);

    // Parallel Batch Checks
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
            [n]: { ...prev[n], [p]: { platform: p, status: 'unknown', url: '' } }
          }));
        }
      })
    );

    await Promise.all(promises);
    setIsProcessing(false);
    toast({ title: "Forge Complete", description: "Audit of all identity signals finished." });
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(id);
    toast({ title: "Identifier Copied" });
    setTimeout(() => setIsCopied(null), 2000);
  };

  const togglePlatform = (id: string) => {
    const next = new Set(selectedPlatforms);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedPlatforms(next);
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
            <Wand2 className="w-3.5 h-3.5" /> Identity Suite
          </div>
          <h1 className="text-3xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
            Username <span className="text-primary italic">Forge Studio</span>
          </h1>
          <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
            Advanced linguistic identity synthesis. Forge unique usernames across global registries with real-time multi-node availability auditing.
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

      {/* Progress Wizard */}
      <div className="mb-12 max-w-3xl mx-auto flex items-center gap-4 px-4">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
             <div className="flex flex-col items-center gap-2">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500",
                  step === s ? "bg-primary border-primary text-white shadow-xl scale-110" : step > s ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-500" : "bg-secondary border-border text-foreground/20"
                )}>
                   {step > s ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-[10px] font-black">0{s}</span>}
                </div>
                <span className={cn("text-[7px] font-black uppercase tracking-widest", step === s ? "text-primary" : "text-foreground/20")}>
                   {s === 1 ? 'Parameters' : s === 2 ? 'Registry' : 'Production'}
                </span>
             </div>
             {s < 3 && <div className={cn("flex-1 h-[1px] mb-6 transition-all duration-1000", step > s ? "bg-emerald-500/40" : "bg-white/5")} />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-10">
        
        {/* STEP 1: Parameters */}
        {step === 1 && (
          <div className="max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-6 duration-700">
             <Card className="glass-card border-border shadow-2xl overflow-hidden">
                <CardHeader className="py-8 border-b border-border bg-secondary/30">
                   <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                      <Settings2 className="w-5 h-5 text-primary" /> Linguistic DNA Config
                   </CardTitle>
                </CardHeader>
                <CardContent className="p-8 sm:p-12 space-y-12">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                         <div className="space-y-4">
                            <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Identity Category</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                               {CATEGORIES.map(cat => (
                                 <button
                                   key={cat.id}
                                   onClick={() => setCategory(cat.id)}
                                   className={cn(
                                     "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all h-24",
                                     category === cat.id ? "bg-primary text-white border-primary shadow-xl" : "bg-secondary/50 border-border text-foreground/40 hover:text-primary"
                                   )}
                                 >
                                    <cat.icon className="w-5 h-5" />
                                    <span className="text-[8px] font-black uppercase tracking-widest">{cat.label}</span>
                                 </button>
                               ))}
                            </div>
                         </div>
                         <div className="space-y-4">
                            <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Atmospheric Style</Label>
                            <div className="flex flex-wrap gap-2">
                               {STYLES.map(s => (
                                 <button
                                   key={s}
                                   onClick={() => setStyle(s)}
                                   className={cn(
                                     "px-6 py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all",
                                     style === s ? "bg-primary text-white border-primary shadow-lg" : "bg-background border-border text-foreground/40 hover:text-primary"
                                   )}
                                 >
                                    {s}
                                 </button>
                               ))}
                            </div>
                         </div>
                      </div>

                      <div className="space-y-8">
                         <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                               <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Base Name / Keyword</Label>
                               <Input value={baseWord} onChange={e => setBaseWord(e.target.value)} placeholder="e.g. Umar, Matrix" className="h-14 bg-secondary border-border rounded-2xl font-bold uppercase" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-2">
                                  <Label className="text-[9px] font-black text-foreground/20 uppercase ml-1">Profession</Label>
                                  <Input value={profession} onChange={e => setProfession(e.target.value)} placeholder="e.g. Dev" className="h-12 bg-secondary/50 border-border rounded-xl text-xs" />
                               </div>
                               <div className="space-y-2">
                                  <Label className="text-[9px] font-black text-foreground/20 uppercase ml-1">Hobby / Niche</Label>
                                  <Input value={hobby} onChange={e => setHobby(e.target.value)} placeholder="e.g. Crypto" className="h-12 bg-secondary/50 border-border rounded-xl text-xs" />
                               </div>
                            </div>
                         </div>

                         <div className="space-y-4">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-foreground/30">
                               <Label>Max Character Density</Label>
                               <span className="text-primary font-mono">{maxLength}</span>
                            </div>
                            <Slider value={[maxLength]} min={4} max={30} step={1} onValueChange={v => setMaxLength(v[0])} />
                         </div>
                      </div>
                   </div>

                   <div className="pt-8 border-t border-white/5">
                      <Button 
                        onClick={() => setStep(2)}
                        disabled={!baseWord.trim()}
                        className="w-full h-16 bg-primary text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-primary/30"
                      >
                         Configure Registry Target <ChevronRight className="w-4 h-4 ml-3" />
                      </Button>
                   </div>
                </CardContent>
             </Card>
          </div>
        )}

        {/* STEP 2: Platform Selection */}
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
                            selectedPlatforms.has(p.id) ? "bg-primary text-white border-primary shadow-lg" : "bg-secondary/30 border-border text-foreground/40 hover:border-primary/20"
                          )}
                        >
                           <p.icon className={cn("w-5 h-5 transition-transform group-hover/p:scale-110", selectedPlatforms.has(p.id) ? "text-white" : "text-primary/40")} />
                           <span className="text-[10px] font-black uppercase tracking-widest truncate">{p.name}</span>
                        </button>
                      ))}
                   </div>

                   <div className="p-6 rounded-[2rem] bg-secondary/50 border border-border flex items-start gap-4">
                      <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <p className="text-[10px] text-foreground/40 font-bold uppercase leading-relaxed">
                         The engine will perform a clinical bitstream probe on each selected node. High-latency platforms like LinkedIn may return "Unknown" if automated signals are restricted.
                      </p>
                   </div>

                   <div className="pt-6 border-t border-white/5">
                      <Button 
                        onClick={forgeUsernames}
                        disabled={selectedPlatforms.size === 0}
                        className="w-full h-16 bg-primary text-white font-black text-xs uppercase tracking-[0.4em] rounded-2xl shadow-xl active:scale-95 transition-all"
                      >
                         <Zap className="w-5 h-5 mr-3" /> Initialize Forge
                      </Button>
                   </div>
                </CardContent>
             </Card>
          </div>
        )}

        {/* STEP 3: Results Matrix */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in duration-1000">
             <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                
                {/* Main Results List */}
                <div className="xl:col-span-8 space-y-6">
                   <Card className="glass-card border-border shadow-2xl overflow-hidden relative group flex flex-col min-h-[600px]">
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                      <CardHeader className="py-6 border-b border-border bg-secondary/30 flex flex-row items-center justify-between shrink-0">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                               <Activity className="w-5 h-5" />
                            </div>
                            <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Active Forge Matrix</CardTitle>
                         </div>
                         {isProcessing && (
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[8px] font-black text-primary uppercase animate-pulse">
                               Auditing Global Nodes
                            </div>
                         )}
                      </CardHeader>
                      
                      <CardContent className="p-0 overflow-hidden flex-1">
                         <div className="divide-y divide-border max-h-[700px] overflow-auto custom-scrollbar">
                            {generatedNames.map((name, idx) => (
                               <div key={idx} className="p-6 sm:p-8 hover:bg-secondary/30 transition-all group/item">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                     <div className="space-y-3 min-w-0 flex-1">
                                        <div className="flex items-center gap-4">
                                           <h3 className="text-2xl font-headline font-black text-foreground uppercase tracking-tight truncate select-all">{name}</h3>
                                           <button onClick={() => handleCopy(name, `copy-${idx}`)} className="text-foreground/10 hover:text-primary transition-colors">
                                              {isCopied === `copy-${idx}` ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                                           </button>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                           {Array.from(selectedPlatforms).map(pId => {
                                             const res = checkResults[name]?.[pId];
                                             const status = res?.status || 'checking';
                                             return (
                                               <div key={pId} className={cn(
                                                 "px-2 py-1 rounded-lg border text-[7px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
                                                 status === 'available' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                                 status === 'taken' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                                 status === 'checking' ? "bg-primary/5 text-primary/40 border-primary/10 animate-pulse" :
                                                 "bg-secondary text-foreground/20 border-border"
                                               )}>
                                                  {status === 'available' ? <Check className="w-2 h-2" /> : status === 'taken' ? <XCircle className="w-2 h-2" /> : <Loader2 className="w-2 h-2 animate-spin" />}
                                                  {PLATFORMS.find(p => p.id === pId)?.name}
                                               </div>
                                             );
                                           })}
                                        </div>
                                     </div>
                                     <div className="flex gap-2 shrink-0">
                                        <Button variant="outline" size="sm" onClick={() => executeChecks([name])} className="h-9 px-4 rounded-xl border-border bg-background text-[8px] font-black uppercase">
                                           <RefreshCcw className="w-3.5 h-3.5 mr-2" /> Re-Audit
                                        </Button>
                                     </div>
                                  </div>
                               </div>
                            ))}
                         </div>
                      </CardContent>
                   </Card>
                </div>

                {/* Analysis Sidebar */}
                <div className="xl:col-span-4 space-y-8 animate-in slide-in-from-right-6 duration-1000 stagger-2">
                   <Card className="glass-card border-border shadow-xl">
                      <CardHeader className="py-6 border-b border-border bg-secondary/30">
                         <CardTitle className="text-[10px] font-black uppercase tracking-widest text-primary">Matrix Analytics</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-8 space-y-8">
                         <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 rounded-3xl bg-secondary border border-border text-center space-y-2">
                               <p className="text-3xl font-headline font-black text-foreground">{generatedNames.length}</p>
                               <p className="text-[8px] font-black uppercase text-foreground/30 tracking-widest">Forged Items</p>
                            </div>
                            <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20 text-center space-y-2">
                               <p className="text-3xl font-headline font-black text-primary">{selectedPlatforms.size}</p>
                               <p className="text-[8px] font-black uppercase text-primary/40 tracking-widest">Active Nodes</p>
                            </div>
                         </div>

                         <div className="p-6 rounded-[2.5rem] bg-secondary/50 border border-border space-y-6">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary shadow-inner">
                                  <Target className="w-5 h-5" />
                               </div>
                               <div className="min-w-0">
                                  <h4 className="text-[11px] font-black uppercase text-foreground truncate">Signal Fidelity</h4>
                                  <p className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest">WASM OSINT Discovery</p>
                               </div>
                            </div>
                            <p className="text-[10px] text-foreground/40 font-medium leading-relaxed uppercase tracking-tighter">
                               Identity verification utilizes clinical-grade HTTP status probing. If a platform node resets the handshake, status is marked as Unknown to prevent linguistic hallucination.
                            </p>
                         </div>

                         <div className="flex flex-col gap-3">
                            <Button onClick={() => forgeUsernames()} className="h-14 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg">
                               <RefreshCcw className="w-4 h-4 mr-2" /> Re-Forge Variants
                            </Button>
                            <Button variant="outline" onClick={() => setStep(1)} className="h-11 border-border bg-white/5 text-foreground/60 text-[8px] font-black uppercase">
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
