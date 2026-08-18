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
  KeyRound,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { doc, setDoc } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/firebase';
import { GetHelp } from '@/components/qr-canvas/get-help';

const HISTORY_KEY = 'htmlToUrlHistory_v6';

interface HistoryItem {
  id: string;
  title: string;
  url: string;
  date: number;
}

const LANGUAGES = [
  { id: 'auto', label: 'Auto Detect' },
  { id: 'html', label: 'HTML (Live Page)' },
  { id: 'css', label: 'CSS' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'text', label: 'Plain Text' },
];

export default function HtmlToUrlPage() {
  const { toast } = useToast();
  
  const [html, setHtml] = useState('');
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('auto');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'edit' | 'preview'>('edit');
  const [localHistory, setLocalHistory] = useState<HistoryItem[]>([]);
  
  const [statusText, setStatusText] = useState('Click Login as Guest');
  const [isGuestReady, setIsGuestReady] = useState(false);

  useEffect(() => {
    if (!auth) {
      setStatusText("Configuration missing");
      return;
    }
    return onAuthStateChanged(auth, (u) => {
      setIsGuestReady(!!u);
      setStatusText(u ? "Guest ready" : "Click Login as Guest");
    });
  }, []);

  const handleGuestLogin = async () => {
    if (!auth) {
      toast({ variant: "destructive", title: "Error", description: "Firebase is not configured correctly." });
      return;
    }
    setStatusText("Logging in...");
    try {
      await signInAnonymously(auth);
    } catch (e: any) {
      setStatusText(`${e.code}: ${e.message}`);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try { setLocalHistory(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const effectiveLanguage = useMemo(() => {
    if (language !== 'auto') return language;
    const low = html.toLowerCase();
    if (low.includes('<html') || low.includes('<!doctype') || low.includes('<div') || low.includes('<script')) return 'html';
    if (low.includes('{') && low.includes('}') && (low.includes('color:') || low.includes('margin:'))) return 'css';
    return 'text';
  }, [language, html]);

  const previewSrcDoc = useMemo(() => {
    if (!html.trim()) {
      return "<html><body style='background:#f1f5f9;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:sans-serif;color:#64748b;text-transform:uppercase;font-weight:900;font-size:10px;letter-spacing:2px;'><p>Awaiting Input</p></body></html>";
    }
    if (['html', 'css', 'javascript'].includes(effectiveLanguage)) {
      if (effectiveLanguage === 'css') return `<html><head><style>${html}</style></head><body style="padding:40px;font-family:sans-serif;"><h1>CSS Preview</h1><p>Style applied to canvas.</p></body></html>`;
      if (effectiveLanguage === 'javascript') return `<html><body><script>try{${html}}catch(e){document.body.innerHTML=e.message}</script></body></html>`;
      return html;
    }
    return `<html><body style='background:#0a0a0c;color:#4ade80;padding:20px;font-family:monospace;'>[Code View Active]</body></html>`; 
  }, [html, effectiveLanguage]);

  const handleMakeLink = async () => {
    if (!isGuestReady || !auth?.currentUser || !db) {
      toast({ variant: "destructive", title: "Login Required", description: "Please Login as Guest first." });
      return;
    }
    if (!html.trim()) return;

    setIsProcessing(true);
    
    try {
      const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
      const url = `${window.location.origin}/p/${id}`;
      const createdAt = Date.now();

      // Save locally first for instant access on this device
      localStorage.setItem(`kit_page_${id}`, JSON.stringify({ html, title, createdAt }));

      // Save to cloud
      await setDoc(doc(db, "pages", id), { 
        html: html.trim(), 
        title: title.trim() || 'Untitled', 
        uid: auth.currentUser.uid,
        createdAt 
      });

      const historyItem = { id, title: title || 'Untitled', url, date: createdAt };
      const nextHistory = [historyItem, ...localHistory.filter(h => h.id !== id)].slice(0, 50);
      setLocalHistory(nextHistory);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
      
      toast({ title: "Published" });
      window.open(url, '_blank');
    } catch (err: any) {
      setStatusText(`${err.code}: ${err.message}`);
      toast({ variant: "destructive", title: "Error", description: err.message });
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
    if (!confirm("Remove from local history?")) return;
    setLocalHistory(prev => {
      const next = prev.filter(h => h.id !== id);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
    localStorage.removeItem(`kit_page_${id}`);
    toast({ title: "Removed" });
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
              Code & <span className="text-primary italic">URL Studio</span>
            </h1>
            <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl">
              Convert raw code into a shareable link. Professional production with real-time preview and secure local fallback.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <GetHelp toolId="html-to-url" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Editor Column */}
        <div className="lg:col-span-6 xl:col-span-6 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          
          <Card className="glass-card border-border shadow-xl overflow-hidden">
             <CardHeader className="py-6 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 text-foreground">
                  <KeyRound className="w-4 h-4 text-primary" /> Session
                </CardTitle>
                <div className={cn(
                  "text-[9px] font-black uppercase px-3 py-1 rounded-full border",
                  isGuestReady ? "text-primary bg-primary/10 border-primary/20" : "text-foreground/40 bg-white/5 border-white/5"
                )}>
                  {statusText}
                </div>
             </CardHeader>
             <CardContent className="pt-8">
                {!isGuestReady && (
                  <Button 
                    onClick={handleGuestLogin}
                    className="h-14 w-full bg-primary text-white font-black uppercase text-[11px] tracking-widest rounded-2xl shadow-xl"
                  >
                    Login as Guest
                  </Button>
                )}
                {isGuestReady && (
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-4">
                     <CheckCircle2 className="w-5 h-5 text-primary" />
                     <span className="text-[10px] font-black uppercase text-foreground/60">Ready to Publish</span>
                  </div>
                )}
             </CardContent>
          </Card>

          <Tabs value={activeView} onValueChange={(v: any) => setActiveView(v)} className="w-full lg:hidden">
             <TabsList className="grid grid-cols-2 bg-secondary p-1.5 rounded-2xl h-14 mb-8">
                <TabsTrigger value="edit" className="rounded-xl text-[9px] font-black uppercase">Editor</TabsTrigger>
                <TabsTrigger value="preview" className="rounded-xl text-[9px] font-black uppercase">Preview</TabsTrigger>
             </TabsList>
          </Tabs>

          <div className={cn("space-y-8", activeView === 'preview' ? "max-lg:hidden" : "block")}>
            <Card className="glass-card border-border shadow-2xl overflow-hidden relative group min-h-[500px]">
              <CardHeader className="pb-6 border-b border-border bg-secondary/30">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                       <Code2 className="w-5 h-5 text-primary" /> Workspace
                    </CardTitle>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="h-9 w-[150px] bg-background border-white/5 text-[9px] font-black uppercase rounded-lg">
                         <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card">
                         {LANGUAGES.map(lang => (
                           <SelectItem key={lang.id} value={lang.id} className="text-[9px] font-black uppercase">{lang.label}</SelectItem>
                         ))}
                      </SelectContent>
                    </Select>
                 </div>
              </CardHeader>
              <CardContent className="pt-10 space-y-8">
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Title</Label>
                    <Input 
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="ENTER TITLE..."
                      className="h-14 bg-secondary border-border rounded-2xl text-lg font-bold px-6 focus:ring-primary/40 uppercase"
                    />
                 </div>

                 <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Source Code</Label>
                      <span className="text-[9px] font-mono text-primary/60">{html.length.toLocaleString()} Chars</span>
                    </div>
                    <Textarea 
                      value={html}
                      onChange={e => setHtml(e.target.value)}
                      placeholder="Paste code or text here..."
                      className="min-h-[400px] bg-secondary border-border text-xs font-mono p-8 rounded-[2rem] leading-relaxed resize-none focus:ring-primary/40 shadow-inner"
                    />
                 </div>

                 <Button 
                    onClick={handleMakeLink}
                    disabled={!html.trim() || isProcessing}
                    className="h-16 w-full bg-primary text-white font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl active:scale-95"
                  >
                    {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                    Publish Link
                  </Button>
              </CardContent>
            </Card>

            <Card className="glass-card border-border shadow-xl overflow-hidden">
              <CardHeader className="py-6 border-b border-border bg-secondary/30">
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-3 text-foreground/60">
                    <History className="w-4 h-4 text-primary" /> My Local Links
                  </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                  {!localHistory.length ? (
                    <div className="py-20 text-center space-y-4 opacity-20">
                      <Globe className="w-12 h-12 mx-auto" />
                      <p className="text-[10px] font-black uppercase tracking-widest px-12">No links yet</p>
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
                                <Button asChild size="icon" variant="ghost" className="h-9 w-9 rounded-xl text-foreground/20 hover:text-primary">
                                  <a href={`/p/${page.id}`} target="_blank"><ExternalLink className="w-4 h-4" /></a>
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
        </div>

        {/* Preview Column */}
        <div className="lg:col-span-6 xl:col-span-6 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <div className={cn("space-y-8", activeView === 'edit' ? "max-lg:hidden" : "block")}>
            <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px] bg-white">
              <CardHeader className="py-4 border-b border-border bg-secondary/30 shrink-0">
                 <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5" /> Preview
                 </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-0 relative overflow-hidden flex flex-col">
                  <iframe 
                    srcDoc={previewSrcDoc}
                    title="Preview"
                    sandbox="allow-scripts allow-forms"
                    className="flex-1 w-full h-full min-height-[320px] border-none bg-transparent block"
                  />
              </CardContent>
            </Card>

            <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all shadow-lg">
               <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-7 h-7" />
               </div>
               <div className="space-y-2">
                 <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Local Privacy</h4>
                 <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                   Your pages are saved locally before syncing to the cloud. Links work immediately on your device.
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
      `}</style>
    </div>
  );
}
