"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  Crosshair,
  ShieldCheck,
  Sun,
  Contrast as ContrastIcon,
  Scaling,
  Type,
  Calendar,
  AlertCircle,
  RotateCw,
  EyeOff,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  { id: 'uk', label: 'United Kingdom / EU (35x45mm)', width: 35, height: 45 },
  { id: 'usa', label: 'USA (2x2 inch)', width: 50.8, height: 50.8 },
  { id: 'china', label: 'China (33x48mm)', width: 33, height: 48 },
  { id: '1x1', label: 'Identity (1x1 inch)', width: 25.4, height: 25.4 },
  { id: 'custom', label: 'Custom Dimension', width: 35, height: 45 },
];

const BG_COLORS = [
  { label: 'White', color: '#FFFFFF' },
  { label: 'Blue', color: '#A5D6F7' },
  { label: 'Gray', color: '#E2E8F0' },
];

export default function PassportPhotoPage() {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('layout');
  
  // Settings State
  const [presetId, setPresetId] = useState('pakistan');
  const [customWidth, setCustomWidth] = useState(35);
  const [customHeight, setCustomHeight] = useState(45);
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [sheetCount, setSheetCount] = useState(8);
  const [dpi, setDpi] = useState(300);
  const [showFaceGuide, setShowFaceGuide] = useState(true);
  const [showOriginal, setShowOriginal] = useState(false);

  // Label State
  const [labelName, setLabelName] = useState('');
  const [labelDate, setLabelDate] = useState('');
  const [showLabel, setShowLabel] = useState(false);
  
  // Transform State
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);

  // Adjustments
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const activePreset = useMemo(() => PRESETS.find(p => p.id === presetId) || PRESETS[0], [presetId]);
  const targetWidthMM = presetId === 'custom' ? customWidth : activePreset.width;
  const targetHeightMM = presetId === 'custom' ? customHeight : activePreset.height;

  const mmToPx = (mm: number) => Math.round((mm / 25.4) * dpi);

  const renderCanvas = useCallback((targetCanvas?: HTMLCanvasElement, guidesOn = true) => {
    const canvas = targetCanvas || canvasRef.current;
    if (!canvas || !loadedImage) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const wPx = mmToPx(targetWidthMM);
    const hPx = mmToPx(targetHeightMM);

    canvas.width = wPx;
    canvas.height = hPx;

    // 1. Background Fill
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, wPx, hPx);

    // 2. Adjustments Filter (Non-destructive)
    ctx.filter = showOriginal ? 'none' : `brightness(${brightness}%) contrast(${contrast}%)`;

    // 3. Draw Main Image with transforms
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

    // 4. Labels if enabled
    if (showLabel && (labelName || labelDate)) {
      ctx.filter = 'none';
      const labelAreaH = hPx * 0.15;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(0, hPx - labelAreaH, wPx, labelAreaH);
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.font = `bold ${Math.round(labelAreaH * 0.4)}px Inter, sans-serif`;
      ctx.fillText(labelName.toUpperCase(), wPx/2, hPx - (labelAreaH * 0.5));
      if (labelDate) {
        ctx.font = `${Math.round(labelAreaH * 0.3)}px Inter, sans-serif`;
        ctx.fillText(labelDate, wPx/2, hPx - (labelAreaH * 0.2));
      }
    }
  }, [loadedImage, targetWidthMM, targetHeightMM, zoom, pos, rotation, bgColor, brightness, contrast, showOriginal, dpi, labelName, labelDate, showLabel]);

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
          setBrightness(100);
          setContrast(100);
          setIsProcessing(false);
          toast({ title: "Asset Imported", description: "Identity matrix initialized for high-res production." });
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
      const scale = mmToPx(targetWidthMM) / container.clientWidth;
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
    toast({ title: "Individual Ready", description: `${dpi} DPI master exported.` });
  };

  const downloadA4Sheet = async (format: 'pdf' | 'png') => {
    if (!canvasRef.current || !image) return;
    setIsProcessing(true);

    const singlePhoto = canvasRef.current;
    const a4WPx = mmToPx(210); // A4 Width
    const a4HPx = mmToPx(297); // A4 Height

    const sheetCanvas = document.createElement('canvas');
    sheetCanvas.width = a4WPx;
    sheetCanvas.height = a4HPx;
    const ctx = sheetCanvas.getContext('2d');
    if (!ctx) return;

    // Background white for paper
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, a4WPx, a4HPx);

    // Padding & Layout
    const margin = mmToPx(20);
    const gap = mmToPx(2);
    const photoW = mmToPx(targetWidthMM);
    const photoH = mmToPx(targetHeightMM);

    // Grid Calc
    const cols = 2; // Always 2 cols to fit most sizes safely side-by-side
    
    for (let i = 0; i < sheetCount; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = margin + col * (photoW + gap);
      const y = margin + row * (photoH + gap);
      
      // Draw faint cut line
      ctx.strokeStyle = '#EEEEEE';
      ctx.lineWidth = 1;
      ctx.strokeRect(x - 1, y - 1, photoW + 2, photoH + 2);
      ctx.drawImage(singlePhoto, x, y, photoW, photoH);
    }

    if (format === 'pdf') {
      const imgData = sheetCanvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: [a4WPx, a4HPx]
      });
      pdf.addImage(imgData, 'JPEG', 0, 0, a4WPx, a4HPx);
      pdf.save(`passport-production-sheet-${Date.now()}.pdf`);
    } else {
      const link = document.createElement('a');
      link.download = `passport-production-sheet-${Date.now()}.png`;
      link.href = sheetCanvas.toDataURL('image/png', 1.0);
      link.click();
    }

    setIsProcessing(false);
    toast({ title: "Sheet Production Complete", description: `A4 master exported at ${dpi} DPI.` });
  };

  const handleClear = () => {
    setImage(null);
    setLoadedImage(null);
    setPos({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset", description: "Buffers cleared." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <ScanFace className="w-3.5 h-3.5" /> Identity Pro Studio
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
                Passport <span className="text-primary italic">Photo Pro</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Advanced clinical ID asset production. Generate official-size photos with precision head-alignment guides, hardware DPI control, and printable A4 synthesis.
              </p>
           </div>
           {image && (
             <div className="flex gap-3">
                <Button variant="outline" onClick={handleClear} className="h-12 px-6 rounded-xl border-border bg-secondary text-[10px] font-black uppercase tracking-widest hover:text-destructive">
                   <Trash2 className="w-4 h-4 mr-2" /> Purge
                </Button>
                <Button onClick={() => downloadA4Sheet('pdf')} className="h-12 px-8 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/30">
                   <Printer className="w-4 h-4 mr-2" /> Production PDF
                </Button>
             </div>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Workspace - Left */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-6 duration-1000">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5" /> Production Matrix
                </CardTitle>
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-2 bg-background/50 px-3 py-1 rounded-full border border-border">
                      <span className="text-[8px] font-black uppercase text-foreground/40">Head Guide</span>
                      <Switch checked={showFaceGuide} onCheckedChange={setShowFaceGuide} className="scale-50 h-4 w-8" />
                   </div>
                   <button 
                    onMouseDown={() => setShowOriginal(true)} 
                    onMouseUp={() => setShowOriginal(false)}
                    onTouchStart={() => setShowOriginal(true)}
                    onTouchEnd={() => setShowOriginal(false)}
                    className="p-2 rounded-xl bg-secondary border border-border text-foreground/20 hover:text-primary transition-all"
                    title="Compare Matrix"
                   >
                     {showOriginal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                   </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 bg-[#0a0a0c]">
              <div className="relative w-full max-w-[380px] aspect-[3.5/4.5] bg-checkered rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 group/canvas cursor-move">
                {/* Face Guide SVG Overlay */}
                {image && showFaceGuide && (
                  <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center opacity-60">
                    <svg viewBox="0 0 350 450" className="w-full h-full stroke-primary/40 fill-none">
                      {/* Central Vertical Axis */}
                      <line x1="175" y1="0" x2="175" y2="450" strokeDasharray="5,5" strokeWidth="1" />
                      {/* Head Oval */}
                      <ellipse cx="175" cy="210" rx="90" ry="120" strokeWidth="2" strokeDasharray="10,5" />
                      {/* Eye Line */}
                      <line x1="80" y1="180" x2="270" y2="180" strokeWidth="1.5" />
                      <path d="M175,180 v10 m-30,-10 v10 m60,-10 v10" strokeWidth="1" />
                      {/* Chin Anchor */}
                      <path d="M140,330 h70" strokeWidth="1.5" />
                    </svg>
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-primary/20 backdrop-blur-md px-3 py-1 rounded-full border border-primary/30 text-[8px] font-black text-primary uppercase tracking-widest">
                       Align Eyes & Chin
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
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-foreground">Waiting for visual payload</p>
                  </div>
                )}

                {isProcessing && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-md flex flex-col items-center justify-center gap-4 z-40">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-[10px] font-black uppercase text-primary tracking-widest">Synthesizing Protocol...</p>
                  </div>
                )}
              </div>

              {image && (
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
                   <div className="p-4 rounded-2xl bg-secondary/50 border border-border flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <Maximize2 className="w-4 h-4" />
                         </div>
                         <div className="space-y-0.5">
                            <p className="text-[8px] font-black uppercase text-foreground/30">Native Resolution</p>
                            <p className="text-[10px] font-bold text-foreground">{mmToPx(targetWidthMM)}x{mmToPx(targetHeightMM)} px</p>
                         </div>
                      </div>
                   </div>
                   <div className="p-4 rounded-2xl bg-secondary/50 border border-border flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <Zap className="w-4 h-4" />
                         </div>
                         <div className="space-y-0.5">
                            <p className="text-[8px] font-black uppercase text-foreground/30">Hardware DPI</p>
                            <p className="text-[10px] font-bold text-foreground">{dpi} Dots/Inch</p>
                         </div>
                      </div>
                   </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
               <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">WASM PRODUCTION SOVEREIGNTY</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                Image processing and PDF synthesis occur 100% locally. Personal identifying visuals are processed in volatile memory and never touch remote servers.
              </p>
            </div>
          </div>
        </div>

        {/* Controls - Right */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 bg-secondary p-1.5 rounded-2xl h-14 mb-8 border border-white/5">
               <TabsTrigger value="layout" className="rounded-xl text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-background">Geometry</TabsTrigger>
               <TabsTrigger value="adjust" className="rounded-xl text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-background">Light</TabsTrigger>
               <TabsTrigger value="finish" className="rounded-xl text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-background">Production</TabsTrigger>
            </TabsList>

            <TabsContent value="layout" className="space-y-8 mt-0">
               <Card className="glass-card border-border shadow-xl overflow-hidden">
                  <CardContent className="pt-8 space-y-10">
                     <div className="space-y-4">
                        <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Asset Intake</Label>
                        <div 
                          onClick={() => !isProcessing && fileInputRef.current?.click()}
                          className={cn(
                            "relative h-32 rounded-[2rem] border-2 border-dashed border-border hover:border-primary/40 flex flex-col items-center justify-center bg-secondary/30 transition-all cursor-pointer overflow-hidden group/upload",
                            image && "border-solid border-primary/20"
                          )}
                        >
                          {image ? (
                            <div className="text-center p-4">
                               <CheckCircle2 className="w-8 h-8 text-primary mx-auto mb-1" />
                               <p className="text-[9px] font-black uppercase text-foreground/40">Visual Matrix Integrated</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-3">
                               <ImageIcon className="w-8 h-8 text-foreground/10 group-hover/upload:text-primary transition-all" />
                               <span className="text-[9px] font-black uppercase text-foreground/30">Import Portrait</span>
                            </div>
                          )}
                        </div>
                        <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
                     </div>

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

                     <div className="space-y-8">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-foreground/40">
                             <Label className="flex items-center gap-2"><Scaling className="w-3.5 h-3.5" /> Spectral Zoom</Label>
                             <span className="text-primary font-mono">{(zoom * 100).toFixed(0)}%</span>
                          </div>
                          <Slider value={[zoom * 100]} min={50} max={400} step={1} onValueChange={(v) => setZoom(v[0] / 100)} />
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-foreground/40">
                             <Label className="flex items-center gap-2"><RotateCcw className="w-3.5 h-3.5" /> Clinical Rotation</Label>
                             <span className="text-primary font-mono">{rotation}°</span>
                          </div>
                          <Slider value={[rotation]} min={-15} max={15} step={0.5} onValueChange={(v) => setRotation(v[0])} />
                          <div className="flex gap-2">
                             {[-15, 0, 15].map(deg => (
                               <button 
                                key={deg} 
                                onClick={() => setRotation(deg)}
                                className="flex-1 h-8 rounded-lg bg-background border border-border text-[8px] font-black uppercase tracking-widest hover:text-primary transition-all"
                               >
                                 {deg === 0 ? 'Center' : `${deg > 0 ? '+' : ''}${deg}°`}
                               </button>
                             ))}
                          </div>
                        </div>
                     </div>
                  </CardContent>
               </Card>
            </TabsContent>

            <TabsContent value="adjust" className="space-y-8 mt-0">
               <Card className="glass-card border-border shadow-xl overflow-hidden">
                  <CardContent className="pt-8 space-y-12">
                     <div className="space-y-10">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-foreground/40">
                             <Label className="flex items-center gap-2"><Sun className="w-3.5 h-3.5" /> Brightness</Label>
                             <span className="text-primary font-mono">{brightness}%</span>
                          </div>
                          <Slider value={[brightness]} min={50} max={150} step={1} onValueChange={v => setBrightness(v[0])} />
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-foreground/40">
                             <Label className="flex items-center gap-2"><ContrastIcon className="w-3.5 h-3.5" /> Contrast</Label>
                             <span className="text-primary font-mono">{contrast}%</span>
                          </div>
                          <Slider value={[contrast]} min={50} max={150} step={1} onValueChange={v => setContrast(v[0])} />
                        </div>
                     </div>

                     <div className="space-y-6 pt-6 border-t border-border">
                        <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Chromatic Background</Label>
                        <div className="grid grid-cols-3 gap-3">
                           {BG_COLORS.map(bg => (
                             <button 
                              key={bg.color}
                              onClick={() => setBgColor(bg.color)}
                              className={cn(
                                "h-12 rounded-xl border flex flex-col items-center justify-center transition-all group",
                                bgColor === bg.color ? "bg-primary text-white border-primary shadow-lg" : "bg-background border-border text-foreground/40"
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
                  </CardContent>
               </Card>
            </TabsContent>

            <TabsContent value="finish" className="space-y-8 mt-0">
               <Card className="glass-card border-border shadow-xl overflow-hidden">
                  <CardContent className="pt-8 space-y-10">
                     <div className="space-y-6">
                        <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Sheet Configuration (A4)</Label>
                        <div className="grid grid-cols-2 gap-3">
                           {[1, 4, 8, 16].map(count => (
                             <button 
                              key={count}
                              onClick={() => setSheetCount(count)}
                              className={cn(
                                "h-14 rounded-2xl border flex items-center justify-center gap-3 transition-all",
                                sheetCount === count ? "bg-primary text-white border-primary shadow-xl" : "bg-background border-border text-foreground/40 hover:text-foreground"
                              )}
                             >
                               <LayoutGrid className="w-4 h-4" />
                               <span className="text-[11px] font-black uppercase">{count} {count === 1 ? 'Photo' : 'Photos'}</span>
                             </button>
                           ))}
                        </div>
                     </div>

                     <div className="space-y-6 pt-6 border-t border-border">
                        <div className="flex items-center justify-between">
                           <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Identity Labeling</Label>
                           <Switch checked={showLabel} onCheckedChange={setShowLabel} />
                        </div>
                        {showLabel && (
                           <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                              <Input 
                                placeholder="NAME (UPPERCASE)" 
                                value={labelName} 
                                onChange={e => setLabelName(e.target.value)} 
                                className="h-12 bg-secondary border-border rounded-xl text-[10px] font-bold uppercase"
                              />
                              <Input 
                                type="date"
                                value={labelDate} 
                                onChange={e => setLabelDate(e.target.value)} 
                                className="h-12 bg-secondary border-border rounded-xl text-[10px] font-bold"
                              />
                           </div>
                        )}
                     </div>

                     <div className="space-y-4 pt-6 border-t border-border">
                        <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Production DPI</Label>
                        <div className="grid grid-cols-2 gap-3">
                           {[300, 600].map(d => (
                             <button 
                              key={d}
                              onClick={() => setDpi(d)}
                              className={cn(
                                "h-11 rounded-xl border flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all",
                                dpi === d ? "bg-primary text-white border-primary" : "bg-background border-border text-foreground/40"
                              )}
                             >
                               {d} DPI {d === 600 && <Star className="w-3 h-3 fill-current" />}
                             </button>
                           ))}
                        </div>
                     </div>

                     <div className="pt-6">
                        <Button 
                          onClick={() => downloadA4Sheet('pdf')}
                          disabled={!image || isProcessing}
                          className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl flex items-center justify-center gap-4 text-sm uppercase tracking-widest shadow-xl shadow-primary/30"
                        >
                           {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Printer className="w-5 h-5" />}
                           Export Production PDF
                        </Button>
                     </div>
                  </CardContent>
               </Card>
            </TabsContent>
          </Tabs>

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
            <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Protocol Tip</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                For official visa documents, ensure your head is aligned with the circular matrix and select the **300 DPI** master protocol for hardware compatibility.
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
