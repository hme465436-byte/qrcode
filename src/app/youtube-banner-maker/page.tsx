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
    const safeX = (BANNER_WIDTH - SAFE_WIDTH) / 2;
    const safeY = (BANNER_HEIGHT - SAFE_HEIGHT) / 2;
    const desktopY = (BANNER_HEIGHT - DESKTOP_HEIGHT) / 2;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, BANNER_WIDTH, desktopY);
    ctx.fillRect(0, desktopY + DESKTOP_HEIGHT, BANNER_WIDTH, BANNER_HEIGHT - (desktopY + DESKTOP_HEIGHT));
    ctx.fillRect(0, desktopY, safeX, DESKTOP_HEIGHT);
    ctx.fillRect(safeX + SAFE_WIDTH, desktopY, safeX, DESKTOP_HEIGHT);
    ctx.lineWidth = 4;
    ctx.setLineDash([20, 20]);
    ctx.strokeStyle = '#3b82f6';
    ctx.strokeRect(0, desktopY, BANNER_WIDTH, DESKTOP_HEIGHT);
    ctx.strokeStyle = '#ef4444';
    ctx.strokeRect(safeX, safeY, SAFE_WIDTH, SAFE_HEIGHT);
    ctx.restore();
  };

  const renderCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    canvas.width = BANNER_WIDTH;
    canvas.height = BANNER_HEIGHT;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, BANNER_WIDTH, BANNER_HEIGHT);
    if (loadedImage) {
      const img = loadedImage;
      if (bgMode === 'blur') {
        ctx.save();
        ctx.filter = 'blur(60px) brightness(0.4)';
        const scale = Math.max(BANNER_WIDTH / img.width, BANNER_HEIGHT / img.height);
        ctx.drawImage(img, (BANNER_WIDTH - img.width * scale) / 2, (BANNER_HEIGHT - img.height * scale) / 2, img.width * scale, img.height * scale);
        ctx.restore();
      }
      ctx.save();
      const w = img.width * zoom;
      const h = img.height * zoom;
      const centerX = BANNER_WIDTH / 2 + pos.x;
      const centerY = BANNER_HEIGHT / 2 + pos.y;
      ctx.drawImage(img, centerX - w / 2, centerY - h / 2, w, h);
      ctx.restore();
    }
    if (showGuides) drawGuideOverlays(ctx);
  }, [loadedImage, zoom, pos, bgMode, bgColor, showGuides]);

  useEffect(() => { renderCanvas(); }, [renderCanvas]);

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
          const scale = Math.max(SAFE_WIDTH / img.width, SAFE_HEIGHT / img.height);
          setZoom(scale);
          setPos({ x: 0, y: 0 });
          setIsProcessing(false);
          toast({ title: "Asset Loaded" });
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragStart = (clientX: number, clientY: number) => { if (!image) return; isDragging.current = true; lastMousePos.current = { x: clientX, y: clientY }; };
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
  const handleDragEnd = () => { isDragging.current = false; };

  const handleDownload = () => {
    if (!canvasRef.current || !image) return;
    const prevGuides = showGuides;
    setShowGuides(false);
    setTimeout(() => {
      const link = document.createElement('a');
      link.download = `yt-banner-${Date.now()}.png`;
      link.href = canvasRef.current!.toDataURL('image/png', 1.0);
      link.click();
      setShowGuides(prevGuides);
      toast({ title: "Saved" });
    }, 50);
  };

  const handleClear = () => { setImage(null); setLoadedImage(null); setPos({ x: 0, y: 0 }); setZoom(1); };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-10 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Youtube className="w-3.5 h-3.5" /> Media Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          YouTube <span className="text-primary italic">Banner Studio</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
          Professional 2560x1440 channel art synthesis with safe-zone guides.
        </p>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">
        {/* Compact Preview */}
        <div className="w-full lg:col-span-7 order-1 max-md:h-[28vh] max-md:min-h-0 max-md:max-h-[180px] animate-in fade-in duration-1000">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col h-full">
            <CardHeader className="py-4 border-b border-border bg-secondary/30 hidden md:flex flex-row items-center justify-between">
              <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                <Eye className="w-3.5 h-3.5" /> Preview
              </CardTitle>
              <button onClick={() => setShowGuides(!showGuides)} className={cn("px-3 py-1 rounded-lg text-[8px] font-black uppercase transition-all", showGuides ? "bg-primary text-white" : "bg-background border border-border text-foreground/40")}>Guides</button>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center p-2 sm:p-12 bg-[#060608] relative overflow-hidden">
              <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 group/canvas cursor-move bg-checkered">
                <canvas 
                  ref={canvasRef} 
                  className="h-full w-auto object-contain mx-auto"
                  onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
                  onMouseMove={(e) => handleDragMove(e.clientX, e.clientY)}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                  onTouchStart={(e) => handleDragStart(e.touches[0].clientX, e.touches[0].clientY)}
                  onTouchMove={(e) => handleDragMove(e.touches[0].clientX, e.touches[0].clientY)}
                  onTouchEnd={handleDragEnd}
                />
                {!image && !isProcessing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20">
                    <Youtube className="w-10 h-10 text-primary" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scrollable Controls */}
        <div className="w-full lg:col-span-5 order-2 max-md:max-h-[55vh] max-md:overflow-y-auto custom-scrollbar animate-in fade-in duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden">
            <CardHeader className="py-6 border-b border-border bg-secondary/30">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                <Settings2 className="w-5 h-5 text-primary" /> Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 space-y-8">
              <div className="space-y-4">
                <div onClick={() => !isProcessing && fileInputRef.current?.click()} className="relative h-24 rounded-2xl border-2 border-dashed border-border hover:border-primary/40 flex flex-col items-center justify-center bg-secondary/30 cursor-pointer overflow-hidden transition-all">
                  <span className="text-[9px] font-black uppercase text-foreground/30">{image ? 'Swap' : 'Import'}</span>
                </div>
                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
              </div>

              {image && (
                <div className="space-y-6">
                   <div className="space-y-4">
                      <div className="flex justify-between text-[9px] font-black uppercase text-foreground/40">
                         <Label>Zoom</Label>
                         <span className="text-primary font-mono">{(zoom * 100).toFixed(0)}%</span>
                      </div>
                      <Slider value={[zoom * 100]} min={10} max={400} step={1} onValueChange={(v) => setZoom(v[0] / 100)} />
                   </div>
                   <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setBgMode('blur')} className={cn("h-10 rounded-xl border text-[8px] font-black uppercase transition-all", bgMode === 'blur' ? "bg-primary text-white border-primary" : "bg-background border-border text-foreground/40")}>Blur</button>
                      <button onClick={() => setBgMode('color')} className={cn("h-10 rounded-xl border text-[8px] font-black uppercase transition-all", bgMode === 'color' ? "bg-primary text-white border-primary" : "bg-background border-border text-foreground/40")}>Solid</button>
                   </div>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Button onClick={handleDownload} disabled={!image} className="h-12 w-full bg-primary text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-xl active:scale-95">
                  Export
                </Button>
                {image && (
                   <Button variant="ghost" onClick={handleClear} className="h-10 text-foreground/30 hover:text-destructive text-[8px] font-black uppercase tracking-widest">Reset</Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
