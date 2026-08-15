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
  Tv,
  MonitorPlay,
  ArrowRightLeft,
  Ratio,
  ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const THUMB_WIDTH = 1280;
const THUMB_HEIGHT = 720;

type FitMode = 'cover' | 'contain' | 'stretch';

export default function YoutubeThumbnailPage() {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [fitMode, setFitMode] = useState<FitMode>('cover');
  const [bgColor, setBgColor] = useState('#000000');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const renderCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    canvas.width = THUMB_WIDTH;
    canvas.height = THUMB_HEIGHT;

    // 1. Background Fill
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, THUMB_WIDTH, THUMB_HEIGHT);

    if (loadedImage) {
      const img = loadedImage;
      ctx.save();

      let drawW = img.width;
      let drawH = img.height;
      let startX = 0;
      let startY = 0;

      if (fitMode === 'stretch') {
        drawW = THUMB_WIDTH;
        drawH = THUMB_HEIGHT;
      } else {
        const thumbAspect = THUMB_WIDTH / THUMB_HEIGHT;
        const imgAspect = img.width / img.height;

        if (fitMode === 'cover') {
          if (imgAspect > thumbAspect) {
            drawH = THUMB_HEIGHT;
            drawW = THUMB_HEIGHT * imgAspect;
          } else {
            drawW = THUMB_WIDTH;
            drawH = THUMB_WIDTH / imgAspect;
          }
        } else if (fitMode === 'contain') {
          if (imgAspect > thumbAspect) {
            drawW = THUMB_WIDTH;
            drawH = THUMB_WIDTH / imgAspect;
          } else {
            drawH = THUMB_HEIGHT;
            drawW = THUMB_HEIGHT * imgAspect;
          }
        }
      }

      // Apply Zoom & Position
      const finalW = drawW * zoom;
      const finalH = drawH * zoom;
      const centerX = THUMB_WIDTH / 2 + pos.x;
      const centerY = THUMB_HEIGHT / 2 + pos.y;

      ctx.drawImage(img, centerX - finalW / 2, centerY - finalH / 2, finalW, finalH);
      ctx.restore();
    }
  }, [loadedImage, zoom, pos, fitMode, bgColor]);

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
          setZoom(1);
          setPos({ x: 0, y: 0 });
          setIsProcessing(false);
          toast({ title: "Asset Integrated", description: "Image loaded for thumbnail synthesis." });
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
      const scale = THUMB_WIDTH / container.clientWidth;
      setPos(prev => ({ x: prev.x + deltaX * scale, y: prev.y + deltaY * scale }));
    }

    lastMousePos.current = { x: clientX, y: clientY };
  };

  const handleDragEnd = () => {
    isDragging.current = false;
  };

  const handleDownload = (ext: 'png' | 'jpg') => {
    if (!canvasRef.current || !image) return;
    const link = document.createElement('a');
    link.download = `yt-thumbnail-${Date.now()}.${ext}`;
    link.href = canvasRef.current.toDataURL(ext === 'png' ? 'image/png' : 'image/jpeg', 0.95);
    link.click();
    toast({ title: "Export Complete", description: `Thumbnail saved as ${ext.toUpperCase()}.` });
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
          <MonitorPlay className="w-3.5 h-3.5" /> Media Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          YouTube <span className="text-primary italic">Thumbnail Studio</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
          Professional thumbnail synthesis. Frame, scale, and export high-resolution 1280×720 assets perfectly calibrated for the YouTube Creator Studio.
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
                       <CheckCircle2 className="w-6 h-6 text-primary mx-auto mb-1" />
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
                      <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Fit Protocol</Label>
                      <Select value={fitMode} onValueChange={(v: FitMode) => setFitMode(v)}>
                        <SelectTrigger className="h-12 bg-secondary border-border rounded-xl text-foreground font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-card">
                          <SelectItem value="cover" className="text-xs font-bold uppercase">Cover (Fill)</SelectItem>
                          <SelectItem value="contain" className="text-xs font-bold uppercase">Contain (Aspect)</SelectItem>
                          <SelectItem value="stretch" className="text-xs font-bold uppercase">Stretch (Distort)</SelectItem>
                        </SelectContent>
                      </Select>
                   </div>

                   <div className="space-y-4">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-foreground/40">
                         <Label className="flex items-center gap-2"><Maximize className="w-3 h-3" /> Scale Matrix</Label>
                         <span className="text-primary">{(zoom * 100).toFixed(0)}%</span>
                      </div>
                      <Slider value={[zoom * 100]} min={10} max={400} step={1} onValueChange={(v) => setZoom(v[0] / 100)} />
                   </div>

                   <div className="space-y-4">
                      <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Fill Matrix (BG)</Label>
                      <div className="p-4 rounded-xl bg-secondary border border-border flex items-center gap-4 animate-in fade-in">
                        <div className="w-8 h-8 rounded-lg relative overflow-hidden ring-2 ring-white" style={{ backgroundColor: bgColor }}>
                          <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-foreground/60 uppercase">{bgColor}</span>
                      </div>
                   </div>
                </div>
              )}

              <div className="pt-4 flex flex-col gap-3">
                <Button 
                  onClick={() => handleDownload('png')}
                  disabled={!image}
                  className="h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                >
                  <Download className="w-6 h-6" />
                  Download PNG
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => handleDownload('jpg')}
                    disabled={!image}
                    className="h-12 border-border bg-secondary hover:bg-secondary/80 text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Save as JPG
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleClear}
                    disabled={!image}
                    className="h-12 border-border bg-secondary hover:bg-secondary/80 text-foreground/40 hover:text-destructive transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
            <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Privacy Absolute</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                All visual processing occurs locally via your browser's Canvas API. Your metadata and imagery never leave your machine.
              </p>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[500px]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5" /> Studio Master Preview
                </CardTitle>
                <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest">1280 × 720 Matrix</div>
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
                        <MonitorPlay className="w-20 h-20 text-primary" />
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-foreground">Awaiting Visual Matrix</p>
                      </div>
                    )}
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 rounded-3xl bg-secondary border border-border flex items-start gap-4">
                       <Ratio className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Aspect Sync</p>
                          <p className="text-[11px] text-foreground/50 font-medium">Standard 16:9 ratio locked for search result optimization.</p>
                       </div>
                    </div>
                    <div className="p-5 rounded-3xl bg-secondary border border-border flex items-start gap-4">
                       <Maximize className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Master Density</p>
                          <p className="text-[11px] text-foreground/50 font-medium">High-fidelity pixel mapping ensures crisp text and UI elements.</p>
                       </div>
                    </div>
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
