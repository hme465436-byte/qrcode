"use client"

import React, { useState } from 'react';
import { 
  Link as LinkIcon, 
  Zap, 
  Copy, 
  CheckCircle2, 
  Trash2, 
  Loader2, 
  Activity,
  ExternalLink,
  Globe,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';
import { createShortUrl } from './actions';

export default function UrlShortenerPage() {
  const { toast } = useToast();
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateUrl = (input: string) => {
    try {
      new URL(input.startsWith('http') ? input : `https://${input}`);
      return true;
    } catch {
      return false;
    }
  };

  const handleShorten = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!longUrl.trim()) return;

    if (!validateUrl(longUrl)) {
      setError("Matrix Mismatch: Provide a valid URL identifier (e.g. google.com).");
      return;
    }

    setIsLoading(true);
    setError(null);
    setShortUrl(null);

    const targetUrl = longUrl.startsWith('http') ? longUrl : `https://${longUrl}`;

    try {
      const result = await createShortUrl(targetUrl);
      if (result.success && result.shortUrl) {
        setShortUrl(result.shortUrl);
        toast({ title: "Signal Compressed", description: "Short link successfully synthesized." });
      } else {
        throw new Error(result.error || "Uplink failure.");
      }
    } catch (err: any) {
      setError("Matrix Retrieval Failure: The shortener node is currently restricted.");
      toast({ variant: "destructive", title: "Protocol Failed" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (shortUrl) {
      navigator.clipboard.writeText(shortUrl);
      setIsCopied(true);
      toast({ title: "Protocol Copied" });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setLongUrl('');
    setShortUrl(null);
    setError(null);
    toast({ title: "Studio Reset" });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <LinkIcon className="w-3.5 h-3.5" /> Web Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
              URL <span className="text-primary italic">Shortener Studio</span>
            </h1>
            <p className="text-foreground/40 text-sm md:text-base font-medium mt-2 max-w-2xl leading-relaxed">
              Professional linguistic compression. Convert long URLs into high-fidelity short links locally via the TinyURL protocol. 100% secure.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <GetHelp toolId="url-shortener" />
             {(shortUrl || longUrl) && (
               <Button variant="outline" size="sm" onClick={handleClear} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                  <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
               </Button>
             )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Input Pane */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                <Zap className="w-5 h-5 text-primary" /> Compression Node
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-10">
              <form onSubmit={handleShorten} className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Destination URL</Label>
                  <div className="relative group/input">
                    <Input 
                      placeholder="Paste long link here..."
                      value={longUrl}
                      onChange={(e) => setLongUrl(e.target.value)}
                      className="h-16 bg-secondary border-border rounded-2xl font-bold px-6 focus:ring-primary/40 text-lg"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/input:opacity-100 transition-opacity">
                      <Globe className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit"
                  disabled={isLoading || !longUrl.trim()}
                  className="w-full h-16 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-xl shadow-primary/30 active:scale-95 transition-all"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Zap className="w-5 h-5 mr-2" />}
                  Generate Short Link
                </Button>
              </form>

              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 animate-in shake duration-500">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">{error}</p>
                </div>
              )}

              <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Privacy Sovereign</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Data compression occurs via secure server-side uplinks. Your original URL history is volatile and held strictly in local browser memory.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Matrix */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[400px] bg-black/10">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between shrink-0">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <Activity className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Identity Profile</CardTitle>
                 </div>
              </CardHeader>
              
              <CardContent className="flex-1 p-8 sm:p-12 flex flex-col items-center justify-center relative overflow-hidden">
                 {!shortUrl && !isLoading && !error && (
                   <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-6 py-20">
                      <LinkIcon className="w-24 h-24 text-primary" />
                      <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Discovery Signal</p>
                   </div>
                 )}

                 {isLoading && (
                   <div className="flex-1 flex flex-col items-center justify-center space-y-10 py-20">
                      <div className="relative">
                         <div className="w-28 h-28 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                         <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                      </div>
                      <p className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">Negotiating Node Link...</p>
                   </div>
                 )}

                 {shortUrl && !isLoading && (
                   <div className="w-full space-y-12 animate-in zoom-in-95 duration-500">
                      <div className="text-center space-y-4">
                         <p className="text-[10px] font-black uppercase text-primary tracking-[0.6em]">Compressed Protocol</p>
                         <div className="p-8 bg-background/50 rounded-[3rem] border-2 border-primary/20 shadow-2xl relative group/res overflow-hidden">
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/res:opacity-100 transition-opacity" />
                            <h2 className="text-2xl sm:text-4xl font-mono font-bold text-foreground break-all leading-tight relative z-10">{shortUrl}</h2>
                         </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg mx-auto">
                         <Button onClick={handleCopy} className="h-16 flex-1 bg-white text-black hover:bg-white/90 font-black rounded-2xl flex items-center justify-center gap-4 text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                            {isCopied === 'all' ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
                            Copy Short Link
                         </Button>
                         <Button asChild variant="outline" className="h-16 px-10 border-white/10 bg-white/5 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl active:scale-95 transition-all">
                            <a href={shortUrl} target="_blank" rel="noopener noreferrer">
                               <ExternalLink className="w-5 h-5 mr-2" /> Launch URL
                            </a>
                         </Button>
                      </div>

                      <div className="pt-8 border-t border-white/5">
                         <div className="p-6 rounded-[2rem] bg-secondary border border-border flex items-start gap-5">
                            <Info className="w-5 h-5 text-primary mt-1 shrink-0" />
                            <div className="space-y-1">
                               <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Protocol Intelligence</p>
                               <p className="text-[11px] text-foreground/40 font-medium leading-relaxed uppercase">
                                  Your compressed identifier is permanent and will redirect to the destination until the target node is definitively removed from the registry.
                               </p>
                            </div>
                         </div>
                      </div>
                   </div>
                 )}
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
