
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
  Cpu
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
  const { user, loading: authLoading } = useUser();
  
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
          toast({ title: "Python Engine Ready", description: "WASM Runtime initialized." });
        } catch (e) {
          toast({ variant: "destructive", title: "Engine Failure", description: "Python runtime could not be loaded." });
        } finally {
          setIsPyodideLoading(false);
        }
      };
      loadPy();
    }
  }, [effectiveLanguage, isPyodideLoading, toast]);

  const handleRun = async () => {
    if (!html.trim()) return;
    setConsoleOutput([]);
    setIsExecuting(true);

    if (effectiveLanguage === 'html') {
      setPreviewSrcDoc(html);
    } else if (effectiveLanguage === 'css') {
      const cssDoc = `
        <html>
          <head><style>${html}</style></head>
          <body style="background: #f8fafc; padding: 40px; font-family: sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
              <h1 class="preview-heading">CSS Visual Master</h1>
              <p class="preview-text">This content serves as a canvas for your style protocol. Your CSS is applied globally to this frame.</p>
              <button style="padding: 10px 20px; border-radius: 8px; cursor: pointer;">Action Component</button>
            </div>
          </body>
        </html>
      `;
      setPreviewSrcDoc(cssDoc);
    } else if (effectiveLanguage === 'javascript') {
      const jsDoc = `
        <html>
          <body style="background: #0f172a; color: #22d3ee; padding: 20px; font-family: monospace;">
            <div id="root">Executing JS Matrix...</div>
            <script>
              const root = document.getElementById('root');
              const console = {
                log: (...args) => {
                  const p = document.createElement('div');
                  p.textContent = '> ' + args.join(' ');
                  root.appendChild(p);
                }
              };
              try {
                ${html}
              } catch (e) {
                root.textContent = 'ERROR: ' + e.message;
              }
            </script>
          </body>
        </html>
      `;
      setPreviewSrcDoc(jsDoc);
    } else if (effectiveLanguage === 'python') {
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
        if (logs.length === 0) logs.push('[SYSTEM] Execution complete. No stdout returned.');
        setConsoleOutput([...logs]);
      } catch (e: any) {
        setConsoleOutput([...logs, `[RUNTIME ERROR] ${e.message}`]);
      }
    } else {
      setPreviewSrcDoc('');
    }
    
    setIsExecuting(false);
    if (activeView === 'edit' && window.innerWidth < 1024) setActiveView('preview');
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
      toast({ title: "Welcome to the Studio", description: "Identity verified successfully." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Login Failed", description: err.message });
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
      toast({ variant: "destructive", title: "Payload Empty", description: "Please enter content first." });
      return;
    }

    if (!firestore) {
      toast({ variant: "destructive", title: "Handshake Failed", description: "Firestore signaling is inactive." });
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
      toast({ title: "Protocol Published", description: "Content matrix mapped to public URL." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Publish Error", description: err.message });
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

  const handleClear = () => {
    setHtml('');
    setTitle('');
    setGeneratedId(null);
    setPreviewSrcDoc('');
    setConsoleOutput([]);
    toast({ title: "Studio Reset" });
  };

  const openFullscreenPreview = () => {
    const win = window.open();
    if (win) {
      if (effectiveLanguage === 'html' || effectiveLanguage === 'css' || effectiveLanguage === 'javascript') {
        win.document.write(previewSrcDoc || html);
      } else {
        win.document.write(`<pre style="background:#000;color:#fff;padding:20px;">${consoleOutput.join('\n') || html}</pre>`);
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
              Convert HTML or code snippets into shareable links. Host live demos or share code strings instantly via our secure document matrix.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <GetHelp toolId="html-to-url" />
             {html && (
               <Button variant="outline" size="sm" onClick={handleClear} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                 <Trash2 className="w-3.5 h-3.5 mr-2" /> Reset
               </Button>
             )}
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
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <CardHeader className="pb-8 border-b border-border bg-secondary/30">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                       <Code2 className="w-5 h-5 text-primary" /> Matrix Payload
                    </CardTitle>
                    <div className="flex items-center gap-3">
                       <Select value={language} onValueChange={setLanguage}>
                          <SelectTrigger className="h-9 w-[150px] bg-background/50 border-white/5 text-[9px] font-black uppercase rounded-lg">
                             <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="glass-card border-white/10">
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
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Asset Identity (Title)</Label>
                    <Input 
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="ENTER TITLE..."
                      className="h-14 bg-secondary border-border rounded-2xl text-lg font-bold px-6 focus:ring-primary/40 uppercase"
                    />
                 </div>

                 <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Linguistic Content</Label>
                      <span className={cn("text-[9px] font-mono", html.length > 150000 ? "text-red-500" : "text-primary/60")}>
                        {Math.round(html.length / 1024)} KB / 150 KB
                      </span>
                    </div>
                    <Textarea 
                      value={html}
                      onChange={e => setHtml(e.target.value)}
                      placeholder="Paste your code or text here..."
                      className="min-h-[400px] bg-secondary border-border text-xs font-mono p-8 rounded-[2rem] leading-relaxed resize-none focus:ring-primary/40 custom-scrollbar shadow-inner"
                    />
                 </div>

                 <div className="flex gap-4">
                    <Button 
                      onClick={handleRun}
                      disabled={isExecuting || isPyodideLoading || !html.trim()}
                      className="h-16 flex-1 bg-white text-black hover:bg-white/90 font-black rounded-2xl flex items-center justify-center gap-4 text-lg transition-all active:scale-95"
                    >
                      {isExecuting || isPyodideLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6 fill-current" />}
                      {effectiveLanguage === 'python' ? 'Run Code' : 'Update Preview'}
                    </Button>
                    
                    {!user ? (
                      <Button 
                        onClick={handleLogin}
                        disabled={isLoggingIn}
                        className="h-16 flex-1 bg-secondary border border-border hover:bg-secondary/80 text-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg transition-all active:scale-95"
                      >
                        {isLoggingIn ? <Loader2 className="w-6 h-6 animate-spin" /> : <LogIn className="w-6 h-6 text-primary" />}
                        Log in to Publish
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleMakeLink}
                        disabled={!html.trim() || isProcessing || html.length > 150000}
                        className="h-16 flex-1 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95"
                      >
                        {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <LinkIcon className="w-6 h-6" />}
                        {effectiveLanguage === 'html' ? 'Publish Live Page' : 'Generate Code Link'}
                      </Button>
                    )}
                 </div>
              </CardContent>
            </Card>

            {myPages && myPages.length > 0 && (
              <Card className="glass-card border-border shadow-xl overflow-hidden">
                <CardHeader className="py-6 border-b border-border bg-secondary/30">
                   <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 text-foreground">
                      <History className="w-4 h-4 text-primary" /> My Hosted Registry
                   </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                   <div className="divide-y divide-border">
                      {myPages.map((p: any) => (
                        <div key={p.id} className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-all group">
                           <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                 {p.language === 'html' ? <Globe className="w-4 h-4" /> : <FileCode className="w-4 h-4" />}
                              </div>
                              <div className="space-y-0.5 min-w-0">
                                 <p className="text-[10px] font-black text-foreground uppercase tracking-tight truncate max-w-[120px]">{p.title}</p>
                                 <p className="text-[8px] font-mono text-foreground/20 uppercase">{p.language || 'text'}</p>
                              </div>
                           </div>
                           <div className="flex gap-2">
                              <Button asChild size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:text-primary">
                                 <a href={`/p/${p.id}`} target="_blank"><ExternalLink className="w-3.5 h-3.5" /></a>
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => handleCopy(`${window.location.origin}/p/${p.id}`)} className="h-8 w-8 rounded-lg hover:text-primary">
                                 <Copy className="w-3.5 h-3.5" />
                              </Button>
                           </div>
                        </div>
                      ))}
                   </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Preview Column */}
        <div className="lg:col-span-6 xl:col-span-6 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2 lg:sticky lg:top-24">
          <Card className={cn(
            "glass-card border-border shadow-2xl overflow-hidden relative group min-h-[600px] flex flex-col",
            activeView === 'edit' ? "max-lg:hidden" : "block",
            (effectiveLanguage === 'html' || effectiveLanguage === 'css' || effectiveLanguage === 'javascript') ? "bg-white" : "bg-[#0a0a0c]"
          )}>
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-4 border-b border-border bg-secondary/30 flex flex-row items-center justify-between shrink-0">
               <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                  {(effectiveLanguage === 'html' || effectiveLanguage === 'css' || effectiveLanguage === 'javascript') ? <Eye className="w-3.5 h-3.5" /> : <Terminal className="w-3.5 h-3.5" />}
                  {effectiveLanguage === 'python' ? 'Console Matrix' : 'Visual Master'}
               </CardTitle>
               <div className="flex items-center gap-3">
                  <button onClick={() => { setPreviewSrcDoc(''); setConsoleOutput([]); }} className="p-2 rounded-lg hover:bg-secondary transition-colors" title="Clear Preview">
                     <RefreshCcw className="w-3.5 h-3.5 text-foreground/40" />
                  </button>
                  <button onClick={openFullscreenPreview} className="p-2 rounded-lg hover:bg-secondary transition-colors" title="Fullscreen Preview">
                     <Maximize2 className="w-3.5 h-3.5 text-foreground/40" />
                  </button>
               </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 relative overflow-hidden flex flex-col">
               {effectiveLanguage === 'python' ? (
                  <div className="flex-1 p-8 font-mono text-sm leading-relaxed overflow-auto custom-scrollbar bg-black text-green-400">
                     {consoleOutput.length > 0 ? consoleOutput.map((line, i) => (
                       <div key={i} className="mb-1">{line}</div>
                     )) : (
                       <div className="opacity-20 italic">Awaiting Python execution...</div>
                     )}
                  </div>
               ) : (
                 previewSrcDoc ? (
                    <iframe 
                      srcDoc={previewSrcDoc}
                      title="Studio Preview"
                      sandbox="allow-scripts allow-forms"
                      className="w-full h-full border-none"
                    />
                 ) : (
                    <div className="h-full flex flex-col p-8 bg-[#0a0a0c]">
                       {['java', 'cpp', 'php', 'other'].includes(effectiveLanguage) ? (
                         <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white/20">
                               <ShieldAlert className="w-8 h-8" />
                            </div>
                            <div className="space-y-2">
                               <p className="text-xs font-black uppercase text-white/40 tracking-widest">Protocol Restriction</p>
                               <p className="text-[10px] text-white/20 font-medium uppercase leading-relaxed max-w-xs">
                                  This language cannot run in the browser sandbox. Links will share the source matrix correctly.
                               </p>
                            </div>
                            <div className="p-6 bg-white/5 rounded-2xl w-full text-left font-mono text-[10px] text-white/30 truncate">
                               {html.substring(0, 100)}...
                            </div>
                         </div>
                       ) : (
                         <div className="h-full flex flex-col items-center justify-center opacity-10 py-32 space-y-4">
                            <Layout className="w-24 h-24 text-primary" />
                            <p className="text-xs font-black uppercase tracking-[0.3em] text-white">Awaiting Inbound Signal</p>
                         </div>
                       )}
                    </div>
                 )
               )}
            </CardContent>
          </Card>

          {generatedId && (
            <Card className="glass-card border-primary/20 bg-primary/[0.03] shadow-2xl overflow-hidden relative animate-in zoom-in duration-500">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
               <CardHeader className="py-8 border-b border-primary/10">
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.5em] flex items-center gap-3 text-primary">
                    <CheckCircle2 className="w-4 h-4" /> Protocol Published
                  </CardTitle>
               </CardHeader>
               <CardContent className="pt-10 space-y-8">
                  <div className="space-y-4">
                     <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Hosted Identity Link</Label>
                     <div className="p-6 bg-background border border-primary/20 rounded-[2.5rem] shadow-inner relative group/url overflow-hidden">
                        <p className="text-lg font-bold text-foreground break-all leading-tight">{fullUrl}</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <Button 
                      onClick={() => handleCopy(fullUrl)}
                      className="h-16 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/30"
                     >
                        {isCopied ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
                        Copy Link
                     </Button>
                     <Button 
                      asChild
                      variant="outline"
                      className="h-16 rounded-2xl border-white/10 bg-white/5 text-foreground font-black uppercase tracking-widest text-[10px] hover:bg-white/10"
                     >
                        <a href={`/p/${generatedId}`} target="_blank">
                           <ExternalLink className="w-5 h-5 mr-2" /> Open Preview
                        </a>
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
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Isolated Identity</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    HTML/CSS/JS are served via a live sandboxed environment. Python is executed via hardware-native WebAssembly (WASM) with zero server persistence.
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
        .bg-checkered {
          background-image: linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                            linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                            linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
}
