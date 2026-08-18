
"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Edit3,
  Smile
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

// --- Types & Matrix Data ---

type Platform = 'Instagram' | 'TikTok' | 'WhatsApp' | 'Facebook';
type Mood = 'Real' | 'Aesthetic' | 'Love' | 'Ego' | 'Angry' | 'Funny' | 'Simple';
type FontStyle = 'Normal' | 'Bold' | 'Italic' | 'Cursive' | 'Small Caps' | 'Bubbles';

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
  Bubbles: (t) => t.split('').map(c => {
    const code = c.charCodeAt(0);
    if (c >= 'A' && c <= 'Z') return String.fromCodePoint(0x24B6 + code - 65);
    if (c >= 'a' && c <= 'z') return String.fromCodePoint(0x24D0 + code - 97);
    if (c >= '0' && c <= '9') return String.fromCodePoint(0x2460 + code - 49); // 1-9
    return c;
  }).join(''),
};

const MOOD_PHRASES: Record<Mood, { open: string[], mid: string[], end: string[], emojis: string[] }> = {
  Aesthetic: {
    open: ['Lost in thought.', 'Creating magic.', 'Chasing horizons.', 'Whispers of soul.', 'Art in motion.', 'Dreaming wide.', 'Soft light.', 'Ethereal vibes.', 'Vintage soul.'],
    mid: ['Collecting moments.', 'Finding peace in chaos.', 'Minimalist heart.', 'Poetry in pixels.', 'Living purely.', 'A touch of grace.', 'Silent observer.'],
    end: ['Just a dreamer.', 'Stay golden.', 'Curated life.', 'Bloom where planted.', 'Magic in the making.', 'Always evolving.'],
    emojis: ['✨', '🕊️', '☁️', '🦢', '🎐', '🕯️', '🎞️', '🪐', '🕰️']
  },
  Real: {
    open: ['Authentic energy.', 'Keeping it 100.', 'No filters needed.', 'Just me.', 'Ground level.', 'Reality check.', 'Raw and unfiltered.', 'Strictly business.'],
    mid: ['Work hard, stay humble.', 'Learning every day.', 'Built, not bought.', 'Mindset is everything.', 'Progress over perfection.', 'Truth seeker.'],
    end: ['Original identity.', 'Living my truth.', 'Respect the hustle.', 'Unapologetic.', 'Straight forward.'],
    emojis: ['💯', '🔋', '🏆', '⛓️', '📈', '🌊', '🧿', '♟️']
  },
  Love: {
    open: ['Heart full.', 'Kindness always.', 'Spreading warmth.', 'Love advocate.', 'Soul deep.', 'Gentle spirit.', 'Compassion first.', 'Pure intention.'],
    mid: ['Grateful for everything.', 'Making hearts happy.', 'Blessed beyond measure.', 'Sunshine state of mind.', 'Radiating love.', 'Soft heart.'],
    end: ['Peace & Love.', 'Yours truly.', 'Hold on to light.', 'Stay kind.', 'Forever grateful.'],
    emojis: ['❤️', '💍', '🧸', '💌', '🌸', '🏹', '🕊️', '🦋']
  },
  Ego: {
    open: ['Main character.', 'The one & only.', 'Born to lead.', 'Rare breed.', 'High frequency.', 'Game changer.', 'Elite protocol.', 'God tier.'],
    mid: ['Often imitated, never duplicated.', 'Winning by default.', 'Success is my logic.', 'Making my own rules.', 'Fearless soul.', 'Ice in veins.'],
    end: ['Top of the food chain.', 'Watch me work.', 'King status.', 'Unlimited power.', 'Iconic.'],
    emojis: ['👑', '🦁', '🗡️', '🏎️', '💎', '🌪️', '🔱', '🦅']
  },
  Angry: {
    open: ['Not your friend.', 'Zero tolerance.', 'Dark energy.', 'Vengeful spirit.', 'Silent storm.', 'Broken trust.', 'Cold blooded.', 'Shadow self.'],
    mid: ['Expect nothing.', 'Trust nobody.', 'Living in the dark.', 'Chaos theory.', 'No mercy.', 'Silent but deadly.', 'End of the line.'],
    end: ['Leave me alone.', 'Stay away.', 'Don’t cross the line.', 'Vengeance.', 'Isolated.'],
    emojis: ['🔪', '💀', '🥀', '🖤', '🩸', '🌪️', '🌑', '⛓️']
  },
  Funny: {
    open: ['Professional sleeper.', 'Life is a joke.', 'Send snacks.', 'Error 404: Bio not found.', 'CEO of procrastination.', 'Sarcastic logic.', 'I need coffee.'],
    mid: ['I put the "pro" in procrastination.', 'Trying to be an adult.', 'Eating my feelings.', 'Just here for the memes.', 'Making bad choices look good.'],
    end: ['Unsubscribed from reality.', 'Call my lawyer.', 'Living on caffeine.', 'Brb, taking a nap.'],
    emojis: ['🍕', '🤡', '☕', '🛌', '🐒', '🧊', '🍟', '🧀']
  },
  Simple: {
    open: ['Just a person.', 'Living life.', 'Simple soul.', 'Minimal.', 'Basic identity.', 'Neutral energy.', 'Clear mind.', 'Plain text.'],
    mid: ['Doing my best.', 'Happy enough.', 'Existing.', 'Day by day.', 'Quiet life.', 'Small wins.', 'Constant state.'],
    end: ['That is all.', 'Stay safe.', 'Hello world.', 'Goodbye.', 'End script.'],
    emojis: ['📍', '📌', '📎', '🌑', '⚪', '⚫', '◼️', '◻️']
  }
};

