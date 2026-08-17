
"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  ShieldCheck, 
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
  Video,
  Grid3X3,
  X,
  Plus,
  Play,
  Pause,
  Repeat,
  MousePointer2,
  Activity,
  MoreVertical,
  Crosshair,
  Lock,
  Stamp,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

type WatermarkType = 'text' | 'logo';
type PositionKey = 'tl' | 'tc' | 'tr' | 'ml' | 'cc' | 'mr' | 'bl' | 'bc' | 'br' | 'custom';

export default function CustomWatermarkPage() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [loadedMedia, setLoadedMedia] = useState<HTMLImageElement | HTMLVideoElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  
  // Watermark State
  const [wmType, setWmType] = useState<WatermarkType>('text');
  const [wmText, setWmText] = useState('MY KIT TOOL');
  const [wmLogo, setWmLogo] = useState<string | null>(null);
  const [wmLogoImg, setWmLogoImg] = useState<HTMLImageElement | null>(null);
  
  // Styling
  const [fontSize, setFontSize] = useState(40);
  const [logoSize, setLogoSize] = useState(0.2); // 20% of width
  const [opacity, setOpacity] = useState(0.6);
  const [color, setColor] = useState('#ffffff');
  const [isBold, setIsBold] = useState(true);
  const [rotation, setRotation] = useState(0);
  const [isTiled, setIsTiled] = useState(false);
  
  // Positioning
  const [positionKey, setPositionKey] = useState<PositionKey>('br');
  const [customPos, setCustomPos] = useState({ x: 0, y: 0 }); // Offset from anchor

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef<number | null>(null);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Cleanup
  useEffect(() => {
    return () => {
      if (mediaUrl) URL.revokeObjectURL(mediaUrl);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [mediaUrl]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const type = selectedFile.type.startsWith('video/') ? 'video' : 'image';
      const limit = type === 'video' ? 50 : 10;
      
      if (selectedFile.size > limit * 1024 * 1024) {
        toast({ variant: "destructive", title: "Heavy Payload", description: `Standard limit for ${type} is ${limit}MB.` });
        return;
      }

      setIsProcessing(true);
      const url = URL.createObjectURL(selectedFile);
      setMediaUrl(url);
      setMediaType(type);
      setFile(selectedFile);

      if (type === 'image') {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          setLoadedMedia(img);
          setIsProcessing(false);
          toast({ title: "Visual Imported", description: "Matrix ready for watermarking." });
        };
        img.src = url;
      } else {
        // Video initialization handled by video ref loadedmetadata
      }
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          setWmLogo(src);
          setWmLogoImg(img);
          toast({ title: "Logo Integrated", description: "Alpha channel detected." });
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    }
  };

  const drawWatermark = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(w / 2 + customPos.x, h / 2 + customPos.y);
    ctx.rotate((rotation * Math.PI) / 180);

    const margin = 40;
    let x = 0;
    let y = 0;

    // Anchor Matrix Logic
    if (positionKey !== 'custom') {
      const innerW = w - margin * 2;
      const innerH = h - margin * 2;
      
      // Horizontal
      if (positionKey.endsWith('l')) x = -innerW / 2;
      else if (positionKey.endsWith('r')) x = innerW / 2;
      else x = 0;

      // Vertical
      if (positionKey.startsWith('t')) y = -innerH / 2;
      else if (positionKey.startsWith('b')) y = innerH / 2;
      else y = 0;
    }

    const renderSingle = (dx: number, dy: number) => {
      ctx.save();
      ctx.translate(dx, dy);
      if (wmType === 'text') {
        ctx.fillStyle = color;
        ctx.font = `${isBold ? 'black' : 'medium'} ${fontSize}px Inter, sans-serif`;
        ctx.textAlign = positionKey.endsWith('l') ? 'left' : positionKey.endsWith('r') ? 'right' : 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 4;
        ctx.fillText(wmText, 0, 0);
      } else if (wmType === 'logo' && wmLogoImg) {
        const lW = w * logoSize;
        const lH = (wmLogoImg.height / wmLogoImg.width) * lW;
        const lx = positionKey.endsWith('l') ? 0 : positionKey.endsWith('r') ? -lW : -lW/2;
        const ly = positionKey.startsWith('t') ? 0 : positionKey.startsWith('b') ? -lH : -lH/2;
        ctx.drawImage(wmLogoImg, lx, ly, lW, lH);
      }
      ctx.restore();
    };

    if (isTiled) {
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = opacity * 0.5;
      const stepX = w / 4;
      const stepY = h / 4;
      for (let tx = 0; tx < w + stepX; tx += stepX) {
        for (let ty = 0; ty < h + stepY; ty += stepY) {
          ctx.save();
          ctx.translate(tx, ty);
          ctx.rotate((rotation * Math.PI) / 180);
          // Simplified tile render
          if (wmType === 'text') {
             ctx.fillStyle = color;
             ctx.font = `${fontSize * 0.6}px Inter`;
             ctx.fillText(wmText, 0, 0);
          } else if (wmType === 'logo' && wmLogoImg) {
             const ts = w * 0.1;
             ctx.drawImage(wmLogoImg, -ts/2, -ts/2, ts, (wmLogoImg.height/wmLogoImg.width)*ts);
          }
          ctx.restore();
        }
      }
    } else {
      renderSingle(x, y);
    }

    ctx.restore();
  }, [wmType, wmText, wmLogoImg, fontSize, logoSize, opacity, color, isBold, rotation, positionKey, customPos, isTiled]);

  const renderFrame = useCallback(() => {
    if (!canvasRef.current || !loadedMedia) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const source = loadedMedia;
    const w = mediaType === 'video' ? (source as HTMLVideoElement).videoWidth : (source as HTMLImageElement).width;
    const h = mediaType === 'video' ? (source as HTMLVideoElement).videoHeight : (source as HTMLImageElement).height;

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(source, 0, 0, w, h);
    drawWatermark(ctx, w, h);

    if (mediaType === 'video' && !isProcessing) {
      requestRef.current = requestAnimationFrame(renderFrame);
    }
  }, [loadedMedia, mediaType, drawWatermark, isProcessing]);

  useEffect(() => {
    if (loadedMedia && mediaType === 'image') renderFrame();
  }, [renderFrame, loadedMedia, mediaType]);

  const handleExport = async () => {
    if (!canvasRef.current || !loadedMedia) return;

    if (mediaType === 'image') {
      const link = document.createElement('a');
      link.download = `watermarked_${Date.now()}.png`;
      link.href = canvasRef.current.toDataURL('image/png', 1.0);
      link.click();
      toast({ title: "Master Exported", description: "Image saved with custom watermark." });
    } else {
      // Video Export Protocol
      setIsProcessing(true);
      setExportProgress(0);
      const video = loadedMedia as HTMLVideoElement;
      video.pause();
      video.currentTime = 0;

      const stream = canvasRef.current.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 8000000 });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `watermarked_video_${Date.now()}.webm`;
        link.click();
        setIsProcessing(false);
        setExportProgress(0);
        toast({ title: "Production Complete", description: "Video master synthesized locally." });
      };

      recorder.start();
      video.play();

      const trackProgress = setInterval(() => {
        const p = Math.round((video.currentTime / video.duration) * 100);
        setExportProgress(p);
        if (video.ended || video.currentTime >= video.duration) {
          clearInterval(trackProgress);
          recorder.stop();
          video.pause();
        }
      }, 100);
    }
  };

  const handleDragStart = (e: any) => {
    if (!image) return;
    isDragging.current = true;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    lastMousePos.current = { x: clientX, y: clientY };
    setPositionKey('custom');
  };

  const handleDragMove = (e: any) => {
    if (!isDragging.current || !canvasRef.current) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const deltaX = clientX - lastMousePos.current.x;
    const deltaY = clientY - lastMousePos.current.y;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const scale = canvasRef.current.width / rect.width;
    
    setCustomPos(prev => ({ x: prev.x + deltaX * scale, y: prev.y + deltaY * scale }));
    lastMousePos.current = { x: clientX, y: clientY };
    if (mediaType === 'image') renderFrame();
  };

  const handleDragEnd = () => { isDragging.current = false; };

  const handleClear = () => {
    setFile(null);
    setLoadedMedia(null);
    setMediaType(null);
    setMediaUrl(null);
    setWmLogo(null);
    setWmLogoImg(null);
    setCustomPos({ x: 0, y: 0 });
    setPositionKey('br');
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset" });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20 max-w-full">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Stamp className="w-3.5 h-3.5" /> IP Protection Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
              Custom <span className="text-primary italic">Watermark Studio</span>
            </h1>
            <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
              Advanced clinical asset protection. Apply textual or visual watermarks to photos and videos locally with 1:1 pixel fidelity.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <GetHelp toolId="watermark" />
             {file && (
               <Button variant="outline" size="sm" onClick={handleClear} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive">
                 <Trash2 className="w-3.5 h-3.5 mr-2" /> Reset
               </Button>
             )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Workspace - Preview */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[350px] max-h-[45vh] lg:max-h-none lg:min-h-[700px] bg-black/60">
             <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
             <CardHeader className="py-4 border-b border-white/5 bg-white/5 flex flex-row items-center justify-between shrink-0">
                <CardTitle className="text-[9px] font-black text-primary uppercase tracking-[0.4em] flex items-center gap-2">
                   <Eye className="w-3.5 h-3.5" /> Live Monitor
                </CardTitle>
                {file && (
                   <div className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-[7px] font-black text-primary uppercase">
                      {mediaType === 'video' ? 'Hardware Stream' : 'Static Matrix'}
                   </div>
                )}
             </CardHeader>
             <CardContent className="flex-1 flex flex-col items-center justify-center p-4 lg:p-12 relative overflow-hidden">
                {!file ? (
                  <div onClick={() => fileInputRef.current?.click()} className="flex-1 flex flex-col items-center justify-center gap-6 cursor-pointer group w-full text-center border-2 border-dashed border-white/10 rounded-[2.5rem] hover:border-primary/40 transition-all">
                     <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center text-white/10 group-hover:text-primary group-hover:scale-110 transition-all">
                        <Upload className="w-8 h-8" />
                     </div>
                     <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Inject Asset Payload</span>
                     <input type="file" ref={fileInputRef} accept="image/*,video/*" onChange={handleFileUpload} className="hidden" />
                  </div>
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center group/canvas">
                     <canvas 
                      ref={canvasRef} 
                      className={cn(
                        "max-w-full max-h-full object-contain rounded-lg shadow-2xl ring-1 ring-white/10 transition-all",
                        isProcessing && "opacity-50 blur-sm"
                      )}
                      onMouseDown={handleDragStart}
                      onMouseMove={handleDragMove}
                      onMouseUp={handleDragEnd}
                      onMouseLeave={handleDragEnd}
                      onTouchStart={handleDragStart}
                      onTouchMove={handleDragMove}
                      onTouchEnd={handleDragEnd}
                     />
                     
                     {mediaType === 'video' && (
                        <video 
                          ref={videoRef} 
                          src={mediaUrl!} 
                          className="hidden" 
                          onLoadedMetadata={(e) => {
                            setLoadedMedia(e.currentTarget);
                            setIsProcessing(false);
                            renderFrame();
                          }}
                          loop muted playsInline 
                        />
                     )}

                     <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/canvas:opacity-100 transition-opacity pointer-events-none">
                        <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                           <MousePointer2 className="w-3 h-3 text-primary" />
                           <span className="text-[8px] font-black uppercase text-white tracking-widest">Drag to Position</span>
                        </div>
                     </div>
                  </div>
                )}
             </CardContent>
          </Card>

          {isProcessing && mediaType === 'video' && (
             <div className="p-8 rounded-[2.5rem] bg-primary/10 border border-primary/20 space-y-4 animate-in zoom-in">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-primary">
                   <span className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Synthesizing Master...</span>
                   <span>{exportProgress}%</span>
                </div>
                <Progress value={exportProgress} className="h-1.5 rounded-full" />
                <p className="text-center text-[9px] text-foreground/40 font-bold uppercase tracking-widest">WASM encoding in progress. Do not close the studio.</p>
             </div>
          )}
        </div>

        {/* Controls Column */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
           <Card className="glass-card border-border shadow-2xl">
              <CardHeader className="py-6 border-b border-white/5 bg-white/2">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Settings2 className="w-5 h-5 text-primary" /> Parameters
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-8">
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Identity Type</Label>
                    <div className="grid grid-cols-2 bg-secondary/50 p-1.5 rounded-2xl border border-white/5 h-14">
                       <button onClick={() => setWmType('text')} className={cn("flex-1 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all", wmType === 'text' ? "bg-primary text-white" : "text-foreground/40 hover:text-foreground")}>
                          <Type className="w-4 h-4" /> Text
                       </button>
                       <button onClick={() => setWmType('logo')} className={cn("flex-1 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all", wmType === 'logo' ? "bg-primary text-white" : "text-foreground/40 hover:text-foreground")}>
                          <ImageIcon className="w-4 h-4" /> Logo
                       </button>
                    </div>
                 </div>

                 <div className="space-y-6">
                    {wmType === 'text' ? (
                      <div className="space-y-4 animate-in slide-in-from-top-2">
                         <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Linguistic Overlay</Label>
                         <Input value={wmText} onChange={e => setWmText(e.target.value)} className="h-14 bg-secondary/50 border-border rounded-2xl text-sm font-bold" />
                         <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-secondary border border-border flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                  <Palette className="w-4 h-4 text-primary" />
                                  <span className="text-[9px] font-black text-foreground/40 uppercase">Color</span>
                               </div>
                               <div className="w-8 h-8 rounded-lg relative overflow-hidden ring-1 ring-border" style={{ backgroundColor: color }}>
                                  <input type="color" value={color} onChange={e => setColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
                               </div>
                            </div>
                            <button onClick={() => setIsBold(!isBold)} className={cn("h-14 rounded-xl border flex items-center justify-center gap-3 transition-all", isBold ? "bg-primary text-white border-primary" : "bg-secondary border-border text-foreground/40")}>
                               <Bold className="w-4 h-4" />
                               <span className="text-[9px] font-black uppercase">Bold Matrix</span>
                            </button>
                         </div>
                         <div className="space-y-4">
                            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-foreground/30">
                               <Label>Typographic Scale</Label>
                               <span className="text-primary font-mono">{fontSize}px</span>
                            </div>
                            <Slider value={[fontSize]} min={10} max={300} step={1} onValueChange={v => setFontSize(v[0])} />
                         </div>
                      </div>
                    ) : (
                      <div className="space-y-6 animate-in slide-in-from-top-2">
                         <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Visual Asset Overlay</Label>
                         <div onClick={() => logoInputRef.current?.click()} className="h-24 rounded-2xl border-2 border-dashed border-border hover:border-primary/40 flex flex-col items-center justify-center bg-secondary/30 cursor-pointer overflow-hidden transition-all group/logo">
                            {wmLogo ? (
                              <img src={wmLogo} alt="Logo" className="max-h-16 w-auto object-contain p-2" />
                            ) : (
                              <span className="text-[9px] font-black uppercase text-foreground/30 group-hover/logo:text-primary transition-colors">Import Logo PNG</span>
                            )}
                            <input type="file" ref={logoInputRef} accept="image/png" onChange={handleLogoUpload} className="hidden" />
                         </div>
                         <div className="space-y-4">
                            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-foreground/30">
                               <Label>Asset Scale</Label>
                               <span className="text-primary font-mono">{(logoSize * 100).toFixed(0)}%</span>
                            </div>
                            <Slider value={[logoSize * 100]} min={5} max={100} step={1} onValueChange={v => setLogoSize(v[0]/100)} />
                         </div>
                      </div>
                    )}

                    <div className="space-y-4 pt-4 border-t border-white/5">
                       <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-foreground/30">
                          <Label>Opacity Matrix</Label>
                          <span className="text-primary font-mono">{(opacity * 100).toFixed(0)}%</span>
                       </div>
                       <Slider value={[opacity * 100]} min={0} max={100} step={1} onValueChange={v => setOpacity(v[0]/100)} />
                    </div>

                    <div className="space-y-4">
                       <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-foreground/30">
                          <Label>Rotation Vector</Label>
                          <span className="text-primary font-mono">{rotation}°</span>
                       </div>
                       <Slider value={[rotation]} min={0} max={360} step={1} onValueChange={v => setRotation(v[0])} />
                    </div>
                 </div>

                 {/* Position Matrix */}
                 <div className="space-y-6 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between">
                       <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Position Anchors</Label>
                       <div className="flex items-center gap-2 bg-secondary px-3 py-1 rounded-full border border-border">
                          <span className="text-[8px] font-black uppercase text-foreground/40">Tiled Pattern</span>
                          <Switch checked={isTiled} onCheckedChange={setIsTiled} className="scale-50 h-4 w-8" />
                       </div>
                    </div>
                    {!isTiled ? (
                      <div className="grid grid-cols-3 gap-2 w-full max-w-[240px] mx-auto bg-secondary/50 p-2 rounded-2xl border border-white/5">
                        {(['tl', 'tc', 'tr', 'ml', 'cc', 'mr', 'bl', 'bc', 'br'] as const).map(k => (
                          <button
                            key={k}
                            onClick={() => { setPositionKey(k); setCustomPos({ x: 0, y: 0 }); }}
                            className={cn(
                              "aspect-square rounded-lg border flex items-center justify-center transition-all",
                              positionKey === k ? "bg-primary border-primary shadow-lg" : "bg-background border-border"
                            )}
                          >
                            <div className={cn("w-1.5 h-1.5 rounded-full", positionKey === k ? "bg-white" : "bg-foreground/10")} />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/20 flex items-start gap-4">
                         <Grid3X3 className="w-5 h-5 text-primary mt-1 shrink-0" />
                         <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-foreground">Global Tile Logic</p>
                            <p className="text-[9px] text-foreground/40 leading-relaxed font-medium uppercase">Pattern distributes at 4x frequency with 50% baseline transparency reduction.</p>
                         </div>
                      </div>
                    )}
                 </div>

                 {/* Action cluster */}
                 <div className="pt-4 flex flex-col gap-3">
                    <Button onClick={handleExport} disabled={!file || isProcessing} className="h-16 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 active:scale-95 transition-all">
                       <Download className="w-6 h-6" /> {mediaType === 'video' ? 'Synthesize Master' : 'Export Visual'}
                    </Button>
                 </div>
              </CardContent>
           </Card>

           <div className="grid grid-cols-1 gap-6">
              <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Privacy Absolute</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    100% local production. Video frames are re-synthesized in your browser memory and never touch remote servers.
                  </p>
                </div>
             </div>
           </div>
        </div>
      </div>
      
      {/* MOBILE STICKY ACTIONS */}
      {file && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0a0a0c]/80 backdrop-blur-3xl border-t border-white/10 z-[100] lg:hidden flex gap-3 animate-in slide-in-from-bottom-full duration-500">
          <Button onClick={handleExport} disabled={isProcessing} className="flex-1 h-14 bg-primary text-white font-black rounded-2xl flex items-center justify-center gap-3 text-xs uppercase tracking-widest shadow-2xl">
             {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
             {mediaType === 'video' ? 'Synthesize' : 'Export'}
          </Button>
        </div>
      )}

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
