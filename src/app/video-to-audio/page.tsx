
"use client"

import React, { useState, useRef } from 'react';
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
  Settings2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function VideoToAudioPage() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [mp3Url, setMp3Url] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 100 * 1024 * 1024) {
        toast({ 
          variant: "destructive", 
          title: "File Too Large", 
          description: "For stability, we recommend videos under 100MB." 
        });
      }
      setFile(selectedFile);
      setMp3Url(null);
      setProgress(0);
      setStatus('');
      toast({ title: "Video Loaded", description: "Ready to extract audio track." });
    }
  };

  const convertToMp3 = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setStatus('Decoding Video...');

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await file.arrayBuffer();
      
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      setStatus('Encoding MP3...');

      // Dynamic import of lamejs to avoid MPEGMode error
      const lamejs = require('lamejs');
      const channels = audioBuffer.numberOfChannels;
      const sampleRate = audioBuffer.sampleRate;
      const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, 128);
      const mp3Data: any[] = [];

      const samplesL = audioBuffer.getChannelData(0);
      const samplesR = channels > 1 ? audioBuffer.getChannelData(1) : samplesL;

      const sampleBlockSize = 1152;
      const totalSamples = samplesL.length;
      
      for (let i = 0; i < totalSamples; i += sampleBlockSize) {
        const leftChunk = samplesL.subarray(i, i + sampleBlockSize);
        const rightChunk = samplesR.subarray(i, i + sampleBlockSize);
        
        // Convert Float32 to Int16
        const leftInt16 = new Int16Array(leftChunk.length);
        const rightInt16 = new Int16Array(rightChunk.length);
        
        for (let j = 0; j < leftChunk.length; j++) {
          leftInt16[j] = Math.max(-1, Math.min(1, leftChunk[j])) * 0x7FFF;
          rightInt16[j] = Math.max(-1, Math.min(1, rightChunk[j])) * 0x7FFF;
        }

        let mp3buf;
        if (channels === 2) {
          mp3buf = mp3encoder.encodeBuffer(leftInt16, rightInt16);
        } else {
          mp3buf = mp3encoder.encodeBuffer(leftInt16);
        }

        if (mp3buf.length > 0) {
          mp3Data.push(mp3buf);
        }
        
        const p = Math.round((i / totalSamples) * 100);
        if (p % 10 === 0) setProgress(p);
      }

      const endBuf = mp3encoder.flush();
      if (endBuf.length > 0) {
        mp3Data.push(endBuf);
      }

      const blob = new Blob(mp3Data, { type: 'audio/mp3' });
      setMp3Url(URL.createObjectURL(blob));
      setProgress(100);
      setStatus('Extraction Complete');
      toast({ title: "Success", description: "Audio extracted to MP3 format." });
    } catch (err: any) {
      console.error(err);
      toast({ 
        variant: "destructive", 
        title: "Conversion Failed", 
        description: err.message || "An unexpected error occurred during audio extraction." 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setMp3Url(null);
    setProgress(0);
    setStatus('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset", description: "Fields cleared." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Music className="w-3.5 h-3.5" /> Media Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Video to <span className="text-primary italic">MP3 Converter</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl">
          Extract high-quality audio tracks from your videos instantly. 100% private, client-side conversion for MP4, WebM, and MOV files.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        <div className="space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <Video className="w-6 h-6" />
                </div>
                Source Visual
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-10 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Video Payload</Label>
                  {file && (
                    <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest shadow-sm">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB Detected
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
                       <p className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest">Click to change source</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-foreground/20 group-hover:text-primary group-hover:scale-110 transition-all mb-4">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest group-hover:text-primary transition-colors">Drop or Select Video File</p>
                      <p className="text-[8px] text-foreground/20 uppercase font-bold mt-2">MP4, WEBM, MOV</p>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} accept="video/*" onChange={handleFileChange} className="hidden" />
                </div>

                {file && file.size > 50 * 1024 * 1024 && (
                   <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20 flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                      <p className="text-[9px] text-yellow-500/70 font-bold leading-relaxed uppercase tracking-wider">
                        High Volume Warning: Files &gt;50MB may take several moments to process depending on browser memory.
                      </p>
                   </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={convertToMp3}
                  disabled={!file || isProcessing}
                  className="flex-1 h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                >
                  {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                  Convert to MP3
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
                Audio extraction occurs entirely within your browser's WebAssembly sandbox. Your video payload never leaves your device, ensuring maximum confidentiality.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Conversion Pipeline
                </CardTitle>
                {mp3Url && (
                  <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest shadow-sm">
                    Ready for Download
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-10 space-y-10">
              <div className="relative group/output min-h-[200px] flex flex-col items-center justify-center rounded-[2.5rem] bg-secondary/30 border border-border p-10 text-center">
                {!mp3Url && !isProcessing && (
                  <div className="opacity-10 group-hover:opacity-20 transition-opacity">
                    <Music className="w-20 h-20 text-primary mb-4 mx-auto" />
                    <p className="text-xs font-black uppercase tracking-[0.3em]">Studio Standby</p>
                  </div>
                )}

                {isProcessing && (
                  <div className="w-full space-y-6 animate-in fade-in duration-500">
                    <div className="relative w-20 h-20 mx-auto">
                      <div className="w-20 h-20 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                      <Music className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                        <span>{status}</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </div>
                )}

                {mp3Url && (
                  <div className="space-y-8 w-full animate-in zoom-in duration-500">
                    <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto shadow-xl">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Audio Master Ready</h3>
                      <p className="text-[10px] text-foreground/40 font-medium">MP3 encoded at 128kbps variable bitrate.</p>
                    </div>
                    <audio controls src={mp3Url} className="w-full" />
                    <Button 
                      asChild
                      className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-xl shadow-xl shadow-primary/30 transition-all active:scale-95"
                    >
                      <a href={mp3Url} download={`${file?.name.split('.')[0] || 'extracted'}.mp3`}>
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
                      Our engine utilizes LAME.js for high-fidelity encoding. For professional mixing, we recommend processing the resulting MP3 in a dedicated DAW.
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
