"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Type, 
  Settings2, 
  Download, 
  Trash2, 
  CheckCircle2, 
  Info,
  Palette,
  Layout,
  Maximize,
  Circle,
  Shapes,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  Loader2,
  Box,
  CaseSensitive,
  BadgeCheck,
  MousePointer2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type LayoutMode = 'text-only' | 'icon-top' | 'icon-left' | 'badge';

export default function LogoMakerPage() {
  const { toast } = useToast();
  const [name, setName] = useState('BRAND NAME');
  const [tagline, setTagline] = useState('CREATIVE STUDIO');
  
  // Style State
  const [fontFamily, setFontFamily] = useState('Space Grotesk');
  const [fontWeight, setWeight] = useState(700);
  const [letterSpacing, setSpacing] = useState(2);
  const [textColor, setTextColor] = useState('#0f172a');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [isTransparent, setIsTransparent] = useState(false);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('text-only');
  const [exportSize, setExportSize] = useState(1024);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const renderLogo = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 1024;
    canvas.width = size;
    canvas.height = size;

    // Clear / Background
    ctx.clearRect(0, 0, size, size);
    if (!isTransparent) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, size, size);
    }

    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.textAlign = 'center';
    ctx.fillStyle = textColor;

    const nameFont = `${fontWeight} 120px "${fontFamily}", sans-serif`;
    const tagFont = `500 40px "Inter", sans-serif`;

    if (layoutMode === 'text-only') {
      ctx.font = nameFont;
      ctx.letterSpacing = `${letterSpacing}px`;
      ctx.fillText(name.toUpperCase(), 0, tagline ? -20 : 40);

      if (tagline) {
        ctx.font = tagFont;
        ctx.letterSpacing = '8px';
        ctx.fillStyle = `${textColor}80`; // 50% opacity
        ctx.fillText(tagline.toUpperCase(), 0, 60);
      }
    } else if (layoutMode === 'icon-top') {
      // Draw Icon (Initial in circle)
      ctx.beginPath();
      ctx.arc(0, -120, 100, 0, Math.PI * 2);
      ctx.strokeStyle = textColor;
      ctx.lineWidth = 12;
      ctx.stroke();
      
      ctx.font = `900 100px "${fontFamily}", sans-serif`;
      ctx.fillText(name.charAt(0).toUpperCase(), 0, -85);

      ctx.font = nameFont;
      ctx.letterSpacing = `${letterSpacing}px`;
      ctx.fillText(name.toUpperCase(), 0, 80);

      if (tagline) {
        ctx.font = tagFont;
        ctx.letterSpacing = '8px';
        ctx.fillStyle = `${textColor}80`;
        ctx.fillText(tagline.toUpperCase(), 0, 150);
      }
    } else if (layoutMode === 'icon-left') {
        const totalW = 600; // rough width estimation
        ctx.translate(-totalW / 4, 0);

        ctx.beginPath();
        ctx.arc(-120, 0, 80, 0, Math.PI * 2);
        ctx.strokeStyle = textColor;
        ctx.lineWidth = 10;
        ctx.stroke();

        ctx.font = `900 80px "${fontFamily}", sans-serif`;
        ctx.fillText(name.charAt(0).toUpperCase(), -120, 28);

        ctx.textAlign = 'left';
        ctx.font = nameFont;
        ctx.letterSpacing = `${letterSpacing}px`;
        ctx.fillText(name.toUpperCase(), 0, tagline ? -10 : 35);

        if (tagline) {
          ctx.font = tagFont;
          ctx.letterSpacing = '6px';
          ctx.fillStyle = `${textColor}80`;
          ctx.fillText(tagline.toUpperCase(), 0, 50);
        }
    } else if (layoutMode === 'badge') {
        ctx.font = nameFont;
        const metrics = ctx.measureText(name.toUpperCase());
        const badgeW = metrics.width + 160;
        const badgeH = tagline ? 300 : 200;

        ctx.fillStyle = textColor;
        ctx.beginPath();
        ctx.roundRect(-badgeW/2, -badgeH/2, badgeW, badgeH, 100);
        ctx.fill();

        ctx.fillStyle = bgColor === '#ffffff' && !isTransparent ? '#ffffff' : bgColor;
        if (isTransparent) ctx.fillStyle = '#ffffff';

        ctx.font = nameFont;
        ctx.letterSpacing = `${letterSpacing}px`;
        ctx.fillText(name.toUpperCase(), 0, tagline ? -20 : 40);

        if (tagline) {
          ctx.font = tagFont;
          ctx.letterSpacing = '8px';
          ctx.globalAlpha = 0.7;
          ctx.fillText(tagline.toUpperCase(), 0, 60);
        }
    }

    ctx.restore();
  }, [name, tagline, fontFamily, fontWeight, letterSpacing, textColor, bgColor, isTransparent, layoutMode]);

  useEffect(() => {
    renderLogo();
  }, [renderLogo]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `mykit-logo-${Date.now()}.png`;
    
    // Scale for export if requested
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = exportSize;
    tempCanvas.height = exportSize;
    const tCtx = tempCanvas.getContext('2d');
    tCtx?.drawImage(canvasRef.current, 0, 0, exportSize, exportSize);
    
    link.href = tempCanvas.toDataURL('image/png', 1.0);
    link.click();
    toast({ title: "Asset Exported", description: `${exportSize}px master saved.` });
  };

  const handleClear = () => {
    setName('BRAND NAME');
    setTagline('CREATIVE STUDIO');
    toast({ title: "Studio Reset", description: "Default parameters restored." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Type className="w-3.5 h-3.5" /> Branding Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Logo <span className="text-primary italic">Text Studio</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
          Professional typographic logo synthesis. Design minimalist, high-impact brand identities with precision character spacing and layout protocols.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls Section */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <Settings2 className="w-6 h-6" />
                </div>
                Design Matrix
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-10 space-y-10">
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Brand Name</Label>
                  <Input 
                    placeholder="E.g. VECTOR" 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    className="h-14 bg-secondary border-border rounded-2xl text-lg font-bold focus:ring-primary/40"
                  />
                </div>
                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Optional Tagline</Label>
                  <Input 
                    placeholder="E.g. Digital Excellence" 
                    value={tagline} 
                    onChange={e => setTagline(e.target.value)}
                    className="h-14 bg-secondary border-border rounded-2xl text-sm font-medium focus:ring-primary/40"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Typographic Profile</Label>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <p className="text-[9px] font-black text-foreground/30 uppercase">Font Family</p>
                      <Select value={fontFamily} onValueChange={setFontFamily}>
                        <SelectTrigger className="h-12 bg-secondary border-border rounded-xl font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-card">
                          <SelectItem value="Space Grotesk" className="font-headline font-bold">Modern</SelectItem>
                          <SelectItem value="Inter" className="font-sans font-bold">Clean Sans</SelectItem>
                          <SelectItem value="Georgia" className="font-serif font-bold">Classic Serif</SelectItem>
                          <SelectItem value="Courier New" className="font-mono font-bold">Technical</SelectItem>
                        </SelectContent>
                      </Select>
                   </div>
                   <div className="space-y-2">
                      <p className="text-[9px] font-black text-foreground/30 uppercase">Weight</p>
                      <Select value={fontWeight.toString()} onValueChange={v => setWeight(parseInt(v))}>
                        <SelectTrigger className="h-12 bg-secondary border-border rounded-xl font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-card">
                          <SelectItem value="400">Regular</SelectItem>
                          <SelectItem value="700">Bold</SelectItem>
                          <SelectItem value="900">Black</SelectItem>
                        </SelectContent>
                      </Select>
                   </div>
                </div>

                <div className="space-y-4 pt-2">
                   <div className="flex justify-between items-center text-[10px] font-black uppercase text-foreground/40">
                      <Label>Letter Spacing</Label>
                      <span className="text-primary">{letterSpacing}px</span>
                   </div>
                   <Slider value={[letterSpacing]} min={-5} max={30} step={1} onValueChange={v => setSpacing(v[0])} />
                </div>
              </div>

              <div className="space-y-6">
                 <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Chromatic Matrix</Label>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-secondary border border-border flex items-center justify-between">
                       <span className="text-[9px] font-black uppercase text-foreground/40">Text</span>
                       <div className="w-8 h-8 rounded-lg relative overflow-hidden ring-1 ring-border" style={{ backgroundColor: textColor }}>
                          <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
                       </div>
                    </div>
                    <div className={cn("p-4 rounded-xl border flex items-center justify-between transition-all", isTransparent ? "bg-primary/10 border-primary/20" : "bg-secondary border-border")}>
                       <span className="text-[9px] font-black uppercase text-foreground/40">Background</span>
                       <div className="flex items-center gap-3">
                          <Switch checked={isTransparent} onCheckedChange={setIsTransparent} className="scale-75" title="Transparent" />
                          {!isTransparent && (
                            <div className="w-8 h-8 rounded-lg relative overflow-hidden ring-1 ring-border" style={{ backgroundColor: bgColor }}>
                                <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
                            </div>
                          )}
                       </div>
                    </div>
                 </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={handleDownload}
                  className="flex-1 h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                >
                  <Download className="w-6 h-6" />
                  Download PNG
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleClear}
                  className="w-16 h-16 rounded-2xl border-border bg-secondary hover:bg-secondary/80 text-foreground/40 hover:text-destructive transition-all active:scale-95"
                >
                  <Trash2 className="w-6 h-6" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
            <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Privacy Absolute</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                Logo synthesis occurs entirely on your device via the Canvas rendering engine. Your branding assets never leave your machine, ensuring 100% data security.
              </p>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-2">
            {[
              { id: 'text-only', icon: AlignCenter, label: 'Minimal' },
              { id: 'icon-top', icon: Shapes, label: 'Icon Top' },
              { id: 'icon-left', icon: Box, label: 'Icon Side' },
              { id: 'badge', icon: BadgeCheck, label: 'Badge' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setLayoutMode(p.id as LayoutMode)}
                className={cn(
                  "flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all",
                  layoutMode === p.id ? "bg-primary text-primary-foreground border-primary shadow-lg" : "bg-white dark:bg-black/20 border-border text-foreground/40 hover:text-primary"
                )}
              >
                <p.icon className="w-5 h-5" />
                <span className="text-[9px] font-black uppercase tracking-widest">{p.label}</span>
              </button>
            ))}
          </div>

          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[500px]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5" /> Studio Master Preview
                </CardTitle>
                <div className="flex gap-2">
                  <button onClick={() => setExportSize(512)} className={cn("px-2 py-0.5 rounded text-[8px] font-black uppercase transition-all", exportSize === 512 ? "bg-primary text-white" : "bg-secondary text-foreground/40")}>512px</button>
                  <button onClick={() => setExportSize(1024)} className={cn("px-2 py-0.5 rounded text-[8px] font-black uppercase transition-all", exportSize === 1024 ? "bg-primary text-white" : "bg-secondary text-foreground/40")}>1024px</button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center p-10 bg-black/5 dark:bg-black/40">
               <div className="relative w-full max-w-[400px] aspect-square rounded-[3rem] overflow-hidden shadow-2xl ring-1 ring-white/10 group/canvas bg-checkered">
                  <canvas 
                    ref={canvasRef} 
                    className="w-full h-full object-contain"
                  />
                  {isTransparent && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 opacity-60 pointer-events-none">
                       <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 text-[8px] font-black text-white uppercase tracking-widest border border-white/10">
                          <MousePointer2 className="w-3 h-3 text-primary" /> Alpha Channel Active
                       </div>
                    </div>
                  )}
               </div>
            </CardContent>

            <div className="p-8 border-t border-border bg-secondary/30">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-[11px] font-medium text-foreground/50 leading-relaxed">
                  <div className="flex items-start gap-4">
                     <Shapes className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                     <div className="space-y-1">
                        <p className="text-foreground font-black uppercase tracking-widest">Geometry Synthesis</p>
                        <p>Our engine utilizes hardware-accelerated Bezier paths for perfect circular and rounded-badge bounding boxes.</p>
                     </div>
                  </div>
                  <div className="flex items-start gap-4">
                     <Maximize className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                     <div className="space-y-1">
                        <p className="text-foreground font-black uppercase tracking-widest">Export Protocol</p>
                        <p>Logos are rendered as 1024px squares by default, ensuring sharp clarity for both avatars and high-resolution web branding.</p>
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
