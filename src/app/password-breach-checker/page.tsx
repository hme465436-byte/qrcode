"use client"

import React, { useState } from 'react';
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
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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

  // SHA-1 implementation using Web Crypto API
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
        toast({ variant: "destructive", title: "Security Alert", description: "This password has been identified in public breaches." });
      } else {
        setResult({ breached: false, count: 0 });
        toast({ title: "Protocol Secure", description: "Identity not found in known breaches." });
      }
    } catch (err) {
      setError("Service temporarily unavailable. Please check your uplink or try again later.");
      toast({ variant: "destructive", title: "Uplink Failed" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setPassword('');
    setResult(null);
    setError(null);
    toast({ title: "Studio Reset" });
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
              Breach <span className="text-primary italic">Checker Studio</span>
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
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
               <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                 <Lock className="w-5 h-5 text-primary" /> Security Matrix
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
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

              <Button 
                onClick={checkBreach}
                disabled={isLoading || !password.trim()}
                className="w-full h-16 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-xl shadow-primary/30 active:scale-95 transition-all"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Zap className="w-5 h-5 mr-2" />}
                Execute Integrity Check
              </Button>

              <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10 flex items-start gap-4">
                 <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                 <div className="space-y-1">
                    <h4 className="text-[11px] font-black uppercase text-primary tracking-widest">K-Anonymity Protocol</h4>
                    <p className="text-[10px] text-foreground/40 font-medium leading-relaxed uppercase">
                       Your full password is never transmitted. Only the first 5 characters of a secure SHA-1 hash are used for discovery.
                    </p>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Matrix */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[400px] bg-black/10">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between shrink-0">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <Activity className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Identity Status</CardTitle>
                 </div>
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

                 {result && !isLoading && (
                   <div className="w-full space-y-12 animate-in zoom-in-95 duration-500">
                      <div className={cn(
                        "p-12 rounded-[3.5rem] border-2 text-center space-y-6 shadow-2xl relative overflow-hidden transition-all duration-700",
                        result.breached ? "bg-red-500/10 border-red-500/20" : "bg-green-500/10 border-green-500/20"
                      )}>
                         <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[80px]" />
                         <div className={cn(
                           "w-16 h-16 rounded-[2rem] mx-auto flex items-center justify-center shadow-xl border border-white/10 mb-2",
                           result.breached ? "bg-red-500" : "bg-green-500"
                         )}>
                            {result.breached ? <ShieldAlert className="w-8 h-8 text-white" /> : <ShieldCheck className="w-8 h-8 text-white" />}
                         </div>
                         <div className="space-y-2">
                            <p className="text-[11px] font-black uppercase tracking-[0.6em] opacity-40">Integrity Report</p>
                            <h2 className="text-4xl sm:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
                               {result.breached ? 'Compromised' : 'Safe Identity'}
                            </h2>
                            <p className={cn("text-sm font-bold uppercase tracking-widest", result.breached ? "text-red-500" : "text-green-500")}>
                               {result.breached ? `Identified in ${result.count.toLocaleString()} public breaches` : 'Zero matches found in current matrix'}
                            </p>
                         </div>
                      </div>

                      <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                        <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                            <Zap className="w-7 h-7" />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Advisory Action</h4>
                            <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                               {result.breached 
                                 ? "Execute a security rotation immediately. Change this password on all associated platforms."
                                 : "This password appears clean in current datasets. Continue monitoring via standard studio rotations."}
                            </p>
                        </div>
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
