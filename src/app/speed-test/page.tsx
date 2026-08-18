
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
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip } from 'recharts';

// --- Production Telemetry Config ---
const PING_URL = 'https://www.google.com/favicon.ico';
const DOWNLOAD_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs'; 
const UPLOAD_URL = 'https://httpbin.org/post';
const UPLOAD_SIZE_KB = 128;
const PASS_TARGET_MB = 15; 
const WARMUP_TIME_MS = 2000; 
const HISTORY_KEY = 'mykit_speed_history_v5';

type TestStep = 'idle' | 'ping' | 'download' | 'upload' | 'complete';

interface SpeedResult {
  id: string;
  timestamp: number;
  download: number;
  upload: number | null;
  ping: number;
  location: string;
}

// --- Gauge Logic ---
const GAUGE_POINTS = [0, 5, 10, 50, 100, 250, 500, 750, 1000];

const getAngleForSpeed = (mbps: number | null) => {
  if (mbps === null || mbps <= 0) return -90;
  
  // Mapping non-linear scale to -90 to 90 degrees (180 deg total)
  const points = GAUGE_POINTS;
  const stepSize = 180 / (points.length - 1);
  
  for (let i = 0; i < points.length - 1; i++) {
    if (mbps <= points[i + 1]) {
      const segmentProgress = (mbps - points[i]) / (points[i + 1] - points[i]);
      return -90 + (i * stepSize) + (segmentProgress * stepSize);
    }
  }
  return 90; // Maxed out
};

