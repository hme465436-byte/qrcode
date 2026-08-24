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
  ChevronRight,
  ChevronLeft,
  Undo2,
  Redo2,
  Minus,
  Maximize2,
  Minimize2,
  Replace,
  X,
  Menu,
  LogOut,
  ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';
import JSZip from 'jszip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface LocalFile {
  id: string;
  name: string;
  path: string;
  type: string;
  size: number;
  blob: Blob;
  content?: string;
  isDirty?: boolean;
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
  
  // Advanced Editor State
  const [activeEditId, setActiveEditId] = useState<string | null>(null);
  const [editBuffer, setEditBuffer] = useState('');
  const [editHistory, setEditHistory] = useState<string[]>([]);
  const [historyPointer, setHistoryPointer] = useState(-1);
  const [editorFontSize, setFontSize] = useState(13);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const assetInputRef = useRef<HTMLInputElement>(null);
  const editorTextareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

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
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | { target: { files: FileList } }, isCore = false) => {
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
        content,
        isDirty: false
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
    if ('value' in e.target) e.target.value = '';
  };

  const handleHtmlUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e, true);
  };

  const handleAssetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e, false);
  };

  // --- 3. Advanced Editor Logic ---
  
  const handleSelectFile = (item: LocalFile) => {
    if (item.content !== undefined) {
      setActiveEditId(item.id);
      setEditBuffer(item.content);
      setEditHistory([item.content]);
      setHistoryPointer(0);
      setSearchTerm('');
      setReplaceTerm('');
      setShowSearch(false);
    } else {
      toast({ title: "Non-Text Node", description: "Binary assets are protected from textual modification." });
    }
  };

  const onBufferChange = (val: string) => {
    setEditBuffer(val);
    const updatedHistory = editHistory.slice(0, historyPointer + 1);
    updatedHistory.push(val);
    if (updatedHistory.length > 50) updatedHistory.shift();
    setEditHistory(updatedHistory);
    setHistoryPointer(updatedHistory.length - 1);
    
    setAssets(prev => prev.map(a => a.id === activeEditId ? { ...a, isDirty: true } : a));
  };

  const handleUndo = () => {
    if (historyPointer > 0) {
      const nextPtr = historyPointer - 1;
      setHistoryPointer(nextPtr);
      setEditBuffer(editHistory[nextPtr]);
    }
  };

  const handleRedo = () => {
    if (historyPointer < editHistory.length - 1) {
      const nextPtr = historyPointer + 1;
      setHistoryPointer(nextPtr);
      setEditBuffer(editHistory[nextPtr]);
    }
  };

  const saveEdit = () => {
    if (!activeEditId) return;
    
    const updatedAssets = assets.map(a => {
      if (a.id === activeEditId) {
        const nextBlob = new Blob([editBuffer], { type: a.type });
        return { ...a, content: editBuffer, blob: nextBlob, size: nextBlob.size, isDirty: false };
      }
      return a;
    });

    setAssets(updatedAssets);
    
    const editedFile = updatedAssets.find(a => a.id === activeEditId);
    if (editedFile && editedFile.name.toLowerCase() === 'index.html') {
      setIndexHtml(editBuffer);
    }

    toast({ title: "Matrix Synchronized", description: "Node persisted to local buffer." });
  };

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const val = e.currentTarget.value;
      const next = val.substring(0, start) + "  " + val.substring(end);
      onBufferChange(next);
      setTimeout(() => {
        if (editorTextareaRef.current) {
          editorTextareaRef.current.selectionStart = editorTextareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveEdit();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      handleUndo();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      setShowSearch(true);
    }
  };

  const executeReplace = () => {
    if (!searchTerm) return;
    const next = editBuffer.split(searchTerm).join(replaceTerm);
    onBufferChange(next);
    toast({ title: "Find & Replace Executed" });
  };

  const lineNumbers = useMemo(() => {
    const lines = editBuffer.split('\n').length;
    return Array.from({ length: lines }, (_, i) => i + 1);
  }, [editBuffer]);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  // --- 4. Production ---
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
    assets.forEach(f => { zip.file(f.path, f.blob); });
    const readme = `[MY KIT TOOL - RESCUE BUNDLE]\nMode: ${mode.toUpperCase()}\nCreated: ${new Date().toLocaleString()}\n\nDeploy instructions:\n1. Extract ZIP\n2. Upload contents to Firebase, Vercel, or Netlify public root.`;
    zip.file("README_DEPLOY.txt", readme);
    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `mykit_site_bundle_${Date.now()}.zip`;
    link.click();
    setIsProcessing(false);
    toast({ title: "Production Packaged" });
  };

  const clearStudio = () => {
    setIndexHtml(''); setAssets([]); setReferences([]); setStep(1); setActiveEditId(null); setEditBuffer('');
    toast({ title: "Studio Reset" });
  };

  const stats = useMemo(() => ({
    total: references.length,
    missing: references.filter(r => r.status === 'missing').length,
    absolute: references.filter(r => r.status === 'absolute').length,
    fixed: references.filter(r => r.status === 'fixed' || r.status === 'ok').length,
  }), [references]);

  return (
    <div className={cn("container mx-auto px-4 sm:px-6 py-12 md:py-20 max-w-7xl transition-all duration-500", mode === 'update' && step === 2 && "max-w-full px-0 py-0 sm:px-0 sm:py-0")}>
      
      {/* 1. Dashboard UI (Standard) */}
      {(mode === 'simple' || step !== 2) && (
        <>
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

          <div className="flex justify-center mb-12">
            <div className="inline-flex p-1.5 rounded-[2rem] bg-secondary border border-white/5 shadow-2xl backdrop-blur-xl">
               <button onClick={() => setMode('simple')} className={cn("px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all", mode === 'simple' ? "bg-primary text-white shadow-xl scale-105" : "text-foreground/30 hover:text-foreground")}>Simple Rescue</button>
               <button onClick={() => setMode('update')} className={cn("px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all", mode === 'update' ? "bg-primary text-white shadow-xl scale-105" : "text-foreground/30 hover:text-foreground")}>Site Update</button>
            </div>
          </div>
        </>
      )}

      {/* 2. Step Wizard Column */}
      <div className={cn("grid grid-cols-1 gap-10 items-start", (mode === 'simple' || step !== 2) && "lg:grid-cols-12")}>
        
        {/* PROGRESS TRACKER */}
        {(mode === 'simple' || step !== 2) && (
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
                     <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner", step === item.s ? "bg-primary text-white" : step > item.s ? "bg-emerald-500 text-white" : "bg-background text-foreground/10")}>
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
        )}

        <div className={cn("lg:col-span-9 space-y-8 animate-in fade-in duration-1000", mode === 'update' && step === 2 && "lg:col-span-12 space-y-0")}>
           
           {/* PHASE 1: INTAKE */}
           {step === 1 && (
             <Card 
                className="glass-card border-border shadow-2xl p-12 text-center flex flex-col items-center gap-8 relative overflow-hidden bg-black/10 rounded-[2.5rem]"
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-primary/40'); }}
                onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-primary/40'); }}
                onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-primary/40'); if (e.dataTransfer.files) handleFileUpload({ target: { files: e.dataTransfer.files } } as any, true); }}
             >
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
                      <span className="text-[8px] font-black text-white/10 uppercase tracking-[0.5em]">OR PASTE SOURCE</span>
                      <div className="h-[1px] flex-1 bg-white/5" />
                   </div>
                   <div className="space-y-4">
                      <Textarea 
                        placeholder="Paste raw HTML source matrix..." 
                        value={indexHtml}
                        onChange={e => setIndexHtml(e.target.value)}
                        className="h-32 bg-secondary/30 border-white/10 rounded-2xl text-[11px] font-mono p-6 resize-none shadow-inner"
                      />
                      {indexHtml.trim() && (
                        <Button onClick={() => setStep(2)} className="h-12 w-full bg-white text-black font-black uppercase text-[9px] rounded-xl shadow-2xl">
                           Process Source <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                   </div>
                </div>
                <input type="file" ref={fileInputRef} accept=".html" onChange={handleHtmlUpload} className="hidden" />
             </Card>
           )}

           {/* PHASE 2: PROCESSING */}
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
                                {assets.length} Local Files Buffered
                              </div>
                          </div>
                          <Button onClick={executeFix} className="h-14 px-10 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all">
                              Normalize Path Matrix <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                    </CardContent>
                  </Card>
                ) : (
                  /* ADVANCED FULL-PAGE EDITOR UI */
                  <div className="fixed inset-0 z-[100] bg-[#0a0a0c] flex flex-col animate-in fade-in duration-500">
                     {/* Editor Top Bar */}
                     <div className="h-16 border-b border-white/5 bg-[#0a0a0c] flex items-center justify-between px-6 shrink-0 z-20">
                        <div className="flex items-center gap-6">
                           <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg bg-white/5 text-foreground/40 hover:text-white transition-all">
                              <Menu className="w-5 h-5" />
                           </button>
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20">
                                 <Edit3 className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                 <h2 className="text-sm font-black uppercase text-foreground truncate max-w-[300px]">
                                    {assets.find(a => a.id === activeEditId)?.name || 'Matrix Editor'}
                                 </h2>
                                 <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-[0.2em]">Sovereign Node Editing</p>
                              </div>
                              {assets.find(a => a.id === activeEditId)?.isDirty && (
                                 <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[7px] font-black uppercase tracking-widest px-2 ml-2">Unsaved</Badge>
                              )}
                           </div>
                        </div>

                        <div className="flex items-center gap-3">
                           <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 mr-4">
                              <button onClick={handleUndo} className="p-2 text-white/20 hover:text-primary"><Undo2 className="w-3.5 h-3.5" /></button>
                              <button onClick={handleRedo} className="p-2 text-white/20 hover:text-primary"><Redo2 className="w-3.5 h-3.5" /></button>
                           </div>

                           <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 mr-4 items-center">
                              <button onClick={() => setFontSize(s => Math.max(8, s - 1))} className="p-2 text-white/20 hover:text-white"><Minus className="w-3 h-3" /></button>
                              <span className="text-[9px] font-black text-white/10 w-8 text-center uppercase tracking-tighter">{editorFontSize}px</span>
                              <button onClick={() => setFontSize(s => Math.min(24, s + 1))} className="p-2 text-white/20 hover:text-white"><Plus className="w-3 h-3" /></button>
                           </div>

                           <Button onClick={saveEdit} className="h-10 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[9px] uppercase tracking-widest shadow-xl shadow-emerald-500/10 rounded-xl">
                              <Save className="w-3.5 h-3.5 mr-2" /> Save Node
                           </Button>
                           <Button onClick={() => setStep(3)} variant="outline" className="h-10 px-6 border-white/10 bg-white/5 text-white/40 text-[9px] font-black uppercase tracking-widest rounded-xl">
                              Finish Edits
                           </Button>
                        </div>
                     </div>

                     <div className="flex-1 flex overflow-hidden relative">
                        {/* Sidebar */}
                        <div className={cn(
                          "absolute lg:relative z-30 h-full w-[280px] bg-secondary/30 border-r border-white/5 flex flex-col transition-transform duration-500 ease-out",
                          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:-ml-[280px]"
                        )}>
                           <div className="p-4 border-b border-white/5">
                              <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.3em]">Project Matrix</p>
                           </div>
                           <div className="flex-1 overflow-auto custom-scrollbar p-3 space-y-1 bg-black/10">
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
                                   <div className="min-w-0 flex-1">
                                      <p className="text-[10px] font-bold truncate uppercase tracking-tight">{asset.name}</p>
                                      {asset.isDirty && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-0.5" />}
                                   </div>
                                </button>
                              ))}
                           </div>
                           <div className="p-4 border-t border-white/5 bg-black/20">
                              <button onClick={() => setShowLeaveConfirm(true)} className="flex items-center gap-3 text-[9px] font-black uppercase text-foreground/20 hover:text-red-500 transition-colors">
                                 <LogOut className="w-3.5 h-3.5" /> Abort Studio
                              </button>
                           </div>
                        </div>

                        {/* Editor Workspace */}
                        <div className="flex-1 flex flex-col overflow-hidden bg-[#060608] relative">
                           {/* Find/Replace Floating Bar */}
                           {showSearch && (
                             <div className="absolute top-4 right-8 z-40 animate-in slide-in-from-top-4 duration-300">
                                <Card className="p-4 glass-card border-primary/40 bg-card/95 shadow-2xl flex flex-col gap-4 w-[320px]">
                                   <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2 text-primary">
                                         <Search className="w-4 h-4" />
                                         <span className="text-[9px] font-black uppercase tracking-widest">Find & Replace</span>
                                      </div>
                                      <button onClick={() => setShowSearch(false)} className="text-foreground/20 hover:text-white"><X className="w-4 h-4" /></button>
                                   </div>
                                   <Input 
                                    value={searchTerm} 
                                    onChange={e => setSearchTerm(e.target.value)} 
                                    placeholder="Find string..." 
                                    className="h-10 bg-background border-white/10 text-xs font-mono" 
                                   />
                                   <Input 
                                    value={replaceTerm} 
                                    onChange={e => setReplaceTerm(e.target.value)} 
                                    placeholder="Replace with..." 
                                    className="h-10 bg-background border-white/10 text-xs font-mono" 
                                   />
                                   <Button onClick={executeReplace} className="h-10 bg-primary text-white text-[9px] font-black uppercase">Execute Global Replacement</Button>
                                </Card>
                             </div>
                           )}

                           <div className="flex-1 flex overflow-hidden">
                              {/* Line Numbers */}
                              <div 
                                ref={lineNumbersRef}
                                className="w-12 bg-black/40 border-r border-white/5 pt-10 flex flex-col items-center text-[10px] font-mono text-white/10 select-none overflow-hidden"
                              >
                                {lineNumbers.map(n => (
                                  <div key={n} className="h-6 leading-6">{n}</div>
                                ))}
                              </div>

                              <div className="flex-1 relative">
                                 {activeEditId ? (
                                   <textarea 
                                     ref={editorTextareaRef}
                                     value={editBuffer}
                                     onChange={e => onBufferChange(e.target.value)}
                                     onKeyDown={handleEditorKeyDown}
                                     onScroll={handleScroll}
                                     spellCheck={false}
                                     style={{ fontSize: `${editorFontSize}px` }}
                                     className="w-full h-full p-10 pt-10 bg-transparent text-foreground font-mono leading-6 resize-none focus:outline-none custom-scrollbar whitespace-pre"
                                   />
                                 ) : (
                                   <div className="h-full flex flex-col items-center justify-center gap-8 opacity-10">
                                      <FileEdit className="w-20 h-20 text-primary" />
                                      <p className="text-xl font-headline font-black uppercase tracking-[0.5em]">Select Node to Edit</p>
                                   </div>
                                 )}
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                )}
             </div>
           )}

           {/* PHASE 3: PRODUCTION */}
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
                      </div>
                   </Card>
                </div>
             </div>
           )}
        </div>
      </div>

      {/* Confirmation Modals */}
      <AlertDialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
        <AlertDialogContent className="glass-card border-white/10 rounded-[2.5rem] p-8 max-w-sm">
          <AlertDialogHeader className="space-y-4">
            <div className="w-16 h-16 rounded-[1.5rem] bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mx-auto">
               <ShieldAlert className="w-8 h-8" />
            </div>
            <AlertDialogTitle className="text-xl font-headline font-black text-foreground uppercase tracking-tight text-center">
               Terminate Session
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[11px] font-medium text-foreground/40 uppercase tracking-widest leading-relaxed text-center">
               Are you sure you want to abort the current studio session? All unsaved edits will be definitively purged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex flex-col sm:flex-row gap-3">
            <AlertDialogCancel className="h-12 flex-1 rounded-xl border-white/5 bg-white/5 text-[9px] font-black uppercase tracking-widest m-0">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => { setShowLeaveConfirm(false); setStep(1); setMode('simple'); }}
              className="h-12 flex-1 rounded-xl bg-destructive text-destructive-foreground font-black uppercase text-[9px] tracking-widest shadow-xl shadow-destructive/20"
            >
              Confirm Abort
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        textarea { caret-color: hsl(var(--primary)); }
      `}</style>
    </div>
  );
}
