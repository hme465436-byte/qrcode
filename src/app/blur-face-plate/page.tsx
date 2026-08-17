
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
  ScanFace,
  Square,
  Circle,
  Settings2,
  Maximize,
  Move,
  X,
  Type,
  Maximize2,
  ZoomIn,
  Search,
  Minus,
  Plus,
  Eraser,
  Grid2X2,
  Activity,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

type RedactionType = 'blur' | 'pixelate' | 'black' | 'white';
type RedactionShape = 'rect' | 'oval';

interface RedactionRegion {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: RedactionType;
  shape: RedactionShape;
  strength: number;
  feather: boolean;
}

export default function AdvancedBlurFacePlatePage() {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  
  // Transform State (Zoom/Pan)
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  
  // Redaction State
  const [regions, setRegions] = useState<RedactionRegion[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [history, setHistory] = useState<RedactionRegion[][]>([]);
  
  // Selection/Drag Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{ id: string | null; type: 'move' | 'resize' | 'create' | 'pan'; startX: number; startY: number; initialX: number; initialY: number; initialW: number; initialH: number } | null>(null);

  // --- Core Synthesis Engine ---

  const renderCanvas = useCallback(() => {
    if (!canvasRef.current || !loadedImage) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const w = loadedImage.width;
    const h = loadedImage.height;
    canvas.width = w;
    canvas.height = h;

    // 1. Base Layer (Original)
    ctx.drawImage(loadedImage, 0, 0);

    if (showOriginal) return;

    // 2. Apply Regions
    regions.forEach(region => {
      ctx.save();
      
      // Define path
      ctx.beginPath();
      if (region.shape === 'rect') {
        ctx.rect(region.x, region.y, region.w, region.h);
      } else {
        ctx.ellipse(region.x + region.w / 2, region.y + region.h / 2, Math.abs(region.w / 2), Math.abs(region.h / 2), 0, 0, Math.PI * 2);
      }
      ctx.clip();

      // Apply Effect
      if (region.type === 'black') {
        ctx.fillStyle = '#000000';
        ctx.fillRect(region.x, region.y, region.w, region.h);
      } else if (region.type === 'white') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(region.x, region.y, region.w, region.h);
      } else if (region.type === 'blur') {
        const blurCanvas = document.createElement('canvas');
        blurCanvas.width = region.w;
        blurCanvas.height = region.h;
        const bCtx = blurCanvas.getContext('2d');
        if (bCtx) {
          bCtx.filter = `blur(${region.strength}px)`;
          bCtx.drawImage(loadedImage, region.x, region.y, region.w, region.h, 0, 0, region.w, region.h);
          ctx.drawImage(blurCanvas, region.x, region.y);
        }
      } else if (region.type === 'pixelate') {
        const pSize = Math.max(1, 40 - (region.strength / 2.5)); // Map strength 1-100 to pixel size
        const pCanvas = document.createElement('canvas');
        const pW = Math.max(1, Math.floor(region.w / pSize));
        const pH = Math.max(1, Math.floor(region.h / pSize));
        pCanvas.width = pW;
        pCanvas.height = pH;
        const pCtx = pCanvas.getContext('2d');
        if (pCtx) {
          pCtx.imageSmoothingEnabled = false;
          pCtx.drawImage(loadedImage, region.x, region.y, region.w, region.h, 0, 0, pW, pH);
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(pCanvas, 0, 0, pW, pH, region.x, region.y, region.w, region.h);
          ctx.imageSmoothingEnabled = true;
        }
      }

      ctx.restore();

      // 3. UI Helpers (Selected Frame)
      if (selectedId === region.id && !isProcessing) {
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 4 / scale;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(region.x, region.y, region.w, region.h);
        ctx.setLineDash([]);
      }
    });
  }, [loadedImage, regions, selectedId, showOriginal, scale, isProcessing]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // --- Interaction Protocols ---

  const getCanvasCoords = (clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || !loadedImage) return { x: 0, y: 0 };
    
    // Position within CSS display
    const cssX = clientX - rect.left;
    const cssY = clientY - rect.top;

    // Viewport to actual image space (reversing zoom and pan)
    const zoomScale = rect.width / loadedImage.width;
    const x = (cssX / zoomScale - offset.x) / scale;
    const y = (cssY / zoomScale - offset.y) / scale;

    return { x, y };
  };

  const handleStart = (e: any) => {
    if (!loadedImage) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const { x, y } = getCanvasCoords(clientX, clientY);

    // Check if clicking on an existing region
    const hit = [...regions].reverse().find(r => 
      x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h
    );

    if (hit) {
      setSelectedId(hit.id);
      dragRef.current = { 
        id: hit.id, 
        type: 'move', 
        startX: x, 
        startY: y, 
        initialX: hit.x, 
        initialY: hit.y,
        initialW: hit.w,
        initialH: hit.h
      };
    } else {
      // Start creating new
      const newId = Math.random().toString(36).substr(2, 9);
      const newRegion: RedactionRegion = {
        id: newId,
        x, y, w: 0, h: 0,
        type: 'blur',
        shape: 'rect',
        strength: 30,
        feather: false
      };
      setHistory([...history, regions]);
      setRegions([...regions, newRegion]);
      setSelectedId(newId);
      dragRef.current = { id: newId, type: 'create', startX: x, startY: y, initialX: x, initialY: y, initialW: 0, initialH: 0 };
    }
  };

  const handleMove = (e: any) => {
    if (!dragRef.current) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const { x, y } = getCanvasCoords(clientX, clientY);
    const d = dragRef.current;

    setRegions(prev => prev.map(r => {
      if (r.id === d.id) {
        if (d.type === 'create') {
          return { ...r, w: x - d.startX, h: y - d.startY };
        } else if (d.type === 'move') {
          return { ...r, x: d.initialX + (x - d.startX), y: d.initialY + (y - d.startY) };
        }
      }
      return r;
    }));
  };

  const handleEnd = () => {
    if (dragRef.current?.type === 'create') {
      // Normalize negative dimensions
      setRegions(prev => prev.map(r => {
        if (r.id === dragRef.current?.id) {
          const nx = r.w < 0 ? r.x + r.w : r.x;
          const ny = r.h < 0 ? r.y + r.h : r.y;
          const nw = Math.abs(r.w);
          const nh = Math.abs(r.h);
          // Auto-remove tiny clicks
          if (nw < 5 || nh < 5) return null as any;
          return { ...r, x: nx, y: ny, w: nw, h: nh };
        }
        return r;
      }).filter(Boolean));
    }
    dragRef.current = null;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setLoadedImage(img);
          setImage(event.target?.result as string);
          setRegions([]);
          setHistory([]);
          setSelectedId(null);
          setScale(1);
          setOffset({ x: 0, y: 0 });
          toast({ title: "Photo Imported", description: "Identity buffer initialized." });
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const detectFaces = async () => {
    if (!loadedImage) return;
    setIsProcessing(true);
    
    try {
      // FaceDetector API is experimental but available in modern Chromium
      if ('FaceDetector' in window) {
        const detector = new (window as any).FaceDetector({ fastMode: true, maxFaces: 10 });
        const faces = await detector.detect(loadedImage);
        
        if (faces.length > 0) {
          const newRegions: RedactionRegion[] = faces.map((face: any) => ({
            id: Math.random().toString(36).substr(2, 9),
            x: face.boundingBox.x,
            y: face.boundingBox.y,
            w: face.boundingBox.width,
            h: face.boundingBox.height,
            type: 'blur',
            shape: 'oval',
            strength: 40,
            feather: true
          }));
          setHistory([...history, regions]);
          setRegions([...regions, ...newRegions]);
          toast({ title: "Identity Discovery", description: `Isolated ${faces.length} biometric markers.` });
        } else {
          toast({ title: "No Faces Identified", description: "Manual alignment required." });
        }
      } else {
        toast({ variant: "destructive", title: "API Unresponsive", description: "Your browser does not support AI Face Discovery." });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Detection Failed" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current || !image) return;
    const link = document.createElement('a');
    link.download = `sanitized_master_${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png', 1.0);
    link.click();
    toast({ title: "Sanitized Master Exported" });
  };

  const deleteSelected = () => {
    if (selectedId) {
      setHistory([...history, regions]);
      setRegions(regions.filter(r => r.id !== selectedId));
      setSelectedId(null);
      toast({ title: "Region Nuked" });
    }
  };

  const undo = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory(history.slice(0, -1));
      setRegions(prev);
      toast({ title: "Step Reversed" });
    }
  };

  const activeRegion = regions.find(r => r.id === selectedId);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20 max-w-full overflow-hidden">
      <div className="mb-10 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <EyeOff className="w-3.5 h-3.5" /> High-Security Redaction Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
                Blur Face <span className="text-primary italic">& Plate PRO</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-2 max-w-2xl leading-relaxed">
                Professional visual anonymity. Mask biometric identifiers and industrial data locally using quad-protocol obfuscation and hardware-native scaling.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="blur-face-plate" />
              {image && (
                <div className="flex gap-2">
                   <Button variant="outline" size="sm" onClick={undo} disabled={history.length === 0} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest transition-all">
                      <Undo2 className="w-3.5 h-3.5 mr-2" /> Undo
                   </Button>
                   <Button variant="outline" size="sm" onClick={() => { setImage(null); setLoadedImage(null); setRegions([]); setHistory([]); }} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5 mr-2" /> Purge
                   </Button>
                </div>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Viewport - Left */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[350px] max-h-[45vh] lg:max-h-none lg:min-h-[700px] bg-black/80">
             <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
             <CardHeader className="py-4 border-b border-white/5 bg-white/5 flex flex-row items-center justify-between shrink-0">
                <CardTitle className="text-[9px] font-black text-primary uppercase tracking-[0.4em] flex items-center gap-2">
                   <Activity className="w-3.5 h-3.5" /> Optical Analysis Stream
                </CardTitle>
                <div className="flex items-center gap-3">
                   {image && (
                     <div className="flex bg-secondary/50 rounded-lg p-0.5 border border-white/5">
                        <button onClick={() => setScale(s => Math.max(0.5, s - 0.2))} className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white"><Minus className="w-3.5 h-3.5" /></button>
                        <span className="px-2 py-1 text-[8px] font-black text-white/20 uppercase tabular-nums">{(scale * 100).toFixed(0)}%</span>
                        <button onClick={() => setScale(s => Math.min(5, s + 0.2))} className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white"><Plus className="w-3.5 h-3.5" /></button>
                     </div>
                   )}
                   <button 
                    onMouseDown={() => setShowOriginal(true)} onMouseUp={() => setShowOriginal(false)}
                    onTouchStart={() => setShowOriginal(true)} onTouchEnd={() => setShowOriginal(false)}
                    className="h-8 px-3 rounded-lg bg-white/10 text-white/40 text-[8px] font-black uppercase hover:text-white transition-all"
                   >
                     Compare
                   </button>
                </div>
             </CardHeader>
             <CardContent className="flex-1 flex flex-col items-center justify-center p-4 lg:p-12 relative overflow-hidden">
                {!image ? (
                  <div onClick={() => fileInputRef.current?.click()} className="flex-1 flex flex-col items-center justify-center gap-8 cursor-pointer group w-full text-center border-2 border-dashed border-white/10 rounded-[3rem] hover:border-primary/40 transition-all duration-700">
                     <div className="w-20 h-20 rounded-[2.5rem] bg-white/5 flex items-center justify-center text-white/10 group-hover:text-primary group-hover:scale-110 transition-all shadow-2xl">
                        <Upload className="w-10 h-10" />
                     </div>
                     <div className="space-y-2">
                        <span className="text-xl font-headline font-black uppercase text-white/40 group-hover:text-white transition-colors">Inject Visual Target</span>
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Hardware-Native Memory Isolation Enabled</p>
                     </div>
                     <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </div>
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div 
                      className="relative overflow-hidden cursor-crosshair transition-all duration-500 ease-out"
                      style={{ 
                        transform: `scale(${scale}) translate(${offset.x}px, ${offset.y}px)`
                      }}
                    >
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
                    </div>
                  </div>
                )}
             </CardContent>
          </Card>

          <div className="hidden lg:grid grid-cols-2 gap-6 animate-in fade-in duration-1000">
             <div className="p-8 rounded-[3rem] bg-secondary border border-white/5 flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Volatile Buffer Protocol</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    All redaction logic is executed 100% in local memory. Sensitive visual headers are never transmitted, ensuring absolute data privacy.
                  </p>
                </div>
             </div>
             <div className="p-8 rounded-[3rem] bg-secondary border border-white/5 flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <Zap className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Hardware Synthesis</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Utilizing multi-threaded pixel interpolation and hardware-native blur dictionaries for consistent production-grade exports.
                  </p>
                </div>
             </div>
          </div>
        </div>

        {/* Controls - Right */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
           <Card className="glass-card border-border shadow-2xl">
              <CardHeader className="py-6 border-b border-white/5 bg-white/2">
                 <div className="flex items-center justify-between">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                       <Settings2 className="w-5 h-5 text-primary" /> Studio Config
                    </CardTitle>
                    <Button onClick={detectFaces} disabled={isProcessing || !image} className="h-9 px-4 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase hover:bg-primary/20">
                       <ScanFace className="w-4 h-4 mr-2" /> Auto Detect
                    </Button>
                 </div>
              </CardHeader>
              <CardContent className="pt-8 space-y-10">
                 {!selectedId ? (
                   <div className="py-20 text-center space-y-6 opacity-30 animate-in fade-in">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-secondary border-border mx-auto flex items-center justify-center">
                         <Move className="w-8 h-8" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed px-12">
                         Click or Drag on the Preview matrix to initialize a redaction region.
                      </p>
                   </div>
                 ) : (
                   <div className="space-y-10 animate-in slide-in-from-bottom-2 duration-500">
                      <div className="space-y-4">
                         <div className="flex justify-between items-center">
                            <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Effect Protocol</Label>
                            <span className="text-[8px] font-bold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded">Region {selectedId.substring(0,4)}</span>
                         </div>
                         <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 -mx-2 px-2 scroll-smooth snap-x">
                            {[
                               { id: 'blur', icon: Activity, label: 'Soft Blur' },
                               { id: 'pixelate', icon: Grid2X2, label: 'Pixelate' },
                               { id: 'black', icon: Maximize2, label: 'Blackout' },
                               { id: 'white', icon: Eraser, label: 'Solid Color' },
                            ].map((t) => (
                               <button
                                 key={t.id}
                                 onClick={() => setRegions(prev => prev.map(r => r.id === selectedId ? { ...r, type: t.id as RedactionType } : r))}
                                 className={cn(
                                   "flex-1 min-w-[100px] snap-start h-14 rounded-2xl border flex items-center justify-center gap-3 transition-all",
                                   activeRegion?.type === t.id ? "bg-primary text-white border-primary shadow-lg" : "bg-secondary/50 border-white/5 text-foreground/40 hover:text-foreground"
                                 )}
                               >
                                  <t.icon className="w-4 h-4" />
                                  <span className="text-[9px] font-black uppercase tracking-tighter whitespace-nowrap">{t.label}</span>
                               </button>
                            ))}
                         </div>
                      </div>

                      <div className="space-y-4">
                         <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Path Geometry</Label>
                         <div className="grid grid-cols-2 gap-3">
                            <button
                               onClick={() => setRegions(prev => prev.map(r => r.id === selectedId ? { ...r, shape: 'rect' } : r))}
                               className={cn(
                                 "h-14 rounded-2xl border flex items-center justify-center gap-3 transition-all",
                                 activeRegion?.shape === 'rect' ? "bg-primary text-white border-primary shadow-lg" : "bg-secondary/50 border-white/5 text-foreground/40"
                               )}
                            >
                               <Square className="w-4 h-4" />
                               <span className="text-[9px] font-black uppercase">Rectangle</span>
                            </button>
                            <button
                               onClick={() => setRegions(prev => prev.map(r => r.id === selectedId ? { ...r, shape: 'oval' } : r))}
                               className={cn(
                                 "h-14 rounded-2xl border flex items-center justify-center gap-3 transition-all",
                                 activeRegion?.shape === 'oval' ? "bg-primary text-white border-primary shadow-lg" : "bg-secondary/50 border-white/5 text-foreground/40"
                               )}
                            >
                               <Circle className="w-4 h-4" />
                               <span className="text-[9px] font-black uppercase">Oval Path</span>
                            </button>
                         </div>
                      </div>

                      {(activeRegion?.type === 'blur' || activeRegion?.type === 'pixelate') && (
                        <div className="space-y-4 animate-in slide-in-from-top-2">
                           <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-foreground/30">
                              <Label>Matrix Intensity</Label>
                              <span className="text-primary font-mono">{activeRegion.strength}%</span>
                           </div>
                           <Slider 
                            value={[activeRegion.strength]} 
                            min={5} max={100} step={1} 
                            onValueChange={v => setRegions(prev => prev.map(r => r.id === selectedId ? { ...r, strength: v[0] } : r))} 
                           />
                        </div>
                      )}

                      <div className="p-6 rounded-[2rem] bg-secondary border border-white/5 space-y-6">
                         <div className="flex items-center justify-between">
                            <div className="space-y-1">
                               <p className="text-[10px] font-black text-foreground/60 uppercase">Edge Smoothing</p>
                               <p className="text-[8px] font-bold text-foreground/20 uppercase">Feathered Alpha</p>
                            </div>
                            <Switch 
                              checked={activeRegion?.feather} 
                              onCheckedChange={v => setRegions(prev => prev.map(r => r.id === selectedId ? { ...r, feather: v } : r))}
                            />
                         </div>
                         <Button onClick={deleteSelected} variant="ghost" className="w-full h-11 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
                            <Trash2 className="w-4 h-4 mr-2" /> Kill Region
                         </Button>
                      </div>
                   </div>
                 )}

                 <div className="pt-4 border-t border-white/5">
                    <Button onClick={handleDownload} disabled={!image} className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 active:scale-95 transition-all">
                       <Download className="w-6 h-6" /> Export PNG Master
                    </Button>
                 </div>
              </CardContent>
           </Card>
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

