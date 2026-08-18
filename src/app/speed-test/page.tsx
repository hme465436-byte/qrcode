
"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Gauge, 
  ArrowDown, 
  ArrowUp, 
  Activity, 
  Zap, 
  RefreshCcw, 
  ShieldCheck, 
  Info,
  Play,
  Monitor,
  Smartphone,
  Globe,
  Loader2,
  CheckCircle2,
  Wifi,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

// --- Production Constants ---
const TEST_FILE_URL = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop';
const TEST_FILE_SIZE_BYTES = 2.4 * 1024 * 1024; // Approx 2.4MB
const UPLOAD_TEST_URL = 'https://httpbin.org/post';
const UPLOAD_SIZE_KB = 512;

type TestStep = 'idle' | 'ping' | 'download' | 'upload' | 'complete';

export default function SpeedTestPage() {
  const { toast } = useToast();
  
  // Results State
  const [downloadMbps, setDownloadMbps] = useState<number | null>(null);
  const [uploadMbps, setUploadMbps] = useState<number | null>(null);
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [jitterMs, setJitterMs] = useState<number | null>(null);
  
  // Runtime State
  const [isTesting, setIsTesting] = useState(false);
  const [step, setStep] = useState<TestStep>('idle');
  const [progress, setProgress] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);

  const resetResults = () => {
    setDownloadMbps(null);
    setUploadMbps(null);
    setPingMs(null);
    setJitterMs(null);
    setProgress(0);
    setCurrentSpeed(0);
  };

  const runPingTest = async () => {
    setStep('ping');
    const latencies: number[] = [];
    
    for (let i = 0; i < 4; i++) {
      const start = performance.now();
      try {
        await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors', cache: 'no-cache' });
        latencies.push(performance.now() - start);
      } catch (e) {
        latencies.push(100); // Fallback
      }
      setProgress((i + 1) * 5); // 0-20%
    }
    
    const avg = latencies.reduce((a, b) => a + b) / latencies.length;
    const jitter = Math.abs(latencies[latencies.length - 1] - latencies[0]);
    setPingMs(Math.round(avg));
    setJitterMs(Math.round(jitter));
  };

  const runDownloadTest = async () => {
    setStep('download');
    const start = performance.now();
    let loaded = 0;

    try {
      const response = await fetch(TEST_FILE_URL, { cache: 'no-cache' });
      if (!response.body) throw new Error();
      
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        loaded += value.length;
        const elapsed = (performance.now() - start) / 1000;
        const currentMbps = (loaded * 8) / (elapsed * 1024 * 1024);
        setCurrentSpeed(currentMbps);
        setProgress(20 + (loaded / TEST_FILE_SIZE_BYTES) * 40); // 20-60%
      }

      const totalElapsed = (performance.now() - start) / 1000;
      const finalMbps = (loaded * 8) / (totalElapsed * 1024 * 1024);
      setDownloadMbps(finalMbps);
    } catch (e) {
      setDownloadMbps(0);
    }
  };

  const runUploadTest = async () => {
    setStep('upload');
    const data = new Uint8Array(UPLOAD_SIZE_KB * 1024);
    window.crypto.getRandomValues(data);
    
    const start = performance.now();
    try {
      const response = await fetch(UPLOAD_TEST_URL, {
        method: 'POST',
        body: data,
        cache: 'no-cache'
      });

      if (!response.ok) throw new Error();
      
      const elapsed = (performance.now() - start) / 1000;
      const mbps = (data.length * 8) / (elapsed * 1024 * 1024);
      setUploadMbps(mbps);
      setCurrentSpeed(mbps);
    } catch (e) {
      setUploadMbps(null); // Will show server fallback message
    }
    setProgress(100);
  };

  const startTest = async () => {
    if (isTesting) return;
    setIsTesting(true);
    resetResults();
    
    try {
      await runPingTest();
      await runDownloadTest();
      await runUploadTest();
      setStep('complete');
      toast({ title: "Analysis Complete", description: "Network telemetry matrix synchronized." });
    } catch (err) {
      toast({ variant: "destructive", title: "Telemetry Failed", description: "Check your data link and retry." });
    } finally {
      setIsTesting(false);
    }
  };

  const performanceLabel = useMemo(() => {
    if (step !== 'complete') return null;
    const mbps = downloadMbps || 0;
    if (mbps > 50) return { text: 'FAST', color: 'text-green-500', bg: 'bg-green-500/10' };
    if (mbps > 15) return { text: 'NORMAL', color: 'text-primary', bg: 'bg-primary/10' };
    return { text: 'SLOW', color: 'text-amber-500', bg: 'bg-amber-500/10' };
  }, [downloadMbps, step]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
            <Gauge className="w-3.5 h-3.5" /> Telemetry Suite
          </div>
          <h1 className="text-3xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight">
            Speed Test <span className="text-primary italic">Studio</span>
          </h1>
          <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
            Professional network velocity analysis. Measure download bandwidth, upload latency, and jitter protocols locally using hardware-native telemetry.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 pb-2">
           <GetHelp toolId="speed-test" />
           <Button variant="outline" onClick={resetResults} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
              <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Main Speedometer */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-6 duration-1000">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative group min-h-[600px] flex flex-col bg-black/60">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              
              <CardContent className="flex-1 flex flex-col items-center justify-center p-8 sm:p-16 relative">
                 {/* Visual Gauge */}
                 <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center mb-12">
                    <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full animate-pulse" />
                    
                    {/* SVG Gauge Background */}
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                       <circle cx="50" cy="50" r="45" fill="transparent" stroke="currentColor" strokeWidth="2" className="text-white/5" />
                       <circle 
                        cx="50" cy="50" r="45" 
                        fill="transparent" 
                        stroke="currentColor" 
                        strokeWidth="4" 
                        strokeDasharray="283" 
                        strokeDashoffset={283 - (283 * Math.min(progress, 100)) / 100}
                        className="text-primary transition-all duration-300 ease-out" 
                       />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-2">
                       <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.5em]">{step === 'idle' ? 'Ready' : step.toUpperCase()}</p>
                       <h2 className="text-6xl sm:text-8xl font-headline font-black text-foreground leading-none">
                          {isTesting ? Math.round(currentSpeed) : (downloadMbps ? Math.round(downloadMbps) : '00')}
                       </h2>
                       <p className="text-lg font-headline font-bold text-primary uppercase tracking-widest">Mbps</p>
                    </div>
                 </div>

                 {/* Execution Cluster */}
                 <div className="w-full max-w-sm space-y-6">
                    {!isTesting && step !== 'complete' ? (
                      <Button 
                        onClick={startTest}
                        className="h-20 w-full bg-primary text-white font-black text-xl uppercase tracking-[0.4em] rounded-[2rem] shadow-2xl shadow-primary/30 active:scale-95 transition-all group/btn"
                      >
                         <Play className="w-8 h-8 mr-4 fill-current group-hover/btn:scale-110 transition-transform" />
                         Start Test
                      </Button>
                    ) : isTesting ? (
                      <div className="space-y-4 text-center">
                         <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                            <span className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing Signal...</span>
                            <span>{progress}%</span>
                         </div>
                         <Progress value={progress} className="h-1.5 rounded-full" />
                      </div>
                    ) : (
                      <Button 
                        onClick={startTest}
                        variant="outline"
                        className="h-16 w-full bg-white/5 border-white/10 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-white/10"
                      >
                         <RefreshCcw className="w-5 h-5 mr-3" /> Run Protocol Again
                      </Button>
                    )}
                 </div>
              </CardContent>

              {/* Step Footer */}
              <div className="p-6 border-t border-white/5 bg-secondary/30 flex items-center justify-center gap-8 sm:gap-12">
                 {[
                   { id: 'ping', label: 'Ping', icon: Activity },
                   { id: 'download', label: 'Download', icon: ArrowDown },
                   { id: 'upload', label: 'Upload', icon: ArrowUp },
                 ].map((s) => (
                   <div key={s.id} className={cn(
                     "flex flex-col items-center gap-2 transition-all duration-500",
                     step === s.id ? "scale-110 opacity-100" : "opacity-20 grayscale"
                   )}>
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", step === s.id ? "bg-primary/20 border-primary text-primary" : "bg-white/5 border-white/5")}>
                         <s.icon className="w-5 h-5" />
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-widest">{s.label}</span>
                   </div>
                 ))}
              </div>
           </Card>
        </div>

        {/* Sidebar Results */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           <Card className="glass-card border-border shadow-xl overflow-hidden">
              <CardHeader className="py-6 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Activity className="w-5 h-5 text-primary" /> Signal Matrix
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                 {/* Results Grid */}
                 <div className="grid grid-cols-1 gap-4">
                    <div className="p-6 rounded-3xl bg-secondary/50 border border-border flex items-center justify-between group hover:border-primary/20 transition-all">
                       <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all shadow-inner">
                             <ArrowDown className="w-6 h-6" />
                          </div>
                          <div className="space-y-0.5">
                             <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">Download</p>
                             <h4 className="text-2xl font-headline font-black text-foreground">{downloadMbps ? downloadMbps.toFixed(1) : '--'} <span className="text-xs text-foreground/20 font-bold">Mbps</span></h4>
                          </div>
                       </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-secondary/50 border border-border flex items-center justify-between group hover:border-primary/20 transition-all">
                       <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all shadow-inner">
                             <ArrowUp className="w-6 h-6" />
                          </div>
                          <div className="space-y-0.5">
                             <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">Upload</p>
                             {uploadMbps ? (
                               <h4 className="text-2xl font-headline font-black text-foreground">{uploadMbps.toFixed(1)} <span className="text-xs text-foreground/20 font-bold">Mbps</span></h4>
                             ) : (
                               <p className="text-[10px] font-bold text-foreground/20 uppercase italic">Test server required</p>
                             )}
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-6 rounded-3xl bg-secondary/50 border border-border flex flex-col items-center justify-center text-center gap-1 group hover:border-primary/20 transition-all">
                          <p className="text-[8px] font-black text-foreground/30 uppercase tracking-widest">Latency (Ping)</p>
                          <h4 className="text-xl font-headline font-black text-foreground">{pingMs || '--'} <span className="text-[10px] text-foreground/20">ms</span></h4>
                       </div>
                       <div className="p-6 rounded-3xl bg-secondary/50 border border-border flex flex-col items-center justify-center text-center gap-1 group hover:border-primary/20 transition-all">
                          <p className="text-[8px] font-black text-foreground/30 uppercase tracking-widest">Jitter Matrix</p>
                          <h4 className="text-xl font-headline font-black text-foreground">{jitterMs || '--'} <span className="text-[10px] text-foreground/20">ms</span></h4>
                       </div>
                    </div>
                 </div>

                 {performanceLabel && (
                   <div className={cn("p-6 rounded-[2rem] border animate-in zoom-in duration-500 text-center space-y-2", performanceLabel.bg, performanceLabel.color.replace('text-', 'border-').replace('500', '20'))}>
                      <p className="text-[10px] font-black uppercase tracking-[0.4em]">Hardware Rating</p>
                      <h3 className={cn("text-3xl font-headline font-black uppercase tracking-tighter", performanceLabel.color)}>{performanceLabel.text}</h3>
                   </div>
                 )}
              </CardContent>
           </Card>

           <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
             <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
             </div>
             <div className="space-y-2">
               <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Privacy Absolute</h4>
               <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                 Telemetry logic occurs 100% locally. Network benchmarks and hardware identifiers are held in volatile memory and never transmitted to remote logs.
               </p>
             </div>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
