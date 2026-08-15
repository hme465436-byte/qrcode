"use client"

import React, { useState, useRef, useEffect } from 'react';
import { 
  Volume2, 
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
  VolumeX,
  Zap,
  Play
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

export default function AudioBoosterPage() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [boostedUrl, setBoostedUrl] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  
  // Settings
  const [gain, setGain] = useState(1.5); // 150% default

  const ffmpegRef = useRef<FFmpeg | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (boostedUrl) URL.revokeObjectURL(boostedUrl);
    };
  }, [boostedUrl]);

  const loadFFmpeg = async () => {
    if (isLoaded && ffmpegRef.current) return true;
    
    setStatus('Initializing Engine...');
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
      setBoostedUrl(null);
      setProgress(0);
      setStatus('');
      setLogs([]);
      toast({ title: "Asset Imported", description: "Ready for volume optimization." });
    }
  };

  const boostVolume = async () => {
    if (!file) return;

    setIsProcessing(true);
    setLogs([]);
    
    const ready = await loadFFmpeg();
    if (!ready || !ffmpegRef.current) {
      setIsProcessing(false);
      return;
    }

    const ffmpeg = ffmpegRef.current;
    const inputName = 'input_audio';
    const outputName = `boosted_${Date.now()}.mp3`;

    try {
      setStatus('Writing Payload...');
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      setStatus(`Amplifying Signal (${(gain * 100).toFixed(0)}%)...`);
      
      // Professional volume adjustment
      await ffmpeg.exec([
        '-i', inputName,
        '-filter:a', `volume=${gain}`,
        '-acodec', 'libmp3lame',
        '-b:a', '192k',
        outputName
      ]);

      setStatus('Finalizing Master...');
      const data = await ffmpeg.readFile(outputName);
      const url = URL.createObjectURL(new Blob([(data as any).buffer], { type: 'audio/mp3' }));
      
      setBoostedUrl(url);
      setProgress(100);
      setStatus('Production Complete');
      toast({ title: "Master Exported", description: "Audio gain successfully applied." });
    } catch (err: any) {
      console.error('Boost Error:', err);
      toast({ 
        variant: "destructive", 
        title: "Production Failed", 
        description: "An error occurred during audio synthesis." 
      });
      setStatus('Processing Failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    if (boostedUrl) URL.revokeObjectURL(boostedUrl);
    setBoostedUrl(null);
    setProgress(0);
    setStatus('');
    setLogs([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset", description: "All buffers cleared." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Volume2 className="w-3.5 h-3.5" /> Media Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Audio <span className="text-primary italic">Volume Booster</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl">
          Professional-grade audio amplification. Increase gain levels for MP3, WAV, or M4A files locally with studio-grade precision.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Input Card */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <Play className="w-6 h-6" />
                </div>
                Media Payload
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
                       <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">{(file.size / (1024 * 1024)).toFixed(2)} MB Detected</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-foreground/20 group-hover:text-primary group-hover:scale-110 transition-all mb-4">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest group-hover:text-primary transition-colors text-center px-6">
                        Import Audio Asset<br/><span className="text-[8px] opacity-60">MP3, WAV, M4A up to 20MB</span>
                      </p>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} accept="audio/*" onChange={handleFileChange} className="hidden" />
                </div>
              </div>

              {file && (
                <div className="space-y-10 animate-in zoom-in duration-500">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                       <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Gain Intensity Matrix</Label>
                       <span className="text-sm font-headline font-black text-primary uppercase">{(gain * 100).toFixed(0)}% Boost</span>
                    </div>
                    <Slider 
                      value={[gain]} 
                      min={1} 
                      max={5} 
                      step={0.1} 
                      onValueChange={(v) => setGain(v[0])} 
                      className="py-4"
                    />
                    <div className="grid grid-cols-3 gap-2">
                       {[1.5, 2.0, 3.0].map((v) => (
                         <button 
                          key={v}
                          onClick={() => setGain(v)}
                          className={cn(
                            "h-10 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all",
                            gain === v ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-foreground/40 hover:text-primary"
                          )}
                         >
                           {v.toFixed(1)}x Gain
                         </button>
                       ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-yellow-500/5 border border-yellow-500/10 flex items-start gap-4">
                     <VolumeX className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                     <div className="space-y-1">
                        <p className="text-[9px] font-black text-yellow-600/70 uppercase tracking-widest">Digital Clipping Advisory</p>
                        <p className="text-[9px] text-foreground/40 leading-relaxed font-medium">
                          High gain levels (&gt;2.0x) may cause digital distortion if the source audio is already normalized. Use moderate settings for peak fidelity.
                        </p>
                     </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={boostVolume}
                  disabled={!file || isProcessing}
                  className="flex-1 h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                >
                  {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                  Amplify Signal
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
                {!boostedUrl && !isProcessing && (
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

                {boostedUrl && (
                  <div className="space-y-8 w-full animate-in zoom-in duration-500">
                    <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto shadow-xl">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Boosted Master Ready</h3>
                      <p className="text-[10px] text-foreground/40 font-medium uppercase tracking-widest">Gain Level: {(gain * 100).toFixed(0)}%</p>
                    </div>
                    <div className="p-4 bg-background/50 rounded-2xl border border-border w-full">
                      <audio controls src={boostedUrl} className="w-full h-10" />
                    </div>
                    <Button 
                      asChild
                      className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95"
                    >
                      <a href={boostedUrl} download={`${file?.name.split('.')[0] || 'master'}_boosted.mp3`}>
                        <Download className="w-6 h-6" />
                        Download Master
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
                    Audio processing occurs entirely on your device using WebAssembly. Your tracks never leave your machine, ensuring 100% data security.
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
