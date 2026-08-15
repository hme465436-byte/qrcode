"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Palette, 
  Copy, 
  Trash2, 
  Info,
  CheckCircle2,
  RotateCcw,
  Sliders,
  Droplet,
  Zap,
  Languages,
  MousePointer2,
  Printer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type ColorState = {
  hex: string;
  r: number;
  g: number;
  b: number;
  h: number;
  s: number;
  l: number;
  v: number;
  c: number;
  m: number;
  y: number;
  k: number;
};

export default function RgbPickerPage() {
  const { toast } = useToast();
  const [color, setColor] = useState<ColorState>({
    hex: '#2563EB',
    r: 37, g: 99, b: 235,
    h: 221, s: 84, l: 53,
    v: 92,
    c: 84, m: 58, y: 0, k: 8
  });
  const [history, setHistory] = useState<string[]>([]);
  const [isCopied, setIsCopied] = useState<string | null>(null);

  // Conversion Helpers
  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
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
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const rgbToHsv = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s, v = max;
    const d = max - min;
    s = max === 0 ? 0 : d / max;
    if (max !== min) {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
  };

  const rgbToCmyk = (r: number, g: number, b: number) => {
    let c = 1 - (r / 255);
    let m = 1 - (g / 255);
    let y = 1 - (b / 255);
    let k = Math.min(c, Math.min(m, y));
    
    c = Math.round((c - k) / (1 - k) * 100) || 0;
    m = Math.round((m - k) / (1 - k) * 100) || 0;
    y = Math.round((y - k) / (1 - k) * 100) || 0;
    k = Math.round(k * 100) || 0;
    
    return { c, m, y, k };
  };

  const updateFromRgb = useCallback((r: number, g: number, b: number) => {
    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);
    const hsv = rgbToHsv(r, g, b);
    const cmyk = rgbToCmyk(r, g, b);
    setColor({
      hex, r, g, b,
      h: hsl.h, s: hsl.s, l: hsl.l,
      v: hsv.v,
      ...cmyk
    });
  }, []);

  const handleHexChange = (val: string) => {
    let cleanHex = val.startsWith('#') ? val : `#${val}`;
    if (/^#[0-9A-F]{6}$/i.test(cleanHex)) {
      const rgb = hexToRgb(cleanHex);
      updateFromRgb(rgb.r, rgb.g, rgb.b);
    } else {
      // Just update the hex string for user feedback, but don't convert until valid
      setColor(prev => ({ ...prev, hex: val.toUpperCase() }));
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(label);
    toast({ title: `${label} Copied`, description: "Chromatic data saved to clipboard." });
    setTimeout(() => setIsCopied(null), 2000);
    setHistory(prev => [color.hex, ...prev.filter(c => c !== color.hex)].slice(0, 8));
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Palette className="w-3.5 h-3.5" /> Design Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          RGB <span className="text-primary italic">Picker Studio</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl">
          Professional chromatic engineering utility. Mix, convert, and extract precision values across HEX, RGB, HSL, HSV, and CMYK color spaces.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Main Picker Area */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <Sliders className="w-6 h-6" />
                </div>
                Master Controls
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-10 space-y-12">
              {/* Large Swatch & Visual Picker */}
              <div className="flex flex-col sm:flex-row gap-8 items-center">
                <div 
                  className="w-full sm:w-64 h-64 rounded-[3rem] shadow-2xl border-8 border-white dark:border-white/10 ring-1 ring-border transition-all duration-500 relative overflow-hidden group/swatch"
                  style={{ backgroundColor: color.hex }}
                >
                  <input 
                    type="color" 
                    value={color.hex} 
                    onChange={(e) => handleHexChange(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer scale-[10]"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover/swatch:opacity-100 transition-opacity bg-black/20 backdrop-blur-[2px] pointer-events-none">
                     <MousePointer2 className="w-8 h-8 text-white mb-2" />
                     <p className="text-[10px] font-black text-white uppercase tracking-widest">Adjust Spectrum</p>
                  </div>
                </div>

                <div className="flex-1 w-full space-y-8">
                   <div className="space-y-4">
                      <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Hex Protocol</Label>
                      <div className="flex gap-2">
                        <Input 
                          value={color.hex}
                          onChange={(e) => handleHexChange(e.target.value)}
                          className="h-14 bg-secondary border-border rounded-2xl text-xl font-mono font-bold text-center uppercase"
                        />
                        <Button 
                          onClick={() => handleCopy(color.hex, 'HEX')}
                          className="h-14 w-14 rounded-2xl bg-primary shadow-lg shadow-primary/20 shrink-0"
                        >
                          {isCopied === 'HEX' ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </Button>
                      </div>
                   </div>

                   <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'R', val: color.r, key: 'r' },
                        { label: 'G', val: color.g, key: 'g' },
                        { label: 'B', val: color.b, key: 'b' }
                      ].map((channel) => (
                        <div key={channel.key} className="space-y-2">
                           <Label className="text-[9px] font-black text-foreground/30 uppercase tracking-widest ml-1">{channel.label}</Label>
                           <Input 
                            type="number"
                            min="0"
                            max="255"
                            value={channel.val}
                            onChange={(e) => {
                              const v = Math.min(255, Math.max(0, parseInt(e.target.value) || 0));
                              const next = { r: color.r, g: color.g, b: color.b, [channel.key]: v };
                              updateFromRgb(next.r, next.g, next.b);
                            }}
                            className="h-12 bg-secondary border-border rounded-xl text-sm font-mono font-bold text-center"
                           />
                        </div>
                      ))}
                   </div>
                </div>
              </div>

              {/* Sliders Section */}
              <div className="space-y-10 pt-4">
                {[
                  { label: 'Red Channel', key: 'r', max: 255, color: 'bg-red-500' },
                  { label: 'Green Channel', key: 'g', max: 255, color: 'bg-green-500' },
                  { label: 'Blue Channel', key: 'b', max: 255, color: 'bg-blue-500' }
                ].map((adj) => (
                  <div key={adj.key} className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-foreground/50">
                      <Label>{adj.label}</Label>
                      <span className="font-mono text-primary">{color[adj.key as keyof ColorState] as number}</span>
                    </div>
                    <Slider 
                      value={[color[adj.key as keyof ColorState] as number]} 
                      min={0} 
                      max={adj.max} 
                      step={1} 
                      onValueChange={(v) => {
                        const next = { r: color.r, g: color.g, b: color.b, [adj.key]: v[0] };
                        updateFromRgb(next.r, next.g, next.b);
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* History */}
              {history.length > 0 && (
                <div className="pt-8 border-t border-border space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Studio History</Label>
                    <button onClick={() => setHistory([])} className="text-[9px] font-black text-primary/60 uppercase hover:text-primary transition-colors">Reset</button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {history.map((h, i) => (
                      <button
                        key={`${h}-${i}`}
                        onClick={() => handleHexChange(h)}
                        className="w-10 h-10 rounded-xl border border-white dark:border-white/10 shadow-lg ring-1 ring-border transition-transform hover:scale-110 active:scale-95"
                        style={{ backgroundColor: h }}
                        title={h}
                      />
                    ))}
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
                Our engine uses high-precision matrix math for color space translation. Processing is 100% local, ensuring consistent profile generation for both web and print production.
              </p>
            </div>
          </div>
        </div>

        {/* Analytics Sidebar */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-3">
                <Zap className="w-4 h-4 fill-primary/20" /> Matrix Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-10">
              {/* Output Fields */}
              <div className="space-y-8">
                {[
                  { label: 'RGB', value: `rgb(${color.r}, ${color.g}, ${color.b})`, icon: Droplet },
                  { label: 'HSL', value: `hsl(${color.h}°, ${color.s}%, ${color.l}%)`, icon: RotateCcw },
                  { label: 'HSV', value: `hsv(${color.h}°, ${color.s}%, ${color.v}%)`, icon: MousePointer2 }
                ].map((field) => (
                  <div key={field.label} className="space-y-3 group/field">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">{field.label} Protocol</Label>
                    <div className="flex gap-2">
                      <div className="flex-1 h-12 bg-secondary border border-border rounded-xl flex items-center px-4 font-mono text-xs font-bold text-foreground overflow-hidden truncate">
                        {field.value}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleCopy(field.value, field.label)}
                        className={cn(
                          "h-12 w-12 rounded-xl bg-secondary border border-border hover:bg-primary hover:text-primary-foreground transition-all shrink-0",
                          isCopied === field.label && "bg-primary text-primary-foreground"
                        )}
                      >
                        {isCopied === field.label ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* CMYK Panel */}
              <div className="p-8 rounded-[2.5rem] bg-secondary border border-border space-y-6 relative overflow-hidden">
                <div className="absolute -top-4 -right-4 opacity-5 pointer-events-none">
                  <Printer className="w-24 h-24 text-foreground" />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black text-foreground uppercase tracking-widest">CMYK Print Matrix</Label>
                  <Printer className="w-4 h-4 text-primary" />
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { l: 'C', v: color.c, c: 'bg-cyan-500' },
                    { l: 'M', v: color.m, c: 'bg-magenta-500' },
                    { l: 'Y', v: color.y, c: 'bg-yellow-500' },
                    { l: 'K', v: color.k, c: 'bg-black' }
                  ].map((chan) => (
                    <div key={chan.l} className="text-center space-y-2">
                       <div className={cn("w-full aspect-square rounded-lg shadow-inner ring-1 ring-border", chan.c)} />
                       <p className="text-[9px] font-black text-foreground/40">{chan.l}</p>
                       <p className="text-xs font-mono font-bold text-foreground">{chan.v}%</p>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => handleCopy(`cmyk(${color.c}%, ${color.m}%, ${color.y}%, ${color.k}%)`, 'CMYK')}
                  className="w-full h-12 bg-background border-border text-[9px] font-black uppercase tracking-widest hover:text-primary transition-all"
                >
                  Copy CMYK Profile
                </Button>
              </div>

              <div className="p-6 rounded-2xl bg-secondary border border-border flex items-start gap-4">
                 <Languages className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Universal Standard</p>
                    <p className="text-[10px] text-foreground/40 font-medium leading-relaxed">
                      All converted values are rounded to the nearest integer for CSS and hardware compatibility.
                    </p>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
