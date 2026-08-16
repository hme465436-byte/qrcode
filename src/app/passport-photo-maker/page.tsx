"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  SquareUser, 
  Upload, 
  Download, 
  Trash2, 
  Settings2, 
  Info,
  CheckCircle2,
  Maximize,
  Move,
  Palette,
  Eye,
  Loader2,
  Maximize2,
  ImageIcon,
  Zap,
  LayoutGrid,
  RotateCcw,
  Printer,
  FileText,
  ScanFace,
  SlidersHorizontal,
  ChevronRight,
  Crosshair
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { jsPDF } from 'jspdf';

interface SizePreset {
  id: string;
  label: string;
  width: number; // in mm
  height: number; // in mm
}

const PRESETS: SizePreset[] = [
  { id: 'pakistan', label: 'Pakistan / India (35x45mm)', width: 35, height: 45 },
  { id: 'uk', label: 'United Kingdom (35x45mm)', width: 35, height: 45 },
  { id: 'usa', label: 'USA (2x2 inch)', width: 50.8, height: 50.8 },
  { id: 'china', label: 'China (33x48mm)', width: 33, height: 48 },
  { id: 'custom', label: 'Custom Dimension', width: 35, height: 45 },
];

const BG_COLORS = [
  { label: 'White', color: '#FFFFFF' },
  { label: 'Light Blue', color: '#A5D6F7' },
  { label: 'Grey', color: '#E2E8F0' },
];

const DPI = 300;
const MM_TO_PX = (mm: number) => Math.round((mm / 25.4) * DPI);

