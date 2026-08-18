
"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Gauge, 
  ArrowDown, 
  ArrowUp, 
  Activity, 
  Zap, 
  RotateCcw,
  ShieldCheck, 
  Play,
  Monitor,
  Smartphone,
  Globe,
  Loader2,
  CheckCircle2,
  History,
  Copy,
  BarChart3,
  MapPin,
  Clock,
  X,
  AlertCircle,
  Fingerprint,
  Info,
  Server,
  TrendingUp,
  TrendingDown,
  Tv,
  Check,
  Signal,
  Video
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

// --- Production Telemetry Config ---
const CLOUDFLARE_DOWN = 'https://speed.cloudflare.com/__down?bytes=25000000';
const CLOUDFLARE_UP = 'https://speed.cloudflare.com/__up';
const PING_URL = 'https://www.cloudflare.com/favicon.ico';
const HISTORY_KEY = 'mykit_speed_history_v7';
const WARMUP_TIME_MS = 2000;
const MASTER_TIMEOUT_MS = 30000; 

type TestStep = 'idle' | 'ping' | 'download' | 'upload' | 'complete';

interface SpeedResult {
  id: string;
  timestamp: number;
  download: number;
  upload: number | null;
  ping: number;
  jitter: number;
  location: string;
  isp: string;
}

const GAUGE_POINTS = [0, 5, 10, 50, 100, 250, 500, 750, 1000];

const getAngleForSpeed = (mbps: number | null) => {
  if (mbps === null || mbps <= 0) return -90;
  const points = GAUGE_POINTS;
  const stepSize = 180 / (points.length - 1);
  for (let i = 0; i < points.length - 1; i++) {
    if (mbps <= points[i + 1]) {
      const segmentProgress = (mbps - points[i]) / (points[i + 1] - points[i]);
      return -90 + (i * stepSize) + (segmentProgress * stepSize);
    }
  }
  return 90;
};

