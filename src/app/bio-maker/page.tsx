
"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  UserCircle, 
  Sparkles, 
  Copy, 
  Trash2, 
  CheckCircle2, 
  Heart, 
  Star, 
  Dices,
  RefreshCcw,
  Smartphone,
  Instagram,
  Facebook,
  MessageSquare,
  Zap,
  Palette,
  AlignLeft,
  ChevronRight,
  Info,
  ShieldCheck,
  Type,
  X,
  Smile,
  MapPin,
  Globe,
  Languages,
  RotateCcw,
  Plus,
  Search,
  LayoutGrid,
  MoreVertical,
  Check,
  Settings2,
  Eye,
  Hash,
  Terminal,
  Activity,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

// --- Constants & Registry ---

type Platform = 'Instagram' | 'TikTok' | 'WhatsApp' | 'Facebook';
type Mood = 'Real' | 'Aesthetic' | 'Love' | 'Ego' | 'Angry' | 'Funny' | 'Simple';
type FontStyle = 'Normal' | 'Bold' | 'Italic' | 'Cursive' | 'Small Caps';
type EmojiDensity = 'none' | 'low' | 'normal' | 'extra';
type LanguageMode = 'english' | 'urdu' | 'mix';
type LengthMode = 'short' | 'medium';
type LayoutType = 'A' | 'B' | 'C' | 'D';

const PLATFORM_LIMITS: Record<Platform, number> = {
  Instagram: 150,
  TikTok: 80,
  WhatsApp: 139,
  Facebook: 101,
};

const FONT_MAPS: Record<string, (text: string) => string> = {
  Bold: (t) => t.split('').map(c => {
    const code = c.charCodeAt(0);
    if (c >= 'A' && c <= 'Z') return String.fromCodePoint(0x1D5D4 + code - 65);
    if (c >= 'a' && c <= 'z') return String.fromCodePoint(0x1D5EE + code - 97);
    return c;
  }).join(''),
  Italic: (t) => t.split('').map(c => {
    const code = c.charCodeAt(0);
    if (c >= 'A' && c <= 'Z') return String.fromCodePoint(0x1D608 + code - 65);
    if (c >= 'a' && c <= 'z') return String.fromCodePoint(0x1D622 + code - 97);
    return c;
  }).join(''),
  Cursive: (t) => t.split('').map(c => {
    const m: any = {'A':'𝒜','B':'ℬ','C':'𝒞','D':'𝒟','E':'ℰ','F':'ℱ','G':'𝒢','H':'ℋ','I':'ℐ','J':'𝒥','K':'𝒦','L':'ℒ','M':'ℳ','N':'𝒩','O':'𝒪','P':'𝒫','Q':'𝒬','R':'ℛ','S':'𝒮','T':'𝒯','U':'𝒰','V':'𝒱','W':'𝒲','X':'𝒳','Y':'𝒴','Z':'𝒵','a':'𝒶','b':'𝓋','c':'𝒸','d':'𝒹','e':'ℯ','f':'𝒻','g':'ℊ','h':'𝒽','i':'𝒾','j':'𝒿','k':'𝓀','l':'𝓁','m':'𝓂','n':'𝓃','o':'ℴ','p':'𝓅','q':'𝓆','r':'𝓇','s':'𝓈','t':'𝓉','u':'𝓊','v':'𝓋','w':'𝓌','x':'𝓍','y':'𝓎','z':'𝓏'};
    return m[c] || c;
  }).join(''),
  'Small Caps': (t) => t.toLowerCase().split('').map(c => {
    const m: any = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ꜰ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
    return m[c] || c;
  }).join(''),
};

const SYMBOLS = ['★', '✦', '♡', '⋆', 'ꨄ', '❥', '✧', '•', '·', '—'];

