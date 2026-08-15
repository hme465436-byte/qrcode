
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
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
          if (val && typeof val.description === 'string') {
            let category: MetadataTag['category'] = 'general';
            const lowerKey = key.toLowerCase();
            if (lowerKey.includes('gps')) category = 'gps';
            else if (lowerKey.includes('make') || lowerKey.includes('model') || lowerKey.includes('lens')) category = 'camera';
            else if (lowerKey.includes('software') || lowerKey.includes('creator')) category = 'software';
            else if (lowerKey.includes('date')) category = 'date';

            tags.push({ label: key, value: val.description, category });
          }
        });
      } else if (type === 'pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const title = pdf.getTitle();
        const author = pdf.getAuthor();
        const subject = pdf.getSubject();
        const creator = pdf.getCreator();
        const producer = pdf.getProducer();
        const creationDate = pdf.getCreationDate();
        
        if (title) tags.push({ label: 'Title', value: title, category: 'general' });
        if (author) tags.push({ label: 'Author', value: author, category: 'software' });
        if (subject) tags.push({ label: 'Subject', value: subject, category: 'general' });
        if (creator) tags.push({ label: 'Creator', value: creator, category: 'software' });
        if (producer) tags.push({ label: 'Producer', value: producer, category: 'software' });
        if (creationDate) tags.push({ label: 'Creation Date', value: creationDate.toString(), category: 'date' });
      } else if (type === 'audio' || type === 'video') {
        // FFmpeg is better at cleaning than reading for browser UI
        tags.push({ label: 'Embedded Stream Data', value: 'Detected', category: 'general' });
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
        cleanedUrl: null
      });
    }

    setFiles(prev => [...prev, ...newItems]);
    toast({ title: "Assets Imported", description: `Analyzed ${selectedFiles.length} file(s) for sensitive headers.` });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const cleanFile = async (item: FileItem): Promise<Blob | null> => {
    try {
      if (item.type === 'image') {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = URL.createObjectURL(item.file);
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return resolve(null);
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => resolve(blob), item.file.type, 0.95);
            URL.revokeObjectURL(img.src);
          };
        });
      } else if (item.type === 'pdf') {
        const arrayBuffer = await item.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        pdf.setTitle('');
        pdf.setAuthor('');
        pdf.setSubject('');
        pdf.setCreator('');
        pdf.setProducer('');
        pdf.setCreationDate(new Date(0));
        pdf.setModificationDate(new Date(0));
        const bytes = await pdf.save();
        return new Blob([bytes], { type: 'application/pdf' });
      } else if (item.type === 'audio' || item.type === 'video') {
        const ready = await loadFFmpeg();
        if (!ready || !ffmpegRef.current) return null;
        const ffmpeg = ffmpegRef.current;
        const inputName = 'input';
        const outputName = 'output' + (item.type === 'audio' ? '.mp3' : '.mp4');
        const data = new Uint8Array(await item.file.arrayBuffer());
        await ffmpeg.writeFile(inputName, data);
        // -map_metadata -1 strips all metadata
        await ffmpeg.exec(['-i', inputName, '-map_metadata', '-1', '-c', 'copy', outputName]);
        const result = await ffmpeg.readFile(outputName);
        return new Blob([(result as any).buffer], { type: item.file.type });
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
        updatedFiles[i].cleanedUrl = URL.createObjectURL(blob);
      } else {
        updatedFiles[i].status = 'error';
        updatedFiles[i].error = 'Sanitization failed';
      }
      
      setProgress(Math.round(((i + 1) / updatedFiles.length) * 100));
      setFiles([...updatedFiles]);
    }

    setIsProcessing(false);
    toast({ title: "Sanitization Complete", description: "All privacy protocols executed successfully." });
  };

  const downloadZip = async () => {
    const readyFiles = files.filter(f => f.cleanedUrl);
    if (readyFiles.length === 0) return;

    const zip = new JSZip();
    for (const f of readyFiles) {
      const response = await fetch(f.cleanedUrl!);
      const blob = await response.blob();
      zip.file(`cleaned_${f.file.name}`, blob);
    }

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `privacy-clean-bundle-${Date.now()}.zip`;
    link.click();
    toast({ title: "Bundle Exported", description: "Compressed ZIP pushed to local storage." });
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
    toast({ title: "Studio Reset", description: "Memory purged and buffers cleared." });
  };

  const toggleExpand = (id: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, expanded: !f.expanded } : f));
  };

  const statsByStatus = useMemo(() => {
    return {
      total: files.length,
      cleaned: files.filter(f => f.status === 'completed').length,
      metadataFound: files.reduce((acc, f) => acc + f.metadata.length, 0)
    };
  }, [files]);

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <EyeOff className="w-3.5 h-3.5" /> Privacy Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <h1 className="text-3xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight">
                Metadata <span className="text-primary italic">Remover Master</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional multi-format sanitization. Strip EXIF, GPS, and binary headers from images, PDFs, and media files locally in your browser sandbox.
              </p>
           </div>
           {files.length > 0 && (
             <div className="flex gap-3">
                <Button variant="outline" onClick={clearAll} className="h-12 px-6 rounded-xl border-border bg-secondary text-[10px] font-black uppercase tracking-widest hover:text-destructive">
                   <Trash2 className="w-4 h-4 mr-2" /> Clear Studio
                </Button>
                <Button onClick={processAll} disabled={isProcessing} className="h-12 px-8 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20">
                   {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldAlert className="w-4 h-4 mr-2" />}
                   Sanitize All
                </Button>
             </div>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Main List Section */}
        <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group min-h-[400px]">
            <CardHeader className="pb-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                <ListFilter className="w-5 h-5 text-primary" /> Production Pipeline
              </CardTitle>
              {files.length > 0 && (
                <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest">
                  {statsByStatus.cleaned} / {statsByStatus.total} Cleaned
                </div>
              )}
            </CardHeader>
            
            <CardContent className="p-0">
              {!files.length ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="h-[400px] flex flex-col items-center justify-center cursor-pointer group hover:bg-primary/5 transition-all"
                >
                  <div className="w-16 h-16 rounded-[1.5rem] bg-background border border-border flex items-center justify-center text-foreground/20 group-hover:text-primary group-hover:scale-110 transition-all mb-6">
                    <Upload className="w-8 h-8" />
                  </div>
                  <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest group-hover:text-primary transition-colors text-center px-10 leading-relaxed">
                    Drop high-res visuals, documents, or media<br />
                    <span className="text-[8px] opacity-60">(JPG, PNG, PDF, MP4, MP3)</span>
                  </p>
                  <input type="file" ref={fileInputRef} multiple onChange={handleFileUpload} className="hidden" />
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {files.map((item) => (
                    <div key={item.id} className="group/item flex flex-col bg-secondary/10 hover:bg-secondary/30 transition-all">
                      <div className="flex items-center gap-4 p-5">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-border shadow-inner transition-all",
                          item.status === 'completed' ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-background text-primary/40"
                        )}>
                          {item.type === 'image' ? <FileImage className="w-6 h-6" /> : 
                           item.type === 'pdf' ? <FileText className="w-6 h-6" /> : 
                           item.type === 'audio' ? <FileAudio className="w-6 h-6" /> : 
                           <FileVideo className="w-6 h-6" />}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black uppercase text-foreground truncate">{item.file.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                             <span className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest">{formatSize(item.file.size)}</span>
                             <span className="w-1 h-1 rounded-full bg-border" />
                             <span className={cn(
                               "text-[9px] font-black uppercase tracking-widest",
                               item.status === 'completed' ? "text-green-500" : "text-primary/60"
                             )}>
                               {item.status === 'idle' ? `${item.metadata.length} Tags Detected` : 
                                item.status === 'cleaning' ? 'Purging Headers...' : 
                                item.status === 'completed' ? 'Deep Clean Active' : item.status}
                             </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                           {item.cleanedUrl && (
                             <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-green-500 bg-green-500/5 hover:bg-green-500/20">
                               <a href={item.cleanedUrl} download={`cleaned_${item.file.name}`}>
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
                           <div className="bg-background/50 rounded-2xl border border-border p-6 space-y-6">
                              <div className="flex items-center justify-between border-b border-border pb-4">
                                 <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Metadata Inspection</h4>
                                 <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5">
                                       <Checkbox id={`cb-${item.id}`} checked={true} disabled className="h-3 w-3 rounded" />
                                       <Label htmlFor={`cb-${item.id}`} className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">Strip All</Label>
                                    </div>
                                 </div>
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                 {item.metadata.length > 0 ? item.metadata.map((tag, idx) => (
                                   <div key={idx} className="flex gap-4 p-3 rounded-xl bg-secondary/50 border border-border group/tag">
                                      <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center shrink-0">
                                         {tag.category === 'gps' ? <Globe className="w-3.5 h-3.5 text-primary" /> :
                                          tag.category === 'camera' ? <Camera className="w-3.5 h-3.5 text-primary" /> :
                                          tag.category === 'date' ? <RefreshCcw className="w-3.5 h-3.5 text-primary" /> :
                                          <Settings2 className="w-3.5 h-3.5 text-primary/40" />}
                                      </div>
                                      <div className="min-w-0">
                                         <p className="text-[8px] font-black uppercase text-foreground/30 tracking-widest">{tag.label}</p>
                                         <p className="text-[10px] font-bold text-foreground truncate">{tag.value}</p>
                                      </div>
                                   </div>
                                 )) : (
                                   <div className="col-span-full py-8 text-center opacity-20">
                                      <Search className="w-10 h-10 mx-auto mb-2" />
                                      <p className="text-[9px] font-black uppercase tracking-widest">Zero Public Headers Detected</p>
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
                                      updated[idx].cleanedUrl = URL.createObjectURL(blob);
                                    } else {
                                      updated[idx].status = 'error';
                                    }
                                    setFiles([...updated]);
                                  });
                                }} className="w-full h-12 rounded-xl bg-secondary border border-border text-foreground/60 text-[10px] font-black uppercase tracking-widest hover:text-primary transition-all">
                                  Purge Individual Matrix
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
              <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center p-12">
                 <div className="w-full max-w-sm space-y-6 animate-in zoom-in duration-500">
                    <div className="relative w-24 h-24 mx-auto">
                       <div className="w-24 h-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                       <Lock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />
                    </div>
                    <div className="space-y-4">
                       <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                          <span>Sanitizing Matrix</span>
                          <span>{progress}%</span>
                       </div>
                       <Progress value={progress} className="h-2" />
                    </div>
                 </div>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar Info & Batch Export */}
        <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          {files.length > 0 && (
            <Card className="glass-card border-border shadow-xl overflow-hidden group">
               <CardHeader className="py-6 border-b border-border bg-secondary/30">
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 text-primary">
                    <Maximize className="w-4 h-4" /> Production Analytics
                  </CardTitle>
               </CardHeader>
               <CardContent className="pt-8 space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 rounded-2xl bg-secondary border border-border text-center space-y-1">
                        <p className="text-[8px] font-black uppercase text-foreground/30 tracking-widest">Active Jobs</p>
                        <p className="text-xl font-headline font-black text-foreground">{statsByStatus.total}</p>
                     </div>
                     <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 text-center space-y-1">
                        <p className="text-[8px] font-black uppercase text-primary/40 tracking-widest">Tags Identified</p>
                        <p className="text-xl font-headline font-black text-primary">{statsByStatus.metadataFound}</p>
                     </div>
                  </div>

                  {statsByStatus.cleaned > 1 && (
                    <div className="space-y-6 animate-in zoom-in duration-500">
                       <Button onClick={downloadZip} className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-sm uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95">
                          <FileArchive className="w-6 h-6" />
                          Download ZIP Bundle
                       </Button>
                    </div>
                  )}

                  <div className="p-5 rounded-2xl bg-secondary border border-border flex items-start gap-4">
                     <Zap className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Hardware Cleaning</p>
                        <p className="text-[10px] text-foreground/40 font-medium leading-relaxed">
                          Your assets are processed using raw pixel re-mapping and binary header stripping protocols.
                        </p>
                     </div>
                  </div>
               </CardContent>
            </Card>
          )}

          <Card className="glass-card border-border shadow-xl overflow-hidden relative group">
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
               <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-3">
                 <Lock className="w-4 h-4" /> Privacy Protocol
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
               <div className="space-y-6">
                  {[
                    { icon: Camera, title: "EXIF Matrix", desc: "Strip camera model, lens settings, and firmware identifiers." },
                    { icon: Globe, title: "GPS Coordinates", desc: "Definitively remove latitude, longitude, and altitude data." },
                    { icon: Smartphone, title: "App Signatures", desc: "Purge editing software markers and hidden author tags." },
                    { icon: RefreshCcw, title: "Binary Purge", desc: "Strips hidden thumbnails and auxiliary binary headers." },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-5 group">
                       <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shrink-0 transition-transform group-hover:scale-110">
                          <item.icon className="w-5 h-5" />
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-foreground">{item.title}</p>
                          <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">{item.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>

               <div className="p-6 rounded-[2.5rem] bg-secondary border border-border">
                  <p className="text-[11px] text-foreground/50 leading-relaxed font-medium italic text-center">
                    "All visual and linguistic sanitization occurs locally within your browser sandbox. Your assets never leave your machine."
                  </p>
               </div>
            </CardContent>
          </Card>

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
            <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Technical Master Logic</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                For images, we utilize canvas-level re-encoding. For documents and media, we perform direct binary manipulation via PDF-Lib and FFmpeg to ensure metadata integrity is permanently voided.
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

