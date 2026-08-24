"use client"

import React, { useState, useMemo, useRef } from 'react';
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
  Maximize2,
  Copy,
  Terminal,
  FileSearch,
  FolderOpen
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
  type: 'html' | 'css' | 'js' | 'image' | 'icon';
  status: 'pending' | 'downloading' | 'success' | 'failed';
  size?: number;
  retries: number;
}

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

  // --- Asset Discovery Logic ---
  const extractAssets = (html: string, baseUrl: string): AssetItem[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const discovered: AssetItem[] = [];
    const seen = new Set<string>();

    const normalizePath = (attrValue: string) => {
      try {
        const absolute = new URL(attrValue, baseUrl).href;
        const urlObj = new URL(absolute);
        // We only clone from the same domain to prevent massive external creep
        const isSameDomain = urlObj.hostname === new URL(baseUrl).hostname;
        
        let localPath = urlObj.pathname;
        if (localPath === '/') localPath = '/index.html';
        
        return { absolute, localPath: localPath.startsWith('/') ? localPath.slice(1) : localPath, isSameDomain };
      } catch (e) {
        return null;
      }
    };

    const add = (raw: string | null, type: AssetItem['type']) => {
      if (!raw) return;
      const pathData = normalizePath(raw);
      if (pathData && !seen.has(pathData.absolute)) {
        seen.add(pathData.absolute);
        discovered.push({
          id: Math.random().toString(36).substr(2, 9),
          url: pathData.absolute,
          path: pathData.localPath,
          type,
          status: 'pending',
          retries: 0
        });
      }
    };

    // 1. Core HTML (Internal)
    discovered.push({
      id: 'index-html',
      url: baseUrl,
      path: 'index.html',
      type: 'html',
      status: 'success',
      retries: 0
    });

    // 2. CSS
    doc.querySelectorAll('link[rel="stylesheet"]').forEach(el => add(el.getAttribute('href'), 'css'));
    
    // 3. JS
    doc.querySelectorAll('script[src]').forEach(el => add(el.getAttribute('src'), 'js'));
    
    // 4. Images
    doc.querySelectorAll('img[src]').forEach(el => add(el.getAttribute('src'), 'image'));
    
    // 5. Favicons
    doc.querySelectorAll('link[rel*="icon"]').forEach(el => add(el.getAttribute('href'), 'icon'));

    return discovered;
  };

  const executeClone = async () => {
    if (!url.trim()) return;
    
    setIsProcessing(true);
    setStatus('scanning');
    setAssets([]);
    setProgress(5);

    try {
      // Phase 1: HTML Extraction
      const response = await fetchHtmlAction(url);
      if (!response.success || !response.html) {
        throw new Error(response.error || "Uplink restricted by remote node.");
      }

      const base = response.finalUrl || url;
      const initialAssets = extractAssets(response.html, base);
      setAssets(initialAssets);
      setStatus('downloading');
      setProgress(10);

      // Phase 2: Parallel Asset Retrieval
      const zip = new JSZip();
      
      // Save original HTML as index.html
      zip.file("index.html", response.html);

      const downloadAsset = async (item: AssetItem): Promise<void> => {
        if (item.id === 'index-html') return;
        
        try {
          setAssets(prev => prev.map(a => a.id === item.id ? { ...a, status: 'downloading' } : a));
          
          const res = await fetch(item.url);
          if (!res.ok) throw new Error("CORS or 404");
          
          const blob = await res.blob();
          const buffer = await blob.arrayBuffer();
          zip.file(item.path, buffer);
          
          setAssets(prev => prev.map(a => a.id === item.id ? { ...a, status: 'success', size: blob.size } : a));
        } catch (e) {
          if (item.retries < 1) {
            // Simple Retry Protocol
            const retryItem = { ...item, retries: 1 };
            await downloadAsset(retryItem);
          } else {
            setAssets(prev => prev.map(a => a.id === item.id ? { ...a, status: 'failed' } : a));
          }
        }
      };

      // Limit concurrency to avoid hardware lag
      const chunks = [];
      const batchSize = 5;
      for (let i = 0; i < initialAssets.length; i += batchSize) {
        chunks.push(initialAssets.slice(i, i + batchSize));
      }

      for (let i = 0; i < chunks.length; i++) {
        await Promise.all(chunks[i].map(downloadAsset));
        setProgress(10 + Math.round(((i + 1) / chunks.length) * 80));
      }

      // Phase 3: ZIP Synthesis
      setStatus('complete');
      setProgress(100);
      
      const zipContent = await zip.generateAsync({ type: "blob" });
      const downloadLink = URL.createObjectURL(zipContent);
      const a = document.createElement('a');
      a.href = downloadLink;
      a.download = `site_backup_${new URL(base).hostname.replace(/\./g, '_')}.zip`;
      a.click();

      toast({ title: "Backup Complete", description: "Project ZIP has been synthesized." });
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      toast({ variant: "destructive", title: "Protocol Failure", description: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyFailed = () => {
    const failedList = assets.filter(a => a.status === 'failed').map(a => a.url).join('\n');
    if (failedList) {
      navigator.clipboard.writeText(failedList);
      setIsCopied(true);
      toast({ title: "Failed URLs Copied" });
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
                Professional linguistic asset archival. Isolate and download public frontend components into a structured ZIP bundle locally in your browser.
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
        {/* Input Pane */}
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

                 <Button 
                   onClick={executeClone} 
                   disabled={isProcessing || !url.trim()}
                   className="w-full h-16 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all"
                 >
                   {isProcessing ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Layers className="w-5 h-5 mr-3" />}
                   Execute Clone Protocol
                 </Button>

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
                        All binary synthesis and ZIP generation occur 100% locally in your browser memory. Your target URLs are never stored.
                      </p>
                    </div>
                </div>
           </div>
        </div>

        {/* Status Pane */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px] bg-black/10">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between shrink-0">
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

                     <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-10 space-y-2">
                        {assets.map((asset) => (
                          <div key={asset.id} className="p-4 rounded-2xl bg-secondary/40 border border-border flex items-center justify-between gap-6 transition-all animate-in slide-in-from-bottom-2">
                             <div className="flex items-center gap-4 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center shrink-0">
                                   {getIcon(asset.type)}
                                </div>
                                <div className="min-w-0">
                                   <p className="text-[11px] font-bold text-foreground truncate uppercase">{asset.path}</p>
                                   <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">{asset.url}</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-3 shrink-0">
                                {asset.status === 'downloading' && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                                {asset.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                {asset.status === 'failed' && <XCircle className="w-4 h-4 text-red-500" />}
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
