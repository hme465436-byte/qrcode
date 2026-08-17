"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, 
  Sparkles, 
  RefreshCcw, 
  Copy, 
  Trash2, 
  CheckCircle2, 
  Info,
  Flame,
  Ghost,
  Smile,
  Shield,
  Star,
  Zap,
  LayoutGrid,
  Hash,
  ArrowRight,
  Settings2,
  Sword,
  Wand2,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

type NicknameStyle = 'cool' | 'fire' | 'cute' | 'pro' | 'funny' | 'symbols';

interface NicknameConfig {
  name: string;
  style: NicknameStyle;
  useSymbols: boolean;
}

const SYMBOL_SETS = [
  { left: '⟨', right: '⟩' },
  { left: '「', right: '」' },
  { left: '『', right: '』' },
  { left: '【', right: '】' },
  { left: '⚡', right: '⚡' },
  { left: '✪', right: '✪' },
  { left: '◈', right: '◈' },
  { left: '⚔', right: '⚔' },
  { left: '✨', right: '✨' },
];

export default function NicknameGeneratorPage() {
  const { toast } = useToast();
  const [name, setName] = useState('Umar');
  const [style, setStyle] = useState<NicknameStyle>('cool');
  const [useSymbols, setUseSymbols] = useState(true);
  const [nicknames, setNicknames] = useState<string[]>([]);
  const [isCopied, setIsCopied] = useState<string | null>(null);

  const generate = useCallback(() => {
    if (!name.trim()) {
      setNicknames([]);
      return;
    }

    const n = name.trim();
    const results: string[] = [];
    const count = 12;

    const templates: Record<NicknameStyle, string[]> = {
      cool: [
        `${n}_X`, `The_${n}`, `${n}_Infinity`, `Legend${n}`, `Nova_${n}`, `[n]2024`, 
        `X_${n}_X`, `Shadow_${n}`, `Apex_${n}`, `${n}_Alpha`, `Vector_${n}`, `${n}_Elite`
      ],
      fire: [
        `🔥${n}🔥`, `${n}_Burn`, `Ignite_${n}`, `Draco_${n}`, `${n}_Blaze`, `Viper_${n}`,
        `${n}_Strike`, `Ghost_${n}`, `${n}_Rage`, `Turbo_${n}`, `Nitro_${n}`, `${n}_Pulse`
      ],
      cute: [
        `✨${n}✨`, `${n}ie`, `Sweet${n}`, `Little${n}`, `${n}_Joy`, `Honey${n}`,
        `${n}Cloud`, `Mochi${n}`, `Pixel${n}`, `${n}Berry`, `Starry${n}`, `${n}Bunny`
      ],
      pro: [
        `Pro_${n}`, `Dev_${n}`, `${n}_HQ`, `System_${n}`, `${n}_Main`, `Master_${n}`,
        `${n}_Labs`, `Admin_${n}`, `${n}_Fix`, `Root_${n}`, `${n}_Exec`, `Core_${n}`
      ],
      funny: [
        `Captain_${n}`, `Sir_${n}_A_Lot`, `Major_${n}`, `${n}Saurus`, `Mr_${n}`, `Uncle_${n}`,
        `Professor_${n}`, `TheReal${n}`, `Doge${n}`, `${n}Zilla`, `Bread${n}`, `${n}Waffles`
      ],
      symbols: [
        `| ${n} |`, `• ${n} •`, `* ${n} *`, `+ ${n} +`, `~ ${n} ~`, `# ${n} #`,
        `= ${n} =`, `> ${n} <`, `! ${n} !`, `- ${n} -`, `_ ${n} _`, `: ${n} :`
      ]
    };

    const activeTemplates = templates[style];
    
    for (let i = 0; i < count; i++) {
      let nick = activeTemplates[i].replace('[n]', n);
      
      if (useSymbols) {
        const sym = SYMBOL_SETS[Math.floor(Math.random() * SYMBOL_SETS.length)];
        nick = `${sym.left}${nick}${sym.right}`;
      }
      
      results.push(nick);
    }

    setNicknames(results);
  }, [name, style, useSymbols]);

  useEffect(() => {
    generate();
  }, [generate]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(id);
    toast({ title: "Copied", description: "Nickname saved to clipboard." });
    setTimeout(() => setIsCopied(null), 2000);
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(nicknames.join('\n'));
    setIsCopied('all');
    toast({ title: "Batch Copied", description: "All 12 nicknames saved." });
    setTimeout(() => setIsCopied(null), 2000);
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest mb-4">
            <User className="w-3.5 h-3.5" /> Identity Suite
          </div>
          <h1 className="text-3xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight">
            Nickname <span className="text-primary italic">Generator Studio</span>
          </h1>
          <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
            Professional identity synthesis. Generate stylized nicknames, gamertags, and aliases with multiple linguistic profiles and artistic symbol matrixing.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 pb-2">
           <GetHelp toolId="nickname-generator" />
           <Button variant="outline" onClick={generate} className="h-11 px-6 rounded-xl border-border bg-secondary/50 text-[9px] font-black uppercase tracking-widest hover:text-primary transition-all shadow-lg">
              <RefreshCcw className="w-4 h-4 mr-2" /> Regenerate
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                <Settings2 className="w-5 h-5 text-primary" /> Matrix Config
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-10">
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Base Identifier</Label>
                <div className="relative group/name">
                  <Input 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter name..."
                    className="h-14 bg-secondary border-border rounded-2xl text-lg font-bold px-6 focus:ring-primary/40"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/name:opacity-100 transition-opacity pointer-events-none">
                    <Type className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Linguistic Style</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'cool', label: 'Cool', icon: Zap },
                    { id: 'fire', label: 'Fire', icon: Flame },
                    { id: 'cute', label: 'Cute', icon: Smile },
                    { id: 'pro', label: 'Pro', icon: Shield },
                    { id: 'funny', label: 'Funny', icon: Ghost },
                    { id: 'symbols', label: 'Mixed', icon: Hash },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStyle(s.id as NicknameStyle)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 py-5 rounded-2xl border transition-all",
                        style === s.id ? "bg-primary text-white border-primary shadow-lg scale-105" : "bg-background border-border text-foreground/40 hover:border-primary/20"
                      )}
                    >
                      <s.icon className="w-5 h-5" />
                      <span className="text-[9px] font-black uppercase tracking-widest leading-none">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-[2rem] bg-secondary/50 border border-border flex items-center justify-between group hover:border-primary/20 transition-all">
                 <div className="space-y-1 min-w-0 pr-4">
                    <p className="text-[11px] font-black text-foreground uppercase tracking-widest">Symbol Matrix</p>
                    <p className="text-[9px] text-foreground/30 font-medium uppercase truncate">Append artistic ASCII framing</p>
                 </div>
                 <div className="flex items-center h-full">
                    <button 
                      onClick={() => setUseSymbols(!useSymbols)}
                      className={cn(
                        "relative w-12 h-6 rounded-full transition-colors duration-300",
                        useSymbols ? "bg-primary" : "bg-white/10"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300",
                        useSymbols ? "translate-x-6" : "translate-x-0"
                      )} />
                    </button>
                 </div>
              </div>

              <div className="pt-2">
                <Button 
                  onClick={handleCopyAll}
                  disabled={nicknames.length === 0}
                  className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl flex items-center justify-center gap-4 text-sm shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                >
                  {isCopied === 'all' ? <CheckCircle2 className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                  Copy Master Batch
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
               <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Local-Only Logic</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                Generation occurs 100% in volatile memory using local linguistic templates. Your identifiers are never transmitted, maintaining 100% privacy.
              </p>
            </div>
          </div>
        </div>

        {/* Results Matrix */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group flex flex-col min-h-[700px]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <Wand2 className="w-5 h-5" />
                </div>
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Active Matrix Output</CardTitle>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-background border border-border text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-3">
                  <span>Count: 12</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
               <div className="flex-1 overflow-auto custom-scrollbar p-6 bg-black/10">
                  {nicknames.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-4 py-40">
                       <LayoutGrid className="w-20 h-20 text-primary" />
                       <p className="text-xs font-black uppercase tracking-[0.3em]">Awaiting Identity Synthesis</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       {nicknames.map((nick, index) => (
                         <div key={index} className="flex items-center gap-4 p-5 rounded-[2rem] bg-white dark:bg-white/5 border border-transparent hover:border-primary/20 hover:bg-white/10 transition-all group/item min-w-0">
                            <span className="text-[9px] font-mono text-foreground/10 w-6 shrink-0">{index + 1}</span>
                            <div className="flex-1 min-w-0">
                               <p className="text-base font-bold text-foreground truncate select-all">{nick}</p>
                            </div>
                            <button 
                              onClick={() => handleCopy(nick, `nick-${index}`)}
                              className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground/20 hover:text-primary transition-all shrink-0 border border-transparent hover:border-primary/10 shadow-sm"
                            >
                               {isCopied === `nick-${index}` ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                         </div>
                       ))}
                    </div>
                  )}
               </div>

               {/* Features Footer */}
               <div className="p-8 border-t border-border bg-[#0a0a0c]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group transition-all hover:bg-secondary/80">
                        <Zap className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-foreground uppercase tracking-widest leading-none">Instant Synthesis</p>
                           <p className="text-[10px] text-foreground/40 font-medium leading-relaxed">Hardware-native identity generation for zero-latency design workflows.</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group transition-all hover:bg-secondary/80">
                        <Star className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-foreground uppercase tracking-widest leading-none">High Fidelity</p>
                           <p className="text-[10px] text-foreground/40 font-medium leading-relaxed">Artistic patterns optimized for Discord, WhatsApp, and gaming grids.</p>
                        </div>
                     </div>
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
