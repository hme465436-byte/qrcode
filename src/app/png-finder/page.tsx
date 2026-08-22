
"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  ImagePlus, 
  Download, 
  Copy, 
  RotateCcw, 
  Globe, 
  Zap, 
  Settings, 
  ShieldCheck, 
  CheckCircle2, 
  Activity, 
  Loader2, 
  Maximize2, 
  ExternalLink, 
  Box, 
  Type,
  FileImage,
  X,
  Palette,
  Sparkles,
  Layers,
  Shapes,
  GripVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';
import { searchPngAction, PngResult } from './actions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PROVIDERS = [
  { id: 'auto', label: 'Auto (Best Signal)', icon: Sparkles },
  { id: 'openverse', label: 'Openverse PNG', icon: Globe },
  { id: 'wikimedia', label: 'Wikimedia Commons', icon: FileImage },
  { id: 'iconify', label: 'Iconify (Icons)', icon: Box },
];

export default function PngFinderPage() {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [provider, setProvider] = useState('auto');
  const [results, setResults] = useState<PngResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<PngResult | null>(null);
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'glyphs' | 'colorful'>('glyphs');

  const executeSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResults([]);
    setActiveNode(null);

    try {
      const response = await searchPngAction(query, provider);
      if (response.success && response.results.length > 0) {
        setResults(response.results);
        setActiveNode(response.activeNode || null);
        
        // Auto-switch tab based on results if one is empty
        const icons = response.results.filter(r => r.isIcon);
        const colorful = response.results.filter(r => !r.isIcon);
        if (icons.length > 0 && colorful.length === 0) setActiveTab('glyphs');
        else if (colorful.length > 0 && icons.length === 0) setActiveTab('colorful');
        
        toast({ title: "Signal Isolated", description: `Found ${response.results.length} high-fidelity assets.` });
      } else {
        setError(response.error || "No results identified. Try a simpler keyword.");
      }
    } catch (err) {
      setError("Matrix Retrieval Failure: Discovery nodes are restricted.");
    } finally {
      setIsLoading(false);
    }
  };

  const glyphResults = useMemo(() => results.filter(r => r.isIcon), [results]);
  const colorfulResults = useMemo(() => results.filter(r => !r.isIcon), [results]);

  const handleDownload = async (asset: PngResult) => {
    try {
      if (asset.isIcon) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 512;
          canvas.height = 512;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, 512, 512);
            const link = document.createElement('a');
            link.download = `mykit-icon-${asset.id}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            toast({ title: "Icon Synthesized", description: "Exported as 512px PNG." });
          }
        };
        img.src = asset.url;
        return;
      }

      const res = await fetch(asset.url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mykit-asset-${asset.id}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Master Exported" });
    } catch (e) {
      window.open(asset.url, '_blank');
      toast({ title: "CORS Redirect", description: "Direct download blocked. Use 'Save As' in the new tab." });
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(id);
    toast({ title: "Identity Copied" });
    setTimeout(() => setIsCopied(null), 2000);
  };

  const handleReset = () => {
    setQuery('');
    setResults([]);
    setError(null);
    setActiveNode(null);
    toast({ title: "Studio Reset" });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-full">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
            <Search className="w-3.5 h-3.5" /> Identity Suite
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-headline font-black text-foreground uppercase tracking-tighter leading-none">
            PNG <span className="text-primary italic">Finder Studio</span>
          </h1>
          <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
            Professional transparent asset discovery. Isolate high-fidelity PNGs and icons from global open-source registries with 1:1 hardware fidelity.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 pb-2">
           <GetHelp toolId="png-finder" />
           {(results.length > 0 || query) && (
             <Button variant="outline" size="sm" onClick={handleReset} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
             </Button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls Panel */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
              <CardHeader className="py-6 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Settings className="w-5 h-5 text-primary" /> Discovery Node
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-8">
                 <form onSubmit={executeSearch} className="space-y-4">
                    <div className="space-y-3">
                       <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Linguistic Target</Label>
                       <div className="relative group/input">
                          <Input 
                            placeholder="e.g. crown, leaf, fire..." 
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
                             {PROVIDERS.map(p => (
                               <SelectItem key={p.id} value={p.id} className="text-[10px] font-black uppercase">
                                  {p.label}
                               </SelectItem>
                             ))}
                          </SelectContent>
                       </Select>
                    </div>

                    <Button type="submit" disabled={isLoading || !query.trim()} className="w-full h-14 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 text-xs uppercase tracking-widest active:scale-95 transition-all">
                       {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Execute Search'}
                    </Button>
                 </form>

                 {activeNode && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-black text-emerald-600 uppercase">Node: {activeNode} Active</span>
                       </div>
                       <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                 )}

                 <div className="pt-6 border-t border-white/5 space-y-4">
                    <div className="p-6 rounded-[2rem] bg-secondary/50 border border-border flex items-start gap-4">
                       <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                       <div className="space-y-1">
                          <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest">Privacy Sovereign</h4>
                          <p className="text-[9px] text-foreground/40 font-medium leading-relaxed uppercase">Discovery signals are processed locally. Your search history is never logged.</p>
                       </div>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </aside>

        {/* Results Matrix */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           {isLoading && results.length === 0 ? (
             <div className="h-[600px] flex flex-col items-center justify-center gap-8">
                <div className="relative">
                   <div className="w-24 h-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                   <Globe className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />
                </div>
                <p className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">Decoding Global Visual Nodes...</p>
             </div>
           ) : error ? (
             <Card className="glass-card border-destructive/20 bg-destructive/5 p-12 text-center flex flex-col items-center gap-6 animate-in shake">
                <AlertCircle className="w-16 h-16 text-destructive animate-bounce" />
                <div className="space-y-2">
                   <h3 className="text-xl font-headline font-black text-destructive uppercase">Discovery Failure</h3>
                   <p className="text-sm text-foreground/40 font-bold uppercase">{error}</p>
                </div>
                <Button onClick={() => executeSearch()} variant="outline" className="h-12 bg-secondary border border-border text-foreground font-black rounded-xl text-[9px] uppercase tracking-widest">Retry Protocol</Button>
             </Card>
           ) : results.length > 0 ? (
             <div className="space-y-12">
                <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
                  <TabsList className="bg-secondary/50 p-1 rounded-2xl h-14 border border-white/5 mb-10 w-fit">
                    <TabsTrigger value="glyphs" className="rounded-xl px-8 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                       <Shapes className="w-3.5 h-3.5 mr-2" /> Glyphs & Icons
                    </TabsTrigger>
                    <TabsTrigger value="colorful" className="rounded-xl px-8 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                       <Palette className="w-3.5 h-3.5 mr-2" /> Colorful PNGs
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="glyphs" className="m-0 focus-visible:ring-0">
                    {glyphResults.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {glyphResults.map((img) => (
                          <div 
                            key={img.id} 
                            onClick={() => setSelectedAsset(img)}
                            className="group/card relative aspect-square rounded-[2rem] overflow-hidden border border-white/5 bg-secondary/30 cursor-pointer shadow-2xl hover:border-primary/40 transition-all duration-500"
                          >
                            <div className="absolute inset-0 bg-checkered-light opacity-50" />
                            <img src={img.previewUrl} alt={img.title} className="relative z-10 w-full h-full object-contain p-6 group-hover/card:scale-110 transition-transform duration-700" />
                            
                            <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                                <p className="text-[9px] font-bold text-white uppercase truncate mb-3">{img.title}</p>
                                <div className="flex gap-2">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleDownload(img); }} 
                                    className="h-8 w-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                  <div className="h-8 px-2 rounded-lg bg-white/10 backdrop-blur-md text-white text-[7px] font-black uppercase flex items-center justify-center flex-1 border border-white/10">View Matrix</div>
                                </div>
                            </div>
                            
                            <div className="absolute top-3 left-3 z-30">
                                <Badge className="bg-black/60 backdrop-blur-md border-white/10 text-[6px] font-black uppercase tracking-widest text-white/40">
                                  {img.source}
                                </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-20 text-center opacity-10">
                        <Shapes className="w-16 h-16 mx-auto mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No glyphs identified for this query.</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="colorful" className="m-0 focus-visible:ring-0">
                    {colorfulResults.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {colorfulResults.map((img) => (
                          <div 
                            key={img.id} 
                            onClick={() => setSelectedAsset(img)}
                            className="group/card relative aspect-square rounded-[2rem] overflow-hidden border border-white/5 bg-secondary/30 cursor-pointer shadow-2xl hover:border-primary/40 transition-all duration-500"
                          >
                            <div className="absolute inset-0 bg-checkered opacity-50" />
                            <img src={img.previewUrl} alt={img.title} className="relative z-10 w-full h-full object-contain p-4 group-hover/card:scale-110 transition-transform duration-700" />
                            
                            <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                                <p className="text-[9px] font-bold text-white uppercase truncate mb-3">{img.title}</p>
                                <div className="flex gap-2">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleDownload(img); }} 
                                    className="h-8 w-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                  <div className="h-8 px-2 rounded-lg bg-white/10 backdrop-blur-md text-white text-[7px] font-black uppercase flex items-center justify-center flex-1 border border-white/10">View Matrix</div>
                                </div>
                            </div>
                            
                            <div className="absolute top-3 left-3 z-30">
                                <Badge className="bg-black/60 backdrop-blur-md border-white/10 text-[6px] font-black uppercase tracking-widest text-white/40">
                                  {img.source}
                                </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-20 text-center opacity-10">
                        <Palette className="w-16 h-16 mx-auto mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No colorful PNGs identified for this query.</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
             </div>
           ) : (
             <Card className="glass-card border-border shadow-2xl h-[600px] flex flex-col items-center justify-center text-center p-12 border-dashed bg-black/10">
                <div className="w-20 h-20 rounded-[2.5rem] bg-secondary flex items-center justify-center text-foreground/10 mb-6">
                  <ImagePlus className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-headline font-black text-foreground/40 uppercase tracking-widest">Awaiting Identity Signal</h3>
                <p className="text-sm text-foreground/20 font-medium max-w-xs mt-4 uppercase tracking-tighter">
                  Enter a keyword to isolate transparent visual identifiers from global registries.
                </p>
             </Card>
           )}
        </div>
      </div>

      {/* Visual Master Viewport */}
      <Dialog open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
        <DialogContent className="glass-card max-w-4xl w-[calc(100%-32px)] border-white/10 p-0 overflow-hidden outline-none flex flex-col max-h-[90vh]">
          {selectedAsset && (
            <>
              <div className="flex-1 overflow-hidden relative bg-[#060608] flex items-center justify-center p-12">
                 <div className="absolute inset-0 bg-checkered opacity-30" />
                 <img src={selectedAsset.url} alt="" className="relative z-10 max-w-full max-h-full object-contain shadow-2xl" />
                 <button onClick={() => setSelectedAsset(null)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-primary transition-all border border-white/10 z-50">
                    <X className="w-5 h-5" />
                 </button>
              </div>
              <div className="p-8 bg-secondary/30 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-8 shrink-0">
                 <div className="space-y-2 min-w-0">
                    <DialogTitle className="text-2xl font-headline font-black text-foreground uppercase tracking-tight truncate max-w-md">{selectedAsset.title}</DialogTitle>
                    <div className="flex flex-wrap items-center gap-4">
                       <p className="text-[9px] font-black text-primary uppercase tracking-[0.4em]">{selectedAsset.source} Node Active</p>
                       <span className="text-white/10">•</span>
                       <p className="text-[9px] font-bold text-foreground/40 uppercase truncate">License: {selectedAsset.license || 'Open Registry'}</p>
                    </div>
                 </div>
                 <div className="flex gap-3 w-full sm:w-auto">
                    <Button onClick={() => handleDownload(selectedAsset)} className="h-16 px-10 bg-primary text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all flex-1">
                       <Download className="w-5 h-5 mr-3" /> Download PNG
                    </Button>
                    <Button onClick={() => handleCopy(selectedAsset.url, 'asset-url')} variant="outline" className="h-16 px-6 border-white/10 bg-white/5 text-white font-black uppercase text-[10px] rounded-2xl">
                       {isCopied === 'asset-url' ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </Button>
                 </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
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
        .bg-checkered-light {
          background-image: linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                            linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                            linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
          background-size: 20px 20px;
        }
        .dark .bg-checkered-light {
          background-image: linear-gradient(45deg, #2a2a2c 25%, transparent 25%), 
                            linear-gradient(-45deg, #2a2a2c 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #2a2a2c 75%), 
                            linear-gradient(-45deg, transparent 75%, #2a2a2c 75%);
        }
      `}</style>
    </div>
  );
}
