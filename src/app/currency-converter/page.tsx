"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Coins, 
  ArrowRightLeft, 
  RefreshCcw, 
  Trash2, 
  CheckCircle2, 
  Info,
  Zap,
  Activity,
  ShieldCheck,
  TrendingUp,
  Clock,
  ArrowRight,
  Loader2,
  Banknote,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

// --- Configuration Matrix ---
const CURRENCIES = [
  { code: 'USD', label: 'US Dollar', flag: '🇺🇸' },
  { code: 'PKR', label: 'Pakistani Rupee', flag: '🇵🇰' },
  { code: 'SAR', label: 'Saudi Riyal', flag: '🇸🇦' },
  { code: 'AED', label: 'UAE Dirham', flag: '🇦🇪' },
  { code: 'EUR', label: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', label: 'British Pound', flag: '🇬🇧' },
  { code: 'INR', label: 'Indian Rupee', flag: '🇮🇳' },
];

export default function CurrencyConverterPage() {
  const { toast } = useToast();
  
  // --- Input State ---
  const [amount, setAmount] = useState<string>('1');
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('PKR');
  
  // --- Result State ---
  const [result, setResult] = useState<number | null>(null);
  const [rate, setRate] = useState<number | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    
    setIsLoading(true);
    setError(null);
    setResult(null);

    const endpoints = [
      { 
        url: `https://open.er-api.com/v6/latest/${fromCurrency}`,
        source: 'ExchangeRate-API',
        parser: (data: any) => ({
          rate: data.rates[toCurrency],
          time: new Date(data.time_last_update_unix * 1000).toLocaleString()
        })
      },
      { 
        url: `https://api.frankfurter.app/latest?from=${fromCurrency}&to=${toCurrency}`,
        source: 'Frankfurter',
        parser: (data: any) => ({
          rate: data.rates[toCurrency],
          time: new Date(data.date).toLocaleDateString() + ' (Market Close)'
        })
      }
    ];

    let success = false;

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint.url);
        if (!response.ok) continue;
        
        const data = await response.json();
        const parsed = endpoint.parser(data);
        
        if (parsed.rate) {
          setRate(parsed.rate);
          setResult(parseFloat(amount) * parsed.rate);
          setLastUpdate(parsed.time);
          success = true;
          toast({ title: "Signal Isolated", description: `Rates synchronized via ${endpoint.source}.` });
          break;
        }
      } catch (err) {
        console.warn(`Node ${endpoint.source} restricted.`);
      }
    }

    if (!success) {
      setError("Matrix Retrieval Failure: Financial nodes are unreachable.");
      toast({ variant: "destructive", title: "Sync Failed" });
    }
    
    setIsLoading(false);
  };

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult(null);
    setRate(null);
  };

  const handleClear = () => {
    setAmount('1');
    setResult(null);
    setRate(null);
    setError(null);
    toast({ title: "Studio Reset" });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-6xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Coins className="w-3.5 h-3.5" /> Fiscal Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
              Currency <span className="text-primary italic">Converter</span>
            </h1>
            <p className="text-foreground/40 text-sm md:text-base font-medium mt-2 max-w-2xl leading-relaxed">
              Professional exchange rate matrix. Convert global currencies locally with real-time market calibration and fallback protocol reliability.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <GetHelp toolId="currency-converter" />
             <Button variant="outline" size="sm" onClick={handleClear} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
             </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls - Left */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
               <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                 <RefreshCcw className="w-5 h-5 text-primary" /> Parameters
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-10">
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Amount to Translate</Label>
                  <div className="relative group/amt">
                    <Input 
                      type="number" value={amount} onChange={e => setAmount(e.target.value)}
                      className="h-16 bg-secondary border-border rounded-2xl text-2xl font-bold px-6 pl-14 focus:ring-primary/40"
                    />
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground/20 font-black text-lg group-focus-within/amt:text-primary transition-colors">
                      {CURRENCIES.find(c => c.code === fromCurrency)?.flag}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] items-end gap-4">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">From</Label>
                    <Select value={fromCurrency} onValueChange={setFromCurrency}>
                      <SelectTrigger className="h-14 bg-secondary border-border rounded-2xl font-bold uppercase text-[10px] tracking-widest">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card">
                        {CURRENCIES.map(c => (
                          <SelectItem key={c.code} value={c.code} className="text-[10px] font-black uppercase">
                            {c.flag} {c.code} — {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    variant="outline" 
                    onClick={handleSwap}
                    className="h-14 w-14 rounded-2xl border-border bg-secondary hover:text-primary shadow-lg transition-transform active:rotate-180 duration-500 mb-0.5"
                  >
                    <ArrowRightLeft className="w-6 h-6" />
                  </Button>

                  <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">To</Label>
                    <Select value={toCurrency} onValueChange={setToCurrency}>
                      <SelectTrigger className="h-14 bg-secondary border-border rounded-2xl font-bold uppercase text-[10px] tracking-widest">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card">
                        {CURRENCIES.map(c => (
                          <SelectItem key={c.code} value={c.code} className="text-[10px] font-black uppercase">
                            {c.flag} {c.code} — {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button 
                onClick={fetchRates} 
                disabled={isLoading || !amount} 
                className="h-16 w-full bg-primary text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all"
              >
                 {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 mr-3" />}
                 Execute Conversion
              </Button>
            </CardContent>
          </Card>

          <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
             <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
             </div>
             <div className="space-y-2">
               <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Privacy Absolute</h4>
               <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                 Conversion payloads are processed strictly within your browser. We do not store or transmit your financial data to any remote database.
               </p>
             </div>
          </div>
        </div>

        {/* Results - Right */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[500px]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-3">
                <Activity className="w-4 h-4 fill-primary/20" /> Analysis Master
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-8 sm:p-16 flex flex-col justify-center bg-black/10">
               {!result && !isLoading && !error && (
                 <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-6">
                    <Banknote className="w-24 h-24 text-primary" />
                    <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Fiscal Signal</p>
                 </div>
               )}

               {isLoading && (
                 <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                    <div className="relative">
                       <div className="w-24 h-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                       <Globe className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />
                    </div>
                    <p className="text-[10px] font-black uppercase text-primary tracking-[0.4em]">Querying Global Market Nodes...</p>
                 </div>
               )}

               {error && (
                 <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 animate-in shake duration-500">
                    <AlertCircle className="w-16 h-16 text-destructive" />
                    <p className="text-sm font-black uppercase text-foreground/40 leading-relaxed px-12">{error}</p>
                 </div>
               )}

               {result !== null && !isLoading && (
                 <div className="space-y-12 animate-in zoom-in-95 duration-500">
                    <div className="text-center space-y-4">
                       <div className="flex items-center justify-center gap-4 text-[10px] font-black uppercase text-foreground/30 tracking-[0.4em]">
                          <span>{amount} {fromCurrency}</span>
                          <ArrowRight className="w-3 h-3" />
                       </div>
                       <h2 className="text-5xl sm:text-8xl font-headline font-black text-foreground break-all leading-none">
                          {result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                       </h2>
                       <p className="text-2xl font-headline font-bold text-primary uppercase tracking-widest">{toCurrency}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div className="p-6 rounded-[2.5rem] bg-secondary/50 border border-border flex items-start gap-4">
                          <TrendingUp className="w-5 h-5 text-primary mt-1 shrink-0" />
                          <div className="space-y-1">
                             <p className="text-[9px] font-black uppercase text-foreground/30 tracking-widest">Exchange Protocol</p>
                             <p className="text-sm font-mono font-bold text-foreground">1 {fromCurrency} = {rate?.toFixed(4)} {toCurrency}</p>
                          </div>
                       </div>
                       <div className="p-6 rounded-[2.5rem] bg-secondary/50 border border-border flex items-start gap-4">
                          <Clock className="w-5 h-5 text-primary mt-1 shrink-0" />
                          <div className="space-y-1">
                             <p className="text-[9px] font-black uppercase text-foreground/30 tracking-widest">Calibration Time</p>
                             <p className="text-[10px] font-bold text-foreground uppercase truncate">{lastUpdate}</p>
                          </div>
                       </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-4">
                       <Button onClick={() => { navigator.clipboard.writeText(`${amount} ${fromCurrency} = ${result.toFixed(2)} ${toCurrency}`); toast({ title: "Result Copied" }); }} className="h-16 flex-1 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl hover:bg-white/90">
                          Copy Fiscal Report
                       </Button>
                       <Button onClick={fetchRates} variant="outline" className="h-16 px-10 border-white/10 bg-white/5 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl">
                          <RefreshCcw className="w-5 h-5" />
                       </Button>
                    </div>
                 </div>
               )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
