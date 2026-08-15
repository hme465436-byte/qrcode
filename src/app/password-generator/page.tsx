"use client"

import React, { useState, useCallback, useEffect } from 'react';
import { 
  Lock, 
  RefreshCw, 
  Copy, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Info,
  CheckCircle2,
  Settings2,
  Shield,
  Zap,
  Trash2,
  KeyRound,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function PasswordGeneratorPage() {
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  const generatePassword = useCallback(() => {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    let charset = '';
    if (includeUpper) charset += upper;
    if (includeLower) charset += lower;
    if (includeNumbers) charset += numbers;
    if (includeSymbols) charset += symbols;

    if (charset === '') {
      toast({ variant: "destructive", title: "Protocol Error", description: "Select at least one character set." });
      return;
    }

    let generated = '';
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
      generated += charset[array[i] % charset.length];
    }

    setPassword(generated);
  }, [length, includeUpper, includeLower, includeNumbers, includeSymbols, toast]);

  // Initial generation
  useEffect(() => {
    generatePassword();
  }, []);

  const getStrength = () => {
    if (!password) return { label: 'None', color: 'bg-secondary', percent: 0 };
    let score = 0;
    if (password.length > 12) score += 25;
    if (password.length > 20) score += 25;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[a-z]/.test(password)) score += 10;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^A-Za-z0-9]/.test(password)) score += 10;

    if (score < 40) return { label: 'Weak', color: 'bg-destructive', percent: 30 };
    if (score < 70) return { label: 'Medium', color: 'bg-yellow-500', percent: 60 };
    if (score < 90) return { label: 'Strong', color: 'bg-primary', percent: 90 };
    return { label: 'Secure', color: 'bg-green-500', percent: 100 };
  };

  const strength = getStrength();

  const handleCopy = () => {
    if (password) {
      navigator.clipboard.writeText(password);
      setIsCopied(true);
      toast({ title: "Entropy Copied", description: "Password saved to clipboard." });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setPassword('');
    toast({ title: "Studio Reset", description: "Buffers cleared." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Shield className="w-3.5 h-3.5" /> Security Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Random <span className="text-primary italic">Password Studio</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl">
          Professional entropy generation. Synthesize cryptographically-secure passwords with precision character protocols locally in your browser.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <Settings2 className="w-6 h-6" />
                </div>
                Generation Protocol
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-10 space-y-10">
              {/* Length Matrix */}
              <div className="space-y-6">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-foreground/50">
                  <Label>Character Density (Length)</Label>
                  <span className="text-primary font-mono text-lg">{length}</span>
                </div>
                <Slider 
                  value={[length]} 
                  min={8} 
                  max={64} 
                  step={1} 
                  onValueChange={(v) => setLength(v[0])} 
                  className="py-4"
                />
              </div>

              {/* Protocol Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { id: 'upper', label: 'Uppercase (A-Z)', state: includeUpper, set: setIncludeUpper },
                  { id: 'lower', label: 'Lowercase (a-z)', state: includeLower, set: setIncludeLower },
                  { id: 'num', label: 'Numeric (0-9)', state: includeNumbers, set: setIncludeNumbers },
                  { id: 'sym', label: 'Symbols (!@#$)', state: includeSymbols, set: setIncludeSymbols },
                ].map((proto) => (
                  <div key={proto.id} className="flex items-center justify-between p-5 rounded-2xl bg-secondary border border-border group/proto hover:border-primary/20 transition-all">
                    <Label htmlFor={proto.id} className="text-[10px] font-black uppercase tracking-widest text-foreground/60 cursor-pointer">{proto.label}</Label>
                    <Switch id={proto.id} checked={proto.state} onCheckedChange={proto.set} />
                  </div>
                ))}
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={generatePassword}
                  className="flex-1 h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                >
                  <RefreshCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                  Synthesize Password
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleClear}
                  className="w-16 h-16 rounded-2xl border-border bg-secondary hover:bg-secondary/80 text-foreground/40 hover:text-destructive transition-all active:scale-95"
                >
                  <Trash2 className="w-6 h-6" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
            <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Entropy Logic</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                Our engine utilizes <code className="bg-primary/10 px-1 rounded text-primary">window.crypto.getRandomValues</code> for cryptographic-grade randomness. Synthesis occurs entirely in your browser memory for absolute security.
              </p>
            </div>
          </div>
        </div>

        {/* Result Column */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group min-h-[400px]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Output Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
              <div className="relative group/output">
                <div className={cn(
                  "min-h-[120px] bg-white dark:bg-black/20 border border-border rounded-[2rem] p-8 flex items-center justify-center text-center shadow-inner transition-all",
                  password ? "ring-1 ring-primary/20" : "opacity-40"
                )}>
                  {password ? (
                    <span className={cn(
                      "text-xl sm:text-2xl font-mono font-bold break-all tracking-wider text-foreground",
                      !isVisible && "blur-md select-none"
                    )}>
                      {password}
                    </span>
                  ) : (
                    <div className="flex flex-col items-center gap-3 opacity-20">
                      <KeyRound className="w-12 h-12" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Synthesis</p>
                    </div>
                  )}
                </div>

                {password && (
                  <button 
                    onClick={() => setIsVisible(!isVisible)}
                    className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-foreground/40 hover:text-primary transition-all shadow-sm"
                  >
                    {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                )}
              </div>

              {/* Strength Meter */}
              {password && (
                <div className="space-y-4 px-2">
                   <div className="flex justify-between items-center">
                      <Label className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.2em]">Entropy Strength</Label>
                      <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full text-white", strength.color)}>
                        {strength.label}
                      </span>
                   </div>
                   <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full transition-all duration-1000 ease-out", strength.color)}
                        style={{ width: `${strength.percent}%` }}
                      />
                   </div>
                </div>
              )}

              <Button 
                onClick={handleCopy}
                disabled={!password}
                className={cn(
                  "w-full h-16 bg-secondary border border-border hover:bg-secondary/80 text-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-xl shadow-lg transition-all active:scale-95",
                  password ? "text-primary border-primary/20" : "opacity-50"
                )}
              >
                {isCopied ? <CheckCircle2 className="w-6 h-6 text-primary" /> : <Copy className="w-6 h-6 text-primary" />}
                {isCopied ? 'Matrix Copied' : 'Copy Password'}
              </Button>

              <div className="grid grid-cols-1 gap-4">
                 <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group">
                    <Zap className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Instant Provision</p>
                       <p className="text-[10px] text-foreground/40 leading-relaxed font-medium">Password is generated immediately upon protocol change.</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group">
                    <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Zero Transmission</p>
                       <p className="text-[10px] text-foreground/40 leading-relaxed font-medium">Your data never leaves your machine. 100% private.</p>
                    </div>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
