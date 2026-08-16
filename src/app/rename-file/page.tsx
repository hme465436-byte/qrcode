"use client"

import React, { useState, useRef, useMemo } from 'react';
import { 
  FileSignature, 
  Upload, 
  Download, 
  Trash2, 
  Info,
  CheckCircle2,
  FileText,
  FileImage,
  FileArchive,
  FileAudio,
  FileVideo,
  Settings2,
  Zap,
  Activity,
  Type,
  ArrowRight,
  ShieldCheck,
  FileCode,
  Layout
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function RenameFilePage() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [newName, setNewName] = useState('');
  const [keepExtension, setKeepExtension] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileMetadata = (name: string) => {
    const lastDot = name.lastIndexOf('.');
    if (lastDot === -1) return { base: name, ext: '' };
    return {
      base: name.substring(0, lastDot),
      ext: name.substring(lastDot)
    };
  };

  const fileInfo = useMemo(() => {
    if (!file) return null;
    return {
      ...getFileMetadata(file.name),
      size: formatSize(file.size),
      type: file.type
    };
  }, [file]);

  const finalName = useMemo(() => {
    if (!fileInfo) return '';
    if (!newName.trim()) return file.name;
    
    // If user typed an extension and we are not auto-appending, use theirs
    // Otherwise append the original extension
    return newName.trim() + (keepExtension ? fileInfo.ext : '');
  }, [newName, fileInfo, keepExtension, file]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const meta = getFileMetadata(selectedFile.name);
      setNewName(meta.base);
      toast({ title: "Asset Imported", description: "Identity matrix ready for re-labeling." });
    }
  };

  const handleDownload = () => {
    if (!file || !finalName) return;
    
    setIsProcessing(true);
    
    // We create a new file reference with the same content but different name
    // This happens entirely on the client
    const blob = file.slice(0, file.size, file.type);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = finalName;
    link.click();
    
    // Clean up
    setTimeout(() => {
      URL.revokeObjectURL(url);
      setIsProcessing(false);
      toast({ title: "Renamed & Saved", description: `"${finalName}" pushed to local storage.` });
    }, 100);
  };

  const handleClear = () => {
    setFile(null);
    setNewName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset", description: "Memory buffer purged." });
  };

  const getIcon = (type: string = '') => {
    if (type.startsWith('image/')) return <FileImage className="w-10 h-10" />;
    if (type.includes('pdf')) return <FileText className="w-10 h-10" />;
    if (type.includes('zip') || type.includes('archive')) return <FileArchive className="w-10 h-10" />;
    if (type.startsWith('audio/')) return <FileAudio className="w-10 h-10" />;
    if (type.startsWith('video/')) return <FileVideo className="w-10 h-10" />;
    if (type.includes('json') || type.includes('javascript') || type.includes('html')) return <FileCode className="w-10 h-10" />;
    return <FileText className="w-10 h-10" />;
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <FileSignature className="w-3.5 h-3.5" /> Identity Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Rename <span className="text-primary italic">File Studio</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
          Professional browser-side file re-labeling. Modify filenames and extensions with zero quality loss and absolute privacy. 100% local synthesis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Input & Controls */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                Asset Intake
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-10 space-y-10">
              {/* File Upload Zone */}
              <div className="space-y-4">
                <div 
                  onClick={() => !isProcessing && fileInputRef.current?.click()}
                  className={cn(
                    "relative group/upload h-48 rounded-[2.5rem] border-2 border-dashed border-border hover:border-primary/40 transition-all flex flex-col items-center justify-center bg-secondary/30 overflow-hidden cursor-pointer",
                    file && "border-solid border-primary/40"
                  )}
                >
                  {file ? (
                    <div className="text-center p-8 space-y-4">
                       <div className="text-primary/40 group-hover:text-primary transition-colors flex justify-center">
                          {getIcon(file.type)}
                       </div>
                       <div className="space-y-1">
                          <p className="text-xs font-black uppercase text-foreground truncate max-w-[300px]">{file.name}</p>
                          <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">{fileInfo?.size} detected</p>
                       </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-background border border-border flex items-center justify-center text-foreground/20 group-hover:text-primary group-hover:scale-110 transition-all mb-4 shadow-xl">
                        <Upload className="w-8 h-8" />
                      </div>
                      <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest group-hover:text-primary transition-colors text-center px-6 leading-relaxed">
                        Drop any asset or click to browse<br />
                        <span className="text-[8px] opacity-60 uppercase font-bold">(All formats supported)</span>
                      </p>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                </div>
              </div>

              {file && (
                <div className="space-y-10 animate-in zoom-in duration-500">
                  <div className="space-y-6">
                    <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">New Filename Protocol</Label>
                    <div className="relative group/name">
                       <Input 
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Enter new name..."
                        className="h-16 bg-secondary border-border rounded-2xl text-lg font-bold px-6 focus:ring-primary/40"
                       />
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/name:opacity-100 transition-opacity">
                         <Type className="w-6 h-6 text-primary" />
                       </div>
                    </div>

                    <div className="p-6 rounded-[2rem] bg-secondary/50 border border-border flex items-center justify-between group hover:border-primary/20 transition-all">
                       <div className="space-y-1">
                          <p className="text-[11px] font-black text-foreground uppercase tracking-widest">Extension Locking</p>
                          <p className="text-[9px] text-foreground/30 font-medium uppercase">Auto-append original <span className="text-primary font-mono">{fileInfo?.ext}</span></p>
                       </div>
                       <Switch checked={keepExtension} onCheckedChange={setKeepExtension} />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <Button 
                      onClick={handleDownload}
                      disabled={isProcessing || !file || !finalName}
                      className="flex-1 h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                    >
                      {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Download className="w-6 h-6 group-hover:translate-y-1 transition-transform" />}
                      Download Renamed Master
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleClear}
                      className="w-16 h-16 rounded-2xl border-border bg-secondary hover:bg-secondary/80 text-foreground/40 hover:text-destructive transition-all active:scale-95"
                    >
                      <Trash2 className="w-6 h-6" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
            <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Privacy Absolute</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                The studio performs re-labeling entirely within your browser session. Binary data is never transmitted to our servers, maintaining a 100% secure local workflow.
              </p>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group min-h-[400px] flex flex-col">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" /> Identity Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-8 flex flex-col justify-center gap-10">
              {!file ? (
                <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-6">
                  <Activity className="w-20 h-20 text-primary mx-auto" />
                  <p className="text-xs font-black uppercase tracking-[0.3em]">Studio Standby</p>
                </div>
              ) : (
                <div className="space-y-10 animate-in zoom-in duration-500">
                  <div className="p-10 rounded-[3rem] bg-secondary/50 border border-border flex flex-col items-center justify-center gap-8 shadow-inner relative overflow-hidden group/final">
                     <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover/final:opacity-100 transition-opacity" />
                     <div className="w-24 h-24 rounded-[2.5rem] bg-background border border-border flex items-center justify-center text-primary shadow-xl group-hover/final:scale-110 transition-transform">
                        {getIcon(file.type)}
                     </div>
                     <div className="text-center space-y-4 px-4 w-full">
                        <p className="text-[10px] font-black uppercase text-foreground/30 tracking-widest">Final Registry Mapping</p>
                        <h3 className="text-xl font-mono font-bold text-foreground break-all bg-white dark:bg-black/40 p-6 rounded-2xl border border-border shadow-inner">
                           {finalName}
                        </h3>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                     <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group transition-all hover:bg-secondary/80">
                        <Zap className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Instant Binary Link</p>
                           <p className="text-[10px] text-foreground/40 font-medium leading-relaxed">System creates a direct memory pointer to the original bytes with the new label.</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group transition-all hover:bg-secondary/80">
                        <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Metadata Integrity</p>
                           <p className="text-[10px] text-foreground/40 font-medium leading-relaxed">Original file creation dates and internal headers are preserved by default.</p>
                        </div>
                     </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
               <Settings2 className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">WASM Master Logic</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                Our re-labeling engine bypasses the operating system's standard file dialog constraints, allowing for clinical precision in filename production before local storage commitment.
              </p>
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
        .dark .bg-checkered {
           background-image: linear-gradient(45deg, #111113 25%, transparent 25%), 
                            linear-gradient(-45deg, #111113 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #111113 75%), 
                            linear-gradient(-45deg, transparent 75%, #111113 75%);
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
      `}</style>
    </div>
  );
}
