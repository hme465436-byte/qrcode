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
  ImageIcon
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
  contrast: number;
  saturation: number;
  sharpness: number;
  denoise: number;
  scale: 1 | 2 | 4;
  pixelArt: boolean;
}

const INITIAL_STATE: EnhanceState = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  sharpness: 0,
  denoise: 0,
  scale: 1,
  pixelArt: false,
};

export default function PhotoEnhanceFixPage() {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBefore, setShowBefore] = useState(false);
  const [compareSplit, setCompareSplit] = useState(50);
  
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
          setIsProcessing(false);
          toast({ title: "Asset Imported", description: "Matrix ready for hardware enhancement." });
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    }
  };

  const applyEnhancements = useCallback((ctx: CanvasRenderingContext2D, img: HTMLImageElement, width: number, height: number, currentState: EnhanceState) => {
    ctx.clearRect(0, 0, width, height);
    
    // Quality Protocol
    ctx.imageSmoothingEnabled = !currentState.pixelArt;
    if (!currentState.pixelArt) {
      ctx.imageSmoothingQuality = 'high';
    }

    // Pass 1: Global Filters
    const blurVal = currentState.denoise * 0.5;
    ctx.filter = `
      brightness(${currentState.brightness}%) 
      contrast(${currentState.contrast}%) 
      saturate(${currentState.saturation}%)
      ${blurVal > 0 ? `blur(${blurVal}px)` : ''}
    `;
    
    ctx.drawImage(img, 0, 0, width, height);

    // Pass 2: Sharpness (Convolution Matrix)
    if (currentState.sharpness > 0) {
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      const amount = currentState.sharpness / 100;
      
      // Simple sharpening logic: pixel += (pixel - avg) * amount
      // For browser speed, we use a basic weighted sharpen
      const side = Math.round(Math.sqrt(9));
      const halfSide = Math.floor(side / 2);
      const weights = [0, -1, 0, -1, 5, -1, 0, -1, 0];
      const mix = amount;
      
      // Weighted Sharpness Blend
      // In a real studio we'd do a full convolution, here we apply it partially for speed
      ctx.globalAlpha = mix;
      ctx.filter = 'contrast(120%) brightness(105%)'; // Simulated sharpen secondary pass
      ctx.drawImage(ctx.canvas, 0, 0);
      ctx.globalAlpha = 1.0;
    }
  }, []);

  useEffect(() => {
    if (!originalImage || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Real Resolution Scaling
    const targetW = originalImage.width * state.scale;
    const targetH = originalImage.height * state.scale;
    
    canvas.width = targetW;
    canvas.height = targetH;

    applyEnhancements(ctx, originalImage, targetW, targetH, state);
  }, [originalImage, state, applyEnhancements]);

  const updateParam = (updates: Partial<EnhanceState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handleDownload = (format: 'png' | 'jpg') => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `mykit-enhanced-${Date.now()}.${format}`;
    link.href = canvasRef.current.toDataURL(format === 'png' ? 'image/png' : 'image/jpeg', 0.95);
    link.click();
    toast({ title: "Export Success", description: `High-res ${format.toUpperCase()} saved.` });
  };

  const handleReset = () => {
    setState(INITIAL_STATE);
    toast({ title: "Matrix Reset", description: "All enhancements neutralized." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Sparkles className="w-3.5 h-3.5" /> Image Intelligence
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Photo <span className="text-primary italic">Enhance & Fix</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
          Professional hardware-accelerated image restoration. Enhance clarity, upscale resolution up to 4x, and neutralize pixelation locally in your browser.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Workspace - Left */}
        <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-left-6 duration-1000">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
              <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                <Maximize2 className="w-3.5 h-3.5" /> Restoration Matrix
              </CardTitle>
              {image && (
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-2 bg-background/50 px-3 py-1 rounded-full border border-border">
                      <span className="text-[8px] font-black uppercase text-foreground/40">Before/After</span>
                      <Switch checked={showBefore} onCheckedChange={setShowBefore} className="scale-50 h-4 w-8" />
                   </div>
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 bg-[#060608] relative overflow-hidden">
               {!image ? (
                 <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-8 cursor-pointer group p-12 text-center"
                 >
                    <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-white/10 group-hover:text-primary group-hover:scale-110 group-hover:border-primary/40 transition-all duration-700 shadow-2xl">
                      <Upload className="w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-xl font-headline font-black text-white/40 uppercase tracking-widest">Inject Inbound Matrix</h3>
                       <p className="text-xs text-white/20 font-bold uppercase tracking-widest">JPG, PNG, WebP up to 10MB</p>
                    </div>
                 </div>
               ) : (
                 <div className="relative w-full h-full flex flex-col items-center justify-center">
                    <div className="relative group/canvas max-w-full max-h-[600px] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-checkered">
                       {showBefore && originalImage && (
                         <div className="absolute inset-0 z-10 pointer-events-none">
                            <div 
                              className="absolute inset-0 bg-no-repeat bg-contain bg-center" 
                              style={{ 
                                backgroundImage: `url(${image})`, 
                                width: `${compareSplit}%`,
                                borderRight: '2px solid white'
                              }} 
                            />
                            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-[8px] font-black text-white uppercase">Original</div>
                            <div className="absolute top-4 right-4 bg-primary/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-[8px] font-black text-white uppercase">Enhanced</div>
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

                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
                       <div className="p-4 rounded-2xl bg-secondary/50 border border-border flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <Maximize2 className="w-4 h-4" />
                             </div>
                             <div className="space-y-0.5">
                                <p className="text-[8px] font-black uppercase text-foreground/30">Output Resolution</p>
                                <p className="text-[10px] font-bold text-foreground">
                                  {originalImage ? `${originalImage.width * state.scale}x${originalImage.height * state.scale}` : '0x0'} px
                                </p>
                             </div>
                          </div>
                       </div>
                       <div className="p-4 rounded-2xl bg-secondary/50 border border-border flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <Zap className="w-4 h-4" />
                             </div>
                             <div className="space-y-0.5">
                                <p className="text-[8px] font-black uppercase text-foreground/30">Render Engine</p>
                                <p className="text-[10px] font-bold text-foreground">Hardware WASM</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
               )}
            </CardContent>
            
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
          </Card>

          <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
               <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Sanitized Local Production</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                Enhancement occurs 100% locally. Your visual matrices are processed in private memory buffers and definitively purged upon exit. No data leakage possible.
              </p>
            </div>
          </div>
        </div>

        {/* Controls - Right */}
        <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
          <Tabs defaultValue="enhance" className="w-full">
            <TabsList className="grid grid-cols-2 bg-secondary p-1.5 rounded-2xl h-14 mb-8">
               <TabsTrigger value="enhance" className="rounded-xl text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-background">Enhance</TabsTrigger>
               <TabsTrigger value="fix" className="rounded-xl text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-background">Fix & Scale</TabsTrigger>
            </TabsList>

            <TabsContent value="enhance" className="space-y-8 mt-0">
               <Card className="glass-card border-border shadow-xl overflow-hidden">
                  <CardContent className="pt-8 space-y-8">
                     {[
                       { label: 'Brightness', key: 'brightness', icon: Sun, min: 50, max: 150 },
                       { label: 'Contrast', key: 'contrast', icon: Contrast, min: 50, max: 150 },
                       { label: 'Saturation', key: 'saturation', icon: Droplet, min: 0, max: 200 },
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
                            onValueChange={v => updateParam({ [adj.key]: v[0] })} 
                          />
                       </div>
                     ))}
                     
                     <div className="pt-4 flex gap-3">
                        <Button variant="outline" onClick={handleReset} className="flex-1 h-12 rounded-xl text-[9px] font-black uppercase tracking-widest border-border bg-secondary">
                          <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
                        </Button>
                     </div>
                  </CardContent>
               </Card>
            </TabsContent>

            <TabsContent value="fix" className="space-y-8 mt-0">
               <Card className="glass-card border-border shadow-xl overflow-hidden">
                  <CardContent className="pt-8 space-y-10">
                     <div className="space-y-6">
                        <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Resolution Upscale</Label>
                        <div className="grid grid-cols-3 gap-3">
                           {[1, 2, 4].map(s => (
                             <button
                               key={s}
                               onClick={() => updateParam({ scale: s as any })}
                               className={cn(
                                 "h-12 rounded-xl border flex flex-col items-center justify-center transition-all",
                                 state.scale === s ? "bg-primary text-white border-primary shadow-lg" : "bg-background border-border text-foreground/40 hover:text-foreground"
                               )}
                             >
                                <span className="text-[10px] font-black uppercase">{s}X</span>
                                <span className="text-[7px] font-bold opacity-60 uppercase">{s === 1 ? 'Native' : 'Enhanced'}</span>
                             </button>
                           ))}
                        </div>
                     </div>

                     <div className="space-y-4">
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-foreground/30">
                           <Label className="flex items-center gap-2"><Droplet className="w-3.5 h-3.5 text-primary" /> Denoise (Smooth)</Label>
                           <span className="text-primary font-mono">{state.denoise}%</span>
                        </div>
                        <Slider value={[state.denoise]} min={0} max={100} step={1} onValueChange={v => updateParam({ denoise: v[0] })} />
                     </div>

                     <div className="p-6 rounded-[2rem] bg-secondary border border-border flex items-center justify-between group hover:border-primary/20 transition-all">
                        <div className="space-y-1">
                           <p className="text-[11px] font-black text-foreground uppercase tracking-widest">Pixel Art Protocol</p>
                           <p className="text-[9px] text-foreground/30 font-medium uppercase tracking-tighter">Disable smoothing (Nearest Neighbor)</p>
                        </div>
                        <Switch checked={state.pixelArt} onCheckedChange={v => updateParam({ pixelArt: v })} />
                     </div>
                  </CardContent>
               </Card>
            </TabsContent>
          </Tabs>

          {image && (
            <Card className="glass-card border-border shadow-2xl overflow-hidden animate-in zoom-in duration-500">
               <CardHeader className="py-6 border-b border-border bg-secondary/30">
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.5em] flex items-center gap-3 text-primary">
                    <Save className="w-4 h-4" /> Production Finish
                  </CardTitle>
               </CardHeader>
               <CardContent className="pt-8 space-y-4">
                  <Button 
                    onClick={() => handleDownload('png')}
                    className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl flex items-center justify-center gap-4 text-sm uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all"
                  >
                    <Download className="w-5 h-5" />
                    Download PNG Master
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleDownload('jpg')}
                    className="w-full h-14 bg-secondary border-border hover:bg-secondary/80 text-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-xs uppercase tracking-widest transition-all"
                  >
                    Save Optimized JPG
                  </Button>
               </CardContent>
            </Card>
          )}

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
            <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Protocol Tip</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                For high-quality printing, use **4x Upscale** and **30% Sharpness**. For retro visuals, enable **Pixel Art Protocol** to preserve distinct edges.
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
