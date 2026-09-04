"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  MousePointer2, 
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
  Move,
  Crosshair,
  Smartphone,
  Monitor,
  Check,
  X,
  Target,
  Scaling,
  Box,
  MonitorPlay,
  Save,
  Square,
  ShieldCheck,
  Activity,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Undo2,
  Redo2,
  Sun,
  Contrast,
  Circle,
  FileArchive,
  MousePointer,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';
import JSZip from 'jszip';

// --- Official Windows CUR Spec Matrix ---
const SIZES = [
  { val: 16, label: '16px' },
  { val: 24, label: '24px' },
  { val: 32, label: '32px (STD)' },
  { val: 48, label: '48px' },
  { val: 64, label: '64px' },
  { val: 128, label: '128px' },
];

interface CursorState {
  targetSize: number;
  hotspot: { x: number, y: number };
  zoom: number;
  pos: { x: number, y: number };
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  outlineWidth: number;
  outlineColor: string;
  shadowBlur: number;
  shadowColor: string;
  tint: string;
  tintOpacity: number;
  bgColor: string;
}

const INITIAL_STATE: CursorState = {
  targetSize: 32,
  hotspot: { x: 0, y: 0 },
  zoom: 1,
  pos: { x: 0, y: 0 },
  rotation: 0,
  flipH: false,
  flipV: false,
  outlineWidth: 0,
  outlineColor: '#000000',
  shadowBlur: 0,
  shadowColor: 'rgba(0,0,0,0.5)',
  tint: '#3b82f6',
  tintOpacity: 0,
  bgColor: 'transparent'
};

