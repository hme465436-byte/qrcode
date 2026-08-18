"use client"

import React, { useState } from 'react';
import { 
  Globe, 
  Search, 
  MapPin, 
  Users, 
  Coins, 
  Languages, 
  Navigation,
  Loader2,
  AlertCircle,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Country Finder Studio
 * Professional geographic discovery engine.
 */
export default function CountryPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // 1. Execute Discovery Handshake with encoded payload
      const response = await fetch("https://restcountries.com/v3.1/name/" + encodeURIComponent(q));
      const data = await response.json();

      if (response.ok && Array.isArray(data) && data.length > 0) {
        // 2. Isolate the primary country matrix
        setResult(data[0]);
      } else {
        setError("Target identity not identified in registry.");
      }
    } catch (err) {
      setError("Discovery Node Failure: Network protocol error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-4xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Globe className="w-3.5 h-3.5" /> Discovery Node
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Country <span className="text-primary italic">Finder</span>
        </h1>
      </div>

      <div className="space-y-8">
        {/* Search Input Card */}
        <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <CardHeader className="pb-8 border-b border-border bg-secondary/30">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
              <Search className="w-5 h-5 text-primary" /> Search Matrix
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-10">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter country name (e.g. Pakistan, Japan)..."
                  className="h-14 bg-secondary border-border rounded-xl font-bold uppercase px-6"
                />
              </div>
              <Button type="submit" disabled={isLoading} className="h-14 px-8 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-xl shadow-primary/30 active:scale-95 transition-all">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error Feedback */}
        {error && (
          <div className="p-6 rounded-[2rem] bg-destructive/10 border border-destructive/20 flex items-center gap-4 animate-in shake duration-500 shadow-lg">
            <AlertCircle className="w-6 h-6 text-destructive" />
            <p className="text-xs font-bold text-destructive uppercase tracking-widest">{error}</p>
          </div>
        )}

        {/* Result Matrix */}
        {result && (
          <div className="animate-in zoom-in-95 duration-500">
            <Card className="glass-card border-border shadow-2xl overflow-hidden bg-black/5">
              <CardContent className="p-8 sm:p-12 space-y-12">
                {/* Header: Flag & Names */}
                <div className="flex flex-col md:flex-row items-center gap-10 border-b border-white/5 pb-12">
                  <div className="w-full max-w-[240px] aspect-[3/2] rounded-2xl overflow-hidden shadow-xl border-2 border-white/10 shrink-0">
                    <img src={result.flags.svg} alt={result.name.common} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-center md:text-left space-y-2">
                    <h2 className="text-4xl sm:text-6xl font-headline font-black text-foreground uppercase tracking-tighter leading-none">
                      {result.name.common}
                    </h2>
                    <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em]">{result.name.official}</p>
                  </div>
                </div>

                {/* Data Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { icon: MapPin, label: 'Capital Protocol', val: result.capital?.join(', ') || '—' },
                    { icon: Navigation, label: 'Region Identity', val: result.region },
                    { icon: Users, label: 'Population Density', val: result.population.toLocaleString() },
                    { icon: Coins, label: 'Fiscal Protocol', val: Object.values(result.currencies || {}).map((c: any) => `${c.name} (${c.symbol})`).join(', ') || '—' },
                    { icon: Languages, label: 'Linguistic Stream', val: Object.values(result.languages || {}).join(', ') || '—' },
                  ].map((item, i) => (
                    <div key={i} className="p-6 rounded-3xl bg-secondary/50 border border-border group hover:border-primary/20 transition-all flex items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all shadow-inner shrink-0">
                        <item.icon className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[8px] font-black uppercase text-foreground/30 tracking-widest mb-0.5">{item.label}</p>
                        <p className="text-[13px] font-bold text-foreground truncate uppercase">{item.val}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
