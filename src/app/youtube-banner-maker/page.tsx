
"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Youtube, 
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
  Layers,
  Frame,
  Eye,
  Type,
  Scaling,
  Smartphone,
  Monitor,
  Tv,
  Crosshair,
  ArrowRight,
  MonitorPlay,
  Save,
  Square,
  History,
  Gamepad2,
  Briefcase,
  Music,
  Smile,
  Globe,
  Ghost,
  Wind,
  Search,
  BookOpen,
  Camera as CameraIcon,
  AlertTriangle,
  AlignCenter,
  List,
  Check,
  ChevronUp,
  ChevronDown,
  ShieldCheck,
  Undo2,
  Redo2,
  Copy,
  Hash,
  Share2,
  RefreshCcw,
  MonitorCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

// --- Official YouTube Spec Matrix ---
const CANVAS_W = 2560;
const CANVAS_H = 1440;
const SAFE_W = 1546;
const SAFE_H = 423;
const DESKTOP_W = 2560;
const DESKTOP_H = 423;
const TABLET_W = 1855;
const TABLET_H = 423;

type DeviceMode = 'tv' | 'desktop' | 'tablet' | 'mobile' | 'compare';

interface BannerState {
  id: string;
  name: string;
  tagline: string;
  extraLine: string;
  schedule: string;
  socialHandle: string;
  logo: string | null;
  bgType: 'color' | 'gradient' | 'image';
  bgColor: string;
  bgColor2: string;
  bgColor3: string;
  gradAngle: number;
  bgImage: string | null;
  bgBlur: number;
  overlayOpacity: number;
  textColor: string;
  fontSize: number;
  fontFamily: string;
  fontIndex: number;
  yOffset: number;
  xOffset: number;
  letterSpacing: number;
  textShadow: boolean;
  outlineWidth: number;
  outlineColor: string;
  useShapeBg: boolean;
  shapeBgColor: string;
  shapeBgOpacity: number;
  timestamp: number;
}

const FONTS = [
  { label: 'Modern Sans', val: 'Inter, sans-serif' },
  { label: 'Brutalist', val: 'Impact, sans-serif' },
  { label: 'Technical', val: 'monospace' },
  { label: 'Classic Serif', val: 'serif' },
  { label: 'Elegant Display', val: 'system-ui' },
  { label: 'Futuristic', val: 'cursive' },
];

const INITIAL_STATE: BannerState = {
  id: 'current',
  name: 'CHANNEL NAME',
  tagline: 'YOUR UNIQUE TAGLINE HERE',
  extraLine: '',
  schedule: 'NEW VIDEOS EVERY WEEK',
  socialHandle: '@USERNAME',
  logo: null,
  bgType: 'gradient',
  bgColor: '#1e293b',
  bgColor2: '#0f172a',
  bgColor3: '#000000',
  gradAngle: 135,
  bgImage: null,
  bgBlur: 0,
  overlayOpacity: 0.3,
  textColor: '#ffffff',
  fontSize: 120,
  fontFamily: FONTS[0].val,
  fontIndex: 0,
  yOffset: 0,
  xOffset: 0,
  letterSpacing: 4,
  textShadow: true,
  outlineWidth: 0,
  outlineColor: '#000000',
  useShapeBg: false,
  shapeBgColor: '#000000',
  shapeBgOpacity: 0.5,
  timestamp: Date.now()
};

