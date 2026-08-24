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
  ShieldAlert,
  FilePlus,
  FolderPlus,
  MoreVertical,
  Files,
  Eye,
  Monitor,
  Terminal,
  Hash,
  AlignLeft
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// --- Types ---
interface LocalFile {
  id: string;
  name: string;
  path: string; // The relative path in the zip/project
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

interface FileTreeNode {
  name: string;
  path: string;
  children?: Record<string, FileTreeNode>;
  fileId?: string;
}

export default function HtmlSiteRescuePage() {
  const { toast } = useToast();
  
  // Studio Config
  const [mode, setMode] = useState<'simple' | 'update'>('simple');
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // File State (The primary registry)
  const [assets, setAssets] = useState<LocalFile[]>([]);
  const [references, setReferences] = useState<AssetReference[]>([]);
  const [indexHtmlId, setIndexHtmlId] = useState<string | null>(null);

  // Advanced IDE State
  const [openFileIds, setOpenFileIds] = useState<string[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [editorFontSize, setFontSize] = useState(14);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [softWrap, setSoftWrap] = useState(false);
  
  // Batch Operations State
  const [snapshots, setSnapshots] = useState<LocalFile[][]>([]);
  const [showGlobalReplace, setShowGlobalReplace] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [globalReplace, setGlobalReplace] = useState('');

  // UI State
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const editorTextareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // --- 1. Analysis & Path Logic ---

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
          if (!findInAssets(fixed)) status = 'missing';
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

  // Update references when the active index changes or assets change
  useEffect(() => {
    const main = assets.find(a => a.id === indexHtmlId);
    if (main?.content) scanHtml(main.content, assets);
  }, [indexHtmlId, assets, scanHtml]);

  // --- 2. File Tree & Navigation ---

  const fileTree = useMemo(() => {
    const root: FileTreeNode = { name: 'root', path: '', children: {} };
    assets.forEach(file => {
      const parts = file.path.split('/');
      let current = root;
      parts.forEach((part, i) => {
        if (i === parts.length - 1) {
          current.children![part] = { name: part, path: file.path, fileId: file.id };
        } else {
          if (!current.children![part]) {
            current.children![part] = { name: part, path: parts.slice(0, i + 1).join('/'), children: {} };
          }
          current = current.children![part];
        }
      });
    });
    return root;
  }, [assets]);

  const openFile = (id: string) => {
    if (!openFileIds.includes(id)) {
      setOpenFileIds(prev => [...prev, id]);
    }
    setActiveFileId(id);
  };

  const closeFile = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const nextTabs = openFileIds.filter(fid => fid !== id);
    setOpenFileIds(nextTabs);
    if (activeFileId === id) {
      setActiveFileId(nextTabs[nextTabs.length - 1] || null);
    }
  };

  // --- 3. Handlers ---

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = Array.from(e.target.files || []);
    if (uploaded.length === 0) return;

    setIsProcessing(true);
    const newAssets: LocalFile[] = [];

    for (const f of uploaded) {
      const isText = f.type.includes('text') || f.type.includes('javascript') || f.type.includes('json') || f.name.match(/\.(css|js|mjs|json|html|htm|txt|md|webmanifest|xml)$/i);
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
    }

    setAssets(prev => {
      const combined = [...prev, ...newAssets];
      // Auto-detect index.html if not set
      if (!indexHtmlId) {
        const foundIndex = combined.find(a => a.name.toLowerCase() === 'index.html');
        if (foundIndex) setIndexHtmlId(foundIndex.id);
      }
      return combined;
    });

    setStep(2);
    setIsProcessing(false);
    toast({ title: "Assets Buffered", description: `${newAssets.length} nodes injected.` });
    if (e.target) e.target.value = '';
  };

