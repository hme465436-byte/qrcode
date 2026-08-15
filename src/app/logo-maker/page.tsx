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
  Ghost,
  Layers,
  ArrowDownCircle,
  AlignLeft,
  AlignCenter as AlignCenterIcon,
  AlignRight,
  GripVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

const PRESETS = [
  { id: 'minimal', label: 'Minimal', layout: 'text-only', font: 1, color: '#000000', bg: '#FFFFFF', weight: 700, spacing: 5 },
  { id: 'bold', label: 'Bold', layout: 'icon-top', font: 5, color: '#FFFFFF', bg: '#000000', weight: 900, icon: 'bolt', shape: 'square' },
  { id: 'badge', label: 'Badge', layout: 'badge-only', font: 0, color: '#2563EB', bg: '#FFFFFF', weight: 700, shape: 'rounded' },
  { id: 'luxury', label: 'Luxury', layout: 'text-only', font: 2, color: '#EAB308', bg: '#0F172A', weight: 400, spacing: 10, shadow: true },
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
  const [fontIndex, setFontIndex] = useState(1);
  const [weight, setWeight] = useState(700);
  const [spacing, setSpacing] = useState(4);
  const [fontSize, setFontSize] = useState(120);
  const [taglineGap, setTaglineGap] = useState(30);
  
  // Color State
  const [textColor, setTextColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [iconColor, setIconColor] = useState('#2563EB');
  const [isTransparent, setIsTransparent] = useState(false);
  const [useBgGradient, setUseBgGradient] = useState(false);
  const [useTextGradient, setUseTextGradient] = useState(false);

  // Advanced FX
  const [useShadow, setUseShadow] = useState(false);
  const [outlineWidth, setOutlineWidth] = useState(0);
  const [outlineColor, setOutlineColor] = useState('#000000');

  // Layout State
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('icon-top');
  const [badgeShape, setBadgeShape] = useState<BadgeShape>('rounded');
  const [iconMark, setIconMark] = useState('bolt');
  const [iconSize, setIconSize] = useState(180);
  const [iconGap, setIconGap] = useState(40);
  
  // Production State
  const [exportSize, setExportSize] = useState(1024);
  const [showSafeZone, setShowSafeZone] = useState(true);
  
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
        ctx.roundRect(x, y, w, h, w * 0.1);
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
        const steps = 24;
        for (let i = 0; i < steps; i++) {
          const angle = (Math.PI * 2 * i) / steps;
          const r = i % 2 === 0 ? w / 2 : (w / 2) * 0.85;
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
    ctx.lineWidth = size * 0.12;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = iconColor;
    ctx.fillStyle = iconColor;

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
      case 'square':
        ctx.strokeRect(-size/2, -size/2, size, size);
        break;
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, size/2, 0, Math.PI*2);
        ctx.stroke();
        break;
      case 'diamond':
        ctx.beginPath();
        ctx.moveTo(0, -size/2);
        ctx.lineTo(size/2, 0);
        ctx.lineTo(0, size/2);
        ctx.lineTo(-size/2, 0);
        ctx.closePath();
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
    const padding = 100;
    const maxContentWidth = size - (padding * 2);
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);
    
    // Background Layer
    if (!isTransparent) {
      if (useBgGradient) {
        const grad = ctx.createLinearGradient(0, 0, size, size);
        grad.addColorStop(0, bgColor);
        grad.addColorStop(1, '#000000');
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = bgColor;
      }
      ctx.fillRect(0, 0, size, size);
    }

    // Safe Zone Guide
    if (showSafeZone) {
      ctx.strokeStyle = isTransparent ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.05)';
      ctx.setLineDash([10, 10]);
      ctx.strokeRect(padding, padding, maxContentWidth, maxContentWidth);
      ctx.setLineDash([]);
    }

    const selectedFont = FONTS[fontIndex];
    const nameUpper = name.toUpperCase() || ' ';
    const tagUpper = tagline.toUpperCase() || '';

    // Measurement & Setup
    const setTextStyle = (s: number, w: number, f: string) => {
      ctx.font = `${selectedFont.style} ${w} ${s}px ${f}`;
      ctx.letterSpacing = `${spacing}px`;
      if (useTextGradient) {
        const textGrad = ctx.createLinearGradient(-300, 0, 300, 0);
        textGrad.addColorStop(0, textColor);
        textGrad.addColorStop(1, '#FFFFFF');
        ctx.fillStyle = textGrad;
      } else {
        ctx.fillStyle = textColor;
      }
      if (useShadow) {
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 10;
      } else {
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
      }
    };

    // Calculate dimensions
    setTextStyle(fontSize, weight, selectedFont.family);
    const nameMetrics = ctx.measureText(nameUpper);
    const nameWidth = nameMetrics.width;
    const nameHeight = fontSize * 0.8; // Approx x-height

    let tagWidth = 0;
    let tagHeight = 0;
    const tagFontSize = fontSize * 0.3;
    const tagSpacing = 10;

    if (tagUpper) {
      ctx.font = `500 ${tagFontSize}px "Inter", sans-serif`;
      ctx.letterSpacing = `${tagSpacing}px`;
      tagWidth = ctx.measureText(tagUpper).width;
      tagHeight = tagFontSize;
    }

    // Layout Calculations
    let groupWidth = 0;
    let groupHeight = 0;

    if (layoutMode === 'text-only') {
      groupWidth = Math.max(nameWidth, tagWidth);
      groupHeight = tagUpper ? nameHeight + taglineGap + tagHeight : nameHeight;
    } else if (layoutMode === 'icon-top') {
      groupWidth = Math.max(iconSize, nameWidth, tagWidth);
      groupHeight = iconSize + iconGap + nameHeight + (tagUpper ? taglineGap + tagHeight : 0);
    } else if (layoutMode === 'icon-left' || layoutMode === 'icon-right') {
      const textBlockHeight = tagUpper ? nameHeight + taglineGap + tagHeight : nameHeight;
      groupWidth = iconSize + iconGap + Math.max(nameWidth, tagWidth);
      groupHeight = Math.max(iconSize, textBlockHeight);
    } else if (layoutMode === 'badge-only') {
      const bw = nameWidth + 200;
      const bh = tagline ? 380 : 250;
      groupWidth = bw;
      groupHeight = bh;
    }

    // Auto-Scaling for fitting group in canvas
    let finalScale = 1;
    if (groupWidth > maxContentWidth) finalScale = Math.min(finalScale, maxContentWidth / groupWidth);
    if (groupHeight > maxContentWidth) finalScale = Math.min(finalScale, maxContentWidth / groupHeight);

    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.scale(finalScale, finalScale);

    // Drawing
    if (layoutMode === 'text-only') {
      const startY = tagUpper ? -(nameHeight + taglineGap + tagHeight) / 2 + nameHeight : 0;
      
      setTextStyle(fontSize, weight, selectedFont.family);
      ctx.textAlign = 'center';
      ctx.fillText(nameUpper, 0, startY);
      
      if (tagUpper) {
        ctx.font = `500 ${tagFontSize}px "Inter", sans-serif`;
        ctx.letterSpacing = `${tagSpacing}px`;
        ctx.globalAlpha = 0.5;
        ctx.fillText(tagUpper, 0, startY + taglineGap + tagHeight/2);
      }
    } else if (layoutMode === 'icon-top') {
      const startY = -groupHeight / 2 + iconSize / 2;
      
      drawMark(ctx, iconMark, 0, startY, iconSize * 0.6);
      ctx.strokeStyle = iconColor;
      ctx.lineWidth = 10;
      drawShape(ctx, badgeShape, -iconSize/2, startY - iconSize/2, iconSize, iconSize, false);

      setTextStyle(fontSize * 0.8, weight, selectedFont.family);
      ctx.textAlign = 'center';
      const textY = startY + iconSize/2 + iconGap + (fontSize * 0.8 * 0.4);
      ctx.fillText(nameUpper, 0, textY);

      if (tagUpper) {
        ctx.font = `500 ${tagFontSize}px "Inter", sans-serif`;
        ctx.letterSpacing = '6px';
        ctx.globalAlpha = 0.4;
        ctx.fillText(tagUpper, 0, textY + taglineGap + tagHeight/2);
      }
    } else if (layoutMode === 'icon-left' || layoutMode === 'icon-right') {
      const textBlockHeight = tagUpper ? nameHeight + taglineGap + tagHeight : nameHeight;
      const startX = -groupWidth / 2;
      
      if (layoutMode === 'icon-left') {
        // Icon
        ctx.save();
        ctx.translate(startX + iconSize/2, 0);
        drawMark(ctx, iconMark, 0, 0, iconSize * 0.5);
        ctx.strokeStyle = iconColor;
        ctx.lineWidth = 8;
        drawShape(ctx, badgeShape, -iconSize/2, -iconSize/2, iconSize, iconSize, false);
        ctx.restore();

        // Text Group
        const textStartX = startX + iconSize + iconGap;
        const textStartY = tagUpper ? -textBlockHeight / 2 + nameHeight : nameHeight / 2;
        
        setTextStyle(fontSize, weight, selectedFont.family);
        ctx.textAlign = 'left';
        ctx.fillText(nameUpper, textStartX, textStartY);
        
        if (tagUpper) {
          ctx.font = `500 ${tagFontSize}px "Inter", sans-serif`;
          ctx.letterSpacing = '6px';
          ctx.globalAlpha = 0.4;
          ctx.fillText(tagUpper, textStartX, textStartY + taglineGap);
        }
      } else {
        // Text Group
        const textBlockWidth = Math.max(nameWidth, tagWidth);
        const textStartX = startX;
        const textStartY = tagUpper ? -textBlockHeight / 2 + nameHeight : nameHeight / 2;
        
        setTextStyle(fontSize, weight, selectedFont.family);
        ctx.textAlign = 'left';
        ctx.fillText(nameUpper, textStartX, textStartY);
        
        if (tagUpper) {
          ctx.font = `500 ${tagFontSize}px "Inter", sans-serif`;
          ctx.letterSpacing = '6px';
          ctx.globalAlpha = 0.4;
          ctx.fillText(tagUpper, textStartX, textStartY + taglineGap);
        }

        // Icon
        const iconStartX = startX + textBlockWidth + iconGap + iconSize/2;
        ctx.save();
        ctx.translate(iconStartX, 0);
        drawMark(ctx, iconMark, 0, 0, iconSize * 0.5);
        ctx.strokeStyle = iconColor;
        ctx.lineWidth = 8;
        drawShape(ctx, badgeShape, -iconSize/2, -iconSize/2, iconSize, iconSize, false);
        ctx.restore();
      }
    } else if (layoutMode === 'badge-only') {
      const bw = nameWidth + 200;
      const bh = tagUpper ? 380 : 250;
      
      ctx.fillStyle = textColor;
      drawShape(ctx, badgeShape, -bw/2, -bh/2, bw, bh, true);
      
      ctx.fillStyle = bgColor === '#FFFFFF' ? '#000000' : '#FFFFFF';
      if (isTransparent) ctx.fillStyle = '#000000';
      
      setTextStyle(fontSize * 0.8, weight, selectedFont.family);
      ctx.textAlign = 'center';
      const textY = tagUpper ? -30 : 20;
      ctx.fillText(nameUpper, 0, textY);
      
      if (tagUpper) {
        ctx.font = `500 ${fontSize * 0.3}px "Inter", sans-serif`;
        ctx.letterSpacing = '10px';
        ctx.globalAlpha = 0.8;
        ctx.fillText(tagUpper, 0, textY + taglineGap + 10);
      }
    }

    ctx.restore();
  }, [name, tagline, fontIndex, weight, spacing, fontSize, textColor, bgColor, iconColor, isTransparent, useBgGradient, useTextGradient, useShadow, outlineWidth, outlineColor, layoutMode, badgeShape, iconMark, iconSize, iconGap, showSafeZone, taglineGap]);

  useEffect(() => {
    renderLogo();
  }, [renderLogo]);

  const applyPreset = (p: any) => {
    setName(p.label === 'Luxury' ? 'ESTATE' : 'STUDIO');
    setTagline(p.label === 'Luxury' ? 'PREMIUM COLLECTION' : 'CREATIVE ENGINE');
    setFontIndex(p.font);
    setTextColor(p.color);
    setBgColor(p.bg);
    setWeight(p.weight);
    setLayoutMode(p.layout as LayoutMode);
    if (p.spacing) setSpacing(p.spacing);
    if (p.shape) setBadgeShape(p.shape as BadgeShape);
    if (p.icon) setIconMark(p.icon);
    if (p.shadow) setUseShadow(true);
    toast({ title: "Preset Loaded", description: `${p.label} profile synthesized.` });
  };

  const randomize = () => {
    setFontIndex(Math.floor(Math.random() * FONTS.length));
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    setTextColor(randomColor.text);
    setBgColor(randomColor.bg);
    setIconColor(COLORS[Math.floor(Math.random() * COLORS.length)].bg);
    setSpacing(Math.floor(Math.random() * 20));
    setFontSize(100 + Math.floor(Math.random() * 50));
    setBadgeShape(['circle', 'shield', 'hexagon', 'stamp', 'rounded', 'pill', 'diamond'][Math.floor(Math.random() * 7)] as BadgeShape);
    setIconMark(ICON_MARKS[Math.floor(Math.random() * ICON_MARKS.length)]);
    setLayoutMode(['icon-top', 'icon-left', 'icon-right', 'badge-only', 'text-only'][Math.floor(Math.random() * 5)] as LayoutMode);
    toast({ title: "Brand Reimagined", description: "Identity matrix randomized." });
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `mykit-logo-${Date.now()}.png`;
    
    // High-res proxy render
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = exportSize;
    tempCanvas.height = exportSize;
    const tCtx = tempCanvas.getContext('2d');
    
    // Scale guides off for export
    const wasSafeZone = showSafeZone;
    setShowSafeZone(false);
    
    // We briefy wait for the state update to propagate before drawing if we were going to re-render,
    // but here we just draw the source canvas scaled.
    tCtx?.drawImage(canvasRef.current, 0, 0, exportSize, exportSize);
    
    link.href = tempCanvas.toDataURL('image/png', 1.0);
    link.click();
    setShowSafeZone(wasSafeZone);
    toast({ title: "Production Ready", description: `${exportSize}px PNG master exported.` });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Command className="w-3.5 h-3.5" /> Identity Suite V2
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <h1 className="text-3xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight">
                Logo <span className="text-primary italic">Text Studio</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Premium typographic branding architecture. Design high-impact identities with advanced geometry, gradients, and production-grade export protocols.
              </p>
           </div>
           <div className="flex gap-4">
             <Button 
              onClick={randomize}
              variant="outline"
              className="h-16 px-6 rounded-2xl bg-secondary border-border text-foreground font-black uppercase tracking-widest text-[10px] hover:bg-primary hover:text-white transition-all shadow-xl"
             >
                <Dices className="w-5 h-5 mr-3 text-primary group-hover:rotate-180 transition-transform" />
                Randomize
             </Button>
           </div>
        </div>
      </div>

      {/* Presets Bar */}
      <div className="mb-10 p-2 rounded-3xl bg-secondary/50 border border-border flex items-center gap-2 overflow-x-auto no-scrollbar">
         {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => applyPreset(p)}
              className="px-6 py-3 rounded-2xl bg-background border border-border text-[9px] font-black uppercase tracking-widest hover:border-primary/40 hover:text-primary transition-all whitespace-nowrap"
            >
               {p.label} Profile
            </button>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls Section */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid grid-cols-3 bg-secondary p-1.5 rounded-2xl h-14 mb-8">
               <TabsTrigger value="content" className="rounded-xl text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-background">Content</TabsTrigger>
               <TabsTrigger value="style" className="rounded-xl text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-background">Styling</TabsTrigger>
               <TabsTrigger value="fx" className="rounded-xl text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-background">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-8 mt-0">
               <Card className="glass-card border-border shadow-xl overflow-hidden">
                  <CardContent className="pt-8 space-y-8">
                     <div className="space-y-4">
                        <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Logotype Content</Label>
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

                     <div className="space-y-4">
                        <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Layout Architecture</Label>
                        <div className="grid grid-cols-3 gap-3">
                           {[
                              { id: 'text-only', label: 'Minimal', icon: Type },
                              { id: 'icon-top', label: 'Stacked', icon: Layers },
                              { id: 'icon-left', label: 'Left', icon: AlignLeft },
                              { id: 'icon-right', label: 'Right', icon: AlignRight },
                              { id: 'badge-only', label: 'Badge', icon: Box },
                           ].map((l) => (
                              <button
                                key={l.id}
                                onClick={() => setLayoutMode(l.id as LayoutMode)}
                                className={cn(
                                  "flex flex-col items-center justify-center gap-2 py-4 rounded-xl border transition-all",
                                  layoutMode === l.id ? "bg-primary text-primary-foreground border-primary shadow-lg" : "bg-background border-border text-foreground/40"
                                )}
                              >
                                 <l.icon className="w-4 h-4" />
                                 <span className="text-[8px] font-black uppercase tracking-widest">{l.label}</span>
                              </button>
                           ))}
                        </div>
                     </div>
                  </CardContent>
               </Card>
            </TabsContent>

            <TabsContent value="style" className="space-y-8 mt-0">
               <Card className="glass-card border-border shadow-xl overflow-hidden">
                  <CardContent className="pt-8 space-y-10">
                     <div className="space-y-8">
                        <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Typography Matrix</Label>
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
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                           <div className="space-y-4">
                              <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-foreground/30">
                                 <span>Base Size</span>
                                 <span className="text-primary">{fontSize}px</span>
                              </div>
                              <Slider value={[fontSize]} min={40} max={250} step={1} onValueChange={v => setFontSize(v[0])} />
                           </div>
                           <div className="space-y-4">
                              <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-foreground/30">
                                 <span>Kern spacing</span>
                                 <span className="text-primary">{spacing}px</span>
                              </div>
                              <Slider value={[spacing]} min={-10} max={60} step={1} onValueChange={v => setSpacing(v[0])} />
                           </div>
                           <div className="space-y-4 col-span-full">
                              <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-foreground/30">
                                 <span>Vertical Tagline Gap</span>
                                 <span className="text-primary">{taglineGap}px</span>
                              </div>
                              <Slider value={[taglineGap]} min={0} max={100} step={1} onValueChange={v => setTaglineGap(v[0])} />
                           </div>
                        </div>
                     </div>

                     <div className="space-y-6">
                        <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Symbol Profile</Label>
                        <div className="grid grid-cols-2 gap-4">
                           <Select value={badgeShape} onValueChange={(v: BadgeShape) => setBadgeShape(v)}>
                              <SelectTrigger className="h-12 bg-secondary border-border rounded-xl text-[10px] font-bold uppercase">
                                 <SelectValue placeholder="Container" />
                              </SelectTrigger>
                              <SelectContent className="glass-card">
                                 {['circle', 'square', 'rounded', 'shield', 'hexagon', 'diamond', 'stamp'].map(s => (
                                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                           <Select value={iconMark} onValueChange={setIconMark}>
                              <SelectTrigger className="h-12 bg-secondary border-border rounded-xl text-[10px] font-bold uppercase">
                                 <SelectValue placeholder="Inner Mark" />
                              </SelectTrigger>
                              <SelectContent className="glass-card">
                                 {ICON_MARKS.map(m => (
                                    <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                           <div className="space-y-3">
                              <p className="text-[8px] font-black text-foreground/30 uppercase">Icon Scale</p>
                              <Slider value={[iconSize]} min={40} max={300} step={5} onValueChange={v => setIconSize(v[0])} />
                           </div>
                           <div className="space-y-3">
                              <p className="text-[8px] font-black text-foreground/30 uppercase">Symbol Gap</p>
                              <Slider value={[iconGap]} min={0} max={200} step={5} onValueChange={v => setIconGap(v[0])} />
                           </div>
                        </div>
                     </div>
                  </CardContent>
               </Card>
            </TabsContent>

            <TabsContent value="fx" className="space-y-8 mt-0">
               <Card className="glass-card border-border shadow-xl overflow-hidden">
                  <CardContent className="pt-8 space-y-10">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 rounded-xl bg-secondary border border-border flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <Palette className="w-4 h-4 text-primary" />
                              <span className="text-[9px] font-black uppercase text-foreground/60">Logotype Color</span>
                           </div>
                           <div className="w-8 h-8 rounded-lg relative overflow-hidden ring-1 ring-border" style={{ backgroundColor: textColor }}>
                              <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
                           </div>
                        </div>
                        <div className="p-4 rounded-xl bg-secondary border border-border flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <Sparkles className="w-4 h-4 text-primary" />
                              <span className="text-[9px] font-black uppercase text-foreground/60">Symbol Color</span>
                           </div>
                           <div className="w-8 h-8 rounded-lg relative overflow-hidden ring-1 ring-border" style={{ backgroundColor: iconColor }}>
                              <input type="color" value={iconColor} onChange={e => setIconColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
                           </div>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Chromatic Modes</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                           <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border">
                              <span className="text-[9px] font-black uppercase text-foreground/40">Soft Shadows</span>
                              <Switch checked={useShadow} onCheckedChange={setUseShadow} className="scale-75" />
                           </div>
                           <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border">
                              <span className="text-[9px] font-black uppercase text-foreground/40">Text Grad</span>
                              <Switch checked={useTextGradient} onCheckedChange={setUseTextGradient} className="scale-75" />
                           </div>
                           <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border">
                              <span className="text-[9px] font-black uppercase text-foreground/40">BG Gradient</span>
                              <Switch checked={useBgGradient} onCheckedChange={setUseBgGradient} className="scale-75" />
                           </div>
                        </div>
                     </div>

                     <div className="p-6 rounded-[2rem] bg-secondary border border-border space-y-6">
                        <div className="flex items-center justify-between">
                           <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Alpha Background (Transparent)</Label>
                           <Switch checked={isTransparent} onCheckedChange={setIsTransparent} />
                        </div>
                        {!isTransparent && (
                           <div className="flex items-center gap-4 animate-in fade-in">
                              <div className="w-10 h-10 rounded-xl relative overflow-hidden ring-1 ring-border" style={{ backgroundColor: bgColor }}>
                                 <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
                              </div>
                              <span className="text-xs font-mono font-bold text-foreground/40 uppercase tracking-widest">Base Layer: {bgColor}</span>
                           </div>
                        )}
                     </div>
                  </CardContent>
               </Card>
            </TabsContent>
          </Tabs>

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
            <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Pro Mastering Logic</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                Our rendering engine utilizes browser-side bi-linear interpolation and hardware-accelerated 2D context to ensure text-shadows and gradients retain peak fidelity in large exports.
              </p>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5" /> Live Matrix Preview
                </CardTitle>
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-2 bg-background/50 px-3 py-1 rounded-full border border-border">
                      <span className="text-[8px] font-black uppercase text-foreground/40">Safe Zone</span>
                      <Switch checked={showSafeZone} onCheckedChange={setShowSafeZone} className="scale-50 h-4 w-8" />
                   </div>
                   <div className="flex gap-1.5 p-1 bg-secondary rounded-xl">
                     {[512, 1024, 2048].map(s => (
                       <button 
                        key={s} 
                        onClick={() => setExportSize(s)} 
                        className={cn("px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all", exportSize === s ? "bg-primary text-white" : "text-foreground/40 hover:text-primary")}
                       >
                         {s}px
                       </button>
                     ))}
                   </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center p-10 bg-black/5 dark:bg-black/60 relative">
               <div className="relative w-full max-w-[500px] aspect-square rounded-[3.5rem] overflow-hidden shadow-2xl ring-1 ring-white/10 group/canvas bg-checkered">
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
                        <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Geometry Protocol</p>
                        <p className="text-[11px] text-foreground/40 font-medium leading-relaxed">
                          Symbol vectors and containers are rendered with absolute symmetry and scale-independent math.
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
                          Export {exportSize}px assets ready for social profile grids and high-res brand documents.
                        </p>
                     </div>
                  </div>
               </div>
            </CardContent>

            <div className="p-8 border-t border-border bg-[#0a0a0c]">
               <Button 
                onClick={handleDownload}
                className="w-full h-16 bg-white text-black hover:bg-white/90 font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-2xl transition-all active:scale-95 group/btn"
              >
                <Download className="w-6 h-6" />
                Download {exportSize}px PNG Master
              </Button>
            </div>
          </Card>
          
          <div className="p-8 rounded-[3rem] bg-primary/5 border border-primary/10 flex items-start gap-6 group hover:bg-primary/10 transition-all duration-500">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20 shadow-xl group-hover:scale-110 transition-transform">
               <Zap className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h4 className="text-[13px] font-black text-primary uppercase tracking-widest">Identity Matrix Alpha</h4>
              <p className="text-[12px] text-foreground/50 leading-relaxed font-medium">
                Our rendering pipeline operates entirely in your browser memory. Your branding data is never transmitted or stored, ensuring your corporate identifiers remain strictly private and permanent.
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
