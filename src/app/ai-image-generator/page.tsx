
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
  Maximize,
  Smartphone,
  Monitor,
  Share2,
  AlertCircle,
  ShieldCheck,
  Activity,
  Dices,
  Layers,
  FileImage,
  ArrowRight,
  ChevronRight,
  X,
  Palette,
  LayoutGrid,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

// --- Constants & Matrix Data ---

type AspectRatio = '1:1' | '16:9' | '9:16' | '4:5';
type ImageStyle = 'normal' | 'realistic' | 'anime' | '3d' | 'logo' | 'poster';

interface ArchiveItem {
  id: string;
  prompt: string;
  url: string;
  style: ImageStyle;
  aspect: AspectRatio;
  timestamp: number;
}

const STYLE_PRESETS: Record<ImageStyle, { label: string; suffix: string }> = {
  normal: { label: 'Normal', suffix: '' },
  realistic: { label: 'Realistic', suffix: ', highly detailed, 8k resolution, cinematic lighting, photorealistic, professional photography' },
  anime: { label: 'Anime', suffix: ', anime style, vibrant colors, clean lines, high quality digital art, studio ghibli inspired' },
  '3d': { label: '3D Render', suffix: ', octane render, unreal engine 5, 3d isometric, c4d, hyper-detailed, ray tracing' },
  logo: { label: 'Logo', suffix: ', minimalist logo design, vector art, flat design, white background, high contrast, symbol' },
  poster: { label: 'Poster', suffix: ', typographic poster design, graphic design style, bold colors, artistic composition' },
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

const STORAGE_KEY = 'mykit_ai_image_archive_v2';

export default function AiImageGeneratorPage() {
  const { toast } = useToast();
  
  // Studio State
  const [prompt, setPrompt] = useState('');
  const [activeStyle, setActiveStyle] = useState<ImageStyle>('normal');
  const [aspect, setAspect] = useState<AspectRatio>('1:1');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  // Registry State
  const [archive, setArchive] = useState<ArchiveItem[]>([]);
  const [showClearConfirm, setShowClearAllConfirm] = useState(false);

  // Initialization
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) try { setArchive(JSON.parse(saved)); } catch (e) {}
  }, []);

  const saveToArchive = (item: ArchiveItem) => {
    const next = [item, ...archive.filter(p => p.prompt !== item.prompt)].slice(0, 12);
    setArchive(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const handleSurprise = () => {
    const pick = RANDOM_PROMPTS[Math.floor(Math.random() * RANDOM_PROMPTS.length)];
    setPrompt(pick);
    toast({ title: "Linguistic Signal Injected" });
  };

  const executeSynthesis = async () => {
    if (!prompt.trim()) return;
    
    setIsProcessing(true);
    setResultUrl(null);

    const dims = {
      '1:1': { w: 1024, h: 1024 },
      '16:9': { w: 1280, h: 720 },
      '9:16': { w: 720, h: 1280 },
      '4:5': { w: 800, h: 1000 }
    }[aspect];

    const seed = Math.floor(Math.random() * 1000000);
    const fullPrompt = `${prompt.trim()}${STYLE_PRESETS[activeStyle].suffix}`;
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=${dims.w}&height=${dims.h}&seed=${seed}&nologo=true`;

    try {
      // Warm the node
      const response = await fetch(url);
      if (!response.ok) throw new Error("Node restricted");
      
      setResultUrl(url);
      saveToArchive({
        id: Math.random().toString(36).substr(2, 9),
        prompt: prompt.trim(),
        url,
        style: activeStyle,
        aspect,
        timestamp: Date.now()
      });
      toast({ title: "Master Synthesized", description: "Visual identity isolated." });
    } catch (err) {
      toast({ variant: "destructive", title: "Protocol Failure", description: "Node busy. Please retry handshake." });
      setIsProcessing(false);
    }
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
      toast({ title: "Master Exported" });
    } catch (e) {
      window.open(resultUrl, '_blank');
    }
  };

  const handleCopy = () => {
    if (prompt) {
      navigator.clipboard.writeText(prompt);
      setIsCopied(true);
      toast({ title: "Prompt Isolated" });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setPrompt('');
    setResultUrl(null);
    setIsProcessing(false);
    toast({ title: "Studio Reset" });
  };

  const removeArchiveItem = (id: string) => {
    setArchive(prev => prev.filter(i => i.id !== id));
    toast({ title: "Registry Entry Purged" });
  };

  const clearFullArchive = () => {
    setArchive([]);
    localStorage.removeItem(STORAGE_KEY);
    setShowClearAllConfirm(false);
    toast({ title: "Full Archive Purged" });
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
                Professional high-fidelity image synthesis. Create unique visual identities from linguistic signals locally and securely using the Pollinations matrix.
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
                    <Settings2 className="w-5 h-5 text-primary" /> Matrix Parameters
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-8">
                 <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                       <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Linguistic Prompt</Label>
                       <button onClick={handleSurprise} className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-2 hover:opacity-70 transition-all">
                          <Dices className="w-3 h-3" /> Surprise Me
                       </button>
                    </div>
                    <Textarea 
                      placeholder="e.g. Cyberpunk city with neon lights, 8k, detailed architecture..."
                      value={prompt}
                      onChange={e => setPrompt(e.target.value)}
                      className="h-32 bg-secondary/50 border-border rounded-2xl text-sm font-medium p-6 resize-none focus:ring-primary/40 shadow-inner"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                       <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Style DNA</Label>
                       <Select value={activeStyle} onValueChange={(v: ImageStyle) => setActiveStyle(v)}>
                          <SelectTrigger className="h-12 bg-secondary/50 border-border rounded-xl font-bold uppercase text-[10px]">
                             <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="glass-card">
                             {Object.entries(STYLE_PRESETS).map(([id, s]) => (
                               <SelectItem key={id} value={id} className="text-[10px] font-black uppercase">{s.label}</SelectItem>
                             ))}
                          </SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-3">
                       <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Aspect Ratio</Label>
                       <Select value={aspect} onValueChange={(v: AspectRatio) => setAspect(v)}>
                          <SelectTrigger className="h-12 bg-secondary/50 border-border rounded-xl font-bold uppercase text-[10px]">
                             <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="glass-card">
                             <SelectItem value="1:1" className="text-[10px] font-black uppercase">1:1 Square</SelectItem>
                             <SelectItem value="16:9" className="text-[10px] font-black uppercase">16:9 Cinema</SelectItem>
                             <SelectItem value="9:16" className="text-[10px] font-black uppercase">9:16 Mobile</SelectItem>
                             <SelectItem value="4:5" className="text-[10px] font-black uppercase">4:5 Portrait</SelectItem>
                          </SelectContent>
                       </Select>
                    </div>
                 </div>

                 <Button 
                    onClick={executeSynthesis} 
                    disabled={isProcessing || !prompt.trim()}
                    className="h-16 w-full bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 text-xs uppercase tracking-widest active:scale-95 transition-all"
                 >
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Zap className="w-5 h-5 mr-3" />}
                    Synthesize Image
                 </Button>
              </CardContent>
           </Card>

           {/* History Module */}
           <Card className="glass-card border-border shadow-xl flex flex-col max-h-[500px]">
              <CardHeader className="py-4 border-b border-border bg-secondary/30 flex flex-row items-center justify-between shrink-0 px-6">
                 <div className="flex items-center gap-3">
                    <History className="w-4 h-4 text-primary" />
                    <CardTitle className="text-[10px] font-black uppercase text-foreground">Archive Registry</CardTitle>
                 </div>
                 {archive.length > 0 && (
                   <button onClick={() => setShowClearAllConfirm(true)} className="text-[9px] font-black text-foreground/20 hover:text-red-500 uppercase transition-colors">Purge All</button>
                 )}
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-1 bg-black/10">
                 {archive.length === 0 ? (
                    <div className="py-20 text-center opacity-10 space-y-2">
                       <LayoutGrid className="w-8 h-8 mx-auto" />
                       <p className="text-[10px] font-black uppercase tracking-widest">Zero Matrix History</p>
                    </div>
                 ) : (
                    <div className="divide-y divide-white/5">
                       {archive.map(item => (
                         <div key={item.id} className="p-4 flex items-center justify-between group hover:bg-white/5 transition-all cursor-pointer" onClick={() => { setPrompt(item.prompt); setActiveStyle(item.style); setAspect(item.aspect); }}>
                            <div className="flex items-center gap-4 min-w-0">
                               <div className="w-12 h-12 rounded-xl bg-secondary border border-white/5 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                                  <img src={item.url} alt="" className="w-full h-full object-cover" />
                               </div>
                               <div className="min-w-0">
                                  <p className="text-[11px] font-bold text-foreground truncate uppercase">{item.prompt}</p>
                                  <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">{item.style} • {item.aspect}</p>
                               </div>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); removeArchiveItem(item.id); }} className="p-2 text-foreground/10 hover:text-red-500 transition-colors">
                               <X className="w-3.5 h-3.5" />
                            </button>
                         </div>
                       ))}
                    </div>
                 )}
              </CardContent>
           </Card>
        </aside>

        {/* Results Column */}
        <main className="lg:col-span-7 xl:col-span-8 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-1">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px] bg-black/40">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between shrink-0 px-6 sm:px-10">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <Activity className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Identity Output</CardTitle>
                 </div>
                 {resultUrl && !isProcessing && (
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] font-black uppercase tracking-widest px-3 py-1">MASTER SYNTHESIZED</Badge>
                 )}
              </CardHeader>
              
              <CardContent className="flex-1 p-8 sm:p-12 flex flex-col items-center justify-center relative overflow-hidden bg-checkered">
                 {!resultUrl && !isProcessing ? (
                   <div className="flex flex-col items-center justify-center opacity-10 gap-6 py-20">
                      <ImageIcon className="w-24 h-24 text-primary" />
                      <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Linguistic Signal</p>
                   </div>
                 ) : (
                   <div className="relative w-full h-full flex flex-col items-center justify-center">
                      {isProcessing && (
                        <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-6 rounded-[2.5rem]">
                           <div className="relative">
                              <div className="w-28 h-28 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                              <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                           </div>
                           <p className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">Decoding Visual Matrix...</p>
                        </div>
                      )}
                      
                      {resultUrl && (
                        <div className="relative group/master max-w-full flex flex-col items-center gap-10">
                           <div className="relative max-w-full rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-white/10 transition-all duration-700">
                             <img 
                              src={resultUrl} 
                              alt="Generated AI Master" 
                              className={cn(
                                "max-w-full max-h-[65vh] object-contain transition-all duration-700",
                                isProcessing ? "opacity-0 scale-95" : "opacity-100 scale-100"
                              )}
                              onLoad={() => setIsProcessing(false)}
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
                                    <Button 
                                      variant="outline"
                                      onClick={() => handleDownload('jpg')} 
                                      className="h-16 px-6 border-white/10 bg-white/5 text-white/40 font-black uppercase text-[10px] rounded-2xl"
                                    >
                                      JPG
                                    </Button>
                                 </div>
                                 <div className="flex gap-2">
                                    <Button onClick={executeSynthesis} variant="outline" className="h-16 px-8 border-white/10 bg-white/5 text-primary font-black uppercase text-[10px] rounded-2xl hover:bg-primary hover:text-white transition-all">
                                       <RefreshCcw className="w-5 h-5 mr-2" /> Re-Sync
                                    </Button>
                                    <Button onClick={handleCopy} variant="outline" className="h-16 px-6 border-white/10 bg-white/5 text-white font-black uppercase text-[10px] rounded-2xl">
                                       {isCopied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                    </Button>
                                    <Button onClick={() => window.open(resultUrl, '_blank')} variant="outline" className="h-16 px-6 border-white/10 bg-white/5 text-white font-black rounded-2xl">
                                       <Maximize2 className="w-5 h-5" />
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

           {/* Security & Reliability Row */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Privacy Sovereign</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Image generation is anonymous. Prompts are volatile and held strictly in local memory. The studio does not log or persist your creative signals.
                  </p>
                </div>
             </div>
             <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <Activity className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Node Reliability</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Synthesis is performed via global hardware-accelerated nodes. High-volume requests may take 5-10 seconds for full buffer synchronization.
                  </p>
                </div>
             </div>
          </div>
        </main>
      </div>

      {/* Confirmation Overlays */}
      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearAllConfirm}>
        <AlertDialogContent className="glass-card border-white/10 rounded-[2.5rem] p-8 max-w-sm">
          <AlertDialogHeader className="space-y-4">
            <div className="w-16 h-16 rounded-[1.5rem] bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mx-auto">
               <Trash2 className="w-8 h-8" />
            </div>
            <AlertDialogTitle className="text-xl font-headline font-black text-foreground uppercase tracking-tight text-center">Purge Archive</AlertDialogTitle>
            <AlertDialogDescription className="text-[11px] font-medium text-foreground/40 uppercase tracking-widest leading-relaxed text-center">
              This will definitively clear your visual history registry. This action cannot be reversed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex gap-3">
            <AlertDialogCancel className="h-12 flex-1 rounded-xl border-white/5 bg-white/5 text-[9px] font-black uppercase m-0">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={clearFullArchive} className="h-12 flex-1 rounded-xl bg-destructive text-white font-black uppercase text-[9px] shadow-xl shadow-destructive/20">Purge All</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
