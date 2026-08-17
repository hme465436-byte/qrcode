"use client"

import React, { useState, useMemo } from 'react';
import { 
  Youtube, 
  Download, 
  Trash2, 
  Sparkles, 
  Loader2, 
  Info,
  CheckCircle2,
  Search,
  Image as ImageIcon,
  Zap,
  Maximize2,
  FileArchive,
  ExternalLink,
  Smartphone,
  Monitor,
  AlertCircle,
  Play,
  Layers,
  LayoutGrid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import JSZip from 'jszip';

interface ThumbnailQuality {
  id: string;
  label: string;
  res: string;
  urlSuffix: string;
}

const QUALITIES: ThumbnailQuality[] = [
  { id: 'maxres', label: 'Max Resolution', res: '1280 × 720', urlSuffix: 'maxresdefault.jpg' },
  { id: 'sd', label: 'Standard Definition', res: '640 × 480', urlSuffix: 'sddefault.jpg' },
  { id: 'hq', label: 'High Quality', res: '480 × 360', urlSuffix: 'hqdefault.jpg' },
  { id: 'mq', label: 'Medium Quality', res: '320 × 180', urlSuffix: 'mqdefault.jpg' },
  { id: 'default', label: 'Default', res: '120 × 90', urlSuffix: 'default.jpg' },
];

export default function YoutubeThumbnailDownloaderPage() {
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const extractVideoId = (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return null;

    // 1. Plain 11-char ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

    try {
      const parsed = new URL(trimmed);
      const hostname = parsed.hostname.replace('www.', '');

      if (hostname === 'youtube.com') {
        if (parsed.pathname === '/watch') return parsed.searchParams.get('v');
        if (parsed.pathname.startsWith('/embed/')) return parsed.pathname.split('/')[2];
        if (parsed.pathname.startsWith('/shorts/')) return parsed.pathname.split('/')[2];
      }
      
      if (hostname === 'youtu.be') {
        return parsed.pathname.substring(1);
      }
    } catch (e) {
      // Not a URL
    }

    return null;
  };

  const handleGetThumbnails = () => {
    const id = extractVideoId(url);
    if (!id) {
      toast({ 
        variant: "destructive", 
        title: "Protocol Mismatch", 
        description: "Invalid YouTube URL or Video ID. Please check the matrix input." 
      });
      setVideoId(null);
      return;
    }

    setIsProcessing(true);
    setVideoId(id);
    setIsProcessing(false);
    toast({ title: "Signal Isolated", description: `Video ID: ${id} successfully mapped.` });
  };

  const handleDownloadSingle = async (thumbUrl: string, quality: string) => {
    try {
      const response = await fetch(thumbUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `yt-thumb-${videoId}-${quality}.jpg`;
      link.click();
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      // Fallback to direct link opening if CORS blocks
      window.open(thumbUrl, '_blank');
      toast({ title: "CORS Redirect", description: "Direct download blocked by host. Image opened in new tab." });
    }
  };

  const downloadAllAsZip = async () => {
    if (!videoId) return;
    setIsZipping(true);
    const zip = new JSZip();

    try {
      for (const q of QUALITIES) {
        const thumbUrl = `https://img.youtube.com/vi/${videoId}/${q.urlSuffix}`;
        try {
          const response = await fetch(thumbUrl);
          if (response.ok) {
            const blob = await response.blob();
            zip.file(`${q.id}_${q.res.replace(' × ', 'x')}.jpg`, blob);
          }
        } catch (e) {
          console.warn(`Could not fetch ${q.label} for ZIP`);
        }
      }

      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `yt-thumbnails-${videoId}.zip`;
      link.click();
      toast({ title: "Archive Exported", description: "All available qualities bundled in ZIP." });
    } catch (err) {
      toast({ variant: "destructive", title: "Archive Error", description: "Failed to synthesize ZIP bundle." });
    } finally {
      setIsZipping(false);
    }
  };

  const handleClear = () => {
    setUrl('');
    setVideoId(null);
    toast({ title: "Studio Reset", description: "Discovery buffer cleared." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Youtube className="w-3.5 h-3.5" /> Media Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          YouTube <span className="text-primary italic">Thumbnail Studio</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
          High-performance discovery and extraction. Retrieve original high-resolution thumbnail matrices from any YouTube video, short, or stream.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Input Panel */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <Search className="w-6 h-6" />
                </div>
                Asset Uplink
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-10 space-y-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">YouTube URL or Video ID</Label>
                <div className="relative group/input">
                  <Input 
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="h-16 bg-secondary border-border rounded-2xl text-lg font-mono font-medium placeholder:text-foreground/20 px-6 pr-14 transition-all focus:ring-primary/40"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/input:opacity-100 transition-opacity">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <Button 
                  onClick={handleGetThumbnails}
                  disabled={isProcessing || !url.trim()}
                  className="flex-1 h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                >
                  {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                  Download
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleClear}
                  className="w-16 h-16 rounded-2xl border-border bg-secondary hover:bg-secondary/80 text-foreground/40 hover:text-destructive transition-all active:scale-95"
                >
                  <Trash2 className="w-6 h-6" />
                </Button>
              </div>

              {videoId && (
                 <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10 space-y-4 animate-in zoom-in duration-500">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                          <span className="text-[10px] font-black uppercase text-foreground">Discovery Success</span>
                       </div>
                       <span className="text-[10px] font-mono font-bold text-primary">{videoId}</span>
                    </div>
                    <Button 
                      onClick={downloadAllAsZip}
                      disabled={isZipping}
                      variant="outline"
                      className="w-full h-12 rounded-xl bg-background border-border text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                    >
                      {isZipping ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <FileArchive className="w-3.5 h-3.5 mr-2" />}
                      Download
                    </Button>
                 </div>
              )}
            </CardContent>
          </Card>

          {/* Supported Formats */}
          <Card className="glass-card border-border shadow-xl overflow-hidden group">
            <CardHeader className="py-6 border-b border-border bg-primary/5 group-hover:bg-primary/10 transition-colors">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                <Info className="w-4 h-4" /> Discovery Protocols
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 gap-6 text-[11px] font-medium text-foreground/50 uppercase tracking-wider leading-relaxed">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-primary shrink-0">
                    <Monitor className="w-4 h-4" />
                  </div>
                  <p><span className="text-foreground font-black">Desktop:</span> /watch?v=VIDEO_ID</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-primary shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <p><span className="text-foreground font-black">Mobile:</span> youtu.be/VIDEO_ID</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-primary shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <p><span className="text-foreground font-black">Embeds & Shorts:</span> /embed/ or /shorts/</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Matrix */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          {!videoId ? (
            <Card className="glass-card border-border shadow-2xl h-[600px] flex flex-col items-center justify-center text-center p-12 border-dashed">
              <div className="w-20 h-20 rounded-[2.5rem] bg-secondary flex items-center justify-center text-foreground/10 mb-6">
                <ImageIcon className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-headline font-black text-foreground/40 uppercase tracking-widest">Awaiting Studio Uplink</h3>
              <p className="text-sm text-foreground/20 font-medium max-w-xs mt-4 uppercase tracking-tighter">
                Enter a YouTube URL to extract its available thumbnail matrix.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-8">
              {QUALITIES.map((q, idx) => {
                const thumbUrl = `https://img.youtube.com/vi/${videoId}/${q.urlSuffix}`;
                return (
                  <Card key={q.id} className="glass-card border-border shadow-xl overflow-hidden group hover:border-primary/20 transition-all">
                    <div className="flex flex-col md:flex-row h-full">
                       <div className={cn(
                         "relative bg-black overflow-hidden flex items-center justify-center",
                         q.id === 'maxres' ? "w-full md:w-1/2 aspect-video" : "w-full md:w-48 aspect-video"
                       )}>
                          <img 
                            src={thumbUrl} 
                            alt={q.label} 
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                            onError={(e) => (e.currentTarget.parentElement!.style.display = 'none')} 
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <Maximize2 className="w-6 h-6 text-white/50" />
                          </div>
                       </div>
                       
                       <div className="flex-1 p-6 flex items-center justify-between bg-secondary/20">
                          <div className="space-y-1">
                             <h4 className="text-[11px] font-black uppercase tracking-widest text-foreground">{q.label}</h4>
                             <p className="text-[10px] font-mono font-bold text-primary">{q.res}</p>
                          </div>
                          
                          <div className="flex items-center gap-3">
                             <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => window.open(thumbUrl, '_blank')}
                              className="h-10 w-10 rounded-xl hover:bg-primary/10 text-foreground/40 hover:text-primary transition-all"
                             >
                               <ExternalLink className="w-4 h-4" />
                             </Button>
                             <Button 
                              onClick={() => handleDownloadSingle(thumbUrl, q.id)}
                              className="h-10 px-4 bg-primary text-primary-foreground font-black text-[9px] uppercase tracking-widest rounded-xl shadow-lg"
                             >
                               <Download className="w-3.5 h-3.5 mr-2" />
                               Download
                             </Button>
                          </div>
                       </div>
                    </div>
                  </Card>
                );
              })}

              <div className="p-10 rounded-[3rem] bg-secondary/50 border border-border text-center space-y-6 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                 <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary mx-auto border border-primary/20 shadow-xl">
                    <CheckCircle2 className="w-8 h-8" />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-lg font-headline font-black text-foreground uppercase tracking-tight">Full Matrix Extraction Active</h3>
                    <p className="text-[10px] text-foreground/40 font-medium uppercase tracking-widest leading-relaxed max-w-sm mx-auto">
                      All identified quality layers are served directly from YouTube hardware servers for peak fidelity.
                    </p>
                 </div>
                 <Button 
                  onClick={downloadAllAsZip}
                  disabled={isZipping}
                  className="h-14 px-8 rounded-2xl bg-white text-black font-black uppercase text-[10px] tracking-widest shadow-2xl active:scale-95 transition-all"
                 >
                    {isZipping ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileArchive className="w-4 h-4 mr-2" />}
                    Download
                 </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .bg-checkered {
          background-image: linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                            linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                            linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
          background-size: 20px 20px;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
      `}</style>
    </div>
  );
}