// --- Linguistic Matrix ---
const PHRASE_BANK: Record<Mood, { 
  openings: string[], 
  middles: string[], 
  closers: string[], 
  roles: string[], 
  hashtags: string[],
  emojis: string[] 
}> = {
  Aesthetic: {
    openings: ['Quiet nights, city lights.', 'Vibing in the shadows.', 'Lost in ethereal stars.', 'Whispers of a silent soul.', 'Art in constant motion.', 'Ethereal state of mind.', 'Golden thoughts only.', 'Bloom where you are planted.', 'Minimalist at heart.', 'Poetry in every pixel.'],
    middles: ['Collecting moments of peace.', 'Exploring the hidden beauty.', 'Lost in my own frequency.', 'Searching for silver linings.', 'Finding art in every detail.'],
    closers: ['Stay dreamy.', 'Pure vibes only.', 'Keep it aesthetic.', 'Chasing the moon.', 'In silence we bloom.'],
    roles: ['Dreamer', 'Digital Nomad', 'Soul Searcher', 'Vibe Curator', 'Visual Artist'],
    hashtags: ['#Aesthetic', '#Vibes', '#QuietLife'],
    emojis: ['✨', '🌙', '☁️', '🤍', '🎐', '🕯️', '🎞️', '🪐', '🕰️', '🌸']
  },
  Real: {
    openings: ['Authentic energy always.', 'Keeping it 100.', 'No filters, just reality.', 'Built, not bought.', 'Mindset is everything.', 'Progress over perfection.', 'Truth seeker.', 'Original identity.'],
    middles: ['Living one day at a time.', 'Hard work meets ambition.', 'Staying grounded, aim high.', 'Respecting the hustle.', 'Reality check: Active.'],
    closers: ['Peace out.', 'Stay true.', 'No fake zones.', 'Be original.', 'Hustle hard.'],
    roles: ['Hustler', 'Strategist', 'Builder', 'Leader', 'Visionary'],
    hashtags: ['#RealTalk', '#Hustle', '#Authentic'],
    emojis: ['☕', '📍', '💼', '💯', '🔋', '🏆', '⛓️', '📈', '🧿', '⚖️']
  },
  Love: {
    openings: ['Heart full of whispers.', 'Late night thoughts of you.', 'Soft soul, loud heart.', 'Kindness always.', 'Spreading warmth.', 'Soul deep connections.', 'Grateful for every second.'],
    middles: ['Radiating positive energy.', 'Loving life and you.', 'Finding joy in little things.', 'Heart wide open.', 'Believe in magic.'],
    closers: ['Yours truly.', 'With love.', 'Stay kind.', 'Forever grateful.', 'Keep smiling.'],
    roles: ['Believer', 'Kind Soul', 'Healer', 'Dreamer', 'Partner'],
    hashtags: ['#Love', '#Peace', '#Kindness'],
    emojis: ['🤍', '💕', '✨', '🌙', '❤️', '💍', '🧸', '💌', '🌸', '🏹']
  },
  Ego: {
    openings: ['Main character energy.', 'Born to lead, not follow.', 'Rare breed, high frequency.', 'Elite protocol initiated.', 'God tier confidence.', 'Winning by default.'],
    middles: ['Making my own rules.', 'Success is my only logic.', 'Top of the food chain.', 'Unmatched ambition.', 'Silent moves, loud impact.'],
    closers: ['Boss up.', 'I am the one.', 'Legends never die.', 'Stay elite.', 'Winning only.'],
    roles: ['CEO', 'Alpha', 'King', 'Icon', 'Elite'],
    hashtags: ['#Winning', '#Boss', '#Elite'],
    emojis: ['👑', '🔥', '⚡', '💎', '🦁', '🗡️', '🏎️', '🌪️', '🔱', '🦅']
  },
  Angry: {
    openings: ['Cold as ice.', 'Sharp mind, silent storm.', 'Broken trust, zero noise.', 'Expect nothing.', 'Shadow self active.'],
    middles: ['Chaos theory constant.', 'No mercy for fakes.', 'End of the line.', 'Living in the dark.', 'Silent but deadly.'],
    closers: ['Don\'t cross me.', 'Game over.', 'Move on.', 'Cold heart.', 'Silence is power.'],
    roles: ['Shadow', 'Storm', 'Phantom', 'Ghost', 'Glitch'],
    hashtags: ['#Cold', '#Silence', '#NoFake'],
    emojis: ['🖤', '⚡', '🧊', '🌑', '🥀', '🔪', '💀', '🩸', '🌪️', '⛓️']
  },
  Funny: {
    openings: ['Professional sleeper.', 'Life is a joke, I’m the punchline.', 'Send snacks, not drama.', 'Error 404: Bio not found.'],
    middles: ['CEO of procrastination.', 'I need coffee to exist.', 'Eating my feelings.', 'Just here for the memes.', 'Making bad choices look good.'],
    closers: ['Unsubscribed from reality.', 'LOL', 'Stay weird.', 'Be back later.', 'Joke is on you.'],
    roles: ['Comedian', 'Snack Specialist', 'Procrastinator', 'Meme Lord', 'Error'],
    hashtags: ['#Humor', '#Snacks', '#Funny'],
    emojis: ['😂', '🫠', '✌️', '🍕', '🤡', '☕', '🛌', '🐒', '🍟', '👻']
  },
  Simple: {
    openings: ['Just a person.', 'Living day by day.', 'Simple soul.', 'Minimalist identity.', 'Clear mind, simple life.'],
    middles: ['Existing peacefully.', 'Doing my best.', 'Happy enough.', 'Constant state of calm.', 'Quiet life, loud mind.'],
    closers: ['Take care.', 'Peace.', 'Simple.', 'Live well.', 'Thanks.'],
    roles: ['Person', 'Human', 'Observer', 'Lover of life', 'Simplicity'],
    hashtags: ['#Simple', '#Peaceful', '#Life'],
    emojis: ['📍', '📌', '🌑', '⚪', '⚫', '◼️', '◻️', '🕯️', '☕', '📎']
  }
};

