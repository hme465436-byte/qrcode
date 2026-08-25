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
  Globe,
  Loader2,
  CheckCircle2,
  History,
  Info,
  Clock,
  Search,
  Plus,
  Trash2,
  X,
  TrendingDown,
  Table as TableIcon,
  ChevronRight,
  MonitorPlay,
  Banknote,
  Server,
  LineChart as LineChartIcon,
  Maximize2,
  Radio,
  Cpu,
  Signal,
  AlertCircle,
  TrendingUp,
  Monitor,
  Smartphone,
  Tv,
  Check,
  Copy,
  Fingerprint,
  Shield,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

// --- Production Telemetry Config ---
const CLOUDFLARE_BASE = 'https://speed.cloudflare.com';
const IP_API = 'https://ipapi.co/json/';
const HISTORY_KEY = 'mykit_speed_history_v9';

type TestStep = 'idle' | 'ping' | 'download' | 'upload' | 'complete' | 'blocked' | 'error';

interface SpeedResult {
  id: string;
  timestamp: number;
  download: number | null;
  upload: number | null;
  ping: number | null;
  jitter: number | null;
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
  
  // Results
  const [downloadMbps, setDownloadMbps] = useState<number | null>(null);
  const [uploadMbps, setUploadMbps] = useState<number | null>(null);
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [jitterMs, setJitterMs] = useState<number | null>(null);
  
  // Metadata
  const [ispName, setIspName] = useState<string>('');
  const [publicIp, setPublicIp] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [browserInfo, setBrowserInfo] = useState<string>('');
  
  // UI State
  const [isTesting, setIsTesting] = useState(false);
  const [step, setStep] = useState<TestStep>('idle');
  const [progress, setProgress] = useState(0);
  const [history, setHistory] = useState<SpeedResult[]>([]);
  const [isCopied, setIsCopied] = useState(false);

