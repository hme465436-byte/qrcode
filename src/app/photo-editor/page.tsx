
"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ImageIcon, 
  RotateCw, 
  FlipHorizontal, 
  FlipVertical, 
  Sun, 
  Contrast, 
  Droplet, 
  Wand2, 
  Type, 
  Pencil, 
  Undo2, 
  Redo2,
  Download, 
  Trash2, 
  Upload, 
  CheckCircle2,
  Info,
  Loader2,
  X,
  Thermometer,
  Wind,
  Layers,
  Eraser,
  ImagePlus,
  Maximize,
  Save
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

interface EditorState {
  brightness: number;
  contrast: number;
  saturation: number;
  exposure: number;
  warmth: number;
  blur: number;
  grayscale: number;
  sepia: number;
  fade: number;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  texts: TextOverlay[];
  drawingData?: string;
}

const INITIAL_STATE: EditorState = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  exposure: 0,
  warmth: 0,
  blur: 0,
  grayscale: 0,
  sepia: 0,
  fade: 0,
  rotation: 0,
  flipH: false,
  flipV: false,
  texts: [],
};

export default function PhotoEditorPage() {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // History State
  const [history, setHistory] = useState<EditorState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [currentState, setCurrentState] = useState<EditorState>(INITIAL_STATE);

  // Tools UI State
  const [activeTab, setActiveTab] = useState('adjust');
  const [drawColor, setDrawColor] = useState('#2563eb');
  const [brushSize, setBrushSize] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);
  const [toolMode, setToolMode] = useState<'pen' | 'eraser'>('pen');
  
  // Text State
  const [newText, setNewText] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textSize, setTextSize] = useState(40);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save to history helper
  const saveToHistory = useCallback((state: EditorState) => {
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push({ ...state });
    // Limit history to last 20 steps
    if (newHistory.length > 20) newHistory.shift();
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  }, [history, currentIndex]);

  // Initial Load
  useEffect(() => {
    if (image && currentIndex === -1) {
      saveToHistory(INITIAL_STATE);
    }
  }, [image, currentIndex, saveToHistory]);

  const applyFilters = useCallback(() => {
    if (!image || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Clear and setup canvas transformations
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      
      // Apply Flip & Rotate
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((currentState.rotation * Math.PI) / 180);
      ctx.scale(currentState.flipH ? -1 : 1, currentState.flipV ? -1 : 1);
      
      // Filter String
      // Simplified warmth via sepia/hue-rotate
      const warmthVal = currentState.warmth;
      const warmthFilter = warmthVal > 0 
        ? `sepia(${warmthVal}%) hue-rotate(-${warmthVal * 0.3}deg)`
        : `hue-rotate(${Math.abs(warmthVal) * 0.5}deg) saturate(${100 + Math.abs(warmthVal)}%)`;

      ctx.filter = `
        brightness(${currentState.brightness + currentState.exposure}%) 
        contrast(${currentState.contrast}%) 
        saturate(${currentState.saturation}%) 
        blur(${currentState.blur}px) 
        grayscale(${currentState.grayscale}%) 
        sepia(${currentState.sepia}%)
        opacity(${100 - currentState.fade * 0.2}%)
        ${warmthFilter}
      `;

      // Draw main image
      ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
      ctx.restore();
      
      // Overlay Drawing Layer
      if (drawingCanvasRef.current) {
        ctx.drawImage(drawingCanvasRef.current, 0, 0);
      }

      // Overlay Text
      currentState.texts.forEach(t => {
        ctx.fillStyle = t.color;
        ctx.font = `black ${t.size}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Add subtle shadow for readability
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 4;
        ctx.fillText(t.text, t.x, t.y);
        ctx.shadowBlur = 0;
      });
    };
    img.src = image;
  }, [image, currentState]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const img = new Image();
        img.onload = () => {
          setImage(result);
          setOriginalImage(result);
          setHistory([]);
          setCurrentIndex(-1);
          setCurrentState(INITIAL_STATE);
          
          if (canvasRef.current && drawingCanvasRef.current) {
            canvasRef.current.width = img.width;
            canvasRef.current.height = img.height;
            drawingCanvasRef.current.width = img.width;
            drawingCanvasRef.current.height = img.height;
          }
          setIsProcessing(false);
          toast({ title: "Studio Ready", description: "Image loaded in high resolution." });
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    }
  };

  const updateParam = (updates: Partial<EditorState>) => {
    const nextState = { ...currentState, ...updates };
    setCurrentState(nextState);
  };

  const commitChange = () => {
    saveToHistory(currentState);
  };

  const undo = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setCurrentState(history[prevIndex]);
      toast({ title: "Undo", description: "Step reversed." });
    }
  };

  const redo = () => {
    if (currentIndex < history.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentState(history[nextIndex]);
      toast({ title: "Redo", description: "Step reapplied." });
    }
  };

  const handleDrawStart = (e: any) => {
    if (activeTab !== 'draw') return;
    setIsDrawing(true);
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY);
    ctx.strokeStyle = toolMode === 'eraser' ? 'rgba(0,0,0,0)' : drawColor;
    ctx.globalCompositeOperation = toolMode === 'eraser' ? 'destination-out' : 'source-over';
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const handleDrawing = (e: any) => {
    if (!isDrawing || activeTab !== 'draw') return;
    const canvas = drawingCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    ctx.lineTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY);
    ctx.stroke();
    applyFilters();
  };

  const handleDrawEnd = () => {
    if (isDrawing) {
      setIsDrawing(false);
      // Logic to save the drawing layer state would go here
      // For MVP, we maintain the drawing on the separate canvas
      commitChange();
    }
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
    
    const nextState = {
      ...currentState,
      texts: [...currentState.texts, newTextObj]
    };
    setCurrentState(nextState);
    saveToHistory(nextState);
    setNewText('');
    toast({ title: "Text Placed", description: "Overlay added to center." });
  };

  const handleDownload = (format: 'png' | 'jpg') => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `qrcanvas-studio-${Date.now()}.${format}`;
    link.href = canvasRef.current.toDataURL(format === 'png' ? 'image/png' : 'image/jpeg', 0.95);
    link.click();
    toast({ title: "Export Complete", description: `Saved as high-quality ${format.toUpperCase()}.` });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex flex-col">
      {/* Header Bar */}
      <header className="h-16 border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()} className="text-white/40 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
          <div className="space-y-0.5">
            <h1 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Studio Edition</h1>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{image ? "Active Project" : "Standby"}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {image && (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={undo} 
                disabled={currentIndex <= 0}
                className="text-white/40 hover:text-white disabled:opacity-10"
              >
                <Undo2 className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={redo} 
                disabled={currentIndex >= history.length - 1}
                className="text-white/40 hover:text-white disabled:opacity-10"
              >
                <Redo2 className="w-4 h-4" />
              </Button>
              <div className="w-[1px] h-4 bg-white/10 mx-2" />
              <Button 
                onClick={() => handleDownload('png')} 
                className="h-9 px-4 rounded-xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20"
              >
                <Save className="w-3.5 h-3.5 mr-2" /> Save
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Workspace Area */}
        <main className="flex-1 flex flex-col relative bg-[#060608] overflow-auto custom-scrollbar">
          {!image ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex flex-col items-center justify-center cursor-pointer group p-10"
            >
              <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-white/20 group-hover:text-primary group-hover:scale-110 group-hover:border-primary/40 transition-all duration-700 shadow-2xl">
                <ImagePlus className="w-10 h-10" />
              </div>
              <div className="mt-8 text-center space-y-2">
                <h3 className="text-sm font-black text-white/60 uppercase tracking-[0.3em] group-hover:text-white transition-colors">Import Visual Asset</h3>
                <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">JPG, PNG, WebP up to 10MB</p>
              </div>
              <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6 md:p-12 min-h-full">
              <div className="relative group max-w-full">
                <canvas 
                  ref={canvasRef} 
                  className={cn(
                    "max-w-full h-auto rounded-lg shadow-2xl ring-1 ring-white/10 transition-transform duration-500",
                    activeTab === 'draw' && "cursor-crosshair",
                    isProcessing && "opacity-50 blur-sm"
                  )}
                  onMouseDown={handleDrawStart}
                  onMouseMove={handleDrawing}
                  onMouseUp={handleDrawEnd}
                  onMouseLeave={handleDrawEnd}
                  onTouchStart={handleDrawStart}
                  onTouchMove={handleDrawing}
                  onTouchEnd={handleDrawEnd}
                />
                <canvas ref={drawingCanvasRef} className="hidden" />
                
                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Controls Panel (Sidebar for Desktop, Bottom for Mobile) */}
        <aside className={cn(
          "bg-[#0a0a0c] border-white/5 overflow-hidden transition-all duration-500 z-40",
          "lg:w-[380px] lg:border-l lg:h-full",
          "h-auto border-t w-full"
        )}>
          {!image ? (
            <div className="hidden lg:flex h-full items-center justify-center p-12 text-center">
              <div className="space-y-4">
                <Layers className="w-12 h-12 text-white/10 mx-auto" />
                <p className="text-[10px] font-black uppercase text-white/20 tracking-[0.2em]">Studio Standby</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <TabsList className={cn(
                  "bg-[#0a0a0c] border-b border-white/5 p-2 h-auto rounded-none",
                  "lg:grid lg:grid-cols-4 lg:gap-2",
                  "flex overflow-x-auto justify-start no-scrollbar"
                )}>
                  {[
                    { id: 'adjust', icon: Sun, label: 'Adjust' },
                    { id: 'filter', icon: Wand2, label: 'Filters' },
                    { id: 'draw', icon: Pencil, label: 'Draw' },
                    { id: 'text', icon: Type, label: 'Text' },
                  ].map((tab) => (
                    <TabsTrigger 
                      key={tab.id}
                      value={tab.id}
                      className="flex items-center gap-2 py-3 px-6 lg:px-2 rounded-xl text-white/40 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all shrink-0"
                    >
                      <tab.icon className="w-4 h-4" />
                      <span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                  <TabsContent value="adjust" className="space-y-10 mt-0 animate-in fade-in duration-300">
                    <div className="space-y-8">
                      {[
                        { label: 'Brightness', icon: Sun, key: 'brightness', min: 0, max: 200 },
                        { label: 'Exposure', icon: Maximize, key: 'exposure', min: -100, max: 100 },
                        { label: 'Contrast', icon: Contrast, key: 'contrast', min: 0, max: 200 },
                        { label: 'Saturation', icon: Droplet, key: 'saturation', min: 0, max: 200 },
                        { label: 'Warmth', icon: Thermometer, key: 'warmth', min: -100, max: 100 },
                        { label: 'Blur', icon: Wind, key: 'blur', min: 0, max: 20 },
                      ].map((adj) => (
                        <div key={adj.key} className="space-y-4">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                            <Label className="flex items-center gap-2">
                              <adj.icon className="w-3 h-3" /> {adj.label}
                            </Label>
                            <span>{currentState[adj.key as keyof EditorState] as number}</span>
                          </div>
                          <Slider 
                            value={[currentState[adj.key as keyof EditorState] as number]} 
                            min={adj.min} 
                            max={adj.max} 
                            step={1} 
                            onValueChange={(v) => updateParam({ [adj.key]: v[0] })}
                            onValueCommit={commitChange}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="pt-8 border-t border-white/5 space-y-4">
                      <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Transform</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => { updateParam({ rotation: currentState.rotation + 90 }); commitChange(); }} 
                          className="h-12 bg-white/5 border-white/10 text-white/60 text-[9px] font-black uppercase hover:bg-white/10"
                        >
                          <RotateCw className="w-3.5 h-3.5 mr-2" /> Rotate 90
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => { updateParam({ flipH: !currentState.flipH }); commitChange(); }} 
                          className="h-12 bg-white/5 border-white/10 text-white/60 text-[9px] font-black uppercase hover:bg-white/10"
                        >
                          <FlipHorizontal className="w-3.5 h-3.5 mr-2" /> Flip H
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="filter" className="space-y-8 mt-0 animate-in fade-in duration-300">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Original', props: INITIAL_STATE },
                        { label: 'Noir', props: { grayscale: 100, contrast: 120 } },
                        { label: 'Vintage', props: { sepia: 100, saturation: 80, warmth: 30 } },
                        { label: 'Fade', props: { fade: 80, saturation: 60, brightness: 110 } },
                        { label: 'Cool', props: { warmth: -40, saturation: 110 } },
                        { label: 'Warm', props: { warmth: 40, saturation: 120 } },
                      ].map((filter) => (
                        <button
                          key={filter.label}
                          onClick={() => { updateParam(filter.props); commitChange(); }}
                          className="group relative h-24 rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:border-primary/40 transition-all flex flex-col items-center justify-center gap-2"
                        >
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/40 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                            <CheckCircle2 className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white">{filter.label}</span>
                        </button>
                      ))}
                    </div>
                    
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                      <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-[9px] text-white/40 leading-relaxed font-medium">
                        Filters are non-destructive and can be further refined in the Adjust tab.
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="draw" className="space-y-8 mt-0 animate-in fade-in duration-300">
                    <div className="space-y-8">
                      <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
                        <Button 
                          variant="ghost" 
                          onClick={() => setToolMode('pen')}
                          className={cn("flex-1 h-10 text-[9px] font-black uppercase rounded-lg", toolMode === 'pen' ? "bg-primary text-primary-foreground" : "text-white/40")}
                        >
                          <Pencil className="w-3.5 h-3.5 mr-2" /> Brush
                        </Button>
                        <Button 
                          variant="ghost" 
                          onClick={() => setToolMode('eraser')}
                          className={cn("flex-1 h-10 text-[9px] font-black uppercase rounded-lg", toolMode === 'eraser' ? "bg-primary text-primary-foreground" : "text-white/40")}
                        >
                          <Eraser className="w-3.5 h-3.5 mr-2" /> Eraser
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Brush Size</Label>
                        <div className="flex items-center gap-4">
                          <Slider value={[brushSize]} min={1} max={100} step={1} onValueChange={(v) => setBrushSize(v[0])} className="flex-1" />
                          <span className="text-[10px] font-mono text-primary w-8">{brushSize}px</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Color Palette</Label>
                        <div className="grid grid-cols-6 gap-3">
                          {['#2563eb', '#ef4444', '#22c55e', '#f59e0b', '#000000', '#ffffff'].map(c => (
                            <button
                              key={c}
                              onClick={() => setDrawColor(c)}
                              className={cn(
                                "w-full aspect-square rounded-full border-2 transition-all",
                                drawColor === c ? "border-primary scale-110 shadow-lg" : "border-white/10"
                              )}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="text" className="space-y-8 mt-0 animate-in fade-in duration-300">
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Overlay Content</Label>
                        <Input 
                          placeholder="Enter text..." 
                          value={newText} 
                          onChange={e => setNewText(e.target.value)}
                          className="h-14 bg-white/5 border-white/10 rounded-2xl text-white text-sm font-bold placeholder:text-white/10"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[9px] font-black uppercase text-white/20">Size</Label>
                          <Input type="number" value={textSize} onChange={e => setTextSize(parseInt(e.target.value) || 10)} className="h-12 bg-white/5 border-white/10 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[9px] font-black uppercase text-white/20">Hex Color</Label>
                          <div className="flex items-center gap-2 h-12 bg-white/5 border-white/10 rounded-xl px-2">
                            <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-8 h-8 rounded-lg border-none bg-transparent cursor-pointer" />
                            <span className="text-[10px] font-mono text-white/40 uppercase">{textColor}</span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        onClick={addText}
                        disabled={!newText.trim()}
                        className="w-full h-16 bg-primary text-primary-foreground font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20"
                      >
                        Add to Center
                      </Button>
                    </div>
                    
                    {currentState.texts.length > 0 && (
                      <div className="pt-8 border-t border-white/5 space-y-4">
                        <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Layers</Label>
                        <div className="space-y-2">
                          {currentState.texts.map(t => (
                            <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                              <span className="text-[10px] font-bold truncate max-w-[200px] text-white/60">{t.text}</span>
                              <button onClick={() => { updateParam({ texts: currentState.texts.filter(item => item.id !== t.id) }); commitChange(); }} className="text-white/20 hover:text-destructive transition-all">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </div>
              </Tabs>

              {/* Action Bar */}
              <div className="p-6 border-t border-white/5 bg-[#0a0a0c]">
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setCurrentState(INITIAL_STATE);
                      setHistory([INITIAL_STATE]);
                      setCurrentIndex(0);
                      const canvas = drawingCanvasRef.current;
                      if (canvas) canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
                      toast({ title: "Reset", description: "Studio restored to original." });
                    }}
                    className="h-14 rounded-2xl border-white/10 bg-white/5 text-white/40 font-black uppercase tracking-widest text-[10px]"
                  >
                    Reset All
                  </Button>
                  <Button 
                    onClick={() => handleDownload('jpg')}
                    className="h-14 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[10px]"
                  >
                    Export JPG
                  </Button>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        onChange={handleFileUpload} 
        className="hidden" 
      />
    </div>
  );
}
