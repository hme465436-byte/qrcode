
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
  Minimize2,
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
  MonitorCheck,
  ShieldAlert,
  Move,
  Lock,
  Unlock,
  X,
  AlignLeft,
  AlignRight,
  ArrowRightLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
  bgZoom: number;
  bgPosX: number;
  bgPosY: number;
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
  isLocked: boolean;
  unlockTextLayers: boolean;
  nameOffset: { x: number, y: number };
  taglineOffset: { x: number, y: number };
  extraOffset: { x: number, y: number };
  scheduleOffset: { x: number, y: number };
  socialOffset: { x: number, y: number };
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
  bgZoom: 1,
  bgPosX: 0,
  bgPosY: 0,
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
  isLocked: false,
  unlockTextLayers: false,
  nameOffset: { x: 0, y: 0 },
  taglineOffset: { x: 0, y: 0 },
  extraOffset: { x: 0, y: 0 },
  scheduleOffset: { x: 0, y: 0 },
  socialOffset: { x: 0, y: 0 },
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
  
  // Image Cache State
  const [cachedBgImage, setCachedBgImage] = useState<HTMLImageElement | null>(null);
  const [cachedLogo, setCachedLogo] = useState<HTMLImageElement | null>(null);

  // UI State
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [showSafeZone, setShowSafeZone] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockResults, setStockResults] = useState<string[]>([]);
  const [isStockLoading, setIsStockLoading] = useState(false);
  const [activeTab, setActiveEditorTab] = useState('identity');
  const [importQuery, setImportQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(0.15);

  // Drag State
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const draggingPart = useRef<'bg' | 'name' | 'tagline' | 'extra' | 'schedule' | 'social' | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // --- Persistence ---
  useEffect(() => {
    const saved = localStorage.getItem('mykit_yt_banners_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) setHistory(parsed);
      } catch (e) {}
    }
  }, []);

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const i = new Image();
      i.crossOrigin = 'anonymous';
      i.onload = () => resolve(i);
      i.onerror = (e) => reject(e);
      i.src = src;
    });
  };

  // --- Image Pre-loading Protocols ---
  useEffect(() => {
    if (state.bgType === 'image' && state.bgImage) {
      loadImage(state.bgImage).then(setCachedBgImage).catch(() => setCachedBgImage(null));
    } else {
      setCachedBgImage(null);
    }
  }, [state.bgImage, state.bgType]);

  useEffect(() => {
    if (state.logo) {
      loadImage(state.logo).then(setCachedLogo).catch(() => setCachedLogo(null));
    } else {
      setCachedLogo(null);
    }
  }, [state.logo]);

  // --- Synthesis Engine ---
  const renderCanvas = useCallback(async (targetCanvas?: HTMLCanvasElement) => {
    const canvas = targetCanvas || canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    
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
    } else if (state.bgType === 'image' && cachedBgImage) {
      const img = cachedBgImage;
      const scale = Math.max(CANVAS_W / img.width, CANVAS_H / img.height);
      
      ctx.save();
      if (state.bgBlur > 0) ctx.filter = `blur(${state.bgBlur}px)`;
      
      const finalW = img.width * scale * state.bgZoom;
      const finalH = img.height * scale * state.bgZoom;
      
      const dx = (CANVAS_W - finalW) / 2 + state.bgPosX;
      const dy = (CANVAS_H - finalH) / 2 + state.bgPosY;
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, dx, dy, finalW, finalH);
      ctx.restore();
    }

    // 2. Contrast Overlay
    ctx.fillStyle = `rgba(0,0,0,${state.overlayOpacity})`;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // 3. Identity Text Pass
    const getBaseX = () => CANVAS_W / 2 + state.xOffset;
    const getBaseY = () => CANVAS_H / 2 + state.yOffset;

    const getFinalX = (localX: number) => state.unlockTextLayers ? CANVAS_W / 2 + localX : getBaseX() + localX;
    const getFinalY = (localY: number, baseOffset: number) => state.unlockTextLayers ? CANVAS_H / 2 + localY : getBaseY() + localY + baseOffset;

    // Shape Background
    if (state.useShapeBg) {
      ctx.save();
      ctx.fillStyle = state.shapeBgColor;
      ctx.globalAlpha = state.shapeBgOpacity;
      const bgW = SAFE_W * 0.9;
      const bgH = state.fontSize * 2.5;
      ctx.roundRect(getBaseX() - bgW/2, getBaseY() - bgH/2, bgW, bgH, 40);
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
    const nameX = getFinalX(state.nameOffset.x);
    const nameY = getFinalY(state.nameOffset.y, -20);
    if (state.outlineWidth > 0) {
      ctx.strokeStyle = state.outlineColor;
      ctx.lineWidth = state.outlineWidth;
      ctx.strokeText(state.name.toUpperCase(), nameX, nameY);
    }
    ctx.fillText(state.name.toUpperCase(), nameX, nameY);

    // Tagline
    ctx.font = `600 ${state.fontSize * 0.35}px ${state.fontFamily}`;
    ctx.globalAlpha = 0.8;
    ctx.letterSpacing = `${state.letterSpacing * 2}px`;
    ctx.fillText(state.tagline.toUpperCase(), getFinalX(state.taglineOffset.x), getFinalY(state.taglineOffset.y, state.fontSize * 0.5));

    // Extra line
    if (state.extraLine) {
      ctx.font = `500 ${state.fontSize * 0.25}px ${state.fontFamily}`;
      ctx.globalAlpha = 0.6;
      ctx.fillText(state.extraLine.toUpperCase(), getFinalX(state.extraOffset.x), getFinalY(state.extraOffset.y, state.fontSize * 0.85));
    }

    // Schedule
    if (state.schedule) {
      ctx.font = `500 ${state.fontSize * 0.18}px ${state.fontFamily}`;
      ctx.globalAlpha = 0.4;
      ctx.fillText(state.schedule.toUpperCase(), getFinalX(state.scheduleOffset.x), getFinalY(state.scheduleOffset.y, state.fontSize * 1.15));
    }
    
    // Social
    if (state.socialHandle) {
      ctx.font = `700 ${state.fontSize * 0.22}px ${state.fontFamily}`;
      ctx.globalAlpha = 0.7;
      ctx.fillText(state.socialHandle.toUpperCase(), getFinalX(state.socialOffset.x), getFinalY(state.socialOffset.y, state.fontSize * 1.45));
    }
    ctx.restore();

    // 4. Logo Pass
    if (cachedLogo) {
      const logoImg = cachedLogo;
      const lSize = 220;
      ctx.drawImage(logoImg, getBaseX() - lSize/2, getBaseY() - state.fontSize - 160, lSize, lSize);
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
  }, [state, showSafeZone, cachedBgImage, cachedLogo]);

  useEffect(() => {
    const handle = requestAnimationFrame(() => renderCanvas());
    return () => cancelAnimationFrame(handle);
  }, [renderCanvas]);

  // --- History and Interaction Handlers ---
  const commitChange = (s: BannerState) => {
    setUndoStack(prev => [...prev.slice(-19), s]);
    setRedoStack([]);
  };

  const handleDragStart = (e: any) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    lastMousePos.current = { x: clientX, y: clientY };
    isDragging.current = true;

    if (state.unlockTextLayers) {
      // Logic for selecting text parts would go here based on bounding boxes
      // For MVP, we allow dragging bg if not locked
      if (state.isLocked) isDragging.current = false;
    } else {
      if (state.isLocked) isDragging.current = false;
    }
  };

  const handleDragMove = (e: any) => {
    if (!isDragging.current || !canvasRef.current) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const dx = clientX - lastMousePos.current.x;
    const dy = clientY - lastMousePos.current.y;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const scale = CANVAS_W / rect.width;
    
    if (state.unlockTextLayers) {
      // Simple fallback for background drag
      setState(prev => ({ 
        ...prev, 
        bgPosX: prev.bgPosX + dx * scale, 
        bgPosY: prev.bgPosY + dy * scale 
      }));
    } else {
      setState(prev => ({ 
        ...prev, 
        bgPosX: prev.bgPosX + dx * scale, 
        bgPosY: prev.bgPosY + dy * scale 
      }));
    }
    
    lastMousePos.current = { x: clientX, y: clientY };
  };

  const handleDragEnd = () => {
    if (isDragging.current) {
      isDragging.current = false;
      commitChange(state);
    }
  };

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'bg' | 'logo') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const res = event.target?.result as string;
        if (type === 'bg') updateState({ bgType: 'image', bgImage: res, bgZoom: 1, bgPosX: 0, bgPosY: 0 });
        else updateState({ logo: res });
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchStock = async () => {
    setIsStockLoading(true);
    try {
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

  const handleArchive = () => {
    const newEntry = {
      ...state,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };
    const newHistory = [newEntry, ...history].slice(0, 15);
    setHistory(newHistory);
    localStorage.setItem('mykit_yt_banners_v3', JSON.stringify(newHistory));
    toast({ title: "Archived", description: "Design saved to local registry." });
  };

  const handleExport = async (fmt: 'png' | 'jpg') => {
    if (!canvasRef.current) return;
    setIsProcessing(true);
    
    const exportCanvas = document.createElement('canvas');
    await renderCanvas(exportCanvas);
    
    const mime = fmt === 'png' ? 'image/png' : 'image/jpeg';
    let quality = 0.95;
    let dataUrl = exportCanvas.toDataURL(mime, quality);

    while (dataUrl.length * 0.75 > 6 * 1024 * 1024 && quality > 0.1) {
      quality -= 0.05;
      dataUrl = exportCanvas.toDataURL(mime, quality);
    }

    const link = document.createElement('a');
    link.download = `yt-banner-${state.name.toLowerCase()}-${Date.now()}.${fmt}`;
    link.href = dataUrl;
    link.click();
    setIsProcessing(false);
    toast({ title: "Master Exported" });
  };

  const isOutsideSafeZone = Math.abs(state.xOffset) > (SAFE_W / 2) || Math.abs(state.yOffset) > (SAFE_H / 2);

  const viewportStyles = {
    tv: { width: '100%', height: '100%' },
    desktop: { width: '100%', height: '29.375%' }, 
    tablet: { width: '72.46%', height: '29.375%' }, 
    mobile: { width: '60.39%', height: '29.375%' }, 
    compare: { width: '100%', height: '100%' }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-full bg-[#0a0a0c] min-h-screen">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
            <MonitorPlay className="w-3.5 h-3.5" /> High-Fidelity Suite
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-headline font-black text-white uppercase tracking-tight leading-none">
            YouTube <span className="text-primary italic">Banner Studio Pro</span>
          </h1>
        </div>
        <div className="flex items-center gap-3 shrink-0 pb-2">
           <GetHelp toolId="youtube-banner" />
           <div className="flex bg-secondary p-1 rounded-xl border border-white/5">
              <Button variant="ghost" size="icon" onClick={undo} disabled={undoStack.length === 0} className="text-white/40 hover:text-primary"><Undo2 className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" onClick={redo} disabled={redoStack.length === 0} className="text-white/40 hover:text-primary"><Redo2 className="w-4 h-4" /></Button>
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
                       <TabsTrigger value="canvas" className="text-[8px] font-black uppercase">Background</TabsTrigger>
                       <TabsTrigger value="stock" className="text-[8px] font-black uppercase">Discovery</TabsTrigger>
                    </TabsList>

                    <div className="p-8 space-y-8">
                       <TabsContent value="identity" className="m-0 space-y-10 animate-in fade-in">
                          {/* 1. BRANDING INPUTS */}
                          <div className="space-y-6">
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
                          </div>

                          {/* 2. POSITIONING SYSTEM */}
                          <div className="space-y-6 pt-6 border-t border-white/5">
                             <div className="flex items-center justify-between">
                                <Label className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Positioning Matrix</Label>
                                <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1 rounded-full border border-border">
                                   <span className="text-[8px] font-black uppercase text-foreground/40">Unlock Layers</span>
                                   <Switch checked={state.unlockTextLayers} onCheckedChange={v => updateState({ unlockTextLayers: v })} className="scale-75" />
                                </div>
                             </div>

                             {state.unlockTextLayers ? (
                               <div className="space-y-6 animate-in slide-in-from-top-2">
                                  {/* Individual Layer Controls */}
                                  {[
                                    { id: 'nameOffset', label: 'NAME', color: 'text-primary' },
                                    { id: 'taglineOffset', label: 'TAGLINE', color: 'text-primary/60' },
                                    { id: 'scheduleOffset', label: 'SCHEDULE', color: 'text-primary/40' },
                                  ].map(layer => (
                                    <div key={layer.id} className="space-y-3 p-4 rounded-2xl bg-secondary/30 border border-border">
                                       <div className="flex justify-between items-center">
                                          <span className={cn("text-[9px] font-black uppercase tracking-widest", layer.color)}>{layer.label}</span>
                                          <button onClick={() => updateState({ [layer.id]: { x: 0, y: 0 } })} className="text-[8px] font-black text-foreground/20 hover:text-primary transition-all">RESET</button>
                                       </div>
                                       <div className="grid grid-cols-2 gap-6">
                                          <div className="space-y-2">
                                             <div className="flex justify-between text-[7px] font-black text-foreground/30 uppercase"><span>Horizontal</span><span>{state[layer.id as keyof BannerState].x}px</span></div>
                                             <Slider value={[state[layer.id as keyof BannerState].x]} min={-1000} max={1000} step={1} onValueChange={v => updateState({ [layer.id]: { ...state[layer.id as keyof BannerState], x: v[0] } })} />
                                          </div>
                                          <div className="space-y-2">
                                             <div className="flex justify-between text-[7px] font-black text-foreground/30 uppercase"><span>Vertical</span><span>{state[layer.id as keyof BannerState].y}px</span></div>
                                             <Slider value={[state[layer.id as keyof BannerState].y]} min={-700} max={700} step={1} onValueChange={v => updateState({ [layer.id]: { ...state[layer.id as keyof BannerState], y: v[0] } })} />
                                          </div>
                                       </div>
                                    </div>
                                  ))}
                               </div>
                             ) : (
                               <div className="space-y-8 animate-in slide-in-from-top-2">
                                  <div className="space-y-4">
                                     <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-foreground/30">
                                        <span className="flex items-center gap-2"><ArrowRightLeft className="w-3 h-3" /> Global X Offset</span>
                                        <span className="text-primary">{state.xOffset}px</span>
                                     </div>
                                     <Slider value={[state.xOffset]} min={-1000} max={1000} step={1} onValueChange={v => updateState({ xOffset: v[0] })} />
                                  </div>
                                  <div className="space-y-4">
                                     <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-foreground/30">
                                        <span className="flex items-center gap-2"><Move className="w-3 h-3" /> Global Y Offset</span>
                                        <span className="text-primary">{state.yOffset}px</span>
                                     </div>
                                     <Slider value={[state.yOffset]} min={-500} max={500} step={1} onValueChange={v => updateState({ yOffset: v[0] })} />
                                  </div>
                                  <div className="grid grid-cols-3 gap-2">
                                     {[-100, 0, 100].map(val => (
                                       <button key={val} onClick={() => updateState({ xOffset: val })} className="h-8 rounded-xl bg-background border border-border text-[8px] font-black uppercase text-foreground/30 hover:text-primary transition-all">X: {val}</button>
                                     ))}
                                  </div>
                               </div>
                             )}
                          </div>

                          {/* 3. STYLE & TYPOGRAPHY */}
                          <div className="space-y-6 pt-6 border-t border-white/5">
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                   <Label className="text-[9px] font-black uppercase text-foreground/40">Typography</Label>
                                   <Select value={state.fontIndex.toString()} onValueChange={v => updateState({ fontIndex: parseInt(v), fontFamily: FONTS[parseInt(v)].val })}>
                                      <SelectTrigger className="h-10 bg-secondary/50 rounded-xl text-[10px] font-black uppercase">
                                         <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent className="glass-card">
                                         {FONTS.map((f, i) => <SelectItem key={i} value={i.toString()} className="text-[10px] font-black uppercase">{f.label}</SelectItem>)}
                                      </SelectContent>
                                   </Select>
                                </div>
                                <div className="space-y-2">
                                   <Label className="text-[9px] font-black uppercase text-foreground/40">Chromatic Value</Label>
                                   <div className="flex items-center gap-3 p-2 bg-secondary/50 border border-border rounded-xl">
                                      <div className="w-6 h-6 rounded-lg relative overflow-hidden ring-1 ring-white/10" style={{ backgroundColor: state.textColor }}>
                                         <input type="color" value={state.textColor} onChange={e => updateState({ textColor: e.target.value })} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
                                      </div>
                                      <span className="text-[9px] font-mono font-bold text-foreground/20 uppercase">{state.textColor}</span>
                                   </div>
                                </div>
                             </div>
                             <div className="space-y-4">
                                <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-foreground/30">
                                   <span>Typographic Scale</span>
                                   <span className="text-primary">{state.fontSize}px</span>
                                </div>
                                <Slider value={[state.fontSize]} min={40} max={250} step={1} onValueChange={v => updateState({ fontSize: v[0] })} />
                             </div>
                          </div>
                       </TabsContent>

                       <TabsContent value="canvas" className="m-0 space-y-8 animate-in fade-in">
                          <div className="space-y-4">
                             <Label className="text-[10px] font-black text-foreground/40 uppercase">Background Protocol</Label>
                             <div className="grid grid-cols-3 gap-2">
                                {(['color', 'gradient', 'image'] as const).map(t => (
                                  <button key={t} onClick={() => updateState({ bgType: t })} className={cn("h-10 rounded-xl border text-[9px] font-black uppercase transition-all", state.bgType === t ? "bg-primary text-white border-primary shadow-lg" : "bg-secondary/30 border-border text-foreground/30 hover:text-primary")}>{t}</button>
                                ))}
                             </div>
                          </div>

                          {state.bgType === 'image' && state.bgImage ? (
                            <div className="space-y-10 animate-in zoom-in-95">
                               <div className="p-4 rounded-[2rem] bg-secondary border border-border space-y-8">
                                  <div className="flex items-center justify-between">
                                     <div className="flex items-center gap-2">
                                        <Scaling className="w-3.5 h-3.5 text-primary" />
                                        <span className="text-[10px] font-black uppercase text-foreground/40">Visual Scale</span>
                                     </div>
                                     <span className="text-primary font-mono text-[10px]">{(state.bgZoom * 100).toFixed(0)}%</span>
                                  </div>
                                  <Slider value={[state.bgZoom * 100]} min={10} max={400} step={1} onValueChange={v => updateState({ bgZoom: v[0] / 100 }, false)} />
                                  
                                  <div className="space-y-4 pt-2">
                                     <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                           <span className="text-[8px] font-black text-foreground/20 uppercase ml-1">X OFFSET</span>
                                           <Slider value={[state.bgPosX]} min={-2000} max={2000} step={1} onValueChange={v => updateState({ bgPosX: v[0] }, false)} />
                                        </div>
                                        <div className="space-y-2">
                                           <span className="text-[8px] font-black text-foreground/20 uppercase ml-1">Y OFFSET</span>
                                           <Slider value={[state.bgPosY]} min={-1000} max={1000} step={1} onValueChange={v => updateState({ bgPosY: v[0] }, false)} />
                                        </div>
                                     </div>
                                     <div className="grid grid-cols-3 gap-2">
                                        <Button variant="outline" size="sm" onClick={() => updateState({ bgPosX: 0, bgPosY: 0, bgZoom: 1 })} className="h-8 text-[8px] font-black uppercase col-span-1">Center</Button>
                                        <Button variant="outline" size="sm" onClick={() => updateState({ isLocked: !state.isLocked })} className={cn("h-8 text-[8px] font-black uppercase col-span-2", state.isLocked ? "bg-primary text-white" : "")}>
                                           {state.isLocked ? <Lock className="w-3 h-3 mr-1" /> : <Unlock className="w-3 h-3 mr-1" />} {state.isLocked ? 'Position Locked' : 'Unlock Drag'}
                                        </Button>
                                     </div>
                                  </div>
                               </div>

                               <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                     <Label className="text-[9px] font-black uppercase text-foreground/40">Gaussian Blur</Label>
                                     <Slider value={[state.bgBlur]} min={0} max={40} step={1} onValueChange={v => updateState({ bgBlur: v[0] })} />
                                  </div>
                                  <div className="space-y-2">
                                     <Label className="text-[9px] font-black uppercase text-foreground/40">Dim Layer</Label>
                                     <Slider value={[state.overlayOpacity * 100]} min={0} max={100} step={1} onValueChange={v => updateState({ overlayOpacity: v[0]/100 })} />
                                  </div>
                               </div>
                            </div>
                          ) : (
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
                          )}

                          <div className="p-4 border-2 border-dashed border-white/5 rounded-2xl text-center space-y-4">
                             <Button variant="ghost" onClick={() => fileInputRef.current?.click()} className="text-[9px] font-black uppercase text-primary hover:bg-primary/10 w-full h-12 rounded-xl">
                                <ImageIcon className="w-4 h-4 mr-2" /> Replace Image
                             </Button>
                             <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-widest">DRAG ON PREVIEW TO PAN</p>
                          </div>
                       </TabsContent>

                       <TabsContent value="stock" className="m-0 space-y-8 animate-in fade-in">
                          <div className="space-y-6">
                             <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-foreground/40">Stock Matrix</Label>
                                <div className="flex gap-2">
                                   <Input placeholder="Search high-res visuals..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="h-12 bg-secondary/50 rounded-2xl border-border text-sm font-bold" />
                                   <Button onClick={fetchStock} disabled={isStockLoading} className="h-12 w-12 rounded-2xl bg-primary text-white shrink-0"><Search className="w-5 h-5" /></Button>
                                </div>
                             </div>
                             <div className="grid grid-cols-4 gap-2 h-[200px] overflow-y-auto custom-scrollbar pr-2">
                                {stockResults.map((url, i) => (
                                  <button key={i} onClick={() => updateState({ bgType: 'image', bgImage: url, bgZoom: 1, bgPosX: 0, bgPosY: 0 })} className="aspect-square rounded-xl overflow-hidden border border-white/5 hover:border-primary transition-all">
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

           <div className="p-6 rounded-[2.5rem] bg-secondary/50 border border-border flex items-start gap-6 group hover:border-primary/20 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                 <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                 <p className="text-[9px] font-black uppercase text-foreground/30 tracking-widest">Safe-Zone Validation</p>
                 <Badge variant="outline" className={cn("text-[8px] font-black uppercase", isOutsideSafeZone ? "text-red-500 border-red-500/20" : "text-emerald-500 border-emerald-500/20")}>
                    {isOutsideSafeZone ? 'Outside' : 'Safe'}
                 </Badge>
                 <p className="text-[10px] text-foreground/40 leading-relaxed font-medium mt-1">Identities must reside within the 1546x423 matrix for mobile visibility.</p>
              </div>
           </div>
        </aside>

        {/* WORKSPACE PREVIEW */}
        <main className="lg:col-span-7 xl:col-span-8 space-y-10 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[500px] bg-black">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-4 border-b border-white/5 bg-secondary/30 flex flex-col sm:flex-row sm:items-center justify-between shrink-0 px-6 sm:px-10 gap-6">
                 <div className="flex items-center gap-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <MonitorPlay className="w-5 h-5" />
                    </div>
                    <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar max-w-[280px] sm:max-w-none">
                       {(['tv', 'desktop', 'tablet', 'mobile', 'compare'] as const).map(m => (
                         <button 
                            key={m} 
                            onClick={() => setDeviceMode(m)} 
                            className={cn(
                              "px-4 py-2 rounded-xl text-[8px] sm:text-[10px] font-black uppercase transition-all whitespace-nowrap break-normal", 
                              deviceMode === m ? "bg-primary text-white shadow-lg" : "text-white/20 hover:text-white"
                            )}
                            style={{ writingMode: 'horizontal-tb', textOrientation: 'mixed' }}
                         >
                            {m}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-background/50 px-3 py-1 rounded-full border border-border whitespace-nowrap">
                       <span 
                         className="text-[8px] font-black uppercase text-foreground/40 whitespace-nowrap break-normal"
                         style={{ writingMode: 'horizontal-tb', textOrientation: 'mixed' }}
                       >
                         Safe Zone Guide
                       </span>
                       <Switch checked={showSafeZone} onCheckedChange={setShowSafeZone} className="scale-75" />
                    </div>
                 </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col items-center justify-center p-8 sm:p-20 relative overflow-hidden bg-checkered">
                 <div className="relative group/workspace w-full flex flex-col items-center">
                    
                    {/* Viewport Frame */}
                    <div 
                      className="relative shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] ring-1 ring-white/10 overflow-hidden transition-all duration-700 ease-in-out bg-black"
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

                       <canvas 
                        ref={canvasRef} 
                        className="w-full h-full object-cover"
                        onMouseDown={handleDragStart}
                        onMouseMove={handleDragMove}
                        onMouseUp={handleDragEnd}
                        onMouseLeave={handleDragEnd}
                        onTouchStart={handleDragStart}
                        onTouchMove={handleDragMove}
                        onTouchEnd={handleDragEnd}
                       />
                       
                       {!state.isLocked && state.bgType === 'image' && state.bgImage && (
                          <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
                             <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2 opacity-0 group-hover/workspace:opacity-100 transition-opacity">
                                <Move className="w-3.5 h-3.5 text-primary" />
                                <span className="text-[8px] font-black uppercase text-white tracking-widest whitespace-nowrap">DRAG IMAGE TO POSITION</span>
                             </div>
                          </div>
                       )}
                    </div>

                    <div className="mt-10 flex items-center gap-6 p-1.5 bg-black/60 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl">
                       <button onClick={() => setZoomLevel(z => Math.max(0.1, z - 0.05))} className="p-2 text-white/20 hover:text-white"><Minimize2 className="w-4 h-4" /></button>
                       <span className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest whitespace-nowrap">{Math.round(zoomLevel * 400)}% Matrix View</span>
                       <button onClick={() => setZoomLevel(z => Math.min(0.5, z + 0.05))} className="p-2 text-white/20 hover:text-white"><Maximize2 className="w-4 h-4" /></button>
                    </div>
                 </div>
              </CardContent>

              <div className="p-6 border-t border-white/5 bg-[#0a0a0c] flex flex-col md:flex-row items-center justify-between gap-6 shrink-0">
                 <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                       <MonitorCheck className="w-5 h-5 text-primary/40" />
                       <div className="space-y-0.5">
                          <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest leading-none">Output Matrix</p>
                          <p className="text-sm font-bold text-foreground">2560 x 1440 PX</p>
                       </div>
                    </div>
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
                   <button onClick={() => { setHistory([]); localStorage.removeItem('mykit_yt_banners_v3'); }} className="text-[9px] font-black uppercase text-foreground/20 hover:text-destructive transition-colors">Purge Matrix</button>
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
                        <button onClick={(e) => { e.stopPropagation(); setHistory(prev => prev.filter(p => p.id !== h.id)); }} className="absolute top-1 right-1 p-1 text-white/0 group-hover:text-red-500 transition-all"><X className="w-3.5 h-3.5" /></button>
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
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

