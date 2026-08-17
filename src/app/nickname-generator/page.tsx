"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Check,
  Type,
  ShieldCheck,
  Gamepad2,
  Filter,
  Maximize2,
  Minimize2,
  Dices,
  Download,
  X,
  History,
  Crown,
  Smartphone,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

type NicknameStyle = 'cool' | 'fire' | 'cute' | 'pro' | 'funny' | 'aesthetic' | 'minimal';
type LengthMode = 'short' | 'medium' | 'long';
type GameTag = 'None' | 'FF' | 'PUBG' | 'COD' | 'Roblox' | 'Free';

const SYMBOL_SETS = [
  { left: '⟨', right: '⟩' }, { left: '「', right: '」' }, { left: '『', right: '』' },
  { left: '【', right: '】' }, { left: '⚡', right: '⚡' }, { left: '✪', right: '✪' },
  { left: '◈', right: '◈' }, { left: '⚔', right: '⚔' }, { left: '✨', right: '✨' },
  { left: '๏', right: '๏' }, { left: '々', right: '々' }, { left: '×', right: '×' },
  { left: '☆', right: '☆' }, { left: '★', right: '★' }, { left: '•', right: '•' },
];

const LEET_MAP: Record<string, string> = {
  'a': '4', 'e': '3', 'i': '1', 'o': '0', 's': '5', 't': '7', 'g': '6', 'b': '8'
};

const STYLE_TEMPLATES: Record<NicknameStyle, string[]> = {
  cool: ['[n]_X', 'The_[n]', '[n]_Infinity', 'Legend[n]', 'Nova_[n]', 'X_[n]_X', 'Shadow_[n]', 'Apex_[n]', '[n]_Alpha', 'Vector_[n]'],
  fire: ['🔥[n]🔥', '[n]_Burn', 'Ignite_[n]', 'Draco_[n]', '[n]_Blaze', 'Viper_[n]', '[n]_Strike', '[n]_Rage', 'Turbo_[n]', 'Nitro_[n]'],
  cute: ['✨[n]✨', '[n]ie', 'Sweet[n]', 'Little[n]', '[n]_Joy', 'Honey[n]', '[n]Cloud', 'Mochi[n]', 'Pixel[n]', '[n]Berry'],
  pro: ['Pro_[n]', 'Dev_[n]', '[n]_HQ', 'System_[n]', '[n]_Main', 'Master_[n]', '[n]_Labs', 'Admin_[n]', 'Root_[n]', 'Core_[n]'],
  funny: ['Captain_[n]', 'Sir_[n]_A_Lot', 'Major_[n]', '[n]Saurus', 'Mr_[n]', 'Uncle_[n]', 'Professor_[n]', 'TheReal[n]', 'Doge[n]', '[n]Zilla'],
  aesthetic: ['[n] . v1', 'soft_[n]', '[n] vibes', 'dreamy_[n]', '[n]_aet', 'cloud_[n]', 'pure.[n]', 'lun_[n]', 'ethereal_[n]', '[n]_mx'],
  minimal: ['[n]', 'i[n]', 'v[n]', '_[n]_', '[n].', 'x[n]', 're:[n]', '[n]0', '[n]x', '.[n]']
};

