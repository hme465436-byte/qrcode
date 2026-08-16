"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Eraser, 
  Brush, 
  Upload, 
  Download, 
  Trash2, 
  RotateCcw, 
  Maximize2, 
  Info,
  CheckCircle2,
  Loader2,
  Layers,
  Palette,
  Eye,
  Crosshair,
  Zap,
  ZoomIn,
  ZoomOut,
  ImagePlus,
  Save,
  MousePointer2,
  Settings2,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Search,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { removeBackground } from "@imgly/background-removal";

export default function BGRemoveProPage() {
  const { toast } = useToast();
  
  // Image states
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Brush settings
  const [brushSize, setBrushSize] = useState(30);
  const [toolMode, setToolMode] = useState<'erase' | 'restore'>('erase');
  
  // Transform states
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  
  // Display settings
  const [bgColor, setBgColor] = useState('transparent');
  const [displayMode, setDisplayMode] = useState<'result' | 'original' | 'mask'>('result');

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const mainImageRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Interaction refs
  const isDragging = useRef(false);
  const isDrawing = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  /**
   * Main Workspace Rendering Logic
   */
  const drawWorkspace = useCallback(() => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !maskCanvas || !mainImageRef.current) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (displayMode === 'original') {
      ctx.drawImage(mainImageRef.current, 0, 0);
      return;
    }

    if (displayMode === 'mask') {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(maskCanvas, 0, 0);
      return;
    }

    // Default: 'result'
    // Composite: (Background Color) -> (Original Image clipped by Mask)
    ctx.save();
    
    // Draw background color if selected
    if (bgColor !== 'transparent') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw original image
    ctx.drawImage(mainImageRef.current, 0, 0);
    
    // Apply Mask via destination-in (keeps only where mask is white)
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(maskCanvas, 0, 0);
    
    ctx.restore();
  }, [displayMode, bgColor]);

  /**
   * Auto Removal Logic via @imgly/background-removal
   */
  const executeAutoRemove = async (imageSource: string) => {
    setIsProcessing(true);
    setLoadingStatus('Initializing AI Engine...');
    setError(null);
    
    try {
      setLoadingStatus('Isolating Subject Matrix...');
      const blob = await removeBackground(imageSource, {
        progress: (key, current, total) => {
          setLoadingStatus(`Rendering: ${Math.round((current / total) * 100)}%`);
        }
      });

      const processedUrl = URL.createObjectURL(blob);
      const processedImg = new Image();
      processedImg.crossOrigin = "anonymous";
      
      processedImg.onload = () => {
        const maskCanvas = maskCanvasRef.current;
        if (!maskCanvas) return;
        const mCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
        if (!mCtx) return;

        mCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
        mCtx.drawImage(processedImg, 0, 0);
        
        // Convert non-transparent pixels to solid white (opaque mask)
        const imgData = mCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] > 0) {
            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
            data[i + 3] = 255;
          }
        }
        mCtx.putImageData(imgData, 0, 0);

        URL.revokeObjectURL(processedUrl);
        setIsProcessing(false);
        setLoadingStatus('');
        drawWorkspace();
        toast({ title: "Auto-Scrub Complete", description: "Subject isolated via neural matrix." });
      };
      processedImg.src = processedUrl;
    } catch (err: any) {
      console.error('Auto remove error:', err);
      setError("AI Engine was restricted. Reverting to manual mode.");
      setIsProcessing(false);
      setLoadingStatus('');
    }
  };

  useEffect(() => {
    drawWorkspace();
  }, [drawWorkspace]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setLoadingStatus('Mapping Visual Matrix...');

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        mainImageRef.current = img;
        setImage(result);
        
        // Setup canvas sizes
        const canvas = canvasRef.current;
        const maskCanvas = maskCanvasRef.current;
        if (canvas && maskCanvas) {
          canvas.width = img.width;
          canvas.height = img.height;
          maskCanvas.width = img.width;
          maskCanvas.height = img.height;
          
          // Initial mask: fully opaque so user sees the image immediately
          const mCtx = maskCanvas.getContext('2d');
          if (mCtx) {
            mCtx.fillStyle = 'white';
            mCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
          }
          
          setZoom(1);
          setPan({ x: 0, y: 0 });
          drawWorkspace();
          
          // Trigger the AI heavy-lifting
          executeAutoRemove(result);
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const getCanvasCoords = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const drawOnMask = (x: number, y: number) => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.lineWidth = brushSize / zoom;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (toolMode === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'white';
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.restore();
    
    drawWorkspace();
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
      const ctx = maskCanvasRef.current?.getContext('2d');
      if (ctx) ctx.beginPath();
      drawOnMask(coords.x, coords.y);
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
      drawOnMask(coords.x, coords.y);
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    isDrawing.current = false;
  };

  const handleDownload = () => {
    if (!canvasRef.current || !image) return;
    const link = document.createElement('a');
    link.download = `mykit-bg-removed-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png', 1.0);
    link.click();
    toast({ title: "Master Exported", description: "Alpha-channeled PNG ready." });
  };

  const resetMask = () => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
      drawWorkspace();
      toast({ title: "Matrix Reset", description: "Transparency buffer restored." });
    }
  };

  const handleClear = () => {
    setImage(null);
    mainImageRef.current = null;
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Workspace Purged", description: "Memory cleared." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20 max-w-full">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Eraser className="w-3.5 h-3.5" /> Identity Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <h1 className="text-4xl md:text-7xl font-headline font-black text-foreground uppercase tracking-tight">
                BG Remove <span className="text-primary italic">Pro</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed uppercase tracking-tighter">
                Professional-grade background extraction. 100% private re-matricing occurring strictly in browser memory.
              </p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                <Settings2 className="w-5 h-5 text-primary" /> Production Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-10">
              {/* Brushing Mode */}
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Brushing Mode</Label>
                <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-background border border-border">
                  <button
                    onClick={() => setToolMode('erase')}
                    className={cn(
                      "h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-all",
                      toolMode === 'erase' ? "bg-primary text-primary-foreground shadow-lg" : "text-foreground/40 hover:text-primary"
                    )}
                  >
                    <Eraser className="w-4 h-4" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Neutralize</span>
                  </button>
                  <button
                    onClick={() => setToolMode('restore')}
                    className={cn(
                      "h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-all",
                      toolMode === 'restore' ? "bg-primary text-primary-foreground shadow-lg" : "text-foreground/40 hover:text-primary"
                    )}
                  >
                    <Brush className="w-4 h-4" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Restore</span>
                  </button>
                </div>
              </div>

              {/* Brush & Zoom Settings */}
              <div className="space-y-8">
                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-foreground/40">
                       <Label>Brush Scale</Label>
                       <span className="text-primary font-mono">{brushSize}px</span>
                    </div>
                    <Slider value={[brushSize]} min={1} max={200} step={1} onValueChange={v => setBrushSize(v[0])} />
                 </div>

                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-foreground/40">
                       <Label>Spectral Zoom</Label>
                       <span className="text-primary font-mono">{(zoom * 100).toFixed(0)}%</span>
                    </div>
                    <Slider value={[zoom * 100]} min={50} max={800} step={10} onValueChange={v => setZoom(v[0] / 100)} />
                 </div>
              </div>

              {/* Display Matrix */}
              <div className="space-y-4 pt-6 border-t border-border">
                <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Display Protocol</Label>
                <div className="grid grid-cols-3 gap-2">
                   {[
                     { id: 'result', label: 'Result', icon: Eye },
                     { id: 'original', label: 'Original', icon: Search },
                     { id: 'mask', label: 'Mask', icon: Layers }
                   ].map(mode => (
                     <button
                       key={mode.id}
                       onClick={() => setDisplayMode(mode.id as any)}
                       className={cn(
                         "h-10 rounded-xl border text-[8px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                         displayMode === mode.id ? "bg-primary text-white border-primary" : "bg-background border-border text-foreground/40 hover:text-primary"
                       )}
                     >
                       <mode.icon className="w-3 h-3" />
                       {mode.label}
                     </button>
                   ))}
                </div>
              </div>

              {/* Composition Environment */}
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Composition Background</Label>
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

              {/* Global Actions */}
              <div className="flex gap-4 pt-4 border-t border-border">
                 <Button variant="outline" onClick={resetMask} className="flex-1 h-12 border-border text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5 mr-2" /> Reset
                 </Button>
                 <Button variant="outline" onClick={() => setPan({ x: 0, y: 0 })} className="flex-1 h-12 border-border text-[9px] font-black uppercase tracking-widest rounded-xl">
                    <Crosshair className="w-3.5 h-3.5 mr-2" /> Center
                 </Button>
              </div>
            </CardContent>
          </Card>

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
            <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Protocol Intel</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                Brushing utilizes destination-out logic for clinical removal. Use ALT + Drag to pan across high-res matrices.
              </p>
            </div>
          </div>
        </div>

        {/* Visual Workspace */}
        <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[700px]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
              <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                <Eye className="w-3.5 h-3.5" /> Workspace Matrix
              </CardTitle>
              {image && (
                <div className="flex items-center gap-4">
                  <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest">
                    {isProcessing ? 'AI Scrubber Active' : 'Verified Matrix'}
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleClear} className="h-10 w-10 rounded-xl text-foreground/20 hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-1 p-0 flex items-center justify-center bg-[#060608] relative overflow-hidden">
               {!image ? (
                 <div className="h-full w-full flex flex-col items-center justify-center p-20">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-24 h-24 rounded-[2.5rem] bg-background border border-border flex items-center justify-center text-foreground/10 hover:text-primary hover:scale-110 hover:border-primary/40 transition-all duration-700 shadow-xl cursor-pointer"
                    >
                      <ImagePlus className="w-10 h-10" />
                    </div>
                    <div className="mt-8 text-center space-y-2">
                      <h3 className="text-sm font-black text-foreground/40 uppercase tracking-[0.3em]">Import Visual Matrix</h3>
                      <p className="text-[10px] text-foreground/20 font-bold uppercase tracking-widest">JPG, PNG, WebP up to 10MB</p>
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
                 <div className="absolute inset-0 cursor-crosshair overflow-hidden bg-checkered">
                    {/* Transformation Layer */}
                    <div 
                      className="absolute top-1/2 left-1/2 flex items-center justify-center transition-transform duration-100 ease-out"
                      style={{ 
                        transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        width: mainImageRef.current?.width || 0,
                        height: mainImageRef.current?.height || 0
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
                        className="shadow-2xl ring-1 ring-white/10"
                       />
                       <canvas ref={maskCanvasRef} className="hidden" />
                    </div>

                    {/* HUD Overlays */}
                    {isProcessing && (
                      <div className="absolute inset-0 bg-[#060608]/80 backdrop-blur-xl z-50 flex flex-col items-center justify-center gap-6 p-12 text-center">
                         <div className="relative">
                            <div className="w-28 h-28 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                         </div>
                         <div className="space-y-2">
                            <p className="text-xl font-headline font-black text-white uppercase tracking-tight">{loadingStatus}</p>
                            <p className="text-[10px] text-primary font-black uppercase tracking-[0.4em]">Neural Scrubber Protocol Engaged</p>
                         </div>
                      </div>
                    )}

                    {error && (
                      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4">
                         <div className="px-6 py-3 rounded-2xl bg-destructive text-white flex items-center gap-4 shadow-2xl">
                            <AlertCircle className="w-5 h-5" />
                            <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
                            <button onClick={() => setError(null)} className="text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
                         </div>
                      </div>
                    )}

                    {/* Navigation HUD */}
                    {!isProcessing && (
                      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-4">
                        <div className="px-5 py-2.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 flex items-center gap-6 shadow-2xl">
                            <div className="flex items-center gap-4">
                              <button onClick={() => setZoom(z => Math.max(0.1, z - 0.2))} className="text-white/40 hover:text-white"><ZoomOut className="w-4 h-4" /></button>
                              <span className="text-[10px] font-mono font-black text-primary w-12 text-center">{(zoom * 100).toFixed(0)}%</span>
                              <button onClick={() => setZoom(z => Math.min(8, z + 0.2))} className="text-white/40 hover:text-white"><ZoomIn className="w-4 h-4" /></button>
                            </div>
                            <div className="w-[1px] h-4 bg-white/10" />
                            <div className="flex items-center gap-3">
                               <MousePointer2 className="w-4 h-4 text-primary" />
                               <span className="text-[9px] font-black uppercase text-white/40 tracking-widest">ALT + DRAG TO PAN</span>
                            </div>
                        </div>
                      </div>
                    )}
                 </div>
               )}
            </CardContent>
            
            {image && !isProcessing && (
              <div className="p-8 border-t border-border bg-[#0a0a0c]">
                 <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      onClick={handleDownload}
                      className="flex-[2] h-16 bg-white text-black hover:bg-white/90 font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-2xl transition-all active:scale-95 group/btn"
                    >
                      <Save className="w-6 h-6" />
                      Download Translucent Master
                    </Button>
                    <div className="flex-1 grid grid-cols-2 gap-3">
                       <div className="p-4 rounded-2xl bg-secondary/50 border border-border flex flex-col justify-center">
                          <p className="text-[8px] font-black text-foreground/30 uppercase tracking-widest">Protocol</p>
                          <p className="text-[10px] font-bold text-foreground">ALPHA PNG</p>
                       </div>
                       <div className="p-4 rounded-2xl bg-secondary/50 border border-border flex flex-col justify-center">
                          <p className="text-[8px] font-black text-foreground/30 uppercase tracking-widest">Synthesis</p>
                          <p className="text-[10px] font-bold text-primary">100% LOCAL</p>
                       </div>
                    </div>
                 </div>
              </div>
            )}
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="p-6 rounded-[2.5rem] bg-secondary border border-border flex items-start gap-5 group">
                <ShieldCheck className="w-6 h-6 text-primary mt-1 shrink-0" />
                <div className="space-y-1">
                   <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest">Privacy Sovereign</h4>
                   <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">Removal logic executes strictly in browser memory. Hardware identifiers are never logged.</p>
                </div>
             </div>
             <div className="p-6 rounded-[2.5rem] bg-secondary border border-border flex items-start gap-5 group">
                <Maximize2 className="w-6 h-6 text-primary mt-1 shrink-0" />
                <div className="space-y-1">
                   <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest">WASM Acceleration</h4>
                   <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">Hardware-accelerated neural pass for clinical subject isolation in milliseconds.</p>
                </div>
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
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
