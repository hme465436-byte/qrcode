"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Square, 
  Upload, 
  Download, 
  Trash2, 
  Settings2, 
  Info,
  CheckCircle2,
  Maximize2,
  ImageIcon,
  Zap,
  LayoutGrid,
  RotateCcw,
  Palette,
  Maximize,
  Sparkles,
  Loader2,
  Move,
  Camera,
  Layers,
  Frame,
  Eye,
  ShieldCheck,
  Type,
  Scaling,
  Smartphone,
  Instagram,
  Youtube,
  Image as ImageIconLucide,
  Contrast,
  Circle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

type FrameStyle = 'solid' | 'double' | 'dashed' | 'gradient' | 'polaroid' | 'film' | 'vintage-gold' | 'neon-glow';
type PatternType = 'none' | 'dots' | 'stripes' | 'checker';
type AspectPreset = 'original' | '1:1' | '16:9' | '9:16' | '4:5';

export default function ImageBorderFramePage() {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Settings State
  const [borderWidth, setBorderWidth] = useState(40);
  const [borderColor, setBorderColor] = useState('#ffffff');
  const [borderOpacity, setBorderOpacity] = useState(1);
  const [canvasColor, setCanvasColor] = useState('#0a0a0c');
  const [frameStyle, setFrameStyle] = useState<FrameStyle>('solid');
  const [padding, setPadding] = useState(0);
  const [cornerRadius, setCornerRadius] = useState(0);
  const [pattern, setPattern] = useState<PatternType>('none');
  const [aspect, setAspect] = useState<AspectPreset>('original');
  const [zoom, setZoom] = useState(1);
  
  // Polaroid Text
  const [caption, setCaption] = useState('');
  const [captionColor, setCaptionColor] = useState('#000000');
  const [captionSize, setCaptionSize] = useState(40);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const drawPattern = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    if (pattern === 'none') return;
    ctx.save();
    ctx.globalAlpha = 0.05;
    if (pattern === 'dots') {
      for (let x = 0; x < w; x += 20) {
        for (let y = 0; y < h; y += 20) {
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (pattern === 'stripes') {
      ctx.lineWidth = 2;
      for (let i = -h; i < w; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + h, h);
        ctx.stroke();
      }
    } else if (pattern === 'checker') {
      const size = 30;
      for (let x = 0; x < w; x += size * 2) {
        for (let y = 0; y < h; y += size * 2) {
          ctx.fillRect(x, y, size, size);
          ctx.fillRect(x + size, y + size, size, size);
        }
      }
    }
    ctx.restore();
  };

  const renderCanvas = useCallback(() => {
    if (!canvasRef.current || !loadedImage) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const img = loadedImage;
    const b = borderWidth;
    const p = padding;
    const r = cornerRadius;

    // Calculate base dimensions
    let targetW = img.width;
    let targetH = img.height;

    if (aspect === '1:1') {
      const size = Math.max(img.width, img.height);
      targetW = size;
      targetH = size;
    } else if (aspect === '16:9') {
      targetW = Math.max(img.width, img.height * (16/9));
      targetH = targetW * (9/16);
    } else if (aspect === '9:16') {
      targetH = Math.max(img.height, img.width * (16/9));
      targetW = targetH * (9/16);
    } else if (aspect === '4:5') {
      targetW = Math.max(img.width, img.height * (4/5));
      targetH = targetW * (5/4);
    }

    // Add border space to canvas
    const bottomExtra = (frameStyle === 'polaroid' || frameStyle === 'film') ? b * 3 : b;
    const totalW = targetW + (b * 2) + (p * 2);
    const totalH = targetH + b + bottomExtra + (p * 2);

    canvas.width = totalW;
    canvas.height = totalH;

    // 1. Draw Canvas Background
    ctx.fillStyle = canvasColor;
    ctx.fillRect(0, 0, totalW, totalH);
    drawPattern(ctx, totalW, totalH);

    // 2. Draw Frame/Border Layer
    ctx.save();
    ctx.globalAlpha = borderOpacity;
    ctx.fillStyle = borderColor;
    
    if (frameStyle === 'gradient') {
      const grad = ctx.createLinearGradient(0, 0, totalW, totalH);
      grad.addColorStop(0, borderColor);
      grad.addColorStop(1, '#000000');
      ctx.fillStyle = grad;
    }

    if (frameStyle === 'neon-glow') {
      ctx.shadowColor = borderColor;
      ctx.shadowBlur = b;
    }

    // Draw main frame body
    ctx.beginPath();
    ctx.roundRect(0, 0, totalW, totalH, r);
    ctx.fill();

    if (frameStyle === 'double') {
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 4;
      ctx.strokeRect(b/2, b/2, totalW - b, totalH - (b + bottomExtra) + b);
    } else if (frameStyle === 'dashed') {
      ctx.strokeStyle = '#000';
      ctx.setLineDash([20, 20]);
      ctx.lineWidth = 2;
      ctx.strokeRect(b/2, b/2, totalW - b, totalH - (b + bottomExtra) + b);
    } else if (frameStyle === 'vintage-gold') {
      ctx.strokeStyle = '#D4AF37'; // Gold
      ctx.lineWidth = 6;
      ctx.strokeRect(4, 4, totalW - 8, totalH - 8);
      ctx.strokeRect(12, 12, totalW - 24, totalH - 24);
    }
    ctx.restore();

    // 3. Draw Main Image
    ctx.save();
    const imgDrawW = img.width * zoom;
    const imgDrawH = img.height * zoom;
    const imgX = (totalW - imgDrawW) / 2;
    const imgY = b + p + (targetH - imgDrawH) / 2;
    
    // Clipping for image corners
    if (r > 0) {
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, imgDrawW, imgDrawH, Math.max(0, r - b - p));
      ctx.clip();
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, imgX, imgY, imgDrawW, imgDrawH);
    ctx.restore();

    // 4. Polaroid Text
    if ((frameStyle === 'polaroid' || frameStyle === 'film') && caption.trim()) {
      ctx.save();
      ctx.fillStyle = captionColor;
      ctx.textAlign = 'center';
      ctx.font = `bold ${captionSize}px "Inter", sans-serif`;
      ctx.fillText(caption.toUpperCase(), totalW / 2, totalH - (bottomExtra * 0.4));
      ctx.restore();
    }

  }, [loadedImage, borderWidth, borderColor, borderOpacity, canvasColor, frameStyle, padding, cornerRadius, pattern, aspect, zoom, caption, captionColor, captionSize]);

  useEffect(() => {
    if (loadedImage) renderCanvas();
  }, [renderCanvas, loadedImage]);

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
          setIsProcessing(false);
          toast({ title: "Asset Integrated", description: "Ready for advanced framing." });
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = (format: 'png' | 'jpg') => {
    if (!canvasRef.current || !image) return;
    const link = document.createElement('a');
    link.download = `mykit-framed-${Date.now()}.${format}`;
    link.href = canvasRef.current.toDataURL(format === 'png' ? 'image/png' : 'image/jpeg', 0.95);
    link.click();
    toast({ title: "Export Success", description: `${format.toUpperCase()} master saved.` });
  };

  const applyAspect = (val: AspectPreset) => {
    setAspect(val);
    toast({ title: "Aspect Calibrated", description: `Active profile: ${val.toUpperCase()}` });
  };

  const handleClear = () => {
    setImage(null);
    setLoadedImage(null);
    setBorderWidth(40);
    setPadding(0);
    setCornerRadius(0);
    setCaption('');
    setZoom(1);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset", description: "Buffers cleared." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20 max-w-full">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Frame className="w-3.5 h-3.5" /> Geometry Suite Pro
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
                Image Border <span className="text-primary italic">& Frame Studio</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Advanced cinematic framing engine. Calibrate aspect ratios for social media, apply procedural background patterns, and synthesize typographic captions locally.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="image-border-frame" />
              {image && (
                <Button variant="outline" onClick={handleClear} className="h-12 px-6 rounded-xl border-border bg-secondary text-[10px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                  <Trash2 className="w-4 h-4 mr-2" /> Reset
                </Button>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Workspace - Left */}
        <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-left-6 duration-1000">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[700px]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
              <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                <Eye className="w-3.5 h-3.5" /> Studio Master Preview
              </CardTitle>
              {image && (
                <div className="flex gap-2">
                   <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[8px] font-black text-primary uppercase tracking-widest">
                      {canvasRef.current ? `${canvasRef.current.width}x${canvasRef.current.height}` : '0x0'} px
                   </div>
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 bg-[#060608] relative">
              <div className="relative w-full max-w-[600px] aspect-square bg-checkered rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 flex items-center justify-center group/canvas">
                <canvas 
                  ref={canvasRef} 
                  className={cn(
                    "max-w-full max-h-full object-contain transition-all duration-500",
                    isProcessing && "opacity-50 blur-sm"
                  )}
                />

                {!image && !isProcessing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 opacity-20 pointer-events-none">
                    <Maximize2 className="w-20 h-20 text-primary" />
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-foreground">Awaiting Visual Link</p>
                  </div>
                )}

                {isProcessing && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-md flex flex-col items-center justify-center gap-4 z-40">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-[10px] font-black uppercase text-primary tracking-widest">Re-matricing Matrix...</p>
                  </div>
                )}
              </div>

              {image && (
                 <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg">
                   <div className="p-6 rounded-[2rem] bg-secondary border border-border flex items-start gap-4 group hover:border-primary/20 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all">
                         <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-[10px] font-black uppercase text-foreground tracking-widest">Privacy Absolute</h4>
                        <p className="text-[10px] text-foreground/40 leading-relaxed font-medium">100% local pixel synthesis. Imagery never leaves your hardware.</p>
                      </div>
                   </div>
                   <div className="p-6 rounded-[2rem] bg-secondary border border-border flex items-start gap-4 group hover:border-primary/20 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all">
                         <Maximize className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-[10px] font-black uppercase text-foreground tracking-widest">Master Integrity</h4>
                        <p className="text-[10px] text-foreground/40 leading-relaxed font-medium">Borders are added around the source to maintain 1:1 original fidelity.</p>
                      </div>
                   </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Controls - Right */}
        <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-6 duration-700">
          {/* Aspect Presets Row */}
          <Card className="glass-card border-border shadow-xl">
             <CardHeader className="py-4 border-b border-border bg-secondary/30">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Aspect Profiles</Label>
             </CardHeader>
             <CardContent className="p-4 grid grid-cols-5 gap-2">
                {[
                  { id: 'original', icon: ImageIconLucide, label: 'Orig' },
                  { id: '1:1', icon: Square, label: '1:1' },
                  { id: '4:5', icon: Smartphone, label: '4:5' },
                  { id: '16:9', icon: Youtube, label: '16:9' },
                  { id: '9:16', icon: Smartphone, label: '9:16' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => applyAspect(p.id as any)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 p-2 rounded-xl border transition-all",
                      aspect === p.id ? "bg-primary text-white border-primary shadow-lg" : "bg-background border-border text-foreground/40 hover:text-primary"
                    )}
                  >
                    <p.icon className="w-4 h-4" />
                    <span className="text-[8px] font-black uppercase">{p.label}</span>
                  </button>
                ))}
             </CardContent>
          </Card>

          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <CardHeader className="pb-6 border-b border-border bg-secondary/30">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                <Settings2 className="w-5 h-5 text-primary" /> Matrix Parameters
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
                  <ImageIcon className="w-6 h-6 text-foreground/10 mb-1" />
                  <span className="text-[9px] font-black uppercase text-foreground/30">{image ? 'Swap Matrix' : 'Import Photo'}</span>
                  <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
                </div>
              </div>

              {image && (
                <div className="space-y-8 animate-in zoom-in duration-500">
                  <div className="space-y-6">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Style Profile</Label>
                    <div className="grid grid-cols-2 gap-2">
                       {[
                         { id: 'solid', label: 'Solid Block' },
                         { id: 'polaroid', label: 'Polaroid Art' },
                         { id: 'film', label: 'Film / Instant' },
                         { id: 'vintage-gold', label: 'Vintage Gold' },
                         { id: 'double', label: 'Double Line' },
                         { id: 'dashed', label: 'Dashed Edge' },
                         { id: 'gradient', label: 'Gradient' },
                         { id: 'neon-glow', label: 'Neon Glow' }
                       ].map((s) => (
                         <button
                          key={s.id}
                          onClick={() => setFrameStyle(s.id as any)}
                          className={cn(
                            "p-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all",
                            frameStyle === s.id ? "bg-primary text-white border-primary shadow-lg" : "bg-background border-border text-foreground/40 hover:text-primary"
                          )}
                         >
                           {s.label}
                         </button>
                       ))}
                    </div>
                  </div>

                  {/* Main Sliders */}
                  <div className="space-y-6">
                     <div className="space-y-4">
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-foreground/40">
                           <Label className="flex items-center gap-2"><Maximize className="w-3.5 h-3.5 text-primary" /> Border Width</Label>
                           <span className="text-primary font-mono">{borderWidth}px</span>
                        </div>
                        <Slider value={[borderWidth]} min={0} max={200} step={1} onValueChange={(v) => setBorderWidth(v[0])} />
                     </div>

                     <div className="space-y-4">
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-foreground/40">
                           <Label className="flex items-center gap-2"><RotateCcw className="w-3.5 h-3.5 text-primary" /> Corner Radius</Label>
                           <span className="text-primary font-mono">{cornerRadius}px</span>
                        </div>
                        <Slider value={[cornerRadius]} min={0} max={250} step={1} onValueChange={(v) => setCornerRadius(v[0])} />
                     </div>

                     <div className="space-y-4">
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-foreground/40">
                           <Label className="flex items-center gap-2"><LayoutGrid className="w-3.5 h-3.5 text-primary" /> Inner Padding</Label>
                           <span className="text-primary font-mono">{padding}px</span>
                        </div>
                        <Slider value={[padding]} min={0} max={100} step={1} onValueChange={(v) => setPadding(v[0])} />
                     </div>

                     <div className="space-y-4">
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-foreground/40">
                           <Label className="flex items-center gap-2"><Scaling className="w-3.5 h-3.5 text-primary" /> Optical Zoom</Label>
                           <span className="text-primary font-mono">{(zoom * 100).toFixed(0)}%</span>
                        </div>
                        <Slider value={[zoom * 100]} min={50} max={200} step={1} onValueChange={(v) => setZoom(v[0] / 100)} />
                     </div>
                  </div>

                  {/* Chromatic Controls */}
                  <div className="grid grid-cols-1 gap-4 pt-4 border-t border-border">
                     <div className="p-4 rounded-xl bg-secondary border border-border flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <Palette className="w-4 h-4 text-primary" />
                           <span className="text-[9px] font-black uppercase text-foreground/60">Border Matrix</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <Slider value={[borderOpacity * 100]} min={0} max={100} step={1} onValueChange={v => setBorderOpacity(v[0]/100)} className="w-20" />
                           <div className="w-8 h-8 rounded-lg relative overflow-hidden ring-1 ring-border" style={{ backgroundColor: borderColor }}>
                              <input type="color" value={borderColor} onChange={e => setBorderColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
                           </div>
                        </div>
                     </div>
                     <div className="p-4 rounded-xl bg-secondary border border-border flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <Contrast className="w-4 h-4 text-primary" />
                           <span className="text-[9px] font-black uppercase text-foreground/60">Canvas Background</span>
                        </div>
                        <div className="w-8 h-8 rounded-lg relative overflow-hidden ring-1 ring-border" style={{ backgroundColor: canvasColor }}>
                           <input type="color" value={canvasColor} onChange={e => setCanvasColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
                        </div>
                     </div>
                  </div>

                  {/* Background Patterns */}
                  <div className="space-y-4">
                     <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Canvas Pattern</Label>
                     <div className="grid grid-cols-4 gap-2">
                        {['none', 'dots', 'stripes', 'checker'].map(p => (
                          <button key={p} onClick={() => setPattern(p as PatternType)} className={cn("h-10 rounded-xl border text-[8px] font-black uppercase transition-all", pattern === p ? "bg-primary text-white border-primary" : "bg-background border-border text-foreground/40")}>
                            {p}
                          </button>
                        ))}
                     </div>
                  </div>

                  {/* Polaroid Text Support */}
                  {(frameStyle === 'polaroid' || frameStyle === 'film') && (
                    <div className="space-y-4 p-6 rounded-[2rem] bg-primary/5 border border-primary/10 animate-in slide-in-from-top-4">
                       <div className="flex items-center gap-3 text-primary mb-2">
                          <Type className="w-4 h-4" />
                          <Label className="text-[10px] font-black uppercase tracking-widest">Typographic Caption</Label>
                       </div>
                       <Input 
                        placeholder="Enter text..." 
                        value={caption} 
                        onChange={e => setCaption(e.target.value)}
                        className="h-12 bg-background border-border rounded-xl text-xs font-bold"
                       />
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <p className="text-[8px] font-black text-foreground/30 uppercase">Size</p>
                             <Slider value={[captionSize]} min={10} max={100} step={1} onValueChange={v => setCaptionSize(v[0])} />
                          </div>
                          <div className="space-y-2">
                             <p className="text-[8px] font-black text-foreground/30 uppercase">Color</p>
                             <div className="h-10 rounded-xl border border-border bg-background flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: captionColor }}>
                                <input type="color" value={captionColor} onChange={e => setCaptionColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
                             </div>
                          </div>
                       </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 pt-4">
                    <Button onClick={() => handleDownload('png')} className="h-14 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 active:scale-95 transition-all">
                       <Download className="w-6 h-6" /> Export Master
                    </Button>
                    <div className="grid grid-cols-2 gap-3">
                       <Button variant="outline" onClick={() => handleDownload('jpg')} className="h-10 text-[8px] font-black uppercase border-border hover:text-primary">JPG (High-Res)</Button>
                       <Button variant="outline" onClick={handleClear} className="h-10 text-[8px] font-black uppercase border-border hover:text-destructive">Reset Studio</Button>
                    </div>
                  </div>
                </div>
              )}
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
      `}</style>
    </div>
  );
}

