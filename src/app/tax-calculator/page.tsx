
"use client"

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  ShieldCheck,
  Package,
  Scissors,
  FileDown,
  Save,
  Layers,
  ArrowLeftRight,
  TrendingDown,
  TrendingUp,
  Tag,
  Ban,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

const HISTORY_KEY = 'mykit_tax_history_v2';
const SAVED_RATES_KEY = 'mykit_tax_saved_rates_v1';
const DEFAULT_RATES = [1, 5, 10, 15, 16, 17, 18, 20, 30];

interface SavedRate {
  id: string;
  name: string;
  value: number;
}

interface TaxHistory {
  id: string;
  amount: number;
  qty: number;
  rate1: number;
  rate2: number;
  discount: number;
  total: number;
  timestamp: number;
}

export default function TaxCalculatorPage() {
  const { toast } = useToast();
  
  // --- Input State ---
  const [amount, setAmount] = useState<string>('1200');
  const [qty, setQty] = useState<string>('1');
  const [discount, setDiscount] = useState<string>('0');
  const [discountType, setDiscountType] = useState<'%' | 'Rs'>('%');
  const [rate1, setRate1] = useState<string>('15');
  const [rate2, setRate2] = useState<string>('0');
  const [mode, setMode] = useState<'add' | 'included'>('add');
  
  // --- Registry State ---
  const [history, setHistory] = useState<TaxHistory[]>([]);
  const [savedRates, setSavedRates] = useState<SavedRate[]>([]);
  const [newRateName, setNewRateName] = useState('');
  
  // --- UI State ---
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const [compareRate, setCompareRate] = useState<string>('18');

  // --- Persistence Protocol ---
  useEffect(() => {
    const savedH = localStorage.getItem(HISTORY_KEY);
    const savedR = localStorage.getItem(SAVED_RATES_KEY);
    if (savedH) try { setHistory(JSON.parse(savedH)); } catch (e) {}
    if (savedR) try { setSavedRates(JSON.parse(savedR)); } catch (e) {}
  }, []);

  // --- Logic Matrix ---
  const calculateResult = useCallback((amtStr: string, qStr: string, dStr: string, r1Str: string, r2Str: string, calcMode: 'add' | 'included') => {
    const unitPrice = parseFloat(amtStr) || 0;
    const count = Math.max(1, parseFloat(qStr) || 1);
    const disc = parseFloat(dStr) || 0;
    const p1 = parseFloat(r1Str) || 0;
    const p2 = parseFloat(r2Str) || 0;

    const subtotal = unitPrice * count;
    const discountAmount = discountType === '%' ? (subtotal * (disc / 100)) : disc;
    const netTotal = Math.max(0, subtotal - discountAmount);

    let tax1 = 0;
    let tax2 = 0;
    let total = 0;
    let taxable = 0;

    if (calcMode === 'add') {
      taxable = netTotal;
      tax1 = taxable * (p1 / 100);
      tax2 = taxable * (p2 / 100);
      total = taxable + tax1 + tax2;
    } else {
      // included: total = taxable * (1 + p1/100 + p2/100)
      const combinedRate = p1 + p2;
      taxable = netTotal / (1 + combinedRate / 100);
      tax1 = taxable * (p1 / 100);
      tax2 = taxable * (p2 / 100);
      total = netTotal;
    }

    return { subtotal, discountAmount, taxable, tax1, tax2, total, netTotal };
  }, [discountType]);

  const results = useMemo(() => 
    calculateResult(amount, qty, discount, rate1, rate2, mode), 
  [amount, qty, discount, rate1, rate2, mode, calculateResult]);

  const compareResults = useMemo(() => {
    if (!showCompare) return null;
    return calculateResult(amount, qty, discount, compareRate, '0', mode);
  }, [amount, qty, discount, compareRate, mode, showCompare, calculateResult]);

  // --- Actions ---
  const saveRateProtocol = () => {
    if (!newRateName.trim() || !rate1) return;
    const newRate: SavedRate = {
      id: Math.random().toString(36).substr(2, 5),
      name: newRateName.toUpperCase(),
      value: parseFloat(rate1)
    };
    const next = [...savedRates, newRate];
    setSavedRates(next);
    localStorage.setItem(SAVED_RATES_KEY, JSON.stringify(next));
    setNewRateName('');
    toast({ title: "Rate Registered" });
  };

  const removeRate = (id: string) => {
    const next = savedRates.filter(r => r.id !== id);
    setSavedRates(next);
    localStorage.setItem(SAVED_RATES_KEY, JSON.stringify(next));
  };

  const addToHistory = () => {
    const entry: TaxHistory = {
      id: Math.random().toString(36).substr(2, 9),
      amount: parseFloat(amount) || 0,
      qty: parseFloat(qty) || 1,
      rate1: parseFloat(rate1) || 0,
      rate2: parseFloat(rate2) || 0,
      discount: parseFloat(discount) || 0,
      total: results.total,
      timestamp: Date.now()
    };
    const next = [entry, ...history].slice(0, 10);
    setHistory(next);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    toast({ title: "Audit Logged" });
  };

  const formatPKR = (val: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val).replace('PKR', 'Rs.');
  };

  const generateReport = () => {
    const lines = [
      `[MY KIT TOOL - TAX AUDIT REPORT]`,
      `Date: ${new Date().toLocaleString()}`,
      `---------------------------------`,
      `Unit Price: ${formatPKR(parseFloat(amount) || 0)}`,
      `Quantity: ${qty}`,
      `Subtotal: ${formatPKR(results.subtotal)}`,
      `Discount (${discountType}): ${discount}${discountType === '%' ? '%' : ''} (${formatPKR(results.discountAmount)})`,
      `Taxable Amount: ${formatPKR(results.taxable)}`,
      `---------------------------------`,
      `Tax 1 (${rate1}%): ${formatPKR(results.tax1)}`,
      `Tax 2 (${rate2}%): ${formatPKR(results.tax2)}`,
      `Combined Tax: ${formatPKR(results.tax1 + results.tax2)}`,
      `---------------------------------`,
      `FINAL GROSS TOTAL: ${formatPKR(results.total)}`,
      `---------------------------------`,
      `Calculation Mode: ${mode === 'add' ? 'Additive' : 'Inclusive'}`,
      `Processed strictly in local hardware memory.`
    ];
    return lines.join('\n');
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(generateReport());
    setIsCopied('report');
    toast({ title: "Audit Copied" });
    setTimeout(() => setIsCopied(null), 2000);
  };

  const downloadReport = () => {
    const blob = new Blob([generateReport()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tax_audit_${Date.now()}.txt`;
    a.click();
    toast({ title: "Master Exported" });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-full overflow-hidden">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Coins className="w-3.5 h-3.5" /> Fiscal Suite Pro
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
              Tax <span className="text-primary italic">Calculator Studio</span>
            </h1>
            <p className="text-foreground/40 text-sm md:text-base font-medium mt-2 max-w-2xl leading-relaxed">
              Professional fiscal analysis unit. Advanced sub-totals, discounts, dual-tax matrices, and clinical reporting protocols.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <GetHelp toolId="tax-calculator" />
             {parseFloat(amount) > 0 && (
               <Button variant="outline" size="sm" onClick={handleClear} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                 <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset Studio
               </Button>
             )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Input Matrix - Left */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
               <div className="flex items-center justify-between">
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Calculator className="w-5 h-5 text-primary" /> Parameters
                  </CardTitle>
                  <div className="grid grid-cols-2 bg-background p-1 rounded-xl border border-border h-10 w-40">
                    <button onClick={() => setMode('add')} className={cn("rounded-lg text-[8px] font-black uppercase transition-all", mode === 'add' ? "bg-primary text-white" : "text-foreground/40")}>Add</button>
                    <button onClick={() => setMode('included')} className={cn("rounded-lg text-[8px] font-black uppercase transition-all", mode === 'included' ? "bg-primary text-white" : "text-foreground/40")}>Inc.</button>
                  </div>
               </div>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
              {/* Primary Values Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
                 <div className="sm:col-span-8 space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Base Amount (Unit Price)</Label>
                    <div className="relative group/amt">
                       <Input 
                        type="number" value={amount} onChange={e => setAmount(e.target.value)}
                        className="h-16 bg-secondary border-border rounded-2xl text-2xl font-bold px-6 pl-14 focus:ring-primary/40"
                       />
                       <div className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground/20 font-black text-lg group-focus-within/amt:text-primary transition-colors">Rs.</div>
                    </div>
                 </div>
                 <div className="sm:col-span-4 space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Quantity</Label>
                    <div className="relative group/qty">
                       <Input 
                        type="number" value={qty} onChange={e => setQty(e.target.value)}
                        className="h-16 bg-secondary border-border rounded-2xl text-xl font-bold text-center focus:ring-primary/40"
                       />
                       <Package className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/10 group-focus-within/qty:text-primary transition-colors" />
                    </div>
                 </div>
              </div>

              {/* Discount Row */}
              <div className="p-6 rounded-[2rem] bg-secondary/50 border border-border space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <Tag className="w-4 h-4 text-primary" />
                       <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Pre-Tax Discount</Label>
                    </div>
                    <div className="flex bg-background p-0.5 rounded-lg border border-border">
                       <button onClick={() => setDiscountType('%')} className={cn("px-2 py-0.5 rounded text-[8px] font-black transition-all", discountType === '%' ? "bg-primary text-white" : "text-foreground/20")}>%</button>
                       <button onClick={() => setDiscountType('Rs')} className={cn("px-2 py-0.5 rounded text-[8px] font-black transition-all", discountType === 'Rs' ? "bg-primary text-white" : "text-foreground/20")}>Rs</button>
                    </div>
                 </div>
                 <Input 
                  type="number" value={discount} onChange={e => setDiscount(e.target.value)}
                  placeholder="0.00"
                  className="h-14 bg-background border-border rounded-xl text-lg font-bold px-6 text-center"
                 />
              </div>

              {/* Tax Matrix */}
              <div className="space-y-8">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                       <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Tax 1 (%)</Label>
                       <div className="relative group/t1">
                          <Input value={rate1} onChange={e => setRate1(e.target.value)} className="h-14 bg-secondary border-border rounded-xl text-lg font-bold text-center pr-10" />
                          <Percent className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/10 group-focus-within/t1:text-primary transition-colors" />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Tax 2 (%) (Extra)</Label>
                       <div className="relative group/t2">
                          <Input value={rate2} onChange={e => setRate2(e.target.value)} className="h-14 bg-secondary border-border rounded-xl text-lg font-bold text-center pr-10" />
                          <Percent className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/10 group-focus-within/t2:text-primary transition-colors" />
                       </div>
                    </div>
                 </div>

                 {/* Quick Chips Matrix */}
                 <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                       <Label className="text-[9px] font-black uppercase text-foreground/30 tracking-[0.2em]">Quick Protocol Matrix</Label>
                       <button onClick={() => setShowCompare(!showCompare)} className={cn("text-[9px] font-black uppercase transition-all", showCompare ? "text-primary" : "text-foreground/20")}>
                          {showCompare ? 'Exit Compare' : 'Compare Rates'}
                       </button>
                    </div>
                    <div className="flex overflow-x-auto no-scrollbar gap-2 py-1 scroll-smooth">
                       {DEFAULT_RATES.map(r => (
                         <button key={r} onClick={() => setRate1(r.toString())} className={cn("h-10 px-4 rounded-xl border text-[10px] font-black transition-all shrink-0", parseFloat(rate1) === r ? "bg-primary text-white border-primary shadow-lg" : "bg-background border-border text-foreground/40 hover:text-primary")}>
                            {r}%
                         </button>
                       ))}
                       {savedRates.map(r => (
                         <div key={r.id} className="relative group/chip shrink-0">
                            <button onClick={() => setRate1(r.value.toString())} className={cn("h-10 px-4 rounded-xl border text-[10px] font-black transition-all bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500 hover:text-white", parseFloat(rate1) === r.value && "bg-emerald-500 text-white border-emerald-500")}>
                              {r.name} ({r.value}%)
                            </button>
                            <button onClick={() => removeRate(r.id)} className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white opacity-0 group-hover/chip:opacity-100 transition-all flex items-center justify-center"><X className="w-2.5 h-2.5" /></button>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Registration Protocol */}
              <div className="p-6 rounded-[2.5rem] bg-secondary border border-border space-y-4">
                 <div className="flex gap-2">
                    <Input 
                      placeholder="NAME FOR RATE (E.G. GST)" 
                      value={newRateName}
                      onChange={e => setNewRateName(e.target.value)}
                      className="h-12 bg-background border-border rounded-xl text-[10px] font-black uppercase px-4"
                    />
                    <Button onClick={saveRateProtocol} disabled={!newRateName.trim()} className="h-12 w-12 rounded-xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 shrink-0">
                       <Save className="w-5 h-5" />
                    </Button>
                 </div>
                 <p className="text-[8px] text-foreground/20 font-black uppercase text-center">Save current Tax 1 value to local hardware registry.</p>
              </div>

              <div className="pt-4 flex gap-3">
                 <Button onClick={addToHistory} disabled={!amount} className="flex-[2] h-16 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl uppercase tracking-widest text-sm shadow-xl shadow-primary/30 active:scale-95 transition-all group/btn">
                    <CheckCircle2 className="w-6 h-6 mr-2 group-hover/btn:scale-110 transition-transform" /> Log Audit
                 </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Matrix - Right */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           {/* Summary Cards */}
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'Tax Portion', val: results.tax1 + results.tax2, icon: Percent, color: 'text-primary' },
                { label: 'Net Taxable', val: results.taxable, icon: Wallet, color: 'text-foreground/60' },
                { label: 'Gross Total', val: results.total, icon: Receipt, color: 'text-foreground' },
              ].map((res) => (
                <Card key={res.label} className="glass-card border-border shadow-xl hover:border-primary/20 transition-all group/res">
                   <CardContent className="p-8 space-y-4">
                      <div className="flex items-center justify-between">
                         <div className={cn("w-10 h-10 rounded-xl bg-secondary flex items-center justify-center border border-border transition-transform group-hover/res:scale-110", res.color)}>
                            <res.icon className="w-5 h-5" />
                         </div>
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

           {/* Comparison Matrix */}
           {showCompare && (
             <Card className="glass-card border-primary/20 bg-primary/[0.02] shadow-2xl overflow-hidden animate-in slide-in-from-top-4">
                <CardHeader className="py-6 border-b border-primary/10 bg-primary/5 flex flex-row items-center justify-between">
                   <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Differential Matrix</CardTitle>
                   <div className="flex items-center gap-4">
                      <Label className="text-[9px] font-black uppercase text-foreground/30">Target Rate:</Label>
                      <Input 
                        type="number" value={compareRate} onChange={e => setCompareRate(e.target.value)}
                        className="w-16 h-8 bg-background border-primary/20 rounded-lg text-[10px] font-black text-center"
                      />
                   </div>
                </CardHeader>
                <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="space-y-6">
                      <div className="space-y-2">
                        <p className="text-[9px] font-black uppercase text-foreground/20">Current Protocol ({rate1}%)</p>
                        <p className="text-2xl font-headline font-black text-foreground/60">{formatPKR(results.total)}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[9px] font-black uppercase text-primary/40">Target Protocol ({compareRate}%)</p>
                        <p className="text-2xl font-headline font-black text-primary">{formatPKR(compareResults?.total || 0)}</p>
                      </div>
                   </div>
                   <div className="p-8 rounded-[3rem] bg-background border-2 border-dashed border-primary/20 flex flex-col items-center justify-center text-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-xl">
                        {((compareResults?.total || 0) > results.total) ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-[13px] font-black uppercase text-foreground">Fiscal Delta</h4>
                        <p className={cn("text-xl font-headline font-bold", (compareResults?.total || 0) > results.total ? "text-red-500" : "text-green-500")}>
                           {formatPKR(Math.abs((compareResults?.total || 0) - results.total))}
                        </p>
                      </div>
                   </div>
                </CardContent>
             </Card>
           )}

           {/* Full Clinical Audit Card */}
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-6 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                      <Activity className="w-5 h-5" />
                   </div>
                   <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Clinical Audit Registry</CardTitle>
                 </div>
                 <div className="flex gap-2">
                    <Button variant="ghost" onClick={handleCopyReport} size="sm" className="h-9 px-4 text-[8px] font-black uppercase border border-white/5 bg-white/5 hover:text-primary">
                       {isCopied === 'report' ? <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> : <Copy className="w-3.5 h-3.5 mr-2" />} Copy
                    </Button>
                    <Button variant="ghost" onClick={downloadReport} size="sm" className="h-9 px-4 text-[8px] font-black uppercase border border-white/5 bg-white/5 hover:text-primary">
                       <FileDown className="w-3.5 h-3.5 mr-2" /> .TXT
                    </Button>
                 </div>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="p-8 sm:p-12 space-y-10">
                    <div className="flex flex-col items-center text-center gap-4">
                       <p className="text-[9px] font-black uppercase text-foreground/20 tracking-[0.4em]">Final Gross Production</p>
                       <h2 className="text-5xl sm:text-7xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
                          {formatPKR(results.total)}
                       </h2>
                       <div className="px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                          Mode: {mode === 'add' ? 'Additive' : 'Inclusive'} Logic
                       </div>
                    </div>

                    <div className="p-10 rounded-[3.5rem] bg-secondary/50 border border-border shadow-inner space-y-8 relative overflow-hidden group/audit">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover/audit:opacity-100 transition-opacity duration-700" />
                       
                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-foreground/40 border-b border-border pb-4">
                          <span>Fiscal Breakdown</span>
                          <span className="text-primary">Currency: PKR</span>
                       </div>

                       <div className="space-y-5">
                          <div className="flex justify-between items-center text-sm font-medium">
                             <span className="text-foreground/40 uppercase tracking-widest">Base Item Value</span>
                             <span className="text-foreground font-mono">{formatPKR(parseFloat(amount) || 0)}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm font-medium">
                             <span className="text-foreground/40 uppercase tracking-widest">Quantity Factor</span>
                             <span className="text-foreground font-mono">× {qty}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm font-medium pt-2">
                             <span className="text-foreground/40 uppercase tracking-widest">Gross Subtotal</span>
                             <span className="text-foreground font-mono">{formatPKR(results.subtotal)}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm font-medium text-emerald-500">
                             <span className="uppercase tracking-widest">Pre-Tax Discount {discountType === '%' && `(${discount}%)`}</span>
                             <span className="font-mono">-{formatPKR(results.discountAmount)}</span>
                          </div>
                          <div className="h-[1px] bg-border my-2" />
                          <div className="flex justify-between items-center text-base font-bold text-foreground/80">
                             <span className="uppercase tracking-widest">Net Taxable Amount</span>
                             <span className="font-mono">{formatPKR(results.taxable)}</span>
                          </div>
                          <div className="space-y-3 pt-2">
                             <div className="flex justify-between items-center text-sm font-medium text-primary">
                                <span className="uppercase tracking-widest">Primary Tax ({rate1}%)</span>
                                <span className="font-mono">+{formatPKR(results.tax1)}</span>
                             </div>
                             {parseFloat(rate2) > 0 && (
                               <div className="flex justify-between items-center text-sm font-medium text-primary/80">
                                  <span className="uppercase tracking-widest">Secondary Tax ({rate2}%)</span>
                                  <span className="font-mono">+{formatPKR(results.tax2)}</span>
                               </div>
                             )}
                          </div>
                          <div className="h-1 bg-border my-4" />
                          <div className="flex justify-between items-center">
                             <span className="text-foreground font-black uppercase font-headline text-xl tracking-tight">Total Payable</span>
                             <span className="text-primary font-black font-mono text-2xl">{formatPKR(results.total)}</span>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* History Matrix */}
                 {history.length > 0 && (
                   <div className="border-t border-border bg-black/20 p-8 sm:p-12 space-y-8 animate-in slide-in-from-bottom-4">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <History className="w-5 h-5 text-primary" />
                            <h4 className="text-[11px] font-black uppercase tracking-widest text-foreground/40">Audit Registry</h4>
                         </div>
                         <button onClick={() => setHistory([])} className="text-[9px] font-black uppercase text-foreground/20 hover:text-destructive transition-colors">Purge History</button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar no-scrollbar">
                         {history.map((h) => (
                           <div key={h.id} className="p-5 rounded-3xl bg-background border border-border flex items-center justify-between group hover:border-primary/20 transition-all">
                              <div className="flex items-center gap-5 min-w-0">
                                 <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                                    <Receipt className="w-5 h-5" />
                                 </div>
                                 <div className="min-w-0">
                                    <p className="text-[13px] font-black text-foreground truncate uppercase">{formatPKR(h.total)}</p>
                                    <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest mt-1">Qty {h.qty} • Tax {h.rate1}%{h.rate2 > 0 && `+${h.rate2}%`}</p>
                                 </div>
                              </div>
                              <button onClick={() => { setAmount(h.amount.toString()); setRate1(h.rate1.toString()); setRate2(h.rate2.toString()); setQty(h.qty.toString()); setDiscount(h.discount.toString()); }} className="text-[9px] font-black uppercase text-primary/40 hover:text-primary transition-all ml-4">RESTORE</button>
                           </div>
                         ))}
                      </div>
                   </div>
                 )}
              </CardContent>
           </Card>

           <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all shadow-lg">
             <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
             </div>
             <div className="space-y-2">
               <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Hardware-Native Synthesis</h4>
               <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                 Fiscal logic operates 100% locally in your browser memory. Data is never transmitted to cloud registries, ensuring absolute privacy for corporate financial drafts.
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
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
