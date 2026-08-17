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

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, THUMB_WIDTH, THUMB_HEIGHT);

    if (loadedImage) {
      const img = loadedImage;
      ctx.save();
      let drawW = img.width;
      let drawH = img.height;

      if (fitMode === 'stretch') {
        drawW = THUMB_WIDTH;
        drawH = THUMB_HEIGHT;
      } else {
        const thumbAspect = THUMB_WIDTH / THUMB_HEIGHT;
        const imgAspect = img.width / img.height;
        if (fitMode === 'cover') {
          if (imgAspect > thumbAspect) { drawH = THUMB_HEIGHT; drawW = THUMB_HEIGHT * imgAspect; }
          else { drawW = THUMB_WIDTH; drawH = THUMB_WIDTH / imgAspect; }
        } else {
          if (imgAspect > thumbAspect) { drawW = THUMB_WIDTH; drawH = THUMB_WIDTH / imgAspect; }
          else { drawH = THUMB_HEIGHT; drawW = THUMB_HEIGHT * imgAspect; }
        }
      }

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
          toast({ title: "Asset Loaded", description: "Ready for synthesis." });
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
      const scale = THUMB_WIDTH / container.clientWidth;
      setPos(prev => ({ x: prev.x + deltaX * scale, y: prev.y + deltaY * scale }));
    }
    lastMousePos.current = { x: clientX, y: clientY };
  };
  const handleDragEnd = () => { isDragging.current = false; };

  const handleDownload = (ext: 'png' | 'jpg') => {
    if (!canvasRef.current || !image) return;
    const link = document.createElement('a');
    link.download = `yt-thumb-${Date.now()}.${ext}`;
    link.href = canvasRef.current.toDataURL(ext === 'png' ? 'image/png' : 'image/jpeg', 0.95);
    link.click();
    toast({ title: "Saved" });
  };

  const handleClear = () => { setImage(null); setLoadedImage(null); if (fileInputRef.current) fileInputRef.current.value = ''; };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-10 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <MonitorPlay className="w-3.5 h-3.5" /> Media Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          YouTube <span className="text-primary italic">Thumbnail Studio</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
          Frame, scale, and export high-res 1280×720 assets for the YouTube Studio.
        </p>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">
        {/* Compact Preview */}
        <div className="w-full lg:col-span-7 order-1 max-md:h-[28vh] max-md:min-h-0 max-md:max-h-[180px] animate-in fade-in duration-1000">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col h-full">
            <CardHeader className="py-4 border-b border-border bg-secondary/30 hidden md:flex">
              <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                <Eye className="w-3.5 h-3.5" /> Preview
              </CardTitle>
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
                    <MonitorPlay className="w-10 h-10 text-primary" />
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
                   <Select value={fitMode} onValueChange={(v: FitMode) => setFitMode(v)}>
                     <SelectTrigger className="h-12 bg-secondary border-border rounded-xl text-xs font-bold uppercase"><SelectValue /></SelectTrigger>
                     <SelectContent className="glass-card">
                       <SelectItem value="cover">Cover</SelectItem>
                       <SelectItem value="contain">Contain</SelectItem>
                       <SelectItem value="stretch">Stretch</SelectItem>
                     </SelectContent>
                   </Select>
                   <div className="space-y-4">
                      <div className="flex justify-between text-[9px] font-black uppercase text-foreground/40">
                         <Label>Zoom</Label>
                         <span className="text-primary font-mono">{(zoom * 100).toFixed(0)}%</span>
                      </div>
                      <Slider value={[zoom * 100]} min={10} max={400} step={1} onValueChange={(v) => setZoom(v[0] / 100)} />
                   </div>
                   <div className="p-3 rounded-xl bg-secondary border border-border flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg relative overflow-hidden ring-2 ring-white" style={{ backgroundColor: bgColor }}>
                        <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
                      </div>
                      <span className="text-[9px] font-mono font-bold text-foreground/60 uppercase">{bgColor}</span>
                   </div>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Button onClick={() => handleDownload('png')} disabled={!image} className="h-12 w-full bg-primary text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-xl active:scale-95">
                  Export PNG
                </Button>
                <div className="grid grid-cols-2 gap-2">
                   <Button variant="outline" onClick={() => handleDownload('jpg')} disabled={!image} className="h-10 text-[8px] font-black uppercase border-border">JPG</Button>
                   <Button variant="outline" onClick={handleClear} disabled={!image} className="h-10 text-[8px] font-black uppercase border-border hover:text-destructive">Reset</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
