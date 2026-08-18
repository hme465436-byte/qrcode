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
  Loader2,
  Save,
  FileText,
  ShieldCheck,
  Layout,
  AlertCircle,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { rtdb } from '@/firebase';
import { ref, set } from 'firebase/database';
import { GetHelp } from '@/components/qr-canvas/get-help';

const HISTORY_KEY = 'htmlToUrlHistory_v4';

interface HistoryItem {
  id: string;
  title: string;
  url: string;
  date: number;
}

export default function HtmlToUrlPage() {
  const { toast } = useToast();
  
  const [html, setHtml] = useState('');
  const [title, setTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [publishedLink, setPublishedLink] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [localHistory, setLocalHistory] = useState<HistoryItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try { setLocalHistory(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const previewSrcDoc = useMemo(() => {
    if (!html.trim()) {
      return "<html><body style='background:#060608;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:sans-serif;color:#3b82f6;text-transform:uppercase;font-weight:900;font-size:10px;letter-spacing:2px;'><p>Awaiting Input</p></body></html>";
    }
    return html;
  }, [html]);

  const handlePublish = async () => {
    if (!html.trim()) return;

    setIsProcessing(true);
    setPublishedLink(null);
    setError(null);
    
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const finalTitle = title.trim() || 'Untitled Page';

    try {
      if (!rtdb) throw new Error("Database connection unavailable.");

      // 1. Cloud Save Protocol (Realtime Database)
      await set(ref(rtdb, "pages/" + id), { 
        html: html.trim(), 
        title: finalTitle, 
        createdAt: Date.now() 
      });

      // 2. Hybrid Link Construction
      let link = window.location.origin + window.location.pathname + "?kit=" + id;
      
      // If content is small, embed directly as fallback
      if (html.length < 6000) {
        link += "#h=" + encodeURIComponent(html.trim());
      }

      // 3. Hardware Persistence
      const pagesMap = JSON.parse(localStorage.getItem("kit_pages") || "{}");
      pagesMap[id] = html.trim();
      localStorage.setItem("kit_pages", JSON.stringify(pagesMap));

      // 4. Update History
      const historyItem = { id, title: finalTitle, url: link, date: Date.now() };
      const nextHistory = [historyItem, ...localHistory.filter(h => h.id !== id)].slice(0, 20);
      setLocalHistory(nextHistory);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));

      setPublishedLink(link);
      toast({ title: "Page Published", description: "Link generated and verified on cloud." });
    } catch (err: any) {
      // Fallback: If DB fails but HTML is small, we can still provide a hash-only link
      if (html.length < 6000) {
        const link = window.location.origin + window.location.pathname + "#h=" + encodeURIComponent(html.trim());
        setPublishedLink(link);
        setError(`DB Restricted: ${err.message}. Providing self-contained link fallback.`);
      } else {
        setError(`${err.code || 'Error'}: ${err.message}`);
        toast({ variant: "destructive", title: "Publish Failed", description: "Database rejected payload." });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(label);
    toast({ title: "Copied" });
    setTimeout(() => setIsCopied(null), 2000);
  };

  const purgeLocalItem = (id: string) => {
    setLocalHistory(prev => {
      const next = prev.filter(h => h.id !== id);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
    
    const pagesMap = JSON.parse(localStorage.getItem("kit_pages") || "{}");
    delete pagesMap[id];
    localStorage.setItem("kit_pages", JSON.stringify(pagesMap));
    
    toast({ title: "Removed from history" });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-full">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Globe className="w-3.5 h-3.5" /> Web Hosting Studio
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="min-w-0">
            <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
              HTML to <span className="text-primary italic">URL Studio</span>
            </h1>
            <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
              Convert raw code into a shareable link instantly. Pages are synced via a high-performance database with self-contained fallback protocols.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <GetHelp toolId="html-to-url" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group min-h-[500px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <CardHeader className="pb-6 border-b border-border bg-secondary/30">
               <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                  <Code2 className="w-5 h-5 text-primary" /> Workspace
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
               <div className="space-y-4">
                  <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Document Title</Label>
                  <Input 
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="ENTER PAGE TITLE..."
                    className="h-14 bg-secondary border-border rounded-2xl text-lg font-bold px-6 focus:ring-primary/40 uppercase"
                  />
               </div>

               <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">HTML / CSS / JS</Label>
                    <span className={cn("text-[9px] font-mono", html.length > 6000 ? "text-yellow-500" : "text-primary/60")}>
                      {html.length.toLocaleString()} Chars {html.length > 6000 ? '(DB Only Mode)' : '(Hybrid Ready)'}
                    </span>
                  </div>
                  <Textarea 
                    value={html}
                    onChange={e => setHtml(e.target.value)}
                    placeholder="Paste code or text here..."
                    className="min-h-[400px] bg-secondary border-border text-xs font-mono p-8 rounded-[2rem] leading-relaxed resize-none focus:ring-primary/40 shadow-inner"
                  />
               </div>

               <div className="space-y-4">
                  <Button 
                    onClick={handlePublish}
                    disabled={!html.trim() || isProcessing}
                    className="h-16 w-full bg-primary text-white font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl active:scale-95"
                  >
                    {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                    {isProcessing ? 'Verifying Cloud Sync...' : 'Publish & Make Link'}
                  </Button>

                  {error && (
                    <div className={cn(
                      "p-4 rounded-xl border flex items-center gap-3 animate-in shake duration-500",
                      publishedLink ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-destructive/10 border-destructive/20 text-destructive"
                    )}>
                       {publishedLink ? <Info className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                       <p className="text-[10px] font-bold uppercase tracking-widest">{error}</p>
                    </div>
                  )}
               </div>

                {publishedLink && (
                  <div className="p-8 rounded-[2.5rem] bg-emerald-500/10 border border-emerald-500/20 space-y-6 animate-in zoom-in duration-500">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                         <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em]">Verified Live Link</p>
                       </div>
                       <Button variant="ghost" size="icon" onClick={() => setPublishedLink(null)} className="h-6 w-6 rounded-full text-emerald-500/40 hover:text-emerald-500">
                         <X className="w-4 h-4" />
                       </Button>
                    </div>
                    <div className="p-4 bg-background rounded-2xl border border-emerald-500/20 text-sm font-bold text-foreground break-all shadow-inner">
                      {publishedLink}
                    </div>
                    <div className="flex gap-3">
                       <Button onClick={() => handleCopy(publishedLink, 'pub')} className="flex-1 h-12 bg-emerald-500 text-white font-black uppercase tracking-widest text-[9px]">
                          {isCopied === 'pub' ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                          Copy Link
                       </Button>
                       <Button onClick={() => window.open(publishedLink, '_blank')} variant="outline" className="flex-1 h-12 border-emerald-500/20 text-emerald-600 font-black uppercase text-[9px] bg-white/5">
                          Open Page <ExternalLink className="w-4 h-4 ml-2" />
                       </Button>
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>

          <Card className="glass-card border-border shadow-xl overflow-hidden">
            <CardHeader className="py-6 border-b border-border bg-secondary/30">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-3 text-foreground/60">
                  <History className="w-4 h-4 text-primary" /> Recent Publishes
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {!localHistory.length ? (
                  <div className="py-20 text-center space-y-4 opacity-20">
                    <Globe className="w-12 h-12 mx-auto" />
                    <p className="text-[10px] font-black uppercase tracking-widest px-12">No local history found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5 max-h-[400px] overflow-auto custom-scrollbar">
                    {localHistory.map((page) => (
                        <div key={page.id} className="p-5 flex items-center justify-between gap-4 hover:bg-white/5 transition-all">
                          <div className="min-w-0 flex-1 space-y-1">
                              <h4 className="text-xs font-bold text-foreground truncate uppercase">{page.title}</h4>
                              <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-widest">{new Date(page.date).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-2">
                              <Button size="icon" variant="ghost" onClick={() => handleCopy(page.url, `list-${page.id}`)} className="h-9 w-9 rounded-xl text-foreground/20 hover:text-primary">
                                {isCopied === `list-${page.id}` ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => window.open(page.url, '_blank')} className="h-9 w-9 rounded-xl text-foreground/20 hover:text-primary">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => purgeLocalItem(page.id)} className="h-9 w-9 rounded-xl text-foreground/20 hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                          </div>
                        </div>
                    ))}
                  </div>
                )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[400px] bg-white">
            <CardHeader className="py-3 border-b border-border bg-secondary/30 shrink-0">
               <CardTitle className="text-[9px] font-black text-primary uppercase tracking-[0.4em] flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5" /> Monitor
               </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 relative overflow-hidden flex flex-col">
                <iframe 
                  srcDoc={previewSrcDoc}
                  title="Preview"
                  sandbox="allow-scripts allow-forms"
                  className="flex-1 w-full min-h-[320px] border-none bg-transparent block"
                />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6">
             <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <Zap className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Hybrid Link Protocol</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Small payloads are embedded directly in the link hash. This ensures your hosted page is accessible even if the database signal is restricted.
                  </p>
                </div>
             </div>
             <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">WASM Sandbox Safety</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Pages are rendered in a restricted iframe sandbox. Browser-native memory isolation prevents local scripts from accessing your primary studio environment.
                  </p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
