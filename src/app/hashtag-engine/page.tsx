"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Hash, 
  Search, 
  Zap, 
  Copy, 
  CheckCircle2, 
  RefreshCcw, 
  Loader2, 
  Activity, 
  Globe, 
  ShieldCheck, 
  Layers, 
  LayoutGrid, 
  Instagram, 
  Youtube, 
  Smartphone, 
  Linkedin, 
  Facebook,
  Sparkles,
  Settings2,
  Trash2,
  Share2,
  AlertCircle,
  Type,
  FileText,
  AlignLeft,
  ChevronRight,
  Smile,
  Dices,
  RotateCcw,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';
import { fetchHashtagsAction, TagResult } from './actions';

const STORAGE_KEY_TOPIC = 'mykit_hashtag_last_topic';

export default function HashtagEnginePage() {
  const { toast } = useToast();
  
  // Parameters
  const [topic, setTopic] = useState('');
  const [caption, setCaption] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [style, setStyle] = useState('Growth');
  const [count, setCount] = useState('30');
  const [serverNode, setServerNode] = useState('auto');
  const [includeEmojis, setIncludeEmojis] = useState(false);

  // Results
  const [result, setResult] = useState<TagResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TOPIC);
    if (saved) setTopic(saved);
  }, []);

  const executeGeneration = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim() && !caption.trim()) {
      toast({ variant: "destructive", title: "Input Required", description: "Provide a topic or caption matrix." });
      return;
    }

    setIsLoading(true);
    localStorage.setItem(STORAGE_KEY_TOPIC, topic);
    
    try {
      const response = await fetchHashtagsAction(topic, caption, platform, style, parseInt(count), serverNode, includeEmojis);
      setResult(response);
      toast({ title: "Matrix Synchronized", description: `Active node: ${response.node}` });
    } catch (err) {
      toast({ variant: "destructive", title: "Protocol Failure" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (tags: string[], label: string) => {
    const text = tags.join(' ');
    navigator.clipboard.writeText(text);
    setIsCopied(label);
    toast({ title: "Identity Isolated", description: `${label} saved to clipboard.` });
    setTimeout(() => setIsCopied(null), 2000);
  };

  const handleClear = () => {
    setTopic('');
    setCaption('');
    setResult(null);
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
            <Hash className="w-3.5 h-3.5" /> Social Production Suite
          </div>
          <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
            Hashtag <span className="text-primary italic">Engine Pro</span>
          </h1>
          <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
            Professional reach-based bucketing. Isolate high-fidelity tags for growth, specific niches, and professional networks using multi-node failover logic.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 pb-2">
           <GetHelp toolId="hashtag-engine" />
           {(result || topic || caption) && (
             <Button variant="outline" size="sm" onClick={handleClear} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                <Trash2 className="w-3.5 h-3.5 mr-2" /> Reset
             </Button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <CardHeader className="py-6 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Settings2 className="w-5 h-5 text-primary" /> Matrix Parameters
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-8">
                 <form onSubmit={executeGeneration} className="space-y-6">
                    <div className="space-y-4">
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Linguistic Topic / Niche</Label>
                          <div className="relative group/input">
                             <Input 
                               placeholder="e.g. Fitness, AI Art, Minimalist..." 
                               value={topic}
                               onChange={e => setTopic(e.target.value)}
                               className="h-14 bg-secondary border-border rounded-2xl text-sm font-bold px-6 focus:ring-primary/40 uppercase"
                             />
                             <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
                                <Search className="w-5 h-5 text-primary" />
                             </div>
                          </div>
                       </div>
                       
                       <div className="space-y-2">
                          <div className="flex justify-between items-center px-1">
                             <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Context Extraction</Label>
                             <span className="text-[8px] font-black text-primary/40 uppercase">Optional</span>
                          </div>
                          <Textarea 
                            value={caption}
                            onChange={e => setCaption(e.target.value)}
                            placeholder="Paste your post caption to extract hidden keywords..."
                            className="h-28 bg-secondary/30 border-border rounded-2xl text-xs font-medium resize-none focus:ring-primary/20 p-4"
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-3">
                          <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Platform</Label>
                          <Select value={platform} onValueChange={setPlatform}>
                             <SelectTrigger className="h-12 bg-secondary border-border rounded-xl font-bold uppercase text-[10px]">
                                <SelectValue />
                             </SelectTrigger>
                             <SelectContent className="glass-card">
                                <SelectItem value="Instagram" className="text-[10px] font-black uppercase">Instagram</SelectItem>
                                <SelectItem value="TikTok" className="text-[10px] font-black uppercase">TikTok</SelectItem>
                                <SelectItem value="YouTube" className="text-[10px] font-black uppercase">YouTube</SelectItem>
                                <SelectItem value="LinkedIn" className="text-[10px] font-black uppercase">LinkedIn</SelectItem>
                                <SelectItem value="Facebook" className="text-[10px] font-black uppercase">Facebook</SelectItem>
                                <SelectItem value="Mixed" className="text-[10px] font-black uppercase">Mixed Protocol</SelectItem>
                             </SelectContent>
                          </Select>
                       </div>
                       <div className="space-y-3">
                          <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Style DNA</Label>
                          <Select value={style} onValueChange={setStyle}>
                             <SelectTrigger className="h-12 bg-secondary border-border rounded-xl font-bold uppercase text-[10px]">
                                <SelectValue />
                             </SelectTrigger>
                             <SelectContent className="glass-card">
                                <SelectItem value="Growth" className="text-[10px] font-black uppercase">Growth (Broad)</SelectItem>
                                <SelectItem value="Niche" className="text-[10px] font-black uppercase">Niche (Specific)</SelectItem>
                                <SelectItem value="Aesthetic" className="text-[10px] font-black uppercase">Aesthetic (Soft)</SelectItem>
                             </SelectContent>
                          </Select>
                       </div>
                    </div>

                    <div className="p-6 rounded-[2rem] bg-secondary/50 border border-border flex items-center justify-between group hover:border-primary/20 transition-all">
                       <div className="flex items-center gap-3">
                          <Smile className="w-5 h-5 text-primary/40 group-hover:text-primary transition-colors" />
                          <span className="text-[10px] font-black uppercase text-foreground/40">Include Emojis</span>
                       </div>
                       <Switch checked={includeEmojis} onCheckedChange={setIncludeEmojis} className="scale-75" />
                    </div>

                    <Button type="submit" disabled={isLoading || (!topic.trim() && !caption.trim())} className="w-full h-16 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 text-xs uppercase tracking-widest active:scale-95 transition-all">
                       {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Zap className="w-5 h-5 mr-3" />}
                       Forge Growth Matrix
                    </Button>
                 </form>

                 <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50 border border-border">
                    <div className="flex items-center gap-3">
                       <Activity className="w-4 h-4 text-primary/40" />
                       <span className="text-[9px] font-black uppercase text-foreground/30">Node Status</span>
                    </div>
                    <Badge variant="outline" className="bg-background/50 border-primary/20 text-primary text-[8px] font-black uppercase px-3 py-1">
                       {result?.node || 'Standby'}
                    </Badge>
                 </div>
              </CardContent>
           </Card>

           <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
             <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
             </div>
             <div className="space-y-2">
               <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Privacy Sovereign</h4>
               <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                 Linguistic discovery is processed anonymously. Search strings are never transmitted or stored.
               </p>
             </div>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-1">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px] bg-black/10">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between shrink-0 px-6 sm:px-10">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <LayoutGrid className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Identity Feed</CardTitle>
                 </div>
                 {result && (
                    <div className="flex gap-2">
                       <Button onClick={() => handleCopy([...result.buckets.broad, ...result.buckets.niche, ...result.buckets.ultra], 'all')} variant="outline" size="sm" className="h-9 px-4 rounded-xl border-white/10 bg-white/5 text-[8px] font-black uppercase tracking-widest">
                          {isCopied === 'all' ? <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-primary" /> : <Copy className="w-3.5 h-3.5 mr-2 text-primary" />} Copy Master
                       </Button>
                    </div>
                 )}
              </CardHeader>
              
              <CardContent className="flex-1 p-8 sm:p-12 relative overflow-hidden flex flex-col">
                 {!result && !isLoading && (
                   <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-6 py-20">
                      <Hash className="w-24 h-24 text-primary" />
                      <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Signal Detection</p>
                   </div>
                 )}

                 {isLoading && (
                   <div className="flex-1 flex flex-col items-center justify-center space-y-10 py-20">
                      <div className="relative">
                         <div className="w-28 h-28 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                         <Globe className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                      </div>
                      <p className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">Decoding Global Trend Nodes...</p>
                   </div>
                 )}

                 {result && !isLoading && (
                   <div className="space-y-12 animate-in zoom-in-95 duration-500">
                      {/* BUCKETS GRID */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         {[
                           { id: 'broad', label: 'Broad Reach', color: 'text-primary', data: result.buckets.broad },
                           { id: 'niche', label: 'Niche Matrix', color: 'text-emerald-500', data: result.buckets.niche },
                           { id: 'ultra', label: 'Long-Tail', color: 'text-amber-500', data: result.buckets.ultra },
                         ].map(bucket => (
                           <div key={bucket.id} className="space-y-4">
                              <div className="flex items-center justify-between px-1">
                                 <span className={cn("text-[9px] font-black uppercase tracking-widest", bucket.color)}>{bucket.label}</span>
                                 <button onClick={() => handleCopy(bucket.data, bucket.id)} className="text-foreground/20 hover:text-primary transition-colors"><Copy className="w-3 h-3" /></button>
                              </div>
                              <div className="p-5 rounded-[2rem] bg-secondary/30 border border-white/5 flex flex-wrap gap-1.5 max-h-[200px] overflow-y-auto custom-scrollbar">
                                 {bucket.data.map((t, idx) => (
                                   <Badge key={idx} variant="outline" className="bg-background/50 border-white/5 text-[8px] font-bold uppercase py-0.5 px-2 text-foreground/40">{t}</Badge>
                                 ))}
                              </div>
                           </div>
                         ))}
                      </div>

                      {/* READY MIX MASTER */}
                      <div className="p-8 rounded-[3.5rem] bg-primary/[0.03] border border-primary/10 space-y-6 relative overflow-hidden group/mix">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover/mix:opacity-100 transition-opacity" />
                         <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/40 border border-white/10">
                                  <Sparkles className="w-6 h-6" />
                               </div>
                               <div>
                                  <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Ready Mix Matrix</h3>
                                  <p className="text-[9px] font-bold text-foreground/40 uppercase tracking-[0.2em]">{platform} Standard • {result.readyMix.length} Tags</p>
                               </div>
                            </div>
                            <Button onClick={() => handleCopy(result.readyMix, 'mix')} className={cn(
                              "h-12 px-6 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all shadow-xl",
                              isCopied === 'mix' ? "bg-emerald-500 text-white" : "bg-white text-black hover:bg-white/90"
                            )}>
                               {isCopied === 'mix' ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />} 
                               Copy Mix
                            </Button>
                         </div>
                         <div className="p-6 bg-black/40 rounded-3xl border border-white/5 shadow-inner relative z-10">
                            <p className="text-sm font-medium text-foreground/60 leading-relaxed select-all">
                               {result.readyMix.join(' ')}
                            </p>
                         </div>
                      </div>
                   </div>
                 )}
              </CardContent>
           </Card>
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
