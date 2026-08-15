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
  AlignCenter,
  Eye,
  Loader2,
  Box,
  BadgeCheck,
  MousePointer2,
  Dices,
  Command,
  MoveRight,
  Sparkles,
  Shield,
  Hexagon,
  Square,
  Bookmark,
  Zap,
  Globe,
  Ghost
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

type LayoutMode = 'text-only' | 'icon-top' | 'icon-left' | 'icon-right' | 'badge-only';
type BadgeShape = 'circle' | 'square' | 'rounded' | 'pill' | 'shield' | 'hexagon' | 'diamond' | 'banner' | 'stamp' | 'ribbon' | 'oval';

const FONTS = [
  { name: 'Modern Sans', family: '"Space Grotesk", sans-serif', style: 'normal' },
  { name: 'Clean Sans', family: '"Inter", sans-serif', style: 'normal' },
  { name: 'Elegant Serif', family: 'Georgia, serif', style: 'italic' },
  { name: 'Classic Serif', family: '"Times New Roman", serif', style: 'normal' },
  { name: 'Technical Mono', family: '"Courier New", monospace', style: 'normal' },
  { name: 'Brutalist Bold', family: 'Impact, sans-serif', style: 'normal' },
  { name: 'Luxury Slab', family: '"Copperplate", serif', style: 'normal' },
  { name: 'Futuristic', family: '"Segoe UI", sans-serif', style: 'normal' },
  { name: 'Handwritten', family: '"Brush Script MT", cursive', style: 'normal' },
  { name: 'Condensed High', family: '"Arial Narrow", sans-serif', style: 'normal' },
  { name: 'Geometric', family: 'Futura, sans-serif', style: 'normal' },
  { name: 'Display Outline', family: 'Arial, sans-serif', style: 'normal', outline: true },
  { name: 'Cyberpunk', family: '"Lucida Console", monospace', style: 'normal' },
  { name: 'Rounded Soft', family: '"Comic Sans MS", cursive', style: 'normal' },
  { name: 'Antique', family: 'Palatino, serif', style: 'normal' },
  { name: 'Grotesque', family: '"Helvetica Neue", sans-serif', style: 'normal' },
  { name: 'Coded', family: 'Monaco, monospace', style: 'normal' },
  { name: 'Stencil', family: 'Impact, sans-serif', style: 'normal' },
  { name: 'Corporate', family: 'Verdana, sans-serif', style: 'normal' },
  { name: 'Art Deco', family: '"Broadway", sans-serif', style: 'normal' },
];

const COLORS = [
  { name: 'Silicon Blue', text: '#FFFFFF', bg: '#2563EB' },
  { name: 'Obsidian', text: '#FFFFFF', bg: '#0F172A' },
  { name: 'Luxury Gold', text: '#000000', bg: '#EAB308' },
  { name: 'Neon Forest', text: '#000000', bg: '#22C55E' },
  { name: 'Crimson Edge', text: '#FFFFFF', bg: '#DC2626' },
  { name: 'Cyber Purple', text: '#FFFFFF', bg: '#9333EA' },
  { name: 'Slate Gray', text: '#FFFFFF', bg: '#475569' },
  { name: 'Pitch Black', text: '#FFFFFF', bg: '#000000' },
  { name: 'Clean White', text: '#000000', bg: '#FFFFFF' },
];

const ICON_MARKS = ['circle', 'triangle', 'square', 'cross', 'dots', 'rings', 'diamond', 'bolt', 'star'];

