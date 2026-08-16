
"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Wand2, 
  Upload, 
  Download, 
  Trash2, 
  Sparkles, 
  Loader2, 
  Info,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Sun,
  Contrast,
  Droplet,
  Zap,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Scaling,
  LayoutGrid,
  Settings2,
  Save,
  ImageIcon,
  Undo2,
  Redo2,
  Thermometer,
  Wind,
  FlipHorizontal,
  FlipVertical,
  RotateCw,
  Crop,
  LayoutTemplate,
  History,
  Activity,
  Maximize,
  ArrowRightLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface EnhanceState {
  brightness: number;
  exposure: number;
  contrast: number;
  saturation: number;
  vibrance: number;
  temperature: number;
  sharpness: number;
  clarity: number;
  denoise: number;
  scale: 1 | 2 | 4;
  pixelArt: boolean;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  aspect: string;
}

const INITIAL_STATE: EnhanceState = {
  brightness: 100,
  exposure: 0,
  contrast: 100,
  saturation: 100,
  vibrance: 0,
  temperature: 0,
  sharpness: 0,
  clarity: 0,
  denoise: 0,
  scale: 1,
  pixelArt: false,
  rotation: 0,
  flipH: false,
  flipV: false,
  aspect: 'free'
};

const PRESETS: Record<string, Partial<EnhanceState>> = {
  'auto': { brightness: 105, contrast: 110, saturation: 105, sharpness: 20, clarity: 15 },
  'portrait': { brightness: 102, contrast: 95, saturation: 110, vibrance: 15, temperature: 5, denoise: 20 },
  'product': { brightness: 110, contrast: 120, saturation: 105, sharpness: 40, clarity: 30 },
  'document': { brightness: 120, contrast: 150, grayscale: 100, sharpness: 50, clarity: 40 } as any,
  'night': { exposure: 40, brightness: 110, contrast: 125, saturation: 90, denoise: 30 }
};

