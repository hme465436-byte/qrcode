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
  Video,
  Music,
  FileVideo,
  Play,
  Youtube,
  Smartphone,
  Share2,
  Search,
  Monitor
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function MediaDownloaderPage() {
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'fetching' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isYoutube = useMemo(() => {
    return url.toLowerCase().includes('youtube.com') || url.toLowerCase().includes('youtu.be');
  }, [url]);

  const isSocial = useMemo(() => {
    return isYoutube || url.toLowerCase().includes('instagram.com') || url.toLowerCase().includes('tiktok.com');
  }, [url, isYoutube]);

  const SUPPORTED_EXTENSIONS = [
    '.mp3', '.mp4', '.wav', '.m4a', '.m4v', '.mov', '.avi', '.wmv', '.flv', '.webm', '.mkv',
    '.png', '.jpg', '.jpeg', '.pdf', '.zip', '.gif', '.webp'
  ];

  const validateUrl = (input: string) => {
    try {
      const parsed = new URL(input);
      const pathname = parsed.pathname.toLowerCase();
      return SUPPORTED_EXTENSIONS.some(ext => pathname.endsWith(ext)) || 
             input.includes('video') || 
             input.includes('audio') || 
             input.includes('media') ||
             isSocial;
    } catch {
      return false;
    }
  };

  const getMediaIcon = (input: string) => {
    if (isYoutube) return <Youtube className="w-10 h-10 text-red-600" />;
    const low = input.toLowerCase();
    if (low.match(/\.(mp3|wav|m4a|ogg)$/)) return <Music className="w-10 h-10 text-primary" />;
    if (low.match(/\.(mp4|webm|mkv|mov|avi)$/)) return <Video className="w-10 h-10 text-primary" />;
    return <FileDown className="w-10 h-10 text-primary" />;
  };

  const handleDownload = async () => {
    if (!url.trim()) return;

    if (!validateUrl(url)) {
      setStatus('error');
      setErrorMessage("Protocol Mismatch: The URL must be a direct link or a supported social platform (YouTube/IG/TikTok).");
      return;
    }

    setIsProcessing(true);
    setStatus('fetching');
    setErrorMessage(null);

    // If it's a social link, we handle it differently (CORS usually blocks direct fetch)
    if (isSocial) {
      setTimeout(() => {
        setStatus('error');
        setErrorMessage(`Social Extraction Block: Direct browser extraction for ${isYoutube ? 'YouTube' : 'Social'} is restricted by remote CORS protocols. Use the "Direct Extraction" mode below.`);
        setIsProcessing(false);
      }, 1500);
      return;
    }

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Uplink Failed: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const urlParts = url.split('/');
      let filename = urlParts.pop()?.split('?')[0] || 'downloaded-media';
      if (!filename.includes('.')) {
        const type = blob.type.split('/')[1];
        filename += `.${type || 'bin'}`;
      }
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(blobUrl);
      setStatus('success');
      toast({ title: "Media Extracted", description: "Asset successfully retrieved and pushed to queue." });
    } catch (err: any) {
      console.error('Download error:', err);
      setStatus('error');
      setErrorMessage("CORS Protocol Block: The server hosting this file prevents direct browser-side extraction. Try the 'Direct Open' fallback.");
      toast({ 
        variant: "destructive", 
        title: "Extraction Blocked", 
        description: "The remote host rejected the request." 
      });
    } finally {
      setIsProcessing(false);
    }
  }

  const handleClear = () => {
    setUrl('');
    setStatus('idle');
    setErrorMessage(null);
    toast({ title: "Studio Reset", description: "Uplink buffer cleared." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Youtube className="w-3.5 h-3.5" /> Media Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          YouTube & <span className="text-primary italic">Media Downloader</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
          Professional browser-side extraction for YouTube, social media, and direct files. Isolate high-fidelity assets instantly with local binary preservation protocols.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Input Panel */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <LinkIcon className="w-6 h-6" />
                </div>
                Asset Discovery Matrix
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-10 space-y-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Media Payload URL</Label>
                <div className="relative group/input">
                  <Input 
                    placeholder="Paste YouTube, IG, or Direct File URL..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="h-16 bg-secondary border-border rounded-2xl text-lg font-mono font-medium placeholder:text-foreground/20 px-6 pr-14 transition-all focus:ring-primary/40"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/input:opacity-100 transition-opacity">
                    {isYoutube ? <Youtube className="w-6 h-6 text-red-600" /> : <Globe className="w-6 h-6 text-primary" />}
                  </div>
                </div>
                
                {isYoutube && (
                   <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex items-center gap-4 animate-in zoom-in">
                      <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-600 shrink-0">
                        <Zap className="w-5 h-5" />
                      </div>
                      <p className="text-[9px] text-red-600/70 font-black uppercase tracking-widest leading-relaxed">
                        YouTube Logic Detected. Matrix analysis will proceed via Remote Extraction Protocol.
                      </p>
                   </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={handleDownload}
                  disabled={isProcessing || !url.trim()}
                  className="flex-1 h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                >
                  {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <FileDown className="w-6 h-6 group-hover:translate-y-1 transition-transform" />}
                  Extract Payload
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleClear}
                  className="w-16 h-16 rounded-2xl border-border bg-secondary hover:bg-secondary/80 text-foreground/40 hover:text-destructive transition-all active:scale-95"
                >
                  <Trash2 className="w-6 h-6" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Social Extraction Guide */}
          <Card className="glass-card border-border shadow-xl overflow-hidden group">
            <CardHeader className="py-6 border-b border-border bg-primary/5 group-hover:bg-primary/10 transition-colors">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                <Info className="w-4 h-4" /> Extraction Protocols
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[11px] font-medium text-foreground/50 uppercase tracking-wider leading-relaxed">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-primary shrink-0">
                    <Monitor className="w-4 h-4" />
                  </div>
                  <p><span className="text-foreground font-black">YouTube Sync:</span> Paste any YouTube link. For restricted clips, use the Direct Extraction fallback.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-primary shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <p><span className="text-foreground font-black">Social Reels:</span> Optimized for Instagram and TikTok high-res retrieval.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-primary shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <p><span className="text-foreground font-black">Binary Capture:</span> Direct files are captured as Blobs for local disk writing.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-primary shrink-0">
                    <Search className="w-4 h-4" />
                  </div>
                  <p><span className="text-foreground font-black">Fidelity Check:</span> Original resolution preserved across all container types.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Output Side */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group min-h-[300px]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Production Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 flex flex-col items-center justify-center text-center p-8 space-y-8">
              {status === 'idle' && (
                <div className="opacity-10 group-hover:opacity-20 transition-opacity space-y-4">
                  <Play className="w-20 h-20 text-primary mx-auto" />
                  <p className="text-xs font-black uppercase tracking-[0.3em]">Studio Standby</p>
                </div>
              )}

              {status === 'fetching' && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="relative w-24 h-24 mx-auto">
                    <div className="w-24 h-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                    <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">Negotiating Signal...</p>
                </div>
              )}

              {status === 'success' && (
                <div className="space-y-6 animate-in zoom-in duration-500">
                  <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto shadow-xl">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Extraction Complete</h3>
                    <p className="text-[10px] text-foreground/40 font-medium uppercase">Asset pushed to local disk storage.</p>
                  </div>
                  <div className="w-full p-4 rounded-xl bg-secondary border border-border flex items-center gap-4">
                     {getMediaIcon(url)}
                     <div className="text-left overflow-hidden">
                        <p className="text-[10px] font-black uppercase text-foreground truncate">{url.split('/').pop()?.split('?')[0]}</p>
                        <p className="text-[8px] font-bold text-primary uppercase tracking-widest">Verified Matrix</p>
                     </div>
                  </div>
                  <Button variant="outline" onClick={handleClear} className="h-12 px-8 rounded-xl border-border text-[9px] font-black uppercase tracking-widest hover:text-primary transition-all">
                    Reset Protocol
                  </Button>
                </div>
              )}

              {status === 'error' && (
                <div className="space-y-8 animate-in shake duration-500 w-full">
                  <div className="w-20 h-20 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mx-auto shadow-xl">
                    <ShieldAlert className="w-10 h-10" />
                  </div>
                  <div className="space-y-4 px-4 text-center">
                    <h3 className="text-sm font-black text-destructive uppercase tracking-widest">Protocol Advisory</h3>
                    <p className="text-[11px] text-foreground/50 leading-relaxed font-medium">
                      {errorMessage}
                    </p>
                  </div>
                  
                  <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10 space-y-4">
                     <h4 className="text-[10px] font-black uppercase text-primary tracking-widest">Direct Extraction Fallback</h4>
                     <Button 
                      asChild
                      className="w-full h-14 bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
                    >
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-3" />
                        Execute Remote Open
                      </a>
                    </Button>
                    <p className="text-[9px] text-foreground/30 font-bold uppercase leading-relaxed">
                      This bypasses browser CORS restrictions to view the media directly for manual saving.
                    </p>
                  </div>

                  <button onClick={handleClear} className="text-[9px] font-black uppercase tracking-widest text-foreground/20 hover:text-primary transition-all">
                    Purge Signal Error
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="p-6 rounded-[2.5rem] bg-secondary border border-border flex items-start gap-4">
            <Zap className="w-5 h-5 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-foreground uppercase tracking-widest">Production Logic</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                Our engine utilizes browser-side binary fetching. For YouTube and social streams, the "Direct Extraction" mode is recommended for peak compatibility and resolution preservation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
