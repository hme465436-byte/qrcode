"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Gamepad2, 
  Search, 
  Monitor, 
  Globe, 
  ExternalLink, 
  RefreshCcw, 
  Loader2, 
  AlertCircle,
  Filter,
  CheckCircle2,
  Zap,
  Info,
  Layers,
  LayoutGrid,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

interface Game {
  id: number;
  title: string;
  thumbnail: string;
  short_description: string;
  game_url: string;
  genre: string;
  platform: string;
  publisher: string;
  developer: string;
  release_date: string;
}

export default function FreeGamesPage() {
  const { toast } = useToast();
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'all' | 'pc' | 'browser'>('all');
  const [categoryFilter, setCategoryCategory] = useState('all');

  const fetchGames = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Direct API call
      const response = await fetch('https://www.freetogame.com/api/games');
      if (!response.ok) throw new Error("Registry node restricted.");
      
      const data = await response.json();
      setGames(data);
    } catch (err: any) {
      console.error(err);
      setError("Discovery Node Failure: The remote game registry is unreachable from your current node.");
      toast({ variant: "destructive", title: "Uplink Failed" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(games.map(g => g.genre));
    return Array.from(set).sort();
  }, [games]);

  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPlatform = platformFilter === 'all' || 
        (platformFilter === 'pc' && game.platform.toLowerCase().includes('pc')) ||
        (platformFilter === 'browser' && game.platform.toLowerCase().includes('web'));
      const matchesCategory = categoryFilter === 'all' || game.genre === categoryFilter;
      
      return matchesSearch && matchesPlatform && matchesCategory;
    });
  }, [games, searchQuery, platformFilter, categoryFilter]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Gamepad2 className="w-3.5 h-3.5" /> Entertainment Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
                Free Games <span className="text-primary italic">Discovery Studio</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional multi-platform game registry. Isolate high-fidelity free-to-play titles for PC and Browser with clinical category mapping and real-time search.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="free-games" />
              <Button variant="outline" size="sm" onClick={fetchGames} disabled={isLoading} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-primary transition-all">
                <RefreshCcw className={cn("w-3.5 h-3.5 mr-2", isLoading && "animate-spin")} /> Re-Sync Matrix
              </Button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls Panel */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
              <CardHeader className="pb-8 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Search className="w-5 h-5 text-primary" /> Filter Matrix
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-10 space-y-8">
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Search Identifier</Label>
                    <div className="relative group/input">
                       <Input 
                        placeholder="Search game title..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-14 bg-secondary border-border rounded-xl font-bold uppercase px-6 focus:ring-primary/40"
                       />
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
                          <Zap className="w-5 h-5 text-primary" />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Platform Protocol</Label>
                    <div className="grid grid-cols-3 gap-2">
                       {(['all', 'pc', 'browser'] as const).map(p => (
                         <button
                           key={p}
                           onClick={() => setPlatformFilter(p)}
                           className={cn(
                             "h-10 rounded-xl border text-[8px] font-black uppercase tracking-widest transition-all",
                             platformFilter === p ? "bg-primary text-white border-primary shadow-lg" : "bg-background border-border text-foreground/40 hover:text-primary"
                           )}
                         >
                           {p}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Category Mapping</Label>
                    <Select value={categoryFilter} onValueChange={setCategoryCategory}>
                       <SelectTrigger className="h-12 bg-secondary border-border rounded-xl font-bold uppercase text-[10px]">
                          <SelectValue />
                       </SelectTrigger>
                       <SelectContent className="glass-card max-h-[300px]">
                          <SelectItem value="all" className="text-[10px] font-black uppercase">All Categories</SelectItem>
                          {categories.map(c => (
                            <SelectItem key={c} value={c} className="text-[10px] font-black uppercase">{c}</SelectItem>
                          ))}
                       </SelectContent>
                    </Select>
                 </div>

                 <div className="pt-6 border-t border-white/5 space-y-4">
                    <div className="p-6 rounded-[2rem] bg-secondary/50 border border-border flex items-start gap-4">
                       <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                       <div className="space-y-1">
                          <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest">Privacy Sovereign</h4>
                          <p className="text-[9px] text-foreground/40 font-medium leading-relaxed uppercase">Queries are processed strictly in hardware memory.</p>
                       </div>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </aside>

        {/* Results Matrix */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
           {isLoading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <Card key={i} className="glass-card border-border overflow-hidden h-[400px]">
                     <Skeleton className="aspect-video w-full" />
                     <CardContent className="p-6 space-y-4">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-20 w-full" />
                     </CardContent>
                  </Card>
                ))}
             </div>
           ) : error ? (
             <Card className="glass-card border-destructive/20 bg-destructive/5 p-12 text-center flex flex-col items-center gap-6 animate-in shake">
                <AlertCircle className="w-16 h-16 text-destructive animate-bounce" />
                <div className="space-y-2">
                   <h3 className="text-xl font-headline font-black text-destructive uppercase">Reference Failure</h3>
                   <p className="text-sm text-foreground/40 font-bold uppercase">{error}</p>
                </div>
                <Button onClick={fetchGames} variant="outline" className="h-12 bg-secondary border border-border text-foreground font-black rounded-xl text-[9px] uppercase tracking-widest">Retry Protocol</Button>
             </Card>
           ) : (
             <div className="space-y-12">
                <div className="flex items-center justify-between px-2">
                   <div className="flex items-center gap-3">
                      <LayoutGrid className="w-4 h-4 text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Signal Results</span>
                   </div>
                   <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest px-3 py-1">
                      {filteredGames.length} Units Found
                   </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-in zoom-in-95 duration-500">
                   {filteredGames.slice(0, 100).map((game) => (
                     <Card 
                      key={game.id} 
                      className="glass-card border-border shadow-xl hover:border-primary/20 transition-all group/card overflow-hidden cursor-pointer flex flex-col"
                      onClick={() => window.open(game.game_url, '_blank')}
                     >
                        <div className="aspect-video relative overflow-hidden shrink-0 border-b border-border">
                           <img src={game.thumbnail} alt={game.title} className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700" />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
                           <div className="absolute bottom-4 right-4 opacity-0 group-hover/card:opacity-100 transition-all translate-y-2 group-hover/card:translate-y-0">
                              <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-2xl">
                                 <ExternalLink className="w-5 h-5" />
                              </div>
                           </div>
                        </div>
                        <CardContent className="flex-1 p-6 flex flex-col gap-4">
                           <div className="space-y-1">
                              <h3 className="text-lg font-headline font-black text-foreground uppercase tracking-tight group-hover/card:text-primary transition-colors line-clamp-1">{game.title}</h3>
                              <div className="flex flex-wrap gap-1.5">
                                 <Badge variant="outline" className="bg-background/50 text-[7px] font-black uppercase py-0.5 border-white/5">{game.genre}</Badge>
                                 <Badge variant="outline" className="bg-background/50 text-[7px] font-black uppercase py-0.5 border-white/5">
                                    {game.platform.includes('PC') ? <Monitor className="w-2 h-2 mr-1" /> : <Globe className="w-2 h-2 mr-1" />}
                                    {game.platform.split('(')[0]}
                                 </Badge>
                              </div>
                           </div>
                           <p className="text-[11px] text-foreground/40 font-medium leading-relaxed line-clamp-3 uppercase tracking-tighter">
                              {game.short_description}
                           </p>
                        </CardContent>
                     </Card>
                   ))}
                </div>
                
                {filteredGames.length === 0 && (
                   <div className="h-[400px] flex flex-col items-center justify-center opacity-10 space-y-6">
                      <Gamepad2 className="w-24 h-24 text-primary" />
                      <p className="text-sm font-black uppercase tracking-[0.3em]">Zero Signal Matches</p>
                   </div>
                )}
             </div>
           )}
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
