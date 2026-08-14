
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
  Settings2,
  AlertCircle
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
          title: "High Volume detected", 
          description: "Videos over 100MB may cause browser instability. Proceeding with caution." 
        });
      }
      setFile(selectedFile);
      setMp3Url(null);
      setProgress(0);
      setStatus('');
      toast({ title: "Video Imported", description: "Studio ready for audio extraction." });
    }
  };

  const convertToMp3 = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setStatus('Initializing Audio Context...');

    try {
      // 1. Setup Audio Context & Buffer
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await file.arrayBuffer();
      
      setStatus('Decoding Video Payload...');
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      setStatus('Encoding High-Fidelity MP3...');

      // 2. Fix for lamejs MPEGMode error in Next.js/Webpack environment
      // lamejs expects some globals to be defined or scoped correctly.
      const lamejs = require('lamejs');
      
      // Patch global window object with lamejs internal constants if missing
      if (typeof window !== 'undefined') {
        (window as any).MPEGMode = {
          STEREO: 0,
          JOINT_STEREO: 1,
          DUAL_CHANNEL: 2,
          MONO: 3,
        };
        // Some versions of lamejs also look for bitstream or Lame globals
        if (!(window as any).Lame) (window as any).Lame = lamejs;
      }

      const channels = audioBuffer.numberOfChannels;
      const sampleRate = audioBuffer.sampleRate;
      
      // Initialize MP3 Encoder (128kbps quality)
      const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, 128);
      const mp3Data: any[] = [];

      const samplesL = audioBuffer.getChannelData(0);
      const samplesR = channels > 1 ? audioBuffer.getChannelData(1) : samplesL;

      const sampleBlockSize = 1152; // LAME standard block size
      const totalSamples = samplesL.length;
      
      for (let i = 0; i < totalSamples; i += sampleBlockSize) {
        const leftChunk = samplesL.subarray(i, i + sampleBlockSize);
        const rightChunk = samplesR.subarray(i, i + sampleBlockSize);
        
        // Convert Float32 samples (-1 to 1) to Int16 samples (-32768 to 32767)
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
        
        // Throttled progress update to keep UI responsive
        if (i % (sampleBlockSize * 10) === 0) {
          const p = Math.round((i / totalSamples) * 100);
          setProgress(p);
        }
      }

      // Finalize the encoding
      const endBuf = mp3encoder.flush();
      if (endBuf.length > 0) {
        mp3Data.push(endBuf);
      }

      const blob = new Blob(mp3Data, { type: 'audio/mp3' });
      setMp3Url(URL.createObjectURL(blob));
      setProgress(100);
      setStatus('Production Complete');
      toast({ title: "Master Exported", description: "Audio track successfully encoded to MP3." });
      
      audioContext.close();
    } catch (err: any) {
      console.error('Audio Conversion Error:', err);
      let errorMessage = "An unexpected error occurred during audio extraction.";
      
      if (err.name === 'EncodingError') errorMessage = "Failed to decode video audio track. The format might be unsupported.";
      if (err.message?.includes('MPEGMode')) errorMessage = "Encoding engine initialization failed. Please reload and try again.";
      
      toast({ 
        variant: "destructive", 
        title: "Conversion Failed", 
        description: errorMessage 
      });
      setStatus('Conversion Failed');
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
    toast({ title: "Studio Reset", description: "Fields cleared and cache purged." });
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
          Extract high-fidelity audio tracks from video payloads. 100% private client-side encoding for professional workflows.
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
                  <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Video Asset</Label>
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
                       <p className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest">Tap to change source</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-foreground/20 group-hover:text-primary group-hover:scale-110 transition-all mb-4">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest group-hover:text-primary transition-colors">Select Video Container</p>
                      <p className="text-[8px] text-foreground/20 uppercase font-bold mt-2">MP4, WEBM, MOV</p>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} accept="video/*" onChange={handleFileChange} className="hidden" />
                </div>

                {file && file.size > 50 * 1024 * 1024 && (
                   <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20 flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                      <p className="text-[9px] text-yellow-500/70 font-bold leading-relaxed uppercase tracking-wider">
                        Performance Warning: Processing high-volume assets may take several moments in browser memory.
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
                  Generate MP3
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
                Audio extraction occurs entirely within your browser's secure sandbox. No data is transmitted, ensuring 100% confidentiality for your media assets.
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
                  Extraction Pipeline
                </CardTitle>
                {mp3Url && (
                  <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest shadow-sm">
                    Asset Ready
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-10 space-y-10">
              <div className="relative group/output min-h-[220px] flex flex-col items-center justify-center rounded-[2.5rem] bg-secondary/30 border border-border p-10 text-center">
                {!mp3Url && !isProcessing && (
                  <div className="opacity-10 group-hover:opacity-20 transition-opacity">
                    <Music className="w-20 h-20 text-primary mb-4 mx-auto" />
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
                  </div>
                )}

                {mp3Url && (
                  <div className="space-y-8 w-full animate-in zoom-in duration-500">
                    <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto shadow-xl">
                      <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Audio Master Decoded</h3>
                      <p className="text-[10px] text-foreground/40 font-medium uppercase tracking-widest">128kbps Constant Bitrate</p>
                    </div>
                    <div className="p-4 bg-background/50 rounded-2xl border border-border">
                      <audio controls src={mp3Url} className="w-full" />
                    </div>
                    <Button 
                      asChild
                      className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-xl shadow-xl shadow-primary/30 transition-all active:scale-95"
                    >
                      <a href={mp3Url} download={`${file?.name.split('.')[0] || 'master'}.mp3`}>
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
                      Our engine utilizes a high-performance LAME implementation. For professional mastering, we recommend further processing in a dedicated digital audio workstation.
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
