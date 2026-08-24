"use client"

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { 
  FileArchive, 
  Search, 
  Download, 
  Trash2, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Info,
  Globe,
  Zap,
  Activity,
  ShieldCheck,
  FileCode,
  ImageIcon,
  FileText,
  Layers,
  ChevronRight,
  AlertCircle,
  RotateCcw,
  RefreshCcw,
  Maximize2,
  Copy,
  Terminal,
  FileSearch,
  FolderOpen,
  X,
  Play,
  StopCircle,
  FileDown,
  Film
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';
import { fetchHtmlAction } from './actions';
import JSZip from 'jszip';

interface AssetItem {
  id: string;
  url: string;
  path: string; 
  type: 'html' | 'css' | 'js' | 'image' | 'icon' | 'media';
  status: 'pending' | 'downloading' | 'success' | 'failed';
  size?: number;
  retries: number;
  reason?: string;
}

/**
 * Utility: Standard Binary Size Formatting
 */
const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export default function SiteBackupClonerPage() {
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'downloading' | 'complete' | 'error'>('idle');
  const [isCopied, setIsCopied] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Asset Discovery Logic ---
  const extractAssets = (html: string, baseUrl: string): AssetItem[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const discovered: AssetItem[] = [];
    const seen = new Set<string>();

    const normalizeUrl = (attrValue: string) => {
      try {
        const absolute = new URL(attrValue, baseUrl).href;
        const u = new URL(absolute);
        
        if (!u.protocol.startsWith('http')) return null;
        
        let dir = 'assets/';
        const ext = u.pathname.split('.').pop()?.toLowerCase();
        if (ext === 'css') dir = 'css/';
        else if (ext === 'js' || ext === 'mjs') dir = 'js/';
        else if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico'].includes(ext || '')) dir = 'img/';
        else if (['mp4', 'webm', 'mp3', 'wav', 'ogg'].includes(ext || '')) dir = 'media/';

        const fileName = u.pathname.split('/').pop() || `asset_${Math.random().toString(36).substr(2, 5)}`;
        const localPath = dir + fileName;
        
        return { absolute, localPath };
      } catch (e) {
        return null;
      }
    };

    const add = (raw: string | null, type: AssetItem['type']) => {
      if (!raw) return;
      const mapping = normalizeUrl(raw);
      if (mapping && !seen.has(mapping.absolute)) {
        seen.add(mapping.absolute);
        discovered.push({
          id: Math.random().toString(36).substr(2, 9),
          url: mapping.absolute,
          path: mapping.localPath,
          type,
          status: 'pending',
          retries: 0
        });
      }
    };

    doc.querySelectorAll('link[rel="stylesheet"]').forEach(el => add(el.getAttribute('href'), 'css'));
    doc.querySelectorAll('script[src]').forEach(el => add(el.getAttribute('src'), 'js'));
    doc.querySelectorAll('img[src]').forEach(el => add(el.getAttribute('src'), 'image'));
    doc.querySelectorAll('img[srcset]').forEach(el => {
      const srcset = el.getAttribute('srcset');
      srcset?.split(',').forEach(s => add(s.trim().split(' ')[0], 'image'));
    });
    doc.querySelectorAll('link[rel*="icon"]').forEach(el => add(el.getAttribute('href'), 'icon'));
    doc.querySelectorAll('video[poster]').forEach(el => add(el.getAttribute('poster'), 'image'));
    doc.querySelectorAll('source[src]').forEach(el => add(el.getAttribute('src'), 'media'));

    return discovered;
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsProcessing(false);
    setStatus('idle');
    toast({ title: "Protocol Aborted", description: "Archival process terminated." });
  };

  const executeClone = async () => {
    if (!url.trim()) return;
    
    setIsProcessing(true);
    setStatus('scanning');
    setAssets([]);
    setProgress(0);
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetchHtmlAction(url);
      if (!response.success || !response.html) {
        throw new Error(response.error || "Uplink restricted by remote host.");
      }

      const base = response.finalUrl || url;
      const initialAssets = extractAssets(response.html, base);
      setAssets(initialAssets);
      setStatus('downloading');
      
      const zip = new JSZip();
      const mappingTable: Record<string, string> = {}; 

      const downloadAsset = async (item: AssetItem): Promise<void> => {
        if (abortControllerRef.current?.signal.aborted) return;
        
        const attempt = async (retryNum: number): Promise<boolean> => {
          try {
            setAssets(prev => prev.map(a => a.id === item.id ? { ...a, status: 'downloading' } : a));
            
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 12000);
            
            const res = await fetch(item.url, { signal: controller.signal });
            clearTimeout(id);
            
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            
            const blob = await res.blob();
            const buffer = await blob.arrayBuffer();
            zip.file(item.path, buffer);
            
            mappingTable[item.url] = item.path;
            
            setAssets(prev => prev.map(a => a.id === item.id ? { 
              ...a, 
              status: 'success', 
              size: blob.size 
            } : a));
            return true;
          } catch (e: any) {
            if (retryNum < 2) return await attempt(retryNum + 1);
            setAssets(prev => prev.map(a => a.id === item.id ? { 
              ...a, 
              status: 'failed', 
              reason: e.message || 'CORS/Timeout' 
            } : a));
            return false;
          }
        };

        await attempt(0);
      };

      const concurrency = 5;
      for (let i = 0; i < initialAssets.length; i += concurrency) {
        if (abortControllerRef.current?.signal.aborted) break;
        const batch = initialAssets.slice(i, i + concurrency);
        await Promise.all(batch.map(downloadAsset));
        setProgress(Math.round(((i + batch.length) / initialAssets.length) * 90));
      }

      setStatus('scanning');
      let finalHtml = response.html;
      initialAssets.forEach(a => {
        if (mappingTable[a.url]) {
          const local = mappingTable[a.url];
          finalHtml = finalHtml.split(`"${a.url}"`).join(`"${local}"`);
          finalHtml = finalHtml.split(`'${a.url}'`).join(`'${local}'`);
          const relative = a.url.replace(base, '');
          if (relative && relative !== a.url) {
             finalHtml = finalHtml.split(`"${relative}"`).join(`"${local}"`);
             finalHtml = finalHtml.split(`'${relative}'`).join(`'${local}'`);
          }
        }
      });

      zip.file("index.html", finalHtml);

      const zipContent = await zip.generateAsync({ type: "blob" });
      const downloadLink = URL.createObjectURL(zipContent);
      const a = document.createElement('a');
      a.href = downloadLink;
      a.download = `backup_${new URL(base).hostname.replace(/\./g, '_')}.zip`;
      a.click();

      setStatus('complete');
      setProgress(100);
      toast({ title: "Archival Complete", description: "Project bundle generated." });
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setStatus('error');
      toast({ variant: "destructive", title: "Protocol Failure", description: err.message });
    } finally {
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  };

  const handleCopyFailed = () => {
    const failedList = assets.filter(a => a.status === 'failed').map(a => `${a.url} (${a.reason})`).join('\n');
    if (failedList) {
      navigator.clipboard.writeText(failedList);
      setIsCopied(true);
      toast({ title: "Failure Log Copied" });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const stats = useMemo(() => {
    return {
      total: assets.length,
      success: assets.filter(a => a.status === 'success').length,
      failed: assets.filter(a => a.status === 'failed').length,
      size: assets.reduce((acc, a) => acc + (a.size || 0), 0)
    };
  }, [assets]);

  const getIcon = (type: AssetItem['type']) => {
    switch (type) {
      case 'css': return <Zap className="w-4 h-4 text-blue-400" />;
      case 'js': return <Terminal className="w-4 h-4 text-yellow-400" />;
      case 'image': return <ImageIcon className="w-4 h-4 text-emerald-400" />;
      case 'html': return <FileCode className="w-4 h-4 text-orange-400" />;
      case 'media': return <Film className="w-4 h-4 text-rose-400" />;
      default: return <FileText className="w-4 h-4 text-primary/40" />;
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <FileArchive className="w-3.5 h-3.5" /> Maintenance Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div className="min-w-0">
              <h1 className="text-3xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight leading-none overflow-wrap-anywhere">
                Site Backup <span className="text-primary italic">Cloner Studio</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed overflow-wrap-anywhere">
                Professional linguistic asset archival. Isolate public components into a structured ZIP bundle locally in your browser.
              </p>
           </div>
           <div className="flex items-center gap-3 shrink-0 pb-2">
              <GetHelp toolId="site-backup-cloner" />
              {(assets.length > 0 || url) && (
                <Button variant="outline" size="sm" onClick={() => { setUrl(''); setAssets([]); setStatus('idle'); }} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                  <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
                </Button>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <CardHeader className="pb-8 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                   <Globe className="w-5 h-5 text-primary" /> Target Protocol
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-10 space-y-8">
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Website URL</Label>
                    <div className="relative group/input">
                       <Input 
                        placeholder="https://example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="h-16 bg-secondary border-border rounded-2xl text-lg font-bold px-6 focus:ring-primary/40 uppercase"
                       />
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/input:opacity-100 transition-opacity">
                          <Search className="w-6 h-6 text-primary" />
                       </div>
                    </div>
                 </div>

                 {isProcessing ? (
                   <Button 
                     onClick={handleCancel}
                     variant="destructive"
                     className="w-full h-16 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl active:scale-95 transition-all"
                   >
                     <StopCircle className="w-5 h-5 mr-3 animate-pulse" />
                     Abort Protocol
                   </Button>
                 ) : (
                   <Button 
                     onClick={executeClone} 
                     disabled={!url.trim()}
                     className="w-full h-16 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all"
                   >
                     <Layers className="w-5 h-5 mr-3" />
                     Execute Clone Protocol
                   </Button>
                 )}

                 <div className="p-6 rounded-[2rem] bg-amber-500/5 border border-amber-500/10 space-y-3">
                    <div className="flex items-center gap-3 text-amber-600">
                       <AlertCircle className="w-4 h-4" />
                       <h4 className="text-[10px] font-black uppercase tracking-widest">CORS Advisory</h4>
                    </div>
                    <p className="text-[10px] text-foreground/40 font-bold uppercase leading-relaxed">
                       Browser security protocols strictly prevent the archival of files restricted by remote CORS headers. Private backend logic and server-side code cannot be retrieved.
                    </p>
                 </div>
              </CardContent>
           </Card>

           <div className="grid grid-cols-1 gap-6">
                <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                    <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                       <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[12px] font-black text-foreground uppercase tracking-widest leading-none">Privacy Matrix</h4>
                      <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">
                        All binary synthesis and ZIP generation occur 100% locally in your browser memory. Your target URLs are never stored on our cloud infrastructure.
                      </p>
                    </div>
                </div>
           </div>
        </div>

        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px] bg-black/10">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between shrink-0 px-6 sm:px-10">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20">
                       <Activity className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Linguistic Monitor</CardTitle>
                 </div>
                 {status !== 'idle' && (
                    <div className="flex items-center gap-4">
                       <div className="text-right">
                          <p className="text-[10px] font-black text-foreground uppercase leading-none">{status.toUpperCase()}</p>
                          <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-widest">{progress}% Matrix Sync</p>
                       </div>
                    </div>
                 )}
              </CardHeader>
              
              <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
                 {status === 'idle' ? (
                   <div className="flex-1 flex flex-col items-center justify-center opacity-10 gap-6 py-20">
                      <FolderOpen className="w-20 h-20 text-primary" />
                      <p className="text-xs font-black uppercase tracking-[0.3em]">Awaiting Discovery Signal</p>
                   </div>
                 ) : (
                   <>
                     {isProcessing && (
                        <div className="px-10 py-4 bg-primary/5 border-b border-white/5">
                           <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary mb-2">
                              <span>Synthesizing Bundle...</span>
                              <span>{progress}%</span>
                           </div>
                           <Progress value={progress} className="h-1" />
                        </div>
                     )}

                     <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-10 space-y-2 bg-[#060608]">
                        {assets.map((asset) => (
                          <div key={asset.id} className={cn(
                            "p-4 rounded-2xl border flex items-center justify-between gap-6 transition-all animate-in slide-in-from-bottom-2",
                            asset.status === 'failed' ? "bg-red-500/5 border-red-500/10" : "bg-secondary/40 border-border"
                          )}>
                             <div className="flex items-center gap-4 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center shrink-0">
                                   {getIcon(asset.type)}
                                </div>
                                <div className="min-w-0">
                                   <p className="text-[11px] font-bold text-foreground truncate uppercase">{asset.path}</p>
                                   <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest truncate">{asset.url}</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-3 shrink-0">
                                {asset.status === 'downloading' && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                                {asset.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                {asset.status === 'failed' && <XCircle className="w-4 h-4 text-red-500" title={asset.reason} />}
                                <span className={cn(
                                  "text-[8px] font-black uppercase tracking-widest",
                                  asset.status === 'success' ? 'text-emerald-500' : 
                                  asset.status === 'failed' ? 'text-red-500' : 'text-primary'
                                )}>{asset.status}</span>
                             </div>
                          </div>
                        ))}
                     </div>
                   </>
                 )}
              </CardContent>

              {status === 'complete' && (
                <div className="p-8 border-t border-white/5 bg-[#0a0a0c] space-y-8 animate-in slide-in-from-bottom-6">
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-5 rounded-2xl bg-secondary border border-border text-center space-y-1">
                         <p className="text-xl font-headline font-black text-foreground">{stats.total}</p>
                         <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">Total Found</p>
                      </div>
                      <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-center space-y-1">
                         <p className="text-xl font-headline font-black text-emerald-500">{stats.success}</p>
                         <p className="text-[8px] font-black text-emerald-600/40 uppercase tracking-widest">Downloaded</p>
                      </div>
                      <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/20 text-center space-y-1">
                         <p className="text-xl font-headline font-black text-red-500">{stats.failed}</p>
                         <p className="text-[8px] font-black text-red-600/40 uppercase tracking-widest">Failed (CORS)</p>
                      </div>
                      <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 text-center space-y-1">
                         <p className="text-xl font-headline font-black text-primary">{formatSize(stats.size)}</p>
                         <p className="text-[8px] font-black text-primary/40 uppercase tracking-widest">Total Volume</p>
                      </div>
                   </div>

                   <div className="flex flex-col sm:flex-row gap-4">
                      <Button onClick={() => window.location.reload()} variant="outline" className="h-16 px-10 border-white/10 bg-white/5 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl flex-1">
                         <RefreshCcw className="w-5 h-5 mr-3" /> New Discovery
                      </Button>
                      {stats.failed > 0 && (
                        <Button onClick={handleCopyFailed} variant="outline" className="h-16 px-10 border-red-500/20 bg-red-500/5 text-red-500 font-black uppercase text-[10px] tracking-widest rounded-2xl flex-1">
                           {isCopied ? <CheckCircle2 className="w-5 h-5 mr-3" /> : <Copy className="w-5 h-5 mr-3" />}
                           Copy Failed URLs
                        </Button>
                      )}
                   </div>
                </div>
              )}
           </Card>
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
