
"use client"

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  Trash2, 
  CheckCircle2,
  Copy,
  Globe,
  Zap,
  Code2,
  Eye,
  X,
  Save,
  FileText,
  ShieldCheck,
  Layout,
  Info,
  ArrowLeft,
  RotateCcw,
  ExternalLink,
  Monitor,
  Smartphone,
  Tablet,
  Download,
  Play,
  Maximize2,
  AlertCircle,
  FileCode,
  Braces
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import { GetHelp } from '@/components/qr-canvas/get-help';

// --- Production Templates ---
const TEMPLATES = {
  blank: {
    html: `<div class="container">\n  <h1>New Project</h1>\n  <p>Start coding...</p>\n</div>`,
    css: `body { background: #060608; color: white; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }\n.container { text-align: center; border: 1px solid #333; padding: 40px; rounded: 20px; }`,
    js: `console.log('Studio Initialized');`
  },
  calculator: {
    html: `<div class="calc">\n  <div id="display">0</div>\n  <div class="keys">\n    <button onclick="clearDisplay()">C</button>\n    <button onclick="append('7')">7</button>\n    <button onclick="append('8')">8</button>\n    <button onclick="append('9')">9</button>\n    <button onclick="append('+')">+</button>\n    <button onclick="calculate()">=</button>\n  </div>\n</div>`,
    css: `body { background: #0f172a; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: monospace; }\n.calc { background: #1e293b; padding: 20px; border-radius: 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }\n#display { background: #0f172a; color: #22d3ee; padding: 15px; font-size: 24px; text-align: right; border-radius: 10px; margin-bottom: 10px; }\n.keys { display: grid; grid-template-cols: repeat(4, 1fr); gap: 10px; }\nbutton { padding: 15px; border: none; background: #334155; color: white; border-radius: 8px; cursor: pointer; }`,
    js: `const disp = document.getElementById('display');\nwindow.append = (v) => disp.innerText = disp.innerText === '0' ? v : disp.innerText + v;\nwindow.clearDisplay = () => disp.innerText = '0';\nwindow.calculate = () => disp.innerText = eval(disp.innerText);`
  },
  profile: {
    html: `<div class="card">\n  <img src="https://picsum.photos/seed/mykit/150" alt="Avatar">\n  <h2>Studio Developer</h2>\n  <p>Building high-fidelity local tools.</p>\n  <button>Contact Identity</button>\n</div>`,
    css: `body { background: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: sans-serif; }\n.card { background: white; padding: 40px; border-radius: 30px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; width: 280px; }\nimg { border-radius: 50%; margin-bottom: 20px; border: 4px solid #3b82f6; }\nh2 { margin: 0; color: #0f172a; }\np { color: #64748b; font-size: 14px; }\nbutton { margin-top: 20px; background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; }`,
    js: `document.querySelector('button').onclick = () => alert('Handshake Initiated');`
  },
  landing: {
    html: `<nav>Studio.io</nav>\n<main>\n  <h1>The New Standard</h1>\n  <p>Private. Local. Permanent.</p>\n  <div class="btn-group">\n    <button class="p">Get Started</button>\n    <button class="s">Docs</button>\n  </div>\n</main>`,
    css: `body { background: #020617; color: white; font-family: system-ui; margin: 0; }\nnav { padding: 20px 40px; font-weight: 900; color: #3b82f6; }\nmain { height: 80vh; display: flex; flex-col; align-items: center; justify-content: center; text-align: center; }\nh1 { font-size: 4rem; margin: 0; letter-spacing: -2px; }\np { opacity: 0.5; font-size: 1.2rem; }\n.btn-group { margin-top: 40px; display: flex; gap: 20px; }\nbutton { padding: 15px 30px; border-radius: 12px; border: none; font-weight: bold; cursor: pointer; }\n.p { background: #3b82f6; color: white; }\n.s { background: #1e293b; color: white; }`,
    js: `console.log('Landing Logic Ready');`
  }
};

