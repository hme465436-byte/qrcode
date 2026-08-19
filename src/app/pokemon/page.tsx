"use client"

import React, { useState } from 'react';
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
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

interface PokemonData {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    other?: {
      'official-artwork'?: { front_default: string };
    };
  };
  types: { type: { name: string } }[];
  height: number;
  weight: number;
  stats: { base_stat: number; stat: { name: string } }[];
  abilities: { ability: { name: string } }[];
}

export default function PokemonPage() {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [data, setData] = useState<PokemonData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPokemon = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return;

    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(cleanQuery)}`);
      
      if (response.status === 404) {
        setError("Identity Not Recognized: This unit does not exist in the primary matrix.");
      } else if (!response.ok) {
        throw new Error("Uplink failure.");
      } else {
        const json = await response.json();
        setData(json);
        toast({ title: "Signal Isolated", description: `Identity mapped for #${json.id} ${json.name.toUpperCase()}.` });
      }
    } catch (err) {
      setError("Matrix Retrieval Failure: Discovery nodes are restricted.");
      toast({ variant: "destructive", title: "Protocol Failed" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setData(null);
    setError(null);
    toast({ title: "Studio Reset" });
  };

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
                <Button variant="outline" size="sm" onClick={handleClear} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                   <Trash2 className="w-3.5 h-3.5 mr-2" /> Reset
                </Button>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Search Panel */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
               <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                 <Search className="w-5 h-5 text-primary" /> Discovery Node
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
              <form onSubmit={fetchPokemon} className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Linguistic Input (Name or ID)</Label>
                <div className="relative group/input">
                  <Input 
                    placeholder="Enter name (e.g. Pikachu, 25)..." 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="h-16 bg-secondary border-border rounded-2xl text-lg font-bold text-center uppercase tracking-widest focus:ring-primary/40"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/input:opacity-100 transition-opacity">
                    <Dices className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  disabled={isLoading || !query.trim()}
                  className="w-full h-14 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-primary/30 active:scale-95 transition-all"
                >
                   {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                   Execute Lookup
                </Button>
              </form>

              <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-3">
                 {['Pikachu', 'Charizard', 'Mewtwo', 'Lucario'].map(name => (
                   <button 
                    key={name} 
                    onClick={() => { setQuery(name); fetchPokemon(); }}
                    className="h-10 px-4 rounded-xl border border-border bg-secondary/50 text-[8px] font-black uppercase text-foreground/40 hover:text-primary transition-all"
                   >
                     {name}
                   </button>
                 ))}
              </div>
            </CardContent>
          </Card>

          <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
             <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
             </div>
             <div className="space-y-2">
               <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Privacy Sovereign</h4>
               <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                 Linguistic queries are processed strictly in local memory. The studio does not log or transmit your lookup history to any database.
               </p>
             </div>
          </div>
        </div>

        {/* Right Column: Results Panel */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px] bg-black/10">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <Activity className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Identity Profile</CardTitle>
                 </div>
              </CardHeader>
              
              <CardContent className="flex-1 p-8 sm:p-12 flex flex-col items-center justify-center relative overflow-hidden">
                 {!data && !isLoading && !error && (
                   <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-6 py-20">
                      <Gamepad2 className="w-24 h-24 text-primary" />
                      <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Signal Detection</p>
                   </div>
                 )}

                 {isLoading && (
                   <div className="flex-1 flex flex-col items-center justify-center space-y-10 py-20">
                      <div className="relative">
                         <div className="w-28 h-28 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                         <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                      </div>
                      <p className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">Decoding Binary Matrix...</p>
                   </div>
                 )}

                 {error && !isLoading && (
                   <div className="flex flex-col items-center gap-6 py-20 text-center animate-in shake duration-500">
                      <AlertCircle className="w-16 h-16 text-destructive animate-bounce" />
                      <div className="space-y-2">
                         <h3 className="text-xl font-headline font-black text-destructive uppercase">Reference Failure</h3>
                         <p className="text-[11px] text-foreground/40 font-bold uppercase max-w-sm mx-auto leading-relaxed">{error}</p>
                      </div>
                   </div>
                 )}

                 {data && !isLoading && (
                   <div className="w-full space-y-12 animate-in zoom-in-95 duration-500">
                      {/* Sprite & Primary Info */}
                      <div className="flex flex-col md:flex-row items-center gap-10 border-b border-white/5 pb-12">
                         <div className="relative group/sprite">
                            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-50 group-hover/sprite:opacity-100 transition-opacity" />
                            <div className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-[3.5rem] bg-secondary border-4 border-white dark:border-white/5 flex items-center justify-center shadow-2xl overflow-hidden ring-1 ring-border">
                               <img 
                                 src={data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default} 
                                 alt={data.name} 
                                 className="w-full h-full object-contain p-6 group-hover/sprite:scale-110 transition-transform duration-700" 
                               />
                            </div>
                         </div>
                         <div className="text-center md:text-left space-y-4 flex-1">
                            <div className="space-y-1">
                               <p className="text-[10px] font-black text-primary uppercase tracking-[0.6em]">Registry ID: #{data.id}</p>
                               <h2 className="text-4xl sm:text-6xl font-headline font-black text-foreground uppercase tracking-tighter leading-none">{data.name}</h2>
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-2">
                               {data.types.map(t => (
                                 <Badge key={t.type.name} className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest px-3 py-1">
                                    {t.type.name}
                                 </Badge>
                               ))}
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4">
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

                      {/* Stat Telemetry Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                         {[
                           { label: 'Health (HP)', key: 'hp', icon: Heart, val: data.stats.find(s => s.stat.name === 'hp')?.base_stat || 0, color: 'text-rose-500' },
                           { label: 'Attack Matrix', key: 'attack', icon: Sword, val: data.stats.find(s => s.stat.name === 'attack')?.base_stat || 0, color: 'text-amber-500' },
                           { label: 'Defense Layer', key: 'defense', icon: Shield, val: data.stats.find(s => s.stat.name === 'defense')?.base_stat || 0, color: 'text-sky-500' },
                         ].map((item) => (
                           <div key={item.key} className="p-6 rounded-3xl bg-secondary/50 border border-border group hover:border-primary/20 transition-all flex flex-col items-center gap-3 text-center">
                              <div className={cn("w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center shadow-inner", item.color)}>
                                 <item.icon className="w-5 h-5" />
                              </div>
                              <div className="space-y-0.5">
                                 <p className="text-[8px] font-black uppercase text-foreground/30 tracking-widest">{item.label}</p>
                                 <p className="text-2xl font-headline font-black text-foreground">{item.val}</p>
                              </div>
                           </div>
                         ))}
                      </div>

                      {/* Abilities Protocol */}
                      <div className="p-8 rounded-[3rem] bg-secondary border border-border space-y-6">
                         <div className="flex items-center gap-3">
                            <Zap className="w-4 h-4 text-primary" />
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Abilities Protocol</h4>
                         </div>
                         <div className="flex flex-wrap gap-3">
                            {data.abilities.map((a, i) => (
                              <div key={i} className="px-6 py-3 rounded-2xl bg-background border border-border flex items-center gap-3 group/abi hover:border-primary/40 transition-all">
                                 <div className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover/abi:bg-primary transition-colors" />
                                 <span className="text-[11px] font-black uppercase tracking-widest text-foreground/70">{a.ability.name.replace('-', ' ')}</span>
                              </div>
                            ))}
                         </div>
                      </div>

                      <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-4">
                         <Button onClick={() => handleClear()} variant="outline" className="h-16 flex-1 border-white/10 bg-white/5 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl">
                            <RotateCcw className="w-5 h-5 mr-2" /> Reset Studio
                         </Button>
                         <Button onClick={() => fetchAyah()} variant="outline" className="h-16 px-10 border-white/10 bg-white/5 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl">
                            <Share2 className="w-5 h-5" />
                         </Button>
                      </div>
                   </div>
                 )}
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
