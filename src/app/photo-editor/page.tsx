
"use client"

import React, { useState, useRef, useEffect } from 'react';
import { 
  ImageIcon, 
  Crop, 
  RotateCw, 
  FlipHorizontal, 
  FlipVertical, 
  Sun, 
  Contrast, 
  Droplet, 
  Wand2, 
  Type, 
  Pencil, 
  Undo, 
  Download, 
  Trash2, 
  Upload, 
  Maximize, 
  Minimize,
  CheckCircle2,
  Info,
  Loader2,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  size: number;
}

export default function PhotoEditorPage() {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Adjustments
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
  const [grayscale, setGrayscale] = useState(0);
  const [sepia, setSepia] = useState(0);

  // Tools State
  const [activeTab, setActiveTab] = useState('adjust');
  const [drawColor, setDrawColor] = useState('#2563eb');
  const [brushSize, setBrushSize] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Text State
  const [texts, setTexts] = useState<TextOverlay[]>([]);
  const [newText, setNewText] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textSize, setTextSize] = useState(40);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize canvas when image changes
  useEffect(() => {
    if (image) {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const drawCanvas = drawingCanvasRef.current;
        if (!canvas || !drawCanvas) return;

        canvas.width = img.width;
        canvas.height = img.height;
        drawCanvas.width = img.width;
        drawCanvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (ctx) ctx.drawImage(img, 0, 0);
        
        applyFilters();
      };
      img.src = image;
    }
  }, [image]);

  const applyFilters = () => {
    if (!image || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px) grayscale(${grayscale}%) sepia(${sepia}%)`;
      ctx.drawImage(img, 0, 0);
      
      // Draw the drawings layer on top
      if (drawingCanvasRef.current) {
        ctx.drawImage(drawingCanvasRef.current, 0, 0);
      }

      // Draw text overlays
      ctx.filter = 'none';
      texts.forEach(t => {
        ctx.fillStyle = t.color;
        ctx.font = `bold ${t.size}px Inter, sans-serif`;
        ctx.fillText(t.text, t.x, t.y);
      });
    };
    img.src = image;
  };

  // Re-apply whenever filters or overlays change
  useEffect(() => {
    applyFilters();
  }, [brightness, contrast, saturation, blur, grayscale, sepia, texts]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImage(result);
        setOriginalImage(result);
        setTexts([]);
        resetAdjustments();
        toast({ title: "Studio Loaded", description: "Image imported into the workspace." });
      };
      reader.readAsDataURL(file);
    }
  };

  const resetAdjustments = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setBlur(0);
    setGrayscale(0);
    setSepia(0);
  };

  const handleRotate = (deg: number) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const drawCanvas = drawingCanvasRef.current;
    if (!ctx || !drawCanvas) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCanvas.getContext('2d')?.drawImage(canvas, 0, 0);

    const newWidth = deg % 180 === 0 ? canvas.width : canvas.height;
    const newHeight = deg % 180 === 0 ? canvas.height : canvas.width;

    canvas.width = newWidth;
    canvas.height = newHeight;
    drawCanvas.width = newWidth;
    drawCanvas.height = newHeight;

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((deg * Math.PI) / 180);
    ctx.drawImage(tempCanvas, -tempCanvas.width / 2, -tempCanvas.height / 2);
    
    setImage(canvas.toDataURL());
    toast({ title: "Transformed", description: `Image rotated ${deg} degrees.` });
  };

  const handleFlip = (horizontal: boolean) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCanvas.getContext('2d')?.drawImage(canvas, 0, 0);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    if (horizontal) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    } else {
      ctx.translate(0, canvas.height);
      ctx.scale(1, -1);
    }
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.restore();

    setImage(canvas.toDataURL());
    toast({ title: "Transformed", description: `Image flipped ${horizontal ? 'horizontally' : 'vertically'}.` });
  };

  const handleDrawStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (activeTab !== 'draw') return;
    setIsDrawing(true);
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.beginPath();
    ctx.moveTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY);
    ctx.strokeStyle = drawColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const handleDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || activeTab !== 'draw') return;
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.lineTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY);
    ctx.stroke();
    applyFilters();
  };

  const handleDrawEnd = () => {
    setIsDrawing(false);
  };

  const addText = () => {
    if (!newText.trim()) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const newTextObj: TextOverlay = {
      id: Math.random().toString(36).substr(2, 9),
      text: newText,
      x: canvas.width / 2,
      y: canvas.height / 2,
      color: textColor,
      size: textSize
    };
    setTexts([...texts, newTextObj]);
    setNewText('');
    toast({ title: "Text Added", description: "Overlay placed at center." });
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `qrcanvas-edit-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png', 1.0);
    link.click();
    toast({ title: "Download Started", description: "Your high-res edit is being saved." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <ImageIcon className="w-3.5 h-3.5" /> Creative Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Photo <span className="text-primary italic">Editor</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl">
          Professional-grade local photo editing. Adjust, filter, draw, and overlay text without ever uploading your assets to the cloud.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Main Canvas Area */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="glass-card border-border shadow-2xl overflow-hidden min-h-[500px] flex flex-col relative">
            <div className="absolute top-0 right-0 p-4 z-20 flex gap-2">
               {image && (
                 <>
                  <Button variant="secondary" size="sm" onClick={handleDownload} className="rounded-xl font-black uppercase tracking-widest text-[9px]">
                    <Download className="w-3.5 h-3.5 mr-2" /> Save PNG
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setImage(originalImage); setTexts([]); resetAdjustments(); }} className="rounded-xl font-black uppercase tracking-widest text-[9px] bg-background/50 backdrop-blur-md">
                    <Undo className="w-3.5 h-3.5 mr-2" /> Reset
                  </Button>
                 </>
               )}
            </div>

            <CardContent className={cn(
              "flex-1 flex items-center justify-center p-6 bg-slate-100 dark:bg-black/40 relative overflow-auto",
              !image && "cursor-pointer"
            )} onClick={() => !image && fileInputRef.current?.click()}>
              {image ? (
                <div className="relative inline-block shadow-2xl rounded-lg overflow-hidden border border-white/10 group">
                  <canvas 
                    ref={canvasRef} 
                    className={cn("max-w-full h-auto", activeTab === 'draw' && "cursor-crosshair")}
                    onMouseDown={handleDrawStart}
                    onMouseMove={handleDrawing}
                    onMouseUp={handleDrawEnd}
                    onMouseLeave={handleDrawEnd}
                    onTouchStart={handleDrawStart}
                    onTouchMove={handleDrawing}
                    onTouchEnd={handleDrawEnd}
                  />
                  <canvas ref={drawingCanvasRef} className="hidden" />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6 group">
                  <div className="w-20 h-20 rounded-[2rem] bg-background border border-border flex items-center justify-center text-foreground/20 group-hover:text-primary group-hover:scale-110 transition-all shadow-xl">
                    <Upload className="w-10 h-10" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest group-hover:text-primary transition-colors">Select Visual Asset</p>
                    <p className="text-[9px] text-foreground/20 font-bold uppercase tracking-widest">(JPG, PNG, WebP up to 10MB)</p>
                  </div>
                </div>
              )}
              <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
            </CardContent>
          </Card>
          
          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5 group-hover:bg-primary/10 transition-colors">
            <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Local Privacy Guaranteed</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                Our studio utilizes browser-native Canvas rendering. Your imagery never touches a server, providing military-grade privacy for sensitive documents and photos.
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar Area */}
        <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
          <Card className="glass-card border-border shadow-2xl overflow-hidden">
            <CardHeader className="py-6 border-b border-border bg-secondary/30">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                <Wand2 className="w-4 h-4" /> Studio Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-4 gap-2 bg-transparent p-0 mb-8 h-auto">
                  {[
                    { id: 'adjust', icon: Sun, label: 'Adjust' },
                    { id: 'filter', icon: Wand2, label: 'Filter' },
                    { id: 'draw', icon: Pencil, label: 'Draw' },
                    { id: 'text', icon: Type, label: 'Text' },
                  ].map((tab) => (
                    <TabsTrigger 
                      key={tab.id}
                      value={tab.id}
                      disabled={!image}
                      className="flex flex-col gap-2 py-3 bg-secondary border border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all rounded-xl"
                    >
                      <tab.icon className="w-3.5 h-3.5" />
                      <span className="text-[8px] font-black uppercase tracking-widest">{tab.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="adjust" className="space-y-8 animate-in fade-in duration-300">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-foreground/50">
                        <Label className="flex items-center gap-2"><Sun className="w-3 h-3" /> Brightness</Label>
                        <span>{brightness}%</span>
                      </div>
                      <Slider value={[brightness]} min={0} max={200} step={1} onValueChange={(v) => setBrightness(v[0])} />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-foreground/50">
                        <Label className="flex items-center gap-2"><Contrast className="w-3 h-3" /> Contrast</Label>
                        <span>{contrast}%</span>
                      </div>
                      <Slider value={[contrast]} min={0} max={200} step={1} onValueChange={(v) => setContrast(v[0])} />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-foreground/50">
                        <Label className="flex items-center gap-2"><Droplet className="w-3 h-3" /> Saturation</Label>
                        <span>{saturation}%</span>
                      </div>
                      <Slider value={[saturation]} min={0} max={200} step={1} onValueChange={(v) => setSaturation(v[0])} />
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-border space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Transformations</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" size="sm" onClick={() => handleRotate(90)} className="h-10 rounded-xl text-[9px] uppercase font-black tracking-widest border-border bg-secondary hover:bg-secondary/80">
                        <RotateCw className="w-3.5 h-3.5 mr-2" /> Rotate 90
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleFlip(true)} className="h-10 rounded-xl text-[9px] uppercase font-black tracking-widest border-border bg-secondary hover:bg-secondary/80">
                        <FlipHorizontal className="w-3.5 h-3.5 mr-2" /> Flip H
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleFlip(false)} className="h-10 rounded-xl text-[9px] uppercase font-black tracking-widest border-border bg-secondary hover:bg-secondary/80">
                        <FlipVertical className="w-3.5 h-3.5 mr-2" /> Flip V
                      </Button>
                      <Button variant="outline" size="sm" onClick={resetAdjustments} className="h-10 rounded-xl text-[9px] uppercase font-black tracking-widest border-border bg-secondary hover:bg-secondary/80">
                        <Trash2 className="w-3.5 h-3.5 mr-2" /> Clear
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="filter" className="space-y-8 animate-in fade-in duration-300">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-foreground/50">
                        <Label>Grayscale</Label>
                        <span>{grayscale}%</span>
                      </div>
                      <Slider value={[grayscale]} min={0} max={100} step={1} onValueChange={(v) => setGrayscale(v[0])} />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-foreground/50">
                        <Label>Sepia Tone</Label>
                        <span>{sepia}%</span>
                      </div>
                      <Slider value={[sepia]} min={0} max={100} step={1} onValueChange={(v) => setSepia(v[0])} />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-foreground/50">
                        <Label>Soft Blur</Label>
                        <span>{blur}px</span>
                      </div>
                      <Slider value={[blur]} min={0} max={20} step={1} onValueChange={(v) => setBlur(v[0])} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <Button variant="outline" size="sm" onClick={() => { setGrayscale(100); setSepia(0); }} className="h-10 rounded-xl text-[9px] font-black uppercase tracking-widest">Noir Style</Button>
                    <Button variant="outline" size="sm" onClick={() => { setSepia(100); setGrayscale(0); }} className="h-10 rounded-xl text-[9px] font-black uppercase tracking-widest">Vintage</Button>
                  </div>
                </TabsContent>

                <TabsContent value="draw" className="space-y-8 animate-in fade-in duration-300">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/50">Pen Color</Label>
                      <div className="flex flex-wrap gap-2">
                        {['#2563eb', '#ef4444', '#22c55e', '#f59e0b', '#000000', '#ffffff'].map(c => (
                          <button
                            key={c}
                            onClick={() => setDrawColor(c)}
                            className={cn(
                              "w-8 h-8 rounded-full border-2 transition-all",
                              drawColor === c ? "border-primary scale-110 shadow-lg" : "border-transparent"
                            )}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-foreground/50">
                        <Label>Brush Size</Label>
                        <span>{brushSize}px</span>
                      </div>
                      <Slider value={[brushSize]} min={1} max={50} step={1} onValueChange={(v) => setBrushSize(v[0])} />
                    </div>
                    <Button 
                      variant="destructive" 
                      className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest"
                      onClick={() => {
                        const canvas = drawingCanvasRef.current;
                        if (canvas) canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
                        applyFilters();
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Clear All Drawing
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="text" className="space-y-8 animate-in fade-in duration-300">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/50">New Overlay Text</Label>
                      <Input 
                        placeholder="Enter text..." 
                        value={newText} 
                        onChange={e => setNewText(e.target.value)}
                        className="h-12 bg-secondary border-border rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase text-foreground/40">Size</Label>
                        <Input type="number" value={textSize} onChange={e => setTextSize(parseInt(e.target.value) || 10)} className="h-10 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase text-foreground/40">Color</Label>
                        <Input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="h-10 rounded-xl p-1" />
                      </div>
                    </div>
                    <Button 
                      onClick={addText}
                      className="w-full h-14 bg-primary text-primary-foreground font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20"
                    >
                      Add to Center
                    </Button>
                  </div>
                  
                  {texts.length > 0 && (
                    <div className="pt-6 border-t border-border space-y-3">
                      <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Active Overlays</Label>
                      <div className="max-h-[120px] overflow-auto space-y-2">
                        {texts.map(t => (
                          <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary border border-border">
                            <span className="text-[10px] font-bold truncate max-w-[150px]">{t.text}</span>
                            <button onClick={() => setTexts(texts.filter(item => item.id !== t.id))} className="text-destructive hover:scale-110 transition-all">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