export default function PassportPhotoPage() {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Settings State
  const [presetId, setPresetId] = useState('pakistan');
  const [customWidth, setCustomWidth] = useState(35);
  const [customHeight, setCustomHeight] = useState(45);
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [sheetCount, setSheetCount] = useState(4);
  
  // Transform State
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const activePreset = PRESETS.find(p => p.id === presetId) || PRESETS[0];
  const targetWidthMM = presetId === 'custom' ? customWidth : activePreset.width;
  const targetHeightMM = presetId === 'custom' ? customHeight : activePreset.height;

  const renderCanvas = useCallback(() => {
    if (!canvasRef.current || !loadedImage) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const wPx = MM_TO_PX(targetWidthMM);
    const hPx = MM_TO_PX(targetHeightMM);

    canvas.width = wPx;
    canvas.height = hPx;

    // 1. Background Fill
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, wPx, hPx);

    // 2. Draw Main Image with transforms
    ctx.save();
    ctx.translate(wPx / 2 + pos.x, hPx / 2 + pos.y);
    ctx.rotate((rotation * Math.PI) / 180);
    
    const img = loadedImage;
    const baseScale = Math.max(wPx / img.width, hPx / img.height);
    const drawW = img.width * baseScale * zoom;
    const drawH = img.height * baseScale * zoom;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }, [loadedImage, targetWidthMM, targetHeightMM, zoom, pos, rotation, bgColor]);

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
          setRotation(0);
          setIsProcessing(false);
          toast({ title: "Asset Imported", description: "Identity matrix initialized." });
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
    if (!isDragging.current || !image || !canvasRef.current) return;
    
    const deltaX = clientX - lastMousePos.current.x;
    const deltaY = clientY - lastMousePos.current.y;

    const container = canvasRef.current.parentElement;
    if (container) {
      const scale = MM_TO_PX(targetWidthMM) / container.clientWidth;
      setPos(prev => ({ x: prev.x + deltaX * scale, y: prev.y + deltaY * scale }));
    }

    lastMousePos.current = { x: clientX, y: clientY };
  };

  const handleDragEnd = () => {
    isDragging.current = false;
  };

  const downloadSingle = () => {
    if (!canvasRef.current || !image) return;
    const link = document.createElement('a');
    link.download = `passport-photo-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png', 1.0);
    link.click();
    toast({ title: "Individual Ready", description: "PNG master exported." });
  };

  const downloadA4Sheet = async (format: 'pdf' | 'png') => {
    if (!canvasRef.current || !image) return;
    setIsProcessing(true);

    const singlePhoto = canvasRef.current;
    const a4WPx = MM_TO_PX(210); // A4 Width
    const a4HPx = MM_TO_PX(297); // A4 Height

    const sheetCanvas = document.createElement('canvas');
    sheetCanvas.width = a4WPx;
    sheetCanvas.height = a4HPx;
    const ctx = sheetCanvas.getContext('2d');
    if (!ctx) return;

    // Background white for paper
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, a4WPx, a4HPx);

    // Padding & Layout
    const margin = MM_TO_PX(20);
    const gap = MM_TO_PX(5);
    const photoW = MM_TO_PX(targetWidthMM);
    const photoH = MM_TO_PX(targetHeightMM);

    // Dynamic grid layout based on sheetCount
    const cols = 2;
    const rows = Math.ceil(sheetCount / cols);

    for (let i = 0; i < sheetCount; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = margin + col * (photoW + gap);
      const y = margin + row * (photoH + gap);
      
      // Draw border
      ctx.strokeStyle = '#EEEEEE';
      ctx.lineWidth = 1;
      ctx.strokeRect(x - 1, y - 1, photoW + 2, photoH + 2);
      ctx.drawImage(singlePhoto, x, y, photoW, photoH);
    }

    if (format === 'pdf') {
      const imgData = sheetCanvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: [a4WPx, a4HPx]
      });
      pdf.addImage(imgData, 'JPEG', 0, 0, a4WPx, a4HPx);
      pdf.save(`passport-sheet-${Date.now()}.pdf`);
    } else {
      const link = document.createElement('a');
      link.download = `passport-sheet-${Date.now()}.png`;
      link.href = sheetCanvas.toDataURL('image/png', 1.0);
      link.click();
    }

    setIsProcessing(false);
    toast({ title: "Sheet Exported", description: `A4 master saved as ${format.toUpperCase()}.` });
  };

  const handleClear = () => {
    setImage(null);
    setLoadedImage(null);
    setPos({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset", description: "Project buffers cleared." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <SquareUser className="w-3.5 h-3.5" /> Identity Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Passport <span className="text-primary italic">Photo Studio</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
          Professional ID asset production. Generate official-size passport photos with precise scaling, background fills, and printable A4 sheet synthesis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Preview Pane */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-6 duration-1000">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[500px]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5" /> Studio Master Preview
                </CardTitle>
                <div className="flex items-center gap-3">
                   <div className="px-3 py-1 rounded-lg bg-background/50 border border-border text-[9px] font-black text-foreground/40 uppercase tracking-widest">
                     {targetWidthMM} × {targetHeightMM} MM
                   </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 bg-[#060608]">
              <div className="relative w-full max-w-[400px] aspect-[3.5/4.5] bg-checkered rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 group/canvas cursor-move">
                {image && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 opacity-0 group-hover/canvas:opacity-100 transition-opacity pointer-events-none">
                     <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-3 text-[10px] font-black text-white uppercase tracking-widest shadow-xl border border-white/10">
                        <Move className="w-3.5 h-3.5 text-primary" /> Drag Face to Center
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

                {!image && !isProcessing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 opacity-20 pointer-events-none">
                    <ScanFace className="w-20 h-20 text-primary" />
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-foreground">Waiting for portrait</p>
                  </div>
                )}

                {isProcessing && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-md flex flex-col items-center justify-center gap-4 z-40">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-[10px] font-black uppercase text-primary tracking-widest">Processing Matrix...</p>
                  </div>
                )}
              </div>

              {image && (
                <div className="mt-10 flex gap-4 w-full max-w-sm">
                  <Button 
                    onClick={downloadSingle}
                    className="flex-1 h-14 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl flex items-center justify-center gap-4 text-xs uppercase tracking-widest shadow-xl shadow-primary/30"
                  >
                    <Download className="w-4 h-4" /> Single PNG
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleClear}
                    className="h-14 w-14 rounded-2xl border-border bg-secondary hover:bg-secondary/80 text-foreground/40 hover:text-destructive transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="p-6 rounded-[2.5rem] bg-secondary border border-border flex items-start gap-5 group hover:border-primary/20 transition-all shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all">
                   <Maximize className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Master Resolution</p>
                   <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">300 DPI hard-coded sampling ensures crystal clear print quality for official documents.</p>
                </div>
             </div>
             <div className="p-6 rounded-[2.5rem] bg-secondary border border-border flex items-start gap-5 group hover:border-primary/20 transition-all shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all">
                   <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Privacy Absolute</p>
                   <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">Processing occurs 100% in browser memory. Personal identifying data is never transmitted.</p>
                </div>
             </div>
          </div>
        </div>

        {/* Controls Pane */}
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
                       <span className="text-[10px] font-black uppercase text-foreground/30 tracking-widest group-hover/upload:text-primary transition-colors">Import Portrait</span>
                    </>
                  )}
                </div>
                <input type="file" ref={fileInputRef} accept="image/png,image/jpeg" onChange={handleFileUpload} className="hidden" />
              </div>

              {image && (
                <div className="space-y-10 animate-in zoom-in duration-500">
                   <div className="space-y-4">
                      <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Protocol Standard (Size)</Label>
                      <Select value={presetId} onValueChange={setPresetId}>
                        <SelectTrigger className="h-12 bg-secondary border-border rounded-xl text-foreground font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-card">
                          {PRESETS.map(p => (
                            <SelectItem key={p.id} value={p.id} className="text-xs font-bold uppercase">{p.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                   </div>

                   {presetId === 'custom' && (
                     <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                        <div className="space-y-2">
                           <Label className="text-[9px] font-black uppercase text-foreground/30 ml-1">Width (mm)</Label>
                           <Input type="number" value={customWidth} onChange={e => setCustomWidth(parseInt(e.target.value) || 0)} className="h-12 bg-secondary border-border rounded-xl" />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-[9px] font-black uppercase text-foreground/30 ml-1">Height (mm)</Label>
                           <Input type="number" value={customHeight} onChange={e => setCustomHeight(parseInt(e.target.value) || 0)} className="h-12 bg-secondary border-border rounded-xl" />
                        </div>
                     </div>
                   )}

                   <div className="space-y-6">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-foreground/40">
                         <Label className="flex items-center gap-2"><Maximize2 className="w-3.5 h-3.5" /> Scaling Matrix</Label>
                         <span className="text-primary font-mono">{(zoom * 100).toFixed(0)}%</span>
                      </div>
                      <Slider value={[zoom * 100]} min={50} max={300} step={1} onValueChange={(v) => setZoom(v[0] / 100)} />
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-foreground/40">
                           <Label className="flex items-center gap-2"><RotateCcw className="w-3.5 h-3.5" /> Rotation</Label>
                           <span className="text-primary font-mono">{rotation}°</span>
                        </div>
                        <Slider value={[rotation]} min={-180} max={180} step={1} onValueChange={(v) => setRotation(v[0])} />
                      </div>
                   </div>

                   <div className="space-y-6">
                      <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Chromatic Layer (BG)</Label>
                      <div className="grid grid-cols-3 gap-3">
                         {BG_COLORS.map(bg => (
                           <button 
                            key={bg.color}
                            onClick={() => setBgColor(bg.color)}
                            className={cn(
                              "h-12 rounded-xl border flex flex-col items-center justify-center transition-all group",
                              bgColor === bg.color ? "bg-primary text-primary-foreground border-primary shadow-lg" : "bg-background border-border text-foreground/40 hover:text-foreground"
                            )}
                           >
                             <div className="w-4 h-4 rounded-full border border-white/20 mb-1" style={{ backgroundColor: bg.color }} />
                             <span className="text-[8px] font-black uppercase">{bg.label}</span>
                           </button>
                         ))}
                      </div>
                      <div className="p-4 rounded-xl bg-secondary border border-border flex items-center justify-between">
                         <span className="text-[9px] font-black uppercase text-foreground/40">Custom Hex Matrix</span>
                         <div className="w-10 h-10 rounded-lg relative overflow-hidden ring-2 ring-white" style={{ backgroundColor: bgColor }}>
                           <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
                         </div>
                      </div>
                   </div>

                   <div className="space-y-6 pt-6 border-t border-border">
                      <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">A4 Print Protocol</Label>
                      <div className="grid grid-cols-3 gap-3">
                         {[4, 6, 8].map(count => (
                           <button 
                            key={count}
                            onClick={() => setSheetCount(count)}
                            className={cn(
                              "h-12 rounded-xl border flex items-center justify-center transition-all",
                              sheetCount === count ? "bg-primary text-primary-foreground border-primary shadow-lg" : "bg-background border-border text-foreground/40 hover:text-foreground"
                            )}
                           >
                             <span className="text-[10px] font-black uppercase">{count} Photos</span>
                           </button>
                         ))}
                      </div>
                      
                      <div className="flex gap-3">
                         <Button onClick={() => downloadA4Sheet('pdf')} className="flex-1 h-14 bg-secondary border-border hover:bg-secondary/80 text-primary font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl">
                            <FileText className="w-4 h-4 mr-2" /> Download A4 PDF
                         </Button>
                         <Button onClick={() => downloadA4Sheet('png')} className="flex-1 h-14 bg-secondary border-border hover:bg-secondary/80 text-primary font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl">
                            <ImageIcon className="w-4 h-4 mr-2" /> Download A4 PNG
                         </Button>
                      </div>
                   </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500">
            <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
               <Printer className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Master Production</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                A4 sheets are rendered with international print safe margins. Ensure "Actual Size" is selected in your printer dialog for perfect scaling.
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
