"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Shadow,
  Frame,
  Eye,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

type FrameStyle = 'solid' | 'double' | 'rounded' | 'polaroid' | 'classic';

export default function ImageBorderFramePage() {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Settings State
  const [borderWidth, setBorderWidth] = useState(40);
  const [borderColor, setBorderColor] = useState('#ffffff');
  const [frameStyle, setFrameStyle] = useState<FrameStyle>('solid');
  const [padding, setPadding] = useState(0);
  const [useShadow, setUseShadow] = useState(false);
  const [cornerRadius, setCornerRadius] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const renderCanvas = useCallback(() => {
    if (!canvasRef.current || !loadedImage) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const img = loadedImage;
    const b = borderWidth;
    const p = padding;
    const r = cornerRadius;

    // Calculate dimensions based on style
    // Polaroid has a thicker bottom
    const bottomB = frameStyle === 'polaroid' ? b * 3.5 : b;
    
    const targetW = img.width + (b * 2) + (p * 2);
    const targetH = img.height + b + bottomB + (p * 2);

    canvas.width = targetW;
    canvas.height = targetH;

    // 1. Draw Background/Border Layer
    ctx.clearRect(0, 0, targetW, targetH);
    
    if (useShadow) {
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 10;
    }

    ctx.fillStyle = borderColor;
    
    // Draw Frame Shape
    ctx.beginPath();
    ctx.roundRect(0, 0, targetW, targetH, r);
    ctx.fill();
    
    // Reset shadow for inner elements
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // 2. Double Line Effect
    if (frameStyle === 'double') {
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(b/2, b/2, targetW - b, targetH - (b + bottomB) + b);
    }

    // 3. Draw Main Image
    ctx.save();
    const imgX = b + p;
    const imgY = b + p;
    
    // Clipping for image corners if r > 0
    if (r > 0) {
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, img.width, img.height, Math.max(0, r - b - p));
      ctx.clip();
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, imgX, imgY, img.width, img.height);
    ctx.restore();

  }, [loadedImage, borderWidth, borderColor, frameStyle, padding, useShadow, cornerRadius]);

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
          toast({ title: "Asset Integrated", description: "Ready for studio framing." });
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

  const handleClear = () => {
    setImage(null);
    setLoadedImage(null);
    setBorderWidth(40);
    setPadding(0);
    setCornerRadius(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset", description: "Buffers cleared." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Frame className="w-3.5 h-3.5" /> Geometry Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
                Image Border <span className="text-primary italic">& Frame</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional framing studio. Add solid, double, or Polaroid-style borders to any photo with precision geometry and chromatic control locally.
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
        {/* Controls - Left */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
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
                    "relative h-32 rounded-[2rem] border-2 border-dashed border-border hover:border-primary/40 flex flex-col items-center justify-center bg-secondary/30 transition-all cursor-pointer overflow-hidden group/upload",
                    image && "border-solid border-primary/20"
                  )}
                >
                  {image ? (
                    <div className="text-center p-4">
                       <CheckCircle2 className="w-8 h-8 text-primary mx-auto mb-1" />
                       <p className="text-[9px] font-black uppercase text-foreground/40">Visual Matrix Integrated</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                       <ImageIcon className="w-8 h-8 text-foreground/10 group-hover/upload:text-primary transition-all" />
                       <span className="text-[9px] font-black uppercase text-foreground/30">Import Photo</span>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
                </div>
              </div>

              {image && (
                <div className="space-y-10 animate-in zoom-in duration-500">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Frame Style</Label>
                    <div className="grid grid-cols-2 gap-2">
                       {[
                         { id: 'solid', label: 'Solid Block' },
                         { id: 'polaroid', label: 'Polaroid Art' },
                         { id: 'double', label: 'Double Line' },
                         { id: 'rounded', label: 'Extra Rounded' }
                       ].map((s) => (
                         <button
                          key={s.id}
                          onClick={() => {
                            setFrameStyle(s.id as any);
                            if (s.id === 'rounded') setCornerRadius(60);
                            else if (s.id !== 'rounded' && cornerRadius === 60) setCornerRadius(0);
                          }}
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

                  <div className="space-y-8">
                     <div className="space-y-4">
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-foreground/40">
                           <Label className="flex items-center gap-2"><Maximize className="w-3.5 h-3.5 text-primary" /> Border Width</Label>
                           <span className="text-primary font-mono">{borderWidth}px</span>
                        </div>
                        <Slider value={[borderWidth]} min={0} max={200} step={1} onValueChange={(v) => setBorderWidth(v[0])} />
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
                           <Label className="flex items-center gap-2"><RotateCcw className="w-3.5 h-3.5 text-primary" /> Corner Radius</Label>
                           <span className="text-primary font-mono">{cornerRadius}px</span>
                        </div>
                        <Slider value={[cornerRadius]} min={0} max={250} step={1} onValueChange={(v) => setCornerRadius(v[0])} />
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="p-4 rounded-xl bg-secondary border border-border flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <Palette className="w-4 h-4 text-primary" />
                           <span className="text-[9px] font-black uppercase text-foreground/60">Frame Color</span>
                        </div>
                        <div className="w-8 h-8 rounded-lg relative overflow-hidden ring-1 ring-border" style={{ backgroundColor: borderColor }}>
                           <input type="color" value={borderColor} onChange={e => setBorderColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
                        </div>
                     </div>
                     <div className="p-4 rounded-xl bg-secondary border border-border flex items-center justify-between group hover:border-primary/20 transition-all">
                        <div className="flex items-center gap-3">
                           <Zap className="w-4 h-4 text-primary" />
                           <span className="text-[9px] font-black uppercase text-foreground/60">Soft Shadow</span>
                        </div>
                        <Switch checked={useShadow} onCheckedChange={setUseShadow} className="scale-75" />
                     </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-4">
                    <Button onClick={() => handleDownload('png')} className="h-14 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 active:scale-95 transition-all">
                       <Download className="w-6 h-6" /> Export Master
                    </Button>
                    <div className="grid grid-cols-2 gap-3">
                       <Button variant="outline" onClick={() => handleDownload('jpg')} className="h-10 text-[8px] font-black uppercase border-border hover:text-primary">JPG (High-Res)</Button>
                       <Button variant="outline" onClick={handleClear} className="h-10 text-[8px] font-black uppercase border-border hover:text-destructive">Reset Buffer</Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preview - Right */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
              <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                <Eye className="w-3.5 h-3.5" /> Studio Master Preview
              </CardTitle>
              {image && (
                <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[8px] font-black text-primary uppercase tracking-widest">
                   {loadedImage ? `${loadedImage.width + borderWidth*2}x${loadedImage.height + borderWidth*2}` : '0x0'} px
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 bg-[#0a0a0c]">
              <div className="relative w-full max-w-[500px] aspect-square bg-checkered rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 flex items-center justify-center group/canvas">
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
      `}</style>
    </div>
  );
}