  // --- Identity Detection ---
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) try { setHistory(JSON.parse(saved)); } catch (e) {}

    const ua = navigator.userAgent;
    const browser = ua.includes("Chrome") ? "Chrome" : ua.includes("Firefox") ? "Firefox" : ua.includes("Safari") ? "Safari" : "Browser";
    setBrowserInfo(browser);

    fetch(IP_API)
      .then(r => r.json())
      .then(data => {
        setIspName(data.org || 'Unknown ISP');
        setPublicIp(data.ip || 'Hidden');
        setLocation(`${data.city || 'Matrix Node'}, ${data.country_code || 'Global'}`);
      })
      .catch(() => {
        setIspName('Lookup Restricted');
        setPublicIp('Hidden');
        setLocation('Global Node');
      });
  }, []);

  // --- Telemetry Engines ---

  const calculateMbps = (bytes: number, seconds: number) => {
    return (bytes * 8) / (seconds * 1000000);
  };

  const runTimedFetch = async (url: string, options: RequestInit = {}, timeoutMs = 15000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);
      return response;
    } catch (e) {
      clearTimeout(id);
      throw e;
    }
  };

  const runPingProtocol = async () => {
    setStep('ping');
    const samples: number[] = [];
    for (let i = 0; i < 4; i++) {
      const start = performance.now();
      try {
        await runTimedFetch(`${CLOUDFLARE_BASE}/favicon.ico?t=${Date.now()}`, { mode: 'no-cors', cache: 'no-cache' }, 5000);
        samples.push(performance.now() - start);
      } catch (e) {}
      setProgress(5 + (i * 5));
    }
    
    if (samples.length === 0) return { ping: null, jitter: null };
    
    samples.sort((a, b) => a - b);
    const median = samples[Math.floor(samples.length / 2)];
    let jitter = 0;
    if (samples.length > 1) {
      for (let i = 1; i < samples.length; i++) jitter += Math.abs(samples[i] - samples[i - 1]);
      jitter /= (samples.length - 1);
    }

    return { ping: Math.round(median), jitter: Math.round(jitter) };
  };

  const runDownloadPass = async (bytes: number): Promise<number | null> => {
    const start = performance.now();
    try {
      const response = await runTimedFetch(`${CLOUDFLARE_BASE}/__down?bytes=${bytes}&t=${Date.now()}`, { cache: 'no-cache' });
      if (!response.ok) return null;
      await response.blob();
      const duration = (performance.now() - start) / 1000;
      return calculateMbps(bytes, duration);
    } catch (e) {
      return null;
    }
  };

  const runUploadPass = async (bytes: number): Promise<number | null> => {
    const data = new Uint8Array(bytes);
    // Fill in safe chunks
    for (let i = 0; i < bytes; i += 65536) {
      const end = Math.min(i + 65536, bytes);
      window.crypto.getRandomValues(data.subarray(i, end));
    }

    const start = performance.now();
    try {
      const response = await runTimedFetch(`${CLOUDFLARE_BASE}/__up`, {
        method: 'POST',
        body: data,
        cache: 'no-cache'
      });
      if (!response.ok) return null;
      const duration = (performance.now() - start) / 1000;
      return calculateMbps(bytes, duration);
    } catch (e) {
      return null;
    }
  };

  const startTest = async () => {
    if (isTesting) return;
    setIsTesting(true);
    setStep('ping');
    setProgress(5);
    setDownloadMbps(null);
    setUploadMbps(null);
    setPingMs(null);
    setJitterMs(null);

    try {
      // 1. PING Protocol
      const p = await runPingProtocol();
      setPingMs(p.ping);
      setJitterMs(p.jitter);
      if (p.ping === null) {
        setStep('blocked');
        setIsTesting(false);
        return;
      }

      // 2. DOWNLOAD - Dynamic Multi-Pass
      setStep('download');
      // Discovery Pass (Small)
      const discoverDown = await runDownloadPass(2500000); // 2.5MB
      setProgress(40);
      
      let finalDownSize = 10000000; // Default 10MB
      if (discoverDown && discoverDown > 50) finalDownSize = 25000000; // 25MB for fast connections
      if (discoverDown && discoverDown > 150) finalDownSize = 50000000; // 50MB for very fast
      
      const mainDown = await runDownloadPass(finalDownSize);
      const finalDown = mainDown || discoverDown;
      setDownloadMbps(finalDown);
      setProgress(70);

      // 3. UPLOAD - Dynamic Multi-Pass
      setStep('upload');
      // Discovery Pass (Small)
      const discoverUp = await runUploadPass(1000000); // 1MB
      setProgress(85);
      
      let finalUpSize = 2500000; // Default 2.5MB
      if (discoverUp && discoverUp > 20) finalUpSize = 10000000; // 10MB
      
      const mainUp = await runUploadPass(finalUpSize);
      const finalUp = mainUp || discoverUp;
      setUploadMbps(finalUp);

      // Finalize
      setProgress(100);
      setStep('complete');

      // History Save
      const res: SpeedResult = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        download: finalDown,
        upload: finalUp,
        ping: p.ping,
        jitter: p.jitter,
        location,
        isp: ispName
      };

      setHistory(prev => {
        const next = [res, ...prev].slice(0, 10);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
        return next;
      });

      toast({ title: "Analysis Complete", description: "Network matrix calibrated." });
    } catch (err) {
      setStep('error');
      toast({ variant: "destructive", title: "Protocol Aborted", description: "Hardware signal lost or restricted." });
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopy = () => {
    const text = [
      `[MY KIT TOOL - NETWORK TELEMETRY]`,
      `Download: ${downloadMbps?.toFixed(1) || '0.0'} Mbps`,
      `Upload: ${uploadMbps?.toFixed(1) || '0.0'} Mbps`,
      `Ping: ${pingMs || '0'} ms`,
      `Jitter: ${jitterMs || '0'} ms`,
      `ISP: ${ispName}`,
      `IP: ${publicIp}`,
      `Node: ${location}`,
      `Timestamp: ${new Date().toLocaleString()}`
    ].join('\n');
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast({ title: "Identity Copied" });
  };

  const qualityRating = useMemo(() => {
    if (!downloadMbps) return null;
    if (downloadMbps > 100) return { label: 'Excellent', color: 'text-green-500', bg: 'bg-green-500/10' };
    if (downloadMbps > 25) return { label: 'Good', color: 'text-blue-500', bg: 'bg-blue-500/10' };
    if (downloadMbps > 5) return { label: 'Fair', color: 'text-orange-500', bg: 'bg-orange-500/10' };
    return { label: 'Poor', color: 'text-red-500', bg: 'bg-red-500/10' };
  }, [downloadMbps]);

  const diffFromLast = useMemo(() => {
    if (history.length < 2 || step !== 'complete' || !downloadMbps) return null;
    const last = history[1].download;
    if (!last) return null;
    const diff = ((downloadMbps - last) / last) * 100;
    return { val: Math.abs(diff).toFixed(1), faster: diff > 0 };
  }, [history, step, downloadMbps]);

  const [chartData, setChartData] = useState<{time: string, val: number}[]>([]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-full bg-[#0a0a0c] min-h-screen overflow-x-hidden">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
            <Gauge className="w-3.5 h-3.5" /> Telemetry Protocol
          </div>
          <h1 className="text-3xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tighter leading-[0.9] overflow-wrap-anywhere">
            Network <span className="text-primary italic">Pulse Studio</span>
          </h1>
          <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
            Professional high-fidelity telemetry derived from Cloudflare Edge nodes. Execute clinical diagnostics for download, upload, and hardware latency.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 pb-2">
           <GetHelp toolId="speed-test" />
           <Button variant="outline" size="sm" onClick={() => window.location.reload()} disabled={isTesting} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-primary transition-all">
              <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset Matrix
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Main Dashboard */}
        <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-left-6 duration-1000">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative group flex flex-col min-h-[600px] bg-[#060608]">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              
              <CardContent className="flex-1 flex flex-col items-center justify-center p-6 sm:p-16 relative overflow-hidden">
                 <div className="relative w-full max-w-[500px] aspect-[4/3] flex items-center justify-center pt-10">
                    <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full animate-pulse" />
                    
                    {/* Gauge SVG */}
                    <svg viewBox="0 0 200 120" className="w-full h-full fill-none relative z-10">
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
                         const tx = 100 + 92 * Math.sin(rad);
                         const ty = 110 - 92 * Math.cos(rad);
                         return (
                           <text key={i} x={tx} y={ty} textAnchor="middle" className="fill-white/10 text-[6px] font-black uppercase tracking-tighter" dy="2">{pt}</text>
                         );
                       })}
                       <g style={{ transform: `rotate(${getAngleForSpeed(downloadMbps)}deg)`, transformOrigin: '100px 110px' }} className="transition-transform duration-700 ease-out">
                          <path d="M100,110 L100,30" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" />
                          <circle cx="100" cy="110" r="6" fill="hsl(var(--primary))" />
                          <circle cx="100" cy="110" r="2" fill="white" />
                       </g>
                    </svg>

                    <div className="absolute bottom-4 flex flex-col items-center text-center z-20">
                       <h2 className="text-6xl sm:text-9xl font-headline font-black text-foreground tracking-tighter leading-none mb-1">
                          {downloadMbps?.toFixed(1) || '0.0'}
                       </h2>
                       <p className="text-[10px] sm:text-[12px] font-black text-primary uppercase tracking-[0.6em] mb-4">Sustained Mbps</p>
                       
                       {diffFromLast && (
                          <div className={cn("flex items-center gap-2 mb-4 animate-in slide-in-from-bottom-2", diffFromLast.faster ? 'text-green-500' : 'text-red-500')}>
                             {diffFromLast.faster ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                             <span className="text-[10px] font-black uppercase tracking-widest">{diffFromLast.val}% {diffFromLast.faster ? 'FASTER' : 'SLOWER'}</span>
                          </div>
                       )}

                       {ispName && (
                         <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 animate-in fade-in">
                            <Signal className="w-3 h-3 text-primary animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60 truncate max-w-[150px]">{ispName}</span>
                         </div>
                       )}
                    </div>
                 </div>

                 <div className="w-full max-w-sm mt-16 space-y-6 z-20 text-center flex justify-center">
                    {step === 'blocked' || step === 'error' ? (
                       <div className="p-8 rounded-[2rem] bg-red-500/10 border border-red-500/20 text-center space-y-4 w-full">
                          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
                          <div className="space-y-1">
                             <h4 className="text-sm font-black uppercase text-red-600">Protocol Aborted</h4>
                             <p className="text-[10px] text-red-600/60 font-bold uppercase leading-relaxed px-4">Cloudflare handshake failed or network timed out.</p>
                          </div>
                          <Button onClick={startTest} variant="outline" className="h-10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white uppercase text-[9px] font-black rounded-xl">Initialize Restart</Button>
                       </div>
                    ) : !isTesting ? (
                      <Button 
                        onClick={startTest}
                        className="h-11 w-full max-w-[200px] bg-primary text-white font-black text-xs uppercase tracking-[0.4em] rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all group"
                      >
                         <Play className="w-5 h-5 mr-3 fill-current group-hover:scale-110 transition-transform" />
                         {step === 'complete' ? 'Re-Run' : 'Test'}
                      </Button>
                    ) : (
                      <div className="space-y-4 text-center w-full">
                         <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-primary">
                            <span className="flex items-center gap-2"><Loader2 className="w-3 animate-spin" /> {step.toUpperCase()} PHASE ACTIVE...</span>
                            <span>{progress}%</span>
                         </div>
                         <Progress value={progress} className="h-1 rounded-full" />
                         <p className="text-[9px] font-black uppercase text-foreground/20 italic">Cloudflare Edge Node Calibration...</p>
                      </div>
                    )}
                 </div>
              </CardContent>

              {/* Metrics Row */}
              <div className="p-8 border-t border-white/5 bg-secondary/30 grid grid-cols-2 md:grid-cols-4 gap-6">
                 {[
                   { id: 'ping', label: 'Ping', icon: Clock, val: pingMs ? `${pingMs}ms` : '—', color: 'text-blue-400', bg: 'bg-blue-400/5', border: 'border-blue-400/10' },
                   { id: 'jitter', label: 'Jitter', icon: Activity, val: jitterMs ? `${jitterMs}ms` : '—', color: 'text-orange-400', bg: 'bg-orange-400/5', border: 'border-orange-400/10' },
                   { id: 'download', label: 'Download', icon: ArrowDown, val: downloadMbps ? downloadMbps.toFixed(1) : '—', color: 'text-green-400', bg: 'bg-green-400/5', border: 'border-green-400/10' },
                   { id: 'upload', label: 'Upload', icon: ArrowUp, val: uploadMbps ? uploadMbps.toFixed(1) : '—', color: 'text-purple-400', bg: 'bg-purple-400/5', border: 'border-purple-400/10' },
                 ].map((s) => (
                   <div key={s.id} className={cn(
                     "flex flex-col items-center gap-4 p-6 rounded-[2.5rem] transition-all duration-700 border",
                     (step === s.id || step === 'complete') ? `${s.bg} ${s.border} opacity-100 shadow-xl` : "opacity-30 border-transparent grayscale"
                   )}>
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5 transition-all shadow-inner", s.color, s.bg)}>
                         <s.icon className="w-6 h-6" />
                      </div>
                      <div className="text-center space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/30 block leading-none">{s.label}</span>
                        <span className="text-xl sm:text-2xl font-headline font-black text-foreground leading-none block">{s.val}</span>
                      </div>
                   </div>
                 ))}
              </div>
           </Card>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="glass-card border-border shadow-xl p-8">
                 <div className="flex items-center gap-3 mb-8">
                    <Tv className="w-5 h-5 text-primary" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground/60">Video Fidelity Matrix</h3>
                 </div>
                 <div className="space-y-4">
                    {downloadMbps === null ? (
                       <div className="py-10 text-center opacity-10">
                          <p className="text-[10px] font-black uppercase tracking-widest">Awaiting result...</p>
                       </div>
                    ) : [
                      { res: '4K Ultra HD', req: 25 },
                      { res: '1080p HD', req: 10 },
                      { res: '720p', req: 5 },
                      { res: '480p SD', req: 2 },
                    ].map((v) => {
                      const isOk = downloadMbps >= v.req;
                      return (
                        <div key={v.res} className={cn(
                          "flex items-center justify-between p-4 rounded-2xl border transition-all",
                          isOk ? "bg-primary/5 border-primary/20" : "bg-secondary/30 border-white/5 opacity-40"
                        )}>
                           <div className="flex items-center gap-4">
                              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", isOk ? "text-primary" : "text-foreground/20")}>
                                 <Monitor className="w-4 h-4" />
                              </div>
                              <span className={cn("text-[11px] font-black uppercase tracking-widest", isOk ? "text-foreground" : "text-foreground/40")}>{v.res}</span>
                           </div>
                           {isOk ? <Check className="w-4 h-4 text-primary" /> : <X className="w-4 h-4 text-foreground/20" />}
                        </div>
                      );
                    })}
                 </div>
              </Card>

              <Card className="glass-card border-border shadow-xl p-8 flex flex-col justify-between">
                 <div className="space-y-6">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground/60">Quality Profiling</h3>
                    {!qualityRating ? (
                       <div className="py-20 text-center opacity-10">
                          <div className="w-16 h-16 rounded-[2.5rem] bg-secondary border border-border flex items-center justify-center mx-auto mb-4">
                             <CheckCircle2 className="w-8 h-8" />
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-widest">Pending results</p>
                       </div>
                    ) : (
                       <div className={cn("p-10 rounded-[3rem] border flex flex-col items-center gap-6 text-center animate-in zoom-in", qualityRating.bg, qualityRating.color.replace('text-', 'border-').replace('500', '20'))}>
                          <div className={cn("w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-xl border border-white/10", qualityRating.bg)}>
                             <CheckCircle2 className="w-8 h-8" />
                          </div>
                          <div className="space-y-1">
                             <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40">Line Profile</p>
                             <h4 className="text-3xl font-headline font-black uppercase">{qualityRating.label}</h4>
                          </div>
                       </div>
                    )}
                 </div>

                 <div className="pt-8">
                    <Button onClick={handleCopy} disabled={!downloadMbps} className="w-full h-14 bg-white text-black font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-white/90">
                       {isCopied ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                       Copy Report
                    </Button>
                 </div>
              </Card>
           </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2 min-w-0">
           <Card className="glass-card border-border shadow-xl flex flex-col max-h-[500px]">
              <CardHeader className="py-6 border-b border-border bg-secondary/30 flex items-center justify-between shrink-0">
                 <div className="flex items-center gap-3">
                    <History className="w-4 h-4 text-primary" />
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">Archive Matrix</CardTitle>
                 </div>
                 {history.length > 0 && (
                   <button onClick={() => { setHistory([]); localStorage.removeItem(HISTORY_KEY); }} className="text-[8px] font-black text-foreground/20 hover:text-red-500 uppercase transition-colors">Purge</button>
                 )}
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-1">
                 {history.length === 0 ? (
                    <div className="py-24 text-center opacity-10 space-y-4">
                       <Activity className="w-12 h-12 mx-auto" />
                       <p className="text-[10px] font-black uppercase tracking-widest">Zero Matrix Logs</p>
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
                                  <p className="text-sm font-headline font-black text-foreground truncate">{h.download?.toFixed(1) || '0.0'} <span className="text-[10px] opacity-30 uppercase">Mbps</span></p>
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
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground/60">
                    <Fingerprint className="w-5 h-5 text-primary" /> Hardware Identity
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                 {[
                   { label: 'Carrier Node', val: ispName || 'Identifying...', icon: Server },
                   { label: 'Public Identity (IP)', val: publicIp || 'Hidden', icon: Shield },
                   { label: 'Studio Engine', val: browserInfo || 'WASM Matrix', icon: Zap },
                   { label: 'Network Origin', val: location || 'Global Node', icon: MapPin },
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
               <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Protocol Fidelity</h4>
               <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                 Telemetry logic utilizes direct memory-to-memory bitstream copy. No server-side simulated results or artificial multipliers are applied.
               </p>
             </div>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .recharts-area-chart { filter: drop-shadow(0 0 10px hsla(var(--primary), 0.2)); }
        .recharts-cartesian-axis-tick-value { font-family: 'Space Grotesk', sans-serif !important; }
        .overflow-wrap-normal { overflow-wrap: normal !important; word-break: normal !important; }
      `}</style>
    </div>
  );
}
