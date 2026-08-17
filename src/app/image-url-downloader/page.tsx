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

/**
 * Individual Image Result Card
 * Handles localized loading, proxy fallbacks for previews, and single downloads
 */
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
    // If we haven't tried proxying yet, attempt to fetch through the server
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
        {!isLoading && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
            <Maximize2 className="w-8 h-8 text-white/40" />
          </div>
        )}
      </div>
      <div className="p-6 bg-secondary/40 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase text-foreground truncate">{asset.label}</p>
          {asset.res && <p className="text-[9px] font-bold text-primary font-mono mt-1">{asset.res}</p>}
        </div>
        <Button 
          onClick={() => onDownload(asset)}
          size="icon"
          className="w-10 h-10 rounded-xl bg-primary shadow-lg shrink-0"
        >
          <Download className="w-4 h-4" />
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

    // 1. YouTube Identification
    const vId = extractVideoId(url);
    if (vId) {
      const ytAssets: ImageAsset[] = [
        { id: `yt-${vId}-max`, url: `https://img.youtube.com/vi/${vId}/maxresdefault.jpg`, label: 'YouTube Max Res', res: '1280x720', type: 'youtube' },
        { id: `yt-${vId}-sd`, url: `https://img.youtube.com/vi/${vId}/sddefault.jpg`, label: 'YouTube SD', res: '640x480', type: 'youtube' },
        { id: `yt-${vId}-hq`, url: `https://img.youtube.com/vi/${vId}/hqdefault.jpg`, label: 'YouTube HQ', res: '480x360', type: 'youtube' },
      ];
      setFoundImages(ytAssets);
      toast({ title: "YouTube Matrix Found", description: "Thumbnail layers isolated." });
      setIsProcessing(false);
      return;
    }

    // 2. Direct Image Link Identification (Better support for Pinterest CDN/Directs)
    const isDirectImage = /\.(jpg|jpeg|png|webp|gif|svg|avif)(\?.*)?$/i.test(url) || url.includes('pinimg.com');
    if (isDirectImage) {
      setFoundImages([{
        id: 'direct',
        url: url,
        label: 'Direct Visual Matrix',
        type: 'image'
      }]);
      toast({ title: "Asset Identified", description: "Direct visual link mapped." });
      setIsProcessing(false);
      return;
    }

    // 3. Webpage Scrape Protocol
    try {
      toast({ title: "Scanning Webpage", description: "Identifying visual matrices via proxy..." });
      const result = await extractWebImages(url);
      
      if (result.images && result.images.length > 0) {
        const assets: ImageAsset[] = result.images.map((img, i) => ({
          id: `web-${i}`,
          url: img.url,
          label: img.label || 'Web Asset',
          type: 'web'
        }));
        setFoundImages(assets);
        toast({ title: "Discovery Complete", description: `Isolated ${assets.length} potential assets.` });
      } else {
        // If scrape returned zero images, likely blocked by platform (Pinterest/IG)
        setShowBlockedTip(true);
        setError("No images could be extracted from this page link.");
      }
    } catch (err: any) {
      setShowBlockedTip(true);
      setError("The remote host restricted our automated discovery protocol.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadSingle = async (asset: ImageAsset) => {
    try {
      toast({ title: "Negotiating Stream", description: "Synthesizing binary blob..." });
      const dataUri = await proxyDownloadImage(asset.url);
      const link = document.createElement('a');
      link.href = dataUri;
      const ext = asset.url.split('.').pop()?.split('?')[0] || 'jpg';
      link.download = `mykit-${asset.id}.${ext}`;
      link.click();
      toast({ title: "Production Success", description: "Asset pushed to local storage." });
    } catch (e) {
      window.open(asset.url, '_blank');
      toast({ title: "Manual Extraction", description: "Direct download blocked. Opening image in a new tab." });
    }
  };

  const downloadAll = async () => {
    if (foundImages.length === 0) return;
    setIsZipping(true);
    const zip = new JSZip();

    try {
      toast({ title: "Synthesizing Bundle", description: "Packaging binary matrix into ZIP..." });
      
      const downloadPromises = foundImages.map(async (asset, i) => {
        try {
          const dataUri = await proxyDownloadImage(asset.url);
          const base64 = dataUri.split(',')[1];
          const type = dataUri.split(',')[0].split(':')[1].split(';')[0];
          const byteChars = atob(base64);
          const byteNumbers = new Array(byteChars.length);
          for (let j = 0; j < byteChars.length; j++) byteNumbers[j] = byteChars.charCodeAt(j);
          const blob = new Blob([new Uint8Array(byteNumbers)], { type });
          
          const ext = asset.url.split('.').pop()?.split('?')[0] || 'jpg';
          zip.file(`${asset.id}_${i}.${ext}`, blob);
        } catch (e) {
          console.warn(`Skipped failed asset: ${asset.url}`);
        }
      });

      await Promise.all(downloadPromises);

      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `image-bundle-${Date.now()}.zip`;
      link.click();
      toast({ title: "Archive Exported", description: "Production bundle saved successfully." });
    } catch {
      toast({ variant: "destructive", title: "Archive Error", description: "Failed to bundle assets." });
    } finally {
      setIsZipping(false);
    }
  };

  const handleFailedImage = (id: string) => {
    setFoundImages(prev => prev.filter(img => img.id !== id));
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
          High-performance visual extraction. Retrieve high-res images and YouTube thumbnails directly from URLs with server-side discovery and proxy-bypass protocols.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Discovery Input */}
        <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
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
                    placeholder="Paste image address or page URL..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleDiscovery()}
                    className="h-16 bg-secondary border-border rounded-2xl text-lg font-mono font-medium placeholder:text-foreground/20 px-6 pr-14 transition-all focus:ring-primary/40"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/input:opacity-100 transition-opacity">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 justify-center">
                <Button 
                  onClick={handleDiscovery}
                  disabled={isProcessing || !url.trim()}
                  className="w-fit px-10 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl flex items-center justify-center gap-3 text-[10px] uppercase tracking-widest shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />}
                  Download
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => { setUrl(''); setFoundImages([]); setError(null); setShowBlockedTip(false); }}
                  className="w-12 h-12 rounded-xl border-border bg-secondary hover:bg-secondary/80 text-foreground/40 hover:text-destructive transition-all active:scale-95 flex items-center justify-center p-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {error && foundImages.length === 0 && (
                <div className="p-6 rounded-[2rem] bg-destructive/5 border border-destructive/10 space-y-4 animate-in shake duration-500">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
                    <p className="text-[11px] font-bold text-destructive/80 uppercase tracking-widest leading-relaxed">{error}</p>
                  </div>
                  
                  {showBlockedTip && (
                    <div className="pt-4 border-t border-destructive/10 space-y-3">
                       <div className="flex items-center gap-2 text-primary">
                          <HelpCircle className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Recommended Action</span>
                       </div>
                       <p className="text-[10px] text-foreground/50 leading-relaxed font-medium">
                        This site blocks automated page scraping. To extract successfully: 
                        <br/><span className="text-foreground font-bold">Right-click the image → Copy image address → paste here.</span>
                       </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
            <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Protocol Logic</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                Direct image links work instantly. For sites like Pinterest or Instagram, use the &quot;Copy Image Address&quot; method to bypass page-level scraping restrictions.
              </p>
            </div>
          </div>
        </div>

        {/* Results Matrix */}
        <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px]">
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
                  Download All
                </Button>
              )}
            </CardHeader>
            <CardContent className="flex-1 p-8">
               {foundImages.length === 0 && !isProcessing ? (
                 <div className="h-full flex flex-col items-center justify-center text-center opacity-10 space-y-6 py-20">
                    <ImageIcon className="w-24 h-24 text-primary" />
                    <p className="text-sm font-black uppercase tracking-[0.3em]">Studio Standby</p>
                 </div>
               ) : isProcessing && foundImages.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center py-32 space-y-8">
                    <div className="relative">
                       <div className="w-24 h-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                       <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] text-primary">Establishing Uplink...</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar p-1">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="p-6 rounded-[2.5rem] bg-secondary border border-border flex items-start gap-5 group">
                <Maximize2 className="w-6 h-6 text-primary mt-1 shrink-0" />
                <div className="space-y-1">
                   <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest">Master Density</h4>
                   <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">We isolate the highest quality layer available in the remote matrix for 1:1 pixel fidelity.</p>
                </div>
             </div>
             <div className="p-6 rounded-[2.5rem] bg-secondary border border-border flex items-start gap-5 group">
                <ShieldCheck className="w-6 h-6 text-primary mt-1 shrink-0" />
                <div className="space-y-1">
                   <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest">Privacy Absolute</h4>
                   <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">Discovery logic executes via secure server flows. Hardware identifiers are never transmitted to target hosts.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
