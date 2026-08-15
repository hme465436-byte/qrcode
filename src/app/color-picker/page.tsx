"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Pipette, 
  Upload, 
  Copy, 
  Trash2, 
  Info,
  CheckCircle2,
  RotateCcw,
  Palette,
  MousePointer2,
  Maximize2,
  CopyCheck,
  Languages,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type ColorData = {
  hex: string;
  rgb: string;
  hsl: string;
};

export default function ColorPickerPage() {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [pickedColor, setPickedColor] = useState<ColorData | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [magnifierData, setMagnifierData] = useState<{ x: number, y: number, show: boolean }>({ x: 0, y: 0, show: false });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const magnifierCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return `hsl(${Math.round(h * 360)}°, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        const img = new Image();
        img.onload = () => {
          setImage(src);
          if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) return;

            // Set canvas size based on image but capped for UI
            const maxWidth = 1200;
            const scale = Math.min(1, maxWidth / img.width);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          }
          toast({ title: "Asset Loaded", description: "Studio ready for chromatic sampling." });
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    }
  };

  const pickColor = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    // Adjust for actual canvas pixels
    const actualX = Math.floor(x * (canvas.width / rect.width));
    const actualY = Math.floor(y * (canvas.height / rect.height));

    const pixel = ctx.getImageData(actualX, actualY, 1, 1).data;
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
    const rgb = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
    const hsl = rgbToHsl(pixel[0], pixel[1], pixel[2]);

    const newColor = { hex, rgb, hsl };
    setPickedColor(newColor);
    setHistory(prev => [hex, ...prev.filter(c => c !== hex)].slice(0, 8));
  };

  const updateMagnifier = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !magnifierCanvasRef.current) return;
    const canvas = canvasRef.current;
    const magCanvas = magnifierCanvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const magCtx = magCanvas.getContext('2d');
    if (!ctx || !magCtx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMagnifierData({ x, y, show: true });

    const actualX = x * (canvas.width / rect.width);
    const actualY = y * (canvas.height / rect.height);

    const size = 15; // sample size
    const zoom = 10; // zoom level

    magCtx.imageSmoothingEnabled = false;
    magCtx.clearRect(0, 0, magCanvas.width, magCanvas.height);
    magCtx.drawImage(
      canvas,
      actualX - size / 2, actualY - size / 2, size, size,
      0, 0, magCanvas.width, magCanvas.height
    );

    // Crosshair in magnifier
    magCtx.strokeStyle = 'white';
    magCtx.lineWidth = 1;
    magCtx.strokeRect(magCanvas.width / 2 - zoom / 2, magCanvas.height / 2 - zoom / 2, zoom, zoom);
    magCtx.strokeStyle = 'black';
    magCtx.strokeRect(magCanvas.width / 2 - zoom / 2 - 1, magCanvas.height / 2 - zoom / 2 - 1, zoom + 2, zoom + 2);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(label);
    toast({ title: `${label} Copied`, description: "Chromatic data saved to clipboard." });
    setTimeout(() => setIsCopied(null), 2000);
  };

  const handleClear = () => {
    setImage(null);
    setPickedColor(null);
    setMagnifierData({ ...magnifierData, show: false });
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset", description: "All visuals purged." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Pipette className="w-3.5 h-3.5" /> Design Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Color <span className="text-primary italic">Picker Studio</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl">
          Extract precise chromatic data from any image. Professional HEX, RGB, and HSL matrix sampling with integrated pixel-magnification.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Main Canvas Area */}
        <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <Maximize2 className="w-6 h-6" />
                </div>
                Visual Matrix
              </CardTitle>
              {!image && (
                 <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[8px] font-black text-primary uppercase tracking-widest">Awaiting Import</div>
              )}
            </CardHeader>
            
            <CardContent className="pt-10">
              {!image ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group/upload h-[400px] rounded-[2.5rem] border-2 border-dashed border-border hover:border-primary/40 transition-all flex flex-col items-center justify-center bg-secondary/30 overflow-hidden cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-[1.5rem] bg-background border border-border flex items-center justify-center text-foreground/20 group-hover:text-primary group-hover:scale-110 transition-all mb-6 shadow-xl">
                    <Upload className="w-8 h-8" />
                  </div>
                  <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest group-hover:text-primary transition-colors text-center px-10 leading-relaxed">
                    Drop high-res imagery or click to browse<br />
                    <span className="text-[8px] opacity-60">(JPG, PNG, WebP)</span>
                  </p>
                  <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
                </div>
              ) : (
                <div className="relative cursor-crosshair overflow-hidden rounded-2xl bg-secondary shadow-inner">
                  <canvas 
                    ref={canvasRef} 
                    onClick={pickColor}
                    onMouseMove={updateMagnifier}
                    onMouseLeave={() => setMagnifierData({ ...magnifierData, show: false })}
                    className="max-w-full h-auto mx-auto block"
                  />
                  
                  {/* Magnifier Follower */}
                  {magnifierData.show && (
                    <div 
                      className="absolute pointer-events-none w-32 h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden z-20 bg-background"
                      style={{ 
                        left: magnifierData.x, 
                        top: magnifierData.y, 
                        transform: 'translate(-50%, -150%)' 
                      }}
                    >
                      <canvas ref={magnifierCanvasRef} width={150} height={150} className="w-full h-full" />
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center pointer-events-none">
                     <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center gap-2 text-[8px] font-black text-white uppercase tracking-widest">
                       <MousePointer2 className="w-3 h-3 text-primary" /> Sampling Active
                     </div>
                     <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={(e) => { e.stopPropagation(); handleClear(); }} 
                      className="h-8 px-3 rounded-full pointer-events-auto bg-red-500/80 hover:bg-red-600 text-[8px] font-black uppercase tracking-widest shadow-lg"
                    >
                      <Trash2 className="w-3 h-3 mr-2" /> Purge Matrix
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
            <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Chromatic Intel</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                Our sampler uses 1:1 pixel mapping. If the image is large, it's scaled for performance while maintaining source data integrity. Sampling is performed entirely on your device.
              </p>
            </div>
          </div>
        </div>

        {/* Results Sidebar */}
        <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-3">
                <Pipette className="w-4 h-4" /> Result Panel
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-10">
              {/* Color Preview */}
              <div className="space-y-4">
                <div className="w-full h-40 rounded-[2.5rem] shadow-2xl border-4 border-white dark:border-white/10 ring-1 ring-border transition-all duration-500" style={{ backgroundColor: pickedColor?.hex || '#f3f4f6' }}>
                  {!pickedColor && (
                    <div className="w-full h-full flex flex-col items-center justify-center opacity-10">
                      <Palette className="w-12 h-12 mb-2" />
                      <p className="text-[9px] font-black uppercase tracking-widest">No Sample</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Data Fields */}
              <div className="space-y-6">
                {[
                  { label: 'HEX', value: pickedColor?.hex || '#000000', icon: Languages },
                  { label: 'RGB', value: pickedColor?.rgb || 'rgb(0, 0, 0)', icon: Zap },
                  { label: 'HSL', value: pickedColor?.hsl || 'hsl(0, 0%, 0%)', icon: RotateCcw }
                ].map((field) => (
                  <div key={field.label} className="space-y-2 group/field">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">{field.label} Protocol</Label>
                    <div className="flex gap-2">
                      <div className="flex-1 h-12 bg-secondary border border-border rounded-xl flex items-center px-4 font-mono text-xs font-bold text-foreground overflow-hidden truncate">
                        {field.value}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        disabled={!pickedColor}
                        onClick={() => handleCopy(field.value, field.label)}
                        className={cn(
                          "h-12 w-12 rounded-xl bg-secondary border border-border hover:bg-primary hover:text-primary-foreground transition-all shrink-0",
                          isCopied === field.label && "bg-primary text-primary-foreground"
                        )}
                      >
                        {isCopied === field.label ? <CopyCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* History Palette */}
              {history.length > 0 && (
                <div className="pt-8 border-t border-border space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Recent Samples</Label>
                    <button onClick={() => setHistory([])} className="text-[9px] font-black text-primary/60 uppercase hover:text-primary transition-colors">Reset</button>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {history.map((color, i) => (
                      <button
                        key={`${color}-${i}`}
                        onClick={() => {
                          const r = parseInt(color.slice(1, 3), 16);
                          const g = parseInt(color.slice(3, 5), 16);
                          const b = parseInt(color.slice(5, 7), 16);
                          setPickedColor({
                            hex: color,
                            rgb: `rgb(${r}, ${g}, ${b})`,
                            hsl: rgbToHsl(r, g, b)
                          });
                        }}
                        className="aspect-square rounded-xl border border-white dark:border-white/10 shadow-lg ring-1 ring-border transition-transform hover:scale-110 active:scale-95"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {!pickedColor && (
                <div className="p-6 rounded-2xl bg-secondary border border-border text-center space-y-2">
                   <Pipette className="w-6 h-6 text-foreground/10 mx-auto" />
                   <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">Select a pixel to begin</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
