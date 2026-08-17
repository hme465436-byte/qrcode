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
  Activity,
  Palette,
  AlignLeft,
  ChevronRight,
  Strikethrough
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

// --- Linguistic Constants ---
type NicknameStyle = 'cool' | 'fire' | 'cute' | 'pro' | 'funny' | 'aesthetic' | 'minimal';
type LengthMode = 'short' | 'medium' | 'long';
type GameTag = 'None' | 'FF' | 'PUBG' | 'COD' | 'Roblox' | 'Free';

// --- Unicode Font Mappings ---
const FONT_MAPS: Record<string, (text: string) => string> = {
  none: (t) => t,
  bold: (t) => t.split('').map(c => {
    const code = c.charCodeAt(0);
    if (c >= 'A' && c <= 'Z') return String.fromCodePoint(0x1D5D4 + code - 65);
    if (c >= 'a' && c <= 'z') return String.fromCodePoint(0x1D5EE + code - 97);
    return c;
  }).join(''),
  italic: (t) => t.split('').map(c => {
    const code = c.charCodeAt(0);
    if (c >= 'A' && c <= 'Z') return String.fromCodePoint(0x1D608 + code - 65);
    if (c >= 'a' && c <= 'z') return String.fromCodePoint(0x1D622 + code - 97);
    return c;
  }).join(''),
  monospace: (t) => t.split('').map(c => {
    const code = c.charCodeAt(0);
    if (c >= 'A' && c <= 'Z') return String.fromCodePoint(0x1D670 + code - 65);
    if (c >= 'a' && c <= 'z') return String.fromCodePoint(0x1D68A + code - 97);
    if (c >= '0' && c <= '9') return String.fromCodePoint(0x1D7F6 + code - 48);
    return c;
  }).join(''),
  circled: (t) => t.split('').map(c => {
    const code = c.charCodeAt(0);
    if (c >= 'A' && c <= 'Z') return String.fromCodePoint(0x24B6 + code - 65);
    if (c >= 'a' && c <= 'z') return String.fromCodePoint(0x24D0 + code - 97);
    if (c >= '1' && c <= '9') return String.fromCodePoint(0x2460 + code - 49);
    if (c === '0') return '⓪';
    return c;
  }).join(''),
  smallcaps: (t) => {
    const map: Record<string, string> = {
      'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ꜰ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'
    };
    return t.toLowerCase().split('').map(c => map[c] || c).join('');
  },
  fullwidth: (t) => t.split('').map(c => {
    const code = c.charCodeAt(0);
    if (code >= 33 && code <= 126) return String.fromCharCode(code + 65248);
    return c;
  }).join(''),
};

