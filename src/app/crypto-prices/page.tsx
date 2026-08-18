"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Coins, 
  RefreshCcw, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  Activity, 
  Globe, 
  ShieldCheck, 
  Zap, 
  AlertCircle, 
  Loader2, 
  History,
  Info,
  CheckCircle2,
  DollarSign,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

// --- Configuration Matrix ---
const COINS = [
  { id: 'bitcoin', symbol: 'BTC', label: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', label: 'Ethereum' },
  { id: 'tether', symbol: 'USDT', label: 'Tether' },
  { id: 'binancecoin', symbol: 'BNB', label: 'BNB' },
  { id: 'solana', symbol: 'SOL', label: 'Solana' },
];

const API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,binancecoin,solana&vs_currencies=usd,pkr&include_24hr_change=true';

interface PriceData {
  [key: string]: {
    usd: number;
    pkr: number;
    usd_24h_change: number;
  };
}

export default function CryptoPricesPage() {
  const { toast } = useToast();
  const [prices, setPrices] = useState<PriceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<number | null>(null);

  const fetchPrices = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Financial nodes unreachable.");
      
      const data = await response.json();
      setPrices(data);
      setLastSync(Date.now());
      
      if (!silent) {
        toast({ 
          title: "Market Sync Complete", 
          description: "Price matrix calibrated with real-time data." 
        });
      }
    } catch (err: any) {
      setError("Uplink failure. Market discovery nodes are unreachable.");
      toast({ variant: "destructive", title: "Sync Failed" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPrices();
    // Auto-refresh every 60 seconds if tab is active
    const interval = setInterval(() => fetchPrices(true), 60000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  const formatCurrency = (val: number, currency: 'USD' | 'PKR') => {
    return new Intl.NumberFormat(currency === 'PKR' ? 'en-PK' : 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: val < 1 ? 4 : 2,
      maximumFractionDigits: val < 1 ? 6 : 2,
    }).format(val).replace('PKR', 'Rs.');
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
            <TrendingUp className="w-3.5 h-3.5" /> Market Telemetry
          </div>
          <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
            Crypto <span className="text-primary italic">Prices Studio</span>
          </h1>
          <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
            Professional real-time financial matrix. Monitor Bitcoin, Ethereum, and major digital assets in USD and PKR with clinical precision.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 pb-2">
           <GetHelp toolId="crypto-prices" />
           <Button variant="outline" size="sm" onClick={() => fetchPrices()} disabled={isLoading} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-primary transition-all">
              <RefreshCcw className={cn("w-3.5 h-3.5 mr-2", isLoading && "animate-spin")} /> Re-Sync
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Price Matrix */}
        <div className="lg:col-span-8 space-y-6">
           {isLoading && !prices && (
             <div className="min-h-[500px] flex flex-col items-center justify-center gap-8">
                <div className="relative">
                   <div className="w-24 h-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                   <Coins className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />
                </div>
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-primary">Negotiating Market Uplink...</p>
             </div>
           )}

           {error && (
             <Card className="glass-card border-destructive/20 bg-destructive/5 p-12 text-center flex flex-col items-center gap-6">
                <AlertCircle className="w-16 h-16 text-destructive animate-bounce" />
                <div className="space-y-2">
                   <h3 className="text-xl font-headline font-black text-destructive uppercase">Matrix Error</h3>
                   <p className="text-[11px] text-foreground/40 font-bold uppercase max-w-sm mx-auto">{error}</p>
                </div>
                <Button onClick={() => fetchPrices()} className="h-12 bg-secondary border border-border text-foreground font-black rounded-xl text-[9px] uppercase tracking-widest">Restart Protocol</Button>
             </Card>
           )}

           {prices && (
             <div className="grid grid-cols-1 gap-4 animate-in fade-in duration-700">
                {COINS.map((coin) => {
                  const data = prices[coin.id];
                  if (!data) return null;
                  const isUp = data.usd_24h_change >= 0;
                  
                  return (
                    <Card key={coin.id} className="glass-card border-border shadow-xl hover:border-primary/30 transition-all group">
                       <CardContent className="p-6 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                          <div className="flex items-center gap-6">
                             <div className="w-16 h-16 rounded-[1.5rem] bg-secondary border border-border flex items-center justify-center text-primary shadow-inner group-hover:scale-110 transition-transform">
                                <span className="text-xl font-black">{coin.symbol}</span>
                             </div>
                             <div className="space-y-1">
                                <h3 className="text-2xl font-headline font-black text-foreground uppercase tracking-tight">{coin.label}</h3>
                                <div className="flex items-center gap-2">
                                   <Badge className={cn(
                                     "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                                     isUp ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                                   )}>
                                      {isUp ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                                      {Math.abs(data.usd_24h_change).toFixed(2)}%
                                   </Badge>
                                   <span className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">24H SIG</span>
                                </div>
                             </div>
                          </div>

                          <div className="grid grid-cols-2 gap-10 sm:text-right">
                             <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase text-foreground/30 tracking-widest">Market (USD)</p>
                                <p className="text-xl sm:text-2xl font-headline font-bold text-foreground leading-none">
                                   {formatCurrency(data.usd, 'USD')}
                                </p>
                             </div>
                             <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase text-foreground/30 tracking-widest">Local (PKR)</p>
                                <p className="text-xl sm:text-2xl font-headline font-bold text-primary leading-none">
                                   {formatCurrency(data.pkr, 'PKR')}
                                </p>
                             </div>
                          </div>
                       </CardContent>
                    </Card>
                  );
                })}
             </div>
           )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
           <Card className="glass-card border-border shadow-xl">
              <CardHeader className="py-6 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground/60">
                    <Activity className="w-5 h-5 text-primary" /> Session Intelligence
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                 <div className="p-6 rounded-[2rem] bg-secondary/50 border border-border flex flex-col items-center text-center gap-4">
                    <Clock className="w-8 h-8 text-primary/40" />
                    <div className="space-y-1">
                       <p className="text-[9px] font-black uppercase text-foreground/30 tracking-widest">Last Signal Sync</p>
                       <p className="text-sm font-bold text-foreground uppercase">
                          {lastSync ? new Date(lastSync).toLocaleTimeString() : 'Awaiting...'}
                       </p>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="flex gap-4 group/item">
                       <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary/40 shrink-0 border border-border group-hover/item:text-primary transition-colors">
                          <Globe className="w-5 h-5" />
                       </div>
                       <div className="min-w-0">
                          <p className="text-[8px] font-black uppercase text-foreground/20 tracking-widest mb-0.5">Global Protocol</p>
                          <h4 className="text-[11px] font-bold text-foreground truncate uppercase">CoinGecko V3 API</h4>
                       </div>
                    </div>
                    <div className="flex gap-4 group/item">
                       <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary/40 shrink-0 border border-border group-hover/item:text-primary transition-colors">
                          <Zap className="w-5 h-5" />
                       </div>
                       <div className="min-w-0">
                          <p className="text-[8px] font-black uppercase text-foreground/20 tracking-widest mb-0.5">Refresh Frequency</p>
                          <h4 className="text-[11px] font-bold text-foreground truncate uppercase">60s Dynamic Cycle</h4>
                       </div>
                    </div>
                 </div>
              </CardContent>
           </Card>

           <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
             <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
             </div>
             <div className="space-y-2">
               <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Privacy Sovereign</h4>
               <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                 Price discovery is performed anonymously. No financial identifiers, wallets, or search queries are stored or transmitted.
               </p>
             </div>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
      `}</style>
    </div>
  );
}
