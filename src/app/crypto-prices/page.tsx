
"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  TrendingDown,
  Table as TableIcon,
  ChevronRight,
  MonitorPlay,
  Play,
  Pause,
  Banknote,
  Server,
  LineChart as LineChartIcon,
  Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

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

// Local list for instant filtering
const LOCAL_FILTER_COINS = [
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
const MARKETS_API = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h';
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
  market_cap_rank?: number;
}

interface MarketCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
}

interface ChartPoint {
  time: string;
  price: number;
}

export default function CryptoPricesPage() {
  const { toast } = useToast();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // State Matrix
  const [watchlist, setWatchlist] = useState<CoinIdentity[]>(DEFAULT_COINS);
  const [prices, setPrices] = useState<PriceData | null>(null);
  const [markets, setMarkets] = useState<MarketCoin[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<CoinIdentity[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  // Chart State
  const [activeChartId, setActiveChartId] = useState<string>('bitcoin');
  const [chartTimeframe, setChartTimeframe] = useState<string>('7');
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [chartStats, setChartStats] = useState({ high: 0, low: 0, current: 0 });

  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [displayCurrency, setDisplayCurrency] = useState<'USD' | 'PKR'>('USD');
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<number | null>(null);
  const [geoCity, setGeoCity] = useState<string>('Global Node');

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

    // Geocoding Handshake
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(data => {
        if (data.city && data.country_name) {
          setGeoCity(`${data.city}, ${data.country_name}`);
        }
      })
      .catch(() => {});
  }, []);

  // --- Click Outside Protocol ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Debounced Suggestion Protocol ---
  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    
    // Minimal requirement: 1 character
    if (query.length === 0) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setError(null);
      setSelectedIndex(-1);
      setShowDropdown(true);
      
      // 1. Local Matrix Filter
      const localMatches = LOCAL_FILTER_COINS.filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.symbol.toLowerCase().includes(query)
      );

      // 2. Global API Discovery Handshake
      try {
        const res = await fetch(`${SEARCH_API}${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error("Search node unavailable");
        
        const data = await res.json();
        const globalItems = (data.coins || []).map((c: any) => ({
          id: c.id,
          symbol: c.symbol.toUpperCase(),
          name: c.name,
          thumb: c.thumb,
          market_cap_rank: c.market_cap_rank
        }));

        setSuggestions(() => {
          const map = new Map();
          // Merge local and global, prioritize local
          localMatches.forEach(item => map.set(item.id, item));
          globalItems.forEach(item => map.set(item.id, item));
          return Array.from(map.values()).slice(0, 5); 
        });
      } catch (e: any) {
        setSuggestions(localMatches.slice(0, 5));
        if (query.length > 3) setError("Search uplink failure. Displaying local matches only.");
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // --- Chart Data Protocol ---
  const fetchChartData = useCallback(async () => {
    if (!activeChartId) return;
    setIsChartLoading(true);
    try {
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/${activeChartId}/market_chart?vs_currency=usd&days=${chartTimeframe}`);
      if (!response.ok) throw new Error("Chart node unreachable");
      
      const data = await response.json();
      const points: ChartPoint[] = data.prices.map((p: any) => ({
        time: new Date(p[0]).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit' }),
        price: p[1]
      }));

      const pricesArr = points.map(p => p.price);
      setChartStats({
        high: Math.max(...pricesArr),
        low: Math.min(...pricesArr),
        current: pricesArr[pricesArr.length - 1]
      });
      
      setChartData(points);
    } catch (e) {
      console.warn("Chart matrix sync delayed.");
    } finally {
      setIsChartLoading(false);
    }
  }, [activeChartId, chartTimeframe]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  const saveWatchlist = (newList: CoinIdentity[]) => {
    setWatchlist(newList);
    localStorage.setItem(PERSIST_KEY, JSON.stringify(newList));
  };

  // --- Telemetry Protocols ---
  const fetchMarkets = async () => {
    try {
      const response = await fetch(MARKETS_API);
      if (response.ok) {
        const data = await response.json();
        setMarkets(data);
      }
    } catch (e) {
      console.warn("Market matrix sync delayed.");
    }
  };

  const fetchPrices = useCallback(async (silent = false) => {
    if (watchlist.length === 0) return;
    if (!silent) setIsLoading(true);
    
    const ids = watchlist.map(c => c.id).join(',');
    const url = `${PRICE_API_BASE}?ids=${ids}&vs_currencies=usd,pkr&include_24hr_change=true`;

    try {
      const response = await fetch(url);
      
      if (response.status === 429) {
        if (!silent) setError("Rate Limit Active: Node restricted. Using cached matrix data.");
        return;
      }

      if (!response.ok) throw new Error("Financial nodes unreachable.");
      
      const data = await response.json();
      setPrices(data);
      setLastSync(Date.now());
      
      // Also update markets table
      fetchMarkets();
      
      if (!silent) {
        toast({ 
          title: "Market Sync Complete", 
          description: "Price matrix calibrated with real-time data." 
        });
      }
    } catch (err: any) {
      if (!silent) setError("Uplink failure. Market discovery nodes are unreachable.");
    } finally {
      setIsLoading(false);
    }
  }, [watchlist, toast]);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  useEffect(() => {
    if (isAutoRefresh) {
      const interval = setInterval(() => fetchPrices(true), 60000);
      return () => clearInterval(interval);
    }
  }, [isAutoRefresh, fetchPrices]);

  const addCoinToMonitor = (coin: CoinIdentity) => {
    if (!watchlist.find(c => c.id === coin.id)) {
      saveWatchlist([coin, ...watchlist]);
      toast({ title: "Asset Integrated", description: `${coin.name} added to monitor.` });
    } else {
      toast({ title: "Asset Present", description: "Identity already exists in monitor." });
    }
    setActiveChartId(coin.id);
    setSearchQuery('');
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0) {
        addCoinToMonitor(suggestions[selectedIndex]);
      } else if (searchQuery.trim()) {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    if (suggestions.length > 0) {
      const target = selectedIndex >= 0 ? suggestions[selectedIndex] : suggestions[0];
      addCoinToMonitor(target);
    } else {
      toast({ variant: "destructive", title: "Discovery Failed", description: "No asset identified." });
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
      minimumFractionDigits: val < 1 ? 4 : 2,
      maximumFractionDigits: val < 1 ? 6 : 2,
    }).format(val).replace('PKR', 'Rs.').replace('USD', '$');
  };

  const activeCoinMeta = useMemo(() => {
    return watchlist.find(c => c.id === activeChartId) || markets.find(m => m.id === activeChartId);
  }, [activeChartId, watchlist, markets]);

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
            Professional real-time financial matrix. Monitor global digital assets in USD and PKR with clinical precision.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 shrink-0 pb-2">
           <GetHelp toolId="crypto-prices" />
           
           <div className="flex items-center gap-2 bg-secondary/50 px-4 h-10 rounded-xl border border-border">
              <span className="text-[8px] font-black uppercase text-foreground/40">Auto Refresh</span>
              <Switch checked={isAutoRefresh} onCheckedChange={setIsAutoRefresh} className="scale-75" />
           </div>

           <Button variant="outline" size="sm" onClick={() => fetchPrices()} disabled={isLoading} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-primary transition-all">
              <RefreshCcw className={cn("w-3.5 h-3.5 mr-2", isLoading && "animate-spin")} /> Re-Sync
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Search & Management Column */}
        <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
           <Card className="glass-card border-border shadow-2xl overflow-visible relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
              <CardHeader className="pb-8 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Search className="w-5 h-5 text-primary" /> Discovery Protocol
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-10 space-y-6 relative">
                 <form onSubmit={handleSearch} className="space-y-4">
                    <div className="relative group/input" ref={dropdownRef}>
                       <Input 
                        placeholder="Search name or symbol..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => { if(searchQuery) setShowDropdown(true); }}
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

                       {/* Suggestions Dropdown */}
                       {showDropdown && suggestions.length > 0 && (
                          <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 animate-in slide-in-from-top-2 duration-300">
                             <div className="glass-card border-border shadow-2xl rounded-2xl overflow-hidden divide-y divide-white/5">
                                {suggestions.map((coin, idx) => (
                                  <button
                                    key={coin.id}
                                    type="button"
                                    onClick={() => addCoinToMonitor(coin)}
                                    className={cn(
                                      "w-full flex items-center justify-between p-4 transition-all group/sugg",
                                      selectedIndex === idx ? "bg-primary/10" : "hover:bg-primary/5"
                                    )}
                                  >
                                     <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-secondary border border-white/5 flex items-center justify-center overflow-hidden shadow-inner shrink-0">
                                           {coin.thumb ? <img src={coin.thumb} alt="" className="w-full h-full object-cover" /> : <Server className="w-4 h-4 text-foreground/10" />}
                                        </div>
                                        <div className="text-left min-w-0">
                                           <p className="text-[11px] font-bold uppercase truncate text-foreground group-hover/sugg:text-primary">{coin.name}</p>
                                           <p className="text-[9px] font-black text-foreground/20 uppercase">{coin.symbol}</p>
                                        </div>
                                     </div>
                                     <ChevronRight className="w-4 h-4 text-foreground/10 group-hover/sugg:text-primary transition-all group-hover/sugg:translate-x-1" />
                                  </button>
                                ))}
                             </div>
                          </div>
                       )}
                    </div>
                 </form>

                 <div className="pt-4 border-t border-white/5">
                    <div className="flex justify-between items-center mb-4">
                       <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Current Monitor</Label>
                       <button onClick={() => saveWatchlist(DEFAULT_COINS)} className="text-[9px] font-black text-primary/40 hover:text-primary uppercase transition-colors">Reset Default</button>
                    </div>
                    <div className="space-y-2 max-h-[300px] overflow-auto custom-scrollbar pr-2">
                       {watchlist.map(coin => (
                         <div key={coin.id} className={cn(
                           "flex items-center justify-between p-3 rounded-xl border transition-all group/row cursor-pointer",
                           activeChartId === coin.id ? "bg-primary/10 border-primary/40" : "bg-secondary/30 border-border hover:border-primary/20"
                         )} onClick={() => setActiveChartId(coin.id)}>
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center text-primary/40 font-bold text-[10px] overflow-hidden shadow-inner">
                                  {coin.thumb ? <img src={coin.thumb} className="w-full h-full object-cover" alt={coin.name} /> : coin.symbol.slice(0, 3)}
                               </div>
                               <div className="min-w-0">
                                  <p className="text-[10px] font-bold text-foreground truncate uppercase">{coin.name}</p>
                                  <p className="text-[8px] font-black text-foreground/20 uppercase">{coin.symbol}</p>
                               </div>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); removeCoin(coin.id); }} className="p-2 text-foreground/10 hover:text-red-500 transition-colors opacity-0 group-hover/row:opacity-100"><Trash2 className="w-3.5 h-3.5" /></button>
                         </div>
                       ))}
                    </div>
                 </div>
              </CardContent>
           </Card>

           <div className="p-8 rounded-[3rem] bg-primary/5 border border-primary/10 flex flex-col gap-6">
              <div className="flex items-center gap-4">
                 <Clock className="w-10 h-10 text-primary/40 shrink-0" />
                 <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-foreground/30 tracking-widest">Last Signal Sync</p>
                    <p className="text-sm font-bold text-foreground uppercase">
                       {lastSync ? new Date(lastSync).toLocaleTimeString() : 'Awaiting Protocol...'}
                    </p>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <Globe className="w-10 h-10 text-primary/40 shrink-0" />
                 <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-foreground/30 tracking-widest">Network Node</p>
                    <p className="text-sm font-bold text-foreground uppercase truncate">{geoCity || 'Global Discovery'}</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Main Dashboard - Right */}
        <div className="lg:col-span-8 space-y-8 animate-in fade-in duration-1000 stagger-2">
           
           {/* Visual Analytics Chart */}
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative">
              <CardHeader className="py-6 border-b border-border bg-secondary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40">
                       <LineChartIcon className="w-6 h-6" />
                    </div>
                    <div className="space-y-0.5">
                       <CardTitle className="text-xl font-headline font-black uppercase tracking-tight">
                         {activeCoinMeta?.name || 'Asset'} <span className="text-primary italic">Matrix</span>
                       </CardTitle>
                       <p className="text-[8px] font-black text-foreground/20 uppercase tracking-[0.2em]">Visual Data Stream</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-1.5 p-1 bg-background/50 rounded-xl border border-border">
                    {['1', '7', '30', '90', '365'].map((d) => (
                      <button
                        key={d}
                        onClick={() => setChartTimeframe(d)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all",
                          chartTimeframe === d ? "bg-primary text-white shadow-lg" : "text-foreground/40 hover:text-primary"
                        )}
                      >
                        {d === '1' ? '1D' : d === '7' ? '7D' : d === '30' ? '1M' : d === '90' ? '3M' : '1Y'}
                      </button>
                    ))}
                 </div>
              </CardHeader>
              
              <CardContent className="p-8 space-y-8">
                 <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="p-4 rounded-2xl bg-secondary/40 border border-border text-center space-y-1">
                       <p className="text-[8px] font-black uppercase text-foreground/30 tracking-widest">Period High</p>
                       <p className="text-sm font-bold text-foreground">{formatCurrency(chartStats.high, 'USD')}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-secondary/40 border border-border text-center space-y-1">
                       <p className="text-[8px] font-black uppercase text-foreground/30 tracking-widest">Period Low</p>
                       <p className="text-sm font-bold text-foreground">{formatCurrency(chartStats.low, 'USD')}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 text-center space-y-1">
                       <p className="text-[8px] font-black uppercase text-primary/60 tracking-widest">Current Signal</p>
                       <p className="text-sm font-bold text-primary">{formatCurrency(chartStats.current, 'USD')}</p>
                    </div>
                 </div>

                 <div className="h-[300px] w-full relative">
                    {isChartLoading && (
                      <div className="absolute inset-0 z-10 bg-background/40 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                         <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      </div>
                    )}
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={chartData}>
                          <defs>
                             <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                          <XAxis 
                            dataKey="time" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.2)', fontWeight: 'bold' }} 
                            minTickGap={30}
                          />
                          <YAxis 
                            domain={['auto', 'auto']} 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.2)', fontWeight: 'bold' }} 
                            tickFormatter={(val) => `$${val.toLocaleString()}`}
                            width={60}
                          />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'rgba(10,10,12,0.95)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
                            labelStyle={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}
                            itemStyle={{ color: 'hsl(var(--primary))', fontSize: '12px', fontWeight: 'bold' }}
                            formatter={(val: number) => [`$${val.toLocaleString()}`, 'Price']}
                          />
                          <Area type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" animationDuration={1500} />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </CardContent>
           </Card>

           {error && (
             <div className="p-6 rounded-[2rem] bg-amber-500/10 border border-amber-500/20 flex items-start gap-4 animate-in shake duration-500 shadow-xl">
                <AlertCircle className="w-6 h-6 text-amber-600 mt-1 shrink-0" />
                <div className="space-y-1">
                   <h4 className="text-[11px] font-black uppercase tracking-widest text-amber-700">Node Advisory</h4>
                   <p className="text-[12px] text-foreground/50 font-medium leading-relaxed">{error}</p>
                </div>
             </div>
           )}

           {/* Watchlist Quick View */}
           <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {watchlist.slice(0, 8).map((coin) => {
                const data = prices ? prices[coin.id] : null;
                if (!data) return null;
                const isUp = data.usd_24h_change >= 0;
                
                return (
                  <Card key={coin.id} 
                    onClick={() => setActiveChartId(coin.id)}
                    className={cn(
                      "glass-card border-border shadow-xl hover:border-primary/40 transition-all group overflow-hidden cursor-pointer",
                      activeChartId === coin.id ? "ring-2 ring-primary border-primary shadow-primary/10" : ""
                    )}
                  >
                     <CardContent className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-primary shadow-inner group-hover:scale-110 transition-transform overflow-hidden">
                                 {coin.thumb ? <img src={coin.thumb} className="w-full h-full object-cover" alt={coin.name} /> : <span className="text-[10px] font-black">{coin.symbol}</span>}
                              </div>
                              <div className="space-y-0.5">
                                 <h3 className="text-[11px] font-black text-foreground uppercase tracking-widest">{coin.name}</h3>
                                 <p className="text-[9px] font-bold text-foreground/20 uppercase">{coin.symbol}</p>
                              </div>
                           </div>
                           <Badge className={cn(
                             "text-[8px] font-black uppercase px-2 py-0.5 rounded-full",
                             isUp ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                           )}>
                              {isUp ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                              {Math.abs(data.usd_24h_change).toFixed(2)}%
                           </Badge>
                        </div>

                        <div className="space-y-3">
                           <div className="flex justify-between items-end border-b border-white/5 pb-2">
                              <span className="text-[8px] font-black text-foreground/20 uppercase tracking-[0.2em]">Local (PKR)</span>
                              <span className="text-lg font-headline font-black text-primary leading-none">{formatCurrency(data.pkr, 'PKR')}</span>
                           </div>
                           <div className="flex justify-between items-end">
                              <span className="text-[8px] font-black text-foreground/20 uppercase tracking-[0.2em]">Global (USD)</span>
                              <span className="text-sm font-headline font-black text-foreground/60 leading-none">{formatCurrency(data.usd, 'USD')}</span>
                           </div>
                        </div>
                     </CardContent>
                  </Card>
                );
              })}
           </div>

           {/* Market Matrix Table */}
           <Card className="glass-card border-border shadow-2xl overflow-hidden">
              <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner">
                       <TableIcon className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                       <CardTitle className="text-xl font-headline font-black uppercase tracking-tight">Market Intelligence</CardTitle>
                       <p className="text-[9px] font-black uppercase text-foreground/30 tracking-[0.3em]">Top 10 Assets by Cap</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-2 bg-background/50 p-1.5 rounded-2xl border border-border">
                    <button 
                      onClick={() => setDisplayCurrency('USD')}
                      className={cn("px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all", displayCurrency === 'USD' ? "bg-primary text-white shadow-lg" : "text-foreground/40 hover:text-primary")}
                    >
                       USD
                    </button>
                    <button 
                      onClick={() => setDisplayCurrency('PKR')}
                      className={cn("px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all", displayCurrency === 'PKR' ? "bg-primary text-white shadow-lg" : "text-foreground/40 hover:text-primary")}
                    >
                       PKR
                    </button>
                 </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto custom-scrollbar">
                 <Table className="w-full border-collapse">
                    <TableHeader className="bg-background/50">
                       <TableRow className="border-border hover:bg-transparent">
                          <TableHead className="w-12 sm:w-16 text-[9px] font-black uppercase text-foreground/30 text-center whitespace-nowrap">Rank</TableHead>
                          <TableHead className="text-[9px] font-black uppercase text-foreground/30 whitespace-nowrap">Asset Identity</TableHead>
                          <TableHead className="text-[9px] font-black uppercase text-foreground/30 text-right whitespace-nowrap">Market Price</TableHead>
                          <TableHead className="text-[9px] font-black uppercase text-foreground/30 text-right whitespace-nowrap">24H Volatility</TableHead>
                          <TableHead className="w-16 hidden md:table-cell"></TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       {markets.length === 0 && (
                          <TableRow>
                             <TableCell colSpan={5} className="h-64 text-center">
                                <div className="flex flex-col items-center gap-4 opacity-10">
                                   <Loader2 className="w-10 h-10 animate-spin" />
                                   <p className="text-[10px] font-black uppercase tracking-widest">Negotiating Market Uplink...</p>
                                </div>
                             </TableCell>
                          </TableRow>
                       )}
                       {markets.map((coin) => {
                         const isUp = coin.price_change_percentage_24h >= 0;
                         const pkrRate = (prices?.bitcoin?.pkr && prices?.bitcoin?.usd) ? prices.bitcoin.pkr / prices.bitcoin.usd : 280;
                         const priceToDisplay = displayCurrency === 'USD' ? coin.current_price : coin.current_price * pkrRate;

                         return (
                           <TableRow key={coin.id} className={cn(
                             "border-border hover:bg-primary/[0.03] transition-colors group cursor-pointer overflow-wrap-normal",
                             activeChartId === coin.id ? "bg-primary/[0.05]" : ""
                           )} onClick={() => { setActiveChartId(coin.id); if (!watchlist.find(w => w.id === coin.id)) { saveWatchlist([{ id: coin.id, name: coin.name, symbol: coin.symbol.toUpperCase(), thumb: coin.image }, ...watchlist]); toast({ title: "Asset Monitored" }); } }}>
                              <TableCell className="text-center font-mono text-[10px] font-bold text-foreground/20 whitespace-nowrap">
                                 #{coin.market_cap_rank}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                 <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-secondary border border-border p-1.5 shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                                       <img src={coin.image} className="w-full h-full object-contain" alt={coin.name} />
                                    </div>
                                    <div className="min-w-0">
                                       <p className="text-[11px] font-black uppercase text-foreground truncate max-w-[120px]">{coin.name}</p>
                                       <p className="text-[9px] font-bold text-foreground/20 uppercase">{coin.symbol}</p>
                                    </div>
                                 </div>
                              </TableCell>
                              <TableCell className="text-right whitespace-nowrap">
                                 <span className="text-sm font-headline font-black text-foreground">
                                    {formatCurrency(priceToDisplay, displayCurrency)}
                                 </span>
                              </TableCell>
                              <TableCell className="text-right whitespace-nowrap">
                                 <div className={cn("inline-flex items-center font-bold text-[10px] uppercase", isUp ? "text-green-500" : "text-red-500")}>
                                    {isUp ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                                    {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                                 </div>
                              </TableCell>
                              <TableCell className="text-center hidden md:table-cell">
                                 <button className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-foreground/10 group-hover:text-primary transition-all shadow-sm">
                                    <ChevronRight className="w-4 h-4" />
                                 </button>
                              </TableCell>
                           </TableRow>
                         );
                       })}
                    </TableBody>
                 </Table>
              </CardContent>
           </Card>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Privacy Sovereign</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Market discovery is performed anonymously. Your custom watchlist and session metadata are stored strictly in local browser memory.
                  </p>
                </div>
             </div>
             <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <Zap className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Real-Time Sync</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Dual-pass API protocols ensure global market rates are synchronized with 1:1 fiscal fidelity across active nodes.
                  </p>
                </div>
             </div>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .recharts-area-chart { filter: drop-shadow(0 0 10px hsla(var(--primary), 0.2)); }
        .recharts-cartesian-axis-tick-value { font-family: 'Space Grotesk', sans-serif !important; }
        .overflow-wrap-normal { overflow-wrap: normal !important; word-break: normal !important; }
      `}</style>
    </div>
  );
}
