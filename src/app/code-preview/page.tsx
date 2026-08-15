"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Code2, 
  Eye, 
  Upload, 
  Trash2, 
  FileCode, 
  FileJson, 
  FileText, 
  FolderOpen, 
  RefreshCcw, 
  Maximize2, 
  Columns, 
  Monitor, 
  Smartphone, 
  Zap, 
  Info, 
  ChevronRight, 
  ChevronDown, 
  X,
  Plus,
  FileArchive,
  Download,
  Layout,
  Terminal,
  Globe,
  Settings2,
  Image as ImageIcon,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import JSZip from 'jszip';

interface VirtualFile {
  name: string;
  content: string | ArrayBuffer;
  type: string;
  path: string;
  isImage?: boolean;
  blobUrl?: string;
}

export default function CodePreviewPage() {
  const { toast } = useToast();
  const [files, setFiles] = useState<Map<string, VirtualFile>>(new Map());
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [previewDoc, setPreviewDoc] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [isMobile, setIsMobile] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  // Check mobile state
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Set default view on mobile
  useEffect(() => {
    if (isMobile && viewMode === 'split') {
      setViewMode('editor');
    }
  }, [isMobile]);

  // File loading logic
  const handleFiles = async (uploadedFiles: FileList | File[]) => {
    setIsProcessing(true);
    const newFiles = new Map<string, VirtualFile>(files);

    for (const file of Array.from(uploadedFiles)) {
      const path = file.webkitRelativePath || file.name;
      const isImage = file.type.startsWith('image/');
      
      if (isImage) {
        const reader = new FileReader();
        const promise = new Promise<void>((resolve) => {
          reader.onload = (e) => {
            const blobUrl = URL.createObjectURL(file);
            newFiles.set(path, {
              name: file.name,
              content: e.target?.result as ArrayBuffer,
              type: file.type,
              path,
              isImage: true,
              blobUrl
            });
            resolve();
          };
          reader.readAsArrayBuffer(file);
        });
        await promise;
      } else {
        const text = await file.text();
        newFiles.set(path, {
          name: file.name,
          content: text,
          type: file.type,
          path,
          isImage: false
        });
      }
    }

    setFiles(newFiles);
    
    // Auto-select index.html or first available file
    if (!activeFile) {
      const keys = Array.from(newFiles.keys());
      const index = keys.find(k => k.toLowerCase().endsWith('index.html'));
      const first = index || keys[0];
      if (first) selectFile(first, newFiles);
    }

    setIsProcessing(false);
    toast({ title: "Assets Imported", description: `Matrix updated with ${uploadedFiles.length} file(s).` });
  };

  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);

    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(file);
      const newFiles = new Map<string, VirtualFile>();

      for (const [path, entry] of Object.entries(contents.files)) {
        if (entry.dir) continue;

        const isImage = path.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i);
        if (isImage) {
          const blob = await entry.async('blob');
          const blobUrl = URL.createObjectURL(blob);
          const buffer = await entry.async('arraybuffer');
          newFiles.set(path, {
            name: path.split('/').pop() || path,
            content: buffer,
            type: `image/${path.split('.').pop()}`,
            path,
            isImage: true,
            blobUrl
          });
        } else {
          const text = await entry.async('text');
          newFiles.set(path, {
            name: path.split('/').pop() || path,
            content: text,
            type: path.endsWith('.html') ? 'text/html' : path.endsWith('.css') ? 'text/css' : 'text/javascript',
            path,
            isImage: false
          });
        }
      }

      setFiles(newFiles);
      const keys = Array.from(newFiles.keys());
      const index = keys.find(k => k.toLowerCase().endsWith('index.html'));
      if (index) selectFile(index, newFiles);
      else if (keys[0]) selectFile(keys[0], newFiles);

      toast({ title: "ZIP Extracted", description: "Project directory reconstructed in memory." });
    } catch (err) {
      toast({ variant: "destructive", title: "Archive Error", description: "Failed to parse ZIP matrix." });
    } finally {
      setIsProcessing(false);
      if (e.target) e.target.value = '';
    }
  };

  const selectFile = (path: string, currentFiles = files) => {
    const file = currentFiles.get(path);
    if (file && !file.isImage) {
      setActiveFile(path);
      setCode(file.content as string);
    } else {
      setActiveFile(path);
      setCode('');
    }
  };

  const updateCurrentFile = (newContent: string) => {
    setCode(newContent);
    if (activeFile) {
      const updatedFiles = new Map(files);
      const file = updatedFiles.get(activeFile);
      if (file) {
        updatedFiles.set(activeFile, { ...file, content: newContent });
        setFiles(updatedFiles);
      }
    }
  };

  // Preview Generation Logic
  const generatePreview = useCallback(() => {
    const entryPath = Array.from(files.keys()).find(k => k.toLowerCase().endsWith('index.html'));
    if (!entryPath) return;

    let html = files.get(entryPath)?.content as string || '';

    // Replace relative paths with Blob URLs
    files.forEach((file, path) => {
      if (path === entryPath) return;

      // Handle images, css, js
      const escapedPath = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(src|href)=["'](.*${escapedPath})["']`, 'g');

      if (file.isImage && file.blobUrl) {
        html = html.replace(regex, `$1="${file.blobUrl}"`);
      } else if (!file.isImage) {
        const blob = new Blob([file.content], { type: file.type });
        const url = URL.createObjectURL(blob);
        html = html.replace(regex, `$1="${url}"`);
      }
    });

    // Handle relative paths without directory prefix for simpler projects
    files.forEach((file, path) => {
      const fileName = path.split('/').pop() || path;
      const regex = new RegExp(`(src|href)=["']${fileName}["']`, 'g');
      
      if (file.isImage && file.blobUrl) {
        html = html.replace(regex, `$1="${file.blobUrl}"`);
      } else if (!file.isImage) {
        const blob = new Blob([file.content], { type: file.type });
        const url = URL.createObjectURL(blob);
        html = html.replace(regex, `$1="${url}"`);
      }
    });

    setPreviewDoc(html);
  }, [files]);

  useEffect(() => {
    const timer = setTimeout(generatePreview, 500);
    return () => clearTimeout(timer);
  }, [files, generatePreview]);

  const clearStudio = () => {
    files.forEach(f => f.blobUrl && URL.revokeObjectURL(f.blobUrl));
    setFiles(new Map());
    setActiveFile(null);
    setCode('');
    setPreviewDoc('');
    toast({ title: "Studio Purged", description: "Project buffers cleared." });
  };

  const getFileIcon = (file: VirtualFile) => {
    if (file.isImage) return <ImageIcon className="w-4 h-4 text-emerald-500" />;
    if (file.name.endsWith('.html')) return <Layout className="w-4 h-4 text-orange-500" />;
    if (file.name.endsWith('.css')) return <FileCode className="w-4 h-4 text-blue-500" />;
    if (file.name.endsWith('.js')) return <FileJson className="w-4 h-4 text-yellow-500" />;
    return <FileText className="w-4 h-4 text-foreground/40" />;
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20 max-w-full">
      <div className="mb-10 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Terminal className="w-3.5 h-3.5" /> Dev Production Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
              Code <span className="text-primary italic">Preview Lab</span>
            </h1>
            <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
              Professional sandboxed environment for web projects. Upload HTML/CSS/JS or ZIP archives to inspect, edit, and preview assets locally with absolute privacy.
            </p>
          </div>
          
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-secondary border border-border">
            {[
              { id: 'editor', icon: Code2, label: 'Editor' },
              { id: 'split', icon: Columns, label: 'Split' },
              { id: 'preview', icon: Eye, label: 'Visual' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setViewMode(m.id as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                  viewMode === m.id ? "bg-primary text-primary-foreground shadow-lg" : "text-foreground/40 hover:text-primary"
                )}
              >
                <m.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {files.size === 0 ? (
          <Card className="glass-card border-border shadow-2xl overflow-hidden min-h-[500px] flex flex-col items-center justify-center text-center p-12 relative">
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />
             <div className="w-24 h-24 rounded-[2.5rem] bg-secondary flex items-center justify-center text-foreground/10 mb-8 shadow-xl border border-border group-hover:scale-110 transition-transform">
                <FolderOpen className="w-10 h-10" />
             </div>
             <h3 className="text-2xl font-headline font-black text-foreground/40 uppercase tracking-widest mb-4">Awaiting Project Payload</h3>
             <p className="text-sm text-foreground/20 font-medium max-w-md mb-10 leading-relaxed uppercase tracking-tighter">
               Upload a single HTML file, select a project folder, or drop a ZIP archive to initialize the Preview Lab.
             </p>
             
             <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95"
                >
                  <Plus className="w-6 h-6" />
                  Import Files
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => zipInputRef.current?.click()}
                  className="flex-1 h-16 bg-secondary border-border hover:bg-secondary/80 text-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg transition-all active:scale-95"
                >
                  <FileArchive className="w-6 h-6 text-primary" />
                  Extract ZIP
                </Button>
             </div>
             
             <input type="file" ref={fileInputRef} multiple onChange={(e) => handleFiles(e.target.files!)} className="hidden" />
             <input type="file" ref={zipInputRef} accept=".zip" onChange={handleZipUpload} className="hidden" />
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[800px]">
            {/* Sidebar File Tree */}
            <aside className="lg:col-span-3 flex flex-col h-full overflow-hidden">
               <Card className="glass-card border-border shadow-xl h-full flex flex-col overflow-hidden">
                  <CardHeader className="p-4 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
                     <div className="flex items-center gap-3">
                        <FolderOpen className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60">Directory Matrix</span>
                     </div>
                     <button onClick={clearStudio} className="text-foreground/20 hover:text-destructive transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                     </button>
                  </CardHeader>
                  <CardContent className="flex-1 p-2 overflow-y-auto custom-scrollbar">
                     <div className="space-y-1">
                        {Array.from(files.values()).map((file) => (
                           <button
                             key={file.path}
                             onClick={() => selectFile(file.path)}
                             className={cn(
                               "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all border border-transparent",
                               activeFile === file.path 
                                 ? "bg-primary/10 text-primary border-primary/20 shadow-inner" 
                                 : "text-foreground/40 hover:bg-secondary/50 hover:text-foreground/60"
                             )}
                           >
                             {getFileIcon(file)}
                             <span className="text-[11px] font-bold truncate uppercase tracking-tight">{file.name}</span>
                           </button>
                        ))}
                     </div>
                  </CardContent>
                  <div className="p-4 bg-secondary/30 border-t border-border">
                     <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="w-full h-10 text-[9px] font-black uppercase tracking-widest border-dashed border-border hover:border-primary/40 hover:text-primary rounded-xl">
                        <Plus className="w-3.5 h-3.5 mr-2" /> Add Asset
                     </Button>
                  </div>
               </Card>
            </aside>

            {/* Editor & Preview Matrix */}
            <div className="lg:col-span-9 grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
               {(viewMode === 'split' || viewMode === 'editor') && (
                  <Card className={cn(
                    "glass-card border-border shadow-2xl overflow-hidden flex flex-col h-full",
                    viewMode === 'split' ? "lg:col-span-6" : "lg:col-span-12"
                  )}>
                    <CardHeader className="p-4 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
                       <div className="flex items-center gap-3">
                          <Code2 className="w-4 h-4 text-primary" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60 truncate max-w-[150px]">
                            {activeFile?.split('/').pop() || 'Matrix Source'}
                          </span>
                       </div>
                       <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest">
                            {files.get(activeFile || '')?.type.split('/')[1] || 'raw'}
                          </span>
                       </div>
                    </CardHeader>
                    <div className="flex-1 bg-black/5 relative">
                       {activeFile && files.get(activeFile)?.isImage ? (
                         <div className="absolute inset-0 flex items-center justify-center p-10">
                            <div className="p-4 bg-white/5 rounded-[2rem] border border-white/10 shadow-2xl">
                               <img src={files.get(activeFile)!.blobUrl} alt="Preview" className="max-h-[400px] w-auto object-contain" />
                            </div>
                         </div>
                       ) : (
                        <textarea 
                          value={code}
                          onChange={(e) => updateCurrentFile(e.target.value)}
                          placeholder="Matrix code input..."
                          spellCheck={false}
                          className="w-full h-full p-8 bg-transparent text-foreground font-mono text-sm leading-relaxed resize-none focus:outline-none custom-scrollbar"
                        />
                       )}
                    </div>
                  </Card>
               )}

               {(viewMode === 'split' || viewMode === 'preview') && (
                  <Card className={cn(
                    "glass-card border-border shadow-2xl overflow-hidden flex flex-col h-full",
                    viewMode === 'split' ? "lg:col-span-6" : "lg:col-span-12"
                  )}>
                    <CardHeader className="p-4 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
                       <div className="flex items-center gap-3">
                          <Eye className="w-4 h-4 text-primary" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60">Visual Master</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <button onClick={generatePreview} className="p-2 rounded-lg hover:bg-secondary transition-colors" title="Sync Preview">
                             <RefreshCcw className="w-3.5 h-3.5 text-foreground/40" />
                          </button>
                          <button onClick={() => {
                             const win = window.open();
                             win?.document.write(previewDoc);
                          }} className="p-2 rounded-lg hover:bg-secondary transition-colors" title="Open Fullscreen">
                             <Maximize2 className="w-3.5 h-3.5 text-foreground/40" />
                          </button>
                       </div>
                    </CardHeader>
                    <div className="flex-1 bg-white relative">
                       {previewDoc ? (
                         <iframe 
                          srcDoc={previewDoc}
                          className="w-full h-full border-none"
                          title="Preview"
                          sandbox="allow-scripts allow-forms"
                         />
                       ) : (
                         <div className="flex flex-col items-center justify-center h-full gap-4 p-12 text-center">
                            <Loader2 className="w-10 h-10 text-primary/20 animate-spin" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/20">Synthesizing Preview Matrix...</p>
                         </div>
                       )}
                    </div>
                  </Card>
               )}
            </div>
          </div>
        )}

        {/* Studio Intelligence Footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5 group hover:bg-primary/10 transition-colors">
              <ShieldCheck className="w-6 h-6 text-primary mt-1 shrink-0" />
              <div className="space-y-1">
                 <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Sandboxed Logic</h4>
                 <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">Preview engine runs in an isolated iframe. Hardware processing occurs strictly in your browser session for 100% data privacy.</p>
              </div>
           </div>
           <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5 group hover:bg-primary/10 transition-colors">
              <Zap className="w-6 h-6 text-primary mt-1 shrink-0" />
              <div className="space-y-1">
                 <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Relative Sync</h4>
                 <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">Automatic relative path resolution for linked CSS and JS files using a high-performance virtual Blob filesystem.</p>
              </div>
           </div>
           <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5 group hover:bg-primary/10 transition-colors">
              <Layout className="w-6 h-6 text-primary mt-1 shrink-0" />
              <div className="space-y-1">
                 <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Entry Point Auto-Detect</h4>
                 <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">System scans your directory matrix for "index.html" as the primary ignition point for visual synthesis.</p>
              </div>
           </div>
        </div>
      </div>
      
      <style jsx global>{`
        .bg-checkered {
          background-image: linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                            linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                            linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
          background-size: 20px 20px;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