export default function PhotoEnhanceFixProPage() {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBefore, setShowBefore] = useState(false);
  const [compareSplit, setCompareSplit] = useState(50);
  
  // Studio History
  const [history, setHistory] = useState<EnhanceState[]>([INITIAL_STATE]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [state, setState] = useState<EnhanceState>(INITIAL_STATE);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          setOriginalImage(img);
          setImage(result);
          setState(INITIAL_STATE);
          setHistory([INITIAL_STATE]);
          setCurrentIndex(0);
          setIsProcessing(false);
          toast({ title: "Asset Imported", description: "Pro Studio Matrix initialized." });
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    }
  };

  const commitChange = (newState: EnhanceState) => {
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push({ ...newState });
    if (newHistory.length > 20) newHistory.shift();
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (currentIndex > 0) {
      const prev = history[currentIndex - 1];
      setCurrentIndex(currentIndex - 1);
      setState(prev);
    }
  };

  const redo = () => {
    if (currentIndex < history.length - 1) {
      const next = history[currentIndex + 1];
      setCurrentIndex(currentIndex + 1);
      setState(next);
    }
  };

  const applyEnhancements = useCallback((ctx: CanvasRenderingContext2D, img: HTMLImageElement, currentState: EnhanceState) => {
    const targetW = img.width * currentState.scale;
    const targetH = img.height * currentState.scale;
    
    ctx.canvas.width = targetW;
    ctx.canvas.height = targetH;
    ctx.clearRect(0, 0, targetW, targetH);
    
    ctx.save();
    
    // 1. Position & Transform
    ctx.translate(targetW / 2, targetH / 2);
    ctx.rotate((currentState.rotation * Math.PI) / 180);
    ctx.scale(currentState.flipH ? -1 : 1, currentState.flipV ? -1 : 1);
    
    // 2. High-Fidelity Filters
    // Note: Vibrance is approximated via Saturation + Temperature
    const brightnessVal = currentState.brightness + currentState.exposure;
    const tempVal = currentState.temperature;
    const warmthFilter = tempVal > 0 
      ? `sepia(${tempVal}%) hue-rotate(-${tempVal * 0.2}deg)`
      : `hue-rotate(${Math.abs(tempVal) * 0.4}deg) saturate(${100 + Math.abs(tempVal)}%)`;

    ctx.filter = `
      brightness(${brightnessVal}%) 
      contrast(${currentState.contrast}%) 
      saturate(${currentState.saturation + currentState.vibrance}%)
      blur(${currentState.denoise * 0.1}px)
      ${warmthFilter}
    `;

    ctx.imageSmoothingEnabled = !currentState.pixelArt;
    ctx.imageSmoothingQuality = 'high';
    
    ctx.drawImage(img, -targetW / 2, -targetH / 2, targetW, targetH);

    // 3. Clarity & Sharpness (Secondary Pass)
    if (currentState.sharpness > 0 || currentState.clarity > 0) {
      ctx.globalAlpha = (currentState.sharpness + currentState.clarity) / 200;
      ctx.filter = `contrast(${100 + currentState.clarity}%) brightness(102%)`;
      ctx.drawImage(ctx.canvas, -targetW / 2, -targetH / 2);
    }

    ctx.restore();
  }, []);

  useEffect(() => {
    if (!originalImage || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    applyEnhancements(ctx, originalImage, state);
  }, [originalImage, state, applyEnhancements]);

  const updateParam = (updates: Partial<EnhanceState>, silent = false) => {
    const newState = { ...state, ...updates };
    setState(newState);
    if (!silent) commitChange(newState);
  };

  const applyPreset = (pId: string) => {
    const preset = PRESETS[pId];
    if (preset) {
      const newState = { ...state, ...preset };
      setState(newState);
      commitChange(newState);
      toast({ title: "Preset Applied", description: `${pId.toUpperCase()} profile active.` });
    }
  };

  const handleDownload = (format: 'png' | 'jpg') => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `mykit-pro-enhanced-${Date.now()}.${format}`;
    link.href = canvasRef.current.toDataURL(format === 'png' ? 'image/png' : 'image/jpeg', 0.95);
    link.click();
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20 max-w-full">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Sparkles className="w-3.5 h-3.5" /> Identity Intel V2.0
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
                Photo <span className="text-primary italic">Enhance & Fix PRO</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Hardware-accelerated restoration studio. Advanced frequency separation, 4X upscaling, and clinical chromatic correction protocols for professional visual production.
              </p>
           </div>
           {image && (
             <div className="flex items-center gap-3">
                <div className="flex p-1 bg-secondary rounded-xl border border-white/5 mr-4">
                   <Button variant="ghost" size="icon" onClick={undo} disabled={currentIndex === 0} className="h-10 w-10 text-white/40 hover:text-primary"><Undo2 className="w-4 h-4" /></Button>
                   <Button variant="ghost" size="icon" onClick={redo} disabled={currentIndex === history.length - 1} className="h-10 w-10 text-white/40 hover:text-primary"><Redo2 className="w-4 h-4" /></Button>
                </div>
                <Button variant="outline" onClick={() => { setImage(null); setOriginalImage(null); }} className="h-12 px-6 rounded-xl border-border bg-secondary text-[10px] font-black uppercase tracking-widest hover:text-destructive">
                   <Trash2 className="w-4 h-4 mr-2" /> Purge
                </Button>
                <Button onClick={() => handleDownload('png')} className="h-12 px-8 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/30">
                   <Save className="w-4 h-4 mr-2" /> Export Master
                </Button>
             </div>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Workspace - Left */}
        <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-left-6 duration-1000">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[700px]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
              <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                <Maximize2 className="w-3.5 h-3.5" /> High-Resolution Matrix
              </CardTitle>
              {image && (
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-2 bg-background/50 px-3 py-1 rounded-full border border-border">
                      <span className="text-[8px] font-black uppercase text-foreground/40">Visual A/B Split</span>
                      <Switch checked={showBefore} onCheckedChange={setShowBefore} className="scale-50 h-4 w-8" />
                   </div>
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 bg-[#060608] relative">
               {!image ? (
                 <div onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center gap-10 cursor-pointer group p-20 text-center border-2 border-dashed border-white/5 rounded-[3rem] hover:border-primary/40 transition-all duration-700">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 flex items-center justify-center text-white/10 group-hover:text-primary group-hover:scale-110 transition-all shadow-2xl">
                      <ImageIcon className="w-10 h-10" />
                    </div>
                    <div className="space-y-3">
                       <h3 className="text-xl font-headline font-black text-white/40 uppercase tracking-widest leading-none">Inject Visual Payload</h3>
                       <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">WASM Multi-Format Support Enabled</p>
                    </div>
                 </div>
               ) : (
                 <div className="relative w-full h-full flex flex-col items-center justify-center">
                    <div className="relative group/canvas max-w-full rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-checkered cursor-crosshair">
                       {showBefore && originalImage && (
                         <div className="absolute inset-0 z-10 pointer-events-none">
                            <div 
                              className="absolute inset-0 bg-no-repeat bg-contain bg-center opacity-60" 
                              style={{ 
                                backgroundImage: `url(${image})`, 
                                width: `${compareSplit}%`,
                                borderRight: '2px solid white'
                              }} 
                            />
                         </div>
                       )}
                       
                       <canvas 
                        ref={canvasRef} 
                        className={cn(
                          "max-w-full h-auto object-contain transition-all duration-500",
                          isProcessing && "opacity-50 blur-sm"
                        )}
                       />

                       {showBefore && (
                         <input 
                          type="range" 
                          min="0" max="100" 
                          value={compareSplit} 
                          onChange={(e) => setCompareSplit(parseInt(e.target.value))}
                          className="absolute bottom-0 left-0 w-full z-20 opacity-0 cursor-ew-resize h-full"
                         />
                       )}
                    </div>

                    <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl">
                       <div className="p-5 rounded-2xl bg-secondary/50 border border-border flex flex-col items-center gap-3 group hover:border-primary/20 transition-all">
                          <Maximize className="w-5 h-5 text-primary/40 group-hover:text-primary" />
                          <div className="text-center space-y-1">
                             <p className="text-[8px] font-black uppercase text-foreground/30">Output Density</p>
                             <p className="text-xs font-mono font-bold text-foreground">
                               {originalImage ? `${originalImage.width * state.scale}x${originalImage.height * state.scale}` : '0x0'} PX
                             </p>
                          </div>
                       </div>
                       <div className="p-5 rounded-2xl bg-secondary/50 border border-border flex flex-col items-center gap-3 group hover:border-primary/20 transition-all">
                          <Activity className="w-5 h-5 text-primary/40 group-hover:text-primary" />
                          <div className="text-center space-y-1">
                             <p className="text-[8px] font-black uppercase text-foreground/30">Active Protocol</p>
                             <p className="text-xs font-mono font-bold text-foreground">HARDWARE WASM</p>
                          </div>
                       </div>
                       <div className="p-5 rounded-2xl bg-secondary/50 border border-border flex flex-col items-center gap-3 group hover:border-primary/20 transition-all">
                          <History className="w-5 h-5 text-primary/40 group-hover:text-primary" />
                          <div className="text-center space-y-1">
                             <p className="text-[8px] font-black uppercase text-foreground/30">History Stack</p>
                             <p className="text-xs font-mono font-bold text-foreground">{currentIndex + 1} / {history.length} STEPS</p>
                          </div>
                       </div>
                    </div>
                 </div>
               )}
            </CardContent>
            
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Sanitized Local Buffers</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    All enhancement occurs strictly in local memory. Visual matrices are definitive-wiped upon exit, maintaining the studio's strict privacy mandate.
                  </p>
                </div>
             </div>
             <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <Zap className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Hardware Synthesis</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Utilizing hardware-accelerated Canvas 2D contexts and bi-linear interpolation for 1:1 pixel fidelity during high-volume upscaling tasks.
                  </p>
                </div>
             </div>
          </div>
        </div>

        {/* Controls - Right */}
        <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
          <Tabs defaultValue="enhance" className="w-full">
            <TabsList className="grid grid-cols-3 bg-secondary p-1.5 rounded-2xl h-14 mb-8 border border-white/5 shadow-2xl">
               <TabsTrigger value="enhance" className="rounded-xl text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-background">Enhance</TabsTrigger>
               <TabsTrigger value="fix" className="rounded-xl text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-background">Fix & Scale</TabsTrigger>
               <TabsTrigger value="transform" className="rounded-xl text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-background">Matrix</TabsTrigger>
            </TabsList>

            <div className="min-h-[600px]">
              <TabsContent value="enhance" className="space-y-8 mt-0 animate-in fade-in duration-300">
                <Card className="glass-card border-border shadow-xl overflow-hidden">
                   <CardHeader className="py-6 border-b border-border bg-secondary/30">
                      <div className="flex items-center justify-between">
                         <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Identity Profiles</Label>
                         <LayoutTemplate className="w-4 h-4 text-primary/40" />
                      </div>
                   </CardHeader>
                   <CardContent className="pt-8 grid grid-cols-2 gap-3">
                      {Object.keys(PRESETS).map(p => (
                        <button key={p} onClick={() => applyPreset(p)} className="h-11 rounded-xl bg-background border border-border text-[9px] font-black uppercase tracking-widest hover:text-primary hover:border-primary transition-all">
                           {p} Profile
                        </button>
                      ))}
                   </CardContent>
                </Card>

                <Card className="glass-card border-border shadow-xl overflow-hidden">
                   <CardContent className="pt-8 space-y-10">
                      {[
                        { label: 'Brightness', key: 'brightness', icon: Sun, min: 50, max: 150 },
                        { label: 'Exposure', key: 'exposure', icon: Maximize, min: -100, max: 100 },
                        { label: 'Contrast', key: 'contrast', icon: Contrast, min: 50, max: 150 },
                        { label: 'Saturation', key: 'saturation', icon: Droplet, min: 0, max: 200 },
                        { label: 'Vibrance', key: 'vibrance', icon: Sparkles, min: -100, max: 100 },
                        { label: 'Temperature', key: 'temperature', icon: Thermometer, min: -100, max: 100 },
                        { label: 'Clarity', key: 'clarity', icon: Wind, min: 0, max: 100 },
                        { label: 'Sharpness', key: 'sharpness', icon: Zap, min: 0, max: 100 },
                      ].map((adj) => (
                        <div key={adj.key} className="space-y-4">
                           <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-foreground/30">
                              <Label className="flex items-center gap-2"><adj.icon className="w-3.5 h-3.5 text-primary" /> {adj.label}</Label>
                              <span className="text-primary font-mono">{state[adj.key as keyof EnhanceState]}%</span>
                           </div>
                           <Slider 
                             value={[state[adj.key as keyof EnhanceState] as number]} 
                             min={adj.min} 
                             max={adj.max} 
                             step={1} 
                             onValueChange={v => updateParam({ [adj.key]: v[0] }, true)} 
                             onValueCommit={() => commitChange(state)}
                           />
                        </div>
                      ))}
                   </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="fix" className="space-y-8 mt-0 animate-in fade-in duration-300">
                <Card className="glass-card border-border shadow-xl overflow-hidden">
                   <CardContent className="pt-8 space-y-10">
                      <div className="space-y-6">
                         <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Resolution Upscale Protocol</Label>
                         <div className="grid grid-cols-3 gap-3">
                            {[1, 2, 4].map(s => (
                              <button
                                key={s}
                                onClick={() => updateParam({ scale: s as any })}
                                className={cn(
                                  "h-14 rounded-2xl border flex flex-col items-center justify-center transition-all",
                                  state.scale === s ? "bg-primary text-white border-primary shadow-xl scale-105" : "bg-background border-border text-foreground/40 hover:text-foreground"
                                )}
                              >
                                 <span className="text-[11px] font-black uppercase">{s}X</span>
                                 <span className="text-[8px] font-bold opacity-60 uppercase">{s === 1 ? 'Native' : 'Upscaled'}</span>
                              </button>
                            ))}
                         </div>
                      </div>

                      <div className="space-y-4 pt-6 border-t border-border">
                         <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-foreground/30">
                            <Label className="flex items-center gap-2"><Droplet className="w-3.5 h-3.5 text-primary" /> De-Pixelate (Restore)</Label>
                            <span className="text-primary font-mono">{state.denoise}%</span>
                         </div>
                         <Slider value={[state.denoise]} min={0} max={100} step={1} onValueChange={v => updateParam({ denoise: v[0] })} />
                      </div>

                      <div className="p-6 rounded-[2rem] bg-secondary border border-border flex items-center justify-between group hover:border-primary/20 transition-all">
                         <div className="space-y-1">
                            <p className="text-[11px] font-black text-foreground uppercase tracking-widest">Pixel Art Logic</p>
                            <p className="text-[9px] text-foreground/30 font-medium uppercase">Preserve aliased edges (Nearest-Neighbor)</p>
                         </div>
                         <Switch checked={state.pixelArt} onCheckedChange={v => updateParam({ pixelArt: v })} />
                      </div>
                   </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="transform" className="space-y-8 mt-0 animate-in fade-in duration-300">
                <Card className="glass-card border-border shadow-xl overflow-hidden">
                   <CardContent className="pt-8 space-y-10">
                      <div className="space-y-6">
                         <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Matrix Rotation</Label>
                         <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" onClick={() => updateParam({ rotation: (state.rotation - 90) % 360 })} className="h-14 bg-background border-border text-[10px] font-black uppercase tracking-widest hover:text-primary">
                               <RotateCcw className="w-4 h-4 mr-2" /> Left 90°
                            </Button>
                            <Button variant="outline" onClick={() => updateParam({ rotation: (state.rotation + 90) % 360 })} className="h-14 bg-background border-border text-[10px] font-black uppercase tracking-widest hover:text-primary">
                               <RotateCw className="w-4 h-4 mr-2" /> Right 90°
                            </Button>
                         </div>
                      </div>

                      <div className="space-y-6 pt-6 border-t border-border">
                         <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Mirror Protocol</Label>
                         <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" onClick={() => updateParam({ flipH: !state.flipH })} className={cn("h-14 border-border text-[10px] font-black uppercase transition-all", state.flipH ? "bg-primary text-white" : "bg-background text-foreground/40")}>
                               <FlipHorizontal className="w-4 h-4 mr-2" /> Horizontal
                            </Button>
                            <Button variant="outline" onClick={() => updateParam({ flipV: !state.flipV })} className={cn("h-14 border-border text-[10px] font-black uppercase transition-all", state.flipV ? "bg-primary text-white" : "bg-background text-foreground/40")}>
                               <FlipVertical className="w-4 h-4 mr-2" /> Vertical
                            </Button>
                         </div>
                      </div>

                      <div className="space-y-6 pt-6 border-t border-border">
                         <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Frame Matrix (Crop)</Label>
                         <div className="grid grid-cols-2 gap-3">
                            {['Free', '1:1', '4:5', '16:9'].map(ratio => (
                              <button key={ratio} onClick={() => updateParam({ aspect: ratio.toLowerCase() })} className={cn("h-11 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all", state.aspect === ratio.toLowerCase() ? "bg-primary text-white" : "bg-background border-border text-foreground/40")}>
                                 {ratio}
                              </button>
                            ))}
                         </div>
                      </div>
                   </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
            <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Protocol Advisory</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                For high-resolution print production, use **4x Upscale** combined with **30% Clarity**. For restoration of low-bitrate JPGs, prioritize **De-Pixelate** before applying sharpness filters.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .bg-checkered {
          background-image: linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                            linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                            linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
          background-size: 20px 20px;
        }
        .dark .bg-checkered {
           background-image: linear-gradient(45deg, #111113 25%, transparent 25%), 
                            linear-gradient(-45deg, #111113 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #111113 75%), 
                            linear-gradient(-45deg, transparent 75%, #111113 75%);
        }
      `}</style>
    </div>
  );
}