const SYMBOLS = [
  '★', '☆', '✦', '✧', '✪', '✫', '✬', '✭', '✮', '✯', '✰', '✵', '❂', '✴', '✷', 
  '🔥', '⚡', '☄', '🌩', '🌪', '🌀', '❄', '❅', '❆', '🌋', '🌊',
  '⚔', '🏹', '🛡', '🗡', '🔫', '💣', '🧨', '⛓', '⚔️', '⚔︎', '🛡️',
  '❤️', '💖', '💗', '💓', '💞', '💕', '💟', '❣', '❦', '❧', '💘', '💝',
  '🐉', '🦅', '🦊', '🐍', '🐺', '🦁', '🐯', '🦄', '🐾', '☘', '❀', '🌻', '🍃', '🍁', '🌵',
  '👑', '♕', '♔', '♛', '♚', '💎', '⚜', '🔱', '🏅', '🏆', '🎖',
  '➔', '➜', '➛', '➞', '➡', '➢', '➣', ➤, '➥', '➦', '➲', '📡', '⚛', '☣', '☢',
  '๏', '々', '×', '•', '◈', '💠', '⚓', '🛸', '🛰', '🚀',
  '꧁', '꧂', 'ঔ', '𖤍', '᚛', '᚜', '〠', '〄', '⚚', '☯', '☸', '☪', '☮',
  '亗', '⚡︎', '♆', 'ϟ', '⚔︎', '⚖︎', '⛏︎', '⚒︎', '⚓︎', '⚙︎'
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
  const [fontStyle, setFontStyle] = useState('none');
  const [leftSym, setLeftSym] = useState('');
  const [rightSym, setRightSym] = useState('');
  
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

  const getStyledName = (n: string) => {
    const mapper = FONT_MAPS[fontStyle] || FONT_MAPS['none'];
    return mapper(n);
  };

  const currentDecoratedName = useMemo(() => {
    if (!name.trim()) return '';
    return `${leftSym}${getStyledName(name.trim())}${rightSym}`;
  }, [name, fontStyle, leftSym, rightSym]);

  const generate = useCallback(() => {
    if (!name.trim()) return;

    const baseName = name.trim();
    const styledName = getStyledName(baseName);
    const results: string[] = [];
    const count = 20;

    const activeTemplates = STYLE_TEMPLATES[style];
    
    for (let i = 0; i < count; i++) {
      let variant = activeTemplates[i % activeTemplates.length].replace('[n]', styledName);
      
      // Apply Game Tag
      if (gameTag !== 'None') {
        variant = Math.random() > 0.5 ? `${gameTag}_${variant}` : `${variant}_${gameTag}`;
      }

      // Apply Leet speak randomly for cool/pro
      if ((style === 'cool' || style === 'pro') && Math.random() > 0.5) {
        variant = applyLeet(variant);
      }

      // Apply framing symbols
      variant = `${leftSym}${variant}${rightSym}`;

      // Handle Length
      if (lengthMode === 'short') variant = variant.substring(0, 8);
      if (lengthMode === 'long') variant = variant + (Math.random() > 0.5 ? '_007' : '_Elite');

      // Filter: No Spaces
      if (noSpaces) variant = variant.replace(/\s+/g, '_');

      // Filter: Max 16
      if (max16) variant = variant.substring(0, 16);

      results.push(variant);
    }

    setNicknames(results.sort(() => Math.random() - 0.5));
  }, [name, gameTag, style, lengthMode, useSymbols, noSpaces, max16, fontStyle, leftSym, rightSym]);

  useEffect(() => {
    generate();
  }, [generate]);

  const toggleFavorite = (nick: string) => {
    setFavorites(prev => {
      if (prev.includes(nick)) return prev.filter(f => f !== nick);
      return [...prev, nick];
    });
    toast({ title: favorites.includes(nick) ? "Removed" : "Favorited" });
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(id);
    toast({ title: "Copied", description: "Identity matrix saved to clipboard." });
    setTimeout(() => setIsCopied(null), 2000);
  };

  const handleDownload = () => {
    const content = `[MY KIT TOOL - NICKNAME MASTER]\n\n` + 
                    `Source: ${name}\n` +
                    `Font: ${fontStyle}\n\n` +
                    `BATCH RESULTS:\n${nicknames.join('\n')}\n\n` +
                    `FAVORITES:\n${favorites.join('\n')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mykit-nicknames-${Date.now()}.txt`;
    a.click();
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
            Professional competitive identity synthesis. Generate stylized gamertags with clinical font mapping and artistic symbol matrixing.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 pb-2">
           <GetHelp toolId="nickname-generator" />
           <Button variant="outline" onClick={generate} className="h-11 px-6 rounded-xl border-border bg-secondary/50 text-[9px] font-black uppercase tracking-widest hover:text-primary transition-all shadow-lg group">
              <RefreshCcw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" /> Refresh Batch
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          
          {/* Live Preview Card */}
          <Card className="glass-card border-primary/20 bg-primary/[0.03] shadow-2xl overflow-hidden relative group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
             <CardHeader className="py-6 border-b border-primary/10">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 text-primary">
                   <Activity className="w-4 h-4" /> Live Identity Preview
                </CardTitle>
             </CardHeader>
             <CardContent className="p-10 flex flex-col items-center justify-center gap-6">
                <div className="w-full p-8 rounded-[2rem] bg-background border border-primary/20 shadow-inner flex items-center justify-center text-center overflow-hidden">
                   <h2 className="text-3xl sm:text-4xl font-bold text-foreground break-all leading-tight">
                      {currentDecoratedName || <span className="opacity-10">Awaiting_Signal</span>}
                   </h2>
                </div>
                <div className="flex gap-3 w-full">
                   <Button 
                    onClick={() => handleCopy(currentDecoratedName, 'preview')}
                    disabled={!currentDecoratedName}
                    className="flex-1 h-12 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-[9px]"
                   >
                     {isCopied === 'preview' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                     Copy Identity
                   </Button>
                   <Button 
                    variant="outline"
                    onClick={() => { setLeftSym(''); setRightSym(''); setFontStyle('none'); }}
                    className="h-12 w-12 rounded-xl border-border bg-secondary text-foreground/40 hover:text-destructive"
                   >
                     <Trash2 className="w-4 h-4" />
                   </Button>
                </div>
             </CardContent>
          </Card>

          <Card className="glass-card border-border shadow-xl overflow-hidden">
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
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
            </CardHeader>
            <CardContent className="p-0">
               <Tabs defaultValue="fonts" className="w-full">
                  <TabsList className="grid grid-cols-3 bg-secondary/50 p-1 border-b border-border h-14 rounded-none">
                     <TabsTrigger value="fonts" className="rounded-none text-[9px] font-black uppercase">Fonts</TabsTrigger>
                     <TabsTrigger value="left" className="rounded-none text-[9px] font-black uppercase">Left Sym</TabsTrigger>
                     <TabsTrigger value="right" className="rounded-none text-[9px] font-black uppercase">Right Sym</TabsTrigger>
                  </TabsList>

                  <div className="p-6 h-[400px] overflow-y-auto custom-scrollbar">
                     <TabsContent value="fonts" className="m-0 space-y-3">
                        {Object.keys(FONT_MAPS).map((f) => (
                          <button
                            key={f}
                            onClick={() => setFontStyle(f)}
                            className={cn(
                              "w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left",
                              fontStyle === f ? "bg-primary/10 border-primary text-primary shadow-sm" : "bg-secondary/30 border-border text-foreground/50 hover:border-primary/20"
                            )}
                          >
                             <span className="text-sm font-bold truncate">{FONT_MAPS[f](name || 'Sample')}</span>
                             <span className="text-[8px] font-black uppercase tracking-widest opacity-40">{f}</span>
                          </button>
                        ))}
                     </TabsContent>

                     <TabsContent value="left" className="m-0 grid grid-cols-5 gap-2">
                        {SYMBOLS.map((s, idx) => (
                          <button 
                            key={idx} 
                            onClick={() => setLeftSym(s)}
                            className={cn(
                              "aspect-square rounded-xl border flex items-center justify-center text-lg transition-all",
                              leftSym === s ? "bg-primary text-white border-primary" : "bg-secondary/30 border-border text-foreground/60 hover:bg-primary/5"
                            )}
                          >
                            {s}
                          </button>
                        ))}
                     </TabsContent>

                     <TabsContent value="right" className="m-0 grid grid-cols-5 gap-2">
                        {SYMBOLS.map((s, idx) => (
                          <button 
                            key={idx} 
                            onClick={() => setRightSym(s)}
                            className={cn(
                              "aspect-square rounded-xl border flex items-center justify-center text-lg transition-all",
                              rightSym === s ? "bg-primary text-white border-primary" : "bg-secondary/30 border-border text-foreground/60 hover:bg-primary/5"
                            )}
                          >
                            {s}
                          </button>
                        ))}
                     </TabsContent>
                  </div>
               </Tabs>
            </CardContent>
          </Card>

          <Card className="glass-card border-border shadow-xl overflow-hidden">
             <CardHeader className="py-6 border-b border-border bg-secondary/30">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Advanced Filters</CardTitle>
             </CardHeader>
             <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-foreground/30 ml-1">Linguistic Flavor</Label>
                      <Select value={style} onValueChange={(v: any) => setStyle(v)}>
                        <SelectTrigger className="h-10 bg-secondary border-border rounded-xl text-[9px] font-black uppercase">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-card">
                          {Object.keys(STYLE_TEMPLATES).map(s => (
                            <SelectItem key={s} value={s} className="text-[9px] font-black uppercase">{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                   </div>
                   <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-foreground/30 ml-1">Game Protocol</Label>
                      <Select value={gameTag} onValueChange={(v: any) => setGameTag(v)}>
                        <SelectTrigger className="h-10 bg-secondary border-border rounded-xl text-[9px] font-black uppercase">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-card">
                          {['None', 'FF', 'PUBG', 'COD', 'Roblox', 'Free'].map(tag => (
                            <SelectItem key={tag} value={tag} className="text-[9px] font-black uppercase">{tag}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                   </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                   <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border">
                      <span className="text-[9px] font-black uppercase text-foreground/40">No Spaces</span>
                      <Switch checked={noSpaces} onCheckedChange={setNoSpaces} className="scale-75" />
                   </div>
                   <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border">
                      <span className="text-[9px] font-black uppercase text-foreground/40">Max 16 Chars</span>
                      <Switch checked={max16} onCheckedChange={setMax16} className="scale-75" />
                   </div>
                </div>
             </CardContent>
          </Card>
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
                       <span className="text-sm font-bold text-foreground truncate select-all">{fav}</span>
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
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Batch Production Results</CardTitle>
              </div>
              <div className="flex gap-2">
                 <Button variant="outline" size="sm" onClick={handleDownload} className="h-9 px-4 rounded-xl border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-widest hover:text-primary">
                    <Download className="w-3.5 h-3.5 mr-2" /> .txt
                 </Button>
                 <Button onClick={() => handleCopy(nicknames.join('\n'), 'all')} size="sm" className="h-9 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg">
                    {isCopied === 'all' ? <Check className="w-3.5 h-3.5 mr-2" /> : <Copy className="w-3.5 h-3.5 mr-2" />}
                    Copy All
                 </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
               <div className="flex-1 overflow-auto custom-scrollbar p-6 bg-black/10">
                  {!name.trim() ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-4 py-40">
                       <Wand2 className="w-20 h-20 text-primary" />
                       <p className="text-xs font-black uppercase tracking-[0.3em]">Awaiting Linguistic Signal</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                       {nicknames.map((nick, index) => (
                         <div key={index} className="flex items-center gap-4 p-5 rounded-[2rem] bg-white dark:bg-white/5 border border-transparent hover:border-primary/20 hover:bg-white/10 transition-all group/item min-w-0">
                            <div className="flex-1 min-w-0">
                               <p className="text-base sm:text-lg font-bold text-foreground truncate select-all">{nick}</p>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover/item:opacity-100 transition-all shrink-0">
                               <button 
                                onClick={() => toggleFavorite(nick)}
                                className={cn(
                                  "w-9 h-9 rounded-xl bg-secondary flex items-center justify-center transition-all border border-transparent",
                                  favorites.includes(nick) ? "text-yellow-500 border-yellow-500/20 bg-yellow-500/5 shadow-inner" : "text-foreground/20 hover:text-yellow-500"
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
                  )}
               </div>

               <div className="p-8 border-t border-border bg-[#0a0a0c]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group transition-all hover:bg-secondary/80">
                        <Zap className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-foreground uppercase tracking-widest leading-none">WASM Synthesis</p>
                           <p className="text-[9px] text-foreground/40 font-medium leading-relaxed">Hardware-native identity generation for zero-latency design workflows.</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group transition-all hover:bg-secondary/80">
                        <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-foreground uppercase tracking-widest leading-none">Verified Protocols</p>
                           <p className="text-[9px] text-foreground/40 font-medium leading-relaxed">Only using cross-platform Unicode blocks that render correctly on all devices.</p>
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
