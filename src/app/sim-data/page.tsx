
"use client"

import React, { useState } from 'react';
import { 
  Smartphone, 
  Search, 
  Trash2, 
  Sparkles, 
  Loader2, 
  Info,
  CheckCircle2,
  User,
  MapPin,
  Fingerprint,
  Phone,
  ShieldCheck,
  Zap,
  Activity,
  AlertCircle,
  Database,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

export default function SimDataPage() {
  const { toast } = useToast();
  const [number, setNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const getCarrier = (num: string) => {
    // Remove leading 0 if present to check prefix
    const clean = num.startsWith('0') ? num.substring(1) : num;
    if (clean.startsWith('30')) return 'Mobilink (Jazz)';
    if (clean.startsWith('34')) return 'Telenor';
    if (clean.startsWith('33')) return 'Ufone';
    if (clean.startsWith('31')) return 'Zong';
    if (clean.startsWith('32')) return 'Warid';
    return 'Unknown Network';
  };

  const handleSearch = async () => {
    const cleanNum = number.trim().replace(/[^0-9]/g, '');
    if (cleanNum.length < 10) {
      toast({ variant: "destructive", title: "Input Required", description: "Please enter a valid Pakistani number." });
      return;
    }

    setIsProcessing(true);
    setResult(null);

    // Simulated API Latency for Prototype
    await new Promise(r => setTimeout(r, 1800));

    setResult({
      number: cleanNum,
      carrier: getCarrier(cleanNum),
      owner: "IDENTIFIED PERSON",
      cnic: "35201-XXXXXXX-X",
      address: "PUNJAB, PAKISTAN",
      status: "ACTIVE",
      activationDate: "2022-08-24"
    });

    setIsProcessing(false);
    toast({ title: "Signal Mapped", description: "Identity data retrieved for " + cleanNum });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Smartphone className="w-3.5 h-3.5" /> Intelligence Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
                Sim Data <span className="text-primary italic">Finder Studio</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional mobile identity matrix. Identify carrier protocols and regional registration data for Pakistani mobile numbers locally and securely.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="sim-data" />
              {result && (
                <Button variant="outline" size="sm" onClick={() => { setNumber(''); setResult(null); }} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive">
                   <Trash2 className="w-3.5 h-3.5 mr-2" /> Purge
                </Button>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Input Panel */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground uppercase tracking-tight">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <Search className="w-6 h-6" />
                </div>
                Target Identifier
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-10 space-y-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Mobile Number (Pakistan)</Label>
                <div className="relative group/input">
                  <Input 
                    placeholder="03XXXXXXXXX"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="h-16 bg-secondary border-border rounded-2xl text-2xl font-mono font-bold text-center tracking-widest focus:ring-primary/40"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/input:opacity-100 transition-opacity">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <p className="text-[9px] text-foreground/20 font-bold uppercase tracking-widest text-center">Format: 11 Digits (0300...)</p>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={handleSearch}
                  disabled={isProcessing || !number.trim()}
                  className="flex-1 h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                >
                  {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                  Identify Matrix
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
             <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
             </div>
             <div className="space-y-2">
               <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Privacy Sovereign</h4>
               <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                 Search payloads are processed strictly within your browser's volatile memory. No search history or identification data is logged to our servers.
               </p>
             </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group min-h-[500px] flex flex-col">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <Activity className="w-5 h-5" />
                </div>
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5" /> Identity Matrix
                </CardTitle>
              </div>
              {result && (
                <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest animate-pulse">
                  Signal Isolated
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-6 sm:p-12 relative overflow-hidden bg-black/10">
               {!result && !isProcessing ? (
                 <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-6">
                    <Database className="w-24 h-24 text-primary" />
                    <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Linguistic Signal</p>
                 </div>
               ) : isProcessing ? (
                 <div className="flex-1 flex flex-col items-center justify-center space-y-10">
                    <div className="relative">
                       <div className="w-28 h-28 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                       <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                    </div>
                    <div className="text-center space-y-2">
                       <p className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">Decoding Protocol...</p>
                       <p className="text-[9px] font-bold text-foreground/20 uppercase tracking-widest">Querying Carrier Repositories</p>
                    </div>
                 </div>
               ) : (
                 <div className="space-y-10 animate-in zoom-in duration-500 w-full">
                    {/* Primary Identifier */}
                    <div className="flex flex-col sm:flex-row items-center gap-8 border-b border-white/5 pb-10">
                       <div className="w-24 h-24 rounded-[2.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xl ring-4 ring-primary/5">
                          <User className="w-10 h-10" />
                       </div>
                       <div className="text-center sm:text-left space-y-2">
                          <h3 className="text-4xl font-headline font-black text-foreground uppercase tracking-tight">{result.owner}</h3>
                          <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                             <div className="flex items-center gap-2 text-primary">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Identity Verified</span>
                             </div>
                             <div className="flex items-center gap-2 text-foreground/40">
                                <Activity className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Status: {result.status}</span>
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Data Matrix */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                       {[
                         { icon: Fingerprint, label: 'CNIC Registry', val: result.cnic },
                         { icon: Smartphone, label: 'Carrier Signature', val: result.carrier },
                         { icon: MapPin, label: 'Registered Region', val: result.address },
                         { icon: Clock, label: 'Activation Matrix', val: result.activationDate },
                       ].map((item, i) => (
                         <div key={i} className="p-6 rounded-[2rem] bg-secondary/50 border border-border group hover:border-primary/20 transition-all flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all shadow-inner">
                               <item.icon className="w-6 h-6" />
                            </div>
                            <div className="min-w-0">
                               <p className="text-[8px] font-black uppercase text-foreground/30 tracking-widest mb-0.5">{item.label}</p>
                               <p className="text-[13px] font-bold text-foreground truncate uppercase">{item.val}</p>
                            </div>
                         </div>
                       ))}
                    </div>

                    {/* Disclaimer Panel */}
                    <div className="p-6 rounded-[2rem] bg-amber-500/5 border border-amber-500/10 flex items-start gap-5">
                       <AlertCircle className="w-5 h-5 text-amber-600 mt-1 shrink-0" />
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Protocol Notice</p>
                          <p className="text-[9px] text-foreground/40 leading-relaxed font-medium uppercase">
                             Identity retrieval is based on publicly indexed registry matrices. Recent MNP (Mobile Number Portability) changes may result in stale carrier signatures.
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
        .bg-checkered {
          background-image: linear-gradient(45deg, #111113 25%, transparent 25%), 
                            linear-gradient(-45deg, #111113 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #111113 75%), 
                            linear-gradient(-45deg, transparent 75%, #111113 75%);
          background-size: 20px 20px;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
      `}</style>
    </div>
  );
}
