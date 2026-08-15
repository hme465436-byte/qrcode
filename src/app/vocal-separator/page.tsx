"use client"

import React, { useState, useRef, useEffect } from 'react';
import { 
  Music, 
  MicOff, 
  Upload, 
  Download, 
  Trash2, 
  Sparkles, 
  Loader2, 
  Info,
  CheckCircle2,
  FileAudio,
  Settings2,
  Activity,
  Play,
  Volume2,
  Mic,
  Waves,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export default function VocalSeparatorPage() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  
  // Settings
  const [mode, setMode] = useState<'vocal-reduce' | 'music-focus'>('vocal-reduce');
  const [strength, setStrength] = useState(1.0); // Factor of 0.0 to 1.0

  const ffmpegRef = useRef<FFmpeg | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (processedUrl) URL.revokeObjectURL(processedUrl);
    };
  }, [processedUrl]);

  const loadFFmpeg = async () => {
    if (isLoaded && ffmpegRef.current) return true;
    
    setStatus('Initializing Studio Engine...');
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
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setProcessedUrl(null);
      setProgress(0);
      setStatus('');
      setLogs([]);
      toast({ title: "Asset Imported", description: "Ready for chromatic separation." });
    }
  };

  const separateAudio = async () => {
    if (!file) return;

    setIsProcessing(true);
    setLogs([]);
    
    const ready = await loadFFmpeg();
    if (!ready || !ffmpegRef.current) {
      setIsProcessing(false);
      return;
    }

    const ffmpeg = ffmpegRef.current;
    const inputName = 'input_media';
    const outputName = `processed_${Date.now()}.mp3`;

    try {
      setStatus('Writing Binary Payload...');
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      setStatus(`Applying Stereo Matrix...`);
      
      // Professional stereo matrix processing
      // Vocal Reduce: L-R phase cancellation
      // Formula: pan=stereo|c0=c0-c1|c1=c1-c0
      // We use stereotools for better control over the mlev (middle level)
      
      let filter = '';
      if (mode === 'vocal-reduce') {
        // Reducing the Mid (center) level using stereotools
        // mlev=0 means mid is cancelled. 1.0 means original.
        const mlev = 1.0 - strength;
        filter = `stereotools=mlev=${mlev.toFixed(2)}:slev=1.0`;
      } else {
        // Music Focus (usually means isolating vocals or reducing sides)
        // This is less perfect with simple math but we reduce slev (side level)
        const slev = 1.0 - strength;
        filter = `stereotools=mlev=1.0:slev=${slev.toFixed(2)}`;
      }

      await ffmpeg.exec([
        '-i', inputName,
        '-af', filter,
        '-acodec', 'libmp3lame',
        '-b:a', '192k',
        outputName
      ]);

      setStatus('Finalizing Master...');
      const data = await ffmpeg.readFile(outputName);
      const url = URL.createObjectURL(new Blob([(data as any).buffer], { type: 'audio/mp3' }));
      
      setProcessedUrl(url);
      setProgress(100);
      setStatus('Production Complete');
      toast({ title: "Master Exported", description: "Stereo matrix successfully applied." });
    } catch (err: any) {
      console.error('Separation Error:', err);
      toast({ 
        variant: "destructive", 
        title: "Production Failed", 
        description: "An error occurred during matrix synthesis. Ensure the file is a stereo track." 
      });
      setStatus('Processing Failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    if (processedUrl) URL.revokeObjectURL(processedUrl);
    setProcessedUrl(null);
    setProgress(0);
    setStatus('');
    setLogs([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset", description: "Buffers cleared." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <MicOff className="w-3.5 h-3.5" /> Media Intelligence
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Vocal & <span className="text-primary italic">Music Separator</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl">
          Professional stereo-phase cancellation matrix. Reduce vocals for karaoke or isolate center-panned audio tracks locally in your browser.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls Card */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <Waves className="w-6 h-6" />
                </div>
                Media Matrix
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-10 space-y-10">
              <div className="space-y-4">
                <div 
                  onClick={() => !isProcessing && fileInputRef.current?.click()}
                  className={cn(
                    "relative group/upload h-48 rounded-[2.5rem] border-2 border-dashed border-border hover:border-primary/40 transition-all flex flex-col items-center justify-center bg-secondary/30 overflow-hidden cursor-pointer",
                    file && "border-solid border-primary/40",
                    isProcessing && "cursor-not-allowed opacity-80"
                  )}
                >
                  {file ? (
                    <div className="text-center p-6 space-y-2">
                       <FileAudio className="w-10 h-10 text-primary mx-auto mb-2" />
                       <p className="text-xs font-black uppercase text-foreground truncate max-w-[240px]">{file.name}</p>
                       <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">{(file.size / (1024 * 1024)).toFixed(2)} MB Matrix Detected</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-foreground/20 group-hover:text-primary group-hover:scale-110 transition-all mb-4 shadow-xl">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest group-hover:text-primary transition-colors text-center px-6">
                        Import Stereo Asset<br/><span className="text-[8px] opacity-60">MP3, WAV, M4A or MP4 video</span>
                      </p>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} accept="audio/*,video/*" onChange={handleFileChange} className="hidden" />
                </div>
              </div>

              {file && (
                <div className="space-y-10 animate-in zoom-in duration-500">
                  <div className="space-y-6">
                    <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Separation Protocol</Label>
                    <div className="grid grid-cols-2 gap-4">
                       <button
                        onClick={() => setMode('vocal-reduce')}
                        className={cn(
                          "flex flex-col items-center gap-3 p-6 rounded-3xl border transition-all",
                          mode === 'vocal-reduce' ? "bg-primary text-primary-foreground border-primary shadow-xl scale-105" : "bg-background border-border text-foreground/40 hover:text-primary"
                        )}
                       >
                         <MicOff className="w-6 h-6 mb-1" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Vocal Reduce</span>
                         <span className="text-[8px] opacity-60 uppercase font-bold">(Karaoke Mode)</span>
                       </button>
                       <button
                        onClick={() => setMode('music-focus')}
                        className={cn(
                          "flex flex-col items-center gap-3 p-6 rounded-3xl border transition-all",
                          mode === 'music-focus' ? "bg-primary text-primary-foreground border-primary shadow-xl scale-105" : "bg-background border-border text-foreground/40 hover:text-primary"
                        )}
                       >
                         <Music className="w-6 h-6 mb-1" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Vocal Focus</span>
                         <span className="text-[8px] opacity-60 uppercase font-bold">(Isolate Center)</span>
                       </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                       <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Matrix Intensity</Label>
                       <span className="text-sm font-headline font-black text-primary uppercase">{(strength * 100).toFixed(0)}% Depth</span>
                    </div>
                    <Slider 
                      value={[strength * 100]} 
                      min={0} 
                      max={100} 
                      step={1} 
                      onValueChange={(v) => setStrength(v[0] / 100)} 
                      className="py-4"
                    />
                  </div>

                  <div className="p-5 rounded-[2.5rem] bg-yellow-500/5 border border-yellow-500/10 flex items-start gap-5">
                     <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-yellow-600/70 uppercase tracking-widest">Technical Limitation Disclaimer</p>
                        <p className="text-[10px] text-foreground/40 leading-relaxed font-medium">
                          This tool uses stereo-phase cancellation. It works best on high-quality stereo tracks where vocals are perfectly centered. It will not work on Mono files and is not a 4-stem AI model.
                        </p>
                     </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={separateAudio}
                  disabled={!file || isProcessing}
                  className="flex-1 h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                >
                  {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                  Generate Master
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleClear}
                  disabled={isProcessing}
                  className="w-16 h-16 rounded-2xl border-border bg-secondary hover:bg-secondary/80 text-foreground/40 hover:text-destructive transition-all active:scale-95"
                >
                  <Trash2 className="w-6 h-6" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Output Card */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group min-h-[300px]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Production Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
              <div className="relative group/output min-h-[200px] flex flex-col items-center justify-center rounded-[2.5rem] bg-secondary/30 border border-border p-10 text-center">
                {!processedUrl && !isProcessing && (
                  <div className="opacity-10 group-hover:opacity-20 transition-opacity">
                    <Activity className="w-20 h-20 text-primary mb-4 mx-auto" />
                    <p className="text-xs font-black uppercase tracking-[0.3em]">Studio Standby</p>
                  </div>
                )}

                {isProcessing && (
                  <div className="w-full space-y-6 animate-in fade-in duration-500">
                    <div className="relative w-24 h-24 mx-auto">
                      <div className="w-24 h-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                      <Volume2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                        <span className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> {status}</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    
                    <div className="mt-4 p-4 rounded-xl bg-black/90 border border-white/10 text-left font-mono text-[9px] text-green-500/80 overflow-hidden shadow-inner">
                      {logs.map((log, i) => (
                        <div key={i} className="truncate whitespace-nowrap opacity-70">
                          &gt; {log}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {processedUrl && (
                  <div className="space-y-8 w-full animate-in zoom-in duration-500">
                    <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto shadow-xl">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Processed Master Ready</h3>
                      <p className="text-[10px] text-foreground/40 font-medium uppercase tracking-widest">Protocol: {mode.replace('-', ' ')}</p>
                    </div>
                    <div className="p-4 bg-background/50 rounded-2xl border border-border w-full">
                      <audio controls src={processedUrl} className="w-full h-10" />
                    </div>
                    <Button 
                      asChild
                      className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95"
                    >
                      <a href={processedUrl} download={`${file?.name.split('.')[0] || 'master'}_${mode}.mp3`}>
                        <Download className="w-6 h-6" />
                        Download Track
                      </a>
                    </Button>
                  </div>
                )}
              </div>

              <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
                <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Privacy Absolute</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                    Separation occurs entirely on your device via the FFmpeg-WASM engine. Your tracks never leave your browser sandbox, ensuring 100% data security.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group transition-all hover:bg-secondary/80">
                <Settings2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-[11px] font-black text-foreground uppercase tracking-widest">Studio Encoding</p>
                  <p className="text-[11px] text-foreground/60 leading-relaxed font-medium">Re-encoded to 192kbps MP3 for universal hardware compatibility.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
