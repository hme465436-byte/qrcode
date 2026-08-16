"use client"

import React, { useState, useRef, useEffect } from 'react';
import { 
  Eraser, 
  Brush, 
  Upload, 
  Download, 
  Trash2, 
  Info,
  CheckCircle2,
  Palette,
  Eye,
  Crosshair,
  ZoomIn,
  ZoomOut,
  ImagePlus,
  Save,
  MousePointer2,
  Settings2,
  ShieldCheck,
  X,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function BGRemoveProPage() {
  const { toast } = useToast();
  
  // Image states
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Brush settings
  const [brushSize, setBrushSize] = useState(40);
  const [toolMode, setToolMode] = useState<'erase' | 'restore'>('erase');
  
  // Transform states
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  
  // Display settings
  const [bgColor, setBgColor] = useState('transparent');

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);

  // Interaction refs
  const isDragging = useRef(false);
  const isDrawing = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  /**
   * Coordinate Translation Matrix
   * Maps screen coordinates to internal high-res canvas pixels
   */
  const getCanvasCoords = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Scaling ratio between the CSS displayed size and the actual pixel size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  /**
   * Core Brushing Engine
   * Executes erase (transparency) or restore (sampling from source)
   */
  const draw = (x: number, y: number) => {
    const canvas = canvasRef.current;
    const source = sourceImageRef.current;
    if (!canvas || !source) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    ctx.save();
    
    if (toolMode === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(source, 0, 0);
    }
    
    ctx.restore();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        sourceImageRef.current = img;
        setImage(result);
        
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d', { alpha: true });
          if (ctx) {
            ctx.drawImage(img, 0, 0);
          }
          
          // Fit to view calculation
          if (workspaceRef.current) {
            const container = workspaceRef.current.getBoundingClientRect();
            const fitScale = Math.min(
              (container.width - 60) / img.width,
              (container.height - 60) / img.height,
              1
            );
            setZoom(fitScale);
          } else {
            setZoom(1);
          }
          
          setPan({ x: 0, y: 0 });
          setIsProcessing(false);
          toast({ title: "Asset Imported", description: "Studio ready for manual masking." });
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!image) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    if ((e as React.MouseEvent).altKey || (e as any).button === 1) {
      isDragging.current = true;
      lastMousePos.current = { x: clientX, y: clientY };
    } else {
      isDrawing.current = true;
      const coords = getCanvasCoords(clientX, clientY);
      draw(coords.x, coords.y);
    }
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!image) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    if (isDragging.current) {
      const dx = clientX - lastMousePos.current.x;
      const dy = clientY - lastMousePos.current.y;
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      lastMousePos.current = { x: clientX, y: clientY };
    } else if (isDrawing.current) {
      const coords = getCanvasCoords(clientX, clientY);
      draw(coords.x, coords.y);
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    isDrawing.current = false;
  };

  const handleDownload = () => {
    if (!canvasRef.current || !image) return;
    const link = document.createElement('a');
    link.download = `sanitized-mask-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png', 1.0);
    link.click();
    toast({ title: "Asset Exported", description: "Transparent PNG master saved." });
  };

  const resetMask = () => {
    const canvas = canvasRef.current;
    const source = sourceImageRef.current;
    if (!canvas || !source) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(source, 0, 0);
      toast({ title: "Mask Purged", description: "Full pixel density restored." });
    }
  };

  const handleClear = () => {
    setImage(null);
    sourceImageRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset", description: "Buffers cleared." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20 max-w-full">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Eraser className="w-3.5 h-3.5" /> Manual Mask Studio
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <h1 className="text-4xl md:text-7xl font-headline font-black text-foreground uppercase tracking-tight">
                BG Remove <span className="text-primary italic">Pro</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed uppercase tracking-tighter">
                Precision manual background extraction. 100% private local masking occurring strictly in your browser.
              </p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls Sidebar */}
        <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                <Settings2 className="w-5 h-5 text-primary" /> Brushing Protocols
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-10">
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Active Tool</Label>
                <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-background border border-border">
                  <button
                    onClick={() => setToolMode('erase')}
                    className={cn(
                      "h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-all",
                      toolMode === 'erase' ? "bg-primary text-primary-foreground shadow-lg" : "text-foreground/40 hover:text-primary"
                    )}
                  >
                    <Eraser className="w-4 h-4" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Neutralize (Erase)</span>
                  </button>
                  <button
                    onClick={() => setToolMode('restore')}
                    className={cn(
                      "h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-all",
                      toolMode === 'restore' ? "bg-primary text-primary-foreground shadow-lg" : "text-foreground/40 hover:text-primary"
                    )}
                  >
                    <Brush className="w-4 h-4" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Restore (Paint)</span>
                  </button>
                </div>
              </div>

              <div className="space-y-8">
                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-foreground/40">
                       <Label>Brush Diameter</Label>
                       <span className="text-primary font-mono">{brushSize}px</span>
                    </div>
                    <Slider value={[brushSize]} min={1} max={200} step={1} onValueChange={v => setBrushSize(v[0])} />
                 </div>

                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-foreground/40">
                       <Label>Spectral Zoom</Label>
                       <span className="text-primary font-mono">{(zoom * 100).toFixed(0)}%</span>
                    </div>
                    <Slider value={[zoom * 100]} min={5} max={800} step={5} onValueChange={v => setZoom(v[0] / 100)} />
                 </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-border">
                <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Canvas Matrix (Fill)</Label>
                <div className="grid grid-cols-5 gap-2">
                   {[
                     { val: 'transparent', label: 'Alpha' },
                     { val: '#ffffff', label: 'White' },
                     { val: '#000000', label: 'Black' },
                     { val: '#3b82f6', label: 'Blue' },
                     { val: 'custom', label: 'Hex' }
                   ].map((item) => (
                     <button
                       key={item.val}
                       onClick={() => item.val !== 'custom' && setBgColor(item.val)}
                       className={cn(
                         "h-10 rounded-lg border transition-all flex items-center justify-center relative overflow-hidden",
                         bgColor === item.val ? "border-primary ring-2 ring-primary/20" : "border-border"
                       )}
                       title={item.label}
                     >
                       {item.val === 'transparent' ? (
                          <div className="w-full h-full bg-checkered opacity-60" />
                       ) : item.val === 'custom' ? (
                          <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                             <Palette className="w-4 h-4 text-primary" />
                             <input type="color" value={bgColor === 'transparent' ? '#ffffff' : bgColor} onChange={e => setBgColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
                          </div>
                       ) : (
                          <div className="w-full h-full" style={{ backgroundColor: item.val }} />
                       )}
                     </button>
                   ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-border">
                 <Button variant="outline" onClick={resetMask} className="flex-1 h-12 border-border text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-destructive/10 hover:text-destructive">
                    <RotateCcw className="w-3.5 h-3.5 mr-2" /> Restore All
                 </Button>
                 <Button variant="outline" onClick={() => { setPan({ x: 0, y: 0 }); setZoom(1); }} className="flex-1 h-12 border-border text-[9px] font-black uppercase tracking-widest rounded-xl">
                    <Crosshair className="w-3.5 h-3.5 mr-2" /> Center
                 </Button>
              </div>
            </CardContent>
          </Card>

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
            <ShieldCheck className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Privacy Absolute</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                All image masking happens locally. Hardware memory isolation ensures zero-leakage.
              </p>
            </div>
          </div>
        </div>

        {/* Studio Workspace */}
        <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col h-[750px]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
              <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                <Eye className="w-3.5 h-3.5" /> Workspace Identity
              </CardTitle>
              {image && (
                <div className="flex items-center gap-4">
                  <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest">
                    Studio Active
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleClear} className="h-10 w-10 rounded-xl text-foreground/20 hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent ref={workspaceRef} className="flex-1 p-0 flex items-center justify-center bg-[#060608] relative overflow-hidden">
               {!image ? (
                 <div className="h-full w-full flex flex-col items-center justify-center p-20 text-center">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-24 h-24 rounded-[2.5rem] bg-background border border-white/10 flex items-center justify-center text-foreground/10 hover:text-primary hover:scale-110 hover:border-primary/40 transition-all duration-700 shadow-xl cursor-pointer"
                    >
                      <ImagePlus className="w-10 h-10" />
                    </div>
                    <div className="mt-8 space-y-3">
                      <h3 className="text-sm font-black text-white/40 uppercase tracking-[0.3em]">Import Source Asset</h3>
                      <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest max-w-xs mx-auto">High-res JPG, PNG, or WebP recommended.</p>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      accept=".jpg,.jpeg,.png,.webp" 
                      onChange={handleFileUpload} 
                      className="hidden" 
                    />
                 </div>
               ) : (
                 <div className="absolute inset-0 cursor-crosshair overflow-hidden" style={{ backgroundColor: bgColor !== 'transparent' ? bgColor : 'transparent' }}>
                    {bgColor === 'transparent' && <div className="absolute inset-0 bg-checkered opacity-60" />}
                    
                    {/* Transformation Matrix Layer */}
                    <div 
                      className="absolute inset-0 flex items-center justify-center transition-transform duration-100 ease-out"
                      style={{ 
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                      }}
                    >
                       <canvas 
                        ref={canvasRef} 
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleMouseDown}
                        onTouchMove={handleMouseMove}
                        onTouchEnd={handleMouseUp}
                        className="shadow-2xl ring-1 ring-white/10 block max-w-none"
                       />
                    </div>

                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-4">
                      <div className="px-5 py-2.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 flex items-center gap-6 shadow-2xl">
                          <div className="flex items-center gap-4">
                            <button onClick={() => setZoom(z => Math.max(0.05, z - 0.1))} className="text-white/40 hover:text-white"><ZoomOut className="w-4 h-4" /></button>
                            <span className="text-[10px] font-mono font-black text-primary w-12 text-center">{(zoom * 100).toFixed(0)}%</span>
                            <button onClick={() => setZoom(z => Math.min(10, z + 0.1))} className="text-white/40 hover:text-white"><ZoomIn className="w-4 h-4" /></button>
                          </div>
                          <div className="w-[1px] h-4 bg-white/10" />
                          <div className="flex items-center gap-3">
                             <MousePointer2 className="w-4 h-4 text-primary" />
                             <span className="text-[9px] font-black uppercase text-white/40 tracking-widest">ALT + DRAG TO PAN</span>
                          </div>
                      </div>
                    </div>
                 </div>
               )}
            </CardContent>
            
            {image && (
              <div className="p-8 border-t border-border bg-[#0a0a0c]">
                 <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      onClick={handleDownload}
                      className="flex-[2] h-16 bg-white text-black hover:bg-white/90 font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                    >
                      <Save className="w-6 h-6" />
                      Download Transparent PNG
                    </Button>
                 </div>
              </div>
            )}
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
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
