
"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Eraser, 
  Upload, 
  Download, 
  Trash2, 
  RotateCcw, 
  Undo2, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  Loader2, 
  ScanFace,
  Square,
  Pencil,
  Info,
  ShieldCheck,
  Zap,
  Activity,
  Maximize2,
  Settings2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

type ToolMode = 'box' | 'brush';

interface BlurRegion {
  id: string;
  type: ToolMode;
  x: number;
  y: number;
  w?: number;
  h?: number;
  points?: { x: number, y: number }[];
  size: number;
}

export default function BlurFacePlatePage() {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<ToolMode>('box');
  const [blurStrength, setBlurStrength] = useState(40);
  const [brushSize, setBrushSize] = useState(40);
  
  // Mask State
  const [regions, setRegions] = useState<BlurRegion[]>([]);
  const [history, setHistory] = useState<BlurRegion[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Interaction Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDrawing = useRef(false);
  const currentRegion = useRef<BlurRegion | null>(null);

  // Sync History
  const commitToHistory = (newRegions: BlurRegion[]) => {
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(newRegions);
    if (nextHistory.length > 20) nextHistory.shift();
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
    setRegions(newRegions);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setRegions(prev);
      toast({ title: "Action Reversed" });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ variant: "destructive", title: "Heavy Payload", description: "Standard limit is 10MB." });
        return;
      }
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          setLoadedImage(img);
          setImage(event.target?.result as string);
          setRegions([]);
          setHistory([[]]);
          setHistoryIndex(0);
          setIsProcessing(false);
          toast({ title: "Visual Imported", description: "Ready for redaction." });
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const renderCanvas = useCallback(() => {
    if (!canvasRef.current || !loadedImage) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const w = loadedImage.width;
    const h = loadedImage.height;
    canvas.width = w;
    canvas.height = h;

    // 1. Draw Original Image
    ctx.drawImage(loadedImage, 0, 0);

    // 2. Create Blur Layer
    const blurCanvas = document.createElement('canvas');
    blurCanvas.width = w;
    blurCanvas.height = h;
    const bCtx = blurCanvas.getContext('2d');
    if (!bCtx) return;

    // We use stack blur approximation via CSS filters for speed
    bCtx.filter = `blur(${blurStrength}px)`;
    bCtx.drawImage(loadedImage, 0, 0);

    // 3. Apply Mask Regions
    regions.forEach(region => {
      ctx.save();
      ctx.beginPath();
      if (region.type === 'box' && region.w && region.h) {
        ctx.rect(region.x, region.y, region.w, region.h);
      } else if (region.type === 'brush' && region.points) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = region.size;
        ctx.moveTo(region.points[0].x, region.points[0].y);
        region.points.forEach(p => ctx.lineTo(p.x, p.y));
      }
      
      // Use the region as a clipping path to reveal the blurred version
      ctx.clip();
      ctx.drawImage(blurCanvas, 0, 0);
      ctx.restore();
    });
  }, [loadedImage, regions, blurStrength]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const handleStart = (clientX: number, clientY: number) => {
    if (!canvasRef.current || !loadedImage) return;
    isDrawing.current = true;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const scale = loadedImage.width / rect.width;
    const x = (clientX - rect.left) * scale;
    const y = (clientY - rect.top) * scale;

    if (mode === 'box') {
      currentRegion.current = { id: Date.now().toString(), type: 'box', x, y, w: 0, h: 0, size: 0 };
    } else {
      currentRegion.current = { id: Date.now().toString(), type: 'brush', x, y, points: [{ x, y }], size: brushSize * scale };
    }
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDrawing.current || !currentRegion.current || !canvasRef.current || !loadedImage) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const scale = loadedImage.width / rect.width;
    const x = (clientX - rect.left) * scale;
    const y = (clientY - rect.top) * scale;

    if (mode === 'box') {
      currentRegion.current.w = x - currentRegion.current.x;
      currentRegion.current.h = y - currentRegion.current.y;
    } else {
      currentRegion.current.points?.push({ x, y });
    }
    
    // Live update preview by injecting temporary region
    setRegions([...regions, currentRegion.current]);
  };

  const handleEnd = () => {
    if (isDrawing.current && currentRegion.current) {
      isDrawing.current = false;
      commitToHistory([...regions, currentRegion.current]);
      currentRegion.current = null;
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current || !image) return;
    const link = document.createElement('a');
    link.download = `redacted_${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png', 1.0);
    link.click();
    toast({ title: "Master Exported", description: "Sanitized photo saved." });
  };

  const handleClear = () => {
    setRegions([]);
    setHistory([[]]);
    setHistoryIndex(0);
    toast({ title: "Cleared" });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20 max-w-full">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <EyeOff className="w-3.5 h-3.5" /> High-Security Redaction
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
                Blur Face <span className="text-primary italic">& Plate Studio</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional visual anonymity. Mask faces, number plates, and sensitive documents locally using high-fidelity spatial blurring.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="blur-face-plate" />
              {image && (
                <Button variant="outline" size="sm" onClick={handleClear} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive">
                   <Trash2 className="w-3.5 h-3.5 mr-2" /> Reset
                </Button>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Workspace - Preview */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[350px] max-h-[45vh] lg:max-h-none lg:min-h-[700px] bg-black/60">
             <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
             <CardHeader className="py-4 border-b border-white/5 bg-white/5 flex flex-row items-center justify-between shrink-0">
                <CardTitle className="text-[9px] font-black text-primary uppercase tracking-[0.4em] flex items-center gap-2">
                   <Activity className="w-3.5 h-3.5" /> Monitor
                </CardTitle>
                {image && (
                   <div className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-[7px] font-black text-primary uppercase">
                      Local Matrix Secure
                   </div>
                )}
             </CardHeader>
             <CardContent className="flex-1 flex flex-col items-center justify-center p-4 lg:p-12 relative overflow-hidden">
                {!image ? (
                  <div onClick={() => fileInputRef.current?.click()} className="flex-1 flex flex-col items-center justify-center gap-6 cursor-pointer group w-full text-center border-2 border-dashed border-white/10 rounded-[2.5rem] hover:border-primary/40 transition-all">
                     <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center text-white/10 group-hover:text-primary group-hover:scale-110 transition-all shadow-xl">
                        <Upload className="w-8 h-8" />
                     </div>
                     <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Select Photo</span>
                     <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </div>
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center group/canvas">
                     <canvas 
                      ref={canvasRef} 
                      className={cn(
                        "max-w-full max-h-full object-contain rounded-lg shadow-2xl ring-1 ring-white/10 transition-all",
                        mode === 'brush' ? 'cursor-crosshair' : 'cursor-nwse-resize'
                      )}
                      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
                      onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
                      onMouseUp={handleEnd}
                      onMouseLeave={handleEnd}
                      onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
                      onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
                      onTouchEnd={handleEnd}
                     />
                  </div>
                )}
             </CardContent>
          </Card>

          {/* Tips Matrix */}
          <div className="hidden lg:grid grid-cols-2 gap-6 animate-in fade-in duration-1000">
             <div className="p-6 rounded-[2rem] bg-secondary border border-white/5 flex items-start gap-4 group hover:border-primary/20 transition-all">
                <ShieldCheck className="w-5 h-5 text-primary/40 group-hover:text-primary" />
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black uppercase text-foreground tracking-widest">Privacy Absolute</h4>
                  <p className="text-[10px] text-foreground/40 leading-relaxed font-medium">100% local processing. Your photo never leaves your hardware.</p>
                </div>
             </div>
             <div className="p-6 rounded-[2rem] bg-secondary border border-white/5 flex items-start gap-4 group hover:border-primary/20 transition-all">
                <Zap className="w-5 h-5 text-primary/40 group-hover:text-primary" />
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black uppercase text-foreground tracking-widest">High Fidelity</h4>
                  <p className="text-[10px] text-foreground/40 leading-relaxed font-medium">Utilizing GPU-accelerated filters for definitive spatial redaction.</p>
                </div>
             </div>
          </div>
        </div>

        {/* Controls Column */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
           <Card className="glass-card border-border shadow-2xl">
              <CardHeader className="py-6 border-b border-white/5 bg-white/2">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Settings2 className="w-5 h-5 text-primary" /> Tools
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-10">
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Mode</Label>
                    <div className="grid grid-cols-2 bg-secondary/50 p-1.5 rounded-2xl border border-white/5 h-14">
                       <button onClick={() => setMode('box')} className={cn("flex-1 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all", mode === 'box' ? "bg-primary text-white" : "text-foreground/40 hover:text-foreground")}>
                          <Square className="w-4 h-4" /> Box
                       </button>
                       <button onClick={() => setMode('brush')} className={cn("flex-1 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all", mode === 'brush' ? "bg-primary text-white" : "text-foreground/40 hover:text-foreground")}>
                          <Pencil className="w-4 h-4" /> Brush
                       </button>
                    </div>
                 </div>

                 <div className="space-y-8">
                    <div className="space-y-4">
                       <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-foreground/30">
                          <Label>Blur Strength</Label>
                          <span className="text-primary font-mono">{blurStrength}%</span>
                       </div>
                       <Slider value={[blurStrength]} min={5} max={100} step={1} onValueChange={v => setBlurStrength(v[0])} />
                    </div>

                    {mode === 'brush' && (
                      <div className="space-y-4 animate-in slide-in-from-top-2">
                         <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-foreground/30">
                            <Label>Brush Size</Label>
                            <span className="text-primary font-mono">{brushSize}px</span>
                         </div>
                         <Slider value={[brushSize]} min={10} max={150} step={1} onValueChange={v => setBrushSize(v[0])} />
                      </div>
                    )}
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" onClick={undo} disabled={historyIndex <= 0} className="h-12 border-border bg-secondary text-[9px] font-black uppercase tracking-widest hover:text-primary gap-3">
                       <Undo2 className="w-4 h-4" /> Undo
                    </Button>
                    <Button variant="outline" onClick={handleClear} className="h-12 border-border bg-secondary text-[9px] font-black uppercase tracking-widest hover:text-destructive gap-3">
                       <RotateCcw className="w-4 h-4" /> Clear
                    </Button>
                 </div>

                 <div className="pt-4 border-t border-white/5">
                    <Button onClick={handleDownload} disabled={!image} className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 active:scale-95 transition-all">
                       <Download className="w-6 h-6" /> Download
                    </Button>
                 </div>
              </CardContent>
           </Card>

           <div className="grid grid-cols-1 gap-6">
              <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Privacy Absolute</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Redaction occurs entirely in your browser memory. Visual masks are synthesized and never touch remote servers.
                  </p>
                </div>
             </div>
           </div>
        </div>
      </div>
      
      {/* MOBILE STICKY ACTIONS */}
      {image && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0a0a0c]/80 backdrop-blur-3xl border-t border-white/10 z-[100] lg:hidden flex gap-3 animate-in slide-in-from-bottom-full duration-500">
          <Button onClick={handleDownload} className="flex-1 h-14 bg-primary text-white font-black rounded-2xl flex items-center justify-center gap-3 text-xs uppercase tracking-widest shadow-2xl">
             <Download className="w-4 h-4" /> Download
          </Button>
        </div>
      )}

      <style jsx global>{`
        .bg-checkered {
          background-image: linear-gradient(45deg, #111113 25%, transparent 25%), 
                            linear-gradient(-45deg, #111113 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #111113 75%), 
                            linear-gradient(-45deg, transparent 75%, #111113 75%);
          background-size: 20px 20px;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
