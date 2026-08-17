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
  const [showBlockedTip, setShowBlockedTip] = useState(false);

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

  const handleDiscovery = async () => {
    if (!url.trim()) return;
    setIsProcessing(true);
    setError(null);
    setFoundImages([]);
    setShowBlockedTip(false);

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

    const isDirectImage = /\.(jpg|jpeg|png|webp|gif|svg|avif)(\?.*)?$/i.test(url) || url.includes('pinimg.com');
    if (isDirectImage) {
      setFoundImages([{ id: 'direct', url: url, label: 'Direct Image', type: 'image' }]);
      setIsProcessing(false);
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
        setShowBlockedTip(true);
        setError("No images could be extracted.");
      }
    } catch (err: any) {
      setShowBlockedTip(true);
      setError("Host restricted discovery protocol.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadSingle = async (asset: ImageAsset) => {
    try {
      const dataUri = await proxyDownloadImage(asset.url);
      const link = document.createElement('a');
      link.href = dataUri;
      const ext = asset.url.split('.').pop()?.split('?')[0] || 'jpg';
      link.download = `mykit-${asset.id}.${ext}`;
      link.click();
    } catch (e) {
      window.open(asset.url, '_blank');
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
          zip.file(`${asset.id}_${i}.jpg`, base64, { base64: true });
        } catch (e) {}
      });
      await Promise.all(downloadPromises);
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `bundle-${Date.now()}.zip`;
      link.click();
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
          Extract high-res images and YouTube thumbnails directly from URLs.
        </p>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">
        {/* Discovery Input */}
        <div className="w-full lg:col-span-4 space-y-8 animate-in fade-in duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <Search className="w-5 h-5 text-primary" /> Discovery
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
              <div className="space-y-4">
                <Input placeholder="Paste URL..." value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleDiscovery()} className="h-14 bg-secondary border-border rounded-2xl text-xs font-mono" />
              </div>
              <div className="flex items-center gap-3 justify-center">
                <Button onClick={handleDiscovery} disabled={isProcessing || !url.trim()} className="h-12 w-fit px-10 bg-primary text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95">
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Download'}
                </Button>
                <Button variant="outline" onClick={() => { setUrl(''); setFoundImages([]); setError(null); }} className="h-12 w-12 rounded-xl border-border bg-secondary text-foreground/40"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Matrix */}
        <div className="w-full lg:col-span-8 space-y-8 animate-in fade-in duration-1000">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[400px]">
            <CardHeader className="py-6 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
              <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" /> Matrix
              </CardTitle>
              {foundImages.length > 1 && (
                <Button onClick={downloadAll} disabled={isZipping} className="h-9 px-4 bg-primary text-white font-black text-[9px] uppercase tracking-widest rounded-lg">
                  {isZipping ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Download ZIP'}
                </Button>
              )}
            </CardHeader>
            <CardContent className="flex-1 p-4 md:p-8">
               {foundImages.length === 0 && !isProcessing ? (
                 <div className="h-full flex flex-col items-center justify-center opacity-10 py-12"><ImageIcon className="w-16 h-16 text-primary" /></div>
               ) : isProcessing && foundImages.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center py-20 gap-4"><Loader2 className="w-10 h-10 text-primary animate-spin" /></div>
               ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto custom-scrollbar p-1">
                    {foundImages.map((asset) => (
                      <ImageResultCard key={asset.id} asset={asset} onDownload={downloadSingle} onFail={handleFailedImage} />
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
