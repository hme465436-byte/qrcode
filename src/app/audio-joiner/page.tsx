"use client"

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Music, 
  Upload, 
  Download, 
  Trash2, 
  Sparkles, 
  Loader2, 
  Info,
  CheckCircle2,
  FileAudio,
  Settings2,
  Terminal,
  Activity,
  ArrowUp,
  ArrowDown,
  Plus,
  ListMusic,
  X,
  Play,
  Pause
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

interface AudioFile {
  id: string;
  file: File;
  name: string;
  size: number;
  duration: number;
}

export default function AudioJoinerPage() {
  const { toast } = useToast();
  const [files, setFiles] = useState<AudioFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [mergedUrl, setMergedUrl] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const ffmpegRef = useRef<FFmpeg | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (mergedUrl) URL.revokeObjectURL(mergedUrl);
    };
  }, [mergedUrl]);

  const loadFFmpeg = async () => {
    if (isLoaded && ffmpegRef.current) return true;
    
    setStatus('Initializing FFmpeg Engine...');
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    
    if (!ffmpegRef.current) {
      ffmpegRef.current = new FFmpeg();
    }
    
    const ffmpeg = ffmpegRef.current;
    
    ffmpeg.on('log', ({ message }) => {
      setLogs(prev => [...prev.slice(-4), message]);
    });

    ffmpeg.on('progress', ({ progress: p }) => {
      setProgress(Math.round(p * 100));
    });

    try {
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      setIsLoaded(true);
      return true;
    } catch (err) {
      console.error('FFmpeg Load Error:', err);
      toast({ 
        variant: "destructive", 
        title: "Engine Failure", 
        description: "Failed to load FFmpeg. Ensure your browser supports SharedArrayBuffer." 
      });
      return false;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    selectedFiles.forEach(file => {
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.onloadedmetadata = () => {
        const newFile: AudioFile = {
          id: Math.random().toString(36).substr(2, 9),
          file,
          name: file.name,
          size: file.size,
          duration: audio.duration
        };
        setFiles(prev => [...prev, newFile]);
        window.URL.revokeObjectURL(audio.src);
      };
    });

    toast({ title: "Assets Queued", description: `Added ${selectedFiles.length} tracks to the pipeline.` });
    if (e.target) e.target.value = '';
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === files.length - 1) return;

    const newFiles = [...files];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
    setFiles(newFiles);
  };

  const joinAudio = async () => {
    if (files.length < 2) {
      toast({ variant: "destructive", title: "Payload Incomplete", description: "At least 2 tracks are required for merging." });
      return;
    }

    setIsProcessing(true);
    setLogs([]);
    
    const ready = await loadFFmpeg();
    if (!ready || !ffmpegRef.current) {
      setIsProcessing(false);
      return;
    }

    const ffmpeg = ffmpegRef.current;
    const outputName = `merged_master_${Date.now()}.mp3`;
    const inputList = 'inputs.txt';

    try {
      setStatus('Writing Assets to Memory...');
      let concatContent = '';
      
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const memName = `part_${i}_${f.name.replace(/[^a-z0-9]/gi, '_')}`;
        await ffmpeg.writeFile(memName, await fetchFile(f.file));
        concatContent += `file '${memName}'\n`;
      }

      await ffmpeg.writeFile(inputList, concatContent);

      setStatus('Synthesizing Master Matrix...');
      
      // Use concat demuxer for efficiency, but re-encode to ensure consistent sample rates
      await ffmpeg.exec([
        '-f', 'concat',
        '-safe', '0',
        '-i', inputList,
        '-acodec', 'libmp3lame',
        '-b:a', '192k',
        outputName
      ]);

      setStatus('Finalizing Master...');
      const data = await ffmpeg.readFile(outputName);
      const url = URL.createObjectURL(new Blob([(data as any).buffer], { type: 'audio/mp3' }));
      
      setMergedUrl(url);
      setProgress(100);
      setStatus('Production Complete');
      toast({ title: "Master Exported", description: "Tracks successfully merged into a single file." });
    } catch (err: any) {
      console.error('Join Error:', err);
      toast({ 
        variant: "destructive", 
        title: "Production Failed", 
        description: "An error occurred during audio synthesis." 
      });
      setStatus('Merge Failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setFiles([]);
    if (mergedUrl) URL.revokeObjectURL(mergedUrl);
    setMergedUrl(null);
    setProgress(0);
    setStatus('');
    setLogs([]);
    toast({ title: "Studio Reset", description: "Pipeline cleared and memory purged." });
  };

  const totalDuration = useMemo(() => {
    return files.reduce((acc, f) => acc + f.duration, 0);
  }, [files]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <ListMusic className="w-3.5 h-3.5" /> Media Production
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Audio <span className="text-primary italic">Joiner Master</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl">
          Professional-grade audio merging utility. Combine multiple MP3, WAV, or M4A tracks into a single high-fidelity track locally in your browser.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Input Controls */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6" />
                  </div>
                  Sequence Manager
                </CardTitle>
                <div className="px-3 py-1 rounded-lg bg-secondary border border-border">
                  <span className="text-[10px] font-mono text-primary font-black uppercase">{files.length} Tracks</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-10 space-y-8">
              <div 
                onClick={() => !isProcessing && fileInputRef.current?.click()}
                className={cn(
                  "relative group/upload h-40 rounded-[2.5rem] border-2 border-dashed border-border hover:border-primary/40 transition-all flex flex-col items-center justify-center bg-secondary/30 overflow-hidden cursor-pointer",
                  isProcessing && "cursor-not-allowed opacity-80"
                )}
              >
                <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-foreground/20 group-hover:text-primary group-hover:scale-110 transition-all mb-4">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest group-hover:text-primary transition-colors">Import Audio Tracks</p>
                <p className="text-[8px] text-foreground/20 uppercase font-bold mt-2">MP3, WAV, M4A up to 20MB each</p>
                <input type="file" ref={fileInputRef} accept="audio/*" multiple onChange={handleFileChange} className="hidden" />
              </div>

              {files.length > 0 && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <div className="flex items-center justify-between px-2">
                    <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Production Pipeline</Label>
                    <button onClick={handleClear} className="text-[10px] font-black uppercase text-destructive hover:opacity-70 transition-all">Purge All</button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3 max-h-[440px] overflow-y-auto pr-2 custom-scrollbar">
                    {files.map((f, index) => (
                      <div key={f.id} className="group/item flex items-center gap-4 p-5 rounded-3xl bg-secondary border border-border hover:border-primary/20 transition-all relative overflow-hidden">
                        <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary/40 shrink-0">
                          <FileAudio className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-foreground truncate uppercase pr-20">{f.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                             <p className="text-[9px] text-foreground/40 font-bold uppercase tracking-widest">{(f.size / (1024 * 1024)).toFixed(1)} MB</p>
                             <span className="text-foreground/10 text-[8px]">•</span>
                             <p className="text-[9px] text-primary/60 font-bold uppercase tracking-widest">{formatDuration(f.duration)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 opacity-0 group-hover/item:opacity-100 transition-opacity absolute right-4 top-1/2 -translate-y-1/2 bg-secondary/80 backdrop-blur-md pl-4 py-2 rounded-xl">
                          <Button variant="ghost" size="icon" onClick={() => moveFile(index, 'up')} disabled={index === 0} className="h-8 w-8 rounded-lg">
                            <ArrowUp className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => moveFile(index, 'down')} disabled={index === files.length - 1} className="h-8 w-8 rounded-lg">
                            <ArrowDown className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => removeFile(f.id)} className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10">
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-center justify-between">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest">Master Duration</p>
                        <p className="text-lg font-headline font-black text-foreground uppercase">{formatDuration(totalDuration)} TOTAL</p>
                     </div>
                     <Button 
                      onClick={joinAudio}
                      disabled={isProcessing || files.length < 2}
                      className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center gap-3 text-sm shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                    >
                      {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
                      Merge Tracks
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Output Sidebar */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Production Pipeline
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
              <div className="relative group/output min-h-[300px] flex flex-col items-center justify-center rounded-[2.5rem] bg-secondary/30 border border-border p-10 text-center">
                {!mergedUrl && !isProcessing && (
                  <div className="opacity-10 group-hover:opacity-20 transition-opacity">
                    <Activity className="w-20 h-20 text-primary mb-4 mx-auto" />
                    <p className="text-xs font-black uppercase tracking-[0.3em]">Studio Standby</p>
                  </div>
                )}

                {isProcessing && (
                  <div className="w-full space-y-6 animate-in fade-in duration-500">
                    <div className="relative w-24 h-24 mx-auto">
                      <div className="w-24 h-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                      <Music className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                        <span className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> {status}</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    
                    <div className="mt-4 p-4 rounded-xl bg-black/90 border border-white/10 text-left font-mono text-[9px] text-green-500/80 overflow-hidden shadow-inner">
                      <div className="flex items-center gap-2 mb-2 border-b border-white/5 pb-2 text-white/40">
                        <Terminal className="w-3 h-3" />
                        <span className="uppercase tracking-widest">FFmpeg Logs</span>
                      </div>
                      {logs.map((log, i) => (
                        <div key={i} className="truncate whitespace-nowrap opacity-70">
                          &gt; {log}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {mergedUrl && (
                  <div className="space-y-8 w-full animate-in zoom-in duration-500">
                    <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto shadow-xl">
                      <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Audio Master Synthesized</h3>
                      <p className="text-[10px] text-foreground/40 font-medium uppercase tracking-widest">Matrix Unified | {formatDuration(totalDuration)} Duration</p>
                    </div>
                    <div className="p-4 bg-background/50 rounded-2xl border border-border w-full">
                      <audio controls src={mergedUrl} className="w-full h-10" />
                    </div>
                    <Button 
                      asChild
                      className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95"
                    >
                      <a href={mergedUrl} download={`master-bundle-${Date.now()}.mp3`}>
                        <Download className="w-6 h-6" />
                        Download Master
                      </a>
                    </Button>
                  </div>
                )}
              </div>

              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-5">
                <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Privacy Absolute</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                    Audio synthesis occurs entirely on your device using WebAssembly. Your tracks never leave your machine, ensuring 100% data security.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group transition-all hover:bg-secondary/80">
                <Settings2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-[11px] font-black text-foreground uppercase tracking-widest">Master Protocol</p>
                  <p className="text-[11px] text-foreground/60 leading-relaxed font-medium">Automatic re-encoding to 192kbps for bitstream consistency.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
