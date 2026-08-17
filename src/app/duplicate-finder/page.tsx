"use client"

import React, { useState, useRef, useMemo, useCallback } from 'react';
import { 
  Copy, 
  Trash2, 
  Upload, 
  Download, 
  CheckCircle2, 
  Info,
  Files,
  FileArchive,
  Search,
  Loader2,
  FileCheck,
  AlertCircle,
  ShieldCheck,
  Zap,
  LayoutGrid,
  FileText,
  FileImage,
  FileAudio,
  FileVideo,
  FileCode,
  Archive,
  X,
  Plus,
  RefreshCcw,
  Maximize,
  Filter,
  ClipboardType
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import JSZip from 'jszip';

interface VirtualFile {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  blob: Blob;
}

interface DuplicateGroup {
  key: string;
  files: VirtualFile[];
}

export default function DuplicateFinderPage() {
  const { toast } = useToast();
  const [files, setFiles] = useState<VirtualFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Settings
  const [matchMode, setMatchMode] = useState<'name-size' | 'name-only'>('name-size');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FileImage className="w-4 h-4" />;
    if (type.startsWith('video/')) return <FileVideo className="w-4 h-4" />;
    if (type.startsWith('audio/')) return <FileAudio className="w-4 h-4" />;
    if (type.includes('pdf')) return <FileText className="w-4 h-4" />;
    if (type.includes('zip') || type.includes('archive')) return <Archive className="w-4 h-4" />;
    if (type.includes('javascript') || type.includes('json') || type.includes('html')) return <FileCode className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const addFilesToState = async (newFiles: FileList | File[]) => {
    setIsProcessing(true);
    const addedFiles: VirtualFile[] = [];

    for (const file of Array.from(newFiles)) {
      if (file.type === 'application/zip' || file.name.endsWith('.zip')) {
        try {
          const zip = new JSZip();
          const contents = await zip.loadAsync(file);
          for (const [path, entry] of Object.entries(contents.files)) {
            if (entry.dir) continue;
            const blob = await entry.async('blob');
            addedFiles.push({
              id: Math.random().toString(36).substr(2, 9),
              name: path.split('/').pop() || path,
              size: blob.size,
              type: blob.type || 'application/octet-stream',
              lastModified: entry.date.getTime(),
              blob
            });
          }
        } catch (e) {
          toast({ variant: "destructive", title: "ZIP Protocol Error", description: "Failed to extract project matrix." });
        }
      } else {
        addedFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          blob: file
        });
      }
    }

    setFiles(prev => [...prev, ...addedFiles]);
    setIsProcessing(false);
    toast({ title: "Assets Imported", description: `Added ${addedFiles.length} files to the pipeline.` });
  };

  const findDuplicates = useCallback(() => {
    if (files.length === 0) return;
    setIsScanning(true);

    const groupsMap = new Map<string, VirtualFile[]>();
    
    files.forEach(f => {
      const key = matchMode === 'name-size' 
        ? `${f.name.toLowerCase()}-${f.size}` 
        : f.name.toLowerCase();
      
      const group = groupsMap.get(key) || [];
      group.push(f);
      groupsMap.set(key, group);
    });

    const duplicates = Array.from(groupsMap.entries())
      .filter(([_, group]) => group.length > 1)
      .map(([key, group]) => ({ key, files: group }));

    setDuplicateGroups(duplicates);
    setIsScanning(false);
    
    if (duplicates.length > 0) {
      toast({ title: "Analysis Complete", description: `Identified ${duplicates.length} redundancy clusters.` });
    } else {
      toast({ title: "Zero Redundancy", description: "All assets in the matrix are unique." });
    }
  }, [files, matchMode, toast]);

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const selectDuplicatesInGroup = (group: DuplicateGroup) => {
    const newSet = new Set(selectedIds);
    group.files.slice(1).forEach(f => newSet.add(f.id));
    setSelectedIds(newSet);
  };

  const purgeSelected = () => {
    if (selectedIds.size === 0) return;
    const remaining = files.filter(f => !selectedIds.has(f.id));
    setFiles(remaining);
    setDuplicateGroups([]);
    setSelectedIds(new Set());
    toast({ title: "Deep Purge Executed", description: `Successfully neutralized ${selectedIds.size} redundant assets.` });
  };

  const downloadCleanBundle = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    const zip = new JSZip();
    files.forEach(f => {
      zip.file(f.name, f.blob);
    });

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `sanitized-bundle-${Date.now()}.zip`;
    link.click();
    
    setIsProcessing(false);
    toast({ title: "Archive Exported", description: "Clean project bundle saved to local storage." });
  };

  const clearStudio = () => {
    setFiles([]);
    setDuplicateGroups([]);
    setSelectedIds(new Set());
    toast({ title: "Studio Reset", description: "Pipeline buffer purged." });
  };

  const stats = useMemo(() => {
    const totalSize = files.reduce((acc, f) => acc + f.size, 0);
    const dupeFiles = duplicateGroups.reduce((acc, g) => acc + g.files.length - 1, 0);
    return {
      total: files.length,
      size: totalSize,
      dupes: dupeFiles
    };
  }, [files, duplicateGroups]);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Copy className="w-3.5 h-3.5" /> Maintenance Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div className="min-w-0">
              <h1 className="text-3xl sm:text-5xl lg:text-7xl font-headline font-black text-foreground uppercase tracking-tight overflow-wrap-anywhere">
                Duplicate <span className="text-primary italic">Purge Studio</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed overflow-wrap-anywhere">
                Professional-grade file redundancy analysis. Identify identical assets by bitstream size and identity, then execute deep purges for clean production bundles.
              </p>
           </div>
           {files.length > 0 && (
             <div className="flex flex-wrap gap-3 shrink-0">
                <Button variant="outline" onClick={clearStudio} className="h-12 px-6 rounded-xl border-border bg-secondary text-[10px] font-black uppercase tracking-widest hover:text-destructive w-full sm:w-auto">
                   <Trash2 className="w-4 h-4 mr-2" /> Reset
                </Button>
                <Button onClick={downloadCleanBundle} disabled={isProcessing} className="h-12 px-8 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/30 w-full sm:w-auto">
                   {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                   Export Clean ZIP
                </Button>
             </div>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 items-start">
        {/* Controls & List */}
        <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700 min-w-0">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group min-h-[450px]">
            <CardHeader className="pb-8 border-b border-border bg-secondary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                <Files className="w-5 h-5 text-primary" /> Active Payload Pipeline
              </CardTitle>
              {files.length > 0 && (
                <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest w-fit">
                   {files.length} Assets Registered
                </div>
              )}
            </CardHeader>
            
            <CardContent className="p-0">
              {!files.length ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="h-[450px] flex flex-col items-center justify-center cursor-pointer group hover:bg-primary/5 transition-all p-10 text-center"
                >
                  <div className="w-20 h-20 rounded-[2.5rem] bg-background border border-border flex items-center justify-center text-foreground/10 group-hover:text-primary group-hover:scale-110 transition-all mb-6 shadow-xl">
                    <Upload className="w-10 h-10" />
                  </div>
                  <p className="text-[10px] font-black uppercase text-foreground/30 tracking-[0.2em] group-hover:text-primary transition-colors leading-relaxed">
                    Drop folder visuals or ZIP archives for analysis<br />
                    <span className="text-[8px] opacity-40 uppercase font-bold">(Bitstream Scanning Active)</span>
                  </p>
                  <input type="file" ref={fileInputRef} multiple onChange={(e) => addFilesToState(e.target.files!)} className="hidden" />
                </div>
              ) : (
                <div className="divide-y divide-border max-h-[600px] overflow-auto custom-scrollbar">
                  {files.map((f) => (
                    <div key={f.id} className={cn(
                      "flex items-center gap-4 p-5 transition-all min-w-0",
                      selectedIds.has(f.id) ? "bg-red-500/5 opacity-60" : "hover:bg-secondary/20"
                    )}>
                      <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary/40 shrink-0">
                        {getFileIcon(f.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="text-[11px] font-bold text-foreground truncate uppercase">{f.name}</p>
                         <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                            <span className="text-[9px] font-bold text-foreground/20 uppercase tracking-widest">{formatSize(f.size)}</span>
                            <span className="text-foreground/10 text-[8px] hidden sm:inline">•</span>
                            <span className="text-[9px] text-foreground/20 font-medium uppercase truncate max-w-[150px]">{f.type}</span>
                         </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                         <button 
                          onClick={() => toggleSelect(f.id)}
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                            selectedIds.has(f.id) ? "bg-red-500 text-white" : "bg-secondary text-foreground/20 hover:text-red-500"
                          )}
                         >
                           {selectedIds.has(f.id) ? <X className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                         </button>
                      </div>
                    </div>
                  ))}
                  <div className="p-6 bg-secondary/30 flex justify-center">
                     <Button variant="ghost" onClick={() => fileInputRef.current?.click()} className="text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 h-auto py-2">
                        <Plus className="w-3.5 h-3.5 mr-2" /> Inject More Assets
                     </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Controls */}
        <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2 min-w-0">
          <Card className="glass-card border-border shadow-xl overflow-hidden relative group">
             <CardHeader className="py-6 border-b border-border bg-secondary/30">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 text-primary">
                  <Search className="w-4 h-4" /> Scanner Config
                </CardTitle>
             </CardHeader>
             <CardContent className="pt-8 space-y-8">
                <div className="space-y-4">
                   <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Discovery Logic</Label>
                   <div className="grid grid-cols-1 gap-3">
                      {[
                        { id: 'name-size', label: 'Identity Matrix (Name + Size)', icon: Zap },
                        { id: 'name-only', label: 'Linguistic Matrix (Name Only)', icon: ClipboardType },
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          onClick={() => setMatchMode(mode.id as any)}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-2xl border transition-all text-left",
                            matchMode === mode.id ? "bg-primary text-white border-primary shadow-lg" : "bg-background border-border text-foreground/40 hover:border-primary/20"
                          )}
                        >
                           <mode.icon className="w-4 h-4 shrink-0" />
                           <span className="text-[10px] font-black uppercase tracking-widest leading-tight">{mode.label}</span>
                        </button>
                      ))}
                   </div>
                </div>

                <Button 
                  onClick={findDuplicates}
                  disabled={isScanning || files.length === 0}
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl flex items-center justify-center gap-4 text-sm shadow-xl shadow-primary/30 transition-all active:scale-95"
                >
                  {isScanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  Execute Analysis
                </Button>
             </CardContent>
          </Card>

          {duplicateGroups.length > 0 && (
            <Card className="glass-card border-border shadow-2xl overflow-hidden animate-in zoom-in duration-500">
               <CardHeader className="py-6 border-b border-border bg-red-500/5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 text-red-500">
                      <AlertCircle className="w-4 h-4" /> Redundancy
                    </CardTitle>
                    <button 
                      onClick={() => {
                        const newSet = new Set(selectedIds);
                        duplicateGroups.forEach(g => g.files.slice(1).forEach(f => newSet.add(f.id)));
                        setSelectedIds(newSet);
                        toast({ title: "Auto-Selection Complete", description: "Ready for deep purge." });
                      }}
                      className="text-[9px] font-black uppercase text-primary hover:underline underline-offset-4 text-left"
                    >
                      Select All Excess
                    </button>
                  </div>
               </CardHeader>
               <CardContent className="p-0">
                  <div className="divide-y divide-border max-h-[400px] overflow-auto custom-scrollbar">
                     {duplicateGroups.map((group, idx) => (
                       <div key={idx} className="p-5 space-y-4 bg-red-500/[0.02] min-w-0">
                          <div className="flex items-center justify-between gap-4">
                             <div className="flex items-center gap-2 text-[10px] font-bold text-foreground truncate uppercase min-w-0 flex-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                <span className="truncate">{group.files[0].name}</span>
                             </div>
                             <button onClick={() => selectDuplicatesInGroup(group)} className="text-[8px] font-black uppercase text-red-500/60 hover:text-red-500 shrink-0">Purge Candidates</button>
                          </div>
                          <div className="space-y-1">
                             {group.files.map(f => (
                               <div key={f.id} className="flex items-center justify-between p-3 rounded-xl bg-background border border-border group/sub gap-3">
                                  <div className="flex items-center gap-3 min-w-0 truncate">
                                     <div className={cn("w-2 h-2 rounded-full shrink-0", selectedIds.has(f.id) ? "bg-red-500" : "bg-green-500")} />
                                     <span className="text-[10px] font-mono text-foreground/40 truncate">UID: {f.id}</span>
                                  </div>
                                  <Checkbox checked={selectedIds.has(f.id)} onCheckedChange={() => toggleSelect(f.id)} className="border-red-500/20 data-[state=checked]:bg-red-500 shrink-0" />
                               </div>
                             ))}
                          </div>
                       </div>
                     ))}
                  </div>
                  <div className="p-6 border-t border-border bg-background">
                     <Button 
                      onClick={purgeSelected}
                      disabled={selectedIds.size === 0}
                      className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl flex items-center justify-center gap-4 text-xs shadow-xl shadow-red-600/30"
                    >
                      <Trash2 className="w-5 h-5" />
                      Definitive Purge ({selectedIds.size})
                    </Button>
                  </div>
               </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-6">
             <div className="p-6 rounded-[2.5rem] bg-secondary border border-border flex items-start gap-5 group hover:border-primary/20 transition-all">
                <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all shrink-0">
                   <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0">
                   <p className="text-[10px] font-black text-foreground uppercase tracking-widest">WASM Sandbox</p>
                   <p className="text-[11px] text-foreground/40 leading-relaxed font-medium overflow-wrap-anywhere">Scanning occurs strictly in browser memory. Hardware identifiers are never transmitted.</p>
                </div>
             </div>
             <div className="p-6 rounded-[2.5rem] bg-secondary border border-border flex items-start gap-5 group hover:border-primary/20 transition-all">
                <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all shrink-0">
                   <Maximize className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0">
                   <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Master Bundle Logic</p>
                   <p className="text-[11px] text-foreground/40 leading-relaxed font-medium overflow-wrap-anywhere">Unified project architectures allow for efficient large-scale redundancy cleaning.</p>
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
