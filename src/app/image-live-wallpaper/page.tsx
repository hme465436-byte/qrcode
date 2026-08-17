"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  ImageIcon, 
  MonitorPlay, 
  Upload, 
  Download, 
  Trash2, 
  Sparkles, 
  Loader2, 
  CheckCircle2,
  Settings2,
  Activity,
  Smartphone,
  Monitor,
  Maximize2,
  Film,
  Zap,
  Info,
  Maximize,
  ArrowRightLeft,
  Play,
  Square,
  History,
  Scaling,
  MoveHorizontal,
  LayoutGrid,
  ShieldCheck,
  Target,
  Wind,
  MousePointer2,
  Sun,
  Eye,
  Crosshair,
  RotateCw,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type MotionStyle = 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right' | 'pan-up' | 'pan-down' | 'ken-burns' | 'drift' | 'pulse' | 'rotate-slow';
type DevicePreset = { id: string; label: string; width: number; height: number; icon: any };

const DEVICE_PRESETS: DevicePreset[] = [
  { id: 'windows-hd', label: 'Windows HD (16:9)', width: 1920, height: 1080, icon: Monitor },
  { id: 'ultrawide', label: 'Ultrawide (21:9)', width: 2560, height: 1080, icon: Monitor },
  { id: 'iphone', label: 'iPhone Pro (19.5:9)', width: 1179, height: 2556, icon: Smartphone },
  { id: 'phone-std', label: 'Phone Standard (9:16)', width: 1080, height: 1920, icon: Smartphone },
  { id: 'tablet', label: 'Tablet (4:3)', width: 2048, height: 1536, icon: LayoutGrid },
  { id: 'square', label: 'Square Matrix (1:1)', width: 1080, height: 1080, icon: Square },
];

