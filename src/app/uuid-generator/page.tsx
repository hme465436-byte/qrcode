"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Fingerprint, 
  Copy, 
  Trash2, 
  CheckCircle2, 
  Info,
  Settings2,
  Zap,
  Activity,
  Maximize2,
  Download,
  ShieldCheck,
  Hash,
  RefreshCcw,
  Target,
  FileCode,
  Shield,
  Smartphone,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type UUIDFormat = 'standard' | 'no-dashes';

export default function UuidGeneratorPage() {
  const { toast } = useToast();
  const [ids, setIds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(10);
  const [format, setFormat] = useState<UUIDFormat>('standard');
  const [isUppercase, setIsUppercase] = useState(false);
  const [useBraces, setUseBraces] = useState(false);
  const [isCopied, setIsCopied] = useState<string | null>(null);

  const generateUUIDs = useCallback(() => {
    const newIds: string[] = [];
    for (let i = 0; i < quantity; i++) {
      // Use browser-native cryptographically secure UUID generator
      let id = crypto.randomUUID();
      newIds.push(id);
    }
    setIds(newIds);
  }, [quantity]);

  // Initial generation
  useEffect(() => {
    generateUUIDs();
  }, []);

  const formattedIds = useMemo(() => {
    return ids.map(id => {
      let result = id;
      if (format === 'no-dashes') result = result.replace(/-/g, '');
      if (isUppercase) result = result.toUpperCase();
      if (useBraces) result = `{${result}}`;
      return result;
    });
  }, [ids, format, isUppercase, useBraces]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(id);
    toast({ title: "ID Copied", description: "Identifier saved to clipboard." });
    setTimeout(() => setIsCopied(null), 2000);
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(formattedIds.join('\n'));
    setIsCopied('all');
    toast({ title: "Batch Copied", description: `${formattedIds.length} IDs saved to clipboard.` });
    setTimeout(() => setIsCopied(null), 2000);
  };

  const handleDownload = () => {
    const content = formattedIds.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mykit_uuid_batch_${Date.now()}.txt`;
    a.click();
    toast({ title: "Master Exported", description: "TXT file ready for production." });
  };

  const handleClear = () => {
    setIds([]);
    toast({ title: "Studio Reset", description: "All buffers cleared." });
  };

  const duplicateCount = useMemo(() => {
    const set = new Set(formattedIds);
    return formattedIds.length - set.size;
  }, [formattedIds]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      {/* SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "UUID / GUID Generator Studio",
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "Web",
            "offers": { "@type": "Offer", "price": "0" },
            "description": "Generate cryptographically-secure UUID v4 identifiers with custom formatting and batch production."
          })
        }}
      />

      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Fingerprint className="w-3.5 h-3.5" /> Identity Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <h1 className="text-3xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight">
                UUID <span className="text-primary italic">Generator Studio</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional-grade identity matrixing. Generate secure UUID v4 / GUID strings locally in your browser with precision formatting and batch export protocols.
              </p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <Settings2 className="w-6 h-6" />
                </div>
                Matrix Protocol
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-10">
              <div className="space-y-6">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-foreground/50">
                  <Label>Quantity (Batch Size)</Label>
                  <span className="text-primary font-mono text-lg">{quantity}</span>
                </div>
                <Slider 
                  value={[quantity]} 
                  min={1} 
                  max={100} 
                  step={1} 
                  onValueChange={(v) => setQuantity(v[0])} 
                  className="py-4"
                />
              </div>

              <div className="space-y-6">
                <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Identity Architecture</Label>
                <div className="grid grid-cols-2 gap-3">
                   <button
                    onClick={() => setFormat('standard')}
                    className={cn(
                      "h-12 rounded-xl border flex items-center justify-center text-[9px] font-black uppercase tracking-widest transition-all",
                      format === 'standard' ? "bg-primary text-white border-primary shadow-lg" : "bg-background border-border text-foreground/40 hover:text-foreground"
                    )}
                   >
                     Standard (RFC)
                   </button>
                   <button
                    onClick={() => setFormat('no-dashes')}
                    className={cn(
                      "h-12 rounded-xl border flex items-center justify-center text-[9px] font-black uppercase tracking-widest transition-all",
                      format === 'no-dashes' ? "bg-primary text-white border-primary shadow-lg" : "bg-background border-border text-foreground/40 hover:text-foreground"
                    )}
                   >
                     No Dashes
                   </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="flex items-center justify-between p-5 rounded-2xl bg-secondary/50 border border-border group hover:border-primary/20 transition-all">
                    <span className="text-[10px] font-black uppercase text-foreground/60">Uppercase</span>
                    <Switch checked={isUppercase} onCheckedChange={setIsUppercase} />
                 </div>
                 <div className="flex items-center justify-between p-5 rounded-2xl bg-secondary/50 border border-border group hover:border-primary/20 transition-all">
                    <span className="text-[10px] font-black uppercase text-foreground/60">Use Braces</span>
                    <Switch checked={useBraces} onCheckedChange={setUseBraces} />
                 </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                 <Button 
                   onClick={generateUUIDs}
                   className="h-16 flex-[2] rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-sm shadow-2xl active:scale-95 transition-all group/btn"
                 >
                   <RefreshCcw className="w-5 h-5 mr-3 group-hover/btn:rotate-180 transition-transform duration-700" />
                   Synthesize Batch
                 </Button>
                 <Button 
                   variant="outline"
                   onClick={handleClear}
                   className="h-16 flex-1 rounded-2xl border-border bg-secondary hover:text-destructive text-[10px] font-black uppercase tracking-widest"
                 >
                   <Trash2 className="w-5 h-5" />
                 </Button>
              </div>
            </CardContent>
          </Card>

          <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
               <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Hardware-Native Entropy</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                All identifiers are generated using the browser's cryptographically-secure random number generator. No data is logged or transmitted, ensuring 100% identity privacy.
              </p>
            </div>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group flex flex-col min-h-[600px]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
              <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 fill-primary/20" /> Identity Matrix Output
              </CardTitle>
              {formattedIds.length > 0 && (
                <div className="flex gap-2">
                   <Button variant="outline" size="sm" onClick={handleCopyAll} className="h-9 px-4 rounded-xl border-white/5 bg-white/5 text-[9px] font-black uppercase tracking-widest">
                      {isCopied === 'all' ? <Check className="w-3 h-3 mr-2" /> : <Copy className="w-3 h-3 mr-2" />}
                      Copy All
                   </Button>
                   <Button variant="outline" size="sm" onClick={handleDownload} className="h-9 px-4 rounded-xl border-white/5 bg-white/5 text-[9px] font-black uppercase tracking-widest">
                      <Download className="w-3 h-3 mr-2 text-primary" />
                      TXT
                   </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
               <div className="flex-1 overflow-auto custom-scrollbar p-6 bg-black/10">
                  {formattedIds.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-4 py-32">
                       <Activity className="w-20 h-20 text-primary" />
                       <p className="text-xs font-black uppercase tracking-[0.3em]">Awaiting Generation</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                       {formattedIds.map((id, index) => (
                         <div key={index} className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-white/5 border border-border group/item hover:border-primary/20 transition-all">
                            <span className="text-[10px] font-mono text-foreground/20 w-8 shrink-0">{index + 1}</span>
                            <code className="flex-1 text-xs sm:text-sm font-mono font-bold text-foreground truncate select-all">{id}</code>
                            <button 
                              onClick={() => handleCopy(id, `id-${index}`)}
                              className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-foreground/20 hover:text-primary transition-all shrink-0 border border-transparent hover:border-primary/20"
                            >
                               {isCopied === `id-${index}` ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                         </div>
                       ))}
                    </div>
                  )}
               </div>

               <div className="p-8 border-t border-border bg-[#0a0a0c]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group">
                        <Target className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-foreground uppercase tracking-widest leading-none">Collision Probability</p>
                           <p className="text-[10px] text-foreground/40 font-medium leading-relaxed">
                             Zero collisions detected. Secure random entropy provides astronomical uniqueness per production unit.
                           </p>
                        </div>
                     </div>
                     <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group">
                        <Activity className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-foreground uppercase tracking-widest leading-none">Batch Integrity</p>
                           <p className="text-[10px] text-foreground/40 font-medium leading-relaxed">
                             {duplicateCount > 0 ? `${duplicateCount} Duplicates identified.` : 'All identifiers verified unique.'}
                           </p>
                        </div>
                     </div>
                  </div>
               </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <div className="space-y-6">
             <h3 className="text-xl font-headline font-black uppercase tracking-tight text-foreground/60 px-2">Knowledge Base</h3>
             <div className="grid grid-cols-1 gap-4">
                {[
                  { q: "What is UUID v4?", a: "A version 4 UUID is generated from random numbers. It has 122 bits of entropy, making the probability of a duplicate virtually zero." },
                  { q: "Is it secure?", a: "Yes. Our studio utilizes browser hardware-native secure random generation, ensuring high-quality randomness for production use." },
                  { q: "What is a GUID?", a: "Globally Unique Identifier (GUID) is Microsoft's term for a UUID. They are functionally identical in this studio." },
                ].map((item, i) => (
                  <div key={i} className="p-6 rounded-3xl bg-secondary/50 border border-border group">
                     <div className="flex items-center gap-3 mb-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <h4 className="text-[10px] font-black uppercase text-foreground">{item.q}</h4>
                     </div>
                     <p className="text-[11px] text-foreground/50 leading-relaxed font-medium">{item.a}</p>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
