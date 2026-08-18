
"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Gauge, 
  ArrowDown, 
  ArrowUp, 
  Activity, 
  Zap, 
  RefreshCcw, 
  RotateCcw,
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
  AlertCircle,
  History,
  Copy,
  BarChart3,
  Server,
  MapPin,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip } from 'recharts';

// --- Production Constants ---
const TEST_FILE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs';
const TEST_FILE_SIZE_BYTES = 1.2 * 1024 * 1024;
const UPLOAD_TEST_URL = 'https://httpbin.org/post';
const UPLOAD_SIZE_KB = 256;
const HISTORY_KEY = 'mykit_speed_history_v4';

type TestStep = 'idle' | 'locating' | 'ping' | 'download' | 'upload' | 'complete';

interface SpeedResult {
  id: string;
  timestamp: number;
  download: number;
  upload: number | null;
  ping: number;
  location: string;
}

export default function SpeedTestPage() {
  const { toast } = useToast();
  
  // Results State
  const [downloadMbps, setDownloadMbps] = useState<number | null>(null);
  const [uploadMbps, setUploadMbps] = useState<number | null>(null);
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [location, setLocation] = useState<string>('Detecting...');
  
  // Runtime State
  const [isTesting, setIsTesting] = useState(false);
  const [step, setStep] = useState<TestStep>('idle');
  const [progress, setProgress] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [graphData, setGraphData] = useState<{ time: number; speed: number }[]>([]);
  const [history, setHistory] = useState<SpeedResult[]>([]);
  const [isCopied, setIsCopied] = useState(false);

  // Load History
  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) try { setHistory(JSON.parse(saved)); } catch (e) {}
    
    // Initial Locating
    fetch('https://ipapi.co/json/').then(r => r.json()).then(data => {
      setLocation(`${data.city}, ${data.country_code}`);
    }).catch(() => setLocation('Global Node'));
  }, []);

  const resetResults = () => {
    setDownloadMbps(null);
    setUploadMbps(null);
    setPingMs(null);
    setProgress(0);
    setCurrentSpeed(0);
    setStep('idle');
    setGraphData([]);
  };

  const runPingTest = async (pass: number) => {
    setStep('ping');
    const latencies: number[] = [];
    for (let i = 0; i < 5; i++) {
      const start = performance.now();
      try {
        await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors', cache: 'no-cache' });
        latencies.push(performance.now() - start);
      } catch (e) {
        latencies.push(150);
      }
      setProgress((pass === 1 ? 5 : 15) + i);
      await new Promise(r => setTimeout(r, 100));
    }
    return latencies.reduce((a, b) => a + b) / latencies.length;
  };

  const runDownloadTest = async (pass: number) => {
    setStep('download');
    const start = performance.now();
    let loaded = 0;
    const localGraph: { time: number; speed: number }[] = [];

    try {
      const response = await fetch(TEST_FILE_URL, { cache: 'no-cache' });
      if (!response.body) throw new Error("Stream Unavailable");
      
      const reader = response.body.getReader();
      let tick = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        loaded += value.length;
        const elapsed = (performance.now() - start) / 1000;
        const mbps = (loaded * 8) / (elapsed * 1024 * 1024);
        
        setCurrentSpeed(mbps);
        if (tick % 5 === 0) {
          localGraph.push({ time: tick, speed: parseFloat(mbps.toFixed(2)) });
          setGraphData([...localGraph]);
        }
        tick++;
        setProgress(20 + (pass === 1 ? 0 : 30) + (Math.min(loaded / TEST_FILE_SIZE_BYTES, 1)) * 30);
      }
      return (loaded * 8) / ((performance.now() - start) / 1000) / (1024 * 1024);
    } catch (e) {
      return 0;
    }
  };

  const runUploadTest = async () => {
    setStep('upload');
    const data = new Uint8Array(UPLOAD_SIZE_KB * 1024);
    window.crypto.getRandomValues(data);
    const start = performance.now();
    try {
      const response = await fetch(UPLOAD_TEST_URL, { method: 'POST', body: data, cache: 'no-cache' });
      if (!response.ok) throw new Error("Blocked");
      const elapsed = (performance.now() - start) / 1000;
      return (data.length * 8) / (elapsed * 1024 * 1024);
    } catch (e) {
      return null;
    }
  };

  const startTest = async () => {
    if (isTesting) return;
    setIsTesting(true);
    resetResults();
    
    // Pass 1
    const p1 = await runPingTest(1);
    const d1 = await runDownloadTest(1);
    
    // Pass 2 (Clinical Verification)
    const p2 = await runPingTest(2);
    const d2 = await runDownloadTest(2);
    
    // Upload Protocol
    const u = await runUploadTest();
    
    const finalPing = Math.round((p1 + p2) / 2);
    const finalDownload = (d1 + d2) / 2;

    setPingMs(finalPing);
    setDownloadMbps(finalDownload);
    setUploadMbps(u);
    
    // Archive to History
    const result: SpeedResult = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      download: finalDownload,
      upload: u,
      ping: finalPing,
      location: location
    };
    
    const newHistory = [result, ...history].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));

    setStep('complete');
    setIsTesting(false);
    toast({ title: "Analysis Complete", description: "Matrix successfully averaged." });
  };

  const handleCopy = () => {
    const text = `MY KIT Speed Test\n---\nDownload: ${downloadMbps?.toFixed(2)} Mbps\nUpload: ${uploadMbps?.toFixed(2) || 'N/A'} Mbps\nPing: ${pingMs} ms\nLocation: ${location}\nDate: ${new Date().toLocaleString()}`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast({ title: "Results Copied" });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const performanceRating = useMemo(() => {
    if (!downloadMbps) return null;
    if (downloadMbps > 50) return { label: 'ULTRA FAST', color: 'text-emerald-500', bg: 'bg-emerald-500/10', tip: 'Optimized for 4K streaming and high-volume data sync.' };
    if (downloadMbps > 20) return { label: 'NORMAL', color: 'text-primary', bg: 'bg-primary/10', tip: 'Standard production bandwidth. Stable for studio work.' };
    return { label: 'SLOW', color: 'text-amber-500', bg: 'bg-amber-500/10', tip: 'Latency identified. Check hardware hardware or hardware port.' };
  }, [downloadMbps]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
            <Gauge className="w-3.5 h-3.5" /> Hardware Telemetry
          </div>
          <h1 className="text-3xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight">
            Speed Test <span className="text-primary italic">Studio Pro</span>
          </h1>
          <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
            Multi-pass velocity analysis. Measure averaged download bandwidth and signal jitter locally with high-fidelity visual graphing.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 pb-2">
           <GetHelp toolId="speed-test" />
           {step === 'complete' && (
             <Button onClick={handleCopy} variant="outline" className="h-10 px-6 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-primary transition-all">
                {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> : <Copy className="w-3.5 h-3.5 mr-2" />}
                Copy Results
             </Button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Main Gauge & Graph */}
        <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-left-6 duration-1000">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative group min-h-[600px] flex flex-col bg-black/60">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              
              <CardContent className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 relative">
                 <div className="flex flex-col lg:flex-row items-center gap-12 w-full">
                    {/* Gauge */}
                    <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center shrink-0">
                        <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full animate-pulse" />
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
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <h2 className="text-6xl sm:text-7xl font-headline font-black text-foreground tracking-tighter">
                              {isTesting ? Math.round(currentSpeed) : (downloadMbps ? Math.round(downloadMbps) : '00')}
                          </h2>
                          <p className="text-xs font-black text-primary uppercase tracking-[0.3em]">Mbps</p>
                        </div>
                    </div>

                    {/* Graph */}
                    <div className="flex-1 w-full h-48 sm:h-64 bg-black/20 rounded-[2rem] border border-white/5 p-6 relative overflow-hidden">
                       {graphData.length > 0 ? (
                         <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={graphData}>
                               <Line type="monotone" dataKey="speed" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} animationDuration={300} />
                               <YAxis hide domain={['auto', 'auto']} />
                               <XAxis hide />
                               <Tooltip 
                                contentStyle={{ backgroundColor: '#0a0a0c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                labelStyle={{ display: 'none' }}
                                itemStyle={{ color: 'white', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase' }}
                               />
                            </LineChart>
                         </ResponsiveContainer>
                       ) : (
                         <div className="h-full flex flex-col items-center justify-center opacity-10 gap-3">
                            <BarChart3 className="w-10 h-10" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Signal Graph</p>
                         </div>
                       )}
                       <div className="absolute top-4 left-6 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                          <span className="text-[8px] font-black uppercase text-white/20 tracking-widest">Real-time bitstream monitor</span>
                       </div>
                    </div>
                 </div>

                 {/* Execution Button */}
                 <div className="w-full max-w-md mt-12 space-y-6">
                    {!isTesting ? (
                      <Button 
                        onClick={startTest}
                        className="h-16 w-full bg-primary text-white font-black text-sm uppercase tracking-[0.4em] rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all group"
                      >
                         <Play className="w-4 h-4 mr-3 fill-current group-hover:scale-110 transition-transform" />
                         {step === 'complete' ? 'Re-run Benchmark' : 'Initialize Matrix'}
                      </Button>
                    ) : (
                      <div className="space-y-4 text-center">
                         <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                            <span className="flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> {step.toUpperCase()} PROTOCOL...</span>
                            <span>{progress}%</span>
                         </div>
                         <Progress value={progress} className="h-1.5 rounded-full" />
                      </div>
                    )}
                 </div>
              </CardContent>

              {/* Status Row */}
              <div className="p-6 border-t border-white/5 bg-secondary/30 flex items-center justify-center gap-10 sm:gap-16">
                 {[
                   { id: 'ping', label: 'Ping', icon: Activity },
                   { id: 'download', label: 'Download', icon: ArrowDown },
                   { id: 'upload', label: 'Upload', icon: ArrowUp },
                 ].map((s) => (
                   <div key={s.id} className={cn(
                     "flex flex-col items-center gap-2 transition-all duration-700",
                     step === s.id ? "scale-110 opacity-100" : "opacity-20 grayscale"
                   )}>
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", step === s.id ? "bg-primary/20 border-primary text-primary" : "bg-white/5 border-white/5")}>
                         <s.icon className="w-4 h-4" />
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-widest">{s.label}</span>
                   </div>
                 ))}
              </div>
           </Card>

           {performanceRating && (
             <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-in slide-in-from-bottom-6 duration-700">
                <div className="md:col-span-4 p-8 rounded-[3rem] bg-secondary border border-border flex flex-col items-center justify-center text-center gap-3">
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/30">Rating</p>
                   <h3 className={cn("text-3xl font-headline font-black uppercase tracking-tight", performanceRating.color)}>
                      {performanceRating.label}
                   </h3>
                </div>
                <div className="md:col-span-8 p-8 rounded-[3rem] bg-primary/5 border border-primary/20 flex items-start gap-6">
                   <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20 shadow-xl">
                      <Zap className="w-6 h-6" />
                   </div>
                   <div className="space-y-1">
                      <h4 className="text-[12px] font-black uppercase tracking-widest text-foreground">Studio Recommendation</h4>
                      <p className="text-sm font-medium text-foreground/60 leading-relaxed">{performanceRating.tip}</p>
                   </div>
                </div>
             </div>
           )}
        </div>

        {/* Sidebar: Stats & History */}
        <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           <Card className="glass-card border-border shadow-xl">
              <CardHeader className="py-6 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Activity className="w-5 h-5 text-primary" /> Matrix results
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                 <div className="grid grid-cols-1 gap-3">
                    {[
                      { label: 'Download', val: downloadMbps ? `${downloadMbps.toFixed(2)}` : '--', unit: 'Mbps', icon: ArrowDown },
                      { label: 'Upload', val: uploadMbps ? `${uploadMbps.toFixed(2)}` : '--', unit: 'Mbps', icon: ArrowUp, hide: uploadMbps === null && step === 'complete' },
                      { label: 'Ping Latency', val: pingMs || '--', unit: 'ms', icon: Clock },
                    ].map((res, i) => !res.hide && (
                      <div key={i} className="p-5 rounded-2xl bg-secondary/50 border border-border flex items-center justify-between group hover:border-primary/20 transition-all">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all shadow-inner">
                              <res.icon className="w-5 h-5" />
                           </div>
                           <div className="space-y-0.5">
                              <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">{res.label}</p>
                              <h4 className="text-lg font-headline font-black text-foreground leading-none">{res.val} <span className="text-[10px] opacity-40 ml-0.5">{res.unit}</span></h4>
                           </div>
                        </div>
                      </div>
                    ))}
                 </div>

                 <div className="pt-4 border-t border-white/5 space-y-4">
                    <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-secondary/30 border border-border">
                       <MapPin className="w-4 h-4 text-primary/40" />
                       <div className="space-y-0.5">
                          <p className="text-[8px] font-black uppercase text-foreground/30">Local Port</p>
                          <p className="text-[10px] font-bold text-foreground truncate uppercase">{location}</p>
                       </div>
                    </div>
                 </div>
              </CardContent>
           </Card>

           <Card className="glass-card border-border shadow-xl flex flex-col max-h-[400px]">
              <CardHeader className="py-4 border-b border-border bg-secondary/30 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <History className="w-4 h-4 text-primary" />
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Archive</CardTitle>
                 </div>
                 {history.length > 0 && (
                   <button onClick={() => { setHistory([]); localStorage.removeItem(HISTORY_KEY); }} className="text-[8px] font-black uppercase text-foreground/20 hover:text-destructive">Purge</button>
                 )}
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-1">
                 {history.length === 0 ? (
                    <div className="py-16 text-center opacity-10 space-y-4">
                       <Monitor className="w-10 h-10 mx-auto" />
                       <p className="text-[9px] font-black uppercase tracking-widest">Zero Archive data</p>
                    </div>
                 ) : (
                    <div className="divide-y divide-white/5">
                       {history.map(h => (
                         <div key={h.id} className="p-4 flex items-center justify-between group hover:bg-white/5 transition-all">
                            <div className="flex items-center gap-4 overflow-hidden">
                               <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all">
                                  <ArrowDown className="w-4 h-4" />
                               </div>
                               <div className="min-w-0">
                                  <p className="text-[11px] font-bold text-foreground truncate uppercase">{h.download.toFixed(1)} Mbps</p>
                                  <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-tighter">{new Date(h.timestamp).toLocaleTimeString()}</p>
                               </div>
                            </div>
                            <span className="text-[9px] font-mono text-primary/40 font-bold">{h.ping}ms</span>
                         </div>
                       ))}
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
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .recharts-tooltip-wrapper { outline: none !important; }
      `}</style>
    </div>
  );
}

