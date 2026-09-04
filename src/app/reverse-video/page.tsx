"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  RotateCcw, 
  Upload, 
  Download, 
  Trash2, 
  Sparkles, 
  Loader2, 
  Info,
  CheckCircle2,
  ShieldCheck,
  FileVideo,
  Settings2,
  Terminal,
  Activity,
  Play,
  Film,
  Zap,
  Volume2,
  VolumeX,
  History,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { GetHelp } from '@/components/qr-canvas/get-help';

export default function ReverseVideoPage() {
  const { toast } = useToast();
  
  // State Matrix
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle');
  const [reversedUrl, setReversedUrl] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  
  // Settings
  const [reverseAudio, setReverseAudio] = useState(true);

  const ffmpegRef = useRef<FFmpeg | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (reversedUrl) URL.revokeObjectURL(reversedUrl);
    };
  }, [reversedUrl]);

  const loadFFmpeg = async () => {
    if (isLoaded && ffmpegRef.current) return true;
    
    setStatus('loading-engine');
    // Using 0.12.x standard URLs
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    
    if (!ffmpegRef.current) {
      ffmpegRef.current = new FFmpeg();
    }
    
    const ffmpeg = ffmpegRef.current;
    
    ffmpeg.on('log', ({ message }) => {
      setLogs(prev => [...prev.slice(-8), message]);
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
        description: "Failed to load the processing engine. Ensure you are on a modern browser (Chrome/Edge)." 
      });
      return false;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 100 * 1024 * 1024) {
        toast({ 
          variant: "destructive", 
          title: "Payload Warning", 
          description: "Files over 100MB may exceed browser memory limits during reversal." 
        });
      }
      setFile(selectedFile);
      setReversedUrl(null);
      setProgress(0);
      setStatus('ready');
      setLogs([]);
      toast({ title: "Asset Imported", description: "Matrix ready for temporal inversion." });
    }
  };

  const executeReverse = async () => {
    if (!file) return;

    setIsProcessing(true);
    setLogs([]);
    
    const ready = await loadFFmpeg();
    if (!ready || !ffmpegRef.current) {
      setIsProcessing(false);
      setStatus('error');
      return;
    }

    const ffmpeg = ffmpegRef.current;
    const inputName = 'input_raw';
    const outputName = 'output_master.mp4';

    try {
      setStatus('reversing');
      setProgress(0);
      
      // Clean virtual FS before starting
      try { await ffmpeg.deleteFile(inputName); } catch(e) {}
      try { await ffmpeg.deleteFile(outputName); } catch(e) {}

      // Write input
      const fileData = await fetchFile(file);
      await ffmpeg.writeFile(inputName, fileData);

      // Execute Command
      // -vf reverse: Inverts video frames
      // -af areverse: Inverts audio samples
      const args = [
        '-i', inputName,
        '-vf', 'reverse',
      ];

      if (reverseAudio) {
        args.push('-af', 'areverse');
      }

      args.push('-preset', 'ultrafast'); // Optimize for speed in WASM
      args.push(outputName);

      await ffmpeg.exec(args);

      // Read Result
      const data = await ffmpeg.readFile(outputName);
      const url = URL.createObjectURL(new Blob([(data as any).buffer], { type: 'video/mp4' }));
      
      setReversedUrl(url);
      setProgress(100);
      setStatus('complete');
      toast({ title: "Master Exported", description: "Temporal inversion successfully applied." });
      
      // Cleanup virtual FS
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
    } catch (err: any) {
      console.error('Reverse Error:', err);
      setStatus('error');
      toast({ 
        variant: "destructive", 
        title: "Production Failed", 
        description: "An error occurred during video synthesis. The video might be too long for memory-intensive reversal." 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    if (reversedUrl) URL.revokeObjectURL(reversedUrl);
    setReversedUrl(null);
    setProgress(0);
    setStatus('idle');
    setLogs([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset" });
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const statusMessage = useMemo(() => {
    switch (status) {
      case 'loading-engine': return 'Synthesizing WASM Engine...';
      case 'reversing': return 'Executing Temporal Inversion...';
      case 'complete': return 'Production Complete';
      case 'error': return 'Protocol Failure';
      case 'ready': return 'Ready for Inversion';
      default: return 'Standby';
    }
  }, [status]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
            <RotateCcw className="w-3.5 h-3.5" /> Media Suite
          </div>
          <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
            Reverse <span className="text-primary italic">Video Studio</span>
          </h1>
          <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
            Professional-grade temporal inversion. Reverse video frames and audio bitstreams locally in your browser with high-fidelity WASM synthesis.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 pb-2">
           <GetHelp toolId="reverse-video" />
           {(file || reversedUrl) && (
             <Button variant="outline" size="sm" onClick={handleClear} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
             </Button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground uppercase tracking-tight">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <Film className="w-6 h-6" />
                </div>
                Inbound Matrix
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-10 space-y-10">
              <div className="space-y-4">
                <div 
                  onClick={() => !isProcessing && fileInputRef.current?.click()}
                  className={cn(
                    "relative h-48 rounded-[2.5rem] border-2 border-dashed border-border hover:border-primary/40 transition-all flex flex-col items-center justify-center bg-secondary/30 overflow-hidden cursor-pointer",
                    file && "border-solid border-primary/20",
                    isProcessing && "cursor-not-allowed opacity-80"
                  )}
                >
                  {file ? (
                    <div className="text-center p-6 space-y-2">
                       <FileVideo className="w-10 h-10 text-primary mx-auto mb-2" />
                       <div className="space-y-1">
                          <p className="text-xs font-black uppercase text-foreground truncate max-w-[240px] mx-auto">{file.name}</p>
                          <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">{formatSize(file.size)} | {file.type.split('/')[1].toUpperCase()}</p>
                       </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-foreground/20 group-hover:text-primary group-hover:scale-110 transition-all mb-4 shadow-xl">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest group-hover:text-primary transition-colors text-center px-6 leading-relaxed">
                        Drop Video Payload<br/><span className="text-[8px] opacity-60">MP4, WEBM (Max 100MB RECOMMENDED)</span>
                      </p>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} accept="video/mp4,video/webm,video/quicktime" onChange={handleFileChange} className="hidden" />
                </div>
              </div>

              {file && (
                <div className="space-y-6 animate-in zoom-in duration-500">
                  <div className="p-6 rounded-[2.5rem] bg-secondary border border-border flex items-center justify-between group hover:border-primary/20 transition-all">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all shadow-inner">
                           <Volume2 className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                           <p className="text-[10px] font-black uppercase text-foreground/60">Acoustic Inversion</p>
                           <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-widest">Reverse audio bitstream</p>
                        </div>
                     </div>
                     <Switch checked={reverseAudio} onCheckedChange={setReverseAudio} disabled={isProcessing} />
                  </div>

                  <div className="space-y-4">
                    <Button 
                      onClick={executeReverse}
                      disabled={isProcessing}
                      className="w-full h-16 bg-primary text-white font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                    >
                      {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                      Synthesize Inversion
                    </Button>
                  </div>
                </div>
              )}

              <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
                <ShieldCheck className="w-6 h-6 text-primary mt-1 shrink-0" />
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Privacy Absolute</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Synthesis occurs entirely on your device memory. Visual identifiers and metadata never leave your hardware.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[500px] bg-black/40">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between px-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20">
                  <Activity className="w-5 h-5" />
                </div>
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Identity Monitor</CardTitle>
              </div>
              {status !== 'idle' && (
                <Badge className={cn(
                  "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                  status === 'complete' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-primary/10 text-primary border-primary/20"
                )}>
                   {statusMessage}
                </Badge>
              )}
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col items-center justify-center p-4 sm:p-10 relative overflow-hidden bg-checkered">
               {status === 'idle' ? (
                 <div className="flex flex-col items-center justify-center opacity-10 space-y-6">
                    <History className="w-24 h-24 text-primary" />
                    <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Media Signal</p>
                 </div>
               ) : (
                 <>
                   {isProcessing && (
                     <div className="w-full max-w-sm space-y-8 animate-in zoom-in duration-500 z-10">
                        <div className="relative w-28 h-28 mx-auto">
                           <div className="w-28 h-28 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                           <RotateCcw className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                        </div>
                        <div className="space-y-4 text-center">
                           <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-primary">
                              <span className="animate-pulse">{status === 'loading-engine' ? 'Ignition...' : 'Encoding...'}</span>
                              <span>{progress}%</span>
                           </div>
                           <Progress value={progress} className="h-1 rounded-full" />
                           
                           {/* Terminal Logs */}
                           <div className="mt-8 p-4 rounded-2xl bg-black/90 border border-white/10 text-left font-mono text-[9px] text-green-500/60 overflow-hidden shadow-inner h-32">
                             <div className="flex items-center gap-2 mb-2 border-b border-white/5 pb-2 text-white/20">
                                <Terminal className="w-3 h-3" />
                                <span className="uppercase tracking-widest text-white/20">WASM LOGS</span>
                             </div>
                             <div className="overflow-y-auto h-full no-scrollbar">
                                {logs.map((log, i) => (
                                  <div key={i} className="truncate whitespace-nowrap opacity-70">&gt; {log}</div>
                                ))}
                             </div>
                           </div>
                        </div>
                     </div>
                   )}

                   {reversedUrl && (
                     <div className="w-full flex flex-col items-center gap-10 animate-in zoom-in duration-500">
                        <div className="relative w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] border border-white/10 bg-black">
                           <video controls src={reversedUrl} className="w-full h-auto aspect-video" />
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                           <Button 
                            asChild
                            className="h-16 flex-1 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-primary/30"
                           >
                              <a href={reversedUrl} download={`reversed_${file?.name || 'master'}.mp4`}>
                                 <Download className="w-5 h-5 mr-3" /> Download MP4
                              </a>
                           </Button>
                           <Button variant="outline" onClick={handleClear} className="h-16 px-10 border-white/10 bg-white/5 text-white/40 font-black uppercase text-[10px] rounded-2xl">
                              New File
                           </Button>
                        </div>
                     </div>
                   )}

                   {status === 'error' && (
                     <div className="text-center space-y-6 animate-in shake duration-500">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                        <div className="space-y-2">
                           <h3 className="text-xl font-headline font-black text-white uppercase">Uplink Error</h3>
                           <p className="text-[10px] text-white/40 font-bold uppercase max-w-xs mx-auto leading-relaxed">The processing buffer exceeded hardware limits or the video codec is restricted.</p>
                        </div>
                        <Button onClick={executeReverse} variant="outline" className="h-12 border-primary/20 text-primary uppercase text-[9px] font-black rounded-xl">Retry Protocol</Button>
                     </div>
                   )}
                 </>
               )}
            </CardContent>

            <div className="p-8 border-t border-border bg-[#0a0a0c]">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group">
                     <Settings2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Master Encoding</p>
                        <p className="text-[10px] text-foreground/40 font-medium leading-relaxed uppercase">Automatic 1:1 bitstream re-mapping for consistent resolution.</p>
                     </div>
                  </div>
                  <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group">
                     <AlertCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Resource Advisory</p>
                        <p className="text-[10px] text-foreground/40 font-medium leading-relaxed uppercase">Reversal requires full frame buffering; shorter clips provide peak stability.</p>
                     </div>
                  </div>
               </div>
            </div>
          </Card>
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
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
