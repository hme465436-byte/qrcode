"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

// --- Official Windows CUR Spec Logic ---
const SIZES = [
  { val: 32, label: '32px (Standard)' },
  { val: 48, label: '48px (Large)' },
  { val: 64, label: '64px (X-Large)' },
];

export default function MouseCursorMakerPage() {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Settings State
  const [targetSize, setTargetSize] = useState(32);
  const [hotspot, setHotspot] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [bgColor, setBgColor] = useState('transparent');
  const [showGrid, setShowGrid] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const renderCanvas = useCallback(() => {
    if (!canvasRef.current || !loadedImage) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const s = targetSize;
    canvas.width = s;
    canvas.height = s;

    ctx.clearRect(0, 0, s, s);

    if (bgColor !== 'transparent') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, s, s);
    }

    const img = loadedImage;
    const baseScale = Math.min(s / img.width, s / img.height);
    const drawW = img.width * baseScale * zoom;
    const drawH = img.height * baseScale * zoom;

    ctx.save();
    ctx.translate(s / 2 + pos.x, s / 2 + pos.y);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

  }, [loadedImage, targetSize, zoom, pos, bgColor]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ variant: "destructive", title: "Heavy Payload", description: "Standard limit for cursor assets is 5MB." });
        return;
      }
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          setLoadedImage(img);
          setImage(result);
          setZoom(1);
          setPos({ x: 0, y: 0 });
          setHotspot({ x: 0, y: 0 });
          setIsProcessing(false);
          toast({ title: "Identity Imported", description: "Visual data ready for cursor synthesis." });
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    }
  };

  const executeDownload = async () => {
    if (!canvasRef.current || !image) return;

    // Phase 1: Capture PNG Bitstream
    const canvas = canvasRef.current;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const arrayBuffer = await blob.arrayBuffer();
      const pngBytes = new Uint8Array(arrayBuffer);

      // Phase 2: Assemble CUR Matrix (6 bytes header + 16 bytes directory)
      // Reference: [0,0, 2,0, 1,0] -> Type 2 is Cursor
      const header = new Uint8Array([0, 0, 2, 0, 1, 0]);
      const directory = new Uint8Array(16);
      const view = new DataView(directory.buffer);

      view.setUint8(0, targetSize >= 256 ? 0 : targetSize); // Width
      view.setUint8(1, targetSize >= 256 ? 0 : targetSize); // Height
      view.setUint8(2, 0); // Palette
      view.setUint8(3, 0); // Reserved
      view.setUint16(4, hotspot.x, true); // Hotspot X
      view.setUint16(6, hotspot.y, true); // Hotspot Y
      view.setUint32(8, pngBytes.length, true); // Size
      view.setUint32(12, 22, true); // Offset

      const finalBinary = new Uint8Array(header.length + directory.length + pngBytes.length);
      finalBinary.set(header);
      finalBinary.set(directory, 6);
      finalBinary.set(pngBytes, 22);

      const finalBlob = new Blob([finalBinary], { type: 'image/x-icon' });
      const url = URL.createObjectURL(finalBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `studio_cursor_${targetSize}px.cur`;
      link.click();
      
      toast({ title: "Master Exported", description: "Windows .cur protocol synthesized successfully." });
    }, 'image/png');
  };

  const handlePreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!image) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * targetSize);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * targetSize);
    setHotspot({ 
      x: Math.max(0, Math.min(x, targetSize - 1)), 
      y: Math.max(0, Math.min(y, targetSize - 1)) 
    });
    toast({ title: "Hotspot Re-calibrated", description: `Active click point: ${x}, ${y}` });
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
    const scale = targetSize / rect.width;
    
    setPos(prev => ({ x: prev.x + dx * scale, y: prev.y + dy * scale }));
    lastMousePos.current = { x: clientX, y: clientY };
  };

  const handleClear = () => {
    setImage(null);
    setLoadedImage(null);
    setPos({ x: 0, y: 0 });
    setZoom(1);
    setHotspot({ x: 0, y: 0 });
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset" });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
            <MousePointer2 className="w-3.5 h-3.5" /> Hardware Identity Studio
          </div>
          <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
            Mouse Cursor <span className="text-primary italic">Maker Studio</span>
          </h1>
          <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
            Advanced Windows cursor synthesis. Transform visual identifiers into real .cur hardware protocols with interactive hotspot calibration and alpha-channel preservation.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 pb-2">
           <GetHelp toolId="mouse-cursor-maker" />
           {image && (
             <Button variant="outline" size="sm" onClick={handleClear} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
             </Button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Workspace - Preview */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[400px] bg-black/60">
             <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
             <CardHeader className="py-4 border-b border-white/5 bg-white/5 flex flex-row items-center justify-between shrink-0 px-6 sm:px-10">
                <CardTitle className="text-[9px] font-black text-primary uppercase tracking-[0.4em] flex items-center gap-2">
                   <MonitorPlay className="w-3.5 h-3.5" /> Identity Visualizer
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
                     <div className="space-y-2">
                        <span className="text-xl font-headline font-black uppercase text-white/40 group-hover:text-white">Inject Visual Payload</span>
                        <p className="text-[10px] text-white/10 font-bold uppercase tracking-widest">PNG, JPG, WEBP • Alpha Supported</p>
                     </div>
                     <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </div>
                ) : (
                  <div className="relative w-full h-full flex flex-col items-center justify-center gap-12">
                     <div 
                      className={cn(
                        "relative shadow-2xl rounded-2xl overflow-hidden ring-1 ring-white/10 group/canvas cursor-crosshair transition-all duration-500",
                        "w-full max-w-[320px] aspect-square"
                      )}
                      onClick={handlePreviewClick}
                      onMouseDown={handleDragStart}
                      onMouseMove={handleDragMove}
                      onMouseUp={() => { isDragging.current = false; }}
                      onMouseLeave={() => { isDragging.current = false; }}
                      onTouchStart={(e) => handleDragStart(e)}
                      onTouchMove={(e) => handleDragMove(e)}
                      onTouchEnd={() => { isDragging.current = false; }}
                     >
                        {showGrid && (
                           <div className="absolute inset-0 z-10 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 0)', backgroundSize: '10px 10px' }} />
                        )}
                        
                        <canvas 
                          ref={canvasRef} 
                          className="w-full h-full object-contain image-pixelated"
                        />
                        
                        {/* Hotspot Target Overlay */}
                        <div 
                          className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
                          style={{ left: `${(hotspot.x / (targetSize - 1)) * 100}%`, top: `${(hotspot.y / (targetSize - 1)) * 100}%` }}
                        >
                           <div className="w-full h-full relative">
                              <Crosshair className="absolute inset-0 text-primary w-full h-full animate-pulse" />
                              <div className="absolute inset-[35%] bg-primary rounded-full shadow-[0_0_10px_rgba(59,130,246,1)]" />
                           </div>
                        </div>
                     </div>

                     <div className="flex flex-col items-center gap-3">
                        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-[9px] font-black text-white uppercase tracking-widest">
                           <MousePointer2 className="w-3.5 h-3.5 text-primary" /> Active Cursor Preview
                        </div>
                        <p className="text-[10px] text-white/20 font-bold uppercase tracking-tighter">Click on matrix to set Hotspot (Click Point)</p>
                     </div>
                  </div>
                )}
             </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Privacy Sovereign</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    All bitstream re-matricing and .cur synthesis occur 100% locally. Your visual identifiers never leave your browser sandbox.
                  </p>
                </div>
             </div>
             <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <Maximize2 className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Alpha Preservation</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    The studio uses 32-bit PNG encoding within the CUR matrix to preserve high-fidelity transparency for modern Windows versions.
                  </p>
                </div>
             </div>
          </div>
        </div>

        {/* Controls Column */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
           <Card className="glass-card border-border shadow-2xl">
              <CardHeader className="py-6 border-b border-white/5 bg-white/2">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Settings2 className="w-5 h-5 text-primary" /> Matrix Parameters
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-10">
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Geometric Scale</Label>
                    <div className="grid grid-cols-3 gap-2">
                       {SIZES.map(s => (
                         <button
                           key={s.val}
                           onClick={() => { setTargetSize(s.val); setHotspot({ x: 0, y: 0 }); }}
                           className={cn(
                             "h-14 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all",
                             targetSize === s.val ? "bg-primary text-white border-primary shadow-lg scale-105" : "bg-secondary/30 border-border text-foreground/40 hover:text-foreground"
                           )}
                         >
                            <span className="text-[11px] font-black uppercase">{s.val}PX</span>
                            <span className="text-[7px] font-bold opacity-60 uppercase">{s.label.split(' ')[0]}</span>
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-foreground/40">
                       <Label className="flex items-center gap-2"><Maximize className="w-3.5 h-3.5 text-primary" /> Optical Zoom</Label>
                       <span className="text-primary font-mono">{(zoom * 100).toFixed(0)}%</span>
                    </div>
                    <Slider value={[zoom * 100]} min={10} max={400} step={1} onValueChange={v => setZoom(v[0] / 100)} />
                 </div>

                 <div className="space-y-6 pt-6 border-t border-white/5">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Hotspot Calibration</Label>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <Label className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">X Coordinate</Label>
                          <Input type="number" min={0} max={targetSize - 1} value={hotspot.x} onChange={e => setHotspot({...hotspot, x: Math.min(targetSize-1, parseInt(e.target.value) || 0)})} className="h-12 bg-secondary/50 border-border font-mono font-bold" />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">Y Coordinate</Label>
                          <Input type="number" min={0} max={targetSize - 1} value={hotspot.y} onChange={e => setHotspot({...hotspot, y: Math.min(targetSize-1, parseInt(e.target.value) || 0)})} className="h-12 bg-secondary/50 border-border font-mono font-bold" />
                       </div>
                    </div>
                    <div className="flex gap-2">
                       {['tl', 'cc', 'br'].map(p => (
                         <button 
                          key={p} 
                          onClick={() => {
                            if(p==='tl') setHotspot({x:0, y:0});
                            if(p==='cc') setHotspot({x: Math.floor(targetSize/2), y: Math.floor(targetSize/2)});
                            if(p==='br') setHotspot({x: targetSize-1, y: targetSize-1});
                          }}
                          className="flex-1 h-9 rounded-xl border border-white/5 bg-background text-[8px] font-black uppercase text-foreground/30 hover:text-primary transition-all"
                         >
                           Set {p === 'tl' ? 'Tip' : p === 'cc' ? 'Center' : 'Base'}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="pt-4">
                    <Button 
                      onClick={executeDownload} 
                      disabled={!image}
                      className="w-full h-16 bg-primary text-white font-black text-sm uppercase tracking-[0.2em] rounded-3xl shadow-xl shadow-primary/30 active:scale-95 transition-all"
                    >
                       <Download className="w-5 h-5 mr-3" /> Download .CUR Master
                    </Button>
                 </div>
              </CardContent>
           </Card>

           <Card className="glass-card border-border shadow-xl">
              <CardHeader className="py-6 border-b border-white/5 bg-white/2">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 text-foreground">
                    <Zap className="w-4 h-4 text-primary" /> Application Guide
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                 <div className="space-y-4">
                    {[
                      "1. Open Windows Mouse Properties.",
                      "2. Navigate to 'Pointers' tab.",
                      "3. Select 'Normal Select' indicator.",
                      "4. Browse and select your .cur file.",
                      "5. Apply clinical identity matrix."
                    ].map((step, i) => (
                      <div key={i} className="flex gap-4 group">
                         <div className="w-5 h-5 rounded-md bg-secondary border border-border flex items-center justify-center text-[9px] font-black text-primary shrink-0 transition-all group-hover:scale-110">{i+1}</div>
                         <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-tighter pt-0.5">{step}</p>
                      </div>
                    ))}
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
      
      <style jsx global>{`
        .bg-checkered {
          background-image: linear-gradient(45deg, #111113 25%, transparent 25%), 
                            linear-gradient(-45deg, #111113 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #111113 75%), 
                            linear-gradient(-45deg, transparent 75%, #111113 75%);
          background-size: 20px 20px;
        }
        .image-pixelated {
          image-rendering: pixelated;
          image-rendering: crisp-edges;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
      `}</style>
    </div>
  );
}
