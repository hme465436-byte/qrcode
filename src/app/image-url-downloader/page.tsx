"use client"

import React, { useState, useMemo } from 'react';
import { 
  DownloadCloud, 
  Link as LinkIcon, 
  Trash2, 
  Sparkles, 
  Loader2, 
  Info,
  CheckCircle2,
  FileDown,
  AlertCircle,
  Globe,
  ShieldAlert,
  Zap,
  ExternalLink,
  ImageIcon,
  Search,
  FileArchive,
  Monitor,
  Smartphone,
  Youtube,
  Layers,
  Maximize2,
  Maximize,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import JSZip from 'jszip';

interface ImageAsset {
  id: string;
  url: string;
  label: string;
  res?: string;
  type: 'image' | 'youtube';
}

export default function ImageUrlDownloaderPage() {
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [foundImages, setFoundImages] = useState<ImageAsset[]>([]);
  const [error, setError] = useState<string | null>(null);

  const extractVideoId = (input: string) => {
    const trimmed = input.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
    try {
      const parsed = new URL(trimmed);
      const host = parsed.hostname.replace('www.', '');
      if (host === 'youtube.com') {
        if (parsed.pathname === '/watch') return parsed.searchParams.get('v');
        if (parsed.pathname.startsWith('/embed/') || parsed.pathname.startsWith('/shorts/')) return parsed.pathname.split('/')[2];
      }
      if (host === 'youtu.be') return parsed.pathname.substring(1);
    } catch {}
    return null;
  };

  const handleDiscovery = async () => {
    if (!url.trim()) return;
    setIsProcessing(true);
    setError(null);
    setFoundImages([]);

    const vId = extractVideoId(url);
    if (vId) {
      // YouTube Protocol
      const ytAssets: ImageAsset[] = [
        { id: 'max', url: `https://img.youtube.com/vi/${vId}/maxresdefault.jpg`, label: 'YouTube Max Res', res: '1280x720', type: 'youtube' },
        { id: 'sd', url: `https://img.youtube.com/vi/${vId}/sddefault.jpg`, label: 'YouTube SD', res: '640x480', type: 'youtube' },
        { id: 'hq', url: `https://img.youtube.com/vi/${vId}/hqdefault.jpg`, label: 'YouTube HQ', res: '480x360', type: 'youtube' },
      ];
      setFoundImages(ytAssets);
      toast({ title: "YouTube Matrix Found", description: "Thumbnail layers isolated." });
      setIsProcessing(false);
      return;
    }

    // Direct Image Protocol
    const isDirectImage = /\.(jpg|jpeg|png|webp|gif|svg|avif)(\?.*)?$/i.test(url);
    if (isDirectImage) {
      setFoundImages([{
        id: 'direct',
        url: url,
        label: 'Direct Image Matrix',
        type: 'image'
      }]);
      toast({ title: "Asset Identified", description: "Direct visual link mapped." });
    } else {
      setError("Discovery Limited: Browser security (CORS) prevents scraping generic pages. Please provide a direct link to an image file or a YouTube URL.");
    }
    setIsProcessing(false);
  };

  const downloadSingle = async (asset: ImageAsset) => {
    try {
      const response = await fetch(asset.url);
      const blob = await response.blob();
      const bUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = bUrl;
      const ext = asset.url.split('.').pop()?.split('?')[0] || 'jpg';
      a.download = `mykit-image-${asset.id}.${ext}`;
      a.click();
      URL.revokeObjectURL(bUrl);
    } catch (e) {
      window.open(asset.url, '_blank');
      toast({ title: "CORS protocol alert", description: "Direct download blocked. Image opened in a new tab." });
    }
  };

  const downloadAll = async () => {
    if (foundImages.length === 0) return;
    setIsZipping(true);
    const zip = new JSZip();

    try {
      for (let i = 0; i < foundImages.length; i++) {
        const asset = foundImages[i];
        try {
          const response = await fetch(asset.url);
          if (response.ok) {
            const blob = await response.blob();
            const ext = asset.url.split('.').pop()?.split('?')[0] || 'jpg';
            zip.file(`${asset.id}_${i}.${ext}`, blob);
          }
        } catch {}
      }
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `image-bundle-${Date.now()}.zip`;
      link.click();
      toast({ title: "Archive Exported", description: "ZIP bundle saved successfully." });
    } catch {
      toast({ variant: "destructive", title: "Archive Error", description: "Failed to bundle assets." });
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <DownloadCloud className="w-3.5 h-3.5" /> Media Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Image URL <span className="text-primary italic">Downloader</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
          High-performance visual extraction. Retrieve high-res images and YouTube thumbnails directly from URLs with localized processing and ZIP bundling.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Discovery Input */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <Search className="w-6 h-6" />
                </div>
                Asset discovery
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Discovery URL</Label>
                <div className="relative group/input">
                  <Input 
                    placeholder="Paste image or YouTube URL..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="h-16 bg-secondary border-border rounded-2xl text-lg font-mono font-medium placeholder:text-foreground/20 px-6 pr-14 transition-all focus:ring-primary/40"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/input:opacity-100 transition-opacity">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={handleDiscovery}
                  disabled={isProcessing || !url.trim()}
                  className="flex-1 h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                >
                  {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                  Identify Matrix
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => { setUrl(''); setFoundImages([]); setError(null); }}
                  className="w-16 h-16 rounded-2xl border-border bg-secondary hover:bg-secondary/80 text-foreground/40 hover:text-destructive transition-all active:scale-95"
                >
                  <Trash2 className="w-6 h-6" />
                </Button>
              </div>

              {error && (
                <div className="p-6 rounded-[2rem] bg-destructive/5 border border-destructive/10 flex items-start gap-4 animate-in shake duration-500">
                  <AlertCircle className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
                  <p className="text-[11px] font-bold text-destructive/80 uppercase tracking-widest leading-relaxed">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
            <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">CORS Protocol</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                Direct scraping of web pages is limited by browser security. For best results, use direct image links or supported platform URLs (YouTube).
              </p>
            </div>
          </div>
        </div>

        {/* Results Matrix */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[500px]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
              <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Discovery Matrix
              </CardTitle>
              {foundImages.length > 1 && (
                <Button 
                  onClick={downloadAll}
                  disabled={isZipping}
                  className="h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg"
                >
                  {isZipping ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <FileArchive className="w-3.5 h-3.5 mr-2" />}
                  ZIP Bundle
                </Button>
              )}
            </CardHeader>
            <CardContent className="flex-1 p-8">
               {foundImages.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-center opacity-10 space-y-6 py-20">
                    <ImageIcon className="w-24 h-24 text-primary" />
                    <p className="text-sm font-black uppercase tracking-[0.3em]">Studio Standby</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 animate-in zoom-in duration-500">
                    {foundImages.map((asset) => (
                      <div key={asset.id} className="group relative bg-black rounded-[2.5rem] overflow-hidden border border-border shadow-2xl transition-all hover:border-primary/40">
                         <div className="aspect-video relative flex items-center justify-center overflow-hidden">
                            <img src={asset.url} alt={asset.label} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                               <Maximize2 className="w-8 h-8 text-white/40" />
                            </div>
                         </div>
                         <div className="p-6 bg-secondary/40 flex items-center justify-between gap-4">
                            <div className="min-w-0">
                               <p className="text-[10px] font-black uppercase text-foreground truncate">{asset.label}</p>
                               {asset.res && <p className="text-[9px] font-bold text-primary font-mono mt-1">{asset.res}</p>}
                            </div>
                            <Button 
                              onClick={() => downloadSingle(asset)}
                              size="icon"
                              className="w-10 h-10 rounded-xl bg-primary shadow-lg shrink-0"
                            >
                               <Download className="w-4 h-4" />
                            </Button>
                         </div>
                      </div>
                    ))}
                 </div>
               )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="p-6 rounded-[2.5rem] bg-secondary border border-border flex items-start gap-5 group">
                <Maximize className="w-6 h-6 text-primary mt-1 shrink-0" />
                <div className="space-y-1">
                   <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest">Master Density</h4>
                   <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">We isolate the highest quality layer available in the remote matrix for 1:1 pixel fidelity.</p>
                </div>
             </div>
             <div className="p-6 rounded-[2.5rem] bg-secondary border border-border flex items-start gap-5 group">
                <ShieldCheck className="w-6 h-6 text-primary mt-1 shrink-0" />
                <div className="space-y-1">
                   <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest">Privacy Absolute</h4>
                   <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">All discovery logic executes strictly in your browser session. Hardware identifiers are never transmitted.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
