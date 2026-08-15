
"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Layout, 
  Upload, 
  Download, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  Info,
  Loader2,
  Grid2X2,
  Columns,
  Rows,
  LayoutGrid,
  Palette,
  Maximize,
  ImageIcon,
  Sparkles,
  Settings2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ImageItem {
  id: string;
  src: string;
}

type LayoutMode = '2-cols' | '2-rows' | '3-grid' | '4-grid';

export default function CollageMakerPage() {
  const { toast } = useToast();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [layout, setLayout] = useState<LayoutMode>('4-grid');
  const [spacing, setSpacing] = useState(20);
  const [radius, setRadius] = useState(20);
  const [bgColor, setBgColor] = useState('#ffffff');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > 4) {
      toast({ variant: "destructive", title: "Limit Exceeded", description: "Standard collage matrix supports up to 4 images." });
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newItem: ImageItem = {
          id: Math.random().toString(36).substr(2, 9),
          src: event.target?.result as string,
        };
        setImages(prev => [...prev, newItem]);
      };
      reader.readAsDataURL(file);
    });

    toast({ title: "Assets Imported", description: `Added ${files.length} images to the matrix.` });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const renderCollage = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 1200; // Studio Resolution
    canvas.width = size;
    canvas.height = size;

    // Draw Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);

    if (images.length === 0) return;

    const drawImageInRect = (imgSrc: string, x: number, y: number, w: number, h: number) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.save();
        
        // Create clipping path for radius
        const innerX = x + spacing / 2;
        const innerY = y + spacing / 2;
        const innerW = w - spacing;
        const innerH = h - spacing;
        
        ctx.beginPath();
        ctx.moveTo(innerX + radius, innerY);
        ctx.arcTo(innerX + innerW, innerY, innerX + innerW, innerY + innerH, radius);
        ctx.arcTo(innerX + innerW, innerY + innerH, innerX, innerY + innerH, radius);
        ctx.arcTo(innerX, innerY + innerH, innerX, innerY, radius);
        ctx.arcTo(innerX, innerY, innerX + innerW, innerY, radius);
        ctx.closePath();
        ctx.clip();

        // Cover logic (Center Crop)
        const imgAspect = img.width / img.height;
        const rectAspect = innerW / innerH;
        let dw, dh, dx, dy;

        if (imgAspect > rectAspect) {
          dh = innerH;
          dw = innerH * imgAspect;
          dx = innerX - (dw - innerW) / 2;
          dy = innerY;
        } else {
          dw = innerW;
          dh = innerW / imgAspect;
          dx = innerX;
          dy = innerY - (dh - innerH) / 2;
        }

        ctx.drawImage(img, dx, dy, dw, dh);
        ctx.restore();
      };
      img.src = imgSrc;
    };

    // Layout Logic
    const half = size / 2;
    
    if (layout === '2-cols' && images.length >= 2) {
      drawImageInRect(images[0].src, 0, 0, half, size);
      drawImageInRect(images[1].src, half, 0, half, size);
    } else if (layout === '2-rows' && images.length >= 2) {
      drawImageInRect(images[0].src, 0, 0, size, half);
      drawImageInRect(images[1].src, 0, half, size, half);
    } else if (layout === '3-grid' && images.length >= 3) {
      drawImageInRect(images[0].src, 0, 0, size, half);
      drawImageInRect(images[1].src, 0, half, half, half);
      drawImageInRect(images[2].src, half, half, half, half);
    } else if (layout === '4-grid' && images.length >= 4) {
      drawImageInRect(images[0].src, 0, 0, half, half);
      drawImageInRect(images[1].src, half, 0, half, half);
      drawImageInRect(images[2].src, 0, half, half, half);
      drawImageInRect(images[3].src, half, half, half, half);
    } else {
      // Auto fallback for incomplete grids
      images.forEach((img, i) => {
        if (i === 0) drawImageInRect(img.src, 0, 0, half, half);
        if (i === 1) drawImageInRect(img.src, half, 0, half, half);
        if (i === 2) drawImageInRect(img.src, 0, half, half, half);
        if (i === 3) drawImageInRect(img.src, half, half, half, half);
      });
    }
  }, [images, layout, spacing, radius, bgColor]);

  useEffect(() => {
    renderCollage();
  }, [renderCollage]);

  const handleDownload = () => {
    if (!canvasRef.current || images.length === 0) return;
    const link = document.createElement('a');
    link.download = `qrcanvas-collage-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png', 1.0);
    link.click();
    toast({ title: "Export Success", description: "High-resolution collage saved." });
  };

  const handleClear = () => {
    setImages([]);
    toast({ title: "Studio Reset", description: "Pipeline cleared." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Layout className="w-3.5 h-3.5" /> Geometry Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Collage <span className="text-primary italic">Maker Studio</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl">
          Combine your visual assets into professional high-resolution grids. 100% private client-side synthesis with custom layouts and spacing control.
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
              {/* Asset Management */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Source Matrix ({images.length}/4)</Label>
                  <button onClick={handleClear} className="text-[9px] font-black text-destructive uppercase tracking-widest hover:opacity-70 transition-all">Reset All</button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {images.map((img) => (
                    <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden border border-border group/img bg-secondary shadow-inner">
                      <img src={img.src} alt="Thumb" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => removeImage(img.id)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/60 text-white flex items-center justify-center opacity-0 group/img-hover group-hover/img:opacity-100 transition-all backdrop-blur-md"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {images.length < 4 && (
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-2xl border-2 border-dashed border-border hover:border-primary/40 flex flex-col items-center justify-center gap-2 bg-secondary/30 transition-all group/add"
                    >
                      <Plus className="w-6 h-6 text-foreground/10 group-hover/add:text-primary transition-colors" />
                      <span className="text-[9px] font-black uppercase text-foreground/30 group-hover/add:text-primary">Add Asset</span>
                    </button>
                  )}
                </div>
                <input type="file" ref={fileInputRef} accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
              </div>

              {/* Layout Presets */}
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Layout Presets</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: '2-cols', icon: Columns, label: 'Split Vertical' },
                    { id: '2-rows', icon: Rows, label: 'Split Horizontal' },
                    { id: '3-grid', icon: LayoutGrid, label: 'Featured Top' },
                    { id: '4-grid', icon: Grid2X2, label: 'Quad Matrix' },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setLayout(preset.id as any)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                        layout === preset.id ? "bg-primary text-primary-foreground border-primary shadow-lg" : "bg-background border-border text-foreground/40 hover:text-foreground"
                      )}
                    >
                      <preset.icon className="w-4 h-4" />
                      <span className="text-[9px] font-black uppercase tracking-tight leading-none">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Styling Sliders */}
              <div className="space-y-8 pt-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase text-foreground/40 tracking-widest">
                    <Label>Matrix Gap</Label>
                    <span className="text-primary">{spacing}px</span>
                  </div>
                  <Slider value={[spacing]} min={0} max={100} step={2} onValueChange={(v) => setSpacing(v[0])} />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase text-foreground/40 tracking-widest">
                    <Label>Corner Radius</Label>
                    <span className="text-primary">{radius}px</span>
                  </div>
                  <Slider value={[radius]} min={0} max={100} step={2} onValueChange={(v) => setRadius(v[0])} />
                </div>

                <div className="space-y-4">
                   <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Background Matrix</Label>
                   <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary border border-border">
                      <div className="w-10 h-10 rounded-lg relative overflow-hidden ring-2 ring-white" style={{ backgroundColor: bgColor }}>
                        <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
                      </div>
                      <span className="text-[11px] font-mono font-bold text-foreground/60 uppercase">{bgColor}</span>
                   </div>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={handleDownload}
                  disabled={images.length === 0}
                  className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95"
                >
                  <Download className="w-6 h-6" />
                  Download PNG
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
            <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Privacy Absolute</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                Collage synthesis occurs entirely on your device via the Canvas rendering engine. Your visuals never leave your machine, ensuring 100% data security.
              </p>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative min-h-[600px] flex flex-col">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" /> Studio Master Preview
                </CardTitle>
                <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest">1200x1200px Rendering</div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-white/20 dark:bg-black/20">
              <div className="relative w-full max-w-[600px] aspect-square rounded-3xl overflow-hidden shadow-2xl ring-1 ring-border bg-checkered">
                <canvas 
                  ref={canvasRef} 
                  className="w-full h-full object-contain"
                />
                
                {images.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 opacity-20 pointer-events-none">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-primary" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-foreground">Waiting for visual input</p>
                  </div>
                )}
              </div>
            </CardContent>
            
            <div className="p-8 border-t border-border bg-secondary/20">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[11px] font-medium text-foreground/50 leading-relaxed">
                  <div className="flex items-start gap-4">
                     <Maximize className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                     <div className="space-y-1">
                        <p className="text-foreground font-black uppercase tracking-widest">Hardware Synthesis</p>
                        <p>Our engine utilizes browser-side GPU acceleration to render pixel-perfect grids with zero compression artifacts before export.</p>
                     </div>
                  </div>
                  <div className="flex items-start gap-4">
                     <Grid2X2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                     <div className="space-y-1">
                        <p className="text-foreground font-black uppercase tracking-widest">Adaptive Framing</p>
                        <p>Images are automatically center-cropped using "Cover" logic to maintain layout integrity regardless of source aspect ratios.</p>
                     </div>
                  </div>
               </div>
            </div>
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
      `}</style>
    </div>
  );
}