export default function AdvancedNicknameGeneratorPage() {
  const { toast } = useToast();
  const [name, setName] = useState('Umar');
  const [gameTag, setGameTag] = useState<GameTag>('None');
  const [style, setStyle] = useState<NicknameStyle>('cool');
  const [lengthMode, setLengthMode] = useState<LengthMode>('medium');
  const [useSymbols, setUseSymbols] = useState(true);
  const [noSpaces, setNoSpaces] = useState(true);
  const [max16, setMax16] = useState(true);
  const [nicknames, setNicknames] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isCopied, setIsCopied] = useState<string | null>(null);

  const applyLeet = (text: string) => {
    return text.split('').map(char => {
      const low = char.toLowerCase();
      return (Math.random() > 0.4 && LEET_MAP[low]) ? LEET_MAP[low] : char;
    }).join('');
  };

  const generate = useCallback(() => {
    if (!name.trim()) return;

    const n = name.trim();
    const results: string[] = [];
    const count = 20;

    const activeTemplates = STYLE_TEMPLATES[style];
    
    for (let i = 0; i < count; i++) {
      let base = activeTemplates[i % activeTemplates.length].replace('[n]', n);
      
      // Apply Game Tag
      if (gameTag !== 'None') {
        base = Math.random() > 0.5 ? `${gameTag}_${base}` : `${base}_${gameTag}`;
      }

      // Apply Leet speak randomly for cool/pro
      if ((style === 'cool' || style === 'pro') && Math.random() > 0.5) {
        base = applyLeet(base);
      }

      // Handle Length
      if (lengthMode === 'short') base = base.substring(0, 8);
      if (lengthMode === 'long') base = base + (Math.random() > 0.5 ? '_007' : '_Elite');

      // Apply Symbols
      if (useSymbols && (style === 'fire' || style === 'aesthetic' || style === 'cool')) {
        const sym = SYMBOL_SETS[Math.floor(Math.random() * SYMBOL_SETS.length)];
        base = `${sym.left}${base}${sym.right}`;
      }

      // Filter: No Spaces
      if (noSpaces) base = base.replace(/\s+/g, '_');

      // Filter: Max 16
      if (max16) base = base.substring(0, 16);

      results.push(base);
    }

    // Shuffle results
    setNicknames(results.sort(() => Math.random() - 0.5));
  }, [name, gameTag, style, lengthMode, useSymbols, noSpaces, max16]);

  useEffect(() => {
    generate();
  }, [generate]);

  const toggleFavorite = (nick: string) => {
    setFavorites(prev => {
      if (prev.includes(nick)) return prev.filter(f => f !== nick);
      return [...prev, nick];
    });
    toast({ title: favorites.includes(nick) ? "Removed" : "Favorited", description: "Matrix selection updated." });
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(id);
    toast({ title: "Copied", description: "Identity string saved to clipboard." });
    setTimeout(() => setIsCopied(null), 2000);
  };

  const handleDownload = () => {
    const content = `[MY KIT TOOL - NICKNAME MASTER]\n\n` + 
                    `Source: ${name}\n` +
                    `Style: ${style.toUpperCase()}\n\n` +
                    `GENERATED BATCH:\n${nicknames.join('\n')}\n\n` +
                    `FAVORITES:\n${favorites.join('\n')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mykit-nicknames-${Date.now()}.txt`;
    a.click();
    toast({ title: "Master Exported" });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest mb-4">
            <User className="w-3.5 h-3.5" /> Identity Suite
          </div>
          <h1 className="text-3xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight">
            Nickname <span className="text-primary italic">Generator PRO</span>
          </h1>
          <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
            Professional competitive identity synthesis. Generate stylized gamertags with clinical game-limit filters and session-persistent favorites.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 pb-2">
           <GetHelp toolId="nickname-generator" />
           <Button variant="outline" onClick={generate} className="h-11 px-6 rounded-xl border-border bg-secondary/50 text-[9px] font-black uppercase tracking-widest hover:text-primary transition-all shadow-lg group">
              <RefreshCcw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" /> Shuffle Matrix
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
                <Settings2 className="w-5 h-5 text-primary" /> Matrix Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
              <div className="space-y-6">
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

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-3">
                      <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Game Protocol</Label>
                      <Select value={gameTag} onValueChange={(v: any) => setGameTag(v)}>
                        <SelectTrigger className="h-12 bg-secondary border-border rounded-xl text-[10px] font-black uppercase">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-card">
                          {['None', 'FF', 'PUBG', 'COD', 'Roblox', 'Free'].map(tag => (
                            <SelectItem key={tag} value={tag} className="text-[10px] font-black uppercase">{tag}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                   </div>
                   <div className="space-y-3">
                      <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Target Length</Label>
                      <Select value={lengthMode} onValueChange={(v: any) => setLengthMode(v)}>
                        <SelectTrigger className="h-12 bg-secondary border-border rounded-xl text-[10px] font-black uppercase">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-card">
                          <SelectItem value="short" className="text-[10px] font-black uppercase">Short (1-8)</SelectItem>
                          <SelectItem value="medium" className="text-[10px] font-black uppercase">Medium (Std)</SelectItem>
                          <SelectItem value="long" className="text-[10px] font-black uppercase">Long (Extended)</SelectItem>
                        </SelectContent>
                      </Select>
                   </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Linguistic Style</Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'cool', label: 'Cool', icon: Zap },
                    { id: 'fire', label: 'Fire', icon: Flame },
                    { id: 'cute', label: 'Cute', icon: Smile },
                    { id: 'pro', label: 'Pro', icon: Shield },
                    { id: 'funny', label: 'Funny', icon: Ghost },
                    { id: 'aesthetic', label: 'Aet', icon: Sparkles },
                    { id: 'minimal', label: 'Min', icon: Hash },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStyle(s.id as NicknameStyle)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl border transition-all",
                        style === s.id ? "bg-primary text-white border-primary shadow-lg" : "bg-background border-border text-foreground/40 hover:border-primary/20"
                      )}
                    >
                      <s.icon className="w-4 h-4" />
                      <span className="text-[8px] font-black uppercase tracking-widest">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-border">
                 <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border group hover:border-primary/20 transition-all">
                    <div className="flex items-center gap-3">
                       <Smartphone className="w-4 h-4 text-primary/40 group-hover:text-primary transition-colors" />
                       <span className="text-[9px] font-black uppercase text-foreground/40">No Spaces Matrix</span>
                    </div>
                    <Switch checked={noSpaces} onCheckedChange={setNoSpaces} className="scale-75" />
                 </div>
                 <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border group hover:border-primary/20 transition-all">
                    <div className="flex items-center gap-3">
                       <Gamepad2 className="w-4 h-4 text-primary/40 group-hover:text-primary transition-colors" />
                       <span className="text-[9px] font-black uppercase text-foreground/40">Max 16 Chars (Game Spec)</span>
                    </div>
                    <Switch checked={max16} onCheckedChange={setMax16} className="scale-75" />
                 </div>
                 <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border group hover:border-primary/20 transition-all">
                    <div className="flex items-center gap-3">
                       <Zap className="w-4 h-4 text-primary/40 group-hover:text-primary transition-colors" />
                       <span className="text-[9px] font-black uppercase text-foreground/40">Include Symbols</span>
                    </div>
                    <Switch checked={useSymbols} onCheckedChange={setUseSymbols} className="scale-75" />
                 </div>
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <Button 
                  onClick={generate}
                  className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl flex items-center justify-center gap-4 text-sm shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                >
                  <Dices className="w-5 h-5 group-hover/btn:rotate-180 transition-transform duration-500" />
                  Synthesize Identities
                </Button>
                <div className="grid grid-cols-2 gap-3">
                   <Button variant="outline" onClick={handleDownload} className="h-12 rounded-xl text-[9px] font-black uppercase tracking-widest border-border">
                      <Download className="w-4 h-4 mr-2 text-primary" /> Export .txt
                   </Button>
                   <Button variant="outline" onClick={() => { setFavorites([]); toast({ title: "Favorites Purged" }); }} className="h-12 rounded-xl text-[9px] font-black uppercase tracking-widest border-border hover:text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" /> Clear All
                   </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
               <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Privacy Absolute</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                All generation occurs locally in your browser memory. Your identifiers are never transmitted, maintaining 100% data sovereignty.
              </p>
            </div>
          </div>
        </div>

        {/* Results Matrix */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          {favorites.length > 0 && (
            <Card className="glass-card border-primary/20 bg-primary/[0.02] shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-500">
               <CardHeader className="py-6 border-b border-primary/10 bg-primary/[0.05]">
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.5em] flex items-center gap-3 text-primary">
                    <Crown className="w-4 h-4 fill-primary/20" /> Active Shortlist
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {favorites.map((fav) => (
                    <div key={fav} className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-white/5 border border-primary/20 shadow-sm animate-in zoom-in duration-300 group/fav">
                       <span className="text-[11px] font-bold text-foreground truncate uppercase">{fav}</span>
                       <div className="flex gap-2">
                          <button onClick={() => handleCopy(fav, `fav-${fav}`)} className="text-foreground/20 hover:text-primary transition-colors"><Copy className="w-3.5 h-3.5" /></button>
                          <button onClick={() => toggleFavorite(fav)} className="text-primary hover:text-destructive transition-colors"><X className="w-3.5 h-3.5" /></button>
                       </div>
                    </div>
                  ))}
               </CardContent>
            </Card>
          )}

          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group flex flex-col min-h-[700px]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <Activity className="w-5 h-5" />
                </div>
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Linguistic Output</CardTitle>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-background border border-border text-[9px] font-black text-primary uppercase tracking-widest">
                  20 IDENTIFIERS
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
               <div className="flex-1 overflow-auto custom-scrollbar p-6 bg-black/10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     {nicknames.map((nick, index) => (
                       <div key={index} className="flex items-center gap-4 p-5 rounded-[2rem] bg-white dark:bg-white/5 border border-transparent hover:border-primary/20 hover:bg-white/10 transition-all group/item min-w-0">
                          <div className="flex-1 min-w-0">
                             <p className="text-sm sm:text-base font-bold text-foreground truncate select-all">{nick}</p>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover/item:opacity-100 transition-all shrink-0">
                             <button 
                              onClick={() => toggleFavorite(nick)}
                              className={cn(
                                "w-9 h-9 rounded-xl bg-secondary flex items-center justify-center transition-all border border-transparent",
                                favorites.includes(nick) ? "text-yellow-500 border-yellow-500/20 bg-yellow-500/5" : "text-foreground/20 hover:text-yellow-500"
                              )}
                             >
                                <Star className={cn("w-3.5 h-3.5", favorites.includes(nick) && "fill-current")} />
                             </button>
                             <button 
                              onClick={() => handleCopy(nick, `nick-${index}`)}
                              className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-foreground/20 hover:text-primary transition-all border border-transparent hover:border-primary/10 shadow-sm"
                            >
                               {isCopied === `nick-${index}` ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>

               <div className="p-8 border-t border-border bg-[#0a0a0c]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group transition-all hover:bg-secondary/80">
                        <Zap className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-foreground uppercase tracking-widest leading-none">Instant Synthesis</p>
                           <p className="text-[9px] text-foreground/40 font-medium leading-relaxed">Hardware-native identity generation for zero-latency design workflows.</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group transition-all hover:bg-secondary/80">
                        <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-foreground uppercase tracking-widest leading-none">Verified Rendering</p>
                           <p className="text-[9px] text-foreground/40 font-medium leading-relaxed">Only using high-support Unicode characters that render correctly on all devices.</p>
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
      `}</style>
    </div>
  );
}
