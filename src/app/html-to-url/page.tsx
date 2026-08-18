
"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Trash2, 
  Info,
  CheckCircle2,
  Copy,
  Globe,
  ExternalLink,
  Zap,
  Code2,
  Activity,
  Eye,
  RefreshCcw,
  Maximize2,
  Layout,
  Terminal,
  Play,
  X,
  History,
  Clock,
  Loader2,
  Link as LinkIcon,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { GetHelp } from '@/components/qr-canvas/get-help';

const HISTORY_KEY = 'htmlToUrlHistory';

interface HistoryItem {
  id: string;
  title: string;
  url: string;
  date: number;
  language: string;
}

const LANGUAGES = [
  { id: 'auto', label: 'Auto Detect' },
  { id: 'html', label: 'HTML (Live Page)' },
  { id: 'css', label: 'CSS' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
  { id: 'json', label: 'JSON' },
  { id: 'text', label: 'Plain Text' },
];

export default function HtmlToUrlPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const [html, setHtml] = useState('');
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('auto');
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedId, setGeneratedId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'edit' | 'preview'>('edit');
  const [localHistory, setLocalHistory] = useState<HistoryItem[]>([]);
  const [cloudError, setCloudError] = useState<string | null>(null);

  // Preview / Execution State
  const [previewSrcDoc, setPreviewSrcDoc] = useState('');
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [isPyodideLoading, setIsPyodideLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const pyodideRef = useRef<any>(null);

  // Load History on Mount
  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try {
        setLocalHistory(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const updateLocalHistory = (item: HistoryItem) => {
    const next = [item, ...localHistory.filter(h => h.id !== item.id)].slice(0, 50);
    setLocalHistory(next);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  };

  const purgeLocalItem = async (id: string) => {
    if (!confirm("Remove this link?")) return;
    
    // Attempt cloud delete
    if (firestore) {
      try {
        await deleteDoc(doc(firestore, "pages", id));
      } catch (e) {}
    }

    const next = localHistory.filter(h => h.id !== id);
    setLocalHistory(next);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    localStorage.removeItem(`pages_${id}`);
    toast({ title: "Deleted" });
  };

  const effectiveLanguage = useMemo(() => {
    if (language !== 'auto') return language;
    const low = html.toLowerCase();
    if (low.includes('<html') || low.includes('<!doctype') || low.includes('<div') || low.includes('<script')) return 'html';
    if (low.includes('import ') || low.includes('def ') || low.includes('print(')) return 'python';
    if (low.includes('{') && low.includes('}') && (low.includes('color:') || low.includes('margin:'))) return 'css';
    return 'text';
  }, [language, html]);

  const syncPreview = useCallback(() => {
    setRuntimeError(null);
    if (!html.trim()) {
      setPreviewSrcDoc("<html><body style='background:#f1f5f9;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:sans-serif;color:#64748b;'><p>PREVIEW WILL SHOW HERE</p></body></html>");
      return;
    }

    if (['html', 'css', 'javascript'].includes(effectiveLanguage)) {
      let content = html;
      const errorCaptureScript = `
        <script>
          window.onerror = function(msg, url, line, col, error) {
            window.parent.postMessage({ type: 'RUNTIME_ERROR', message: msg + ' (Line: ' + line + ')' }, '*');
            return false;
          };
          console.error = function(...args) {
            window.parent.postMessage({ type: 'RUNTIME_ERROR', message: args.join(' ') }, '*');
          };
        </script>
      `;

      if (effectiveLanguage === 'css') {
        content = `<html><head>${errorCaptureScript}<style>${html}</style></head><body style="background:#f8fafc;padding:40px;font-family:sans-serif;"><div style="max-width:600px;margin:0 auto;background:white;padding:40px;border-radius:20px;box-shadow:0 10px 30px rgba(0,0,0,0.05);"><h1 class="preview-heading">CSS Viewer</h1><p class="preview-text">Styles applied to canvas.</p><button style="padding:10px 20px;border-radius:8px;cursor:pointer;">Action Component</button></div></body></html>`;
      } else if (effectiveLanguage === 'javascript') {
        content = `<html><body style="background:#0f172a;color:#22d3ee;padding:20px;font-family:monospace;">${errorCaptureScript}<div id="root">Executing JS...</div><script>try{ ${html} }catch(e){ console.error(e.message); }</script></body></html>`;
      } else {
        if (content.includes('<head>')) {
          content = content.replace('<head>', '<head>' + errorCaptureScript);
        } else {
          content = errorCaptureScript + content;
        }
      }
      setPreviewSrcDoc(content);
    } else {
      setPreviewSrcDoc(''); 
    }
  }, [html, effectiveLanguage]);

  useEffect(() => {
    const timer = setTimeout(syncPreview, 250);
    return () => clearTimeout(timer);
  }, [html, effectiveLanguage, syncPreview]);

  const fullUrl = (id: string) => typeof window !== 'undefined' ? `${window.location.origin}/p/${id}` : '';

  const handleMakeLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!html.trim()) {
      toast({ variant: "destructive", title: "Empty content" });
      return;
    }

    const size = new TextEncoder().encode(html).length;
    if (size > 150 * 1024) {
      toast({ variant: "destructive", title: "Too Large", description: "Content exceeds 150KB limit." });
      return;
    }

    setIsProcessing(true);
    setCloudError(null);
    
    // Generate ID immediately
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    const newUrl = fullUrl(id);

    // 1. Save locally ALWAYS
    localStorage.setItem(`pages_${id}`, html);
    const historyItem: HistoryItem = {
      id,
      title: title.trim() || 'Untitled Page',
      url: newUrl,
      date: Date.now(),
      language: effectiveLanguage
    };
    updateLocalHistory(historyItem);
    setGeneratedId(id);

    // 2. Try save to Cloud
    if (firestore) {
      try {
        await setDoc(doc(firestore, "pages", id), {
          html: html.trim(),
          title: title.trim() || 'Untitled Page',
          language: language === 'auto' ? effectiveLanguage : language,
          createdAt: Date.now()
        });
        toast({ title: "Saved to Cloud" });
      } catch (err: any) {
        setCloudError(`Cloud save failed: ${err.message || 'Check connection or rules'}`);
        toast({ variant: "default", title: "Saved Locally", description: "Saved to browser, but cloud sync failed." });
      }
    } else {
      setCloudError("Database not connected. Saved to browser only.");
    }

    setIsProcessing(false);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(label);
    toast({ title: "Copied" });
    setTimeout(() => setIsCopied(null), 2000);
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-full">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Globe className="w-3.5 h-3.5" /> Web Hosting
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="min-w-0">
            <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
              Code & <span className="text-primary italic">URL Studio</span>
            </h1>
            <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
              Convert any code or text into a hosted link. Preview your page in real-time and share it instantly.
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
                       <Code2 className="w-5 h-5 text-primary" /> Editor
                    </CardTitle>
                    <div className="flex items-center gap-3">
                       <Select value={language} onValueChange={setLanguage}>
                          <SelectTrigger className="h-9 w-[150px] bg-background/50 border-white/5 text-[9px] font-black uppercase rounded-lg">
                             <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="glass-card">
                             {LANGUAGES.map(lang => (
                               <SelectItem key={lang.id} value={lang.id} className="text-[9px] font-black uppercase">{lang.label}</SelectItem>
                             ))}
                          </SelectContent>
                       </Select>
                    </div>
                 </div>
              </CardHeader>
              <CardContent className="pt-10 space-y-8">
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Title (Optional)</Label>
                    <Input 
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="Page Title..."
                      className="h-14 bg-secondary border-border rounded-2xl text-lg font-bold px-6 focus:ring-primary/40 uppercase"
                    />
                 </div>

                 <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Code Content</Label>
                      <span className={cn("text-[9px] font-mono", html.length > 150000 ? "text-red-500" : "text-primary/60")}>
                        {Math.round(html.length / 1024)} KB / 150 KB
                      </span>
                    </div>
                    <Textarea 
                      value={html}
                      onChange={e => setHtml(e.target.value)}
                      placeholder="Paste code or text here..."
                      className="min-h-[400px] bg-secondary border-border text-xs font-mono p-8 rounded-[2rem] leading-relaxed resize-none focus:ring-primary/40 custom-scrollbar shadow-inner"
                    />
                 </div>

                 <div className="flex gap-4">
                    <Button 
                      type="button"
                      onClick={handleMakeLink}
                      disabled={!html.trim() || isProcessing || html.length > 150000}
                      className="h-16 flex-1 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl active:scale-95"
                    >
                      {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <LinkIcon className="w-6 h-6" />}
                      Make Link
                    </Button>
                 </div>

                 {cloudError && (
                   <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p className="text-[10px] font-bold leading-relaxed">{cloudError}</p>
                   </div>
                 )}
              </CardContent>
            </Card>

            {/* Local History */}
            <Card className="glass-card border-border shadow-xl overflow-hidden">
              <CardHeader className="py-6 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-3 text-foreground/60">
                    <History className="w-4 h-4 text-primary" /> My Links
                  </CardTitle>
                  <span className="text-[8px] font-black text-primary uppercase bg-primary/10 px-2 py-0.5 rounded leading-none">{localHistory.length} Saved</span>
              </CardHeader>
              <CardContent className="p-0">
                  {!localHistory.length ? (
                    <div className="py-20 text-center space-y-4 opacity-20">
                      <Globe className="w-12 h-12 mx-auto" />
                      <p className="text-[10px] font-black uppercase tracking-widest px-12">No links found on this device.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5 max-h-[400px] overflow-auto custom-scrollbar">
                      {localHistory.map((page) => (
                          <div key={page.id} className="p-5 flex items-center justify-between gap-4 hover:bg-white/5 transition-all group">
                            <div className="min-w-0 flex-1 space-y-1">
                                <div className="flex items-center gap-3">
                                  <span className="text-[9px] font-black text-primary uppercase bg-primary/10 px-1.5 py-0.5 rounded leading-none shrink-0">{page.language || 'text'}</span>
                                  <h4 className="text-xs font-bold text-foreground truncate uppercase">{page.title}</h4>
                                </div>
                                <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-widest">{new Date(page.date).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button 
                                size="icon" 
                                variant="ghost" 
                                onClick={() => handleCopy(page.url, `list-${page.id}`)}
                                className="h-9 w-9 rounded-xl text-foreground/20 hover:text-primary"
                                >
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
            <Card className={cn(
              "glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px]",
              (effectiveLanguage === 'html' || effectiveLanguage === 'css' || effectiveLanguage === 'javascript') ? "bg-white" : "bg-[#0a0a0c]"
            )}>
              <CardHeader className="py-4 border-b border-border bg-secondary/30 flex flex-row items-center justify-between shrink-0">
                 <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                    {['html', 'css', 'javascript'].includes(effectiveLanguage) ? <Eye className="w-3.5 h-3.5" /> : <Terminal className="w-3.5 h-3.5" />}
                    Preview
                 </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 p-0 relative overflow-hidden flex flex-col">
                  <iframe 
                    id="previewFrame"
                    srcDoc={previewSrcDoc}
                    title="Preview"
                    sandbox="allow-scripts allow-forms"
                    className="w-full h-full min-h-[320px] border-none bg-transparent block"
                  />
              </CardContent>
            </Card>

            {generatedId && (
              <Card className="glass-card border-primary/20 bg-primary/[0.03] shadow-2xl overflow-hidden relative animate-in zoom-in duration-500">
                 <CardHeader className="py-8 border-b border-primary/10">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.5em] flex items-center gap-3 text-primary">
                      <CheckCircle2 className="w-4 h-4" /> Link Created
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="pt-10 space-y-8 text-center">
                    <div className="p-6 bg-background border border-primary/20 rounded-[2.5rem] shadow-inner">
                       <p className="text-lg font-bold text-foreground break-all leading-tight">{fullUrl(generatedId)}</p>
                    </div>
                    <div className="flex gap-4">
                       <Button onClick={() => handleCopy(fullUrl(generatedId), 'link')} className="h-14 flex-1 bg-primary text-white font-black uppercase text-[10px] rounded-2xl shadow-xl">
                          {isCopied === 'link' ? 'Copied' : 'Copy Link'}
                       </Button>
                       <Button asChild variant="outline" className="h-14 px-8 rounded-2xl border-white/10 bg-white/5 text-white">
                          <a href={`/p/${generatedId}`} target="_blank"><ExternalLink className="w-4 h-4 mr-2" /> Open</a>
                       </Button>
                    </div>
                 </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 gap-6">
               <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all shadow-lg">
                  <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                     <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Local Privacy</h4>
                    <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                      Drafting and previews happen entirely on your device. Every save is also cached locally for immediate access.
                    </p>
                  </div>
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
