"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  User, 
  Upload, 
  Download, 
  Trash2, 
  Settings2, 
  Info,
  CheckCircle2,
  Maximize,
  Move,
  Search,
  Palette,
  Eye,
  Loader2,
  Circle,
  Smartphone,
  Maximize2,
  ImageIcon,
  Zap,
  LayoutGrid,
  RotateCcw,
  ArrowRightLeft,
  Crosshair,
  SlidersHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const CANVAS_SIZE = 1080; // High resolution square

export default function WhatsAppDPMakerPage() {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [bgMode, setBgMode] = useState<'blur' | 'color'>('blur');
  const [blurStrength, setBlurStrength] = useState(50);
  const [bgColor, setBgColor] = useState('#000000');
  const [showCircleMask, setShowCircleMask] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const renderCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    // 1. Background Fill
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    if (loadedImage) {
      const img = loadedImage;
      
      // 2. Draw Background Layer
      if (bgMode === 'blur') {
        ctx.save();
        ctx.filter = `blur(${blurStrength}px) brightness(0.5)`;
        // Cover fill for background matrix
        const bgScale = Math.max(CANVAS_SIZE / img.width, CANVAS_SIZE / img.height);
        const bgW = img.width * bgScale;
        const bgH = img.height * bgScale;
        ctx.drawImage(img, (CANVAS_SIZE - bgW) / 2, (CANVAS_SIZE - bgH) / 2, bgW, bgH);
        ctx.restore();
      }

      // 3. Draw Main Identity Image
      ctx.save();
      // Base Fit Scale (fit whole image in square initially)
      const baseScale = Math.min(CANVAS_SIZE / img.width, CANVAS_SIZE / img.height);
      const w = img.width * baseScale * zoom;
      const h = img.height * baseScale * zoom;
      
      const centerX = CANVAS_SIZE / 2 + pos.x;
      const centerY = CANVAS_SIZE / 2 + pos.y;
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      ctx.drawImage(img, centerX - w / 2, centerY - h / 2, w, h);
      ctx.restore();
    }
  }, [loadedImage, zoom, pos, bgMode, bgColor, blurStrength]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

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
          setImage(result);
          setLoadedImage(img);
          setZoom(1);
          setPos({ x: 0, y: 0 });
          setIsProcessing(false);
          toast({ title: "Visual Imported", description: "Matrix initialized for HD production." });
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragStart = (clientX: number, clientY: number) => {
    if (!image) return;
    isDragging.current = true;
    lastMousePos.current = { x: clientX, y: clientY };
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging.current || !image) return;
    
    const deltaX = clientX - lastMousePos.current.x;
    const deltaY = clientY - lastMousePos.current.y;

    const container = canvasRef.current?.parentElement;
    if (container) {
      // Adjust movement scale relative to visual preview size vs real 1080px matrix
      const previewScale = CANVAS_SIZE / container.clientWidth;
      setPos(prev => ({ x: prev.x + deltaX * previewScale, y: prev.y + deltaY * previewScale }));
    }

    lastMousePos.current = { x: clientX, y: clientY };
  };

  const handleDragEnd = () => {
    isDragging.current = false;
  };

  const resetPosition = () => {
    setPos({ x: 0, y: 0 });
    setZoom(1);
    toast({ title: "Position Reset", description: "Identity centered in matrix." });
  };

  const applyFillPreset = () => {
    if (!loadedImage) return;
    // Scale to cover entire 1080 square
    const scale = Math.max(CANVAS_SIZE / loadedImage.width, CANVAS_SIZE / loadedImage.height) / (Math.min(CANVAS_SIZE / loadedImage.width, CANVAS_SIZE / loadedImage.height));
    setZoom(scale);
    setPos({ x: 0, y: 0 });
    toast({ title: "Fill Pattern Active", description: "Aspect scaled to cover square." });
  };

  const handleDownload = () => {
    if (!canvasRef.current || !image) return;
    const link = document.createElement('a');
    link.download = `mykit-whatsapp-dp-hd-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png', 1.0);
    link.click();
    toast({ title: "Production Success", description: "1080px HD square master exported." });
  };

  const handleClear = () => {
    setImage(null);
    setLoadedImage(null);
    setPos({ x: 0, y: 0 });
    setZoom(1);
    setBgMode('blur');
    setBlurStrength(50);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset", description: "Project memory purged." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <User className="w-3.5 h-3.5" /> Identity Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          WhatsApp <span className="text-primary italic">DP Master</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
          The ultimate profile picture production studio. Create full-size profile pics with atmospheric blur, zero-loss scaling, and precision circular preview.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Preview Pane - Left/Top */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-6 duration-1000">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[500px]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5" /> Studio Master Preview
                </CardTitle>
                <div className="flex items-center gap-3">
                   <div className="px-3 py-1 rounded-lg bg-background/50 border border-border text-[9px] font-black text-foreground/40 uppercase tracking-widest">1080 × 1080 Matrix</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 bg-[#060608]">
              <div className="relative w-full max-w-[500px] aspect-square rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-white/10 group/canvas cursor-move bg-checkered">
                {image && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 opacity-0 group-hover/canvas:opacity-100 transition-opacity pointer-events-none">
                     <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-3 text-[10px] font-black text-white uppercase tracking-widest shadow-xl border border-white/10">
                        <Move className="w-3.5 h-3.5 text-primary" /> Drag to Position
                     </div>
                  </div>
                )}
                
                <canvas 
                  ref={canvasRef} 
                  className="w-full h-full object-contain"
                  onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
                  onMouseMove={(e) => handleDragMove(e.clientX, e.clientY)}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                  onTouchStart={(e) => handleDragStart(e.touches[0].clientX, e.touches[0].clientY)}
                  onTouchMove={(e) => handleDragMove(e.touches[0].clientX, e.touches[0].clientY)}
                  onTouchEnd={handleDragEnd}
                />

                {/* Circle Mask Overlay */}
                {image && showCircleMask && (
                  <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
                     <div className="w-full h-full border-[100px] border-[#060608]/80 rounded-full" style={{ outline: '2000px solid rgba(6,6,8,0.7)' }} />
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[98%] h-[98%] border-2 border-dashed border-primary/30 rounded-full" />
                  </div>
                )}
                
                {!image && !isProcessing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 opacity-20 pointer-events-none">
                    <LayoutGrid className="w-20 h-20 text-primary" />
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-foreground">Waiting for visual input</p>
                  </div>
                )}

                {isProcessing && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-md flex flex-col items-center justify-center gap-4 z-40">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-[10px] font-black uppercase text-primary tracking-widest">Initializing Engine...</p>
                  </div>
                )}
              </div>

              {image && (
                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
                  <div className="p-4 rounded-2xl bg-secondary/50 border border-border flex items-start gap-4">
                     <Zap className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                     <p className="text-[10px] text-foreground/40 font-medium leading-relaxed uppercase">
                       <span className="text-foreground font-black">Quality Protocol:</span> Uncropped square matrix bypasses standard compression algorithms.
                     </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-secondary/50 border border-border flex items-start gap-4">
                     <Smartphone className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                     <p className="text-[10px] text-foreground/40 font-medium leading-relaxed uppercase">
                       <span className="text-foreground font-black">Circular Sync:</span> Safe zone visualization ensures focal points remain legible after WhatsApp crop.
                     </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Controls Pane - Right/Bottom */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                <Settings2 className="w-5 h-5 text-primary" /> Matrix Parameters
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-10 space-y-10">
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Asset Intake</Label>
                <div 
                  onClick={() => !isProcessing && fileInputRef.current?.click()}
                  className={cn(
                    "relative h-32 rounded-[2rem] border-2 border-dashed border-border hover:border-primary/40 flex flex-col items-center justify-center bg-secondary/30 transition-all cursor-pointer overflow-hidden group/upload",
                    image && "border-solid border-primary/20"
                  )}
                >
                  {image ? (
                    <div className="text-center p-4">
                       <CheckCircle2 className="w-8 h-8 text-primary mx-auto mb-2" />
                       <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest">Visual Matrix Loaded</p>
                       <p className="text-[8px] font-bold text-foreground/20 uppercase mt-1">Tap to swap source</p>
                    </div>
                  ) : (
                    <>
                       <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-foreground/10 group-hover/upload:text-primary transition-all mb-3 shadow-xl">
                          <ImageIcon className="w-6 h-6" />
                       </div>
                       <span className="text-[10px] font-black uppercase text-foreground/30 tracking-widest group-hover/upload:text-primary transition-colors">Import Photo</span>
                    </>
                  )}
                </div>
                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
              </div>

              {image && (
                <div className="space-y-10 animate-in zoom-in duration-500">
                   <div className="space-y-6">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-foreground/40">
                         <Label className="flex items-center gap-2"><Maximize2 className="w-3.5 h-3.5" /> Scaling Matrix</Label>
                         <span className="text-primary font-mono">{(zoom * 100).toFixed(0)}%</span>
                      </div>
                      <Slider value={[zoom * 100]} min={50} max={300} step={1} onValueChange={(v) => setZoom(v[0] / 100)} />
                      <div className="flex gap-2">
                         <Button variant="outline" size="sm" onClick={resetPosition} className="flex-1 h-10 rounded-xl bg-background border-border text-[9px] font-black uppercase tracking-widest">
                           <Crosshair className="w-3.5 h-3.5 mr-2" /> Recenter
                         </Button>
                         <Button variant="outline" size="sm" onClick={applyFillPreset} className="flex-1 h-10 rounded-xl bg-background border-border text-[9px] font-black uppercase tracking-widest">
                           <Maximize className="w-3.5 h-3.5 mr-2" /> Fit Square
                         </Button>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Fill Protocol (Background)</Label>
                      <div className="grid grid-cols-2 gap-3">
                         <button 
                          onClick={() => setBgMode('blur')}
                          className={cn(
                            "h-12 rounded-xl border flex flex-col items-center justify-center transition-all",
                            bgMode === 'blur' ? "bg-primary text-primary-foreground border-primary shadow-lg" : "bg-background border-border text-foreground/40 hover:text-primary"
                          )}
                         >
                           <span className="text-[10px] font-black uppercase tracking-widest">Atmospheric Blur</span>
                         </button>
                         <button 
                          onClick={() => setBgMode('color')}
                          className={cn(
                            "h-12 rounded-xl border flex flex-col items-center justify-center transition-all",
                            bgMode === 'color' ? "bg-primary text-primary-foreground border-primary shadow-lg" : "bg-background border-border text-foreground/40 hover:text-primary"
                          )}
                         >
                           <span className="text-[10px] font-black uppercase tracking-widest">Solid Matrix</span>
                         </button>
                      </div>

                      {bgMode === 'blur' ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-foreground/40">
                             <Label className="flex items-center gap-2"><SlidersHorizontal className="w-3.5 h-3.5" /> Blur Intensity</Label>
                             <span className="text-primary font-mono">{blurStrength}px</span>
                          </div>
                          <Slider value={[blurStrength]} min={0} max={100} step={1} onValueChange={(v) => setBlurStrength(v[0])} />
                        </div>
                      ) : (
                        <div className="p-5 rounded-2xl bg-secondary border border-border flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl relative overflow-hidden ring-2 ring-white" style={{ backgroundColor: bgColor }}>
                                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
                              </div>
                              <div className="space-y-0.5">
                                 <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">Hex Matrix</p>
                                 <p className="text-xs font-mono font-bold text-foreground uppercase">{bgColor}</p>
                              </div>
                           </div>
                           <Palette className="w-4 h-4 text-foreground/10" />
                        </div>
                      )}
                   </div>

                   <div className="p-6 rounded-[2.5rem] bg-secondary border border-border flex items-center justify-between group hover:border-primary/20 transition-all">
                      <div className="space-y-1">
                         <p className="text-[11px] font-black text-foreground uppercase tracking-widest">Circle DP Safe-Zone</p>
                         <p className="text-[9px] text-foreground/30 font-medium uppercase tracking-tighter">Preview WhatsApp circular crop</p>
                      </div>
                      <Switch checked={showCircleMask} onCheckedChange={setShowCircleMask} />
                   </div>
                </div>
              )}

              <div className="pt-4 flex flex-col gap-3">
                <Button 
                  onClick={handleDownload}
                  disabled={!image}
                  className="h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                >
                  <Download className="w-6 h-6" />
                  Export 1080px Master
                </Button>
                {image && (
                  <Button 
                    variant="ghost"
                    onClick={handleClear}
                    className="h-12 text-foreground/30 hover:text-destructive text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Reset Studio
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
            <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Production Advisory</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                Our engine utilizes bi-linear interpolation via the Canvas API. Generating at 1080×1080 ensures peak fidelity for Retina displays while providing sufficient padding for WhatsApp's auto-cropping logic.
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
           background-image: linear-gradient(45deg, #111113 25%, transparent 25%), 
                            linear-gradient(-45deg, #111113 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #111113 75%), 
                            linear-gradient(-45deg, transparent 75%, #111113 75%);
        }
      `}</style>
    </div>
  );
}
