"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ImageIcon, 
  Sparkles, 
  Download, 
  Trash2, 
  Copy, 
  CheckCircle2, 
  RefreshCcw, 
  Loader2, 
  Maximize2, 
  Settings2, 
  Zap, 
  History,
  Activity,
  Dices,
  ShieldCheck,
  X,
  Star,
  Hash,
  Wand2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';
import { enhanceImagePrompt } from '@/ai/flows/image-prompt-enhancer-flow';

// --- Constants ---
type AspectRatio = '1:1' | '16:9' | '9:16' | '4:5';
type ImageStyle = 'normal' | 'realistic' | 'anime' | '3d' | 'logo' | 'poster';

interface ArchiveItem {
  id: string;
  prompt: string;
  url: string;
  style: ImageStyle;
  aspect: AspectRatio;
  seed: number;
  timestamp: number;
  isFavorite?: boolean;
}

const STYLE_PRESETS: Record<ImageStyle, { label: string; suffix: string }> = {
  normal: { label: 'Normal', suffix: '' },
  realistic: { label: 'Realistic', suffix: ', highly detailed, 8k resolution, cinematic lighting, photorealistic, professional photography, dslr' },
  anime: { label: 'Anime', suffix: ', anime style, vibrant colors, clean lines, high quality digital art, studio ghibli inspired, 4k' },
  '3d': { label: '3D Render', suffix: ', octane render, unreal engine 5, 3d isometric, c4d, hyper-detailed, ray tracing, cinematic bloom' },
  logo: { label: 'Logo', suffix: ', minimalist logo design, vector art, flat design, white background, high contrast, symbol, professional branding' },
  poster: { label: 'Poster', suffix: ', typographic poster design, graphic design style, bold colors, artistic composition, minimal, modern' },
};

const RANDOM_PROMPTS = [
  "A futuristic cyberpunk city with neon rain and flying vehicles",
  "A mystical forest with glowing mushrooms and ethereal spirits",
  "A vintage astronaut standing on a purple desert planet",
  "An ancient library carved into a giant redwood tree",
  "Abstract geometric landscape in sunset colors",
  "A steampunk robotic owl with clockwork wings",
  "Cozy cafe interior on a rainy day, digital art style",
  "A high-tech laboratory with floating holographic interfaces",
];

const ARCHIVE_KEY = 'mykit_ai_image_archive_v4';
const FAVS_KEY = 'mykit_ai_image_favs_v4';