export default function HtmlToUrlPage() {
  const { toast } = useToast();
  
  // Advanced Editor State
  const [htmlCode, setHtmlCode] = useState(TEMPLATES.blank.html);
  const [cssCode, setCssCode] = useState(TEMPLATES.blank.css);
  const [jsCode, setJsCode] = useState(TEMPLATES.blank.js);
  const [activeEditor, setActiveEditor] = useState<'html' | 'css' | 'js'>('html');
  
  // Preview State
  const [debouncedFullHtml, setDebouncedFullHtml] = useState('');
  const [publishedLink, setPublishedLink] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [viewHtml, setViewHtml] = useState<string | null>(null);
  const [previewWidth, setPreviewWidth] = useState<'100%' | '768px' | '375px'>('100%');
  const [runtimeError, setRuntimeError] = useState<string | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --- 1. Router Logic (Hash Extraction) ---
  const checkHash = useCallback(() => {
    if (typeof window === 'undefined') return;
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

  // Combined Master Synthesis
  const fullDocument = useMemo(() => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    ${cssCode}
  </style>
</head>
<body>
  ${htmlCode}
  <script>
    (function() {
      const originalError = window.onerror;
      window.onerror = function(msg, url, line, col, error) {
        window.parent.postMessage({ type: 'runtime-error', message: msg }, '*');
        if (originalError) return originalError(msg, url, line, col, error);
        return false;
      };
      try {
        ${jsCode}
      } catch (e) {
        window.parent.postMessage({ type: 'runtime-error', message: e.message }, '*');
      }
    })();
  </script>
</body>
</html>`;
  }, [htmlCode, cssCode, jsCode]);

  // Debounce Preview Sync (200ms)
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedFullHtml(fullDocument);
      setRuntimeError(null);
    }, 200);
    return () => { if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current); };
  }, [fullDocument]);

  // Iframe Message Listener (Error Detection)
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'runtime-error') {
        setRuntimeError(e.data.message);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // --- 2. Actions ---
  const handlePublish = () => {
    if (!htmlCode.trim() && !cssCode.trim() && !jsCode.trim()) return;

    // LZ-Compression Protocol (Self-Sustaining)
    const code = compressToEncodedURIComponent(fullDocument);
    const link = window.location.origin + window.location.pathname + "#z=" + code;

    setPublishedLink(link);
    toast({ title: "Link Generated", description: "Compressed self-sustaining URL ready." });
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(label);
    toast({ title: "Copied to Clipboard" });
    setTimeout(() => setIsCopied(null), 2000);
  };

  const loadTemplate = (id: keyof typeof TEMPLATES) => {
    const t = TEMPLATES[id];
    setHtmlCode(t.html);
    setCssCode(t.css);
    setJsCode(t.js);
    toast({ title: "Template Active", description: `${id.toUpperCase()} protocol loaded.` });
  };

  const downloadHtml = () => {
    const blob = new Blob([fullDocument], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'studio_export.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setHtmlCode(TEMPLATES.blank.html);
    setCssCode(TEMPLATES.blank.css);
    setJsCode(TEMPLATES.blank.js);
    setPublishedLink(null);
    toast({ title: "Studio Reset" });
  };

  // --- 3. Render Logic ---

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
              Professional browser-side hosting. Convert code into an instant self-sustaining link via high-performance LZ-compression. No database required.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <GetHelp toolId="html-to-url" />
             <Button variant="outline" size="sm" onClick={handleReset} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive">
                <Trash2 className="w-3.5 h-3.5 mr-2" /> Reset
             </Button>
          </div>
        </div>
      </div>

      {/* Templates Bar */}
      <div className="mb-8 p-2 rounded-2xl bg-secondary/50 border border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
         {Object.keys(TEMPLATES).map((t) => (
            <button
              key={t}
              onClick={() => loadTemplate(t as any)}
              className="px-6 py-2.5 rounded-xl bg-background border border-border text-[9px] font-black uppercase tracking-widest hover:border-primary/40 hover:text-primary transition-all whitespace-nowrap"
            >
               {t} Protocol
            </button>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Editor Area */}
        <div className="lg:col-span-6 xl:col-span-7 space-y-6">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group min-h-[600px] flex flex-col">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <Tabs value={activeEditor} onValueChange={(v: any) => setActiveEditor(v)} className="flex-1 flex flex-col">
              <CardHeader className="pb-0 border-b border-border bg-secondary/30 pt-4 px-4">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <TabsList className="bg-background/50 border border-white/5 p-1 rounded-xl h-11 w-fit">
                      <TabsTrigger value="html" className="rounded-lg text-[9px] font-black uppercase px-6">HTML</TabsTrigger>
                      <TabsTrigger value="css" className="rounded-lg text-[9px] font-black uppercase px-6">CSS</TabsTrigger>
                      <TabsTrigger value="js" className="rounded-lg text-[9px] font-black uppercase px-6">JS</TabsTrigger>
                    </TabsList>
                    
                    <div className="flex items-center gap-2">
                       <Button variant="ghost" size="sm" onClick={() => setDebouncedFullHtml(fullDocument)} className="h-9 px-3 text-[8px] font-black uppercase bg-primary/10 text-primary border border-primary/20 rounded-lg">
                          <Play className="w-3.5 h-3.5 mr-2" /> Run
                       </Button>
                    </div>
                 </div>
              </CardHeader>
              
              <CardContent className="p-0 flex-1 flex flex-col">
                <div className="flex-1 relative overflow-hidden flex">
                  {/* Line Numbers Simulation */}
                  <div className="w-10 bg-black/20 border-r border-white/5 pt-8 flex flex-col items-center text-[10px] font-mono text-white/10 select-none no-scrollbar overflow-hidden shrink-0">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <div key={i} className="h-6 leading-6">{i + 1}</div>
                    ))}
                  </div>

                  <TabsContent value="html" className="flex-1 m-0">
                    <textarea 
                      value={htmlCode}
                      onChange={e => setHtmlCode(e.target.value)}
                      placeholder="<!-- HTML Matrix -->"
                      spellCheck={false}
                      className="w-full h-full p-8 bg-transparent text-sm font-mono text-foreground leading-6 resize-none focus:outline-none custom-scrollbar min-h-[400px]"
                    />
                  </TabsContent>
                  <TabsContent value="css" className="flex-1 m-0">
                    <textarea 
                      value={cssCode}
                      onChange={e => setCssCode(e.target.value)}
                      placeholder="/* CSS Protocol */"
                      spellCheck={false}
                      className="w-full h-full p-8 bg-transparent text-sm font-mono text-foreground leading-6 resize-none focus:outline-none custom-scrollbar min-h-[400px]"
                    />
                  </TabsContent>
                  <TabsContent value="js" className="flex-1 m-0">
                    <textarea 
                      value={jsCode}
                      onChange={e => setJsCode(e.target.value)}
                      placeholder="// JS Logic"
                      spellCheck={false}
                      className="w-full h-full p-8 bg-transparent text-sm font-mono text-foreground leading-6 resize-none focus:outline-none custom-scrollbar min-h-[400px]"
                    />
                  </TabsContent>
                </div>

                <div className="p-4 bg-black/20 border-t border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                         <FileCode className="w-3.5 h-3.5 text-primary" />
                         <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{activeEditor.toUpperCase()} Master</span>
                      </div>
                      <span className="text-[9px] font-mono text-white/10">{fullDocument.length} B</span>
                   </div>
                   <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={downloadHtml} className="h-8 px-3 text-[8px] font-black uppercase bg-white/5 hover:bg-white/10 rounded-lg">
                        <Download className="w-3 h-3 mr-2" /> .HTML
                      </Button>
                      <Button onClick={handlePublish} className="h-8 px-4 rounded-lg bg-primary text-white font-black text-[8px] uppercase tracking-widest shadow-lg">
                         <Save className="w-3 h-3 mr-2" /> Make Link
                      </Button>
                   </div>
                </div>
              </CardContent>
            </Tabs>
          </Card>
        </div>

        {/* Monitor Area */}
        <div className="lg:col-span-6 xl:col-span-5 space-y-6">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[400px] lg:min-h-[600px] bg-white">
            <CardHeader className="py-3 border-b border-border bg-secondary/30 shrink-0 flex flex-row items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                     <Eye className="w-4 h-4" />
                  </div>
                  <CardTitle className="text-[9px] font-black text-primary uppercase tracking-[0.4em]">Visual Monitor</CardTitle>
               </div>
               <div className="flex items-center gap-1.5 p-1 bg-background/50 rounded-lg border border-border">
                  <button onClick={() => setPreviewWidth('100%')} className={cn("p-1.5 rounded-md transition-all", previewWidth === '100%' ? "bg-primary text-white" : "text-foreground/20")}><Monitor className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setPreviewWidth('768px')} className={cn("p-1.5 rounded-md transition-all", previewWidth === '768px' ? "bg-primary text-white" : "text-foreground/20")}><Tablet className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setPreviewWidth('375px')} className={cn("p-1.5 rounded-md transition-all", previewWidth === '375px' ? "bg-primary text-white" : "text-foreground/20")}><Smartphone className="w-3.5 h-3.5" /></button>
               </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 relative overflow-hidden flex flex-col min-h-[360px] items-center bg-[#060608]">
                <div 
                  className="bg-white shadow-2xl transition-all duration-500 h-full"
                  style={{ width: previewWidth }}
                >
                  <iframe 
                    srcDoc={debouncedFullHtml}
                    title="Live Preview"
                    sandbox="allow-scripts allow-forms"
                    className="w-full h-full border-none bg-white block"
                  />
                </div>

                {runtimeError && (
                  <div className="absolute bottom-4 left-4 right-4 animate-in slide-in-from-bottom-4">
                     <div className="p-4 rounded-xl bg-red-600/90 backdrop-blur-xl border border-white/20 flex items-center gap-4 text-white shadow-2xl">
                        <AlertCircle className="w-5 h-5 shrink-0 animate-pulse" />
                        <div className="min-w-0">
                           <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Runtime Trace</p>
                           <p className="text-xs font-mono font-bold truncate uppercase">{runtimeError}</p>
                        </div>
                        <button onClick={() => setRuntimeError(null)} className="ml-auto text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
                     </div>
                  </div>
                )}
            </CardContent>
          </Card>

          {publishedLink && (
            <div className="p-8 rounded-[2.5rem] bg-emerald-500/10 border border-emerald-500/20 space-y-6 animate-in zoom-in duration-500 shadow-2xl">
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg">
                       <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em]">Self-Sustaining Protocol</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setPublishedLink(null)} className="h-6 w-6 rounded-full text-emerald-500/40 hover:text-emerald-500">
                    <X className="w-4 h-4" />
                  </Button>
              </div>
              <div className="p-4 bg-black/20 rounded-2xl border border-emerald-500/20 text-[10px] font-bold text-foreground break-all shadow-inner font-mono max-h-32 overflow-y-auto custom-scrollbar">
                {publishedLink}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={() => handleCopy(publishedLink, 'pub')} className="flex-1 h-14 bg-emerald-500 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-500/20">
                    {isCopied === 'pub' ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    Copy Short Link
                  </Button>
                  <Button onClick={() => window.open(publishedLink, '_blank')} variant="outline" className="flex-1 h-14 border-emerald-500/20 text-emerald-600 font-black uppercase text-[9px] bg-white/5">
                    Launch Page <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
             <div className="p-6 rounded-[2.5rem] bg-secondary border border-border flex items-start gap-5 group hover:bg-secondary/80 transition-all shadow-lg">
                <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[11px] font-black text-foreground uppercase tracking-widest">Database-Free Hosting</h4>
                  <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Your code is compressed and embedded directly into the URL hash. Your content is 100% portable and functions without a backend.
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