export default function MouseCursorMakerPage() {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [state, setState] = useState<CursorState>(INITIAL_STATE);
  const [showGrid, setShowGrid] = useState(true);
  const [activeTab, setActiveTab] = useState('geometry');
  
  // Hover Test State
  const [testCursorUrl, setTestCursorUrl] = useState<string>('');
  
  // History for Undo
  const [history, setHistory] = useState<CursorState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  // Check mobile status for hover advisory
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024 || /Android|iPhone|iPad/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // --- Rendering Logic ---
  const renderCanvas = useCallback((targetCanvas?: HTMLCanvasElement) => {
    const canvas = targetCanvas || canvasRef.current;
    if (!canvas || !loadedImage) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const s = targetCanvas ? state.targetSize : 512; // High-res preview for UI
    canvas.width = s;
    canvas.height = s;

    ctx.clearRect(0, 0, s, s);

    if (state.bgColor !== 'transparent') {
      ctx.fillStyle = state.bgColor;
      ctx.fillRect(0, 0, s, s);
    }

    const img = loadedImage;
    const baseScale = Math.min(s / img.width, s / img.height);
    const drawW = img.width * baseScale * state.zoom;
    const drawH = img.height * baseScale * state.zoom;

    const previewToRealScale = s / state.targetSize;

    ctx.save();
    
    // Position Translate
    const centerX = s / 2 + (state.pos.x * (s / state.targetSize));
    const centerY = s / 2 + (state.pos.y * (s / state.targetSize));
    ctx.translate(centerX, centerY);
    
    // Transforms
    ctx.rotate((state.rotation * Math.PI) / 180);
    ctx.scale(state.flipH ? -1 : 1, state.flipV ? -1 : 1);

    // Effects Pass 1: Shadow
    if (state.shadowBlur > 0) {
      ctx.shadowColor = state.shadowColor;
      ctx.shadowBlur = state.shadowBlur * previewToRealScale;
      ctx.shadowOffsetY = 2 * previewToRealScale;
    }

    // Effects Pass 2: Tinting
    if (state.tintOpacity > 0) {
      const offscreen = document.createElement('canvas');
      offscreen.width = drawW; offscreen.height = drawH;
      const oCtx = offscreen.getContext('2d');
      if (oCtx) {
        oCtx.drawImage(img, 0, 0, drawW, drawH);
        oCtx.globalCompositeOperation = 'source-atop';
        oCtx.fillStyle = state.tint;
        oCtx.globalAlpha = state.tintOpacity;
        oCtx.fillRect(0, 0, drawW, drawH);
        
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(offscreen, -drawW / 2, -drawH / 2);
      }
    } else {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    }

    // Effects Pass 3: Outline
    if (state.outlineWidth > 0) {
      ctx.shadowBlur = 0;
      ctx.shadowColor = state.outlineColor;
      const ow = state.outlineWidth * previewToRealScale;
      for(let x=-ow; x<=ow; x+=ow/2) {
        for(let y=-ow; y<=ow; y+=ow/2) {
           ctx.drawImage(img, -drawW / 2 + x, -drawH / 2 + y, drawW, drawH);
        }
      }
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    }

    ctx.restore();
  }, [loadedImage, state]);

  // Effect to update the main preview canvas
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Effect to synthesize the CSS-compatible cursor for the hover test zone
  useEffect(() => {
    if (!loadedImage) {
      setTestCursorUrl('');
      return;
    }
    
    // We debounce this slightly to avoid performance drops during slider movement
    const timer = setTimeout(() => {
      const tempCanvas = document.createElement('canvas');
      // Most browsers only support cursor images up to 128x128
      const maxCssSize = Math.min(128, state.targetSize);
      
      // Temporarily render at targetSize for a high-quality CSS data URL
      const exportCanvas = document.createElement('canvas');
      renderCanvas(exportCanvas);
      
      setTestCursorUrl(exportCanvas.toDataURL('image/png'));
    }, 150);

    return () => clearTimeout(timer);
  }, [state, loadedImage, renderCanvas]);

  const commitChange = useCallback((newState: CursorState) => {
    setHistory(prev => {
      const next = [...prev.slice(0, historyIndex + 1), newState].slice(-20);
      setHistoryIndex(next.length - 1);
      return next;
    });
  }, [historyIndex]);

  const updateState = (upd: Partial<CursorState>, silent = false) => {
    const next = { ...state, ...upd };
    setState(next);
    if (!silent) commitChange(next);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setState(prev);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setState(next);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          setLoadedImage(img);
          setImage(result);
          const s = { ...INITIAL_STATE };
          setState(s);
          setHistory([s]);
          setHistoryIndex(0);
          setIsProcessing(false);
          toast({ title: "Signal Isolated", description: "Identity matrix initialized." });
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragStart = (e: any) => {
    if (!image) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    lastMousePos.current = { x: clientX, y: clientY };
    isDragging.current = true;
  };

  const handleDragMove = (e: any) => {
    if (!isDragging.current || !canvasRef.current) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const dx = clientX - lastMousePos.current.x;
    const dy = clientY - lastMousePos.current.y;
    
    const rect = canvasRef.current.parentElement!.getBoundingClientRect();
    const scale = state.targetSize / rect.width;
    
    updateState({ 
      pos: { x: state.pos.x + dx * scale, y: state.pos.y + dy * scale } 
    }, true);
    lastMousePos.current = { x: clientX, y: clientY };
  };

  const handleDragEnd = () => {
    if (isDragging.current) {
      isDragging.current = false;
      commitChange(state);
    }
  };

  const handlePreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!image) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * state.targetSize);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * state.targetSize);
    updateState({ 
      hotspot: { 
        x: Math.max(0, Math.min(x, state.targetSize - 1)), 
        y: Math.max(0, Math.min(y, state.targetSize - 1)) 
      } 
    });
    toast({ title: "Hotspot Re-calibrated" });
  };

  const executeDownload = async () => {
    if (!loadedImage) return;

    const exportCanvas = document.createElement('canvas');
    renderCanvas(exportCanvas);

    exportCanvas.toBlob(async (blob) => {
      if (!blob) return;
      const arrayBuffer = await blob.arrayBuffer();
      const pngBytes = new Uint8Array(arrayBuffer);

      // Windows CUR Binary Protocol
      const header = new Uint8Array([0, 0, 2, 0, 1, 0]);
      const directory = new Uint8Array(16);
      const view = new DataView(directory.buffer);

      view.setUint8(0, state.targetSize >= 256 ? 0 : state.targetSize); 
      view.setUint8(1, state.targetSize >= 256 ? 0 : state.targetSize); 
      view.setUint8(2, 0); 
      view.setUint8(3, 0); 
      view.setUint16(4, state.hotspot.x, true); 
      view.setUint16(6, state.hotspot.y, true); 
      view.setUint32(8, pngBytes.length, true); 
      view.setUint32(12, 22, true); 

      const finalBinary = new Uint8Array(header.length + directory.length + pngBytes.length);
      finalBinary.set(header);
      finalBinary.set(directory, 6);
      finalBinary.set(pngBytes, 22);

      const finalBlob = new Blob([finalBinary], { type: 'image/x-icon' });
      const url = URL.createObjectURL(finalBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mykit_cursor_${state.targetSize}px.cur`;
      link.click();
      
      toast({ title: "Master Exported", description: ".cur protocol synthesized." });
    }, 'image/png');
  };

  const downloadPack = async () => {
    if (!loadedImage) return;
    setIsProcessing(true);
    const zip = new JSZip();
    const targets = [
      { name: 'Normal', x: state.hotspot.x, y: state.hotspot.y },
      { name: 'Help', x: 0, y: 0 },
      { name: 'Working', x: 0, y: 0 },
      { name: 'Precision', x: state.targetSize/2, y: state.targetSize/2 },
    ];

    const generateSingle = async (hs: {x: number, y: number}): Promise<Blob> => {
       const c = document.createElement('canvas');
       c.width = state.targetSize; c.height = state.targetSize;
       const ctx = c.getContext('2d');
       ctx?.drawImage(canvasRef.current!, 0, 0, state.targetSize, state.targetSize);
       const pngBlob = await new Promise<Blob>(r => c.toBlob(b => r(b!), 'image/png'));
       const pngBytes = new Uint8Array(await pngBlob.arrayBuffer());
       const header = new Uint8Array([0, 0, 2, 0, 1, 0]);
       const dir = new Uint8Array(16);
       const v = new DataView(dir.buffer);
       v.setUint8(0, state.targetSize); v.setUint8(1, state.targetSize);
       v.setUint16(4, hs.x, true); v.setUint16(6, hs.y, true);
       v.setUint32(8, pngBytes.length, true); v.setUint32(12, 22, true);
       const final = new Uint8Array(22 + pngBytes.length);
       final.set(header); final.set(dir, 6); final.set(pngBytes, 22);
       return new Blob([final]);
    };

    for(const t of targets) {
       const curBlob = await generateSingle({ x: t.x as number, y: t.y as number });
       zip.file(`${t.name}.cur`, curBlob);
    }
    
    zip.file("INSTALL_GUIDE.txt", "1. Open Mouse Properties\n2. Pointers Tab\n3. Select type and Browse\n4. Apply.");
    
    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `cursor_pack_${Date.now()}.zip`;
    link.click();
    setIsProcessing(false);
    toast({ title: "Archive Exported" });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20 max-w-full">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
            <MousePointer2 className="w-3.5 h-3.5" /> Hardware Identity Studio
          </div>
          <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
            Mouse Cursor <span className="text-primary italic">Maker PRO</span>
          </h1>
          <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
            Professional Windows cursor synthesis. Transform any visual asset into a hardware-compliant .cur protocol with precision hotspot calibration and chromatic FX.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 pb-2">
           <GetHelp toolId="mouse-cursor-maker" />
           {image && (
             <div className="flex bg-secondary p-1 rounded-xl border border-white/5">
                <Button variant="ghost" size="icon" onClick={undo} disabled={historyIndex <= 0} className="h-10 w-10 text-white/40 hover:text-primary"><Undo2 className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={redo} disabled={historyIndex >= history.length - 1} className="h-10 w-10 text-white/40 hover:text-primary"><Redo2 className="w-4 h-4" /></Button>
             </div>
           )}
           <Button variant="outline" size="sm" onClick={() => { setState(INITIAL_STATE); setHistory([INITIAL_STATE]); setHistoryIndex(0); }} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
              <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        
        {/* VIEWPORT - LEFT */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[400px] lg:min-h-[700px] bg-black/60">
             <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
             <CardHeader className="py-4 border-b border-white/5 bg-white/5 flex flex-row items-center justify-between shrink-0 px-6">
                <CardTitle className="text-[9px] font-black text-primary uppercase tracking-[0.4em] flex items-center gap-2">
                   <MonitorPlay className="w-3.5 h-3.5" /> High-Res Matrix Preview
                </CardTitle>
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-2 bg-background/50 px-3 py-1 rounded-full border border-border">
                      <span className="text-[8px] font-black uppercase text-foreground/40">Geometric Grid</span>
                      <Switch checked={showGrid} onCheckedChange={setShowGrid} className="scale-50 h-4 w-8" />
                   </div>
                </div>
             </CardHeader>
             
             <CardContent className="flex-1 flex flex-col items-center justify-center p-8 lg:p-20 relative overflow-hidden bg-checkered">
                {!image ? (
                  <div onClick={() => fileInputRef.current?.click()} className="flex-1 flex flex-col items-center justify-center gap-8 cursor-pointer group w-full text-center border-2 border-dashed border-white/10 rounded-[3rem] hover:border-primary/40 transition-all">
                     <div className="w-20 h-20 rounded-[2.5rem] bg-white/5 flex items-center justify-center text-white/10 group-hover:text-primary group-hover:scale-110 transition-all shadow-xl">
                        <Upload className="w-10 h-10" />
                     </div>
                     <span className="text-sm font-headline font-black uppercase text-white/40">Import Icon Matrix</span>
                     <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </div>
                ) : (
                  <div className="relative w-full h-full flex flex-col items-center justify-center gap-12">
                     <div 
                      className={cn(
                        "relative shadow-2xl rounded-2xl overflow-hidden ring-1 ring-white/10 group/canvas cursor-move transition-all duration-500",
                        "w-full max-w-[400px] aspect-square"
                      )}
                      onMouseDown={handleDragStart}
                      onMouseMove={handleDragMove}
                      onMouseUp={handleDragEnd}
                      onMouseLeave={handleDragEnd}
                      onTouchStart={handleDragStart}
                      onTouchMove={handleDragMove}
                      onTouchEnd={handleDragEnd}
                      onClick={handlePreviewClick}
                     >
                        {showGrid && (
                           <div className="absolute inset-0 z-10 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 0)', backgroundSize: '15px 15px' }} />
                        )}
                        
                        <canvas 
                          ref={canvasRef} 
                          className="w-full h-full object-contain image-pixelated"
                        />
                        
                        {/* Hotspot Indicator */}
                        <div 
                          className="absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
                          style={{ left: `${(state.hotspot.x / (state.targetSize - 1)) * 100}%`, top: `${(state.hotspot.y / (state.targetSize - 1)) * 100}%` }}
                        >
                           <div className="w-full h-full relative">
                              <Crosshair className="absolute inset-0 text-primary w-full h-full animate-pulse" />
                           </div>
                        </div>
                     </div>

                     <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-4 bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
                           <div className="flex items-center gap-2 pr-4 border-r border-white/5">
                              <Target className="w-3.5 h-3.5 text-primary" />
                              <span className="text-[10px] font-mono font-bold text-white uppercase">{state.hotspot.x}, {state.hotspot.y}</span>
                           </div>
                           <span className="text-[9px] font-black uppercase text-white/40 tracking-widest">Active Hotspot</span>
                        </div>
                     </div>
                  </div>
                )}
             </CardContent>
          </Card>

          {/* HOVER TEST ZONE - Fixed implementation */}
          {image && (
            <div className="p-8 rounded-[3rem] bg-secondary border border-border flex flex-col items-center gap-6 animate-in slide-in-from-bottom-6 duration-700">
               <div className="flex items-center gap-3">
                  <MousePointer className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-headline font-black uppercase text-foreground/60 tracking-tight">Hover Interaction Test</h3>
               </div>
               <div 
                className="w-full h-48 rounded-[2.5rem] bg-white dark:bg-black/40 border-2 border-dashed border-primary/20 flex items-center justify-center text-center p-10 transition-all hover:bg-primary/[0.03] group/test"
                style={{ 
                  cursor: testCursorUrl && !isMobile 
                    ? `url(${testCursorUrl}) ${state.hotspot.x} ${state.hotspot.y}, auto` 
                    : 'default' 
                }}
               >
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground/20 group-hover/test:text-primary group-hover/test:opacity-100 transition-all leading-relaxed max-w-xs">
                    {isMobile 
                      ? "Hardware Limitation: Hover test requires a desktop environment." 
                      : "Move your mouse over this zone to test tracking accuracy."}
                  </p>
               </div>
            </div>
          )}
        </div>

        {/* CONTROLS - RIGHT */}
        <aside className="lg:col-span-5 xl:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
           <Card className="glass-card border-border shadow-2xl">
              <CardHeader className="py-6 border-b border-white/5 bg-white/2">
                 <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-3 bg-secondary/50 p-1 rounded-2xl h-12">
                       <TabsTrigger value="geometry" className="text-[9px] font-black uppercase rounded-xl">Geometry</TabsTrigger>
                       <TabsTrigger value="fx" className="text-[9px] font-black uppercase rounded-xl">Style FX</TabsTrigger>
                       <TabsTrigger value="host" className="text-[9px] font-black uppercase rounded-xl">Host</TabsTrigger>
                    </TabsList>
                 </Tabs>
              </CardHeader>

              <CardContent className="pt-8 space-y-10">
                 {/* Geometry Content */}
                 <Tabs value={activeTab} className="w-full">
                    <TabsContent value="geometry" className="m-0 space-y-10 animate-in fade-in">
                       <div className="space-y-4">
                          <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Native Density</Label>
                          <div className="grid grid-cols-3 gap-2">
                             {SIZES.map(s => (
                               <button
                                 key={s.val}
                                 onClick={() => updateState({ targetSize: s.val, hotspot: { x: 0, y: 0 } })}
                                 className={cn(
                                   "h-12 rounded-xl border flex items-center justify-center text-[11px] font-black transition-all",
                                   state.targetSize === s.val ? "bg-primary text-white border-primary shadow-lg" : "bg-secondary/30 border-border text-foreground/40"
                                 )}
                               >
                                  {s.label}
                               </button>
                             ))}
                          </div>
                       </div>

                       <div className="space-y-6">
                          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-foreground/40">
                             <Label className="flex items-center gap-2"><Maximize className="w-3.5 h-3.5 text-primary" /> Visual Scale</Label>
                             <span className="text-primary font-mono text-[10px]">{(state.zoom * 100).toFixed(0)}%</span>
                          </div>
                          <Slider value={[state.zoom * 100]} min={20} max={300} step={1} onValueChange={v => updateState({ zoom: v[0] / 100 }, true)} onValueCommit={() => commitChange(state)} />
                       </div>

                       <div className="space-y-6">
                          <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Transform Matrix</Label>
                          <div className="grid grid-cols-2 gap-4">
                             <Button variant="outline" onClick={() => updateState({ rotation: (state.rotation + 90) % 360 })} className="h-12 bg-background border-border text-[9px] font-black uppercase tracking-widest hover:text-primary transition-all">
                                <RotateCw className="w-4 h-4 mr-2" /> Rotate 90
                             </Button>
                             <div className="flex bg-secondary p-1 rounded-xl border border-border">
                                <button onClick={() => updateState({ flipH: !state.flipH })} className={cn("flex-1 h-10 rounded-lg flex items-center justify-center transition-all", state.flipH ? "bg-primary text-white" : "text-foreground/40")}><FlipHorizontal className="w-4 h-4" /></button>
                                <button onClick={() => updateState({ flipV: !state.flipV })} className={cn("flex-1 h-10 rounded-lg flex items-center justify-center transition-all", state.flipV ? "bg-primary text-white" : "text-foreground/40")}><FlipVertical className="w-4 h-4" /></button>
                             </div>
                          </div>
                       </div>
                    </TabsContent>

                    <TabsContent value="fx" className="m-0 space-y-10 animate-in fade-in">
                       <div className="space-y-8">
                          <div className="space-y-4">
                             <div className="flex justify-between items-center">
                                <Label className="text-[10px] font-black text-foreground/40 uppercase">Outline Width</Label>
                                <span className="text-primary font-mono text-[10px]">{state.outlineWidth}px</span>
                             </div>
                             <Slider value={[state.outlineWidth]} min={0} max={10} step={1} onValueChange={v => updateState({ outlineWidth: v[0] })} />
                             <div className="p-3 bg-secondary rounded-xl border border-border flex items-center justify-between">
                                <span className="text-[9px] font-black uppercase text-foreground/30">Outline Color</span>
                                <input type="color" value={state.outlineColor} onChange={e => updateState({ outlineColor: e.target.value })} className="w-8 h-8 rounded-lg bg-transparent border-none cursor-pointer" />
                             </div>
                          </div>

                          <div className="space-y-4">
                             <div className="flex justify-between items-center">
                                <Label className="text-[10px] font-black text-foreground/40 uppercase">Shadow Blur</Label>
                                <span className="text-primary font-mono text-[10px]">{state.shadowBlur}px</span>
                             </div>
                             <Slider value={[state.shadowBlur]} min={0} max={20} step={1} onValueChange={v => updateState({ shadowBlur: v[0] })} />
                          </div>

                          <div className="p-6 rounded-[2rem] bg-secondary border border-border space-y-4">
                             <div className="flex items-center justify-between">
                                <Label className="text-[10px] font-black text-foreground/40 uppercase">Identity Tint</Label>
                                <span className="text-primary font-mono text-[10px]">{(state.tintOpacity * 100).toFixed(0)}%</span>
                             </div>
                             <Slider value={[state.tintOpacity * 100]} min={0} max={100} step={1} onValueChange={v => updateState({ tintOpacity: v[0]/100 })} />
                             <div className="flex items-center gap-3">
                                {['#3b82f6', '#ef4444', '#22c55e', '#ffffff', '#000000'].map(c => (
                                  <button key={c} onClick={() => updateState({ tint: c })} className={cn("w-6 h-6 rounded-full border border-white/20 transition-all", state.tint === c && "scale-125 ring-2 ring-primary ring-offset-2 ring-offset-black")} style={{ backgroundColor: c }} />
                                ))}
                             </div>
                          </div>
                       </div>
                    </TabsContent>

                    <TabsContent value="host" className="m-0 space-y-10 animate-in fade-in">
                       <div className="space-y-6">
                          <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Hotspot Coordination</Label>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label className="text-[9px] font-bold text-foreground/20 uppercase tracking-widest">X-Axis</Label>
                                <Input type="number" value={state.hotspot.x} onChange={e => updateState({ hotspot: { ...state.hotspot, x: Math.min(state.targetSize-1, parseInt(e.target.value) || 0) }})} className="h-12 bg-secondary/50 border-border font-mono font-bold" />
                             </div>
                             <div className="space-y-2">
                                <Label className="text-[9px] font-bold text-foreground/20 uppercase tracking-widest">Y-Axis</Label>
                                <Input type="number" value={state.hotspot.y} onChange={e => updateState({ hotspot: { ...state.hotspot, y: Math.min(state.targetSize-1, parseInt(e.target.value) || 0) }})} className="h-12 bg-secondary/50 border-border font-mono font-bold" />
                             </div>
                          </div>
                          <div className="flex gap-2">
                             {[
                               { label: 'Tip', x: 0, y: 0 },
                               { label: 'Center', x: Math.floor(state.targetSize/2), y: Math.floor(state.targetSize/2) },
                               { label: 'Base', x: state.targetSize-1, y: state.targetSize-1 }
                             ].map(p => (
                               <button 
                                key={p.label} 
                                onClick={() => updateState({ hotspot: { x: p.x, y: p.y } })}
                                className="flex-1 h-9 rounded-xl border border-white/5 bg-background text-[8px] font-black uppercase text-foreground/30 hover:text-primary"
                               >
                                 Set {p.label}
                               </button>
                             ))}
                          </div>
                       </div>
                       
                       <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <p className="text-[9px] text-foreground/40 font-bold uppercase leading-relaxed">
                            Click directly on the visual matrix in the preview area to set the hotspot.
                          </p>
                       </div>
                    </TabsContent>
                 </Tabs>

                 {/* ACTION CLUSTER */}
                 <div className="pt-6 border-t border-white/5 space-y-4">
                    <Button 
                      onClick={executeDownload} 
                      disabled={!image || isProcessing}
                      className="w-full h-16 bg-primary text-white font-black text-sm uppercase tracking-[0.2em] rounded-3xl shadow-xl shadow-primary/30 active:scale-95 transition-all"
                    >
                       <Download className="w-5 h-5 mr-3" /> Save .CUR Master
                    </Button>
                    <div className="grid grid-cols-2 gap-3">
                       <Button variant="outline" onClick={downloadPack} disabled={!image} className="h-12 rounded-2xl bg-secondary border-border text-[9px] font-black uppercase tracking-widest hover:text-primary">
                          <FileArchive className="w-4 h-4 mr-2" /> Bundle Pack
                       </Button>
                       <Button variant="outline" onClick={() => {
                          const link = document.createElement('a');
                          link.download = `preview_${state.targetSize}.png`;
                          link.href = canvasRef.current?.toDataURL() || '';
                          link.click();
                       }} disabled={!image} className="h-12 rounded-2xl bg-secondary border-border text-[9px] font-black uppercase tracking-widest hover:text-primary">
                          <ImageIcon className="w-4 h-4 mr-2" /> PNG Preview
                       </Button>
                    </div>
                 </div>
              </CardContent>
           </Card>

           <div className="p-8 rounded-[3rem] bg-secondary border border-border space-y-6">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-foreground">Windows Install Protocol</h4>
              <div className="space-y-4">
                {[
                  "1. Open Mouse Properties.",
                  "2. Pointers Tab > Normal Select.",
                  "3. Browse and select your .cur file.",
                  "4. Apply identity matrix."
                ].map((s, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="w-5 h-5 rounded bg-background border border-border flex items-center justify-center text-[9px] font-black text-primary group-hover:scale-110 transition-transform">{i+1}</div>
                    <p className="text-[9px] font-bold text-foreground/40 uppercase tracking-tighter pt-0.5">{s}</p>
                  </div>
                ))}
              </div>
           </div>
        </aside>
      </div>

      <style jsx global>{`
        .image-pixelated { image-rendering: pixelated; image-rendering: crisp-edges; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .bg-checkered {
          background-image: linear-gradient(45deg, #111113 25%, transparent 25%), 
                            linear-gradient(-45deg, #111113 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #111113 75%), 
                            linear-gradient(-45deg, transparent 75%, #111113 75%);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
}
