"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileCode, 
  Search, 
  Globe, 
  ExternalLink, 
  RefreshCcw, 
  Loader2, 
  AlertCircle,
  Zap,
  CheckCircle2,
  Info,
  Layers,
  LayoutGrid,
  ShieldCheck,
  BookOpen,
  Code2,
  Tag,
  ArrowRight,
  Terminal,
  Trash2,
  SortAsc,
  Check
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

interface Resource {
  id: number;
  description: string;
  url: string;
  types: string[];
  topics: string[];
  levels: string[];
}

export default function CodingResourcesPage() {
  const { toast } = useToast();
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const fetchResources = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('https://api.sampleapis.com/codingresources/codingResources');
      if (!response.ok) throw new Error("Registry node restricted.");
      const data = await response.json();
      setResources(data);
    } catch (err: any) {
      setError("Discovery Node Failure: The remote learning registry is unreachable.");
      toast({ variant: "destructive", title: "Uplink Failed" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const allTopics = useMemo(() => {
    const topics = new Set<string>();
    resources.forEach(r => r.topics.forEach(t => topics.add(t)));
    return Array.from(topics).sort();
  }, [resources]);

  const filteredAndSortedResources = useMemo(() => {
    let result = resources.filter(res => {
      const searchTarget = `${res.description} ${res.topics.join(' ')} ${res.types.join(' ')}`.toLowerCase();
      const matchesSearch = searchTarget.includes(searchQuery.toLowerCase());
      const matchesTopic = selectedTopic === 'all' || res.topics.includes(selectedTopic);
      return matchesSearch && matchesTopic;
    });

    result.sort((a, b) => {
      const nameA = a.description.toLowerCase();
      const nameB = b.description.toLowerCase();
      if (sortOrder === 'asc') return nameA.localeCompare(nameB);
      return nameB.localeCompare(nameA);
    });

    return result;
  }, [resources, searchQuery, selectedTopic, sortOrder]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <FileCode className="w-3.5 h-3.5" /> Intelligence Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
                Coding Resources <span className="text-primary italic">Discovery Studio</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional technical discovery engine. Isolate high-fidelity learning assets, documentation, and development protocols locally via the global resources matrix.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="coding-resources" />
              {(resources.length > 0 || error) && (
                <Button variant="outline" size="sm" onClick={fetchResources} disabled={isLoading} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-primary transition-all">
                  <RefreshCcw className={cn("w-3.5 h-3.5 mr-2", isLoading && "animate-spin")} /> Re-Sync Matrix
                </Button>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls Panel */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
              <CardHeader className="pb-8 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground/60">
                    <Search className="w-5 h-5 text-primary" /> Discovery Filter
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-10 space-y-8">
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Search Identifier</Label>
                    <div className="relative group/input">
                       <Input 
                        placeholder="Search topics (e.g. React, JS)..." 
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
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Topic Mapping</Label>
                    <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                       <SelectTrigger className="h-12 bg-secondary border-border rounded-xl font-bold uppercase text-[10px]">
                          <SelectValue placeholder="All Topics" />
                       </SelectTrigger>
                       <SelectContent className="glass-card max-h-[300px]">
                          <SelectItem value="all" className="text-[10px] font-black uppercase">All Topics</SelectItem>
                          {allTopics.map(topic => (
                            <SelectItem key={topic} value={topic} className="text-[10px] font-black uppercase">{topic}</SelectItem>
                          ))}
                       </SelectContent>
                    </Select>
                 </div>

                 <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Sort Protocol</Label>
                    <div className="grid grid-cols-2 gap-2">
                       <button
                         onClick={() => setSortOrder('asc')}
                         className={cn(
                           "h-10 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all",
                           sortOrder === 'asc' ? "bg-primary text-white border-primary shadow-lg" : "bg-background border-border text-foreground/40 hover:text-primary"
                         )}
                       >
                         Name A-Z
                       </button>
                       <button
                         onClick={() => setSortOrder('desc')}
                         className={cn(
                           "h-10 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all",
                           sortOrder === 'desc' ? "bg-primary text-white border-primary shadow-lg" : "bg-background border-border text-foreground/40 hover:text-primary"
                         )}
                       >
                         Name Z-A
                       </button>
                    </div>
                 </div>

                 <div className="pt-6 border-t border-white/5 space-y-4">
                    <div className="p-6 rounded-[2rem] bg-secondary/50 border border-border flex items-start gap-4">
                       <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                       <div className="space-y-1">
                          <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest">Privacy Sovereign</h4>
                          <p className="text-[9px] text-foreground/40 font-medium leading-relaxed uppercase">Discovery signals are processed strictly in local memory.</p>
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
                  <Card key={i} className="glass-card border-border overflow-hidden h-[300px]">
                     <CardContent className="p-6 space-y-4">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-20 w-full" />
                        <div className="flex gap-2">
                           <Skeleton className="h-4 w-12" />
                           <Skeleton className="h-4 w-12" />
                        </div>
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
                <Button onClick={fetchResources} variant="outline" className="h-12 bg-secondary border border-border text-foreground font-black rounded-xl text-[9px] uppercase tracking-widest">Retry Protocol</Button>
             </Card>
           ) : (
             <div className="space-y-12">
                <div className="flex items-center justify-between px-2">
                   <div className="flex items-center gap-3">
                      <LayoutGrid className="w-4 h-4 text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Resource Registry</span>
                   </div>
                   <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest px-3 py-1">
                      {filteredAndSortedResources.length} Units Identified
                   </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-in zoom-in-95 duration-500">
                   {filteredAndSortedResources.map((res) => (
                     <Card 
                      key={res.id} 
                      className="glass-card border-border shadow-xl hover:border-primary/20 transition-all group/card flex flex-col cursor-pointer h-full"
                      onClick={() => window.open(res.url, '_blank')}
                     >
                        <CardContent className="p-8 flex flex-col h-full gap-6">
                           <div className="flex items-start justify-between gap-4">
                              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                                 <BookOpen className="w-5 h-5" />
                              </div>
                              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-foreground/10 group-hover/card:text-primary transition-colors">
                                 <ExternalLink className="w-4 h-4" />
                              </div>
                           </div>
                           
                           <div className="space-y-4 flex-1">
                              <h3 className="text-lg font-headline font-black text-foreground uppercase tracking-tight group-hover/card:text-primary transition-colors line-clamp-2">
                                 {res.description}
                              </h3>
                              
                              <div className="flex flex-wrap gap-1.5">
                                 {res.topics.slice(0, 3).map(topic => (
                                   <Badge key={topic} variant="outline" className="bg-background/50 text-[7px] font-black uppercase py-0.5 border-white/5">
                                      {topic}
                                   </Badge>
                                 ))}
                              </div>
                           </div>

                           <div className="pt-6 border-t border-white/5">
                              <Button className="w-full h-11 bg-primary text-white font-black text-[9px] uppercase tracking-widest rounded-xl shadow-lg opacity-80 group-hover/card:opacity-100 transition-all">
                                 Open Resource <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover/card:translate-x-1 transition-transform" />
                              </Button>
                           </div>

                           <div className="pt-4 flex items-center justify-between">
                              <span className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">{res.levels[0] || 'Core'} Level</span>
                              <div className="flex items-center gap-1.5 text-primary text-[8px] font-black uppercase tracking-widest">
                                 {res.types[0] || 'Web'}
                              </div>
                           </div>
                        </CardContent>
                     </Card>
                   ))}
                </div>
                
                {filteredAndSortedResources.length === 0 && (
                   <div className="h-[400px] flex flex-col items-center justify-center opacity-10 space-y-6">
                      <Terminal className="w-24 h-24 text-primary" />
                      <p className="text-sm font-black uppercase tracking-[0.3em]">Zero Matrix Matches</p>
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