export default function AdvancedImageLiveWallpaperPage() {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Settings
  const [motionStyle, setMotionStyle] = useState<MotionStyle>('ken-burns');
  const [duration, setDuration] = useState(8);
  const [presetId, setPresetId] = useState('windows-hd');
  const [strength, setStrength] = useState(0.5);
  const [speed, setSpeed] = useState(1);
  const [quality, setQuality] = useState<'high' | 'small'>('high');
  
  // Overlays
  const [useVignette, setUseVignette] = useState(false);
  const [useGrain, setUseGrain] = useState(false);
  const [useBlurEdges, setUseBlurEdges] = useState(false);
  
  // Interaction
  const [focusPoint, setFocusPoint] = useState({ x: 0.5, y: 0.5 }); // Normalized 0-1
  
  // Results
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const activePreset = useMemo(() => DEVICE_PRESETS.find(p => p.id === presetId) || DEVICE_PRESETS[0], [presetId]);

  const drawFrame = useCallback((ctx: CanvasRenderingContext2D, time: number, w: number, h: number) => {
    if (!loadedImage) return;

    const img = loadedImage;
    const totalMs = duration * 1000;
    const loopProgress = ((time * speed) % totalMs) / totalMs;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    
    // Base scale to cover the canvas
    const baseScale = Math.max(w / img.width, h / img.height);
    let scale = baseScale;
    let translateX = 0;
    let translateY = 0;
    let rotate = 0;

    // Relative strength modifier
    const s = strength * 0.3;

    // Motion Logic Matrix
    switch (motionStyle) {
      case 'zoom-in':
        scale = baseScale * (1 + loopProgress * s);
        break;
      case 'zoom-out':
        scale = baseScale * (1 + s - loopProgress * s);
        break;
      case 'pan-left':
        scale = baseScale * (1 + s);
        translateX = (img.width * scale - w) * (0.5 - loopProgress);
        break;
      case 'pan-right':
        scale = baseScale * (1 + s);
        translateX = (img.width * scale - w) * (-0.5 + loopProgress);
        break;
      case 'pan-up':
        scale = baseScale * (1 + s);
        translateY = (img.height * scale - h) * (0.5 - loopProgress);
        break;
      case 'pan-down':
        scale = baseScale * (1 + s);
        translateY = (img.height * scale - h) * (-0.5 + loopProgress);
        break;
      case 'ken-burns':
        scale = baseScale * (1 + loopProgress * s * 0.8);
        translateX = (img.width * scale - w) * (s * 0.2 * Math.sin(loopProgress * Math.PI));
        translateY = (img.height * scale - h) * (s * 0.2 * Math.cos(loopProgress * Math.PI));
        break;
      case 'drift':
        scale = baseScale * (1 + s * 0.1);
        translateX = (img.width * scale - w) * (s * 0.1 * Math.sin(loopProgress * Math.PI * 2));
        translateY = (img.height * scale - h) * (s * 0.1 * Math.cos(loopProgress * Math.PI * 2));
        break;
      case 'pulse':
        const pulse = Math.sin(loopProgress * Math.PI * 2);
        scale = baseScale * (1 + (pulse + 1) * s * 0.1);
        break;
      case 'rotate-slow':
        scale = baseScale * (1 + s * 0.5);
        rotate = loopProgress * Math.PI * 0.02 * strength;
        break;
    }

    const drawW = img.width * scale;
    const drawH = img.height * scale;
    
    // Position using Focus Point
    const focalX = w * focusPoint.x;
    const focalY = h * focusPoint.y;
    
    ctx.translate(focalX + translateX, focalY + translateY);
    ctx.rotate(rotate);
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, -drawW * focusPoint.x, -drawH * focusPoint.y, drawW, drawH);
    ctx.restore();

    // FX Layers
    if (useBlurEdges) {
      ctx.save();
      ctx.globalCompositeOperation = 'destination-in';
      const grad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w,h)/1.5);
      grad.addColorStop(0, 'white');
      grad.addColorStop(0.7, 'white');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }

    if (useVignette) {
      const grad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w,h)/1.2);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(1, 'rgba(0,0,0,0.6)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }

    if (useGrain) {
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      for (let i = 0; i < 2000; i++) {
        ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
      }
    }
  }, [loadedImage, motionStyle, duration, strength, speed, focusPoint, useVignette, useGrain, useBlurEdges]);

  const animate = useCallback((time: number) => {
    if (!startTimeRef.current) startTimeRef.current = time;
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && canvasRef.current) {
      drawFrame(ctx, time - startTimeRef.current, canvasRef.current.width, canvasRef.current.height);
    }
    requestRef.current = requestAnimationFrame(animate);
  }, [drawFrame]);

  useEffect(() => {
    if (image && loadedImage) {
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [image, loadedImage, animate]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setLoadedImage(img);
          setImage(event.target?.result as string);
          setResultUrl(null);
          toast({ title: "Visual Imported", description: "Identity matrix initialized for motion synthesis." });
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setFocusPoint({ x, y });
    toast({ title: "Focus Anchored", description: "Optical origin updated for current motion." });
  };

  const executeExport = async () => {
    if (!canvasRef.current || !loadedImage) return;
    
    setIsProcessing(true);
    setProgress(0);
    setResultUrl(null);

    const canvas = canvasRef.current;
    const stream = canvas.captureStream(30); 
    
    // Bitrate based on quality selection
    const bitsPerSec = quality === 'high' ? 12000000 : 2000000;
    
    const options = {
      mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm',
      videoBitsPerSecond: bitsPerSec
    };

    try {
      const recorder = new MediaRecorder(stream, options);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setResultUrl(URL.createObjectURL(blob));
        setIsProcessing(false);
        setProgress(100);
        toast({ title: "Synthesis Complete", description: "High-fidelity master ready for export." });
      };

      recorder.start();
      
      const startTime = Date.now();
      const totalMs = duration * 1000;
      
      const trackProgress = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const p = Math.min(99, Math.round((elapsed / totalMs) * 100));
        setProgress(p);
        if (elapsed >= totalMs) {
          clearInterval(trackProgress);
          recorder.stop();
        }
      }, 100);
    } catch (err) {
      setIsProcessing(false);
      toast({ variant: "destructive", title: "Hardware Block", description: "Try reducing the production resolution." });
    }
  };

  const handleClear = () => {
    setImage(null);
    setLoadedImage(null);
    setResultUrl(null);
    setFocusPoint({ x: 0.5, y: 0.5 });
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset", description: "Workspace buffers purged." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20 max-w-full">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <MonitorPlay className="w-3.5 h-3.5" /> Media Suite Pro
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Image <span className="text-primary italic">Live Wallpaper Pro</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
          Professional cinematic loop synthesis. Apply frequency-based motion, optical focus points, and film-grade overlays locally in your browser.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                <Settings2 className="w-5 h-5 text-primary" /> Matrix Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-10">
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Asset Intake</Label>
                <div 
                  onClick={() => !isProcessing && fileInputRef.current?.click()}
                  className={cn(
                    "relative h-40 rounded-[2rem] border-2 border-dashed border-border hover:border-primary/40 flex flex-col items-center justify-center bg-secondary/30 transition-all cursor-pointer overflow-hidden group/upload",
                    image && "border-solid border-primary/20"
                  )}
                >
                  {image ? (
                    <div className="text-center p-6 space-y-2">
                       <CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-1" />
                       <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest">Image Matrix Loaded</p>
                    </div>
                  ) : (
                    <>
                       <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-foreground/10 group-hover/upload:text-primary transition-all mb-3 shadow-xl">
                          <ImageIcon className="w-6 h-6" />
                       </div>
                       <span className="text-[9px] font-black uppercase text-foreground/30 tracking-widest">Import Photo</span>
                    </>
                  )}
                </div>
                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
              </div>

              {image && (
                <div className="space-y-8 animate-in zoom-in duration-500">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Device Protocol</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {DEVICE_PRESETS.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setPresetId(p.id)}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border transition-all",
                            presetId === p.id ? "bg-primary text-white border-primary shadow-lg" : "bg-background border-border text-foreground/40 hover:border-primary/20"
                          )}
                        >
                           <p.icon className="w-4 h-4 shrink-0" />
                           <span className="text-[8px] font-black uppercase tracking-tighter text-left truncate">{p.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Cinematic Motion</Label>
                    <Select value={motionStyle} onValueChange={(v: any) => setMotionStyle(v)}>
                       <SelectTrigger className="h-12 bg-secondary border-border rounded-xl text-[10px] font-black uppercase">
                          <SelectValue />
                       </SelectTrigger>
                       <SelectContent className="glass-card">
                          <SelectItem value="ken-burns" className="text-[10px] font-black uppercase">Ken Burns (Docu-Style)</SelectItem>
                          <SelectItem value="drift" className="text-[10px] font-black uppercase">Ambient Drift</SelectItem>
                          <SelectItem value="pulse" className="text-[10px] font-black uppercase">Vital Pulse</SelectItem>
                          <SelectItem value="rotate-slow" className="text-[10px] font-black uppercase">Planetary Rotation</SelectItem>
                          <SelectItem value="zoom-in" className="text-[10px] font-black uppercase">Slow Zoom In</SelectItem>
                          <SelectItem value="zoom-out" className="text-[10px] font-black uppercase">Slow Zoom Out</SelectItem>
                          <SelectItem value="pan-left" className="text-[10px] font-black uppercase">Pan Left</SelectItem>
                          <SelectItem value="pan-right" className="text-[10px] font-black uppercase">Pan Right</SelectItem>
                          <SelectItem value="pan-up" className="text-[10px] font-black uppercase">Pan Up</SelectItem>
                          <SelectItem value="pan-down" className="text-[10px] font-black uppercase">Pan Down</SelectItem>
                       </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                       <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-foreground/30">
                          <Label>Strength</Label>
                          <span>{Math.round(strength * 100)}%</span>
                       </div>
                       <Slider value={[strength * 100]} min={10} max={100} step={1} onValueChange={(v) => setStrength(v[0] / 100)} />
                    </div>
                    <div className="space-y-3">
                       <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-foreground/30">
                          <Label>Speed</Label>
                          <span>{speed.toFixed(1)}x</span>
                       </div>
                       <Slider value={[speed * 100]} min={20} max={200} step={1} onValueChange={(v) => setSpeed(v[0] / 100)} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Duty Cycle (Duration)</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {[5, 8, 12, 15].map(d => (
                        <button
                          key={d}
                          onClick={() => setDuration(d)}
                          className={cn(
                            "h-10 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all",
                            duration === d ? "bg-primary text-white border-primary" : "bg-background border-border text-foreground/40"
                          )}
                        >
                           {d}s
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 space-y-4 border-t border-border">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Optical Overlays</Label>
                    <div className="grid grid-cols-1 gap-3">
                       <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border group hover:border-primary/20 transition-all">
                          <div className="space-y-0.5">
                             <p className="text-[9px] font-black uppercase text-foreground/60">Vignette Shading</p>
                             <p className="text-[7px] font-bold text-foreground/20 uppercase">Depth focus</p>
                          </div>
                          <Switch checked={useVignette} onCheckedChange={setUseVignette} />
                       </div>
                       <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border group hover:border-primary/20 transition-all">
                          <div className="space-y-0.5">
                             <p className="text-[9px] font-black uppercase text-foreground/60">Film Grain</p>
                             <p className="text-[7px] font-bold text-foreground/20 uppercase">Texture restoration</p>
                          </div>
                          <Switch checked={useGrain} onCheckedChange={setUseGrain} />
                       </div>
                       <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border group hover:border-primary/20 transition-all">
                          <div className="space-y-0.5">
                             <p className="text-[9px] font-black uppercase text-foreground/60">Edge Blur</p>
                             <p className="text-[7px] font-bold text-foreground/20 uppercase">Artifact masking</p>
                          </div>
                          <Switch checked={useBlurEdges} onCheckedChange={setUseBlurEdges} />
                       </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 flex flex-col gap-3">
                <Button 
                  onClick={executeExport}
                  disabled={!image || isProcessing}
                  className="h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                >
                  {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                  Synthesize Master
                </Button>
                {image && (
                   <Button variant="outline" onClick={handleClear} disabled={isProcessing} className="h-12 rounded-xl border-border bg-secondary hover:text-destructive transition-all">
                      <Trash2 className="w-4 h-4" />
                   </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview & Results - Right */}
        <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[700px]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5" /> Studio Master Preview
                </CardTitle>
                {image && (
                   <div className="flex gap-2">
                     <button 
                        onClick={() => setQuality('high')}
                        className={cn("px-3 py-1 rounded-lg text-[8px] font-black uppercase transition-all", quality === 'high' ? "bg-primary text-white" : "bg-background/50 border border-border text-foreground/40")}
                     >
                       High FID
                     </button>
                     <button 
                        onClick={() => setQuality('small')}
                        className={cn("px-3 py-1 rounded-lg text-[8px] font-black uppercase transition-all", quality === 'small' ? "bg-primary text-white" : "bg-background/50 border border-border text-foreground/40")}
                     >
                       Small File
                     </button>
                   </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 bg-[#060608]">
               {!image ? (
                 <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-6 py-24">
                    <Activity className="w-24 h-24 text-primary" />
                    <p className="text-sm font-black uppercase tracking-[0.3em]">Studio Standby</p>
                 </div>
               ) : (
                 <div className="w-full flex flex-col items-center gap-12">
                    <div className={cn(
                      "relative shadow-2xl transition-all duration-700 p-6 bg-zinc-900 border-[12px] border-zinc-800 ring-1 ring-zinc-700 overflow-hidden",
                      presetId.includes('phone') || presetId === 'iphone' ? "w-full max-w-[320px] aspect-[9/16] rounded-[3.5rem]" : "w-full max-w-[650px] aspect-[16/9] rounded-[2.5rem]"
                    )}>
                       {/* Camera Notch for Phone */}
                       {(presetId.includes('phone') || presetId === 'iphone') && (
                         <div className="absolute top-8 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-40" />
                       )}
                       
                       <div className="w-full h-full rounded-2xl bg-black overflow-hidden relative">
                          <canvas 
                            ref={canvasRef} 
                            width={activePreset.width} 
                            height={activePreset.height} 
                            onClick={handleCanvasClick}
                            className="w-full h-full object-cover cursor-crosshair" 
                          />
                          
                          {/* Optical Focus Overlay */}
                          <div 
                            className="absolute w-12 h-12 border-2 border-white/40 rounded-full pointer-events-none z-30 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
                            style={{ left: `${focusPoint.x * 100}%`, top: `${focusPoint.y * 100}%` }}
                          >
                             <Crosshair className="w-4 h-4 text-white/60" />
                          </div>

                          <div className="absolute top-4 right-4 z-30 opacity-0 group-hover/canvas:opacity-100 transition-opacity">
                             <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 flex items-center gap-2 text-[8px] font-black text-white uppercase tracking-widest">
                                <MousePointer2 className="w-3 h-3 text-primary" /> Origin Select
                             </div>
                          </div>
                       </div>
                    </div>

                    {isProcessing && (
                      <div className="w-full max-w-sm space-y-4 animate-in fade-in zoom-in">
                        <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-primary">
                          <span className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Recording Matrix stream...</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5 rounded-full" />
                        <p className="text-center text-[9px] font-black text-foreground/20 uppercase tracking-widest animate-pulse">Hardware Pulse Verification Active</p>
                      </div>
                    )}

                    {resultUrl && (
                      <div className="w-full max-w-lg space-y-6 animate-in zoom-in duration-500">
                         <div className="p-8 rounded-[3rem] bg-primary/10 border border-primary/20 flex items-center justify-between shadow-2xl relative overflow-hidden group/success">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl opacity-0 group-hover/success:opacity-100 transition-opacity" />
                            <div className="flex items-center gap-5 relative z-10">
                               <div className="w-14 h-14 rounded-[1.5rem] bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/40 border border-white/10">
                                  <CheckCircle2 className="w-8 h-8" />
                               </div>
                               <div className="space-y-1">
                                  <h4 className="text-[13px] font-black uppercase text-foreground leading-none">Synthesis Complete</h4>
                                  <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em]">WebM Master Calibrated</p>
                               </div>
                            </div>
                            <Button asChild className="h-16 px-10 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 active:scale-95 transition-all relative z-10">
                               <a href={resultUrl} download={`image-live-${presetId}-${Date.now()}.webm`}>
                                  <Download className="w-5 h-5 mr-3" /> Export
                               </a>
                            </Button>
                         </div>
                         <div className="p-6 rounded-[2.5rem] bg-secondary border border-border flex items-start gap-4">
                            <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                            <div className="space-y-1">
                               <p className="text-[11px] font-black uppercase text-foreground tracking-widest">Protocol implementation</p>
                               <p className="text-[10px] text-foreground/50 leading-relaxed font-medium uppercase">
                                  Import this master file into "Lively Wallpaper" or a "Video to Live Wallpaper" application. Native looping and high-DPI scaling are hard-coded into the bitstream.
                               </p>
                            </div>
                         </div>
                      </div>
                    )}
                 </div>
               )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <Target className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Optical Origin Control</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Our studio allows you to set a clinical focus point. The motion engine recalculates all scaling vectors relative to this anchor for perfect brand alignment.
                  </p>
                </div>
             </div>
             <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Zero-Latency Capture</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    By utilizing hardware-native stream capture, we bypass the need for heavy WASM binaries, ensuring consistent high-performance synthesis across all mobile platforms.
                  </p>
                </div>
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
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