const PRESETS = [
  { id: 'gaming', label: 'Gaming', icon: Gamepad2, theme: { bgColor: '#111827', bgColor2: '#7c3aed', name: 'APEX PRO', tagline: 'Competitive Play Daily', fontSize: 140, fontIndex: 1, fontFamily: FONTS[1].val, textColor: '#ffffff' } },
  { id: 'vlog', label: 'Vlog', icon: CameraIcon, theme: { bgColor: '#ffffff', bgColor2: '#f3f4f6', textColor: '#000000', name: 'DAILY LIFE', tagline: 'Travel • Food • Tech', fontSize: 110, fontIndex: 0, fontFamily: FONTS[0].val } },
  { id: 'tech', label: 'Tech', icon: Zap, theme: { bgType: 'image', bgImage: 'https://picsum.photos/seed/tech/2560/1440', name: 'TECH CORE', tagline: 'Future Logic & Review', textColor: '#3b82f6', fontIndex: 2, fontFamily: FONTS[2].val } },
  { id: 'business', label: 'Business', icon: Briefcase, theme: { bgColor: '#0f172a', bgColor2: '#1e293b', name: 'STRATEGY HQ', tagline: 'Corporate Advisory Matrix', fontSize: 100, fontIndex: 3, fontFamily: FONTS[3].val, textColor: '#ffffff' } },
  { id: 'minimal', label: 'Minimal', icon: LayoutGrid, theme: { bgColor: '#000000', name: 'SILENCE', tagline: 'Less is more.', fontSize: 80, gradAngle: 0, fontIndex: 4, fontFamily: FONTS[4].val, textColor: '#ffffff' } },
  { id: 'luxury', label: 'Luxury', icon: Sparkles, theme: { bgColor: '#1a1a1a', bgColor2: '#2a2a2c', textColor: '#d4af37', name: 'ESTATE', tagline: 'The Gold Standard', fontSize: 120, fontIndex: 4, fontFamily: FONTS[4].val } },
];