  const addNewFile = (type: 'html' | 'css' | 'js') => {
    const name = `new_file_${assets.length + 1}.${type}`;
    const newItem: LocalFile = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      path: name,
      type: type === 'html' ? 'text/html' : type === 'css' ? 'text/css' : 'text/javascript',
      size: 0,
      blob: new Blob([''], { type: 'text/plain' }),
      content: '',
      isDirty: false
    };
    setAssets(prev => [...prev, newItem]);
    openFile(newItem.id);
    toast({ title: "Node Created", description: `Added ${name} to project matrix.` });
  };

  const deleteFile = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
    setOpenFileIds(prev => prev.filter(fid => fid !== id));
    if (activeFileId === id) setActiveFileId(null);
    setShowDeleteConfirm(null);
    toast({ title: "Node Purged" });
  };

  const renameFile = (id: string, newName: string) => {
    setAssets(prev => prev.map(a => {
      if (a.id === id) {
        const parts = a.path.split('/');
        parts[parts.length - 1] = newName;
        return { ...a, name: newName, path: parts.join('/') };
      }
      return a;
    }));
    toast({ title: "Node Relabeled" });
  };

  const saveFileContent = (id: string, content: string) => {
    setAssets(prev => prev.map(a => {
      if (a.id === id) {
        const blob = new Blob([content], { type: a.type });
        return { ...a, content, blob, size: blob.size, isDirty: false };
      }
      return a;
    }));
  };

  // --- 4. Global Operations ---

  const createSnapshot = () => {
    setSnapshots(prev => [...prev.slice(-4), assets.map(a => ({ ...a }))]);
  };

  const restoreSnapshot = () => {
    if (snapshots.length === 0) return;
    const last = snapshots[snapshots.length - 1];
    setAssets(last);
    setSnapshots(prev => prev.slice(0, -1));
    toast({ title: "Matrix Restored", description: "Reverted to previous project state." });
  };

  const executeGlobalReplace = () => {
    if (!globalSearch) return;
    createSnapshot();
    
    let count = 0;
    setAssets(prev => prev.map(a => {
      if (a.content !== undefined && a.content.includes(globalSearch)) {
        const next = a.content.split(globalSearch).join(globalReplace);
        count++;
        return { ...a, content: next, isDirty: true };
      }
      return a;
    }));

    setShowGlobalReplace(false);
    toast({ title: "Global Sync Complete", description: `Updated ${count} files across project.` });
  };

  // --- 5. Production & Preview ---

  const generatePreview = () => {
    const index = assets.find(a => a.id === indexHtmlId);
    if (!index || !index.content) {
      toast({ variant: "destructive", title: "Entry Point Missing", description: "index.html not identified." });
      return;
    }

    let html = index.content;
    // Attempt relative path resolution for preview
    assets.forEach(asset => {
      if (asset.id === indexHtmlId || !asset.content) return;
      const blobUrl = URL.createObjectURL(asset.blob);
      const escapedPath = asset.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(src|href)=["'](.*${escapedPath}|${asset.name})["']`, 'g');
      html = html.replace(regex, `$1="${blobUrl}"`);
    });

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
    window.open(url, '_blank');
  };

  const executeFixAll = () => {
    if (!indexHtmlId) return;
    const main = assets.find(a => a.id === indexHtmlId);
    if (!main?.content) return;

    let fixedHtml = main.content;
    references.forEach(ref => {
      if (ref.status === 'fixed' || ref.status === 'ok') {
        fixedHtml = fixedHtml.split(`"${ref.originalValue}"`).join(`"${ref.fixedValue}"`);
        fixedHtml = fixedHtml.split(`'${ref.originalValue}'`).join(`'${ref.fixedValue}'`);
      }
    });

    saveFileContent(indexHtmlId, fixedHtml);
    setStep(3);
    toast({ title: "Paths Normalized" });
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
    link.download = `mykit_site_bundle_${Date.now()}.zip`;
    link.click();
    setIsProcessing(false);
    toast({ title: "Bundle Generated" });
  };

  const clearStudio = () => {
    setAssets([]);
    setOpenFileIds([]);
    setActiveFileId(null);
    setIndexHtmlId(null);
    setStep(1);
    toast({ title: "Studio Reset" });
  };

  // --- 6. Editor Visual Component ---
  
  const ActiveFile = useMemo(() => assets.find(a => a.id === activeFileId), [assets, activeFileId]);
  
  const lineNumbers = useMemo(() => {
    if (!ActiveFile?.content) return [1];
    return Array.from({ length: ActiveFile.content.split('\n').length }, (_, i) => i + 1);
  }, [ActiveFile]);

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const val = e.currentTarget.value;
      const next = val.substring(0, start) + "  " + val.substring(end);
      if (ActiveFile) {
        setAssets(prev => prev.map(a => a.id === ActiveFile.id ? { ...a, content: next, isDirty: true } : a));
      }
      setTimeout(() => {
        if (editorTextareaRef.current) {
          editorTextareaRef.current.selectionStart = editorTextareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (ActiveFile?.content !== undefined) saveFileContent(ActiveFile.id, ActiveFile.content);
    }
  };

  return (
    <div className={cn("min-h-screen bg-[#0a0a0c] flex flex-col", step === 2 && mode === 'update' && "fixed inset-0 z-[100]")}>
      
      {/* HEADER / TOOLBAR */}
      <header className="h-16 border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20">
                <LayoutGrid className="w-4 h-4" />
             </div>
             <div className="hidden sm:block">
                <h1 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Rescue Studio</h1>
                <p className="text-[9px] font-bold text-foreground/20 uppercase tracking-widest">{mode === 'update' ? 'Advanced IDE' : 'Simple Mode'}</p>
             </div>
          </div>
          
          {step === 2 && (
            <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
              <button 
                onClick={() => setMode('simple')} 
                className={cn("px-4 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all", mode === 'simple' ? "bg-primary text-white" : "text-white/20 hover:text-white")}
              >
                Simple
              </button>
              <button 
                onClick={() => setMode('update')} 
                className={cn("px-4 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all", mode === 'update' ? "bg-primary text-white" : "text-white/20 hover:text-white")}
              >
                Advanced
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
           {step === 2 && (
             <>
               <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/50 border border-white/5 text-[9px] font-black text-white/40 uppercase">
                  <Activity className="w-3.5 h-3.5 text-primary" />
                  <span>{assets.length} Nodes</span>
               </div>
               <Button onClick={generatePreview} variant="outline" className="h-9 px-4 rounded-xl border-white/10 bg-white/5 text-[9px] font-black uppercase hover:text-primary">
                  <Eye className="w-3.5 h-3.5 mr-2" /> Preview
               </Button>
               <Button onClick={() => setStep(3)} className="h-9 px-6 rounded-xl bg-primary text-white font-black text-[9px] uppercase shadow-lg shadow-primary/20">
                  <Save className="w-3.5 h-3.5 mr-2" /> Finish
               </Button>
             </>
           )}
           {step === 3 && (
             <Button variant="outline" onClick={clearStudio} className="h-9 px-4 rounded-xl border-white/5 bg-secondary text-[8px] font-black uppercase hover:text-destructive">
               <RotateCcw className="w-3 h-3 mr-2" /> Reset
             </Button>
           )}
        </div>
      </header>

      {/* WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* STEP 1: INTAKE */}
        {step === 1 && (
          <div className="container mx-auto px-6 py-20 max-w-4xl animate-reveal">
            <Card className="glass-card border-white/5 shadow-2xl p-12 text-center flex flex-col items-center gap-10 relative overflow-hidden bg-black/10 rounded-[3rem]">
               <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
               <div className="w-20 h-20 rounded-[2.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xl relative z-10">
                  <FileCode className="w-10 h-10" />
               </div>
               <div className="space-y-3 relative z-10">
                  <h2 className="text-3xl sm:text-5xl font-headline font-black text-foreground uppercase tracking-tight">Project Intake</h2>
                  <p className="text-[10px] text-foreground/30 font-black uppercase tracking-[0.4em]">Initialize local re-matricing protocol</p>
               </div>
               
               <div className="w-full max-w-lg space-y-6 relative z-10">
                  <Button onClick={() => fileInputRef.current?.click()} className="h-20 w-full bg-primary text-white font-black uppercase text-xs tracking-widest rounded-3xl shadow-xl shadow-primary/30 active:scale-95 transition-all">
                     <Upload className="w-6 h-6 mr-4" /> Select files or index.html
                  </Button>
                  <Button variant="outline" onClick={() => folderInputRef.current?.click()} className="h-16 w-full border-white/10 bg-white/5 text-white/40 font-black uppercase text-[10px] tracking-widest rounded-2xl">
                     <FolderOpen className="w-5 h-5 mr-3" /> Import Full Folder
                  </Button>
                  
                  <div className="pt-4 space-y-4">
                     <div className="flex items-center gap-4">
                        <div className="h-[1px] flex-1 bg-white/5" />
                        <span className="text-[8px] font-black text-white/10 uppercase tracking-[0.6em]">OR PASTE SOURCE</span>
                        <div className="h-[1px] flex-1 bg-white/5" />
                     </div>
                     <Textarea 
                       placeholder="Paste raw HTML source matrix..." 
                       value={ActiveFile?.content || ''}
                       onChange={e => {
                         const id = Math.random().toString(36).substr(2,9);
                         setAssets([{
                           id, name: 'index.html', path: 'index.html', type: 'text/html', size: e.target.value.length, blob: new Blob([e.target.value]), content: e.target.value
                         }]);
                         setIndexHtmlId(id);
                       }}
                       className="h-40 bg-secondary/30 border-white/10 rounded-2xl text-[11px] font-mono p-6 resize-none shadow-inner"
                     />
                     {(assets.length > 0) && (
                       <Button onClick={() => setStep(2)} className="h-14 w-full bg-white text-black font-black uppercase text-[11px] rounded-2xl shadow-2xl active:scale-95 transition-all">
                          Enter Studio <ArrowRight className="w-4 h-4 ml-3" />
                       </Button>
                     )}
                  </div>
               </div>
               <input type="file" ref={fileInputRef} multiple onChange={handleFileUpload} className="hidden" />
               <input type="file" ref={folderInputRef} {...{webkitdirectory: "", directory: ""} as any} onChange={handleFileUpload} className="hidden" />
            </Card>
          </div>
        )}

        {/* STEP 2: STUDIO (Simple Mode) */}
        {step === 2 && mode === 'simple' && (
          <div className="container mx-auto px-6 py-12 max-w-6xl animate-in fade-in duration-500">
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left: Ref List */}
                <div className="lg:col-span-8 space-y-8">
                   <Card className="glass-card border-border shadow-2xl">
                      <CardHeader className="py-6 border-b border-border bg-secondary/30 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20">
                               <Search className="w-5 h-5" />
                            </div>
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Discovery Matrix</CardTitle>
                         </div>
                         <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm" className="h-9 rounded-xl border-dashed border-primary/20 bg-primary/5 text-primary text-[8px] font-black uppercase">
                            <Plus className="w-3.5 h-3.5 mr-1.5" /> Inject Assets
                         </Button>
                      </CardHeader>
                      <CardContent className="p-0">
                         <div className="divide-y divide-white/5 max-h-[500px] overflow-auto custom-scrollbar bg-black/10">
                            {references.length === 0 ? (
                              <div className="p-20 text-center opacity-10 uppercase tracking-widest text-[10px] font-black">No dependencies discovered</div>
                            ) : (
                              references.map(ref => (
                                <div key={ref.id} className="p-6 flex items-center justify-between group hover:bg-white/[0.02] transition-all">
                                   <div className="flex items-center gap-6 min-w-0">
                                      <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center border transition-all",
                                        ref.status === 'ok' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                        ref.status === 'fixed' ? "bg-primary/10 text-primary border-primary/20" :
                                        "bg-red-500/10 text-red-500 border-red-500/20"
                                      )}>
                                         {ref.type === 'script' ? <Terminal className="w-5 h-5" /> : ref.type === 'style' ? <Zap className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                                      </div>
                                      <div className="min-w-0">
                                         <p className="text-xs font-bold text-foreground truncate uppercase">{ref.originalValue}</p>
                                         <p className="text-[8px] font-black text-foreground/20 uppercase tracking-[0.2em]">{ref.tag} Protocol • {ref.type}</p>
                                      </div>
                                   </div>
                                   <Badge className={cn(
                                     "text-[8px] font-black uppercase px-2 py-0.5",
                                     ref.status === 'ok' ? "bg-green-500/20 text-green-500" :
                                     ref.status === 'fixed' ? "bg-primary/20 text-primary" :
                                     "bg-red-500/20 text-red-500"
                                   )}>{ref.status}</Badge>
                                </div>
                              ))
                            )}
                         </div>
                         <div className="p-8 border-t border-border bg-secondary/30 flex justify-between items-center">
                            <div className="space-y-1">
                               <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">Active Matrix</p>
                               <p className="text-lg font-headline font-black text-foreground">{assets.length} Nodes Buffered</p>
                            </div>
                            <Button onClick={executeFixAll} className="h-14 px-10 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-primary/30 active:scale-95">
                               Normalize Paths <ArrowRight className="w-4 h-4 ml-3" />
                            </Button>
                         </div>
                      </CardContent>
                   </Card>
                </div>

                {/* Right: Info */}
                <div className="lg:col-span-4 space-y-6">
                   <div className="p-8 rounded-[3rem] bg-primary/5 border border-primary/20 flex flex-col gap-6">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                            <ShieldCheck className="w-6 h-6" />
                         </div>
                         <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground">Portable Protocol</h4>
                      </div>
                      <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase tracking-tight">
                         The studio automatically identifies root-level (/) paths and converts them to relative mappings to ensure your project functions on any hosting protocol without structural failure.
                      </p>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* STEP 2: STUDIO (Advanced IDE Mode) */}
        {step === 2 && mode === 'update' && (
          <div className="flex-1 flex overflow-hidden">
             
             {/* 1. IDE Sidebar */}
             <div className={cn(
               "absolute lg:relative z-40 h-full w-[280px] bg-[#0d0d0f] border-r border-white/5 flex flex-col transition-transform duration-500 ease-out",
               isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:-ml-[280px]"
             )}>
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                   <p className="text-[9px] font-black text-foreground/20 uppercase tracking-[0.4em]">Project Explorer</p>
                   <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                         <button className="p-1 text-white/20 hover:text-white"><Plus className="w-3.5 h-3.5" /></button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="glass-card border-white/10 w-40">
                         <DropdownMenuItem onClick={() => addNewFile('html')} className="text-[10px] font-black uppercase text-foreground/60 focus:text-primary cursor-pointer"><FileCode className="w-3.5 h-3.5 mr-2" /> New HTML</DropdownMenuItem>
                         <DropdownMenuItem onClick={() => addNewFile('css')} className="text-[10px] font-black uppercase text-foreground/60 focus:text-primary cursor-pointer"><Zap className="w-3.5 h-3.5 mr-2" /> New CSS</DropdownMenuItem>
                         <DropdownMenuItem onClick={() => addNewFile('js')} className="text-[10px] font-black uppercase text-foreground/60 focus:text-primary cursor-pointer"><Terminal className="w-3.5 h-3.5 mr-2" /> New JS</DropdownMenuItem>
                      </DropdownMenuContent>
                   </DropdownMenu>
                </div>
                
                <div className="flex-1 overflow-auto custom-scrollbar p-3 space-y-1 bg-black/20">
                   {assets.map(asset => (
                     <div key={asset.id} className="group relative">
                        <button
                          onClick={() => openFile(asset.id)}
                          className={cn(
                            "w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all border border-transparent",
                            activeFileId === asset.id ? "bg-primary/10 border-primary/20 text-primary" : "text-foreground/40 hover:bg-white/5"
                          )}
                        >
                           <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                              {asset.content !== undefined ? <FileCode className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
                           </div>
                           <div className="min-w-0 flex-1">
                              <p className="text-[10px] font-bold truncate uppercase tracking-tight">{asset.name}</p>
                              {asset.isDirty && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary" />}
                           </div>
                        </button>
                        
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                 <button className="p-1.5 text-white/20 hover:text-white"><MoreVertical className="w-3 h-3" /></button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="glass-card border-white/10">
                                 <DropdownMenuItem onClick={() => setIndexHtmlId(asset.id)} className="text-[9px] font-black uppercase cursor-pointer">Set as Entry Point</DropdownMenuItem>
                                 <DropdownMenuItem onClick={() => setShowDeleteConfirm(asset.id)} className="text-[9px] font-black uppercase text-red-500 cursor-pointer">Purge Node</DropdownMenuItem>
                              </DropdownMenuContent>
                           </DropdownMenu>
                        </div>
                     </div>
                   ))}
                </div>

                <div className="p-6 bg-black/40 border-t border-white/5 space-y-4">
                   <Button onClick={() => setShowGlobalReplace(true)} variant="outline" className="w-full h-10 border-white/5 bg-white/5 text-[8px] font-black uppercase tracking-widest">
                      <Replace className="w-3.5 h-3.5 mr-2" /> Global Replace
                   </Button>
                   <button onClick={restoreSnapshot} disabled={snapshots.length === 0} className="w-full text-[8px] font-black uppercase text-foreground/20 hover:text-primary disabled:opacity-0 transition-all">Restore Snapshot</button>
                </div>
             </div>

             {/* 2. Editor Core */}
             <div className="flex-1 flex flex-col overflow-hidden bg-[#060608]">
                
                {/* Tabs Bar */}
                <div className="h-11 border-b border-white/5 bg-[#0a0a0c] flex items-center overflow-x-auto no-scrollbar shrink-0 px-2">
                   {openFileIds.map(id => {
                     const f = assets.find(a => a.id === id);
                     if (!f) return null;
                     return (
                        <div 
                          key={id} 
                          onClick={() => setActiveFileId(id)}
                          className={cn(
                            "h-full px-4 flex items-center gap-3 border-r border-white/5 cursor-pointer transition-all min-w-[120px] max-w-[200px] relative group",
                            activeFileId === id ? "bg-white/5 border-t-2 border-t-primary" : "bg-transparent text-white/20"
                          )}
                        >
                           <FileCode className={cn("w-3.5 h-3.5", activeFileId === id ? "text-primary" : "opacity-30")} />
                           <span className="text-[10px] font-bold uppercase truncate">{f.name}</span>
                           {f.isDirty && <div className="w-1 h-1 rounded-full bg-primary" />}
                           <button onClick={(e) => closeFile(e, id)} className="p-1 rounded-md hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="w-3 h-3" />
                           </button>
                        </div>
                     );
                   })}
                </div>

                {/* Main Text Editor Workspace */}
                <div className="flex-1 flex overflow-hidden relative">
                   {ActiveFile ? (
                     <div className="flex-1 flex overflow-hidden">
                        {/* Line Numbers */}
                        <div 
                          ref={lineNumbersRef}
                          className="w-12 bg-[#08080a] border-r border-white/5 pt-10 flex flex-col items-center text-[10px] font-mono text-white/5 select-none overflow-hidden"
                        >
                          {lineNumbers.map(n => (
                            <div key={n} className="h-6 leading-6">{n}</div>
                          ))}
                        </div>

                        {/* Editor Textarea */}
                        <div className="flex-1 relative bg-transparent">
                           <textarea 
                             ref={editorTextareaRef}
                             value={ActiveFile.content || ''}
                             onChange={e => {
                               if (ActiveFile.content !== undefined) {
                                 const val = e.target.value;
                                 setAssets(prev => prev.map(a => a.id === ActiveFile.id ? { ...a, content: val, isDirty: true } : a));
                               }
                             }}
                             onKeyDown={handleEditorKeyDown}
                             onScroll={e => { if (lineNumbersRef.current) lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop; }}
                             spellCheck={false}
                             style={{ fontSize: `${editorFontSize}px` }}
                             className={cn(
                               "w-full h-full p-10 pt-10 bg-transparent text-foreground font-mono leading-6 resize-none focus:outline-none custom-scrollbar whitespace-pre",
                               softWrap ? "whitespace-pre-wrap" : "whitespace-pre"
                             )}
                           />
                           
                           {/* Floating Controls Overlay */}
                           <div className="absolute top-4 right-8 z-20 flex items-center gap-3">
                              <div className="flex bg-black/60 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-2xl">
                                 <button onClick={() => setFontSize(s => Math.max(8, s-1))} className="p-1.5 text-white/20 hover:text-white"><Minus className="w-3.5 h-3.5" /></button>
                                 <span className="w-10 text-center text-[9px] font-black text-white/30">{editorFontSize}px</span>
                                 <button onClick={() => setFontSize(s => Math.min(24, s+1))} className="p-1.5 text-white/20 hover:text-white"><Plus className="w-3.5 h-3.5" /></button>
                                 <div className="w-[1px] h-4 bg-white/10 mx-2 mt-1.5" />
                                 <button onClick={() => setSoftWrap(!softWrap)} className={cn("p-1.5 rounded-lg transition-all", softWrap ? "text-primary bg-primary/10" : "text-white/20")} title="Soft Wrap">
                                    <AlignLeft className="w-3.5 h-3.5" />
                                 </button>
                              </div>
                              <Button onClick={() => saveFileContent(ActiveFile.id, ActiveFile.content || '')} className="h-10 px-5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[9px] uppercase tracking-widest rounded-xl shadow-xl shadow-emerald-500/10">
                                 <Save className="w-3.5 h-3.5 mr-2" /> Save
                              </Button>
                           </div>
                        </div>
                     </div>
                   ) : (
                     <div className="flex-1 flex flex-col items-center justify-center gap-8 opacity-10">
                        <FileEdit className="w-24 h-24 text-primary" />
                        <p className="text-xl font-headline font-black uppercase tracking-[0.5em]">Select Node to Initialize</p>
                     </div>
                   )}
                </div>
             </div>
          </div>
        )}

        {/* STEP 3: PRODUCTION SUMMARY */}
        {step === 3 && (
          <div className="max-w-4xl mx-auto w-full space-y-8 animate-in zoom-in-95 duration-500">
             <Card className="glass-card border-emerald-500/20 bg-emerald-500/[0.02] shadow-2xl p-16 text-center flex flex-col items-center gap-10">
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
                   <p className="text-[9px] text-foreground/20 font-bold uppercase tracking-tighter">Includes sanitized index.html and {assets.length} buffered assets</p>
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
                      <p>3. Move ZIP contents to /public</p>
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
                      <p className="text-[11px] text-foreground/40 font-medium leading-relaxed uppercase tracking-tight">Drop the extracted folder into the deployment dashboard. Our normalized paths ensure instant visual calibration.</p>
                   </div>
                </Card>
             </div>
          </div>
        )}

      </div>

      {/* --- MODALS & OVERLAYS --- */}

      {/* Global Replace Modal */}
      <Dialog open={showGlobalReplace} onOpenChange={setShowGlobalReplace}>
         <DialogContent className="glass-card border-white/20 p-8 max-w-lg">
            <DialogHeader className="space-y-4">
               <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto">
                  <Replace className="w-8 h-8" />
               </div>
               <DialogTitle className="text-xl font-headline font-black text-center uppercase tracking-tight">Global Replacement Matrix</DialogTitle>
               <DialogDescription className="text-center text-[10px] font-bold text-foreground/30 uppercase tracking-widest">A snapshot will be created before execution</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-6">
               <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase text-foreground/40 ml-1">Search String</Label>
                  <Input value={globalSearch} onChange={e => setGlobalSearch(e.target.value)} placeholder="Value to find..." className="bg-secondary/50 border-white/5" />
               </div>
               <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase text-foreground/40 ml-1">Replacement Protocol</Label>
                  <Input value={globalReplace} onChange={e => setGlobalReplace(e.target.value)} placeholder="New value..." className="bg-secondary/50 border-white/5" />
               </div>
            </div>
            <DialogFooter className="mt-8">
               <Button onClick={executeGlobalReplace} disabled={!globalSearch} className="w-full h-14 bg-primary text-white font-black uppercase text-[10px] rounded-2xl shadow-xl shadow-primary/30">
                  Execute Global Replace
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
        <AlertDialogContent className="glass-card border-white/10 rounded-[2.5rem] p-8 max-w-sm">
          <AlertDialogHeader className="space-y-4">
            <div className="w-16 h-16 rounded-[1.5rem] bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mx-auto">
               <ShieldAlert className="w-8 h-8" />
            </div>
            <AlertDialogTitle className="text-xl font-headline font-black text-foreground uppercase tracking-tight text-center">Delete Node</AlertDialogTitle>
            <AlertDialogDescription className="text-[11px] font-medium text-foreground/40 uppercase tracking-widest leading-relaxed text-center">
               This will definitively purge this node from the local project matrix. This action cannot be reversed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex gap-3">
            <AlertDialogCancel className="h-12 flex-1 rounded-xl border-white/5 bg-white/5 text-[9px] font-black uppercase m-0">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteFile(showDeleteConfirm!)} className="h-12 flex-1 rounded-xl bg-destructive text-white font-black uppercase text-[9px] shadow-xl shadow-destructive/20">Purge Node</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        textarea { caret-color: hsl(var(--primary)); }
        .bg-checkered {
          background-image: linear-gradient(45deg, #111113 25%, transparent 25%), 
                            linear-gradient(-45deg, #111113 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #111113 75%), 
                            linear-gradient(-45deg, transparent 75%, #111113 75%);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
}
