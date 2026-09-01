
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
  Move,
  Camera,
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
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

// --- Production Constants ---
const CANVAS_W = 2560;
const CANVAS_H = 1440;
const SAFE_W = 1546;
const SAFE_H = 423;
const DESKTOP_W = 2560;
const DESKTOP_H = 423;
const TABLET_W = 1855;
const TABLET_H = 423;

type DeviceMode = 'tv' | 'desktop' | 'tablet' | 'mobile';

interface BannerState {
  id: string;
  name: string;
  tagline: string;
  schedule: string;
  logo: string | null;
  bgType: 'color' | 'gradient' | 'image';
  bgColor: string;
  bgColor2: string;
  gradAngle: number;
  bgImage: string | null;
  overlayOpacity: number;
  textColor: string;
  fontSize: number;
  fontFamily: string;
  yOffset: number;
  timestamp: number;
}

const INITIAL_STATE: BannerState = {
  id: 'current',
  name: 'CHANNEL NAME',
  tagline: 'YOUR UNIQUE TAGLINE HERE',
  schedule: 'NEW VIDEOS EVERY WEEK',
  logo: null,
  bgType: 'gradient',
  bgColor: '#1e293b',
  bgColor2: '#0f172a',
  gradAngle: 135,
  bgImage: null,
  overlayOpacity: 0.3,
  textColor: '#ffffff',
  fontSize: 120,
  fontFamily: 'Inter',
  yOffset: 0,
  timestamp: Date.now()
};

const FONTS = [
  { label: 'Modern Sans', val: 'Inter, sans-serif' },
  { label: 'Brutalist', val: 'Impact, sans-serif' },
  { label: 'Technical', val: 'monospace' },
  { label: 'Serif', val: 'serif' },
  { label: 'Display', val: 'system-ui' },
];

const PRESETS = [
  { id: 'gaming', label: 'Gaming', icon: Gamepad2, theme: { bgColor: '#111827', bgColor2: '#7c3aed', name: 'APEX PRO', tagline: 'Competitive Play Daily', fontSize: 140 } },
  { id: 'vlog', label: 'Vlog', icon: CameraIcon, theme: { bgColor: '#ffffff', bgColor2: '#f3f4f6', textColor: '#000000', name: 'DAILY LIFE', tagline: 'Travel • Food • tech', fontSize: 110 } },
  { id: 'tech', label: 'Tech', icon: Zap, theme: { bgType: 'image', bgImage: 'https://picsum.photos/seed/tech/2560/1440', name: 'TECH CORE', tagline: 'Future Logic & Review', textColor: '#3b82f6' } },
  { id: 'business', label: 'Business', icon: Briefcase, theme: { bgColor: '#0f172a', bgColor2: '#1e293b', name: 'STRATEGY HQ', tagline: 'Corporate Advisory Matrix', fontSize: 100 } },
  { id: 'minimal', label: 'Minimal', icon: LayoutGrid, theme: { bgColor: '#000000', name: 'SILENCE', tagline: 'Less is more.', fontSize: 80, gradAngle: 0 } },
];