export default function YoutubeBannerStudioPage() {
  const { toast } = useToast();
  
  // Studio State
  const [state, setState] = useState<BannerState>(INITIAL_STATE);
  const [history, setHistory] = useState<BannerState[]>([]);
  const [undoStack, setUndoStack] = useState<BannerState[]>([]);
  const [redoStack, setRedoStack] = useState<BannerState[]>([]);
  
  // UI State
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [showSafeZone, setShowSafeZone] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockResults, setStockResults] = useState<string[]>([]);
  const [isStockLoading, setIsStockLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveEditorTab] = useState('identity');
  const [zoomLevel, setZoomLevel] = useState(0.25);
  const [importQuery, setImportQuery] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // --- Persistence ---
  useEffect(() => {
    const saved = localStorage.getItem('mykit_yt_banners_v2');
    if (saved) try { setHistory(JSON.parse(saved)); } catch (e) {}
  }, []);

  // --- Synthesis Engine ---
  const renderCanvas = useCallback(async (targetCanvas?: HTMLCanvasElement) => {
    const canvas = targetCanvas || canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;

    // 1. Background Pass
    if (state.bgType === 'color') {
      ctx.fillStyle = state.bgColor;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    } else if (state.bgType === 'gradient') {
      const grad = ctx.createLinearGradient(0, 0, Math.cos(state.gradAngle * Math.PI / 180) * CANVAS_W, Math.sin(state.gradAngle * Math.PI / 180) * CANVAS_H);
      grad.addColorStop(0, state.bgColor);
      grad.addColorStop(0.5, state.bgColor2);
      grad.addColorStop(1, state.bgColor3);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    } else if (state.bgType === 'image' && state.bgImage) {
      try {
        const img = await loadImage(state.bgImage!);
        const scale = Math.max(CANVAS_W / img.width, CANVAS_H / img.height);
        if (state.bgBlur > 0) ctx.filter = `blur(${state.bgBlur}px)`;
        ctx.drawImage(img, (CANVAS_W - img.width * scale) / 2, (CANVAS_H - img.height * scale) / 2, img.width * scale, img.height * scale);
        ctx.filter = 'none';
      } catch (e) {}
    }

    // 2. Contrast Overlay
    ctx.fillStyle = `rgba(0,0,0,${state.overlayOpacity})`;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // 3. Identity Text Pass
    const centerX = CANVAS_W / 2 + state.xOffset;
    const centerY = CANVAS_H / 2 + state.yOffset;

    // Shape Background
    if (state.useShapeBg) {
      ctx.save();
      ctx.fillStyle = state.shapeBgColor;
      ctx.globalAlpha = state.shapeBgOpacity;
      const bgW = SAFE_W * 0.9;
      const bgH = state.fontSize * 2.5;
      ctx.roundRect(centerX - bgW/2, centerY - bgH/2, bgW, bgH, 40);
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = state.textColor;
    
    if (state.textShadow) {
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 10;
    }

    // Main Name
    ctx.font = `900 ${state.fontSize}px ${state.fontFamily}`;
    ctx.letterSpacing = `${state.letterSpacing}px`;
    if (state.outlineWidth > 0) {
      ctx.strokeStyle = state.outlineColor;
      ctx.lineWidth = state.outlineWidth;
      ctx.strokeText(state.name.toUpperCase(), centerX, centerY - 20);
    }
    ctx.fillText(state.name.toUpperCase(), centerX, centerY - 20);

    // Tagline
    ctx.font = `600 ${state.fontSize * 0.35}px ${state.fontFamily}`;
    ctx.globalAlpha = 0.8;
    ctx.letterSpacing = `${state.letterSpacing * 2}px`;
    ctx.fillText(state.tagline.toUpperCase(), centerX, centerY + state.fontSize * 0.5);

    // Extra line
    if (state.extraLine) {
      ctx.font = `500 ${state.fontSize * 0.25}px ${state.fontFamily}`;
      ctx.globalAlpha = 0.6;
      ctx.fillText(state.extraLine.toUpperCase(), centerX, centerY + state.fontSize * 0.85);
    }

    // Schedule
    if (state.schedule) {
      ctx.font = `500 ${state.fontSize * 0.18}px ${state.fontFamily}`;
      ctx.globalAlpha = 0.4;
      ctx.fillText(state.schedule.toUpperCase(), centerX, centerY + state.fontSize * 1.15);
    }
    
    // Social
    if (state.socialHandle) {
      ctx.font = `700 ${state.fontSize * 0.22}px ${state.fontFamily}`;
      ctx.globalAlpha = 0.7;
      ctx.fillText(state.socialHandle.toUpperCase(), centerX, centerY + state.fontSize * 1.45);
    }
    ctx.restore();

    // 4. Logo Pass
    if (state.logo) {
      try {
        const logoImg = await loadImage(state.logo!);
        const lSize = 220;
        ctx.drawImage(logoImg, centerX - lSize/2, centerY - state.fontSize - 160, lSize, lSize);
      } catch (e) {}
    }

    // 5. Guides
    if (!targetCanvas && showSafeZone) {
      ctx.save();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 4;
      ctx.setLineDash([20, 20]);
      ctx.strokeRect((CANVAS_W - SAFE_W) / 2, (CANVAS_H - SAFE_H) / 2, SAFE_W, SAFE_H);
      
      // Secondary Guide
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.strokeRect(0, (CANVAS_H - DESKTOP_H) / 2, CANVAS_W, DESKTOP_H);
      ctx.restore();
    }
  }, [state, showSafeZone]);

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const i = new Image();
      i.crossOrigin = 'anonymous';
      i.onload = () => resolve(i);
      i.onerror = (e) => reject(e);
      i.src = src;
    });
  };

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // --- Handlers ---
  const updateState = (upd: Partial<BannerState>, track = true) => {
    if (track) {
      setUndoStack(prev => [...prev.slice(-19), state]);
      setRedoStack([]);
    }
    setState(prev => ({ ...prev, ...upd }));
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    setRedoStack(prev => [state, ...prev]);
    setUndoStack(prev => prev.slice(0, -1));
    setState(last);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setUndoStack(prev => [...prev, state]);
    setRedoStack(prev => prev.slice(1));
    setState(next);
  };

  const randomize = () => {
    const randomColor = () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    updateState({
      bgColor: randomColor(),
      bgColor2: randomColor(),
      bgColor3: randomColor(),
      textColor: '#ffffff',
      fontSize: 80 + Math.random() * 100,
      fontIndex: Math.floor(Math.random() * FONTS.length),
      gradAngle: Math.floor(Math.random() * 360)
    });
    toast({ title: "Randomizing Matrix" });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'bg' | 'logo') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const res = event.target?.result as string;
        if (type === 'bg') updateState({ bgType: 'image', bgImage: res });
        else updateState({ logo: res });
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchStock = async () => {
    setIsStockLoading(true);
    const q = searchQuery.trim() || 'landscape';
    const apis = [
      `https://api.unsplash.com/photos/random?query=${q}&count=12&client_id=YOUR_CLIENT_ID`, // Placeholder for real key
      `https://picsum.photos/v2/list?page=${Math.floor(Math.random() * 10)}&limit=12`
    ];

    try {
      // For this studio MVP we provide a high-fidelity randomization from Picsum
      const res = await fetch(`https://picsum.photos/v2/list?page=${Math.floor(Math.random() * 20)}&limit=12`);
      const data = await res.json();
      setStockResults(data.map((item: any) => `https://picsum.photos/id/${item.id}/2560/1440`));
      toast({ title: "Stock Pulse Active" });
    } catch (e) {
      toast({ variant: "destructive", title: "Discovery node restricted." });
    } finally {
      setIsStockLoading(false);
    }
  };

  const handleImportBanner = async () => {
    if (!importQuery) return;
    setIsProcessing(true);
    try {
      // Using banner.yt proxy protocol
      const cleanHandle = importQuery.replace('@', '').trim();
      const bannerUrl = `https://banner.yt/${cleanHandle}/tv`;
      updateState({ bgType: 'image', bgImage: bannerUrl });
      toast({ title: "Banner Isolated", description: "Identity registry synchronized." });
    } catch (e) {
      toast({ variant: "destructive", title: "Lookup Failed" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = async (fmt: 'png' | 'jpg') => {
    if (!canvasRef.current) return;
    setIsProcessing(true);
    
    const exportCanvas = document.createElement('canvas');
    await renderCanvas(exportCanvas);
    
    const mime = fmt === 'png' ? 'image/png' : 'image/jpeg';
    let quality = 0.95;
    let dataUrl = exportCanvas.toDataURL(mime, quality);

    // Iterative bitstream compression protocol
    while (dataUrl.length * 0.75 > 6 * 1024 * 1024 && quality > 0.1) {
      quality -= 0.05;
      dataUrl = exportCanvas.toDataURL(mime, quality);
    }

    const link = document.createElement('a');
    link.download = `yt-banner-${state.name.toLowerCase()}-${Date.now()}.${fmt}`;
    link.href = dataUrl;
    link.click();
    setIsProcessing(false);
    toast({ title: "Master Exported", description: `Size: ${formatSize(dataUrl.length * 0.75)}` });
  };

  const handleDragStart = (e: any) => {
    if (!image) return;
    isDragging.current = true;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    lastMousePos.current = { x: clientX, y: clientY };
  };

  const handleDragMove = (e: any) => {
    if (!isDragging.current || !canvasRef.current) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const dx = clientX - lastMousePos.current.x;
    const dy = clientY - lastMousePos.current.y;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const scale = CANVAS_W / rect.width;
    
    updateState({ xOffset: state.xOffset + dx * scale, yOffset: state.yOffset + dy * scale }, false);
    lastMousePos.current = { x: clientX, y: clientY };
  };

  const handleArchive = () => {
    const entry = { ...state, id: Math.random().toString(36).substr(2, 9), timestamp: Date.now() };
    const next = [entry, ...history].slice(0, 15);
    setHistory(next);
    localStorage.setItem('mykit_yt_banners_v2', JSON.stringify(next));
    toast({ title: "Archived", description: "Design saved to local log." });
  };

  const isOutsideSafeZone = Math.abs(state.xOffset) > (SAFE_W / 2) || Math.abs(state.yOffset) > (SAFE_H / 2);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-full">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
            <MonitorPlay className="w-3.5 h-3.5" /> High-Fidelity Suite
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
            YouTube <span className="text-primary italic">Banner Studio Pro</span>
          </h1>
        </div>
        <div className="flex items-center gap-3 shrink-0 pb-2">
           <GetHelp toolId="youtube-banner" />
           <div className="flex bg-secondary p-1 rounded-xl border border-white/5">
              <Button variant="ghost" size="icon" onClick={undo} disabled={undoStack.length === 0} className="text-foreground/40 hover:text-primary"><Undo2 className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" onClick={redo} disabled={redoStack.length === 0} className="text-foreground/40 hover:text-primary"><Redo2 className="w-4 h-4" /></Button>
           </div>
           <Button variant="outline" size="sm" onClick={() => setState(INITIAL_STATE)} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
              <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* EDITOR CONTROLS */}
        <aside className="lg:col-span-5 xl:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-6 duration-1000">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative">
              <CardHeader className="py-6 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 text-foreground">
                    <Settings2 className="w-5 h-5 text-primary" /> Matrix Parameters
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                 <Tabs value={activeTab} onValueChange={setActiveEditorTab} className="w-full">
                    <TabsList className="grid grid-cols-3 h-12 bg-secondary/50 rounded-none border-b border-white/5 p-1">
                       <TabsTrigger value="identity" className="text-[8px] font-black uppercase">Identity</TabsTrigger>
                       <TabsTrigger value="canvas" className="text-[8px] font-black uppercase">Canvas</TabsTrigger>
                       <TabsTrigger value="stock" className="text-[8px] font-black uppercase">Discovery</TabsTrigger>
                    </TabsList>

                    <div className="p-8 space-y-8">
                       {/* Tab: Identity */}
                       <TabsContent value="identity" className="m-0 space-y-8 animate-in fade-in">
                          <div className="space-y-4">
                             <div className="space-y-2">
                                <Label className="text-[9px] font-black uppercase text-foreground/40 ml-1">Channel Name</Label>
                                <Input value={state.name} onChange={e => updateState({ name: e.target.value })} className="h-12 bg-secondary/50 border-border rounded-xl font-black uppercase" />
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                   <Label className="text-[9px] font-black uppercase text-foreground/40 ml-1">Tagline</Label>
                                   <Input value={state.tagline} onChange={e => updateState({ tagline: e.target.value })} className="h-11 bg-secondary/50 border-border rounded-xl text-xs font-bold uppercase" />
                                </div>
                                <div className="space-y-2">
                                   <Label className="text-[9px] font-black uppercase text-foreground/40 ml-1">Schedule</Label>
                                   <Input value={state.schedule} onChange={e => updateState({ schedule: e.target.value })} className="h-11 bg-secondary/50 border-border rounded-xl text-xs font-bold uppercase" />
                                </div>
                             </div>
                             <div className="space-y-2">
                                <Label className="text-[9px] font-black uppercase text-foreground/40 ml-1">Social Handle</Label>
                                <Input value={state.socialHandle} onChange={e => updateState({ socialHandle: e.target.value })} className="h-11 bg-secondary/50 border-border rounded-xl text-xs font-mono" />
                             </div>
                          </div>

                          <div className="space-y-6 pt-4 border-t border-white/5">
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                   <Label className="text-[9px] font-black uppercase text-foreground/40">Font Family</Label>
                                   <Select value={state.fontIndex.toString()} onValueChange={v => updateState({ fontIndex: parseInt(v), fontFamily: FONTS[parseInt(v)].val })}>
                                      <SelectTrigger className="h-10 bg-secondary/50 rounded-xl text-[9px] font-black uppercase"><SelectValue /></SelectTrigger>
                                      <SelectContent className="glass-card">
                                         {FONTS.map((f, i) => <SelectItem key={i} value={i.toString()} className="text-[10px] font-black uppercase">{f.label}</SelectItem>)}
                                      </SelectContent>
                                   </Select>
                                </div>
                                <div className="space-y-2">
                                   <Label className="text-[9px] font-black uppercase text-foreground/40">Text Color</Label>
                                   <div className="flex items-center gap-3 p-2 bg-secondary/50 border border-border rounded-xl">
                                      <div className="w-6 h-6 rounded-lg relative overflow-hidden ring-1 ring-white/10" style={{ backgroundColor: state.textColor }}>
                                         <input type="color" value={state.textColor} onChange={e => updateState({ textColor: e.target.value })} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
                                      </div>
                                      <span className="text-[9px] font-mono font-bold text-foreground/20 uppercase">{state.textColor}</span>
                                   </div>
                                </div>
                             </div>
                             <div className="space-y-4">
                                <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-foreground/30">
                                   <span>Typographic Scale</span>
                                   <span className="text-primary">{state.fontSize}px</span>
                                </div>
                                <Slider value={[state.fontSize]} min={40} max={250} step={1} onValueChange={v => updateState({ fontSize: v[0] })} />
                             </div>
                          </div>
                       </TabsContent>

                       {/* Tab: Canvas */}
                       <TabsContent value="canvas" className="m-0 space-y-8 animate-in fade-in">
                          <div className="space-y-4">
                             <Label className="text-[10px] font-black text-foreground/40 uppercase">Background Protocol</Label>
                             <div className="grid grid-cols-3 gap-2">
                                {(['color', 'gradient', 'image'] as const).map(t => (
                                  <button key={t} onClick={() => updateState({ bgType: t })} className={cn("h-10 rounded-xl border text-[9px] font-black uppercase transition-all", state.bgType === t ? "bg-primary text-white border-primary shadow-lg" : "bg-secondary/30 border-border text-foreground/30 hover:text-primary")}>{t}</button>
                                ))}
                             </div>
                          </div>

                          {state.bgType !== 'image' ? (
                             <div className="grid grid-cols-3 gap-3 animate-in zoom-in-95">
                                {[state.bgColor, state.bgColor2, state.bgColor3].map((c, i) => (
                                  <div key={i} className="p-3 bg-secondary/30 border border-border rounded-2xl flex flex-col items-center gap-2">
                                     <div className="w-10 h-10 rounded-xl relative overflow-hidden shadow-inner ring-1 ring-white/10" style={{ backgroundColor: c }}>
                                        <input type="color" value={c} onChange={e => {
                                          const keys = ['bgColor', 'bgColor2', 'bgColor3'];
                                          updateState({ [keys[i]]: e.target.value });
                                        }} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
                                     </div>
                                     <span className="text-[8px] font-mono font-bold text-foreground/20">{c}</span>
                                  </div>
                                ))}
                             </div>
                          ) : (
                            <div className="p-10 border-2 border-dashed border-white/5 rounded-[2.5rem] text-center space-y-4">
                               <ImageIcon className="w-10 h-10 text-white/5 mx-auto" />
                               <p className="text-[9px] font-black uppercase text-foreground/20">Custom Asset Active</p>
                               <Button variant="ghost" onClick={() => fileInputRef.current?.click()} className="text-[9px] font-black uppercase text-primary hover:bg-primary/10">Replace Image</Button>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                             <div className="space-y-4">
                                <Label className="text-[10px] font-black text-foreground/40 uppercase">Spectral Dimming</Label>
                                <Slider value={[state.overlayOpacity * 100]} min={0} max={100} step={1} onValueChange={v => updateState({ overlayOpacity: v[0]/100 })} />
                             </div>
                             <div className="space-y-4">
                                <Label className="text-[10px] font-black text-foreground/40 uppercase">Gaussian Blur</Label>
                                <Slider value={[state.bgBlur]} min={0} max={40} step={1} onValueChange={v => updateState({ bgBlur: v[0] })} />
                             </div>
                          </div>
                       </TabsContent>

                       {/* Tab: Discovery */}
                       <TabsContent value="stock" className="m-0 space-y-8 animate-in fade-in">
                          <div className="space-y-6">
                             <div className="space-y-2">
                                <Label className="text-[10px] font-black text-foreground/40 uppercase">Stock Matrix</Label>
                                <div className="flex gap-2">
                                   <Input placeholder="Search high-res visuals..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="h-12 bg-secondary/50 rounded-2xl border-border text-sm font-bold" />
                                   <Button onClick={fetchStock} disabled={isStockLoading} className="h-12 w-12 rounded-2xl bg-primary text-white shrink-0"><Search className="w-5 h-5" /></Button>
                                </div>
                             </div>
                             <div className="grid grid-cols-4 gap-2 h-[200px] overflow-y-auto custom-scrollbar pr-2">
                                {stockResults.map((url, i) => (
                                  <button key={i} onClick={() => updateState({ bgType: 'image', bgImage: url })} className="aspect-square rounded-xl overflow-hidden border border-white/5 hover:border-primary transition-all">
                                     <img src={url.replace('2560/1440', '150/150')} alt="Stock" className="w-full h-full object-cover" />
                                  </button>
                                ))}
                             </div>
                          </div>

                          <div className="space-y-4 pt-6 border-t border-white/5">
                             <Label className="text-[10px] font-black text-foreground/40 uppercase">Import Live Channel</Label>
                             <div className="flex gap-2">
                                <Input placeholder="@handle or URL" value={importQuery} onChange={e => setImportQuery(e.target.value)} className="h-12 bg-secondary/50 rounded-2xl border-border text-sm" />
                                <Button onClick={handleImportBanner} disabled={isProcessing} className="h-12 bg-secondary text-primary font-black uppercase text-[9px] border border-primary/20"><Globe className="w-4 h-4" /></Button>
                             </div>
                          </div>
                       </TabsContent>
                    </div>
                 </Tabs>
              </CardContent>
              <div className="p-8 border-t border-white/5 bg-[#0a0a0c] space-y-4">
                 <div className="grid grid-cols-2 gap-3">
                    <Button onClick={() => handleExport('png')} className="h-16 bg-primary text-white font-black text-xl tracking-tighter uppercase rounded-3xl shadow-2xl shadow-primary/30 active:scale-95 transition-all">
                       <Save className="w-5 h-5 mr-3" /> PNG Master
                    </Button>
                    <div className="grid grid-cols-1 gap-2">
                       <Button variant="outline" onClick={() => handleExport('jpg')} className="h-7 text-[8px] font-black uppercase border-white/5 bg-white/5">JPG</Button>
                       <Button variant="outline" onClick={handleArchive} className="h-7 text-[8px] font-black uppercase border-white/5 bg-white/5">Archive</Button>
                    </div>
                 </div>
              </div>
           </Card>

           {/* Safety Node */}
           <Card className="glass-card border-border shadow-xl">
              <CardContent className="p-8 space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <ShieldCheck className="w-5 h-5 text-primary" />
                       <span className="text-[11px] font-black uppercase text-foreground">Safety Audit</span>
                    </div>
                    <Badge variant="outline" className={cn("text-[8px] font-black uppercase", isOutsideSafeZone ? "text-red-500 border-red-500/20" : "text-emerald-500 border-emerald-500/20")}>
                       {isOutsideSafeZone ? 'Outside' : 'Safe'}
                    </Badge>
                 </div>
                 {isOutsideSafeZone && (
                   <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-4 animate-in shake duration-500">
                      <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                      <p className="text-[9px] text-red-500/70 font-bold uppercase leading-relaxed">Linguistic Warning: Identity elements have drifted outside the 1546px mobile safe area.</p>
                   </div>
                 )}
              </CardContent>
           </Card>
        </aside>

        {/* WORKSPACE PREVIEW */}
        <main className="lg:col-span-7 xl:col-span-8 space-y-10 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[500px] bg-black">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-4 border-b border-border bg-secondary/30 flex flex-row items-center justify-between shrink-0 px-6 sm:px-10">
                 <div className="flex items-center gap-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <MonitorPlay className="w-5 h-5" />
                    </div>
                    <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5">
                       {(['tv', 'desktop', 'tablet', 'mobile', 'compare'] as const).map(m => (
                         <button key={m} onClick={() => setDeviceMode(m)} className={cn("px-4 py-2 rounded-xl text-[8px] font-black uppercase transition-all", deviceMode === m ? "bg-primary text-white shadow-lg" : "text-white/20 hover:text-white")}>{m}</button>
                       ))}
                    </div>
                 </div>

                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-full border border-border">
                       <span className="text-[8px] font-black uppercase text-foreground/40">Safe Zone Guide</span>
                       <Switch checked={showSafeZone} onCheckedChange={setShowSafeZone} className="scale-75" />
                    </div>
                 </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col items-center justify-center p-8 sm:p-20 relative overflow-auto custom-scrollbar bg-checkered">
                 <div className="relative group/workspace w-full flex flex-col items-center">
                    
                    {/* Viewport Frame */}
                    <div 
                      className="relative shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] ring-1 ring-white/10 overflow-hidden transition-all duration-700 ease-in-out bg-black"
                      onMouseDown={handleDragStart}
                      onMouseMove={handleDragMove}
                      onMouseUp={handleDragEnd}
                      onMouseLeave={handleDragEnd}
                      style={{ 
                        width: '100%', 
                        aspectRatio: '2560/1440',
                        maxWidth: '850px',
                        transform: `scale(${zoomLevel / 0.25})`
                      }}
                    >
                       <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
                          {deviceMode !== 'compare' && (
                            <div 
                              className="border-4 border-primary/40 transition-all duration-700 shadow-[0_0_100px_rgba(0,0,0,0.8)]"
                              style={{
                                width: viewportStyles[deviceMode].width,
                                height: viewportStyles[deviceMode].height,
                                boxShadow: '0 0 0 5000px rgba(0,0,0,0.9)'
                              }}
                            />
                          )}
                       </div>

                       <canvas ref={canvasRef} className="w-full h-full object-cover" />
                    </div>

                    {/* Scale Controls */}
                    <div className="mt-10 flex items-center gap-6 p-1.5 bg-black/60 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl">
                       <button onClick={() => setZoomLevel(z => Math.max(0.1, z - 0.05))} className="p-2 text-white/20 hover:text-white"><Minimize2 className="w-4 h-4" /></button>
                       <span className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest">{Math.round(zoomLevel * 400)}% Matrix View</span>
                       <button onClick={() => setZoomLevel(z => Math.min(0.5, z + 0.05))} className="p-2 text-white/20 hover:text-white"><Maximize2 className="w-4 h-4" /></button>
                    </div>
                 </div>
              </CardContent>

              {/* Status Footer */}
              <div className="p-6 border-t border-white/5 bg-[#0a0a0c] flex flex-col md:flex-row items-center justify-between gap-6 shrink-0">
                 <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                       <MonitorCheck className="w-5 h-5 text-primary/40" />
                       <div className="space-y-0.5">
                          <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest leading-none">Output Matrix</p>
                          <p className="text-sm font-bold text-foreground">2560 x 1440 PX</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <ShieldCheck className="w-5 h-5 text-emerald-500/40" />
                       <div className="space-y-0.5">
                          <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest leading-none">Integrity</p>
                          <p className="text-sm font-bold text-emerald-500">DPI CALIBRATED</p>
                       </div>
                    </div>
                 </div>
                 
                 <div className="flex bg-white/5 p-1.5 rounded-2xl gap-2">
                    {PRESETS.map(p => (
                      <button 
                        key={p.id} 
                        onClick={() => updateState(p.theme)}
                        className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground/30 hover:text-primary transition-all border border-transparent hover:border-primary/20"
                        title={p.label}
                      >
                         <p.icon className="w-5 h-5" />
                      </button>
                    ))}
                 </div>
              </div>
           </Card>

           {/* History Module */}
           {history.length > 0 && (
             <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-700">
                <div className="flex items-center justify-between px-2">
                   <div className="flex items-center gap-3">
                      <History className="w-5 h-5 text-primary" />
                      <h3 className="text-xl font-headline font-black uppercase tracking-tight text-foreground/40">Archival Log</h3>
                   </div>
                   <button onClick={() => { setHistory([]); localStorage.removeItem('mykit_yt_banners_v2'); }} className="text-[9px] font-black uppercase text-foreground/20 hover:text-destructive">Purge Matrix</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                   {history.map((h) => (
                     <button 
                      key={h.id} 
                      onClick={() => setState(h)}
                      className="group p-2 rounded-2xl bg-secondary/50 border border-border hover:border-primary/40 transition-all text-left relative overflow-hidden"
                     >
                        <div className="aspect-video rounded-xl bg-black overflow-hidden mb-3">
                           <div className="w-full h-full opacity-40 group-hover:opacity-100 transition-opacity" style={{ background: h.bgType === 'gradient' ? `linear-gradient(${h.gradAngle}deg, ${h.bgColor}, ${h.bgColor2})` : h.bgColor }} />
                        </div>
                        <p className="text-[10px] font-black uppercase truncate text-foreground/60">{h.name}</p>
                        <p className="text-[8px] font-bold text-foreground/20 uppercase">{new Date(h.timestamp).toLocaleDateString()}</p>
                        <button onClick={(e) => { e.stopPropagation(); setHistory(prev => prev.filter(p => p.id !== h.id)); }} className="absolute top-1 right-1 p-1 text-white/0 group-hover:text-red-500 transition-all"><X className="w-3 h-3" /></button>
                     </button>
                   ))}
                </div>
             </div>
           )}
        </main>
      </div>

      {/* Hidden Handshake Nodes */}
      <input type="file" ref={fileInputRef} accept="image/*" onChange={e => handleFileUpload(e, 'bg')} className="hidden" />
      <input type="file" ref={logoInputRef} accept="image/*" onChange={e => handleFileUpload(e, 'logo')} className="hidden" />

      <style jsx global>{`
        .bg-checkered {
          background-image: linear-gradient(45deg, #111113 25%, transparent 25%), 
                            linear-gradient(-45deg, #111113 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #111113 75%), 
                            linear-gradient(-45deg, transparent 75%, #111113 75%);
          background-size: 20px 20px;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const viewportStyles = {
    tv: { width: '100%', height: '100%' },
    desktop: { width: '100%', height: '29.375%' }, // 423 / 1440
    tablet: { width: '72.46%', height: '29.375%' }, // 1855 / 2560
    mobile: { width: '60.39%', height: '29.375%' }, // 1546 / 2560
    compare: { width: '100%', height: '100%' }
};

    