
"use client"

import React, { useState, useEffect } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';
import { fetchHashtagsAction } from './actions';

export default function HashtagEnginePage() {
  const { toast } = useToast();
  
  // Parameters
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [style, setStyle] = useState('Growth');
  const [count, setCount] = useState('30');
  const [serverNode, setServerNode] = useState('auto');

  // Results
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [activeNode, setActiveNode] = useState('Standby');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState<string | null>(null);

  const executeGeneration = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setHashtags([]);
    
    try {
      const response = await fetchHashtagsAction(topic, platform, style, parseInt(count), serverNode);
      if (response.tags.length > 0) {
        setHashtags(response.tags);
        setActiveNode(response.node);
        toast({ title: "Tags Synthesized", description: `Matrix updated via ${response.node}.` });
      } else {
        toast({ variant: "destructive", title: "Linguistic Error", description: "Could not isolate relevant tags." });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Protocol Failure" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(label);
    toast({ title: "Identity Isolated", description: "Tags saved to clipboard." });
    setTimeout(() => setIsCopied(null), 2000);
  };

  const handleClear = () => {
    setTopic('');
    setHashtags([]);
    setActiveNode('Standby');
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Hash className="w-3.5 h-3.5" /> Social Production Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
                Hashtag <span className="text-primary italic">Engine Studio</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional linguistic growth matrix. Generate high-fidelity hashtags for any niche using multi-node API failover and local categorical logic.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="hashtag-engine" />
              {(hashtags.length > 0 || topic) && (
                <Button variant="outline" size="sm" onClick={handleClear} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                   <Trash2 className="w-3.5 h-3.5 mr-2" /> Reset
                </Button>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <CardHeader className="pb-8 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Settings2 className="w-5 h-5 text-primary" /> Matrix Parameters
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-10 space-y-10">
                 <form onSubmit={executeGeneration} className="space-y-6">
                    <div className="space-y-4">
                       <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Linguistic Topic / Niche</Label>
                       <div className="relative group/input">
                          <Input 
                            placeholder="e.g. Fitness, Digital Art, Tech..." 
                            value={topic}
                            onChange={e => setTopic(e.target.value)}
                            className="h-16 bg-secondary border-border rounded-2xl text-sm font-bold px-6 focus:ring-primary/40 uppercase"
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/input:opacity-100 transition-opacity">
                             <Search className="w-5 h-5 text-primary" />
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-3">
                          <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Platform Target</Label>
                          <Select value={platform} onValueChange={setPlatform}>
                             <SelectTrigger className="h-12 bg-secondary/50 border-border rounded-xl font-bold uppercase text-[10px]">
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
                          <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">DNA Style</Label>
                          <Select value={style} onValueChange={setStyle}>
                             <SelectTrigger className="h-12 bg-secondary/50 border-border rounded-xl font-bold uppercase text-[10px]">
                                <SelectValue />
                             </SelectTrigger>
                             <SelectContent className="glass-card">
                                <SelectItem value="Growth" className="text-[10px] font-black uppercase">Growth (Broad)</SelectItem>
                                <SelectItem value="Niche" className="text-[10px] font-black uppercase">Niche (Specific)</SelectItem>
                                <SelectItem value="Aesthetic" className="text-[10px] font-black uppercase">Aesthetic (Soft)</SelectItem>
                                <SelectItem value="Mixed" className="text-[10px] font-black uppercase">Mixed Hybrid</SelectItem>
                             </SelectContent>
                          </Select>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-3">
                          <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Density (Count)</Label>
                          <div className="grid grid-cols-2 bg-secondary p-1 rounded-xl border border-border h-12">
                             <button type="button" onClick={() => setCount('15')} className={cn("rounded-lg text-[10px] font-black transition-all", count === '15' ? "bg-primary text-white" : "text-foreground/40")}>15</button>
                             <button type="button" onClick={() => setCount('30')} className={cn("rounded-lg text-[10px] font-black transition-all", count === '30' ? "bg-primary text-white" : "text-foreground/40")}>30</button>
                          </div>
                       </div>
                       <div className="space-y-3">
                          <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Server Node</Label>
                          <Select value={serverNode} onValueChange={setServerNode}>
                             <SelectTrigger className="h-12 bg-secondary/50 border-border rounded-xl font-bold uppercase text-[10px]">
                                <SelectValue />
                             </SelectTrigger>
                             <SelectContent className="glass-card">
                                <SelectItem value="auto" className="text-[10px] font-black uppercase">Auto Failover</SelectItem>
                                <SelectItem value="rapid-ig" className="text-[10px] font-black uppercase">RapidAPI Node</SelectItem>
                                <SelectItem value="datamuse-ml" className="text-[10px] font-black uppercase">Datamuse Edge</SelectItem>
                                <SelectItem value="local-a" className="text-[10px] font-black uppercase">Studio Local A</SelectItem>
                             </SelectContent>
                          </Select>
                       </div>
                    </div>

                    <Button type="submit" disabled={isLoading || !topic.trim()} className="w-full h-16 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 text-xs uppercase tracking-widest active:scale-95 transition-all">
                       {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Zap className="w-5 h-5 mr-3" />}
                       Synthesize Matrix
                    </Button>
                 </form>

                 <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50 border border-border">
                    <div className="flex items-center gap-3">
                       <Activity className="w-4 h-4 text-primary/40" />
                       <span className="text-[9px] font-black uppercase text-foreground/30">Active Node</span>
                    </div>
                    <Badge variant="outline" className="bg-background/50 border-primary/20 text-primary text-[8px] font-black uppercase px-3 py-1">
                       {activeNode}
                    </Badge>
                 </div>
              </CardContent>
           </Card>

           <div className="grid grid-cols-1 gap-6">
              <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Privacy Sovereign</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Linguistic discovery is processed anonymously. Your topic vectors are held strictly in volatile local memory.
                  </p>
                </div>
             </div>
           </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px] bg-black/10">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between shrink-0 px-6 sm:px-10">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <LayoutGrid className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Identity Feed</CardTitle>
                 </div>
                 {hashtags.length > 0 && (
                    <div className="flex gap-2">
                       <Button onClick={() => handleCopy(hashtags.join(' '), 'all')} variant="outline" size="sm" className="h-9 px-4 rounded-xl border-white/10 bg-white/5 text-[8px] font-black uppercase tracking-widest">
                          {isCopied === 'all' ? <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-primary" /> : <Copy className="w-3.5 h-3.5 mr-2" />} Copy All
                       </Button>
                    </div>
                 )}
              </CardHeader>
              
              <CardContent className="flex-1 p-8 sm:p-12 relative overflow-hidden flex flex-col">
                 {!hashtags.length && !isLoading && (
                   <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-6 py-20">
                      <Hash className="w-24 h-24 text-primary" />
                      <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Linguistic Signal</p>
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

                 {hashtags.length > 0 && !isLoading && (
                   <div className="space-y-12 animate-in zoom-in-95 duration-500">
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                         {hashtags.map((tag, i) => (
                           <div 
                              key={i} 
                              onClick={() => handleCopy(tag, `tag-${i}`)}
                              className="p-4 rounded-2xl border border-white/5 bg-secondary/30 flex items-center justify-between group cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all"
                           >
                              <span className="text-[11px] font-bold text-foreground/80 truncate group-hover:text-primary">{tag}</span>
                              {isCopied === `tag-${i}` ? <Check className="w-3 h-3 text-primary shrink-0" /> : <Copy className="w-3 h-3 text-foreground/10 group-hover:text-primary/40 shrink-0" />}
                           </div>
                         ))}
                      </div>

                      <div className="p-8 rounded-[3.5rem] bg-primary/[0.03] border border-primary/10 space-y-6 relative overflow-hidden group/master">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover/master:opacity-100 transition-opacity" />
                         <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/40 border border-white/10">
                                  <Sparkles className="w-6 h-6" />
                               </div>
                               <div>
                                  <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Master Production Set</h3>
                                  <p className="text-[9px] font-bold text-foreground/40 uppercase tracking-[0.2em]">{platform.toUpperCase()} Protocol</p>
                               </div>
                            </div>
                         </div>
                         <div className="p-6 bg-black/40 rounded-3xl border border-white/5 shadow-inner relative z-10">
                            <p className="text-sm font-medium text-foreground/60 leading-relaxed select-all">
                               {hashtags.join(' ')}
                            </p>
                         </div>
                         <div className="flex gap-4 relative z-10">
                            <Button onClick={() => handleCopy(hashtags.join(' '), 'master')} className="h-16 px-12 bg-white text-black hover:bg-white/90 font-black rounded-2xl flex items-center justify-center gap-4 text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all flex-1">
                               {isCopied === 'master' ? <CheckCircle2 className="w-5 h-5 mr-1" /> : <Copy className="w-5 h-5 mr-1" />} Copy Master Set
                            </Button>
                            <Button asChild variant="outline" className="h-16 px-8 border-white/10 bg-white/5 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl">
                               <a href={`https://www.instagram.com/explore/tags/${topic.replace(/\s+/g, '')}/`} target="_blank" rel="noopener noreferrer">
                                  <Globe className="w-5 h-5" />
                               </a>
                            </Button>
                         </div>
                      </div>
                   </div>
                 )}
              </CardContent>

              {hashtags.length > 0 && (
                <div className="p-8 border-t border-white/5 bg-[#0a0a0c] flex flex-col sm:flex-row items-center justify-between gap-6 shrink-0">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                         <Activity className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                         <p className="text-[11px] font-black uppercase text-foreground leading-none">Matrix Ready</p>
                         <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-widest">Optimized for {platform}</p>
                      </div>
                   </div>
                   <Button onClick={executeGeneration} variant="outline" className="h-14 px-10 border-white/10 bg-white/5 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl active:scale-95">
                      <RefreshCcw className="w-4 h-4 mr-2" /> Re-Forge Matrix
                   </Button>
                </div>
              )}
           </Card>
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