export default function AiImageGeneratorPage() {
  const { toast } = useToast();
  
  // Studio State
  const [prompt, setPrompt] = useState('');
  const [activeStyle, setActiveStyle] = useState<ImageStyle>('normal');
  const [aspect, setAspect] = useState<AspectRatio>('1:1');
  const [seed, setSeed] = useState<string>('');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [prevResultUrl, setPrevResultUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  
  // Visual Meta
  const [showComparison, setShowComparison] = useState(false);
  
  // Registry State
  const [archive, setArchive] = useState<ArchiveItem[]>([]);
  const [favorites, setFavorites] = useState<ArchiveItem[]>([]);
  const [showClearConfirm, setShowClearAllConfirm] = useState(false);

  // Initialization
  useEffect(() => {
    const saved = localStorage.getItem(ARCHIVE_KEY);
    const savedFavs = localStorage.getItem(FAVS_KEY);
    if (saved) try { setArchive(JSON.parse(saved)); } catch (e) {}
    if (savedFavs) try { setFavorites(JSON.parse(savedFavs)); } catch (e) {}
  }, []);

  const saveArchive = (next: ArchiveItem[]) => {
    setArchive(next);
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(next));
  };

  const saveFavs = (next: ArchiveItem[]) => {
    setFavorites(next);
    localStorage.setItem(FAVS_KEY, JSON.stringify(next));
  };

  const handleSurprise = () => {
    const pick = RANDOM_PROMPTS[Math.floor(Math.random() * RANDOM_PROMPTS.length)];
    setPrompt(pick);
    toast({ title: "Prompt Injected" });
  };

  const handleEnhance = async () => {
    if (!prompt.trim()) return;
    setIsEnhancing(true);
    try {
      const enhanced = await enhanceImagePrompt({ text: prompt });
      setPrompt(enhanced);
      toast({ title: "Prompt Optimized" });
    } catch (e) {
      toast({ variant: "destructive", title: "Enhancement Failed" });
    } finally {
      setIsEnhancing(false);
    }
  };

  const executeSynthesis = async (overrideSeed?: number) => {
    if (!prompt.trim()) return;
    
    setIsProcessing(true);
    setStatusMessage('Creating image...');
    
    const dims = {
      '1:1': { w: 1024, h: 1024 },
      '16:9': { w: 1280, h: 720 },
      '9:16': { w: 720, h: 1280 },
      '4:5': { w: 800, h: 1000 }
    }[aspect];

    const currentSeed = overrideSeed ?? (seed ? parseInt(seed) : Math.floor(Math.random() * 10000000));
    const fullPrompt = `${prompt.trim()}${STYLE_PRESETS[activeStyle].suffix}`;
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=${dims.w}&height=${dims.h}&seed=${currentSeed}&nologo=true`;

    // High-Fidelity Loading Protocol: Wait for image bits to actually load in a background object
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      if (resultUrl) setPrevResultUrl(resultUrl);
      setResultUrl(url);
      
      const newItem: ArchiveItem = {
        id: Math.random().toString(36).substr(2, 9),
        prompt: prompt.trim(),
        url,
        style: activeStyle,
        aspect,
        seed: currentSeed,
        timestamp: Date.now()
      };
      saveArchive([newItem, ...archive].slice(0, 12));
      
      setIsProcessing(false);
      setStatusMessage('Done');
      toast({ title: "Image Ready" });
    };

    img.onerror = () => {
      setIsProcessing(false);
      setStatusMessage('Image failed, try again');
      toast({ variant: "destructive", title: "Synthesis Error", description: "The image node failed to respond. Please try again." });
    };

    img.src = url;
  };

  const handleDownload = async (fmt: 'png' | 'jpg') => {
    if (!resultUrl) return;
    try {
      const res = await fetch(resultUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-master-${Date.now()}.${fmt}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      window.open(resultUrl, '_blank');
    }
  };

  const toggleFavorite = (item: ArchiveItem) => {
    const isFav = favorites.some(f => f.id === item.id || f.url === item.url);
    if (isFav) {
      saveFavs(favorites.filter(f => f.url !== item.url));
    } else {
      saveFavs([{ ...item, isFavorite: true }, ...favorites].slice(0, 20));
    }
  };

  const reuseFromHistory = (item: ArchiveItem) => {
    setPrompt(item.prompt);
    setActiveStyle(item.style);
    setAspect(item.aspect);
    setSeed(item.seed.toString());
    toast({ title: "Matrix Restored" });
  };

  const handleClear = () => {
    setPrompt('');
    setResultUrl(null);
    setPrevResultUrl(null);
    setSeed('');
    setIsProcessing(false);
    setStatusMessage('');
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-full overflow-hidden">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Sparkles className="w-3.5 h-3.5" /> AI Creative Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
              <h1 className="text-3xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
                AI Image <span className="text-primary italic">Generator</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Create images from text for free. Professional high-fidelity image synthesis using the Pollinations matrix.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="ai-image" />
              {(resultUrl || prompt) && (
                <Button variant="outline" size="sm" onClick={handleClear} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive">
                   <Trash2 className="w-3.5 h-3.5 mr-2" /> Reset
                </Button>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Controls Column */}
        <aside className="lg:col-span-5 xl:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
           <Card className="glass-card border-border shadow-2xl overflow-visible relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="py-6 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Settings2 className="w-5 h-5 text-primary" /> Parameters
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-8">
                 <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                       <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Prompt</Label>
                       <div className="flex gap-4">
                          <button onClick={handleEnhance} disabled={isEnhancing || !prompt} className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2 hover:opacity-70 transition-all disabled:opacity-20">
                            {isEnhancing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />} AI Enhance
                          </button>
                          <button onClick={handleSurprise} className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-2 hover:opacity-70 transition-all">
                             <Dices className="w-3 h-3" /> Surprise
                          </button>
                       </div>
                    </div>
                    <Textarea 
                      placeholder="e.g. A futuristic cyberpunk city with neon lights..."
                      value={prompt}
                      onChange={e => setPrompt(e.target.value)}
                      className="h-32 bg-secondary/50 border-border rounded-2xl text-sm font-medium p-6 resize-none focus:ring-primary/40 shadow-inner"
                    />
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-3">
                       <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Style</Label>
                       <div className="flex flex-wrap gap-2">
                          {Object.entries(STYLE_PRESETS).map(([id, s]) => (
                            <button
                              key={id}
                              onClick={() => setActiveStyle(id as ImageStyle)}
                              className={cn(
                                "px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all",
                                activeStyle === id ? "bg-primary text-white border-primary shadow-lg" : "bg-secondary/30 border-border text-foreground/40 hover:text-primary"
                              )}
                            >
                               {s.label}
                            </button>
                          ))}
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-3">
                          <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Aspect Ratio</Label>
                          <div className="grid grid-cols-2 gap-2">
                             {(['1:1', '16:9', '9:16', '4:5'] as AspectRatio[]).map(a => (
                               <button
                                 key={a}
                                 onClick={() => setAspect(a)}
                                 className={cn(
                                   "h-10 rounded-xl border flex items-center justify-center text-[10px] font-black uppercase transition-all",
                                   aspect === a ? "bg-primary text-white border-primary shadow-lg" : "bg-secondary/30 border-border text-foreground/40"
                                 )}
                               >
                                  {a}
                               </button>
                             ))}
                          </div>
                       </div>
                       <div className="space-y-3">
                          <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Seed</Label>
                          <div className="relative group/seed">
                             <Input 
                               type="number"
                               placeholder="Random"
                               value={seed}
                               onChange={e => setSeed(e.target.value)}
                               className="h-10 bg-secondary/50 border-border rounded-xl text-xs font-mono font-bold pl-8"
                             />
                             <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/20 group-focus-within/seed:text-primary" />
                          </div>
                       </div>
                    </div>
                 </div>

                 <Button 
                    onClick={() => executeSynthesis()} 
                    disabled={isProcessing || !prompt.trim()}
                    className="h-16 w-full bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 text-xs uppercase tracking-widest active:scale-95 transition-all"
                 >
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Zap className="w-5 h-5 mr-3" />}
                    {isProcessing ? 'Synthesizing...' : 'Generate Image'}
                 </Button>
                 
                 {statusMessage && (
                   <p className="text-center text-[9px] font-black uppercase text-foreground/30 tracking-widest animate-pulse">
                     {statusMessage}
                   </p>
                 )}
              </CardContent>
           </Card>

           <Card className="glass-card border-border shadow-xl flex flex-col max-h-[500px]">
              <Tabs defaultValue="archive" className="w-full h-full flex flex-col">
                 <TabsList className="bg-secondary/30 border-b border-border p-1 h-12 rounded-none grid grid-cols-2">
                    <TabsTrigger value="archive" className="text-[9px] font-black uppercase rounded-lg">History</TabsTrigger>
                    <TabsTrigger value="favs" className="text-[9px] font-black uppercase rounded-lg">Favorites</TabsTrigger>
                 </TabsList>
                 
                 <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/10">
                    <TabsContent value="archive" className="m-0 divide-y divide-white/5">
                       {archive.length === 0 ? (
                          <div className="py-20 text-center opacity-10 space-y-2">
                             <History className="w-8 h-8 mx-auto" />
                             <p className="text-[10px] font-black uppercase tracking-widest">No History</p>
                          </div>
                       ) : (
                          archive.map(item => (
                            <div key={item.id} className="p-4 flex items-center justify-between group hover:bg-white/5 transition-all cursor-pointer" onClick={() => reuseFromHistory(item)}>
                               <div className="flex items-center gap-4 min-w-0">
                                  <div className="w-12 h-12 rounded-xl bg-secondary border border-white/5 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                                     <img src={item.url} alt="" className="w-full h-full object-cover" />
                                  </div>
                                  <div className="min-w-0">
                                     <p className="text-[11px] font-bold text-foreground truncate uppercase">{item.prompt}</p>
                                     <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">{item.style}</p>
                                  </div>
                               </div>
                               <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={(e) => { e.stopPropagation(); toggleFavorite(item); }} className={cn("p-2 transition-colors", favorites.some(f => f.url === item.url) ? "text-yellow-500" : "text-foreground/20 hover:text-yellow-500")}><Star className="w-3.5 h-3.5" /></button>
                                  <button onClick={(e) => { e.stopPropagation(); saveArchive(archive.filter(i => i.id !== item.id)); }} className="p-2 text-foreground/20 hover:text-red-500 transition-colors"><X className="w-3.5 h-3.5" /></button>
                               </div>
                            </div>
                          ))
                       )}
                    </TabsContent>

                    <TabsContent value="favs" className="m-0 divide-y divide-white/5">
                       {favorites.length === 0 ? (
                          <div className="py-20 text-center opacity-10 space-y-2">
                             <Star className="w-8 h-8 mx-auto" />
                             <p className="text-[10px] font-black uppercase tracking-widest">No Favorites</p>
                          </div>
                       ) : (
                          favorites.map(item => (
                            <div key={item.id} className="p-4 flex items-center justify-between group hover:bg-white/5 transition-all cursor-pointer" onClick={() => reuseFromHistory(item)}>
                               <div className="flex items-center gap-4 min-w-0">
                                  <div className="w-12 h-12 rounded-xl bg-secondary border border-white/5 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                                     <img src={item.url} alt="" className="w-full h-full object-cover" />
                                  </div>
                                  <div className="min-w-0">
                                     <p className="text-[11px] font-bold text-foreground truncate uppercase">{item.prompt}</p>
                                     <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">seed:{item.seed}</p>
                                  </div>
                               </div>
                               <button onClick={(e) => { e.stopPropagation(); toggleFavorite(item); }} className="p-2 text-yellow-500 hover:text-red-500 transition-colors"><X className="w-3.5 h-3.5" /></button>
                            </div>
                          ))
                       )}
                    </TabsContent>
                 </div>
              </Tabs>
           </Card>
        </aside>

        {/* Results Column */}
        <main className="lg:col-span-7 xl:col-span-8 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px] bg-black/40">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                          <Activity className="w-5 h-5" />
                       </div>
                       <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Result</CardTitle>
                    </div>
                    <div className="flex items-center gap-4">
                       {resultUrl && prevResultUrl && (
                         <div className="flex items-center gap-2 bg-background/50 px-3 py-1 rounded-full border border-border">
                           <span className="text-[8px] font-black uppercase text-foreground/40">Compare A/B</span>
                           <Switch checked={showComparison} onCheckedChange={setShowComparison} className="scale-50 h-4 w-8" />
                         </div>
                       )}
                       {resultUrl && !isProcessing && (
                           <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] font-black uppercase tracking-widest px-3 py-1">DONE</Badge>
                       )}
                    </div>
                 </div>
              </CardHeader>
              
              <CardContent className="flex-1 p-8 sm:p-12 flex flex-col items-center justify-center relative overflow-hidden bg-checkered">
                 {!resultUrl && !isProcessing ? (
                   <div className="flex flex-col items-center justify-center opacity-10 gap-6 py-20">
                      <ImageIcon className="w-24 h-24 text-primary" />
                      <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Prompt</p>
                   </div>
                 ) : (
                   <div className="relative w-full h-full flex flex-col items-center justify-center">
                      {isProcessing && (
                        <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-6 rounded-[2.5rem]">
                           <div className="relative">
                              <div className="w-28 h-28 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                              <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                           </div>
                           <p className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">Creating image...</p>
                        </div>
                      )}
                      
                      {resultUrl && (
                        <div className="relative group/master max-w-full flex flex-col items-center gap-10">
                           <div className="relative max-w-full rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-white/10 transition-all duration-700">
                             <img 
                              src={showComparison ? prevResultUrl || resultUrl : resultUrl} 
                              alt="AI Result" 
                              className={cn(
                                "max-w-full max-h-[65vh] object-contain transition-all duration-700",
                                isProcessing ? "opacity-0 scale-95" : "opacity-100 scale-100"
                              )}
                             />
                           </div>
                           
                           {!isProcessing && (
                              <div className="flex flex-col sm:flex-row justify-center gap-4 animate-in slide-in-from-bottom-4 duration-500 w-full">
                                 <div className="flex flex-1 gap-2">
                                    <Button 
                                      onClick={() => handleDownload('png')} 
                                      className="h-16 flex-1 bg-white text-black hover:bg-white/90 font-black rounded-2xl flex items-center justify-center gap-4 text-xs uppercase tracking-widest shadow-2xl active:scale-95 transition-all"
                                    >
                                      <Download className="w-6 h-6" /> Save PNG
                                    </Button>
                                 </div>
                                 <div className="flex gap-2">
                                    <Button onClick={() => executeSynthesis()} variant="outline" className="h-16 px-8 border-white/10 bg-white/5 text-primary font-black uppercase text-[10px] rounded-2xl hover:bg-primary hover:text-white transition-all">
                                       <RefreshCcw className="w-5 h-5 mr-2" /> Try again
                                    </Button>
                                    <Button onClick={() => toggleFavorite({ id: 'temp', prompt, url: resultUrl!, style: activeStyle, aspect, seed: parseInt(seed) || 0, timestamp: Date.now() })} variant="outline" className={cn("h-16 px-6 border-white/10 bg-white/5 rounded-2xl transition-all", favorites.some(f => f.url === resultUrl) ? "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" : "text-white")}>
                                       <Star className={cn("w-5 h-5", favorites.some(f => f.id === resultUrl) && "fill-current")} />
                                    </Button>
                                 </div>
                              </div>
                           )}
                        </div>
                      )}
                   </div>
                 )}
              </CardContent>
           </Card>

           {/* Info Row */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Private</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    All generation happens via secure nodes. Your data is not stored or shared.
                  </p>
                </div>
             </div>
             <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <Zap className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Fast</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Utilizing high-performance global nodes for rapid image synthesis.
                  </p>
                </div>
             </div>
          </div>
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .bg-checkered {
          background-image: linear-gradient(45deg, #111113 25%, transparent 25%), 
                            linear-gradient(-45deg, #111113 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #111113 75%), 
                            linear-gradient(-45deg, transparent 75%, #111113 75%);
          background-size: 20px 20px;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
