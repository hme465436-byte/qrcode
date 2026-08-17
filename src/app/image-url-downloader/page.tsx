"use client"

import React, { useState, useEffect } from 'react';
import { 
  DownloadCloud, 
  Download,
  Link as LinkIcon, 
  Trash2, 
  Sparkles, 
  Loader2, 
  Info,
  CheckCircle2,
  AlertCircle,
  Globe,
  Zap,
  ImageIcon,
  Search,
  FileArchive,
  Youtube,
  Maximize2,
  ShieldCheck,
  MousePointer2,
  ArrowRight,
  X,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import JSZip from 'jszip';
import { extractWebImages, proxyDownloadImage } from '@/ai/flows/web-image-extractor-flow';

interface ImageAsset {
  id: string;
  url: string;
  label: string;
  res?: string;
  type: 'image' | 'youtube' | 'web';
}

function ImageResultCard({ 
  asset, 
  onDownload, 
  onFail 
}: { 
  asset: ImageAsset; 
  onDownload: (asset: ImageAsset) => void;
  onFail: (id: string) => void;
}) {
  const [src, setSrc] = useState(asset.url);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFailed, setHasFailed] = useState(false);
  const [isProxying, setIsProxying] = useState(false);

  const handleImageError = async () => {
    if (!isProxying) {
      setIsProxying(true);
      try {
        const dataUri = await proxyDownloadImage(asset.url);
        setSrc(dataUri);
        setIsLoading(false);
      } catch (e) {
        setHasFailed(true);
        onFail(asset.id);
      }
    } else {
      setHasFailed(true);
      onFail(asset.id);
    }
  };

  if (hasFailed) return null;

  return (
    <div className="group relative bg-black rounded-[2.5rem] overflow-hidden border border-border shadow-2xl transition-all hover:border-primary/40 animate-in zoom-in duration-300">
      <div className="aspect-video relative flex items-center justify-center overflow-hidden bg-secondary/10">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/20">
            <Loader2 className="w-6 h-6 text-primary/40 animate-spin" />
          </div>
        )}
        <img 
          src={src} 
          alt={asset.label} 
          className={cn(
            "w-full h-full object-contain group-hover:scale-110 transition-transform duration-700",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          onLoad={() => setIsLoading(false)}
          onError={handleImageError}
        />
      </div>
      <div className="p-4 bg-secondary/40 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase text-foreground truncate">{asset.label}</p>
        </div>
        <Button onClick={() => onDownload(asset)} size="icon" className="w-8 h-8 rounded-lg bg-primary shrink-0">
          <Download className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
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
    } catch { }
    return null;
  };

  const downloadSingle = async (asset: ImageAsset) => {
    setIsProcessing(true);
    try {
      const dataUri = await proxyDownloadImage(asset.url);
      const link = document.createElement('a');
      link.href = dataUri;
      
      // Better extension identification
      let ext = 'jpg';
      const cleanPath = asset.url.split('?')[0].split('#')[0];
      const parts = cleanPath.split('.');
      if (parts.length > 1) {
        const pExt = parts.pop()?.toLowerCase();
        if (pExt && ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'avif'].includes(pExt)) {
          ext = pExt;
        }
      }
      
      link.download = `mykit-image-${Date.now()}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({ title: "Extraction Success", description: "Image saved to device." });
    } catch (e) {
      // Hardware level fallback to direct browser handling
      window.open(asset.url, '_blank');
      toast({ title: "CORS Redirect", description: "Direct save restricted. Opened in tab." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDiscovery = async () => {
    if (!url.trim()) return;
    setIsProcessing(true);
    setError(null);
    setFoundImages([]);

    const vId = extractVideoId(url);
    if (vId) {
      const ytAssets: ImageAsset[] = [
        { id: `yt-${vId}-max`, url: `https://img.youtube.com/vi/${vId}/maxresdefault.jpg`, label: 'YouTube Max', type: 'youtube' },
        { id: `yt-${vId}-sd`, url: `https://img.youtube.com/vi/${vId}/sddefault.jpg`, label: 'YouTube SD', type: 'youtube' },
      ];
      setFoundImages(ytAssets);
      setIsProcessing(false);
      return;
    }

    const isDirectImage = /\.(jpg|jpeg|png|webp|gif|svg|avif)(\?.*)?$/i.test(url) || 
                          url.includes('pinimg.com') || 
                          url.includes('unsplash.com/photo-');

    if (isDirectImage) {
      const asset: ImageAsset = { id: 'direct', url: url, label: 'Direct Image', type: 'image' };
      setFoundImages([asset]);
      // Perform immediate production trigger for direct links
      await downloadSingle(asset);
      return;
    }

    try {
      const result = await extractWebImages(url);
      if (result.images && result.images.length > 0) {
        const assets: ImageAsset[] = result.images.map((img, i) => ({
          id: `web-${i}`,
          url: img.url,
          label: img.label || 'Web Asset',
          type: 'web'
        }));
        setFoundImages(assets);
      } else {
        setError("No images could be extracted. Please use a direct image URL.");
      }
    } catch (err: any) {
      setError("Host restricted discovery protocol.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadAll = async () => {
    if (foundImages.length === 0) return;
    setIsZipping(true);
    const zip = new JSZip();
    try {
      const downloadPromises = foundImages.map(async (asset, i) => {
        try {
          const dataUri = await proxyDownloadImage(asset.url);
          const base64 = dataUri.split(',')[1];
          // Determine extension for ZIP member
          let ext = 'jpg';
          const cp = asset.url.split('?')[0];
          const parts = cp.split('.');
          if(parts.length > 1) {
            const e = parts.pop()?.toLowerCase();
            if (e && e.length < 5) ext = e;
          }
          zip.file(`image_${i}.${ext}`, base64, { base64: true });
        } catch (e) {}
      });
      await Promise.all(downloadPromises);
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `mykit-bundle-${Date.now()}.zip`;
      link.click();
      toast({ title: "Bundle Exported", description: "ZIP archive saved to device." });
    } finally {
      setIsZipping(false);
    }
  };

  const handleFailedImage = (id: string) => { setFoundImages(prev => prev.filter(img => img.id !== id)); };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-10 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <DownloadCloud className="w-3.5 h-3.5" /> Media Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Image URL <span className="text-primary italic">Downloader</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
          Professional browser-side image extraction. Paste a direct link, Unsplash, Pinterest, or YouTube URL to save high-res assets locally.
        </p>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">
        {/* Discovery Input */}
        <div className="w-full lg:col-span-4 space-y-8 animate-in fade-in duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <Search className="w-6 h-6" />
                </div>
                Asset Discovery
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Inbound URL</Label>
                <div className="relative group/input">
                  <Input 
                    placeholder="Paste direct link or webpage..." 
                    value={url} 
                    onChange={(e) => setUrl(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && handleDiscovery()} 
                    className="h-16 bg-secondary border-border rounded-2xl text-xs font-mono px-6 focus:ring-primary/40" 
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/input:opacity-100 transition-opacity">
                    <Globe className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <p className="text-[9px] text-foreground/20 font-bold uppercase tracking-widest leading-relaxed flex items-center gap-2">
                  <Info className="w-3.5 h-3.5" /> High-res extraction enabled.
                </p>
              </div>

              <div className="flex items-center gap-3 justify-center">
                <Button 
                  onClick={handleDiscovery} 
                  disabled={isProcessing || !url.trim()} 
                  className="h-14 flex-1 bg-primary text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95"
                >
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Download Asset'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => { setUrl(''); setFoundImages([]); setError(null); }} 
                  className="h-14 w-14 rounded-2xl border-border bg-secondary text-foreground/40 hover:text-destructive"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/10 flex items-start gap-3 animate-in shake">
                  <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-[10px] font-bold text-destructive uppercase leading-relaxed">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
            <ShieldCheck className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-1">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Privacy Protocol</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                Extraction occurs via clinical proxy. Your local identity is never revealed to the host server.
              </p>
            </div>
          </div>
        </div>

        {/* Results Matrix */}
        <div className="w-full lg:col-span-8 space-y-8 animate-in fade-in duration-1000">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[500px]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Zap className="w-5 h-5" />
                </div>
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">
                  Discovered Matrix
                </CardTitle>
              </div>
              {foundImages.length > 1 && (
                <Button 
                  onClick={downloadAll} 
                  disabled={isZipping} 
                  className="h-10 px-6 bg-primary text-white font-black text-[9px] uppercase tracking-widest rounded-xl shadow-lg"
                >
                  {isZipping ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileArchive className="w-4 h-4 mr-2" />}
                  Download Bundle ZIP
                </Button>
              )}
            </CardHeader>
            <CardContent className="flex-1 p-4 md:p-10 bg-black/5 dark:bg-black/40">
               {foundImages.length === 0 && !isProcessing ? (
                 <div className="h-full flex flex-col items-center justify-center opacity-10 py-32 space-y-4">
                    <ImageIcon className="w-20 h-20 text-primary" />
                    <p className="text-xs font-black uppercase tracking-[0.3em]">Awaiting Inbound Signal</p>
                 </div>
               ) : isProcessing && foundImages.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center py-32 gap-6">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                      <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Executing Proxy Handshake...</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar p-1">
                    {foundImages.map((asset) => (
                      <ImageResultCard 
                        key={asset.id} 
                        asset={asset} 
                        onDownload={downloadSingle} 
                        onFail={handleFailedImage} 
                      />
                    ))}
                 </div>
               )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