export default function YoutubeBannerStudioPage() {
  const { toast } = useToast();
  
  // Studio State
  const [state, setState] = useState<BannerState>(INITIAL_STATE);
  const [history, setHistory] = useState<BannerState[]>([]);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [showSafeZone, setShowSafeZone] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isStockLoading, setIsStockLoading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // --- Persistence Matrix ---
  useEffect(() => {
    const saved = localStorage.getItem('mykit_yt_banners_v1');
    if (saved) try { setHistory(JSON.parse(saved)); } catch(e) {}
  }, []);

  const saveToArchive = () => {
    const entry = { ...state, id: Math.random().toString(36).substr(2, 9), timestamp: Date.now() };
    const next = [entry, ...history.filter(h => h.name !== state.name)].slice(0, 10);
    setHistory(next);
    localStorage.setItem('mykit_yt_banners_v1', JSON.stringify(next));
    toast({ title: "Banner Archived", description: "Design saved to local registry." });
  };

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
      const grad = ctx.createLinearGradient(0, 0, Math.cos(state.gradAngle) * CANVAS_W, Math.sin(state.gradAngle) * CANVAS_H);
      grad.addColorStop(0, state.bgColor);
      grad.addColorStop(1, state.bgColor2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    } else if (state.bgType === 'image' && state.bgImage) {
      const img = await new Promise<HTMLImageElement>((resolve) => {
        const i = new Image();
        i.crossOrigin = 'anonymous';
        i.onload = () => resolve(i);
        i.src = state.bgImage!;
      });
      const scale = Math.max(CANVAS_W / img.width, CANVAS_H / img.height);
      ctx.drawImage(img, (CANVAS_W - img.width * scale) / 2, (CANVAS_H - img.height * scale) / 2, img.width * scale, img.height * scale);
    }

    // 2. Contrast Overlay
    ctx.fillStyle = `rgba(0,0,0,${state.overlayOpacity})`;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // 3. Identity Text Pass
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = state.textColor;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 15;

    const centerY = CANVAS_H / 2 + state.yOffset;

    // Channel Name
    ctx.font = `900 ${state.fontSize}px ${state.fontFamily}`;
    ctx.fillText(state.name.toUpperCase(), CANVAS_W / 2, centerY - 20);

    // Tagline
    ctx.font = `600 ${state.fontSize * 0.35}px ${state.fontFamily}`;
    ctx.globalAlpha = 0.8;
    ctx.letterSpacing = '8px';
    ctx.fillText(state.tagline.toUpperCase(), CANVAS_W / 2, centerY + state.fontSize * 0.5);

    // Schedule
    if (state.schedule) {
      ctx.font = `500 ${state.fontSize * 0.2}px ${state.fontFamily}`;
      ctx.globalAlpha = 0.5;
      ctx.letterSpacing = '12px';
      ctx.fillText(state.schedule.toUpperCase(), CANVAS_W / 2, centerY + state.fontSize * 0.85);
    }
    ctx.restore();

    // 4. Logo Pass
    if (state.logo) {
      const logoImg = await new Promise<HTMLImageElement>((resolve) => {
        const i = new Image();
        i.crossOrigin = 'anonymous';
        i.onload = () => resolve(i);
        i.src = state.logo!;
      });
      const lSize = 200;
      ctx.drawImage(logoImg, (CANVAS_W - lSize) / 2, centerY - state.fontSize - 140, lSize, lSize);
    }

    // 5. Safe Zone Visualization (ONLY on workspace canvas)
    if (!targetCanvas && showSafeZone) {
      ctx.save();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 4;
      ctx.setLineDash([20, 20]);
      ctx.strokeRect((CANVAS_W - SAFE_W) / 2, (CANVAS_H - SAFE_H) / 2, SAFE_W, SAFE_H);
      
      // Desktop Guide
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.strokeRect(0, (CANVAS_H - DESKTOP_H) / 2, CANVAS_W, DESKTOP_H);
      ctx.restore();
    }
  }, [state, showSafeZone]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // --- Handlers ---
  const updateState = (upd: Partial<BannerState>) => setState(prev => ({ ...prev, ...upd }));

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
    const q = searchQuery.trim() || 'background';
    const nodes = [
      `https://picsum.photos/seed/${Math.random()}/2560/1440`,
      `https://source.unsplash.com/random/2560x1440?${encodeURIComponent(q)}`,
      `https://loremflickr.com/2560/1440/${encodeURIComponent(q)}`
    ];

    for (const node of nodes) {
      try {
        const res = await fetch(node);
        if (res.ok) {
          updateState({ bgType: 'image', bgImage: node });
          toast({ title: "Stock Pulse Isolated", description: "Visual asset synced via remote node." });
          break;
        }
      } catch (e) {
        console.warn("Node restricted, shifting protocol...");
      }
    }
    setIsStockLoading(false);
  };

  const handleExport = async (fmt: 'png' | 'jpg') => {
    if (!canvasRef.current) return;
    setIsProcessing(true);
    
    // Clean render for export (no guides)
    const exportCanvas = document.createElement('canvas');
    await renderCanvas(exportCanvas);
    
    const mime = fmt === 'png' ? 'image/png' : 'image/jpeg';
    let quality = 0.92;
    let dataUrl = exportCanvas.toDataURL(mime, quality);

    // Auto-compression loop (YouTube max is 6MB)
    while (dataUrl.length * 0.75 > 6 * 1024 * 1024 && quality > 0.1) {
      quality -= 0.1;
      dataUrl = exportCanvas.toDataURL(mime, quality);
    }

    const link = document.createElement('a');
    link.download = `yt-banner-${Date.now()}.${fmt}`;
    link.href = dataUrl;
    link.click();
    setIsProcessing(false);
    toast({ title: "Master Exported", description: `File size: ${formatSize(dataUrl.length * 0.75)}` });
  };

  const formatSize = (bytes: number) => (bytes / (1024 * 1024)).toFixed(2) + ' MB';

  // --- Viewport Logic ---
  const viewportStyles = {
    tv: { width: '100%', height: '100%' },
    desktop: { width: '100%', height: '29.3%' }, // 423 / 1440
    tablet: { width: '72.4%', height: '29.3%' }, // 1855 / 2560
    mobile: { width: '60.3%', height: '29.3%' }  // 1546 / 2560
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* SIDEBAR CONTROLS */}
        <aside className="lg:col-span-5 xl:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative">
              <CardHeader className="py-6 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 text-foreground">
                    <Settings2 className="w-4 h-4 text-primary" /> Matrix Config
                 </CardTitle>
                 <Button variant="ghost" size="icon" onClick={() => setState(INITIAL_STATE)} className="text-foreground/20 hover:text-destructive"><RotateCcw className="w-4 h-4" /></Button>
              </CardHeader>
              <CardContent className="p-0">
                 <Tabs defaultValue="identity" className="w-full">
                    <TabsList className="grid grid-cols-3 h-12 bg-secondary/50 rounded-none border-b border-white/5 p-1">
                       <TabsTrigger value="identity" className="text-[8px] font-black uppercase tracking-widest">Identity</TabsTrigger>
                       <TabsTrigger value="canvas" className="text-[8px] font-black uppercase tracking-widest">Canvas</TabsTrigger>
                       <TabsTrigger value="presets" className="text-[8px] font-black uppercase tracking-widest">Presets</TabsTrigger>
                    </TabsList>

                    <div className="p-8 space-y-8">
                       <TabsContent value="identity" className="m-0 space-y-8">
                          <div className="space-y-4">
                             <Label className="text-[10px] font-black text-foreground/40 uppercase">Channel Name</Label>
                             <Input value={state.name} onChange={e => updateState({ name: e.target.value })} className="h-12 bg-secondary/50 border-border rounded-xl font-black uppercase" />
                          </div>
                          <div className="space-y-4">
                             <Label className="text-[10px] font-black text-foreground/40 uppercase">Tagline Protocol</Label>
                             <Input value={state.tagline} onChange={e => updateState({ tagline: e.target.value })} className="h-12 bg-secondary/50 border-border rounded-xl font-bold uppercase" />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-4">
                                <Label className="text-[10px] font-black text-foreground/40 uppercase">Typography</Label>
                                <Select value={fontIndex.toString()} onValueChange={v => setFontIndex(parseInt(v))}>
                                   <SelectTrigger className="h-11 bg-secondary/50 rounded-xl text-[10px] font-black uppercase">
                                      <SelectValue />
                                   </SelectTrigger>
                                   <SelectContent className="glass-card">
                                      {FONTS.map((f, i) => <SelectItem key={i} value={i.toString()} className="text-[10px] font-black uppercase">{f.label}</SelectItem>)}
                                   </SelectContent>
                                </Select>
                             </div>
                             <div className="space-y-4">
                                <Label className="text-[10px] font-black text-foreground/40 uppercase">Text Color</Label>
                                <div className="flex items-center gap-3 p-2 bg-secondary/50 border border-border rounded-xl">
                                   <div className="w-7 h-7 rounded-lg relative overflow-hidden ring-1 ring-border" style={{ backgroundColor: state.textColor }}>
                                      <input type="color" value={state.textColor} onChange={e => updateState({ textColor: e.target.value })} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
                                   </div>
                                   <span className="text-[10px] font-mono font-bold text-foreground/30 uppercase">{state.textColor}</span>
                                </div>
                             </div>
                          </div>
                          <div className="space-y-4">
                             <div className="flex justify-between text-[9px] font-black text-foreground/30 uppercase">
                                <span>Geometric Scale</span>
                                <span className="text-primary">{state.fontSize}px</span>
                             </div>
                             <Slider value={[state.fontSize]} min={40} max={250} step={1} onValueChange={v => updateState({ fontSize: v[0] })} />
                          </div>
                       </TabsContent>

                       <TabsContent value="canvas" className="m-0 space-y-8">
                          <div className="space-y-4">
                             <Label className="text-[10px] font-black text-foreground/40 uppercase">Background Protocol</Label>
                             <div className="grid grid-cols-3 gap-2">
                                {(['color', 'gradient', 'image'] as const).map(t => (
                                  <button key={t} onClick={() => updateState({ bgType: t })} className={cn("h-10 rounded-xl border text-[9px] font-black uppercase transition-all", state.bgType === t ? "bg-primary text-white border-primary shadow-lg" : "bg-secondary/30 border-border text-foreground/30 hover:text-primary")}>{t}</button>
                                ))}
                             </div>
                          </div>
                          
                          {state.bgType === 'image' ? (
                            <div className="space-y-6 animate-in zoom-in-95">
                               <div className="flex gap-2">
                                  <Input placeholder="Search high-res stock..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="h-12 bg-secondary/50 rounded-xl border-border text-xs" />
                                  <Button onClick={fetchStock} disabled={isStockLoading} className="h-12 w-12 rounded-xl bg-primary text-white shrink-0 shadow-lg">
                                     {isStockLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                  </Button>
                               </div>
                               <button onClick={() => fileInputRef.current?.click()} className="w-full h-24 rounded-2xl border-2 border-dashed border-white/5 bg-white/2 hover:border-primary/40 flex flex-col items-center justify-center gap-2 transition-all">
                                  <Upload className="w-5 h-5 text-white/20" />
                                  <span className="text-[9px] font-black uppercase text-white/20">Inject Custom Asset</span>
                               </button>
                               <input type="file" ref={fileInputRef} accept="image/*" onChange={e => handleFileUpload(e, 'bg')} className="hidden" />
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-4">
                               <div className="p-3 bg-secondary/30 border border-border rounded-xl flex items-center justify-between">
                                  <span className="text-[8px] font-black uppercase text-foreground/20">Primary</span>
                                  <div className="w-8 h-8 rounded-lg relative overflow-hidden" style={{ backgroundColor: state.bgColor }}>
                                     <input type="color" value={state.bgColor} onChange={e => updateState({ bgColor: e.target.value })} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
                                  </div>
                               </div>
                               {state.bgType === 'gradient' && (
                                 <div className="p-3 bg-secondary/30 border border-border rounded-xl flex items-center justify-between">
                                    <span className="text-[8px] font-black uppercase text-foreground/20">Secondary</span>
                                    <div className="w-8 h-8 rounded-lg relative overflow-hidden" style={{ backgroundColor: state.bgColor2 }}>
                                       <input type="color" value={state.bgColor2} onChange={e => updateState({ bgColor2: e.target.value })} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
                                    </div>
                                 </div>
                               )}
                            </div>
                          )}

                          <div className="space-y-4">
                             <div className="flex justify-between text-[9px] font-black text-foreground/30 uppercase">
                                <span>Spectral Dimming</span>
                                <span className="text-primary">{Math.round(state.overlayOpacity * 100)}%</span>
                             </div>
                             <Slider value={[state.overlayOpacity * 100]} min={0} max={100} step={1} onValueChange={v => updateState({ overlayOpacity: v[0]/100 })} />
                          </div>
                       </TabsContent>

                       <TabsContent value="presets" className="m-0 focus:outline-none">
                          <div className="grid grid-cols-2 gap-3">
                             {PRESETS.map(p => (
                               <button 
                                key={p.id} 
                                onClick={() => updateState(p.theme)}
                                className="p-5 rounded-[2rem] bg-secondary/50 border border-border flex flex-col items-center gap-4 group hover:border-primary/40 transition-all hover:bg-primary/5"
                               >
                                  <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner">
                                     <p.icon className="w-5 h-5" />
                                  </div>
                                  <span className="text-[9px] font-black uppercase tracking-widest text-foreground/40 group-hover:text-primary">{p.label} Matrix</span>
                               </button>
                             ))}
                          </div>
                       </TabsContent>
                    </div>
                 </Tabs>
              </CardContent>
              <div className="p-6 border-t border-white/5 bg-[#0a0a0c] space-y-4">
                 <div className="grid grid-cols-2 gap-3">
                    <Button onClick={() => handleExport('png')} className="h-14 rounded-2xl bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all">
                       <Save className="w-4 h-4 mr-2" /> PNG MASTER
                    </Button>
                    <Button variant="outline" onClick={() => handleExport('jpg')} className="h-14 rounded-2xl border-white/10 bg-white/5 text-white/40 font-black uppercase text-[10px] tracking-widest">
                       JPG (高效)
                    </Button>
                 </div>
                 <button onClick={saveToArchive} className="w-full py-2 text-[9px] font-black uppercase text-foreground/20 hover:text-primary transition-colors flex items-center justify-center gap-2 group">
                    <History className="w-3.5 h-3.5 opacity-20 group-hover:rotate-180 transition-transform duration-500" /> Archival Log
                 </button>
              </div>
           </Card>
        </aside>

        {/* WORKSPACE PREVIEW */}
        <main className="lg:col-span-7 xl:col-span-8 space-y-10 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[500px] bg-black">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-4 border-b border-white/5 bg-secondary/30 flex flex-row items-center justify-between shrink-0 px-6 sm:px-10">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <MonitorPlay className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Linguistic Visualizer</CardTitle>
                 </div>
                 
                 <div className="flex items-center gap-2 bg-black/40 p-1 rounded-xl border border-white/5">
                    {(['tv', 'desktop', 'tablet', 'mobile'] as const).map(m => (
                      <button 
                        key={m} 
                        onClick={() => setDeviceMode(m)} 
                        className={cn(
                          "px-4 py-2 rounded-lg text-[8px] font-black uppercase transition-all", 
                          deviceMode === m ? "bg-primary text-white shadow-lg" : "text-white/20 hover:text-white"
                        )}
                      >
                         {m}
                      </button>
                    ))}
                 </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col items-center justify-center p-8 sm:p-20 relative overflow-hidden">
                 <div 
                   className="relative shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] ring-1 ring-white/10 overflow-hidden transition-all duration-700 ease-in-out bg-checkered"
                   style={{ 
                     width: '100%', 
                     aspectRatio: '2560/1440',
                     maxWidth: deviceMode === 'tv' ? '800px' : deviceMode === 'desktop' ? '800px' : deviceMode === 'tablet' ? '580px' : '480px',
                   }}
                 >
                    {/* Viewport Frame Simulator */}
                    <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center overflow-hidden">
                       <div 
                        className="border-4 border-primary/40 transition-all duration-700 shadow-[0_0_100px_rgba(0,0,0,0.8)]"
                        style={{
                          width: viewportStyles[deviceMode].width,
                          height: viewportStyles[deviceMode].height,
                          boxShadow: '0 0 0 5000px rgba(0,0,0,0.85)'
                        }}
                       />
                    </div>

                    <canvas 
                      ref={canvasRef} 
                      className="w-full h-full object-cover transition-transform duration-500" 
                    />
                 </div>

                 {/* Safety Intelligence */}
                 <div className="mt-16 w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-[2.5rem] bg-secondary/50 border border-border flex items-start gap-6 group hover:border-primary/20 transition-all">
                       <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                          <CheckCircle2 className="w-6 h-6" />
                       </div>
                       <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase text-foreground/30 tracking-widest">Protocol Standard</p>
                          <p className="text-[11px] text-foreground/60 font-bold uppercase">2560 x 1440 Master Matrix</p>
                       </div>
                    </div>
                    <div className="p-6 rounded-[2.5rem] bg-secondary/50 border border-border flex items-start gap-6 group hover:border-primary/20 transition-all">
                       <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                          <ShieldCheck className="w-6 h-6" />
                       </div>
                       <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase text-foreground/30 tracking-widest">Safe-Zone Validation</p>
                          <p className="text-[11px] text-foreground/60 font-bold uppercase">1546 x 423 Identity Anchor</p>
                       </div>
                    </div>
                 </div>
              </CardContent>

              <div className="p-8 border-t border-white/5 bg-[#0a0a0c] flex items-center justify-between shrink-0">
                 <div className="flex items-center gap-4">
                    <div className="flex bg-secondary p-1 rounded-xl">
                       <button onClick={() => updateParam({ yOffset: state.yOffset - 10 })} className="p-2 text-white/20 hover:text-white"><ChevronUp className="w-4 h-4" /></button>
                       <button onClick={() => updateParam({ yOffset: state.yOffset + 10 })} className="p-2 text-white/20 hover:text-white"><ChevronDown className="w-4 h-4" /></button>
                    </div>
                    <span className="text-[8px] font-black uppercase text-white/20 tracking-widest">Vertical Calibration</span>
                 </div>
                 <Button onClick={() => setShowSafeZone(!showSafeZone)} variant="ghost" className="text-[9px] font-black uppercase text-primary/40 hover:text-primary">
                    <Eye className="w-4 h-4 mr-2" /> {showSafeZone ? 'Mask Guides' : 'Visual Guides'}
                 </Button>
              </div>
           </Card>

           {/* Archive Module */}
           {history.length > 0 && (
             <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-700">
                <div className="flex items-center justify-between px-2">
                   <div className="flex items-center gap-3">
                      <History className="w-5 h-5 text-primary" />
                      <h3 className="text-xl font-headline font-black uppercase tracking-tight text-foreground/40">Studio Archive</h3>
                   </div>
                   <button onClick={() => { setHistory([]); localStorage.removeItem('mykit_yt_banners_v1'); }} className="text-[9px] font-black uppercase text-foreground/20 hover:text-destructive">Purge Log</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                   {history.map((h) => (
                     <button 
                      key={h.id} 
                      onClick={() => setState(h)}
                      className="group p-2 rounded-2xl bg-secondary/50 border border-white/5 hover:border-primary/40 transition-all text-left"
                     >
                        <div className="aspect-video rounded-xl bg-black overflow-hidden mb-3">
                           <div className="w-full h-full opacity-40 group-hover:opacity-100 transition-opacity" style={{ background: h.bgType === 'gradient' ? `linear-gradient(${h.gradAngle}deg, ${h.bgColor}, ${h.bgColor2})` : h.bgColor }} />
                        </div>
                        <p className="text-[9px] font-black uppercase truncate text-foreground/60">{h.name}</p>
                        <p className="text-[7px] font-bold text-foreground/20 uppercase">{new Date(h.timestamp).toLocaleDateString()}</p>
                     </button>
                   ))}
                </div>
             </div>
           )}
        </main>
      </div>

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

