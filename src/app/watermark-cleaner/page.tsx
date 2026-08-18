"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Upload, 
  Download, 
  Trash2, 
  RotateCcw, 
  Undo2, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  Loader2, 
  Eraser,
  Wand2,
  Settings2,
  Maximize,
  X,
  Type,
  Maximize2,
  Activity,
  ShieldCheck,
  Zap,
  MousePointer2,
  SlidersHorizontal,
  Plus,
  Minus,
  Sparkles,
  RefreshCcw,
  Search,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

/**
 * WATERMARK CLEANER STUDIO
 * 100% Local Inpainting & Text Removal
 */

export default function WatermarkCleanerPage() {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  
  // Studio Workspace State
  const [brushSize, setBrushSize] = useState(30);
  const [mode, setMode] = useState<'brush' | 'auto'>('brush');
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState<ImageData[]>([]);
  
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDrawing = useRef(false);

  const renderBase = useCallback(() => {
    if (!canvasRef.current || !loadedImage) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = loadedImage.width;
    canvas.height = loadedImage.height;
    ctx.drawImage(loadedImage, 0, 0);

    if (!maskCanvasRef.current) {
      const mask = document.createElement('canvas');
      mask.width = canvas.width;
      mask.height = canvas.height;
      maskCanvasRef.current = mask;
    } else {
      maskCanvasRef.current.width = canvas.width;
      maskCanvasRef.current.height = canvas.height;
    }
  }, [loadedImage]);

  useEffect(() => {
    renderBase();
  }, [renderBase]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          setLoadedImage(img);
          setImage(event.target?.result as string);
          setHistory([]);
          setScale(1);
          setOffset({ x: 0, y: 0 });
          setIsProcessing(false);
          toast({ title: "Photo Imported", description: "Studio ready for pixel sanitization." });
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const getCanvasCoords = (clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || !loadedImage) return { x: 0, y: 0 };
    const cssX = clientX - rect.left;
    const cssY = clientY - rect.top;
    const x = (cssX / rect.width) * canvasRef.current!.width;
    const y = (cssY / rect.height) * canvasRef.current!.height;
    return { x, y };
  };

  const handleStart = (e: any) => {
    if (!image || mode !== 'brush') return;
    isDrawing.current = true;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const { x, y } = getCanvasCoords(clientX, clientY);
    drawMask(x, y);
  };

  const handleMove = (e: any) => {
    if (!isDrawing.current || mode !== 'brush') return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const { x, y } = getCanvasCoords(clientX, clientY);
    drawMask(x, y);
  };

  const handleEnd = () => {
    isDrawing.current = false;
  };

  const drawMask = (x: number, y: number) => {
    const mCtx = maskCanvasRef.current?.getContext('2d');
    const vCtx = canvasRef.current?.getContext('2d');
    if (!mCtx || !vCtx) return;

    mCtx.fillStyle = 'red';
    mCtx.beginPath();
    mCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    mCtx.fill();

    // Visual overlay on main canvas
    vCtx.save();
    vCtx.globalAlpha = 0.4;
    vCtx.fillStyle = '#ef4444';
    vCtx.beginPath();
    vCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    vCtx.fill();
    vCtx.restore();
  };

  const detectTextLikeAreas = () => {
    if (!canvasRef.current || !maskCanvasRef.current) return;
    setIsProcessing(true);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const mCtx = maskCanvasRef.current.getContext('2d');
    if (!ctx || !mCtx) return;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    
    mCtx.clearRect(0, 0, canvas.width, canvas.height);
    mCtx.fillStyle = 'red';

    // Simple High-Contrast Character Detection Matrix
    const sensitivity = 40;
    for (let y = 1; y < canvas.height - 1; y += 2) {
      for (let x = 1; x < canvas.width - 1; x += 2) {
        const idx = (y * canvas.width + x) * 4;
        const diff = Math.abs(data[idx] - data[idx + 4]) + Math.abs(data[idx] - data[idx + canvas.width * 4]);
        if (diff > sensitivity) {
          mCtx.fillRect(x - 5, y - 5, 10, 10);
        }
      }
    }

    // Refresh overlay
    ctx.drawImage(loadedImage!, 0, 0);
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.drawImage(maskCanvasRef.current, 0, 0);
    ctx.restore();

    setIsProcessing(false);
    toast({ title: "Auto-Scan Complete", description: "Identified high-contrast matrices." });
  };

  const executeRemoval = async () => {
    if (!canvasRef.current || !maskCanvasRef.current || !loadedImage) return;
    setIsProcessing(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const mCtx = maskCanvasRef.current.getContext('2d', { willReadFrequently: true });
    if (!ctx || !mCtx) return;

    // Save current state to history
    setHistory(prev => [...prev.slice(-9), ctx.getImageData(0, 0, canvas.width, canvas.height)]);

    const width = canvas.width;
    const height = canvas.height;
    
    // Core Pixel Diffusion Matrix
    // We execute 5 passes of local inpainting
    for (let pass = 0; pass < 5; pass++) {
       const imgData = ctx.getImageData(0, 0, width, height);
       const maskData = mCtx.getImageData(0, 0, width, height);
       const pixels = imgData.data;
       const mask = maskData.data;
       const nextPixels = new Uint8ClampedArray(pixels);

       for (let y = 1; y < height - 1; y++) {
         for (let x = 1; x < width - 1; x++) {
           const i = (y * width + x) * 4;
           if (mask[i] > 0) { // Masked pixel
              // Sample neighbors
              let r = 0, g = 0, b = 0, count = 0;
              const neighbors = [
                ((y-1) * width + (x-1)) * 4, ((y-1) * width + x) * 4, ((y-1) * width + (x+1)) * 4,
                (y * width + (x-1)) * 4, (y * width + (x+1)) * 4,
                ((y+1) * width + (x-1)) * 4, ((y+1) * width + x) * 4, ((y+1) * width + (x+1)) * 4
              ];

              for (const n of neighbors) {
                if (mask[n] === 0) { // Valid neighbor found
                  r += pixels[n]; g += pixels[n+1]; b += pixels[n+2];
                  count++;
                }
              }

              if (count > 0) {
                nextPixels[i] = r / count;
                nextPixels[i+1] = g / count;
                nextPixels[i+2] = b / count;
                mask[i] = 0; // Mark as resolved for next pass
              }
           }
         }
       }
       ctx.putImageData(imgData, 0, 0);
       mCtx.putImageData(maskData, 0, 0);
       
       // Yield to main thread
       await new Promise(r => setTimeout(r, 0));
    }

    // Final soft-blur on result
    ctx.globalAlpha = 0.2;
    ctx.filter = 'blur(2px)';
    ctx.drawImage(canvas, 0, 0);
    ctx.filter = 'none';
    ctx.globalAlpha = 1.0;

    setIsProcessing(false);
    toast({ title: "Pixels Sanitized", description: "Inpainting protocol finalized." });
  };

  const undo = () => {
    if (history.length > 0) {
      const last = history[history.length - 1];
      canvasRef.current?.getContext('2d')?.putImageData(last, 0, 0);
      setHistory(prev => prev.slice(0, -1));
      maskCanvasRef.current?.getContext('2d')?.clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
      toast({ title: "Undo" });
    }
  };

  const handleDownload = (format: 'png' | 'jpg') => {
    if (!canvasRef.current || !image) return;
    const link = document.createElement('a');
    link.download = `sanitized_${Date.now()}.${format}`;
    link.href = canvasRef.current.toDataURL(`image/${format}`, 0.95);
    link.click();
    toast({ title: "Master Exported" });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20 max-w-full overflow-hidden">
      <div className="mb-10 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Eraser className="w-3.5 h-3.5" /> Identity Protection
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-white uppercase tracking-tight">
                Watermark <span className="text-primary italic">& Text Cleaner</span>
              </h1>
              <p className="text-white/40 text-xs md:text-base font-medium mt-2 max-w-2xl leading-relaxed">
                Professional restoration engine. Remove unwanted text, watermarks, and artifacts locally using pixel diffusion re-matricing.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="watermark-cleaner" />
              {image && (
                <div className="flex gap-2">
                   <Button variant="outline" size="sm" onClick={undo} disabled={history.length === 0} className="h-10 px-4 rounded-xl border-white/10 bg-secondary text-[8px] font-black uppercase tracking-widest">
                      <Undo2 className="w-3.5 h-3.5 mr-2" /> Undo
                   </Button>
                   <Button variant="outline" size="sm" onClick={() => { setImage(null); setLoadedImage(null); setHistory([]); }} className="h-10 px-4 rounded-xl border-white/10 bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                      <Trash2 className="w-3.5 h-3.5 mr-2" /> Reset
                   </Button>
                </div>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Workspace - Preview */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <Card className="glass-card border-white/5 shadow-2xl overflow-hidden relative flex flex-col min-h-[400px] max-h-[50vh] lg:max-h-none lg:min-h-[750px] bg-black/80">
             <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
             <CardHeader className="py-4 border-b border-white/5 bg-white/5 flex flex-row items-center justify-between shrink-0">
                <CardTitle className="text-[9px] font-black text-primary uppercase tracking-[0.4em] flex items-center gap-2">
                   <Activity className="w-3.5 h-3.5" /> Visual Studio Matrix
                </CardTitle>
                {image && (
                   <div className="flex items-center gap-3">
                      <div className="flex bg-secondary/50 rounded-lg p-0.5 border border-white/5">
                        <button onClick={() => setScale(s => Math.max(0.5, s - 0.2))} className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white"><Minus className="w-3.5 h-3.5" /></button>
                        <span className="px-2 py-1 text-[8px] font-black text-white/20 uppercase">{(scale * 100).toFixed(0)}%</span>
                        <button onClick={() => setScale(s => Math.min(5, s + 0.2))} className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white"><Plus className="w-3.5 h-3.5" /></button>
                      </div>
                      <button 
                        onMouseDown={() => setShowOriginal(true)} onMouseUp={() => setShowOriginal(false)}
                        onTouchStart={() => setShowOriginal(true)} onTouchEnd={() => setShowOriginal(false)}
                        className="h-8 px-3 rounded-lg bg-white/10 text-white/40 text-[8px] font-black uppercase hover:text-white transition-all"
                      >
                        Compare
                      </button>
                   </div>
                )}
             </CardHeader>
             <CardContent className="flex-1 flex flex-col items-center justify-center p-4 lg:p-12 relative overflow-hidden">
                {!image ? (
                  <div onClick={() => fileInputRef.current?.click()} className="flex-1 flex flex-col items-center justify-center gap-8 cursor-pointer group w-full text-center border-2 border-dashed border-white/10 rounded-[3rem] hover:border-primary/40 transition-all">
                     <div className="w-20 h-20 rounded-[2.5rem] bg-white/5 flex items-center justify-center text-white/10 group-hover:text-primary group-hover:scale-110 transition-all">
                        <Upload className="w-10 h-10" />
                     </div>
                     <span className="text-xl font-headline font-black uppercase text-white/40 group-hover:text-white">Import Photo</span>
                     <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </div>
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div 
                      className="relative overflow-hidden cursor-crosshair transition-all duration-500 ease-out"
                      style={{ transform: `scale(${scale}) translate(${offset.x}px, ${offset.y}px)` }}
                    >
                       {showOriginal && (
                         <div className="absolute inset-0 z-40 bg-black">
                            <img src={image} className="w-full h-full object-contain" alt="Original" />
                         </div>
                       )}
                       <canvas 
                        ref={canvasRef} 
                        className={cn(
                          "max-w-full max-h-full object-contain rounded-lg shadow-2xl ring-1 ring-white/10",
                          isProcessing && "opacity-50 blur-sm"
                        )}
                        onMouseDown={handleStart}
                        onMouseMove={handleMove}
                        onMouseUp={handleEnd}
                        onMouseLeave={handleEnd}
                        onTouchStart={handleStart}
                        onTouchMove={handleMove}
                        onTouchEnd={handleEnd}
                       />
                       {/* Brush Cursor Preview */}
                       {mode === 'brush' && !isProcessing && (
                         <div className="pointer-events-none absolute w-[var(--bs)] h-[var(--bs)] border border-white/50 rounded-full shadow-2xl z-50 mix-blend-difference" style={{ '--bs': `${brushSize}px` } as any} />
                       )}
                    </div>
                  </div>
                )}
             </CardContent>
          </Card>
          
          <div className="hidden lg:grid grid-cols-2 gap-6">
             <div className="p-8 rounded-[3rem] bg-secondary border border-white/5 flex items-start gap-6 group hover:bg-secondary/80 transition-all shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Privacy Sovereign</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Pixel re-matricing occurs 100% locally in your browser memory. Your imagery never touches remote servers.
                  </p>
                </div>
             </div>
             <div className="p-8 rounded-[3rem] bg-secondary border border-white/5 flex items-start gap-6 group hover:bg-secondary/80 transition-all shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <Zap className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">WASM Inpainting</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Utilizing a multi-pass diffusion matrix to realistically fill masked areas from surrounding linguistic textures.
                  </p>
                </div>
             </div>
          </div>
        </div>

        {/* Controls Column */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
           <Card className="glass-card border-border shadow-2xl">
              <CardHeader className="py-6 border-b border-white/5 bg-white/2">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Settings2 className="w-5 h-5 text-primary" /> Options
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-8">
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Masking Protocol</Label>
                    <div className="grid grid-cols-2 bg-secondary/50 p-1.5 rounded-2xl border border-white/5 h-14">
                       <button onClick={() => setMode('brush')} className={cn("flex-1 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all", mode === 'brush' ? "bg-primary text-white" : "text-foreground/40 hover:text-foreground")}>
                          <Eraser className="w-4 h-4" /> Brush
                       </button>
                       <button onClick={() => setMode('auto')} className={cn("flex-1 rounded-xl flex items-center justify-center gap-2 text-[10px) font-black uppercase transition-all", mode === 'auto' ? "bg-primary text-white" : "text-foreground/40 hover:text-foreground")}>
                          <Wand2 className="w-4 h-4" /> Auto Text
                       </button>
                    </div>
                 </div>

                 {mode === 'brush' ? (
                   <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-foreground/30">
                         <Label>Brush Scale</Label>
                         <span className="text-primary font-mono">{brushSize}px</span>
                      </div>
                      <Slider value={[brushSize]} min={5} max={150} step={1} onValueChange={v => setBrushSize(v[0])} />
                      <div className="grid grid-cols-4 gap-2">
                         {[10, 30, 60, 120].map(s => (
                           <button key={s} onClick={() => setBrushSize(s)} className={cn("h-8 rounded-lg border text-[8px] font-black uppercase", brushSize === s ? "bg-primary text-white border-primary" : "bg-white/5 border-white/5 text-white/40")}>{s}px</button>
                         ))}
                      </div>
                   </div>
                 ) : (
                   <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                      <Button onClick={detectTextLikeAreas} disabled={isProcessing || !image} variant="outline" className="w-full h-14 bg-primary/10 border-primary/20 text-primary font-black uppercase tracking-widest text-[9px] rounded-2xl">
                         <Search className="w-4 h-4 mr-2" /> Detect Text Masks
                      </Button>
                      <p className="text-[9px] text-foreground/30 font-bold uppercase text-center">Identifies high-contrast character edges.</p>
                   </div>
                 )}

                 <div className="p-8 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 space-y-6 relative overflow-hidden group/exec">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl opacity-0 group-hover/exec:opacity-100 transition-opacity" />
                    <div className="space-y-1 relative z-10">
                       <h4 className="text-[11px] font-black uppercase text-indigo-400">Diffusion Engine</h4>
                       <p className="text-[9px] text-foreground/40 font-bold uppercase">Multi-pass re-matricing protocol</p>
                    </div>
                    <Button 
                      onClick={executeRemoval}
                      disabled={isProcessing || !image}
                      className="w-full h-16 bg-indigo-500 hover:bg-indigo-600 text-white font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-indigo-500/30 active:scale-95 transition-all relative z-10"
                    >
                       {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                       Execute Remove
                    </Button>
                 </div>

                 <div className="pt-4 grid grid-cols-2 gap-3">
                    <Button onClick={() => handleDownload('png')} disabled={!image} className="h-14 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl active:scale-95">
                       <Download className="w-4 h-4 mr-2" /> PNG
                    </Button>
                    <Button onClick={() => handleDownload('jpg')} disabled={!image} variant="outline" className="h-14 border-white/10 bg-white/5 text-white/40 font-black rounded-2xl text-[10px] uppercase tracking-widest">
                       JPG
                    </Button>
                 </div>
              </CardContent>
           </Card>

           <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-4">
              <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-[10px] text-foreground/40 font-bold uppercase leading-relaxed">
                For best results, zoom in and paint precisely over characters. Use "Auto Text" to identify dispersed watermarks before executing the diffusion matrix.
              </p>
           </div>
        </div>
      </div>
      
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

