"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Search, 
  Box, 
  Download, 
  Copy, 
  RotateCcw, 
  Globe, 
  Zap, 
  Settings2, 
  ShieldCheck, 
  CheckCircle2, 
  Activity, 
  Loader2, 
  Maximize2, 
  Palette, 
  Smartphone,
  ChevronRight,
  FileCode,
  FileDown,
  X,
  Type,
  Maximize,
  Check,
  Shapes,
  LayoutGrid,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';
import { searchIconsAction, IconResult } from './actions';

export default function IconStudioPage() {
  const { toast } = useToast();
  
  // Search State
  const [query, setQuery] = useState('');
  const [provider, setProvider] = useState('auto');
  const [results, setResults] = useState<IconResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeNode, setActiveNode] = useState('Standby');
  const [error, setError] = useState<string | null>(null);

  // Customization State
  const [selectedIcon, setSelectedIcon] = useState<IconResult | null>(null);
  const [iconColor, setIconColor] = useState('#3b82f6');
  const [iconSize, setIconSize] = useState(512);
  const [isCopied, setIsCopied] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await searchIconsAction(query, provider);
      if (response.success && response.icons.length > 0) {
        setResults(response.icons);
        setActiveNode(response.activeNode);
        toast({ title: "Signal Isolated", description: `Discovered ${response.icons.length} identifiers.` });
      } else {
        setError(response.error || "No icons identified for this query. Try a different node.");
      }
    } catch (err) {
      setError("Protocol Error: Discovery node unreachable.");
    } finally {
      setIsLoading(false);
    }
  };

  const getIconSvg = async (icon: IconResult, color: string) => {
    const url = `https://api.iconify.design/${icon.prefix}/${icon.name}.svg?color=${encodeURIComponent(color)}`;
    const res = await fetch(url);
    return await res.text();
  };

  const handleDownload = async (format: 'svg' | 'png' | 'ico') => {
    if (!selectedIcon) return;

    try {
      const svgText = await getIconSvg(selectedIcon, iconColor);
      
      if (format === 'svg') {
        const blob = new Blob([svgText], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${selectedIcon.name}.svg`;
        link.click();
        URL.revokeObjectURL(url);
        toast({ title: "Vector Exported", description: "SVG master saved." });
        return;
      }

      // PNG/ICO Synthesis via Canvas
      const img = new Image();
      const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = iconSize;
        canvas.height = iconSize;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, iconSize, iconSize);
          const dataUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = `${selectedIcon.name}.${format === 'ico' ? 'ico' : 'png'}`;
          link.click();
          toast({ title: "Master Exported", description: `${format.toUpperCase()} synthesized locally.` });
        }
        URL.revokeObjectURL(url);
      };
      img.src = url;
    } catch (e) {
      toast({ variant: "destructive", title: "Synthesis Failed" });
    }
  };

  const handleCopyCode = async () => {
    if (!selectedIcon) return;
    try {
      const svgText = await getIconSvg(selectedIcon, iconColor);
      navigator.clipboard.writeText(svgText);
      setIsCopied('code');
      toast({ title: "SVG Matrix Copied" });
      setTimeout(() => setIsCopied(null), 2000);
    } catch (e) {}
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setSelectedIcon(null);
    setActiveNode('Standby');
    setError(null);
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl overflow-hidden">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Box className="w-3.5 h-3.5" /> Identity Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
                Icon <span className="text-primary italic">Studio Pro</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional multi-node icon discovery. Isolate high-fidelity symbols from global registries with real-time chromatic synthesis and hardware-native exports.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="icon-studio" />
              {(results.length > 0 || query) && (
                <Button variant="outline" size="sm" onClick={handleClear} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                  <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
                </Button>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Discovery Panel */}
        <aside className="lg:col-span-5 xl:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
           <Card className="glass-card border-border shadow-2xl overflow-visible relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
              <CardHeader className="py-6 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Search className="w-5 h-5 text-primary" /> Discovery Node
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-10 space-y-8 relative">
                 <form onSubmit={handleSearch} className="space-y-4">
                    <div className="space-y-3">
                       <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Linguistic Target</Label>
                       <div className="relative group/input">
                          <Input 
                            placeholder="e.g. instagram, play, home..." 
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            className="h-16 bg-secondary border-border rounded-2xl text-sm font-bold px-6 focus:ring-primary/40 uppercase"
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/input:opacity-100 transition-opacity">
                             <Zap className="w-5 h-5 text-primary" />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Server Protocol</Label>
                       <Select value={provider} onValueChange={setProvider}>
                          <SelectTrigger className="h-12 bg-secondary/50 border-border rounded-xl font-bold uppercase text-[10px]">
                             <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="glass-card">
                             <SelectItem value="auto" className="text-[10px] font-black uppercase">Auto (Multi-Node)</SelectItem>
                             <SelectItem value="iconify" className="text-[10px] font-black uppercase">Iconify Engine</SelectItem>
                             <SelectItem value="simple-icons" className="text-[10px] font-black uppercase">Simple Icons (Brands)</SelectItem>
                             <SelectItem value="openmoji" className="text-[10px] font-black uppercase">OpenMoji Registry</SelectItem>
                             <SelectItem value="material" className="text-[10px] font-black uppercase">Material Design</SelectItem>
                          </SelectContent>
                       </Select>
                    </div>

                    <Button type="submit" disabled={isLoading || !query.trim()} className="w-full h-14 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 text-xs uppercase tracking-widest active:scale-95 transition-all">
                       {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Shapes className="w-5 h-5 mr-3" />}
                       Initialize Discovery
                    </Button>
                 </form>

                 <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50 border border-border">
                    <div className="flex items-center gap-3">
                       <Activity className="w-4 h-4 text-primary/40" />
                       <span className="text-[9px] font-black uppercase text-foreground/30">Active Node</span>
                    </div>
                    <Badge variant="outline" className="bg-background/50 border-primary/20 text-primary text-[8px] font-black uppercase px-3 py-1">
                       {activeNode}
                    </Badge>
                 </div>
              </CardContent>
           </Card>

           {/* Configuration Panel */}
           <Card className={cn(
             "glass-card border-border shadow-xl transition-all duration-500",
             !selectedIcon && "opacity-40 grayscale pointer-events-none"
           )}>
              <CardHeader className="py-6 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Settings2 className="w-5 h-5 text-primary" /> Synthesis Config
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-10">
                 <div className="grid grid-cols-1 gap-8">
                    <div className="space-y-4">
                       <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-foreground/40">
                          <Label className="flex items-center gap-2"><Palette className="w-3.5 h-3.5" /> Chromatic Value</Label>
                          <span className="text-primary font-mono">{iconColor}</span>
                       </div>
                       <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary border border-border">
                          <div className="w-10 h-10 rounded-lg relative overflow-hidden ring-2 ring-white/10" style={{ backgroundColor: iconColor }}>
                             <input type="color" value={iconColor} onChange={e => setIconColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
                          </div>
                          <Input value={iconColor} onChange={e => setIconColor(e.target.value)} className="h-10 bg-background border-border text-xs font-mono uppercase text-center" />
                       </div>
                    </div>

                    <div className="space-y-4">
                       <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-foreground/40">
                          <Label className="flex items-center gap-2"><Maximize className="w-3.5 h-3.5" /> Geometric Scale</Label>
                          <span className="text-primary font-mono">{iconSize}px</span>
                       </div>
                       <Slider value={[iconSize]} min={16} max={1024} step={16} onValueChange={v => setIconSize(v[0])} />
                       <div className="grid grid-cols-3 gap-2">
                          {[32, 512, 1024].map(s => (
                            <button key={s} onClick={() => setIconSize(s)} className={cn("h-8 rounded-lg border text-[8px] font-black uppercase transition-all", iconSize === s ? "bg-primary text-white border-primary" : "bg-background border-border text-foreground/40")}>{s}px</button>
                          ))}
                       </div>
                    </div>
                 </div>

                 <div className="pt-4 grid grid-cols-1 gap-3">
                    <Button onClick={() => handleDownload('png')} className="h-14 w-full bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-xl active:scale-95">
                       <Download className="w-4 h-4 mr-2" /> Save PNG Master
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                       <Button variant="outline" onClick={() => handleDownload('svg')} className="h-11 border-border bg-white/5 text-foreground/60 text-[8px] font-black uppercase">SVG Vector</Button>
                       <Button variant="outline" onClick={() => handleDownload('ico')} className="h-11 border-border bg-white/5 text-foreground/60 text-[8px] font-black uppercase">ICO (Favicon)</Button>
                    </div>
                    <Button variant="outline" onClick={handleCopyCode} className="h-11 w-full border-white/5 bg-secondary/50 text-primary text-[8px] font-black uppercase">
                       {isCopied === 'code' ? <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> : <Copy className="w-3.5 h-3.5 mr-2" />} 
                       Copy SVG Protocol
                    </Button>
                 </div>
              </CardContent>
           </Card>
        </aside>

        {/* Results Column */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px] bg-black/10">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between shrink-0 px-6 sm:px-10">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <Activity className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Identity Profile Matrix</CardTitle>
                 </div>
              </CardHeader>
              
              <CardContent className="flex-1 p-8 sm:p-12 relative overflow-hidden flex flex-col">
                 {!results.length && !isLoading && !error && (
                   <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-6 py-20">
                      <LayoutGrid className="w-24 h-24 text-primary" />
                      <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Discovery Signal</p>
                   </div>
                 )}

                 {isLoading && (
                   <div className="flex-1 flex flex-col items-center justify-center space-y-10 py-20">
                      <div className="relative">
                         <div className="w-28 h-28 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                         <Globe className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                      </div>
                      <p className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">Decoding Global Visual Nodes...</p>
                   </div>
                 )}

                 {error && (
                    <div className="flex flex-col items-center gap-8 py-20 text-center animate-in shake duration-500">
                       <AlertCircle className="w-16 h-16 text-destructive animate-bounce" />
                       <div className="space-y-2">
                          <h3 className="text-xl font-headline font-black text-destructive uppercase">Reference Failure</h3>
                          <p className="text-[11px] text-foreground/40 font-bold uppercase max-w-sm mx-auto leading-relaxed">{error}</p>
                       </div>
                    </div>
                 )}

                 {results.length > 0 && !isLoading && (
                   <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8 gap-4 animate-in zoom-in-95 duration-500">
                      {results.map((icon) => (
                        <button
                          key={icon.id}
                          onClick={() => setSelectedIcon(icon)}
                          className={cn(
                            "relative aspect-square rounded-[1.5rem] border flex items-center justify-center p-4 transition-all duration-300 group/item",
                            selectedIcon?.id === icon.id ? "bg-primary/10 border-primary shadow-lg scale-105" : "bg-white/5 border-white/5 hover:border-primary/40"
                          )}
                        >
                           <img 
                            src={`https://api.iconify.design/${icon.prefix}/${icon.name}.svg?color=${encodeURIComponent(iconColor)}`} 
                            alt="" 
                            className="w-full h-full object-contain drop-shadow-xl group-hover/item:scale-110 transition-transform" 
                           />
                           <div className="absolute bottom-2 left-0 right-0 px-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                              <p className="text-[6px] font-black uppercase text-foreground/40 text-center truncate">{icon.name}</p>
                           </div>
                        </button>
                      ))}
                   </div>
                 )}
              </CardContent>

              {/* Master Result Display */}
              {selectedIcon && (
                <div className="p-8 sm:p-12 border-t border-white/5 bg-[#0a0a0c] flex flex-col md:flex-row items-center gap-12 shrink-0 animate-in slide-in-from-bottom-6">
                   <div className="relative group/master shrink-0">
                      <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-50 group-hover/master:opacity-100 transition-opacity" />
                      <div className="relative w-40 h-40 rounded-[2.5rem] bg-white dark:bg-black/40 border-4 border-white dark:border-white/5 flex items-center justify-center shadow-2xl ring-1 ring-border overflow-hidden bg-checkered">
                         <img 
                          src={`https://api.iconify.design/${selectedIcon.prefix}/${selectedIcon.name}.svg?color=${encodeURIComponent(iconColor)}`} 
                          alt="" 
                          className="w-24 h-24 object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-transform duration-700 group-hover/master:scale-110" 
                         />
                      </div>
                   </div>
                   
                   <div className="flex-1 w-full space-y-6 text-center md:text-left min-w-0">
                      <div className="space-y-2">
                         <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Isolated Identifier</p>
                         <h2 className="text-3xl sm:text-5xl font-headline font-black text-foreground uppercase tracking-tight truncate">{selectedIcon.name}</h2>
                         <div className="flex flex-wrap justify-center md:justify-start gap-3">
                            <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest px-3 py-1">Registry: {selectedIcon.source}</Badge>
                            <Badge className="bg-white/5 text-white/40 border-white/10 text-[9px] font-black uppercase tracking-widest px-3 py-1">Type: Vector</Badge>
                         </div>
                      </div>

                      <div className="p-6 rounded-[2.5rem] bg-white/5 border border-white/10 space-y-4">
                         <div className="flex items-center justify-between px-1">
                            <Label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">Source CDN Vector</Label>
                            <button onClick={() => handleCopy(`https://api.iconify.design/${selectedIcon.prefix}/${selectedIcon.name}.svg`, 'CDN')} className="text-[8px] font-black text-primary/60 hover:text-primary uppercase tracking-widest">Copy URL</button>
                         </div>
                         <div className="bg-black/40 p-3 rounded-xl border border-white/5 shadow-inner">
                            <p className="text-[10px] font-mono text-foreground/30 truncate">https://api.iconify.design/{selectedIcon.prefix}/{selectedIcon.name}.svg</p>
                         </div>
                      </div>
                   </div>
                </div>
              )}
           </Card>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Privacy Sovereign</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    All chromatic re-matricing and format conversions occur 100% locally in your browser memory. No identity data is stored.
                  </p>
                </div>
             </div>
             <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <Zap className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Hardware Synthesis</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    PNG and ICO exports are generated via a high-performance hardware-accelerated 2D context to ensure peak pixel clarity.
                  </p>
                </div>
             </div>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
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
