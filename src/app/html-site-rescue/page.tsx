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
  FileArchive,
  ChevronRight,
  ChevronDown,
  Maximize2,
  Box,
  Layout,
  Terminal,
  FileSignature,
  Settings,
  Eye,
  ShieldAlert,
  ArrowRightLeft,
  MousePointer2,
  TableProperties
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';
import JSZip from 'jszip';

// --- Types ---
interface LocalFile {
  id: string;
  name: string;
  path: string;
  type: string;
  size: number;
  content: string | ArrayBuffer;
  isHtml: boolean;
  blob: Blob;
}

interface AssetReference {
  id: string;
  sourceFile: string; // The HTML file containing this ref
  tag: string;
  attr: string;
  originalValue: string;
  fixedValue: string;
  status: 'ok' | 'missing' | 'absolute' | 'fixed' | 'inline';
  type: 'script' | 'style' | 'image' | 'link' | 'font' | 'manifest' | 'other';
}

type TransformationMode = 'relative' | 'firebase' | 'absolute';

export default function HtmlSiteRescuePage() {
  const { toast } = useToast();
  
  // State Matrix
  const [projectFiles, setProjectFiles] = useState<Map<string, LocalFile>>(new Map());
  const [references, setReferences] = useState<AssetReference[]>([]);
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Input Matrix (Raw Paste)
  const [indexHtml, setIndexHtml] = useState('');

  // Transformation Settings
  const [transMode, setTransMode] = useState<TransformationMode>('relative');
  const [localizeExternal, setLocalizeExternal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  
  // UI State
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [activeHtmlFile, setActiveHtmlFile] = useState<string | null>(null);
  const [expandedNodes, setExpandedIds] = useState<Set<string>>(new Set());

  const fileInputRef = useRef<HTMLInputElement>(null);
  const assetInputRef = useRef<HTMLInputElement>(null);

  // --- 1. Analysis Engine ---
  const scanProject = useCallback((filesMap: Map<string, LocalFile>) => {
    const detected: AssetReference[] = [];
    const htmlFiles = Array.from(filesMap.values()).filter(f => f.isHtml);

    if (htmlFiles.length === 0) return;

    // Helper to check if file exists in our buffer
    const findInAssets = (path: string, currentPath: string) => {
      // 1. Normalize path
      let cleanPath = path.startsWith('/') ? path.slice(1) : path;
      if (cleanPath.startsWith('./')) cleanPath = cleanPath.slice(2);
      
      // 2. Resolve relative navigation (../)
      const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/'));
      const segments = (currentDir ? currentDir + '/' : '') + cleanPath;
      const parts = segments.split('/');
      const stack = [];
      for (const part of parts) {
        if (part === '..') stack.pop();
        else if (part !== '.' && part !== '') stack.push(part);
      }
      const resolved = stack.join('/');

      return filesMap.has(resolved) || filesMap.has(cleanPath);
    };

    htmlFiles.forEach(htmlFile => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlFile.content as string, 'text/html');

      const processElements = (selector: string, attr: string, type: AssetReference['type']) => {
        doc.querySelectorAll(selector).forEach(el => {
          const val = el.getAttribute(attr);
          if (!val) return;

          let status: AssetReference['status'] = 'ok';
          let fixed = val;

          if (val.startsWith('data:')) {
            status = 'inline';
          } else if (val.startsWith('http') || val.startsWith('//')) {
            status = 'absolute';
          } else {
            // Normalization logic based on mode
            if (transMode === 'relative') {
              if (val.startsWith('/')) fixed = val.slice(1);
            } else if (transMode === 'firebase') {
              if (!val.startsWith('/')) fixed = '/' + val;
            } else if (transMode === 'absolute') {
              if (!val.startsWith('/')) fixed = '/' + val;
            }
            
            if (!findInAssets(val, htmlFile.path)) {
              status = 'missing';
            } else if (fixed !== val) {
              status = 'fixed';
            }
          }

          detected.push({
            id: Math.random().toString(36).substr(2, 9),
            sourceFile: htmlFile.path,
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
      processElements('link[rel*="icon"]', 'href', 'manifest');
      processElements('link[rel="manifest"]', 'href', 'manifest');
      processElements('img[src]', 'src', 'image');
      processElements('video[src]', 'src', 'other');
      processElements('source[src]', 'src', 'other');
      processElements('a[href]', 'href', 'link');
    });

    setReferences(detected);
    if (!activeHtmlFile && htmlFiles.length > 0) {
      setActiveHtmlFile(htmlFiles[0].path);
    }
  }, [transMode, activeHtmlFile]);

  useEffect(() => {
    if (projectFiles.size > 0) scanProject(projectFiles);
  }, [projectFiles, scanProject]);

  // --- 2. Handlers ---
  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = Array.from(e.target.files || []);
    if (uploaded.length === 0) return;

    setIsProcessing(true);
    const newMap = new Map(projectFiles);

    for (const file of uploaded) {
      // webkitRelativePath allows folder uploads
      const path = file.webkitRelativePath || file.name;
      const isHtml = file.name.toLowerCase().endsWith('.html');
      
      const content = isHtml ? await file.text() : await file.arrayBuffer();

      newMap.set(path, {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        path,
        type: file.type,
        size: file.size,
        content,
        isHtml,
        blob: file
      });
    }

    setProjectFiles(newMap);
    setStep(2);
    setIsProcessing(false);
    toast({ title: "Project Sync", description: `Synchronized ${uploaded.length} assets with local buffer.` });
  };

  const handleManualReplace = () => {
    if (!searchQuery.trim()) return;
    setIsProcessing(true);

    const nextMap = new Map(projectFiles);
    let changed = 0;

    nextMap.forEach((file, path) => {
      if (file.isHtml) {
        const original = file.content as string;
        const result = original.split(searchQuery).join(replaceQuery);
        if (result !== original) {
          nextMap.set(path, { ...file, content: result });
          changed++;
        }
      }
    });

    setProjectFiles(nextMap);
    setIsProcessing(false);
    toast({ title: "Manual Override Complete", description: `Injected changes into ${changed} HTML file(s).` });
  };

  const applyGlobalFix = () => {
    setIsProcessing(true);
    const nextMap = new Map(projectFiles);

    nextMap.forEach((file, path) => {
      if (file.isHtml) {
        let text = file.content as string;
        const fileRefs = references.filter(r => r.sourceFile === path);
        
        fileRefs.forEach(ref => {
          if (ref.status === 'fixed' || ref.status === 'missing') {
             text = text.split(`"${ref.originalValue}"`).join(`"${ref.fixedValue}"`);
             text = text.split(`'${ref.originalValue}'`).join(`'${ref.fixedValue}'`);
          }
        });
        
        nextMap.set(path, { ...file, content: text });
      }
    });

    setProjectFiles(nextMap);
    setStep(3);
    setIsProcessing(false);
    toast({ title: "Studio Master Optimized", description: "All internal path vectors normalized." });
  };

  const packageProject = async () => {
    setIsProcessing(true);
    setProgress(0);
    const zip = new JSZip();
    
    const entries = Array.from(projectFiles.values());
    for (let i = 0; i < entries.length; i++) {
      const f = entries[i];
      zip.file(f.path, f.content);
      setProgress(Math.round(((i + 1) / entries.length) * 100));
    }

    // Include README.txt
    const readme = `[MY KIT TOOL - RESCUE BUNDLE]
Created: ${new Date().toLocaleString()}

DEPLOYMENT INSTRUCTIONS:
-----------------------
1. Extract contents to your local hosting directory.
2. For Firebase: Use "firebase init" then select "Hosting". Move contents to your public folder.
3. For Vercel/Netlify: Drag and drop the extracted folder into the dashboard.

TECHNICAL NOTE:
All paths have been normalized to ${transMode.toUpperCase()} standard.
Total Files: ${entries.length}
Linguistic Nodes: ${entries.filter(e => e.isHtml).length}
-----------------------`;
    zip.file("STUDIO_README.txt", readme);

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `rescued_site_${Date.now()}.zip`;
    link.click();
    
    setIsProcessing(false);
    toast({ title: "Bundle Exported", description: "Sanitized project ZIP saved successfully." });
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const clearStudio = () => {
    setProjectFiles(new Map());
    setReferences([]);
    setStep(1);
    setSearchQuery('');
    setReplaceQuery('');
    setIndexHtml('');
    toast({ title: "Studio Reset" });
  };

  // --- 3. View Logic ---
  const stats = useMemo(() => ({
    total: references.length,
    missing: references.filter(r => r.status === 'missing').length,
    absolute: references.filter(r => r.status === 'absolute').length,
    fixed: references.filter(r => r.status === 'fixed' || r.status === 'ok').length,
    html: Array.from(projectFiles.values()).filter(f => f.isHtml).length,
    assets: Array.from(projectFiles.values()).filter(f => !f.isHtml).length,
    totalSize: Array.from(projectFiles.values()).reduce((a, b) => a + b.size, 0)
  }), [references, projectFiles]);

  const previewDoc = useMemo(() => {
    if (!activeHtmlFile || !projectFiles.has(activeHtmlFile)) return '';
    const file = projectFiles.get(activeHtmlFile)!;
    let html = file.content as string;

    // Inject temporary blob URLs for preview fidelity
    projectFiles.forEach((f, path) => {
      if (f.isHtml) return;
      const url = URL.createObjectURL(f.blob);
      // Escape for regex
      const escapedPath = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(src|href)=["'](.*${escapedPath})["']`, 'g');
      html = html.replace(regex, `$1="${url}"`);
    });

    return html;
  }, [activeHtmlFile, projectFiles]);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <History className="w-3.5 h-3.5" /> Maintenance Suite Pro
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div className="min-w-0">
              <h1 className="text-3xl md:text-5xl lg:text-7xl font-headline font-black text-foreground uppercase tracking-tight leading-[0.95]">
                HTML Site <span className="text-primary italic">Rescue Studio</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional-grade project re-matricing. Reconstruct directory structures, repair broken paths, and bundle local assets into high-fidelity production archives.
              </p>
           </div>
           <div className="flex items-center gap-3 shrink-0 pb-2">
              <GetHelp toolId="html-site-rescue" />
              {step > 1 && (
                <Button variant="outline" size="sm" onClick={clearStudio} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                  <RotateCcw className="w-3.5 h-3.5 mr-2" /> Purge Matrix
                </Button>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Stepper Column */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
           <div className="flex flex-col gap-3">
              {[
                { s: 1, label: 'Intake Payload', desc: 'Import source matrix' },
                { s: 2, label: 'Clinical Scan', desc: 'Analyze dependencies' },
                { s: 3, label: 'Pack Master', desc: 'Synthesize production ZIP' }
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
                       <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">HTML Nodes</p>
                       <p className="text-xl font-headline font-black text-foreground">{stats.html}</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">Binary Assets</p>
                       <p className="text-xl font-headline font-black text-primary">{stats.assets}</p>
                    </div>
                 </div>
                 {stats.missing > 0 && (
                   <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <p className="text-[9px] font-bold text-amber-700 uppercase tracking-widest">{stats.missing} Broken Links Detected</p>
                   </div>
                 )}
                 <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[8px] font-black uppercase text-foreground/20">Total Density</span>
                    <span className="text-[10px] font-mono font-bold text-foreground/40">{(stats.totalSize / 1024 / 1024).toFixed(2)} MB</span>
                 </div>
              </CardContent>
           </Card>
        </aside>

        {/* Main Workspace */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-8 animate-in fade-in duration-1000">
           
           {/* Step 1: Upload */}
           {step === 1 && (
             <Card className="glass-card border-border shadow-2xl p-12 text-center flex flex-col items-center gap-8 relative overflow-hidden bg-black/10 rounded-[3.5rem]">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="w-24 h-24 rounded-[3rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xl relative z-10">
                   <FileCode className="w-12 h-12" />
                </div>
                <div className="space-y-3 relative z-10">
                   <h2 className="text-2xl sm:text-4xl font-headline font-black text-foreground uppercase tracking-tight">Initialize Project Extraction</h2>
                   <p className="text-sm text-foreground/30 font-bold uppercase tracking-widest">Import your local files or entire project folder</p>
                </div>
                
                <div className="w-full max-w-lg space-y-6 relative z-10">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Button onClick={() => fileInputRef.current?.click()} className="h-20 w-full bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-3xl shadow-xl shadow-primary/30">
                        <Upload className="w-6 h-6 mr-3" /> Select Files
                      </Button>
                      <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="h-20 w-full bg-white/5 border-white/10 text-white font-black uppercase text-[10px] tracking-widest rounded-3xl">
                        <FolderOpen className="w-6 h-6 mr-3" /> Import Folder
                      </Button>
                   </div>
                   
                   <div className="flex items-center gap-4 py-2">
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
                        <Button onClick={() => {
                          const newMap = new Map();
                          newMap.set('index.html', {
                            id: 'idx-1',
                            name: 'index.html',
                            path: 'index.html',
                            type: 'text/html',
                            size: indexHtml.length,
                            content: indexHtml,
                            isHtml: true,
                            blob: new Blob([indexHtml], { type: 'text/html' })
                          });
                          setProjectFiles(newMap);
                          setStep(2);
                        }} className="h-14 w-full bg-white text-black font-black uppercase text-[10px] rounded-2xl shadow-2xl active:scale-95 transition-all">
                           Initialize Matrix Scan <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                   </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  multiple 
                  // @ts-ignore - Support folder upload
                  webkitdirectory="" 
                  directory="" 
                  onChange={handleBulkUpload} 
                  className="hidden" 
                />
             </Card>
           )}

           {/* Step 2: Scan & Fix */}
           {step === 2 && (
             <div className="space-y-8 animate-in slide-in-from-right-8 duration-700">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                   {/* Results List */}
                   <Card className="xl:col-span-8 glass-card border-border shadow-2xl flex flex-col">
                      <CardHeader className="py-6 border-b border-border bg-secondary/30 flex flex-row items-center justify-between shrink-0 px-6 sm:px-10">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                               <Search className="w-5 h-5" />
                            </div>
                            <div>
                               <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Discovery Matrix</CardTitle>
                               <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">{references.length} Identifiers traced</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-3">
                            <Button onClick={() => assetInputRef.current?.click()} variant="outline" size="sm" className="h-9 px-4 rounded-xl border-dashed border-primary/20 bg-primary/5 text-primary text-[9px] font-black uppercase tracking-widest">
                               <Plus className="w-3.5 h-3.5 mr-2" /> Inject Assets
                            </Button>
                            <input type="file" ref={assetInputRef} multiple onChange={handleBulkUpload} className="hidden" />
                         </div>
                      </CardHeader>
                      <CardContent className="p-0 flex-1 overflow-hidden">
                         <div className="divide-y divide-border max-h-[600px] overflow-auto custom-scrollbar">
                            {references.length === 0 ? (
                               <div className="p-20 text-center opacity-10 space-y-4">
                                  <Activity className="w-12 h-12 mx-auto" />
                                  <p className="text-[10px] font-black uppercase tracking-widest">Zero dependencies detected</p>
                               </div>
                            ) : (
                              references.map(ref => (
                                <div key={ref.id} className="p-5 flex items-center justify-between group hover:bg-white/[0.02] transition-all">
                                   <div className="flex items-center gap-5 min-w-0">
                                      <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all",
                                        ref.status === 'ok' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                        ref.status === 'fixed' ? "bg-primary/10 text-primary border-primary/20" :
                                        ref.status === 'absolute' ? "bg-secondary text-foreground/40 border-border" :
                                        "bg-red-500/10 text-red-500 border-red-500/20"
                                      )}>
                                         {ref.type === 'script' ? <FileCode className="w-5 h-5" /> :
                                          ref.type === 'style' ? <Zap className="w-5 h-5" /> :
                                          ref.type === 'image' ? <ImageIcon className="w-5 h-5" /> :
                                          ref.type === 'manifest' ? <Box className="w-5 h-5" /> :
                                          <LinkIcon className="w-5 h-5" />}
                                      </div>
                                      <div className="min-w-0">
                                         <p className="text-[11px] font-bold text-foreground truncate uppercase">{ref.originalValue}</p>
                                         <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest truncate">{ref.sourceFile} » {ref.tag}.{ref.attr}</p>
                                      </div>
                                   </div>
                                   <Badge className={cn(
                                     "text-[8px] font-black uppercase px-2 py-0.5 rounded-md",
                                     ref.status === 'ok' ? "bg-emerald-500/20 text-emerald-500" :
                                     ref.status === 'fixed' ? "bg-primary/20 text-primary" :
                                     ref.status === 'absolute' ? "bg-white/5 text-white/40" :
                                     "bg-red-500/20 text-red-500"
                                   )}>
                                      {ref.status === 'ok' ? 'Verified' : ref.status === 'fixed' ? 'Normalized' : ref.status === 'absolute' ? 'CDN/Remote' : 'Missing'}
                                   </Badge>
                                </div>
                              ))
                            )}
                         </div>
                      </CardContent>
                   </Card>

                   {/* Sidebar Tools */}
                   <div className="xl:col-span-4 space-y-6">
                      <Card className="glass-card border-border shadow-xl">
                         <CardHeader className="py-6 border-b border-white/5 bg-secondary/20">
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-3">
                               <Hammer className="w-4 h-4" /> Path Lab
                            </CardTitle>
                         </CardHeader>
                         <CardContent className="p-6 space-y-8">
                            <div className="space-y-4">
                               <Label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest ml-1">Transformation Protocol</Label>
                               <div className="grid grid-cols-1 gap-2">
                                  {[
                                    { id: 'relative', label: 'Relative (Portable)', desc: 'Remove leading /' },
                                    { id: 'firebase', label: 'Firebase Standard', desc: 'Prepend /public/' },
                                    { id: 'absolute', label: 'Root Absolute', desc: 'Force leading /' },
                                  ].map((m) => (
                                    <button
                                      key={m.id}
                                      onClick={() => setTransMode(m.id as any)}
                                      className={cn(
                                        "flex flex-col items-start gap-1 p-4 rounded-2xl border transition-all text-left",
                                        transMode === m.id ? "bg-primary text-white border-primary shadow-lg" : "bg-secondary/30 border-border text-foreground/40 hover:border-primary/20"
                                      )}
                                    >
                                       <span className="text-[10px] font-black uppercase tracking-widest">{m.label}</span>
                                       <span className={cn("text-[8px] font-bold opacity-60 uppercase", transMode === m.id ? "text-white" : "text-foreground/30")}>{m.desc}</span>
                                    </button>
                                  ))}
                               </div>
                            </div>

                            <div className="pt-6 border-t border-white/5 space-y-4">
                               <Label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest ml-1">Manual Path Replace</Label>
                               <div className="space-y-3">
                                  <Input 
                                    placeholder="Search string..." 
                                    value={searchQuery} 
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="h-10 bg-secondary/50 border-border text-[10px] font-bold uppercase" 
                                  />
                                  <div className="flex items-center justify-center py-1 opacity-20"><ArrowRightLeft className="w-3.5 h-3.5" /></div>
                                  <Input 
                                    placeholder="Replacement..." 
                                    value={replaceQuery} 
                                    onChange={e => setReplaceQuery(e.target.value)}
                                    className="h-10 bg-secondary/50 border-border text-[10px] font-bold uppercase" 
                                  />
                                  <Button onClick={handleManualReplace} disabled={!searchQuery} variant="outline" className="w-full h-10 bg-primary/5 text-primary border-primary/20 text-[9px] font-black uppercase rounded-xl">Execute Override</Button>
                               </div>
                            </div>
                         </CardContent>
                      </Card>

                      <Card className="glass-card border-border shadow-xl">
                         <CardHeader className="py-4 border-b border-white/5 bg-secondary/20">
                            <CardTitle className="text-[10px] font-black uppercase text-foreground/40 tracking-widest flex items-center gap-3">
                               <LayoutGrid className="w-3.5 h-3.5 text-primary" /> Directory Tree
                            </CardTitle>
                         </CardHeader>
                         <CardContent className="p-4 overflow-auto custom-scrollbar max-h-80 bg-black/10">
                            <div className="space-y-1">
                               {Array.from(projectFiles.keys()).sort().map((path) => {
                                 const f = projectFiles.get(path)!;
                                 return (
                                   <div key={path} className="flex items-center gap-3 py-1.5 px-3 rounded-lg hover:bg-white/5 group transition-all">
                                      {f.isHtml ? <Layout className="w-3.5 h-3.5 text-orange-500" /> : <FileSignature className="w-3.5 h-3.5 text-primary/40" />}
                                      <span className="text-[10px] font-bold text-foreground/60 truncate uppercase tracking-tighter">{path}</span>
                                      <span className="ml-auto text-[8px] font-mono text-foreground/10 opacity-0 group-hover:opacity-100">{(f.size/1024).toFixed(1)}K</span>
                                   </div>
                                 );
                               })}
                            </div>
                         </CardContent>
                      </Card>
                   </div>
                </div>

                <div className="p-8 rounded-[3rem] bg-primary/5 border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-8">
                   <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20">
                         <Check className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                         <h4 className="text-xl font-headline font-black text-foreground uppercase tracking-tight">Optimization Ready</h4>
                         <p className="text-[9px] font-black uppercase text-primary/40 tracking-[0.2em]">{stats.fixed} Identifiers will be normalized</p>
                      </div>
                   </div>
                   <Button onClick={applyGlobalFix} className="h-16 px-12 bg-primary text-white font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-2xl shadow-primary/30 active:scale-95 transition-all">
                      Normalize Project Matrix <ArrowRight className="w-4 h-4 ml-3" />
                   </Button>
                </div>
             </div>
           )}

           {/* Step 3: Package & Preview */}
           {step === 3 && (
             <div className="space-y-10 animate-in zoom-in-95 duration-500">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
                   {/* Preview Sub-Studio */}
                   <Card className="xl:col-span-7 glass-card border-border shadow-2xl overflow-hidden relative flex flex-col h-[700px] bg-black">
                      <CardHeader className="py-4 border-b border-white/5 bg-secondary/30 flex flex-row items-center justify-between shrink-0">
                         <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                               <Eye className="w-4 h-4" />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-foreground">Visual Master Monitor</span>
                         </div>
                         <div className="flex items-center gap-3">
                            <Select value={activeHtmlFile || ''} onValueChange={setActiveHtmlFile}>
                               <SelectTrigger className="h-8 w-48 bg-background/50 border-white/5 text-[9px] font-black uppercase rounded-lg">
                                  <SelectValue placeholder="Select Page" />
                               </SelectTrigger>
                               <SelectContent className="glass-card">
                                  {Array.from(projectFiles.values()).filter(f => f.isHtml).map(f => (
                                    <SelectItem key={f.path} value={f.path} className="text-[9px] font-black uppercase">{f.name}</SelectItem>
                                  ))}
                               </SelectContent>
                            </Select>
                         </div>
                      </CardHeader>
                      <div className="flex-1 bg-white relative">
                         {previewDoc ? (
                           <iframe 
                            srcDoc={previewDoc}
                            className="w-full h-full border-none block"
                            title="Rescue Preview"
                            sandbox="allow-scripts allow-forms"
                           />
                         ) : (
                           <div className="h-full flex items-center justify-center opacity-10">
                              <Loader2 className="w-10 h-10 animate-spin" />
                           </div>
                         )}
                      </div>
                   </Card>

                   {/* Production Packaging */}
                   <div className="xl:col-span-5 space-y-8">
                      <Card className="glass-card border-emerald-500/20 bg-emerald-500/[0.02] shadow-2xl p-10 text-center flex flex-col items-center gap-10">
                         <div className="w-20 h-20 rounded-[2.5rem] bg-emerald-500 text-white flex items-center justify-center shadow-[0_20px_50px_rgba(16,185,129,0.4)] border-4 border-white/10">
                            <CheckCircle2 className="w-10 h-10" />
                         </div>
                         <div className="space-y-2">
                            <h2 className="text-3xl font-headline font-black text-foreground uppercase tracking-tight">Production Pack</h2>
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em]">Ready for hosting</p>
                         </div>
                         
                         <div className="w-full space-y-6">
                            {isProcessing && (
                               <div className="space-y-2">
                                  <Progress value={progress} className="h-1 bg-emerald-500/10" />
                                  <span className="text-[8px] font-black uppercase text-emerald-500">{progress}% Encapsulated</span>
                               </div>
                            )}
                            <Button onClick={packageProject} disabled={isProcessing} className="w-full h-20 bg-primary text-white font-black text-xl uppercase tracking-widest rounded-[2rem] shadow-xl shadow-primary/30 active:scale-95 transition-all">
                               {isProcessing ? <Loader2 className="w-8 h-8 animate-spin" /> : <FileArchive className="w-8 h-8 mr-4" />}
                               Download .zip
                            </Button>
                            <p className="text-[9px] text-foreground/20 font-bold uppercase tracking-tighter px-10">Includes sanitized HTML, local assets, and implementation README</p>
                         </div>
                      </Card>

                      <Card className="glass-card border-border p-8 space-y-8">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary shadow-inner">
                               <Globe className="w-5 h-5" />
                            </div>
                            <h4 className="text-[11px] font-black uppercase text-foreground">Deployment Protocols</h4>
                         </div>
                         <div className="space-y-4">
                            {[
                              { label: 'Firebase', cmd: 'firebase init && firebase deploy', icon: ShieldCheck },
                              { label: 'Vercel CLI', cmd: 'vercel --prod', icon: Zap },
                              { label: 'Netlify', cmd: 'netlify deploy --prod', icon: Globe }
                            ].map(sys => (
                               <div key={sys.label} className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-3 group/sys">
                                  <div className="flex items-center justify-between">
                                     <span className="text-[9px] font-black uppercase text-white/30">{sys.label} Protocol</span>
                                     <button onClick={() => handleCopy(sys.cmd, sys.label)} className="text-[8px] font-black text-primary/60 hover:text-primary uppercase tracking-widest transition-colors">
                                        {isCopied === sys.label ? 'COPIED' : 'COPY CMD'}
                                     </button>
                                  </div>
                                  <p className="text-[10px] font-mono font-bold text-green-500/60 truncate">$ {sys.cmd}</p>
                               </div>
                            ))}
                         </div>
                      </Card>
                   </div>
                </div>

                {/* Technical Footnote */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex items-start gap-5">
                      <Zap className="w-10 h-10 text-primary/40 shrink-0" />
                      <div className="space-y-1">
                         <h4 className="text-[11px] font-black uppercase text-foreground">Linguistic Integrity</h4>
                         <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">Re-matricing preserves all original script logic and textual content while neutralizing destructive absolute path identifiers.</p>
                      </div>
                   </div>
                   <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex items-start gap-5">
                      <ShieldCheck className="w-10 h-10 text-primary/40 shrink-0" />
                      <div className="space-y-1">
                         <h4 className="text-[11px] font-black uppercase text-foreground">Secure Re-Synthesis</h4>
                         <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">All processing occurs 100% locally in your browser memory. Your site source and assets never touch our cloud nodes.</p>
                      </div>
                   </div>
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

