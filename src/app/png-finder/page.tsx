"use client"

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  GripVertical,
  Plus,
  ArrowRight,
  History,
  Star,
  LayoutGrid,
  Filter,
  Maximize,
  ZoomIn,
  Eye,
  Settings2,
  Trash2,
  ChevronDown,
  Info
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
import { searchPngAction, getSuggestionsAction, PngResult } from './actions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';

const PROVIDERS = [
  { id: 'auto', label: 'Auto (Best Signal)', icon: Sparkles },
  { id: 'openverse', label: 'Openverse PNG', icon: Globe },
  { id: 'wikimedia', label: 'Wikimedia Commons', icon: FileImage },
  { id: 'iconify', label: 'Iconify (Icons)', icon: Box },
];

const COLOR_CHIPS = [
  { id: 'red', color: '#ef4444' },
  { id: 'blue', color: '#3b82f6' },
  { id: 'green', color: '#22c55e' },
  { id: 'yellow', color: '#eab308' },
  { id: 'purple', color: '#a855f7' },
  { id: 'orange', color: '#f97316' },
  { id: 'white', color: '#ffffff' },
  { id: 'black', color: '#000000' },
];

export default function PngFinderPage() {
  const { toast } = useToast();
  
  // Search State
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [provider, setProvider] = useState('auto');
  const [results, setResults] = useState<PngResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAppending, setIsAppending] = useState(false);
  const [page, setPage] = useState(1);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Advanced Filters
  const [activeCategory, setActiveCategory] = useState<'glyphs' | 'colorful' | 'all'>('glyphs');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [sizeFilter, setSizeFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('relevant');
  
  // Local Persistence
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<PngResult[]>([]);
  
  // UI State
  const [selectedAsset, setSelectedAsset] = useState<PngResult | null>(null);
  const [previewZoom, setPreviewZoom] = useState(100);
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  // --- Initialization ---
  useEffect(() => {
    const savedFavs = localStorage.getItem('mykit_png_favs');
    const savedRecent = localStorage.getItem('mykit_png_recent');
    if (savedFavs) try { setFavorites(JSON.parse(savedFavs)); } catch (e) {}
    if (savedRecent) try { setRecentSearches(JSON.parse(savedRecent)); } catch (e) {}
  }, []);

  useEffect(() => {
    localStorage.setItem('mykit_png_favs', JSON.stringify(favorites));
    localStorage.setItem('mykit_png_recent', JSON.stringify(recentSearches));
  }, [favorites, recentSearches]);

  // --- Click Outside ---
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // --- Suggestions Engine ---
  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      const sug = await getSuggestionsAction(query);
      setSuggestions(sug);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const executeSearch = async (pageNum: number = 1, append = false) => {
    if (!query.trim()) return;
    
    if (append) setIsAppending(true);
    else setIsLoading(true);
    
    setError(null);
    if (!append) setResults([]);
    setPage(pageNum);

    try {
      const options = {
        page: pageNum,
        color: selectedColor,
        size: sizeFilter,
        sort: sortOrder
      };
      
      const response = await searchPngAction(query, provider, options);
      if (response.success && response.results.length > 0) {
        setResults(prev => append ? [...prev, ...response.results] : response.results);
        setActiveNode(response.activeNode || null);
        
        if (!append) {
          setRecentSearches(prev => [query, ...prev.filter(s => s !== query)].slice(0, 5));
        }
      } else {
        if (!append) setError(response.error || "No results identified for this matrix.");
      }
    } catch (err) {
      setError("Matrix Retrieval Failure: Discovery nodes are restricted.");
    } finally {
      setIsLoading(false);
      setIsAppending(false);
      setShowSuggestions(false);
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
          canvas.width = 1024;
          canvas.height = 1024;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, 1024, 1024);
            const link = document.createElement('a');
            link.download = `mykit-icon-${asset.id}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            toast({ title: "Icon Synthesized", description: "Exported as 1024px PNG." });
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

  const toggleFavorite = (asset: PngResult) => {
    const isFav = favorites.some(f => f.id === asset.id);
    if (isFav) setFavorites(prev => prev.filter(f => f.id !== asset.id));
    else setFavorites(prev => [asset, ...prev]);
    toast({ title: isFav ? "Removed from Favorites" : "Saved to Shortlist" });
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(id);
    toast({ title: "Identity Copied" });
    setTimeout(() => setIsCopied(null), 2000);
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-full overflow-hidden">
      <div className="mb-10 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
            <Search className="w-3.5 h-3.5" /> Identity Suite PRO
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-headline font-black text-foreground uppercase tracking-tighter leading-[0.9]">
            PNG <span className="text-primary italic">Finder Studio</span>
          </h1>
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
        {/* Controls Column */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
           
           {/* Search Box */}
           <Card className="glass-card border-border shadow-2xl overflow-visible relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
              <CardHeader className="py-6 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Settings2 className="w-4 h-4 text-primary" /> Discovery Node
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-8 relative">
                 <form onSubmit={executeSearch} className="space-y-4" ref={searchRef}>
                    <div className="space-y-3 relative">
                       <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Linguistic Target</Label>
                       <div className="relative group/input">
                          <Input 
                            placeholder="e.g. dragon, fire icon, leaf..." 
                            value={query}
                            onFocus={() => setShowSuggestions(true)}
                            onChange={e => setQuery(e.target.value)}
                            className="h-16 bg-secondary border-border rounded-2xl text-sm font-bold px-6 focus:ring-primary/40 uppercase"
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/input:opacity-100 transition-opacity">
                             <Zap className="w-5 h-5 text-primary" />
                          </div>

                          {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute left-0 right-0 top-full mt-2 z-50 animate-in slide-in-from-top-2 duration-300">
                               <div className="glass-card border-border shadow-2xl rounded-2xl overflow-hidden divide-y divide-white/5">
                                  {suggestions.map((s, i) => (
                                    <button 
                                      key={i} 
                                      type="button"
                                      onClick={() => { setQuery(s); executeSearch(1); }}
                                      className="w-full p-4 flex items-center justify-between hover:bg-primary/5 transition-all text-left group/sug"
                                    >
                                       <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60 group-hover/sug:text-primary">{s}</span>
                                       <ArrowRight className="w-3 h-3 text-foreground/10 group-hover/sug:translate-x-1 transition-all" />
                                    </button>
                                  ))}
                               </div>
                            </div>
                          )}
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

                 {recentSearches.length > 0 && (
                   <div className="space-y-3 pt-4 border-t border-white/5">
                      <Label className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">Recent Matrix HITS</Label>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map(s => (
                          <Badge 
                            key={s} 
                            onClick={() => { setQuery(s); executeSearch(1); }}
                            variant="outline" 
                            className="bg-secondary/50 border-white/5 text-[8px] font-black uppercase py-1 px-3 cursor-pointer hover:bg-primary/10 hover:text-primary transition-all"
                          >
                            {s}
                          </Badge>
                        ))}
                      </div>
                   </div>
                 )}
              </CardContent>
           </Card>

           {/* Filter Card */}
           <Card className="glass-card border-border shadow-xl">
              <CardHeader className="py-6 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Filter className="w-4 h-4 text-primary" /> Filter Matrix
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-10">
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Chromatic Filter</Label>
                    <div className="grid grid-cols-4 gap-3">
                       {COLOR_CHIPS.map(c => (
                         <button
                           key={c.id}
                           onClick={() => setSelectedColor(selectedColor === c.id ? null : c.id)}
                           className={cn(
                             "w-full aspect-square rounded-xl border-2 transition-all flex items-center justify-center relative group",
                             selectedColor === c.id ? "border-primary scale-110 shadow-lg" : "border-white/5"
                           )}
                           style={{ backgroundColor: c.color }}
                         >
                            {selectedColor === c.id && <CheckCircle2 className="w-5 h-5 text-background" />}
                            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity rounded-xl" />
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Resolution Scale</Label>
                    <div className="grid grid-cols-3 gap-2">
                       {['all', 'small', 'large'].map(s => (
                         <button
                           key={s}
                           onClick={() => setSizeFilter(s)}
                           className={cn(
                             "h-10 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all",
                             sizeFilter === s ? "bg-primary text-white border-primary shadow-lg" : "bg-secondary/30 border-border text-foreground/40 hover:text-foreground"
                           )}
                         >
                            {s}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="p-6 rounded-[2rem] bg-secondary/50 border border-border flex items-start gap-4">
                    <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div className="space-y-1">
                       <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest leading-none">Privacy Safe</h4>
                       <p className="text-[9px] text-foreground/40 font-medium leading-relaxed uppercase">Discovery signals are volatile and held strictly in local memory.</p>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </aside>

        {/* Results Column */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           
           {/* Favorites Section */}
           {favorites.length > 0 && results.length === 0 && (
             <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-3 px-2">
                   <Star className="w-4 h-4 text-yellow-500 fill-current" />
                   <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-foreground/40">Identity Shortlist</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                   {favorites.map(fav => (
                     <div 
                        key={fav.id} 
                        onClick={() => setSelectedAsset(fav)}
                        className="group/card relative aspect-square rounded-[2rem] overflow-hidden border border-primary/20 bg-primary/[0.03] cursor-pointer shadow-2xl hover:border-primary/40 transition-all duration-500"
                      >
                        <div className="absolute inset-0 bg-checkered opacity-30" />
                        <img src={fav.previewUrl} alt={fav.title} className="relative z-10 w-full h-full object-contain p-4 group-hover/card:scale-110 transition-transform duration-700" />
                        <div className="absolute top-3 right-3 z-30">
                           <button onClick={(e) => { e.stopPropagation(); toggleFavorite(fav); }} className="w-8 h-8 rounded-lg bg-yellow-500 text-white flex items-center justify-center shadow-lg"><Star className="w-4 h-4 fill-current" /></button>
                        </div>
                      </div>
                   ))}
                </div>
             </div>
           )}

           {isLoading && results.length === 0 ? (
             <div className="h-[600px] flex flex-col items-center justify-center gap-8 bg-secondary/5 rounded-[3rem] border border-dashed border-white/5">
                <div className="relative">
                   <div className="w-24 h-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                   <Globe className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />
                </div>
                <div className="text-center space-y-2">
                   <p className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">Decoding Global Visual Nodes...</p>
                   <p className="text-[9px] font-bold text-foreground/20 uppercase tracking-widest">Applying multi-pass security filters</p>
                </div>
             </div>
           ) : results.length > 0 ? (
             <div className="space-y-12">
                <Tabs value={activeCategory} onValueChange={(v: any) => setActiveCategory(v)} className="w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                    <TabsList className="bg-secondary/50 p-1 rounded-2xl h-14 border border-white/5 w-full sm:w-fit">
                      <TabsTrigger value="glyphs" className="flex-1 sm:flex-none rounded-xl px-8 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                         <Shapes className="w-3.5 h-3.5 mr-2" /> Glyphs & Icons
                      </TabsTrigger>
                      <TabsTrigger value="colorful" className="flex-1 sm:flex-none rounded-xl px-8 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                         <Palette className="w-3.5 h-3.5 mr-2" /> Colorful PNGs
                      </TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-3">
                       <span className="text-[10px] font-black uppercase text-foreground/20 tracking-widest">Sort:</span>
                       <Select value={sortOrder} onValueChange={setSortOrder}>
                          <SelectTrigger className="h-10 w-32 bg-secondary border-border text-[9px] font-black uppercase rounded-xl">
                             <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="glass-card">
                             <SelectItem value="relevant" className="text-[9px] font-black uppercase">Relevance</SelectItem>
                             <SelectItem value="newest" className="text-[9px] font-black uppercase">Newest</SelectItem>
                             <SelectItem value="large" className="text-[9px] font-black uppercase">Max Size</SelectItem>
                          </SelectContent>
                       </Select>
                    </div>
                  </div>

                  <TabsContent value="glyphs" className="m-0 focus-visible:ring-0">
                    {glyphResults.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                        {glyphResults.map((img) => (
                          <div 
                            key={img.id} 
                            onClick={() => setSelectedAsset(img)}
                            className="group/card relative aspect-square rounded-[2rem] overflow-hidden border border-white/5 bg-secondary/30 cursor-pointer shadow-2xl hover:border-primary/40 transition-all duration-500"
                          >
                            <div className="absolute inset-0 bg-white opacity-[0.03] group-hover:opacity-[0.08] transition-opacity" />
                            <div className="absolute inset-0 bg-checkered-light opacity-50" />
                            <img src={img.previewUrl} alt={img.title} className="relative z-10 w-full h-full object-contain p-8 group-hover/card:scale-110 transition-transform duration-700" />
                            
                            <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                                <div className="flex items-center justify-between mb-3">
                                   <p className="text-[9px] font-bold text-white uppercase truncate flex-1">{img.title}</p>
                                   <button onClick={(e) => { e.stopPropagation(); toggleFavorite(img); }} className="p-1.5 rounded-lg text-white/40 hover:text-yellow-500">
                                      <Star className={cn("w-3.5 h-3.5", favorites.some(f => f.id === img.id) && "fill-current text-yellow-500")} />
                                   </button>
                                </div>
                                <div className="flex gap-2">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleDownload(img); }} 
                                    className="h-8 w-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                  <div className="h-8 px-2 rounded-lg bg-white/10 backdrop-blur-md text-white text-[7px] font-black uppercase flex items-center justify-center flex-1 border border-white/10">View Master</div>
                                </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-32 text-center opacity-10 space-y-6">
                        <Shapes className="w-24 h-24 mx-auto" />
                        <p className="text-xl font-black uppercase tracking-[0.4em]">Zero Glyph Matches</p>
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
                            className="group/card relative aspect-square rounded-[2.5rem] overflow-hidden border border-white/5 bg-secondary/30 cursor-pointer shadow-2xl hover:border-primary/40 transition-all duration-500"
                          >
                            <div className="absolute inset-0 bg-checkered opacity-50" />
                            <img src={img.previewUrl} alt={img.title} className="relative z-10 w-full h-full object-contain p-4 group-hover/card:scale-110 transition-transform duration-700" />
                            
                            <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                                <div className="flex items-center justify-between mb-4">
                                   <p className="text-[10px] font-bold text-white uppercase truncate flex-1">{img.title}</p>
                                   <button onClick={(e) => { e.stopPropagation(); toggleFavorite(img); }} className="p-1.5 rounded-lg text-white/40 hover:text-yellow-500">
                                      <Star className={cn("w-4 h-4", favorites.some(f => f.id === img.id) && "fill-current text-yellow-500")} />
                                   </button>
                                </div>
                                <div className="flex gap-2">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleDownload(img); }} 
                                    className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                  <div className="h-10 px-3 rounded-xl bg-white/10 backdrop-blur-md text-white text-[8px] font-black uppercase flex items-center justify-center flex-1 border border-white/10 tracking-widest">Master Preview</div>
                                </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-32 text-center opacity-10 space-y-6">
                        <Palette className="w-24 h-24 mx-auto" />
                        <p className="text-xl font-black uppercase tracking-[0.4em]">Zero Chromatic Matches</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                {/* Pagination Node */}
                {results.length > 0 && (
                   <div className="pt-10 flex flex-col items-center gap-8">
                      <Button 
                        onClick={() => executeSearch(page + 1, true)} 
                        disabled={isAppending}
                        className="h-16 px-12 bg-white text-black font-black uppercase tracking-[0.3em] text-[11px] rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all"
                      >
                         {isAppending ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <ChevronDown className="w-5 h-5 mr-3" />}
                         Expand Signal Matrix
                      </Button>
                      <p className="text-[10px] font-black uppercase text-foreground/20 tracking-[0.4em]">Page {page} • Synchronized with global nodes</p>
                   </div>
                )}
             </div>
           ) : (
             <Card className="glass-card border-border shadow-2xl h-[700px] flex flex-col items-center justify-center text-center p-12 border-dashed bg-black/10">
                <div className="absolute inset-0 bg-primary/[0.02] animate-pulse" />
                <div className="w-24 h-24 rounded-[2.5rem] bg-secondary flex items-center justify-center text-foreground/10 mb-8 shadow-inner border border-white/5 relative z-10">
                  <ImagePlus className="w-12 h-12" />
                </div>
                <div className="space-y-4 max-w-sm relative z-10">
                   <h3 className="text-2xl font-headline font-black text-foreground/40 uppercase tracking-widest">Awaiting Discovery Signal</h3>
                   <p className="text-sm text-foreground/20 font-medium leading-relaxed uppercase tracking-tighter">
                     Enter a linguistic identifier to isolate transparent visual identities from the world's most reliable open-source registries.
                   </p>
                </div>
                <div className="mt-12 flex flex-wrap justify-center gap-2 relative z-10">
                   {['leaf', 'logo', 'ribbon', 'shield', 'fire', 'bolt'].map(tag => (
                     <Badge 
                      key={tag} 
                      onClick={() => { setQuery(tag); executeSearch(1); }}
                      variant="outline" 
                      className="cursor-pointer bg-white/5 border-white/10 hover:bg-primary/10 hover:text-primary transition-all text-[8px] font-black uppercase tracking-widest py-1.5 px-4"
                     >
                       {tag}
                     </Badge>
                   ))}
                </div>
             </Card>
           )}
        </div>
      </div>

      {/* High-Fidelity Master Viewport */}
      <Dialog open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
        <DialogContent className="glass-card max-w-6xl w-[calc(100%-32px)] border-white/10 p-0 overflow-hidden outline-none flex flex-col max-h-[90vh]">
          {selectedAsset && (
            <>
              <DialogHeader className="sr-only">
                <DialogTitle>{selectedAsset.title}</DialogTitle>
                <DialogDescription>Full resolution visual master viewport.</DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-hidden relative bg-[#060608] flex items-center justify-center p-6 sm:p-12">
                 <div className="absolute inset-0 bg-checkered opacity-[0.15]" />
                 <div className="relative z-10 max-w-full max-h-full flex items-center justify-center transition-all duration-500" style={{ transform: `scale(${previewZoom/100})` }}>
                    <img src={selectedAsset.url} alt="" className="max-w-full max-h-[60vh] object-contain shadow-2xl drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]" />
                 </div>
                 
                 {/* Zoom Controls */}
                 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/60 backdrop-blur-xl px-6 h-12 rounded-full border border-white/10 z-50">
                    <button onClick={() => setPreviewZoom(z => Math.max(25, z - 25))} className="p-2 text-white/40 hover:text-primary"><Minimize2 className="w-4 h-4" /></button>
                    <span className="text-[10px] font-black font-mono text-white/80 w-12 text-center uppercase tracking-widest">{previewZoom}%</span>
                    <button onClick={() => setPreviewZoom(z => Math.min(400, z + 25))} className="p-2 text-white/40 hover:text-primary"><Maximize2 className="w-4 h-4" /></button>
                 </div>

                 <button onClick={() => setSelectedAsset(null)} className="absolute top-6 right-6 w-12 h-12 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-primary transition-all border border-white/10 z-50">
                    <X className="w-6 h-6" />
                 </button>
              </div>

              <div className="p-8 bg-secondary/30 border-t border-white/5 flex flex-col xl:flex-row items-center justify-between gap-12 shrink-0">
                 <div className="flex flex-col sm:flex-row items-center gap-10 min-w-0 flex-1">
                    <div className="w-24 h-24 rounded-3xl bg-background border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                       <img src={selectedAsset.previewUrl} className="w-full h-full object-contain p-3" alt="" />
                    </div>
                    <div className="text-center sm:text-left space-y-4 min-w-0 flex-1">
                       <div className="space-y-1">
                          <h2 className="text-2xl sm:text-4xl font-headline font-black text-foreground uppercase tracking-tight truncate max-w-xl">{selectedAsset.title}</h2>
                          <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4">
                             <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest">{selectedAsset.source} Registry</Badge>
                             <span className="text-white/10">•</span>
                             <p className="text-[10px] font-bold text-foreground/40 uppercase truncate">By: {selectedAsset.author || 'Registry Native'}</p>
                          </div>
                       </div>
                       <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                          {[
                            { label: 'License', val: selectedAsset.license || 'Open source', icon: ShieldCheck },
                            { label: 'Geometry', val: selectedAsset.width ? `${selectedAsset.width}x${selectedAsset.height}` : 'Vector', icon: LayoutGrid },
                            { label: 'Protocol', val: selectedAsset.url.split('.').pop()?.toUpperCase() || 'PNG', icon: FileImage },
                          ].map((meta, mi) => (
                            <div key={mi} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[8px] font-black uppercase text-foreground/60 tracking-widest">
                               <meta.icon className="w-3 h-3 opacity-30" />
                               {meta.val}
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>

                 <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                    <Button onClick={() => handleDownload(selectedAsset)} className="h-16 px-10 bg-primary text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all flex-1 sm:flex-none">
                       <Download className="w-5 h-5 mr-3" /> Save Master PNG
                    </Button>
                    <div className="flex gap-2">
                       <Button onClick={() => handleCopy(selectedAsset.url, 'asset-url')} variant="outline" className="h-16 px-6 border-white/10 bg-white/5 text-white font-black uppercase text-[10px] rounded-2xl flex-1">
                          {isCopied === 'asset-url' ? <CheckCircle2 className="w-5 h-5 mr-1 text-emerald-500" /> : <Copy className="w-5 h-5 mr-1" />}
                          Copy URL
                       </Button>
                       <Button 
                        onClick={() => toggleFavorite(selectedAsset)}
                        variant="outline" 
                        className={cn(
                          "h-16 w-16 border-white/10 bg-white/5 rounded-2xl transition-all",
                          favorites.some(f => f.id === selectedAsset.id) ? "text-yellow-500 border-yellow-500/20 bg-yellow-500/10" : "text-white/40"
                        )}
                       >
                          <Star className={cn("w-6 h-6", favorites.some(f => f.id === selectedAsset.id) && "fill-current")} />
                       </Button>
                    </div>
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
        .no-scrollbar::-webkit-scrollbar { display: none; }
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
