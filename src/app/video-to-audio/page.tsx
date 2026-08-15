"use client"

import React, { useState, useRef, useEffect } from 'react';
import { 
  Video, 
  Music, 
  Upload, 
  Download, 
  Trash2, 
  Sparkles, 
  Loader2, 
  Info,
  CheckCircle2,
  FileVideo,
  AlertTriangle,
  Settings2,
  Terminal,
  Activity,
  Layers,
  Scissors,
  Clock,
  Timer,
  FastForward
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export default function VideoToAudioPage() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [mp3Url, setMp3Url] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [bitrate, setBitrate] = useState('128k');

  // Trimming State
  const [totalDuration, setTotalDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);

  const ffmpegRef = useRef<FFmpeg | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (mp3Url) URL.revokeObjectURL(mp3Url);
    };
  }, [mp3Url]);

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
        description: "Failed to load FFmpeg. Please ensure your browser supports SharedArrayBuffer." 
      });
      return false;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 100 * 1024 * 1024) {
        toast({ 
          variant: "destructive", 
          title: "High Volume Asset", 
          description: "Videos over 100MB may be slow to process." 
        });
      }
      
      // Get Duration
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        setTotalDuration(video.duration);
        setEndTime(video.duration);
        setStartTime(0);
        window.URL.revokeObjectURL(video.src);
      };
      video.src = URL.createObjectURL(selectedFile);

      setFile(selectedFile);
      setMp3Url(null);
      setProgress(0);
      setStatus('');
      setLogs([]);
      toast({ title: "Video Imported", description: "Studio analyzed media metadata." });
    }
  };

  const convertToMp3 = async () => {
    if (!file) return;

    if (startTime >= endTime) {
      toast({ variant: "destructive", title: "Invalid Range", description: "Start time must be before end time." });
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
    const inputName = 'input_video';
    const outputName = 'output_audio.mp3';

    try {
      setStatus('Writing Payload to Memory...');
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      setStatus(`Extracting Matrix (${bitrate})...`);
      
      // FFmpeg seek and trim parameters
      // -ss [start] -to [end] or -t [duration]
      // Using -ss before -i for faster seeking, -to for precise end
      await ffmpeg.exec([
        '-ss', startTime.toString(),
        '-i', inputName,
        '-to', (endTime - startTime).toString(),
        '-vn',
        '-acodec', 'libmp3lame',
        '-b:a', bitrate,
        outputName
      ]);

      setStatus('Finalizing Master...');
      const data = await ffmpeg.readFile(outputName);
      const url = URL.createObjectURL(new Blob([(data as any).buffer], { type: 'audio/mp3' }));
      
      setMp3Url(url);
      setProgress(100);
      setStatus(`Production Complete @ ${bitrate}`);
      toast({ title: "Master Exported", description: `Audio track successfully encoded and trimmed.` });
    } catch (err: any) {
      console.error('Conversion Error:', err);
      toast({ 
        variant: "destructive", 
        title: "Production Failed", 
        description: "An error occurred during extraction. The range or format may be invalid." 
      });
      setStatus('Extraction Failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    if (mp3Url) URL.revokeObjectURL(mp3Url);
    setMp3Url(null);
    setProgress(0);
    setStatus('');
    setLogs([]);
    setTotalDuration(0);
    setStartTime(0);
    setEndTime(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset", description: "Fields cleared and memory purged." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Music className="w-3.5 h-3.5" /> Media Studio
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Video to <span className="text-primary italic">MP3 Master</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl">
          Professional-grade audio extraction with precision trimming. 100% private client-side processing for high-fidelity media production.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Input Card */}
        <div className="space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <Video className="w-6 h-6" />
                </div>
                Source Payload
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-10 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Video Container</Label>
                  {file && (
                    <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest shadow-sm">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB Matrix
                    </div>
                  )}
                </div>
                
                <div 
                  onClick={() => !isProcessing && fileInputRef.current?.click()}
                  className={cn(
                    "relative group/upload h-48 rounded-[2rem] border-2 border-dashed border-border hover:border-primary/40 transition-all flex flex-col items-center justify-center bg-secondary/30 overflow-hidden cursor-pointer",
                    file && "border-solid border-primary/40",
                    isProcessing && "cursor-not-allowed opacity-80"
                  )}
                >
                  {file ? (
                    <div className="text-center p-6 space-y-2">
                       <FileVideo className="w-10 h-10 text-primary mx-auto mb-2" />
                       <p className="text-xs font-black uppercase text-foreground truncate max-w-[240px]">{file.name}</p>
                       <p className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest">Tap to swap source</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-foreground/20 group-hover:text-primary group-hover:scale-110 transition-all mb-4">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest group-hover:text-primary transition-colors text-center">Select Video Asset<br/><span className="text-[8px] opacity-60">MP4, WEBM, MOV, MKV</span></p>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} accept="video/*" onChange={handleFileChange} className="hidden" />
                </div>
              </div>

              {/* Trimming Controls */}
              {file && totalDuration > 0 && (
                <div className="space-y-6 pt-6 border-t border-border animate-in fade-in zoom-in duration-500">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Scissors className="w-3 h-3 text-primary" /> Precision Trim Matrix
                    </Label>
                    <span className="text-[10px] font-mono text-primary font-black uppercase">Total: {formatDuration(totalDuration)}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[9px] font-black uppercase text-foreground/40">
                        <Clock className="w-3 h-3" /> Start Mark
                      </div>
                      <Input 
                        type="number" 
                        min="0" 
                        max={endTime - 0.1}
                        step="0.1"
                        value={startTime} 
                        onChange={(e) => setStartTime(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="h-12 bg-secondary border-border rounded-xl text-sm font-mono font-bold"
                      />
                      <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-tighter text-right">Seconds: {startTime.toFixed(1)}</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[9px] font-black uppercase text-foreground/40">
                        <Timer className="w-3 h-3" /> End Mark
                      </div>
                      <Input 
                        type="number" 
                        min={startTime + 0.1} 
                        max={totalDuration}
                        step="0.1"
                        value={endTime} 
                        onChange={(e) => setEndTime(Math.min(totalDuration, parseFloat(e.target.value) || totalDuration))}
                        className="h-12 bg-secondary border-border rounded-xl text-sm font-mono font-bold"
                      />
                      <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-tighter text-right">Seconds: {endTime.toFixed(1)}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                     <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">Trim Presets</p>
                     <div className="grid grid-cols-3 gap-2">
                        <button 
                          onClick={() => { setStartTime(0); setEndTime(totalDuration); }}
                          className="h-9 rounded-lg bg-secondary border border-border text-[9px] font-black uppercase tracking-widest hover:text-primary transition-all"
                        >
                          Full
                        </button>
                        <button 
                          onClick={() => { setStartTime(0); setEndTime(Math.min(30, totalDuration)); }}
                          className="h-9 rounded-lg bg-secondary border border-border text-[9px] font-black uppercase tracking-widest hover:text-primary transition-all"
                        >
                          First 30s
                        </button>
                        <button 
                          onClick={() => { setStartTime(0); setEndTime(Math.min(60, totalDuration)); }}
                          className="h-9 rounded-lg bg-secondary border border-border text-[9px] font-black uppercase tracking-widest hover:text-primary transition-all"
                        >
                          First 60s
                        </button>
                     </div>
                  </div>
                </div>
              )}

              {/* Bitrate Selection */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Layers className="w-3 h-3 text-primary" /> Audio Fidelity Matrix
                  </Label>
                  <span className="text-[9px] font-black text-primary uppercase tracking-widest">{bitrate} Bitrate</span>
                </div>
                
                <RadioGroup 
                  defaultValue="128k" 
                  value={bitrate} 
                  onValueChange={setBitrate}
                  className="grid grid-cols-2 sm:grid-cols-4 gap-3"
                  disabled={isProcessing}
                >
                  {[
                    { val: '70k', label: 'Economy' },
                    { val: '128k', label: 'Standard' },
                    { val: '160k', label: 'High' },
                    { val: '320k', label: 'Master' },
                  ].map((mode) => (
                    <div key={mode.val} className="relative">
                      <RadioGroupItem
                        value={mode.val}
                        id={`q-${mode.val}`}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={`q-${mode.val}`}
                        className={cn(
                          "flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-background cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-secondary",
                          bitrate === mode.val && "border-primary bg-primary/5 ring-1 ring-primary/20"
                        )}
                      >
                        <span className="text-[10px] font-black uppercase tracking-widest">{mode.val}</span>
                        <span className="text-[8px] font-bold text-foreground/30 uppercase mt-1">{mode.label}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={convertToMp3}
                  disabled={!file || isProcessing}
                  className="flex-1 h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                >
                  {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                  Generate trimmed MP3
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

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5 group-hover:bg-primary/10 transition-colors">
            <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Privacy Absolute</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                Our FFmpeg engine runs entirely within your browser&apos;s sandbox via WebAssembly. No data is transmitted, ensuring 100% security.
              </p>
            </div>
          </div>
        </div>

        {/* Output Card */}
        <div className="space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Production Pipeline
                </CardTitle>
                {mp3Url && (
                  <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest shadow-sm">
                    Master Ready
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-10 space-y-10">
              <div className="relative group/output min-h-[260px] flex flex-col items-center justify-center rounded-[2.5rem] bg-secondary/30 border border-border p-10 text-center">
                {!mp3Url && !isProcessing && (
                  <div className="opacity-10 group-hover:opacity-20 transition-opacity">
                    <Activity className="w-20 h-20 text-primary mb-4 mx-auto" />
                    <p className="text-xs font-black uppercase tracking-[0.3em]">Studio Standby</p>
                  </div>
                )}

                {isProcessing && (
                  <div className="w-full space-y-6 animate-in fade-in duration-500">
                    <div className="relative w-24 h-24 mx-auto">
                      <div className="w-24 h-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                      <FastForward className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
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
                        <span className="uppercase tracking-widest">FFmpeg Output</span>
                      </div>
                      {logs.map((log, i) => (
                        <div key={i} className="truncate whitespace-nowrap opacity-70 hover:opacity-100 transition-opacity">
                          &gt; {log}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {mp3Url && (
                  <div className="space-y-8 w-full animate-in zoom-in duration-500">
                    <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto shadow-xl">
                      <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Audio Master Encoded</h3>
                      <p className="text-[10px] text-foreground/40 font-medium uppercase tracking-widest">Fidelity: {bitrate} | Range: {formatDuration(startTime)} - {formatDuration(endTime)}</p>
                    </div>
                    <div className="p-4 bg-background/50 rounded-2xl border border-border w-full">
                      <audio controls src={mp3Url} className="w-full h-10" />
                    </div>
                    <Button 
                      asChild
                      className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95"
                    >
                      <a href={mp3Url} download={`${file?.name.split('.')[0] || 'master'}_trimmed_${bitrate}.mp3`}>
                        <Download className="w-6 h-6" />
                        Download MP3
                      </a>
                    </Button>
                  </div>
                )}
              </div>

              <div className="p-6 rounded-2xl bg-secondary border border-border flex items-start gap-4">
                 <Settings2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Technical Protocol</p>
                    <p className="text-[10px] text-foreground/40 font-medium leading-relaxed">
                      Our engine utilizes specific bitstream alignment for {bitrate} production with accurate start/end markers.
                    </p>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
