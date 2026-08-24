"use client"

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  History, 
  Upload, 
  Download, 
  Trash2, 
  ShieldCheck, 
  Activity, 
  CheckCircle2, 
  FileCode, 
  FolderOpen, 
  Settings2, 
  ArrowRight, 
  AlertCircle, 
  Zap, 
  FileUp, 
  Globe, 
  Link as LinkIcon, 
  FileText, 
  ImageIcon, 
  FileJson, 
  Code2, 
  Check, 
  Save, 
  Loader2,
  ListFilter,
  Hammer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';
import JSZip from 'jszip';

interface LocalFile {
  id: string;
  name: string;
  path: string;
  type: string;
  size: number;
  blob: Blob;
}

interface AssetReference {
  id: string;
  tag: string;
  attr: string;
  originalValue: string;
  fixedValue: string;
  status: 'ok' | 'missing' | 'absolute' | 'fixed';
  type: 'script' | 'style' | 'image' | 'link';
}

export default function HtmlSiteRescuePage() {
  const { toast } = useToast();
  
  // File State
  const [indexHtml, setIndexHtml] = useState<string>('');
  const [assets, setAssets] = useState<LocalFile[]>([]);
  const [references, setReferences] = useState<AssetReference[]>([]);
  
  // UI State
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const assetInputRef = useRef<HTMLInputElement>(null);

  // --- 1. Analysis Engine ---
  const scanHtml = useCallback((html: string, currentAssets: LocalFile[]) => {
    if (!html) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const detected: AssetReference[] = [];

    // Helper to check if file exists in our buffer
    const findInAssets = (path: string) => {
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;
      return currentAssets.find(a => a.path === cleanPath || a.name === cleanPath);
    };

    const processElements = (selector: string, attr: string, type: AssetReference['type']) => {
      doc.querySelectorAll(selector).forEach(el => {
        const val = el.getAttribute(attr);
        if (!val) return;

        let status: AssetReference['status'] = 'ok';
        let fixed = val;

        if (val.startsWith('http') || val.startsWith('//')) {
          status = 'absolute';
        } else {
          // Normalize root paths to relative for portable hosting
          if (val.startsWith('/')) {
            fixed = val.slice(1);
            status = 'fixed';
          }
          
          if (!findInAssets(fixed)) {
            status = 'missing';
          }
        }

        detected.push({
          id: Math.random().toString(36).substr(2, 9),
          tag: el.tagName.toLowerCase(),
          attr,
          originalValue: val,
          fixedValue: fixed,
          status,
          type
        });
      });
    };

    processElements('script[src]', 'src', 'script');
    processElements('link[rel="stylesheet"]', 'href', 'style');
    processElements('img[src]', 'src', 'image');
    processElements('a[href]', 'href', 'link');

    setReferences(detected);
  }, []);

  useEffect(() => {
    if (indexHtml) scanHtml(indexHtml, assets);
  }, [indexHtml, assets, scanHtml]);

  // --- 2. Handlers ---
  const handleHtmlUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setIndexHtml(text);
        setStep(2);
        toast({ title: "Core Matrix Loaded", description: "index.html ready for analysis." });
      };
      reader.readAsText(file);
    }
  };

  const handleAssetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = Array.from(e.target.files || []);
    if (uploaded.length === 0) return;

    const newAssets: LocalFile[] = uploaded.map(f => ({
      id: Math.random().toString(36).substr(2, 9),
      name: f.name,
      path: f.webkitRelativePath || f.name,
      size: f.size,
      type: f.type,
      blob: f
    }));

    setAssets(prev => [...prev, ...newAssets]);
    toast({ title: "Assets Buffered", description: `Injected ${uploaded.length} nodes.` });
  };

  const executeFix = () => {
    let fixedHtml = indexHtml;
    references.forEach(ref => {
      if (ref.status === 'fixed' || ref.status === 'ok') {
        // Simple string replacement for valid/normalized paths
        // In a real app we'd use the DOM tree, but string replace is safer for preservation
        fixedHtml = fixedHtml.split(`"${ref.originalValue}"`).join(`"${ref.fixedValue}"`);
        fixedHtml = fixedHtml.split(`'${ref.originalValue}'`).join(`'${ref.fixedValue}'`);
      }
    });
    setIndexHtml(fixedHtml);
    setStep(3);
    toast({ title: "Matrix Optimized", description: "Path vectors normalized for hosting." });
  };

  const packageProject = async () => {
    setIsProcessing(true);
    const zip = new JSZip();
    
    // Add HTML
    zip.file("index.html", indexHtml);
    
    // Add Assets
    assets.forEach(f => {
      zip.file(f.path, f.blob);
    });

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `rescued_project_${Date.now()}.zip`;
    link.click();
    
    setIsProcessing(false);
    toast({ title: "Bundle Exported", description: "ZIP archive saved to local storage." });
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(id);
    setTimeout(() => setIsCopied(null), 2000);
  };

  const clearStudio = () => {
    setIndexHtml('');
    setAssets([]);
    setReferences([]);
    setStep(1);
    toast({ title: "Studio Reset" });
  };

  // --- 3. View Logic ---
  const stats = useMemo(() => ({
    total: references.length,
    missing: references.filter(r => r.status === 'missing').length,
    absolute: references.filter(r => r.status === 'absolute').length,
    fixed: references.filter(r => r.status === 'fixed' || r.status === 'ok').length,
  }), [references]);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <History className="w-3.5 h-3.5" /> Maintenance Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
                HTML Site <span className="text-primary italic">Rescue Studio</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional project re-packaging engine. Fix broken path identifiers and bundle local assets into sanitized production ZIPs for modern hosting providers.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="html-site-rescue" />
              {step > 1 && (
                <Button variant="outline" size="sm" onClick={clearStudio} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                  <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset Matrix
                </Button>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Progress Tracker Column */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
           <div className="flex flex-col gap-3">
              {[
                { s: 1, label: 'Intake Payload', desc: 'Import source matrix' },
                { s: 2, label: 'Clinical Scan', desc: 'Identify dependencies' },
                { s: 3, label: 'Pack Master', desc: 'Generate ZIP bundle' }
              ].map((item) => (
                <div key={item.s} className={cn(
                  "p-6 rounded-[2rem] border transition-all duration-500 flex items-center gap-5",
                  step === item.s ? "bg-primary/10 border-primary shadow-xl scale-105" : step > item.s ? "bg-emerald-500/10 border-emerald-500/20 opacity-60" : "bg-secondary/30 border-border opacity-40"
                )}>
                   <div className={cn(
                     "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner",
                     step === item.s ? "bg-primary text-white" : step > item.s ? "bg-emerald-500 text-white" : "bg-background text-foreground/10"
                   )}>
                      {step > item.s ? <CheckCircle2 className="w-6 h-6" /> : <span className="text-xs font-black">0{item.s}</span>}
                   </div>
                   <div className="min-w-0">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground">{item.label}</h4>
                      <p className="text-[9px] font-bold text-foreground/20 uppercase tracking-tighter truncate">{item.desc}</p>
                   </div>
                </div>
              ))}
           </div>

           <Card className="glass-card border-border shadow-xl">
              <CardHeader className="py-4 border-b border-white/5 bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-foreground">
                    <Activity className="w-4 h-4 text-primary" /> Matrix Intel
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                 <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                       <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">References</p>
                       <p className="text-xl font-headline font-black text-foreground">{stats.total}</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">Assets</p>
                       <p className="text-xl font-headline font-black text-primary">{assets.length}</p>
                    </div>
                 </div>
                 {stats.missing > 0 && (
                   <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <p className="text-[9px] font-bold text-amber-700 uppercase tracking-widest">{stats.missing} Broken Links Detected</p>
                   </div>
                 )}
              </CardContent>
           </Card>
        </aside>

        {/* Main Workspace Column */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-8 animate-in fade-in duration-1000">
           
           {/* Step 1: Upload */}
           {step === 1 && (
             <Card className="glass-card border-border shadow-2xl p-12 text-center flex flex-col items-center gap-8 relative overflow-hidden bg-black/10">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="w-20 h-20 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xl relative z-10">
                   <FileCode className="w-10 h-10" />
                </div>
                <div className="space-y-3 relative z-10">
                   <h2 className="text-2xl sm:text-4xl font-headline font-black text-foreground uppercase tracking-tight">Initialize Rescue Protocol</h2>
                   <p className="text-sm text-foreground/30 font-bold uppercase tracking-widest">Select your index.html or paste source code to begin</p>
                </div>
                
                <div className="w-full max-w-lg space-y-6 relative z-10">
                   <Button onClick={() => fileInputRef.current?.click()} className="h-16 w-full bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-primary/30">
                      <Upload className="w-5 h-5 mr-3" /> Select Local index.html
                   </Button>
                   <div className="flex items-center gap-4">
                      <div className="h-[1px] flex-1 bg-white/5" />
                      <span className="text-[8px] font-black text-white/10 uppercase tracking-[0.5em]">OR</span>
                      <div className="h-[1px] flex-1 bg-white/5" />
                   </div>
                   <div className="space-y-4">
                      <Textarea 
                        placeholder="Paste raw HTML source matrix..." 
                        value={indexHtml}
                        onChange={e => setIndexHtml(e.target.value)}
                        className="h-32 bg-secondary/30 border-white/10 rounded-2xl text-[11px] font-mono p-6 resize-none"
                      />
                      {indexHtml.trim() && (
                        <Button onClick={() => setStep(2)} className="h-12 w-full bg-white text-black font-black uppercase text-[9px] rounded-xl">
                           Process Source <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                   </div>
                </div>
                <input type="file" ref={fileInputRef} accept=".html" onChange={handleHtmlUpload} className="hidden" />
             </Card>
           )}

           {/* Step 2: Scan & Fix */}
           {step === 2 && (
             <div className="space-y-8 animate-in slide-in-from-right-8 duration-700">
                <Card className="glass-card border-border shadow-2xl">
                   <CardHeader className="py-6 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                            <Search className="w-5 h-5" />
                         </div>
                         <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Discovery Matrix</CardTitle>
                      </div>
                      <div className="flex items-center gap-3">
                         <Button onClick={() => assetInputRef.current?.click()} variant="outline" size="sm" className="h-9 px-4 rounded-xl border-dashed border-primary/20 bg-primary/5 text-primary text-[9px] font-black uppercase tracking-widest">
                            <Plus className="w-3.5 h-3.5 mr-2" /> Add Assets Folder
                         </Button>
                         <input type="file" ref={assetInputRef} multiple onChange={handleAssetUpload} className="hidden" />
                      </div>
                   </CardHeader>
                   <CardContent className="p-0">
                      <div className="divide-y divide-border max-h-[500px] overflow-auto custom-scrollbar">
                         {references.length === 0 ? (
                            <div className="p-20 text-center opacity-10">
                               <p className="text-[10px] font-black uppercase tracking-widest">No dependencies discovered</p>
                            </div>
                         ) : (
                           references.map(ref => (
                             <div key={ref.id} className="p-5 flex items-center justify-between group hover:bg-white/[0.02] transition-all">
                                <div className="flex items-center gap-5 min-w-0">
                                   <div className={cn(
                                     "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                                     ref.status === 'ok' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                     ref.status === 'fixed' ? "bg-primary/10 text-primary border-primary/20" :
                                     ref.status === 'absolute' ? "bg-secondary text-foreground/40 border-border" :
                                     "bg-red-500/10 text-red-500 border-red-500/20"
                                   )}>
                                      {ref.type === 'script' ? <FileCode className="w-5 h-5" /> :
                                       ref.type === 'style' ? <Zap className="w-5 h-5" /> :
                                       ref.type === 'image' ? <ImageIcon className="w-5 h-5" /> :
                                       <LinkIcon className="w-5 h-5" />}
                                   </div>
                                   <div className="min-w-0">
                                      <p className="text-[11px] font-bold text-foreground truncate uppercase">{ref.originalValue}</p>
                                      <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">{ref.tag}.{ref.attr} | Type: {ref.type}</p>
                                   </div>
                                </div>
                                <Badge className={cn(
                                  "text-[8px] font-black uppercase px-2 py-0.5",
                                  ref.status === 'ok' ? "bg-emerald-500/20 text-emerald-500" :
                                  ref.status === 'fixed' ? "bg-primary/20 text-primary" :
                                  ref.status === 'absolute' ? "bg-white/5 text-white/40" :
                                  "bg-red-500/20 text-red-500"
                                )}>
                                   {ref.status === 'ok' ? 'Verified' : ref.status === 'fixed' ? 'Normalized' : ref.status === 'absolute' ? 'Remote' : 'Missing'}
                                </Badge>
                             </div>
                           ))
                         )}
                      </div>
                      <div className="p-8 border-t border-border bg-secondary/10 flex justify-between items-center">
                         <div className="flex items-center gap-4">
                            <div className="px-3 py-1 rounded-lg bg-background border border-border text-[9px] font-black text-foreground/30 uppercase">
                               {assets.length} Local Files In Buffer
                            </div>
                         </div>
                         <Button onClick={executeFix} className="h-14 px-10 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all">
                            Normalize Path Matrix <ArrowRight className="w-4 h-4 ml-2" />
                         </Button>
                      </div>
                   </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex items-start gap-5">
                      <Zap className="w-10 h-10 text-primary/40 shrink-0" />
                      <div className="space-y-1">
                         <h4 className="text-[11px] font-black uppercase text-foreground">Portable Architecture</h4>
                         <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">Root-level identifiers (/) are automatically translated to relative paths to ensure your site functions on any hosting protocol.</p>
                      </div>
                   </div>
                   <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex items-start gap-5">
                      <ShieldCheck className="w-10 h-10 text-primary/40 shrink-0" />
                      <div className="space-y-1">
                         <h4 className="text-[11px] font-black uppercase text-foreground">Secure Re-Matricing</h4>
                         <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">All processing occurs 100% locally in your browser memory. Your site source and assets never touch our cloud nodes.</p>
                      </div>
                   </div>
                </div>
             </div>
           )}

           {/* Step 3: Download */}
           {step === 3 && (
             <div className="max-w-4xl mx-auto w-full space-y-8 animate-in zoom-in-95 duration-500">
                <Card className="glass-card border-emerald-500/20 bg-emerald-500/[0.02] shadow-2xl p-10 sm:p-16 text-center flex flex-col items-center gap-10">
                   <div className="w-24 h-24 rounded-[3rem] bg-emerald-500 text-white flex items-center justify-center shadow-[0_20px_50px_rgba(16,185,129,0.4)] border-4 border-white/10">
                      <CheckCircle2 className="w-12 h-12" />
                   </div>
                   <div className="space-y-3">
                      <h2 className="text-3xl sm:text-5xl font-headline font-black text-foreground uppercase tracking-tight">Production Ready</h2>
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em]">Matrix Unified & Sanitized</p>
                   </div>
                   
                   <div className="w-full max-w-sm space-y-4">
                      <Button onClick={packageProject} disabled={isProcessing} className="w-full h-20 bg-primary text-white font-black text-xl uppercase tracking-widest rounded-3xl shadow-xl shadow-primary/30 active:scale-95 transition-all">
                         {isProcessing ? <Loader2 className="w-8 h-8 animate-spin" /> : <Download className="w-8 h-8 mr-4" />}
                         Download project.zip
                      </Button>
                      <p className="text-[9px] text-foreground/20 font-bold uppercase tracking-tighter">Includes sanitized index.html and all buffered assets</p>
                   </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <Card className="glass-card border-border p-8 space-y-6">
                      <div className="flex items-center gap-3">
                         <Globe className="w-5 h-5 text-primary" />
                         <h4 className="text-[11px] font-black uppercase text-foreground">Firebase Protocol</h4>
                      </div>
                      <div className="p-4 bg-black/40 rounded-2xl border border-white/5 font-mono text-[10px] text-foreground/50 space-y-2">
                         <p>1. Initialize: firebase init</p>
                         <p>2. Select: Hosting</p>
                         <p>3. Move contents of ZIP to /public</p>
                         <p>4. Deploy: firebase deploy</p>
                      </div>
                      <Button variant="ghost" onClick={() => handleCopy("firebase init\nfirebase deploy", "fb")} className="h-9 w-full text-[8px] font-black uppercase tracking-widest border border-white/5 rounded-xl">
                         {isCopied === 'fb' ? 'Copied' : 'Copy CLI Matrix'}
                      </Button>
                   </Card>
                   <Card className="glass-card border-border p-8 space-y-6">
                      <div className="flex items-center gap-3">
                         <Zap className="w-5 h-5 text-primary" />
                         <h4 className="text-[11px] font-black uppercase text-foreground">Vercel / Netlify</h4>
                      </div>
                      <div className="space-y-4">
                         <p className="text-[11px] text-foreground/40 font-medium leading-relaxed uppercase">Drop the extracted folder into the deployment dashboard. Our normalized paths ensure instant visual calibration.</p>
                         <Button variant="ghost" onClick={() => handleCopy("https://vercel.com/new", "vercel")} className="h-9 w-full text-[8px] font-black uppercase tracking-widest border border-white/5 rounded-xl">
                            {isCopied === 'vercel' ? 'Copied' : 'Launch Dashboard'}
                         </Button>
                      </div>
                   </Card>
                </div>
             </div>
           )}
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
