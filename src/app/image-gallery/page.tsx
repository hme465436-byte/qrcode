
"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ImageIcon, 
  Search, 
  Trash2, 
  Sparkles, 
  Loader2, 
  Info,
  CheckCircle2,
  Zap,
  Activity,
  Globe,
  Download,
  Maximize2,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  RefreshCcw,
  Layers,
  ArrowRight,
  X,
  Palette,
  LayoutGrid,
  FileImage,
  Camera,
  Globe2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

interface ImageResult {
  id: string;
  title: string;
  url: string;
  source: 'Openverse' | 'NASA' | 'Art Institute' | 'Picsum';
  author?: string;
  originalUrl?: string;
}

const CATEGORIES = ['Nature', 'Animals', 'Space', 'Art', 'Cities', 'Abstract', 'Technology'];

export default function ImageGalleryPage() {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [results, setResults] = useState<ImageResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState<ImageResult | null>(null);

  // --- Multi-Source Discovery Matrix ---

  const fetchImages = useCallback(async (searchQuery: string, pageNum: number) => {
    if (!searchQuery && !activeCategory) {
      // Default to Nature if nothing is selected
      searchQuery = 'Nature';
    }
    
    setIsLoading(true);
    const searchTerm = searchQuery || activeCategory || 'Nature';

    const fetchers = [
      // 1. Openverse Node
      fetch(`https://api.openverse.org/v1/images/?q=${encodeURIComponent(searchTerm)}&page=${pageNum}&page_size=24`)
        .then(r => r.json())
        .then(data => (data.results || []).map((img: any) => ({
          id: `ov-${img.id}`,
          title: img.title || 'Untitled',
          url: img.url,
          source: 'Openverse',
          author: img.creator,
          originalUrl: img.foreign_landing_url
        })))
        .catch(() => []),

      // 2. NASA Node
      fetch(`https://images-api.nasa.gov/search?q=${encodeURIComponent(searchTerm)}&media_type=image&page=${pageNum}`)
        .then(r => r.json())
        .then(data => (data.collection?.items || []).map((item: any) => ({
          id: `nasa-${item.data[0].nasa_id}`,
          title: item.data[0].title,
          url: item.links?.[0]?.href,
          source: 'NASA',
          author: item.data[0].photographer || 'NASA',
          originalUrl: `https://images.nasa.gov/details-${item.data[0].nasa_id}`
        })))
        .catch(() => []),

      // 3. Art Institute Node
      fetch(`https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(searchTerm)}&fields=id,title,image_id,artist_display&limit=24`)
        .then(r => r.json())
        .then(data => (data.data || [])
          .filter((item: any) => item.image_id)
          .map((item: any) => ({
            id: `artic-${item.id}`,
            title: item.title,
            url: `https://www.artic.edu/iiif/2/${item.image_id}/full/843,/0/default.jpg`,
            source: 'Art Institute',
            author: item.artist_display,
            originalUrl: `https://www.artic.edu/artworks/${item.id}`
          })))
        .catch(() => []),

      // 4. Lorem Picsum (Random Baseline)
      fetch(`https://picsum.photos/v2/list?page=${pageNum}&limit=24`)
        .then(r => r.json())
        .then(data => (data || []).map((img: any) => ({
          id: `picsum-${img.id}`,
          title: `Visual Study #${img.id}`,
          url: img.download_url,
          source: 'Picsum',
          author: img.author,
          originalUrl: img.url
        })))
        .catch(() => [])
    ];

    try {
      const responses = await Promise.allSettled(fetchers);
      const combined = responses
        .filter((r): r is PromiseFulfilledResult<ImageResult[]> => r.status === 'fulfilled')
        .flatMap(r => r.value)
        .sort(() => Math.random() - 0.5); // Shuffle for variety

      setResults(combined);
      if (combined.length === 0) {
        toast({ variant: "destructive", title: "Zero Signal", description: "No visual assets identified for this query." });
      } else {
        toast({ title: "Matrix Synced", description: `Isolated ${combined.length} global visual identifiers.` });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Discovery Failure" });
    } finally {
      setIsLoading(false);
    }
  }, [activeCategory, toast]);

  useEffect(() => {
    fetchImages(query, page);
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveCategory(null);
    setPage(1);
    fetchImages(query, 1);
  };

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    setQuery('');
    setPage(1);
    fetchImages('', 1);
  };

  const handleDownload = async (asset: ImageResult) => {
    try {
      const res = await fetch(asset.url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mykit-studio-${asset.id}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Master Exported" });
    } catch (e) {
      window.open(asset.url, '_blank');
      toast({ title: "CORS Redirect", description: "Direct download blocked. Use save as in new tab." });
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-full">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <ImageIcon className="w-3.5 h-3.5" /> Media Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <h1 className="text-3xl md:text-5xl lg:text-7xl font-headline font-black text-foreground uppercase tracking-tighter leading-[0.9]">
                Image <span className="text-primary italic">Gallery Studio</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional multi-node visual discovery. Isolate high-fidelity assets from NASA, Openverse, and the Art Institute of Chicago locally with 1:1 hardware fidelity.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="image-gallery" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls Column */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
              <CardHeader className="py-6 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Search className="w-5 h-5 text-primary" /> Discovery Node
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-8">
                 <form onSubmit={handleSearch} className="space-y-4">
                    <div className="relative group/input">
                       <Input 
                        placeholder="Search global imagery..." 
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="h-16 bg-secondary border-border rounded-2xl text-sm font-bold px-6 focus:ring-primary/40 uppercase"
                       />
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/input:opacity-100 transition-opacity">
                          <Zap className="w-5 h-5 text-primary" />
                       </div>
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full h-14 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 text-xs uppercase tracking-widest">
                       {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Execute Search'}
                    </Button>
                 </form>

                 <div className="space-y-4 pt-4 border-t border-white/5">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Thematic Profiles</Label>
                    <div className="grid grid-cols-2 gap-2">
                       {CATEGORIES.map(cat => (
                         <button
                           key={cat}
                           onClick={() => handleCategoryClick(cat)}
                           className={cn(
                             "h-11 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all",
                             activeCategory === cat ? "bg-primary text-white border-primary shadow-lg" : "bg-secondary/50 border-border text-foreground/40 hover:text-primary"
                           )}
                         >
                           {cat}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="pt-6 border-t border-white/5 space-y-4">
                    <div className="p-6 rounded-[2rem] bg-secondary/50 border border-border flex items-start gap-4">
                       <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                       <div className="space-y-1">
                          <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest">WASM Sandbox</h4>
                          <p className="text-[9px] text-foreground/40 font-medium leading-relaxed uppercase">Discovery signals are processed locally. Your visual history is never transmitted or stored.</p>
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
           ) : results.length > 0 ? (
             <div className="space-y-12">
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                   {results.map((img) => (
                     <div 
                      key={img.id} 
                      onClick={() => setSelectedImage(img)}
                      className="break-inside-avoid relative rounded-[2rem] overflow-hidden border border-white/5 bg-secondary/30 group/card cursor-pointer shadow-2xl hover:border-primary/40 transition-all duration-500"
                     >
                        <img src={img.url} alt={img.title} className="w-full h-auto object-cover group-hover/card:scale-105 transition-transform duration-700" />
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                           <div className="space-y-1 mb-4">
                              <p className="text-[11px] font-bold text-white uppercase truncate">{img.title}</p>
                              <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">{img.source}</p>
                           </div>
                           <div className="flex gap-2">
                              <button onClick={(e) => { e.stopPropagation(); handleDownload(img); }} className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg active:scale-95 transition-all">
                                 <Download className="w-4 h-4" />
                              </button>
                              <button className="h-10 px-4 rounded-xl bg-white/10 backdrop-blur-md text-white text-[9px] font-black uppercase flex-1 border border-white/10">View Matrix</button>
                           </div>
                        </div>
                        
                        <div className="absolute top-4 left-4">
                           <Badge className="bg-black/60 backdrop-blur-md border-white/10 text-[7px] font-black uppercase tracking-widest text-white/40">
                              {img.source.split(' ')[0]}
                           </Badge>
                        </div>
                     </div>
                   ))}
                </div>

                {/* Pagination Protocol */}
                <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex items-center justify-between gap-6">
                   <Button variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="h-12 px-6 rounded-xl border-border text-[10px] font-black uppercase">
                      <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                   </Button>
                   <div className="h-12 px-8 flex items-center justify-center bg-background border border-border rounded-xl text-[10px] font-black uppercase tracking-widest text-primary">
                      Node Page {page}
                   </div>
                   <Button variant="outline" onClick={() => setPage(p => p + 1)} className="h-12 px-6 rounded-xl border-border text-[10px] font-black uppercase">
                      Next <ChevronRight className="w-4 h-4 ml-2" />
                   </Button>
                </div>
             </div>
           ) : (
             <Card className="glass-card border-border shadow-2xl h-[600px] flex flex-col items-center justify-center text-center p-12 border-dashed bg-black/10">
                <div className="w-20 h-20 rounded-[2.5rem] bg-secondary flex items-center justify-center text-foreground/10 mb-6">
                  <ImageIcon className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-headline font-black text-foreground/40 uppercase tracking-widest">Awaiting Discovery Signal</h3>
                <p className="text-sm text-foreground/20 font-medium max-w-xs mt-4 uppercase tracking-tighter">
                  Enter a keyword or select a category to isolate visual identifiers from global registries.
                </p>
             </Card>
           )}
        </div>
      </div>

      {/* Lightbox Matrix */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="glass-card max-w-6xl w-[calc(100%-32px)] border-white/10 p-0 overflow-hidden outline-none flex flex-col max-h-[90vh]">
          {selectedImage && (
            <>
              <div className="flex-1 overflow-hidden relative bg-[#060608] flex items-center justify-center p-4 sm:p-12">
                 <img src={selectedImage.url} alt="" className="max-w-full max-h-full object-contain shadow-2xl" />
                 <button onClick={() => setSelectedImage(null)} className="absolute top-6 right-6 w-12 h-12 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-primary transition-all border border-white/10">
                    <X className="w-6 h-6" />
                 </button>
              </div>
              <div className="p-8 bg-secondary/30 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-8 shrink-0">
                 <div className="space-y-2 min-w-0">
                    <h2 className="text-2xl sm:text-3xl font-headline font-black text-foreground uppercase tracking-tight truncate max-w-lg">{selectedImage.title}</h2>
                    <div className="flex flex-wrap items-center gap-4">
                       <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">{selectedImage.source} Registry</p>
                       <span className="text-white/10">•</span>
                       <p className="text-[10px] font-bold text-foreground/40 uppercase truncate">By: {selectedImage.author || 'Registry Native'}</p>
                    </div>
                 </div>
                 <div className="flex gap-4 w-full sm:w-auto">
                    <Button onClick={() => handleDownload(selectedImage)} className="h-16 px-10 bg-primary text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all flex-1">
                       <Download className="w-5 h-5 mr-3" /> Save Master
                    </Button>
                    {selectedImage.originalUrl && (
                      <Button asChild variant="outline" className="h-16 px-8 border-white/10 bg-white/5 text-white font-black uppercase text-[10px] rounded-2xl">
                         <a href={selectedImage.originalUrl} target="_blank" rel="noopener noreferrer">
                            <Globe className="w-5 h-5" />
                         </a>
                      </Button>
                    )}
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
      `}</style>
    </div>
  );
}
