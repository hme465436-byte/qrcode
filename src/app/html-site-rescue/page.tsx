"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  Hammer,
  Plus,
  RotateCcw,
  Search,
  LayoutGrid,
  Edit3,
  FileEdit,
  Type,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  content?: string; // Stored for text-based files
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
  
  // Studio Config
  const [mode, setMode] = useState<'simple' | 'update'>('simple');
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // File State
  const [indexHtml, setIndexHtml] = useState<string>('');
  const [assets, setAssets] = useState<LocalFile[]>([]);
  const [references, setReferences] = useState<AssetReference[]>([]);
  
  // Editor State
  const [activeEditId, setActiveEditId] = useState<string | null>(null);
  const [editBuffer, setEditBuffer] = useState('');
  
  // UI State
  const [isCopied, setIsCopied] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const assetInputRef = useRef<HTMLInputElement>(null);

  // --- 1. Analysis Engine ---
  const scanHtml = useCallback((html: string, currentAssets: LocalFile[]) => {
    if (!html) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const detected: AssetReference[] = [];

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
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isCore = false) => {
    const uploaded = Array.from(e.target.files || []);
    if (uploaded.length === 0) return;

    setIsProcessing(true);
    
    const newAssets: LocalFile[] = [];

    for (const f of uploaded) {
      const isText = f.type.includes('text') || f.type.includes('javascript') || f.type.includes('json') || f.name.endsWith('.css') || f.name.endsWith('.js');
      const content = isText ? await f.text() : undefined;
      
      const item: LocalFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: f.name,
        path: f.webkitRelativePath || f.name,
        size: f.size,
        type: f.type,
        blob: f,
        content
      };

      newAssets.push(item);

      if (isCore || f.name.toLowerCase() === 'index.html') {
        if (content) {
          setIndexHtml(content);
          setStep(2);
        }
      }
    }

    setAssets(prev => [...prev, ...newAssets]);
    toast({ title: "Signal Injected", description: `Synchronized ${uploaded.length} nodes.` });
    
    setIsProcessing(false);
    if (e.target) e.target.value = '';
  };

  const handleAssetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e, false);
  };

  const handleSelectFile = (item: LocalFile) => {
    if (item.content !== undefined) {
      setActiveEditId(item.id);
      setEditBuffer(item.content);
    } else {
      toast({ variant: "default", title: "Non-Text Node", description: "Binary assets cannot be edited in the linguistic studio." });
    }
  };

  const saveEdit = () => {
    if (!activeEditId) return;
    
    const updatedAssets = assets.map(a => {
      if (a.id === activeEditId) {
        const nextBlob = new Blob([editBuffer], { type: a.type });
        return { ...a, content: editBuffer, blob: nextBlob, size: nextBlob.size };
      }
      return a;
    });

    setAssets(updatedAssets);
    
    const editedFile = updatedAssets.find(a => a.id === activeEditId);
    if (editedFile && editedFile.name.toLowerCase() === 'index.html') {
      setIndexHtml(editedBuffer);
    }

    toast({ title: "Node Synchronized", description: "Modifications saved to memory." });
  };

  const executeFix = () => {
    let fixedHtml = indexHtml;
    references.forEach(ref => {
      if (ref.status === 'fixed' || ref.status === 'ok') {
        fixedHtml = fixedHtml.split(`"${ref.originalValue}"`).join(`"${ref.fixedValue}"`);
        fixedHtml = fixedHtml.split(`'${ref.originalValue}'`).join(`'${ref.fixedValue}'`);
      }
    });
    setIndexHtml(fixedHtml);
    
    setAssets(prev => prev.map(a => 
      a.name.toLowerCase() === 'index.html' ? { ...a, content: fixedHtml, blob: new Blob([fixedHtml], { type: 'text/html' }) } : a
    ));

    setStep(3);
    toast({ title: "Matrix Optimized", description: "Path vectors normalized for hosting." });
  };

  const packageProject = async () => {
    setIsProcessing(true);
    const zip = new JSZip();
    
    assets.forEach(f => {
      zip.file(f.path, f.blob);
    });

    const readme = `[MY KIT TOOL - RESCUE BUNDLE]\nMode: ${mode.toUpperCase()}\nCreated: ${new Date().toLocaleString()}\n\nDeploy instructions:\n1. Extract ZIP\n2. Upload contents to Firebase, Vercel, or Netlify public root.`;
    zip.file("README_DEPLOY.txt", readme);

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `mykit_site_${Date.now()}.zip`;
    link.click();
    
    setIsProcessing(false);
    toast({ title: "Production Packaged", description: "ZIP archive saved successfully." });
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(id);
    setTimeout(() => setIsCopied(null), 2000);
  };

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
                Professional project re-packaging engine. Fix broken path identifiers and update source code locally before generating sanitized production ZIPs.
              </p>
           </div>
        </div>
      </div>

      <div className="flex justify-center mb-12">
        <div className="inline-flex p-1.5 rounded-[2rem] bg-secondary border border-white/5 shadow-2xl backdrop-blur-xl">
           <button 
            onClick={() => setMode('simple')}
            className={cn(
              "px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
              mode === 'simple' ? "bg-primary text-white shadow-xl scale-105" : "text-foreground/30 hover:text-foreground"
            )}
           >
              Simple Rescue
           </button>
           <button 
            onClick={() => setMode('update')}
            className={cn(
              "px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
              mode === 'update' ? "bg-primary text-white shadow-xl scale-105" : "text-foreground/30 hover:text-foreground"
            )}
           >
              Site Update
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <aside className="lg:col-span-3 space-y-6">
           <div className="flex flex-col gap-3">
              {[
                { s: 1, label: 'Intake', desc: 'Import source' },
                { s: 2, label: mode === 'simple' ? 'Clinical Scan' : 'Update Studio', desc: mode === 'simple' ? 'Identify deps' : 'Edit nodes' },
                { s: 3, label: 'Production', desc: 'Generate bundle' }
              ].map((item) => (
                <div key={item.s} className={cn(
                  "p-6 rounded-[2rem] border transition-all duration-500 flex items-center gap-5",
                  step === item.s ? "bg-primary/10 border-primary shadow-xl scale-105" : step > item.s ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-secondary/30 border-border opacity-40"
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
                       <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">Refs</p>
                       <p className="text-xl font-headline font-black text-foreground">{stats.total}</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">Nodes</p>
                       <p className="text-xl font-headline font-black text-primary">{assets.length}</p>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </aside>

        <div className="lg:col-span-9 space-y-8 animate-in fade-in duration-1000">
           {step === 1 && (
             <Card 
                className="glass-card border-border shadow-2xl p-12 text-center flex flex-col items-center gap-8 relative overflow-hidden bg-black/10 rounded-[2.5rem]"
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-primary/40'); }}
                onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-primary/40'); }}
                onDrop={(e) => { 
                  e.preventDefault(); 
                  e.currentTarget.classList.remove('border-primary/40'); 
                  if (e.dataTransfer.files) handleFileUpload({ target: { files: e.dataTransfer.files } } as any); 
                }}
             >
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="w-20 h-20 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xl relative z-10">
                   <FileCode className="w-10 h-10" />
                </div>
                <div className="space-y-3 relative z-10">
                   <h2 className="text-2xl sm:text-4xl font-headline font-black text-foreground uppercase tracking-tight">Initialize Rescue Protocol</h2>
                   <p className="text-sm text-foreground/30 font-bold uppercase tracking-widest">Select your index.html or folder to begin</p>
                </div>
                
                <div className="w-full max-w-lg space-y-6 relative z-10">
                   <Button onClick={() => fileInputRef.current?.click()} className="h-16 w-full bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-primary/30">
                      <Upload className="w-5 h-5 mr-3" /> Select Local index.html
                   </Button>
                   <div className="flex items-center gap-4">
                      <div className="h-[1px] flex-1 bg-white/5" />
                      <span className="text-[8px] font-black text-white/10 uppercase tracking-[0.5em]">OR PASTE SOURCE</span>
                      <div className="h-[1px] flex-1 bg-white/5" />
                   </div>
                   <div className="space-y-4">
                      <Textarea 
                        placeholder="Paste raw HTML matrix here..." 
                        value={indexHtml}
                        onChange={e => setIndexHtml(e.target.value)}
                        className="h-40 bg-secondary/30 border-white/10 rounded-2xl text-[11px] font-mono p-6 resize-none shadow-inner"
                      />
                      {indexHtml.trim() && (
                        <Button onClick={() => setStep(2)} className="h-12 w-full bg-white text-black font-black uppercase text-[9px] rounded-xl shadow-2xl">
                           Process Source <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                   </div>
                </div>
                <input type="file" ref={fileInputRef} accept=".html" onChange={handleFileUpload} className="hidden" />
             </Card>
           )}

           {step === 2 && (
             <div className="space-y-8 animate-in slide-in-from-right-8 duration-700">
                {mode === 'simple' ? (
                  <Card className="glass-card border-border shadow-2xl">
                    <CardHeader className="py-6 border-b border-border bg-secondary/30 flex flex-row items-center justify-between shrink-0 px-6 sm:px-10">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                              <Search className="w-5 h-5" />
                          </div>
                          <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Discovery Matrix</CardTitle>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button onClick={() => assetInputRef.current?.click()} variant="outline" size="sm" className="h-9 px-4 rounded-xl border-dashed border-primary/20 bg-primary/5 text-primary text-[9px] font-black uppercase tracking-widest">
                              <Plus className="w-3.5 h-3.5 mr-2" /> Add Assets
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
                                {assets.length} Buffered Nodes
                              </div>
                          </div>
                          <Button onClick={executeFix} className="h-14 px-10 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all">
                              Normalize Path Matrix <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px]">
                     {/* File List - Left */}
                     <Card className="lg:col-span-4 glass-card border-border flex flex-col overflow-hidden">
                        <CardHeader className="py-4 border-b border-white/5 bg-secondary/20">
                           <CardTitle className="text-[10px] font-black uppercase text-foreground/40 tracking-widest flex items-center gap-3">
                              <LayoutGrid className="w-3.5 h-3.5 text-primary" /> Directory Tree
                           </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 overflow-auto custom-scrollbar max-h-80 bg-black/10">
                           <div className="space-y-1">
                              {assets.map(asset => (
                                <button
                                  key={asset.id}
                                  onClick={() => handleSelectFile(asset)}
                                  className={cn(
                                    "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all",
                                    activeEditId === asset.id ? "bg-primary/10 border border-primary/20 text-primary" : "text-foreground/30 hover:bg-white/5"
                                  )}
                                >
                                   <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                                      {asset.content !== undefined ? <FileCode className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                                   </div>
                                   <span className="text-[10px] font-bold truncate uppercase tracking-tight">{asset.name}</span>
                                </button>
                              ))}
                           </div>
                        </CardContent>
                        <div className="p-4 border-t border-white/5 mt-auto">
                           <Button onClick={() => setStep(3)} className="w-full h-11 bg-primary text-white font-black uppercase text-[9px] rounded-xl shadow-lg">Finish Edits <ChevronRight className="w-3.5 h-3.5 ml-2" /></Button>
                        </div>
                     </Card>

                     {/* Editor - Right */}
                     <Card className="lg:col-span-8 glass-card border-border flex flex-col overflow-hidden bg-black/40">
                        {activeEditId ? (
                           <>
                              <CardHeader className="py-4 border-b border-white/5 bg-secondary/30 flex flex-row items-center justify-between px-6">
                                 <div className="flex items-center gap-3">
                                    <Edit3 className="w-4 h-4 text-primary" />
                                    <span className="text-[10px] font-black uppercase text-foreground truncate max-w-[200px]">{assets.find(a => a.id === activeEditId)?.name}</span>
                                 </div>
                                 <Button onClick={saveEdit} size="sm" className="h-8 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-[8px] tracking-widest shadow-lg">
                                    <Save className="w-3 h-3 mr-1.5" /> Save Node
                                 </Button>
                              </CardHeader>
                              <CardContent className="flex-1 p-0 relative">
                                 <textarea 
                                    value={editBuffer}
                                    onChange={e => setEditBuffer(e.target.value)}
                                    spellCheck={false}
                                    className="w-full h-full p-8 bg-transparent text-foreground font-mono text-xs leading-relaxed resize-none focus:outline-none custom-scrollbar"
                                 />
                              </CardContent>
                           </>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center gap-6 opacity-10">
                             <FileEdit className="w-16 h-16 text-primary" />
                             <p className="text-[10px] font-black uppercase tracking-widest">Select a text node to update</p>
                          </div>
                        )}
                     </Card>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex items-start gap-5 group hover:bg-secondary/80 transition-all">
                      <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                         <Zap className="w-7 h-7" />
                      </div>
                      <div className="space-y-1">
                         <h4 className="text-[11px] font-black uppercase text-foreground">Portable Architecture</h4>
                         <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">Root-level identifiers (/) are automatically translated to relative paths to ensure your site functions on any hosting protocol.</p>
                      </div>
                   </div>
                   <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex items-start gap-5 group hover:bg-secondary/80 transition-all">
                      <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                         <ShieldCheck className="w-7 h-7" />
                      </div>
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
                      <p className="text-[9px] text-foreground/20 font-bold uppercase tracking-tighter">Includes sanitized index.html and {assets.length - 1} buffered assets</p>
                   </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <Card className="glass-card border-border p-8 space-y-6 group hover:border-primary/20 transition-all">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary shadow-inner">
                            <Globe className="w-5 h-5" />
                         </div>
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
                   <Card className="glass-card border-border p-8 space-y-6 group hover:border-primary/20 transition-all">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary shadow-inner">
                            <Zap className="w-5 h-5" />
                         </div>
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

