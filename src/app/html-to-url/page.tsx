
"use client"

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Trash2, 
  CheckCircle2,
  Copy,
  Globe,
  ExternalLink,
  Zap,
  Code2,
  Eye,
  X,
  History,
  Save,
  FileText,
  ShieldCheck,
  Layout,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import { GetHelp } from '@/components/qr-canvas/get-help';

const HISTORY_KEY = 'htmlToUrlHistory_v6';

interface HistoryItem {
  id: string;
  title: string;
  url: string;
  date: number;
}

export default function HtmlToUrlPage() {
  const { toast } = useToast();
  
  const [htmlInput, setHtmlInput] = useState('');
  const [debouncedHtml, setDebouncedHtml] = useState('');
  const [publishedLink, setPublishedLink] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [localHistory, setLocalHistory] = useState<HistoryItem[]>([]);
  const [viewHtml, setViewHtml] = useState<string | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --- 1. Router Logic (Hash Extraction) ---
  const checkHash = useCallback(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#z=')) {
      const code = hash.slice(3);
      const decoded = decompressFromEncodedURIComponent(code);
      setViewHtml(decoded);
    } else if (hash.startsWith('#h=')) {
      const code = hash.slice(3);
      const decoded = decodeURIComponent(code);
      setViewHtml(decoded);
    } else {
      setViewHtml(null);
    }
  }, []);

  useEffect(() => {
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, [checkHash]);

  // --- 2. Studio Init ---
  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try { setLocalHistory(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  // Debounce Preview Sync (200ms)
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedHtml(htmlInput);
    }, 200);
    return () => { if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current); };
  }, [htmlInput]);

  const previewSrcDoc = useMemo(() => {
    if (!debouncedHtml.trim()) {
      return "<html><body style='background:#060608;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:sans-serif;color:#3b82f6;text-transform:uppercase;font-weight:900;font-size:10px;letter-spacing:2px;'><p>Awaiting Input</p></body></html>";
    }
    return debouncedHtml;
  }, [debouncedHtml]);

  // --- 3. Actions ---
  const handlePublish = () => {
    if (!htmlInput.trim()) return;

    // LZ-Compression Protocol
    const code = compressToEncodedURIComponent(htmlInput.trim());
    const link = window.location.origin + window.location.pathname + "#z=" + code;

    // Update Local Registry
    const historyItem = { 
      id: Math.random().toString(36).substr(2, 9), 
      title: 'Published Code', 
      url: link, 
      date: Date.now() 
    };
    const nextHistory = [historyItem, ...localHistory].slice(0, 10);
    setLocalHistory(nextHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));

    setPublishedLink(link);
    toast({ title: "Link Generated", description: "Self-sustaining compressed URL ready." });
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(label);
    toast({ title: "Copied to Clipboard" });
    setTimeout(() => setIsCopied(null), 2000);
  };

  const handleClear = () => {
    setHtmlInput('');
    setPublishedLink(null);
    toast({ title: "Studio Reset" });
  };

  const purgeHistory = () => {
    setLocalHistory([]);
    localStorage.removeItem(HISTORY_KEY);
    toast({ title: "History Purged" });
  };

  // --- 4. Render Logic (Viewer vs Editor) ---

  if (viewHtml !== null) {
    return (
      <div className="fixed inset-0 bg-black z-[9999] flex flex-col animate-in fade-in duration-500">
         <iframe 
          srcDoc={viewHtml}
          title="HTML View"
          sandbox="allow-scripts allow-forms"
          className="flex-1 w-full h-full border-none block bg-white"
         />
         <div className="h-14 bg-[#0a0a0c] border-t border-white/10 px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <Globe className="w-3.5 h-3.5 text-primary/40" />
              <span className="text-[8px] font-black uppercase text-white/40 tracking-widest">Self-Sustaining Host Active</span>
            </div>
            <button 
              onClick={() => { window.location.hash = ''; setViewHtml(null); }}
              className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:text-white transition-all group"
            >
               EXIT VIEW <ArrowLeft className="w-3.5 h-3.5 rotate-180 transition-transform group-hover:translate-x-1" />
            </button>
         </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-full">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Globe className="w-3.5 h-3.5" /> Web Hosting Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="min-w-0">
            <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
              HTML to <span className="text-primary italic">URL Studio</span>
            </h1>
            <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
              Convert raw code into an instant self-sustaining link. High-performance LZ-compression ensures 100% portability without database requirements.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <GetHelp toolId="html-to-url" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Editor Area */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group min-h-[500px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <CardHeader className="pb-6 border-b border-border bg-secondary/30">
               <div className="flex items-center justify-between">
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Code2 className="w-5 h-5 text-primary" /> Workspace
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-primary/60">{htmlInput.length.toLocaleString()} Chars</span>
                  </div>
               </div>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
               <Textarea 
                value={htmlInput}
                onChange={e => setHtmlInput(e.target.value)}
                placeholder="Paste HTML / CSS / JS code here..."
                className="min-h-[400px] bg-secondary border-border text-xs font-mono p-8 rounded-[2rem] leading-relaxed resize-none focus:ring-primary/40 shadow-inner"
               />

               <div className="space-y-4">
                  <Button 
                    onClick={handlePublish}
                    disabled={!htmlInput.trim()}
                    className="h-16 w-full bg-primary text-white font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl active:scale-95"
                  >
                    <Save className="w-6 h-6" />
                    Generate Compressed Link
                  </Button>
                  
                  {publishedLink && (
                    <div className="p-8 rounded-[2.5rem] bg-emerald-500/10 border border-emerald-500/20 space-y-6 animate-in zoom-in duration-500">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                           <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em]">Self-Sustaining Protocol</p>
                         </div>
                         <Button variant="ghost" size="icon" onClick={() => setPublishedLink(null)} className="h-6 w-6 rounded-full text-emerald-500/40 hover:text-emerald-500">
                           <X className="w-4 h-4" />
                         </Button>
                      </div>
                      <div className="p-4 bg-background rounded-2xl border border-emerald-500/20 text-xs font-bold text-foreground break-all shadow-inner font-mono max-h-32 overflow-y-auto custom-scrollbar">
                        {publishedLink}
                      </div>
                      <div className="flex gap-3">
                         <Button onClick={() => handleCopy(publishedLink, 'pub')} className="flex-1 h-12 bg-emerald-500 text-white font-black uppercase tracking-widest text-[9px]">
                            {isCopied === 'pub' ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                            Copy Short Link
                         </Button>
                         <Button onClick={() => window.open(publishedLink, '_blank')} variant="outline" className="flex-1 h-12 border-emerald-500/20 text-emerald-600 font-black uppercase text-[9px] bg-white/5">
                            Test Page <ExternalLink className="w-4 h-4 ml-2" />
                         </Button>
                      </div>
                    </div>
                  )}
               </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-border shadow-xl overflow-hidden">
            <CardHeader className="py-6 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-3 text-foreground/60">
                  <History className="w-4 h-4 text-primary" /> Recent Production
                </CardTitle>
                <button onClick={purgeHistory} className="text-[9px] font-black uppercase text-foreground/20 hover:text-destructive transition-all">Purge</button>
            </CardHeader>
            <CardContent className="p-0">
                {!localHistory.length ? (
                  <div className="py-20 text-center opacity-20">
                    <Globe className="w-12 h-12 mx-auto" />
                    <p className="text-[10px] font-black uppercase tracking-widest px-12">No recent sessions found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {localHistory.map((page, i) => (
                        <div key={i} className="p-5 flex items-center justify-between gap-4 hover:bg-white/5 transition-all">
                          <div className="min-w-0 flex-1">
                              <p className="text-xs font-mono font-bold text-foreground truncate uppercase">{page.url.substring(0, 40)}...</p>
                              <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-widest">{new Date(page.date).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-2">
                              <Button size="icon" variant="ghost" onClick={() => handleCopy(page.url, `list-${i}`)} className="h-9 w-9 rounded-xl text-foreground/20 hover:text-primary">
                                {isCopied === `list-${i}` ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => window.open(page.url, '_blank')} className="h-9 w-9 rounded-xl text-foreground/20 hover:text-primary">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                          </div>
                        </div>
                    ))}
                  </div>
                )}
            </CardContent>
          </Card>
        </div>

        {/* Monitor Area */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[400px] bg-white">
            <CardHeader className="py-3 border-b border-border bg-secondary/30 shrink-0">
               <CardTitle className="text-[9px] font-black text-primary uppercase tracking-[0.4em] flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5" /> Monitor
               </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 relative overflow-hidden flex flex-col min-h-[320px]">
                <iframe 
                  srcDoc={previewSrcDoc}
                  title="Preview"
                  sandbox="allow-scripts allow-forms"
                  className="flex-1 w-full h-full border-none bg-transparent block"
                />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6">
             <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <Zap className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Self-Contained Links</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Utilizing the LZ-String algorithm to embed compressed payloads directly into the URL hash. No database fetch required for retrieval.
                  </p>
                </div>
             </div>
             <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Privacy Absolute</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Zero data is stored on our servers. The entire page content is carried within the link itself and reconstructed locally in your browser.
                  </p>
                </div>
             </div>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

function ArrowLeft({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
    </svg>
  );
}
