"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Clock,
  Search,
  Plus,
  Trash2,
  X,
  TrendingDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

// --- Configuration Matrix ---
const DEFAULT_COINS = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'tether', symbol: 'USDT', name: 'Tether' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
];

const SEARCH_API = 'https://api.coingecko.com/api/v3/search?query=';
const PRICE_API_BASE = 'https://api.coingecko.com/api/v3/simple/price';
const PERSIST_KEY = 'mykit_crypto_watchlist_v3';

interface PriceData {
  [key: string]: {
    usd: number;
    pkr: number;
    usd_24h_change: number;
  };
}

interface CoinIdentity {
  id: string;
  symbol: string;
  name: string;
  thumb?: string;
}

export default function CryptoPricesPage() {
  const { toast } = useToast();
  
  // State Matrix
  const [watchlist, setWatchlist] = useState<CoinIdentity[]>(DEFAULT_COINS);
  const [prices, setPrices] = useState<PriceData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<number | null>(null);

  // --- Persistence Handshake ---
  useEffect(() => {
    const saved = localStorage.getItem(PERSIST_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setWatchlist(parsed);
        }
      } catch (e) {
        console.error("Watchlist reconstruction failed.");
      }
    }
  }, []);

  const saveWatchlist = (newList: CoinIdentity[]) => {
    setWatchlist(newList);
    localStorage.setItem(PERSIST_KEY, JSON.stringify(newList));
  };

  // --- Telemetry Protocols ---

  const fetchPrices = useCallback(async (silent = false) => {
    if (watchlist.length === 0) return;
    if (!silent) setIsLoading(true);
    setError(null);

    const ids = watchlist.map(c => c.id).join(',');
    const url = `${PRICE_API_BASE}?ids=${ids}&vs_currencies=usd,pkr&include_24hr_change=true`;

    try {
      const response = await fetch(url);
      
      if (response.status === 429) {
        setError("Rate Limit Active: Global discovery nodes are throttled. Please wait 60 seconds.");
        return;
      }

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
  }, [watchlist, toast]);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(() => fetchPrices(true), 60000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchQuery.trim() || isSearching) return;

    setIsSearching(true);
    setError(null);

    try {
      const res = await fetch(`${SEARCH_API}${encodeURIComponent(searchQuery.trim())}`);
      if (res.status === 429) {
         setError("Search Throttled: discovery node restricted. Wait 60s.");
         return;
      }
      const data = await res.json();
      
      if (data.coins && data.coins.length > 0) {
        const found = data.coins[0];
        const newCoin: CoinIdentity = {
          id: found.id,
          symbol: found.symbol.toUpperCase(),
          name: found.name,
          thumb: found.thumb
        };

        // Avoid duplicates in matrix
        if (!watchlist.find(c => c.id === newCoin.id)) {
          saveWatchlist([newCoin, ...watchlist]);
          toast({ title: "Asset Integrated", description: `${newCoin.name} added to monitor.` });
        } else {
          toast({ title: "Asset Present", description: "Identity already exists in monitor." });
        }
        setSearchQuery('');
      } else {
        toast({ variant: "destructive", title: "Discovery Failed", description: "No asset identified for this query." });
      }
    } catch (err) {
      setError("Search uplink failure.");
    } finally {
      setIsSearching(false);
    }
  };

  const removeCoin = (id: string) => {
    const next = watchlist.filter(c => c.id !== id);
    saveWatchlist(next);
    toast({ title: "Asset Purged" });
  };

  const formatCurrency = (val: number, currency: 'USD' | 'PKR') => {
    return new Intl.NumberFormat(currency === 'PKR' ? 'en-PK' : 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: val < 0.1 ? 4 : 2,
      maximumFractionDigits: val < 0.1 ? 6 : 2,
    }).format(val).replace('PKR', 'Rs.');
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
            <TrendingUp className="w-3.5 h-3.5" /> Market Telemetry
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-headline font-black text-foreground uppercase tracking-tight">
            Crypto <span className="text-primary italic">Prices Studio</span>
          </h1>
          <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
            Professional real-time financial matrix. Monitor global digital assets in USD and PKR with clinical precision. Search and expand your monitor in real-time.
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
        
        {/* Search & Management Column */}
        <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <CardHeader className="pb-8 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Search className="w-5 h-5 text-primary" /> Discovery Protocol
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-10 space-y-6">
                 <form onSubmit={handleSearch} className="space-y-4">
                    <div className="relative group/input">
                       <Input 
                        placeholder="Search coin (e.g. Polkadot)..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="h-16 bg-secondary border-border rounded-2xl text-sm font-bold px-6 focus:ring-primary/40 uppercase"
                       />
                       <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <Button 
                            type="submit" 
                            disabled={!searchQuery.trim() || isSearching}
                            size="icon" 
                            className="h-10 w-10 rounded-xl bg-primary text-white shadow-lg"
                          >
                             {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                          </Button>
                       </div>
                    </div>
                    <p className="text-[9px] text-foreground/20 font-bold uppercase tracking-widest text-center">Identifying via CoinGecko V3 Nodes</p>
                 </form>

                 <div className="pt-4 border-t border-white/5">
                    <div className="flex justify-between items-center mb-4">
                       <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Current Monitor</Label>
                       <button onClick={() => saveWatchlist(DEFAULT_COINS)} className="text-[9px] font-black text-primary/40 hover:text-primary uppercase">Reset Default</button>
                    </div>
                    <div className="space-y-2 max-h-[300px] overflow-auto custom-scrollbar pr-2">
                       {watchlist.map(coin => (
                         <div key={coin.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border group/row hover:border-primary/20 transition-all">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center text-primary/40 font-bold text-[10px] overflow-hidden">
                                  {coin.thumb ? <img src={coin.thumb} className="w-full h-full object-cover" /> : coin.symbol.slice(0, 3)}
                               </div>
                               <div className="min-w-0">
                                  <p className="text-[10px] font-bold text-foreground truncate uppercase">{coin.name}</p>
                                  <p className="text-[8px] font-black text-foreground/20 uppercase">{coin.symbol}</p>
                               </div>
                            </div>
                            <button onClick={() => removeCoin(coin.id)} className="p-2 text-foreground/10 hover:text-red-500 transition-colors opacity-0 group-hover/row:opacity-100"><Trash2 className="w-3.5 h-3.5" /></button>
                         </div>
                       ))}
                    </div>
                 </div>
              </CardContent>
           </Card>

           <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                 <Clock className="w-8 h-8 text-primary/40" />
                 <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-foreground/30 tracking-widest">Last Signal Sync</p>
                    <p className="text-sm font-bold text-foreground uppercase">
                       {lastSync ? new Date(lastSync).toLocaleTimeString() : 'Awaiting...'}
                    </p>
                 </div>
              </div>
           </div>
        </div>

        {/* Main Price Matrix */}
        <div className="lg:col-span-8 space-y-6 animate-in fade-in duration-1000 stagger-2">
           {error && (
             <div className="p-6 rounded-[2rem] bg-amber-500/10 border border-amber-500/20 flex items-start gap-4 animate-in shake duration-500">
                <AlertCircle className="w-6 h-6 text-amber-600 mt-1 shrink-0" />
                <div className="space-y-1">
                   <h4 className="text-[11px] font-black uppercase tracking-widest text-amber-700">Protocol Notice</h4>
                   <p className="text-[12px] text-foreground/50 font-medium leading-relaxed">{error}</p>
                </div>
             </div>
           )}

           {isLoading && !prices && (
             <div className="min-h-[500px] flex flex-col items-center justify-center gap-8">
                <div className="relative">
                   <div className="w-24 h-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                   <Coins className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />
                </div>
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-primary">Negotiating Market Uplink...</p>
             </div>
           )}

           {prices && (
             <div className="grid grid-cols-1 gap-4 animate-in fade-in duration-700">
                {watchlist.map((coin) => {
                  const data = prices[coin.id];
                  if (!data) return null;
                  const isUp = data.usd_24h_change >= 0;
                  
                  return (
                    <Card key={coin.id} className="glass-card border-border shadow-xl hover:border-primary/30 transition-all group">
                       <CardContent className="p-6 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                          <div className="flex items-center gap-6">
                             <div className="w-16 h-16 rounded-[1.5rem] bg-secondary border border-border flex items-center justify-center text-primary shadow-inner group-hover:scale-110 transition-transform overflow-hidden">
                                {coin.thumb ? <img src={coin.thumb} className="w-full h-full object-cover scale-150" /> : <span className="text-xl font-black">{coin.symbol.slice(0, 3)}</span>}
                             </div>
                             <div className="space-y-1">
                                <h3 className="text-2xl font-headline font-black text-foreground uppercase tracking-tight">{coin.name}</h3>
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

           <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
             <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
             </div>
             <div className="space-y-2">
               <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Privacy Sovereign</h4>
               <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                 Price discovery is performed anonymously. Your watchlist is stored strictly in local browser memory and never transmitted to our infrastructure.
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