export default function LogoMakerPage() {
  const { toast } = useToast();
  const [name, setName] = useState('STUDIO');
  const [tagline, setTagline] = useState('CREATIVE ENGINE');
  
  // Style State
  const [fontIndex, setFontIndex] = useState(0);
  const [weight, setWeight] = useState(700);
  const [spacing, setSpacing] = useState(4);
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [bgColor, setBgColor] = useState('#2563EB');
  const [isTransparent, setIsTransparent] = useState(false);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('icon-top');
  const [badgeShape, setBadgeShape] = useState<BadgeShape>('rounded');
  const [iconMark, setIconMark] = useState('cross');
  const [exportSize, setExportSize] = useState(1024);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawShape = (ctx: CanvasRenderingContext2D, shape: BadgeShape, x: number, y: number, w: number, h: number, fill: boolean) => {
    ctx.beginPath();
    switch (shape) {
      case 'circle':
        ctx.arc(x + w / 2, y + h / 2, w / 2, 0, Math.PI * 2);
        break;
      case 'oval':
        ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
        break;
      case 'square':
        ctx.rect(x, y, w, h);
        break;
      case 'rounded':
        ctx.roundRect(x, y, w, h, 80);
        break;
      case 'pill':
        ctx.roundRect(x, y, w, h, h / 2);
        break;
      case 'shield':
        ctx.moveTo(x + w / 2, y);
        ctx.lineTo(x + w, y + h * 0.2);
        ctx.lineTo(x + w, y + h * 0.7);
        ctx.quadraticCurveTo(x + w, y + h, x + w / 2, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h * 0.7);
        ctx.lineTo(x, y + h * 0.2);
        ctx.closePath();
        break;
      case 'hexagon':
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 6;
          const px = x + w / 2 + (w / 2) * Math.cos(angle);
          const py = y + h / 2 + (h / 2) * Math.sin(angle);
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        break;
      case 'diamond':
        ctx.moveTo(x + w / 2, y);
        ctx.lineTo(x + w, y + h / 2);
        ctx.lineTo(x + w / 2, y + h);
        ctx.lineTo(x, y + h / 2);
        ctx.closePath();
        break;
      case 'stamp':
        const steps = 20;
        for (let i = 0; i < steps; i++) {
          const angle = (Math.PI * 2 * i) / steps;
          const r = i % 2 === 0 ? w / 2 : (w / 2) * 0.9;
          const px = x + w / 2 + r * Math.cos(angle);
          const py = y + h / 2 + r * Math.sin(angle);
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        break;
      case 'banner':
        ctx.moveTo(x, y + h * 0.2);
        ctx.lineTo(x + w, y);
        ctx.lineTo(x + w, y + h * 0.8);
        ctx.lineTo(x, y + h);
        ctx.closePath();
        break;
      case 'ribbon':
        ctx.moveTo(x, y);
        ctx.lineTo(x + w, y);
        ctx.lineTo(x + w * 0.9, y + h / 2);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x, y + h);
        ctx.lineTo(x + w * 0.1, y + h / 2);
        ctx.closePath();
        break;
    }
    if (fill) ctx.fill(); else ctx.stroke();
  };

  const drawMark = (ctx: CanvasRenderingContext2D, mark: string, x: number, y: number, size: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.lineWidth = size * 0.1;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (mark) {
      case 'cross':
        ctx.beginPath();
        ctx.moveTo(-size/2, -size/2); ctx.lineTo(size/2, size/2);
        ctx.moveTo(size/2, -size/2); ctx.lineTo(-size/2, size/2);
        ctx.stroke();
        break;
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(0, -size/2); ctx.lineTo(size/2, size/2); ctx.lineTo(-size/2, size/2);
        ctx.closePath();
        ctx.stroke();
        break;
      case 'dots':
        ctx.beginPath();
        ctx.arc(-size/3, -size/3, size/8, 0, Math.PI*2);
        ctx.arc(size/3, -size/3, size/8, 0, Math.PI*2);
        ctx.arc(-size/3, size/3, size/8, 0, Math.PI*2);
        ctx.arc(size/3, size/3, size/8, 0, Math.PI*2);
        ctx.fill();
        break;
      case 'bolt':
        ctx.beginPath();
        ctx.moveTo(0, -size/2); ctx.lineTo(-size/3, 0); ctx.lineTo(0, 0); ctx.lineTo(-size/4, size/2);
        ctx.lineTo(size/3, 0); ctx.lineTo(0, 0); ctx.closePath();
        ctx.fill();
        break;
      case 'star':
        for (let i = 0; i < 5; i++) {
          const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
          const r1 = size / 2;
          const r2 = size / 4;
          ctx.lineTo(r1 * Math.cos(angle), r1 * Math.sin(angle));
          const angle2 = angle + Math.PI / 5;
          ctx.lineTo(r2 * Math.cos(angle2), r2 * Math.sin(angle2));
        }
        ctx.closePath();
        ctx.fill();
        break;
      case 'rings':
        ctx.beginPath();
        ctx.arc(0, 0, size/2, 0, Math.PI*2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, size/3, 0, Math.PI*2);
        ctx.stroke();
        break;
    }
    ctx.restore();
  };

  const renderLogo = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 1024;
    const maxContentWidth = 920; // 50px padding each side
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);
    if (!isTransparent) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, size, size);
    }

    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.fillStyle = textColor;
    ctx.strokeStyle = textColor;

    const selectedFont = FONTS[fontIndex];
    let baseFontSize = 120;
    let baseTagSize = 40;
    
    const applyFont = (size: number) => {
      ctx.font = `${selectedFont.style} ${weight} ${size}px ${selectedFont.family}`;
    };

    const nameUpper = name.toUpperCase();
    const tagUpper = tagline.toUpperCase();

    if (layoutMode === 'text-only') {
      applyFont(baseFontSize);
      ctx.letterSpacing = `${spacing}px`;
      let textWidth = ctx.measureText(nameUpper).width;
      
      // Auto-scale font for long names
      if (textWidth > maxContentWidth) {
        const scale = maxContentWidth / textWidth;
        baseFontSize *= scale;
        applyFont(baseFontSize);
      }

      ctx.textAlign = 'center';
      ctx.fillText(nameUpper, 0, tagline ? -20 : 40);
      
      if (tagline) {
        ctx.font = `500 ${baseTagSize}px "Inter", sans-serif`;
        ctx.letterSpacing = '12px';
        ctx.fillStyle = `${textColor}CC`;
        ctx.fillText(tagUpper, 0, 70);
      }
    } else if (layoutMode === 'icon-top') {
      const iconSize = 240;
      const markSize = 100;
      
      drawShape(ctx, badgeShape, -iconSize/2, -280, iconSize, iconSize, false);
      drawMark(ctx, iconMark, 0, -160, markSize);
      
      applyFont(baseFontSize);
      ctx.letterSpacing = `${spacing}px`;
      let textWidth = ctx.measureText(nameUpper).width;
      
      if (textWidth > maxContentWidth) {
        const scale = maxContentWidth / textWidth;
        baseFontSize *= scale;
        applyFont(baseFontSize);
      }

      ctx.textAlign = 'center';
      ctx.fillText(nameUpper, 0, 120);
      if (tagline) {
        ctx.font = `500 ${baseTagSize}px "Inter", sans-serif`;
        ctx.letterSpacing = '8px';
        ctx.fillStyle = `${textColor}AA`;
        ctx.fillText(tagUpper, 0, 200);
      }
    } else if (layoutMode === 'icon-left' || layoutMode === 'icon-right') {
      const iconSize = 200;
      const markSize = 80;
      const innerPadding = 60;
      
      applyFont(baseFontSize);
      ctx.letterSpacing = `${spacing}px`;
      let textWidth = ctx.measureText(nameUpper).width;
      
      // Constrain width: Icon + Padding + Text
      const availableTextWidth = maxContentWidth - iconSize - innerPadding;
      if (textWidth > availableTextWidth) {
        const scale = availableTextWidth / textWidth;
        baseFontSize *= scale;
        applyFont(baseFontSize);
        textWidth = ctx.measureText(nameUpper).width;
      }

      const totalGroupWidth = iconSize + innerPadding + textWidth;
      const startX = -totalGroupWidth / 2;

      if (layoutMode === 'icon-left') {
        ctx.save();
        ctx.translate(startX + iconSize/2, 0);
        drawShape(ctx, badgeShape, -iconSize/2, -iconSize/2, iconSize, iconSize, false);
        drawMark(ctx, iconMark, 0, 0, markSize);
        ctx.restore();

        ctx.textAlign = 'left';
        ctx.fillText(nameUpper, startX + iconSize + innerPadding, tagline ? -15 : 40);
        if (tagline) {
          ctx.font = `500 ${baseTagSize * (baseFontSize/120)}px "Inter", sans-serif`;
          ctx.letterSpacing = '6px';
          ctx.fillStyle = `${textColor}AA`;
          ctx.fillText(tagUpper, startX + iconSize + innerPadding, 60);
        }
      } else {
        // icon-right
        ctx.textAlign = 'left';
        ctx.fillText(nameUpper, startX, tagline ? -15 : 40);
        if (tagline) {
          ctx.font = `500 ${baseTagSize * (baseFontSize/120)}px "Inter", sans-serif`;
          ctx.letterSpacing = '6px';
          ctx.fillStyle = `${textColor}AA`;
          ctx.fillText(tagUpper, startX, 60);
        }

        ctx.save();
        ctx.translate(startX + textWidth + innerPadding + iconSize/2, 0);
        drawShape(ctx, badgeShape, -iconSize/2, -iconSize/2, iconSize, iconSize, false);
        drawMark(ctx, iconMark, 0, 0, markSize);
        ctx.restore();
      }
    } else if (layoutMode === 'badge-only') {
      applyFont(baseFontSize);
      ctx.letterSpacing = `${spacing}px`;
      let textWidth = ctx.measureText(nameUpper).width;

      // Long text in badge auto-constrains
      if (textWidth > maxContentWidth - 250) {
        const scale = (maxContentWidth - 250) / textWidth;
        baseFontSize *= scale;
        applyFont(baseFontSize);
        textWidth = ctx.measureText(nameUpper).width;
      }

      const bw = textWidth + 250;
      const bh = tagline ? 400 : 250;
      
      ctx.fillStyle = textColor;
      drawShape(ctx, badgeShape, -bw/2, -bh/2, bw, bh, true);
      
      ctx.fillStyle = bgColor === '#FFFFFF' ? '#000000' : '#FFFFFF';
      if (isTransparent) ctx.fillStyle = '#000000';
      
      ctx.textAlign = 'center';
      ctx.fillText(nameUpper, 0, tagline ? -30 : 40);
      if (tagline) {
        ctx.font = `500 ${baseTagSize}px "Inter", sans-serif`;
        ctx.letterSpacing = '10px';
        ctx.globalAlpha = 0.8;
        ctx.fillText(tagUpper, 0, 60);
      }
    }

    ctx.restore();
  }, [name, tagline, fontIndex, weight, spacing, textColor, bgColor, isTransparent, layoutMode, badgeShape, iconMark]);

  useEffect(() => {
    renderLogo();
  }, [renderLogo]);

  const randomize = () => {
    setFontIndex(Math.floor(Math.random() * FONTS.length));
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    setTextColor(randomColor.text);
    setBgColor(randomColor.bg);
    setSpacing(Math.floor(Math.random() * 15));
    setBadgeShape(['circle', 'shield', 'hexagon', 'stamp', 'rounded', 'pill', 'diamond'][Math.floor(Math.random() * 7)] as BadgeShape);
    setIconMark(ICON_MARKS[Math.floor(Math.random() * ICON_MARKS.length)]);
    setLayoutMode(['icon-top', 'icon-left', 'icon-right', 'badge-only', 'text-only'][Math.floor(Math.random() * 5)] as LayoutMode);
    toast({ title: "Brand Reimagined", description: "The Chaos Engine has synthesized a new identity." });
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `mykit-studio-logo-${Date.now()}.png`;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = exportSize;
    tempCanvas.height = exportSize;
    const tCtx = tempCanvas.getContext('2d');
    tCtx?.drawImage(canvasRef.current, 0, 0, exportSize, exportSize);
    link.href = tempCanvas.toDataURL('image/png', 1.0);
    link.click();
    toast({ title: "Master Exported", description: `${exportSize}px PNG saved to device.` });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Command className="w-3.5 h-3.5" /> Identity Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <h1 className="text-3xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight">
                Logo <span className="text-primary italic">Text Studio</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional typographic branding architecture. Design high-impact minimalist identities with advanced geometry and typographic protocols.
              </p>
           </div>
           <Button 
            onClick={randomize}
            className="h-16 px-8 rounded-2xl bg-secondary border border-border text-foreground font-black uppercase tracking-widest text-[10px] hover:bg-primary hover:text-white transition-all shadow-xl"
           >
              <Dices className="w-5 h-5 mr-3 text-primary group-hover:rotate-180 transition-transform" />
              Randomize Matrix
           </Button>
        </div>
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
              {/* Content Matrix */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Brand Identity</Label>
                  <Input 
                    placeholder="BRAND NAME" 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    className="h-14 bg-secondary border-border rounded-2xl text-lg font-bold focus:ring-primary/40 uppercase"
                  />
                  <Input 
                    placeholder="TAGLINE" 
                    value={tagline} 
                    onChange={e => setTagline(e.target.value)}
                    className="h-12 bg-secondary/50 border-border rounded-xl text-xs font-medium focus:ring-primary/40 uppercase"
                  />
                </div>
              </div>

              {/* Typographic Matrix */}
              <div className="space-y-6">
                <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Typographic Profile</Label>
                <div className="grid grid-cols-1 gap-4">
                  <Select value={fontIndex.toString()} onValueChange={v => setFontIndex(parseInt(v))}>
                    <SelectTrigger className="h-12 bg-secondary border-border rounded-xl font-bold">
                      <SelectValue placeholder="Select Style" />
                    </SelectTrigger>
                    <SelectContent className="glass-card max-h-[300px]">
                      {FONTS.map((f, i) => (
                        <SelectItem key={i} value={i.toString()} className="font-bold uppercase text-[10px]">{f.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <p className="text-[8px] font-black text-foreground/30 uppercase">Weight</p>
                        <Select value={weight.toString()} onValueChange={v => setWeight(parseInt(v))}>
                          <SelectTrigger className="h-10 bg-secondary border-border rounded-xl text-[10px] font-bold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="glass-card">
                            <SelectItem value="300">Light</SelectItem>
                            <SelectItem value="400">Regular</SelectItem>
                            <SelectItem value="700">Bold</SelectItem>
                            <SelectItem value="900">Black</SelectItem>
                          </SelectContent>
                        </Select>
                     </div>
                     <div className="space-y-2">
                        <p className="text-[8px] font-black text-foreground/30 uppercase">Letter Spacing</p>
                        <div className="flex items-center gap-3">
                           <Slider value={[spacing]} min={-5} max={40} step={1} onValueChange={v => setSpacing(v[0])} className="flex-1" />
                        </div>
                     </div>
                  </div>
                </div>
              </div>

              {/* Visual Architecture */}
              <div className="space-y-6">
                 <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Symbol Geometry</Label>
                 <div className="grid grid-cols-2 gap-4">
                    <Select value={badgeShape} onValueChange={(v: BadgeShape) => setBadgeShape(v)}>
                      <SelectTrigger className="h-12 bg-secondary border-border rounded-xl text-[10px] font-bold uppercase">
                        <SelectValue placeholder="Shape" />
                      </SelectTrigger>
                      <SelectContent className="glass-card">
                        <SelectItem value="circle">Circle</SelectItem>
                        <SelectItem value="square">Square</SelectItem>
                        <SelectItem value="rounded">Rounded</SelectItem>
                        <SelectItem value="pill">Pill</SelectItem>
                        <SelectItem value="shield">Shield</SelectItem>
                        <SelectItem value="hexagon">Hexagon</SelectItem>
                        <SelectItem value="diamond">Diamond</SelectItem>
                        <SelectItem value="stamp">Stamp</SelectItem>
                        <SelectItem value="ribbon">Ribbon</SelectItem>
                        <SelectItem value="banner">Banner</SelectItem>
                        <SelectItem value="oval">Oval</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={iconMark} onValueChange={setIconMark}>
                      <SelectTrigger className="h-12 bg-secondary border-border rounded-xl text-[10px] font-bold uppercase">
                        <SelectValue placeholder="Mark" />
                      </SelectTrigger>
                      <SelectContent className="glass-card">
                        {ICON_MARKS.map(m => (
                          <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                 </div>
              </div>

              {/* Layout Protocol */}
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Layout Mode</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'text-only', label: 'Minimal Text' },
                    { id: 'icon-top', label: 'Symbol Top' },
                    { id: 'icon-left', label: 'Symbol Left' },
                    { id: 'icon-right', label: 'Symbol Right' },
                    { id: 'badge-only', label: 'Badge Layout' },
                  ].map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setLayoutMode(l.id as LayoutMode)}
                      className={cn(
                        "h-10 rounded-xl border flex items-center justify-center text-[9px] font-black uppercase tracking-widest transition-all",
                        layoutMode === l.id ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-foreground/40"
                      )}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chromatic Matrix */}
              <div className="space-y-6">
                 <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Chromatic Selection</Label>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-secondary border border-border flex items-center justify-between">
                       <span className="text-[9px] font-black uppercase text-foreground/40">Text</span>
                       <div className="w-8 h-8 rounded-lg relative overflow-hidden ring-1 ring-border" style={{ backgroundColor: textColor }}>
                          <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
                       </div>
                    </div>
                    <div className={cn("p-4 rounded-xl border flex items-center justify-between transition-all", isTransparent ? "bg-primary/10 border-primary/20" : "bg-secondary border-border")}>
                       <span className="text-[9px] font-black uppercase text-foreground/40">Fill</span>
                       <div className="flex items-center gap-3">
                          <Switch checked={isTransparent} onCheckedChange={setIsTransparent} className="scale-75" />
                          {!isTransparent && (
                            <div className="w-8 h-8 rounded-lg relative overflow-hidden ring-1 ring-border" style={{ backgroundColor: bgColor }}>
                                <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
                            </div>
                          )}
                       </div>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-3 gap-2">
                    {COLORS.slice(0, 6).map((c, i) => (
                      <button 
                        key={i} 
                        onClick={() => { setTextColor(c.text); setBgColor(c.bg); setIsTransparent(false); }}
                        className="h-10 rounded-lg border border-border overflow-hidden flex"
                      >
                         <div className="flex-1" style={{ backgroundColor: c.bg }} />
                         <div className="w-1/3" style={{ backgroundColor: c.text }} />
                      </button>
                    ))}
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
                  onClick={() => { setName('STUDIO'); setTagline('CREATIVE ENGINE'); }}
                  className="w-16 h-16 rounded-2xl border-border bg-secondary hover:bg-secondary/80 text-foreground/40 hover:text-destructive transition-all active:scale-95"
                >
                  <Trash2 className="w-6 h-6" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Section */}
        <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5" /> Master Studio Preview
                </CardTitle>
                <div className="flex gap-2">
                  <button onClick={() => setExportSize(512)} className={cn("px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all", exportSize === 512 ? "bg-primary text-white" : "bg-secondary text-foreground/40")}>512px</button>
                  <button onClick={() => setExportSize(1024)} className={cn("px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all", exportSize === 1024 ? "bg-primary text-white" : "bg-secondary text-foreground/40")}>1024px</button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center p-10 bg-black/5 dark:bg-black/60 relative">
               <div className="relative w-full max-w-[500px] aspect-square rounded-[3rem] overflow-hidden shadow-2xl ring-1 ring-white/10 group/canvas bg-checkered">
                  <canvas 
                    ref={canvasRef} 
                    className="w-full h-full object-contain"
                  />
                  {isTransparent && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 opacity-60 pointer-events-none">
                       <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-3 text-[10px] font-black text-white uppercase tracking-widest border border-white/10">
                          <MousePointer2 className="w-3.5 h-3.5 text-primary" /> Alpha Channel Active
                       </div>
                    </div>
                  )}
               </div>

               <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                  <div className="p-6 rounded-[2rem] bg-secondary/50 border border-border flex items-start gap-5 group hover:border-primary/20 transition-all">
                     <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all">
                        <Shapes className="w-5 h-5" />
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Auto-Scale Protocol</p>
                        <p className="text-[11px] text-foreground/40 font-medium leading-relaxed">
                          Typography is dynamically constrained to ensure zero clipping in all layouts.
                        </p>
                     </div>
                  </div>
                  <div className="p-6 rounded-[2rem] bg-secondary/50 border border-border flex items-start gap-5 group hover:border-primary/20 transition-all">
                     <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all">
                        <Maximize className="w-5 h-5" />
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Master Production</p>
                        <p className="text-[11px] text-foreground/40 font-medium leading-relaxed">
                          1:1 hardware sampling for high-fidelity brand Mark synthesis.
                        </p>
                     </div>
                  </div>
               </div>
            </CardContent>
          </Card>
          
          <div className="p-8 rounded-[3rem] bg-primary/5 border border-primary/10 flex items-start gap-6 group hover:bg-primary/10 transition-all duration-500">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20 shadow-xl group-hover:scale-110 transition-transform">
               <Sparkles className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h4 className="text-[13px] font-black text-primary uppercase tracking-widest">Pro Studio Intelligence</h4>
              <p className="text-[12px] text-foreground/50 leading-relaxed font-medium">
                Our rendering engine utilizes browser-side bi-linear interpolation to ensure that complex outlines and stamp effects retain their fidelity during high-resolution PNG synthesis. All processing occurs locally for 100% data privacy.
              </p>
            </div>
          </div>
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
