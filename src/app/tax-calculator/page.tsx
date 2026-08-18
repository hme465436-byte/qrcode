
"use client"

import React, { useState, useMemo } from 'react';
import { 
  Coins, 
  Trash2, 
  Copy, 
  CheckCircle2, 
  Info,
  Zap,
  Calculator,
  Wallet,
  ShieldCheck,
  Percent,
  Receipt,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

const QUICK_RATES = [1, 5, 10, 15, 16, 18, 20, 30];

export default function TaxCalculatorPage() {
  const { toast } = useToast();
  
  // --- Input State ---
  const [amount, setAmount] = useState<string>('1000');
  const [taxPercent, setTaxPercent] = useState<string>('15');
  const [mode, setMode] = useState<'add' | 'included'>('add');
  const [isCopied, setIsCopied] = useState(false);

  // --- Logic Matrix ---
  const results = useMemo(() => {
    const amt = parseFloat(amount) || 0;
    const pct = parseFloat(taxPercent) || 0;
    
    let tax = 0;
    let withoutTax = 0;
    let total = 0;

    if (mode === 'add') {
      tax = amt * (pct / 100);
      withoutTax = amt;
      total = amt + tax;
    } else {
      total = amt;
      withoutTax = amt / (1 + (pct / 100));
      tax = amt - withoutTax;
    }

    return { tax, withoutTax, total };
  }, [amount, taxPercent, mode]);

  // --- Actions ---
  const handleClear = () => {
    setAmount('0');
    setTaxPercent('15');
    setMode('add');
    toast({ title: "Studio Reset" });
  };

  const handleCopy = () => {
    const text = `Amount: Rs. ${amount}\nTax (${taxPercent}%): Rs. ${results.tax.toFixed(2)}\nWithout Tax: Rs. ${results.withoutTax.toFixed(2)}\nTotal: Rs. ${results.total.toFixed(2)}`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast({ title: "Results Copied" });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const formatPKR = (val: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 2,
    }).format(val).replace('PKR', 'Rs.');
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
              Tax <span className="text-primary italic">Calculator</span>
            </h1>
            <p className="text-foreground/40 text-sm md:text-base font-medium mt-2 max-w-2xl leading-relaxed">
              Simple and professional tax utility. Calculate extra percentage or reverse-lookup original prices instantly.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <GetHelp toolId="tax-calculator" />
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
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
               <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                 <Calculator className="w-5 h-5 text-primary" /> Parameters
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-10">
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Amount (PKR)</Label>
                  <div className="relative group/amt">
                    <Input 
                      type="number" value={amount} onChange={e => setAmount(e.target.value)}
                      className="h-16 bg-secondary border-border rounded-2xl text-2xl font-bold px-6 pl-14 focus:ring-primary/40"
                    />
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground/20 font-black text-lg group-focus-within/amt:text-primary transition-colors">Rs.</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Tax Percentage (%)</Label>
                  <div className="relative group/t1">
                    <Input value={taxPercent} onChange={e => setTaxPercent(e.target.value)} className="h-14 bg-secondary border-border rounded-xl text-lg font-bold text-center pr-10" />
                    <Percent className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/10 group-focus-within/t1:text-primary transition-colors" />
                  </div>
                  
                  <div className="flex overflow-x-auto no-scrollbar gap-2 py-1 scroll-smooth">
                    {QUICK_RATES.map(r => (
                      <button 
                        key={r} 
                        onClick={() => setTaxPercent(r.toString())} 
                        className={cn(
                          "h-10 px-4 rounded-xl border text-[10px] font-black transition-all shrink-0", 
                          parseFloat(taxPercent) === r ? "bg-primary text-white border-primary shadow-lg" : "bg-background border-border text-foreground/40 hover:text-primary"
                        )}
                      >
                        {r}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setMode('add')} 
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border transition-all h-24",
                    mode === 'add' ? "bg-primary text-white border-primary shadow-xl scale-[1.02]" : "bg-background border-border text-foreground/40 hover:text-primary"
                  )}
                >
                  <Zap className="w-5 h-5" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Add Tax</span>
                </button>
                <button 
                  onClick={() => setMode('included')} 
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border transition-all h-24",
                    mode === 'included' ? "bg-primary text-white border-primary shadow-xl scale-[1.02]" : "bg-background border-border text-foreground/40 hover:text-primary"
                  )}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Included</span>
                </button>
              </div>

              <div className="pt-2">
                 <Button onClick={handleCopy} disabled={!amount} className="w-full h-14 bg-white text-black font-black rounded-xl uppercase tracking-widest text-[10px] shadow-xl">
                   {isCopied ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                   Copy Results
                 </Button>
              </div>
            </CardContent>
          </Card>

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
            <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-1">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Protocol Tip</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                {mode === 'add' ? "Add tax = Extra % on top of your amount." : "Included = % already inside the amount."}
              </p>
            </div>
          </div>
        </div>

        {/* Results - Right */}
        <div className="lg:col-span-7 space-y-6 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           <div className="grid grid-cols-1 gap-6">
              {[
                { label: 'Tax Portion', val: results.tax, icon: Percent, color: 'text-primary' },
                { label: 'Without Tax (Net)', val: results.withoutTax, icon: Wallet, color: 'text-foreground/40' },
                { label: 'Total Amount (Gross)', val: results.total, icon: Receipt, color: 'text-foreground' },
              ].map((res) => (
                <Card key={res.label} className="glass-card border-border shadow-xl hover:border-primary/20 transition-all group/res">
                   <CardContent className="p-10 flex items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                         <div className={cn("w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center border border-border shadow-inner transition-transform group-hover/res:scale-110", res.color)}>
                            <res.icon className="w-7 h-7" />
                         </div>
                         <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-foreground/30 tracking-widest">{res.label}</p>
                            <h3 className={cn("text-3xl sm:text-4xl font-headline font-black truncate leading-none", res.color)}>
                               {formatPKR(res.val)}
                            </h3>
                         </div>
                      </div>
                      <button onClick={() => { navigator.clipboard.writeText(res.val.toFixed(2)); toast({ title: "Value Copied" }); }} className="text-foreground/10 hover:text-primary transition-colors">
                        <Copy className="w-5 h-5" />
                      </button>
                   </CardContent>
                </Card>
              ))}
           </div>

           <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all shadow-lg">
             <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
             </div>
             <div className="space-y-2">
               <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Hardware-Native Synthesis</h4>
               <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                 Fiscal logic operates 100% locally in your browser memory. Data is never transmitted to cloud registries, ensuring absolute privacy.
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
      `}</style>
    </div>
  );
}
