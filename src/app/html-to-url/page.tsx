
"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  FileCode, 
  Link as LinkIcon, 
  Trash2, 
  Sparkles, 
  Loader2, 
  Info,
  CheckCircle2,
  Copy,
  Globe,
  ExternalLink,
  Zap,
  ShieldCheck,
  Code2,
  Activity,
  ArrowRight,
  Eye,
  RefreshCcw,
  Maximize2,
  History,
  Layout,
  User,
  LogOut,
  AlertCircle,
  LogIn,
  ChevronDown,
  Terminal,
  FileJson,
  FileText,
  Play,
  Cpu,
  ShieldAlert
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
import { doc, setDoc, serverTimestamp, collection, query, where, orderBy } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { useFirestore, useUser, useCollection, useAuth } from '@/firebase';
import { GetHelp } from '@/components/qr-canvas/get-help';

const ID_CHARS = 'abcdefghjkmnpqrstuvwxyz23456789';

const LANGUAGES = [
  { id: 'auto', label: 'Auto Detect' },
  { id: 'html', label: 'HTML (Live Page)' },
  { id: 'css', label: 'CSS' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
  { id: 'java', label: 'Java' },
  { id: 'cpp', label: 'C++' },
  { id: 'php', label: 'PHP' },
  { id: 'json', label: 'JSON' },
  { id: 'text', label: 'Plain Text' },
  { id: 'other', label: 'Other' },
];

export default function HtmlToUrlPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const auth = useAuth();
  const { user } = useUser();
  
  const [html, setHtml] = useState('');
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('auto');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [generatedId, setGeneratedId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [activeView, setActiveView] = useState<'edit' | 'preview'>('edit');

  // Preview / Execution State
  const [previewSrcDoc, setPreviewSrcDoc] = useState('');
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [isPyodideLoading, setIsPyodideLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const pyodideRef = useRef<any>(null);

  // Logic: Identify effective language
  const effectiveLanguage = useMemo(() => {
    if (language !== 'auto') return language;
    const low = html.toLowerCase();
    if (low.includes('<html') || low.includes('<!doctype') || low.includes('<div') || low.includes('<script')) return 'html';
    if (low.includes('import ') || low.includes('def ') || low.includes('print(')) return 'python';
    if (low.includes('{') && low.includes('}') && (low.includes('color:') || low.includes('margin:'))) return 'css';
    return 'text';
  }, [language, html]);

  // Error Listening Protocol
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'RUNTIME_ERROR') {
        setRuntimeError(event.data.message);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Debounced Auto-Preview Protocol
  useEffect(() => {
    const timer = setTimeout(() => {
      syncPreview();
    }, 250);
    return () => clearTimeout(timer);
  }, [html, effectiveLanguage]);

  const syncPreview = useCallback(() => {
    setRuntimeError(null);
    if (!html.trim()) {
      setPreviewSrcDoc("<html><body style='background:#f1f5f9;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:sans-serif;color:#64748b;'><p>PREVIEW WILL SHOW HERE</p></body></html>");
      return;
    }

    if (['html', 'css', 'javascript'].includes(effectiveLanguage)) {
      let content = html;
      
      // Inject Error Capture Proxy
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
        content = `<html><head>${errorCaptureScript}<style>${html}</style></head><body style="background:#f8fafc;padding:40px;font-family:sans-serif;"><div style="max-width:600px;margin:0 auto;background:white;padding:40px;border-radius:20px;box-shadow:0 10px 30px rgba(0,0,0,0.05);"><h1 class="preview-heading">CSS Visual Master</h1><p class="preview-text">Styles applied to canvas environment.</p><button style="padding:10px 20px;border-radius:8px;cursor:pointer;">Action Component</button></div></body></html>`;
      } else if (effectiveLanguage === 'javascript') {
        content = `<html><body style="background:#0f172a;color:#22d3ee;padding:20px;font-family:monospace;">${errorCaptureScript}<div id="root">Executing JS Matrix...</div><script>try{ ${html} }catch(e){ console.error(e.message); }</script></body></html>`;
      } else {
        // Standard HTML: Inject script into head or start of body
        if (content.includes('<head>')) {
          content = content.replace('<head>', '<head>' + errorCaptureScript);
        } else {
          content = errorCaptureScript + content;
        }
      }
      setPreviewSrcDoc(content);
    } else {
      setPreviewSrcDoc(''); // Non-visual languages use console output (Python)
    }
  }, [html, effectiveLanguage]);

  // Load Pyodide on Demand
  useEffect(() => {
    if (effectiveLanguage === 'python' && !pyodideRef.current && !isPyodideLoading) {
      const loadPy = async () => {
        setIsPyodideLoading(true);
        try {
          if (!(window as any).loadPyodide) {
            const script = document.createElement('script');
            script.src = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";
            document.head.appendChild(script);
            await new Promise((resolve) => (script.onload = resolve));
          }
          pyodideRef.current = await (window as any).loadPyodide();
          toast({ title: "Python Engine Ready" });
        } catch (e) {
          setRuntimeError("Python WASM runtime could not be loaded.");
        } finally {
          setIsPyodideLoading(false);
        }
      };
      loadPy();
    }
  }, [effectiveLanguage, isPyodideLoading, toast]);

  const handleRunPython = async () => {
    if (!html.trim() || effectiveLanguage !== 'python') return;
    setConsoleOutput([]);
    setIsExecuting(true);
    setRuntimeError(null);

    if (!pyodideRef.current) {
      setConsoleOutput(['[SYSTEM] Waiting for Python WASM Engine...']);
      setIsExecuting(false);
      return;
    }
    
    const logs: string[] = [];
    pyodideRef.current.setStdout({
      batched: (str: string) => { logs.push(str); setConsoleOutput([...logs]); }
    });
    pyodideRef.current.setStderr({
      batched: (str: string) => { logs.push(`[ERROR] ${str}`); setConsoleOutput([...logs]); }
    });

    try {
      await pyodideRef.current.runPythonAsync(html);
      if (logs.length === 0) logs.push('[SYSTEM] Execution complete. No output.');
      setConsoleOutput([...logs]);
    } catch (e: any) {
      setRuntimeError(e.message);
    }
    
    setIsExecuting(false);
  };

  // Fetch User Pages
  const pagesQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, "pages"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );
  }, [firestore, user]);

  const { data: myPages } = useCollection(pagesQuery);

  const generateId = () => {
    return Array.from({ length: 5 }, () => ID_CHARS[Math.floor(Math.random() * ID_CHARS.length)]).join('');
  };

  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}/p/${generatedId}` : '';

  const handleLogin = async () => {
    if (!auth) return;
    setIsLoggingIn(true);
    try {
      await signInAnonymously(auth);
      toast({ title: "Verified", description: "Identity synced." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Login Failed" });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleMakeLink = async () => {
    if (!user) {
      handleLogin();
      return;
    }

    if (!html.trim()) {
      toast({ variant: "destructive", title: "Payload Empty" });
      return;
    }

    if (!firestore) {
      toast({ variant: "destructive", title: "Signaling Down" });
      return;
    }

    const size = new TextEncoder().encode(html).length;
    if (size > 150 * 1024) {
      toast({ variant: "destructive", title: "Heavy Payload", description: "Matrix exceeded 150KB limit." });
      return;
    }

    setIsProcessing(true);
    setGeneratedId(null);

    const id = generateId();
    try {
      await setDoc(doc(firestore, "pages", id), {
        html: html.trim(),
        title: title.trim() || 'Untitled Studio Page',
        language: language === 'auto' ? effectiveLanguage : language,
        uid: user.uid,
        createdAt: serverTimestamp()
      });
      setGeneratedId(id);
      toast({ title: "Published", description: "Identity link generated." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Publish Error" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast({ title: "Copied" });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const openFullscreenPreview = () => {
    const win = window.open();
    if (win) {
      if (['html', 'css', 'javascript'].includes(effectiveLanguage)) {
        win.document.write(previewSrcDoc || html);
      } else {
        win.document.write(`<pre style="background:#000;color:#fff;padding:20px;font-family:monospace;">${consoleOutput.join('\n') || html}</pre>`);
      }
      win.document.close();
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-full">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Globe className="w-3.5 h-3.5" /> Universal Hosting Studio
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="min-w-0">
            <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
              Code & <span className="text-primary italic">URL Studio</span>
            </h1>
            <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
              Synthesize code strings into hosted visual pages or shareable blocks. Secure sandboxed previews and instant publishing.
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
                <TabsTrigger value="edit" className="rounded-xl text-[9px] font-black uppercase">Edit Matrix</TabsTrigger>
                <TabsTrigger value="preview" className="rounded-xl text-[9px] font-black uppercase">Visual Master</TabsTrigger>
             </TabsList>
          </Tabs>

          <div className={cn("space-y-8", activeView === 'preview' ? "max-lg:hidden" : "block")}>
            <Card className="glass-card border-border shadow-2xl overflow-hidden relative group min-h-[500px]">
              <CardHeader className="pb-6 border-b border-border bg-secondary/30">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                       <Code2 className="w-5 h-5 text-primary" /> Matrix Input
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
                      placeholder="ENTER PAGE TITLE..."
                      className="h-14 bg-secondary border-border rounded-2xl text-lg font-bold px-6 focus:ring-primary/40 uppercase"
                    />
                 </div>

                 <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Source Code</Label>
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
                    {effectiveLanguage === 'python' ? (
                       <Button 
                        onClick={handleRunPython}
                        disabled={isExecuting || isPyodideLoading || !html.trim()}
                        className="h-16 flex-1 bg-white text-black hover:bg-white/90 font-black rounded-2xl flex items-center justify-center gap-4 text-lg active:scale-95 transition-all"
                       >
                         {isExecuting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6 fill-current" />}
                         Run Python
                       </Button>
                    ) : (
                       <Button 
                        onClick={syncPreview}
                        className="h-16 flex-1 bg-white text-black hover:bg-white/90 font-black rounded-2xl flex items-center justify-center gap-4 text-lg active:scale-95 transition-all"
                       >
                         <RefreshCcw className="w-6 h-6" />
                         Refresh Preview
                       </Button>
                    )}
                    
                    {!user ? (
                      <Button 
                        onClick={handleLogin}
                        disabled={isLoggingIn}
                        className="h-16 flex-1 bg-secondary border border-border hover:bg-secondary/80 text-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg active:scale-95 transition-all"
                      >
                        {isLoggingIn ? <Loader2 className="w-6 h-6 animate-spin" /> : <LogIn className="w-6 h-6 text-primary" />}
                        Log in to Publish
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleMakeLink}
                        disabled={!html.trim() || isProcessing || html.length > 150000}
                        className="h-16 flex-1 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl active:scale-95"
                      >
                        {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <LinkIcon className="w-6 h-6" />}
                        Publish Link
                      </Button>
                    )}
                 </div>
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
                    {effectiveLanguage === 'python' ? 'Python Console' : 'Visual Master'}
                 </CardTitle>
                 <div className="flex items-center gap-2">
                    <button onClick={openFullscreenPreview} className="p-2 rounded-lg hover:bg-secondary transition-colors" title="Open Fullscreen">
                       <Maximize2 className="w-3.5 h-3.5 text-foreground/40" />
                    </button>
                 </div>
              </CardHeader>
              
              <CardContent className="flex-1 p-0 relative overflow-hidden flex flex-col">
                 {effectiveLanguage === 'python' ? (
                    <div className="flex-1 p-8 font-mono text-xs leading-relaxed overflow-auto custom-scrollbar bg-black text-green-400">
                       {consoleOutput.length > 0 ? consoleOutput.map((line, i) => (
                         <div key={i} className="mb-1">&gt; {line}</div>
                       )) : (
                         <div className="opacity-20 italic">Awaiting Python trigger...</div>
                       )}
                    </div>
                 ) : (
                    <div className="flex-1 flex flex-col min-h-[320px]">
                      <iframe 
                        id="previewFrame"
                        srcDoc={previewSrcDoc}
                        title="Studio Preview"
                        sandbox="allow-scripts allow-forms"
                        className="w-full flex-1 border-none bg-transparent block"
                        style={{ minHeight: '320px' }}
                      />
                    </div>
                 )}

                 {/* Diagnostics Overlay */}
                 {runtimeError && (
                   <div className="p-4 bg-red-500/10 border-t border-red-500/20 text-red-500 flex items-start gap-3 animate-in slide-in-from-bottom-2">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                         <p className="text-[10px] font-black uppercase tracking-widest leading-none">Runtime Error</p>
                         <p className="text-[10px] font-bold leading-relaxed">{runtimeError}</p>
                      </div>
                   </div>
                 )}
              </CardContent>
            </Card>

            {generatedId && (
              <Card className="glass-card border-primary/20 bg-primary/[0.03] shadow-2xl overflow-hidden relative animate-in zoom-in duration-500">
                 <CardHeader className="py-8 border-b border-primary/10">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.5em] flex items-center gap-3 text-primary">
                      <CheckCircle2 className="w-4 h-4" /> Identity Link Published
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="pt-10 space-y-8 text-center">
                    <div className="p-6 bg-background border border-primary/20 rounded-[2.5rem] shadow-inner">
                       <p className="text-lg font-bold text-foreground break-all leading-tight">{fullUrl}</p>
                    </div>
                    <div className="flex gap-4">
                       <Button onClick={() => handleCopy(fullUrl)} className="h-14 flex-1 bg-primary text-white font-black uppercase text-[10px] rounded-2xl shadow-xl">
                          {isCopied ? 'Identity Copied' : 'Copy Link'}
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
                    <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">WASM Sandbox</h4>
                    <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                      Visual languages are served via isolated sub-frames. Complex logic (Python) is executed via hardware-native WebAssembly with zero server persistence.
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
