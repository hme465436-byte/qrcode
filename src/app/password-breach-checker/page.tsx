"use client"

import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Search, 
  RefreshCcw, 
  Loader2, 
  AlertCircle,
  Zap,
  Activity,
  CheckCircle2,
  Copy,
  Hash,
  KeyRound,
  Shield,
  Fingerprint,
  RotateCcw,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShieldHalf,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

export default function PasswordBreachCheckerPage() {
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ breached: boolean; count: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // --- 1. Entropy & Strength Matrix ---
  const strengthInfo = useMemo(() => {
    if (!password) return { score: 0, label: 'None', color: 'bg-secondary', text: 'text-foreground/20' };
    
    let score = 0;
    if (password.length > 8) score += 20;
    if (password.length > 12) score += 20;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^A-Za-z0-9]/.test(password)) score += 30;

    if (score < 40) return { score, label: 'Weak', color: 'bg-red-500', text: 'text-red-500' };
    if (score < 75) return { score, label: 'Medium', color: 'bg-yellow-500', text: 'text-yellow-500' };
    return { score, label: 'Strong', color: 'bg-green-500', text: 'text-green-500' };
  }, [password]);

  // --- 2. Risk Protocol Logic ---
  const riskAssessment = useMemo(() => {
    if (!result) return null;
    
    let score = 100;
    const reasons: string[] = [];

    // Impact of Breaches
    if (result.breached) {
      if (result.count > 1000) {
        score = 0;
        reasons.push("Critical: Identity identifies as common or high-exposure.");
      } else {
        score -= 60;
        reasons.push("Vulnerable: Found in existing public data leaks.");
      }
    }

    // Impact of Strength
    if (strengthInfo.label === 'Weak') {
      score -= 30;
      reasons.push("Structural Fault: Low character complexity.");
    } else if (strengthInfo.label === 'Medium') {
      score -= 10;
      reasons.push("Advisory: Structural integrity could be improved.");
    }

    const finalScore = Math.max(0, score);
    let status: 'Safe' | 'Suspicious' | 'Dangerous' = 'Safe';
    let color = 'text-green-500';
    let bg = 'bg-green-500/10';
    let border = 'border-green-500/20';
    let icon = ShieldCheck;

    if (finalScore < 40) {
      status = 'High Risk';
      color = 'text-red-500';
      bg = 'bg-red-500/10';
      border = 'border-red-500/20';
      icon = ShieldAlert;
    } else if (finalScore < 80) {
      status = 'Medium Risk';
      color = 'text-yellow-500';
      bg = 'bg-yellow-500/10';
      border = 'border-yellow-500/20';
      icon = AlertCircle;
    }

    if (reasons.length === 0) {
      reasons.push("Clean Signal: No threats identified in active registries.");
    }

    return { score: finalScore, status, color, bg, border, icon, reasons };
  }, [result, strengthInfo]);

  // --- 3. Secure SHA-1 Matrix ---
  const sha1 = async (text: string) => {
    const msgUint8 = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  };

  const checkBreach = async () => {
    if (!password.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const fullHash = await sha1(password);
      const prefix = fullHash.substring(0, 5);
      const suffix = fullHash.substring(5);

      const fetchWithRetry = async (retries = 1): Promise<Response> => {
        try {
          const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
          if (!res.ok) throw new Error("Registry node restricted");
          return res;
        } catch (err) {
          if (retries > 0) return fetchWithRetry(retries - 1);
          throw err;
        }
      };

      const response = await fetchWithRetry();
      const text = await response.text();
      const lines = text.split('\n');
      
      const match = lines.find(line => line.split(':')[0] === suffix);
      
      if (match) {
        const count = parseInt(match.split(':')[1]);
        setResult({ breached: true, count });
      } else {
        setResult({ breached: false, count: 0 });
      }
    } catch (err) {
      setError("Discovery node restricted. Please verify your uplink or try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setPassword('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <ShieldAlert className="w-3.5 h-3.5" /> Security Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
              Breach <span className="text-primary italic">Checker PRO</span>
            </h1>
            <p className="text-foreground/40 text-sm md:text-base font-medium mt-2 max-w-2xl leading-relaxed">
              Professional identity integrity diagnostics. Verify if your passwords have been exposed in data breaches using the k-Anonymity protocol. 100% private.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <GetHelp toolId="password-breach-checker" />
             {password && (
               <Button variant="outline" size="sm" onClick={handleClear} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                  <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
               </Button>
             )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Input Panel */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
               <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                 <Lock className="w-5 h-5 text-primary" /> Security Matrix
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-10">
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Password Identifier</Label>
                  <div className="relative group/input">
                    <Input 
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password to verify..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && checkBreach()}
                      className="h-16 bg-secondary border-border rounded-2xl font-bold px-6 pr-14 focus:ring-primary/40 text-lg"
                    />
                    <button 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/20 hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Strength Meter Module */}
                {password && (
                  <div className="space-y-4 animate-in slide-in-from-top-2 duration-500">
                    <div className="flex justify-between items-center">
                       <span className="text-[9px] font-black uppercase text-foreground/30 tracking-widest">Structural Integrity</span>
                       <span className={cn("text-[10px] font-black uppercase", strengthInfo.text)}>{strengthInfo.label}</span>
                    </div>
                    <Progress value={strengthInfo.score} className="h-1.5 bg-secondary" indicatorClassName={strengthInfo.color} />
                  </div>
                )}
              </div>

              <Button 
                onClick={checkBreach}
                disabled={isLoading || !password.trim()}
                className="w-full h-16 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-xl shadow-primary/30 active:scale-95 transition-all"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Zap className="w-5 h-5 mr-2" />}
                Execute Integrity Check
              </Button>

              <div className="p-8 rounded-[2.5rem] bg-primary/5 border border-primary/10 space-y-6">
                 <div className="flex items-start gap-4">
                    <ShieldCheck className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                    <div className="space-y-1">
                       <h4 className="text-[11px] font-black uppercase text-primary tracking-widest">K-Anonymity Protocol</h4>
                       <p className="text-[10px] text-foreground/40 font-medium leading-relaxed uppercase">
                          Your full password is never transmitted. Only the first 5 characters of a secure SHA-1 hash are used for discovery.
                       </p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4">
                    <Fingerprint className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                    <div className="space-y-1">
                       <h4 className="text-[11px] font-black uppercase text-primary tracking-widest">Local Hashing</h4>
                       <p className="text-[10px] text-foreground/40 font-medium leading-relaxed uppercase">
                          Bitstream conversion to SHA-1 is executed entirely on your hardware within the browser sandbox.
                       </p>
                    </div>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Matrix */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px] bg-black/10">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between shrink-0">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <Activity className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Identity Status</CardTitle>
                 </div>
                 {riskAssessment && (
                    <Badge className={cn("px-4 py-1.5 border uppercase text-[9px] font-black tracking-widest", riskAssessment.bg, riskAssessment.color, riskAssessment.border)}>
                       {riskAssessment.status}
                    </Badge>
                 )}
              </CardHeader>
              
              <CardContent className="flex-1 p-8 sm:p-12 flex flex-col items-center justify-center relative overflow-hidden">
                 {!result && !isLoading && !error && (
                   <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-6 py-20">
                      <Fingerprint className="w-24 h-24 text-primary" />
                      <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Security Signal</p>
                   </div>
                 )}

                 {isLoading && (
                   <div className="flex-1 flex flex-col items-center justify-center space-y-10 py-20">
                      <div className="relative">
                         <div className="w-28 h-28 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                         <KeyRound className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                      </div>
                      <p className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">Decoding Breach Matrix...</p>
                   </div>
                 )}

                 {error && (
                   <div className="flex flex-col items-center gap-8 py-20 text-center animate-in shake duration-500">
                      <AlertCircle className="w-16 h-16 text-destructive animate-bounce" />
                      <div className="space-y-2">
                         <h3 className="text-xl font-headline font-black text-destructive uppercase">Uplink Failure</h3>
                         <p className="text-[11px] text-foreground/40 font-bold uppercase max-w-sm mx-auto leading-relaxed">{error}</p>
                      </div>
                   </div>
                 )}

                 {result && riskAssessment && !isLoading && (
                   <div className="w-full space-y-12 animate-in zoom-in-95 duration-500">
                      {/* Master Score Display */}
                      <div className="flex flex-col items-center gap-8">
                         <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                               <circle cx="50%" cy="50%" r="45%" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-white/5" />
                               <circle 
                                cx="50%" cy="50%" r="45%" 
                                fill="transparent" 
                                stroke="currentColor" 
                                strokeWidth="12" 
                                strokeDasharray="283" 
                                strokeDashoffset={283 - (283 * riskAssessment.score) / 100}
                                className={cn("transition-all duration-1000", riskAssessment.color.replace('text-', 'text-'))} 
                               />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2">
                               <span className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.4em]">Trust Level</span>
                               <h2 className="text-6xl sm:text-8xl font-headline font-black text-foreground leading-none">{riskAssessment.score}</h2>
                            </div>
                         </div>
                         
                         <div className="text-center space-y-2">
                            <h3 className={cn("text-2xl font-headline font-black uppercase tracking-tight", riskAssessment.color)}>{riskAssessment.status}</h3>
                            <p className="text-[10px] font-bold text-foreground/20 uppercase tracking-[0.3em]">Calibrated via Global Nodes</p>
                         </div>
                      </div>

                      {/* Detail Modules */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                         <div className={cn("p-8 rounded-[3rem] border transition-all duration-500 text-center space-y-4", result.breached ? "bg-red-500/10 border-red-500/20" : "bg-green-500/10 border-green-500/20")}>
                            <div className={cn("w-12 h-12 rounded-2xl mx-auto flex items-center justify-center shadow-lg border border-white/10", result.breached ? "bg-red-500" : "bg-green-500")}>
                               {result.breached ? <ShieldAlert className="w-6 h-6 text-white" /> : <ShieldCheck className="w-6 h-6 text-white" />}
                            </div>
                            <div className="space-y-1">
                               <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Breach Exposure</p>
                               <p className="text-lg font-bold text-foreground uppercase">{result.breached ? `${result.count.toLocaleString()} Leaks` : 'Zero Matches'}</p>
                            </div>
                         </div>
                         <div className={cn("p-8 rounded-[3rem] border transition-all duration-500 text-center space-y-4", strengthInfo.color.replace('bg-', 'bg-').replace('-500', '/10'), strengthInfo.color.replace('bg-', 'border-').replace('-500', '/20'))}>
                            <div className={cn("w-12 h-12 rounded-2xl mx-auto flex items-center justify-center shadow-lg border border-white/10", strengthInfo.color)}>
                               <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <div className="space-y-1">
                               <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Linguistic Strength</p>
                               <p className="text-lg font-bold text-foreground uppercase">{strengthInfo.label} Matrix</p>
                            </div>
                         </div>
                      </div>

                      {/* Diagnostic Reasons */}
                      <div className="space-y-6">
                         <div className="flex items-center gap-3 px-1">
                            <ShieldHalf className="w-4 h-4 text-primary" />
                            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground/40">Diagnostic Trace</h4>
                         </div>
                         <div className="space-y-3">
                            {riskAssessment.reasons.map((r, i) => (
                               <div key={i} className="p-4 rounded-2xl bg-secondary/50 border border-border flex items-center gap-4 group">
                                  <div className={cn("w-2 h-2 rounded-full", riskAssessment.color.replace('text-', 'bg-'))} />
                                  <p className="text-[11px] font-bold text-foreground/60 uppercase tracking-tighter leading-none">{r}</p>
                               </div>
                            ))}
                         </div>
                      </div>

                      {/* Advisory Panel */}
                      <div className="p-8 rounded-[3rem] bg-primary/5 border border-primary/10 space-y-6 relative overflow-hidden group">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[80px]" />
                         <div className="flex items-start gap-4 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20">
                               <Zap className="w-5 h-5" />
                            </div>
                            <h4 className="text-[11px] font-black uppercase tracking-widest text-primary">Security Rotation Recommendation</h4>
                         </div>
                         <p className="text-[13px] text-foreground/60 leading-relaxed font-medium relative z-10 uppercase tracking-tight">
                            {result.breached 
                              ? "Execute a security rotation immediately. This identity is known to the public domain and is no longer viable for secure access." 
                              : "Identity appears clean in current datasets. To maintain low risk, ensure this password contains at least 16 mixed-type characters."}
                         </p>
                      </div>
                   </div>
                 )}
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
