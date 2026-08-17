"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Youtube, 
  Upload, 
  Download, 
  Trash2, 
  Settings2, 
  Info,
  CheckCircle2,
  Maximize,
  Move,
  Search,
  Palette,
  Eye,
  Loader2,
  Smartphone,
  Monitor,
  Tv
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const BANNER_WIDTH = 2560;
const BANNER_HEIGHT = 1440;
const SAFE_WIDTH = 1546;
const SAFE_HEIGHT = 423;
const DESKTOP_HEIGHT = 423;

export default function YoutubeBannerPage() {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [bgMode, setBgMode] = useState<'blur' | 'color'>('blur');
  const [bgColor, setBgColor] = useState('#000000');
  const [showGuides, setShowGuides] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const drawGuideOverlays = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    
    // Safe Area (Mobile/Desktop/Tablet shared): 1546 x 423
    const safeX = (BANNER_WIDTH - SAFE_WIDTH) / 2;
    const safeY = (BANNER_HEIGHT - SAFE_HEIGHT) / 2;

    // Desktop Max: 2560 x 423
    const desktopY = (BANNER_HEIGHT - DESKTOP_HEIGHT) / 2;

    // Draw mask everywhere except Safe Area
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    // Top mask
    ctx.fillRect(0, 0, BANNER_WIDTH, desktopY);
    // Bottom mask
    ctx.fillRect(0, desktopY + DESKTOP_HEIGHT, BANNER_WIDTH, BANNER_HEIGHT - (desktopY + DESKTOP_HEIGHT));
    // Left of Safe (on desktop bar)
    ctx.fillRect(0, desktopY, safeX, DESKTOP_HEIGHT);
    // Right of Safe (on desktop bar)
    ctx.fillRect(safeX + SAFE_WIDTH, desktopY, safeX, DESKTOP_HEIGHT);

    // Guide Lines
    ctx.lineWidth = 4;
    ctx.setLineDash([20, 20]);
    ctx.strokeStyle = '#3b82f6';
    
    // Desktop Border
    ctx.strokeRect(0, desktopY, BANNER_WIDTH, DESKTOP_HEIGHT);
    
    // Safe Area Border
    ctx.strokeStyle = '#ef4444';
    ctx.strokeRect(safeX, safeY, SAFE_WIDTH, SAFE_HEIGHT);

    // Labels
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 32px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('TV (2560 × 1440)', BANNER_WIDTH / 2, 80);
    
    ctx.fillStyle = '#3b82f6';
    ctx.fillText('DESKTOP (2560 × 423)', BANNER_WIDTH / 2, desktopY + 40);

    ctx.fillStyle = '#ef4444';
    ctx.fillText('MOBILE / TEXT SAFE (1546 × 423)', BANNER_WIDTH / 2, safeY + SAFE_HEIGHT / 2 + 12);

    ctx.restore();
  };

  const renderCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    canvas.width = BANNER_WIDTH;
    canvas.height = BANNER_HEIGHT;

    // 1. Clear with base color
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, BANNER_WIDTH, BANNER_HEIGHT);

    if (loadedImage) {
      const img = loadedImage;
      
      // 2. Draw Background
      if (bgMode === 'blur') {
        ctx.save();
        ctx.filter = 'blur(60px) brightness(0.4)';
        const scale = Math.max(BANNER_WIDTH / img.width, BANNER_HEIGHT / img.height);
        ctx.drawImage(img, (BANNER_WIDTH - img.width * scale) / 2, (BANNER_HEIGHT - img.height * scale) / 2, img.width * scale, img.height * scale);
        ctx.restore();
      }

      // 3. Draw Main Image
      ctx.save();
      const w = img.width * zoom;
      const h = img.height * zoom;
      const centerX = BANNER_WIDTH / 2 + pos.x;
      const centerY = BANNER_HEIGHT / 2 + pos.y;
      ctx.drawImage(img, centerX - w / 2, centerY - h / 2, w, h);
      ctx.restore();
    }

    // 4. Draw Guides
    if (showGuides) {
      drawGuideOverlays(ctx);
    }
  }, [loadedImage, zoom, pos, bgMode, bgColor, showGuides]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          setImage(result);
          setLoadedImage(img);
          // Initial zoom to fit safe area height
          const scale = Math.max(SAFE_WIDTH / img.width, SAFE_HEIGHT / img.height);
          setZoom(scale);
          setPos({ x: 0, y: 0 });
          setIsProcessing(false);
          toast({ title: "Asset Loaded", description: "Position your brand inside the safe zones." });
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragStart = (clientX: number, clientY: number) => {
    if (!image) return;
    isDragging.current = true;
    lastMousePos.current = { x: clientX, y: clientY };
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging.current || !image) return;
    
    const deltaX = clientX - lastMousePos.current.x;
    const deltaY = clientY - lastMousePos.current.y;

    const container = canvasRef.current?.parentElement;
    if (container) {
      const scale = BANNER_WIDTH / container.clientWidth;
      setPos(prev => ({ x: prev.x + deltaX * scale, y: prev.y + deltaY * scale }));
    }

    lastMousePos.current = { x: clientX, y: clientY };
  };

  const handleDragEnd = () => {
    isDragging.current = false;
  };

  const handleDownload = () => {
    if (!canvasRef.current || !image) return;
    
    // Temporarily hide guides for export
    const prevGuides = showGuides;
    setShowGuides(false);
    
    // We need to wait for one render cycle or manually call render without guides
    setTimeout(() => {
      const link = document.createElement('a');
      link.download = `youtube-banner-${Date.now()}.png`;
      link.href = canvasRef.current!.toDataURL('image/png', 1.0);
      link.click();
      setShowGuides(prevGuides);
      toast({ title: "Export Success", description: "2560x1440 banner saved." });
    }, 50);
  };

  const handleClear = () => {
    setImage(null);
    setLoadedImage(null);
    setPos({ x: 0, y: 0 });
    setZoom(1);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset", description: "Buffers cleared." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Youtube className="w-3.5 h-3.5" /> Media Production
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          YouTube <span className="text-primary italic">Banner Studio</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
          Professional channel art synthesis. Generate 2560x1440 banners with precision safe-zone guides for all devices locally in your browser.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls Section */}
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
                <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Source Payload</Label>
                <div 
                  onClick={() => !isProcessing && fileInputRef.current?.click()}
                  className={cn(
                    "relative h-32 rounded-2xl border-2 border-dashed border-border hover:border-primary/40 flex flex-col items-center justify-center bg-secondary/30 transition-all cursor-pointer overflow-hidden",
                    image && "border-solid border-primary/20"
                  )}
                >
                  {image ? (
                    <div className="text-center p-4">
                       <CheckCircle2 className="w-8 h-8 text-primary mx-auto mb-1" />
                       <p className="text-[9px] font-black uppercase text-foreground/40 tracking-widest">Image Integrated</p>
                    </div>
                  ) : (
                    <>
                       {isProcessing ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : <Upload className="w-5 h-5 text-foreground/10 mb-2" />}
                       <span className="text-[9px] font-black uppercase text-foreground/30">Import Image</span>
                    </>
                  )}
                </div>
                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
              </div>

              {image && (
                <div className="space-y-8 animate-in zoom-in duration-500">
                   <div className="space-y-4">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-foreground/40">
                         <Label className="flex items-center gap-2"><Maximize className="w-3 h-3" /> Zoom Matrix</Label>
                         <span className="text-primary">{(zoom * 100).toFixed(0)}%</span>
                      </div>
                      <Slider value={[zoom * 100]} min={10} max={400} step={1} onValueChange={(v) => setZoom(v[0] / 100)} />
                   </div>

                   <div className="space-y-4">
                      <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Background Fill</Label>
                      <div className="grid grid-cols-2 gap-3">
                         <button 
                          onClick={() => setBgMode('blur')}
                          className={cn("h-10 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all", bgMode === 'blur' ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-foreground/40")}
                         >
                           Blur Fill
                         </button>
                         <button 
                          onClick={() => setBgMode('color')}
                          className={cn("h-10 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all", bgMode === 'color' ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-foreground/40")}
                         >
                           Solid Color
                         </button>
                      </div>
                   </div>

                   {bgMode === 'color' && (
                     <div className="p-4 rounded-xl bg-secondary border border-border flex items-center gap-4 animate-in fade-in">
                        <div className="w-8 h-8 rounded-lg relative overflow-hidden ring-2 ring-white" style={{ backgroundColor: bgColor }}>
                          <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-foreground/60 uppercase">{bgColor}</span>
                     </div>
                   )}

                   <div className="p-6 rounded-[2rem] bg-secondary border border-border flex items-center justify-between">
                      <div className="space-y-1">
                         <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Visual Guides</p>
                         <p className="text-[9px] text-foreground/30 font-medium uppercase">Display safe area overlays</p>
                      </div>
                      <button 
                        onClick={() => setShowGuides(!showGuides)}
                        className={cn("w-12 h-6 rounded-full relative transition-colors duration-300", showGuides ? "bg-primary" : "bg-border")}
                      >
                        <div className={cn("absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300", showGuides ? "translate-x-6" : "translate-x-0")} />
                      </button>
                   </div>
                </div>
              )}

              <div className="pt-4 flex flex-col gap-3">
                <Button 
                  onClick={handleDownload}
                  disabled={!image}
                  className="h-12 w-fit px-10 mx-auto bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl flex items-center justify-center gap-3 text-[10px] uppercase tracking-widest shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                >
                  <Download className="w-4 h-4" />
                  Export
                </Button>
                {image && (
                  <Button 
                    variant="ghost"
                    onClick={handleClear}
                    className="h-12 text-foreground/30 hover:text-destructive text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Reset Studio
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
            <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Privacy Absolute</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                Banner synthesis occurs entirely on your device via the Canvas rendering engine. Your photographs never leave your machine, ensuring 100% data security.
              </p>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5" /> Studio Master Preview
                </CardTitle>
                <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest">2560 × 1440 Canvas</div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 bg-black/5 dark:bg-black/40">
              <div className="w-full max-w-[800px] space-y-8">
                 <div className="relative w-full aspect-[16/9] rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-white/10 group/canvas cursor-move bg-checkered">
                    {image && (
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 opacity-0 group-hover/canvas:opacity-100 transition-opacity pointer-events-none">
                         <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-3 text-[10px] font-black text-white uppercase tracking-widest shadow-xl border border-white/10">
                            <Move className="w-3.5 h-3.5 text-primary" /> Drag to Position
                         </div>
                      </div>
                    )}
                    <canvas 
                      ref={canvasRef} 
                      className="w-full h-full object-contain"
                      onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
                      onMouseMove={(e) => handleDragMove(e.clientX, e.clientY)}
                      onMouseUp={handleDragEnd}
                      onMouseLeave={handleDragEnd}
                      onTouchStart={(e) => handleDragStart(e.touches[0].clientX, e.touches[0].clientY)}
                      onTouchMove={(e) => handleDragMove(e.touches[0].clientX, e.touches[0].clientY)}
                      onTouchEnd={handleDragEnd}
                    />
                    
                    {!image && !isProcessing && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 opacity-20 pointer-events-none">
                        <Youtube className="w-20 h-20 text-primary" />
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-foreground">Waiting for visual payload</p>
                      </div>
                    )}
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                       { icon: Tv, label: 'TV Full Matrix', color: 'bg-white/20', dim: '2560 × 1440' },
                       { icon: Monitor, label: 'Desktop Bar', color: 'bg-blue-500/20', dim: '2560 × 423' },
                       { icon: Smartphone, label: 'Mobile Safe', color: 'bg-red-500/20', dim: '1546 × 423' },
                    ].map((item) => (
                      <div key={item.label} className="p-4 rounded-2xl bg-secondary border border-border flex items-center gap-4 group/legend hover:bg-secondary/80 transition-all">
                         <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-foreground/40 group-hover/legend:text-primary transition-colors", item.color)}>
                            <item.icon className="w-5 h-5" />
                         </div>
                         <div className="space-y-0.5">
                            <p className="text-[9px] font-black uppercase text-foreground/40 tracking-widest">{item.label}</p>
                            <p className="text-[10px] font-bold text-foreground">{item.dim}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <style jsx global>{`
        .bg-checkered {
          background-image: linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                            linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                            linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }
        .dark .bg-checkered {
           background-image: linear-gradient(45deg, #1a1a1a 25%, transparent 25%), 
                            linear-gradient(-45deg, #1a1a1a 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #1a1a1a 75%), 
                            linear-gradient(-45deg, transparent 75%, #1a1a1a 75%);
        }
      `}</style>
    </div>
  );
}
