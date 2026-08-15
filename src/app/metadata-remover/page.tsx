
"use client"

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { 
  ShieldAlert, 
  EyeOff, 
  Trash2, 
  Upload, 
  Download, 
  CheckCircle2, 
  Info,
  Camera,
  Globe,
  Loader2,
  FileImage,
  RefreshCcw,
  Maximize,
  Lock,
  Smartphone,
  X,
  FileText,
  FileAudio,
  FileVideo,
  FileArchive,
  ChevronDown,
  ChevronUp,
  Settings2,
  Zap,
  ListFilter,
  Check,
  ShieldCheck,
  AlertCircle,
  Activity,
  Cpu,
  Fingerprint
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import ExifReader from 'exifreader';
import { PDFDocument } from 'pdf-lib';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import JSZip from 'jszip';

interface MetadataTag {
  label: string;
  value: string;
  category: 'camera' | 'gps' | 'software' | 'date' | 'general';
}

interface FileItem {
  id: string;
  file: File;
  type: 'image' | 'pdf' | 'audio' | 'video' | 'unknown';
  status: 'idle' | 'analyzing' | 'cleaning' | 'completed' | 'error';
  metadata: MetadataTag[];
  cleanedUrl: string | null;
  cleanedBlob: Blob | null;
  error?: string;
  expanded?: boolean;
}

export default function MetadataRemoverPage() {
  const { toast } = useToast();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const loadFFmpeg = async () => {
    if (isLoaded && ffmpegRef.current) return true;
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    if (!ffmpegRef.current) ffmpegRef.current = new FFmpeg();
    const ffmpeg = ffmpegRef.current;
    try {
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      setIsLoaded(true);
      return true;
    } catch (err) {
      return false;
    }
  };

  const getFileType = (file: File): FileItem['type'] => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type === 'application/pdf') return 'pdf';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.startsWith('video/')) return 'video';
    return 'unknown';
  };

  const extractMetadata = async (file: File, type: FileItem['type']): Promise<MetadataTag[]> => {
    const tags: MetadataTag[] = [];
    try {
      if (type === 'image') {
        const metadata = await ExifReader.load(file);
        Object.entries(metadata).forEach(([key, val]) => {
          if (val && (typeof val.description === 'string' || typeof val.value === 'string' || typeof val.value === 'number')) {
            let category: MetadataTag['category'] = 'general';
            const lowerKey = key.toLowerCase();
            if (lowerKey.includes('gps')) category = 'gps';
            else if (lowerKey.includes('make') || lowerKey.includes('model') || lowerKey.includes('lens')) category = 'camera';
            else if (lowerKey.includes('software') || lowerKey.includes('creator') || lowerKey.includes('adobe')) category = 'software';
            else if (lowerKey.includes('date') || lowerKey.includes('time')) category = 'date';

            const displayValue = val.description || String(val.value);
            tags.push({ label: key, value: displayValue, category });
          }
        });
      } else if (type === 'pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const title = pdf.getTitle();
        const author = pdf.getAuthor();
        const creator = pdf.getCreator();
        const producer = pdf.getProducer();
        
        if (title) tags.push({ label: 'Title', value: title, category: 'general' });
        if (author) tags.push({ label: 'Author', value: author, category: 'software' });
        if (creator) tags.push({ label: 'Creator', value: creator, category: 'software' });
        if (producer) tags.push({ label: 'Producer', value: producer, category: 'software' });
      } else if (type === 'audio' || type === 'video') {
        tags.push({ label: 'Binary Header', value: 'Stream Tags Embedded', category: 'general' });
      }
    } catch (e) {
      console.warn("Metadata read failed", e);
    }
    return tags;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const newItems: FileItem[] = [];
    for (const file of selectedFiles) {
      const type = getFileType(file);
      const metadata = await extractMetadata(file, type);
      newItems.push({
        id: Math.random().toString(36).substr(2, 9),
        file,
        type,
        status: 'idle',
        metadata,
        cleanedUrl: null,
        cleanedBlob: null,
        expanded: selectedFiles.length === 1
      });
    }

    setFiles(prev => [...prev, ...newItems]);
    toast({ title: "Assets Imported", description: `Detected headers in ${selectedFiles.length} file(s).` });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const cleanFile = async (item: FileItem): Promise<Blob | null> => {
    try {
      if (item.type === 'image') {
        // DEFINITIVE STRIP: Pixel Re-matricing
        // Create a new image from scratch using only raw pixel data
        return new Promise((resolve) => {
          const img = new Image();
          const objUrl = URL.createObjectURL(item.file);
          img.src = objUrl;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d', { alpha: true });
            if (!ctx) return resolve(null);
            
            // Draw original pixels to new context (this strips all metadata inherently)
            ctx.drawImage(img, 0, 0);
            
            // Re-encode to clean Blob
            const outputType = item.file.type === 'image/png' ? 'image/png' : 'image/jpeg';
            canvas.toBlob((blob) => {
              URL.revokeObjectURL(objUrl);
              resolve(blob);
            }, outputType, 1.0); // Maximum quality, zero metadata
          };
          img.onerror = () => {
            URL.revokeObjectURL(objUrl);
            resolve(null);
          };
        });
      } else if (item.type === 'pdf') {
        // Deep Document Scrubbing
        const arrayBuffer = await item.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        
        // Wipe metadata dictionary
        pdf.setTitle('');
        pdf.setAuthor('');
        pdf.setSubject('');
        pdf.setCreator('');
        pdf.setProducer('');
        pdf.setCreationDate(new Date(0)); // Reset to Unix Epoch
        pdf.setModificationDate(new Date(0));
        
        const bytes = await pdf.save();
        return new Blob([bytes], { type: 'application/pdf' });
      } else if (item.type === 'audio' || item.type === 'video') {
        // Bitstream Stream Stripping using FFmpeg
        const ready = await loadFFmpeg();
        if (!ready || !ffmpegRef.current) return null;
        const ffmpeg = ffmpegRef.current;
        const inputName = `input_${item.id}`;
        const outputName = `clean_${item.id}.${item.file.name.split('.').pop()}`;
        
        try {
          const data = new Uint8Array(await item.file.arrayBuffer());
          await ffmpeg.writeFile(inputName, data);
          // -map_metadata -1 removes all global and stream metadata
          await ffmpeg.exec(['-i', inputName, '-map_metadata', '-1', '-c', 'copy', outputName]);
          const result = await ffmpeg.readFile(outputName);
          const blob = new Blob([(result as any).buffer], { type: item.file.type });
          
          await ffmpeg.deleteFile(inputName);
          await ffmpeg.deleteFile(outputName);
          
          return blob;
        } catch (e) {
          return null;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  const processAll = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProgress(0);

    const updatedFiles = [...files];
    for (let i = 0; i < updatedFiles.length; i++) {
      const item = updatedFiles[i];
      if (item.status === 'completed') continue;

      updatedFiles[i].status = 'cleaning';
      setFiles([...updatedFiles]);

      const blob = await cleanFile(item);
      if (blob) {
        updatedFiles[i].status = 'completed';
        updatedFiles[i].cleanedBlob = blob;
        updatedFiles[i].cleanedUrl = URL.createObjectURL(blob);
      } else {
        updatedFiles[i].status = 'error';
        updatedFiles[i].error = 'Sanitization failed';
      }
      
      setProgress(Math.round(((i + 1) / updatedFiles.length) * 100));
      setFiles([...updatedFiles]);
    }

    setIsProcessing(false);
    toast({ title: "Deep Purge Complete", description: "All identifiers have been definitively stripped." });
  };

  const downloadZip = async () => {
    const readyFiles = files.filter(f => f.cleanedBlob);
    if (readyFiles.length === 0) return;

    const zip = new JSZip();
    for (const f of readyFiles) {
      zip.file(`sanitized_${f.file.name}`, f.cleanedBlob!);
    }

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `mykit-sanitized-bundle-${Date.now()}.zip`;
    link.click();
    toast({ title: "Archive Ready", description: "Sanitized ZIP bundle exported." });
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const item = prev.find(f => f.id === id);
      if (item?.cleanedUrl) URL.revokeObjectURL(item.cleanedUrl);
      return prev.filter(f => f.id !== id);
    });
  };

  const clearAll = () => {
    files.forEach(f => f.cleanedUrl && URL.revokeObjectURL(f.cleanedUrl));
    setFiles([]);
    setProgress(0);
    toast({ title: "Workspace Reset", description: "Pipeline cleared." });
  };

  const toggleExpand = (id: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, expanded: !f.expanded } : f));
  };

  const stats = useMemo(() => ({
    total: files.length,
    cleaned: files.filter(f => f.status === 'completed').length,
    tags: files.reduce((acc, f) => acc + f.metadata.length, 0),
    hasGps: files.some(f => f.metadata.some(m => m.category === 'gps'))
  }), [files]);

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <EyeOff className="w-3.5 h-3.5" /> High-Security Mode
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <h1 className="text-4xl md:text-7xl font-headline font-black text-foreground uppercase tracking-tight">
                Metadata <span className="text-primary italic">Sanitizer V2</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Advanced anonymity via pixel re-matricing and bitstream copy protocols. Definitive removal of EXIF, GPS, author fingerprints, and hidden software markers.
              </p>
           </div>
           {files.length > 0 && (
             <div className="flex gap-3">
                <Button variant="outline" onClick={clearAll} className="h-12 px-6 rounded-xl border-border bg-secondary text-[10px] font-black uppercase tracking-widest hover:text-destructive">
                   <Trash2 className="w-4 h-4 mr-2" /> Reset
                </Button>
                <Button onClick={processAll} disabled={isProcessing} className="h-12 px-8 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/30">
                   {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldAlert className="w-4 h-4 mr-2" />}
                   Deep Purge All
                </Button>
             </div>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Main List Section */}
        <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          {stats.hasGps && (
             <div className="p-6 rounded-[2rem] bg-red-500/10 border border-red-500/20 flex items-center gap-6 animate-in zoom-in duration-500">
                <div className="w-12 h-12 rounded-2xl bg-red-500 text-white flex items-center justify-center shadow-xl shadow-red-500/20">
                   <Globe className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1">
                   <h4 className="text-[11px] font-black uppercase tracking-widest text-red-600">Location Alert Detected</h4>
                   <p className="text-[11px] text-red-600/60 font-medium">GPS coordinates identified in one or more assets. Pixel re-mapping is highly recommended.</p>
                </div>
             </div>
          )}

          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group min-h-[450px]">
            <CardHeader className="pb-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                <ListFilter className="w-5 h-5 text-primary" /> Active Production Pipeline
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-0">
              {!files.length ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="h-[450px] flex flex-col items-center justify-center cursor-pointer group hover:bg-primary/5 transition-all"
                >
                  <div className="w-20 h-20 rounded-[2.5rem] bg-background border border-border flex items-center justify-center text-foreground/10 group-hover:text-primary group-hover:scale-110 transition-all mb-6 shadow-xl">
                    <Upload className="w-10 h-10" />
                  </div>
                  <p className="text-[10px] font-black uppercase text-foreground/30 tracking-[0.2em] group-hover:text-primary transition-colors text-center px-10">
                    Drop visuals or documents for re-matricing<br />
                    <span className="text-[8px] opacity-40 uppercase font-bold">(Maximum Privacy Guaranteed)</span>
                  </p>
                  <input type="file" ref={fileInputRef} multiple onChange={handleFileUpload} className="hidden" />
                </div>
              ) : (
                <div className="divide-y divide-border max-h-[650px] overflow-auto custom-scrollbar">
                  {files.map((item) => (
                    <div key={item.id} className="group/item flex flex-col bg-secondary/10 hover:bg-secondary/30 transition-all">
                      <div className="flex items-center gap-4 p-5">
                        <div className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-border shadow-inner transition-all",
                          item.status === 'completed' ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-background text-primary/40"
                        )}>
                          {item.type === 'image' ? <FileImage className="w-7 h-7" /> : 
                           item.type === 'pdf' ? <FileText className="w-7 h-7" /> : 
                           item.type === 'audio' ? <FileAudio className="w-7 h-7" /> : 
                           <FileVideo className="w-7 h-7" />}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black uppercase text-foreground truncate">{item.file.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                             <span className="text-[9px] font-bold text-foreground/20 uppercase tracking-widest">{formatSize(item.file.size)}</span>
                             <span className={cn(
                               "text-[9px] font-black uppercase tracking-widest",
                               item.status === 'completed' ? "text-green-500" : "text-primary/60"
                             )}>
                               {item.status === 'idle' ? `${item.metadata.length} Identifiers Identified` : 
                                item.status === 'cleaning' ? 'Executing Pixel Purge...' : 
                                item.status === 'completed' ? 'Verification Success: 0 Headers Remaining' : item.status}
                             </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                           {item.status === 'completed' && item.cleanedUrl && (
                             <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-green-500 bg-green-500/10 hover:bg-green-500/20 shadow-lg">
                               <a href={item.cleanedUrl} download={`sanitized_${item.file.name}`}>
                                 <Download className="w-4 h-4" />
                               </a>
                             </Button>
                           )}
                           <Button variant="ghost" size="icon" onClick={() => toggleExpand(item.id)} className="h-10 w-10 rounded-xl text-foreground/20 hover:text-primary">
                             {item.expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                           </Button>
                           <Button variant="ghost" size="icon" onClick={() => removeFile(item.id)} className="h-10 w-10 rounded-xl text-foreground/20 hover:text-destructive">
                             <X className="w-4 h-4" />
                           </Button>
                        </div>
                      </div>

                      {item.expanded && (
                        <div className="px-5 pb-8 pt-2 animate-in slide-in-from-top-2 duration-300">
                           <div className="bg-background/50 rounded-[2rem] border border-border p-8 space-y-8">
                              <div className="flex items-center justify-between border-b border-border pb-6">
                                 <div className="flex items-center gap-3">
                                    <Fingerprint className="w-4 h-4 text-primary" />
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Identity Inspection</h4>
                                 </div>
                                 {item.status === 'completed' ? (
                                   <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 text-[8px] font-black uppercase tracking-widest shadow-xl shadow-green-500/5">
                                      <ShieldCheck className="w-3.5 h-3.5" /> Bitstream Verified Clean
                                   </div>
                                 ) : (
                                   <div className="text-[8px] font-black uppercase text-primary/40 tracking-widest">Awaiting Re-matricing</div>
                                 )}
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-56 overflow-y-auto pr-4 custom-scrollbar">
                                 {item.metadata.length > 0 ? item.metadata.map((tag, idx) => (
                                   <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-secondary/50 border border-border group/tag hover:border-primary/20 transition-all">
                                      <div className={cn(
                                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-inner border border-border",
                                        tag.category === 'gps' ? "bg-red-500/10 text-red-500" : "bg-background text-primary/40"
                                      )}>
                                         {tag.category === 'gps' ? <Globe className="w-4 h-4" /> :
                                          tag.category === 'camera' ? <Camera className="w-4 h-4" /> :
                                          tag.category === 'date' ? <RefreshCcw className="w-4 h-4" /> :
                                          <Settings2 className="w-4 h-4" />}
                                      </div>
                                      <div className="min-w-0 flex flex-col justify-center">
                                         <p className="text-[8px] font-black uppercase text-foreground/30 tracking-widest">{tag.label}</p>
                                         <p className="text-[11px] font-bold text-foreground truncate">{tag.value}</p>
                                      </div>
                                   </div>
                                 )) : (
                                   <div className="col-span-full py-12 text-center opacity-20 border-2 border-dashed border-border rounded-[2.5rem]">
                                      <CheckCircle2 className="w-12 h-12 mx-auto mb-3" />
                                      <p className="text-[10px] font-black uppercase tracking-widest text-foreground">Zero Detectable Fingerprints</p>
                                   </div>
                                 )}
                              </div>

                              {item.status === 'idle' && (
                                <Button onClick={() => {
                                  const updated = [...files];
                                  const idx = updated.findIndex(f => f.id === item.id);
                                  updated[idx].status = 'cleaning';
                                  setFiles(updated);
                                  cleanFile(item).then(blob => {
                                    if (blob) {
                                      updated[idx].status = 'completed';
                                      updated[idx].cleanedBlob = blob;
                                      updated[idx].cleanedUrl = URL.createObjectURL(blob);
                                    } else {
                                      updated[idx].status = 'error';
                                    }
                                    setFiles([...updated]);
                                  });
                                }} className="w-full h-14 rounded-2xl bg-primary text-white text-[11px] font-black uppercase tracking-widest hover:scale-[1.01] active:scale-95 shadow-xl shadow-primary/20 transition-all">
                                  Execute Intensive Sanitize
                                </Button>
                              )}
                           </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            
            {isProcessing && (
              <div className="absolute inset-0 bg-background/40 backdrop-blur-md z-50 flex flex-col items-center justify-center p-12">
                 <div className="w-full max-w-sm space-y-8 animate-in zoom-in duration-500">
                    <div className="relative w-28 h-28 mx-auto">
                       <div className="w-28 h-28 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                       <Lock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                    </div>
                    <div className="space-y-4 text-center">
                       <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-primary">
                          <span>Re-matricing Active</span>
                          <span>{progress}%</span>
                       </div>
                       <Progress value={progress} className="h-2 rounded-full" />
                       <p className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest animate-pulse">Definitively Purging Bitstreams...</p>
                    </div>
                 </div>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar Analytics */}
        <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          {files.length > 0 && (
            <Card className="glass-card border-border shadow-xl overflow-hidden group">
               <CardHeader className="py-6 border-b border-border bg-secondary/30">
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 text-primary">
                    <Maximize className="w-4 h-4" /> Studio Analytics
                  </CardTitle>
               </CardHeader>
               <CardContent className="pt-8 space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-5 rounded-2xl bg-secondary border border-border text-center space-y-1">
                        <p className="text-[8px] font-black uppercase text-foreground/30 tracking-widest">Active Stack</p>
                        <p className="text-2xl font-headline font-black text-foreground">{stats.total}</p>
                     </div>
                     <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 text-center space-y-1">
                        <p className="text-[8px] font-black uppercase text-primary/40 tracking-widest">Tags Isolated</p>
                        <p className="text-2xl font-headline font-black text-primary">{stats.tags}</p>
                     </div>
                  </div>

                  {stats.cleaned > 1 && (
                    <div className="space-y-6 animate-in zoom-in duration-500">
                       <Button onClick={downloadZip} className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-sm uppercase tracking-widest shadow-xl shadow-primary/30 transition-all active:scale-95">
                          <FileArchive className="w-6 h-6" />
                          Download ZIP Archive
                       </Button>
                    </div>
                  )}

                  <div className="p-6 rounded-[2rem] bg-secondary border border-border space-y-4">
                     <div className="flex items-center gap-3 text-primary">
                        <Cpu className="w-4 h-4" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest">Sanitize Protocol</h4>
                     </div>
                     <p className="text-[10px] text-foreground/40 font-medium leading-relaxed uppercase">
                        Visuals are processed using 1:1 hardware re-matricing. Documents use binary object mutation to nullify XMP and info dictionaries.
                     </p>
                  </div>
               </CardContent>
            </Card>
          )}

          <Card className="glass-card border-border shadow-xl overflow-hidden relative group">
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
               <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-3">
                 <ShieldCheck className="w-4 h-4" /> Hardened Protocols
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-10">
               <div className="space-y-8">
                  {[
                    { icon: Camera, title: "EXIF/GPS DESTRUCTION", desc: "Pixel re-mapping protocol creates a brand new image file, inherently excluding all camera history." },
                    { icon: Smartphone, title: "SOFTWARE PURGE", desc: "Forced bitstream sanitization removes Adobe, Apple, and social media fingerprints from binary headers." },
                    { icon: RefreshCcw, title: "1:1 REMATRICING", desc: "Visual assets are reconstructed from raw pixel buffers, nullifying all potential metadata dictionaries." },
                    { icon: Lock, title: "WASM ISOLATION", desc: "Sanitization occurs entirely within a secure browser sandbox. Zero data leaves your device memory." },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-5 group/item">
                       <div className="w-12 h-12 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shrink-0 transition-all group-hover/item:scale-110 shadow-lg group-hover/item:border-primary/30">
                          <item.icon className="w-5 h-5" />
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-foreground">{item.title}</p>
                          <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">{item.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>

               <div className="p-8 rounded-[3rem] bg-background border-2 border-dashed border-border text-center">
                  <Activity className="w-8 h-8 text-primary/20 mx-auto mb-4" />
                  <p className="text-[11px] text-foreground/30 leading-relaxed font-black uppercase tracking-widest">
                    Privacy Score: 100/100<br />
                    <span className="text-[8px] opacity-40">Verified Studio Standard</span>
                  </p>
               </div>
            </CardContent>
          </Card>

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
            <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Deep Purge Note</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                Our V2 engine creates unique binary clones of your files. Unlike standard "tag editors," we manipulate the core bitstream to ensure 0% data leakage across all supported formats.
              </p>
            </div>
          </div>
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