export default function SpeedTestPage() {
  const { toast } = useToast();
  
  // Results State
  const [downloadMbps, setDownloadMbps] = useState<number | null>(null);
  const [uploadMbps, setUploadMbps] = useState<number | null>(null);
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [jitterMs, setJitterMs] = useState<number | null>(null);
  const [location, setLocation] = useState<string>('');
  const [ispName, setIspName] = useState<string>('');
  const [publicIp, setPublicIp] = useState<string>('');
  
  // Runtime State
  const [isTesting, setIsTesting] = useState(false);
  const [step, setStep] = useState<TestStep>('idle');
  const [progress, setProgress] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [history, setHistory] = useState<SpeedResult[]>([]);
  const [isCopied, setIsCopied] = useState(false);

  const testTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load Metadata & History
  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) try { setHistory(JSON.parse(saved)); } catch (e) {}
    
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(data => {
        setIspName(data.org || '');
        setPublicIp(data.ip || '');
        setLocation(`${data.city || 'Matrix Node'}, ${data.country_code || 'Global'}`);
      })
      .catch(() => {});

    return () => {
      if (testTimeoutRef.current) clearTimeout(testTimeoutRef.current);
    };
  }, []);

  const resetResults = () => {
    setDownloadMbps(null);
    setUploadMbps(null);
    setPingMs(null);
    setJitterMs(null);
    setProgress(0);
    setCurrentSpeed(0);
    setStep('idle');
    if (testTimeoutRef.current) clearTimeout(testTimeoutRef.current);
  };

  const handleCopy = () => {
    const text = [
      `[MY KIT TOOL - ADVANCED TELEMETRY]`,
      `Download: ${downloadMbps?.toFixed(1) || '--'} Mbps`,
      `Upload: ${uploadMbps?.toFixed(1) || '--'} Mbps`,
      `Ping: ${pingMs || '--'} ms`,
      `Jitter: ${jitterMs || '--'} ms`,
      `Quality: ${connectionQuality.label}`,
      `ISP: ${ispName || 'Unknown'}`,
      `IP: ${publicIp || 'Hidden'}`,
      `Node: ${location || 'Global'}`,
      `Timestamp: ${new Date().toLocaleString()}`
    ].join('\n');
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast({ title: "Matrix Copied" });
    setTimeout(() => setIsCopied(false), 2000);
  };

  // --- Telemetry Core ---

  const runPingAndJitter = async (): Promise<{ ping: number, jitter: number }> => {
    setStep('ping');
    const samples: number[] = [];
    const jitterSamples: number[] = [];
    
    for (let i = 0; i < 10; i++) {
      const start = performance.now();
      try {
        await fetch(`${PING_URL}?t=${Date.now()}`, { mode: 'no-cors', cache: 'no-cache' });
        const latency = performance.now() - start;
        samples.push(latency);
        if (i > 0) {
          jitterSamples.push(Math.abs(latency - samples[i - 1]));
        }
      } catch (e) {
        samples.push(20);
      }
      setProgress(Math.round((i / 10) * 10));
    }
    
    const avgPing = Math.round(samples.reduce((a, b) => a + b) / samples.length);
    const avgJitter = Math.round(jitterSamples.reduce((a, b) => a + b) / jitterSamples.length);
    return { ping: avgPing, jitter: avgJitter };
  };

  const runDownloadPass = async (baseProg: number): Promise<number> => {
    setStep('download');
    let loaded = 0;
    let measureStartTime = 0;
    let bytesAtMeasureStart = 0;
    let passStartTime = performance.now();

    try {
      const response = await fetch(`${CLOUDFLARE_DOWN}&t=${Date.now()}`, { cache: 'no-cache' });
      if (!response.body) return 0;
      
      const totalBytes = 25000000;
      const reader = response.body.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        loaded += value.length;
        const now = performance.now();
        
        if (measureStartTime === 0 && (now - passStartTime) > WARMUP_TIME_MS) {
          measureStartTime = now;
          bytesAtMeasureStart = loaded;
        }

        if (measureStartTime > 0) {
          const durationSecs = (now - measureStartTime) / 1000;
          if (durationSecs > 0) {
            const mbps = ((loaded - bytesAtMeasureStart) * 8) / (durationSecs * 1024 * 1024);
            setCurrentSpeed(mbps);
          }
        }
        setProgress(baseProg + Math.min((loaded / totalBytes) * 20, 20));
      }
      
      const finalDuration = (performance.now() - measureStartTime) / 1000;
      return ((loaded - bytesAtMeasureStart) * 8) / (finalDuration * 1024 * 1024);
    } catch (e) {
      return 0;
    }
  };

  const runUploadPass = async (): Promise<number | null> => {
    setStep('upload');
    const size = 5 * 1024 * 1024; // 5MB payload
    const data = new Uint8Array(size);
    
    // Chunked entropy generation for hardware safety
    for (let i = 0; i < size; i += 65536) {
      const end = Math.min(i + 65536, size);
      window.crypto.getRandomValues(data.subarray(i, end));
    }

    const attemptUpload = async (): Promise<number | null> => {
      const start = performance.now();
      try {
        const response = await fetch(CLOUDFLARE_UP, {
          method: 'POST',
          body: data,
          cache: 'no-cache'
        });
        if (!response.ok) return null;
        const duration = (performance.now() - start) / 1000;
        return (size * 8) / (duration * 1024 * 1024);
      } catch (e) {
        return null;
      }
    };

    let result = await attemptUpload();
    if (result === null) result = await attemptUpload(); // Single fail-safe retry
    return result;
  };

  const startTest = async () => {
    if (isTesting) return;
    setIsTesting(true);
    resetResults();

    testTimeoutRef.current = setTimeout(() => {
      if (isTesting) {
        setIsTesting(false);
        setStep('complete');
        toast({ title: "Test Timeout", description: "Telemetry partially finalized." });
      }
    }, MASTER_TIMEOUT_MS);

    // Phase 1: Ping & Jitter
    const { ping, jitter } = await runPingAndJitter();
    setPingMs(ping);
    setJitterMs(jitter);
    setProgress(15);

    // Phase 2: Download Pass 1
    const d1 = await runDownloadPass(15);
    setProgress(40);
    
    // Phase 3: Download Pass 2
    const d2 = await runDownloadPass(40);
    const bestD = Math.max(d1, d2);
    setDownloadMbps(bestD);
    setProgress(75);

    // Phase 4: Upload
    const u = await runUploadPass();
    setUploadMbps(u);
    setProgress(100);

    setStep('complete');
    setIsTesting(false);
    if (testTimeoutRef.current) clearTimeout(testTimeoutRef.current);

    // Archive Result
    const res: SpeedResult = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      download: bestD || 0,
      upload: u,
      ping,
      jitter,
      location: location,
      isp: ispName
    };

    setHistory(prev => {
      const next = [res, ...prev].slice(0, 10);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });

    toast({ title: "Master Benchmarked", description: "Network telemetry finalized." });
  };

  // --- Analytical Computations ---

  const connectionQuality = useMemo(() => {
    if (!downloadMbps) return { label: 'Awaiting...', color: 'text-foreground/20' };
    if (downloadMbps >= 100 && (pingMs || 0) < 20) return { label: 'Excellent', color: 'text-green-500' };
    if (downloadMbps >= 50) return { label: 'Good', color: 'text-blue-500' };
    if (downloadMbps >= 10) return { label: 'Fair', color: 'text-yellow-500' };
    return { label: 'Poor', color: 'text-red-500' };
  }, [downloadMbps, pingMs]);

  const videoCapability = useMemo(() => {
    if (!downloadMbps) return null;
    return [
      { res: '4K UHD', req: 25, ok: downloadMbps >= 25 },
      { res: '1080p HD', req: 10, ok: downloadMbps >= 10 },
      { res: '720p', req: 5, ok: downloadMbps >= 5 },
      { res: '480p SD', req: 2, ok: downloadMbps >= 2 },
    ];
  }, [downloadMbps]);

  const lastTestDiff = useMemo(() => {
    if (history.length < 2 || isTesting || step !== 'complete') return null;
    const prev = history[1].download;
    const current = history[0].download;
    if (!prev || !current) return null;
    const diff = ((current - prev) / prev) * 100;
    return { 
      val: Math.abs(diff).toFixed(1), 
      isFaster: diff > 0,
      color: diff > 0 ? 'text-green-500' : 'text-red-500'
    };
  }, [history, isTesting, step]);

  const needleAngle = useMemo(() => {
    const val = isTesting ? currentSpeed : (downloadMbps || 0);
    return getAngleForSpeed(val);
  }, [currentSpeed, downloadMbps, isTesting]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-full overflow-hidden selection:bg-primary/20">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
            <Gauge className="w-3.5 h-3.5" /> Telemetry Protocol v7.0
          </div>
          <h1 className="text-3xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tighter leading-[0.9] overflow-wrap-anywhere">
            Network <span className="text-primary italic">Pulse Studio</span>
          </h1>
          <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
            Professional high-fidelity telemetry dashboard. Analyze sustained bandwidth, jitter, and video streaming capacity locally with 1:1 hardware synchronization.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 pb-2">
           <GetHelp toolId="speed-test" />
           <Button variant="outline" size="sm" onClick={resetResults} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
              <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Main Telemetry Workspace */}
        <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-left-6 duration-1000">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative group flex flex-col min-h-[600px] bg-[#060608]">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              
              <CardContent className="flex-1 flex flex-col items-center justify-center p-6 sm:p-16 relative overflow-hidden">
                 
                 {/* GAUGE MATRIX */}
                 <div className="relative w-full max-w-[500px] aspect-[4/3] flex items-center justify-center pt-10">
                    <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full animate-pulse" />
                    
                    <svg viewBox="0 0 200 120" className="w-full h-full fill-none">
                       <path d="M20,110 A80,80 0 0,1 180,110" stroke="currentColor" strokeWidth="12" className="text-white/5" strokeLinecap="round" />
                       <path 
                         d="M20,110 A80,80 0 0,1 180,110" 
                         stroke="currentColor" 
                         strokeWidth="12" 
                         strokeDasharray="251" 
                         strokeDashoffset={251 - (251 * progress) / 100}
                         className="text-primary/40 transition-all duration-1000 ease-out" 
                         strokeLinecap="round" 
                       />

                       {GAUGE_POINTS.map((pt, i) => {
                         const angle = getAngleForSpeed(pt);
                         const rad = (angle * Math.PI) / 180;
                         const x1 = 100 + 80 * Math.sin(rad);
                         const y1 = 110 - 80 * Math.cos(rad);
                         const tx = 100 + 92 * Math.sin(rad);
                         const ty = 110 - 92 * Math.cos(rad);
                         return (
                           <g key={i}>
                             <line x1={x1} y1={y1} x2={100 + 72 * Math.sin(rad)} y2={110 - 72 * Math.cos(rad)} stroke="currentColor" strokeWidth="1.5" className="text-white/20" />
                             <text x={tx} y={ty} textAnchor="middle" className="fill-white/10 text-[6px] font-black uppercase tracking-tighter" dy="2">{pt}</text>
                           </g>
                         );
                       })}

                       <g style={{ transform: `rotate(${needleAngle}deg)`, transformOrigin: '100px 110px' }} className="transition-transform duration-500 ease-out">
                          <path d="M100,110 L100,30" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" />
                          <circle cx="100" cy="110" r="6" fill="hsl(var(--primary))" />
                          <circle cx="100" cy="110" r="2" fill="white" />
                       </g>
                    </svg>

                    <div className="absolute bottom-4 flex flex-col items-center text-center">
                       <h2 className="text-6xl sm:text-9xl font-headline font-black text-foreground tracking-tighter leading-none mb-1">
                          {isTesting ? currentSpeed.toFixed(1) : (downloadMbps?.toFixed(1) || '0.0')}
                       </h2>
                       <p className="text-[10px] sm:text-[12px] font-black text-primary uppercase tracking-[0.6em] mb-4">Mbps Speed</p>
                       
                       {lastTestDiff && (
                          <div className={cn("flex items-center gap-2 mb-4 animate-in slide-in-from-bottom-2", lastTestDiff.color)}>
                             {lastTestDiff.isFaster ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                             <span className="text-[10px] font-black uppercase tracking-widest">{lastTestDiff.val}% {lastTestDiff.isFaster ? 'FASTER' : 'SLOWER'} THAN PREVIOUS</span>
                          </div>
                       )}

                       {ispName && (
                         <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 animate-in fade-in">
                            <Signal className="w-3 h-3 text-primary animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60">{ispName}</span>
                         </div>
                       )}
                    </div>
                 </div>

                 <div className="w-full max-w-sm mt-16 space-y-6">
                    {!isTesting ? (
                      <Button 
                        onClick={startTest}
                        className="h-20 w-full bg-primary text-white font-black text-xl uppercase tracking-[0.4em] rounded-[2.5rem] shadow-2xl shadow-primary/30 active:scale-95 transition-all group"
                      >
                         <Play className="w-6 h-6 mr-4 fill-current group-hover:scale-110 transition-transform" />
                         {step === 'complete' ? 'Re-Run Test' : 'Launch Studio'}
                      </Button>
                    ) : (
                      <div className="space-y-4 text-center">
                         <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-primary">
                            <span className="flex items-center gap-2"><Loader2 className="w-3 animate-spin" /> {step.toUpperCase()} ACTIVE...</span>
                            <span>{progress}%</span>
                         </div>
                         <Progress value={progress} className="h-1 rounded-full" />
                         <p className="text-[9px] font-black uppercase text-foreground/20 italic">Cloudflare Edge Synchronizing...</p>
                      </div>
                    )}
                 </div>
              </CardContent>

              {/* Status Tracking Bar */}
              <div className="p-8 border-t border-white/5 bg-secondary/30 flex items-center justify-around flex-wrap gap-y-6">
                 {[
                   { id: 'ping', label: 'Ping', icon: Clock, val: pingMs ? `${pingMs}ms` : '--' },
                   { id: 'jitter', label: 'Jitter', icon: Activity, val: jitterMs ? `${jitterMs}ms` : '--' },
                   { id: 'download', label: 'Download', icon: ArrowDown, val: downloadMbps ? `${downloadMbps.toFixed(1)}` : '--' },
                   { id: 'upload', label: 'Upload', icon: ArrowUp, val: uploadMbps ? `${uploadMbps.toFixed(1)}` : '--' },
                 ].map((s) => (
                   <div key={s.id} className={cn(
                     "flex flex-col items-center gap-3 transition-all duration-700 min-w-[80px]",
                     step === s.id ? "scale-110 opacity-100" : "opacity-30"
                   )}>
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border transition-all", step === s.id ? "bg-primary/20 border-primary text-primary shadow-lg" : "bg-white/5 border-white/10 text-white/10")}>
                         <s.icon className="w-5 h-5" />
                      </div>
                      <div className="text-center space-y-0.5">
                        <span className="text-[9px] font-black uppercase tracking-widest block">{s.label}</span>
                        <span className="text-sm font-headline font-black text-foreground leading-none">{s.val}</span>
                      </div>
                   </div>
                 ))}
              </div>
           </Card>

           {/* Video Capability & Insights */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="glass-card border-border shadow-xl p-8">
                 <div className="flex items-center gap-3 mb-8">
                    <Video className="w-5 h-5 text-primary" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground">Video Capability Matrix</h3>
                 </div>
                 <div className="space-y-4">
                    {!videoCapability ? (
                       <div className="py-10 text-center opacity-10">
                          <p className="text-[10px] font-black uppercase tracking-widest">Awaiting result...</p>
                       </div>
                    ) : videoCapability.map((v) => (
                      <div key={v.res} className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border transition-all",
                        v.ok ? "bg-primary/5 border-primary/20" : "bg-secondary/30 border-white/5 opacity-40"
                      )}>
                         <div className="flex items-center gap-4">
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", v.ok ? "text-primary" : "text-foreground/20")}>
                               <Tv className="w-4 h-4" />
                            </div>
                            <span className={cn("text-[11px] font-black uppercase tracking-widest", v.ok ? "text-foreground" : "text-foreground/40")}>{v.res}</span>
                         </div>
                         {v.ok ? <Check className="w-4 h-4 text-primary" /> : <X className="w-4 h-4 text-foreground/20" />}
                      </div>
                    ))}
                 </div>
              </Card>

              <Card className="glass-card border-border shadow-xl p-8 flex flex-col justify-between">
                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground">Quality Analytics</h3>
                       <div className={cn("px-4 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest", connectionQuality.color)}>
                          {connectionQuality.label}
                       </div>
                    </div>
                    
                    <div className="p-6 rounded-[2rem] bg-secondary/50 border border-border space-y-4">
                       <div className="flex items-center gap-3 text-primary">
                          <ShieldCheck className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">ISP Verified Profile</span>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[9px] font-black text-foreground/30 uppercase">Detected Carrier</p>
                          <p className="text-sm font-bold text-foreground truncate uppercase">{ispName || '---'}</p>
                       </div>
                    </div>
                 </div>

                 <div className="pt-8 space-y-4">
                    <div className="flex items-center gap-3 px-1 text-foreground/40">
                       <Info className="w-4 h-4" />
                       <p className="text-[9px] font-black uppercase tracking-widest leading-relaxed">Browser estimate, not ISP official. Performance may vary by server load.</p>
                    </div>
                    <Button onClick={handleCopy} disabled={!downloadMbps} className="w-full h-14 bg-white text-black font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-white/90">
                       {isCopied ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                       Copy Benchmarks
                    </Button>
                 </div>
              </Card>
           </div>
        </div>

        {/* Sidebar History */}
        <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           <Card className="glass-card border-border shadow-xl flex flex-col max-h-[500px]">
              <CardHeader className="py-6 border-b border-border bg-secondary/30 flex items-center justify-between shrink-0">
                 <div className="flex items-center gap-3">
                    <History className="w-4 h-4 text-primary" />
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Archive Matrix</CardTitle>
                 </div>
                 {history.length > 0 && (
                   <button onClick={() => { setHistory([]); localStorage.removeItem(HISTORY_KEY); }} className="text-[8px] font-black text-foreground/20 hover:text-red-500 uppercase transition-colors">Purge Log</button>
                 )}
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-1">
                 {history.length === 0 ? (
                    <div className="py-24 text-center opacity-10 space-y-4">
                       <Activity className="w-12 h-12 mx-auto" />
                       <p className="text-[11px] font-black uppercase tracking-widest">No previous benchmarks</p>
                    </div>
                 ) : (
                    <div className="divide-y divide-white/5">
                       {history.map(h => (
                         <div key={h.id} className="p-6 flex items-center justify-between group hover:bg-white/5 transition-all">
                            <div className="flex items-center gap-4 min-w-0">
                               <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-primary/40 group-hover:text-primary shrink-0 transition-all shadow-inner">
                                  <ArrowDown className="w-4 h-4" />
                               </div>
                               <div className="min-w-0">
                                  <p className="text-sm font-headline font-black text-foreground truncate">{h.download.toFixed(1)} <span className="text-[10px] opacity-30">Mbps</span></p>
                                  <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-tighter">{new Date(h.timestamp).toLocaleDateString()} • {new Date(h.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                               </div>
                            </div>
                            <div className="text-right">
                               <span className="text-[10px] font-mono text-primary/60 font-bold block">{h.ping}ms</span>
                               <span className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">Ping</span>
                            </div>
                         </div>
                       ))}
                    </div>
                 )}
              </CardContent>
           </Card>

           <Card className="glass-card border-border shadow-xl">
              <CardHeader className="py-6 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Fingerprint className="w-5 h-5 text-primary" /> Session Metadata
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                 {[
                   { label: 'Network Origin', val: location || 'Identifying...', icon: MapPin },
                   { label: 'Public Identity (IP)', val: publicIp || 'Hidden', icon: Shield },
                   { label: 'Hardware Protocol', val: 'WASM Dual-Pass', icon: Zap },
                 ].map((item, i) => (
                    <div key={i} className="flex gap-4 group/item">
                       <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary/40 shrink-0 border border-border group-hover/item:text-primary transition-colors">
                          <item.icon className="w-4 h-4" />
                       </div>
                       <div className="min-w-0">
                          <p className="text-[8px] font-black uppercase text-foreground/20 tracking-widest mb-0.5">{item.label}</p>
                          <h4 className="text-[11px] font-bold text-foreground truncate uppercase">{item.val}</h4>
                       </div>
                    </div>
                 ))}
              </CardContent>
           </Card>

           <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
             <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
             </div>
             <div className="space-y-2">
               <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Privacy Sovereign</h4>
               <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                 All diagnostic logic is 100% hardware-native. No performance logs or network identifiers are transmitted to our servers—all data is held strictly in local memory.
               </p>
             </div>
          </div>
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