interface BioResult {
  id: string;
  raw: string;
  styled: string;
  font: FontStyle;
}

export default function BioMakerPage() {
  const { toast } = useToast();
  const [platform, setPlatform] = useState<Platform>('Instagram');
  const [mood, setMood] = useState<Mood>('Aesthetic');
  const [options, setOptions] = useState({ name: true, profession: false, expert: false, hobby: false, location: false, custom: false });
  const [inputs, setInputs] = useState({ name: 'Umar', profession: 'Developer', expert: 'UI Design', hobby: 'Gaming', location: 'Matrix', custom: '' });
  
  const [generatedBios, setGeneratedBios] = useState<BioResult[]>([]);
  const [favorites, setFavorites] = useState<BioResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('mykit_bio_favorites');
    if (saved) try { setFavorites(JSON.parse(saved)); } catch(e) {}
  }, []);

  const saveFavorites = (newFavs: BioResult[]) => {
    setFavorites(newFavs);
    localStorage.setItem('mykit_bio_favorites', JSON.stringify(newFavs));
  };

  const applyFont = (text: string, font: FontStyle) => {
    if (font === 'Normal') return text;
    const mapper = FONT_MAPS[font];
    if (!mapper) return text;
    
    // We only style the first line or specific identifiers if they exist
    const lines = text.split('\n');
    lines[0] = mapper(lines[0]);
    return lines.join('\n');
  };

  const generateBioSet = useCallback(() => {
    setIsGenerating(true);
    const newResults: BioResult[] = [];
    const moodData = MOOD_PHRASES[mood];
    
    for (let i = 0; i < 8; i++) {
      const open = moodData.open[Math.floor(Math.random() * moodData.open.length)];
      const mid = moodData.mid[Math.floor(Math.random() * moodData.mid.length)];
      const end = moodData.end[Math.floor(Math.random() * moodData.end.length)];
      const emo = Array.from({length: 2}, () => moodData.emojis[Math.floor(Math.random() * moodData.emojis.length)]).join(' ');

      let bio = "";
      const layoutType = Math.floor(Math.random() * 3);

      const personalLine = options.name ? inputs.name : "";
      const jobLine = options.profession ? inputs.profession : "";
      const hobbyLine = options.hobby ? inputs.hobby : "";
      const locLine = options.location ? inputs.location : "";
      const customLine = options.custom ? inputs.custom : "";

      if (layoutType === 0) {
        // Multi-line stack
        bio = [personalLine, open, mid, locLine, emo].filter(Boolean).join('\n');
      } else if (layoutType === 1) {
        // Bulleted / Minimalist
        bio = [
          personalLine ? `• ${personalLine}` : "",
          jobLine ? `• ${jobLine}` : "",
          hobbyLine ? `• ${hobbyLine}` : "",
          `• ${mid}`
        ].filter(Boolean).join('\n') + `\n${emo}`;
      } else {
        // Sentence style
        bio = `${personalLine ? personalLine + ' | ' : ''}${open} ${mid} ${locLine ? '📍' + locLine : ''} ${emo}`;
      }

      // Truncate to platform limit early if needed, but bio maker is a suggestion engine
      newResults.push({
        id: Math.random().toString(36).substr(2, 9),
        raw: bio.trim(),
        styled: bio.trim(),
        font: 'Normal'
      });
    }

    setGeneratedBios(newResults);
    setIsGenerating(false);
    toast({ title: "Bios Generated", description: `8 unique ${mood} profiles synthesized.` });
  }, [mood, options, inputs, toast]);

  const updateBioFont = (id: string, font: FontStyle) => {
    setGeneratedBios(prev => prev.map(b => {
      if (b.id === id) {
        return { ...b, font, styled: applyFont(b.raw, font) };
      }
      return b;
    }));
  };

  const updateBioText = (id: string, text: string) => {
    setGeneratedBios(prev => prev.map(b => b.id === id ? { ...b, raw: text, styled: applyFont(text, b.font) } : b));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Bio Copied" });
  };

  const toggleFavorite = (bio: BioResult) => {
    const isFav = favorites.some(f => f.id === bio.id);
    if (isFav) {
      saveFavorites(favorites.filter(f => f.id !== bio.id));
      toast({ title: "Removed from favorites" });
    } else {
      saveFavorites([...favorites, bio]);
      toast({ title: "Saved to favorites" });
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <UserCircle className="w-3.5 h-3.5" /> Identity Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
              Bio <span className="text-primary italic">Maker Studio</span>
            </h1>
            <p className="text-foreground/40 text-sm md:text-base font-medium mt-2 max-w-2xl leading-relaxed">
              Professional identity synthesis. Generate unique, aesthetic bios for major social platforms using high-entropy linguistic matrices.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <GetHelp toolId="bio-maker" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 items-start">
        {/* Input Panel */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
           <Card className="glass-card border-border shadow-2xl">
              <CardHeader className="py-6 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <AlignLeft className="w-5 h-5 text-primary" /> Matrix Parameters
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-10">
                 {/* Step 1: Checkboxes */}
                 <div className="space-y-6">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Protocol Identifiers</Label>
                    <div className="grid grid-cols-2 gap-4">
                       {[
                         { id: 'name', label: 'Name', icon: UserCircle },
                         { id: 'profession', label: 'Profession', icon: Zap },
                         { id: 'expert', label: 'Expert In', icon: Star },
                         { id: 'hobby', label: 'Hobby', icon: Heart },
                         { id: 'location', label: 'Location', icon: MapPin },
                         { id: 'custom', label: 'My Style', icon: Palette }
                       ].map((opt) => (
                         <div key={opt.id} className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border group hover:border-primary/20 transition-all cursor-pointer" onClick={() => setOptions(prev => ({ ...prev, [opt.id]: !prev[opt.id as keyof typeof options] }))}>
                            <Checkbox checked={options[opt.id as keyof typeof options]} className="border-primary/20 data-[state=checked]:bg-primary" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-foreground/60">{opt.label}</span>
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* Step 2: Dynamic Inputs */}
                 <div className="space-y-4">
                    {Object.entries(options).map(([key, active]) => active && (
                      <div key={key} className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                         <Label className="text-[8px] font-black uppercase text-foreground/30 ml-2">{key.replace('custom', 'Extra Line')}</Label>
                         <Input 
                           value={inputs[key as keyof typeof inputs]}
                           onChange={e => setInputs(prev => ({ ...prev, [key]: e.target.value }))}
                           placeholder={`Enter ${key}...`}
                           className="h-12 bg-secondary border-border rounded-xl text-xs font-bold"
                         />
                      </div>
                    ))}
                 </div>

                 {/* Step 3: Platform & Mood */}
                 <div className="grid grid-cols-2 gap-6 pt-6 border-t border-border">
                    <div className="space-y-3">
                       <Label className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.2em]">Platform</Label>
                       <Select value={platform} onValueChange={(v: Platform) => setPlatform(v)}>
                          <SelectTrigger className="h-12 bg-secondary border-border rounded-xl font-bold uppercase text-[9px]">
                             <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="glass-card">
                             {Object.keys(PLATFORM_LIMITS).map(p => (
                               <SelectItem key={p} value={p} className="text-[9px] font-black uppercase">{p}</SelectItem>
                             ))}
                          </SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-3">
                       <Label className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.2em]">Mood</Label>
                       <Select value={mood} onValueChange={(v: Mood) => setMood(v)}>
                          <SelectTrigger className="h-12 bg-secondary border-border rounded-xl font-bold uppercase text-[9px]">
                             <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="glass-card">
                             {Object.keys(MOOD_PHRASES).map(m => (
                               <SelectItem key={m} value={m} className="text-[9px] font-black uppercase">{m}</SelectItem>
                             ))}
                          </SelectContent>
                       </Select>
                    </div>
                 </div>

                 <div className="flex gap-4">
                    <Button onClick={generateBioSet} disabled={isGenerating} className="h-16 flex-[2] bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 text-xs uppercase tracking-widest active:scale-95 transition-all">
                       {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 mr-3" />}
                       Generate 8 Bios
                    </Button>
                    <Button variant="outline" onClick={() => { 
                      const randomMood = Object.keys(MOOD_PHRASES)[Math.floor(Math.random() * 7)] as Mood;
                      setMood(randomMood);
                      generateBioSet();
                    }} className="h-16 flex-1 rounded-2xl border-border bg-secondary hover:bg-secondary/80 text-[9px] font-black uppercase tracking-widest">
                       Surprise
                    </Button>
                 </div>
              </CardContent>
           </Card>

           {/* Favorites Section */}
           {favorites.length > 0 && (
             <Card className="glass-card border-primary/20 bg-primary/5 shadow-xl animate-in slide-in-from-bottom-4">
                <CardHeader className="py-4 border-b border-primary/10">
                   <CardTitle className="text-[9px] font-black uppercase tracking-[0.4em] text-primary flex items-center gap-2">
                      <Star className="w-4 h-4 fill-primary" /> Active Favorites
                   </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                   <div className="divide-y divide-primary/10 max-h-[300px] overflow-auto custom-scrollbar">
                      {favorites.map(fav => (
                        <div key={fav.id} className="p-5 group hover:bg-primary/[0.03] transition-all">
                           <p className="text-xs font-medium text-foreground/80 leading-relaxed whitespace-pre-wrap">{fav.styled}</p>
                           <div className="flex justify-end gap-2 mt-4 opacity-40 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleCopy(fav.styled, fav.id)} className="text-[8px] font-black uppercase text-primary hover:underline">Copy</button>
                              <button onClick={() => toggleFavorite(fav)} className="text-[8px] font-black uppercase text-red-500 hover:underline">Remove</button>
                           </div>
                        </div>
                      ))}
                   </div>
                </CardContent>
             </Card>
           )}

           <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all shadow-lg">
             <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
             </div>
             <div className="space-y-2">
               <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Hardware Synthesis</h4>
               <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                 Bios are generated 100% locally using high-entropy phrase matrixing. Identity data is volatile and never transmitted to cloud registries.
               </p>
             </div>
          </div>
        </div>

        {/* Results Matrix - Right */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           {!generatedBios.length ? (
             <div className="flex-1 min-h-[600px] flex flex-col items-center justify-center opacity-10 gap-6">
                <Dices className="w-24 h-24 text-primary" />
                <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Identity Signal</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                {generatedBios.map((bio) => {
                  const charCount = bio.styled.length;
                  const limit = PLATFORM_LIMITS[platform];
                  const isOver = charCount > limit;

                  return (
                    <Card key={bio.id} className="glass-card border-border shadow-xl hover:border-primary/20 transition-all flex flex-col h-full group/card">
                       <CardHeader className="py-4 border-b border-border bg-secondary/30 flex flex-row items-center justify-between shrink-0">
                          <div className="flex items-center gap-2">
                             {platform === 'Instagram' ? <Instagram className="w-3.5 h-3.5" /> : platform === 'Facebook' ? <Facebook className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
                             <span className="text-[8px] font-black uppercase tracking-widest text-foreground/40">{platform} Profile</span>
                          </div>
                          <div className={cn("text-[9px] font-mono font-bold", isOver ? "text-red-500" : "text-primary/60")}>
                             {charCount}/{limit}
                          </div>
                       </CardHeader>
                       <CardContent className="pt-6 flex-1 flex flex-col gap-6">
                          <div className="flex-1 relative">
                             <Textarea 
                              value={bio.styled} 
                              onChange={e => updateBioText(bio.id, e.target.value)}
                              className="w-full min-h-[120px] bg-white/40 dark:bg-black/40 border-border rounded-2xl p-6 text-sm font-medium leading-relaxed resize-none focus:ring-primary/20 shadow-inner"
                             />
                          </div>

                          <div className="space-y-4">
                             <div className="flex overflow-x-auto no-scrollbar gap-1.5 pb-2">
                                {(['Normal', 'Bold', 'Italic', 'Cursive', 'Small Caps', 'Bubbles'] as FontStyle[]).map(f => (
                                  <button
                                    key={f}
                                    onClick={() => updateBioFont(bio.id, f)}
                                    className={cn(
                                      "h-8 px-3 rounded-lg border text-[8px] font-black uppercase transition-all shrink-0",
                                      bio.font === f ? "bg-primary text-white border-primary" : "bg-secondary text-foreground/40 hover:text-primary"
                                    )}
                                  >
                                    {f}
                                  </button>
                                ))}
                             </div>

                             <div className="grid grid-cols-2 gap-3 pt-2">
                                <Button onClick={() => handleCopy(bio.styled, bio.id)} className="h-11 bg-primary text-white font-black uppercase text-[9px] tracking-widest rounded-xl shadow-lg">
                                   <Copy className="w-3.5 h-3.5 mr-2" /> Copy
                                </Button>
                                <Button variant="outline" onClick={() => toggleFavorite(bio)} className="h-11 border-border bg-secondary text-[9px] font-black uppercase tracking-widest rounded-xl">
                                   <Star className={cn("w-3.5 h-3.5 mr-2", favorites.some(f => f.id === bio.id) && "fill-current text-primary")} />
                                   Save
                                </Button>
                             </div>
                          </div>
                       </CardContent>
                    </Card>
                  )
                })}
             </div>
           )}
        </div>
      </div>
      
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
      `}</style>
    </div>
  );
}

