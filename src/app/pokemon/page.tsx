"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Search, 
  Trash2, 
  Sparkles, 
  Loader2, 
  Info,
  CheckCircle2,
  Zap,
  Activity,
  AlertCircle,
  Dices,
  ShieldCheck,
  RotateCcw,
  Gamepad2,
  Sword,
  Shield,
  Heart,
  Scale,
  Maximize2,
  LayoutGrid,
  ChevronRight,
  Target,
  Share2,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  History,
  Settings2,
  Star,
  Eye,
  EyeOff,
  Wind
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

interface PokemonData {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    front_shiny: string;
    other?: {
      'official-artwork'?: { 
        front_default: string;
        front_shiny: string;
      };
    };
  };
  types: { type: { name: string } }[];
  height: number;
  weight: number;
  stats: { base_stat: number; stat: { name: string } }[];
  abilities: { ability: { name: string } }[];
}

interface NameRegistryEntry {
  name: string;
  url: string;
}

export default function PokemonPage() {
  const { toast } = useToast();
  
  // Search State
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [nameRegistry, setNameRegistry] = useState<NameRegistryEntry[]>([]);
  
  // Content State
  const [data, setData] = useState<PokemonData | null>(null);
  const [isShiny, setIsShiny] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // UI State
  const [isCopied, setIsCopied] = useState(false);

  // --- 1. Identity Registry Handshake (One-time fetch for suggestions) ---
  useEffect(() => {
    const fetchRegistry = async () => {
      try {
        const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1302');
        const json = await res.json();
        setNameRegistry(json.results || []);
      } catch (e) {
        console.warn("Linguistic registry node restricted.");
      }
    };
    fetchRegistry();
  }, []);

  // --- 2. Live Suggestion Logic ---
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    const matches = nameRegistry
      .filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
      .map(p => p.name)
      .slice(0, 5);
    setSuggestions(matches);
  }, [query, nameRegistry]);

  // --- 3. Primary Fetch Protocol ---
  const fetchPokemon = useCallback(async (target: string | number) => {
    const cleanQuery = typeof target === 'string' ? target.trim().toLowerCase() : target;
    if (!cleanQuery) return;

    setIsLoading(true);
    setError(null);
    setSuggestions([]);

    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(cleanQuery)}`);
      
      if (response.status === 404) {
        setError("Identity Not Recognized: This unit does not exist in the primary matrix.");
      } else if (!response.ok) {
        throw new Error("Uplink failure.");
      } else {
        const json = await response.json();
        setData(json);
        setQuery('');
        toast({ title: "Signal Isolated", description: `Identity mapped for #${json.id} ${json.name.toUpperCase()}.` });
      }
    } catch (err) {
      setError("Matrix Retrieval Failure: Discovery nodes are restricted.");
      toast({ variant: "destructive", title: "Protocol Failed" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // --- 4. Navigation Protocols ---
  const handleRandom = () => {
    const randomId = Math.floor(Math.random() * 1025) + 1;
    fetchPokemon(randomId);
  };

  const handleAdjacent = (direction: 'next' | 'prev') => {
    if (!data) return;
    const nextId = direction === 'next' ? data.id + 1 : data.id - 1;
    if (nextId < 1) return;
    fetchPokemon(nextId);
  };

  const handleShare = () => {
    if (!data) return;
    const text = `Pokemon Identity: ${data.name.toUpperCase()} (#${data.id}). Discovered via My Kit Tool.`;
    if (navigator.share) {
      navigator.share({ title: 'Pokemon Studio Discovery', text });
    } else {
      navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast({ title: "Identity Copied" });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const getStatColor = (val: number) => {
    if (val > 100) return "bg-green-500";
    if (val > 70) return "bg-primary";
    if (val > 40) return "bg-amber-500";
    return "bg-red-500";
  };

  const currentSprite = useMemo(() => {
    if (!data) return null;
    const artwork = data.sprites.other?.['official-artwork'];
    if (isShiny) {
      return artwork?.front_shiny || data.sprites.front_shiny || data.sprites.front_default;
    }
    return artwork?.front_default || data.sprites.front_default;
  }, [data, isShiny]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Gamepad2 className="w-3.5 h-3.5" /> Intelligence Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <h1 className="text-3xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
                Pokemon <span className="text-primary italic">Finder Studio</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional linguistic discovery engine. Explore the Pokemon matrix through clinical identity lookup with 1:1 stat fidelity and visual asset isolation.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="pokemon" />
              {(data || error || query) && (
                <Button variant="outline" size="sm" onClick={() => { setQuery(''); setData(null); setError(null); }} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                   <Trash2 className="w-3.5 h-3.5 mr-2" /> Reset
                </Button>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Search & Tools */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-visible relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
               <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                 <Search className="w-5 h-5 text-primary" /> Discovery Node
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
              <div className="space-y-4 relative">
                <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Linguistic Input</Label>
                <div className="relative group/input">
                  <Input 
                    placeholder="Search name or index..." 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchPokemon(query)}
                    className="h-16 bg-secondary border-border rounded-2xl text-lg font-bold text-center uppercase tracking-widest focus:ring-primary/40"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/input:opacity-100 transition-opacity">
                    <Dices className="w-6 h-6 text-primary" />
                  </div>

                  {/* Live Suggestions Dropdown */}
                  {suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-2 z-50 animate-in slide-in-from-top-2 duration-300">
                      <div className="glass-card border-border shadow-2xl rounded-2xl overflow-hidden divide-y divide-white/5">
                        {suggestions.map(s => (
                          <button 
                            key={s} 
                            onClick={() => fetchPokemon(s)}
                            className="w-full p-4 flex items-center justify-between hover:bg-primary/5 transition-all text-left group/item"
                          >
                            <span className="text-[10px] font-black uppercase tracking-widest text-foreground group-hover/item:text-primary">{s}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-foreground/10 group-hover/item:text-primary transition-all" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    onClick={() => fetchPokemon(query)} 
                    disabled={isLoading || !query.trim()}
                    className="h-14 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-primary/30 active:scale-95 transition-all"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                    Lookup
                  </Button>
                  <Button 
                    onClick={handleRandom}
                    variant="outline"
                    className="h-14 border-border bg-secondary text-foreground font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg"
                  >
                    <RefreshCcw className="w-4 h-4 mr-2 text-primary" /> Random
                  </Button>
                </div>
              </div>

              {data && (
                <div className="p-6 rounded-[2.5rem] bg-secondary/50 border border-border space-y-6 animate-in zoom-in">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <Star className={cn("w-4 h-4 transition-colors", isShiny ? "text-yellow-500 fill-current" : "text-foreground/20")} />
                         <span className="text-[10px] font-black uppercase text-foreground/60 tracking-widest">Shiny Protocol</span>
                      </div>
                      <Switch checked={isShiny} onCheckedChange={setIsShiny} />
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleAdjacent('prev')}
                        disabled={data.id <= 1}
                        className="h-10 text-[8px] font-black uppercase tracking-widest rounded-xl"
                      >
                         <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Previous
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleAdjacent('next')}
                        className="h-10 text-[8px] font-black uppercase tracking-widest rounded-xl"
                      >
                         Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                   </div>
                </div>
              )}

              <div className="pt-6 border-t border-white/5 space-y-4">
                 <Label className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-1">Studio Configuration</Label>
                 <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary/30 border border-border">
                       <ShieldCheck className="w-5 h-5 text-primary/40 shrink-0" />
                       <div className="space-y-1">
                          <h4 className="text-[10px] font-black uppercase text-foreground/60">Verified Data</h4>
                          <p className="text-[9px] text-foreground/30 font-medium uppercase">Direct synchronization with the PokeAPI REST nodes.</p>
                       </div>
                    </div>
                    <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary/30 border border-border">
                       <History className="w-5 h-5 text-primary/40 shrink-0" />
                       <div className="space-y-1">
                          <h4 className="text-[10px] font-black uppercase text-foreground/60">Local Sandbox</h4>
                          <p className="text-[9px] text-foreground/30 font-medium uppercase">Query results are volatile and held strictly in hardware memory.</p>
                       </div>
                    </div>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Result Matrix */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[650px] bg-black/10">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <Activity className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Identity Profile</CardTitle>
                 </div>
                 {data && (
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest px-3 py-1">Code: #{data.id}</Badge>
                 )}
              </CardHeader>
              
              <CardContent className="flex-1 p-8 sm:p-16 flex flex-col items-center justify-center relative overflow-hidden">
                 {!data && !isLoading && !error && (
                   <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-6 py-20">
                      <Gamepad2 className="w-24 h-24 text-primary" />
                      <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Discovery Signal</p>
                   </div>
                 )}

                 {isLoading && (
                   <div className="flex-1 flex flex-col items-center justify-center space-y-10 py-20">
                      <div className="relative">
                         <div className="w-28 h-28 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                         <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                      </div>
                      <p className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">Decoding Identity Matrix...</p>
                   </div>
                 )}

                 {error && !isLoading && (
                   <div className="flex flex-col items-center gap-8 py-20 text-center animate-in shake duration-500">
                      <AlertCircle className="w-16 h-16 text-destructive animate-bounce" />
                      <div className="space-y-2">
                         <h3 className="text-xl font-headline font-black text-destructive uppercase">Reference Failure</h3>
                         <p className="text-[11px] text-foreground/40 font-bold uppercase max-w-sm mx-auto leading-relaxed">{error}</p>
                      </div>
                      <Button onClick={handleRandom} className="h-12 bg-secondary border border-border text-foreground font-black rounded-xl text-[9px] uppercase tracking-widest">Surprise Discovery</Button>
                   </div>
                 )}

                 {data && !isLoading && (
                   <div className="w-full space-y-12 animate-in zoom-in-95 duration-500">
                      {/* Sprite & Primary Header */}
                      <div className="flex flex-col md:flex-row items-center gap-10 border-b border-white/5 pb-12">
                         <div className="relative group/sprite shrink-0">
                            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-50 group-hover/sprite:opacity-100 transition-opacity" />
                            <div className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-[3.5rem] bg-secondary border-4 border-white dark:border-white/5 flex items-center justify-center shadow-2xl overflow-hidden ring-1 ring-border">
                               <img 
                                 src={currentSprite || ''} 
                                 alt={data.name} 
                                 className="w-full h-full object-contain p-6 group-hover/sprite:scale-110 transition-transform duration-700" 
                               />
                               {isShiny && <div className="absolute top-4 right-4 text-yellow-500 drop-shadow-lg"><Star className="w-6 h-6 fill-current" /></div>}
                            </div>
                         </div>
                         <div className="text-center md:text-left space-y-4 flex-1 min-w-0">
                            <div className="space-y-1">
                               <p className="text-[10px] font-black text-primary uppercase tracking-[0.6em]">Registry ID: #{data.id.toString().padStart(4, '0')}</p>
                               <h2 className="text-4xl sm:text-6xl font-headline font-black text-foreground uppercase tracking-tighter leading-[0.9] truncate">{data.name}</h2>
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-2">
                               {data.types.map(t => (
                                 <Badge key={t.type.name} className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest px-3 py-1">
                                    {t.type.name}
                                 </Badge>
                               ))}
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                               <div className="space-y-0.5">
                                  <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">Height Matrix</p>
                                  <p className="text-sm font-bold text-foreground">{(data.height / 10).toFixed(1)} M</p>
                                </div>
                                <div className="space-y-0.5">
                                   <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">Weight Matrix</p>
                                   <p className="text-sm font-bold text-foreground">{(data.weight / 10).toFixed(1)} KG</p>
                                </div>
                            </div>
                         </div>
                      </div>

                      {/* Stat Telemetry Matrix */}
                      <div className="space-y-6">
                         <div className="flex items-center gap-3">
                            <Zap className="w-4 h-4 text-primary" />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40">Stat Telemetry</h4>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                            {[
                              { label: 'HP (Vitality)', val: data.stats.find(s => s.stat.name === 'hp')?.base_stat || 0, icon: Heart },
                              { label: 'Attack Matrix', val: data.stats.find(s => s.stat.name === 'attack')?.base_stat || 0, icon: Sword },
                              { label: 'Defense Layer', val: data.stats.find(s => s.stat.name === 'defense')?.base_stat || 0, icon: Shield },
                              { label: 'Speed Velocity', val: data.stats.find(s => s.stat.name === 'speed')?.base_stat || 0, icon: Wind },
                            ].map((stat) => (
                              <div key={stat.label} className="space-y-2 group">
                                 <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-2">
                                       <stat.icon className="w-3 h-3 text-primary/40 group-hover:text-primary transition-colors" />
                                       <span className="text-[9px] font-black uppercase text-foreground/40">{stat.label}</span>
                                    </div>
                                    <span className="text-xs font-mono font-bold text-foreground">{stat.val}</span>
                                 </div>
                                 <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div 
                                      className={cn("h-full transition-all duration-1000 ease-out", getStatColor(stat.val))}
                                      style={{ width: `${Math.min(100, (stat.val / 255) * 100)}%` }}
                                    />
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>

                      {/* Ability Protocol */}
                      <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border space-y-6">
                         <div className="flex items-center gap-3">
                            <Layers className="w-4 h-4 text-primary" />
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Ability Protocols</h4>
                         </div>
                         <div className="flex flex-wrap gap-3">
                            {data.abilities.map((a, i) => (
                              <div key={i} className="px-6 py-3 rounded-2xl bg-background border border-border flex items-center justify-between gap-6 group/abi hover:border-primary/40 transition-all">
                                 <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover/abi:bg-primary transition-colors" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground/70">{a.ability.name.replace('-', ' ')}</span>
                                 </div>
                                 <span className="text-[8px] font-black text-foreground/10 uppercase">Identity {i + 1}</span>
                              </div>
                            ))}
                         </div>
                      </div>

                      {/* Actions Row */}
                      <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-4">
                         <Button onClick={handleShare} className="h-16 flex-1 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl hover:bg-white/90 active:scale-95 transition-all">
                            {isCopied ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
                            Copy Identity Report
                         </Button>
                         <div className="flex gap-4">
                            <Button variant="outline" size="icon" onClick={() => handleAdjacent('prev')} disabled={data.id <= 1} className="h-16 w-16 border-white/10 bg-white/5 rounded-2xl text-white">
                               <ChevronLeft className="w-6 h-6" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => handleAdjacent('next')} className="h-16 w-16 border-white/10 bg-white/5 rounded-2xl text-white">
                               <ChevronRight className="w-6 h-6" />
                            </Button>
                         </div>
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
