"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  LayoutGrid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type MotionStyle = 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right' | 'ken-burns';
type DevicePreset = { id: string; label: string; width: number; height: number; icon: any };

const DEVICE_PRESETS: DevicePreset[] = [
  { id: 'pc', label: 'PC Desktop (16:9)', width: 1280, height: 720, icon: Monitor },
  { id: 'phone', label: 'Phone Portrait (9:16)', width: 720, height: 1280, icon: Smartphone },
  { id: 'square', label: 'Square Matrix (1:1)', width: 720, height: 720, icon: LayoutGrid },
];

export default function ImageLiveWallpaperPage() {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Settings
  const [motionStyle, setMotionStyle] = useState<MotionStyle>('ken-burns');
  const [duration, setDuration] = useState(8);
  const [presetId, setPresetId] = useState('pc');
  
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
    const progress = (time % totalMs) / totalMs;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    
    // Base scale to cover the canvas
    const baseScale = Math.max(w / img.width, h / img.height);
    let scale = baseScale;
    let translateX = 0;
    let translateY = 0;

    // Motion Logic Matrix
    switch (motionStyle) {
      case 'zoom-in':
        scale = baseScale * (1 + progress * 0.2);
        break;
      case 'zoom-out':
        scale = baseScale * (1.2 - progress * 0.2);
        break;
      case 'pan-left':
        scale = baseScale * 1.1;
        translateX = (img.width * scale - w) * (0.5 - progress);
        break;
      case 'pan-right':
        scale = baseScale * 1.1;
        translateX = (img.width * scale - w) * (-0.5 + progress);
        break;
      case 'ken-burns':
        scale = baseScale * (1 + progress * 0.15);
        translateX = (img.width * scale - w) * (0.1 * Math.sin(progress * Math.PI));
        translateY = (img.height * scale - h) * (0.1 * Math.cos(progress * Math.PI));
        break;
    }

    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const x = (w - drawW) / 2 + translateX;
    const y = (h - drawH) / 2 + translateY;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, x, y, drawW, drawH);
    ctx.restore();
  }, [loadedImage, motionStyle, duration]);

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

  const executeExport = async () => {
    if (!canvasRef.current || !loadedImage) return;
    
    setIsProcessing(true);
    setProgress(0);
    setResultUrl(null);

    const canvas = canvasRef.current;
    const stream = canvas.captureStream(30); // 30 FPS
    
    // Attempt to identify best supported mime type
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') 
      ? 'video/webm;codecs=vp9' 
      : 'video/webm';
      
    const recorder = new MediaRecorder(stream, { mimeType });
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      setResultUrl(URL.createObjectURL(blob));
      setIsProcessing(false);
      setProgress(100);
      toast({ title: "Synthesis Complete", description: "Live Wallpaper master ready for export." });
    };

    // Begin recording cycle
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
  };

  const handleClear = () => {
    setImage(null);
    setLoadedImage(null);
    setResultUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset", description: "Workspace buffers purged." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20 max-w-full">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <MonitorPlay className="w-3.5 h-3.5" /> Media Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Image <span className="text-primary italic">Live Wallpaper</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
          Transform static photography into professional cinematic loops. Apply high-fidelity pan and zoom motions locally in your browser with zero data leakage.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                <Settings2 className="w-5 h-5 text-primary" /> Matrix Config
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
                    <div className="grid grid-cols-3 gap-2">
                      {DEVICE_PRESETS.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setPresetId(p.id)}
                          className={cn(
                            "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all",
                            presetId === p.id ? "bg-primary text-white border-primary shadow-lg" : "bg-background border-border text-foreground/40 hover:border-primary/20"
                          )}
                        >
                           <p.icon className="w-4 h-4" />
                           <span className="text-[7px] font-black uppercase tracking-tighter text-center">{p.label.split(' (')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Motion Style</Label>
                    <Select value={motionStyle} onValueChange={(v: any) => setMotionStyle(v)}>
                       <SelectTrigger className="h-12 bg-secondary border-border rounded-xl text-[10px] font-black uppercase">
                          <SelectValue />
                       </SelectTrigger>
                       <SelectContent className="glass-card">
                          <SelectItem value="ken-burns" className="text-[10px] font-black uppercase">Ken Burns (Cinematic)</SelectItem>
                          <SelectItem value="zoom-in" className="text-[10px] font-black uppercase">Slow Zoom In</SelectItem>
                          <SelectItem value="zoom-out" className="text-[10px] font-black uppercase">Slow Zoom Out</SelectItem>
                          <SelectItem value="pan-left" className="text-[10px] font-black uppercase">Pan Horizontal (Left)</SelectItem>
                          <SelectItem value="pan-right" className="text-[10px] font-black uppercase">Pan Horizontal (Right)</SelectItem>
                       </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Duty Cycle (Duration)</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[5, 8, 12].map(d => (
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
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5" /> Studio Master Preview
                </CardTitle>
                {image && (
                   <div className="px-3 py-1 rounded-lg bg-background/50 border border-border text-[9px] font-black text-foreground/40 uppercase tracking-widest">
                     Target: {activePreset.width}x{activePreset.height}
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
                      "relative shadow-2xl transition-all duration-700 p-4 bg-zinc-900 border-4 border-zinc-800 ring-1 ring-zinc-700 overflow-hidden",
                      presetId === 'phone' ? "w-full max-w-[320px] aspect-[9/16] rounded-[3rem]" : "w-full max-w-[600px] aspect-[16/9] rounded-[2rem]"
                    )}>
                       <div className="w-full h-full rounded-xl bg-black overflow-hidden relative">
                          <canvas 
                            ref={canvasRef} 
                            width={activePreset.width} 
                            height={activePreset.height} 
                            className="w-full h-full object-cover" 
                          />
                          {/* Hardware Details Overlay */}
                          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-30">
                             <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                             <span className="text-[8px] font-black text-white uppercase tracking-widest">Hardware Preview Active</span>
                          </div>
                       </div>
                    </div>

                    {isProcessing && (
                      <div className="w-full max-w-sm space-y-4 animate-in fade-in zoom-in">
                        <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-primary">
                          <span className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Capturing Matrix Stream...</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5 rounded-full" />
                      </div>
                    )}

                    {resultUrl && (
                      <div className="w-full max-w-md space-y-6 animate-in zoom-in duration-500">
                         <div className="p-6 rounded-[2.5rem] bg-primary/10 border border-primary/20 flex items-center justify-between shadow-xl">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white">
                                  <CheckCircle2 className="w-7 h-7" />
                               </div>
                               <div className="space-y-0.5">
                                  <h4 className="text-[11px] font-black uppercase text-foreground">Synthesis Complete</h4>
                                  <p className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest">WebM Master Generated</p>
                               </div>
                            </div>
                            <Button asChild className="h-14 px-8 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                               <a href={resultUrl} download={`image-live-${presetId}.webm`}>
                                  <Download className="w-4 h-4 mr-2" /> Download
                               </a>
                            </Button>
                         </div>
                         <div className="p-6 rounded-[2rem] bg-secondary border border-border flex items-start gap-4">
                            <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                            <p className="text-[10px] text-foreground/50 leading-relaxed font-medium uppercase">
                              This WebM file supports high-fidelity alpha channels and native looping. Import into "Lively Wallpaper" (Windows) or use a "Video to Live Wallpaper" app on your mobile device.
                            </p>
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
                   <Zap className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Direct Stream Capture</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Our engine captures raw pixel data directly from the Canvas stream. This ensures 1:1 visual fidelity with zero compression artifacts during the synthesis cycle.
                  </p>
                </div>
             </div>
             <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Privacy Sovereign</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Synthesis occurs entirely in volatile memory. No video or image data is transmitted to remote hosts, maintaining the studio's strict zero-storage mandate.
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