export default function SpeedTestPage() {
  const { toast } = useToast();
  
  // Results State
  const [downloadMbps, setDownloadMbps] = useState<number | null>(null);
  const [uploadMbps, setUploadMbps] = useState<number | null>(null);
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [location, setLocation] = useState<string>('');
  const [ispName, setIspName] = useState<string>('');
  const [publicIp, setPublicIp] = useState<string>('');
  
  // Runtime State
  const [isTesting, setIsTesting] = useState(false);
  const [step, setStep] = useState<TestStep>('idle');
  const [progress, setProgress] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [graphData, setGraphData] = useState<{ time: number; speed: number }[]>([]);
  const [history, setHistory] = useState<SpeedResult[]>([]);
  const [isCopied, setIsCopied] = useState(false);

  const testTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Metadata & History
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
    setProgress(0);
    setCurrentSpeed(0);
    setStep('idle');
    setGraphData([]);
    if (testTimeoutRef.current) clearTimeout(testTimeoutRef.current);
  };

  const handleCopy = () => {
    const text = [
      `[MY KIT TOOL - SPEED TEST]`,
      `Download: ${downloadMbps?.toFixed(1) || '--'} Mbps`,
      `Upload: ${uploadMbps?.toFixed(1) || '--'} Mbps`,
      `Ping: ${pingMs || '--'} ms`,
      `ISP: ${ispName || 'Unknown'}`,
      `IP: ${publicIp || 'Hidden'}`,
      `Node: ${location || 'Global'}`,
      `Timestamp: ${new Date().toLocaleString()}`,
      `Link: ${window.location.href}`
    ].join('\n');

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast({ title: "Matrix Copied", description: "Telemetry saved to clipboard." });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const runPing = async (): Promise<number> => {
    setStep('ping');
    const start = performance.now();
    try {
      await fetch(`${PING_URL}?t=${Date.now()}`, { mode: 'no-cors', cache: 'no-cache' });
      return Math.round(performance.now() - start);
    } catch (e) {
      return 25; 
    }
  };

  const runDownloadPass = async (passNum: number): Promise<number> => {
    setStep('download');
    const targetBytes = PASS_TARGET_MB * 1024 * 1024;
    let loaded = 0;
    let passStartTime = performance.now();
    let measureStartTime = 0;
    let bytesAtMeasureStart = 0;

    try {
      while (loaded < targetBytes && (performance.now() - passStartTime) < 7000) {
        const response = await fetch(`${DOWNLOAD_URL}?t=${Date.now()}_${Math.random()}`, { cache: 'no-cache' });
        if (!response.body) break;
        
        const reader = response.body.getReader();
        let tick = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          loaded += value.length;
          const now = performance.now();
          const elapsed = now - passStartTime;
          
          if (elapsed > WARMUP_TIME_MS && measureStartTime === 0) {
            measureStartTime = now;
            bytesAtMeasureStart = loaded;
          }

          if (measureStartTime > 0) {
            const measureSecs = (now - measureStartTime) / 1000;
            if (measureSecs > 0) {
              const mbps = ((loaded - bytesAtMeasureStart) * 8) / (measureSecs * 1024 * 1024);
              setCurrentSpeed(mbps);
              
              if (tick % 5 === 0) {
                setGraphData(prev => [...prev, { time: prev.length, speed: parseFloat(mbps.toFixed(1)) }].slice(-50));
              }
              tick++;
            }
          }

          const baseProgress = passNum === 1 ? 20 : 50;
          setProgress(baseProgress + Math.min((loaded / targetBytes) * 30, 30));
        }
      }

      const endNow = performance.now();
      if (measureStartTime > 0) {
        const finalSecs = (endNow - measureStartTime) / 1000;
        return ((loaded - bytesAtMeasureStart) * 8) / (finalSecs * 1024 * 1024);
      }
      return 0;
    } catch (e) {
      return 0;
    }
  };

  const runUpload = async (): Promise<number | null> => {
    setStep('upload');
    const size = UPLOAD_SIZE_KB * 1024;
    const data = new Uint8Array(size);
    
    // Chunked entropy generation for WASM safety
    for (let i = 0; i < size; i += 65536) {
      const end = Math.min(i + 65536, size);
      window.crypto.getRandomValues(data.subarray(i, end));
    }

    const start = performance.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      
      const response = await fetch(UPLOAD_URL, { 
        method: 'POST', 
        body: data, 
        cache: 'no-cache',
        signal: controller.signal
      });
      
      clearTimeout(timeout);
      if (!response.ok) return null;

      const elapsed = (performance.now() - start) / 1000;
      return (size * 8) / (elapsed * 1024 * 1024);
    } catch (e) {
      return null;
    }
  };

  const startTest = async () => {
    if (isTesting) return;
    setIsTesting(true);
    resetResults();

    testTimeoutRef.current = setTimeout(() => {
      if (isTesting) {
        setIsTesting(false);
        setStep('complete');
      }
    }, 15000);

    const p = await runPing();
    setPingMs(p);
    setProgress(20);

    const d1 = await runDownloadPass(1);
    const d2 = await runDownloadPass(2);
    const bestD = Math.max(d1, d2);
    setDownloadMbps(bestD > 0 ? bestD : null);
    setProgress(80);

    const u = await runUpload();
    setUploadMbps(u);
    setProgress(100);

    setStep('complete');
    setIsTesting(false);
    if (testTimeoutRef.current) clearTimeout(testTimeoutRef.current);

    const res: SpeedResult = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      download: bestD || 0,
      upload: u,
      ping: p,
      location: location
    };

    setHistory(prev => {
      const next = [res, ...prev].slice(0, 5);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  };

  const formatSpeedText = (val: number | null) => {
    if (val === null) return '0.0';
    if (val < 1) {
      return `${(val * 1024).toFixed(0)} Kbps`;
    }
    return val.toFixed(1);
  };

  const needleAngle = useMemo(() => {
    const val = isTesting ? currentSpeed : (downloadMbps || 0);
    return getAngleForSpeed(val);
  }, [currentSpeed, downloadMbps, isTesting]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-full overflow-hidden">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
            <Gauge className="w-3.5 h-3.5" /> Hardware Suite
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-headline font-black text-foreground uppercase tracking-tight leading-none overflow-wrap-anywhere">
            Speed Test <span className="text-primary italic">Pro Studio</span>
          </h1>
          <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
            Advanced high-fidelity telemetry. Analyze sustained bandwidth and network latency locally with 1:1 hardware synchronization.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 pb-2">
           <GetHelp toolId="speed-test" />
           <Button variant="outline" onClick={resetResults} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
              <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Main Telemetry View */}
        <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-left-6 duration-1000">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative group min-h-[500px] flex flex-col bg-[#060608]">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              
              <CardContent className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden">
                 
                 {/* ANALOG GAUGE MATRIX */}
                 <div className="relative w-full max-w-[420px] aspect-[4/3] flex items-center justify-center pt-10">
                    <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full animate-pulse" />
                    
                    {/* Gauge Background SVG */}
                    <svg viewBox="0 0 200 120" className="w-full h-full fill-none">
                       {/* Scale Arc */}
                       <path 
                         d="M20,110 A80,80 0 0,1 180,110" 
                         stroke="currentColor" 
                         strokeWidth="12" 
                         className="text-white/5" 
                         strokeLinecap="round" 
                       />
                       <path 
                         d="M20,110 A80,80 0 0,1 180,110" 
                         stroke="currentColor" 
                         strokeWidth="12" 
                         strokeDasharray="251" 
                         strokeDashoffset={251 - (251 * progress) / 100}
                         className="text-primary/40 transition-all duration-1000 ease-out" 
                         strokeLinecap="round" 
                       />

                       {/* Tick Marks & Labels */}
                       {GAUGE_POINTS.map((pt, i) => {
                         const angle = getAngleForSpeed(pt);
                         const rad = (angle * Math.PI) / 180;
                         const x1 = 100 + 80 * Math.sin(rad);
                         const y1 = 110 - 80 * Math.cos(rad);
                         const x2 = 100 + 72 * Math.sin(rad);
                         const y2 = 110 - 72 * Math.cos(rad);
                         const tx = 100 + 92 * Math.sin(rad);
                         const ty = 110 - 92 * Math.cos(rad);
                         
                         return (
                           <g key={i}>
                             <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1.5" className="text-white/20" />
                             <text x={tx} y={ty} textAnchor="middle" className="fill-white/10 text-[6px] font-black uppercase tracking-tighter" dy="2">{pt}</text>
                           </g>
                         );
                       })}

                       {/* Needle Group */}
                       <g style={{ transform: `rotate(${needleAngle}deg)`, transformOrigin: '100px 110px' }} className="transition-transform duration-500 ease-out">
                          <path d="M100,110 L100,30" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" />
                          <circle cx="100" cy="110" r="6" fill="hsl(var(--primary))" />
                          <circle cx="100" cy="110" r="2" fill="white" />
                       </g>
                    </svg>

                    {/* Central Value Readout */}
                    <div className="absolute bottom-4 flex flex-col items-center text-center">
                       <h2 className="text-5xl sm:text-7xl font-headline font-black text-foreground tracking-tighter leading-none mb-1">
                          {isTesting ? formatSpeedText(currentSpeed) : formatSpeedText(downloadMbps)}
                       </h2>
                       <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4">Mbps Download</p>
                       
                       {/* Metadata Inlay */}
                       {ispName && (
                         <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 animate-in fade-in">
                            <Zap className="w-3 h-3 text-primary animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-foreground/60">{ispName}</span>
                         </div>
                       )}
                    </div>
                 </div>

                 {/* Control Logic */}
                 <div className="w-full max-w-sm mt-12 space-y-6">
                    {!isTesting ? (
                      <Button 
                        onClick={startTest}
                        className="h-20 w-full bg-primary text-white font-black text-xl uppercase tracking-[0.3em] rounded-[2.5rem] shadow-2xl shadow-primary/30 active:scale-95 transition-all group"
                      >
                         <Play className="w-6 h-6 mr-4 fill-current group-hover:scale-110 transition-transform" />
                         {step === 'complete' ? 'Re-Run Protocol' : 'Start Studio'}
                      </Button>
                    ) : (
                      <div className="space-y-4 text-center">
                         <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-primary">
                            <span className="flex items-center gap-2"><Loader2 className="w-3 animate-spin" /> {step.toUpperCase()} PROTOCOL...</span>
                            <span>{progress}%</span>
                         </div>
                         <Progress value={progress} className="h-1 rounded-full" />
                         <p className="text-[9px] font-black uppercase text-foreground/20 italic">Browser estimate, not ISP official</p>
                      </div>
                    )}
                 </div>
              </CardContent>

              {/* Status Tracking Bar */}
              <div className="p-8 border-t border-white/5 bg-secondary/30 flex items-center justify-around">
                 {[
                   { id: 'ping', label: 'Ping', icon: Clock, val: pingMs ? `${pingMs}ms` : '--' },
                   { id: 'download', label: 'Down', icon: ArrowDown, val: downloadMbps ? `${formatSpeedText(downloadMbps)}` : '--' },
                   { id: 'upload', label: 'Up', icon: ArrowUp, val: uploadMbps ? `${formatSpeedText(uploadMbps)}` : '--' },
                 ].map((s) => (
                   <div key={s.id} className={cn(
                     "flex flex-col items-center gap-3 transition-all duration-700",
                     step === s.id ? "scale-110 opacity-100" : "opacity-30"
                   )}>
                      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center border transition-all", step === s.id ? "bg-primary/20 border-primary text-primary shadow-lg" : "bg-white/5 border-white/10 text-white/10")}>
                         <s.icon className="w-5 h-5" />
                      </div>
                      <div className="text-center space-y-0.5">
                        <span className="text-[8px] font-black uppercase tracking-widest block">{s.label}</span>
                        <span className="text-[10px] font-mono font-bold text-foreground leading-none">{s.val}</span>
                      </div>
                   </div>
                 ))}
              </div>
           </Card>

           {/* Live Visual Graph Section */}
           {graphData.length > 0 && (
              <Card className="glass-card border-border shadow-xl h-48 sm:h-64 p-6 relative overflow-hidden bg-black/40">
                 <div className="absolute top-4 left-6 flex items-center gap-3">
                    <div className={cn("w-1.5 h-1.5 rounded-full", isTesting ? "bg-primary animate-pulse" : "bg-white/10")} />
                    <span className="text-[8px] font-black uppercase text-white/20 tracking-[0.2em]">Bitstream Pulse Matrix</span>
                 </div>
                 <div className="w-full h-full pt-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={graphData}>
                           <Line type="monotone" dataKey="speed" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} isAnimationActive={false} />
                           <YAxis hide domain={[0, 'auto']} />
                           <XAxis hide />
                           <Tooltip 
                            contentStyle={{ backgroundColor: '#0a0a0c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                            labelStyle={{ display: 'none' }}
                            itemStyle={{ color: 'white', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase' }}
                           />
                        </LineChart>
                    </ResponsiveContainer>
                 </div>
              </Card>
           )}
        </div>

        {/* Sidebar Analytics */}
        <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           <Card className="glass-card border-border shadow-xl">
              <CardHeader className="py-6 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Activity className="w-4 h-4 text-primary" /> Network Intel
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                 <div className="grid grid-cols-1 gap-3">
                    {[
                      { label: 'Public IP Matrix', val: publicIp || 'Hidden', icon: Fingerprint },
                      { label: 'Network Node', val: location || 'Searching...', icon: MapPin },
                      { label: 'Carrier Protocol', val: ispName || 'Identifying...', icon: Globe },
                    ].map((info, i) => (
                      <div key={i} className="p-5 rounded-2xl bg-secondary/50 border border-border group hover:border-primary/20 transition-all flex items-center justify-between">
                        <div className="flex items-center gap-4 overflow-hidden">
                           <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all">
                              <info.icon className="w-4 h-4" />
                           </div>
                           <div className="min-w-0">
                              <p className="text-[8px] font-black text-foreground/30 uppercase tracking-widest mb-0.5">{info.label}</p>
                              <h4 className="text-xs font-bold text-foreground truncate uppercase">{info.val}</h4>
                           </div>
                        </div>
                      </div>
                    ))}
                 </div>

                 {downloadMbps && (
                    <div className="pt-4 border-t border-white/5 space-y-3">
                       <Button onClick={handleCopy} variant="outline" className="w-full h-11 rounded-xl border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-widest active:scale-95">
                          {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> : <Copy className="w-3.5 h-3.5 mr-2" />}
                          Copy Full Matrix
                       </Button>
                    </div>
                 )}
              </CardContent>
           </Card>

           {/* History Module */}
           <Card className="glass-card border-border shadow-xl flex flex-col max-h-[400px]">
              <CardHeader className="py-4 border-b border-border bg-secondary/30 flex items-center justify-between shrink-0">
                 <div className="flex items-center gap-3">
                    <History className="w-4 h-4 text-primary" />
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Archive</CardTitle>
                 </div>
                 {history.length > 0 && (
                   <button onClick={() => { setHistory([]); localStorage.removeItem(HISTORY_KEY); }} className="text-[8px] font-black text-foreground/20 hover:text-red-500 uppercase transition-colors">Purge Log</button>
                 )}
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-1">
                 {history.length === 0 ? (
                    <div className="py-20 text-center opacity-10 space-y-4">
                       <Activity className="w-10 h-10 mx-auto" />
                       <p className="text-[10px] font-black uppercase tracking-widest">No previous runs</p>
                    </div>
                 ) : (
                    <div className="divide-y divide-white/5">
                       {history.map(h => (
                         <div key={h.id} className="p-5 flex items-center justify-between group hover:bg-white/5 transition-all">
                            <div className="flex items-center gap-4 min-w-0">
                               <div className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center text-primary/40 group-hover:text-primary shrink-0 transition-all">
                                  <ArrowDown className="w-4 h-4" />
                               </div>
                               <div className="min-w-0">
                                  <p className="text-[11px] font-bold text-foreground truncate uppercase">{formatSpeedText(h.download)} Mbps</p>
                                  <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-tighter">{new Date(h.timestamp).toLocaleDateString()} • {new Date(h.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
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
               <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Privacy Sovereign</h4>
               <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                 Telemetry is execution-only. Network results and hardware identifiers are volatile and never transmitted to remote servers.
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