interface BioResult {
  id: string;
  raw: string;
  styled: string;
  font: FontStyle;
  mood: Mood;
  layout: LayoutType;
  chips: string[];
}

export default function AdvancedBioMakerPage() {
  const { toast } = useToast();
  
  // Settings State
  const [platform, setPlatform] = useState<Platform>('Instagram');
  const [mood, setMood] = useState<Mood>('Aesthetic');
  const [lineCount, setLineCount] = useState<number>(3);
  const [emojiDensity, setEmojiDensity] = useState<EmojiDensity>('normal');
  const [lengthMode, setLengthMode] = useState<LengthMode>('medium');
  const [languageMode, setLanguageMode] = useState<LanguageMode>('english');
  
  // Fields State
  const [options, setOptions] = useState({ name: true, profession: true, expert: false, hobby: true, location: false, custom: false });
  const [inputs, setInputs] = useState({ name: 'Umar', profession: 'Developer', expert: 'UI/UX', hobby: 'Gaming', location: 'Matrix', custom: '' });
  const [myStyle, setMyStyle] = useState('');
  
  // Results State
  const [bios, setBios] = useState<BioResult[]>([]);
  const [favorites, setFavorites] = useState<BioResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedBioId, setSelectedBioId] = useState<string | null>(null);

  const getEmoji = (m: Mood) => {
    const pool = PHRASE_BANK[m].emojis;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const getEmojiBatch = (m: Mood, count: number) => {
    const pool = PHRASE_BANK[m].emojis;
    return Array.from({length: count}, () => pool[Math.floor(Math.random() * pool.length)]);
  };

  const generateSingleBio = useCallback((targetMood: Mood, targetLayout: LayoutType): BioResult => {
    const bank = PHRASE_BANK[targetMood];
    const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    
    // Choose font
    const fontStyles: FontStyle[] = ['Bold', 'Small Caps', 'Normal'];
    const chosenFont = fontStyles[Math.floor(Math.random() * fontStyles.length)];
    const applyFont = (t: string) => chosenFont === 'Normal' ? t : FONT_MAPS[chosenFont](t);

    const name = options.name ? inputs.name : '';
    const job = options.profession ? inputs.profession : '';
    const hobby = options.hobby ? inputs.hobby : '';
    const loc = options.location ? inputs.location : '';

    let lines: string[] = [];
    const mainEmojis = getEmojiBatch(targetMood, 3);

    switch (targetLayout) {
      case 'A': // Layout A: Emoji Role | Emoji Role | Emoji Role | Statement
        const roles = [job, hobby, pick(bank.roles)].filter(Boolean);
        const aLine = roles.map((r, i) => `${mainEmojis[i % 3]} ${r}`).join(' | ');
        lines.push(aLine);
        lines.push(`${getEmoji(targetMood)} ${pick(bank.middles)}`);
        break;

      case 'B': // Layout B: 🌟 Umar | Your Go-To Consultant \n Line 2 \n Line 3 \n Closer
        lines.push(`${mainEmojis[0]} ${name ? applyFont(name) : 'Identity'} | ${job || pick(bank.roles)}`);
        lines.push(`${mainEmojis[1]} ${pick(bank.middles)}`);
        lines.push(`${mainEmojis[2]} ${pick(bank.closers)}`);
        break;

      case 'C': // Layout C: 🎨 Artist & Creative Vibes \n Line 2 \n Line 3 \n #ArtLover
        lines.push(`${mainEmojis[0]} ${job || pick(bank.roles)} & ${pick(bank.roles)}`);
        lines.push(`${mainEmojis[1]} ${pick(bank.openings)}`);
        lines.push(`${pick(bank.hashtags)}`);
        break;

      case 'D': // Layout D: Name: Role 1 \n Role 2 \n Role 3 \n Closer
        if (name) lines.push(`${applyFont(name)}: ${mainEmojis[0]} ${job || pick(bank.roles)}`);
        else lines.push(`${mainEmojis[0]} ${job || pick(bank.roles)}`);
        lines.push(`${mainEmojis[1]} ${hobby || pick(bank.roles)}`);
        lines.push(`${mainEmojis[2]} ${pick(bank.middles)}`);
        break;
    }

    // Blend my style if provided
    if (myStyle.trim()) {
      lines.splice(1, 0, `✧ ${myStyle.trim()} ✧`);
    }

    // Enforce line count setting
    lines = lines.slice(0, lineCount).filter(Boolean);

    const finalRaw = lines.join('\n');
    return {
      id: Math.random().toString(36).substr(2, 9),
      raw: finalRaw,
      styled: finalRaw,
      font: chosenFont,
      mood: targetMood,
      layout: targetLayout,
      chips: mainEmojis
    };
  }, [inputs, options, lineCount, emojiDensity, languageMode, myStyle]);

  const generateBatch = useCallback((append = false) => {
    setIsGenerating(true);
    const newBatch: BioResult[] = [];
    const layouts: LayoutType[] = ['A', 'B', 'C', 'D', 'A', 'B', 'C', 'D'];
    
    layouts.forEach(l => {
      newBatch.push(generateSingleBio(mood, l));
    });

    setBios(prev => append ? [...prev, ...newBatch] : newBatch);
    if (!append && newBatch.length > 0) setSelectedBioId(newBatch[0].id);
    setIsGenerating(false);
    toast({ title: append ? "Batch Extended" : "8 Unique Bios Synthesized" });
  }, [generateSingleBio, mood, toast]);

  useEffect(() => {
    const saved = localStorage.getItem('mykit_bio_favs_pro_v3');
    if (saved) try { setFavorites(JSON.parse(saved)); } catch(e) {}
    generateBatch(false);
  }, []);

  const saveFavs = (newFavs: BioResult[]) => {
    setFavorites(newFavs);
    localStorage.setItem('mykit_bio_favs_pro_v3', JSON.stringify(newFavs));
  };

  const remixBio = (id: string) => {
    setBios(prev => prev.map(b => b.id === id ? generateSingleBio(b.mood, b.layout) : b));
    toast({ title: "Remixed", description: "Linguistic vectors recalculated." });
  };

  const applyFont = (id: string, font: FontStyle) => {
    setBios(prev => prev.map(b => {
      if (b.id === id) {
        if (font === 'Normal') return { ...b, font, styled: b.raw };
        const mapper = FONT_MAPS[font as keyof typeof FONT_MAPS];
        const lines = b.raw.split('\n');
        // Apply font to parts that look like names or headers
        lines[0] = lines[0].split(' ').map(w => w.length > 2 ? mapper(w) : w).join(' ');
        return { ...b, font, styled: lines.join('\n') };
      }
      return b;
    }));
  };

  const updateRaw = (id: string, text: string) => {
    setBios(prev => prev.map(b => b.id === id ? { ...b, raw: text, styled: text, font: 'Normal' as FontStyle } : b));
  };

  const toggleFav = (bio: BioResult) => {
    const isFav = favorites.some(f => f.id === bio.id);
    if (isFav) saveFavs(favorites.filter(f => f.id !== bio.id));
    else saveFavs([...favorites, bio]);
    toast({ title: isFav ? "Removed from Favorites" : "Saved to Repository" });
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Identity Isolated", description: "Bio saved to clipboard." });
  };

  const selectedBio = useMemo(() => bios.find(b => b.id === selectedBioId) || bios[0], [bios, selectedBioId]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-full">
      <div className="mb-10 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <UserCircle className="w-3.5 h-3.5" /> Identity Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
              Bio Maker <span className="text-primary italic">Studio Pro</span>
            </h1>
            <p className="text-foreground/40 text-sm md:text-base font-medium mt-2 max-w-2xl leading-relaxed">
              Advanced identity synthesis matrix. Generate unique, high-entropy social bios with categorized structural layouts and real-time platform previews.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <GetHelp toolId="bio-maker" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* LEFT: Controls Pane */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
           <Card className="glass-card border-border shadow-2xl overflow-hidden lg:sticky lg:top-24">
              <CardHeader className="py-6 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Settings2 className="w-5 h-5 text-primary" /> Matrix Parameters
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-8">
                 {/* Step 1: Platforms */}
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Platform Target</Label>
                    <div className="grid grid-cols-2 gap-2">
                       {(['Instagram', 'TikTok', 'WhatsApp', 'Facebook'] as Platform[]).map((p) => (
                         <button
                           key={p}
                           onClick={() => setPlatform(p)}
                           className={cn(
                             "h-12 rounded-xl border flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all",
                             platform === p ? "bg-primary text-white border-primary shadow-lg" : "bg-secondary/50 border-border text-foreground/40"
                           )}
                         >
                            {p === 'Instagram' ? <Instagram className="w-3.5 h-3.5" /> : p === 'Facebook' ? <Facebook className="w-3.5 h-3.5" /> : p === 'TikTok' ? <Smartphone className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                            {p}
                         </button>
                       ))}
                    </div>
                 </div>

                 {/* Step 2: Advanced Controls */}
                 <div className="space-y-6 pt-2 border-t border-white/5">
                    <div className="space-y-3">
                       <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Atmospheric Mood</Label>
                       <Select value={mood} onValueChange={(v: Mood) => setMood(v)}>
                          <SelectTrigger className="h-12 bg-secondary/50 border-border rounded-xl font-bold uppercase text-[10px]">
                             <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="glass-card">
                             {Object.keys(PHRASE_BANK).map(m => (
                               <SelectItem key={m} value={m} className="text-[10px] font-black uppercase">{m}</SelectItem>
                             ))}
                          </SelectContent>
                       </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-3">
                          <Label className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Line Density</Label>
                          <div className="grid grid-cols-3 bg-secondary/50 p-1 rounded-xl border border-border h-11">
                             {[1, 2, 3].map(l => (
                               <button key={l} onClick={() => setLineCount(l)} className={cn("rounded-lg text-[10px] font-black transition-all", lineCount === l ? "bg-primary text-white" : "text-foreground/40")}>{l}</button>
                             ))}
                          </div>
                       </div>
                       <div className="space-y-3">
                          <Label className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Complexity</Label>
                          <div className="grid grid-cols-2 bg-secondary/50 p-1 rounded-xl border border-border h-11">
                             {(['short', 'medium'] as LengthMode[]).map(l => (
                               <button key={l} onClick={() => setLengthMode(l)} className={cn("rounded-lg text-[9px] font-black uppercase transition-all", lengthMode === l ? "bg-primary text-white" : "text-foreground/40")}>{l}</button>
                             ))}
                          </div>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <Label className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">My Style (Vibe Hook)</Label>
                       <Input 
                        value={myStyle}
                        onChange={e => setMyStyle(e.target.value)}
                        placeholder="Paste your catchphrase..."
                        className="h-12 bg-primary/5 border-primary/20 rounded-xl text-xs italic font-medium focus:ring-primary/40"
                       />
                    </div>
                 </div>

                 {/* Step 3: Identifiers */}
                 <div className="space-y-4 pt-4 border-t border-white/5">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Identity Tokens</Label>
                    <div className="grid grid-cols-2 gap-3">
                       {[
                         { id: 'name', label: 'Name', icon: User },
                         { id: 'profession', label: 'Job', icon: Zap },
                         { id: 'hobby', label: 'Hobby', icon: Heart },
                         { id: 'location', label: 'Loc', icon: MapPin }
                       ].map(opt => (
                         <div key={opt.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border group hover:border-primary/20 transition-all cursor-pointer" onClick={() => setOptions(prev => ({ ...prev, [opt.id as keyof typeof options]: !prev[opt.id as keyof typeof options] }))}>
                            <Checkbox checked={options[opt.id as keyof typeof options]} className="data-[state=checked]:bg-primary" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-foreground/50">{opt.label}</span>
                         </div>
                       ))}
                    </div>
                    <div className="space-y-2">
                      {Object.entries(options).map(([k, active]) => active && ['name', 'profession', 'hobby', 'location'].includes(k) && (
                        <Input 
                          key={k}
                          value={inputs[k as keyof typeof inputs]}
                          onChange={e => setInputs(prev => ({ ...prev, [k]: e.target.value }))}
                          placeholder={k.toUpperCase()}
                          className="h-10 bg-secondary/50 border-border rounded-xl text-[10px] font-bold"
                        />
                      ))}
                    </div>
                 </div>

                 <div className="flex flex-col gap-3 pt-6">
                    <Button onClick={() => generateBatch(false)} disabled={isGenerating} className="h-16 w-full bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 text-xs uppercase tracking-widest active:scale-95 transition-all">
                       {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 mr-3" />}
                       Generate 8 Variants
                    </Button>
                    <Button variant="outline" onClick={() => { setMood(Object.keys(PHRASE_BANK)[Math.floor(Math.random() * 7)] as Mood); generateBatch(false); }} className="h-12 border-border bg-secondary text-[10px] font-black uppercase tracking-widest">
                       Surprise Matrix
                    </Button>
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* RIGHT: Results Matrix */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-12 animate-in fade-in slide-in-from-right-8 duration-1000">
           
           {/* Platform Monitor */}
           {bios.length > 0 && selectedBio && (
             <div className="space-y-6 animate-reveal">
                <div className="flex items-center gap-3">
                   <Eye className="w-4 h-4 text-primary" />
                   <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-foreground/40">Platform Monitor</h3>
                </div>
                
                <Card className="glass-card border-border shadow-2xl p-8 sm:p-12 relative overflow-hidden bg-white dark:bg-black/60">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
                   
                   <div className="max-w-md mx-auto space-y-8">
                      <div className="flex items-center gap-8">
                         <div className="w-24 h-24 rounded-full bg-secondary border-4 border-white dark:border-black shadow-xl shrink-0 overflow-hidden ring-1 ring-border">
                            <img src={`https://picsum.photos/seed/${inputs.name}/200/200`} alt="Avatar" className="w-full h-full object-cover" />
                         </div>
                         <div className="flex-1 space-y-4">
                            <div className="flex items-center justify-between gap-4">
                               <h4 className="text-xl font-bold text-foreground">@{inputs.name.toLowerCase().replace(/\s/g, '_') || 'user'}</h4>
                               <button className="p-2 rounded-lg bg-secondary text-foreground/40"><MoreVertical className="w-4 h-4" /></button>
                            </div>
                            <div className="flex gap-6 text-center">
                               {[
                                 { l: 'Posts', v: '12' },
                                 { l: 'Followers', v: '4.2k' },
                                 { l: 'Following', v: '184' }
                               ].map(s => (
                                 <div key={s.l} className="space-y-0.5">
                                    <p className="text-sm font-black text-foreground">{s.v}</p>
                                    <p className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest">{s.l}</p>
                                 </div>
                               ))}
                            </div>
                         </div>
                      </div>
                      
                      <div className="space-y-2 pt-4 border-t border-black/5 dark:border-white/5">
                         <h5 className="font-bold text-sm text-foreground">{inputs.name || 'User Identity'}</h5>
                         <div className="text-sm font-medium text-foreground/80 leading-relaxed whitespace-pre-wrap">
                            {selectedBio.styled}
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                         <Button className="h-10 rounded-xl bg-secondary text-foreground text-[10px] font-black uppercase">Edit Protocol</Button>
                         <Button className="h-10 rounded-xl bg-secondary text-foreground text-[10px] font-black uppercase">Share identity</Button>
                      </div>
                   </div>
                </Card>
             </div>
           )}

           {/* Results Grid */}
           {!bios.length && !isGenerating ? (
             <div className="flex-1 min-h-[600px] flex flex-col items-center justify-center opacity-10 gap-8">
                <LayoutGrid className="w-32 h-32 text-primary" />
                <p className="text-xl font-black uppercase tracking-[0.4em]">Awaiting Identity Signal</p>
             </div>
           ) : (
             <div className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                   {bios.map((bio) => {
                     const isOver = bio.styled.length > PLATFORM_LIMITS[platform];
                     return (
                       <Card 
                        key={bio.id} 
                        onClick={() => setSelectedBioId(bio.id)}
                        className={cn(
                          "glass-card border-border shadow-xl transition-all flex flex-col h-full group/card cursor-pointer",
                          selectedBioId === bio.id ? "ring-2 ring-primary border-primary shadow-primary/10" : "hover:border-primary/20"
                        )}
                       >
                          <CardHeader className="py-4 border-b border-border bg-secondary/30 flex flex-row items-center justify-between shrink-0">
                             <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-foreground/40">{bio.mood} (Type {bio.layout})</span>
                             </div>
                             <div className={cn("text-[9px] font-mono font-bold", isOver ? "text-red-500" : "text-primary/60")}>
                                {bio.styled.length}/{PLATFORM_LIMITS[platform]}
                             </div>
                          </CardHeader>
                          <CardContent className="pt-6 flex-1 flex flex-col gap-6">
                             <div className="flex-1">
                                <Textarea 
                                 value={bio.styled} 
                                 onChange={e => updateRaw(bio.id, e.target.value)}
                                 className="w-full min-h-[120px] bg-transparent border-none p-0 text-sm font-medium leading-relaxed resize-none focus-visible:ring-0 shadow-none scrollbar-hide"
                                />
                             </div>

                             <div className="flex flex-wrap gap-1.5">
                                {bio.chips.map((emo, i) => (
                                  <div key={i} className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-sm shadow-inner">{emo}</div>
                                ))}
                             </div>
                             
                             <div className="space-y-4 pt-4 border-t border-white/5">
                                <div className="flex overflow-x-auto no-scrollbar gap-1.5 pb-1">
                                   {(['Normal', 'Bold', 'Small Caps'] as FontStyle[]).map(f => (
                                     <button
                                       key={f}
                                       onClick={(e) => { e.stopPropagation(); applyFont(bio.id, f); }}
                                       className={cn(
                                         "h-8 px-3 rounded-lg border text-[8px] font-black uppercase transition-all shrink-0",
                                         bio.font === f ? "bg-primary text-white border-primary" : "bg-secondary text-foreground/40 hover:text-primary"
                                       )}
                                     >
                                       {f === 'Small Caps' ? 'SC' : f}
                                     </button>
                                   ))}
                                </div>
                                
                                <div className="grid grid-cols-1 gap-2">
                                   <Button onClick={(e) => { e.stopPropagation(); handleCopy(bio.styled, bio.id); }} className="h-10 w-full bg-primary text-white font-black uppercase text-[9px] tracking-widest rounded-xl shadow-lg">
                                      <Copy className="w-3.5 h-3.5 mr-2" /> Copy Master
                                   </Button>
                                   <div className="grid grid-cols-2 gap-2">
                                      <Button variant="outline" onClick={(e) => { e.stopPropagation(); remixBio(bio.id); }} className="h-10 border-border bg-secondary hover:text-primary rounded-xl text-[8px] font-black uppercase">
                                         <RefreshCcw className="w-3.5 h-3.5 mr-2" /> Remix
                                      </Button>
                                      <Button 
                                       variant="outline" 
                                       onClick={(e) => { e.stopPropagation(); toggleFav(bio); }} 
                                       className={cn("h-10 border-border bg-secondary rounded-xl transition-all text-[8px] font-black uppercase", favorites.some(f => f.id === bio.id) && "text-yellow-500 border-yellow-500/20 bg-yellow-500/10")}
                                      >
                                         <Star className={cn("w-3.5 h-3.5 mr-2", favorites.some(f => f.id === bio.id) && "fill-current")} /> Fav
                                      </Button>
                                   </div>
                                </div>
                             </div>
                          </CardContent>
                       </Card>
                     );
                   })}
                </div>
                
                <div className="flex justify-center pt-8">
                   <Button onClick={() => generateBatch(true)} variant="outline" className="h-16 px-12 rounded-[2rem] border-dashed border-primary/20 bg-primary/5 text-primary font-black uppercase tracking-[0.4em] text-xs hover:bg-primary/10 transition-all">
                      <Plus className="w-5 h-5 mr-4" /> Load 8 More Variants
                   </Button>
                </div>
             </div>
           )}

           {/* Repository Section */}
           {favorites.length > 0 && (
             <div className="space-y-6 pt-12 border-t border-white/5">
                <div className="flex items-center gap-3">
                   <Star className="w-4 h-4 text-yellow-500 fill-current" />
                   <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-foreground/40">Identity Repository</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                   {favorites.map(fav => (
                     <Card key={fav.id} className="glass-card border-yellow-500/20 bg-yellow-500/[0.02] p-6 space-y-6 animate-in slide-in-from-bottom-2">
                        <p className="text-sm font-medium text-foreground/80 leading-relaxed whitespace-pre-wrap">{fav.styled}</p>
                        <div className="flex items-center justify-between pt-4 border-t border-yellow-500/10">
                           <span className="text-[8px] font-black uppercase text-yellow-600/60 tracking-widest">{fav.mood} Matrix</span>
                           <div className="flex gap-2">
                              <button onClick={() => handleCopy(fav.styled, fav.id)} className="p-2 text-yellow-600/40 hover:text-yellow-600"><Copy className="w-3.5 h-3.5" /></button>
                              <button onClick={() => toggleFav(fav)} className="p-2 text-red-500/40 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                           </div>
                        </div>
                     </Card>
                   ))}
                </div>
             </div>
           )}
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
