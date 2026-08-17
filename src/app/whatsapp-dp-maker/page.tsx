"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  User, 
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
  Circle,
  Smartphone,
  Maximize2,
  ImageIcon,
  Zap,
  LayoutGrid,
  RotateCcw,
  ArrowRightLeft,
  Crosshair,
  SlidersHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const CANVAS_SIZE = 1080;

export default function WhatsAppDPMakerPage() {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [bgMode, setBgMode] = useState<'blur' | 'color'>('blur');
  const [blurStrength, setBlurStrength] = useState(50);
  const [bgColor, setBgColor] = useState('#000000');
  const [showCircleMask, setShowCircleMask] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const renderCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    if (loadedImage) {
      const img = loadedImage;
      if (bgMode === 'blur') {
        ctx.save();
        ctx.filter = `blur(${blurStrength}px) brightness(0.5)`;
        const bgScale = Math.max(CANVAS_SIZE / img.width, CANVAS_SIZE / img.height);
        const bgW = img.width * bgScale;
        const bgH = img.height * bgScale;
        ctx.drawImage(img, (CANVAS_SIZE - bgW) / 2, (CANVAS_SIZE - bgH) / 2, bgW, bgH);
        ctx.restore();
      }

      ctx.save();
      const baseScale = Math.min(CANVAS_SIZE / img.width, CANVAS_SIZE / img.height);
      const w = img.width * baseScale * zoom;
      const h = img.height * baseScale * zoom;
      const centerX = CANVAS_SIZE / 2 + pos.x;
      const centerY = CANVAS_SIZE / 2 + pos.y;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, centerX - w / 2, centerY - h / 2, w, h);
      ctx.restore();
    }
  }, [loadedImage, zoom, pos, bgMode, bgColor, blurStrength]);

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
          toast({ title: "Visual Imported", description: "Matrix ready for production." });
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
      const previewScale = CANVAS_SIZE / container.clientWidth;
      setPos(prev => ({ x: prev.x + deltaX * previewScale, y: prev.y + deltaY * previewScale }));
    }
    lastMousePos.current = { x: clientX, y: clientY };
  };

  const handleDragEnd = () => { isDragging.current = false; };
  const resetPosition = () => { setPos({ x: 0, y: 0 }); setZoom(1); };
  const applyFillPreset = () => {
    if (!loadedImage) return;
    const scale = Math.max(CANVAS_SIZE / loadedImage.width, CANVAS_SIZE / loadedImage.height) / (Math.min(CANVAS_SIZE / loadedImage.width, CANVAS_SIZE / loadedImage.height));
    setZoom(scale);
    setPos({ x: 0, y: 0 });
  };

  const handleDownload = () => {
    if (!canvasRef.current || !image) return;
    const link = document.createElement('a');
    link.download = `mykit-whatsapp-dp-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png', 1.0);
    link.click();
    toast({ title: "Saved", description: "Master exported." });
  };

  const handleClear = () => {
    setImage(null);
    setLoadedImage(null);
    setPos({ x: 0, y: 0 });
    setZoom(1);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-10 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <User className="w-3.5 h-3.5" /> Identity Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          WhatsApp <span className="text-primary italic">DP Master</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
          Create full-size profile pics with atmospheric blur and zero-loss scaling.
        </p>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">
        {/* Compact Preview - At top on mobile */}
        <div className="w-full lg:col-span-7 order-1 max-md:h-[28vh] max-md:min-h-0 max-md:max-h-[180px] animate-in fade-in duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col h-full">
            <CardHeader className="py-4 border-b border-border bg-secondary/30 hidden md:flex flex-row items-center justify-between">
              <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                <Eye className="w-3.5 h-3.5" /> Preview
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-black uppercase text-foreground/40">Head Guide</span>
                <Switch checked={showCircleMask} onCheckedChange={setShowCircleMask} className="scale-50" />
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center p-2 sm:p-12 bg-[#060608] relative overflow-hidden">
              <div className="relative h-full aspect-square rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 group/canvas cursor-move bg-checkered">
                {image && showCircleMask && (
                  <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
                     <div className="w-full h-full border-[60px] md:border-[100px] border-[#060608]/80 rounded-full" />
                  </div>
                )}
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
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20 pointer-events-none">
                    <LayoutGrid className="w-10 h-10 text-primary" />
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
                <div 
                  onClick={() => !isProcessing && fileInputRef.current?.click()}
                  className={cn(
                    "relative h-24 rounded-2xl border-2 border-dashed border-border hover:border-primary/40 flex flex-col items-center justify-center bg-secondary/30 transition-all cursor-pointer overflow-hidden",
                    image && "border-solid border-primary/20"
                  )}
                >
                  {image ? (
                    <p className="text-[9px] font-black uppercase text-foreground/40">Swap Matrix</p>
                  ) : (
                    <span className="text-[9px] font-black uppercase text-foreground/30 tracking-widest">Import Photo</span>
                  )}
                  <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
                </div>
              </div>

              {image && (
                <div className="space-y-8">
                   <div className="space-y-4">
                      <div className="flex justify-between items-center text-[9px] font-black uppercase text-foreground/40">
                         <Label>Scale</Label>
                         <span className="text-primary">{(zoom * 100).toFixed(0)}%</span>
                      </div>
                      <Slider value={[zoom * 100]} min={50} max={300} step={1} onValueChange={(v) => setZoom(v[0] / 100)} />
                      <div className="flex gap-2">
                         <Button variant="outline" size="sm" onClick={resetPosition} className="flex-1 h-10 text-[8px] font-black uppercase">Center</Button>
                         <Button variant="outline" size="sm" onClick={applyFillPreset} className="flex-1 h-10 text-[8px] font-black uppercase">Fill</Button>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <Label className="text-[9px] font-black text-foreground/40 uppercase">Background</Label>
                      <div className="grid grid-cols-2 gap-2">
                         <button onClick={() => setBgMode('blur')} className={cn("h-10 rounded-xl border text-[8px] font-black uppercase transition-all", bgMode === 'blur' ? "bg-primary text-white border-primary" : "bg-background border-border text-foreground/40")}>Blur</button>
                         <button onClick={() => setBgMode('color')} className={cn("h-10 rounded-xl border text-[8px] font-black uppercase transition-all", bgMode === 'color' ? "bg-primary text-white border-primary" : "bg-background border-border text-foreground/40")}>Solid</button>
                      </div>
                      {bgMode === 'blur' ? (
                        <Slider value={[blurStrength]} min={0} max={100} step={1} onValueChange={(v) => setBlurStrength(v[0])} />
                      ) : (
                        <div className="p-3 rounded-xl bg-secondary border border-border flex items-center justify-between">
                           <div className="w-8 h-8 rounded-lg relative overflow-hidden ring-1 ring-white" style={{ backgroundColor: bgColor }}>
                             <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
                           </div>
                           <span className="text-[9px] font-mono font-bold text-foreground/60 uppercase">{bgColor}</span>
                        </div>
                      )}
                   </div>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Button onClick={handleDownload} disabled={!image} className="h-12 w-full bg-primary text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-xl active:scale-95">
                  Export
                </Button>
                {image && (
                  <Button variant="ghost" onClick={handleClear} className="h-10 text-foreground/30 hover:text-destructive text-[8px] font-black uppercase tracking-widest">
                    Clear
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
