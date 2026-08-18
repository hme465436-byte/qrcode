
"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Coins, 
  Plus, 
  Percent, 
  Trash2, 
  Copy, 
  CheckCircle2, 
  Info,
  History,
  Activity,
  Zap,
  ArrowRight,
  Receipt,
  Calculator,
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

const HISTORY_KEY = 'mykit_tax_history_v1';
const QUICK_RATES = [1, 5, 10, 15, 16, 17, 18, 20, 30];

interface TaxHistory {
  id: string;
  amount: number;
  rate: number;
  mode: 'add' | 'included';
  tax: number;
  total: number;
  net: number;
  timestamp: number;
}

export default function TaxCalculatorPage() {
  const { toast } = useToast();
  const [amount, setAmount] = useState<string>('100');
  const [rate, setRate] = useState<string>('15');
  const [mode, setMode] = useState<'add' | 'included'>('add');
  const [history, setHistory] = useState<TaxHistory[]>([]);
  const [isCopied, setIsCopied] = useState<string | null>(null);

  // --- Logic Matrix ---
  const results = useMemo(() => {
    const amt = parseFloat(amount) || 0;
    const pct = parseFloat(rate) || 0;
    
    let tax = 0;
    let net = 0;
    let total = 0;

    if (mode === 'add') {
      tax = amt * (pct / 100);
      net = amt;
      total = amt + tax;
    } else {
      net = amt / (1 + pct / 100);
      tax = amt - net;
      total = amt;
    }

    return { tax, net, total };
  }, [amount, rate, mode]);

  // --- Persistence Protocol ---
  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) try { setHistory(JSON.parse(saved)); } catch (e) {}
  }, []);

  const addToHistory = () => {
    const entry: TaxHistory = {
      id: Math.random().toString(36).substr(2, 9),
      amount: parseFloat(amount) || 0,
      rate: parseFloat(rate) || 0,
      mode,
      ...results,
      timestamp: Date.now()
    };
    const next = [entry, ...history].slice(0, 10);
    setHistory(next);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  };

  const formatPKR = (val: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val).replace('PKR', 'Rs.');
  };

  const handleCopy = (val: number, label: string) => {
    navigator.clipboard.writeText(val.toFixed(2));
    setIsCopied(label);
    toast({ title: "Value Copied", description: `${label} saved to clipboard.` });
    setTimeout(() => setIsCopied(null), 2000);
  };

  const handleClear = () => {
    setAmount('');
    setRate('15');
    setMode('add');
    toast({ title: "Studio Reset" });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
    toast({ title: "History Purged" });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Coins className="w-3.5 h-3.5" /> Fiscal Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
              Tax <span className="text-primary italic">Calculator Studio</span>
            </h1>
            <p className="text-foreground/40 text-sm md:text-base font-medium mt-2 max-w-2xl leading-relaxed">
              Professional fiscal analysis matrix. Calculate GST, VAT, and sales taxes with dual-mode reverse logic and clinical precision.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <GetHelp toolId="tax-calculator" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
               <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                  <Calculator className="w-5 h-5 text-primary" /> Parameter Input
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-10">
              {/* Mode Toggle */}
              <div className="space-y-4">
                 <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Calculation Protocol</Label>
                 <div className="grid grid-cols-2 bg-secondary p-1.5 rounded-2xl border border-border h-14">
                    <button 
                      onClick={() => setMode('add')}
                      className={cn(
                        "flex-1 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all",
                        mode === 'add' ? "bg-primary text-white shadow-lg" : "text-foreground/40 hover:text-foreground"
                      )}
                    >
                       <ArrowUpCircle className="w-4 h-4" /> Add Tax
                    </button>
                    <button 
                      onClick={() => setMode('included')}
                      className={cn(
                        "flex-1 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all",
                        mode === 'included' ? "bg-primary text-white shadow-lg" : "text-foreground/40 hover:text-foreground"
                      )}
                    >
                       <ArrowDownCircle className="w-4 h-4" /> Tax Included
                    </button>
                 </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-4">
                 <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">
                   {mode === 'add' ? 'Base Amount (Net)' : 'Total Amount (Gross)'}
                 </Label>
                 <div className="relative group/amt">
                    <Input 
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="h-16 bg-secondary border-border rounded-2xl text-2xl font-bold px-6 pl-14 focus:ring-primary/40"
                    />
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground/20 font-black text-lg group-focus-within/amt:text-primary transition-colors">Rs.</div>
                 </div>
              </div>

              {/* Percentage Input */}
              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Tax Percentage (%)</Label>
                    <span className="text-primary font-mono font-bold text-lg">{rate}%</span>
                 </div>
                 <div className="flex items-center gap-4">
                    <Input 
                      type="number"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      className="h-14 w-32 bg-secondary border-border rounded-2xl text-xl font-bold text-center shrink-0"
                    />
                    {/* SCROLLABLE CHIPS MATRIX */}
                    <div className="flex-1 flex flex-nowrap gap-2 overflow-x-auto no-scrollbar py-1 whitespace-nowrap">
                       {QUICK_RATES.map(r => (
                         <button
                          key={r}
                          onClick={() => setRate(r.toString())}
                          className={cn(
                            "px-5 h-12 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all shrink-0 inline-flex items-center justify-center",
                            parseFloat(rate) === r ? "bg-primary text-primary-foreground border-primary shadow-lg" : "bg-secondary/50 border-border text-foreground/40 hover:border-primary/20"
                          )}
                         >
                           {r}%
                         </button>
                       ))}
                       {/* Padding for end of scroll */}
                       <div className="w-1 shrink-0" />
                    </div>
                 </div>
              </div>

              <div className="pt-4 flex gap-3">
                 <Button onClick={addToHistory} disabled={!amount} className="flex-1 h-14 bg-primary text-white font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-xl shadow-primary/30 active:scale-95 transition-all">
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Log Calculation
                 </Button>
                 <Button variant="outline" onClick={handleClear} className="h-14 w-14 rounded-2xl border-border bg-secondary text-foreground/40 hover:text-destructive">
                    <Trash2 className="w-5 h-5" />
                 </Button>
              </div>
            </CardContent>
          </Card>

          <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
             <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
             </div>
             <div className="space-y-2">
               <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Hardware Isolation</h4>
               <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                 All fiscal arithmetic occurs 100% locally in your browser memory. No financial data or identifiers are transmitted to remote servers.
               </p>
             </div>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           {/* Primary Results Matrix */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Tax Amount', val: results.tax, icon: Percent, color: 'text-primary' },
                { label: 'Net Amount', val: results.net, icon: Wallet, color: 'text-foreground/60' },
                { label: 'Gross Total', val: results.total, icon: Receipt, color: 'text-foreground' },
              ].map((res) => (
                <Card key={res.label} className="glass-card border-border shadow-xl hover:border-primary/20 transition-all group/res">
                   <CardContent className="p-8 space-y-4">
                      <div className="flex items-center justify-between">
                         <div className={cn("w-10 h-10 rounded-xl bg-secondary flex items-center justify-center border border-border group-hover/res:scale-110 transition-transform", res.color)}>
                            <res.icon className="w-5 h-5" />
                         </div>
                         <button onClick={() => handleCopy(res.val, res.label)} className="text-foreground/10 hover:text-primary transition-colors">
                            {isCopied === res.label ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                         </button>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[9px] font-black uppercase text-foreground/30 tracking-widest">{res.label}</p>
                         <h3 className={cn("text-xl font-headline font-black truncate", res.color)}>
                            {formatPKR(res.val)}
                         </h3>
                      </div>
                   </CardContent>
                </Card>
              ))}
           </div>

           {/* Live Summary */}
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative min-h-[400px] flex flex-col">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5" /> Stability Pipeline
                 </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-0 flex flex-col">
                 <div className="p-8 sm:p-12 space-y-10 flex-1">
                    <div className="flex flex-col items-center text-center gap-4">
                       <p className="text-[10px] font-black uppercase text-foreground/20 tracking-[0.4em]">Current Matrix Summary</p>
                       <h2 className="text-4xl sm:text-6xl font-headline font-black text-foreground uppercase tracking-tight">
                          {formatPKR(results.total)}
                       </h2>
                       <div className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest">
                          Protocol: {mode === 'add' ? 'Additive' : 'Inclusive'} @ {rate}%
                       </div>
                    </div>

                    <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border shadow-inner space-y-6">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-foreground/40">
                          <span>Fiscal Breakdown</span>
                          <span>Unit: PKR</span>
                       </div>
                       <div className="space-y-4">
                          <div className="flex justify-between text-sm">
                             <span className="text-foreground/40 font-bold">BASE VALUE</span>
                             <span className="text-foreground font-mono">{formatPKR(results.net)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                             <span className="text-primary font-bold">TAX PORTION</span>
                             <span className="text-primary font-mono">+{formatPKR(results.tax)}</span>
                          </div>
                          <div className="h-[1px] bg-border" />
                          <div className="flex justify-between text-lg">
                             <span className="text-foreground font-black uppercase font-headline">TOTAL</span>
                             <span className="text-foreground font-black font-mono">{formatPKR(results.total)}</span>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* History Matrix */}
                 {history.length > 0 && (
                   <div className="border-t border-border bg-black/20 p-6 sm:p-10 space-y-6 animate-in slide-in-from-bottom-4">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <History className="w-4 h-4 text-primary" />
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Recent Registry</h4>
                         </div>
                         <button onClick={clearHistory} className="text-[8px] font-black uppercase text-foreground/20 hover:text-destructive transition-colors">Purge History</button>
                      </div>
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                         {history.map((h) => (
                           <div key={h.id} className="p-4 rounded-2xl bg-background border border-border flex items-center justify-between group hover:border-primary/20 transition-all">
                              <div className="flex items-center gap-4">
                                 <div className={cn("w-2 h-2 rounded-full", h.mode === 'add' ? 'bg-primary' : 'bg-emerald-500')} />
                                 <div className="min-w-0">
                                    <p className="text-[11px] font-bold text-foreground truncate uppercase">{formatPKR(h.total)}</p>
                                    <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">{h.rate}% • {h.mode === 'add' ? 'Added' : 'Incl.'}</p>
                                 </div>
                              </div>
                              <button onClick={() => { setAmount(h.amount.toString()); setRate(h.rate.toString()); setMode(h.mode); }} className="text-[9px] font-black uppercase text-primary/40 hover:text-primary transition-all">Restore</button>
                           </div>
                         ))}
                      </div>
                   </div>
                 )}
              </CardContent>
           </Card>
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
